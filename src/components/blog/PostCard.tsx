import Image from "next/image";
import Link from "next/link";
import { publicMediaUrl } from "@/lib/constants";
import type { ArticleCard } from "@/lib/blog";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function PostMeta({ post }: { post: Pick<ArticleCard, "published_at" | "reading_minutes"> }) {
  return (
    <p className="text-[13px] text-muted">
      <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at)}</time>
      {post.reading_minutes ? <> · {post.reading_minutes} min read</> : null}
    </p>
  );
}

export function PostCard({ post }: { post: ArticleCard }) {
  const cover = publicMediaUrl(post.cover_path);
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-[5px] border border-line bg-white transition-colors duration-200 hover:border-brand-300"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-3">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {post.category ? <p className="text-xs font-semibold text-brand-600">{post.category}</p> : null}
        <h2 className="mt-1.5 font-display text-lg font-semibold leading-snug text-ink-900 group-hover:text-brand-600">
          {post.title}
        </h2>
        {post.excerpt ? <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-body">{post.excerpt}</p> : null}
        <div className="mt-auto pt-4">
          <PostMeta post={post} />
        </div>
      </div>
    </Link>
  );
}
