"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";
import { readBrowserCookies, writeBrowserCookies } from "@/lib/supabase/remember";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return readBrowserCookies();
        },
        setAll(cookies) {
          writeBrowserCookies(cookies);
        },
      },
    },
  );
}
