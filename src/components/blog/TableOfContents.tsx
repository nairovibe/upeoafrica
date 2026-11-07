"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type TocEntry = { id: string; text: string; level: 2 | 3 };

export function TableOfContents({ items }: { items: TocEntry[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((el): el is HTMLElement => Boolean(el));
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -60% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  const list = <TocList items={items} active={active} />;

  return (
    <>
      <details className="rounded-[5px] border border-line bg-surface-2 lg:hidden">
        <summary className="cursor-pointer list-none px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-900 [&::-webkit-details-marker]:hidden">
          On this page
        </summary>
        <div className="border-t border-line px-4 py-3">{list}</div>
      </details>
      <nav className="hidden lg:block" aria-label="On this page">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">On this page</p>
        <div className="mt-4">{list}</div>
      </nav>
    </>
  );
}

function TocList({ items, active }: { items: TocEntry[]; active: string | null }) {
  return (
    <ol className="space-y-1 border-l border-line">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className={cn(
              "-ml-px block border-l-2 py-1.5 text-[13px] leading-snug transition-colors",
              item.level === 3 ? "pl-6" : "pl-3",
              active === item.id ? "border-brand-500 font-medium text-brand-600" : "border-transparent text-body hover:text-ink-900",
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );
}
