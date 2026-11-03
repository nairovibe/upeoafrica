import { createClient } from "@/lib/supabase/server";
import { AdminPage, FilterTabs } from "@/components/admin/ui";
import { LeadFilters } from "@/components/admin/leads/LeadFilters";
import { LeadTable } from "@/components/admin/leads/LeadTable";
import { SOURCES, fullDate } from "@/components/admin/leads/data";
import { slaBreached, relativeAge } from "@/lib/desk";

const WAITING = ["new", "contacted", "qualified"];

const TABS = [
  { id: "open", label: "Waiting" },
  { id: "new", label: "New" },
  { id: "qualified", label: "Qualified" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
  { id: "all", label: "All" },
] as const;

type Search = { filter?: string; q?: string; source?: string };

export default async function LeadsPage({ searchParams }: { searchParams: Promise<Search> }) {
  const params = await searchParams;
  const filter = TABS.some((t) => t.id === params.filter) ? (params.filter as string) : "open";
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const source = SOURCES.find((s) => s.id === params.source);
  const term = q.replace(/[%_*,()\\"':]/g, " ").trim();

  const supabase = await createClient();
  let list = supabase.from("leads").select("*");
  let tally = supabase.from("leads").select("status");
  if (term) {
    const match = `name.ilike.%${term}%,email.ilike.%${term}%,company.ilike.%${term}%`;
    list = list.or(match);
    tally = tally.or(match);
  }
  if (source) {
    list = list.eq("source", source.value);
    tally = tally.eq("source", source.value);
  }
  if (filter === "open") list = list.in("status", WAITING);
  else if (filter !== "all") list = list.eq("status", filter);

  const [{ data }, { data: statuses }] = await Promise.all([
    list.order("created_at", { ascending: false }).limit(300),
    tally,
  ]);
  const leads = data ?? [];

  const counts: Record<string, number> = { open: 0, all: 0 };
  for (const { status } of statuses ?? []) {
    counts.all += 1;
    counts[status] = (counts[status] ?? 0) + 1;
    if (WAITING.includes(status)) counts.open += 1;
  }

  const hrefFor = (id: string) => {
    const sp = new URLSearchParams();
    if (id !== "open") sp.set("filter", id);
    if (q) sp.set("q", q);
    if (source) sp.set("source", source.id);
    const qs = sp.toString();
    return qs ? `/console/leads?${qs}` : "/console/leads";
  };

  return (
    <AdminPage title="Enquiries">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          active={filter}
          items={TABS.map((t) => ({ id: t.id, label: t.label, href: hrefFor(t.id), count: counts[t.id] ?? 0 }))}
        />
        <LeadFilters key={`${q}|${source?.id ?? ""}`} filter={filter} q={q} source={source?.id ?? ""} />
      </div>
      <LeadTable
        rows={leads.map((lead) => ({
          lead,
          age: relativeAge(lead.created_at),
          received: fullDate(lead.created_at),
          late: slaBreached(lead),
        }))}
        empty={q || source ? "No enquiries match this search." : "No enquiries in this view."}
      />
    </AdminPage>
  );
}
