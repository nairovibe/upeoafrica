import { NextResponse } from "next/server";
import { checkoutItems, insertCheckoutOrders, pricedLines, readBuyer, rememberCheckoutEmail, type ChargeRow } from "@/lib/product-checkout";
import { failCheckoutBatch, fulfillCheckoutBatch } from "@/lib/product-order";
import { rateLimit, verifyTurnstile } from "@/lib/notify";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`free-product:${ip}`, 6, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  }

  const body = (await request.json()) as {
    items?: { productId?: string; tierId?: string | null }[];
    productId?: string;
    tierId?: string | null;
    name?: string;
    email?: string;
    company?: string;
    website?: string;
    turnstileToken?: string;
  };
  if (!(await verifyTurnstile(body.turnstileToken, ip, "checkout"))) {
    return NextResponse.json({ error: "Could not verify this checkout." }, { status: 400 });
  }
  const buyer = readBuyer(body);
  if (!buyer.ok) return NextResponse.json({ error: buyer.error }, { status: 400 });

  const service = await createServiceClient();
  if (!service) return NextResponse.json({ error: "Checkout is not configured yet." }, { status: 503 });

  const priced = await pricedLines(service, checkoutItems(body));
  if (!priced.ok) return NextResponse.json({ error: priced.error }, { status: 400 });
  if (priced.lines.some((line) => line.amount > 0)) {
    return NextResponse.json({ error: "This product has a price. Add it to the cart again so checkout can take payment." }, { status: 400 });
  }

  const rows: ChargeRow[] = priced.lines.map((line) => ({
    ...line,
    charge: 0,
    chargeCurrency: line.currency,
    fxRate: null,
  }));
  const created = await insertCheckoutOrders(service, buyer.buyer, rows, "free", null);
  if (!created.ok) return NextResponse.json({ error: created.error }, { status: 500 });

  const origin = new URL(request.url).origin;
  const done = await fulfillCheckoutBatch({
    orderId: created.ids[0],
    providerRef: "",
    amount: 0,
    currency: rows[0]?.chargeCurrency ?? "USD",
    payload: { kind: "free" },
    origin,
    provider: "free",
    trustAmount: true,
  });
  if (!done.ok) {
    await failCheckoutBatch(created.ids[0]);
    return NextResponse.json({ error: done.error }, { status: 500 });
  }

  await rememberCheckoutEmail(service, buyer.buyer.email).catch(() => {});
  return NextResponse.json({ ok: true });
}
