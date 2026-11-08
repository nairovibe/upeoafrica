"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return (
      <div className="flex aspect-[4/3] items-end border border-line bg-surface-2 p-6">
        <p className="font-display text-lg font-semibold text-ink-900">{title}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-[4/3] overflow-hidden border border-line bg-surface-2">
        {/* Supabase covers are served directly. The image optimizer rejects some of these files. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt={title} className="h-full w-full object-contain" />
      </div>
      {images.length > 1 ? (
        <ul className="mt-3 flex gap-3 overflow-x-auto" aria-label="Product images">
          {images.map((src, index) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                aria-label={`Show image ${index + 1}`}
                aria-current={index === active ? "true" : undefined}
                onClick={() => setActive(index)}
                className={cn(
                  "h-16 w-20 cursor-pointer overflow-hidden border bg-surface-2",
                  index === active ? "border-brand-500" : "border-line hover:border-brand-300",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
