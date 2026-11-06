import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid (contoh: pedagang@gmail.com)"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerMerchantSchema = z.object({
  name: z.string().min(2, "Nama lengkap pemilik minimal 2 karakter"),
  email: z.string().email("Format email tidak valid (contoh: pedagang@gmail.com)"),
  phone: z.string().min(8, "Nomor WhatsApp minimal 8 digit"),
  password: z.string().min(6, "Kata sandi minimal 6 karakter (bebas kombinasi)"),
  merchantName: z.string().min(2, "Nama usaha / gerobak minimal 2 karakter"),
  category: z.string().min(1, "Kategori kuliner wajib dipilih"),
  district: z.string().min(1, "Wilayah kecamatan basis wajib dipilih"),
  address: z.string().min(3, "Alamat pangkalan standby minimal 3 karakter (contoh: Depan ITB / Jl. Dago No. 12)"),
  operatingArea: z.string().min(2, "Area rute keliling minimal 2 karakter (contoh: Dago, Dipati Ukur)"),
});

export type RegisterMerchantInput = z.infer<typeof registerMerchantSchema>;

