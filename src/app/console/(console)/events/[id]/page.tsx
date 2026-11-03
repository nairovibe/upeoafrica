import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage } from "@/components/admin/ui";
import { EventEditor } from "@/components/admin/EventEditor";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: event }, { data: tickets }, { data: orders }, { data: stats }] = await Promise.all([
    supabase.from("events").select("*").eq("id", id).maybeSingle(),
    supabase.from("ticket_types").select("*").eq("event_id", id).order("sort_order"),
    supabase.from("orders").select("ticket_type_id").eq("event_id", id).eq("kind", "ticket"),
    supabase.from("event_ticket_stats").select("sold, revenue_kes, checked_in").eq("event_id", id),
  ]);
  if (!event) notFound();

  const orderCounts: Record<string, number> = {};
  for (const o of orders ?? []) {
    if (o.ticket_type_id) orderCounts[o.ticket_type_id] = (orderCounts[o.ticket_type_id] ?? 0) + 1;
  }
  const summary = (stats ?? []).reduce(
    (t, s) => ({ sold: t.sold + (s.sold ?? 0), revenue: t.revenue + (s.revenue_kes ?? 0), checkedIn: t.checkedIn + (s.checked_in ?? 0) }),
    { sold: 0, revenue: 0, checkedIn: 0 },
  );

  return (
    <AdminPage
      title={event.title}
      action={
        <AdminBtn variant="ghost" href={`/console/events/${event.id}/attendees`}>
          Attendees
        </AdminBtn>
      }
    >
      <EventEditor initial={event} tickets={tickets ?? []} orderCounts={orderCounts} summary={summary} />
    </AdminPage>
  );
}
