import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/cms";
import { sendLeadReply } from "@/lib/notify";

export async function POST(request: Request) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { leadId?: string; body?: string };
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!body.leadId || !text) {
    return NextResponse.json({ error: "Write a reply first." }, { status: 400 });
  }
  if (text.length > 10000) {
    return NextResponse.json({ error: "Keep the reply under 10,000 characters." }, { status: 400 });
  }
  const supabase = await createClient();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", body.leadId).maybeSingle();
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  const sent = await sendLeadReply({ to: lead.email, name: lead.name, body: text, leadId: lead.id }).catch(() => false);
  if (!sent) return NextResponse.json({ error: "Could not send the email. Try again." }, { status: 502 });

  const moved = lead.status === "new";
  await supabase
    .from("leads")
    .update({ last_contacted_at: new Date().toISOString(), ...(moved ? { status: "contacted" } : {}) })
    .eq("id", lead.id);
  await supabase.from("lead_activity").insert([
    { lead_id: lead.id, kind: "email", body: text },
    ...(moved ? [{ lead_id: lead.id, kind: "status", body: "Moved from new to contacted." }] : []),
  ]);
  return NextResponse.json({ ok: true });
}
