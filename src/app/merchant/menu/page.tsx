import { Suspense } from "react";
import { requireMerchant } from "@/server/auth";
import { getMerchantMenuItems } from "@/server/merchants";
import MerchantMenuClient from "./MerchantMenuClient";

export const instant = false;

async function MerchantMenuLoader() {
  const user = await requireMerchant();
  const initialItems = await getMerchantMenuItems(
    user.merchantId || "00000000-0000-4000-8000-000000000100"
  );
  return <MerchantMenuClient user={user} initialItems={initialItems} />;
}

export default function MerchantMenuPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">
          Memuat daftar menu lapak...
        </div>
      }
    >
      <MerchantMenuLoader />
    </Suspense>
  );
}

