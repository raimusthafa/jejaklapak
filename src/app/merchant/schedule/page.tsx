import { Suspense } from "react";
import { connection } from "next/server";
import { requireMerchant } from "@/server/auth";
import { getMerchantSchedules } from "@/server/merchants";
import MerchantScheduleClient from "./MerchantScheduleClient";

export const instant = false;

async function MerchantScheduleLoader() {
  await connection();
  const merchantUser = await requireMerchant();
  const schedules = await getMerchantSchedules(
    merchantUser.merchantId || "00000000-0000-4000-8000-000000000100"
  );
  return <MerchantScheduleClient user={merchantUser} initialSchedules={schedules} />;
}

export default function MerchantSchedulePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">
          Memuat jadwal operasional...
        </div>
      }
    >
      <MerchantScheduleLoader />
    </Suspense>
  );
}
