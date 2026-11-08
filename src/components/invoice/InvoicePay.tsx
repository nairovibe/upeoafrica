"use client";

import { useState } from "react";
import { PaymentMark } from "@/components/billing/PaymentMarks";
import type { BillingCard } from "@/lib/billing";
import { formatKes } from "@/lib/constants";

const COPY: Record<string, string> = {
  mpesa: "Pay with M-Pesa",
  card: "Pay with card",
  airtel: "Pay with Airtel Money",
  paypal: "Pay with PayPal",
  bank: "Bank transfer",
};

export function InvoicePay({
  invoiceId,
  balance,
  methods,
  focus,
  paid,
  cancelled,
  failed,
}: {
  invoiceId: string;
  balance: number;
  methods: BillingCard[];
  focus: string;
  paid: boolean;
  cancelled: boolean;
  failed: boolean;
}) {
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(paid ? "Payment received. Thank you." : null);
  const [error, setError] = useState<string | null>(
    cancelled ? "The payment was cancelled." : failed ? "The payment did not start. Try again, or use another method." : null,
  );
  const bank = methods.find((method) => method.id === "bank");

  async function prompt(method: "mpesa" | "airtel") {
    setBusy(method);
    setError(null);
    setMessage(null);
    const response = await fetch(`/api/invoice/${invoiceId}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, phone }),
    });
    const payload = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
    setBusy(null);
    if (!response.ok) {
      setError(payload.error || "The payment did not start.");
      return;
    }
    setMessage(payload.message || "Approve the prompt on your phone.");
  }

  if (paid) {
    return <p className="mt-6 rounded-[5px] bg-white px-5 py-4 text-sm text-ink-900">Payment received. Thank you.</p>;
  }
  if (!methods.length || balance <= 0) return null;

  return (
    <section className="mt-6 rounded-[5px] bg-white p-5 shadow-[0_1px_8px_rgba(15,23,42,0.08)] sm:p-6">
      <h2 className="font-display text-lg font-semibold text-ink-900">Pay {formatKes(balance)}</h2>
      <p className="mt-1 text-sm text-body">Choose a method. Card and PayPal open straight away. M-Pesa and Airtel Money send a prompt to your phone.</p>
      {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      <div className="mt-4 grid gap-3">
        {methods.map((method) => {
          const open = focus === method.id;
          if (method.id === "paypal" || method.id === "card") {
            return (
              <a key={method.id} href={`/api/invoice/${invoiceId}/${method.id}`} className="flex items-center gap-3 rounded-[5px] border border-line px-3 py-3 hover:border-ink-900">
                <PaymentMark id={method.id} className="h-6 w-auto" />
                <span className="text-sm font-medium text-ink-900">{COPY[method.id]}</span>
              </a>
            );
          }
          if (method.id === "bank") {
            const config = bank?.publicConfig ?? {};
            return (
              <div key={method.id} className="rounded-[5px] border border-line px-3 py-3">
                <div className="flex items-center gap-3">
                  <PaymentMark id="bank" />
                  <span className="text-sm font-medium text-ink-900">Bank transfer</span>
                </div>
                {open || focus === "" ? (
                  <dl className="mt-3 grid gap-1 text-sm text-body">
                    <div>{config.bank_name}</div>
                    <div>{config.account_name}</div>
                    <div className="font-medium text-ink-900">{config.account_number}</div>
                    {config.branch ? <div>Branch: {config.branch}</div> : null}
                    {config.swift ? <div>SWIFT: {config.swift}</div> : null}
                    {config.note ? <div>{config.note}</div> : null}
                  </dl>
                ) : null}
              </div>
            );
          }
          return (
            <form
              key={method.id}
              className="rounded-[5px] border border-line px-3 py-3"
              onSubmit={(event) => {
                event.preventDefault();
                void prompt(method.id as "mpesa" | "airtel");
              }}
            >
              <div className="flex items-center gap-3">
                <PaymentMark id={method.id} className="h-6 w-auto" />
                <span className="text-sm font-medium text-ink-900">{COPY[method.id]}</span>
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  className="h-11 w-full rounded-[5px] border border-line px-3 text-sm text-ink-900 outline-none focus:border-brand-500 sm:flex-1"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="07xx xxx xxx"
                  aria-label="Phone number"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  required
                />
                <button type="submit" disabled={busy === method.id} className="h-11 rounded-[5px] bg-ink-900 px-4 text-sm font-medium text-white disabled:opacity-60">
                  {busy === method.id ? "Sending…" : "Send prompt"}
                </button>
              </div>
            </form>
          );
        })}
      </div>
    </section>
  );
}
