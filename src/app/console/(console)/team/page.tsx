import { createClient } from "@/lib/supabase/server";
import { AdminPage, AdminTable, Pill } from "@/components/admin/ui";
import { RoleSelect } from "@/components/admin/RoleSelect";
import { formatDay } from "@/components/admin/studio/format";
import { getStaff } from "@/lib/cms";

export default async function TeamPage() {
  const me = await getStaff();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("created_at");
  const members = data ?? [];
  const isOwner = me?.role === "owner";
  const owners = members.filter((m) => m.role === "owner").length;

  return (
    <AdminPage title="Team">
      <p className="mb-4 text-sm text-body">
        Anyone with an @upeoafricatechnologies.co.ke or @averissystems.com address can join at{" "}
        <a href="/console/login" className="font-medium text-brand-600 hover:underline">
          /console/login
        </a>{" "}
        and starts as an editor.
      </p>
      <AdminTable
        headers={["Name", "Email", "Role", "Joined"]}
        empty="No staff yet."
        rows={members.map((row) => [
          <span key="name" className="font-medium text-ink-900">
            {row.full_name || "-"}
            {row.id === me?.id ? <span className="ml-2 text-xs font-normal text-muted">You</span> : null}
          </span>,
          <span key="email" className="text-body">{row.email}</span>,
          isOwner ? (
            <RoleSelect
              key={`${row.id}-${row.role}`}
              id={row.id}
              value={row.role}
              lastOwner={row.role === "owner" && owners <= 1}
              self={row.id === me?.id}
            />
          ) : (
            <Pill key="role" tone={row.role === "owner" ? "brand" : "neutral"}>
              {row.role}
            </Pill>
          ),
          <span key="joined" className="whitespace-nowrap text-body">{formatDay(row.created_at)}</span>,
        ])}
      />
    </AdminPage>
  );
}
