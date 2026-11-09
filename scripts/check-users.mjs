import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { readFileSync } from "fs";
import { join } from "path";

// Load .env.local manually
try {
  const envLocal = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
  envLocal.split("\n").forEach((line) => {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) {
      process.env[key.trim()] = rest.join("=").trim().replace(/^"|"$/g, "");
    }
  });
} catch {}

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});

async function main() {
  const users = await prisma.user.findMany({
    include: {
      merchants: {
        select: { id: true, name: true, slug: true, verificationStatus: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  console.log("\n=== USERS & MERCHANTS ===\n");
  for (const u of users) {
    console.log(`User: ${u.email} | Role: ${u.role} | ID: ${u.id}`);
    if (u.merchants.length === 0) {
      console.log("  ⚠️  TIDAK PUNYA MERCHANT");
    } else {
      for (const m of u.merchants) {
        console.log(`  Merchant: ${m.name} | ${m.slug} | ${m.verificationStatus} | ID: ${m.id}`);
      }
    }
    console.log("");
  }

  const orphanMerchants = await prisma.merchant.findMany({
    where: {
      owner: null,
    },
    select: { id: true, name: true, ownerId: true },
  });
  if (orphanMerchants.length > 0) {
    console.log("=== MERCHANT TANPA USER ===");
    orphanMerchants.forEach((m) => console.log(`  ${m.name} | ownerId: ${m.ownerId}`));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

