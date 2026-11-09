import { NextResponse, connection } from "next/server";
import { getCurrentUser } from "@/server/auth";

export async function GET() {
  await connection();
  try {
    const user = await getCurrentUser();
    return NextResponse.json(
      { ok: true, user },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, user: null, error: err instanceof Error ? err.message : "Internal error" },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  }
}
