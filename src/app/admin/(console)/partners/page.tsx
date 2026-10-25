import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, AdminTable } from "@/components/admin/ui";

export default async function PartnersListPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("partners").select("*").order("sort_order");
  return (
    <AdminPage title="Partners" hint="Averis Systems Ltd is already here as the official development partner." action={<AdminBtn href="/admin/partners/new">Add partner</AdminBtn>}>
      <AdminTable
        headers={["Name", "Relationship", ""]}
        empty="No partners."
        rows={(data ?? []).map((row) => [
          row.name,
          row.relationship.replaceAll("_", " "),
          <Link key={row.id} href={`/admin/partners/${row.id}`} className="text-brand-600 hover:underline">Edit</Link>,
        ])}
      />
    </AdminPage>
  );
}
