import { createClient } from "@/lib/supabase/server";
import { AdminPage, AdminTable } from "@/components/admin/ui";
import { RoleSelect } from "@/components/admin/RoleSelect";
import { getStaff } from "@/lib/cms";

export default async function TeamPage() {
  const me = await getStaff();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("created_at");
  const owner = me?.role === "owner";

  return (
    <AdminPage
      title="Team"
      hint="Five seats. Colleagues sign in at /admin/login with the work address we issued them. You set their role here."
    >
      <AdminTable
        headers={["Name", "Email", "Role"]}
        empty="No staff yet."
        rows={(data ?? []).map((row) => [
          row.full_name || "-",
          row.email,
          <RoleSelect key={row.id} id={row.id} value={row.role} disabled={!owner} />,
        ])}
      />
    </AdminPage>
  );
}
