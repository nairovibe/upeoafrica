"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { LivePreview } from "@/components/work/LivePreview";

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function WorkDemo({ url, title }: { url: string; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const node = box.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setOn(true);
      },
      { rootMargin: "160px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={box} className="overflow-hidden rounded-[5px] border border-line bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <p className="min-w-0 truncate text-sm text-muted">{hostOf(url)}</p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-brand-600 hover:underline"
        >
          Open the site
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      </div>
      <div className="relative aspect-[16/10] bg-surface-3">{on ? <LivePreview url={url} label={`${title} preview`} /> : null}</div>
    </div>
  );
}
