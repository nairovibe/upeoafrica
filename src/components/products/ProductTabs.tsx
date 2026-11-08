"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "info", label: "Product info" },
  { id: "changelog", label: "Changelog" },
  { id: "screenshots", label: "Screenshots" },
] as const;

export function ProductTabs({
  infoHtml,
  changelogHtml,
  screenshots,
  title,
}: {
  infoHtml: string;
  changelogHtml: string;
  screenshots: string[];
  title: string;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("info");

  return (
    <div className="border-t border-line">
      <div role="tablist" aria-label="Product details" className="flex gap-6 overflow-x-auto border-b border-line">
        {TABS.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`product-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`product-panel-${item.id}`}
              onClick={() => setTab(item.id)}
              className={cn(
                "inline-flex h-11 shrink-0 cursor-pointer items-center border-b-2 text-sm font-medium",
                selected ? "border-brand-500 text-ink-900" : "border-transparent text-muted hover:text-ink-900",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="pt-8">
        {tab === "info" ? (
          <div role="tabpanel" id="product-panel-info" aria-labelledby="product-tab-info">
            {infoHtml.trim() ? <ExpandableCopy html={infoHtml} prose="plugin-sheet" /> : <p className="text-body">No product info yet.</p>}
          </div>
        ) : null}
        {tab === "changelog" ? (
          <div role="tabpanel" id="product-panel-changelog" aria-labelledby="product-tab-changelog">
            {changelogHtml.trim() ? <ExpandableCopy html={changelogHtml} prose="release-notes" /> : <p className="text-body">No changelog for this release yet.</p>}
          </div>
        ) : null}
        {tab === "screenshots" ? (
          <div role="tabpanel" id="product-panel-screenshots" aria-labelledby="product-tab-screenshots">
            {screenshots.length ? (
              <ul className="grid gap-8 sm:grid-cols-2">
                {screenshots.map((src, index) => (
                  <li key={src}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt={`${title} screenshot ${index + 1}`} className="h-auto w-full" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body">No screenshots yet.</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ExpandableCopy({ html, prose }: { html: string; prose: "plugin-sheet" | "release-notes" }) {
  const copyRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(true);
  const clamped = !open && overflows;

  useLayoutEffect(() => {
    const node = copyRef.current;
    if (!node) return;
    setOverflows(node.scrollHeight > node.clientHeight + 12);
  }, [html, open]);

  return (
    <div>
      <div className="relative max-w-3xl">
        <div
          ref={copyRef}
          className={cn(prose, clamped && "max-h-[22rem] overflow-hidden")}
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {clamped ? <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent" aria-hidden /> : null}
      </div>
      {clamped ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-5 inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-brand-600 transition-colors duration-200 hover:text-brand-700"
        >
          View all
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
