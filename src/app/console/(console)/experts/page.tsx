import Link from "next/link";
import { Plus, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage, AdminTable, Pill } from "@/components/admin/ui";
import { Thumb } from "@/components/admin/studio/Thumb";
import { getStaff } from "@/lib/cms";
import { EXPERT_DISCIPLINES, publicMediaUrl } from "@/lib/constants";

export default async function ExpertsPage() {
  const staff = await getStaff();
  const canEdit = staff?.role === "owner" || staff?.role === "editor";
  const supabase = await createClient();
  const { data } = await supabase.from("experts").select("*").order("sort_order").order("name");
  const experts = data ?? [];
  const addBtn = canEdit ? (
    <AdminBtn href="/console/experts/new" icon={<Plus aria-hidden />}>
      Add expert
    </AdminBtn>
  ) : null;

  return (
    <AdminPage title="Experts" hint="People published here appear on the About page." action={addBtn}>
      <AdminTable
        headers={["", "Name", "Role", "Practice", "Published", "Sort"]}
        empty="No experts yet. Add the people clients should meet."
        emptyAction={addBtn}
        rows={experts.map((row) => [
          <Thumb key="photo" src={publicMediaUrl(row.photo_path)} icon={UserRound} className="h-9 w-9" />,
          <Link key="name" href={`/console/experts/${row.id}`} className="font-medium text-ink-900 hover:text-brand-600">
            {row.name}
          </Link>,
          <span key="title" className="text-body">{row.title || "-"}</span>,
          <span key="discipline" className="text-body">
            {EXPERT_DISCIPLINES.find((item) => item.value === row.discipline)?.label ?? row.discipline}
          </span>,
          <Pill key="published" tone={row.published ? "brand" : "neutral"}>
            {row.published ? "Live" : "Draft"}
          </Pill>,
          <span key="sort" className="tabular-nums text-body">{row.sort_order}</span>,
        ])}
      />
    </AdminPage>
  );
}
