import { Suspense } from "react";
import { requireMerchant } from "@/server/auth";
import { getMerchantForUser } from "@/server/merchants";
import MerchantDashboardClient from "./MerchantDashboardClient";

export const instant = false;

async function MerchantDashboardLoader() {
  const merchantUser = await requireMerchant();
  const initialMerchant = await getMerchantForUser(merchantUser);
  return <MerchantDashboardClient user={merchantUser} initialMerchant={initialMerchant} />;
}

export default function MerchantDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">
          Memverifikasi hak akses pedagang...
        </div>
      }
    >
      <MerchantDashboardLoader />
    </Suspense>
  );
}
