import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPage } from "@/components/admin/ui";
import { ProductEditor } from "@/components/admin/ProductEditor";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <AdminPage title={data.title}>
      <ProductEditor initial={data} />
    </AdminPage>
  );
}
