import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: "CUSTOMER" | "MERCHANT" | "ADMIN";
}

/**
 * Mendapatkan data user yang terautentikasi (cached per request).
 * Menggunakan getUser() Supabase untuk verifikasi server yang aman.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email ?? "",
      name: (user.user_metadata?.name as string) ?? "Pedagang",
      role: (user.app_metadata?.role as "CUSTOMER" | "MERCHANT" | "ADMIN") ?? "MERCHANT",
    };
  } catch {
    return null;
  }
});

/**
 * Guard untuk halaman / Server Action terproteksi.
 * Jika belum login, redirect ke /merchant/login.
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    // Mode demo / fallback untuk demonstrasi jika database belum terkoneksi
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    if (supabaseUrl.includes("placeholder")) {
      return {
        id: "demo-merchant-id",
        email: "demo@jejaklapak.com",
        name: "Mang Asep (Demo)",
        role: "MERCHANT",
      };
    }

    redirect("/merchant/login");
  }

  return user;
}

