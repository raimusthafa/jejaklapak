import { Suspense } from "react";
import { requireMerchant } from "@/server/auth";
import MerchantProfileClient from "./MerchantProfileClient";

export const instant = false;

async function MerchantProfileLoader() {
  const merchantUser = await requireMerchant();
  return <MerchantProfileClient user={merchantUser} />;
}

export default function MerchantProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">
          Memuat profil pedagang...
        </div>
      }
    >
      <MerchantProfileLoader />
    </Suspense>
  );
}
