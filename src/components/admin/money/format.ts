import type { PillTone } from "@/components/admin/ui";

const TZ = "Africa/Nairobi";

export function formatWhen(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-KE", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDay(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso.length === 10 ? `${iso}T12:00:00+03:00` : iso);
  return d.toLocaleDateString("en-KE", { timeZone: TZ, day: "numeric", month: "short", year: "numeric" });
}

/** YYYY-MM-DD in Nairobi time, comparable with `date` columns. */
export function todayNairobi() {
  return new Date().toLocaleDateString("en-CA", { timeZone: TZ });
}

export function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export function monthStartNairobi() {
  return `${todayNairobi().slice(0, 7)}-01`;
}

/** Strips characters that break PostgREST `or()` filters. */
export function cleanQuery(q: string | undefined) {
  return (q ?? "").replace(/[,()*%\\"]/g, " ").trim().slice(0, 80);
}

/** Normalises 07XX / 7XX / +254 numbers to 2547XXXXXXXX for M-Pesa. */
export function toMsisdn(phone: string | null | undefined) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (/^254\d{9}$/.test(digits)) return digits;
  if (/^0\d{9}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^\d{9}$/.test(digits)) return `254${digits}`;
  return "";
}

export function orderTone(status: string): PillTone {
  if (status === "paid") return "success";
  if (status === "failed") return "danger";
  return "warning";
}

export function paymentTone(result: string | null): PillTone {
  const r = (result ?? "").toUpperCase();
  if (["COMPLETE", "COMPLETED", "PAID", "SUCCESS"].includes(r)) return "success";
  if (["FAILED", "CANCELLED"].includes(r)) return "danger";
  return "neutral";
}

export function paymentLabel(result: string | null) {
  const r = (result ?? "").toLowerCase();
  if (!r) return "Unknown";
  if (r === "stk_initiated") return "Prompt sent";
  return r.replace(/_/g, " ");
}

export type InvoiceState = "draft" | "sent" | "overdue" | "paid" | "void";

export function invoiceState(inv: { status: string; due_on: string | null }, today: string): InvoiceState {
  if (inv.status === "paid" || inv.status === "void") return inv.status;
  if (inv.status !== "sent") return "draft";
  return inv.due_on && inv.due_on < today ? "overdue" : "sent";
}

export function invoiceTone(state: InvoiceState): PillTone {
  if (state === "paid") return "success";
  if (state === "overdue") return "danger";
  if (state === "sent") return "brand";
  return "neutral";
}

/** The document banner reads PAID for any zero balance, which includes empty drafts. */
export function docBanner(status: string, total: number, balance: number) {
  if (status === "void") return "VOID";
  if (status === "paid" || (total > 0 && balance <= 0)) return "PAID";
  if (status === "draft") return "DRAFT";
  return "UNPAID";
}

export function withParams(base: string, params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
  const s = sp.toString();
  return s ? `${base}?${s}` : base;
}
