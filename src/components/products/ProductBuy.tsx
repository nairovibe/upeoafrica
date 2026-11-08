"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { MoneyFigure } from "@/components/products/MoneyFigure";
import { ProductCheckout } from "@/components/products/ProductCheckout";
import { formatMoney, type PriceCurrency } from "@/lib/constants";
import { tierDue, tierOffer, type PriceTier } from "@/lib/tiers";
import { cn } from "@/lib/utils";

export function ProductBuy({
  productId,
  title,
  type,
  tiers,
  currency,
  price,
  listPrice,
  offerLabel,
  cancelled,
}: {
  productId: string;
  title: string;
  type: string;
  tiers: PriceTier[];
  currency: PriceCurrency;
  price: number;
  listPrice?: number;
  offerLabel?: string;
  cancelled: boolean;
}) {
  const [tierId, setTierId] = useState(
    () => tiers.find((tier) => tier.popular)?.id ?? tiers.find((tier) => tierDue(tier) > 0)?.id ?? tiers[0]?.id ?? "",
  );
  const selected = tiers.find((tier) => tier.id === tierId) ?? null;
  const due = selected ? tierDue(selected) : price;
  const offer = selected ? tierOffer(selected) : null;
  const payable = due > 0;

  return (
    <div className="space-y-8">
      <section id="plans" className="scroll-mt-32">
        <h2 className="font-display text-2xl font-semibold text-ink-900">
          {type === "plugin" ? "Choose a licence" : "Choose a plan"}
        </h2>
        {tiers.length ? (
          <div className="mt-6 grid items-stretch gap-4 md:grid-cols-3" role="radiogroup" aria-label="Plan">
            {tiers.map((tier) => {
              const tierOfferPrice = tierOffer(tier);
              const tierPrice = tierDue(tier);
              const active = tier.id === tierId;
              const featured = tier.popular;
              return (
                <button
                  key={tier.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTierId(tier.id)}
                  className={cn(
                    "flex cursor-pointer flex-col border text-left transition-colors duration-200",
                    featured ? "border-ink-950 bg-ink-950 text-white" : "border-line bg-white text-ink-900 hover:border-brand-300",
                    active && !featured && "border-brand-500",
                    active && featured && "outline outline-2 outline-offset-2 outline-brand-500",
                  )}
                >
                  <span
                    className={cn(
                      "px-5 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em]",
                      featured ? "bg-brand-500 text-white" : "bg-surface-2 text-muted",
                    )}
                  >
                    {featured ? "Most popular" : type === "plugin" ? "Licence" : "Plan"}
                  </span>
                  <span className="flex flex-1 flex-col px-5 py-6">
                    <span className={cn("font-display text-lg font-semibold", featured ? "text-white" : "text-ink-900")}>{tier.name}</span>
                    <span className="mt-4">
                      {tierPrice > 0 ? (
                        <MoneyFigure amount={tierPrice} currency={currency} size="xl" tone={featured ? "light" : "ink"} />
                      ) : (
                        <span className={cn("font-display text-3xl font-semibold", featured ? "text-white" : "text-ink-900")}>On request</span>
                      )}
                    </span>
                    {tierOfferPrice ? (
                      <span className={cn("mt-2 text-sm line-through", featured ? "text-white/60" : "text-muted")}>
                        {formatMoney(tierOfferPrice.list, currency)}
                      </span>
                    ) : null}
                    {tier.features.length ? (
                      <ul className={cn("mt-6 border-t", featured ? "border-white/15" : "border-line")}>
                        {tier.features.map((feature) => (
                          <li
                            key={feature}
                            className={cn(
                              "flex items-start gap-3 border-b py-3 text-sm leading-relaxed last:border-b-0",
                              featured ? "border-white/15 text-white/85" : "border-line text-body",
                            )}
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <span
                      className={cn(
                        "mt-6 inline-flex h-11 items-center justify-center text-sm font-medium",
                        active
                          ? "bg-brand-500 text-white"
                          : featured
                            ? "bg-white text-ink-950"
                            : "border border-line text-ink-900",
                      )}
                    >
                      {active ? "Selected" : "Select"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        ) : offer && listPrice && listPrice > due ? (
          <p className="mt-3 text-sm text-muted">
            <span className="line-through">{formatMoney(listPrice, currency)}</span>
            {offerLabel ? <span className="ml-2 font-medium text-brand-600">{offerLabel}</span> : null}
          </p>
        ) : null}
      </section>

      {payable ? (
        <ProductCheckout
          productId={productId}
          tierId={selected?.id ?? null}
          title={title}
          tierName={selected?.name || null}
          amount={due}
          currency={currency}
          cancelled={cancelled}
        />
      ) : null}
    </div>
  );
}
