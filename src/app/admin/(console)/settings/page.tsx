import { AdminPage } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings, getStaff } from "@/lib/cms";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SettingsPage() {
  const staff = await getStaff();
  if (staff?.role !== "owner") redirect("/admin");
  const settings = await getSettings();
  if (!settings) redirect("/admin");
  return (
    <AdminPage
      title="Settings"
      hint="Identity for invoices, the 24 hour acknowledgement, and the public site."
      action={
        <Link href="/admin/team" className="text-sm font-medium text-brand-600">
          Team access
        </Link>
      }
    >
      <SettingsForm
        initial={settings}
        payments={{
          live: process.env.INTASEND_TEST === "false",
          keys: Boolean(process.env.INTASEND_SECRET_KEY),
          webhook: Boolean(process.env.INTASEND_WEBHOOK_SECRET),
        }}
      />
    </AdminPage>
  );
}
