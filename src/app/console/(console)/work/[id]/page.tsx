import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPage, Pill } from "@/components/admin/ui";
import { WorkEditor } from "@/components/admin/WorkEditor";
import { getStaff } from "@/lib/cms";
import { services } from "@/lib/services";

export default async function EditWorkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await getStaff();
  const supabase = await createClient();
  const [{ data: row }, { data: clients }, { data: rows }] = await Promise.all([
    supabase.from("case_studies").select("*").eq("id", id).maybeSingle(),
    supabase.from("clients").select("id, name").is("deleted_at", null).order("name"),
    supabase.from("case_studies").select("industry"),
  ]);
  if (!row) notFound();
  const industries = [...new Set((rows ?? []).map((r) => r.industry).filter((i): i is string => Boolean(i)))].sort();
  return (
    <AdminPage
      title={row.title}
      action={<Pill tone={row.published_at ? "success" : "neutral"}>{row.published_at ? "Live" : "Draft"}</Pill>}
    >
      <WorkEditor
        initial={row}
        clients={clients ?? []}
        serviceOptions={services.map((s) => s.title)}
        industries={industries}
        readOnly={staff?.role === "sales"}
      />
    </AdminPage>
  );
}
