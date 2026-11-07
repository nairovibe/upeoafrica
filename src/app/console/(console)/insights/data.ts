import { createClient } from "@/lib/supabase/server";

export async function getEditorTaxonomy() {
  const supabase = await createClient();
  const { data } = await supabase.from("articles").select("category, tags");
  const categories = new Set<string>();
  const tags = new Set<string>();
  for (const row of data ?? []) {
    const category = row.category?.trim();
    if (category) categories.add(category);
    for (const tag of row.tags ?? []) {
      const clean = tag.trim();
      if (clean) tags.add(clean);
    }
  }
  const sort = (values: Set<string>) => [...values].sort((a, b) => a.localeCompare(b));
  return { categories: sort(categories), tags: sort(tags) };
}
