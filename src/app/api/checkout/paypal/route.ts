import { NextResponse } from "next/server";
import { chargeLines, checkoutItems, insertCheckoutOrders, pricedLines, readBuyer } from "@/lib/product-checkout";
import { failCheckoutBatch } from "@/lib/product-order";
import { rateLimit, verifyTurnstile } from "@/lib/notify";
import { createPayPalOrder } from "@/lib/paypal";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`paypal-product:${ip}`, 6, 10 * 60 * 1000)) {
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
  const charged = await chargeLines(priced.lines, "paypal");
  if (!charged.ok) return NextResponse.json({ error: charged.error }, { status: 400 });

  const created = await insertCheckoutOrders(service, buyer.buyer, charged.rows, "paypal", null);
  if (!created.ok) return NextResponse.json({ error: created.error }, { status: 500 });

  const origin = new URL(request.url).origin;
  const description = charged.rows.map((row) => row.title).join(", ").slice(0, 120);
  const paypal = await createPayPalOrder({
    invoiceId: created.ids[0],
    number: created.ids[0].slice(0, 8),
    amount: charged.total,
    currency: charged.currency,
    description,
    returnUrl: `${origin}/api/checkout/paypal/return`,
    cancelUrl: `${origin}/products/checkout?pay=cancelled`,
  });
  if (!paypal.ok) {
    await failCheckoutBatch(created.ids[0]);
    return NextResponse.json({ error: paypal.error }, { status: 502 });
  }

  await service.from("orders").update({ provider_ref: paypal.orderId }).in("id", created.ids);
  return NextResponse.json({ ok: true, url: paypal.url });
}
