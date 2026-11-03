import { AdminPage, AdminBtn } from "@/components/admin/ui";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { getStaff } from "@/lib/cms";
import { getEditorCategories } from "@/app/console/(console)/insights/data";

export default async function NewInsightPage() {
  const [staff, categories] = await Promise.all([getStaff(), getEditorCategories()]);
  return (
    <AdminPage title="New article" action={<AdminBtn variant="ghost" href="/console/insights">All articles</AdminBtn>}>
      <ArticleEditor operatorName={staff?.full_name ?? ""} categories={categories} />
    </AdminPage>
  );
}
