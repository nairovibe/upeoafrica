import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, FilterTabs } from "@/components/admin/ui";
import { ManageTable, type DeskItem } from "@/components/admin/ManageTable";
import { formatDay } from "@/components/admin/studio/format";
import { formatKes, formatMoney } from "@/lib/constants";
import { chargeKes, currentOffer } from "@/lib/offer";
import { parseTiers, tierDue, tiersFrom } from "@/lib/tiers";
import { getStaff } from "@/lib/cms";
import { withParams } from "@/components/admin/money/format";

const TABS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "drafts", label: "Drafts" },
  { id: "trash", label: "Trash" },
] as const;

export default async function ProductsListPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const { show } = await searchParams;
  const tab = TABS.find((item) => item.id === show)?.id ?? "all";
  const staff = await getStaff();
  const canEdit = staff?.role !== "sales";
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, title, slug, type, price_kes, currency, price_tiers, promo_price_kes, promo_label, promo_starts_at, promo_ends_at, version, published, updated_at, deleted_at, orders(amount_kes, currency, status)")
    .order("title");

  const products = (data ?? []).map((product) => {
    const paid = (product.orders ?? []).filter((order) => order.status === "paid");
    return {
      ...product,
      sales: paid.length,
      revenue: paid.reduce((sum, order) => sum + (order.currency === "USD" ? 0 : order.amount_kes), 0),
    };
  });
  const activeRows = products.filter((product) => !product.deleted_at);
  const trashed = products.filter((product) => product.deleted_at);
  const rows =
    tab === "trash" ? trashed : activeRows.filter((product) => tab === "all" || (tab === "live" ? product.published : !product.published));
  const totalSales = activeRows.reduce((sum, product) => sum + product.sales, 0);
  const totalRevenue = activeRows.reduce((sum, product) => sum + product.revenue, 0);
  const items: DeskItem[] = rows.map((product) => ({
    id: product.id,
    title: product.title,
    path: `/products/${product.slug}`,
    editHref: `/console/products/${product.id}`,
    viewHref: product.published && !product.deleted_at ? `/products/${product.slug}` : null,
    status: product.deleted_at ? "Trash" : product.published ? "Live" : "Draft",
    tone: product.deleted_at ? "warning" : product.published ? "success" : "neutral",
    updated: formatDay(product.deleted_at || product.updated_at),
    deleted: Boolean(product.deleted_at),
    details: [
      product.type === "saas" ? "SaaS" : product.type,
      (() => {
        const tiers = parseTiers(product.price_tiers);
        const from = tiersFrom(tiers);
        if (from != null) {
          const dues = tiers.map((tier) => tierDue(tier));
          if (dues.every((amount) => amount <= 0)) return `Free · ${tiers.length} tiers`;
          if (from <= 0) return `From free · ${tiers.length} tiers`;
          return `From ${formatMoney(from, product.currency)} · ${tiers.length} tiers`;
        }
        const offer = currentOffer(product);
        const due = chargeKes(product);
        if (due <= 0) return "Free";
        return offer ? `${formatMoney(due, product.currency)} · ${offer.label}` : formatMoney(due, product.currency);
      })(),
      product.version || "-",
      String(product.sales),
      product.revenue ? formatKes(product.revenue) : "-",
    ],
    quickName: product.title,
    quickSlug: product.slug,
    quickLive: product.published,
  }));
  const counts = {
    all: activeRows.length,
    live: activeRows.filter((product) => product.published).length,
    drafts: activeRows.filter((product) => !product.published).length,
    trash: trashed.length,
  };
  const newBtn = canEdit ? (
    <AdminBtn href="/console/products/new" icon={<Plus aria-hidden />}>
      New product
    </AdminBtn>
  ) : null;

  return (
    <AdminPage title="Products" action={newBtn}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs
          active={tab}
          items={TABS.map((item) => ({
            id: item.id,
            label: item.label,
            href: withParams("/console/products", { show: item.id === "all" ? undefined : item.id }),
            count: counts[item.id],
          }))}
        />
        <p className="text-[13px] text-body">
          <span className="font-semibold tabular-nums text-ink-900">{totalSales}</span> paid sales
          <span className="mx-2 text-line">|</span>
          <span className="font-semibold tabular-nums text-ink-900">{formatKes(totalRevenue)}</span> revenue
        </p>
      </div>
      <ManageTable
        resource="products"
        items={items}
        canEdit={canEdit}
        headers={["Type", "Price", "Version", "Sales", "Revenue"]}
        hasSlug
        hasLive
        nameLabel="Product"
        trashView={tab === "trash"}
        empty={tab === "trash" ? "Trash is empty." : products.length === 0 ? "No products yet. Plugins, downloads and SaaS plans you sell will be listed here." : "No products in this view."}
      />
    </AdminPage>
  );
}
