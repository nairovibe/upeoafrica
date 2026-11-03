"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Film, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { inputClass } from "@/components/admin/ui";
import { Modal } from "@/components/admin/studio/controls";
import { Thumb } from "@/components/admin/studio/Thumb";
import { fileName } from "@/components/admin/studio/format";
import { publicMediaUrl } from "@/lib/constants";
import type { MediaItem } from "@/lib/cms";
import { cn } from "@/lib/utils";

const CACHE_MS = 5 * 60 * 1000;
const cache = new Map<string, { at: number; items: MediaItem[] }>();

/** Drop cached library listings after an upload or delete so the next picker open refetches. */
export function invalidateMediaCache() {
  cache.clear();
}

export function MediaPicker({
  open,
  onClose,
  onPick,
  kind,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (item: MediaItem) => void;
  kind?: MediaItem["kind"];
}) {
  return (
    <Modal open={open} onClose={onClose} title="Choose from library" wide>
      {open ? <PickerGrid kind={kind} onPick={(item) => {
            onPick(item);
            onClose();
          }}
        /> : null}
    </Modal>
  );
}

function PickerGrid({ kind, onPick }: { kind?: MediaItem["kind"]; onPick: (item: MediaItem) => void }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const key = kind ?? "all";
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_MS) {
      queueMicrotask(() => setItems(hit.items));
      return;
    }
    let cancelled = false;
    let q = createClient()
      .from("media")
      .select("*")
      .eq("bucket", "public-media")
      .order("created_at", { ascending: false })
      .limit(300);
    if (kind) q = q.eq("kind", kind);
    q.then(({ data, error }) => {
      if (cancelled) return;
      if (error) setError(error.message);
      else cache.set(key, { at: Date.now(), items: data ?? [] });
      setItems(data ?? []);
    });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!items || !needle) return items ?? [];
    return items.filter((m) => m.alt.toLowerCase().includes(needle) || m.storage_path.toLowerCase().includes(needle));
  }, [items, query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          className={cn(inputClass, "pl-9")}
          placeholder="Search by alt text or file name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {items === null ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-[5px] bg-surface-2" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">{items.length === 0 ? "The library is empty." : "No matches."}</p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {visible.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onPick(m)}
              className="group text-left focus:outline-none"
            >
              <Thumb
                src={m.kind === "image" ? publicMediaUrl(m.storage_path) : null}
                alt={m.alt}
                icon={m.kind === "video" ? Film : FileText}
                className="aspect-square w-full transition-colors group-hover:border-brand-400 group-focus-visible:border-brand-500"
              />
              <span className="mt-1 block truncate text-xs text-body">{m.alt || fileName(m.storage_path)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
