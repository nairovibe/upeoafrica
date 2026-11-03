import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, FilterTabs } from "@/components/admin/ui";
import { AttendeesTable, type AttendeeRow } from "@/components/admin/events/AttendeesTable";
import { getStaff } from "@/lib/cms";
import { formatEventDate } from "@/components/events/utils";

const STATUSES = ["paid", "pending", "failed"] as const;

export default async function AttendeesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const [{ id }, { status: rawStatus }] = await Promise.all([params, searchParams]);
  const status = STATUSES.find((s) => s === rawStatus) ?? "all";
  const supabase = await createClient();
  const [{ data: event }, { data: tickets }, { data: orders }, staff] = await Promise.all([
    supabase.from("events").select("id, title, slug, starts_at").eq("id", id).maybeSingle(),
    supabase.from("ticket_types").select("id, name").eq("event_id", id),
    supabase
      .from("orders")
      .select(
        "id, attendee_name, attendee_company, email, phone, ticket_type_id, quantity, amount_kes, ticket_code, status, checked_in_at, created_at",
      )
      .eq("event_id", id)
      .eq("kind", "ticket")
      .order("created_at", { ascending: false }),
    getStaff(),
  ]);
  if (!event) notFound();

  const names = new Map((tickets ?? []).map((t) => [t.id, t.name]));
  const all: AttendeeRow[] = (orders ?? []).map((o) => ({
    id: o.id,
    name: o.attendee_name,
    company: o.attendee_company,
    email: o.email,
    phone: o.phone,
    ticket: o.ticket_type_id ? (names.get(o.ticket_type_id) ?? "Removed ticket") : "Removed ticket",
    quantity: o.quantity,
    amount: Number(o.amount_kes),
    code: o.ticket_code,
    status: o.status,
    checkedInAt: o.checked_in_at,
    createdAt: o.created_at,
  }));
  const count = (s: string) => all.filter((r) => r.status === s).length;
  const rows = status === "all" ? all : all.filter((r) => r.status === status);
  const base = `/console/events/${id}/attendees`;

  return (
    <AdminPage
      title={`Attendees · ${event.title}`}
      hint={formatEventDate(event.starts_at)}
      action={
        <AdminBtn variant="ghost" href={`/console/events/${id}`}>
          Edit event
        </AdminBtn>
      }
    >
      <div className="mb-4">
        <FilterTabs
          active={status}
          items={[
            { id: "all", label: "All", href: base, count: all.length },
            { id: "paid", label: "Paid", href: `${base}?status=paid`, count: count("paid") },
            { id: "pending", label: "Pending", href: `${base}?status=pending`, count: count("pending") },
            { id: "failed", label: "Failed", href: `${base}?status=failed`, count: count("failed") },
          ]}
        />
      </div>
      <AttendeesTable rows={rows} canCheckIn={Boolean(staff)} fileName={`${event.slug}-attendees`} />
    </AdminPage>
  );
}
