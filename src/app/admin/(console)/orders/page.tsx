import { createClient } from "@/lib/supabase/server";
import { AdminPage, AdminTable } from "@/components/admin/ui";
import { formatKes } from "@/lib/constants";
import { OrderRowActions } from "@/components/admin/OrderRowActions";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("id, email, phone, amount_kes, status, created_at, product_id, kind, event_id, attendee_name")
    .order("created_at", { ascending: false });
  const [{ data: products }, { data: events }] = await Promise.all([
    supabase.from("products").select("id, title"),
    supabase.from("events").select("id, title"),
  ]);
  const productTitles = Object.fromEntries((products ?? []).map((p) => [p.id, p.title]));
  const eventTitles = Object.fromEntries((events ?? []).map((e) => [e.id, e.title]));

  return (
    <AdminPage title="Orders" hint="Product till and event tickets. Paid product orders unlock a seven-day download link.">
      <AdminTable
        headers={["When", "Buyer", "Item", "Amount", "Status", ""]}
        empty="No orders yet. Product checkout and event tickets land here."
        rows={(data ?? []).map((row) => [
          new Date(row.created_at).toLocaleString("en-KE"),
          <div key={row.id}>
            <p>{row.attendee_name || row.email}</p>
            <p className="text-xs text-muted">
              {row.email}
              {row.phone ? ` · ${row.phone}` : ""}
            </p>
          </div>,
          <div key={row.id + "i"}>
            <p>
              {row.kind === "ticket"
                ? eventTitles[row.event_id ?? ""] || "Event ticket"
                : productTitles[row.product_id ?? ""] || "Product"}
            </p>
            <p className="text-xs text-muted">{row.kind}</p>
          </div>,
          formatKes(row.amount_kes),
          row.status,
          <OrderRowActions key={row.id + "a"} orderId={row.id} kind={row.kind} status={row.status} />,
        ])}
      />
    </AdminPage>
  );
}
