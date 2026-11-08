"use client";

import { Plus } from "lucide-react";
import { AdminBtn, Field, inputClass } from "@/components/admin/ui";
import { moveItem, RowTools } from "@/components/admin/events/RowTools";
import { Switch } from "@/components/admin/studio/controls";
import { emptyTier, tierDue, type PriceTier } from "@/lib/tiers";
import { formatMoney, type PriceCurrency } from "@/lib/constants";

export function TierEditor({
  value,
  currency,
  onChange,
}: {
  value: PriceTier[];
  currency: PriceCurrency;
  onChange: (rows: PriceTier[]) => void;
}) {
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
                <Field label={`Price (${currency})`}>
                  <input
                    className={inputClass}
                    inputMode="numeric"
                    value={String(tier.price_kes)}
                    onChange={(e) => set(index, { price_kes: Number(e.target.value.replace(/[^\d]/g, "") || 0) })}
                  />
                </Field>
                <Field label={`Offer price (${currency})`}>
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
                <Switch checked={tier.popular} label="Mark as popular" onClick={() => set(index, { popular: !tier.popular })} />
                <span className="text-sm font-medium text-ink-900">Mark as popular</span>
              </label>
              <p className="text-xs text-muted">{due > 0 ? `Buyers pay ${formatMoney(due, currency)}` : "On request"}</p>
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
