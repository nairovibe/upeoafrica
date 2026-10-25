import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { getStaff } from "@/lib/cms";
import { getDeskBadges } from "@/lib/desk";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

export default async function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getStaff();
  if (!profile) redirect("/admin/login");
  const badges = await getDeskBadges();
  return (
    <AdminShell profile={profile} badges={badges}>
      {children}
    </AdminShell>
  );
}
