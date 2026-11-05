"use server";

import { loginSchema, registerMerchantSchema } from "@/schemas/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionState = {
  ok: boolean;
  message?: string;
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
      message: "Periksa kembali input Anda.",
    };
  }

  const { email, password } = parsed.data;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // In demo/placeholder mode, allow demo login to pass through
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      if (supabaseUrl.includes("placeholder")) {
        return {
          ok: true,
          message: "Login demo berhasil! Mengarahkan ke dashboard...",
        };
      }

      return {
        ok: false,
        message: error.message || "Email atau kata sandi tidak sesuai.",
      };
    }

    revalidatePath("/merchant/dashboard");
    return {
      ok: true,
      message: "Login berhasil!",
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
      message: "Data pendaftaran belum lengkap atau tidak valid.",
    };
  }

  const data = parsed.data;

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
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
          message: "Pendaftaran demo berhasil! Mengarahkan ke halaman login...",
        };
      }
      return {
        ok: false,
        message: error.message || "Pendaftaran gagal.",
      };
    }

    return {
      ok: true,
      message: "Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi atau lanjutkan ke login.",
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Terjadi kesalahan internal.",
    };
  }
}

export async function logoutAction(): Promise<ActionState> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: true };
  }
}

