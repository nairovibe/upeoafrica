import { createClient } from "@/lib/supabase/server";

export async function getEditorCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("category").not("category", "is", null);
  return [...new Set((data ?? []).map((r) => r.category?.trim()).filter((c): c is string => Boolean(c)))].sort();
}
