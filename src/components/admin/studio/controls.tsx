"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Spinner } from "@/components/admin/pending";
import { cn } from "@/lib/utils";

export function Switch({
  checked,
  onClick,
  label,
  disabled,
}: {
  checked: boolean;
  onClick: () => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      dir="ltr"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative block h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-150 disabled:cursor-not-allowed",
        checked ? "bg-brand-500" : "bg-surface-3 ring-1 ring-inset ring-line",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-[left] duration-150",
          checked ? "left-[18px]" : "left-0.5",
        )}
      />
    </button>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label className={cn("flex items-center justify-between gap-3 text-sm text-ink-900", disabled ? "opacity-60" : "cursor-pointer")}>
      <span>{label}</span>
      <Switch checked={checked} label={label} disabled={disabled} onClick={() => onChange(!checked)} />
    </label>
  );
}

function useOverlay(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useOverlay(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-ink-950/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex max-h-[85vh] w-full flex-col rounded-[5px] border border-line bg-white shadow-xl",
          wide ? "max-w-4xl" : "max-w-md",
        )}
      >
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 className="font-display text-[15px] font-semibold text-ink-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-[5px] p-1 text-muted hover:bg-surface-3 hover:text-ink-900">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
        {footer ? <footer className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</footer> : null}
      </div>
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useOverlay(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70]">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-ink-950/30" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-white shadow-xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 className="truncate font-display text-[15px] font-semibold text-ink-900">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-[5px] p-1 text-muted hover:bg-surface-3 hover:text-ink-900">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
        {footer ? <footer className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">{footer}</footer> : null}
      </aside>
    </div>
  );
}

export function DangerBtn({
  children,
  onClick,
  disabled,
  pending,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  pending?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      className={cn(
        "inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-[5px] border border-red-200 bg-white px-3.5 text-[13px] font-medium text-red-700 transition-colors duration-200 hover:bg-red-50 disabled:pointer-events-none disabled:opacity-50",
        pending && "cursor-wait opacity-80",
      )}
    >
      {pending ? <Spinner /> : null}
      {children}
    </button>
  );
}

export function Notice({ tone = "error", children }: { tone?: "error" | "ok"; children: React.ReactNode }) {
  return (
    <p role={tone === "error" ? "alert" : "status"} className={cn("text-[13px]", tone === "error" ? "text-red-600" : "text-emerald-700")}>
      {children}
    </p>
  );
}
