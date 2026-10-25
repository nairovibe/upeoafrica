import { AdminPage } from "@/components/admin/ui";
import { ClientEditor } from "@/components/admin/ClientEditor";

export default function NewClientPage() {
  return (
    <AdminPage title="New client">
      <ClientEditor />
    </AdminPage>
  );
}
