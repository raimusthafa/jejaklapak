import { z } from "zod";

export const adminVerifyMerchantSchema = z.object({
  merchantId: z.string().uuid("ID merchant tidak valid"),
  verificationStatus: z.enum(["VERIFIED", "PENDING", "REJECTED"]),
});

export type AdminVerifyMerchantInput = z.infer<typeof adminVerifyMerchantSchema>;

export const adminToggleSessionSchema = z.object({
  merchantId: z.string().uuid("ID merchant tidak valid"),
  targetStatus: z.enum(["ACTIVE", "PAUSED", "ENDED"]),
});

export type AdminToggleSessionInput = z.infer<typeof adminToggleSessionSchema>;

