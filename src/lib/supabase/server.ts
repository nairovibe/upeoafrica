import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import { isRemembered, REMEMBER_COOKIE, withRemember } from "@/lib/supabase/remember";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            const remember = isRemembered(cookieStore.get(REMEMBER_COOKIE)?.value);
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, withRemember(options, remember)),
            );
          } catch {
            // Called from a Server Component. Middleware will refresh the session.
          }
        },
      },
    },
  );
}

/** Anonymous client with no request cookies, so results are the same for every visitor and safe to cache. */
export function createPublicClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll() {} } },
  );
}

export async function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;

  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );
}
