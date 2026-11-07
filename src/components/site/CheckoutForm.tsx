"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { TurnstileField } from "@/components/security/TurnstileField";
import { goToThanks } from "@/lib/thanks";

const POLL_MS = 3000;
const POLL_LIMIT = 40;

export function CheckoutForm({ productId }: { productId: string }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("254");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [captcha, setCaptcha] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const tries = useRef(0);
  const confirmed = useRef(false);

  useEffect(() => {
    if (!waiting || !orderId) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const check = async () => {
      if (stopped) return;
      tries.current += 1;
      const res = await fetch(`/api/checkout/status?order=${orderId}`, { cache: "no-store" }).catch(() => null);
      const json = res?.ok ? ((await res.json()) as { status?: string; amount?: number }) : null;
      if (stopped) return;
      if (json?.status === "paid") {
        if (!confirmed.current) {
          confirmed.current = true;
          goToThanks("order", { value: json.amount });
        }
        return;
      }
      if (json?.status === "failed" || json?.status === "cancelled") {
        setWaiting(false);
        setErr("Payment did not go through. No money was taken.");
        return;
      }
      if (tries.current >= POLL_LIMIT) {
        setWaiting(false);
        setErr("Still waiting on the payment. If you paid, the download arrives by email.");
        return;
      }
      timer = setTimeout(check, POLL_MS);
    };
    timer = setTimeout(check, POLL_MS);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [waiting, orderId]);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!captcha) {
      setErr("Complete the verification check before paying.");
      return;
    }
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, email, phone, turnstileToken: captcha }),
    });
    const json = (await res.json()) as { error?: string; orderId?: string };
    setBusy(false);
    if (!res.ok || !json.orderId) {
      setCaptcha("");
      setCaptchaReset((n) => n + 1);
      return setErr(json.error || "Checkout failed.");
    }
    tries.current = 0;
    setOrderId(json.orderId);
    setWaiting(true);
  }

  const field =
    "mt-1 w-full rounded-[5px] border border-line bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500";

  if (waiting) {
    return (
      <div className="rounded-[5px] border border-line bg-white p-5" aria-live="polite">
        <Loader2 className="h-5 w-5 animate-spin text-brand-600" aria-hidden />
        <h2 className="mt-4 font-display text-xl font-semibold text-ink-900">Check your phone</h2>
        <p className="mt-1 text-sm text-body">Approve the M-Pesa prompt. This page moves on once the payment is confirmed.</p>
      </div>
    );
  }

  return (
    <form onSubmit={pay} className="space-y-4">
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
      <TurnstileField action="checkout" theme="light" onToken={setCaptcha} resetSignal={captchaReset} />
      {err ? (
        <p className="text-sm text-red-600" role="alert">
          {err}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[5px] bg-brand-500 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {busy ? "Sending M-Pesa prompt..." : "Pay with M-Pesa"}
        {busy ? null : <ArrowRight className="h-4 w-4" aria-hidden />}
      </button>
    </form>
  );
}
