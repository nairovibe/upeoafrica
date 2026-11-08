"use client";

import { useEffect, useRef, useState } from "react";
import { CircleCheckBig } from "lucide-react";
import { MoneyFigure } from "@/components/products/MoneyFigure";
import { buyButtonClass, useCart } from "@/components/products/cart";
import { formatMoney, type PriceCurrency } from "@/lib/constants";
import { tierDue, tierOffer, type PriceTier } from "@/lib/tiers";
import { cn } from "@/lib/utils";

type PlanTone = "entry" | "popular" | "agency";

function planTone(tier: PriceTier, tiers: PriceTier[]): PlanTone {
  if (tier.popular) return "popular";
  const due = tierDue(tier);
  const highest = Math.max(...tiers.map((row) => tierDue(row)));
  if (tiers.length > 1 && due > 0 && due === highest) return "agency";
  return "entry";
}

export function ProductBuy({
  productId,
  slug,
  title,
  type,
  tiers,
  currency,
  price,
  listPrice,
  offerLabel,
  cover,
}: {
  productId: string;
  slug: string;
  title: string;
  type: string;
  tiers: PriceTier[];
  currency: PriceCurrency;
  price: number;
  listPrice?: number;
  offerLabel?: string;
  cover: string | null;
}) {
  const { add, items } = useCart();
  const initialId = tiers.find((tier) => tier.popular)?.id ?? tiers.find((tier) => tierDue(tier) > 0)?.id ?? tiers[0]?.id ?? "";
  const [tierId, setTierId] = useState(initialId);
  const [addedId, setAddedId] = useState<string | null>(null);
  const synced = useRef(false);
  const selected = tiers.find((tier) => tier.id === tierId) ?? null;
  const due = selected ? tierDue(selected) : price;
  const offer = selected ? tierOffer(selected) : null;
  const lineId = selected?.id ?? "";
  const inCart = addedId === lineId;

  useEffect(() => {
    if (synced.current) return;
    const line = items.find((row) => row.productId === productId);
    if (!line) return;
    synced.current = true;
    const id = line.tierId ?? "";
    setTierId(id);
    setAddedId(id);
  }, [items, productId]);

  function addTier(tier: PriceTier | null, amount: number) {
    if (amount < 0) return;
    add({
      productId,
      slug,
      title,
      tierId: tier?.id ?? null,
      tierName: tier?.name ?? null,
      currency,
      amount,
      cover,
    });
    setTierId(tier?.id ?? "");
    setAddedId(tier?.id ?? "");
  }

  return (
    <section id="plans" className="scroll-mt-32 -mx-5 bg-[#EDF3F8] px-5 pt-12 pb-0 sm:-mx-8 sm:px-8 md:pt-16">
      <h2 className="font-display text-2xl font-semibold text-ink-900">
        {type === "plugin" ? "Choose a licence" : "Choose a plan"}
      </h2>
      {tiers.length ? (
        <div className="mt-8 grid items-stretch gap-5 lg:grid-cols-3">
          {tiers.map((tier) => {
            const tone = planTone(tier, tiers);
            const tierOfferPrice = tierOffer(tier);
            const tierPrice = tierDue(tier);
            const added = tier.id === addedId;
            const onDark = tone === "agency";
            return (
              <button
                key={tier.id}
                type="button"
                aria-pressed={added}
                onClick={() => addTier(tier, tierPrice)}
                className={cn(
                  "flex h-full cursor-pointer flex-col text-left",
                  tone === "entry" && (added ? "bg-white" : "bg-transparent"),
                  tone === "popular" && "bg-white shadow-[0_18px_40px_-24px_rgba(8,11,17,0.4)]",
                  tone === "agency" && "border-t-4 border-brand-500 bg-ink-950 text-white",
                  added && "outline outline-2 outline-brand-500",
                  added && tone === "agency" && "outline-offset-4",
                )}
              >
                {tone === "popular" ? (
                  <span className="bg-brand-500 px-6 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
                    Most popular
                  </span>
                ) : null}
                <span className={cn("flex flex-1 flex-col px-6 pb-6", tone === "popular" ? "pt-6" : "pt-7")}>
                  <span className={cn("font-display text-xl font-semibold", onDark ? "text-white" : "text-ink-900")}>{tier.name}</span>
                  <span className="mt-4">
                    {tierPrice > 0 ? (
                      <MoneyFigure amount={tierPrice} currency={currency} size="lg" tone={onDark ? "light" : "ink"} />
                    ) : (
                      <span className={cn("font-display text-3xl font-semibold", onDark ? "text-white" : "text-ink-900")}>Free</span>
                    )}
                  </span>
                  {tierOfferPrice ? (
                    <span className={cn("mt-2 text-sm line-through", onDark ? "text-white/55" : "text-muted")}>
                      {formatMoney(tierOfferPrice.list, currency)}
                    </span>
                  ) : null}
                  {tier.features.length ? (
                    <ul className="mt-6 space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className={cn("flex items-start gap-3 text-sm leading-relaxed", onDark ? "text-white/85" : "text-body")}>
                          <CircleCheckBig className="mt-0.5 h-5 w-5 shrink-0 fill-brand-500 text-white" strokeWidth={2.5} aria-hidden />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <span className="mt-auto w-full pt-8">
                      <span
                        className={cn(
                          "inline-flex h-11 w-full items-center justify-center text-sm font-medium",
                          added
                            ? "bg-brand-500 text-white"
                            : onDark
                              ? "bg-white text-ink-950"
                              : "border border-line bg-white text-ink-900",
                        )}
                      >
                        {added ? "Added" : "Add to cart"}
                      </span>
                    </span>
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-6">
          {offer && listPrice && listPrice > due ? (
            <p className="text-sm text-muted">
              <span className="line-through">{formatMoney(listPrice, currency)}</span>
              {offerLabel ? <span className="ml-2 font-medium text-brand-600">{offerLabel}</span> : null}
            </p>
          ) : null}
          <button type="button" onClick={() => addTier(null, due)} className={buyButtonClass("mt-4")}>
            {inCart ? "Added" : due > 0 ? "Add to cart" : "Get it free"}
          </button>
        </div>
      )}

    </section>
  );
}
