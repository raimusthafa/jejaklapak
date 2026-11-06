import { z } from "zod";

export const merchantProfileSchema = z.object({
  name: z.string().min(2, "Nama usaha minimal 2 karakter"),
  description: z.string().optional(),
  category: z.string().min(1, "Kategori kuliner wajib dipilih"),
  phone: z.string().min(8, "Nomor WhatsApp minimal 8 digit"),
  address: z.string().min(3, "Alamat pangkalan standby minimal 3 karakter (contoh: Depan ITB / Jl. Dago)"),
  district: z.string().min(1, "Kecamatan basis wajib dipilih"),
  operatingArea: z.string().min(2, "Area rute keliling minimal 2 karakter (contoh: Dago, Dipati Ukur)"),
});

export type MerchantProfileInput = z.infer<typeof merchantProfileSchema>;

export const scheduleDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isOpen: z.boolean(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam harus HH:MM"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam harus HH:MM"),
});

export const updateScheduleSchema = z.object({
  merchantId: z.string().optional(),
  schedules: z.array(scheduleDaySchema),
});

export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;

export const sellingSessionActionSchema = z.object({
  merchantId: z.string().optional(),
  action: z.enum(["START", "PAUSE", "RESUME", "END"]),
});

export type SellingSessionActionInput = z.infer<typeof sellingSessionActionSchema>;

export const menuItemSchema = z.object({
  name: z.string().min(2, "Nama menu minimal 2 karakter"),
  description: z.string().optional().default(""),
  price: z.coerce.number().min(500, "Harga minimal Rp 500"),
  image: z.string().optional(),
  isAvailable: z
    .preprocess(
      (val) => val === true || val === "true" || val === "on" || val === 1 || val === "1",
      z.boolean()
    )
    .default(true),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;
