"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { publicMediaUrl } from "@/lib/constants";
import { MediaPicker } from "@/components/admin/blog/MediaPicker";

export function ImageSlot({
  label,
  value,
  onChange,
  aspect = "aspect-[16/9]",
}: {
  label: string;
  value: string;
  onChange: (path: string) => void;
  aspect?: string;
}) {
  const [open, setOpen] = useState(false);
  const url = publicMediaUrl(value);
  return (
    <div>
      <span className="mb-1.5 block text-[13px] font-medium text-ink-900">{label}</span>
      {url ? (
        <div className="overflow-hidden rounded-[5px] border border-line">
          <img src={url} alt="" className={`${aspect} w-full bg-surface-3 object-cover`} />
          <div className="flex justify-between border-t border-line px-3 py-1.5 text-xs">
            <button type="button" onClick={() => setOpen(true)} className="font-medium text-brand-600 hover:underline">
              Replace
            </button>
            <button type="button" onClick={() => onChange("")} className="text-muted hover:text-red-600">
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${aspect} flex w-full flex-col items-center justify-center gap-1 rounded-[5px] border border-dashed border-line text-xs text-muted hover:border-brand-300 hover:text-brand-600`}
        >
          <ImagePlus className="h-5 w-5" />
          Choose image
        </button>
      )}
      <MediaPicker
        open={open}
        title={label}
        onClose={() => setOpen(false)}
        onPick={(items) => {
          setOpen(false);
          if (items[0]) onChange(items[0].path);
        }}
      />
    </div>
  );
}
