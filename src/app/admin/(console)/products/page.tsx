import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, AdminTable } from "@/components/admin/ui";
import { formatKes } from "@/lib/constants";
import { getStaff } from "@/lib/cms";

export default async function ProductsListPage() {
  const staff = await getStaff();
  const canEdit = staff?.role !== "sales";
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").order("title");
  return (
    <AdminPage title="Products" hint="Plugins and downloads. Attach the file before you turn on a price." action={canEdit ? <AdminBtn href="/admin/products/new">New product</AdminBtn> : null}>
      <AdminTable
        headers={["Name", "Type", "Price", "State", ""]}
        empty="No products yet."
        rows={(data ?? []).map((row) => [
          row.title,
          row.type,
          formatKes(row.price_kes),
          row.published ? "Live" : "Draft",
          canEdit ? <Link href={`/admin/products/${row.id}`} className="text-brand-600 hover:underline">Edit</Link> : "",
        ])}
      />
    </AdminPage>
  );
}
