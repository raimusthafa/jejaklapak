import { MERCHANT_PHOTO_MAX_BYTES } from "@/lib/merchant-image";

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

/**
 * Memperkecil foto dari kamera HP di browser sebelum diunggah,
 * supaya ukurannya aman untuk batas body Server Action (1 MB).
 */
export async function compressPhoto(
  file: File,
  maxSide = 1024,
  maxBytes = MERCHANT_PHOTO_MAX_BYTES
): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Browser tidak mendukung pemrosesan foto.");
  }

  // Latar putih supaya PNG transparan tidak berubah jadi hitam saat jadi JPEG.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  for (const quality of [0.85, 0.72, 0.58, 0.45]) {
    const blob = await canvasToBlob(canvas, quality);
    if (blob && blob.size <= maxBytes) return blob;
  }
  throw new Error("Foto masih terlalu besar. Coba foto lain yang lebih kecil.");
}