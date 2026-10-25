"use client";

import { useState } from "react";
import { TurnstileField } from "@/components/security/TurnstileField";

export function CheckoutForm({ productId }: { productId: string }) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("254");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!captcha) {
      setErr("Complete the verification check before paying.");
      return;
    }
    setBusy(true);
    setErr(null);
    setMsg(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, email, phone, turnstileToken: captcha }),
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
        "Check your phone for the M-Pesa prompt. We will email the download as soon as Safaricom confirms.",
    );
  }

  const field =
    "mt-1 w-full border border-line bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500";

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
      <TurnstileField
        action="checkout"
        theme="light"
        onToken={setCaptcha}
        resetSignal={captchaReset}
      />
      {err && <p className="text-sm text-brand-600">{err}</p>}
      {msg && <p className="text-sm text-body">{msg}</p>}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-11 w-full cursor-pointer items-center justify-center bg-brand-500 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50"
      >
        {busy ? "Sending prompt..." : "Pay with M-Pesa"}
      </button>
    </form>
  );
}
