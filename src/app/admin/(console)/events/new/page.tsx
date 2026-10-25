import { AdminPage } from "@/components/admin/ui";
import { EventEditor } from "@/components/admin/EventEditor";

export default function NewEventPage() {
  return (
    <AdminPage title="New event" hint="Publish when the public page should take ticket money.">
      <EventEditor />
    </AdminPage>
  );
}
