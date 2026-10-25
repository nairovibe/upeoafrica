import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, AdminTable } from "@/components/admin/ui";
import { getStaff } from "@/lib/cms";

export default async function WorkListPage() {
  const staff = await getStaff();
  const canEdit = staff?.role !== "sales";
  const supabase = await createClient();
  const { data } = await supabase.from("case_studies").select("*").order("updated_at", { ascending: false });

  return (
    <AdminPage
      title="Work"
      hint="Real projects. Publish only what you can stand behind on a sales call."
      action={canEdit ? <AdminBtn href="/admin/work/new">New case</AdminBtn> : null}
    >
      <AdminTable
        headers={["Title", "Industry", "State", ""]}
        empty="No case studies yet."
        rows={(data ?? []).map((row) => [
          row.title,
          row.industry || "-",
          row.published_at ? "Live" : "Draft",
          canEdit ? (
            <Link key={row.id} href={`/admin/work/${row.id}`} className="text-brand-600 hover:underline">
              Edit
            </Link>
          ) : (
            ""
          ),
        ])}
      />
    </AdminPage>
  );
}
