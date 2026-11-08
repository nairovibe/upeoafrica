"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/cms";
import { brandedEmailHtml, RESEND_FROM } from "@/lib/email";
import { company } from "@/lib/content";
import { normalizeEmail } from "@/lib/newsletter";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function idsOf(raw: string[]) {
  return [...new Set(raw.filter((id) => UUID.test(id)))].slice(0, 200);
}

async function requireStaff() {
  const staff = await getStaff();
  if (!staff) return { ok: false as const, error: "Sign in required." };
  return { ok: true as const, staff };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function refresh() {
  revalidatePath("/console/newsletter");
}

export async function addSubscriber(emailRaw: string) {
  const gate = await requireStaff();
  if (!gate.ok) return gate;
  const email = normalizeEmail(emailRaw);
  if (!email) return { ok: false as const, error: "Enter a valid email address." };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  const write = existing
    ? supabase
        .from("newsletter_subscribers")
        .update({ status: "subscribed", unsubscribed_at: null, source: "console" })
        .eq("id", existing.id)
    : supabase.from("newsletter_subscribers").insert({ email, status: "subscribed", source: "console" });

  const { error } = await write;
  if (error) return { ok: false as const, error: "Could not add that address." };
  refresh();
  return { ok: true as const, already: Boolean(existing) };
}

export async function setSubscriberStatus(ids: string[], status: "subscribed" | "unsubscribed") {
  const gate = await requireStaff();
  if (!gate.ok) return gate;
  const clean = idsOf(ids);
  if (!clean.length) return { ok: false as const, error: "Select at least one address." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("newsletter_subscribers")
    .update({
      status,
      unsubscribed_at: status === "unsubscribed" ? new Date().toISOString() : null,
    })
    .in("id", clean);
  if (error) return { ok: false as const, error: "Could not update those addresses." };
  refresh();
  return { ok: true as const };
}

export async function deleteSubscribers(ids: string[]) {
  const gate = await requireStaff();
  if (!gate.ok) return gate;
  const clean = idsOf(ids);
  if (!clean.length) return { ok: false as const, error: "Select at least one address." };

  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").delete().in("id", clean);
  if (error) return { ok: false as const, error: "Could not remove those addresses." };
  refresh();
  return { ok: true as const };
}

export async function sendCampaign(input: {
  kind: "article" | "event" | "note";
  refId?: string;
  subject: string;
  intro: string;
}) {
  const gate = await requireStaff();
  if (!gate.ok) return gate;
  if (gate.staff.role !== "owner" && gate.staff.role !== "editor") {
    return { ok: false as const, error: "Only an editor can send to the list." };
  }

  const subject = input.subject.trim().slice(0, 140);
  const intro = input.intro.trim().slice(0, 800);
  if (subject.length < 3) return { ok: false as const, error: "Write a subject line." };
  if (input.kind === "note" && intro.length < 20) {
    return { ok: false as const, error: "Write the note you want to send." };
  }
  if ((input.kind === "article" || input.kind === "event") && !input.refId) {
    return { ok: false as const, error: "Choose what to send." };
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false as const, error: "Email sending is not configured on this deployment." };

  const supabase = await createClient();
  let linkUrl: string | null = null;
  let linkLabel: string | null = null;
  let heading = subject;

  if (input.kind === "article" && input.refId) {
    const { data } = await supabase
      .from("articles")
      .select("title, slug, excerpt")
      .eq("id", input.refId)
      .is("deleted_at", null)
      .not("published_at", "is", null)
      .maybeSingle();
    if (!data) return { ok: false as const, error: "That article is not live." };
    heading = data.title;
    linkUrl = `${company.domain}/blogs/${data.slug}`;
    linkLabel = "Read the article";
  }
  if (input.kind === "event" && input.refId) {
    const { data } = await supabase
      .from("events")
      .select("title, slug, summary")
      .eq("id", input.refId)
      .is("deleted_at", null)
      .not("published_at", "is", null)
      .maybeSingle();
    if (!data) return { ok: false as const, error: "That event is not live." };
    heading = data.title;
    linkUrl = `${company.domain}/events/${data.slug}`;
    linkLabel = "View the event";
  }

  const { data: people, error: listError } = await supabase
    .from("newsletter_subscribers")
    .select("email, unsubscribe_token")
    .eq("status", "subscribed")
    .order("created_at", { ascending: true })
    .limit(500);
  if (listError) return { ok: false as const, error: "Could not read the mailing list." };
  const recipients = people ?? [];
  if (!recipients.length) return { ok: false as const, error: "There is nobody subscribed yet." };

  const resend = new Resend(key);
  let sent = 0;
  let failed = 0;
  const introHtml = escapeHtml(intro).replace(/\n/g, "<br>");

  async function deliver(person: { email: string; unsubscribe_token: string }) {
    const unsubscribe = `${company.domain}/api/newsletter/unsubscribe?token=${person.unsubscribe_token}`;
    const body = `${introHtml}<br><br><a href="${unsubscribe}" style="color:#6b7583">Unsubscribe</a>`;
    try {
      const result = await resend.emails.send({
        from: RESEND_FROM,
        to: person.email,
        subject,
        text: `${intro}\n\n${linkUrl ?? ""}\n\nUnsubscribe: ${unsubscribe}`,
        html: brandedEmailHtml({
          preview: intro.slice(0, 140) || subject,
          heading,
          body,
          buttonLabel: linkLabel ?? undefined,
          buttonUrl: linkUrl ?? undefined,
          sentTo: person.email,
          replyNote: "You joined this list on the website.",
        }),
      });
      if (result.error || !result.data?.id) failed += 1;
      else sent += 1;
    } catch {
      failed += 1;
    }
  }

  let cursor = 0;
  const workers = Array.from({ length: Math.min(4, recipients.length) }, async () => {
    while (cursor < recipients.length) {
      const person = recipients[cursor];
      cursor += 1;
      if (person) await deliver(person);
    }
  });
  await Promise.all(workers);

  const { error: logError } = await supabase.from("newsletter_campaigns").insert({
    kind: input.kind,
    subject,
    intro,
    link_url: linkUrl,
    link_label: linkLabel,
    sent_count: sent,
    failed_count: failed,
    created_by: gate.staff.id,
  });
  refresh();
  revalidatePath("/console/newsletter/compose");
  if (logError) {
    return { ok: true as const, sent, failed, logged: false };
  }
  return { ok: true as const, sent, failed, logged: true };
}
