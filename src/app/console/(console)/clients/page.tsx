import Link from "next/link";
import { Building2, Plus, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, AdminTable } from "@/components/admin/ui";
import { Thumb } from "@/components/admin/studio/Thumb";
import { billedTotal } from "@/components/admin/house/invoices";
import { getStaff } from "@/lib/cms";
import { formatKes, publicMediaUrl } from "@/lib/constants";

export default async function ClientsListPage() {
  const staff = await getStaff();
  const canEdit = staff?.role === "owner" || staff?.role === "editor";
  const supabase = await createClient();
  const [{ data }, { data: invoices }] = await Promise.all([
    supabase.from("clients").select("*").order("sort_order").order("name"),
    supabase.from("invoices").select("client_id, status, total_kes").not("client_id", "is", null),
  ]);

  const byClient = new Map<string, { status: string; total_kes: number }[]>();
  for (const inv of invoices ?? []) {
    if (!inv.client_id || inv.status === "void") continue;
    byClient.set(inv.client_id, [...(byClient.get(inv.client_id) ?? []), inv]);
  }
  const clients = data ?? [];
  const addBtn = canEdit ? (
    <AdminBtn href="/console/clients/new" icon={<Plus aria-hidden />}>
      Add client
    </AdminBtn>
  ) : null;

  return (
    <AdminPage title="Clients" action={addBtn}>
        <AdminTable
          headers={["", "Name", "Billing email", "Phone", "On site", "Invoices", "Billed"]}
          empty="No clients yet. Companies you bill and feature on the site will be listed here."
          emptyAction={addBtn}
          rows={clients.map((row) => {
            const list = byClient.get(row.id) ?? [];
            return [
              <Thumb key="logo" src={publicMediaUrl(row.logo_path)} icon={Building2} fit="contain" className="h-9 w-9" />,
              <Link key="name" href={`/console/clients/${row.id}`} className="font-medium text-ink-900 hover:text-brand-600">
                {row.name}
              </Link>,
              <span key="email" className="text-body">{row.billing_email || "-"}</span>,
              <span key="phone" className="whitespace-nowrap text-body">{row.phone || "-"}</span>,
              row.featured ? (
                <Star key="featured" className="h-4 w-4 fill-brand-500 text-brand-500" aria-label="Featured" />
              ) : (
                <span key="featured" className="text-muted">-</span>
              ),
              <span key="count" className="tabular-nums text-body">{list.length}</span>,
              <span key="billed" className="whitespace-nowrap font-display tabular-nums text-ink-900">
                {list.length ? formatKes(billedTotal(list)) : "-"}
              </span>,
            ];
          })}
        />
    </AdminPage>
  );
}
