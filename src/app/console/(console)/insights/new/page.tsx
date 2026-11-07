import { AdminPage, AdminBtn } from "@/components/admin/ui";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { getStaff } from "@/lib/cms";
import { getEditorCategories } from "@/app/console/(console)/insights/data";

export default async function NewInsightPage() {
  const [staff, categories] = await Promise.all([getStaff(), getEditorCategories()]);
  return (
    <AdminPage title="Add new article" hint="Write the article, set how it should be found, then save a draft or publish." action={<AdminBtn variant="ghost" href="/console/insights">All articles</AdminBtn>}>
      <ArticleEditor operatorName={staff?.full_name ?? ""} categories={categories} />
    </AdminPage>
  );
}
