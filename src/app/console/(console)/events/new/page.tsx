import { AdminPage } from "@/components/admin/ui";
import { EventEditor } from "@/components/admin/EventEditor";

export default function NewEventPage() {
  return (
    <AdminPage title="New event">
      <EventEditor />
    </AdminPage>
  );
}
