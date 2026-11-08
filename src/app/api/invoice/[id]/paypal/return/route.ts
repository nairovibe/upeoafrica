import { NextResponse } from "next/server";
import { company } from "@/lib/content";
import { capturePayPalOrder } from "@/lib/paypal";
import { settleInvoice } from "@/lib/invoice-pay";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || company.domain;
  const back = `${origin}/invoice/${id}`;
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!token) return NextResponse.redirect(`${back}?pay=paypal&error=start`);
  const captured = await capturePayPalOrder(token);
  if (!captured.ok || captured.invoiceId !== id || captured.currency !== "KES") {
    return NextResponse.redirect(`${back}?pay=paypal&error=start`);
  }
  const settled = await settleInvoice({
    invoiceId: id,
    provider: "paypal",
    providerRef: token,
    amount: captured.amount,
    payload: captured.payload as never,
  });
  if (!settled.ok) return NextResponse.redirect(`${back}?pay=paypal&error=start`);
  return NextResponse.redirect(`${back}?paid=1`);
}
