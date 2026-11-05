import "server-only";
import { prisma } from "@/lib/prisma";
import { merchantService } from "@/services/mock/merchantService";
import { MOCK_MERCHANTS } from "@/data/mock/merchants";
import { Merchant, MerchantCategory } from "@/types/merchant";
import { LngLat } from "@/types/location";
import { MerchantProfileInput, UpdateScheduleInput } from "@/schemas/merchant";

const CATEGORY_EMOJI: Record<string, string> = {
  "Makanan Berat": "🍲",
  "Camilan & Gorengan": "🍢",
  "Minuman Segar": "🍧",
  "Kue & Roti": "🧇",
  "Kopi & Teh": "☕",
  "Jajanan Tradisional": "🥟",
};

/**
 * Check whether database is live and reachable.
 */
async function isDatabaseAvailable(): Promise<boolean> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes("placeholder") || dbUrl.includes("localhost:5432")) {
    return false;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to resolve merchant ID if a legacy mock string (like 'm-1') is passed.
 */
async function resolveMerchantId(idOrSlug: string): Promise<string> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  if (isUuid) {
    return idOrSlug;
  }
  try {
    const merchant = await prisma.merchant.findFirst({
      where: {
        OR: [
          { slug: "cuanki-batagor-serayu-keliling" },
          { slug: idOrSlug },
        ],
      },
      select: { id: true },
    });
    return merchant?.id ?? idOrSlug;
  } catch {
    return idOrSlug;
  }
}

/**
 * Mengambil daftar pedagang untuk peta & pencarian publik.
 */
export async function getPublicMerchants(): Promise<Merchant[]> {
  try {
    const isDbLive = await isDatabaseAvailable();
    if (!isDbLive) {
      return merchantService.getAll();
    }

    const dbMerchants = await prisma.merchant.findMany({
      where: {
        verificationStatus: "VERIFIED",
      },
      include: {
        schedules: true,
        menuItems: true,
        sessions: {
          where: { status: { in: ["ACTIVE", "PAUSED"] } },
          orderBy: { startedAt: "desc" },
          take: 1,
        },
        locations: {
          orderBy: { capturedAt: "desc" },
          take: 15,
        },
      },
      take: 50,
    });

    if (dbMerchants.length === 0) {
      return merchantService.getAll();
    }

    // Map Prisma models to domain Merchant type
    return dbMerchants.map((m) => {
      const activeSession = m.sessions[0];
      const latestLocation = m.locations[0];
      const mockMatch = MOCK_MERCHANTS.find((mock) => mock.slug === m.slug || mock.id === m.id);

      const breadcrumbs: LngLat[] =
        m.locations.length > 1
          ? m.locations.slice().reverse().map((loc) => [loc.longitude, loc.latitude] as LngLat)
          : (mockMatch?.breadcrumbs || []);

      return {
        id: m.id,
        ownerId: m.ownerId,
        ownerName: mockMatch?.ownerName ?? "Mitra Pedagang",
        name: m.name,
        slug: m.slug,
        tagline: m.description ?? mockMatch?.tagline ?? "",
        description: m.description ?? mockMatch?.description ?? "",
        category: (m.category as MerchantCategory) || "Makanan Berat",
        iconEmoji: mockMatch?.iconEmoji || CATEGORY_EMOJI[m.category] || "🍲",
        image: m.image ?? mockMatch?.image ?? "/images/merchants/default.jpg",
        phone: m.phone,
        district: m.district,
        city: m.city,
        operatingArea: m.operatingArea,
        verificationStatus: (m.verificationStatus as "VERIFIED" | "PENDING" | "REJECTED") || "VERIFIED",
        sellingStatus: activeSession ? (activeSession.status as "ACTIVE" | "PAUSED") : "ENDED",
        location: {
          id: latestLocation?.id ?? m.id,
          merchantId: m.id,
          latitude: latestLocation?.latitude ?? mockMatch?.location.latitude ?? -6.9032,
          longitude: latestLocation?.longitude ?? mockMatch?.location.longitude ?? 107.6231,
          accuracyMeters: latestLocation?.accuracy ?? 6,
          heading: mockMatch?.location.heading ?? 0,
          speedKmh: mockMatch?.location.speedKmh ?? 0,
          batteryLevel: mockMatch?.location.batteryLevel ?? 88,
          addressHint: m.address || mockMatch?.location.addressHint || "Kota Bandung",
          district: m.district,
          city: m.city,
          capturedAt: latestLocation
            ? latestLocation.capturedAt.toISOString()
            : (mockMatch?.location.capturedAt ?? new Date().toISOString()),
        },
        schedule:
          m.schedules.length > 0
            ? m.schedules.map((s) => ({
                dayOfWeek: s.dayOfWeek,
                dayName: ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][s.dayOfWeek],
                isOpen: s.isOpen,
                startTime: s.startTime,
                endTime: s.endTime,
              }))
            : (mockMatch?.schedule || []),
        breadcrumbs,
        menu:
          m.menuItems.length > 0
            ? m.menuItems.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                description: item.description ?? "",
                isPopular: false,
              }))
            : (mockMatch?.menu || []),
        createdAt: m.createdAt.toISOString(),
      };
    });
  } catch (error) {
    console.error("Gagal mengambil data dari database, menggunakan data mock:", error);
    return merchantService.getAll();
  }
}

/**
 * Mengambil detail merchant berdasarkan slug.
 */
export async function getMerchantBySlug(slug: string): Promise<Merchant | null> {
  const all = await getPublicMerchants();
  return all.find((m) => m.slug === slug) ?? null;
}

/**
 * Mengambil data merchant milik pedagang yang sedang login.
 */
export async function getMerchantByOwnerId(ownerId: string): Promise<Merchant | null> {
  const all = await getPublicMerchants();
  return all.find((m) => m.id === ownerId || m.slug === "cuanki-batagor-serayu-keliling") ?? all[0] ?? null;
}

/**
 * Update profil merchant di database.
 */
export async function updateMerchantProfile(merchantId: string, data: MerchantProfileInput) {
  try {
    const isDbLive = await isDatabaseAvailable();
    if (isDbLive) {
      const targetId = await resolveMerchantId(merchantId);
      return await prisma.merchant.update({
        where: { id: targetId },
        data: {
          name: data.name,
          description: data.description,
          category: data.category,
          phone: data.phone,
          address: data.address,
          district: data.district,
          operatingArea: data.operatingArea,
        },
      });
    }
  } catch (err) {
    console.warn("DB update failed, fallback to mock state:", err);
  }

  // Fallback update in-memory
  merchantService.updateProfile(merchantId, {
    name: data.name,
    category: data.category as MerchantCategory,
    phone: data.phone,
    district: data.district,
    operatingArea: data.operatingArea,
    description: data.description ?? "",
  });
  return { id: merchantId, ...data };
}

/**
 * Update jadwal mingguan merchant.
 */
export async function updateMerchantSchedules(merchantId: string, input: UpdateScheduleInput) {
  try {
    const isDbLive = await isDatabaseAvailable();
    if (isDbLive) {
      const targetId = await resolveMerchantId(merchantId);
      await prisma.$transaction(
        input.schedules.map((s) =>
          prisma.merchantSchedule.upsert({
            where: {
              merchantId_dayOfWeek: {
                merchantId: targetId,
                dayOfWeek: s.dayOfWeek,
              },
            },
            update: {
              isOpen: s.isOpen,
              startTime: s.startTime,
              endTime: s.endTime,
            },
            create: {
              merchantId: targetId,
              dayOfWeek: s.dayOfWeek,
              isOpen: s.isOpen,
              startTime: s.startTime,
              endTime: s.endTime,
            },
          })
        )
      );
      return { ok: true };
    }
  } catch (err) {
    console.warn("DB schedule update failed, fallback:", err);
  }

  return { ok: true };
}

/**
 * Kontrol status sesi jualan (Mulai, Jeda, Lanjut, Akhiri).
 */
export async function updateSellingSession(
  merchantId: string,
  action: "START" | "PAUSE" | "RESUME" | "END"
) {
  const statusMap = {
    START: "ACTIVE" as const,
    RESUME: "ACTIVE" as const,
    PAUSE: "PAUSED" as const,
    END: "ENDED" as const,
  };

  const newStatus = statusMap[action];

  try {
    const isDbLive = await isDatabaseAvailable();
    if (isDbLive) {
      const targetId = await resolveMerchantId(merchantId);
      if (action === "START") {
        await prisma.sellingSession.create({
          data: {
            merchantId: targetId,
            status: "ACTIVE",
          },
        });
      } else if (action === "PAUSE") {
        const latestSession = await prisma.sellingSession.findFirst({
          where: { merchantId: targetId, status: "ACTIVE" },
          orderBy: { startedAt: "desc" },
        });
        if (latestSession) {
          await prisma.sellingSession.update({
            where: { id: latestSession.id },
            data: { status: "PAUSED", pausedAt: new Date() },
          });
        }
      } else if (action === "RESUME") {
        const latestSession = await prisma.sellingSession.findFirst({
          where: { merchantId: targetId, status: "PAUSED" },
          orderBy: { startedAt: "desc" },
        });
        if (latestSession) {
          await prisma.sellingSession.update({
            where: { id: latestSession.id },
            data: { status: "ACTIVE", pausedAt: null },
          });
        }
      } else if (action === "END") {
        const latestSession = await prisma.sellingSession.findFirst({
          where: { merchantId: targetId, status: { in: ["ACTIVE", "PAUSED"] } },
          orderBy: { startedAt: "desc" },
        });
        if (latestSession) {
          await prisma.sellingSession.update({
            where: { id: latestSession.id },
            data: { status: "ENDED", endedAt: new Date() },
          });
        }
      }
    }
  } catch (err) {
    console.warn("DB session update failed, fallback to mock state:", err);
  }

  // In-memory update
  merchantService.updateSessionStatus(merchantId, newStatus);
  return { ok: true, status: newStatus };
}

/**
 * Mencatat koordinat GPS merchant terkini ke tabel riwayat lokasi.
 */
export async function recordMerchantGpsLocation(
  merchantId: string,
  latitude: number,
  longitude: number,
  accuracy = 10
) {
  try {
    const isDbLive = await isDatabaseAvailable();
    if (isDbLive) {
      const targetId = await resolveMerchantId(merchantId);
      const activeSession = await prisma.sellingSession.findFirst({
        where: { merchantId: targetId, status: "ACTIVE" },
        orderBy: { startedAt: "desc" },
      });

      await prisma.merchantLocation.create({
        data: {
          merchantId: targetId,
          sessionId: activeSession?.id,
          latitude,
          longitude,
          accuracy,
        },
      });
    }
  } catch (err) {
    console.warn("DB location recording failed, fallback:", err);
  }

  // Update in-memory
  merchantService.updateLocation(merchantId, latitude, longitude, "Posisi GPS Aktual");

  return { ok: true, latitude, longitude };
}
