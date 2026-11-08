import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/notify";
import { verifyTurnstile } from "@/lib/turnstile";
import { startMpesaStk } from "@/lib/intasend";
import { chargeKes } from "@/lib/offer";
import { parseTiers, tierDue } from "@/lib/tiers";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`pay:${ip}`, 6, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  }

  const body = (await request.json()) as {
    productId?: string;
    tierId?: string;
    email?: string;
    phone?: string;
    turnstileToken?: string;
  };
  if (!(await verifyTurnstile(body.turnstileToken, ip, "checkout"))) {
    return NextResponse.json({ error: "Could not verify this checkout." }, { status: 400 });
  }
  const email = body.email?.trim() ?? "";
  const phone = (body.phone ?? "").replace(/\s/g, "");
  if (!body.productId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^254\d{9}$/.test(phone)) {
    return NextResponse.json(
      { error: "Email and a Safaricom number in the form 2547XXXXXXXX are required." },
      { status: 400 },
    );
  }

  const service = await createServiceClient();
  const supabase = service ?? (await createClient());
  if (!service) {
    return NextResponse.json({ error: "Checkout is not configured yet." }, { status: 503 });
  }
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", body.productId)
    .eq("published", true)
    .maybeSingle();
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  const tiers = parseTiers(product.price_tiers);
  const tier = tiers.length ? tiers.find((item) => item.id === body.tierId) : null;
  if (tiers.length && !tier) {
    return NextResponse.json({ error: "Choose a plan." }, { status: 400 });
  }
  const amount = tier ? tierDue(tier) : chargeKes(product);
  if (amount <= 0) {
    return NextResponse.json({ error: "This item is not for sale yet." }, { status: 400 });
  }

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      email,
      phone,
      product_id: product.id,
      amount_kes: amount,
      tier_label: tier?.name || null,
      provider: "intasend",
      status: "pending",
      kind: "product",
    })
    .select("id")
    .single();
  if (error || !order) {
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }

  const stk = await startMpesaStk({
    amount,
    phone,
    email,
    apiRef: order.id,
    narrative: tier ? `${product.title} · ${tier.name}` : product.title,
  });

  if (stk.pending) {
    return NextResponse.json({
      ok: true,
      orderId: order.id,
      pending: true,
      message: stk.message,
    });
  }

  if (!stk.ok) {
    await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ error: stk.message }, { status: 502 });
  }

  if (stk.providerRef) {
    await supabase.from("orders").update({ provider_ref: stk.providerRef }).eq("id", order.id);
  }

  if (service) {
    await service.from("payments").insert({
      order_id: order.id,
      provider: "intasend",
      result: "stk_initiated",
      payload: stk.payload,
    });
  }

  return NextResponse.json({ ok: true, orderId: order.id });
}
