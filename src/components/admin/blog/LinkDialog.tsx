"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { services } from "@/lib/services";
import { AdminBtn, Field, inputClass } from "@/components/admin/ui";
import { Modal } from "@/components/admin/blog/Modal";
import { cn } from "@/lib/utils";

export type LinkValue = { href: string; newTab: boolean; nofollow: boolean };

type Target = { type: string; title: string; href: string };

const STATIC_PAGES: Target[] = [
  { type: "Page", title: "Home", href: "/" },
  { type: "Page", title: "Services", href: "/services" },
  ...services.map((s) => ({ type: "Service", title: s.title, href: `/services/${s.slug}` })),
  { type: "Page", title: "Our Work", href: "/work" },
  { type: "Page", title: "Our Process", href: "/process" },
  { type: "Page", title: "Contact", href: "/contact" },
  { type: "Page", title: "Events", href: "/events" },
  { type: "Page", title: "Products", href: "/products" },
  { type: "Page", title: "Blog", href: "/blogs" },
];

export function LinkDialog({
  open,
  initial,
  onClose,
  onApply,
  onRemove,
}: {
  open: boolean;
  initial: LinkValue | null;
  onClose: () => void;
  onApply: (value: LinkValue) => void;
  onRemove: () => void;
}) {
  const isInternal = !initial?.href || initial.href.startsWith("/");
  const [mode, setMode] = useState<"internal" | "external">(isInternal ? "internal" : "external");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Target[]>([]);
  const [url, setUrl] = useState(initial && !isInternal ? initial.href : "https://");
  const [newTab, setNewTab] = useState(initial?.newTab ?? true);
  const [nofollow, setNofollow] = useState(initial?.nofollow ?? false);
  const fetchedTerm = useRef<string | null>(null);

  const staticMatches = useMemo(() => {
    const term = query.trim().toLowerCase();
    return STATIC_PAGES.filter((p) => !term || p.title.toLowerCase().includes(term) || p.href.includes(term));
  }, [query]);

  useEffect(() => {
    if (!open || mode !== "internal") return;
    const term = query.replace(/[,()%*]/g, " ").trim();
    if (term === fetchedTerm.current) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const supabase = createClient();
      const like = `%${term}%`;
      const now = new Date().toISOString();
      const [a, w, p, e] = await Promise.all([
        supabase.from("articles").select("title, slug").is("deleted_at", null).not("published_at", "is", null).lte("published_at", now).ilike("title", like).order("published_at", { ascending: false }).limit(8),
        supabase.from("case_studies").select("title, slug").not("published_at", "is", null).ilike("title", like).limit(6),
        supabase.from("products").select("title, slug").eq("published", true).ilike("title", like).limit(6),
        supabase.from("events").select("title, slug").not("published_at", "is", null).ilike("title", like).order("starts_at", { ascending: false }).limit(6),
      ]);
      if (cancelled) return;
      fetchedTerm.current = term;
      setResults([
        ...(a.data ?? []).map((r) => ({ type: "Article", title: r.title, href: `/blogs/${r.slug}` })),
        ...(w.data ?? []).map((r) => ({ type: "Case study", title: r.title, href: `/work/${r.slug}` })),
        ...(p.data ?? []).map((r) => ({ type: "Product", title: r.title, href: `/products/${r.slug}` })),
        ...(e.data ?? []).map((r) => ({ type: "Event", title: r.title, href: `/events/${r.slug}` })),
      ]);
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [open, mode, query]);

  const all = [...results, ...staticMatches];
  const validUrl = /^(https?:\/\/[^\s.]+\.[^\s]+|mailto:\S+|tel:\S+)$/i.test(url.trim());

  return (
    <Modal
      open={open}
      title={initial?.href ? "Edit link" : "Insert link"}
      onClose={onClose}
      footer={
        <>
          {initial?.href ? (
            <AdminBtn variant="ghost" onClick={onRemove}>Remove link</AdminBtn>
          ) : null}
          {mode === "external" ? (
            <AdminBtn disabled={!validUrl} onClick={() => onApply({ href: url.trim(), newTab, nofollow })}>
              Apply
            </AdminBtn>
          ) : null}
        </>
      }
    >
      <div className="mb-4 flex gap-1">
        {(["internal", "external"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn(
              "rounded-[5px] px-3 py-1.5 text-[12px] font-medium capitalize",
              mode === m ? "bg-ink-900 text-white" : "border border-line text-body hover:border-brand-300",
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === "internal" ? (
        <div>
          <input
            className={inputClass}
            placeholder="Search articles, work, products, events, pages"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <ul className="mt-3 max-h-72 divide-y divide-line overflow-y-auto rounded-[5px] border border-line">
            {all.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted">No matches.</li>
            ) : (
              all.map((r) => (
                <li key={`${r.type}-${r.href}`}>
                  <button
                    type="button"
                    onClick={() => onApply({ href: r.href, newTab: false, nofollow: false })}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-surface-2",
                      initial?.href === r.href && "bg-brand-50",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-ink-900">{r.title}</span>
                      <span className="block truncate text-xs text-muted">{r.href}</span>
                    </span>
                    <span className="shrink-0 text-[11px] font-medium text-muted">{r.type}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : (
        <div className="space-y-3">
          <Field label="URL">
            <input className={inputClass} value={url} onChange={(e) => setUrl(e.target.value)} autoFocus />
          </Field>
          <label className="flex items-center gap-2 text-sm text-ink-900">
            <input type="checkbox" checked={newTab} onChange={(e) => setNewTab(e.target.checked)} className="accent-brand-500" />
            Open in new tab
          </label>
          <label className="flex items-center gap-2 text-sm text-ink-900">
            <input type="checkbox" checked={nofollow} onChange={(e) => setNofollow(e.target.checked)} className="accent-brand-500" />
            Nofollow
          </label>
        </div>
      )}
    </Modal>
  );
}
