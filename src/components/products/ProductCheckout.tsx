"use client";

import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { TurnstileField } from "@/components/security/TurnstileField";
import { PayPalMark } from "@/components/billing/PaymentMarks";
import { MoneyFigure } from "@/components/products/MoneyFigure";
import { company } from "@/lib/content";
import type { PriceCurrency } from "@/lib/constants";

export function ProductCheckout({
  productId,
  tierId,
  title,
  tierName,
  amount,
  currency,
  cancelled,
}: {
  productId: string;
  tierId: string | null;
  title: string;
  tierName: string | null;
  amount: number;
  currency: PriceCurrency;
  cancelled: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const [err, setErr] = useState<string | null>(cancelled ? "Payment was not completed. You can try again." : null);
  const [busy, setBusy] = useState(false);
  const line = tierName ? `${title} · ${tierName}` : title;
  const sales = `https://wa.me/${company.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello, I want to talk about ${line}.`)}`;
  const field = "mt-1 w-full border border-line bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500";

  async function pay(event: React.FormEvent) {
    event.preventDefault();
    if (!captcha) {
      setErr("Complete the verification check before paying.");
      return;
    }
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/checkout/paypal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, tierId, name, email, turnstileToken: captcha }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string; url?: string };
    if (!res.ok || !json.url) {
      setBusy(false);
      setCaptcha("");
      setCaptchaReset((n) => n + 1);
      setErr(json.error || "Checkout failed.");
      return;
    }
    window.location.assign(json.url);
  }

  return (
    <section id="checkout" className="scroll-mt-32 border border-line bg-surface-2 p-6 md:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">Checkout</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900">{line}</h2>
          <p className="mt-3 text-sm leading-relaxed text-body">
            Pay with PayPal. When the payment is confirmed, we email a download link that only this purchase can use.
          </p>
          <p className="mt-6">
            <MoneyFigure amount={amount} currency={currency} size="lg" />
          </p>
        </div>
        <form onSubmit={pay} className="border border-line bg-white p-5">
          <label className="block text-sm font-medium text-ink-900">
            Name
            <input className={field} required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
          </label>
          <label className="mt-4 block text-sm font-medium text-ink-900">
            Email
            <input className={field} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
          </label>
          <div className="mt-4">
            <TurnstileField action="checkout" theme="light" onToken={setCaptcha} resetSignal={captchaReset} />
          </div>
          {err ? (
            <p className="mt-4 text-sm text-red-600" role="alert">
              {err}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="mt-5 inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[5px] bg-[#ffc439] text-sm font-semibold text-[#111] transition-colors duration-200 hover:bg-[#f0b429] disabled:cursor-wait disabled:opacity-70"
          >
            <PayPalMark className="h-5 w-5" />
            {busy ? "Opening PayPal..." : "Pay with PayPal"}
          </button>
          <a
            href={sales}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[5px] border border-line bg-white text-sm font-medium text-ink-900 transition-colors duration-200 hover:border-[#25D366] hover:text-[#128C7E]"
          >
            <FaWhatsapp className="h-4 w-4 text-[#25D366]" aria-hidden />
            Talk to sales
          </a>
        </form>
      </div>
    </section>
  );
}
