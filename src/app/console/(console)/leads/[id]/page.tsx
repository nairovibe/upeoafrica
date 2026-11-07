import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPage } from "@/components/admin/ui";
import { LeadWorkspace, type TimelineItem } from "@/components/admin/LeadWorkspace";
import { fullDate, sourceLabel } from "@/components/admin/leads/data";
import { slaBreached } from "@/lib/desk";

const ACTIVITY_TITLE: Record<string, string> = {
  note: "Note",
  status: "Status",
  email: "Reply sent",
  call: "Call",
  meeting: "Meeting",
};

const MAIL_TITLE: Record<string, string> = {
  lead_studio: "Team alert sent",
  lead_ack: "Auto-reply sent",
  lead_reply: "Reply sent",
};

const MAIL_FAILED: Record<string, string> = {
  lead_studio: "Team alert not delivered",
  lead_ack: "Auto-reply not delivered",
  lead_reply: "Reply not delivered",
};

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (!lead) notFound();

  const [{ data: activity }, { data: logs }, { data: staff }] = await Promise.all([
    supabase.from("lead_activity").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
    supabase.from("email_log").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name, email").order("full_name"),
  ]);

  const people = staff ?? [];
  const nameOf = (uid: string | null) => {
    const p = people.find((s) => s.id === uid);
    return p ? p.full_name || p.email : null;
  };

  const replies = (activity ?? []).filter((a) => a.kind === "email").map((a) => +new Date(a.created_at));
  const items: TimelineItem[] = [
    ...(activity ?? []).map((a) => ({
      id: a.id,
      kind: a.kind,
      title: ACTIVITY_TITLE[a.kind] ?? a.kind,
      body: a.body,
      who: nameOf(a.created_by),
      at: a.created_at,
      when: fullDate(a.created_at),
    })),
    ...(logs ?? [])
      .filter(
        (log) =>
          log.template !== "lead_reply" ||
          !replies.some((t) => Math.abs(t - +new Date(log.created_at)) < 2 * 60 * 1000),
      )
      .map((log) => ({
        id: log.id,
        kind: "mail",
        title: log.resend_id ? (MAIL_TITLE[log.template] ?? log.template) : (MAIL_FAILED[log.template] ?? "Email not delivered"),
        body: log.resend_id
          ? `${log.subject} · ${log.to_email}`
          : `${log.subject.replace(/^Not delivered: /, "")} · ${log.to_email}. The message was recorded here and was not delivered.`,
        who: null,
        at: log.created_at,
        when: fullDate(log.created_at),
      })),
  ].sort((a, b) => +new Date(b.at) - +new Date(a.at));
  items.push({
    id: "received",
    kind: "received",
    title: "Enquiry received",
    body: sourceLabel(lead.source),
    who: null,
    at: lead.created_at,
    when: fullDate(lead.created_at),
  });

  return (
    <AdminPage
      title={lead.name}
      hint={[lead.company, lead.email, slaBreached(lead) ? "Past 24 hours" : null].filter(Boolean).join(" · ")}
      action={
        <Link href="/console/leads" className="text-sm font-medium text-brand-600">
          Back to enquiries
        </Link>
      }
    >
      <LeadWorkspace
        lead={lead}
        timeline={items}
        staff={people.map((p) => ({ id: p.id, name: p.full_name || p.email }))}
        received={fullDate(lead.created_at)}
        lastContacted={lead.last_contacted_at ? fullDate(lead.last_contacted_at) : null}
      />
    </AdminPage>
  );
}
