import Link from "next/link";
import { Package, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, AdminTable, FilterTabs, Pill } from "@/components/admin/ui";
import { formatKes, publicMediaUrl } from "@/lib/constants";
import { getStaff } from "@/lib/cms";
import { withParams } from "@/components/admin/money/format";

const TABS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "drafts", label: "Drafts" },
] as const;

export default async function ProductsListPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show } = await searchParams;
  const tab = TABS.find((t) => t.id === show)?.id ?? "all";
  const staff = await getStaff();
  const canEdit = staff?.role !== "sales";
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, title, slug, type, price_kes, version, cover_path, published, orders(amount_kes, status)")
    .order("title");

  const products = (data ?? []).map((p) => {
    const paid = (p.orders ?? []).filter((o) => o.status === "paid");
    return { ...p, sales: paid.length, revenue: paid.reduce((s, o) => s + o.amount_kes, 0) };
  });
  const counts = {
    all: products.length,
    live: products.filter((p) => p.published).length,
    drafts: products.filter((p) => !p.published).length,
  };
  const rows = products.filter((p) => tab === "all" || (tab === "live" ? p.published : !p.published));
  const totalSales = products.reduce((s, p) => s + p.sales, 0);
  const totalRevenue = products.reduce((s, p) => s + p.revenue, 0);
  const newBtn = canEdit ? (
    <AdminBtn href="/console/products/new" icon={<Plus aria-hidden />}>
      New product
    </AdminBtn>
  ) : null;

  return (
    <AdminPage title="Products" action={newBtn}>
      <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <FilterTabs
              active={tab}
              items={TABS.map((t) => ({
                id: t.id,
                label: t.label,
                href: withParams("/console/products", { show: t.id === "all" ? undefined : t.id }),
                count: counts[t.id],
              }))}
            />
            <p className="text-[13px] text-body">
              <span className="font-semibold tabular-nums text-ink-900">{totalSales}</span> paid sales
              <span className="mx-2 text-line">|</span>
              <span className="font-semibold tabular-nums text-ink-900">{formatKes(totalRevenue)}</span> revenue
            </p>
          </div>
          <AdminTable
            headers={["Product", "Type", "Price", "Version", "Sales", "Revenue", "Status", ""]}
            minWidth={820}
            empty={
              products.length === 0
                ? "No products yet. Plugins, downloads and SaaS plans you sell will be listed here."
                : "No products in this view."
            }
            emptyAction={products.length === 0 ? newBtn : null}
            rows={rows.map((p) => {
              const cover = publicMediaUrl(p.cover_path);
              return [
                <div key="p" className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[5px] border border-line bg-surface-2">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cover} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-4 w-4 text-muted" aria-hidden />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-900">{p.title}</p>
                    <p className="truncate text-xs text-muted">/products/{p.slug}</p>
                  </div>
                </div>,
                <Pill key="t" tone="neutral">
                  {p.type === "saas" ? "SaaS" : p.type}
                </Pill>,
                <span key="pr" className="whitespace-nowrap tabular-nums">
                  {p.price_kes > 0 ? formatKes(p.price_kes) : <span className="text-muted">On request</span>}
                </span>,
                <span key="v" className="text-body">
                  {p.version || "—"}
                </span>,
                <span key="s" className="tabular-nums">
                  {p.sales}
                </span>,
                <span key="r" className="whitespace-nowrap tabular-nums">
                  {p.revenue ? formatKes(p.revenue) : "—"}
                </span>,
                <Pill key="st" tone={p.published ? "success" : "neutral"}>
                  {p.published ? "Live" : "Draft"}
                </Pill>,
                canEdit ? (
                  <Link key="e" href={`/console/products/${p.id}`} className="text-[13px] font-medium text-brand-600 hover:underline">
                    Edit
                  </Link>
                ) : null,
              ];
            })}
          />
      </>
    </AdminPage>
  );
}
