import Link from "next/link";
import { Handshake, Plus, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, AdminTable, Pill, type PillTone } from "@/components/admin/ui";
import { Thumb } from "@/components/admin/studio/Thumb";
import { getStaff } from "@/lib/cms";
import { PARTNER_RELATIONSHIPS, publicMediaUrl } from "@/lib/constants";

const TONE: Record<string, PillTone> = { official_dev_partner: "brand", technology: "neutral", other: "neutral" };

export default async function PartnersListPage() {
  const staff = await getStaff();
  const canEdit = staff?.role === "owner" || staff?.role === "editor";
  const supabase = await createClient();
  const { data } = await supabase.from("partners").select("*").order("sort_order").order("name");
  const partners = data ?? [];
  const addBtn = canEdit ? (
    <AdminBtn href="/console/partners/new" icon={<Plus aria-hidden />}>
      Add partner
    </AdminBtn>
  ) : null;

  return (
    <AdminPage title="Partners" action={addBtn}>
        <AdminTable
          headers={["", "Name", "Relationship", "Featured", "Sort"]}
          empty="No partners yet. Technology and delivery partners will be listed here."
          emptyAction={addBtn}
          rows={partners.map((row) => [
            <Thumb key="logo" src={publicMediaUrl(row.logo_path)} icon={Handshake} fit="contain" className="h-9 w-9" />,
            <Link key="name" href={`/console/partners/${row.id}`} className="font-medium text-ink-900 hover:text-brand-600">
              {row.name}
            </Link>,
            <Pill key="rel" tone={TONE[row.relationship] ?? "neutral"}>
              {PARTNER_RELATIONSHIPS.find((r) => r.value === row.relationship)?.label ?? row.relationship}
            </Pill>,
            row.featured ? (
              <Star key="featured" className="h-4 w-4 fill-brand-500 text-brand-500" aria-label="Featured" />
            ) : (
              <span key="featured" className="text-muted">-</span>
            ),
            <span key="sort" className="tabular-nums text-body">{row.sort_order}</span>,
          ])}
        />
    </AdminPage>
  );
}
