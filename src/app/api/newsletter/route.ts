import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/notify";
import { verifyTurnstile } from "@/lib/turnstile";
import { normalizeEmail } from "@/lib/newsletter";

const MAX_BODY_BYTES = 4 * 1024;

type Body = {
  email?: unknown;
  website?: unknown;
  turnstileToken?: unknown;
};

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`newsletter:${ip}`, 5)) {
    return NextResponse.json({ error: "Please wait a moment before trying again." }, { status: 429 });
  }

  let body: Body;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "That request is too large." }, { status: 413 });
    }
    body = JSON.parse(raw) as Body;
    if (!body || typeof body !== "object") throw new Error();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ ok: true });
  }

  const email = normalizeEmail(body.email);
  if (!email) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!process.env.TURNSTILE_SECRET_KEY && !process.env.TURNSTILE_SECRET) {
    return NextResponse.json(
      { error: "Bot protection is not configured. Submissions are blocked." },
      { status: 503 },
    );
  }

  const token = typeof body.turnstileToken === "string" ? body.turnstileToken : "";
  if (!(await verifyTurnstile(token, ip, "newsletter"))) {
    return NextResponse.json({ error: "Confirm you are not a bot, then subscribe." }, { status: 400 });
  }

  const service = await createServiceClient();
  if (!service) {
    return NextResponse.json({ error: "The mailing list is not available right now." }, { status: 503 });
  }

  const { data: existing, error: readError } = await service
    .from("newsletter_subscribers")
    .select("id, status")
    .eq("email", email)
    .maybeSingle();
  if (readError) {
    return NextResponse.json({ error: "Could not save your email." }, { status: 500 });
  }

  if (existing?.status === "subscribed") {
    return NextResponse.json({ ok: true, already: true });
  }

  if (existing) {
    const { error } = await service
      .from("newsletter_subscribers")
      .update({ status: "subscribed", unsubscribed_at: null, source: "footer" })
      .eq("id", existing.id);
    if (error) return NextResponse.json({ error: "Could not save your email." }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const { error } = await service.from("newsletter_subscribers").insert({
    email,
    status: "subscribed",
    source: "footer",
  });
  if (error) return NextResponse.json({ error: "Could not save your email." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
