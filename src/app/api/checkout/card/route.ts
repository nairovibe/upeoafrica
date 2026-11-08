import { NextResponse } from "next/server";
import { chargeLines, checkoutItems, insertCheckoutOrders, pricedLines, readBuyer } from "@/lib/product-checkout";
import { failCheckoutBatch } from "@/lib/product-order";
import { rateLimit, verifyTurnstile } from "@/lib/notify";
import { startCardCheckout } from "@/lib/intasend";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`card-product:${ip}`, 6, 10 * 60 * 1000)) {
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
  const charged = await chargeLines(priced.lines, "card");
  if (!charged.ok) return NextResponse.json({ error: charged.error }, { status: 400 });

  const created = await insertCheckoutOrders(service, buyer.buyer, charged.rows, "intasend", null);
  if (!created.ok) return NextResponse.json({ error: created.error }, { status: 500 });

  const origin = new URL(request.url).origin;
  const card = await startCardCheckout({
    amount: charged.total,
    email: buyer.buyer.email,
    apiRef: created.ids[0],
    comment: charged.rows.map((row) => row.title).join(", ").slice(0, 120),
    redirectUrl: `${origin}/products/checkout?order=${created.ids[0]}`,
  });
  if (!card.ok) {
    await failCheckoutBatch(created.ids[0]);
    return NextResponse.json({ error: card.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, url: card.url, orderId: created.ids[0], total: charged.total, currency: "KES" });
}
