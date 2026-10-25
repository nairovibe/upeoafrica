import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, AdminTable } from "@/components/admin/ui";
import { formatKes } from "@/lib/constants";

export default async function InvoicesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("invoices").select("*").order("created_at", { ascending: false });
  return (
    <AdminPage
      title="Invoices"
      hint="Agency work, retainers, and training. Simple KES. Collect with M-Pesa or mark paid."
      action={<AdminBtn href="/admin/invoices/new">New invoice</AdminBtn>}
    >
      <AdminTable
        headers={["Number", "Bill to", "Total", "Status", ""]}
        empty="No invoices yet. Raise one from a won lead or start a blank draft."
        rows={(data ?? []).map((row) => [
          row.number,
          <div key={row.id}>
            <p>{row.bill_name}</p>
            <p className="text-xs text-muted">{row.bill_email}</p>
          </div>,
          formatKes(Number(row.total_kes)),
          row.status,
          <Link key={row.id + "e"} href={`/admin/invoices/${row.id}`} className="text-brand-600 hover:underline">
            Open
          </Link>,
        ])}
      />
    </AdminPage>
  );
}
