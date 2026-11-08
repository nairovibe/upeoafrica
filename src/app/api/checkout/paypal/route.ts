import { NextResponse } from "next/server";
import { priceCurrency } from "@/lib/constants";
import { chargeKes } from "@/lib/offer";
import { rateLimit, verifyTurnstile } from "@/lib/notify";
import { parseTiers, tierDue } from "@/lib/tiers";
import { createPayPalOrder } from "@/lib/paypal";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`paypal-product:${ip}`, 6, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts." }, { status: 429 });
  }

  const body = (await request.json()) as {
    productId?: string;
    tierId?: string;
    name?: string;
    email?: string;
    turnstileToken?: string;
  };
  if (!(await verifyTurnstile(body.turnstileToken, ip, "checkout"))) {
    return NextResponse.json({ error: "Could not verify this checkout." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  if (name.length < 2 || name.length > 80 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !body.productId) {
    return NextResponse.json({ error: "A name and a valid email are required." }, { status: 400 });
  }

  const service = await createServiceClient();
  if (!service) return NextResponse.json({ error: "Checkout is not configured yet." }, { status: 503 });

  const { data: product } = await service
    .from("products")
    .select("*")
    .eq("id", body.productId)
    .eq("published", true)
    .maybeSingle();
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const tiers = parseTiers(product.price_tiers);
  const tier = tiers.length ? tiers.find((item) => item.id === body.tierId) : null;
  if (tiers.length && !tier) return NextResponse.json({ error: "Choose a plan." }, { status: 400 });
  const amount = tier ? tierDue(tier) : chargeKes(product);
  if (amount <= 0) return NextResponse.json({ error: "This item is not for sale yet." }, { status: 400 });
  if (!product.file_path) {
    return NextResponse.json({ error: "This product does not have a file to download yet." }, { status: 400 });
  }

  const currency = priceCurrency(product.currency);
  const { data: order, error } = await service
    .from("orders")
    .insert({
      email,
      attendee_name: name,
      product_id: product.id,
      amount_kes: amount,
      currency,
      tier_label: tier?.name || null,
      provider: "paypal",
      status: "pending",
      kind: "product",
    })
    .select("id")
    .single();
  if (error || !order) return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });

  const origin = new URL(request.url).origin;
  const back = `${origin}/products/${product.slug}`;
  const title = tier?.name ? `${product.title} · ${tier.name}` : product.title;
  const paypal = await createPayPalOrder({
    invoiceId: order.id,
    number: order.id.slice(0, 8),
    amount,
    currency,
    description: title,
    returnUrl: `${origin}/api/checkout/paypal/return`,
    cancelUrl: `${back}?pay=cancelled#checkout`,
  });
  if (!paypal.ok) {
    await service.from("orders").update({ status: "failed" }).eq("id", order.id);
    return NextResponse.json({ error: paypal.error }, { status: 502 });
  }

  await service.from("orders").update({ provider_ref: paypal.orderId }).eq("id", order.id);
  return NextResponse.json({ ok: true, url: paypal.url });
}
