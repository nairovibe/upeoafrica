import { unstable_cache } from "next/cache";

/**
 * How long a public read is reused. Publishing from the console invalidates
 * this immediately. A short window rewrites the cache for every crawler and
 * burns the hosting CPU and cache-write allowance.
 */
export const PUBLIC_TTL = 60 * 60 * 12;
export const PUBLIC_TAG = "site";

/**
 * Caches a public, visitor-independent read across requests. Arguments are part
 * of the cache key. Only wrap functions that use createPublicClient().
 */
export function publicRead<A extends unknown[], R>(name: string, fn: (...args: A) => Promise<R>) {
  return unstable_cache(fn, ["public", name], { revalidate: PUBLIC_TTL, tags: [PUBLIC_TAG] });
}
