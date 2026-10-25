"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { inputClass } from "@/components/admin/ui";

export function FileField({
  label,
  folder,
  bucket = "public-media",
  accept,
  value,
  onChange,
}: {
  label: string;
  folder: string;
  bucket?: "public-media" | "product-files";
  accept?: string;
  value: string;
  onChange: (path: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setErr(null);
    const supabase = createClient();
    const path = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
    setBusy(false);
    if (error) {
      setErr(error.message);
      return;
    }
    onChange(path);
    if (bucket === "public-media") {
      await supabase.from("media").insert({
        storage_path: path,
        bucket,
        alt: file.name,
        kind: file.type.startsWith("video") ? "video" : file.type.startsWith("image") ? "image" : "file",
      });
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-medium text-ink-900">{label}</span>
      <input
        type="file"
        accept={accept}
        disabled={busy}
        className={inputClass}
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {value ? <p className="mt-1 truncate text-xs text-muted">{value}</p> : null}
      {busy ? <p className="mt-1 text-xs text-muted">Uploading…</p> : null}
      {err ? <p className="mt-1 text-xs text-brand-600">{err}</p> : null}
    </div>
  );
}
