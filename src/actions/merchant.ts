"use server";

import { requireUser, requireMerchant } from "@/server/auth";
import {
  merchantProfileSchema,
  updateScheduleSchema,
  sellingSessionActionSchema,
  menuItemSchema,
} from "@/schemas/merchant";
import {
  updateMerchantProfile,
  updateMerchantSchedules,
  updateSellingSession,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
} from "@/server/merchants";
import { revalidatePath } from "next/cache";

export type MerchantActionResult<T = unknown> = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  data?: T;
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
    const updated = await updateMerchantProfile(merchantId, parsed.data);
    revalidatePath("/merchant/profile");
    revalidatePath("/merchant/dashboard");
    revalidatePath(`/merchant/${merchantId}`);
    revalidatePath("/explore");

    return {
      ok: true,
      message: "Profil pedagang berhasil diperbarui!",
      data: updated,
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

/**
 * Server Action: Tambah Menu Baru
 */
export async function createMenuItemAction(
  merchantId: string,
  formData: FormData
): Promise<MerchantActionResult> {
  const user = await requireMerchant();
  if (user.role !== "ADMIN" && user.merchantId && user.merchantId !== merchantId) {
    return { ok: false, message: "Akses ditolak: Anda bukan pemilik lapak ini." };
  }

  const rawData = Object.fromEntries(formData.entries());
  const parsed = menuItemSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Data menu tidak lengkap atau tidak valid.",
    };
  }

  try {
    const newItem = await createMenuItem(merchantId, parsed.data);
    revalidatePath("/merchant/menu");
    revalidatePath("/merchant/dashboard");
    revalidatePath("/explore");
    return {
      ok: true,
      message: `Menu "${parsed.data.name}" berhasil ditambahkan!`,
      data: newItem,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal menambahkan menu.",
    };
  }
}

/**
 * Server Action: Update Menu yang Ada
 */
export async function updateMenuItemAction(
  merchantId: string,
  menuItemId: string,
  formData: FormData
): Promise<MerchantActionResult> {
  const user = await requireMerchant();
  if (user.role !== "ADMIN" && user.merchantId && user.merchantId !== merchantId) {
    return { ok: false, message: "Akses ditolak: Anda bukan pemilik lapak ini." };
  }

  const rawData = Object.fromEntries(formData.entries());
  const parsed = menuItemSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
      message: "Periksa kembali input menu Anda.",
    };
  }

  try {
    const updated = await updateMenuItem(menuItemId, parsed.data);
    revalidatePath("/merchant/menu");
    revalidatePath("/merchant/dashboard");
    revalidatePath("/explore");
    return {
      ok: true,
      message: "Menu berhasil diperbarui!",
      data: updated,
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal memperbarui menu.",
    };
  }
}

/**
 * Server Action: Hapus Menu
 */
export async function deleteMenuItemAction(
  merchantId: string,
  menuItemId: string
): Promise<MerchantActionResult> {
  const user = await requireMerchant();
  if (user.role !== "ADMIN" && user.merchantId && user.merchantId !== merchantId) {
    return { ok: false, message: "Akses ditolak: Anda bukan pemilik lapak ini." };
  }

  try {
    await deleteMenuItem(menuItemId);
    revalidatePath("/merchant/menu");
    revalidatePath("/merchant/dashboard");
    revalidatePath("/explore");
    return {
      ok: true,
      message: "Menu berhasil dihapus dari lapak.",
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal menghapus menu.",
    };
  }
}

/**
 * Server Action: Toggle Ketersediaan Menu (Tersedia / Habis)
 */
export async function toggleMenuItemAvailabilityAction(
  merchantId: string,
  menuItemId: string,
  isAvailable: boolean
): Promise<MerchantActionResult> {
  const user = await requireMerchant();
  if (user.role !== "ADMIN" && user.merchantId && user.merchantId !== merchantId) {
    return { ok: false, message: "Akses ditolak." };
  }

  try {
    await toggleMenuItemAvailability(menuItemId, isAvailable);
    revalidatePath("/merchant/menu");
    revalidatePath("/merchant/dashboard");
    revalidatePath("/explore");
    return {
      ok: true,
      message: isAvailable ? "Menu ditandai Tersedia." : "Menu ditandai Habis.",
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal mengubah status menu.",
    };
  }
}

