import { NextResponse } from "next/server";
import { company } from "@/lib/content";
import { createPayPalOrder } from "@/lib/paypal";
import { loadPayableInvoice } from "@/lib/invoice-pay";
import { rateLimit } from "@/lib/notify";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || company.domain;
  const back = `${origin}/invoice/${id}`;
  if (!rateLimit(`paypal:${id}`, 8, 10 * 60 * 1000)) {
    return NextResponse.redirect(`${back}?pay=paypal&error=rate`);
  }
  const loaded = await loadPayableInvoice(id);
  if (!loaded.ok) return NextResponse.redirect(`${back}?error=closed`);
  const order = await createPayPalOrder({
    invoiceId: id,
    number: loaded.invoice.number,
    amount: loaded.balance,
    returnUrl: `${origin}/api/invoice/${id}/paypal/return`,
    cancelUrl: `${back}?pay=paypal&cancelled=1`,
  });
  if (!order.ok) return NextResponse.redirect(`${back}?pay=paypal&error=start`);
  return NextResponse.redirect(order.url);
}
