import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStaff } from "@/lib/cms";
import { sendLeadReply } from "@/lib/notify";

export async function POST(request: Request) {
  const staff = await getStaff();
  if (!staff) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as { leadId?: string; body?: string };
  if (!body.leadId || !body.body?.trim()) {
    return NextResponse.json({ error: "Write a reply first." }, { status: 400 });
  }
  const supabase = await createClient();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", body.leadId).maybeSingle();
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  await sendLeadReply({ to: lead.email, name: lead.name, body: body.body.trim(), leadId: lead.id });
  if (lead.status === "new") {
    await supabase.from("leads").update({ status: "contacted" }).eq("id", lead.id);
  }
  return NextResponse.json({ ok: true });
}
