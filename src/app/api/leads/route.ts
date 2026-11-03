import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { notifyLead, rateLimit } from "@/lib/notify";
import { verifyTurnstile } from "@/lib/turnstile";
import { UTM_KEYS, type LeadAnswer, type LeadDetails, type LeadUtm } from "@/lib/lead-context";

const SOURCES = ["contact_form", "inquiry", "founders"] as const;
type Source = (typeof SOURCES)[number];

const MAX_BODY_BYTES = 64 * 1024;
const MAX_ANSWERS = 60;
const MAX_LABEL = 200;
const MAX_VALUE = 4000;
const MAX_DETAILS_BYTES = 20 * 1024;

type Body = {
  source?: unknown;
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  company?: unknown;
  services?: unknown;
  stage?: unknown;
  timeline?: unknown;
  budget?: unknown;
  message?: unknown;
  details?: unknown;
  page_url?: unknown;
  referrer?: unknown;
  utm?: unknown;
  turnstileToken?: unknown;
};

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function readDetails(raw: unknown, source: Source): LeadDetails | "invalid" {
  const fallback = source === "contact_form" ? "Contact form" : source === "founders" ? "Founders Zone" : "Project wizard";
  if (raw == null) return { form: fallback, answers: [] };
  if (typeof raw !== "object" || Array.isArray(raw)) return "invalid";
  const { form, answers } = raw as { form?: unknown; answers?: unknown };
  if (answers != null && !Array.isArray(answers)) return "invalid";
  const list = (answers ?? []) as unknown[];
  if (list.length > MAX_ANSWERS) return "invalid";
  const clean: LeadAnswer[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") return "invalid";
    const { label, value } = item as { label?: unknown; value?: unknown };
    if (typeof label !== "string" || !label.trim()) return "invalid";
    const joined = Array.isArray(value) ? value.filter((v) => typeof v === "string").join(", ") : value;
    if (joined != null && typeof joined !== "string") return "invalid";
    clean.push({ label: label.trim().slice(0, MAX_LABEL), value: (joined ?? "").trim().slice(0, MAX_VALUE) });
  }
  return { form: text(form, 80) || fallback, answers: clean };
}

function readUtm(raw: unknown): LeadUtm {
  if (!raw || typeof raw !== "object") return {};
  const utm: LeadUtm = {};
  for (const key of UTM_KEYS) {
    const value = text((raw as Record<string, unknown>)[key], 200);
    if (value) utm[key] = value;
  }
  return utm;
}

function readUrl(raw: unknown) {
  const value = text(raw, 2000);
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`lead:${ip}`)) {
    return NextResponse.json({ error: "Please wait a moment before sending again." }, { status: 429 });
  }

  let body: Body;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Your message is too long." }, { status: 413 });
    }
    body = JSON.parse(raw) as Body;
    if (!body || typeof body !== "object") throw new Error();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = text(body.name, 200);
  const email = text(body.email, 320);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Name and a valid email are required." }, { status: 400 });
  }
  if (!SOURCES.includes(body.source as Source)) {
    return NextResponse.json({ error: "Unknown source." }, { status: 400 });
  }
  const source = body.source as Source;
  const details = readDetails(body.details, source);
  if (details === "invalid" || JSON.stringify(details).length > MAX_DETAILS_BYTES) {
    return NextResponse.json({ error: "Some answers are too long. Shorten them and try again." }, { status: 400 });
  }

  const action = source === "contact_form" ? "contact" : "inquiry";
  if (!(await verifyTurnstile(text(body.turnstileToken, 2048), ip, action))) {
    return NextResponse.json({ error: "Could not verify this submission." }, { status: 400 });
  }

  const services = Array.isArray(body.services)
    ? body.services.filter((s): s is string => typeof s === "string" && s.trim() !== "").slice(0, 20).map((s) => s.trim().slice(0, 120))
    : [];
  const row = {
    source,
    name,
    email,
    phone: text(body.phone, 40) || null,
    company: text(body.company, 200) || null,
    services,
    stage: text(body.stage, 200) || null,
    timeline: text(body.timeline, 200) || null,
    budget: text(body.budget, 200) || null,
    message: text(body.message, 8000) || null,
    details,
    page_url: readUrl(body.page_url),
    referrer: readUrl(body.referrer),
    utm: readUtm(body.utm),
    status: "new" as const,
  };
  // Returning the new id needs the service role. The public policy allows the
  // insert either way, so a missing key still saves the enquiry.
  const service = await createServiceClient();
  let leadId: string | undefined;
  if (service) {
    const { data: lead, error } = await service.from("leads").insert(row).select("id").single();
    if (error) return NextResponse.json({ error: "Could not save your enquiry." }, { status: 500 });
    leadId = lead?.id;
  } else {
    const { error } = await (await createClient()).from("leads").insert(row);
    if (error) return NextResponse.json({ error: "Could not save your enquiry." }, { status: 500 });
  }

  const lines = details.answers.length
    ? details.answers.map((a) => `${a.label}: ${a.value || "-"}`)
    : [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${row.phone || "-"}`,
        `Company: ${row.company || "-"}`,
        `Services: ${services.join(", ") || "-"}`,
        `Stage: ${row.stage || "-"}`,
        `Timeline: ${row.timeline || "-"}`,
        `Budget: ${row.budget || "-"}`,
      ];
  const summary = [
    details.form,
    "",
    ...lines,
    ...(row.message && !details.answers.some((a) => a.value === row.message) ? ["", row.message] : []),
    ...(row.page_url ? ["", `Page: ${row.page_url}`] : []),
  ].join("\n");

  await notifyLead({ name, email, source, summary, leadId }).catch(() => {});

  return NextResponse.json({ ok: true });
}
