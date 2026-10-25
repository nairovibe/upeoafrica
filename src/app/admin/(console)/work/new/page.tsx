import { createClient } from "@/lib/supabase/server";
import { AdminPage } from "@/components/admin/ui";
import { WorkEditor } from "@/components/admin/WorkEditor";

export default async function NewWorkPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("id, name").order("name");
  return (
    <AdminPage title="New case">
      <WorkEditor clients={data ?? []} />
    </AdminPage>
  );
}
