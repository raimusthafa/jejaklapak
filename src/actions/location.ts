"use server";

import { requireUser } from "@/server/auth";
import { reportLocationSchema } from "@/schemas/location";
import { recordMerchantGpsLocation } from "@/server/merchants";
import { revalidatePath } from "next/cache";

export async function reportMerchantLocationAction(
  merchantId: string,
  latitude: number,
  longitude: number,
  accuracy = 10
) {
  const user = await requireUser();
  if (!user) {
    return { ok: false, message: "Akses ditolak." };
  }
  if (user.role !== "ADMIN" && user.merchantId && user.merchantId !== merchantId) {
    return { ok: false, message: "Akses ditolak: Anda bukan pemilik lapak ini." };
  }

  const parsed = reportLocationSchema.safeParse({
    merchantId,
    latitude,
    longitude,
    accuracy,
  });

  if (!parsed.success) {
    return { ok: false, message: "Koordinat lokasi tidak valid." };
  }

  try {
    await recordMerchantGpsLocation(merchantId, latitude, longitude, accuracy);
    revalidatePath("/explore");
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Gagal menyimpan koordinat lokasi.",
    };
  }
}

