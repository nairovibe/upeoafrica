"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminBtn, Field, inputClass } from "@/components/admin/ui";
import { FileField } from "@/components/admin/FileField";
import { createClient } from "@/lib/supabase/client";
import { PARTNER_RELATIONSHIPS, slugify } from "@/lib/constants";

export function PartnerEditor({
  initial,
}: {
  initial?: {
    id: string;
    name: string;
    slug: string;
    url: string | null;
    relationship: string;
    blurb: string;
    featured: boolean;
    logo_path: string | null;
  };
}) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [relationship, setRelationship] = useState(initial?.relationship ?? "other");
  const [blurb, setBlurb] = useState(initial?.blurb ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [logo, setLogo] = useState(initial?.logo_path ?? "");
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    const supabase = createClient();
    const row = {
      name,
      slug: slug || slugify(name),
      url: url || null,
      relationship,
      blurb,
      featured,
      logo_path: logo || null,
    };
    const q = initial
      ? supabase.from("partners").update(row).eq("id", initial.id)
      : supabase.from("partners").insert(row);
    const { error } = await q;
    if (error) return setErr(error.message);
    router.push("/admin/partners");
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
      <Field label="Relationship">
        <select className={inputClass} value={relationship} onChange={(e) => setRelationship(e.target.value)}>
          {PARTNER_RELATIONSHIPS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </Field>
      <Field label="Blurb">
        <textarea className={inputClass} rows={5} value={blurb} onChange={(e) => setBlurb(e.target.value)} />
      </Field>
      <FileField label="Logo" folder="partners" value={logo} onChange={setLogo} accept="image/*" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
        Featured
      </label>
      {err && <p className="text-sm text-brand-600">{err}</p>}
      <AdminBtn variant="ink" onClick={save}>Save</AdminBtn>
    </div>
  );
}
