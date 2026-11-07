"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/cms";
import { normalizeEmail } from "@/lib/newsletter";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function idsOf(raw: string[]) {
  return [...new Set(raw.filter((id) => UUID.test(id)))].slice(0, 200);
}

async function requireStaff() {
  const staff = await getStaff();
  if (!staff) return { ok: false as const, error: "Sign in required." };
  return { ok: true as const };
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
