import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local first (Next.js convention), then fallback to .env
dotenv.config({ path: ".env.local" });
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
