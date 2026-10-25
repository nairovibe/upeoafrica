import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPage } from "@/components/admin/ui";
import { WorkEditor } from "@/components/admin/WorkEditor";

export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: row }, { data: clients }] = await Promise.all([
    supabase.from("case_studies").select("*").eq("id", id).maybeSingle(),
    supabase.from("clients").select("id, name").order("name"),
  ]);
  if (!row) notFound();
  return (
    <AdminPage title={row.title}>
      <WorkEditor initial={row} clients={clients ?? []} />
    </AdminPage>
  );
}
