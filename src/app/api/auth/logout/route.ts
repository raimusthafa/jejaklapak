import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const cookieStore = await cookies();
  const authCookieNames = cookieStore
    .getAll()
    .filter((c) => c.name.startsWith("sb-") && c.name.includes("-auth-token"))
    .map((c) => c.name);

  try {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Tetap lanjut bersihkan cookie lokal meskipun signOut remote gagal
  }

  for (const name of authCookieNames) {
    try {
      cookieStore.delete(name);
    } catch {
      // Abaikan jika gagal menghapus cookie dari store
    }
  }

  try {
    revalidatePath("/", "layout");
  } catch {
    // Abaikan jika gagal revalidasi path
  }

  return NextResponse.json(
    { ok: true, redirectTo: "/merchant/login" },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    }
  );
}

