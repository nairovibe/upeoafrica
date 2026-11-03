"use client";

import { X } from "lucide-react";
import { FileField } from "@/components/admin/FileField";
import { publicMediaUrl } from "@/lib/constants";

export function GalleryField({ value, onChange }: { value: string[]; onChange: (paths: string[]) => void }) {
  return (
    <div>
      <FileField label="Gallery" folder="events/gallery" accept="image/*" value="" onChange={(p) => onChange([...value, p])} />
      {value.length > 0 ? (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((path) => {
            const src = publicMediaUrl(path);
            return (
              <li key={path} className="group relative aspect-[4/3] overflow-hidden rounded-[5px] border border-line bg-surface-2">
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="" className="h-full w-full object-cover" />
                ) : null}
                <button
                  type="button"
                  aria-label="Remove photo"
                  onClick={() => onChange(value.filter((p) => p !== path))}
                  className="absolute right-1 top-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-[5px] bg-white/90 text-ink-900 hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
