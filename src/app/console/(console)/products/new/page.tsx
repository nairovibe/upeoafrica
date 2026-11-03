import { redirect } from "next/navigation";
import { AdminBtn, AdminPage } from "@/components/admin/ui";
import { ProductEditor } from "@/components/admin/ProductEditor";
import { getStaff } from "@/lib/cms";

export default async function NewProductPage() {
  const staff = await getStaff();
  if (staff?.role === "sales") redirect("/console/products");
  return (
    <AdminPage title="New product" action={<AdminBtn variant="ghost" href="/console/products">All products</AdminBtn>}>
      <ProductEditor />
    </AdminPage>
  );
}
