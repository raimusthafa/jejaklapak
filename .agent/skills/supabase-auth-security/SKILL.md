---
name: supabase-auth-security
description: Implements Supabase Auth with Next.js SSR using @supabase/ssr, session refresh in proxy.ts, getClaims verification, Row Level Security policies, storage rules, and API key handling. Use whenever the user mentions login, register, session, OAuth, protected pages, roles, RLS, Supabase storage, or API keys.
---

# Supabase Auth & Security (Next.js SSR)

## Use this skill when
- Membuat login/register/logout, OAuth, reset password, halaman terproteksi, atau peran user
- Menulis RLS policy atau aturan storage
- Mengatur API key Supabase

## Setup
- Paket: `@supabase/supabase-js` dan `@supabase/ssr`.
- File: `src/lib/supabase/client.ts` (browser), `server.ts` (Server Component/Action/Route Handler, berbasis cookie), `proxy.ts` (helper `updateSession`), dan `proxy.ts` di root untuk memanggilnya.
- Env: `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Key `sb_secret_...` hanya di server (mis. `SUPABASE_SECRET_KEY`), **tidak pernah** berawalan `NEXT_PUBLIC_`.
- Key lama `anon`/`service_role` dijadwalkan dihentikan pada akhir 2026. Untuk kode baru pakai publishable/secret key, dan tawarkan migrasi bila proyek masih memakai key lama.
- Ikuti panduan resmi supabase.com/docs/guides/auth/server-side/nextjs untuk isi persis helper-nya.

## Aturan verifikasi
1. Gunakan `supabase.auth.getClaims()` untuk melindungi halaman dan data. Ia memverifikasi tanda tangan JWT.
2. **Jangan** memakai `getSession()` di kode server sebagai dasar otorisasi. Cookie bisa dipalsukan.
3. `getUser()` hanya bila perlu data user terbaru dari server Auth.
4. Buat helper `requireUser()` di DAL (`src/server/auth.ts`), dibungkus `cache()` React, dan panggil di setiap halaman terproteksi, Server Action, dan Route Handler. `proxy.ts` hanya me-refresh sesi dan redirect cepat, bukan gerbang keamanan utama.
5. Jangan menyimpan peran di `user_metadata` (bisa diubah user). Gunakan `app_metadata` atau tabel peran.
6. Jangan men-cache respons yang menyetel cookie sesi (ISR/CDN) agar user tidak menerima sesi orang lain.

## RLS
- Aktifkan RLS di **setiap** tabel `public`. Tanpa policy berarti akses ditolak, itu perilaku yang aman.
- Tulis policy terpisah per operasi (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) dengan `TO authenticated` dan bungkus pemanggilan fungsi: `(select auth.uid()) = user_id` (lebih cepat dari memanggil langsung per baris).
- `UPDATE` butuh `USING` dan `WITH CHECK`.
- Beri index pada kolom yang dipakai policy.
- Uji dengan dua user berbeda untuk memastikan data tidak bocor.
- Ingat: query Prisma melewati RLS, jadi cek otorisasi di DAL juga.

## Storage
- Bucket private secara default. Gunakan signed URL untuk file privat.
- Batasi tipe dan ukuran file, dan tulis policy di `storage.objects` berdasarkan path/folder pemilik (mis. folder = user id).

## Profil user
Buat tabel `profiles` (id = `auth.users.id`) dan isi lewat trigger database saat user baru dibuat, sebagai SQL di migrasi (`--create-only`).

## Constraints
- Secret key tidak boleh masuk Client Component, log, atau repositori
- Jangan mematikan RLS demi "supaya jalan". Perbaiki policy-nya
