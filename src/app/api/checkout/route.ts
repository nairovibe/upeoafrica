import { NextResponse } from "next/server";
import { chargeLines, checkoutItems, insertCheckoutOrders, pricedLines, readBuyer } from "@/lib/product-checkout";
import { failCheckoutBatch } from "@/lib/product-order";
import { rateLimit } from "@/lib/notify";
import { verifyTurnstile } from "@/lib/turnstile";
import { startMpesaStk } from "@/lib/intasend";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`pay:${ip}`, 6, 10 * 60 * 1000)) {
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
    phone?: string;
    turnstileToken?: string;
  };
  if (!(await verifyTurnstile(body.turnstileToken, ip, "checkout"))) {
    return NextResponse.json({ error: "Could not verify this checkout." }, { status: 400 });
  }
  const buyer = readBuyer(body);
  if (!buyer.ok) return NextResponse.json({ error: buyer.error }, { status: 400 });
  const phone = (body.phone ?? "").replace(/\s/g, "");
  if (!/^254\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "Enter a Safaricom number in the form 2547XXXXXXXX." }, { status: 400 });
  }

  const service = await createServiceClient();
  if (!service) return NextResponse.json({ error: "Checkout is not configured yet." }, { status: 503 });

  const priced = await pricedLines(service, checkoutItems(body));
  if (!priced.ok) return NextResponse.json({ error: priced.error }, { status: 400 });
  const charged = await chargeLines(priced.lines, "mpesa");
  if (!charged.ok) return NextResponse.json({ error: charged.error }, { status: 400 });

  const created = await insertCheckoutOrders(service, buyer.buyer, charged.rows, "intasend", phone);
  if (!created.ok) return NextResponse.json({ error: created.error }, { status: 500 });

  const stk = await startMpesaStk({
    amount: charged.total,
    phone,
    email: buyer.buyer.email,
    apiRef: created.ids[0],
    narrative: charged.rows.map((row) => row.title).join(", ").slice(0, 100),
  });

  if (!stk.ok) {
    await failCheckoutBatch(created.ids[0]);
    return NextResponse.json({ error: stk.message }, { status: 502 });
  }

  if (stk.providerRef) {
    await service.from("orders").update({ provider_ref: stk.providerRef }).in("id", created.ids);
  }
  await service.from("payments").insert({
    order_id: created.ids[0],
    provider: "intasend",
    result: "stk_initiated",
    payload: stk.payload,
  });

  return NextResponse.json({
    ok: true,
    orderId: created.ids[0],
    total: charged.total,
    currency: "KES",
    rate: charged.quote?.rate ?? null,
  });
}
