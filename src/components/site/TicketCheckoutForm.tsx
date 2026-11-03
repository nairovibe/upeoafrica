"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { TurnstileField } from "@/components/security/TurnstileField";
import { formatKes } from "@/lib/constants";
import type { TicketType } from "@/lib/cms";

export function TicketCheckoutForm({
  eventId,
  tickets,
}: {
  eventId: string;
  tickets: TicketType[];
}) {
  const [ticketTypeId, setTicketTypeId] = useState(tickets[0]?.id ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("254");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const selected = tickets.find((t) => t.id === ticketTypeId);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!captcha) {
      setErr("Complete the verification check before paying.");
      return;
    }
    setBusy(true);
    setErr(null);
    setMsg(null);
    const res = await fetch("/api/tickets/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        ticketTypeId,
        name,
        email,
        phone,
        turnstileToken: captcha,
      }),
    });
    const json = (await res.json()) as { error?: string; message?: string; ok?: boolean };
    setBusy(false);
    if (!res.ok) {
      setCaptcha("");
      setCaptchaReset((n) => n + 1);
      return setErr(json.error || "Checkout failed.");
    }
    setMsg(
      json.message ||
        "Check your phone for the M-Pesa prompt. We will email the ticket as soon as Safaricom confirms.",
    );
  }

  const field =
    "mt-1 w-full border border-line bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500";

  if (tickets.length === 0) {
    return <p className="text-sm text-body">Tickets are not on sale yet. Write to us if you need a seat.</p>;
  }

  return (
    <form onSubmit={pay} className="space-y-4">
      {tickets.length > 1 ? (
        <label className="block text-sm font-medium text-ink-900">
          Ticket
          <select className={field} value={ticketTypeId} onChange={(e) => setTicketTypeId(e.target.value)}>
            {tickets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · {t.price_kes > 0 ? formatKes(t.price_kes) : "Free"}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="text-sm text-body">
          {selected?.name} · {selected && selected.price_kes > 0 ? formatKes(selected.price_kes) : "Free"}
        </p>
      )}
      <label className="block text-sm font-medium text-ink-900">
        Name on the ticket
        <input className={field} required value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label className="block text-sm font-medium text-ink-900">
        Email
        <input className={field} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="block text-sm font-medium text-ink-900">
        M-Pesa number
        <input
          className={field}
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\s/g, ""))}
          placeholder="2547XXXXXXXX"
        />
      </label>
      <TurnstileField action="ticket" theme="light" onToken={setCaptcha} resetSignal={captchaReset} />
      {err && <p className="text-sm text-brand-600">{err}</p>}
      {msg && <p className="text-sm text-body">{msg}</p>}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 bg-brand-500 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {busy
          ? "Working..."
          : selected && selected.price_kes > 0
            ? "Pay with M-Pesa"
            : "Claim this seat"}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}
