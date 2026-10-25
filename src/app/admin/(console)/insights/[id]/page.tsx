import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPage } from "@/components/admin/ui";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export default async function EditInsightPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();
  return (
    <AdminPage title={data.title}>
      <ArticleEditor initial={data} />
    </AdminPage>
  );
}
