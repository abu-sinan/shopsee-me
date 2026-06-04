import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Next.js 16: renamed from middleware.ts → proxy.ts
// Runs on Node.js runtime (not Edge)
export function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // NOTE: In Next.js 16 proxy, do NOT use async/await for auth.getUser()
  // Auth checks should happen in Server Components / Route Handlers
  // proxy.ts handles only routing decisions

  const { pathname } = request.nextUrl;

  // Protect /admin — check for auth cookie presence (lightweight)
  const hasSession =
    request.cookies.get("sb-access-token") ||
    request.cookies.getAll().some((c) => c.name.includes("sb-") && c.name.includes("-auth-token"));

  if (pathname.startsWith("/admin") && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (
    pathname.startsWith("/account") &&
    pathname !== "/account/reset-password" &&
    !hasSession
  ) {
    const url = request.nextUrl.clone();
    url.pathname  = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

// Next.js 16: config export still works the same
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
