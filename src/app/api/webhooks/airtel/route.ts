import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { settleInvoice } from "@/lib/invoice-pay";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    transaction?: { id?: string; status_code?: string; airtel_money_id?: string };
  } | null;
  const id = payload?.transaction?.id;
  const success = payload?.transaction?.status_code === "TS";
  if (!id || !success) return NextResponse.json({ ok: true });
  const service = await createServiceClient();
  if (!service) return NextResponse.json({ error: "Unavailable" }, { status: 503 });
  const { data } = await service.from("payments").select("invoice_id").eq("provider", "airtel").eq("result", id).maybeSingle();
  if (!data?.invoice_id) return NextResponse.json({ ok: true });
  await settleInvoice({
    invoiceId: data.invoice_id,
    provider: "airtel",
    providerRef: payload?.transaction?.airtel_money_id || id,
    amount: null,
    payload: payload as never,
  });
  return NextResponse.json({ ok: true });
}
