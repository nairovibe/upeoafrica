import { createServiceClient } from "@/lib/supabase/server";
import { notifyBuyerReceipt, notifyDeskCopy } from "@/lib/notify";
import { company } from "@/lib/content";
import type { Json } from "@/lib/database.types";

export function invoiceBalance(total: number, paid: number) {
  return Math.max(0, Math.round((total - paid) * 100) / 100);
}

export async function loadPayableInvoice(id: string) {
  const service = await createServiceClient();
  if (!service) return { ok: false as const, error: "Payments are not available right now." };
  const { data } = await service.from("invoices").select("*").eq("id", id).maybeSingle();
  if (!data || data.status === "draft" || data.status === "void") {
    return { ok: false as const, error: "This invoice is not open for payment." };
  }
  const balance = invoiceBalance(Number(data.total_kes), Number(data.amount_paid_kes || 0));
  if (data.status === "paid" || balance <= 0) return { ok: false as const, error: "This invoice is already paid." };
  return { ok: true as const, service, invoice: data, balance };
}

export async function settleInvoice(opts: {
  invoiceId: string;
  provider: string;
  providerRef: string;
  /** Null means the provider confirmed the open balance, as Airtel Money does in its callback. */
  amount: number | null;
  payload: Json;
}) {
  const service = await createServiceClient();
  if (!service) return { ok: false as const, error: "Payments are not available right now." };
  const { data: invoice } = await service.from("invoices").select("*").eq("id", opts.invoiceId).maybeSingle();
  if (!invoice) return { ok: false as const, error: "Invoice not found." };
  if (invoice.status === "paid") return { ok: true as const };
  const balance = invoiceBalance(Number(invoice.total_kes), Number(invoice.amount_paid_kes || 0));
  const paidAmount = opts.amount == null ? balance : opts.amount;
  if (Math.abs(paidAmount - balance) > 1 && Math.abs(paidAmount - Number(invoice.total_kes)) > 1) {
    return { ok: false as const, error: "The amount paid does not match the invoice." };
  }
  const { error } = await service
    .from("invoices")
    .update({
      status: "paid",
      paid_at: new Date().toISOString(),
      provider_ref: opts.providerRef,
      amount_paid_kes: invoice.total_kes,
    })
    .eq("id", invoice.id);
  if (error) return { ok: false as const, error: error.message };
  await service.from("payments").insert({
    invoice_id: invoice.id,
    provider: opts.provider,
    result: "paid",
    payload: opts.payload,
  });
  await notifyBuyerReceipt({
    email: invoice.bill_email,
    amount: Number(invoice.total_kes),
    title: invoice.number,
    invoiceId: invoice.id,
    kind: "invoice",
  }).catch(() => {});
  await notifyDeskCopy({
    subject: `Paid: ${invoice.number}`,
    heading: `Invoice ${invoice.number} is paid`,
    body: `${invoice.bill_name} paid KES ${Number(invoice.total_kes).toLocaleString("en-KE")} by ${opts.provider}.`,
    buttonLabel: "Open invoice",
    buttonUrl: `${company.domain}/console/invoices/${invoice.id}`,
  }).catch(() => {});
  return { ok: true as const };
}
