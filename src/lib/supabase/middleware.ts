import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isRemembered,
  REMEMBER_COOKIE,
  REMEMBER_MAX_AGE,
  withRemember,
} from "@/lib/supabase/remember";

function redirectWithSession(url: URL, sessionResponse: NextResponse) {
  const redirect = NextResponse.redirect(url);
  sessionResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return supabaseResponse;

  const remember = isRemembered(request.cookies.get(REMEMBER_COOKIE)?.value);

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, withRemember(options, remember)),
        );
        if (remember) {
          supabaseResponse.cookies.set(REMEMBER_COOKIE, "1", {
            path: "/",
            sameSite: "lax",
            secure: request.nextUrl.protocol === "https:",
            maxAge: REMEMBER_MAX_AGE,
          });
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isLogin = path === "/console/login";
  const isAdmin = path.startsWith("/console");

  if (isAdmin && !isLogin && !user) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/console/login";
    redirect.searchParams.set("next", path);
    return redirectWithSession(redirect, supabaseResponse);
  }

  if (isLogin && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (profile) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/console";
      redirect.search = "";
      return redirectWithSession(redirect, supabaseResponse);
    }
  }

  return supabaseResponse;
}
