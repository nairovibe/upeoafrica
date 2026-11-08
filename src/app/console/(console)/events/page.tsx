import { CalendarDays, CheckCheck, Plus, Ticket, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, FilterTabs, Stat } from "@/components/admin/ui";
import { ManageTable, type DeskItem } from "@/components/admin/ManageTable";
import { formatDay } from "@/components/admin/studio/format";
import { getStaff } from "@/lib/cms";
import { formatKes } from "@/lib/constants";
import { formatEventDate, formatEventTime, isEventOver, modeLabel } from "@/components/events/utils";

const TABS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "draft", label: "Drafts" },
  { id: "trash", label: "Trash" },
] as const;

export default async function EventsListPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status = "all" } = await searchParams;
  const staff = await getStaff();
  const canEdit = staff?.role !== "sales";
  const supabase = await createClient();
  const [{ data: events }, { data: stats }] = await Promise.all([
    supabase.from("events").select("*").order("starts_at", { ascending: false }),
    supabase.from("event_ticket_stats").select("*"),
  ]);

  const byEvent = new Map<string, { sold: number; revenue: number }>();
  for (const stat of stats ?? []) {
    if (!stat.event_id) continue;
    const current = byEvent.get(stat.event_id) ?? { sold: 0, revenue: 0 };
    current.sold += stat.sold ?? 0;
    current.revenue += stat.revenue_kes ?? 0;
    byEvent.set(stat.event_id, current);
  }
  const totals = [...byEvent.values()].reduce(
    (total, stat) => ({ sold: total.sold + stat.sold, revenue: total.revenue + stat.revenue }),
    { sold: 0, revenue: 0 },
  );
  const checkedIn = (stats ?? []).reduce((total, stat) => total + (stat.checked_in ?? 0), 0);
  const now = Date.now();
  const all = events ?? [];
  const activeRows = all.filter((row) => !row.deleted_at);
  const trashed = all.filter((row) => row.deleted_at);
  const active = TABS.some((tab) => tab.id === status) ? status : "all";
  const pool =
    active === "trash" ? trashed : activeRows.filter((row) => active === "all" || (active === "live" ? Boolean(row.published_at) : !row.published_at));
  const upcoming = activeRows.filter((row) => row.published_at && !isEventOver(row.starts_at, now)).length;
  const items: DeskItem[] = pool.map((row) => {
    const sold = byEvent.get(row.id);
    const past = isEventOver(row.starts_at, now);
    return {
      id: row.id,
      title: row.title,
      path: [row.category, modeLabel(row.mode)].filter(Boolean).join(" · "),
      editHref: `/console/events/${row.id}`,
      viewHref: row.published_at && !row.deleted_at ? `/events/${row.slug}` : null,
      extraHref: row.deleted_at ? null : { href: `/console/events/${row.id}/attendees`, label: "Attendees" },
      status: row.deleted_at ? "Trash" : !row.published_at ? "Draft" : past ? "Past" : "Live",
      tone: row.deleted_at ? "warning" : !row.published_at ? "neutral" : past ? "ink" : "success",
      updated: formatDay(row.deleted_at || row.updated_at),
      deleted: Boolean(row.deleted_at),
      details: [`${formatEventDate(row.starts_at)} ${formatEventTime(row.starts_at)}`, `${sold?.sold ?? 0}${row.capacity != null ? ` / ${row.capacity}` : ""}`, formatKes(sold?.revenue ?? 0)],
      quickName: row.title,
      quickSlug: row.slug,
      quickLive: Boolean(row.published_at),
    };
  });

  return (
    <AdminPage
      title="Events"
      action={
        canEdit ? (
          <AdminBtn href="/console/events/new" icon={<Plus aria-hidden />}>
            New event
          </AdminBtn>
        ) : null
      }
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Upcoming events" value={upcoming} icon={<CalendarDays className="h-4 w-4" />} />
        <Stat label="Tickets sold" value={totals.sold.toLocaleString("en-KE")} icon={<Ticket className="h-4 w-4" />} />
        <Stat label="Ticket revenue" value={formatKes(totals.revenue)} icon={<Wallet className="h-4 w-4" />} />
        <Stat label="Checked in" value={checkedIn.toLocaleString("en-KE")} icon={<CheckCheck className="h-4 w-4" />} />
      </div>
      <div className="space-y-4">
        <FilterTabs
          active={active}
          items={TABS.map((tab) => ({
            id: tab.id,
            label: tab.label,
            href: tab.id === "all" ? "/console/events" : `/console/events?status=${tab.id}`,
            count:
              tab.id === "trash"
                ? trashed.length
                : tab.id === "live"
                  ? activeRows.filter((row) => row.published_at).length
                  : tab.id === "draft"
                    ? activeRows.filter((row) => !row.published_at).length
                    : activeRows.length,
          }))}
        />
        <ManageTable
          resource="events"
          items={items}
          canEdit={canEdit}
          headers={["When", "Sold", "Revenue"]}
          hasSlug
          hasLive
          nameLabel="Event"
          trashView={active === "trash"}
          empty={active === "trash" ? "Trash is empty." : "No events yet. Talks, workshops and ticketed sessions will be listed here."}
        />
      </div>
    </AdminPage>
  );
}
