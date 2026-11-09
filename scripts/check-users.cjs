const { PrismaClient } = require("../src/generated/prisma/client");
const fs = require("fs");
const path = require("path");

// Load .env.local
try {
  const envLocal = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf-8");
  envLocal.split("\n").forEach((line) => {
    const eq = line.indexOf("=");
    if (eq > 0) {
      const key = line.slice(0, eq).trim();
      const val = line.slice(eq + 1).trim().replace(/^"|"$/g, "");
      if (key) process.env[key] = val;
    }
  });
} catch {}

const prisma = new PrismaClient();

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
        console.log(`  ✅ Merchant: "${m.name}" | ${m.slug} | status: ${m.verificationStatus} | ID: ${m.id}`);
      }
    }
    console.log("");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
