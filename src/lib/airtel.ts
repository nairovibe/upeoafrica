import { readSecrets } from "@/lib/billing";

function host(live: boolean) {
  return live ? "https://openapi.airtel.africa" : "https://openapiuat.airtel.africa";
}

export function airtelMsisdn(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return "";
}

export async function startAirtelCollection(opts: { phone: string; amount: number; reference: string }) {
  const saved = await readSecrets("airtel");
  const clientId = saved?.client_id || "";
  const clientSecret = saved?.client_secret || "";
  if (!clientId || !clientSecret) return { ok: false as const, error: "Airtel Money is not switched on." };
  const live = saved?.mode === "live";
  const msisdn = airtelMsisdn(opts.phone);
  if (!msisdn) return { ok: false as const, error: "Enter an Airtel number, starting with 07 or 254." };
  const auth = await fetch(`${host(live)}/auth/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "*/*" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, grant_type: "client_credentials" }),
  });
  const token = (await auth.json().catch(() => ({}))) as { access_token?: string; error_description?: string };
  if (!auth.ok || !token.access_token) {
    return { ok: false as const, error: token.error_description || "Airtel Money did not accept the credentials." };
  }
  const response = await fetch(`${host(live)}/merchant/v1/payments/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Content-Type": "application/json",
      Accept: "*/*",
      "X-Country": "KE",
      "X-Currency": "KES",
    },
    body: JSON.stringify({
      reference: "Upeo invoice",
      subscriber: { country: "KE", currency: "KES", msisdn },
      transaction: { amount: opts.amount, country: "KE", currency: "KES", id: opts.reference },
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as {
    status?: { message?: string; success?: boolean };
    data?: { transaction?: { id?: string } };
  };
  if (!response.ok || payload.status?.success === false) {
    return { ok: false as const, error: payload.status?.message || "Airtel Money did not send the prompt." };
  }
  return { ok: true as const, transactionId: payload.data?.transaction?.id || opts.reference };
}
