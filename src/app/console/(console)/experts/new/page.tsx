import { redirect } from "next/navigation";
import { AdminPage } from "@/components/admin/ui";
import { ExpertEditor } from "@/components/admin/ExpertEditor";
import { getStaff } from "@/lib/cms";

export default async function NewExpertPage() {
  const staff = await getStaff();
  if (staff?.role === "sales") redirect("/console/experts");
  return (
    <AdminPage title="New expert">
      <ExpertEditor />
    </AdminPage>
  );
}
