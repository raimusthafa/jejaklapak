import { Suspense } from "react";
import { connection } from "next/server";
import { requireMerchant } from "@/server/auth";
import { getMerchantForUser, getMerchantSchedules } from "@/server/merchants";
import MerchantScheduleClient from "./MerchantScheduleClient";

export const instant = false;

async function MerchantScheduleLoader() {
  await connection();
  const merchantUser = await requireMerchant();
  const initialMerchant = await getMerchantForUser(merchantUser);
  const resolvedMerchantId = initialMerchant?.id || merchantUser.merchantId;
  const schedules = resolvedMerchantId
    ? await getMerchantSchedules(resolvedMerchantId)
    : [];
  return (
    <MerchantScheduleClient
      user={merchantUser}
      initialMerchant={initialMerchant}
      initialSchedules={schedules}
    />
  );
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
