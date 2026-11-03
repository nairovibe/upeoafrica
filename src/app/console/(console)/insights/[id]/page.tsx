import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminBtn, AdminPage } from "@/components/admin/ui";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { getStaff } from "@/lib/cms";
import { getEditorCategories } from "@/app/console/(console)/insights/data";

export default async function EditInsightPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data }, staff, categories] = await Promise.all([
    supabase.from("articles").select("*").eq("id", id).maybeSingle(),
    getStaff(),
    getEditorCategories(),
  ]);
  if (!data) notFound();
  return (
    <AdminPage title="Edit article" action={<AdminBtn variant="ghost" href="/console/insights">All articles</AdminBtn>}>
      <ArticleEditor key={data.id} initial={data} operatorName={staff?.full_name ?? ""} categories={categories} />
    </AdminPage>
  );
}
