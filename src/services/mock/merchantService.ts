import { MOCK_MERCHANTS } from "@/data/mock/merchants";
import { Merchant, SellingStatus, FreshnessStatus, VerificationStatus } from "@/types/merchant";
import { FRESHNESS_THRESHOLD, MOCK_BASE_TIMESTAMP } from "@/config/constants";

// State mock lokal dalam memori runtime (bisa diubah selama sesi berjalan)
let memoryMerchants: Merchant[] = [...MOCK_MERCHANTS];

export function calculateFreshness(
  capturedAtIso: string,
  referenceTime: number = MOCK_BASE_TIMESTAMP
): FreshnessStatus {
  const diffMs = Math.max(0, referenceTime - new Date(capturedAtIso).getTime());
  const diffMinutes = diffMs / (1000 * 60);

  if (diffMinutes <= FRESHNESS_THRESHOLD.LIVE_MINUTES) {
    return "LIVE";
  }
  if (diffMinutes <= FRESHNESS_THRESHOLD.RECENT_MINUTES) {
    return "RECENT";
  }
  return "STALE";
}

export interface MerchantFilterParams {
  query?: string;
  category?: string;
  sellingStatus?: string;
  district?: string;
  onlyActive?: boolean;
}

export const merchantService = {
  getAll(): Merchant[] {
    return [...memoryMerchants];
  },

  getBySlug(slug: string): Merchant | undefined {
    return memoryMerchants.find((m) => m.slug === slug);
  },

  getById(id: string): Merchant | undefined {
    return memoryMerchants.find((m) => m.id === id);
  },

  search(params: MerchantFilterParams): Merchant[] {
    return memoryMerchants.filter((m) => {
      // 1. Filter teks pencarian (nama pedagang, nama usaha, kategori, tagline)
      if (params.query && params.query.trim() !== "") {
        const q = params.query.toLowerCase().trim();
        const matchName = m.name.toLowerCase().includes(q);
        const matchOwner = m.ownerName.toLowerCase().includes(q);
        const matchCategory = m.category.toLowerCase().includes(q);
        const matchTagline = m.tagline.toLowerCase().includes(q);
        const matchMenu = m.menu.some((item) => item.name.toLowerCase().includes(q));

        if (!matchName && !matchOwner && !matchCategory && !matchTagline && !matchMenu) {
          return false;
        }
      }

      // 2. Filter Kategori
      if (params.category && params.category !== "Semua Kategori") {
        if (m.category !== params.category) {
          return false;
        }
      }

      // 3. Filter Status Berjualan
      if (params.sellingStatus && params.sellingStatus !== "SEMUA") {
        if (m.sellingStatus !== params.sellingStatus) {
          return false;
        }
      }

      // 4. Filter khusus "Hanya Pedagang Aktif"
      if (params.onlyActive && m.sellingStatus !== "ACTIVE") {
        return false;
      }

      // 5. Filter Wilayah Administratif
      if (params.district && params.district !== "Semua Wilayah") {
        if (!m.district.includes(params.district) && !params.district.includes(m.district)) {
          return false;
        }
      }

      return true;
    });
  },

  updateProfile(id: string, data: Partial<Merchant>): Merchant | null {
    const idx = memoryMerchants.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    memoryMerchants[idx] = {
      ...memoryMerchants[idx],
      ...data,
    };
    return memoryMerchants[idx];
  },

  updateSessionStatus(id: string, status: SellingStatus): Merchant | null {
    const idx = memoryMerchants.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    const currentLoc = memoryMerchants[idx].location;
    memoryMerchants[idx] = {
      ...memoryMerchants[idx],
      sellingStatus: status,
      location: {
        ...currentLoc,
        capturedAt: new Date().toISOString(), // refresh timestamp
      },
    };
    return memoryMerchants[idx];
  },

  updateLocation(id: string, lat: number, lng: number, addressHint?: string): Merchant | null {
    const idx = memoryMerchants.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    const currentLoc = memoryMerchants[idx].location;
    const oldBreadcrumbs = memoryMerchants[idx].breadcrumbs || [];

    memoryMerchants[idx] = {
      ...memoryMerchants[idx],
      location: {
        ...currentLoc,
        latitude: lat,
        longitude: lng,
        addressHint: addressHint || currentLoc.addressHint,
        capturedAt: new Date().toISOString(),
      },
      breadcrumbs: [...oldBreadcrumbs, [lng, lat]],
    };
    return memoryMerchants[idx];
  },

  setVerificationStatus(id: string, status: VerificationStatus): Merchant | null {
    const idx = memoryMerchants.findIndex((m) => m.id === id);
    if (idx === -1) return null;

    memoryMerchants[idx] = {
      ...memoryMerchants[idx],
      verificationStatus: status,
    };
    return memoryMerchants[idx];
  },

  resetDefaults() {
    memoryMerchants = [...MOCK_MERCHANTS];
  },
};

