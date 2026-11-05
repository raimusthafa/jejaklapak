import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerMerchantSchema = z.object({
  name: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(10, "Nomor WhatsApp minimal 10 digit"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  merchantName: z.string().min(3, "Nama usaha / gerobak minimal 3 karakter"),
  category: z.string().min(2, "Kategori kuliner wajib dipilih"),
  district: z.string().min(2, "Wilayah kecamatan wajib dipilih"),
  address: z.string().min(5, "Alamat pangkalan wajib diisi"),
  operatingArea: z.string().min(3, "Area rute keliling wajib diisi"),
});

export type RegisterMerchantInput = z.infer<typeof registerMerchantSchema>;

