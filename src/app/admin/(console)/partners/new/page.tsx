import { AdminPage } from "@/components/admin/ui";
import { PartnerEditor } from "@/components/admin/PartnerEditor";

export default function NewPartnerPage() {
  return (
    <AdminPage title="New partner">
      <PartnerEditor />
    </AdminPage>
  );
}
