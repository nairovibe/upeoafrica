import { AdminPage } from "@/components/admin/ui";
import { ArticleEditor } from "@/components/admin/ArticleEditor";

export default function NewInsightPage() {
  return (
    <AdminPage title="New article">
      <ArticleEditor />
    </AdminPage>
  );
}
