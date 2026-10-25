import { AdminPage } from "@/components/admin/ui";
import { ProductEditor } from "@/components/admin/ProductEditor";

export default function NewProductPage() {
  return (
    <AdminPage title="New product">
      <ProductEditor />
    </AdminPage>
  );
}
