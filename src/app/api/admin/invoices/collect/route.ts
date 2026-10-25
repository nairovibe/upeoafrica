import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/cms";
import { startMpesaStk } from "@/lib/intasend";

export async function POST(request: Request) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { invoiceId, phone } = (await request.json()) as { invoiceId?: string; phone?: string };
  const msisdn = (phone ?? "").replace(/\s/g, "");
  if (!invoiceId || !/^254\d{9}$/.test(msisdn)) {
    return NextResponse.json({ error: "Use a Safaricom number in the form 2547XXXXXXXX." }, { status: 400 });
  }
  const supabase = await createClient();
  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", invoiceId).maybeSingle();
  if (!invoice) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const balance = Math.max(0, Number(invoice.total_kes) - Number(invoice.amount_paid_kes || 0));
  if (balance <= 0) {
    return NextResponse.json({ error: "This invoice is already settled." }, { status: 400 });
  }
  const stk = await startMpesaStk({
    amount: balance,
    phone: msisdn,
    email: invoice.bill_email,
    apiRef: invoice.id,
    narrative: invoice.number,
  });
  if (!stk.ok && !("pending" in stk && stk.pending)) {
    return NextResponse.json({ error: stk.message }, { status: 502 });
  }
  if (stk.ok && stk.providerRef) {
    await supabase.from("invoices").update({ provider_ref: stk.providerRef }).eq("id", invoice.id);
  }
  const service = await createServiceClient();
  if (service) {
    await service.from("payments").insert({
      invoice_id: invoice.id,
      provider: "intasend",
      result: "stk_initiated",
      payload: "payload" in stk ? stk.payload : {},
    });
  }
  return NextResponse.json({ ok: true, message: stk.message || "Check the phone for the M-Pesa prompt." });
}
