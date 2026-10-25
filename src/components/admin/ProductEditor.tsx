"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminBtn, Field, inputClass } from "@/components/admin/ui";
import { FileField } from "@/components/admin/FileField";
import { createClient } from "@/lib/supabase/client";
import { PRODUCT_TYPES, slugify } from "@/lib/constants";
import { company } from "@/lib/content";
import type { Product } from "@/lib/cms";

export function ProductEditor({ initial }: { initial?: Product }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [type, setType] = useState(initial?.type ?? "plugin");
  const [price, setPrice] = useState(String(initial?.price_kes ?? 0));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [version, setVersion] = useState(initial?.version ?? "");
  const [changelog, setChangelog] = useState(initial?.changelog ?? "");
  const [cover, setCover] = useState(initial?.cover_path ?? "");
  const [filePath, setFilePath] = useState(initial?.file_path ?? "");
  const [published, setPublished] = useState(initial?.published ?? false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setErr(null);
    const supabase = createClient();
    const row = {
      title,
      slug: slug || slugify(title),
      type,
      price_kes: Number(price) || 0,
      description,
      version: version || null,
      changelog: changelog || null,
      cover_path: cover || null,
      file_path: filePath || null,
      published,
    };
    const q = initial
      ? supabase.from("products").update(row).eq("id", initial.id)
      : supabase.from("products").insert(row);
    const { error } = await q;
    setBusy(false);
    if (error) return setErr(error.message);
    if (published) {
      await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "product",
          title,
          url: `${company.domain}/products/${row.slug}`,
          excerpt: description.slice(0, 180),
        }),
      });
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="max-w-3xl space-y-4">
      <Field label="Name">
        <input className={inputClass} value={title} onChange={(e) => {
          setTitle(e.target.value);
          if (!initial) setSlug(slugify(e.target.value));
        }} />
      </Field>
      <Field label="Slug">
        <input className={inputClass} value={slug} onChange={(e) => setSlug(e.target.value)} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type">
          <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </Field>
        <Field label="Price (KES)" hint="0 means listed, not sold yet">
          <input className={inputClass} type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} />
        </Field>
      </div>
      <Field label="Version">
        <input className={inputClass} value={version} onChange={(e) => setVersion(e.target.value)} />
      </Field>
      <Field label="Description">
        <textarea className={inputClass} rows={6} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Field label="Changelog">
        <textarea className={inputClass} rows={4} value={changelog} onChange={(e) => setChangelog(e.target.value)} />
      </Field>
      <FileField label="Cover" folder="products" value={cover} onChange={setCover} accept="image/*" />
      <FileField label="Plugin / file" folder="plugins" bucket="product-files" value={filePath} onChange={setFilePath} accept=".zip,.rar,.7z,.pdf" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
        Published on /products
      </label>
      {err && <p className="text-sm text-brand-600">{err}</p>}
      <AdminBtn variant="ink" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</AdminBtn>
    </div>
  );
}
