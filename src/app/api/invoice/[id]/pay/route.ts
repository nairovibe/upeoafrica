import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { startMpesaStk } from "@/lib/intasend";
import { startAirtelCollection } from "@/lib/airtel";
import { loadPayableInvoice } from "@/lib/invoice-pay";
import { rateLimit } from "@/lib/notify";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`invoice-pay:${ip}`, 8, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many attempts. Wait a moment, then try again." }, { status: 429 });
  }
  const body = (await request.json().catch(() => null)) as { method?: string; phone?: string } | null;
  const loaded = await loadPayableInvoice(id);
  if (!loaded.ok) return NextResponse.json({ error: loaded.error }, { status: 409 });
  const amount = Math.round(loaded.balance);
  if (body?.method === "mpesa") {
    const phone = (body.phone || "").trim();
    if (!phone) return NextResponse.json({ error: "Enter the M-Pesa number." }, { status: 400 });
    const result = await startMpesaStk({
      amount,
      phone,
      email: loaded.invoice.bill_email,
      apiRef: id,
      narrative: `Invoice ${loaded.invoice.number}`,
    });
    if (!result.ok) return NextResponse.json({ error: result.message }, { status: result.pending ? 503 : 502 });
    return NextResponse.json({ ok: true, message: "Approve the M-Pesa prompt on your phone. This invoice updates once the payment is confirmed." });
  }
  if (body?.method === "airtel") {
    const phone = (body.phone || "").trim();
    const reference = randomBytes(8).toString("hex");
    const result = await startAirtelCollection({ phone, amount, reference });
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 502 });
    const service = await createServiceClient();
    await service?.from("payments").insert({
      invoice_id: id,
      provider: "airtel",
      result: reference,
      payload: { state: "pending" },
    });
    return NextResponse.json({ ok: true, message: "Approve the Airtel Money prompt on your phone. This invoice updates once the payment is confirmed." });
  }
  return NextResponse.json({ error: "Choose a payment method." }, { status: 400 });
}
