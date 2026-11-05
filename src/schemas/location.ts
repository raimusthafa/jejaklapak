import { z } from "zod";

export const reportLocationSchema = z.object({
  merchantId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().nonnegative().optional(),
});

export type ReportLocationInput = z.infer<typeof reportLocationSchema>;

