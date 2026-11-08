"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { PaymentMark } from "@/components/billing/PaymentMarks";
import { useCart } from "@/components/products/cart";
import { TurnstileField } from "@/components/security/TurnstileField";
import { Container } from "@/components/ui/Container";
import { formatMoney, type PriceCurrency } from "@/lib/constants";
import { goToThanks } from "@/lib/thanks";
import { cn } from "@/lib/utils";

type Method = "paypal" | "mpesa" | "card";
type Quote = { rate: number; asOf: string; source: string };

const FIELD = "mt-1 w-full border border-line bg-white px-3 py-2.5 text-sm text-ink-900 outline-none focus:border-brand-500";

function websiteOk(value: string) {
  const raw = value.trim();
  if (!raw) return false;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
  } catch {
    return false;
  }
}

export function CheckoutWizard({
  notice,
  watching,
  methods,
}: {
  notice: string | null;
  watching: string | null;
  methods: Record<Method, boolean>;
}) {
  const { items, ready, setOpen } = useCart();
  const [step, setStep] = useState<"details" | "pay" | "waiting" | "confirming">(watching ? "confirming" : "details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [method, setMethod] = useState<Method | null>(() => (["paypal", "mpesa", "card"] as const).find((id) => methods[id]) ?? null);
  const [blocked, setBlocked] = useState<Method | null>(null);
  const [phone, setPhone] = useState("254");
  const [captcha, setCaptcha] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const [err, setErr] = useState<string | null>(
    notice === "cancelled" ? "Payment was cancelled. Nothing was charged." : notice === "failed" ? "Payment did not go through. Nothing was charged." : null,
  );
  const [busy, setBusy] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [rateError, setRateError] = useState<string | null>(null);
  const [watchId, setWatchId] = useState<string | null>(watching);
  const tries = useRef(0);
  const confirmed = useRef(false);

  useEffect(() => {
    setOpen(false);
  }, [setOpen]);

  const usd = items.filter((item) => item.currency === "USD").reduce((sum, item) => sum + item.amount, 0);
  const kes = items.filter((item) => item.currency !== "USD").reduce((sum, item) => sum + item.amount, 0);
  const mixed = usd > 0 && kes > 0;
  const converted = quote && usd > 0 ? Math.round(usd * quote.rate) : null;
  const shillingTotal = kes + (converted ?? 0);
  const singleCurrency: PriceCurrency | null = mixed ? null : usd > 0 ? "USD" : "KES";
  const paypalTotal = items.reduce((sum, item) => sum + item.amount, 0);
  const payable = items.some((item) => item.amount > 0);
  const shillingReady = methods.mpesa || methods.card;
  const needsRate = payable && usd > 0 && shillingReady;

  useEffect(() => {
    if (!needsRate) return;
    let stopped = false;
    fetch("/api/checkout/rate", { cache: "no-store" })
      .then(async (res) => {
        const json = (await res.json().catch(() => ({}))) as Quote & { error?: string };
        if (stopped) return;
        if (!res.ok || !json.rate) {
          setRateError(json.error || "The live shilling rate is unavailable.");
          return;
        }
        setQuote({ rate: json.rate, asOf: json.asOf, source: json.source });
      })
      .catch(() => {
        if (!stopped) setRateError("The live shilling rate is unavailable.");
      });
    return () => {
      stopped = true;
    };
  }, [needsRate]);

  useEffect(() => {
    if ((step !== "waiting" && step !== "confirming") || !watchId) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const check = async () => {
      if (stopped) return;
      tries.current += 1;
      const res = await fetch(`/api/checkout/status?order=${watchId}`, { cache: "no-store" }).catch(() => null);
      const json = res?.ok ? ((await res.json()) as { status?: string; amount?: number }) : null;
      if (stopped) return;
      if (json?.status === "paid") {
        if (!confirmed.current) {
          confirmed.current = true;
          goToThanks("order", { value: json.amount });
        }
        return;
      }
      if (json?.status === "failed") {
        setStep("pay");
        setErr("Payment did not go through. Nothing was charged.");
        return;
      }
      if (tries.current >= 40) {
        setStep("pay");
        setErr("We have not confirmed the payment yet. If the money left your account, the download still arrives by email.");
        return;
      }
      timer = setTimeout(check, 3000);
    };
    timer = setTimeout(check, 1500);
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [step, watchId]);

  function continueDetails(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) return setErr("Enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErr("Enter a valid email. The download link is sent there.");
    if (company.trim().length < 2) return setErr("Enter the company name.");
    if (!websiteOk(website)) return setErr("A website URL is required.");
    setErr(null);
    setStep("pay");
  }

  async function claimFree(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) return setErr("Enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setErr("Enter a valid email. The download link is sent there.");
    if (company.trim().length < 2) return setErr("Enter the company name.");
    if (!websiteOk(website)) return setErr("A website URL is required.");
    if (!captcha) return setErr("Complete the verification check before continuing.");
    setBusy(true);
    setErr(null);
    const res = await fetch("/api/checkout/free", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({ productId: item.productId, tierId: item.tierId })),
        name,
        email,
        company,
        website,
        turnstileToken: captcha,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setBusy(false);
      setCaptcha("");
      setCaptchaReset((n) => n + 1);
      setErr(json.error || "The download could not be sent.");
      return;
    }
    goToThanks("download");
  }

  async function pay(event: React.FormEvent) {
    event.preventDefault();
    if (!method || !methods[method]) return setErr("Method temporarily unavailable");
    if (!captcha) return setErr("Complete the verification check before paying.");
    if (method === "mpesa" && !/^254\d{9}$/.test(phone.replace(/\s/g, ""))) {
      return setErr("Enter a Safaricom number in the form 2547XXXXXXXX.");
    }
    setBusy(true);
    setErr(null);
    const path = method === "paypal" ? "/api/checkout/paypal" : method === "card" ? "/api/checkout/card" : "/api/checkout";
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((item) => ({ productId: item.productId, tierId: item.tierId })),
        name,
        email,
        company,
        website,
        phone: method === "mpesa" ? phone : undefined,
        turnstileToken: captcha,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string; url?: string; orderId?: string };
    if (!res.ok || (!json.url && !json.orderId)) {
      setBusy(false);
      setCaptcha("");
      setCaptchaReset((n) => n + 1);
      setErr(json.error || "Checkout failed.");
      return;
    }
    if (json.url) {
      window.location.assign(json.url);
      return;
    }
    tries.current = 0;
    setWatchId(json.orderId ?? null);
    setStep("waiting");
    setBusy(false);
  }

  if (!ready) {
    return (
      <section className="bg-white pt-36 pb-20">
        <Container>
          <p className="text-sm text-body">Loading your cart.</p>
        </Container>
      </section>
    );
  }

  if (!items.length && step !== "confirming" && step !== "waiting") {
    return (
      <section className="bg-white pt-36 pb-20">
        <Container className="max-w-xl">
          <h1 className="font-display text-4xl font-semibold text-ink-900">Checkout</h1>
          <p className="mt-4 text-base text-body">Your cart is empty.</p>
          <Link href="/products" className="mt-6 inline-flex h-11 items-center gap-2 rounded-[5px] bg-brand-500 px-5 text-sm font-medium text-white hover:bg-brand-600">
            Browse products
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-white pt-36 pb-20 md:pt-44">
      <Container>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Checkout</p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-ink-900 sm:text-4xl">Complete your purchase</h1>
        <ol className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm" aria-label="Checkout steps">
          <li className="flex items-center gap-2 font-medium text-ink-900">
            <span className="inline-flex h-8 w-8 items-center justify-center bg-brand-500 text-white">1</span>
            Your details
          </li>
          {payable ? (
            <>
              <li className="h-px min-w-8 flex-1 bg-line" aria-hidden />
              <li className={cn("flex items-center gap-2 font-medium", step === "details" ? "text-muted" : "text-ink-900")}>
                <span className={cn("inline-flex h-8 w-8 items-center justify-center", step === "details" ? "bg-surface-2 text-muted" : "bg-brand-500 text-white")}>2</span>
                Payment
              </li>
            </>
          ) : null}
        </ol>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            {err ? (
              <p className="mb-6 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {err}
              </p>
            ) : null}
            {step === "waiting" || step === "confirming" ? (
              <div aria-live="polite">
                <Loader2 className="h-5 w-5 animate-spin text-brand-600" aria-hidden />
                <h2 className="mt-4 font-display text-2xl font-semibold text-ink-900">
                  {step === "waiting" ? "Check your phone" : "Confirming the payment"}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-body">
                  {step === "waiting"
                    ? "Approve the M-Pesa prompt. This page moves on once the payment is confirmed."
                    : "We are waiting for the payment to be confirmed. You will be taken to the receipt when it is."}
                </p>
              </div>
            ) : null}
            {step === "details" ? (
              <form onSubmit={payable ? continueDetails : claimFree} className="max-w-xl space-y-4">
                <label className="block text-sm font-medium text-ink-900">
                  Name
                  <input className={FIELD} required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
                </label>
                <label className="block text-sm font-medium text-ink-900">
                  Email
                  <input className={FIELD} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" />
                  <span className="mt-1 block text-xs font-normal text-muted">
                    {payable
                      ? "The download link is sent here."
                      : "The download link is sent here. This address also joins the mailing list."}
                  </span>
                </label>
                <label className="block text-sm font-medium text-ink-900">
                  Company name
                  <input className={FIELD} required value={company} onChange={(event) => setCompany(event.target.value)} autoComplete="organization" />
                </label>
                <label className="block text-sm font-medium text-ink-900">
                  Website URL
                  <input className={FIELD} required value={website} onChange={(event) => setWebsite(event.target.value)} inputMode="url" placeholder="https://" autoComplete="url" />
                  <span className="mt-1 block text-xs font-normal text-muted">Required.</span>
                </label>
                {payable ? null : (
                  <div>
                    <p className="text-sm leading-relaxed text-body">No payment is due for this cart.</p>
                    <div className="mt-4">
                      <TurnstileField action="checkout" theme="light" onToken={setCaptcha} resetSignal={captchaReset} />
                    </div>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={!payable && busy}
                  className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-[5px] bg-brand-500 px-5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {payable ? "Continue" : busy ? "Sending the download..." : "Get the download"}
                  {payable || !busy ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
                </button>
              </form>
            ) : null}
            {payable && step === "pay" ? (
              <form onSubmit={pay} className="max-w-xl">
                <fieldset>
                  <legend className="font-display text-xl font-semibold text-ink-900">Payment method</legend>
                  <div className="mt-4 space-y-3">
                    {methods.paypal ? (
                      <MethodChoice
                        pressed={method === "paypal"}
                        disabled={!singleCurrency}
                        onClick={() => {
                          setBlocked(null);
                          setMethod("paypal");
                        }}
                        mark="paypal"
                        title="PayPal"
                        detail={
                          singleCurrency
                            ? `Pay ${formatMoney(paypalTotal, singleCurrency)}.`
                            : shillingReady
                              ? "PayPal can take one currency at a time. Use a shilling method for this cart."
                              : "PayPal can take one currency at a time."
                        }
                      />
                    ) : null}
                    {methods.mpesa ? (
                      <MethodChoice
                        pressed={method === "mpesa"}
                        disabled={needsRate && !quote}
                        onClick={() => {
                          setBlocked(null);
                          setMethod("mpesa");
                        }}
                        mark="mpesa"
                        title="M-Pesa"
                        detail={shillingDetail(needsRate, quote, rateError, shillingTotal)}
                      />
                    ) : null}
                    {methods.card ? (
                      <MethodChoice
                        pressed={method === "card"}
                        disabled={needsRate && !quote}
                        onClick={() => {
                          setBlocked(null);
                          setMethod("card");
                        }}
                        mark="card"
                        title="Card"
                        detail={shillingDetail(needsRate, quote, rateError, shillingTotal)}
                      />
                    ) : null}
                  </div>
                  {(["paypal", "mpesa", "card"] as const).some((id) => !methods[id]) ? (
                    <div className="mt-2 divide-y divide-line border-t border-line">
                      {(["paypal", "mpesa", "card"] as const)
                        .filter((id) => !methods[id])
                        .map((id) => (
                          <UnavailableMethod key={id} id={id} noted={blocked === id} onClick={() => setBlocked(id)} />
                        ))}
                    </div>
                  ) : null}
                </fieldset>
                {quote && needsRate && method !== "paypal" ? (
                  <p className="mt-4 text-sm leading-relaxed text-body">
                    1 USD = {quote.rate.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KES. Rate from {quote.source}
                    {quote.asOf ? `, updated ${quote.asOf}` : ""}. Dollar prices are converted at this rate because this method charges in shillings.
                  </p>
                ) : null}
                {method === "mpesa" ? (
                  <label className="mt-5 block text-sm font-medium text-ink-900">
                    M-Pesa number
                    <input className={FIELD} required value={phone} onChange={(event) => setPhone(event.target.value.replace(/\s/g, ""))} inputMode="tel" placeholder="2547XXXXXXXX" />
                  </label>
                ) : null}
                <div className="mt-5">
                  <TurnstileField action="checkout" theme="light" onToken={setCaptcha} resetSignal={captchaReset} />
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <button
                    type="submit"
                    disabled={busy || !method || (method === "paypal" && !singleCurrency) || (method !== "paypal" && needsRate && !quote)}
                    className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-[5px] bg-brand-500 px-5 text-sm font-medium text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {busy ? "Starting payment..." : "Pay now"}
                    {busy ? null : <ArrowRight className="h-4 w-4" aria-hidden />}
                  </button>
                  <button type="button" onClick={() => setStep("details")} className="cursor-pointer text-sm font-medium text-ink-900 hover:text-brand-600">
                    Back
                  </button>
                </div>
              </form>
            ) : null}
          </div>
          <aside className="bg-[#EDF3F8] p-5">
            <h2 className="font-display text-lg font-semibold text-ink-900">Your cart</h2>
            <ul className="mt-4 divide-y divide-ink-900/10">
              {items.map((item) => (
                <li key={item.productId} className="flex items-start justify-between gap-3 py-3 text-sm">
                  <span className="min-w-0 break-words text-ink-900">{item.tierName ? `${item.title} · ${item.tierName}` : item.title}</span>
                  <span className="shrink-0 font-medium text-ink-900">{item.amount > 0 ? formatMoney(item.amount, item.currency) : "Free"}</span>
                </li>
              ))}
            </ul>
            {!payable ? <p className="mt-4 text-sm text-ink-900">No payment is due.</p> : null}
            {payable && method !== "paypal" && converted != null ? (
              <p className="mt-4 text-sm text-ink-900">Charged as {formatMoney(shillingTotal, "KES")}</p>
            ) : null}
          </aside>
        </div>
      </Container>
    </section>
  );
}

function shillingDetail(needsRate: boolean, quote: Quote | null, rateError: string | null, total: number) {
  if (needsRate && rateError) return rateError;
  if (needsRate && !quote) return "Loading the live shilling rate.";
  if (needsRate && quote) return `Charged as ${formatMoney(total, "KES")} at the live rate.`;
  return `Pay ${formatMoney(total, "KES")}.`;
}

const METHOD_LABEL: Record<Method, string> = { paypal: "PayPal", mpesa: "M-Pesa", card: "Card" };

function UnavailableMethod({ id, noted, onClick }: { id: Method; noted: boolean; onClick: () => void }) {
  return (
    <button type="button" aria-disabled="true" onClick={onClick} className="flex w-full cursor-pointer items-center justify-between gap-4 py-3 text-left">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-muted">{METHOD_LABEL[id]}</span>
        {noted ? <span className="mt-0.5 block text-[11px] leading-snug text-muted">Method temporarily unavailable</span> : null}
      </span>
      <PaymentMark id={id} className="h-5 w-auto shrink-0 opacity-40" />
    </button>
  );
}

function MethodChoice({
  pressed,
  disabled,
  onClick,
  mark,
  title,
  detail,
}: {
  pressed: boolean;
  disabled: boolean;
  onClick: () => void;
  mark: string;
  title: string;
  detail: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full cursor-pointer items-center justify-between gap-4 border px-4 py-4 text-left",
        pressed ? "border-brand-500 bg-[#EDF3F8]" : "border-line bg-white hover:border-brand-300",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink-900">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-body">{detail}</span>
      </span>
      <PaymentMark id={mark} className="h-6 w-auto shrink-0" />
    </button>
  );
}
