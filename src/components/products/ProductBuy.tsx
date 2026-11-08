"use client";

import { useState } from "react";
import { CheckoutForm } from "@/components/site/CheckoutForm";
import { formatMoney, type PriceCurrency } from "@/lib/constants";
import { company } from "@/lib/content";
import { tierDue, tierOffer, type PriceTier } from "@/lib/tiers";
import { cn } from "@/lib/utils";

export function ProductBuy({
  productId,
  tiers,
  currency,
}: {
  productId: string;
  tiers: PriceTier[];
  currency: PriceCurrency;
}) {
  const [tierId, setTierId] = useState(
    () => tiers.find((tier) => tier.popular)?.id ?? tiers.find((tier) => tierDue(tier) > 0)?.id ?? tiers[0]?.id ?? "",
  );
  const selected = tiers.find((tier) => tier.id === tierId) ?? null;
  const due = selected ? tierDue(selected) : 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-3">
        {tiers.map((tier) => {
          const offer = tierOffer(tier);
          const price = tierDue(tier);
          const active = tier.id === tierId;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => setTierId(tier.id)}
              className={cn(
                "cursor-pointer rounded-[5px] border p-4 text-left transition-colors duration-200",
                active ? "border-brand-500 bg-brand-50/50" : "border-line hover:border-brand-300",
              )}
            >
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="block font-medium text-ink-900">{tier.name}</span>
                  {tier.popular ? (
                    <span className="mt-1 inline-flex rounded-[5px] bg-brand-500 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                      Popular
                    </span>
                  ) : null}
                </span>
                <span className="text-right">
                  <span className="block font-display text-lg font-semibold text-ink-900">{price > 0 ? formatMoney(price, currency) : "On request"}</span>
                  {offer ? <span className="block text-xs text-muted line-through">{formatMoney(offer.list, currency)}</span> : null}
                </span>
              </span>
              {offer ? <span className="mt-1 block text-xs font-medium text-brand-600">{offer.label}</span> : null}
              {tier.features.length ? (
                <ul className="mt-3 space-y-1 text-sm text-body">
                  {tier.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              ) : null}
            </button>
          );
        })}
      </div>
      {due > 0 && selected && currency === "KES" ? (
        <>
          <p className="text-sm text-body">Get it now with M-Pesa. The file link is emailed after confirmation.</p>
          <CheckoutForm productId={productId} tierId={selected.id} />
        </>
      ) : due > 0 && selected ? (
        <p className="text-sm text-body">
          This price is in US dollars. M-Pesa checkout is for Kenyan shilling prices. Write to{" "}
          <a href={`mailto:${company.email}`} className="font-medium text-brand-600 hover:underline">
            {company.email}
          </a>{" "}
          and we will send the invoice.
        </p>
      ) : (
        <p className="text-sm text-body">Tell us what you need and we will scope it.</p>
      )}
    </div>
  );
}
