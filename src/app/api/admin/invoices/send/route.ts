import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/cms";
import { sendInvoiceEmail } from "@/lib/notify";
import { company } from "@/lib/content";

export async function POST(request: Request) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { invoiceId } = (await request.json()) as { invoiceId?: string };
  if (!invoiceId) return NextResponse.json({ error: "Missing invoice." }, { status: 400 });
  const supabase = await createClient();
  const { data: invoice } = await supabase.from("invoices").select("*").eq("id", invoiceId).maybeSingle();
  if (!invoice) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const origin = process.env.NEXT_PUBLIC_SITE_URL || company.domain;
  await sendInvoiceEmail({
    to: invoice.bill_email,
    name: invoice.bill_name,
    number: invoice.number,
    total: Number(invoice.total_kes),
    invoiceId: invoice.id,
    url: `${origin}/invoice/${invoice.id}`,
  });
  await supabase.from("invoices").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", invoice.id);
  return NextResponse.json({ ok: true });
}
