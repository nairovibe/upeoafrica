"use client";

import { useState } from "react";
import { AdminBtn, inputClass } from "@/components/admin/ui";

export function CategoryField({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (next: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function add() {
    const name = draft.replace(/\s+/g, " ").trim();
    if (name.length < 2) {
      setErr("Use at least 2 characters.");
      return;
    }
    onChange(name);
    setDraft("");
    setAdding(false);
    setErr(null);
  }

  return (
    <div>
      {options.length ? (
        <div className="max-h-40 space-y-0.5 overflow-y-auto pr-1">
          {options.map((name) => (
            <label key={name} className="flex cursor-pointer items-center gap-2 rounded-[5px] px-1 py-1 text-sm text-ink-900 hover:bg-surface-3">
              <input
                type="radio"
                name="article-category"
                className="accent-brand-500"
                checked={value.toLowerCase() === name.toLowerCase()}
                onChange={() => onChange(name)}
              />
              <span className="truncate">{name}</span>
            </label>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No categories yet.</p>
      )}
      {value ? (
        <button type="button" className="mt-2 text-xs text-muted hover:text-ink-900" onClick={() => onChange("")}>
          Clear category
        </button>
      ) : null}
      {adding ? (
        <div className="mt-3 space-y-2">
          <input
            className={inputClass}
            value={draft}
            autoFocus
            placeholder="Category name"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
          />
          {err ? <p className="text-xs text-red-600">{err}</p> : null}
          <div className="flex gap-2">
            <AdminBtn onClick={add}>Add category</AdminBtn>
            <AdminBtn variant="ghost" onClick={() => { setAdding(false); setErr(null); }}>Cancel</AdminBtn>
          </div>
        </div>
      ) : (
        <button type="button" className="mt-3 text-[13px] font-medium text-brand-600 hover:underline" onClick={() => setAdding(true)}>
          Add new category
        </button>
      )}
    </div>
  );
}
