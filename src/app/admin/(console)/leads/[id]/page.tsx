import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPage } from "@/components/admin/ui";
import { LeadWorkspace } from "@/components/admin/LeadWorkspace";
import { slaBreached } from "@/lib/desk";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
  if (!lead) notFound();
  const { data: logs } = await supabase
    .from("email_log")
    .select("*")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  return (
    <AdminPage
      title={lead.name}
      hint={`${lead.source === "inquiry" ? "Wizard" : "Contact"} · ${lead.email}${slaBreached(lead) ? " · Past 24 hours" : ""}`}
      action={
        <Link href="/admin/leads" className="text-sm font-medium text-brand-600">
          Back to inbox
        </Link>
      }
    >
      <LeadWorkspace lead={lead} logs={logs ?? []} />
    </AdminPage>
  );
}
