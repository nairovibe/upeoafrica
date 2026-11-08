import { chargeKes, currentOffer, type Offer } from "@/lib/offer";

export type PriceTier = {
  id: string;
  name: string;
  price_kes: number;
  promo_price_kes: number | null;
  promo_label: string;
  features: string[];
  popular: boolean;
};

export function emptyTier(): PriceTier {
  return {
    id: crypto.randomUUID(),
    name: "",
    price_kes: 0,
    promo_price_kes: null,
    promo_label: "",
    features: [],
    popular: false,
  };
}

export function parseTiers(value: unknown): PriceTier[] {
  if (!Array.isArray(value)) return [];
  const tiers: PriceTier[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as Record<string, unknown>;
    const price = Number(row.price_kes);
    if (!Number.isInteger(price) || price < 0) continue;
    const promo = row.promo_price_kes == null || row.promo_price_kes === "" ? null : Number(row.promo_price_kes);
    const features = Array.isArray(row.features)
      ? row.features.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 20)
      : [];
    tiers.push({
      id: typeof row.id === "string" && row.id ? row.id : crypto.randomUUID(),
      name: typeof row.name === "string" ? row.name.trim() : "",
      price_kes: price,
      promo_price_kes: promo != null && Number.isInteger(promo) && promo >= 0 && promo < price ? promo : null,
      promo_label: typeof row.promo_label === "string" ? row.promo_label.trim() : "",
      features,
      popular: row.popular === true,
    });
  }
  return tiers.slice(0, 12);
}

export function tierOffer(tier: PriceTier): Offer | null {
  return currentOffer({
    price_kes: tier.price_kes,
    promo_price_kes: tier.promo_price_kes,
    promo_label: tier.promo_label || null,
  });
}

export function tierDue(tier: PriceTier) {
  return chargeKes({
    price_kes: tier.price_kes,
    promo_price_kes: tier.promo_price_kes,
    promo_label: tier.promo_label || null,
  });
}

/** Lowest amount a buyer can pay across tiers. Null when the product has no tiers. */
export function tiersFrom(tiers: PriceTier[]) {
  if (!tiers.length) return null;
  return Math.min(...tiers.map(tierDue));
}
