import { Suspense } from "react";
import { connection } from "next/server";
import { requireMerchant } from "@/server/auth";
import { getMerchantForUser, getMerchantMenuItems } from "@/server/merchants";
import MerchantMenuClient from "./MerchantMenuClient";

export const instant = false;

async function MerchantMenuLoader() {
  await connection();
  const user = await requireMerchant();
  const initialMerchant = await getMerchantForUser(user);
  const resolvedMerchantId = initialMerchant?.id || user.merchantId;
  const initialItems = resolvedMerchantId
    ? await getMerchantMenuItems(resolvedMerchantId)
    : [];
  return (
    <MerchantMenuClient
      user={user}
      initialMerchant={initialMerchant}
      initialItems={initialItems}
    />
  );
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

