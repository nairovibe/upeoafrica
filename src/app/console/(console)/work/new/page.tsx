import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPage } from "@/components/admin/ui";
import { WorkEditor } from "@/components/admin/WorkEditor";
import { getStaff } from "@/lib/cms";
import { services } from "@/lib/services";

export default async function NewWorkPage() {
  const staff = await getStaff();
  if (staff?.role === "sales") redirect("/console/work");
  const supabase = await createClient();
  const [{ data: clients }, { data: rows }] = await Promise.all([
    supabase.from("clients").select("id, name").is("deleted_at", null).order("name"),
    supabase.from("case_studies").select("industry"),
  ]);
  const industries = [...new Set((rows ?? []).map((r) => r.industry).filter((i): i is string => Boolean(i)))].sort();
  return (
    <AdminPage title="New case study">
      <WorkEditor clients={clients ?? []} serviceOptions={services.map((s) => s.title)} industries={industries} />
    </AdminPage>
  );
}
