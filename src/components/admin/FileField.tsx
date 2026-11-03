"use client";

import { useRef, useState } from "react";
import { FileText, FolderOpen, Upload, X } from "lucide-react";
import { Spinner } from "@/components/admin/pending";
import { MediaPicker } from "@/components/admin/studio/MediaPicker";
import { Thumb } from "@/components/admin/studio/Thumb";
import { fileName } from "@/components/admin/studio/format";
import { uploadFile, type Bucket } from "@/components/admin/studio/upload";
import { publicMediaUrl } from "@/lib/constants";
import { cn } from "@/lib/utils";

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)$/i;

function pickerKind(accept?: string) {
  if (!accept) return undefined;
  const parts = accept.split(",").map((s) => s.trim());
  if (parts.every((p) => p.startsWith("image/"))) return "image" as const;
  if (parts.every((p) => p.startsWith("video/"))) return "video" as const;
  return undefined;
}

export function FileField({
  label,
  folder,
  bucket = "public-media",
  accept,
  value,
  onChange,
  hint,
  library = true,
  disabled,
}: {
  label: string;
  folder: string;
  bucket?: Bucket;
  accept?: string;
  value: string;
  onChange: (path: string) => void;
  hint?: string;
  library?: boolean;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [over, setOver] = useState(false);

  const isPublic = bucket === "public-media";
  const preview = isPublic && value && (IMAGE_EXT.test(value) || value.startsWith("http")) ? publicMediaUrl(value) : null;
  const busy = progress !== null;

  async function onFile(file: File | undefined) {
    if (!file || busy) return;
    setErr(null);
    setProgress(0);
    try {
      const { path } = await uploadFile({ file, folder, bucket, onProgress: setProgress });
      onChange(path);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-medium text-ink-900">{label}</span>
      <div
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          if (!disabled) onFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "rounded-[5px] border bg-white p-2.5 transition-colors",
          over ? "border-brand-500 bg-brand-50" : "border-line",
        )}
      >
        {value ? (
          <div className="mb-2.5 flex items-center gap-3">
            <Thumb src={preview} icon={FileText} className="h-12 w-16" />
            <span className="min-w-0 flex-1 truncate text-xs text-body" title={value}>
              {fileName(value)}
            </span>
            {!disabled ? (
              <button
                type="button"
                onClick={() => onChange("")}
                aria-label={`Remove ${label.toLowerCase()}`}
                className="rounded-[5px] p-1 text-muted hover:bg-surface-3 hover:text-ink-900"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={input}
            type="file"
            accept={accept}
            disabled={busy || disabled}
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={busy || disabled}
            aria-busy={busy || undefined}
            onClick={() => input.current?.click()}
            className="inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-line bg-white px-2.5 text-[12px] font-medium text-ink-900 hover:bg-surface-3 disabled:opacity-50"
          >
            {busy ? <Spinner /> : <Upload className="h-3.5 w-3.5" />}
            {busy ? "Uploading..." : value ? "Replace" : "Upload"}
          </button>
          {isPublic && library ? (
            <button
              type="button"
              disabled={busy || disabled}
              onClick={() => setPicking(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-line bg-white px-2.5 text-[12px] font-medium text-ink-900 hover:bg-surface-3 disabled:opacity-50"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              Choose from library
            </button>
          ) : null}
          {progress !== null ? (
            <span className="flex min-w-24 flex-1 items-center gap-2">
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
                <span className="block h-full bg-brand-500 transition-[width]" style={{ width: `${Math.round(progress * 100)}%` }} />
              </span>
              <span className="text-xs tabular-nums text-muted">{Math.round(progress * 100)}%</span>
            </span>
          ) : null}
        </div>
      </div>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
      {err ? <p className="mt-1 text-xs text-red-600">{err}</p> : null}
      {isPublic && library ? (
        <MediaPicker
          open={picking}
          onClose={() => setPicking(false)}
          kind={pickerKind(accept)}
          onPick={(item) => onChange(item.storage_path)}
        />
      ) : null}
    </div>
  );
}
