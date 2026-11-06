import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, user: null },
        { status: 401 }
      );
    }
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

