import type { Metadata } from "next";
import { Suspense } from "react";
import { CTA } from "@/components/sections/CTA";
import { BlogIndex, BlogIndexFromUrl } from "@/components/blog/BlogIndex";
import { getAllLiveArticleCards, getBlogCategories, getFeaturedArticle } from "@/lib/blog";

const intro =
  "Practical writing on software, payments, design, and growing a business in Kenya and East Africa, from the team that builds it every day in Mombasa.";

export const metadata: Metadata = {
  title: "Blog",
  description: intro,
  alternates: { canonical: "/blogs" },
};

export default async function BlogsPage() {
  const [featured, categories, posts] = await Promise.all([
    getFeaturedArticle(),
    getBlogCategories(),
    getAllLiveArticleCards(),
  ]);
  const index = { featured, categories, posts };

  return (
    <>
      <Suspense fallback={<BlogIndex {...index} page={1} />}>
        <BlogIndexFromUrl {...index} />
      </Suspense>

      <CTA
        title="Ready to talk about a project?"
        intro="If a piece here matches work you have in mind, tell us the initiative. We scope it, price it, and stay with it through launch."
      />
    </>
  );
}
