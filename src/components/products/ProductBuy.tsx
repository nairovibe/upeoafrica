"use client";

import { useState } from "react";
import { CheckoutForm } from "@/components/site/CheckoutForm";
import { formatMoney, type PriceCurrency } from "@/lib/constants";
import { company } from "@/lib/content";
import { tierDue, tierOffer, type PriceTier } from "@/lib/tiers";
import { cn } from "@/lib/utils";

export function ProductBuy({
  productId,
  title,
  tiers,
  currency,
  price,
  listPrice,
  offerLabel,
}: {
  productId: string;
  title: string;
  tiers: PriceTier[];
  currency: PriceCurrency;
  price: number;
  listPrice?: number;
  offerLabel?: string;
}) {
  const [tierId, setTierId] = useState(
    () => tiers.find((tier) => tier.popular)?.id ?? tiers.find((tier) => tierDue(tier) > 0)?.id ?? tiers[0]?.id ?? "",
  );
  const [inCart, setInCart] = useState(false);
  const selected = tiers.find((tier) => tier.id === tierId) ?? null;
  const due = selected ? tierDue(selected) : price;
  const offer = selected ? tierOffer(selected) : null;
  const line = selected ? `${title} · ${selected.name}` : title;
  const payable = due > 0;

  return (
    <div className="border border-line bg-white p-6">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Price</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink-900">
        {due > 0 ? formatMoney(due, currency) : "On request"}
      </p>
      {offer ? (
        <p className="mt-1 text-sm text-muted">
          <span className="line-through">{formatMoney(offer.list, currency)}</span>
          <span className="ml-2 font-medium text-brand-600">{offer.label}</span>
        </p>
      ) : listPrice && listPrice > due ? (
        <p className="mt-1 text-sm text-muted">
          <span className="line-through">{formatMoney(listPrice, currency)}</span>
          {offerLabel ? <span className="ml-2 font-medium text-brand-600">{offerLabel}</span> : null}
        </p>
      ) : null}

      {tiers.length ? (
        <div className="mt-5 grid gap-2" role="radiogroup" aria-label="Plan">
          {tiers.map((tier) => {
            const tierOfferPrice = tierOffer(tier);
            const tierPrice = tierDue(tier);
            const active = tier.id === tierId;
            return (
              <button
                key={tier.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTierId(tier.id)}
                className={cn(
                  "cursor-pointer border p-4 text-left transition-colors duration-200",
                  active ? "border-brand-500 bg-brand-50/40" : "border-line hover:border-brand-300",
                )}
              >
                <span className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block font-medium text-ink-900">{tier.name}</span>
                    {tier.popular ? (
                      <span className="mt-1 inline-flex bg-brand-500 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                        Popular
                      </span>
                    ) : null}
                  </span>
                  <span className="text-right">
                    <span className="block font-display text-lg font-semibold text-ink-900">
                      {tierPrice > 0 ? formatMoney(tierPrice, currency) : "On request"}
                    </span>
                    {tierOfferPrice ? (
                      <span className="block text-xs text-muted line-through">{formatMoney(tierOfferPrice.list, currency)}</span>
                    ) : null}
                  </span>
                </span>
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
      ) : null}

      {payable ? (
        inCart ? (
          <div className="mt-6 border-t border-line pt-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Cart</p>
                <p className="mt-1 text-sm font-medium text-ink-900">{line}</p>
              </div>
              <p className="font-display text-lg font-semibold text-ink-900">{formatMoney(due, currency)}</p>
            </div>
            <button
              type="button"
              onClick={() => setInCart(false)}
              className="mt-2 cursor-pointer text-sm text-muted hover:text-ink-900"
            >
              Remove
            </button>
            {currency === "KES" ? (
              <div className="mt-5">
                <CheckoutForm productId={productId} tierId={selected?.id} />
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                <p className="text-sm text-body">
                  This price is in US dollars. M-Pesa checkout is for Kenyan shilling prices. We will send a dollar invoice.
                </p>
                <a
                  href={`mailto:${company.email}?subject=${encodeURIComponent(line)}`}
                  className="inline-flex h-11 w-full items-center justify-center bg-brand-500 text-sm font-medium text-white hover:bg-brand-600"
                >
                  Request invoice
                </a>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setInCart(true)}
            className="mt-6 inline-flex h-11 w-full cursor-pointer items-center justify-center bg-brand-500 text-sm font-medium text-white hover:bg-brand-600"
          >
            Add to cart
          </button>
        )
      ) : (
        <p className="mt-6 text-sm text-body">
          Tell us what you need and we will scope it.{" "}
          <a href={`mailto:${company.email}`} className="font-medium text-brand-600 hover:underline">
            {company.email}
          </a>
        </p>
      )}
    </div>
  );
}
