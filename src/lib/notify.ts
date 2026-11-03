import { Resend } from "resend";
import { company } from "@/lib/content";
import { brandedEmailHtml, RESEND_FROM } from "@/lib/email";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export { verifyTurnstile } from "@/lib/turnstile";

const hits = new Map<string, number[]>();

export function rateLimit(key: string, max = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) return false;
  recent.push(now);
  hits.set(key, recent);
  return true;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fill(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{([a-z_]+)\}/gi, (_, k: string) => vars[k] ?? vars[k.toLowerCase()] ?? "");
}

async function deskDb() {
  return (await createServiceClient()) ?? (await createClient());
}

export async function pushDeskEvent(opts: { type: string; title: string; body?: string; href?: string }) {
  const db = await deskDb();
  await db.from("notifications").insert({
    type: opts.type,
    title: opts.title,
    body: opts.body ?? "",
    href: opts.href ?? null,
  });
}

export async function logOutboundEmail(opts: {
  to: string;
  template: string;
  subject: string;
  leadId?: string | null;
  orderId?: string | null;
  invoiceId?: string | null;
  resendId?: string | null;
}) {
  const db = await deskDb();
  await db.from("email_log").insert({
    to_email: opts.to,
    template: opts.template,
    subject: opts.subject,
    lead_id: opts.leadId ?? null,
    order_id: opts.orderId ?? null,
    invoice_id: opts.invoiceId ?? null,
    resend_id: opts.resendId ?? null,
  });
}

async function sendHtml(opts: {
  to: string;
  subject: string;
  preview: string;
  heading: string;
  body: string;
  replyTo?: string;
  buttonLabel?: string;
  buttonUrl?: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const resend = new Resend(key);
  const result = await resend.emails.send({
    from: RESEND_FROM,
    to: opts.to,
    replyTo: opts.replyTo,
    subject: opts.subject,
    text: opts.body.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, ""),
    html: brandedEmailHtml({
      preview: opts.preview,
      heading: opts.heading,
      body: opts.body,
      buttonLabel: opts.buttonLabel,
      buttonUrl: opts.buttonUrl,
      sentTo: opts.to,
    }),
  });
  return result.data?.id ?? null;
}

export async function notifyLead(payload: {
  name: string;
  email: string;
  source: string;
  summary: string;
  leadId?: string;
}) {
  const first = payload.name.split(" ")[0] || payload.name;
  const kind =
    payload.source === "inquiry"
      ? "project enquiry"
      : payload.source === "founders"
        ? "Founders Zone enquiry"
        : payload.source === "event"
          ? "event enquiry"
          : "contact";
  const html = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/\n/g, "<br />");
  const db = await deskDb();
  const { data: settings } = await db.from("site_settings").select("*").eq("id", 1).maybeSingle();
  const hours = String(settings?.autoresponder_hours ?? 24);
  const enabled = settings?.autoresponder_enabled !== false;
  const subject =
    settings?.autoresponder_subject || "We have your message. Upeo Africa Technologies";
  const bodyTpl =
    settings?.autoresponder_body ||
    "Thank you for writing to Upeo Africa Technologies. We have your message, and someone from the team will get in touch within {hours} hours.";
  const ack = fill(bodyTpl, { first_name: first, hours, name: payload.name });

  await pushDeskEvent({
    type: "lead",
    title: `New ${kind}: ${payload.name}`,
    body: payload.summary.slice(0, 180),
    href: payload.leadId ? `/console/leads/${payload.leadId}` : "/console/leads",
  }).catch(() => {});

  const studioId = await sendHtml({
    to: settings?.public_email || company.email,
    replyTo: payload.email,
    subject: `New ${kind}: ${payload.name}`,
    preview: `New ${kind} from ${payload.name}.`,
    heading: `New ${kind}`,
    body: html(payload.summary),
  });
  await logOutboundEmail({
    to: settings?.public_email || company.email,
    template: "lead_studio",
    subject: `New ${kind}: ${payload.name}`,
    leadId: payload.leadId,
    resendId: studioId,
  }).catch(() => {});

  if (!enabled) return;

  const ackId = await sendHtml({
    to: payload.email,
    subject,
    preview: `We have your message and will get in touch within ${hours} hours.`,
    heading: `Hello, ${escapeHtml(first)}.`,
    body: html(ack),
  });
  await logOutboundEmail({
    to: payload.email,
    template: "lead_ack",
    subject,
    leadId: payload.leadId,
    resendId: ackId,
  }).catch(() => {});
}

export async function sendLeadReply(opts: {
  to: string;
  name: string;
  body: string;
  leadId: string;
}) {
  const first = opts.name.split(" ")[0] || opts.name;
  const subject = `Upeo Africa Technologies`;
  const id = await sendHtml({
    to: opts.to,
    replyTo: company.email,
    subject,
    preview: opts.body.slice(0, 80),
    heading: `Hello, ${escapeHtml(first)}.`,
    body: escapeHtml(opts.body).replace(/\n/g, "<br />"),
  });
  await logOutboundEmail({
    to: opts.to,
    template: "lead_reply",
    subject,
    leadId: opts.leadId,
    resendId: id,
  }).catch(() => {});
  return Boolean(id || !process.env.RESEND_API_KEY);
}

export async function notifyBuyerReceipt(opts: {
  email: string;
  amount: number;
  title: string;
  orderId?: string;
  invoiceId?: string;
  downloadUrl?: string;
  kind?: string;
}) {
  const subject =
    opts.kind === "ticket"
      ? `Your ticket: ${opts.title}`
      : opts.kind === "invoice"
        ? `Receipt: ${opts.title}`
        : `Receipt: ${opts.title}`;
  const extra = opts.downloadUrl
    ? ` Your download is ready for seven days.`
    : opts.kind === "ticket"
      ? ` Show this email at the door, or keep it on your phone.`
      : "";
  const id = await sendHtml({
    to: opts.email,
    subject,
    preview: `KES ${opts.amount.toLocaleString("en-KE")} · ${opts.title}`,
    heading: "Payment received.",
    body: `Thank you. We received KES ${opts.amount.toLocaleString("en-KE")} for ${opts.title}.${extra}`,
    buttonLabel: opts.downloadUrl ? "Download file" : undefined,
    buttonUrl: opts.downloadUrl,
  });
  await logOutboundEmail({
    to: opts.email,
    template: "order_receipt",
    subject,
    orderId: opts.orderId,
    invoiceId: opts.invoiceId,
    resendId: id,
  }).catch(() => {});
  await pushDeskEvent({
    type: "order",
    title: `Paid: ${opts.title}`,
    body: opts.email,
    href: opts.invoiceId ? `/console/invoices/${opts.invoiceId}` : "/console/orders",
  }).catch(() => {});
}

export async function sendInvoiceEmail(opts: {
  to: string;
  name: string;
  number: string;
  total: number;
  invoiceId: string;
  url: string;
}) {
  const subject = `Invoice ${opts.number} from Upeo Africa Technologies`;
  const id = await sendHtml({
    to: opts.to,
    replyTo: company.email,
    subject,
    preview: `${opts.number} · KES ${opts.total.toLocaleString("en-KE")}`,
    heading: `Invoice ${opts.number}`,
    body: `Hello, ${escapeHtml(opts.name.split(" ")[0] || opts.name)}. Please find invoice ${opts.number} for KES ${opts.total.toLocaleString("en-KE")}. You can view or print it from the link below.`,
    buttonLabel: "View invoice",
    buttonUrl: opts.url,
  });
  await logOutboundEmail({
    to: opts.to,
    template: "invoice_send",
    subject,
    invoiceId: opts.invoiceId,
    resendId: id,
  }).catch(() => {});
}

export async function firePublishWebhook(body: {
  type: "article" | "product" | "work" | "event";
  title: string;
  url: string;
  excerpt?: string;
}) {
  const hook =
    process.env.SOCIAL_PUBLISH_WEBHOOK_URL ||
    (await import("@/lib/cms").then((m) => m.getSettings().then((s) => s?.social_publish_webhook_url)));
  if (!hook) return;
  await fetch(hook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}
