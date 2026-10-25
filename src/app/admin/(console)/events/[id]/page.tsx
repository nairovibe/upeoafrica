import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPage, AdminTable } from "@/components/admin/ui";
import { EventEditor } from "@/components/admin/EventEditor";
import { formatKes } from "@/lib/constants";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (!event) notFound();
  const { data: tickets } = await supabase
    .from("ticket_types")
    .select("*")
    .eq("event_id", id)
    .order("sort_order");
  const { data: attendees } = await supabase
    .from("orders")
    .select("id, email, phone, attendee_name, amount_kes, status, created_at, ticket_type_id")
    .eq("event_id", id)
    .eq("kind", "ticket")
    .order("created_at", { ascending: false });
  const ticketNames = Object.fromEntries((tickets ?? []).map((t) => [t.id, t.name]));
  const paid = (attendees ?? []).filter((a) => a.status === "paid");
  const revenue = paid.reduce((s, a) => s + Number(a.amount_kes), 0);
  const cap = event.capacity;

  return (
    <AdminPage
      title={event.title}
      hint={`${paid.length} paid${cap != null ? ` / ${cap} capacity` : ""} · ${formatKes(revenue)}`}
    >
      <div className="space-y-8">
        <EventEditor initial={event} tickets={tickets ?? []} />
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">Attendees</h2>
          <AdminTable
            headers={["When", "Name", "Ticket", "Amount", "Status"]}
            empty="No ticket orders yet. The public event page writes here after M-Pesa."
            rows={(attendees ?? []).map((row) => [
              new Date(row.created_at).toLocaleString("en-KE"),
              <div key={row.id}>
                <p>{row.attendee_name || row.email}</p>
                <p className="text-xs text-muted">{row.email}{row.phone ? ` · ${row.phone}` : ""}</p>
              </div>,
              ticketNames[row.ticket_type_id ?? ""] || "-",
              formatKes(Number(row.amount_kes)),
              row.status,
            ])}
          />
        </section>
      </div>
    </AdminPage>
  );
}
