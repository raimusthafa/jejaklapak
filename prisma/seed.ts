import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { MOCK_MERCHANTS } from "../src/data/mock/merchants.js";
import { seedAdminUser } from "./admin-seeder.js";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function generateDeterministicUuid(index: number): string {
  const hex = (index + 1).toString(16).padStart(12, "0");
  return `00000000-0000-4000-8000-${hex}`;
}

async function main() {
  console.log("🌱 Memulai proses seeding data pedagang Bandung Raya ke Supabase...");

  for (let i = 0; i < MOCK_MERCHANTS.length; i++) {
    const m = MOCK_MERCHANTS[i];
    const userId = generateDeterministicUuid(i);
    const merchantId = generateDeterministicUuid(100 + i);
    const email = `${m.slug}@jejaklapak.id`;

    console.log(`- [${i + 1}/${MOCK_MERCHANTS.length}] Seeding: ${m.name} (${m.district})...`);

    const userMeta = JSON.stringify({ name: m.ownerName, role: "MERCHANT" });
    const appMeta = JSON.stringify({ provider: "email", providers: ["email"] });

    // 1. Insert ke auth.users
    await prisma.$executeRaw`
      INSERT INTO auth.users (
        id, 
        email, 
        raw_user_meta_data, 
        raw_app_meta_data,
        is_sso_user, 
        is_anonymous,
        email_confirmed_at,
        created_at,
        updated_at
      )
      VALUES (
        ${userId}::uuid, 
        ${email}::text, 
        ${userMeta}::jsonb, 
        ${appMeta}::jsonb,
        false, 
        false,
        now(),
        now(),
        now()
      )
      ON CONFLICT (id) DO NOTHING;
    `;

    // 2. Pastikan record di public.users ada dan update datanya
    await prisma.user.upsert({
      where: { id: userId },
      update: {
        name: m.ownerName,
        phone: m.phone,
        email,
      },
      create: {
        id: userId,
        name: m.ownerName,
        email,
        phone: m.phone,
        role: "MERCHANT",
      },
    });

    // 3. Upsert Merchant
    const merchant = await prisma.merchant.upsert({
      where: { slug: m.slug },
      update: {
        name: m.name,
        description: m.description,
        category: m.category,
        image: m.image,
        phone: m.phone,
        address: m.location.addressHint,
        district: m.district,
        city: m.city,
        operatingArea: m.operatingArea,
        verificationStatus: "VERIFIED",
      },
      create: {
        id: merchantId,
        ownerId: userId,
        name: m.name,
        slug: m.slug,
        description: m.description,
        category: m.category,
        image: m.image,
        phone: m.phone,
        address: m.location.addressHint,
        district: m.district,
        city: m.city,
        operatingArea: m.operatingArea,
        verificationStatus: "VERIFIED",
      },
    });

    // 4. Upsert Schedules (7 Hari)
    for (const s of m.schedule) {
      await prisma.merchantSchedule.upsert({
        where: {
          merchantId_dayOfWeek: {
            merchantId: merchant.id,
            dayOfWeek: s.dayOfWeek,
          },
        },
        update: {
          isOpen: s.isOpen,
          startTime: s.startTime,
          endTime: s.endTime,
        },
        create: {
          merchantId: merchant.id,
          dayOfWeek: s.dayOfWeek,
          isOpen: s.isOpen,
          startTime: s.startTime,
          endTime: s.endTime,
        },
      });
    }

    // 5. Create Active/Paused Session
    const existingSession = await prisma.sellingSession.findFirst({
      where: { merchantId: merchant.id },
    });

    let sessionId: string | undefined = existingSession?.id;

    if (!existingSession) {
      const newSession = await prisma.sellingSession.create({
        data: {
          merchantId: merchant.id,
          status: m.sellingStatus === "ACTIVE" ? "ACTIVE" : m.sellingStatus === "PAUSED" ? "PAUSED" : "ENDED",
        },
      });
      sessionId = newSession.id;
    }

    // 6. Create Merchant Location
    await prisma.merchantLocation.create({
      data: {
        merchantId: merchant.id,
        sessionId,
        latitude: m.location.latitude,
        longitude: m.location.longitude,
        accuracy: m.location.accuracyMeters,
      },
    });

    // 7. Upsert Menu Items
    for (const item of m.menu) {
      const existingItem = await prisma.menuItem.findFirst({
        where: { merchantId: merchant.id, name: item.name },
      });

      if (!existingItem) {
        await prisma.menuItem.create({
          data: {
            merchantId: merchant.id,
            name: item.name,
            description: item.description,
            price: item.price,
            isAvailable: true,
          },
        });
      }
    }
  }

  const admin = await seedAdminUser(prisma);
  console.log(
    `🔐 Seeding Admin selesai: ${admin.email} (role: ${admin.role}, Supabase Auth synced: ${admin.authSynced})`
  );

  console.log("🎉 SEEDING SUKSES! Seluruh pedagang Bandung Raya & akun Admin telah tersimpan di database.");
}

main()
  .catch((e) => {
    console.error("❌ Gagal seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
