import { NextResponse } from "next/server";
import { capturePayPalOrder } from "@/lib/paypal";
import { fulfillProductOrder } from "@/lib/product-order";
import type { Json } from "@/lib/database.types";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const token = new URL(request.url).searchParams.get("token") || "";
  const again = `${origin}/products?pay=cancelled`;
  if (!token) return NextResponse.redirect(again);

  const captured = await capturePayPalOrder(token);
  if (!captured.ok || !captured.invoiceId) return NextResponse.redirect(again);

  const settled = await fulfillProductOrder({
    orderId: captured.invoiceId,
    providerRef: token,
    amount: captured.amount,
    currency: captured.currency,
    payload: captured.payload as Json,
    origin,
  });
  if (!settled.ok) return NextResponse.redirect(again);
  return NextResponse.redirect(`${origin}/thank-you?for=order`);
}
