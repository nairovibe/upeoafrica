"use client";

import { Fragment, useState } from "react";
import { ChevronRight } from "lucide-react";
import { EmptyRow, Pill } from "@/components/admin/ui";
import { OrderRowActions } from "@/components/admin/OrderRowActions";
import { orderTone, paymentLabel, paymentTone } from "@/components/admin/money/format";
import { cn } from "@/lib/utils";

export type OrderRow = {
  id: string;
  when: string;
  buyer: string;
  contact: string;
  kind: string;
  item: string;
  itemMeta: string;
  amount: string;
  status: string;
  reference: string;
  providerRef: string | null;
  eventId: string | null;
  details: { label: string; value: string }[];
  payments: { id: string; result: string | null; when: string }[];
};

const HEADERS = ["", "Time", "Buyer", "Item", "Amount", "Status", "Reference", ""];

export function OrdersTable({ rows, empty }: { rows: OrderRow[]; empty: string }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto rounded-[5px] border border-line bg-white">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            {HEADERS.map((h, i) => (
              <th key={i} className={cn("px-4 py-3 font-semibold", i === 0 && "w-10 pr-0", i === 4 && "text-right")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? <EmptyRow colSpan={HEADERS.length}>{empty}</EmptyRow> : null}
          {rows.map((row) => {
            const expanded = open === row.id;
            return (
              <Fragment key={row.id}>
                <tr className={cn("border-b border-line last:border-0", expanded && "bg-surface-2")}>
                  <td className="w-10 py-3 pl-4 pr-0 align-middle">
                    <button
                      type="button"
                      onClick={() => setOpen(expanded ? null : row.id)}
                      aria-expanded={expanded}
                      aria-label={expanded ? "Hide payment details" : "Show payment details"}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-[5px] text-muted hover:bg-surface-3 hover:text-ink-900"
                    >
                      <ChevronRight className={cn("h-4 w-4 transition-transform duration-150", expanded && "rotate-90")} />
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 align-middle text-body tabular-nums">{row.when}</td>
                  <td className="px-4 py-3 align-middle">
                    <p className="font-medium text-ink-900">{row.buyer}</p>
                    {row.contact ? <p className="text-xs text-muted">{row.contact}</p> : null}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <p className="text-ink-900">{row.item}</p>
                    {row.itemMeta ? <p className="text-xs text-muted">{row.itemMeta}</p> : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right align-middle font-medium tabular-nums text-ink-900">
                    {row.amount}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <Pill tone={orderTone(row.status)}>{row.status}</Pill>
                  </td>
                  <td className="px-4 py-3 align-middle font-mono text-xs text-body">{row.reference || "—"}</td>
                  <td className="px-4 py-3 align-middle">
                    <OrderRowActions orderId={row.id} kind={row.kind} status={row.status} eventId={row.eventId} />
                  </td>
                </tr>
                {expanded ? (
                  <tr className="border-b border-line bg-surface-2 last:border-0">
                    <td />
                    <td colSpan={HEADERS.length - 1} className="px-4 pb-4 pt-1">
                      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                        <div className="rounded-[5px] border border-line bg-white">
                          <p className="border-b border-line px-4 py-2.5 text-[13px] font-semibold text-ink-900">
                            Payment attempts
                          </p>
                          {row.payments.length ? (
                            <ul>
                              {row.payments.map((p) => (
                                <li
                                  key={p.id}
                                  className="flex items-center justify-between gap-3 border-b border-line px-4 py-2 last:border-0"
                                >
                                  <Pill tone={paymentTone(p.result)}>{paymentLabel(p.result)}</Pill>
                                  <span className="text-xs tabular-nums text-muted">{p.when}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="px-4 py-3 text-xs text-muted">No callbacks from IntaSend yet.</p>
                          )}
                        </div>
                        <dl className="rounded-[5px] border border-line bg-white px-4 py-1">
                          <DetailRow label="IntaSend reference" value={row.providerRef || "—"} mono />
                          {row.details.map((d) => (
                            <DetailRow key={d.label} label={d.label} value={d.value} />
                          ))}
                          <DetailRow label="Order ID" value={row.id} mono />
                        </dl>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-2 last:border-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className={cn("truncate text-right text-ink-900", mono ? "font-mono text-xs" : "text-[13px]")}>{value}</dd>
    </div>
  );
}
