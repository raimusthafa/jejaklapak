import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    return NextResponse.json(
      { ok: false, user: null, error: err instanceof Error ? err.message : "Internal error" },
      { status: 200 }
    );
  }
}

