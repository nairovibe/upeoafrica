"use client";

import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const btn =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-[5px] border border-line bg-white text-body transition-colors duration-150 hover:border-brand-300 hover:text-ink-900 disabled:cursor-not-allowed disabled:opacity-40";

export function RowTools({
  index,
  count,
  onMove,
  onRemove,
  removeDisabled,
  removeTitle = "Remove",
}: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
  removeDisabled?: boolean;
  removeTitle?: string;
}) {
  return (
    <div className="flex shrink-0 gap-1">
      <button type="button" className={btn} aria-label="Move up" disabled={index === 0} onClick={() => onMove(index, index - 1)}>
        <ArrowUp className="h-3.5 w-3.5" aria-hidden />
      </button>
      <button
        type="button"
        className={btn}
        aria-label="Move down"
        disabled={index === count - 1}
        onClick={() => onMove(index, index + 1)}
      >
        <ArrowDown className="h-3.5 w-3.5" aria-hidden />
      </button>
      <button
        type="button"
        className={cn(btn, "hover:text-red-600")}
        aria-label={removeTitle}
        title={removeTitle}
        disabled={removeDisabled}
        onClick={onRemove}
      >
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

export function moveItem<T>(list: T[], from: number, to: number) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function newKey() {
  return `k-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}
