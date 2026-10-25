export async function startMpesaStk(opts: {
  amount: number;
  phone: string;
  email: string;
  apiRef: string;
  narrative: string;
}) {
  const secret = process.env.INTASEND_SECRET_KEY;
  if (!secret) {
    return { ok: false as const, pending: true as const, message: "Order recorded. M-Pesa is waiting on IntaSend keys." };
  }
  const test = process.env.INTASEND_TEST !== "false";
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

export function intasendLive() {
  return Boolean(process.env.INTASEND_SECRET_KEY) && process.env.INTASEND_TEST === "false";
}
