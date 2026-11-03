"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function ChipsInput({
  value,
  onChange,
  placeholder,
  max = 20,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  max?: number;
}) {
  const [draft, setDraft] = useState("");

  function commit(raw: string) {
    const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    const lower = new Set(value.map((v) => v.toLowerCase()));
    const next = [...value];
    for (const p of parts) {
      if (!lower.has(p.toLowerCase()) && next.length < max) {
        next.push(p);
        lower.add(p.toLowerCase());
      }
    }
    onChange(next);
    setDraft("");
  }

  return (
    <div className="flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-[5px] border border-line bg-white px-2 py-1.5 focus-within:border-brand-500">
      {value.map((chip) => (
        <span key={chip} className="inline-flex items-center gap-1 rounded-[5px] bg-surface-3 px-2 py-0.5 text-xs text-ink-900">
          {chip}
          <button
            type="button"
            aria-label={`Remove ${chip}`}
            onClick={() => onChange(value.filter((v) => v !== chip))}
            className="text-muted hover:text-red-600"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        className="min-w-[6rem] flex-1 bg-transparent px-1 py-1 text-sm text-ink-900 outline-none"
        value={draft}
        placeholder={value.length ? "" : placeholder}
        onChange={(e) => {
          if (e.target.value.includes(",")) commit(e.target.value);
          else setDraft(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit(draft);
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => commit(draft)}
      />
    </div>
  );
}
