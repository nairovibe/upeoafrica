import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, AdminTable } from "@/components/admin/ui";
import { getStaff } from "@/lib/cms";

export default async function InsightsListPage() {
  const staff = await getStaff();
  const canEdit = staff?.role !== "sales";
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("*").order("updated_at", { ascending: false });
  return (
    <AdminPage title="Insights" hint="Publish when there is something worth saying. The webhook fires on publish." action={canEdit ? <AdminBtn href="/admin/insights/new">New article</AdminBtn> : null}>
      <AdminTable
        headers={["Title", "Audience", "State", ""]}
        empty="No articles yet."
        rows={(data ?? []).map((row) => [
          row.title,
          row.audience,
          row.published_at ? "Live" : "Draft",
          canEdit ? <Link href={`/admin/insights/${row.id}`} className="text-brand-600 hover:underline">Edit</Link> : "",
        ])}
      />
    </AdminPage>
  );
}
