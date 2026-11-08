import { readSecrets } from "@/lib/billing";

type PayPalConfig = { clientId: string; secret: string; live: boolean };

export async function paypalConfig(): Promise<PayPalConfig | null> {
  const saved = await readSecrets("paypal");
  const clientId = saved?.client_id || "";
  const secret = saved?.secret || "";
  if (!clientId || !secret) return null;
  return { clientId, secret, live: saved?.mode === "live" };
}

function host(live: boolean) {
  return live ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

async function accessToken(config: PayPalConfig) {
  const response = await fetch(`${host(config.live)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const payload = (await response.json().catch(() => ({}))) as { access_token?: string; error_description?: string };
  if (!response.ok || !payload.access_token) {
    return { ok: false as const, error: payload.error_description || "PayPal did not accept the credentials." };
  }
  return { ok: true as const, token: payload.access_token };
}

export async function createPayPalOrder(opts: {
  invoiceId: string;
  number: string;
  amount: number;
  returnUrl: string;
  cancelUrl: string;
  currency?: "KES" | "USD";
  description?: string;
}) {
  const config = await paypalConfig();
  if (!config) return { ok: false as const, error: "PayPal is not switched on." };
  const auth = await accessToken(config);
  if (!auth.ok) return auth;
  const response = await fetch(`${host(config.live)}/v2/checkout/orders`, {
    method: "POST",
    headers: { Authorization: `Bearer ${auth.token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: opts.invoiceId,
          custom_id: opts.invoiceId,
          description: opts.description ?? `Invoice ${opts.number}`,
          amount: { currency_code: opts.currency ?? "KES", value: opts.amount.toFixed(2) },
        },
      ],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Upeo Africa Technologies",
            user_action: "PAY_NOW",
            shipping_preference: "NO_SHIPPING",
            return_url: opts.returnUrl,
            cancel_url: opts.cancelUrl,
          },
        },
      },
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    id?: string;
    links?: { rel: string; href: string }[];
    message?: string;
  };
  const approve = payload.links?.find((link) => link.rel === "payer-action")?.href || payload.links?.find((link) => link.rel === "approve")?.href;
  if (!response.ok || !approve) return { ok: false as const, error: payload.message || "PayPal did not start the payment." };
  return { ok: true as const, url: approve, orderId: payload.id ?? "" };
}

export async function capturePayPalOrder(orderId: string) {
  const config = await paypalConfig();
  if (!config) return { ok: false as const, error: "PayPal is not switched on." };
  const auth = await accessToken(config);
  if (!auth.ok) return auth;
  const response = await fetch(`${host(config.live)}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${auth.token}`, "Content-Type": "application/json" },
  });
  const payload = (await response.json().catch(() => ({}))) as {
    status?: string;
    purchase_units?: { custom_id?: string; payments?: { captures?: { amount?: { value?: string; currency_code?: string } }[] } }[];
    message?: string;
  };
  const capture = payload.purchase_units?.[0]?.payments?.captures?.[0];
  if (!response.ok || payload.status !== "COMPLETED") {
    return { ok: false as const, error: payload.message || "PayPal did not complete the payment." };
  }
  return {
    ok: true as const,
    invoiceId: payload.purchase_units?.[0]?.custom_id ?? "",
    amount: Number(capture?.amount?.value ?? 0),
    currency: capture?.amount?.currency_code ?? "",
    payload,
  };
}
