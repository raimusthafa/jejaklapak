---
name: code-review-checklist
description: Reviews code in a Next.js, Prisma, and Supabase project for bugs, security holes, performance, and design quality, with stack-specific checks. Use when the user asks to review, audit, check, or improve existing code, a pull request, or a feature.
---

# Code Review (Next.js + Prisma + Supabase)

## Urutan prioritas
1. **Kebenaran:** bug logika, edge case (null, kosong, batas), race condition, error yang tertelan.
2. **Keamanan (cek khusus stack):**
   - Server Action/Route Handler tanpa verifikasi user atau cek kepemilikan (IDOR)
   - Input tanpa validasi Zod
   - Secret atau `sb_secret_`/`service_role` berawalan `NEXT_PUBLIC_` atau terimpor ke Client Component
   - `getSession()` dipakai untuk otorisasi di server (seharusnya `getClaims()`)
   - Tabel `public` tanpa RLS, policy `USING (true)`, atau peran disimpan di `user_metadata`
   - Query Prisma tanpa filter `userId` pada data milik user (ingat Prisma melewati RLS)
   - `dangerouslySetInnerHTML` dengan input tak tepercaya, `$queryRawUnsafe`
   - Auth hanya di `proxy.ts` tanpa pengecekan ulang di DAL
3. **Next.js 16:** `params`/`searchParams` belum di-`await`, masih memakai `middleware.ts`, `"use client"` terlalu tinggi di pohon, data awal diambil lewat `useEffect`, strategi cache tidak jelas.
4. **Performa:** N+1 query, list tanpa paginasi, `select` terlalu lebar, komponen klien berat tanpa `dynamic`, gambar tanpa `next/image`.
5. **Aksesibilitas & UI:** label, fokus keyboard, kontras, state loading/error/empty, responsif 375px. Cek juga pola AI-slop dari `minimal-modern-design`.
6. **Keterbacaan & test:** penamaan, duplikasi, fungsi terlalu panjang, kasus gagal belum teruji.

## Format keluaran
- Kelompokkan: **Kritis**, **Sebaiknya diperbaiki**, **Saran**
- Setiap temuan: file/baris, masalahnya, *kenapa* penting, dan contoh perbaikan
- Akui hal yang sudah baik secara singkat

## Constraints
- Jangan mengubah kode saat review kecuali user memintanya
