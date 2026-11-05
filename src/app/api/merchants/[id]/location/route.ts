import { NextResponse } from "next/server";
import { reportLocationSchema } from "@/schemas/location";
import { recordMerchantGpsLocation } from "@/server/merchants";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id: merchantId } = await props.params;
    const body = await request.json();

    const parsed = reportLocationSchema.safeParse({
      ...body,
      merchantId,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { latitude, longitude, accuracy } = parsed.data;
    await recordMerchantGpsLocation(merchantId, latitude, longitude, accuracy);

    return NextResponse.json({
      ok: true,
      message: "Koordinat lokasi berhasil dicatat",
      data: { latitude, longitude, capturedAt: new Date().toISOString() },
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

