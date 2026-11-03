"use client";

import { useId, useState } from "react";
import { FileArchive, ImageIcon, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { publicMediaUrl } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function UploadField({
  folder,
  bucket,
  accept,
  value,
  onChange,
  emptyLabel,
}: {
  folder: string;
  bucket: "public-media" | "product-files";
  accept?: string;
  value: string;
  onChange: (path: string) => void;
  emptyLabel: string;
}) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const isImage = bucket === "public-media";
  const preview = isImage ? publicMediaUrl(value) : null;
  const fileName = value ? value.split("/").pop()?.replace(/^\d+-/, "") : "";

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setErr(null);
    const supabase = createClient();
    const path = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
    setBusy(false);
    if (error) return setErr(error.message);
    onChange(path);
    if (isImage) {
      await supabase.from("media").insert({ storage_path: path, bucket, alt: file.name, kind: "image" });
    }
  }

  return (
    <div>
      {isImage ? (
        <div className="mb-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[5px] border border-line bg-surface-2">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted" aria-hidden />
          )}
        </div>
      ) : (
        <div className="mb-3 flex items-center gap-3 rounded-[5px] border border-line bg-surface-2 px-3 py-2.5">
          <FileArchive className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          <span className={cn("truncate text-[13px]", value ? "text-ink-900" : "text-muted")}>
            {fileName || emptyLabel}
          </span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <label
          htmlFor={inputId}
          className={cn(
            "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[5px] border border-line bg-white px-3 text-[13px] font-medium text-ink-900 hover:bg-surface-3",
            busy && "pointer-events-none opacity-50",
          )}
        >
          <Upload className="h-3.5 w-3.5" aria-hidden />
          {busy ? "Uploading..." : value ? "Replace" : "Upload"}
        </label>
        <input
          id={inputId}
          type="file"
          accept={accept}
          disabled={busy}
          className="sr-only"
          onChange={(e) => {
            onFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {value && !busy ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="cursor-pointer text-[13px] font-medium text-muted hover:text-red-600"
          >
            Remove
          </button>
        ) : null}
      </div>
      {err ? <p className="mt-2 text-xs text-red-600">{err}</p> : null}
    </div>
  );
}
