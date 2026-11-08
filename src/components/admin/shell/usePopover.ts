"use client";

import { useEffect, useRef } from "react";

export type PopoverId = "shortcuts" | "notices" | "account";

export function usePopover(open: boolean, onClose: () => void) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      onClose();
      triggerRef.current?.focus();
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return { rootRef, triggerRef };
}

const popoverFrame =
  "z-30 mt-2 rounded-[5px] border border-line bg-white shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)] max-sm:fixed max-sm:inset-x-3 max-sm:top-16 max-sm:w-auto sm:absolute sm:top-full";

export const popoverPanel = `${popoverFrame} sm:right-0`;

export const popoverPanelStart = `${popoverFrame} sm:left-0`;

export const headerIconBtn =
  "relative inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-[5px] text-ink-900 transition-colors hover:bg-surface-3 focus-visible:outline-2 focus-visible:outline-brand-500 aria-expanded:bg-surface-3";
