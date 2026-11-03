"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Check, FolderOpen, Plus, Upload, X } from "lucide-react";
import { inputClass } from "@/components/admin/ui";
import { Spinner } from "@/components/admin/pending";
import { MediaPicker } from "@/components/admin/studio/MediaPicker";
import { Thumb } from "@/components/admin/studio/Thumb";
import { uploadFile } from "@/components/admin/studio/upload";
import { publicMediaUrl } from "@/lib/constants";
import { cn } from "@/lib/utils";

const smallBtn =
  "inline-flex h-8 items-center gap-1.5 rounded-[5px] border border-line bg-white px-2.5 text-[12px] font-medium text-ink-900 hover:bg-surface-3 disabled:opacity-50";

export function ChipSelect({
  options,
  value,
  onChange,
  disabled,
}: {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}) {
  const extra = value.filter((v) => !options.includes(v));
  return (
    <div className="flex flex-wrap gap-2">
      {[...options, ...extra].map((option) => {
        const on = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            disabled={disabled}
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== option) : [...value, option])}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[5px] border px-2.5 py-1.5 text-[12px] font-medium transition-colors disabled:opacity-60",
              on ? "border-brand-500 bg-brand-50 text-brand-700" : "border-line bg-white text-body hover:border-brand-300",
            )}
          >
            {on ? <Check className="h-3.5 w-3.5" /> : null}
            {option}
          </button>
        );
      })}
    </div>
  );
}

export function ListInput({
  value,
  onChange,
  placeholder,
  addLabel,
  disabled,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel: string;
  disabled?: boolean;
}) {
  const rows = value.length ? value : [""];
  function set(i: number, text: string) {
    const next = [...rows];
    next[i] = text;
    onChange(next);
  }
  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={inputClass}
            value={row}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(e) => set(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onChange([...rows.slice(0, i + 1), "", ...rows.slice(i + 1)]);
              }
            }}
          />
          {!disabled && rows.length > 1 ? (
            <button
              type="button"
              aria-label="Remove"
              onClick={() => onChange(rows.filter((_, j) => j !== i))}
              className="inline-flex w-10 shrink-0 items-center justify-center rounded-[5px] border border-line text-muted hover:bg-surface-3 hover:text-ink-900"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ))}
      {!disabled ? (
        <button type="button" className={smallBtn} onClick={() => onChange([...rows, ""])}>
          <Plus className="h-3.5 w-3.5" />
          {addLabel}
        </button>
      ) : null}
    </div>
  );
}

export function GalleryField({
  folder,
  value,
  onChange,
  disabled,
}: {
  folder: string;
  value: string[];
  onChange: React.Dispatch<React.SetStateAction<string[]>>;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [picking, setPicking] = useState(false);
  const [pending, setPending] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    setErr(null);
    const files = Array.from(list);
    setPending((n) => n + files.length);
    await Promise.all(
      files.map(async (file) => {
        try {
          const { path } = await uploadFile({ file, folder });
          onChange((prev) => [...prev, path]);
        } catch (e) {
          setErr(e instanceof Error ? e.message : "Upload failed.");
        } finally {
          setPending((n) => n - 1);
        }
      }),
    );
    if (input.current) input.current.value = "";
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {value.length > 0 ? (
        <ul className="grid grid-cols-2 gap-2">
          {value.map((path, i) => (
            <li key={`${path}-${i}`} className="group relative">
              <Thumb src={publicMediaUrl(path)} className="aspect-[4/3] w-full" />
              {!disabled ? (
                <div className="absolute inset-x-1 top-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <span className="flex gap-1">
                    <IconBtn label="Move earlier" onClick={() => move(i, -1)} disabled={i === 0}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </IconBtn>
                    <IconBtn label="Move later" onClick={() => move(i, 1)} disabled={i === value.length - 1}>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </IconBtn>
                  </span>
                  <IconBtn label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))}>
                    <X className="h-3.5 w-3.5" />
                  </IconBtn>
                </div>
              ) : null}
            </li>
          ))}
          {Array.from({ length: pending }).map((_, i) => (
            <li key={`pending-${i}`} className="aspect-[4/3] animate-pulse rounded-[5px] bg-surface-2" />
          ))}
        </ul>
      ) : pending > 0 ? (
        <div className="aspect-[4/3] w-1/2 animate-pulse rounded-[5px] bg-surface-2" />
      ) : null}
      {!disabled ? (
        <div className="flex flex-wrap gap-2">
          <input
            ref={input}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => onFiles(e.target.files)}
          />
          <button
            type="button"
            className={smallBtn}
            disabled={pending > 0}
            aria-busy={pending > 0 || undefined}
            onClick={() => input.current?.click()}
          >
            {pending > 0 ? <Spinner /> : <Upload className="h-3.5 w-3.5" />}
            {pending > 0 ? "Uploading..." : "Upload"}
          </button>
          <button type="button" className={smallBtn} onClick={() => setPicking(true)}>
            <FolderOpen className="h-3.5 w-3.5" />
            Choose from library
          </button>
        </div>
      ) : null}
      {err ? <p className="text-xs text-red-600">{err}</p> : null}
      <MediaPicker
        open={picking}
        onClose={() => setPicking(false)}
        kind="image"
        onPick={(item) => onChange((prev) => [...prev, item.storage_path])}
      />
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-6 w-6 items-center justify-center rounded-[5px] bg-white/95 text-ink-900 shadow-sm hover:bg-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}
