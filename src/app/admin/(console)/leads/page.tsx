import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminPage, AdminTable } from "@/components/admin/ui";
import { LeadStatus } from "@/components/admin/LeadStatus";
import { slaBreached, relativeAge } from "@/lib/desk";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "open", label: "Waiting" },
  { id: "new", label: "New" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
  { id: "all", label: "All" },
] as const;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter = "open" } = await searchParams;
  const supabase = await createClient();
  let q = supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (filter === "new") q = q.eq("status", "new");
  else if (filter === "won") q = q.eq("status", "won");
  else if (filter === "lost") q = q.eq("status", "lost");
  else if (filter === "open") q = q.in("status", ["new", "contacted", "qualified"]);
  const { data } = await q;
  const leads = data ?? [];

  return (
    <AdminPage
      title="Inbox"
      hint="Every brief from the site. Open a name to read it, reply, and move the status."
    >
      <div className="mb-4 flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <Link
            key={f.id}
            href={f.id === "open" ? "/admin/leads" : `/admin/leads?filter=${f.id}`}
            className={cn(
              "rounded-[5px] px-3 py-1.5 text-[12px] font-medium",
              filter === f.id ? "bg-ink-900 text-white" : "border border-line bg-white text-body hover:border-brand-300",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>
      <AdminTable
        headers={["Age", "Name", "Need", "Clock", "Status", ""]}
        empty="No enquiries in this view. The contact form and the project wizard write here."
        rows={leads.map((l) => [
          relativeAge(l.created_at),
          <div key={l.id}>
            <p className="font-medium">{l.name}</p>
            <p className="text-xs text-muted">
              {l.source === "inquiry" ? "Wizard" : "Contact"}
              {l.company ? ` · ${l.company}` : ""}
            </p>
          </div>,
          (l.services ?? []).join(", ") || l.message || "-",
          slaBreached(l) ? (
            <span className="text-xs font-medium text-brand-700">Past 24h</span>
          ) : (
            <span className="text-xs text-muted">On time</span>
          ),
          <LeadStatus key={l.id + "s"} id={l.id} value={l.status} />,
          <Link key={l.id + "o"} href={`/admin/leads/${l.id}`} className="text-brand-600 hover:underline">
            Open
          </Link>,
        ])}
      />
    </AdminPage>
  );
}
