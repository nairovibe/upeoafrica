"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, Grid2x2Plus, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/cms";
import { AdminBtn } from "@/components/admin/ui";
import { MAX_SHORTCUTS, SHORTCUTS, resolveShortcuts, type Shortcut } from "@/components/admin/shell/nav";
import { headerIconBtn, popoverPanel, usePopover } from "@/components/admin/shell/usePopover";

export function Shortcuts({
  profile,
  open,
  onToggle,
  onClose,
}: {
  profile: Profile;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const { rootRef, triggerRef } = usePopover(open, onClose);
  const [ids, setIds] = useState<string[]>(() => resolveShortcuts(profile.shortcuts).map((s) => s.id));
  const [error, setError] = useState<string | null>(null);

  async function save(next: string[]) {
    const previous = ids;
    setIds(next);
    setError(null);
    const supabase = createClient();
    const { data, error: saveError } = await supabase
      .from("profiles")
      .update({ shortcuts: next })
      .eq("id", profile.id)
      .select("id");
    if (saveError || !data?.length) {
      setIds(previous);
      setError("Shortcuts did not save. Try again.");
      return false;
    }
    return true;
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setError(null);
          onToggle();
        }}
        aria-label="Shortcuts"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={headerIconBtn}
      >
        <Grid2x2Plus className="h-4 w-4" />
      </button>
      {open ? <ShortcutsPanel ids={ids} error={error} onSave={save} onPick={onClose} /> : null}
    </div>
  );
}

function ShortcutsPanel({
  ids,
  error,
  onSave,
  onPick,
}: {
  ids: string[];
  error: string | null;
  onSave: (ids: string[]) => Promise<boolean>;
  onPick: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<string[]>(ids);
  const shortcuts = resolveShortcuts(ids);

  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
  }, [editing]);

  function startEdit() {
    setDraft(ids);
    setEditing(true);
  }

  function toggle(id: string) {
    setDraft((list) => {
      if (list.includes(id)) return list.filter((x) => x !== id);
      if (list.length >= MAX_SHORTCUTS) return list;
      return SHORTCUTS.map((s) => s.id).filter((x) => x === id || list.includes(x));
    });
  }

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Shortcuts"
      className={cn(popoverPanel, "w-[min(352px,calc(100vw-1.5rem))] overflow-hidden")}
    >
      <div className="flex h-12 items-center justify-between border-b border-line pl-4 pr-2">
        <p className="font-display text-[14px] font-semibold text-ink-900">{editing ? "Edit shortcuts" : "Shortcuts"}</p>
        {editing ? (
          <span className="pr-2 font-display text-[12px] tabular-nums text-muted">
            {draft.length} of {MAX_SHORTCUTS}
          </span>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            aria-label="Edit shortcuts"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[5px] text-ink-900 hover:bg-surface-3 focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {editing ? (
        <>
          <ul className="max-h-[min(420px,60vh)] overflow-y-auto py-1">
            {SHORTCUTS.map((s, i) => {
              const checked = draft.includes(s.id);
              const Icon = s.icon;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={checked}
                    disabled={!checked && draft.length >= MAX_SHORTCUTS}
                    data-autofocus={i === 0 ? "" : undefined}
                    onClick={() => toggle(s.id)}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-left hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-3 text-ink-900">
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium text-ink-900">{s.title}</span>
                      <span className="block truncate text-[12px] text-muted">{s.subtitle}</span>
                    </span>
                    <span
                      className={cn(
                        "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border",
                        checked ? "border-brand-500 bg-brand-500 text-white" : "border-line bg-white",
                      )}
                    >
                      {checked ? <Check className="h-3 w-3" strokeWidth={3} aria-hidden /> : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-end gap-2 border-t border-line px-4 py-3">
            <AdminBtn variant="ghost" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </AdminBtn>
            <AdminBtn
              disabled={draft.length === 0}
              pending={saving}
              onClick={async () => {
                setSaving(true);
                const ok = await onSave(draft);
                setSaving(false);
                if (ok) setEditing(false);
              }}
            >
              {saving ? "Saving..." : "Save"}
            </AdminBtn>
          </div>
        </>
      ) : (
        <div className="-mb-px grid grid-cols-2">
          {shortcuts.map((s, i) => (
            <ShortcutTile key={s.id} shortcut={s} first={i === 0} onPick={onPick} />
          ))}
        </div>
      )}

      {error ? (
        <p role="alert" className="border-t border-line px-4 py-2.5 text-[12px] text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ShortcutTile({ shortcut, first, onPick }: { shortcut: Shortcut; first: boolean; onPick: () => void }) {
  const Icon = shortcut.icon;
  return (
    <Link
      href={shortcut.href}
      target={shortcut.external ? "_blank" : undefined}
      rel={shortcut.external ? "noreferrer" : undefined}
      onClick={onPick}
      data-autofocus={first ? "" : undefined}
      className="group flex flex-col items-center border-b border-line px-3 py-5 text-center transition-colors odd:border-r hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-3 text-ink-900 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600 group-focus-visible:bg-brand-50 group-focus-visible:text-brand-600">
        <Icon className="h-[18px] w-[18px]" aria-hidden />
      </span>
      <span className="mt-2.5 text-[13px] font-medium text-ink-900">{shortcut.title}</span>
      <span className="mt-0.5 text-[12px] text-muted">{shortcut.subtitle}</span>
    </Link>
  );
}
