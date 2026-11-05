---
name: nextjs-fullstack-patterns
description: Conventions for building pages, layouts, Server Components, Server Actions, Route Handlers, validation, caching, proxy.ts, and environment variables in a Next.js App Router project. Use for any backend or routing work in Next.js, even if the user only says "buat endpoint", "tambah halaman", "buat form", or "simpan data".
---

# Next.js Full-Stack Patterns (App Router)

## Use this skill when
- Membuat/mengubah halaman, layout, Server Action, Route Handler, atau logika server di Next.js
- Menambah validasi, caching, redirect, atau environment variable

## Do not use this skill when
- Hanya mengubah skema database (pakai `prisma-supabase-database`)
- Hanya urusan tampilan (pakai `frontend-component-builder` / `minimal-modern-design`)

## Langkah awal (selalu)
1. Baca `package.json`: versi `next`, `react`, `prisma`, `@supabase/ssr`. Ikuti versi yang terpasang. Jika ragu soal API, cek dokumentasi resmi di nextjs.org/docs untuk versi itu.
2. Lihat struktur yang sudah ada dan ikuti polanya sebelum membuat pola baru.

## Struktur yang disarankan
```
src/
  app/                 # route, layout, loading/error/not-found
  components/          # ui/ (primitif) dan features/ (per domain)
  lib/                 # prisma.ts, supabase/, utils
  server/              # Data Access Layer: queries, mutations, auth guard
  schemas/             # skema Zod bersama (server + client)
  env.ts               # validasi environment variable
```

## Aturan inti
1. **Server Component adalah default.** Tambahkan `"use client"` hanya untuk interaktivitas (state, event, browser API) dan letakkan sedekat mungkin ke komponen daun.
2. **Baca data di Server Component** lewat fungsi Data Access Layer (`src/server/...`), bukan fetch dari `useEffect`. Tandai modul server dengan `import "server-only"`.
3. **Mutasi lewat Server Action** (form, tombol). **Route Handler** hanya untuk webhook, API publik/eksternal, upload, atau streaming.
4. **Server Action = endpoint publik.** Setiap action wajib berurutan:
   1. verifikasi user (`requireUser()`, lihat `supabase-auth-security`)
   2. otorisasi terhadap resource (cek kepemilikan/peran)
   3. validasi input dengan Zod (`safeParse`)
   4. jalankan logika lewat DAL
   5. invalidasi cache (`revalidatePath` / `revalidateTag` / `updateTag` sesuai versi)
   6. kembalikan hasil bertipe, mis. `{ ok: true, data } | { ok: false, error }`. Kesalahan yang wajar tidak di-`throw`.
5. **Next.js 16:**
   - `params` dan `searchParams` adalah Promise, gunakan `await`.
   - `proxy.ts` (fungsi `proxy`) menggantikan `middleware.ts`. Pakai untuk refresh sesi, redirect, header. **Jangan jadikan satu-satunya gerbang auth**, cek ulang di DAL/action/route.
   - `revalidateTag` butuh argumen kedua (profil cache). Cek docs sebelum memakai.
   - Jangan berasumsi `fetch` ter-cache otomatis. Tentukan strategi cache secara eksplisit.
6. **Environment variable:** hanya yang berawalan `NEXT_PUBLIC_` terekspos ke browser. Secret tidak pernah diberi awalan itu. Validasi semua env di `src/env.ts` dengan Zod agar gagal cepat.
7. **Error & loading:** sediakan `loading.tsx`, `error.tsx`, `not-found.tsx` di segmen penting. Route Handler mengembalikan JSON error yang konsisten dan status code yang tepat, tanpa membocorkan stack trace.
8. **Form:** gunakan `<form action={...}>` dengan `useActionState` untuk pesan error dan status pending. Validasi di klien hanya untuk UX.

## Verifikasi sebelum menyatakan selesai
Jalankan `npm run lint`, `npx tsc --noEmit`, dan `npm run build` bila memungkinkan, lalu laporkan hasilnya.

## Constraints
- Jangan memakai Prisma/Supabase secret di Client Component
- Jangan ubah kontrak route/action yang sudah dipakai tanpa memberi tahu user
