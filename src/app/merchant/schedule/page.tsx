import { Suspense } from "react";
import { requireMerchant } from "@/server/auth";
import MerchantScheduleClient from "./MerchantScheduleClient";

export const instant = false;

async function MerchantScheduleLoader() {
  const merchantUser = await requireMerchant();
  return <MerchantScheduleClient user={merchantUser} />;
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
