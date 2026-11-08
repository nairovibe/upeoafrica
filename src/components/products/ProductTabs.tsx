"use client";

import { useState } from "react";
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
    <div className="mt-16 border-t border-line pt-8">
      <div role="tablist" aria-label="Product details" className="flex gap-6 border-b border-line">
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
                "cursor-pointer border-b-2 pb-3 text-sm font-medium",
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
          <div role="tabpanel" id="product-panel-info" aria-labelledby="product-tab-info" className="max-w-3xl">
            {infoHtml.trim() ? <div className="article-body" dangerouslySetInnerHTML={{ __html: infoHtml }} /> : <p className="text-body">No product info yet.</p>}
          </div>
        ) : null}
        {tab === "changelog" ? (
          <div role="tabpanel" id="product-panel-changelog" aria-labelledby="product-tab-changelog" className="max-w-3xl">
            {changelogHtml.trim() ? <div className="article-body" dangerouslySetInnerHTML={{ __html: changelogHtml }} /> : <p className="text-body">No changelog for this release yet.</p>}
          </div>
        ) : null}
        {tab === "screenshots" ? (
          <div role="tabpanel" id="product-panel-screenshots" aria-labelledby="product-tab-screenshots">
            {screenshots.length ? (
              <ul className="grid gap-4 sm:grid-cols-2">
                {screenshots.map((src, index) => (
                  <li key={src} className="overflow-hidden border border-line bg-surface-2">
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
