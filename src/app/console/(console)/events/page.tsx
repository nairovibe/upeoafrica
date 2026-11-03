import Link from "next/link";
import { CalendarDays, CheckCheck, Plus, Ticket, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, AdminTable, Pill, Stat } from "@/components/admin/ui";
import { getStaff } from "@/lib/cms";
import { formatKes } from "@/lib/constants";
import { formatEventDate, formatEventTime, isEventOver, modeLabel } from "@/components/events/utils";

export default async function EventsListPage() {
  const staff = await getStaff();
  const canEdit = staff?.role !== "sales";
  const supabase = await createClient();
  const [{ data: events }, { data: stats }] = await Promise.all([
    supabase.from("events").select("*").order("starts_at", { ascending: false }),
    supabase.from("event_ticket_stats").select("*"),
  ]);

  const byEvent = new Map<string, { sold: number; revenue: number; checkedIn: number }>();
  for (const s of stats ?? []) {
    if (!s.event_id) continue;
    const cur = byEvent.get(s.event_id) ?? { sold: 0, revenue: 0, checkedIn: 0 };
    cur.sold += s.sold ?? 0;
    cur.revenue += s.revenue_kes ?? 0;
    cur.checkedIn += s.checked_in ?? 0;
    byEvent.set(s.event_id, cur);
  }
  const totals = [...byEvent.values()].reduce(
    (t, s) => ({ sold: t.sold + s.sold, revenue: t.revenue + s.revenue, checkedIn: t.checkedIn + s.checkedIn }),
    { sold: 0, revenue: 0, checkedIn: 0 },
  );
  const now = new Date().getTime();
  const rows = events ?? [];
  const upcoming = rows.filter((e) => e.published_at && !isEventOver(e.starts_at, now)).length;

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
        <Stat label="Checked in" value={totals.checkedIn.toLocaleString("en-KE")} icon={<CheckCheck className="h-4 w-4" />} />
      </div>
      <AdminTable
        headers={["Date", "Event", "Status", "Sold", "Revenue", ""]}
        empty="No events yet. Talks, workshops and ticketed sessions will be listed here."
        emptyAction={
          canEdit ? (
            <AdminBtn href="/console/events/new" icon={<Plus aria-hidden />}>
              New event
            </AdminBtn>
          ) : null
        }
        rows={rows.map((row) => {
          const s = byEvent.get(row.id);
          const past = isEventOver(row.starts_at, now);
          return [
            <div key="date" className="whitespace-nowrap">
              <p>{formatEventDate(row.starts_at)}</p>
              <p className="text-xs text-muted">{formatEventTime(row.starts_at)} EAT</p>
            </div>,
            <div key="title" className="min-w-0">
              <p className="font-medium">{row.title}</p>
              <p className="text-xs text-muted">{[row.category, modeLabel(row.mode)].filter(Boolean).join(" · ")}</p>
            </div>,
            !row.published_at ? (
              <Pill key="status">Draft</Pill>
            ) : past ? (
              <Pill key="status" tone="ink">
                Past
              </Pill>
            ) : (
              <Pill key="status" tone="success">
                Live
              </Pill>
            ),
            <span key="sold" className="tabular-nums">
              {s?.sold ?? 0}
              {row.capacity != null ? <span className="text-muted"> / {row.capacity}</span> : null}
            </span>,
            <span key="rev" className="tabular-nums">
              {formatKes(s?.revenue ?? 0)}
            </span>,
            <div key="links" className="flex justify-end gap-3 whitespace-nowrap">
              {canEdit ? (
                <Link href={`/console/events/${row.id}`} className="text-brand-600 hover:underline">
                  Edit
                </Link>
              ) : null}
              <Link href={`/console/events/${row.id}/attendees`} className="text-brand-600 hover:underline">
                Attendees
              </Link>
            </div>,
          ];
        })}
      />
    </AdminPage>
  );
}
