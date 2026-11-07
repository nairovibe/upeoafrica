import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPage } from "@/components/admin/ui";
import { ExpertEditor } from "@/components/admin/ExpertEditor";
import { getStaff } from "@/lib/cms";

export default async function EditExpertPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await getStaff();
  const supabase = await createClient();
  const { data } = await supabase.from("experts").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <AdminPage title={data.name}>
      <ExpertEditor initial={data} readOnly={staff?.role === "sales"} />
    </AdminPage>
  );
}
