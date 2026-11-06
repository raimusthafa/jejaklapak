import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder-project.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "sb_publishable_placeholder";

  // If using placeholder credentials, pass through safely
  if (supabaseUrl.includes("placeholder")) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh auth token dan dapatkan user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Daftar rute terlindungi khusus pedagang
  const protectedMerchantRoutes = [
    "/merchant/dashboard",
    "/merchant/profile",
    "/merchant/schedule",
  ];
  const isProtectedMerchantRoute = protectedMerchantRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Daftar rute terlindungi khusus admin
  const isAdminRoute = pathname.startsWith("/admin");

  // 1. Belum login mencoba akses area terproteksi -> redirect ke login
  if (!user && (isProtectedMerchantRoute || isAdminRoute)) {
    const loginUrl = new URL("/merchant/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Sudah login mencoba buka login / register -> redirect ke dashboard
  if (user && (pathname === "/merchant/login" || pathname === "/merchant/register")) {
    const role =
      (user.app_metadata?.role as string) ||
      (user.user_metadata?.role as string) ||
      (user.email?.toLowerCase().includes("admin") ? "ADMIN" : "MERCHANT");

    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/merchant/dashboard", request.url));
  }

  // 3. User bukan ADMIN mencoba akses area /admin -> redirect ke dashboard pedagang
  if (user && isAdminRoute) {
    const role =
      (user.app_metadata?.role as string) ||
      (user.user_metadata?.role as string) ||
      (user.email?.toLowerCase().includes("admin") ? "ADMIN" : "MERCHANT");

    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/merchant/dashboard", request.url));
    }
  }

  return response;
}
