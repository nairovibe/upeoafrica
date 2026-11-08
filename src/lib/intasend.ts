export async function startMpesaStk(opts: {
  amount: number;
  phone: string;
  email: string;
  apiRef: string;
  narrative: string;
}) {
  const { intasendCredentials } = await import("@/lib/billing");
  const creds = await intasendCredentials();
  const secret = creds.secret;
  if (!secret) {
    return { ok: false as const, pending: true as const, message: "Order recorded. M-Pesa is waiting on IntaSend keys." };
  }
  const test = creds.test;
  const endpoint = test
    ? "https://sandbox.intasend.com/api/v1/payment/mpesa-stk-push/"
    : "https://payment.intasend.com/api/v1/payment/mpesa-stk-push/";

  const stk = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({
      amount: opts.amount,
      currency: "KES",
      phone_number: opts.phone,
      email: opts.email,
      api_ref: opts.apiRef,
      narrative: opts.narrative,
    }),
  });

  const payload = (await stk.json().catch(() => ({}))) as {
    invoice?: { invoice_id?: string };
    detail?: string;
  };
  if (!stk.ok) {
    return { ok: false as const, pending: false as const, message: payload.detail || "M-Pesa prompt failed.", payload };
  }
  return {
    ok: true as const,
    pending: false as const,
    providerRef: payload.invoice?.invoice_id ?? null,
    payload,
  };
}

export async function startCardCheckout(opts: { amount: number; email: string; apiRef: string; comment: string; redirectUrl: string }) {
  const { intasendCredentials } = await import("@/lib/billing");
  const creds = await intasendCredentials();
  if (!creds.secret || !creds.publishable) {
    return { ok: false as const, error: "Card payments need the IntaSend publishable key and secret." };
  }
  const endpoint = creds.test ? "https://sandbox.intasend.com/api/v1/checkout/" : "https://payment.intasend.com/api/v1/checkout/";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${creds.secret}` },
    body: JSON.stringify({
      public_key: creds.publishable,
      amount: opts.amount,
      currency: "KES",
      email: opts.email,
      api_ref: opts.apiRef,
      redirect_url: opts.redirectUrl,
      comment: opts.comment,
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as { url?: string; detail?: string };
  if (!response.ok || !payload.url) return { ok: false as const, error: payload.detail || "Card checkout did not start." };
  return { ok: true as const, url: payload.url };
}

export async function intasendLive() {
  const { intasendCredentials } = await import("@/lib/billing");
  const creds = await intasendCredentials();
  return Boolean(creds.secret) && !creds.test;
}
