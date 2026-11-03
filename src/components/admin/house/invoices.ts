import type { PillTone } from "@/components/admin/ui";

export const INVOICE_TONE: Record<string, PillTone> = {
  draft: "neutral",
  sent: "warning",
  paid: "success",
  void: "danger",
};

/** Sent and paid invoices count as billed; drafts and voids do not. */
export function billedTotal(rows: { status: string; total_kes: number }[]) {
  return rows.filter((r) => r.status === "sent" || r.status === "paid").reduce((sum, r) => sum + Number(r.total_kes || 0), 0);
}
