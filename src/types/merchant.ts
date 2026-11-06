export type MerchantCategory =
  | "Makanan Berat"
  | "Camilan"
  | "Minuman Segar"
  | "Jajanan Tradisional";

export type SellingStatus = "ACTIVE" | "PAUSED" | "ENDED";

export type FreshnessStatus = "LIVE" | "RECENT" | "STALE";

export type VerificationStatus = "VERIFIED" | "PENDING" | "REJECTED";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  isPopular?: boolean;
  isAvailable?: boolean;
}

export interface MerchantLocation {
  id: string;
  merchantId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  heading?: number; // 0-360 derajat kompas
  speedKmh?: number; // kecepatan gerobak jalan/berhenti
  batteryLevel?: number; // persentase IoT telemetry simulasi
  addressHint: string; // misal: "Depan Kampus ITB Jl. Ganesha"
  district: string; // misal: "Coblong"
  city: string; // misal: "Kota Bandung"
  capturedAt: string; // ISO string
}

export interface DaySchedule {
  dayOfWeek: number; // 0: Minggu, 1: Senin, dst.
  dayName: string;
  isOpen: boolean;
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}

export interface Merchant {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: MerchantCategory;
  iconEmoji: string;
  image: string;
  phone: string;
  district: string;
  city: string;
  operatingArea: string; // misal "Area Dipati Ukur & Dago Bawah"
  verificationStatus: VerificationStatus;
  sellingStatus: SellingStatus;
  location: MerchantLocation;
  schedule: DaySchedule[];
  breadcrumbs: [number, number][]; // riwayat rute lintasan hari ini [lng, lat]
  menu: MenuItem[];
  createdAt: string;
}

