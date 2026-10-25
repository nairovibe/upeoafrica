import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, AdminTable } from "@/components/admin/ui";
import { getStaff } from "@/lib/cms";

export default async function EventsListPage() {
  const staff = await getStaff();
  const canEdit = staff?.role !== "sales";
  const supabase = await createClient();
  const { data } = await supabase.from("events").select("*").order("starts_at", { ascending: false });
  return (
    <AdminPage
      title="Events"
      hint="Talks and training. A date, a venue, ticket types, and a public checkout."
      action={canEdit ? <AdminBtn href="/admin/events/new">New event</AdminBtn> : null}
    >
      <AdminTable
        headers={["When", "Title", "Mode", "State", ""]}
        empty="No events yet. Add one when a talk or a training has a date."
        rows={(data ?? []).map((row) => [
          new Date(row.starts_at).toLocaleString("en-KE"),
          row.title,
          row.mode,
          row.published_at ? "Live" : "Draft",
          canEdit ? (
            <Link href={`/admin/events/${row.id}`} className="text-brand-600 hover:underline">
              Open
            </Link>
          ) : (
            ""
          ),
        ])}
      />
    </AdminPage>
  );
}
