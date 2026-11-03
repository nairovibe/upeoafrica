import { company } from "@/lib/content";
import type { SiteSettings } from "@/lib/cms";

export type InvoiceLine = { description: string; qty: number; unit: number };

export function kes(n: number) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

export function lineAmount(line: InvoiceLine) {
  return kes((Number(line.qty) || 0) * (Number(line.unit) || 0));
}

export function invoiceTotals(opts: {
  lines: InvoiceLine[];
  showDiscount: boolean;
  discountKind: "amount" | "percent";
  discountValue: number;
  showTax: boolean;
  taxPercent: number;
  showShipping: boolean;
  shipping: number;
  amountPaid: number;
}) {
  const subtotal = kes(opts.lines.reduce((s, l) => s + lineAmount(l), 0));
  const discount = !opts.showDiscount
    ? 0
    : opts.discountKind === "percent"
      ? kes(subtotal * ((Number(opts.discountValue) || 0) / 100))
      : kes(opts.discountValue);
  const afterDiscount = kes(Math.max(0, subtotal - discount));
  const tax = opts.showTax ? kes(afterDiscount * ((Number(opts.taxPercent) || 0) / 100)) : 0;
  const shipping = opts.showShipping ? kes(opts.shipping) : 0;
  const total = kes(afterDiscount + tax + shipping);
  const paid = kes(opts.amountPaid);
  return {
    subtotal,
    discount,
    tax,
    shipping,
    total,
    paid,
    balance: kes(total - paid),
  };
}

export function defaultFromBlock(settings: SiteSettings | null) {
  const name = settings?.legal_name || settings?.trading_name || company.legalName;
  const address = settings?.address_line || company.addressLine;
  return [name, address, "Kenya"].filter(Boolean).join("\n");
}

export function composeBillTo(opts: {
  name?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
}) {
  return [opts.name, opts.company, opts.email, opts.phone].filter(Boolean).join("\n");
}

export function firstLine(block: string) {
  return block.split("\n").map((l) => l.trim()).find(Boolean) || "";
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function plusDaysIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatInvoiceDate(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" });
}

export function statusBanner(status: string, balance: number) {
  if (status === "void") return "VOID";
  if (status === "paid" || balance <= 0) return "PAID";
  if (status === "draft") return "DRAFT";
  return "UNPAID";
}

export function invoiceViewModel(
  invoice: {
    number: string;
    status: string;
    from_block: string | null;
    bill_to_block: string | null;
    bill_name: string;
    bill_email: string;
    bill_phone: string | null;
    bill_company: string | null;
    ship_to: string | null;
    issued_on: string | null;
    due_on: string | null;
    po_number: string | null;
    notes: string | null;
    payment_note: string | null;
    thank_you: string | null;
    discount_kes: number;
    discount_percent: number | null;
    vat_percent: number | null;
    shipping_kes: number;
    amount_paid_kes: number;
    created_at: string;
  },
  items: { description: string; qty: number; unit_kes: number }[],
  settings: SiteSettings | null,
) {
  const lines = items.map((i) => ({
    description: i.description,
    qty: Number(i.qty),
    unit: Number(i.unit_kes),
  }));
  const showDiscount = Number(invoice.discount_kes || 0) > 0 || invoice.discount_percent != null;
  const showTax = invoice.vat_percent != null && Number(invoice.vat_percent) > 0;
  const showShipping = Number(invoice.shipping_kes || 0) > 0;
  const totals = invoiceTotals({
    lines,
    showDiscount,
    discountKind: invoice.discount_percent != null ? "percent" : "amount",
    discountValue: Number(invoice.discount_percent ?? invoice.discount_kes ?? 0),
    showTax,
    taxPercent: Number(invoice.vat_percent ?? 0),
    showShipping,
    shipping: Number(invoice.shipping_kes || 0),
    amountPaid: Number(invoice.amount_paid_kes || 0),
  });
  return {
    number: invoice.number,
    banner: statusBanner(invoice.status, totals.balance),
    fromBlock: invoice.from_block || defaultFromBlock(settings),
    billTo:
      invoice.bill_to_block ||
      composeBillTo({
        name: invoice.bill_name,
        company: invoice.bill_company,
        email: invoice.bill_email,
        phone: invoice.bill_phone,
      }),
    shipTo: invoice.ship_to || "",
    issuedOn: invoice.issued_on || invoice.created_at.slice(0, 10),
    dueOn: invoice.due_on || "",
    poNumber: invoice.po_number || "",
    lines: lines.length ? lines : [{ description: "", qty: 1, unit: 0 }],
    specs: invoice.notes || "",
    paymentAdvice: invoice.payment_note || settings?.payment_note || "",
    thankYou: invoice.thank_you || "Thank you for working with us!",
    showDiscount,
    discountKind: (invoice.discount_percent != null ? "percent" : "amount") as "amount" | "percent",
    discountValue: Number(invoice.discount_percent ?? invoice.discount_kes ?? 0),
    showTax,
    taxPercent: Number(invoice.vat_percent ?? 0),
    showShipping,
    shipping: Number(invoice.shipping_kes || 0),
    amountPaid: Number(invoice.amount_paid_kes || 0),
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax: totals.tax,
    total: totals.total,
    balance: totals.balance,
  };
}
