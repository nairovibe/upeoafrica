import { priceCurrency, type PriceCurrency } from "@/lib/constants";
import { kesFromUsd, usdToKesQuote, type FxQuote } from "@/lib/fx";
import { normalizeEmail } from "@/lib/newsletter";
import { chargeKes } from "@/lib/offer";
import { createServiceClient } from "@/lib/supabase/server";
import { parseTiers, tierDue } from "@/lib/tiers";

export type CheckoutItem = { productId?: string; tierId?: string | null };
export type PayMethod = "paypal" | "mpesa" | "card";

export type Buyer = {
  name: string;
  email: string;
  company: string;
  website: string;
};

type Service = NonNullable<Awaited<ReturnType<typeof createServiceClient>>>;

export type PricedLine = {
  productId: string;
  tierId: string | null;
  tierName: string | null;
  title: string;
  amount: number;
  currency: PriceCurrency;
};

export type ChargeRow = PricedLine & {
  charge: number;
  chargeCurrency: PriceCurrency;
  fxRate: number | null;
};

export function normalizeWebsite(value: string): string | null {
  const raw = value.trim();
  if (!raw || raw.length > 200) return null;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".") || url.hostname.length < 4) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function readBuyer(body: { name?: string; email?: string; company?: string; website?: string }) {
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  const company = body.company?.trim() ?? "";
  const website = normalizeWebsite(body.website ?? "");
  if (name.length < 2 || name.length > 80) return { ok: false as const, error: "Enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false as const, error: "Enter a valid email. The download link is sent there." };
  }
  if (company.length < 2 || company.length > 80) return { ok: false as const, error: "Enter the company name." };
  if (!website) return { ok: false as const, error: "A website URL is required." };
  return { ok: true as const, buyer: { name, email, company, website } satisfies Buyer };
}

export function checkoutItems(body: { items?: CheckoutItem[]; productId?: string; tierId?: string | null }) {
  if (Array.isArray(body.items) && body.items.length) return body.items.slice(0, 8);
  if (body.productId) return [{ productId: body.productId, tierId: body.tierId ?? null }];
  return [];
}

export async function pricedLines(service: Service, items: CheckoutItem[]) {
  if (!items.length) return { ok: false as const, error: "Add a product before checkout." };
  const lines: PricedLine[] = [];
  for (const item of items) {
    if (!item.productId) return { ok: false as const, error: "A product is missing from the cart." };
    const { data: product } = await service.from("products").select("*").eq("id", item.productId).eq("published", true).maybeSingle();
    if (!product) return { ok: false as const, error: "A product in the cart is no longer available." };
    if (!product.file_path) return { ok: false as const, error: `${product.title} does not have a file to download yet.` };
    const tiers = parseTiers(product.price_tiers);
    const tier = tiers.length ? tiers.find((row) => row.id === item.tierId) ?? null : null;
    if (tiers.length && !tier) return { ok: false as const, error: `Choose a plan for ${product.title}.` };
    const amount = tier ? tierDue(tier) : chargeKes(product);
    if (amount < 0) return { ok: false as const, error: `${product.title} is not for sale yet.` };
    lines.push({
      productId: product.id,
      tierId: tier?.id ?? null,
      tierName: tier?.name || null,
      title: tier?.name ? `${product.title} · ${tier.name}` : product.title,
      amount,
      currency: priceCurrency(product.currency),
    });
  }
  return { ok: true as const, lines };
}

export async function chargeLines(lines: PricedLine[], method: PayMethod) {
  if (!lines.some((line) => line.amount > 0)) {
    return { ok: false as const, error: "This download is free. No payment is due." };
  }
  if (method === "paypal") {
    const currencies = new Set(lines.map((line) => line.currency));
    if (currencies.size > 1) {
      return {
        ok: false as const,
        error: "PayPal can take one currency at a time. Pay with M-Pesa or card to settle the cart in shillings.",
      };
    }
    const currency = lines[0]?.currency ?? "KES";
    const rows: ChargeRow[] = lines.map((line) => ({ ...line, charge: line.amount, chargeCurrency: currency, fxRate: null }));
    return {
      ok: true as const,
      rows,
      currency,
      total: rows.reduce((sum, row) => sum + row.charge, 0),
      quote: null as FxQuote | null,
    };
  }

  const needsFx = lines.some((line) => line.currency === "USD");
  const quote = needsFx ? await usdToKesQuote() : null;
  if (needsFx && !quote) {
    return { ok: false as const, error: "The live shilling rate is unavailable, so this method cannot take a dollar price right now." };
  }
  const rows: ChargeRow[] = lines.map((line) => {
    if (line.currency === "USD" && quote) {
      return { ...line, charge: kesFromUsd(line.amount, quote.rate), chargeCurrency: "KES" as const, fxRate: quote.rate };
    }
    return { ...line, charge: line.amount, chargeCurrency: "KES" as const, fxRate: null };
  });
  return {
    ok: true as const,
    rows,
    currency: "KES" as const,
    total: rows.reduce((sum, row) => sum + row.charge, 0),
    quote,
  };
}

export async function insertCheckoutOrders(
  service: Service,
  buyer: Buyer,
  rows: ChargeRow[],
  provider: string,
  phone: string | null,
) {
  const batchId = crypto.randomUUID();
  const ids: string[] = [];
  for (const row of rows) {
    const { data, error } = await service
      .from("orders")
      .insert({
        email: buyer.email,
        phone,
        attendee_name: buyer.name,
        attendee_company: buyer.company,
        website_url: buyer.website,
        product_id: row.productId,
        amount_kes: row.charge,
        currency: row.chargeCurrency,
        list_amount: row.amount,
        fx_rate: row.fxRate,
        tier_label: row.tierName,
        provider,
        status: "pending",
        kind: "product",
        batch_id: batchId,
      })
      .select("id")
      .single();
    if (error || !data) {
      if (ids.length) await service.from("orders").update({ status: "failed" }).in("id", ids);
      return { ok: false as const, error: "Could not start checkout." };
    }
    ids.push(data.id);
  }
  return { ok: true as const, ids, batchId };
}

/** Keep a free-download address on the mailing list so later notes can reach them. */
export async function rememberCheckoutEmail(service: Service, email: string) {
  const clean = normalizeEmail(email);
  if (!clean) return;
  const { data: existing } = await service.from("newsletter_subscribers").select("id, status").eq("email", clean).maybeSingle();
  if (existing?.status === "subscribed") return;
  if (existing) {
    await service
      .from("newsletter_subscribers")
      .update({ status: "subscribed", unsubscribed_at: null, source: "checkout" })
      .eq("id", existing.id);
    return;
  }
  await service.from("newsletter_subscribers").insert({ email: clean, status: "subscribed", source: "checkout" });
}
