"use server";

import { requireUser } from "@/server/auth";
import {
  merchantProfileSchema,
  updateScheduleSchema,
  sellingSessionActionSchema,
} from "@/schemas/merchant";
import {
  updateMerchantProfile,
  updateMerchantSchedules,
  updateSellingSession,
} from "@/server/merchants";
import { revalidatePath } from "next/cache";

export type MerchantActionResult = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

/**
 * Server Action: Update Profil Merchant
 */
export async function updateMerchantProfileAction(
  merchantId: string,
  formData: FormData
): Promise<MerchantActionResult> {
  const user = await requireUser();
  if (!user) {
    return { ok: false, message: "Akses ditolak: silakan login terlebih dahulu." };
  }

  const rawData = Object.fromEntries(formData.entries());
  const parsed = merchantProfileSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Data profil tidak valid.",
    };
  }

  try {
    await updateMerchantProfile(merchantId, parsed.data);
    revalidatePath("/merchant/profile");
    revalidatePath(`/merchant/${merchantId}`);
    revalidatePath("/explore");

    return {
      ok: true,
      message: "Profil pedagang berhasil diperbarui!",
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal memperbarui profil.",
    };
  }
}

/**
 * Server Action: Update Jadwal Mingguan
 */
export async function updateMerchantSchedulesAction(
  merchantId: string,
  schedules: Array<{
    dayOfWeek: number;
    isOpen: boolean;
    startTime: string;
    endTime: string;
  }>
): Promise<MerchantActionResult> {
  const user = await requireUser();
  if (!user) {
    return { ok: false, message: "Akses ditolak." };
  }

  const parsed = updateScheduleSchema.safeParse({ merchantId, schedules });
  if (!parsed.success) {
    return {
      ok: false,
      message: "Format jadwal tidak valid.",
    };
  }

  try {
    await updateMerchantSchedules(merchantId, parsed.data);
    revalidatePath("/merchant/schedule");
    revalidatePath(`/merchant/${merchantId}`);

    return {
      ok: true,
      message: "Jadwal mingguan berhasil disimpan!",
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal menyimpan jadwal.",
    };
  }
}

/**
 * Server Action: Toggle Status Sesi Berjualan (Start, Pause, Resume, End)
 */
export async function toggleSellingSessionAction(
  merchantId: string,
  action: "START" | "PAUSE" | "RESUME" | "END"
): Promise<MerchantActionResult> {
  const user = await requireUser();
  if (!user) {
    return { ok: false, message: "Akses ditolak." };
  }

  const parsed = sellingSessionActionSchema.safeParse({ merchantId, action });
  if (!parsed.success) {
    return { ok: false, message: "Aksi sesi tidak valid." };
  }

  try {
    await updateSellingSession(merchantId, action);
    revalidatePath("/merchant/dashboard");
    revalidatePath("/explore");

    return {
      ok: true,
      message: `Status sesi berhasil diubah ke ${action}!`,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal mengubah status sesi.",
    };
  }
}

