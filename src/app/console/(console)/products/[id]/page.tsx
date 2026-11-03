import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage } from "@/components/admin/ui";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { getStaff } from "@/lib/cms";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await getStaff();
  if (staff?.role === "sales") redirect("/console/products");
  const supabase = await createClient();
  const [{ data }, { data: paid }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("orders").select("amount_kes").eq("product_id", id).eq("status", "paid"),
  ]);
  if (!data) notFound();
  const sales = { count: paid?.length ?? 0, revenue: (paid ?? []).reduce((s, o) => s + o.amount_kes, 0) };
  return (
    <AdminPage title={data.title} action={<AdminBtn variant="ghost" href="/console/products">All products</AdminBtn>}>
      <ProductEditor initial={data} sales={sales} />
    </AdminPage>
  );
}
