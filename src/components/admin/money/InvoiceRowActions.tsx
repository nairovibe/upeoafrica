"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer, Send, Smartphone } from "lucide-react";
import { toMsisdn } from "@/components/admin/money/format";
import { cn } from "@/lib/utils";

const iconCls =
  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-[5px] text-body hover:bg-surface-3 hover:text-ink-900 disabled:pointer-events-none disabled:opacity-40";

export function InvoiceRowActions({
  id,
  status,
  email,
  phone,
  balance,
}: {
  id: string;
  status: string;
  email: string;
  phone: string | null;
  balance: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [collecting, setCollecting] = useState(false);
  const [stkPhone, setStkPhone] = useState(toMsisdn(phone) || "254");
  const open = status === "draft" || status === "sent";
  const canSend = open && Boolean(email);
  const canCollect = status === "sent" && balance > 0;

  async function post(url: string, body: object, done: string) {
    setBusy(true);
    setMsg(null);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    setBusy(false);
    setMsg(res.ok ? { ok: true, text: json.message || done } : { ok: false, text: json.error || "Something went wrong" });
    if (res.ok) router.refresh();
    return res.ok;
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-0.5">
        <Link href={`/console/invoices/${id}`} className="mr-2 text-[13px] font-medium text-brand-600 hover:underline">
          Open
        </Link>
        <Link href={`/console/invoices/${id}/print`} className={iconCls} title="Print or PDF" aria-label="Print or PDF">
          <Printer className="h-4 w-4" />
        </Link>
        {open ? (
          <button
            type="button"
            className={iconCls}
            disabled={busy || !canSend}
            onClick={() => post("/api/admin/invoices/send", { invoiceId: id }, "Invoice emailed")}
            title={email ? `Email to ${email}` : "Add an email first"}
            aria-label="Email invoice"
          >
            <Send className="h-4 w-4" />
          </button>
        ) : null}
        {canCollect ? (
          <button
            type="button"
            className={cn(iconCls, collecting && "bg-brand-50 text-brand-700")}
            disabled={busy}
            onClick={() => setCollecting((v) => !v)}
            title="Collect with M-Pesa"
            aria-label="Collect with M-Pesa"
            aria-expanded={collecting}
          >
            <Smartphone className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      {collecting ? (
        <form
          className="flex items-center gap-1"
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await post(
              "/api/admin/invoices/collect",
              { invoiceId: id, phone: toMsisdn(stkPhone) || stkPhone },
              "M-Pesa prompt sent",
            );
            if (ok) setCollecting(false);
          }}
        >
          <input
            value={stkPhone}
            onChange={(e) => setStkPhone(e.target.value)}
            inputMode="tel"
            aria-label="M-Pesa number"
            className="h-8 w-32 rounded-[5px] border border-line px-2 text-xs outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={busy}
            className="h-8 cursor-pointer rounded-[5px] bg-brand-500 px-2.5 text-xs font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            Prompt
          </button>
        </form>
      ) : null}
      {msg ? <span className={cn("text-xs", msg.ok ? "text-emerald-600" : "text-red-600")}>{msg.text}</span> : null}
    </div>
  );
}
