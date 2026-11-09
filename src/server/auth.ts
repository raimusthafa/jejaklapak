import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export type UserRole = "CUSTOMER" | "MERCHANT" | "ADMIN";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  merchantId?: string;
  merchantSlug?: string;
  merchantName?: string;
  merchantImage?: string;
}

/**
 * Mendapatkan data user yang terautentikasi (cached per request).
 * Menggunakan getUser() Supabase untuk verifikasi server yang aman,
 * diperkaya dengan data profil dari database Prisma.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Default metadata fallback
    let role: UserRole =
      (user.app_metadata?.role as UserRole) ||
      (user.user_metadata?.role as UserRole) ||
      (user.email?.toLowerCase().includes("admin") ? "ADMIN" : "MERCHANT");

    let name: string =
      (user.user_metadata?.name as string) ||
      (user.email ? user.email.split("@")[0] : "Pengguna");

    let phone: string | undefined = user.user_metadata?.phone as string | undefined;
    let merchantId: string | undefined;
    let merchantSlug: string | undefined;
    let merchantImage: string | undefined;
    let merchantName: string | undefined =
      (user.user_metadata?.merchant_name as string) || undefined;

    // Coba ambil relasi dari database Prisma
    try {
      let dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          merchants: {
            take: 1,
            select: {
              id: true,
              slug: true,
              name: true,
              image: true,
            },
          },
        },
      });

      // Auto-sync jika user di Supabase belum ada di Prisma
      if (!dbUser && role === "MERCHANT") {
        try {
          const rawMeta = user.user_metadata || {};
          const mName = (rawMeta.merchant_name as string) || name || "Lapak Pedagang";
          const cleanSlugBase = mName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          const randomSuffix = Math.random().toString(36).substring(2, 6);
          const slug = `${cleanSlugBase}-${randomSuffix}`;

          dbUser = await prisma.user.create({
            data: {
              id: user.id,
              name,
              email: user.email ?? "",
              phone: phone || null,
              role: "MERCHANT",
              merchants: {
                create: {
                  name: mName,
                  slug,
                  category: (rawMeta.category as string) || "Makanan Berat",
                  phone: phone || "08000000000",
                  address: (rawMeta.address as string) || "Kota Bandung",
                  district: (rawMeta.district as string) || "Coblong (Dago / Dipati Ukur)",
                  city: "Bandung",
                  operatingArea: (rawMeta.operating_area as string) || "Bandung",
                  verificationStatus: "PENDING",
                },
              },
            },
            include: {
              merchants: {
                take: 1,
                select: {
                  id: true,
                  slug: true,
                  name: true,
                  image: true,
                },
              },
            },
          });
        } catch (syncErr) {
          console.warn("Auto-sync merchant failed:", syncErr);
        }
      } else if (
        dbUser &&
        dbUser.merchants.length === 0 &&
        role === "MERCHANT" &&
        user.user_metadata?.merchant_name
      ) {
        try {
          const rawMeta = user.user_metadata || {};
          const mName = (rawMeta.merchant_name as string) || name || "Lapak Pedagang";
          const cleanSlugBase = mName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          const randomSuffix = Math.random().toString(36).substring(2, 6);
          const slug = `${cleanSlugBase}-${randomSuffix}`;

          const newM = await prisma.merchant.create({
            data: {
              ownerId: dbUser.id,
              name: mName,
              slug,
              category: (rawMeta.category as string) || "Makanan Berat",
              phone: phone || "08000000000",
              address: (rawMeta.address as string) || "Kota Bandung",
              district: (rawMeta.district as string) || "Coblong (Dago / Dipati Ukur)",
              city: "Bandung",
              operatingArea: (rawMeta.operating_area as string) || "Bandung",
              verificationStatus: "PENDING",
            },
            select: {
              id: true,
              slug: true,
              name: true,
              image: true,
            },
          });
          dbUser.merchants = [newM];
        } catch (syncMErr) {
          console.warn("Auto-create merchant record failed:", syncMErr);
        }
      }

      if (dbUser) {
        role = dbUser.role as UserRole;
        name = dbUser.name || name;
        phone = dbUser.phone || phone;
        if (dbUser.merchants.length > 0) {
          merchantId = dbUser.merchants[0].id;
          merchantSlug = dbUser.merchants[0].slug;
          merchantName = dbUser.merchants[0].name;
          merchantImage = dbUser.merchants[0].image ?? undefined;
        }
      }
    } catch {
      // Prisma offline / fallback aman ke metadata Supabase
    }

    return {
      id: user.id,
      email: user.email ?? "",
      name,
      role,
      phone,
      merchantId,
      merchantSlug,
      merchantName,
      merchantImage,
    };
  } catch {
    return null;
  }
});

/**
 * Guard untuk halaman / Server Action terproteksi.
 * Memeriksa autentikasi dan opsi pembatasan role.
 */
export async function requireUser(allowedRoles?: UserRole[]): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    // Mode demo jika Supabase URL masih placeholder
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    if (supabaseUrl.includes("placeholder")) {
      return {
        id: "00000000-0000-4000-8000-000000000001",
        email: "demo@jejaklapak.id",
        name: "Mang Asep (Demo)",
        role: "MERCHANT",
        merchantId: "00000000-0000-4000-8000-000000000100",
        merchantSlug: "cuanki-batagor-serayu-keliling",
        merchantName: "Cuanki & Batagor Serayu Keliling",
      };
    }

    redirect("/merchant/login");
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Pengalihan cerdas jika role tidak memiliki izin
    if (user.role === "MERCHANT") {
      redirect("/merchant/dashboard");
    } else if (user.role === "ADMIN") {
      redirect("/admin/dashboard");
    } else {
      redirect("/");
    }
  }

  return user;
}

/**
 * Guard khusus area Pedagang (MERCHANT atau ADMIN).
 */
export async function requireMerchant(): Promise<AuthUser> {
  return await requireUser(["MERCHANT", "ADMIN"]);
}

/**
 * Guard khusus area Administrator (ADMIN saja).
 */
export async function requireAdmin(): Promise<AuthUser> {
  return await requireUser(["ADMIN"]);
}