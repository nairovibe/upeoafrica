"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Globe, MailCheck, ReceiptText, Search, type LucideIcon } from "lucide-react";
import { AdminBtn, Field, Panel, Pill, inputClass } from "@/components/admin/ui";
import { FileField } from "@/components/admin/FileField";
import { Notice, Toggle } from "@/components/admin/studio/controls";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/lib/cms";
import type { TablesUpdate } from "@/lib/database.types";
import { cn } from "@/lib/utils";
import { refreshSite } from "@/lib/refresh-site";
import { metaContent, VERIFY } from "@/lib/search-presence";

type Form = ReturnType<typeof toForm>;
type Key = keyof Form;
type SectionId = "company" | "invoicing" | "autoresponder" | "website" | "search";

const SECTIONS: { id: SectionId; label: string; icon: LucideIcon; keys: Key[] }[] = [
  {
    id: "company",
    label: "Company",
    icon: Building2,
    keys: ["legal_name", "trading_name", "public_email", "phone", "address_line", "logo_path"],
  },
  {
    id: "invoicing",
    label: "Invoicing",
    icon: ReceiptText,
    keys: ["invoice_prefix", "invoice_next_number", "kra_pin", "vat_percent", "payment_note"],
  },
  {
    id: "autoresponder",
    label: "Enquiry autoresponder",
    icon: MailCheck,
    keys: ["autoresponder_enabled", "autoresponder_hours", "autoresponder_subject", "autoresponder_body"],
  },
  {
    id: "website",
    label: "Website and integrations",
    icon: Globe,
    keys: [
      "cal_com_embed_url",
      "social_publish_webhook_url",
      "linkedin_url",
      "x_url",
      "github_url",
      "google_review_url",
    ],
  },
  {
    id: "search",
    label: "Search and ads",
    icon: Search,
    keys: [
      "google_site_verification",
      "bing_site_verification",
      "baidu_site_verification",
      "yandex_site_verification",
      "facebook_domain_verification",
      "gtm_id",
      "meta_pixel_id",
      "google_ads_id",
      "thank_you_note",
    ],
  },
];

function toForm(s: SiteSettings) {
  return {
    legal_name: s.legal_name ?? "",
    trading_name: s.trading_name ?? "",
    phone: s.phone ?? "",
    public_email: s.public_email ?? "",
    address_line: s.address_line ?? "",
    logo_path: s.logo_path ?? "",
    invoice_prefix: s.invoice_prefix ?? "UAT",
    invoice_next_number: String(s.invoice_next_number ?? 1),
    kra_pin: s.kra_pin ?? "",
    vat_percent: s.vat_percent != null ? String(s.vat_percent) : "",
    payment_note: s.payment_note ?? "",
    autoresponder_enabled: s.autoresponder_enabled ?? true,
    autoresponder_hours: String(s.autoresponder_hours ?? 24),
    autoresponder_subject: s.autoresponder_subject ?? "",
    autoresponder_body: s.autoresponder_body ?? "",
    linkedin_url: s.linkedin_url ?? "",
    x_url: s.x_url ?? "",
    github_url: s.github_url ?? "",
    google_review_url: s.google_review_url ?? "",
    cal_com_embed_url: s.cal_com_embed_url ?? "",
    gtm_id: s.gtm_id ?? "",
    google_site_verification: s.google_site_verification ?? "",
    bing_site_verification: s.bing_site_verification ?? "",
    baidu_site_verification: s.baidu_site_verification ?? "",
    yandex_site_verification: s.yandex_site_verification ?? "",
    facebook_domain_verification: s.facebook_domain_verification ?? "",
    meta_pixel_id: s.meta_pixel_id ?? "",
    google_ads_id: s.google_ads_id ?? "",
    thank_you_note: s.thank_you_note ?? "",
    social_publish_webhook_url: s.social_publish_webhook_url ?? "",
  };
}

function validate(form: Form, keys: Key[]): string | null {
  if (keys.includes("invoice_next_number")) {
    const n = Number(form.invoice_next_number);
    if (!Number.isInteger(n) || n < 1) return "Next number must be a whole number from 1.";
  }
  if (keys.includes("vat_percent") && form.vat_percent.trim()) {
    const v = Number(form.vat_percent);
    if (!Number.isFinite(v) || v < 0 || v > 100) return "VAT must be between 0 and 100.";
  }
  if (keys.includes("autoresponder_hours")) {
    const h = Number(form.autoresponder_hours);
    if (!Number.isInteger(h) || h < 1) return "Reply window must be a whole number of hours.";
  }
  if (keys.includes("gtm_id") && form.gtm_id.trim() && !/^GTM-[A-Z0-9]+$/i.test(form.gtm_id.trim())) {
    return "GTM ID looks like GTM-XXXXXXX.";
  }
  const tokens: [Key, RegExp, string][] = [
    ["google_site_verification", VERIFY.google, "Google verification is the content value from the meta tag."],
    ["bing_site_verification", VERIFY.bing, "Bing verification is the content value from the meta tag."],
    ["baidu_site_verification", VERIFY.baidu, "Baidu verification is the content value from the meta tag."],
    ["yandex_site_verification", VERIFY.yandex, "Yandex verification is the content value from the meta tag."],
    ["facebook_domain_verification", VERIFY.facebook, "Meta domain verification is the content value from the meta tag."],
    ["meta_pixel_id", VERIFY.pixel, "Meta pixel ID is the number from Events Manager."],
    ["google_ads_id", VERIFY.ads, "Google Ads ID looks like AW-123456789 or AW-123456789/label."],
  ];
  for (const [key, pattern, message] of tokens) {
    if (!keys.includes(key)) continue;
    const value = metaContent(String(form[key]));
    if (value && !pattern.test(value)) return message;
  }
  if (keys.includes("thank_you_note") && form.thank_you_note.trim().length > 280) {
    return "The thank-you note stays under 280 characters.";
  }
  return null;
}

function toUpdate(form: Form, keys: Key[]): TablesUpdate<"site_settings"> {
  const out: Record<string, unknown> = {};
  for (const key of keys) {
    const value = form[key];
    if (typeof value === "boolean") out[key] = value;
    else if (key === "invoice_next_number" || key === "autoresponder_hours") out[key] = Number(value);
    else if (key === "vat_percent") out[key] = value.trim() ? Number(value) : null;
    else if (key === "invoice_prefix") out[key] = value.trim().toUpperCase() || "UAT";
    else if (key === "gtm_id" || key === "kra_pin") out[key] = value.trim().toUpperCase() || null;
    else if (
      key === "google_site_verification" ||
      key === "bing_site_verification" ||
      key === "baidu_site_verification" ||
      key === "yandex_site_verification" ||
      key === "facebook_domain_verification" ||
      key === "meta_pixel_id" ||
      key === "google_ads_id"
    )
      out[key] = metaContent(value) || null;
    else out[key] = value.trim() || null;
  }
  return out as TablesUpdate<"site_settings">;
}

export function SettingsForm({
  initial,
  payments,
  canEdit = true,
  initialSection,
}: {
  initial: SiteSettings;
  payments: { live: boolean; keys: boolean; webhook: boolean };
  canEdit?: boolean;
  initialSection?: string;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(() => toForm(initial));
  const [form, setForm] = useState(saved);
  const [section, setSection] = useState<SectionId>(
    SECTIONS.some((s) => s.id === initialSection) ? (initialSection as SectionId) : "company",
  );
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const current = SECTIONS.find((s) => s.id === section)!;
  const dirty = (keys: Key[]) => keys.some((k) => form[k] !== saved[k]);
  const ro = !canEdit;

  function set<K extends Key>(key: K, value: Form[K]) {
    setForm((p) => ({ ...p, [key]: value }));
    setMsg(null);
  }

  function go(id: SectionId) {
    setSection(id);
    setMsg(null);
    window.history.replaceState(null, "", id === "company" ? "/console/settings" : `/console/settings?section=${id}`);
  }

  async function save() {
    const problem = validate(form, current.keys);
    if (problem) return setMsg({ tone: "error", text: problem });
    setBusy(true);
    setMsg(null);
    const { error } = await createClient().from("site_settings").update(toUpdate(form, current.keys)).eq("id", 1);
    setBusy(false);
    if (error) return setMsg({ tone: "error", text: error.message });
    setSaved((p) => {
      const next = { ...p };
      for (const k of current.keys) (next as Record<Key, unknown>)[k] = form[k];
      return next;
    });
    setMsg({ tone: "ok", text: "Saved." });
    refreshSite();
    router.refresh();
  }

  const text = (key: Exclude<Key, "autoresponder_enabled">, props?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      className={inputClass}
      value={form[key]}
      disabled={ro}
      onChange={(e) => set(key, e.target.value)}
      {...props}
    />
  );

  const year = new Date().getFullYear();
  const nextNumber = `${(form.invoice_prefix.trim() || "UAT").toUpperCase()}-${year}-${String(Number(form.invoice_next_number) || 1).padStart(4, "0")}`;

  const footer = canEdit ? (
    <div className="flex flex-wrap items-center gap-3 border-t border-line pt-4">
      <AdminBtn onClick={save} disabled={busy || !dirty(current.keys)}>
        {busy ? "Saving…" : "Save"}
      </AdminBtn>
      {dirty(current.keys) ? (
        <AdminBtn variant="ghost" onClick={() => setForm((p) => {
          const next = { ...p };
          for (const k of current.keys) (next as Record<Key, unknown>)[k] = saved[k];
          return next;
        })}>
          Discard
        </AdminBtn>
      ) : null}
      {msg ? <Notice tone={msg.tone}>{msg.text}</Notice> : null}
    </div>
  ) : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Settings sections" className="lg:sticky lg:top-20 lg:self-start">
        <ul className="flex gap-1 overflow-x-auto lg:flex-col">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const on = s.id === section;
            return (
              <li key={s.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => go(s.id)}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-[5px] px-3 py-2 text-left text-[13px] font-medium transition-colors",
                    on ? "bg-brand-50 text-brand-700" : "text-body hover:bg-surface-3 hover:text-ink-900",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span className="whitespace-nowrap">{s.label}</span>
                  {dirty(s.keys) ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" aria-label="Unsaved" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="min-w-0 space-y-5">
        {ro ? (
          <p className="rounded-[5px] border border-line bg-surface-2 px-4 py-2.5 text-[13px] text-body">
            Only owners can change settings.
          </p>
        ) : null}

        {section === "company" ? (
          <Panel title="Company">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Legal name">{text("legal_name", { placeholder: "Upeo Africa Technologies Ltd" })}</Field>
                <Field label="Trading name">{text("trading_name")}</Field>
                <Field label="Public email">{text("public_email", { type: "email" })}</Field>
                <Field label="Phone">{text("phone", { type: "tel", placeholder: "+254" })}</Field>
              </div>
              <Field label="Address">{text("address_line", { placeholder: "Mombasa, Kenya" })}</Field>
              <FileField
                label="Logo"
                folder="brand"
                accept="image/*"
                value={form.logo_path}
                onChange={(v) => set("logo_path", v)}
                disabled={ro}
              />
              {footer}
            </div>
          </Panel>
        ) : null}

        {section === "invoicing" ? (
          <Panel title="Invoicing" meta={`Next invoice ${nextNumber}`}>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Number prefix">{text("invoice_prefix")}</Field>
                <Field label="Next number">{text("invoice_next_number", { type: "number", min: 1, step: 1 })}</Field>
                <Field label="KRA PIN">{text("kra_pin", { placeholder: "P000000000A" })}</Field>
                <Field label="VAT percent">{text("vat_percent", { type: "number", min: 0, max: 100, step: "0.01", placeholder: "16" })}</Field>
              </div>
              <Field label="Payment note">
                <textarea
                  className={inputClass}
                  rows={3}
                  value={form.payment_note}
                  disabled={ro}
                  placeholder="M-Pesa Paybill 000000, account INV number"
                  onChange={(e) => set("payment_note", e.target.value)}
                />
              </Field>
              {footer}
            </div>
          </Panel>
        ) : null}

        {section === "autoresponder" ? (
          <Panel title="Enquiry autoresponder">
            <div className="space-y-4">
              <Toggle
                label="Send an acknowledgement for new enquiries"
                checked={form.autoresponder_enabled}
                onChange={(v) => set("autoresponder_enabled", v)}
                disabled={ro}
              />
              <div className="grid gap-4 sm:grid-cols-[160px_minmax(0,1fr)]">
                <Field label="Reply within (hours)">{text("autoresponder_hours", { type: "number", min: 1, step: 1 })}</Field>
                <Field label="Subject">{text("autoresponder_subject", { placeholder: "We have your message" })}</Field>
              </div>
              <Field label="Body" hint="Placeholders: {first_name}, {hours}">
                <textarea
                  className={inputClass}
                  rows={8}
                  value={form.autoresponder_body}
                  disabled={ro}
                  onChange={(e) => set("autoresponder_body", e.target.value)}
                />
              </Field>
              {footer}
            </div>
          </Panel>
        ) : null}

        {section === "website" ? (
          <>
            <Panel title="Website and integrations">
              <div className="space-y-4">
                <Field label="Cal.com booking URL">{text("cal_com_embed_url", { placeholder: "https://cal.com/upeo/intro" })}</Field>
                <Field label="Social publish webhook">{text("social_publish_webhook_url", { placeholder: "https://" })}</Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="LinkedIn">{text("linkedin_url", { placeholder: "https://linkedin.com/company/…" })}</Field>
                  <Field label="X">{text("x_url", { placeholder: "https://x.com/…" })}</Field>
                  <Field label="GitHub">{text("github_url", { placeholder: "https://github.com/…" })}</Field>
                  <Field label="Google review link">{text("google_review_url", { placeholder: "https://g.page/r/…" })}</Field>
                </div>
                {footer}
              </div>
            </Panel>
            <Panel title="Payments" meta="IntaSend keys live in the server environment">
              <dl className="grid gap-4 text-[13px] sm:grid-cols-3">
                <div>
                  <dt className="text-muted">API keys</dt>
                  <dd className="mt-1">
                    <Pill tone={payments.keys ? "success" : "warning"}>{payments.keys ? "Present" : "Missing"}</Pill>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Mode</dt>
                  <dd className="mt-1">
                    <Pill tone={payments.live ? "success" : "neutral"}>{payments.live ? "Live" : "Test"}</Pill>
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Webhook secret</dt>
                  <dd className="mt-1">
                    <Pill tone={payments.webhook ? "success" : "warning"}>{payments.webhook ? "Set" : "Not set"}</Pill>
                  </dd>
                </div>
              </dl>
            </Panel>
          </>
        ) : null}

        {section === "search" ? (
          <Panel title="Search and ads" meta="Verification tags and conversion tracking">
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-body">
                Paste the content value, or the whole meta tag. Google is already on the homepage. Bing, Baidu, Yandex and Meta domain checks appear as soon as a value is saved.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Google Search Console">{text("google_site_verification", { placeholder: "google-site-verification content" })}</Field>
                <Field label="Bing Webmaster">{text("bing_site_verification", { placeholder: "msvalidate.01 content" })}</Field>
                <Field label="Baidu">{text("baidu_site_verification", { placeholder: "baidu-site-verification content" })}</Field>
                <Field label="Yandex">{text("yandex_site_verification", { placeholder: "yandex-verification content" })}</Field>
                <Field label="Meta domain verification">{text("facebook_domain_verification", { placeholder: "facebook-domain-verification content" })}</Field>
                <Field label="Google Tag Manager">{text("gtm_id", { placeholder: "GTM-XXXXXXX" })}</Field>
                <Field label="Meta pixel ID" hint="Leave empty when the pixel already lives in Tag Manager.">
                  {text("meta_pixel_id", { placeholder: "1234567890", inputMode: "numeric" })}
                </Field>
                <Field label="Google Ads ID" hint="AW-123456789 or AW-123456789/label. Leave empty when the tag already lives in Tag Manager.">
                  {text("google_ads_id", { placeholder: "AW-123456789/label" })}
                </Field>
              </div>
              <Field label="Thank-you note" hint="Shown under the confirmation on /thank-you. Enquiry, list, ticket and product payments each keep their own heading.">
                <textarea
                  className={inputClass}
                  rows={3}
                  maxLength={280}
                  value={form.thank_you_note}
                  disabled={ro}
                  placeholder="A short line for everyone who reaches the confirmation page."
                  onChange={(e) => set("thank_you_note", e.target.value)}
                />
              </Field>
              <p className="text-xs leading-relaxed text-muted">
                Confirmation pages are /thank-you?for=enquiry, subscribe, ticket or order. Each one sends a conversion event named conversion, with conversion_kind set to that value. Use that event in Tag Manager for Google Ads, Meta and any other pixel. The page is not in the sitemap and is marked noindex.
              </p>
              {footer}
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
