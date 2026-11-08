import Link from "next/link";
import { AdminPage, EmptyState } from "@/components/admin/ui";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSettings, getStaff } from "@/lib/cms";
import { listLoginSessions } from "@/lib/sessions";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const { section } = await searchParams;
  const [staff, settings, sessions] = await Promise.all([getStaff(), getSettings(), listLoginSessions()]);
  const isOwner = staff?.role === "owner";

  return (
    <AdminPage
      title="Settings"
      action={
        <Link href="/console/team" className="text-sm font-medium text-brand-600 hover:underline">
          Team access
        </Link>
      }
    >
      {settings ? (
        <SettingsForm
          initial={settings}
          canEdit={isOwner}
          initialSection={section}
          sessions={sessions}
          profile={{
            name: staff?.full_name ?? "",
            email: staff?.email ?? "",
            role: staff?.role ?? "",
            avatarPath: staff?.avatar_path ?? "",
          }}
          payments={{
            live: process.env.INTASEND_TEST === "false",
            keys: Boolean(process.env.INTASEND_SECRET_KEY),
            webhook: Boolean(process.env.INTASEND_WEBHOOK_SECRET),
          }}
        />
      ) : (
        <EmptyState>The settings record is missing from the database.</EmptyState>
      )}
    </AdminPage>
  );
}
