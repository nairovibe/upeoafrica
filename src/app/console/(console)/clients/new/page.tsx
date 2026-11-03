import { redirect } from "next/navigation";
import { AdminPage } from "@/components/admin/ui";
import { ClientEditor } from "@/components/admin/ClientEditor";
import { getStaff } from "@/lib/cms";

export default async function NewClientPage() {
  const staff = await getStaff();
  if (staff?.role === "sales") redirect("/console/clients");
  return (
    <AdminPage title="New client">
      <div className="max-w-3xl">
        <ClientEditor />
      </div>
    </AdminPage>
  );
}
