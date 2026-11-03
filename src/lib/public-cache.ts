import { unstable_cache } from "next/cache";

/** Seconds a public read is reused before the next visitor triggers a fresh query. */
export const PUBLIC_TTL = 60;
export const PUBLIC_TAG = "site";

/**
 * Caches a public, visitor-independent read across requests. Arguments are part
 * of the cache key. Only wrap functions that use createPublicClient().
 */
export function publicRead<A extends unknown[], R>(name: string, fn: (...args: A) => Promise<R>) {
  return unstable_cache(fn, ["public", name], { revalidate: PUBLIC_TTL, tags: [PUBLIC_TAG] });
}
