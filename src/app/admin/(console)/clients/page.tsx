import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, AdminTable } from "@/components/admin/ui";

export default async function ClientsListPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("*").order("name");
  return (
    <AdminPage title="Clients" hint="Bill-to accounts and logos on the home strip. Billing email and phone feed invoices." action={<AdminBtn href="/admin/clients/new">Add client</AdminBtn>}>
      <AdminTable
        headers={["Name", "Featured", ""]}
        empty="No clients yet."
        rows={(data ?? []).map((row) => [
          row.name,
          row.featured ? "Yes" : "-",
          <Link key={row.id} href={`/admin/clients/${row.id}`} className="text-brand-600 hover:underline">Edit</Link>,
        ])}
      />
    </AdminPage>
  );
}
