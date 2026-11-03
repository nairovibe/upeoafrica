"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { AdminBtn, Field, Panel, inputClass } from "@/components/admin/ui";
import { UploadField } from "@/components/admin/products/UploadField";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_TYPES, formatKes, slugify } from "@/lib/constants";
import { company } from "@/lib/content";
import { refreshSite } from "@/lib/refresh-site";
import { startNavProgress } from "@/components/ui/NavProgress";
import type { Product } from "@/lib/cms";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = { plugin: "Plugin", download: "Download", saas: "SaaS" };
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type Errors = Partial<Record<"title" | "slug" | "price" | "file" | "form", string>>;

export function ProductEditor({ initial, sales }: { initial?: Product; sales?: { count: number; revenue: number } }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial));
  const [type, setType] = useState(initial?.type ?? "plugin");
  const [price, setPrice] = useState(String(initial?.price_kes ?? 0));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [version, setVersion] = useState(initial?.version ?? "");
  const [changelog, setChangelog] = useState(initial?.changelog ?? "");
  const [cover, setCover] = useState(initial?.cover_path ?? "");
  const [filePath, setFilePath] = useState(initial?.file_path ?? "");
  const [published, setPublished] = useState(initial?.published ?? false);
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const needsFile = type !== "saas";
  const priceNum = Number(price);

  function validate(): Errors {
    const e: Errors = {};
    if (!title.trim()) e.title = "Add a name.";
    if (!SLUG_RE.test(slug)) e.slug = "Use lowercase letters, numbers and single dashes.";
    if (price.trim() === "" || !Number.isInteger(priceNum) || priceNum < 0) e.price = "Use a whole number of shillings, 0 or more.";
    if (published && priceNum > 0 && needsFile && !filePath) e.file = "Attach the file before selling it.";
    return e;
  }

  async function save() {
    setSaved(false);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const supabase = createClient();

    let taken = supabase.from("products").select("id").eq("slug", slug).limit(1);
    if (initial) taken = taken.neq("id", initial.id);
    const { data: clash } = await taken;
    if (clash?.length) {
      setBusy(false);
      setErrors({ slug: "Another product already uses this slug." });
      return;
    }

    const row = {
      title: title.trim(),
      slug,
      type,
      price_kes: priceNum,
      description,
      version: version.trim() || null,
      changelog: changelog || null,
      cover_path: cover || null,
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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <Panel title="Details">
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
          <Field label="Description">
            <textarea className={inputClass} rows={8} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Changelog">
            <textarea
              className={cn(inputClass, "font-mono text-[13px]")}
              rows={5}
              value={changelog}
              placeholder={"1.2.0\n- Added M-Pesa receipts"}
              onChange={(e) => setChangelog(e.target.value)}
            />
          </Field>
        </div>
      </Panel>

      <aside className="space-y-4 lg:sticky lg:top-20">
        <Panel
          title="Publishing"
          action={
            <button
              type="button"
              role="switch"
              aria-checked={published}
              aria-label="Live on the site"
              onClick={() => setPublished((v) => !v)}
              className={cn(
                "relative h-5 w-9 cursor-pointer rounded-full transition-colors duration-150",
                published ? "bg-brand-500" : "bg-surface-3 ring-1 ring-inset ring-line",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150",
                  published ? "translate-x-[18px]" : "translate-x-0.5",
                )}
              />
            </button>
          }
        >
          <div className="space-y-3">
            <p className="text-[13px] text-body">{published ? "Live on the products page." : "Hidden from the site."}</p>
            {initial?.published ? (
              <Link
                href={`/products/${initial.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-brand-600 hover:underline"
              >
                View product page
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : null}
            {sales ? (
              <p className="text-xs text-muted">
                {sales.count} {sales.count === 1 ? "sale" : "sales"} · {formatKes(sales.revenue)}
              </p>
            ) : null}
            <FieldError text={errors.form} />
            {saved && !Object.keys(errors).length ? <p className="text-xs text-emerald-600">Saved.</p> : null}
            <div className="grid [&>*]:w-full">
              <AdminBtn onClick={save} pending={busy}>
                {busy ? "Saving..." : initial ? "Save changes" : "Create product"}
              </AdminBtn>
            </div>
          </div>
        </Panel>

        <Panel title="Pricing">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (KES)">
              <input
                className={cn(inputClass, errors.price && "border-red-400")}
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </Field>
            <Field label="Version">
              <input className={inputClass} value={version} placeholder="1.0.0" onChange={(e) => setVersion(e.target.value)} />
            </Field>
          </div>
          <FieldError text={errors.price} />
          {priceNum === 0 && !errors.price ? <p className="mt-2 text-xs text-muted">Shows as On request.</p> : null}
        </Panel>

        <Panel title="Cover">
          <UploadField folder="products" bucket="public-media" accept="image/*" value={cover} onChange={setCover} emptyLabel="No cover" />
        </Panel>

        {needsFile ? (
          <Panel title="Download" meta="Sent to buyers after payment">
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
      </aside>
    </div>
  );
}

function FieldError({ text }: { text?: string }) {
  return text ? <span className="mt-1 block text-xs text-red-600">{text}</span> : null;
}
