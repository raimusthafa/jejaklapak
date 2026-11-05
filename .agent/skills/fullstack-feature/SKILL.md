---
name: fullstack-feature
description: Plans and implements a complete feature end to end across Prisma schema, Supabase auth and RLS, Next.js server logic, and UI. Use when the user asks for a whole feature such as "buat fitur login", "tambah fitur keranjang", or "buat CRUD produk" that touches database, server, and interface together.
---

# Full-Stack Feature (Next.js + Prisma + Supabase)

## Instructions
1. **Rencana singkat dulu** dan tampilkan ke user: model/tabel yang berubah, aturan akses (siapa boleh apa), Server Action/route baru, halaman/komponen baru, dan risiko.
2. **Urutan kerja** (verifikasi tiap langkah sebelum lanjut):
   1. Skema Prisma + migrasi, termasuk `ENABLE ROW LEVEL SECURITY` dan policy (`prisma-supabase-database`, `supabase-auth-security`)
   2. Skema Zod bersama di `src/schemas/`
   3. Data Access Layer di `src/server/` dengan `requireUser()` dan filter kepemilikan
   4. Server Action / Route Handler dengan urutan auth -> otorisasi -> validasi -> eksekusi -> revalidate (`nextjs-fullstack-patterns`)
   5. UI dengan state loading/error/empty (`frontend-component-builder`) dan tampilan sesuai `minimal-modern-design`
   6. Uji alur utama dan kasus ditolak (user lain, belum login, input salah)
3. Jalankan `npm run lint`, `npx tsc --noEmit`, dan `npm run build`, lalu laporkan hasilnya.
4. Akhiri dengan ringkasan: file yang diubah, perintah yang perlu dijalankan user (mis. `prisma migrate dev`), env baru, dan hal yang belum dikerjakan.

## Constraints
- Jangan menyentuh fitur lain di luar lingkup tanpa memberi tahu user
- Minta konfirmasi sebelum migrasi destruktif atau perubahan yang memengaruhi data yang ada
