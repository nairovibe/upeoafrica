"use client";

import { useEffect, useRef, useState } from "react";
import { goToThanks } from "@/lib/thanks";
import { CalendarPlus, Check, Loader2, Minus, Plus, Smartphone } from "lucide-react";
import { TurnstileField } from "@/components/security/TurnstileField";
import { formatKes } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { formatEventDate, normaliseKePhone, type SalesState } from "@/components/events/utils";

export type TicketOption = {
  id: string;
  name: string;
  description: string;
  price_kes: number;
  list_price_kes?: number;
  promo_label?: string | null;
  max_per_order: number;
  sales_start: string | null;
  sales_end: string | null;
  state: SalesState;
  /** Null when availability cannot be read. */
  remaining: number | null;
};

type Phase = "form" | "submitting" | "waiting" | "paid" | "failed" | "timeout";

const POLL_MS = 3000;
const POLL_LIMIT = 40;

const field =
  "mt-1 w-full rounded-[5px] border border-line bg-white px-3 py-2.5 text-sm text-ink-900 outline-none transition-[border-color] duration-200 focus:border-brand-500";

function ticketNote(t: TicketOption) {
  if (t.state === "soon") return t.sales_start ? `On sale ${formatEventDate(t.sales_start)}` : "On sale soon";
  if (t.state === "closed") return "Sales closed";
  if (t.remaining === 0) return "Sold out";
  if (t.remaining != null && t.remaining <= 20) return `${t.remaining} left`;
  if (t.sales_end) return `Sales end ${formatEventDate(t.sales_end)}`;
  return null;
}

export function TicketCheckoutForm({
  eventId,
  eventSlug,
  tickets,
  eventSeatsLeft,
  closedMessage,
}: {
  eventId: string;
  eventSlug: string;
  tickets: TicketOption[];
  eventSeatsLeft: number | null;
  closedMessage?: string | null;
}) {
  const buyable = (t: TicketOption) => t.state === "open" && t.remaining !== 0 && eventSeatsLeft !== 0;
  const [ticketTypeId, setTicketTypeId] = useState(tickets.find(buyable)?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const [phase, setPhase] = useState<Phase>("form");
  const [err, setErr] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [pollRound, setPollRound] = useState(0);
  const tries = useRef(0);
  const confirmed = useRef(false);

  const selected = tickets.find((t) => t.id === ticketTypeId);
  const free = (selected?.price_kes ?? 0) <= 0;
  const maxQty = Math.max(
    1,
    Math.min(selected?.max_per_order ?? 10, selected?.remaining ?? Infinity, eventSeatsLeft ?? Infinity),
  );
  const qty = Math.min(quantity, maxQty);
  const total = (selected?.price_kes ?? 0) * qty;

  useEffect(() => {
    if (phase !== "paid" || confirmed.current) return;
    confirmed.current = true;
    goToThanks("ticket", {
      value: total,
      ticket: { code, qty, email, eventSlug },
    });
  }, [phase, total, code, qty, email, eventSlug]);

  useEffect(() => {
    if (phase !== "waiting" || !orderId) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const check = async () => {
      if (stopped) return;
      tries.current += 1;
      const res = await fetch(`/api/tickets/status?order=${orderId}`, { cache: "no-store" }).catch(() => null);
      const json = res?.ok ? ((await res.json()) as { status?: string; code?: string | null }) : null;
      if (stopped) return;
      if (json?.status === "paid") {
        setCode(json.code ?? null);
        setPhase("paid");
        return;
      }
      if (json?.status === "failed" || json?.status === "cancelled") {
        setPhase("failed");
        return;
      }
      if (tries.current >= POLL_LIMIT) {
        setPhase("timeout");
        return;
      }
      timer = setTimeout(check, POLL_MS);
    };
    timer = setTimeout(check, POLL_MS);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [phase, orderId, pollRound]);

  function resetCaptcha() {
    setCaptcha("");
    setCaptchaReset((n) => n + 1);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!selected) return setErr("Choose a ticket.");
    const normalised = phone.trim() ? normaliseKePhone(phone) : null;
    if (!free && !normalised) return setErr("Enter a Safaricom number like 0712 345 678.");
    if (free && phone.trim() && !normalised) return setErr("Check the phone number, or leave it empty.");
    if (!captcha) return setErr("Complete the verification check first.");

    setPhase("submitting");
    const res = await fetch("/api/tickets/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId,
        ticketTypeId: selected.id,
        quantity: qty,
        name,
        email,
        phone: normalised ?? "",
        company,
        turnstileToken: captcha,
      }),
    }).catch(() => null);
    const json = res
      ? ((await res.json().catch(() => ({}))) as { error?: string; status?: string; orderId?: string; code?: string })
      : { error: "Network error. Check your connection and try again." };

    if (!res?.ok || !json.orderId) {
      resetCaptcha();
      setPhase("form");
      return setErr(json.error || "Checkout failed. Try again.");
    }
    setOrderId(json.orderId);
    if (json.status === "paid") {
      setCode(json.code ?? null);
      setPhase("paid");
      return;
    }
    tries.current = 0;
    setPhase("waiting");
  }

  function startOver() {
    resetCaptcha();
    setOrderId(null);
    setCode(null);
    setErr(null);
    setPhase("form");
  }

  if (tickets.length === 0) {
    return (
      <Shell>
        <p className="text-sm text-body">Tickets go on sale soon.</p>
      </Shell>
    );
  }

  if (phase === "paid") {
    return (
      <Shell>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Check className="h-5 w-5" aria-hidden />
        </div>
        <h2 className="mt-4 font-display text-xl font-semibold text-ink-900">You are booked</h2>
        <p className="mt-1 text-sm text-body">
          {qty} {qty === 1 ? "ticket" : "tickets"} · sent to {email}
        </p>
        {code ? (
          <div className="mt-5 rounded-[5px] border border-line bg-surface-2 px-4 py-3">
            <p className="text-xs text-muted">Ticket code</p>
            <p className="mt-1 font-display text-2xl font-semibold tracking-[0.12em] text-ink-900">{code}</p>
          </div>
        ) : null}
        <a
          href={`/api/events/${eventSlug}/ics`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:underline"
        >
          <CalendarPlus className="h-4 w-4" aria-hidden />
          Add to calendar
        </a>
      </Shell>
    );
  }

  if (phase === "waiting" || phase === "timeout" || phase === "failed") {
    return (
      <Shell>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            phase === "failed" ? "bg-red-50 text-red-600" : "bg-brand-50 text-brand-600",
          )}
        >
          {phase === "waiting" ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <Smartphone className="h-5 w-5" aria-hidden />
          )}
        </div>
        <div aria-live="polite">
          {phase === "waiting" ? (
            <>
              <h2 className="mt-4 font-display text-xl font-semibold text-ink-900">Check your phone</h2>
              <p className="mt-1 text-sm text-body">
                Enter your M-Pesa PIN to pay {formatKes(total)}. This page updates once Safaricom confirms.
              </p>
            </>
          ) : phase === "timeout" ? (
            <>
              <h2 className="mt-4 font-display text-xl font-semibold text-ink-900">Still waiting</h2>
              <p className="mt-1 text-sm text-body">
                If you paid, your ticket arrives by email within a few minutes.
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-4 font-display text-xl font-semibold text-ink-900">Payment did not go through</h2>
              <p className="mt-1 text-sm text-body">No money was taken. You can try again.</p>
            </>
          )}
        </div>
        {phase !== "waiting" ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {phase === "timeout" ? (
              <button
                type="button"
                onClick={() => {
                  tries.current = 0;
                  setPollRound((n) => n + 1);
                  setPhase("waiting");
                }}
                className="inline-flex h-10 cursor-pointer items-center rounded-[5px] bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600"
              >
                Check again
              </button>
            ) : null}
            <button
              type="button"
              onClick={startOver}
              className={cn(
                "inline-flex h-10 cursor-pointer items-center rounded-[5px] px-4 text-sm font-medium",
                phase === "failed"
                  ? "bg-brand-500 text-white hover:bg-brand-600"
                  : "border border-line text-ink-900 hover:border-brand-300",
              )}
            >
              Try again
            </button>
          </div>
        ) : null}
      </Shell>
    );
  }

  const busy = phase === "submitting";
  const anyBuyable = tickets.some(buyable);

  return (
    <Shell>
      <h2 className="font-display text-xl font-semibold text-ink-900">Tickets</h2>
      <div className="mt-4 space-y-2" role="radiogroup" aria-label="Ticket type">
        {tickets.map((t) => {
          const ok = buyable(t) && !closedMessage;
          const active = t.id === ticketTypeId;
          const note = ticketNote(t);
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={!ok || busy}
              onClick={() => setTicketTypeId(t.id)}
              className={cn(
                "w-full cursor-pointer rounded-[5px] border px-4 py-3 text-left transition-colors duration-150 disabled:cursor-not-allowed",
                active ? "border-brand-500 bg-brand-50/40" : "border-line hover:border-brand-300",
                !ok && "opacity-60",
              )}
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="font-medium text-ink-900">{t.name}</span>
                <span className="font-display font-semibold text-ink-900">
                  {t.list_price_kes != null && t.list_price_kes > t.price_kes ? (
                    <span className="mr-2 text-xs font-normal text-muted line-through">{formatKes(t.list_price_kes)}</span>
                  ) : null}
                  {t.price_kes > 0 ? formatKes(t.price_kes) : "Free"}
                </span>
              </span>
              {t.description || note ? (
                <span className="mt-0.5 block text-xs text-muted">
                  {[t.promo_label, t.description, note].filter(Boolean).join(" · ")}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {closedMessage || !anyBuyable ? (
        <p className="mt-5 rounded-[5px] bg-surface-2 px-4 py-3 text-sm text-body">
          {closedMessage || (eventSeatsLeft === 0 ? "This event is full." : "No tickets are on sale right now.")}
        </p>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-ink-900">Quantity</span>
            <div className="flex items-center rounded-[5px] border border-line">
              <button
                type="button"
                aria-label="Fewer tickets"
                disabled={qty <= 1 || busy}
                onClick={() => setQuantity(Math.max(1, qty - 1))}
                className="flex h-11 w-11 cursor-pointer items-center justify-center text-ink-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="h-4 w-4" aria-hidden />
              </button>
              <span className="w-8 text-center font-display text-sm font-semibold tabular-nums text-ink-900" aria-live="polite">
                {qty}
              </span>
              <button
                type="button"
                aria-label="More tickets"
                disabled={qty >= maxQty || busy}
                onClick={() => setQuantity(Math.min(maxQty, qty + 1))}
                className="flex h-11 w-11 cursor-pointer items-center justify-center text-ink-900 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>

          <label className="block text-sm font-medium text-ink-900">
            Full name
            <input className={field} required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="block text-sm font-medium text-ink-900">
            Email
            <input
              className={field}
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-ink-900">
            {free ? "Phone (optional)" : "M-Pesa number"}
            <input
              className={field}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required={!free}
              placeholder="0712 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium text-ink-900">
            Company (optional)
            <input
              className={field}
              autoComplete="organization"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </label>

          <p className="font-display text-lg font-semibold text-ink-900">{free ? "Free" : formatKes(total)}</p>
          <TurnstileField action="ticket" theme="light" onToken={setCaptcha} resetSignal={captchaReset} />
          {err ? (
            <p className="text-sm text-red-600" role="alert">
              {err}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy || !selected}
            className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[5px] bg-brand-500 text-sm font-medium text-white transition-colors duration-200 hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {busy
              ? free
                ? "Reserving your seat..."
                : "Sending M-Pesa prompt..."
              : free
                ? qty > 1
                  ? "Get free tickets"
                  : "Get free ticket"
                : "Get it now"}
          </button>
        </form>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[5px] border border-line bg-white p-6">{children}</div>;
}
