import { Suspense } from "react";
import { connection } from "next/server";
import { requireMerchant } from "@/server/auth";
import { getMerchantForUser } from "@/server/merchants";
import MerchantProfileClient from "./MerchantProfileClient";

export const instant = false;

async function MerchantProfileLoader() {
  await connection();
  const merchantUser = await requireMerchant();
  const initialMerchant = await getMerchantForUser(merchantUser);
  return <MerchantProfileClient user={merchantUser} initialMerchant={initialMerchant} />;
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
