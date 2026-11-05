import { NextResponse } from "next/server";
import { getPublicMerchants } from "@/server/merchants";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const district = searchParams.get("district");
    const status = searchParams.get("status");

    let merchants = await getPublicMerchants();

    if (category && category !== "Semua Kategori") {
      merchants = merchants.filter((m) => m.category === category);
    }
    if (district && district !== "Semua Wilayah") {
      merchants = merchants.filter((m) => m.district.includes(district));
    }
    if (status && status !== "SEMUA") {
      merchants = merchants.filter((m) => m.sellingStatus === status);
    }

    return NextResponse.json({
      ok: true,
      data: merchants,
      total: merchants.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Gagal mengambil data pedagang",
      },
      { status: 500 }
    );
  }
}

