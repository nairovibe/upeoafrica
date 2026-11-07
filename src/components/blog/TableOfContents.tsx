"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type TocEntry = { id: string; text: string; level: 2 | 3 };

export function TableOfContents({ items }: { items: TocEntry[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="On this page" className="my-8 rounded-[5px] border border-line bg-surface-2 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">On this page</p>
      <ol className="mt-3 grid gap-x-8 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "block border-l-2 py-1.5 text-[13px] leading-snug transition-colors",
                item.level === 3 ? "pl-4" : "pl-3",
                active === item.id ? "border-brand-500 font-medium text-brand-600" : "border-transparent text-body hover:text-ink-900",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
