"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AdminBtn, Field, Panel, Pill, PublishStatus, inputClass } from "@/components/admin/ui";
import { CurrencyPicker } from "@/components/admin/CurrencyPicker";
import { Switch } from "@/components/admin/studio/controls";
import { WizardSteps } from "@/components/admin/WizardSteps";
import { RichEditor } from "@/components/admin/blog/RichEditor";
import { TierEditor } from "@/components/admin/products/TierEditor";
import { UploadField } from "@/components/admin/products/UploadField";
import { GalleryField } from "@/components/admin/studio/fields";
import { fromNairobiInput, toNairobiInput } from "@/components/admin/events/time";
import { toHtml } from "@/components/blog/analysis";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_TYPES, formatMoney, priceCurrency, slugify, type PriceCurrency } from "@/lib/constants";
import { company } from "@/lib/content";
import { refreshSite } from "@/lib/refresh-site";
import { currentOffer } from "@/lib/offer";
import { emptyTier, parseTiers, tierDue, tiersFrom, type PriceTier } from "@/lib/tiers";
import { startNavProgress } from "@/components/ui/NavProgress";
import type { Product } from "@/lib/cms";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = { plugin: "Plugin", download: "Download", saas: "SaaS" };
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STEPS = ["Product", "Price", "Files", "Publish"];

type Errors = Partial<Record<"title" | "slug" | "price" | "promo" | "file" | "form", string>>;

export function ProductEditor({ initial, sales }: { initial?: Product; sales?: { count: number; revenue: number } }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [type, setType] = useState(initial?.type ?? "plugin");
  const [currency, setCurrency] = useState<PriceCurrency>(priceCurrency(initial?.currency));
  const [price, setPrice] = useState(String(initial?.price_kes ?? 0));
  const [promoOn, setPromoOn] = useState(initial?.promo_price_kes != null);
  const [promoPrice, setPromoPrice] = useState(initial?.promo_price_kes != null ? String(initial.promo_price_kes) : "");
  const [promoLabel, setPromoLabel] = useState(initial?.promo_label ?? "");
  const [promoStart, setPromoStart] = useState(toNairobiInput(initial?.promo_starts_at));
  const [promoEnd, setPromoEnd] = useState(toNairobiInput(initial?.promo_ends_at));
  const [tiersOn, setTiersOn] = useState(() => parseTiers(initial?.price_tiers).length > 0);
  const [tiers, setTiers] = useState<PriceTier[]>(() => parseTiers(initial?.price_tiers));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [version, setVersion] = useState(initial?.version ?? "");
  const [changelog, setChangelog] = useState(initial?.changelog ?? "");
  const [cover, setCover] = useState(initial?.cover_path ?? "");
  const [gallery, setGallery] = useState<string[]>(initial?.gallery ?? []);
  const [filePath, setFilePath] = useState(initial?.file_path ?? "");
  const [published, setPublished] = useState(initial?.published ?? false);
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const needsFile = type !== "saas";
  const priceNum = Number(price);
  const saleNum = Number(promoPrice);
  const percentOff =
    priceNum > 0 && Number.isInteger(saleNum) && saleNum >= 0 && saleNum < priceNum
      ? Math.round((1 - saleNum / priceNum) * 100)
      : 0;
  const preview = tiersOn
    ? null
    : currentOffer({
        price_kes: Number.isInteger(priceNum) ? priceNum : 0,
        promo_price_kes: promoOn && promoPrice.trim() !== "" ? saleNum : null,
        promo_label: promoLabel,
        promo_starts_at: fromNairobiInput(promoStart),
        promo_ends_at: fromNairobiInput(promoEnd),
      });
  const fromPrice = tiersOn ? tiersFrom(tiers) : null;

  function problems(): Errors {
    const e: Errors = {};
    if (!title.trim()) e.title = "Add a name.";
    if (!SLUG_RE.test(slug)) e.slug = "Use lowercase letters, numbers and single dashes.";
    if (!tiersOn && (price.trim() === "" || !Number.isInteger(priceNum) || priceNum < 0)) e.price = "Use a whole number, 0 or more.";
    if (tiersOn) {
      if (!tiers.length) e.price = "Add at least one tier, or switch tiers off.";
      else if (tiers.some((tier) => !tier.name.trim())) e.price = "Every tier needs a name.";
      else if (tiers.some((tier) => tier.promo_price_kes != null && (tier.promo_price_kes < 0 || tier.promo_price_kes >= tier.price_kes))) {
        e.price = "An offer price has to sit below that tier's price.";
      }
    } else if (promoOn) {
      if (priceNum <= 0) e.promo = "Set a list price before a promotion.";
      else if (promoPrice.trim() === "" || !Number.isInteger(saleNum) || saleNum < 0 || saleNum >= priceNum) e.promo = "The offer price must be a whole number below the list price.";
      const start = fromNairobiInput(promoStart);
      const end = fromNairobiInput(promoEnd);
      if ((promoStart && !start) || (promoEnd && !end)) e.promo = "Use a valid start and end.";
      else if (start && end && end <= start) e.promo = "The offer must end after it starts.";
    }
    if (published && needsFile && !filePath) e.file = "Attach the file before publishing it.";
    return e;
  }

  function go(next: number) {
    const e = problems();
    const blocked =
      (step === 0 && (e.title || e.slug)) ||
      (step === 1 && (e.price || e.promo)) ||
      (next > step && step === 2 && e.file);
    if (next > step && blocked) {
      setErrors(e);
      return;
    }
    setErrors({});
    setStep(Math.max(0, Math.min(STEPS.length - 1, next)));
  }

  async function save() {
    setSaved(false);
    const e = problems();
    setErrors(e);
    if (Object.keys(e).length) {
      if (e.title || e.slug) setStep(0);
      else if (e.price || e.promo) setStep(1);
      else if (e.file) setStep(2);
      return;
    }
    setBusy(true);
    const supabase = createClient();

    let taken = supabase.from("products").select("id").eq("slug", slug).limit(1);
    if (initial) taken = taken.neq("id", initial.id);
    const { data: clash } = await taken;
    if (clash?.length) {
      setBusy(false);
      setStep(0);
      setErrors({ slug: "Another product already uses this slug." });
      return;
    }

    const savedTiers = tiersOn ? parseTiers(tiers) : [];
    const row = {
      title: title.trim(),
      slug,
      type,
      currency,
      price_kes: savedTiers.length ? Math.min(...savedTiers.map((tier) => tier.price_kes)) : priceNum,
      price_tiers: savedTiers,
      promo_price_kes: tiersOn || !promoOn ? null : saleNum,
      promo_label: tiersOn || !promoOn ? null : promoLabel.trim() || null,
      promo_starts_at: tiersOn || !promoOn ? null : fromNairobiInput(promoStart),
      promo_ends_at: tiersOn || !promoOn ? null : fromNairobiInput(promoEnd),
      description,
      version: version.trim() || null,
      changelog: changelog || null,
      cover_path: cover || null,
      gallery,
      file_path: filePath || null,
      published,
    };
    const { data, error } = initial
      ? await supabase.from("products").update(row).eq("id", initial.id).select("id").single()
      : await supabase.from("products").insert(row).select("id").single();
    if (error || !data) {
      setBusy(false);
      setErrors({ form: error?.message || "Could not save." });
      return;
    }

    if (published && !initial?.published) {
      await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "product",
          title: row.title,
          url: `${company.domain}/products/${row.slug}`,
          excerpt: description.slice(0, 180),
        }),
      }).catch(() => {});
    }
    setBusy(false);
    refreshSite();
    startNavProgress();
    if (!initial) {
      router.push(`/console/products/${data.id}`);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <WizardSteps steps={STEPS} current={step} onPick={go} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="min-w-0">
          {step === 0 ? (
            <div className="space-y-4">
            <Panel title="Product">
              <div className="space-y-4">
                <Field label="Name">
                  <input
                    className={cn(inputClass, errors.title && "border-red-400")}
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!slugTouched) setSlug(slugify(e.target.value));
                    }}
                  />
                  <FieldError text={errors.title} />
                </Field>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
                  <Field label="Slug">
                    <div className={cn("flex items-center rounded-[5px] border border-line bg-white focus-within:border-brand-500", errors.slug && "border-red-400")}>
                      <span className="pl-3 text-sm text-muted">/products/</span>
                      <input
                        className="w-full bg-transparent py-2.5 pr-3 text-sm text-ink-900 outline-none"
                        value={slug}
                        onChange={(e) => {
                          setSlugTouched(true);
                          setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                        }}
                        onBlur={() => setSlug((s) => slugify(s))}
                      />
                    </div>
                    <FieldError text={errors.slug} />
                  </Field>
                  <Field label="Type">
                    <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
                      {PRODUCT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {TYPE_LABELS[t] ?? t}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>
            </Panel>
            <div>
              <p className="mb-1.5 text-[13px] font-medium text-ink-900">Description</p>
              <RichEditor initialHtml={toHtml(description)} onChange={setDescription} />
            </div>
            </div>
          ) : null}

          {step === 1 ? (
            <Panel title="Price" meta="One price, or tiers for products that sell in more than one plan.">
              <div className="space-y-4">
                <CurrencyPicker value={currency} onChange={setCurrency} />
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[5px] border border-line px-3 py-2.5">
                  <span>
                    <span className="block text-sm font-medium text-ink-900">Pricing tiers</span>
                    <span className="mt-0.5 block text-xs text-muted">Leave this off for a single price. Turn it on to sell Starter, Studio, and the rest.</span>
                  </span>
                  <Switch
                    checked={tiersOn}
                    label="Pricing tiers"
                    onClick={() => {
                      setTiersOn((on) => {
                        if (!on && tiers.length === 0) setTiers([emptyTier()]);
                        return !on;
                      });
                    }}
                  />
                </label>
                {tiersOn ? (
                  <>
                    <TierEditor value={tiers} currency={currency} onChange={setTiers} />
                    <FieldError text={errors.price} />
                  </>
                ) : (
                <>
                <Field label={`List price (${currency})`}>
                  <input
                    className={cn(inputClass, errors.price && "border-red-400")}
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                  <FieldError text={errors.price} />
                  {priceNum === 0 && !errors.price ? <p className="mt-1 text-xs text-muted">Free. Checkout collects their details and emails the download.</p> : null}
                </Field>
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[5px] border border-line px-3 py-2.5">
                  <span className="text-sm font-medium text-ink-900">Run a promotion</span>
                  <Switch checked={promoOn} label="Run a promotion" onClick={() => setPromoOn((v) => !v)} />
                </label>
                {promoOn ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Discount %">
                        <input
                          className={inputClass}
                          inputMode="numeric"
                          value={percentOff || ""}
                          placeholder="20"
                          onChange={(e) => {
                            const raw = Number(e.target.value.replace(/[^\d]/g, ""));
                            if (!raw || priceNum <= 0) {
                              setPromoPrice("");
                              return;
                            }
                            const sale = Math.round(priceNum * (100 - Math.min(raw, 99)) / 100);
                            setPromoPrice(String(Math.min(Math.max(sale, 0), priceNum - 1)));
                          }}
                        />
                      </Field>
                      <Field label={`Offer price (${currency})`}>
                        <input
                          className={cn(inputClass, errors.promo && "border-red-400")}
                          inputMode="numeric"
                          value={promoPrice}
                          onChange={(e) => setPromoPrice(e.target.value.replace(/[^\d]/g, ""))}
                        />
                      </Field>
                    </div>
                    <Field label="Offer name">
                      <input className={inputClass} value={promoLabel} placeholder="Launch offer" onChange={(e) => setPromoLabel(e.target.value)} />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Starts (Nairobi)">
                        <input className={inputClass} type="datetime-local" value={promoStart} onChange={(e) => setPromoStart(e.target.value)} />
                      </Field>
                      <Field label="Ends (Nairobi)">
                        <input className={inputClass} type="datetime-local" value={promoEnd} onChange={(e) => setPromoEnd(e.target.value)} />
                      </Field>
                    </div>
                    <p className="text-xs text-muted">Leave the dates empty to keep the offer on until you switch it off.</p>
                    <FieldError text={errors.promo} />
                  </div>
                ) : null}
                </>
                )}
              </div>
            </Panel>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <Panel title="Cover" meta="The image on the product card.">
                <UploadField folder="products" bucket="public-media" accept="image/*" value={cover} onChange={setCover} emptyLabel="No cover" />
              </Panel>
              <Panel title="Screenshots" meta="Shown in the gallery and the Screenshots tab.">
                <GalleryField folder="products/gallery" value={gallery} onChange={setGallery} />
              </Panel>
              <Panel title="Release">
                <div className="space-y-4">
                  <Field label="Version">
                    <input className={inputClass} value={version} placeholder="1.0.0" onChange={(e) => setVersion(e.target.value)} />
                  </Field>
                  <div>
                    <p className="mb-1.5 text-[13px] font-medium text-ink-900">Changelog</p>
                    <RichEditor initialHtml={toHtml(changelog)} onChange={setChangelog} />
                  </div>
                </div>
              </Panel>
              {needsFile ? (
                <Panel title="Download" meta="Emailed after checkout">
                  <UploadField
                    folder="plugins"
                    bucket="product-files"
                    accept=".zip,.rar,.7z,.pdf"
                    value={filePath}
                    onChange={setFilePath}
                    emptyLabel="No file attached"
                  />
                  <FieldError text={errors.file} />
                </Panel>
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <Panel title="Publish">
              <div className="space-y-3 text-sm text-body">
                <p><span className="font-medium text-ink-900">{title || "Untitled"}</span> · {TYPE_LABELS[type] ?? type}</p>
                <p>
                  {tiersOn
                    ? fromPrice != null && fromPrice > 0
                      ? `${tiers.length} tiers, from ${formatMoney(fromPrice, currency)}.`
                      : tiers.some((tier) => tierDue(tier) > 0)
                        ? `${tiers.length} tiers. A free tier skips payment. A priced tier still asks for one.`
                        : `${tiers.length} tiers. Free. Checkout collects their details and emails the download.`
                    : preview
                      ? `${formatMoney(preview.price, currency)} during ${preview.label}. List price ${formatMoney(preview.list, currency)}.`
                      : priceNum > 0
                        ? `${formatMoney(priceNum, currency)} with no offer running.`
                        : "Free. Checkout collects their details and emails the download."}
                </p>
                <p>{published ? "Live on the products page." : "Draft. It stays off the products page."}</p>
              </div>
            </Panel>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <Panel
            title={title.trim() || "New product"}
            action={<Pill tone={published ? "success" : "neutral"}>{published ? "Live" : "Draft"}</Pill>}
          >
            <div className="space-y-3">
              <PublishStatus value={published ? "live" : "draft"} onChange={(next) => setPublished(next === "live")} />
              <p className="text-[13px] text-body">{published ? "Live on the products page." : "Draft. Hidden from the site until you set it live."}</p>
              <p className="text-[13px] text-body">
                {tiersOn
                  ? fromPrice != null && fromPrice > 0
                    ? `Buyers start at ${formatMoney(fromPrice, currency)}.`
                    : "No checkout until a tier has a price."
                  : preview
                    ? `Buyers pay ${formatMoney(preview.price, currency)} right now.`
                    : priceNum > 0
                      ? `Buyers pay ${formatMoney(priceNum, currency)}.`
                      : "No checkout until a price is set."}
              </p>
              {initial?.published ? (
                <Link href={`/products/${initial.slug}`} target="_blank" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-600 hover:underline">
                  View product page
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </Link>
              ) : null}
              {sales ? (
                <p className="text-xs text-muted">
                  {sales.count} {sales.count === 1 ? "sale" : "sales"} · {formatMoney(sales.revenue, "KES")}
                </p>
              ) : null}
              <FieldError text={errors.form} />
              {saved && !Object.keys(errors).length ? <p className="text-xs text-emerald-600">Saved.</p> : null}
              <div className="flex gap-2">
                {step > 0 ? (
                  <AdminBtn variant="ghost" onClick={() => go(step - 1)}>Back</AdminBtn>
                ) : null}
                {step < STEPS.length - 1 ? (
                  <AdminBtn onClick={() => go(step + 1)}>Continue</AdminBtn>
                ) : (
                  <AdminBtn onClick={save} pending={busy}>
                    {busy ? "Saving..." : published ? (initial ? "Save changes" : "Publish") : "Save draft"}
                  </AdminBtn>
                )}
              </div>
              {step < STEPS.length - 1 ? (
                <AdminBtn variant="ghost" onClick={save} pending={busy}>
                  {busy ? "Saving..." : published ? "Save" : "Save draft"}
                </AdminBtn>
              ) : null}
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}

function FieldError({ text }: { text?: string }) {
  return text ? <span className="mt-1 block text-xs text-red-600">{text}</span> : null;
}
