import "server-only";
import { prisma } from "@/lib/prisma";
import { merchantService } from "@/services/mock/merchantService";
import { MOCK_MERCHANTS } from "@/data/mock/merchants";
import { Merchant, MerchantCategory } from "@/types/merchant";
import { LngLat } from "@/types/location";
import { MerchantProfileInput, UpdateScheduleInput, MenuItemInput } from "@/schemas/merchant";

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
          { slug: idOrSlug },
          { slug: "cuanki-batagor-serayu-keliling" },
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
        image: m.image ?? mockMatch?.image ?? "",
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
            : (mockMatch?.location.capturedAt ?? "2026-01-01T00:00:00.000Z"),
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
                isAvailable: item.isAvailable,
              }))
            : (mockMatch?.menu || []).map((item) => ({ ...item, isAvailable: item.isAvailable ?? true })),
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
 * Mengambil detail merchant berdasarkan ID atau Slug.
 */
export async function getMerchantByIdOrSlug(idOrSlug: string): Promise<Merchant | null> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  if (isUuid) {
    return await getMerchantForUser({ merchantId: idOrSlug });
  }
  return (await getMerchantForUser({ merchantSlug: idOrSlug })) || (await getMerchantBySlug(idOrSlug));
}

/**
 * Mengambil data merchant milik pedagang yang sedang login (termasuk status PENDING).
 */
export async function getMerchantForUser(user: {
  id?: string;
  name?: string;
  merchantId?: string | null;
  merchantSlug?: string | null;
  email?: string;
}): Promise<Merchant | null> {
  try {
    const isDbLive = await isDatabaseAvailable();
    if (isDbLive && (user.merchantId || user.merchantSlug || user.id)) {
      const dbMerchant = await prisma.merchant.findFirst({
        where: {
          OR: [
            ...(user.merchantId ? [{ id: user.merchantId }] : []),
            ...(user.merchantSlug ? [{ slug: user.merchantSlug }] : []),
            ...(user.id ? [{ ownerId: user.id }] : []),
          ],
        },
        include: {
          owner: true,
          schedules: { orderBy: { dayOfWeek: "asc" } },
          menuItems: { orderBy: { createdAt: "asc" } },
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
      });

      if (dbMerchant) {
        const activeSession = dbMerchant.sessions[0];
        const latestLocation = dbMerchant.locations[0];
        const mockMatch = MOCK_MERCHANTS.find(
          (m) => m.slug === dbMerchant.slug || m.id === dbMerchant.id
        );

        const breadcrumbs: LngLat[] =
          dbMerchant.locations.length > 1
            ? dbMerchant.locations.slice().reverse().map((loc) => [loc.longitude, loc.latitude] as LngLat)
            : (mockMatch?.breadcrumbs || []);

        const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

        return {
          id: dbMerchant.id,
          ownerId: dbMerchant.ownerId,
          ownerName: dbMerchant.owner?.name ?? user.name ?? "Mitra Pedagang",
          name: dbMerchant.name,
          slug: dbMerchant.slug,
          tagline: dbMerchant.description ?? mockMatch?.tagline ?? "",
          description: dbMerchant.description ?? mockMatch?.description ?? "",
          category: (dbMerchant.category as MerchantCategory) || "Makanan Berat",
          image: dbMerchant.image ?? mockMatch?.image ?? "",
          phone: dbMerchant.phone,
          district: dbMerchant.district,
          city: dbMerchant.city,
          operatingArea: dbMerchant.operatingArea,
          verificationStatus:
            (dbMerchant.verificationStatus as "VERIFIED" | "PENDING" | "REJECTED") || "PENDING",
          sellingStatus: activeSession ? (activeSession.status as "ACTIVE" | "PAUSED") : "ENDED",
          location: {
            id: latestLocation?.id ?? dbMerchant.id,
            merchantId: dbMerchant.id,
            latitude: latestLocation?.latitude ?? mockMatch?.location.latitude ?? -6.9175,
            longitude: latestLocation?.longitude ?? mockMatch?.location.longitude ?? 107.6191,
            accuracyMeters: latestLocation?.accuracy ?? 10,
            heading: mockMatch?.location.heading ?? 0,
            speedKmh: mockMatch?.location.speedKmh ?? 0,
            batteryLevel: mockMatch?.location.batteryLevel ?? 100,
            addressHint: dbMerchant.address || mockMatch?.location.addressHint || "Kota Bandung",
            district: dbMerchant.district,
            city: dbMerchant.city,
            capturedAt: latestLocation
              ? latestLocation.capturedAt.toISOString()
              : dbMerchant.createdAt.toISOString(),
          },
          schedule:
            dbMerchant.schedules.length > 0
              ? dbMerchant.schedules.map((s) => ({
                  dayOfWeek: s.dayOfWeek,
                  dayName: DAY_NAMES[s.dayOfWeek] || `Hari ${s.dayOfWeek}`,
                  isOpen: s.isOpen,
                  startTime: s.startTime,
                  endTime: s.endTime,
                }))
              : (mockMatch?.schedule || []),
          breadcrumbs,
          menu: dbMerchant.menuItems.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            description: item.description ?? "",
            isPopular: false,
            isAvailable: item.isAvailable,
          })),
          createdAt: dbMerchant.createdAt.toISOString(),
        };
      }
    }
  } catch (err) {
    console.warn("Failed to get merchant for user from DB:", err);
  }

  // Fallback to mock merchant ONLY IF demo ID/slug matches
  if (user.merchantId || user.merchantSlug) {
    const all = await getPublicMerchants();
    const matched = all.find(
      (m) =>
        (user.merchantSlug && m.slug === user.merchantSlug) ||
        (user.merchantId && m.id === user.merchantId)
    );
    if (matched) return matched;
  }
  return null;
}

/**
 * Mengambil jadwal operasional mingguan untuk pedagang tertentu.
 */
export async function getMerchantSchedules(merchantId: string) {
  try {
    const isDbLive = await isDatabaseAvailable();
    if (isDbLive) {
      const targetId = await resolveMerchantId(merchantId);
      const dbMerchant = await prisma.merchant.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      if (dbMerchant) {
        const dbSchedules = await prisma.merchantSchedule.findMany({
          where: { merchantId: targetId },
          orderBy: { dayOfWeek: "asc" },
        });
        const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        if (dbSchedules.length > 0) {
          return dbSchedules.map((s) => ({
            dayOfWeek: s.dayOfWeek,
            dayName: DAY_NAMES[s.dayOfWeek] || `Hari ${s.dayOfWeek}`,
            isOpen: s.isOpen,
            startTime: s.startTime,
            endTime: s.endTime,
          }));
        }
        return [1, 2, 3, 4, 5, 6, 0].map((day) => ({
          dayOfWeek: day,
          dayName: DAY_NAMES[day] || `Hari ${day}`,
          isOpen: true,
          startTime: day === 0 || day === 6 ? "08:00" : "09:00",
          endTime: day === 0 || day === 6 ? "18:00" : "17:00",
        }));
      }
    }
  } catch (err) {
    console.warn("DB get schedules failed:", err);
  }

  // Fallback to mock default schedule ONLY IF matching demo ID
  const mockMerchant = (await getPublicMerchants()).find((m) => m.id === merchantId);
  return mockMerchant?.schedule || [];
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
 * Simpan (atau hapus, jika null) URL foto gerobak merchant.
 * Mengembalikan URL foto sebelumnya agar file lamanya bisa dibersihkan dari storage.
 */
export async function setMerchantImage(
  merchantId: string,
  imageUrl: string | null
): Promise<{ id: string; previousImage: string | null }> {
  const isDbLive = await isDatabaseAvailable();
  if (isDbLive) {
    const targetId = await resolveMerchantId(merchantId);
    const existing = await prisma.merchant.findUnique({
      where: { id: targetId },
      select: { image: true },
    });
    if (!existing) {
      throw new Error("Lapak tidak ditemukan.");
    }
    await prisma.merchant.update({
      where: { id: targetId },
      data: { image: imageUrl },
    });
    return { id: targetId, previousImage: existing.image };
  }

  // Mode demo tanpa database: simpan di memori saja.
  const previous = merchantService.getById(merchantId)?.image ?? null;
  merchantService.updateProfile(merchantId, { image: imageUrl ?? "" });
  return { id: merchantId, previousImage: previous };
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
        await prisma.sellingSession.updateMany({
          where: { merchantId: targetId, status: { in: ["ACTIVE", "PAUSED"] } },
          data: { status: "ENDED", endedAt: new Date() },
        });
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
        } else {
          await prisma.sellingSession.create({
            data: {
              merchantId: targetId,
              status: "PAUSED",
              pausedAt: new Date(),
            },
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
        } else {
          await prisma.sellingSession.create({
            data: {
              merchantId: targetId,
              status: "ACTIVE",
            },
          });
        }
      } else if (action === "END") {
        await prisma.sellingSession.updateMany({
          where: { merchantId: targetId, status: { in: ["ACTIVE", "PAUSED"] } },
          data: { status: "ENDED", endedAt: new Date() },
        });
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

/**
 * Mengambil daftar menu untuk lapak merchant tertentu.
 */
export async function getMerchantMenuItems(merchantId: string) {
  try {
    const isDbLive = await isDatabaseAvailable();
    if (isDbLive) {
      const targetId = await resolveMerchantId(merchantId);
      const dbMerchant = await prisma.merchant.findUnique({
        where: { id: targetId },
        select: { id: true },
      });
      if (dbMerchant) {
        const items = await prisma.menuItem.findMany({
          where: { merchantId: targetId },
          orderBy: { createdAt: "asc" },
        });
        return items.map((it) => ({
          id: it.id,
          merchantId: it.merchantId,
          name: it.name,
          description: it.description,
          price: it.price,
          image: it.image,
          isAvailable: it.isAvailable,
        }));
      }
    }
  } catch (err) {
    console.warn("DB get menu items failed:", err);
  }

  // Fallback to mock merchant's menu ONLY IF matching mock/demo ID
  const mockMerchant = (await getPublicMerchants()).find((m) => m.id === merchantId);
  return (mockMerchant?.menu || []).map((item) => ({
    id: item.id,
    merchantId: mockMerchant?.id || merchantId,
    name: item.name,
    description: item.description || "",
    price: item.price,
    image: null,
    isAvailable: item.isAvailable ?? true,
  }));
}

/**
 * Menambah menu baru untuk lapak.
 */
export async function createMenuItem(merchantId: string, input: MenuItemInput) {
  try {
    const isDbLive = await isDatabaseAvailable();
    if (isDbLive) {
      const targetId = await resolveMerchantId(merchantId);
      const newItem = await prisma.menuItem.create({
        data: {
          merchantId: targetId,
          name: input.name,
          description: input.description,
          price: input.price,
          image: input.image,
          isAvailable: input.isAvailable,
        },
      });
      return newItem;
    }
  } catch (err) {
    console.warn("DB create menu item failed:", err);
  }

  return {
    id: `item-${Date.now()}`,
    merchantId,
    name: input.name,
    description: input.description ?? "",
    price: input.price,
    image: input.image ?? null,
    isAvailable: input.isAvailable ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Memperbarui menu lapak.
 */
export async function updateMenuItem(
  menuItemId: string,
  input: Partial<MenuItemInput>
) {
  try {
    const isDbLive = await isDatabaseAvailable();
    if (isDbLive) {
      const updated = await prisma.menuItem.update({
        where: { id: menuItemId },
        data: {
          name: input.name,
          description: input.description,
          price: input.price,
          image: input.image,
          isAvailable: input.isAvailable,
        },
      });
      return updated;
    }
  } catch (err) {
    console.warn("DB update menu item failed:", err);
  }

  return { id: menuItemId, ...input };
}

/**
 * Menghapus menu dari lapak.
 */
export async function deleteMenuItem(menuItemId: string) {
  try {
    const isDbLive = await isDatabaseAvailable();
    if (isDbLive) {
      await prisma.menuItem.delete({
        where: { id: menuItemId },
      });
      return { ok: true };
    }
  } catch (err) {
    console.warn("DB delete menu item failed:", err);
  }
  return { ok: true };
}

/**
 * Toggle ketersediaan menu (Tersedia / Habis).
 */
export async function toggleMenuItemAvailability(
  menuItemId: string,
  isAvailable: boolean
) {
  return await updateMenuItem(menuItemId, { isAvailable });
}