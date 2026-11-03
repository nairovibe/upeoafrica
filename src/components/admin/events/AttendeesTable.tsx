"use client";

import { useMemo, useState } from "react";
import { Check, Download, Search } from "lucide-react";
import { AdminBtn, AdminTable, Pill, inputClass, type PillTone } from "@/components/admin/ui";
import { createClient } from "@/lib/supabase/client";
import { formatKes } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type AttendeeRow = {
  id: string;
  name: string | null;
  company: string | null;
  email: string;
  phone: string | null;
  ticket: string;
  quantity: number;
  amount: number;
  code: string | null;
  status: string;
  checkedInAt: string | null;
  createdAt: string;
};

const TONES: Record<string, PillTone> = { paid: "success", pending: "warning", failed: "danger", refunded: "neutral" };

function csvCell(value: string | number | null) {
  const s = value == null ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function time(iso: string) {
  return new Date(iso).toLocaleString("en-KE", { timeZone: "Africa/Nairobi", dateStyle: "medium", timeStyle: "short" });
}

export function AttendeesTable({ rows, canCheckIn, fileName }: { rows: AttendeeRow[]; canCheckIn: boolean; fileName: string }) {
  const [query, setQuery] = useState("");
  const [checks, setChecks] = useState<Record<string, string | null>>({});
  const [pending, setPending] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const checkedAt = (r: AttendeeRow) => (r.id in checks ? checks[r.id] : r.checkedInAt);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.email, r.phone, r.code, r.company, r.ticket].some((v) => v?.toLowerCase().includes(q)),
    );
  }, [rows, query]);

  async function toggle(r: AttendeeRow) {
    const next = checkedAt(r) ? null : new Date().toISOString();
    setPending(r.id);
    setErr(null);
    const { data, error } = await createClient().rpc("check_in_ticket", {
      p_order_id: r.id,
      p_checked_in: next !== null,
    });
    setPending(null);
    if (error) return setErr(/ticket_not_found/.test(error.message) ? "Only paid tickets can be checked in." : error.message);
    setChecks((c) => ({ ...c, [r.id]: data ?? null }));
  }

  function exportCsv() {
    const header = ["Name", "Email", "Phone", "Company", "Ticket", "Quantity", "Amount KES", "Code", "Status", "Checked in", "Ordered"];
    const lines = filtered.map((r) =>
      [r.name, r.email, r.phone, r.company, r.ticket, r.quantity, r.amount, r.code, r.status, checkedAt(r) ?? "", r.createdAt]
        .map(csvCell)
        .join(","),
    );
    const blob = new Blob([[header.join(","), ...lines].join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            className={inputClass + " pl-9"}
            placeholder="Search name, email, phone or code"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <AdminBtn variant="ghost" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
          Export CSV
        </AdminBtn>
      </div>
      {err ? <p className="text-sm text-red-600">{err}</p> : null}
      <AdminTable
        headers={["Attendee", "Phone", "Ticket", "Qty", "Code", "Status", "Checked in"]}
        empty={query ? "No attendees match that search." : "No ticket orders yet."}
        rows={filtered.map((r) => {
          const at = checkedAt(r);
          return [
            <div key="who" className="min-w-0">
              <p className="font-medium">{r.name || r.email}</p>
              <p className="text-xs text-muted">
                {[r.email, r.company].filter(Boolean).join(" · ")}
              </p>
            </div>,
            <span key="phone" className="whitespace-nowrap tabular-nums">
              {r.phone || "-"}
            </span>,
            <div key="ticket">
              <p>{r.ticket}</p>
              <p className="text-xs text-muted">{r.amount > 0 ? formatKes(r.amount) : "Free"}</p>
            </div>,
            <span key="qty" className="tabular-nums">
              {r.quantity}
            </span>,
            <span key="code" className="whitespace-nowrap font-mono text-xs">
              {r.code || "-"}
            </span>,
            <Pill key="status" tone={TONES[r.status] ?? "neutral"}>
              {r.status}
            </Pill>,
            r.status === "paid" ? (
              <button
                key="check"
                type="button"
                disabled={!canCheckIn || pending === r.id}
                onClick={() => toggle(r)}
                title={at ? time(at) : undefined}
                className={cn(
                  "inline-flex h-8 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[5px] px-2.5 text-xs font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60",
                  at ? "bg-brand-500 text-white hover:bg-brand-600" : "border border-line bg-white text-body hover:border-brand-300",
                )}
              >
                {at ? <Check className="h-3.5 w-3.5" aria-hidden /> : null}
                {at ? "Checked in" : "Check in"}
              </button>
            ) : (
              <span key="check" className="text-xs text-muted">
                -
              </span>
            ),
          ];
        })}
      />
    </div>
  );
}
