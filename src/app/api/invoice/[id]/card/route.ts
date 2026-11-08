import { NextResponse } from "next/server";
import { company } from "@/lib/content";
import { startCardCheckout } from "@/lib/intasend";
import { loadPayableInvoice } from "@/lib/invoice-pay";
import { rateLimit } from "@/lib/notify";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || company.domain;
  const back = `${origin}/invoice/${id}`;
  if (!rateLimit(`card:${id}`, 8, 10 * 60 * 1000)) return NextResponse.redirect(`${back}?pay=card&error=rate`);
  const loaded = await loadPayableInvoice(id);
  if (!loaded.ok) return NextResponse.redirect(`${back}?error=closed`);
  const checkout = await startCardCheckout({
    amount: Math.round(loaded.balance),
    email: loaded.invoice.bill_email,
    apiRef: id,
    comment: `Invoice ${loaded.invoice.number}`,
    redirectUrl: back,
  });
  if (!checkout.ok) return NextResponse.redirect(`${back}?pay=card&error=start`);
  return NextResponse.redirect(checkout.url);
}
