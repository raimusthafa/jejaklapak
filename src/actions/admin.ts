"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/server/auth";
import {
  getAdminMerchants,
  adminUpdateMerchantVerification,
  adminUpdateMerchantSession,
} from "@/server/merchants";
import {
  adminVerifyMerchantSchema,
  adminToggleSessionSchema,
} from "@/schemas/admin";
import type {
  AdminMerchantRecord,
  SellingStatus,
  VerificationStatus,
} from "@/types/merchant";

export type AdminActionResult<T = unknown> = {
  ok: boolean;
  message?: string;
  data?: T;
};

async function verifyAdminAccess(): Promise<
  | { ok: true; adminId: string }
  | { ok: false; message: string }
> {
  const user = await getCurrentUser();
  if (!user) {
    return {
      ok: false,
      message: "Sesi Anda telah berakhir. Silakan login kembali sebagai Admin.",
    };
  }
  if (user.role !== "ADMIN") {
    return {
      ok: false,
      message: "Akses ditolak: aksi ini hanya diperbolehkan untuk Administrator.",
    };
  }
  return { ok: true, adminId: user.id };
}

/**
 * Server Action: Muat ulang seluruh daftar merchant langsung dari PostgreSQL.
 */
export async function refreshAdminMerchantsAction(): Promise<
  AdminActionResult<AdminMerchantRecord[]>
> {
  const auth = await verifyAdminAccess();
  if (!auth.ok) {
    return { ok: false, message: auth.message };
  }

  try {
    const merchants = await getAdminMerchants();
    return {
      ok: true,
      message: `Memuat ${merchants.length} pedagang terbaru dari database.`,
      data: merchants,
    };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error
          ? `Gagal mengambil data dari database: ${err.message}`
          : "Gagal terhubung ke database PostgreSQL.",
    };
  }
}

/**
 * Server Action: Ubah status verifikasi merchant (VERIFIED / PENDING / REJECTED) di Postgres.
 */
export async function verifyMerchantAction(
  merchantId: string,
  verificationStatus: VerificationStatus
): Promise<AdminActionResult<AdminMerchantRecord>> {
  const auth = await verifyAdminAccess();
  if (!auth.ok) {
    return { ok: false, message: auth.message };
  }

  const parsed = adminVerifyMerchantSchema.safeParse({
    merchantId,
    verificationStatus,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ||
        "Parameter verifikasi merchant tidak valid.",
    };
  }

  try {
    const updated = await adminUpdateMerchantVerification(
      parsed.data.merchantId,
      parsed.data.verificationStatus
    );

    if (!updated) {
      return {
        ok: false,
        message: "Data pedagang tidak ditemukan di database.",
      };
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/explore");
    revalidatePath("/merchant/dashboard");
    revalidatePath(`/merchant/${updated.slug}`);

    const statusLabels: Record<VerificationStatus, string> = {
      VERIFIED: `Merchant "${updated.name}" berhasil diverifikasi dan tampil di peta publik.`,
      REJECTED: `Merchant "${updated.name}" ditolak dan sesi aktifnya dihentikan.`,
      PENDING: `Status verifikasi "${updated.name}" dikembalikan ke Menunggu Verifikasi.`,
    };

    return {
      ok: true,
      message: statusLabels[parsed.data.verificationStatus],
      data: updated,
    };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error
          ? `Gagal memperbarui status verifikasi: ${err.message}`
          : "Terjadi kesalahan saat menyimpan status verifikasi.",
    };
  }
}

/**
 * Server Action: Ubah status sesi berjualan merchant (ACTIVE / PAUSED / ENDED) di Postgres.
 */
export async function toggleMerchantSessionAction(
  merchantId: string,
  targetStatus: SellingStatus
): Promise<AdminActionResult<AdminMerchantRecord>> {
  const auth = await verifyAdminAccess();
  if (!auth.ok) {
    return { ok: false, message: auth.message };
  }

  const parsed = adminToggleSessionSchema.safeParse({
    merchantId,
    targetStatus,
  });
  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ||
        "Parameter status sesi tidak valid.",
    };
  }

  try {
    const result = await adminUpdateMerchantSession(
      parsed.data.merchantId,
      parsed.data.targetStatus
    );

    if (!result.ok) {
      return { ok: false, message: result.message };
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/explore");
    revalidatePath("/merchant/dashboard");
    revalidatePath(`/merchant/${result.merchant.slug}`);

    const actionLabels: Record<SellingStatus, string> = {
      ACTIVE: `Sesi berjualan "${result.merchant.name}" diaktifkan.`,
      PAUSED: `Sesi berjualan "${result.merchant.name}" dijeda (Istirahat).`,
      ENDED: `Sesi berjualan "${result.merchant.name}" dinonaktifkan.`,
    };

    return {
      ok: true,
      message: actionLabels[parsed.data.targetStatus],
      data: result.merchant,
    };
  } catch (err) {
    return {
      ok: false,
      message:
        err instanceof Error
          ? `Gagal mengubah status sesi: ${err.message}`
          : "Terjadi kesalahan saat memperbarui sesi pedagang.",
    };
  }
}

