"use client";

import { Plus } from "lucide-react";
import { AdminBtn, Field, inputClass } from "@/components/admin/ui";
import { moveItem, newKey, RowTools } from "@/components/admin/events/RowTools";
import { cn } from "@/lib/utils";

export type TicketDraft = {
  key: string;
  id?: string;
  name: string;
  description: string;
  price_kes: string;
  quota: string;
  sales_start: string;
  sales_end: string;
  max_per_order: string;
  promo: boolean;
  promo_price_kes: string;
  promo_label: string;
  promo_starts: string;
  promo_ends: string;
};

export function emptyTicket(name = ""): TicketDraft {
  return {
    key: newKey(),
    name,
    description: "",
    price_kes: "0",
    quota: "",
    sales_start: "",
    sales_end: "",
    max_per_order: "10",
    promo: false,
    promo_price_kes: "",
    promo_label: "",
    promo_starts: "",
    promo_ends: "",
  };
}

export function TicketsEditor({
  value,
  onChange,
  orderCounts,
}: {
  value: TicketDraft[];
  onChange: (rows: TicketDraft[]) => void;
  orderCounts: Record<string, number>;
}) {
  const set = (i: number, patch: Partial<TicketDraft>) =>
    onChange(value.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  return (
    <div className="space-y-3">
      {value.map((t, i) => {
        const orders = t.id ? (orderCounts[t.id] ?? 0) : 0;
        return (
          <div key={t.key} className="rounded-[5px] border border-line p-3">
            <div className="flex items-start gap-3">
              <div className="grid flex-1 gap-3 sm:grid-cols-[minmax(0,1fr)_120px]">
                <Field label="Name">
                  <input className={inputClass} value={t.name} placeholder="General" onChange={(e) => set(i, { name: e.target.value })} />
                </Field>
                <Field label="Price (KES)">
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={t.price_kes}
                    onChange={(e) => set(i, { price_kes: e.target.value.replace(/[^\d]/g, "") })}
                  />
                </Field>
              </div>
              <div className="pt-6">
                <RowTools
                  index={i}
                  count={value.length}
                  onMove={(from, to) => onChange(moveItem(value, from, to))}
                  onRemove={() => onChange(value.filter((_, idx) => idx !== i))}
                  removeDisabled={orders > 0}
                  removeTitle={orders > 0 ? `${orders} orders use this ticket` : "Remove ticket"}
                />
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Description">
                <input
                  className={inputClass}
                  value={t.description}
                  placeholder="Includes lunch"
                  onChange={(e) => set(i, { description: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Quota">
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    placeholder="No limit"
                    value={t.quota}
                    onChange={(e) => set(i, { quota: e.target.value.replace(/[^\d]/g, "") })}
                  />
                </Field>
                <Field label="Max per order">
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={t.max_per_order}
                    onChange={(e) => set(i, { max_per_order: e.target.value.replace(/[^\d]/g, "") })}
                  />
                </Field>
              </div>
              <Field label="Sales start">
                <input
                  className={inputClass}
                  type="datetime-local"
                  value={t.sales_start}
                  onChange={(e) => set(i, { sales_start: e.target.value })}
                />
              </Field>
              <Field label="Sales end">
                <input
                  className={inputClass}
                  type="datetime-local"
                  value={t.sales_end}
                  onChange={(e) => set(i, { sales_end: e.target.value })}
                />
              </Field>
            </div>
            <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-[5px] border border-line px-3 py-2">
              <span className="text-sm font-medium text-ink-900">Run a promotion</span>
              <button
                type="button"
                role="switch"
                aria-checked={t.promo}
                onClick={() => set(i, { promo: !t.promo })}
                className={cn("relative h-5 w-9 cursor-pointer rounded-full transition-colors", t.promo ? "bg-brand-500" : "bg-surface-3 ring-1 ring-inset ring-line")}
              >
                <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform", t.promo ? "translate-x-[18px]" : "translate-x-0.5")} />
              </button>
            </label>
            {t.promo ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Offer price (KES)">
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={t.promo_price_kes}
                    onChange={(e) => set(i, { promo_price_kes: e.target.value.replace(/[^\d]/g, "") })}
                  />
                </Field>
                <Field label="Offer name">
                  <input className={inputClass} value={t.promo_label} placeholder="Early bird" onChange={(e) => set(i, { promo_label: e.target.value })} />
                </Field>
                <Field label="Offer starts">
                  <input className={inputClass} type="datetime-local" value={t.promo_starts} onChange={(e) => set(i, { promo_starts: e.target.value })} />
                </Field>
                <Field label="Offer ends">
                  <input className={inputClass} type="datetime-local" value={t.promo_ends} onChange={(e) => set(i, { promo_ends: e.target.value })} />
                </Field>
              </div>
            ) : null}
            {orders > 0 ? (
              <p className="mt-2 text-xs text-muted">
                {orders} {orders === 1 ? "order" : "orders"}
              </p>
            ) : null}
          </div>
        );
      })}
      <AdminBtn variant="ghost" icon={<Plus aria-hidden />} onClick={() => onChange([...value, emptyTicket()])}>
        Add ticket type
      </AdminBtn>
    </div>
  );
}
