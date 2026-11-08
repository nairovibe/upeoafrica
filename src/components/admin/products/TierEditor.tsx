"use client";

import { Plus } from "lucide-react";
import { AdminBtn, Field, inputClass } from "@/components/admin/ui";
import { moveItem, RowTools } from "@/components/admin/events/RowTools";
import { emptyTier, tierDue, type PriceTier } from "@/lib/tiers";
import { formatKes } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function TierEditor({ value, onChange }: { value: PriceTier[]; onChange: (rows: PriceTier[]) => void }) {
  const set = (index: number, patch: Partial<PriceTier>) =>
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  return (
    <div className="space-y-3">
      {value.map((tier, index) => {
        const due = tierDue(tier);
        return (
          <div key={tier.id} className="rounded-[5px] border border-line p-4">
            <div className="flex items-start gap-3">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Field label="Tier name">
                  <input className={inputClass} value={tier.name} placeholder="Studio" onChange={(e) => set(index, { name: e.target.value })} />
                </Field>
                <Field label="Price (KES)">
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={String(tier.price_kes)}
                    onChange={(e) => set(index, { price_kes: Number(e.target.value.replace(/[^\d]/g, "") || 0) })}
                  />
                </Field>
                <Field label="Offer price (KES)">
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    placeholder="No offer"
                    value={tier.promo_price_kes == null ? "" : String(tier.promo_price_kes)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d]/g, "");
                      set(index, { promo_price_kes: raw === "" ? null : Number(raw) });
                    }}
                  />
                </Field>
                <Field label="Offer name">
                  <input
                    className={inputClass}
                    value={tier.promo_label}
                    placeholder="Launch price"
                    onChange={(e) => set(index, { promo_label: e.target.value })}
                  />
                </Field>
              </div>
              <RowTools
                index={index}
                count={value.length}
                onMove={(from, to) => onChange(moveItem(value, from, to))}
                onRemove={() => onChange(value.filter((_, i) => i !== index))}
                removeTitle="Remove tier"
              />
            </div>
            <div className="mt-3">
              <Field label="Included" hint="One line each. These are the points on the public card.">
                <textarea
                  className={inputClass}
                  rows={4}
                  value={tier.features.join("\n")}
                  placeholder={"Unlimited projects\nM-Pesa checkout\nEmail support"}
                  onChange={(e) => set(index, { features: e.target.value.split("\n") })}
                />
              </Field>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={tier.popular}
                  onClick={() => set(index, { popular: !tier.popular })}
                  className={cn("relative h-5 w-9 cursor-pointer rounded-full transition-colors", tier.popular ? "bg-brand-500" : "bg-surface-3 ring-1 ring-inset ring-line")}
                >
                  <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform", tier.popular ? "translate-x-[18px]" : "translate-x-0.5")} />
                </button>
                <span className="text-sm font-medium text-ink-900">Mark as popular</span>
              </label>
              <p className="text-xs text-muted">{due > 0 ? `Buyers pay ${formatKes(due)}` : "On request"}</p>
            </div>
          </div>
        );
      })}
      <AdminBtn variant="ghost" icon={<Plus aria-hidden />} onClick={() => onChange([...value, emptyTier()])}>
        Add tier
      </AdminBtn>
    </div>
  );
}
