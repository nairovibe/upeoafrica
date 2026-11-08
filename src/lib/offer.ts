/** One price rule for the catalogue, the ticket desk, and checkout. */

export type Priced = {
  price_kes: number;
  promo_price_kes?: number | null;
  promo_label?: string | null;
  promo_starts_at?: string | null;
  promo_ends_at?: string | null;
};

export type Offer = {
  list: number;
  price: number;
  label: string;
};

export function currentOffer(row: Priced, now = Date.now()): Offer | null {
  const sale = row.promo_price_kes;
  if (sale == null || !Number.isInteger(sale) || sale < 0 || sale >= row.price_kes) return null;
  const start = row.promo_starts_at ? new Date(row.promo_starts_at).getTime() : null;
  const end = row.promo_ends_at ? new Date(row.promo_ends_at).getTime() : null;
  if (start != null && Number.isNaN(start)) return null;
  if (end != null && Number.isNaN(end)) return null;
  if (start != null && now < start) return null;
  if (end != null && now >= end) return null;
  return { list: row.price_kes, price: sale, label: row.promo_label?.trim() || "Offer" };
}

/** What the buyer is charged right now. */
export function chargeKes(row: Priced, now = Date.now()) {
  return currentOffer(row, now)?.price ?? row.price_kes;
}
