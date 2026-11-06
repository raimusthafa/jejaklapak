"use server";

import { loginSchema, registerMerchantSchema } from "@/schemas/auth";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type ActionState = {
  ok: boolean;
  message?: string;
  redirectTo?: string;
  errors?: Record<string, string[]>;
};

export async function loginAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = loginSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Periksa kembali format email dan kata sandi Anda.",
    };
  }

  const { email, password } = parsed.data;

  try {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // In demo/placeholder mode, allow demo login to pass through
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      if (supabaseUrl.includes("placeholder")) {
        const isAdmin = email.toLowerCase().includes("admin");
        return {
          ok: true,
          redirectTo: isAdmin ? "/admin/dashboard" : "/merchant/dashboard",
          message: "Login demo berhasil! Mengarahkan...",
        };
      }

      return {
        ok: false,
        message: error.message || "Email atau kata sandi tidak sesuai.",
      };
    }

    // Tentukan tujuan redirect berdasarkan role user
    let redirectTo = "/merchant/dashboard";
    const user = authData.user;

    try {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });

        if (dbUser?.role === "ADMIN") {
          redirectTo = "/admin/dashboard";
        } else if (dbUser?.role === "CUSTOMER") {
          redirectTo = "/";
        } else {
          redirectTo = "/merchant/dashboard";
        }
      }
    } catch {
      // Fallback ke metadata Supabase jika query DB gagal
      const metaRole =
        (user?.app_metadata?.role as string) ||
        (user?.user_metadata?.role as string) ||
        (email.toLowerCase().includes("admin") ? "ADMIN" : "MERCHANT");

      if (metaRole === "ADMIN") {
        redirectTo = "/admin/dashboard";
      }
    }

    revalidatePath("/", "layout");
    revalidatePath("/merchant/dashboard");
    revalidatePath("/admin/dashboard");

    return {
      ok: true,
      redirectTo,
      message: "Login berhasil! Mengarahkan ke dashboard...",
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Terjadi kesalahan pada server.",
    };
  }
}

export async function registerMerchantAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = registerMerchantSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Data pendaftaran pedagang belum lengkap atau tidak valid.",
    };
  }

  const data = parsed.data;

  try {
    const supabase = await createClient();
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone,
          merchant_name: data.merchantName,
          category: data.category,
          district: data.district,
          address: data.address,
          operating_area: data.operatingArea,
          role: "MERCHANT",
        },
      },
    });

    if (error) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      if (supabaseUrl.includes("placeholder")) {
        return {
          ok: true,
          redirectTo: "/merchant/login",
          message: "Pendaftaran demo berhasil! Silakan login dengan akun Anda.",
        };
      }
      return {
        ok: false,
        message: error.message || "Pendaftaran pedagang gagal.",
      };
    }

    // Sinkronkan ke tabel database Prisma (User & Merchant)
    if (authData.user) {
      try {
        const userId = authData.user.id;

        // 1. Upsert data User
        await prisma.user.upsert({
          where: { id: userId },
          update: {
            name: data.name,
            phone: data.phone,
            role: "MERCHANT",
          },
          create: {
            id: userId,
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: "MERCHANT",
          },
        });

        // 2. Buat entri Merchant baru jika belum ada
        const existingMerchant = await prisma.merchant.findFirst({
          where: { ownerId: userId },
        });

        if (!existingMerchant) {
          const cleanSlugBase = data.merchantName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
          const randomSuffix = Math.random().toString(36).substring(2, 6);
          const slug = `${cleanSlugBase}-${randomSuffix}`;

          await prisma.merchant.create({
            data: {
              ownerId: userId,
              name: data.merchantName,
              slug,
              category: data.category,
              phone: data.phone,
              address: data.address,
              district: data.district,
              city: "Bandung",
              operatingArea: data.operatingArea,
              verificationStatus: "PENDING",
              schedules: {
                create: [
                  { dayOfWeek: 1, isOpen: true, startTime: "09:00", endTime: "17:00" },
                  { dayOfWeek: 2, isOpen: true, startTime: "09:00", endTime: "17:00" },
                  { dayOfWeek: 3, isOpen: true, startTime: "09:00", endTime: "17:00" },
                  { dayOfWeek: 4, isOpen: true, startTime: "09:00", endTime: "17:00" },
                  { dayOfWeek: 5, isOpen: true, startTime: "09:00", endTime: "17:00" },
                  { dayOfWeek: 6, isOpen: true, startTime: "08:00", endTime: "18:00" },
                  { dayOfWeek: 0, isOpen: true, startTime: "08:00", endTime: "18:00" },
                ],
              },
            },
          });
        }
      } catch (dbErr) {
        console.warn("Sinkronisasi database saat register:", dbErr);
      }
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/explore");

    return {
      ok: true,
      redirectTo: "/merchant/login",
      message:
        "Pendaftaran lapak berhasil! Akun Anda telah terdaftar. Silakan login untuk mengelola lapak.",
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Terjadi kesalahan internal saat mendaftar.",
    };
  }
}

export async function logoutAction(): Promise<ActionState> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    return { ok: true, redirectTo: "/merchant/login" };
  } catch {
    return { ok: true, redirectTo: "/merchant/login" };
  }
}
