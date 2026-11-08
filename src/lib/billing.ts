import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { company } from "@/lib/content";
import { createServiceClient } from "@/lib/supabase/server";

export const BILLING_METHODS = ["mpesa", "card", "airtel", "paypal", "bank"] as const;
export type BillingMethodId = (typeof BILLING_METHODS)[number];

export type BillingCard = {
  id: BillingMethodId;
  enabled: boolean;
  configured: boolean;
  publicConfig: Record<string, string>;
};

export type InvoicePayLink = {
  id: BillingMethodId;
  label: string;
  url: string;
  color: string;
};

type MethodRow = { id: string; enabled: boolean; public_config: Record<string, string> | null };
type SecretRow = { method_id: string; ciphertext: string };

type Db = {
  from: (table: string) => {
    select: (columns: string) => Query;
    upsert: (values: Record<string, unknown>, options?: { onConflict: string }) => Promise<{ error: { message: string } | null }>;
    update: (values: Record<string, unknown>) => Query;
  };
};

interface Query extends PromiseLike<{ data: unknown; error: { message: string } | null }> {
  eq: (column: string, value: string) => Query;
  in: (column: string, value: string[]) => Query;
  maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>;
}

const LABELS: Record<BillingMethodId, string> = {
  mpesa: "M-Pesa",
  card: "Card",
  airtel: "Airtel Money",
  paypal: "PayPal",
  bank: "Bank transfer",
};

const COLORS: Record<BillingMethodId, string> = {
  mpesa: "#00A651",
  card: "#1A1F71",
  airtel: "#ED1C24",
  paypal: "#003087",
  bank: "#0b0e14",
};

function key() {
  const material = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!material) return null;
  return scryptSync(material, "upeo-billing-v1", 32);
}

export function sealSecrets(value: Record<string, string>) {
  const secretKey = key();
  if (!secretKey) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", secretKey, iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64");
}

export function openSecrets(payload: string) {
  const secretKey = key();
  if (!secretKey) return null;
  try {
    const buf = Buffer.from(payload, "base64");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const body = buf.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", secretKey, iv);
    decipher.setAuthTag(tag);
    const json = Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
    const parsed = JSON.parse(json) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [name, value] of Object.entries(parsed)) {
      if (typeof value === "string") out[name] = value;
    }
    return out;
  } catch {
    return null;
  }
}

async function db() {
  const service = await createServiceClient();
  return service ? (service as unknown as Db) : null;
}

function asConfig(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [name, item] of Object.entries(value)) {
    if (typeof item === "string") out[name] = item;
  }
  return out;
}

export function isBillingMethod(value: string): value is BillingMethodId {
  return (BILLING_METHODS as readonly string[]).includes(value);
}

export async function intasendCredentials() {
  const saved = await readSecrets("mpesa");
  const secret = saved?.secret_key || process.env.INTASEND_SECRET_KEY || "";
  const publishable = saved?.publishable_key || process.env.INTASEND_PUBLISHABLE_KEY || "";
  const webhook = saved?.webhook_secret || process.env.INTASEND_WEBHOOK_SECRET || "";
  const test = saved?.mode ? saved.mode !== "live" : process.env.INTASEND_TEST !== "false";
  return { secret, publishable, webhook, test };
}

export async function readSecrets(methodId: string) {
  const client = await db();
  if (!client) return null;
  const { data } = await client.from("billing_secrets").select("ciphertext").eq("method_id", methodId).maybeSingle();
  const ciphertext = typeof data?.ciphertext === "string" ? data.ciphertext : "";
  return ciphertext ? openSecrets(ciphertext) : null;
}

async function methodRows() {
  const client = await db();
  if (!client) return { client: null, rows: [] as MethodRow[], secrets: new Set<string>() };
  const [methods, secretRows] = await Promise.all([
    client.from("billing_methods").select("id, enabled, public_config"),
    client.from("billing_secrets").select("method_id"),
  ]);
  const rows = ((methods.data as MethodRow[] | null) ?? []).map((row) => ({
    ...row,
    public_config: asConfig(row.public_config),
  }));
  const secrets = new Set(((secretRows.data as SecretRow[] | null) ?? []).map((row) => row.method_id));
  return { client, rows, secrets };
}

function configured(id: BillingMethodId, config: Record<string, string>, secrets: Set<string>) {
  if (id === "mpesa" || id === "card") return secrets.has("mpesa") || Boolean(process.env.INTASEND_SECRET_KEY);
  if (id === "paypal") return secrets.has("paypal") && Boolean(config.client_id);
  if (id === "airtel") return secrets.has("airtel") && Boolean(config.client_id);
  return Boolean(config.bank_name && config.account_name && config.account_number);
}

export async function billingCards(): Promise<BillingCard[]> {
  const { rows, secrets } = await methodRows();
  return BILLING_METHODS.map((id) => {
    const row = rows.find((item) => item.id === id);
    const publicConfig = row?.public_config ?? {};
    return {
      id,
      enabled: Boolean(row?.enabled),
      configured: configured(id, publicConfig, secrets),
      publicConfig,
    };
  });
}

export async function saveBillingMethod(input: {
  id: BillingMethodId;
  enabled: boolean;
  publicConfig: Record<string, string>;
  secrets: Record<string, string>;
}) {
  const client = await db();
  if (!client || !key()) return { ok: false as const, error: "Billing storage is not configured on this server." };
  const publicConfig: Record<string, string> = {};
  for (const [name, value] of Object.entries(input.publicConfig)) {
    const clean = value.trim().slice(0, 240);
    if (clean) publicConfig[name] = clean;
  }
  const secretId = input.id === "card" ? "mpesa" : input.id;
  const existing = input.id === "bank" || input.id === "card" ? {} : (await readSecrets(secretId)) ?? {};
  const nextSecrets = { ...existing };
  for (const [name, value] of Object.entries(input.secrets)) {
    const clean = value.trim().slice(0, 500);
    if (clean) nextSecrets[name] = clean;
  }
  if (publicConfig.client_id) nextSecrets.client_id = publicConfig.client_id;
  if (publicConfig.mode) nextSecrets.mode = publicConfig.mode;

  const ready =
    input.id === "bank"
      ? Boolean(publicConfig.bank_name && publicConfig.account_name && publicConfig.account_number)
      : input.id === "paypal"
        ? Boolean(publicConfig.client_id && nextSecrets.secret)
        : input.id === "airtel"
          ? Boolean(publicConfig.client_id && nextSecrets.client_secret)
          : Boolean(nextSecrets.secret_key || process.env.INTASEND_SECRET_KEY || (input.id === "card" && (await hasSecret("mpesa"))));
  if (input.enabled && !ready) {
    const error =
      input.id === "bank"
        ? "Add the bank name, account name, and account number."
        : input.id === "paypal"
          ? "Add the PayPal client ID and secret."
          : input.id === "airtel"
            ? "Add the Airtel Money client ID and secret."
            : "Add the IntaSend secret key. M-Pesa and card payments use it.";
    return { ok: false as const, error };
  }

  const saved = await client.from("billing_methods").upsert(
    { id: input.id, enabled: input.enabled, public_config: publicConfig, updated_at: new Date().toISOString() },
    { onConflict: "id" },
  );
  if (saved.error) return { ok: false as const, error: saved.error.message };
  if (input.id !== "bank" && input.id !== "card" && Object.keys(nextSecrets).length) {
    const ciphertext = sealSecrets(nextSecrets);
    if (!ciphertext) return { ok: false as const, error: "Could not store the credentials." };
    const hidden = await client.from("billing_secrets").upsert(
      { method_id: secretId, ciphertext, updated_at: new Date().toISOString() },
      { onConflict: "method_id" },
    );
    if (hidden.error) return { ok: false as const, error: hidden.error.message };
  }
  return { ok: true as const };
}

async function hasSecret(methodId: string) {
  const client = await db();
  if (!client) return false;
  const { data } = await client.from("billing_secrets").select("method_id").eq("method_id", methodId).maybeSingle();
  return Boolean(data);
}

export async function invoicePayLinks(invoiceId: string, origin = company.domain): Promise<InvoicePayLink[]> {
  const cards = await billingCards();
  const links: InvoicePayLink[] = [];
  for (const card of cards) {
    if (!card.enabled || !card.configured) continue;
    const label = `Pay with ${LABELS[card.id]}`;
    if (card.id === "paypal") links.push({ id: card.id, label, url: `${origin}/api/invoice/${invoiceId}/paypal`, color: COLORS.paypal });
    else if (card.id === "card") links.push({ id: card.id, label, url: `${origin}/api/invoice/${invoiceId}/card`, color: COLORS.card });
    else links.push({ id: card.id, label, url: `${origin}/invoice/${invoiceId}?pay=${card.id}`, color: COLORS[card.id] });
  }
  return links;
}

export function billingLabel(id: BillingMethodId) {
  return LABELS[id];
}
