"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminBtn, Field, inputClass } from "@/components/admin/ui";
import { FileField } from "@/components/admin/FileField";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/constants";
import { company } from "@/lib/content";
import type { Article } from "@/lib/cms";

export function ArticleEditor({ initial }: { initial?: Article }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [audience, setAudience] = useState(initial?.audience ?? "general");
  const [cover, setCover] = useState(initial?.cover_path ?? "");
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
      excerpt,
      body,
      tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
      audience,
      cover_path: cover || null,
      published_at: published ? initial?.published_at || new Date().toISOString() : null,
    };
    const q = initial
      ? supabase.from("articles").update(row).eq("id", initial.id)
      : supabase.from("articles").insert(row);
    const { error } = await q;
    setBusy(false);
    if (error) return setErr(error.message);
    if (published) {
      await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "article",
          title,
          url: `${company.domain}/blogs/${row.slug}`,
          excerpt,
        }),
      });
    }
    router.push("/admin/insights");
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
      <Field label="Audience">
        <select className={inputClass} value={audience} onChange={(e) => setAudience(e.target.value)}>
          <option value="general">General</option>
          <option value="founders">Founders</option>
        </select>
      </Field>
      <Field label="Excerpt">
        <textarea className={inputClass} rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      </Field>
      <Field label="Body">
        <textarea className={inputClass} rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
      </Field>
      <Field label="Tags" hint="Comma-separated">
        <input className={inputClass} value={tags} onChange={(e) => setTags(e.target.value)} />
      </Field>
      <FileField label="Cover" folder="insights" value={cover} onChange={setCover} accept="image/*" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Published (fires the social webhook if one is set)
      </label>
      {err && <p className="text-sm text-brand-600">{err}</p>}
      <AdminBtn variant="ink" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</AdminBtn>
    </div>
  );
}
