"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminBtn, Field, inputClass } from "@/components/admin/ui";
import { FileField } from "@/components/admin/FileField";
import { createClient } from "@/lib/supabase/client";
import type { SiteSettings } from "@/lib/cms";

export function SettingsForm({
  initial,
  payments,
}: {
  initial: SiteSettings;
  payments: { live: boolean; keys: boolean; webhook: boolean };
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    legal_name: initial.legal_name ?? "",
    trading_name: initial.trading_name ?? "",
    phone: initial.phone ?? "",
    public_email: initial.public_email ?? "",
    address_line: initial.address_line ?? "",
    logo_path: initial.logo_path ?? "",
    invoice_prefix: initial.invoice_prefix ?? "UAT",
    kra_pin: initial.kra_pin ?? "",
    vat_percent: initial.vat_percent != null ? String(initial.vat_percent) : "",
    payment_note: initial.payment_note ?? "",
    autoresponder_enabled: initial.autoresponder_enabled ?? true,
    autoresponder_hours: String(initial.autoresponder_hours ?? 24),
    autoresponder_subject: initial.autoresponder_subject ?? "",
    autoresponder_body: initial.autoresponder_body ?? "",
    linkedin_url: initial.linkedin_url ?? "",
    x_url: initial.x_url ?? "",
    github_url: initial.github_url ?? "",
    google_review_url: initial.google_review_url ?? "",
    cal_com_embed_url: initial.cal_com_embed_url ?? "",
    gtm_id: initial.gtm_id ?? "",
    social_publish_webhook_url: initial.social_publish_webhook_url ?? "",
  });
  const [msg, setMsg] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function save() {
    const supabase = createClient();
    const { error } = await supabase
      .from("site_settings")
      .update({
        legal_name: form.legal_name || null,
        trading_name: form.trading_name || null,
        phone: form.phone || null,
        public_email: form.public_email || null,
        address_line: form.address_line || null,
        logo_path: form.logo_path || null,
        invoice_prefix: form.invoice_prefix || "UAT",
        kra_pin: form.kra_pin || null,
        vat_percent: form.vat_percent ? Number(form.vat_percent) : null,
        payment_note: form.payment_note || null,
        autoresponder_enabled: form.autoresponder_enabled,
        autoresponder_hours: Number(form.autoresponder_hours) || 24,
        autoresponder_subject: form.autoresponder_subject || null,
        autoresponder_body: form.autoresponder_body || null,
        linkedin_url: form.linkedin_url || null,
        x_url: form.x_url || null,
        github_url: form.github_url || null,
        google_review_url: form.google_review_url || null,
        cal_com_embed_url: form.cal_com_embed_url || null,
        gtm_id: form.gtm_id || null,
        social_publish_webhook_url: form.social_publish_webhook_url || null,
      })
      .eq("id", 1);
    setMsg(error ? error.message : "Saved.");
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-8">
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Studio identity</h2>
        <Field label="Legal name">
          <input className={inputClass} value={form.legal_name} onChange={(e) => set("legal_name", e.target.value)} />
        </Field>
        <Field label="Trading name">
          <input className={inputClass} value={form.trading_name} onChange={(e) => set("trading_name", e.target.value)} />
        </Field>
        <Field label="Phone">
          <input className={inputClass} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
        <Field label="Public email">
          <input className={inputClass} value={form.public_email} onChange={(e) => set("public_email", e.target.value)} />
        </Field>
        <Field label="Address on invoices">
          <input className={inputClass} value={form.address_line} onChange={(e) => set("address_line", e.target.value)} />
        </Field>
        <FileField label="Logo" folder="brand" value={form.logo_path} onChange={(v) => set("logo_path", v)} accept="image/*" />
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Invoices</h2>
        <Field label="Number prefix" hint="Prints as PREFIX-YEAR-0001.">
          <input className={inputClass} value={form.invoice_prefix} onChange={(e) => set("invoice_prefix", e.target.value)} />
        </Field>
        <Field label="KRA PIN (optional)">
          <input className={inputClass} value={form.kra_pin} onChange={(e) => set("kra_pin", e.target.value)} />
        </Field>
        <Field label="VAT percent (optional)" hint="Leave empty for simple KES invoices.">
          <input className={inputClass} value={form.vat_percent} onChange={(e) => set("vat_percent", e.target.value)} />
        </Field>
        <Field label="Payment note" hint="Paybill, till, or bank line printed on the invoice.">
          <textarea className={inputClass} value={form.payment_note} onChange={(e) => set("payment_note", e.target.value)} />
        </Field>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Email</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.autoresponder_enabled}
            onChange={(e) => set("autoresponder_enabled", e.target.checked)}
          />
          Send the 24 hour acknowledgement when a form is submitted
        </label>
        <Field label="Hours promised">
          <input className={inputClass} value={form.autoresponder_hours} onChange={(e) => set("autoresponder_hours", e.target.value)} />
        </Field>
        <Field label="Subject">
          <input className={inputClass} value={form.autoresponder_subject} onChange={(e) => set("autoresponder_subject", e.target.value)} />
        </Field>
        <Field label="Body" hint="Use {first_name} and {hours}.">
          <textarea
            className={inputClass + " min-h-28"}
            value={form.autoresponder_body}
            onChange={(e) => set("autoresponder_body", e.target.value)}
          />
        </Field>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Payments</h2>
        <p className="text-sm text-body">
          IntaSend keys stay in the server environment. This desk never stores them in the form.
        </p>
        <ul className="text-sm">
          <li>Keys: {payments.keys ? "present" : "missing"}</li>
          <li>Mode: {payments.live ? "live" : "test"}</li>
          <li>Webhook secret: {payments.webhook ? "set" : "not set"}</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Public site</h2>
        <Field label="LinkedIn">
          <input className={inputClass} value={form.linkedin_url} onChange={(e) => set("linkedin_url", e.target.value)} />
        </Field>
        <Field label="X">
          <input className={inputClass} value={form.x_url} onChange={(e) => set("x_url", e.target.value)} />
        </Field>
        <Field label="GitHub">
          <input className={inputClass} value={form.github_url} onChange={(e) => set("github_url", e.target.value)} />
        </Field>
        <Field label="Google review link">
          <input className={inputClass} value={form.google_review_url} onChange={(e) => set("google_review_url", e.target.value)} />
        </Field>
        <Field label="Cal.com booking URL">
          <input className={inputClass} value={form.cal_com_embed_url} onChange={(e) => set("cal_com_embed_url", e.target.value)} />
        </Field>
        <Field label="Google Tag Manager ID">
          <input className={inputClass} value={form.gtm_id} onChange={(e) => set("gtm_id", e.target.value)} />
        </Field>
        <Field label="Publish webhook">
          <input className={inputClass} value={form.social_publish_webhook_url} onChange={(e) => set("social_publish_webhook_url", e.target.value)} />
        </Field>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Access</h2>
        <p className="text-sm text-body">
          Seat people from{" "}
          <a href="/admin/team" className="font-medium text-brand-600 hover:underline">
            Team
          </a>
          . Sign out from the operator chip in the header when you leave a shared machine.
        </p>
      </section>

      {msg && <p className="text-sm text-body">{msg}</p>}
      <AdminBtn variant="ink" onClick={save}>
        Save settings
      </AdminBtn>
    </div>
  );
}
