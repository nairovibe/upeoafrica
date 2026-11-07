"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CornerDownLeft, Plus, Search, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, SHORTCUTS } from "@/components/admin/shell/nav";
import { startNavProgress } from "@/components/ui/NavProgress";

type Entry = { key: string; href: string; title: string; hint: string; icon?: LucideIcon; external?: boolean };
type SearchHit = { href: string; title: string; hint: string };

const ACTIONS: Entry[] = SHORTCUTS.filter((s) => s.create || s.external).map((s) => ({
  key: `action:${s.id}`,
  href: s.href,
  title: s.create ? `New ${s.title.toLowerCase()}` : s.subtitle,
  hint: s.create ? "Create" : "Website",
  icon: s.create ? Plus : s.icon,
  external: s.external,
}));

const PAGES: Entry[] = NAV_ITEMS.map((item) => ({
  key: `page:${item.href}`,
  href: item.href,
  title: item.label,
  hint: item.group,
  icon: item.icon,
}));

function matches(entry: Entry, q: string) {
  return `${entry.title} ${entry.hint}`.toLowerCase().includes(q);
}

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [active, setActive] = useState(0);
  const term = q.trim().toLowerCase();
  const remote = term.length >= 2;

  useEffect(() => {
    if (!remote) return;
    const controller = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        const json = (await res.json()) as { hits?: SearchHit[] };
        setHits(json.hits ?? []);
      } catch {
        if (!controller.signal.aborted) setHits([]);
      }
    }, 160);
    return () => {
      controller.abort();
      window.clearTimeout(t);
    };
  }, [term, remote]);

  const sections = useMemo(() => {
    const records: Entry[] = remote
      ? hits.map((h) => ({ key: `hit:${h.href}`, href: h.href, title: h.title, hint: h.hint }))
      : [];
    const groups = [
      { label: "Quick actions", entries: term ? ACTIONS.filter((e) => matches(e, term)) : ACTIONS },
      { label: "Pages", entries: term ? PAGES.filter((e) => matches(e, term)) : PAGES },
      { label: "Records", entries: records },
    ].filter((s) => s.entries.length > 0);
    return groups.map((group, g) => ({
      ...group,
      start: groups.slice(0, g).reduce((sum, prev) => sum + prev.entries.length, 0),
    }));
  }, [term, remote, hits]);

  const flat = sections.flatMap((s) => s.entries);
  const current = Math.min(active, Math.max(flat.length - 1, 0));

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${current}"]`)?.scrollIntoView({ block: "nearest" });
  }, [current]);

  function open(entry: Entry | undefined) {
    if (!entry) return;
    onClose();
    if (entry.external) window.open(entry.href, "_blank", "noopener");
    else {
      startNavProgress();
      router.push(entry.href);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((current + 1) % Math.max(flat.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((current - 1 + flat.length) % Math.max(flat.length, 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      open(flat[current]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink-950/40 px-4 pt-[12vh]"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-modal="true" aria-label="Search the console" className="w-full max-w-xl overflow-hidden rounded-[5px] border border-line bg-white shadow-[0_24px_48px_-16px_rgba(15,23,42,0.35)]">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          <input
            autoFocus
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-activedescendant={flat.length ? `${listId}-${current}` : undefined}
            aria-autocomplete="list"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search pages, enquiries, invoices, posts"
            className="h-12 w-full bg-transparent text-[14px] text-ink-900 outline-none placeholder:text-muted"
          />
          <kbd className="shrink-0 rounded-[4px] border border-line px-1.5 py-0.5 text-[10px] text-muted">Esc</kbd>
        </div>
        <ul ref={listRef} id={listId} role="listbox" aria-label="Results" className="max-h-[min(420px,60vh)] overflow-y-auto py-2">
          {sections.length === 0 ? (
            <li className="px-4 py-8 text-center text-[13px] text-muted">{remote ? "No matches" : "Type to search"}</li>
          ) : (
            sections.map((section) => (
              <li key={section.label} role="presentation">
                <p className="px-4 pb-1 pt-2 text-[11px] font-medium text-muted">{section.label}</p>
                <ul role="presentation">
                  {section.entries.map((entry, n) => {
                    const i = section.start + n;
                    const selected = i === current;
                    const Icon = entry.icon;
                    return (
                      <li
                        key={entry.key}
                        id={`${listId}-${i}`}
                        data-index={i}
                        role="option"
                        aria-selected={selected}
                        onPointerMove={() => setActive(i)}
                        onClick={() => open(entry)}
                        className={cn(
                          "mx-2 flex min-h-11 cursor-pointer items-center gap-3 rounded-[5px] px-2.5 py-2",
                          selected ? "bg-surface-2" : "",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                            selected ? "bg-brand-50 text-brand-600" : "bg-surface-3 text-ink-900",
                          )}
                        >
                          {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : <Search className="h-3.5 w-3.5" aria-hidden />}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink-900">{entry.title}</span>
                        <span className="shrink-0 text-[12px] text-muted">{entry.hint}</span>
                        {selected ? <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden /> : null}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
