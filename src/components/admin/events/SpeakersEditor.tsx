"use client";

import { Plus } from "lucide-react";
import { AdminBtn, Field, inputClass } from "@/components/admin/ui";
import { FileField } from "@/components/admin/FileField";
import { moveItem, newKey, RowTools } from "@/components/admin/events/RowTools";

export type SpeakerDraft = { key: string; name: string; role: string; photo_path: string };

export function SpeakersEditor({ value, onChange }: { value: SpeakerDraft[]; onChange: (rows: SpeakerDraft[]) => void }) {
  const set = (i: number, patch: Partial<SpeakerDraft>) =>
    onChange(value.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  return (
    <div className="space-y-3">
      {value.map((s, i) => (
        <div key={s.key} className="rounded-[5px] border border-line p-3">
          <div className="flex items-start gap-3">
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <Field label="Name">
                <input className={inputClass} value={s.name} onChange={(e) => set(i, { name: e.target.value })} />
              </Field>
              <Field label="Role">
                <input
                  className={inputClass}
                  value={s.role}
                  placeholder="Lead engineer, Upeo Africa"
                  onChange={(e) => set(i, { role: e.target.value })}
                />
              </Field>
            </div>
            <div className="pt-6">
              <RowTools
                index={i}
                count={value.length}
                onMove={(from, to) => onChange(moveItem(value, from, to))}
                onRemove={() => onChange(value.filter((_, idx) => idx !== i))}
              />
            </div>
          </div>
          <div className="mt-3">
            <FileField
              label="Photo"
              folder="events/speakers"
              accept="image/*"
              value={s.photo_path}
              onChange={(p) => set(i, { photo_path: p })}
            />
          </div>
        </div>
      ))}
      <AdminBtn variant="ghost" icon={<Plus aria-hidden />} onClick={() => onChange([...value, { key: newKey(), name: "", role: "", photo_path: "" }])}>
        Add speaker
      </AdminBtn>
    </div>
  );
}
