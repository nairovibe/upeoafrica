"use client";

import { Plus } from "lucide-react";
import { AdminBtn, inputClass } from "@/components/admin/ui";
import { moveItem, newKey, RowTools } from "@/components/admin/events/RowTools";

export type AgendaDraft = { key: string; time: string; title: string; detail: string };

export function AgendaEditor({ value, onChange }: { value: AgendaDraft[]; onChange: (rows: AgendaDraft[]) => void }) {
  const set = (i: number, patch: Partial<AgendaDraft>) =>
    onChange(value.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  return (
    <div className="space-y-3">
      {value.map((a, i) => (
        <div key={a.key} className="flex items-start gap-3">
          <div className="grid flex-1 gap-2 sm:grid-cols-[96px_minmax(0,1fr)]">
            <input
              className={inputClass}
              aria-label="Time"
              placeholder="09:00"
              value={a.time}
              onChange={(e) => set(i, { time: e.target.value })}
            />
            <input
              className={inputClass}
              aria-label="Title"
              placeholder="Session title"
              value={a.title}
              onChange={(e) => set(i, { title: e.target.value })}
            />
            <textarea
              className={inputClass + " min-h-16 sm:col-start-2"}
              aria-label="Detail"
              placeholder="Detail (optional)"
              value={a.detail}
              onChange={(e) => set(i, { detail: e.target.value })}
            />
          </div>
          <RowTools
            index={i}
            count={value.length}
            onMove={(from, to) => onChange(moveItem(value, from, to))}
            onRemove={() => onChange(value.filter((_, idx) => idx !== i))}
          />
        </div>
      ))}
      <AdminBtn variant="ghost" icon={<Plus aria-hidden />} onClick={() => onChange([...value, { key: newKey(), time: "", title: "", detail: "" }])}>
        Add agenda item
      </AdminBtn>
    </div>
  );
}
