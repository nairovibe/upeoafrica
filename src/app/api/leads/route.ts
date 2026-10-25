import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyLead, rateLimit } from "@/lib/notify";
import { verifyTurnstile } from "@/lib/turnstile";

type Body = {
  source: "contact_form" | "inquiry";
  name: string;
  email: string;
  phone?: string;
  company?: string;
  services?: string[];
  stage?: string;
  timeline?: string;
  budget?: string;
  message?: string;
  turnstileToken?: string;
};

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`lead:${ip}`)) {
    return NextResponse.json({ error: "Please wait a moment before sending again." }, { status: 429 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim() ?? "";
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Name and a valid email are required." }, { status: 400 });
  }
  if (body.source !== "contact_form" && body.source !== "inquiry") {
    return NextResponse.json({ error: "Unknown source." }, { status: 400 });
  }
  const action = body.source === "inquiry" ? "inquiry" : "contact";
  if (!(await verifyTurnstile(body.turnstileToken, ip, action))) {
    return NextResponse.json({ error: "Could not verify this submission." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      source: body.source,
      name,
      email,
      phone: body.phone?.trim() || null,
      company: body.company?.trim() || null,
      services: body.services ?? [],
      stage: body.stage || null,
      timeline: body.timeline || null,
      budget: body.budget || null,
      message: body.message?.trim() || null,
      status: "new",
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not save your enquiry." }, { status: 500 });
  }

  const summary = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${body.phone || "-"}`,
    `Company: ${body.company || "-"}`,
    `Services: ${(body.services ?? []).join(", ") || "-"}`,
    `Stage: ${body.stage || "-"}`,
    `Timeline: ${body.timeline || "-"}`,
    `Budget: ${body.budget || "-"}`,
    "",
    body.message || "",
  ].join("\n");

  await notifyLead({ name, email, source: body.source, summary, leadId: lead?.id }).catch(() => {});

  return NextResponse.json({ ok: true });
}
