import { NextResponse } from "next/server";
import { getMerchantBySlug } from "@/server/merchants";

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const merchant = await getMerchantBySlug(id);

    if (!merchant) {
      return NextResponse.json(
        { ok: false, error: "Pedagang tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: merchant,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 }
    );
  }
}

