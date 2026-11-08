"use client";

import { useState } from "react";
import { pluginSheet } from "@/components/products/pluginSheet";
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
  const sheet = pluginSheet(infoHtml);

  return (
    <div className="mt-16 border-t border-line pt-8">
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
            {infoHtml.trim() ? <FeatureSheet intro={sheet.intro} groups={sheet.groups} raw={infoHtml} /> : <p className="text-body">No product info yet.</p>}
          </div>
        ) : null}
        {tab === "changelog" ? (
          <div role="tabpanel" id="product-panel-changelog" aria-labelledby="product-tab-changelog">
            {changelogHtml.trim() ? (
              <div className="release-notes max-w-3xl border border-line p-6" dangerouslySetInnerHTML={{ __html: changelogHtml }} />
            ) : (
              <p className="text-body">No changelog for this release yet.</p>
            )}
          </div>
        ) : null}
        {tab === "screenshots" ? (
          <div role="tabpanel" id="product-panel-screenshots" aria-labelledby="product-tab-screenshots">
            {screenshots.length ? (
              <ul className="grid gap-4 sm:grid-cols-2">
                {screenshots.map((src, index) => (
                  <li key={src} className="overflow-hidden border border-line bg-white">
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

function FeatureSheet({
  intro,
  groups,
  raw,
}: {
  intro: string;
  groups: ReturnType<typeof pluginSheet>["groups"];
  raw: string;
}) {
  if (!groups.length) {
    return <div className="plugin-sheet max-w-3xl" dangerouslySetInnerHTML={{ __html: raw }} />;
  }
  return (
    <div className="space-y-10">
      {intro ? <div className="plugin-sheet max-w-3xl" dangerouslySetInnerHTML={{ __html: intro }} /> : null}
      {groups.map((group) => (
        <section key={group.title ?? "features"}>
          {group.title ? <h2 className="font-display text-xl font-semibold text-ink-900">{group.title}</h2> : null}
          {group.html ? <div className="plugin-sheet mt-3 max-w-3xl" dangerouslySetInnerHTML={{ __html: group.html }} /> : null}
          {group.cards.length ? (
            <ul className={cnGrid(Boolean(group.title || group.html))}>
              {group.cards.map((card) => (
                <li key={card.title} className="border border-line bg-white p-5">
                  <h3 className="font-display text-base font-semibold text-ink-900">{card.title}</h3>
                  {card.html ? <div className="plugin-sheet mt-3" dangerouslySetInnerHTML={{ __html: card.html }} /> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </div>
  );
}

function cnGrid(spaced: boolean) {
  return spaced ? "mt-5 grid gap-4 sm:grid-cols-2" : "grid gap-4 sm:grid-cols-2";
}
