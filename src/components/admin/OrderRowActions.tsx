"use client";

import { useState } from "react";
import { AdminBtn } from "@/components/admin/ui";

export function OrderRowActions({
  orderId,
  kind,
  status,
}: {
  orderId: string;
  kind: string;
  status: string;
}) {
  const [msg, setMsg] = useState<string | null>(null);
  const paid = status === "paid";

  async function resend() {
    setMsg(null);
    const res = await fetch("/api/admin/orders/receipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const json = (await res.json()) as { error?: string };
    setMsg(res.ok ? "Receipt sent." : json.error || "Could not send.");
  }

  async function copyLink() {
    setMsg(null);
    await navigator.clipboard.writeText(`${window.location.origin}/api/download/${orderId}`);
    setMsg("Download link copied.");
  }

  if (!paid) return <span className="text-xs text-muted">{status}</span>;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <AdminBtn variant="ghost" onClick={resend}>
        Resend receipt
      </AdminBtn>
      {kind === "product" ? (
        <AdminBtn variant="ghost" onClick={copyLink}>
          Copy download
        </AdminBtn>
      ) : null}
      {msg ? <span className="text-xs text-muted">{msg}</span> : null}
    </div>
  );
}
