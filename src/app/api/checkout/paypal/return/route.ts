import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { fulfillCheckoutBatch } from "@/lib/product-order";
import type { Json } from "@/lib/database.types";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const token = new URL(request.url).searchParams.get("token") || "";
  const failed = `${origin}/products/checkout?pay=failed`;
  if (!token) return NextResponse.redirect(failed);

  const captured = await capturePayPalOrder(token);
  if (!captured.ok || !captured.invoiceId) return NextResponse.redirect(failed);

  const settled = await fulfillCheckoutBatch({
    orderId: captured.invoiceId,
    providerRef: token,
    amount: captured.amount,
    currency: captured.currency,
    payload: captured.payload as Json,
    origin,
    provider: "paypal",
  });
  if (!settled.ok) return NextResponse.redirect(failed);
  return NextResponse.redirect(`${origin}/thank-you?for=order`);
}
