import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage } from "@/components/admin/ui";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { getStaff } from "@/lib/cms";
import { getEditorTaxonomy } from "@/app/console/(console)/insights/data";

export default async function EditInsightPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, staff, taxonomy] = await Promise.all([
    supabase.from("articles").select("*").eq("id", id).maybeSingle(),
    getStaff(),
    getEditorTaxonomy(),
  ]);
  if (!data) notFound();
  return (
    <AdminPage title="Edit article" hint="The score on the right is what search and answer engines can actually use." action={<AdminBtn variant="ghost" href={data.deleted_at ? "/console/insights?status=trash" : "/console/insights"}>All articles</AdminBtn>}>
      {data.deleted_at ? (
        <p className="mb-4 rounded-[5px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-ink-900">
          This article is in the trash. Restore it from the blog list before it can go live again.
        </p>
      ) : null}
      <ArticleEditor key={data.id} initial={data} operatorName={staff?.full_name ?? ""} operatorPhoto={staff?.avatar_path ?? ""} categories={taxonomy.categories} tags={taxonomy.tags} />
    </AdminPage>
  );
}
