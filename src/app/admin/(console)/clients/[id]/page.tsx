import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPage } from "@/components/admin/ui";
import { ClientEditor } from "@/components/admin/ClientEditor";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <AdminPage title={data.name}>
      <ClientEditor initial={data} />
    </AdminPage>
  );
}
