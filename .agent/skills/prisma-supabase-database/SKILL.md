---
name: prisma-supabase-database
description: Designs Prisma schemas, migrations, queries, and connection setup for a Supabase Postgres database in Next.js, including Prisma 7 driver adapters and Row Level Security. Use whenever the user mentions tables, models, relations, migration, Prisma, seed, slow query, or database design.
---

# Prisma + Supabase Postgres

## Use this skill when
- Membuat/mengubah model, relasi, index, migrasi, seed, atau query Prisma
- Mengatur koneksi Prisma ke Supabase

## Langkah awal
Cek versi `prisma` di `package.json`. Panduan di bawah untuk **Prisma 7**. Jika proyek masih Prisma 6.x, pertahankan gaya lama proyek (`prisma-client-js`) dan tawarkan upgrade terpisah.

## Setup Prisma 7
- `prisma/schema.prisma`: generator `prisma-client` dengan `output` eksplisit. Datasource hanya `provider = "postgresql"` (URL ada di config).
  ```prisma
  generator client {
    provider = "prisma-client"
    output   = "../src/generated/prisma"
  }
  datasource db {
    provider = "postgresql"
  }
  ```
- `prisma.config.ts` (root): URL untuk CLI/migrasi memakai `DIRECT_URL`, muat env dengan `dotenv`.
- Runtime client `src/lib/prisma.ts` wajib memakai driver adapter dan singleton agar tidak membocorkan koneksi saat hot reload:
  ```ts
  import "server-only";
  import { PrismaPg } from "@prisma/adapter-pg";
  import { PrismaClient } from "@/generated/prisma/client";

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const g = globalThis as unknown as { prisma?: PrismaClient };
  export const prisma = g.prisma ?? new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== "production") g.prisma = prisma;
  ```
- Paket: `@prisma/client`, `prisma` (dev), `@prisma/adapter-pg`, `pg`, `dotenv`. Tambahkan folder `generated` ke `.gitignore` bila proyek tidak meng-commit-nya, dan jalankan `npx prisma generate` setelah setiap perubahan skema.

## Koneksi Supabase
- `DATABASE_URL` = connection string **pooler** Supabase (mode transaction) untuk runtime/serverless.
- `DIRECT_URL` = koneksi direct atau **session pooler** untuk `migrate`. Koneksi direct Supabase memakai IPv6, jadi jika gagal terhubung dari jaringan IPv4 gunakan session pooler.
- Password dan URL hanya di `.env`/`.env.local` yang di-ignore Git.

## Konvensi skema
- ID: `String @id @default(uuid()) @db.Uuid`. Untuk user, pakai UUID yang sama dengan `auth.users.id`.
- Penamaan: model PascalCase, tabel/kolom snake_case lewat `@@map`/`@map`.
- Selalu `createdAt DateTime @default(now())` dan `updatedAt DateTime @updatedAt`.
- Foreign key + `@@index` pada kolom relasi dan kolom yang sering difilter/diurutkan. Tentukan `onDelete` secara eksplisit.
- Skema `auth` milik Supabase: jangan dimigrasi oleh Prisma. Simpan `userId @db.Uuid` di tabel milik aplikasi (mis. `profiles`) dan buat FK ke `auth.users` lewat SQL kustom bila perlu.

## Migrasi
1. `npx prisma migrate dev --name <deskripsi>` untuk development. `npx prisma migrate deploy` untuk CI/produksi.
2. Satu perubahan logis per migrasi. Untuk perubahan breaking pakai tahap: tambah -> backfill -> pakai -> hapus.
3. Gunakan `--create-only` bila perlu menyunting SQL (RLS, trigger, FK ke `auth.users`).
4. **Wajib setelah membuat tabel baru di schema `public`:** tambahkan `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` di migrasi. Tabel di `public` terekspos lewat Data API Supabase, jadi tanpa RLS bisa diakses klien yang memegang publishable key.
5. Jangan jalankan `migrate reset`, `db push --force-reset`, `DROP`, atau `TRUNCATE` tanpa konfirmasi eksplisit user, dan tidak pernah ke database produksi.

## RLS dan Prisma
Prisma terhubung sebagai role database langsung sehingga **melewati RLS**. Artinya otorisasi untuk query Prisma harus ada di kode (Data Access Layer: filter `where: { userId }`, cek peran). RLS tetap diaktifkan sebagai pertahanan berlapis untuk akses lewat `supabase-js`.

## Query
- Gunakan `select`/`include` seminimal mungkin. Hindari N+1 (pakai `include` atau `in`).
- Paginasi dengan cursor atau `take`/`skip`. Jangan mengembalikan list tanpa batas.
- `prisma.$transaction` untuk operasi yang harus atomik.
- SQL mentah hanya lewat `$queryRaw` tagged template (terparameter), tidak pernah penggabungan string.
- Query ditempatkan di `src/server/` (DAL), bukan di komponen/halaman.

## Constraints
- Prisma Client hanya dipakai di server. Jangan impor di Client Component
