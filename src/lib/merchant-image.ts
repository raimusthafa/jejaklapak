/**
 * Helper foto lapak pedagang. Aman dipakai di server maupun client.
 */

/** Logo JejakLapak: penanda di peta dan placeholder jika pedagang belum punya foto. */
export const LOGO_ICON_SRC = "/logo-icon.png";

/** Nama bucket Supabase Storage untuk foto gerobak. */
export const MERCHANT_PHOTO_BUCKET = "merchant-photos";

export const MERCHANT_PHOTO_MAX_BYTES = 900_000;
export const MERCHANT_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Mengembalikan URL foto jika pedagang memang sudah punya foto,
 * atau null jika kosong / masih placeholder bawaan lama.
 */
export function resolveMerchantPhoto(image?: string | null): string | null {
  if (!image) return null;
  const trimmed = image.trim();
  if (!trimmed || trimmed.includes("/images/merchants/default")) return null;
  return trimmed;
}

/**
 * Mengambil path objek di bucket dari URL publik Supabase Storage.
 * Mengembalikan null jika URL bukan milik bucket foto lapak.
 */
export function extractPhotoStoragePath(url?: string | null): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${MERCHANT_PHOTO_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const path = url.slice(idx + marker.length).split("?")[0];
  return path ? decodeURIComponent(path) : null;
}