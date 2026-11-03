import { redirect } from "next/navigation";
import { AdminPage } from "@/components/admin/ui";
import { PartnerEditor } from "@/components/admin/PartnerEditor";
import { getStaff } from "@/lib/cms";

export default async function NewPartnerPage() {
  const staff = await getStaff();
  if (staff?.role === "sales") redirect("/console/partners");
  return (
    <AdminPage title="New partner">
      <PartnerEditor />
    </AdminPage>
  );
}
