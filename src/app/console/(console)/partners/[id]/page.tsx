import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPage } from "@/components/admin/ui";
import { PartnerEditor } from "@/components/admin/PartnerEditor";
import { getStaff } from "@/lib/cms";

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await getStaff();
  const supabase = await createClient();
  const { data } = await supabase.from("partners").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <AdminPage title={data.name}>
      <PartnerEditor initial={data} readOnly={staff?.role === "sales"} />
    </AdminPage>
  );
}
