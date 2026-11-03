"use client";

import { useState } from "react";
import Link from "next/link";

const linkCls = "cursor-pointer whitespace-nowrap text-[13px] font-medium text-brand-600 hover:underline disabled:opacity-50";

export function OrderRowActions({
  orderId,
  kind,
  status,
  eventId,
}: {
  orderId: string;
  kind: string;
  status: string;
  eventId?: string | null;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const paid = status === "paid";

  async function resend() {
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/orders/receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    setMsg(res.ok ? "Receipt sent" : json.error || "Could not send");
  }

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/api/download/${orderId}`);
    setMsg("Link copied");
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
      {paid ? (
        <button type="button" onClick={resend} disabled={busy} className={linkCls}>
          {busy ? "Sending..." : "Resend receipt"}
        </button>
      ) : null}
      {paid && kind === "product" ? (
        <button type="button" onClick={copyLink} className={linkCls}>
          Copy download
        </button>
      ) : null}
      {kind === "ticket" && eventId ? (
        <Link href={`/console/events/${eventId}/attendees`} className={linkCls}>
          Attendees
        </Link>
      ) : null}
      {msg ? <span className="w-full text-right text-xs text-muted">{msg}</span> : null}
    </div>
  );
}
