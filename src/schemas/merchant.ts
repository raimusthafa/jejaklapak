import { z } from "zod";

export const merchantProfileSchema = z.object({
  name: z.string().min(3, "Nama usaha minimal 3 karakter"),
  description: z.string().optional(),
  category: z.string().min(2, "Kategori wajib dipilih"),
  phone: z.string().min(10, "Nomor WhatsApp minimal 10 digit"),
  address: z.string().min(5, "Alamat pangkalan wajib diisi"),
  district: z.string().min(2, "Kecamatan wajib dipilih"),
  operatingArea: z.string().min(3, "Area rute keliling wajib diisi"),
});

export type MerchantProfileInput = z.infer<typeof merchantProfileSchema>;

export const scheduleDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isOpen: z.boolean(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam harus HH:MM"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam harus HH:MM"),
});

export const updateScheduleSchema = z.object({
  merchantId: z.string().uuid().optional(),
  schedules: z.array(scheduleDaySchema),
});

export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;

export const sellingSessionActionSchema = z.object({
  merchantId: z.string().uuid().optional(),
  action: z.enum(["START", "PAUSE", "RESUME", "END"]),
});

export type SellingSessionActionInput = z.infer<typeof sellingSessionActionSchema>;

export const menuItemSchema = z.object({
  name: z.string().min(2, "Nama menu minimal 2 karakter"),
  description: z.string().optional().default(""),
  price: z.coerce.number().min(500, "Harga minimal Rp 500"),
  image: z.string().optional(),
  isAvailable: z.coerce.boolean().default(true),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;
