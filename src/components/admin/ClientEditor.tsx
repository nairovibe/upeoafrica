"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminBtn, Field, inputClass } from "@/components/admin/ui";
import { FileField } from "@/components/admin/FileField";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/constants";
import type { Client } from "@/lib/cms";

export function ClientEditor({ initial }: { initial?: Client }) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? true);
  const [logo, setLogo] = useState(initial?.logo_path ?? "");
  const [billingEmail, setBillingEmail] = useState(initial?.billing_email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [kraPin, setKraPin] = useState(initial?.kra_pin ?? "");
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    const supabase = createClient();
    const row = {
      name,
      slug: slug || slugify(name),
      url: url || null,
      featured,
      logo_path: logo || null,
      billing_email: billingEmail || null,
      phone: phone || null,
      kra_pin: kraPin || null,
    };
    const q = initial
      ? supabase.from("clients").update(row).eq("id", initial.id)
      : supabase.from("clients").insert(row);
    const { error } = await q;
    if (error) return setErr(error.message);
    router.push("/admin/clients");
    router.refresh();
  }

  return (
    <div className="max-w-xl space-y-4">
      <Field label="Name">
        <input className={inputClass} value={name} onChange={(e) => {
          setName(e.target.value);
          if (!initial) setSlug(slugify(e.target.value));
        }} />
      </Field>
      <Field label="Slug">
        <input className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} />
      </Field>
      <Field label="Website">
        <input className={inputClass} value={url} onChange={(e) => setUrl(e.target.value)} />
      </Field>
      <FileField label="Logo" folder="clients" value={logo} onChange={setLogo} accept="image/*" />
      <Field label="Billing email" hint="Used when you raise an invoice to this account.">
        <input className={inputClass} type="email" value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} />
      </Field>
      <Field label="Phone">
        <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <Field label="KRA PIN (optional)">
        <input className={inputClass} value={kraPin} onChange={(e) => setKraPin(e.target.value)} />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
        Show on the home strip
      </label>
      {err && <p className="text-sm text-brand-600">{err}</p>}
      <AdminBtn variant="ink" onClick={save}>Save</AdminBtn>
    </div>
  );
}
