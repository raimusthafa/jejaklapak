import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { seedAdminUser } from "./admin-seeder.js";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_URL not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔐 Menjalankan seeder user Admin JejakLapak...");
  const admin = await seedAdminUser(prisma);
  console.log(
    `✅ User Admin siap digunakan: ${admin.email} (role: ${admin.role}, Supabase Auth synced: ${admin.authSynced})`
  );
}

main()
  .catch((e) => {
    console.error("❌ Gagal seeding user Admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

