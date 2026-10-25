"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminBtn, Field, inputClass } from "@/components/admin/ui";
import { FileField } from "@/components/admin/FileField";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/constants";
import { company } from "@/lib/content";
import type { CaseStudy } from "@/lib/cms";

export function WorkEditor({
  initial,
  clients,
}: {
  initial?: CaseStudy;
  clients: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [industry, setIndustry] = useState(initial?.industry ?? "");
  const [services, setServices] = useState((initial?.services ?? []).join(", "));
  const [outcomes, setOutcomes] = useState((initial?.outcomes ?? []).join("\n"));
  const [clientId, setClientId] = useState(initial?.client_id ?? "");
  const [cover, setCover] = useState(initial?.cover_path ?? "");
  const [video, setVideo] = useState(initial?.video_url ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [published, setPublished] = useState(Boolean(initial?.published_at));
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setErr(null);
    const supabase = createClient();
    const row = {
      title,
      slug: slug || slugify(title),
      summary,
      body,
      industry: industry || null,
      services: services.split(",").map((s) => s.trim()).filter(Boolean),
      outcomes: outcomes.split("\n").map((s) => s.trim()).filter(Boolean),
      client_id: clientId || null,
      cover_path: cover || null,
      video_url: video || null,
      featured,
      published_at: published ? initial?.published_at || new Date().toISOString() : null,
    };
    const q = initial
      ? supabase.from("case_studies").update(row).eq("id", initial.id)
      : supabase.from("case_studies").insert(row);
    const { error } = await q;
    setBusy(false);
    if (error) return setErr(error.message);
    if (published) {
      await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "work",
          title,
          url: `${company.domain}/work/${row.slug}`,
          excerpt: summary,
        }),
      });
    }
    router.push("/admin/work");
    router.refresh();
  }

  return (
    <div className="max-w-3xl space-y-4">
      <Field label="Title">
        <input className={inputClass} value={title} onChange={(e) => {
          setTitle(e.target.value);
          if (!initial) setSlug(slugify(e.target.value));
        }} />
      </Field>
      <Field label="Slug">
        <input className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} />
      </Field>
      <Field label="Client">
        <select className={inputClass} value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <option value="">None</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Industry">
        <input className={inputClass} value={industry} onChange={(e) => setIndustry(e.target.value)} />
      </Field>
      <Field label="Summary">
        <textarea className={inputClass} rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
      </Field>
      <Field label="Story" hint="Plain text. Line breaks are kept on the public page.">
        <textarea className={inputClass} rows={10} value={body} onChange={(e) => setBody(e.target.value)} />
      </Field>
      <Field label="Services" hint="Comma-separated">
        <input className={inputClass} value={services} onChange={(e) => setServices(e.target.value)} />
      </Field>
      <Field label="Outcomes" hint="One per line">
        <textarea className={inputClass} rows={4} value={outcomes} onChange={(e) => setOutcomes(e.target.value)} />
      </Field>
      <FileField label="Cover image" folder="work" value={cover} onChange={setCover} accept="image/*" />
      <Field label="Video URL">
        <input className={inputClass} value={video} onChange={(e) => setVideo(e.target.value)} placeholder="YouTube or Vimeo" />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
        Feature on home and Founders
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Published
      </label>
      {err && <p className="text-sm text-brand-600">{err}</p>}
      <AdminBtn variant="ink" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</AdminBtn>
    </div>
  );
}
