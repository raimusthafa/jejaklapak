---
name: frontend-component-builder
description: Builds accessible, responsive React components, pages, and forms for Next.js App Router with correct Server versus Client component boundaries, loading and error states, and Tailwind styling. Use whenever the user asks for a UI component, page, layout, form, table, modal, or client-side behavior.
---

# Frontend Component Builder (Next.js + React)

## Use this skill when
- Membuat atau memperbaiki komponen, halaman, form, tabel, dialog, navigasi
- Menghubungkan UI ke data/Server Action

## Do not use this skill when
- Keputusan visual (palet, tipografi, layout) -> gunakan juga `minimal-modern-design`

## Instructions
1. **Ikuti yang sudah ada:** cek Tailwind, shadcn/ui, ikon, dan komponen di `src/components`. Pakai ulang sebelum membuat baru.
2. **Batas Server/Client:** halaman dan komponen penampil data = Server Component. Beri `"use client"` hanya pada bagian interaktif yang kecil. Kirim data ke komponen klien lewat props yang bisa diserialisasi.
3. **Data awal** diambil di Server Component, bukan `useEffect`. Gunakan `<Suspense>` + `loading.tsx` untuk streaming.
4. **Form:** `<form action={serverAction}>` dengan `useActionState` (pesan error, hasil) dan `useFormStatus`/`pending` untuk menonaktifkan tombol. `useOptimistic` untuk pembaruan instan bila cocok. Tampilkan error per field. Skema Zod yang sama dipakai di server dan klien.
5. **Selalu tangani 4 state:** loading (skeleton, bukan spinner di tengah), error (jelaskan masalah dan langkah perbaikan), empty (ajak melakukan aksi), dan success.
6. **Aksesibilitas:** elemen semantik, `label` terhubung ke input, fokus terlihat (`focus-visible`), navigasi keyboard untuk dialog/menu, kontras AA, `alt` bermakna, target sentuh minimal ~40px.
7. **Responsif mobile-first:** periksa 375px, 768px, dan desktop. Tabel lebar discroll di wadahnya.
8. **Next.js bawaan:** `next/link`, `next/image` (dengan ukuran), `next/font`, dan Metadata API (`metadata`/`generateMetadata`) untuk judul dan deskripsi.
9. **TypeScript:** tipe props eksplisit, tipe dari Prisma/Zod (`z.infer`), hindari `any`.
10. **Performa:** `dynamic()` untuk komponen klien yang berat, hindari re-render tak perlu, jangan menaruh `"use client"` di layout tanpa alasan.
11. **Keamanan:** tidak ada `dangerouslySetInnerHTML` dengan input tak tepercaya. Jangan impor Prisma atau secret ke komponen klien.
12. **Component Decomposition & Separation of Concerns (WAJIB)**

Jangan membuat satu komponen besar yang menampung seluruh fitur, logic, state, dan UI sekaligus (*God Component* / *Monolithic Component*).

Setiap fitur harus dipecah menjadi beberapa komponen dan modul berdasarkan tanggung jawabnya.

**A. Prinsip pemisahan komponen**
- Satu komponen memiliki satu tanggung jawab utama (*Single Responsibility Principle*).
- Pisahkan komponen berdasarkan bagian UI, bukan sekadar memotong kode berdasarkan jumlah baris.
- Komponen yang memiliki fungsi berbeda harus dipisahkan, meskipun masih berada dalam satu halaman.
- Gunakan kembali komponen yang memiliki pola UI atau perilaku serupa.
- Hindari duplikasi logic, validasi, dan markup.

**B. Pisahkan berdasarkan tanggung jawab**

Untuk fitur kompleks seperti Tambah Produk, jangan membuat semuanya dalam satu file. Pisahkan menjadi:

1. **Page Component** – Mengatur struktur halaman dan menggabungkan komponen.
2. **Form Component** – Mengatur struktur dan interaksi form.
3. **Section Component** – Memisahkan kelompok input berdasarkan kebutuhan, misalnya informasi produk, harga, stok, dan gambar.
4. **Reusable UI Component** – Komponen yang dapat digunakan kembali, seperti InputField, ImageUploader, SelectField, dan SubmitButton.
5. **Custom Hooks** – Menampung state dan logic interaktif yang kompleks serta dapat digunakan kembali.
6. **Validation Schema** – Memisahkan skema validasi Zod.
7. **Server Actions / API Layer** – Memisahkan komunikasi database, server actions, dan business logic dari tampilan UI.

**C. Contoh struktur folder**

Untuk fitur tambah produk:

```text
src/
├── app/
│   └── dashboard/
│       └── products/
│           └── create/
│               └── page.tsx
│
├── components/
│   ├── ui/
│   │   ├── input-field.tsx
│   │   ├── select-field.tsx
│   │   └── image-uploader.tsx
│   │
│   └── products/
│       └── create/
│           ├── product-form.tsx
│           ├── product-basic-info.tsx
│           ├── product-pricing.tsx
│           ├── product-inventory.tsx
│           ├── product-images.tsx
│           └── product-form-actions.tsx
│
├── hooks/
│   └── use-product-form.ts
│
├── lib/
│   └── validations/
│       └── product.schema.ts
│
└── actions/
    └── product.actions.ts
```

Struktur tersebut adalah contoh, bukan aturan mutlak. Sesuaikan dengan arsitektur dan konvensi proyek yang sudah ada.

**D. Batas ukuran dan kompleksitas komponen**

- Usahakan komponen UI memiliki sekitar 100–200 baris kode atau kurang jika memungkinkan.
- Jika komponen mulai memiliki banyak tanggung jawab, pecah menjadi komponen yang lebih kecil.
- Jangan memaksakan batas jumlah baris jika justru membuat abstraksi yang tidak diperlukan.
- Hindari nesting JSX yang terlalu dalam.
- Hindari terlalu banyak conditional rendering dalam satu komponen. Ekstrak bagian UI yang kompleks.
- Pisahkan konfigurasi, constants, helper functions, dan types dari komponen apabila membuat file lebih mudah dibaca.

**E. Aturan pembagian logic**

- Business logic tidak boleh bercampur dengan markup UI secara berlebihan.
- Logic pengolahan data ditempatkan pada helper atau service.
- State dan interaksi kompleks dapat ditempatkan dalam custom hooks.
- API calls dan database operations ditempatkan pada layer yang sesuai.
- Gunakan props dan TypeScript interfaces/types yang eksplisit untuk komunikasi antar-komponen.
- Jangan membuat custom hook atau komponen baru jika logic tersebut terlalu sederhana dan hanya digunakan sekali tanpa alasan yang jelas.

**F. Hindari over-engineering**

- Jangan memecah setiap elemen HTML menjadi komponen tersendiri.
- Jangan membuat abstraksi yang tidak memiliki manfaat nyata.
- Jangan membuat terlalu banyak file kecil yang justru menyulitkan navigasi.
- Komponen reusable hanya dibuat ketika terdapat kebutuhan penggunaan ulang atau pemisahan tanggung jawab yang jelas.
- Prioritaskan readability, maintainability, dan scalability dibandingkan sekadar banyaknya komponen.

**G. Workflow sebelum implementasi**

Sebelum membuat fitur kompleks:

1. Analisis kebutuhan dan identifikasi bagian-bagian fitur.
2. Tentukan komponen, hooks, schema, dan service yang diperlukan.
3. Tentukan tanggung jawab masing-masing file.
4. Periksa komponen atau utilitas yang sudah tersedia agar tidak membuat duplikasi.
5. Buat implementasi secara modular.
6. Pastikan integrasi antar-komponen berjalan dengan baik.
7. Verifikasi tidak ada logic penting yang hilang akibat pemisahan file.

**H. Aturan refactoring**

Jika diminta memperbaiki fitur yang sudah memiliki file sangat besar:

- Jangan langsung menulis ulang seluruh fitur.
- Pertahankan semua fitur, field, validasi, business logic, dan perilaku yang sudah ada.
- Identifikasi bagian yang bisa dipisahkan tanpa mengubah hasil akhir.
- Lakukan refactoring secara bertahap.
- Pastikan seluruh fungsi tetap berjalan setelah pemisahan.

**Prinsip utama: Build small, focused, reusable components. Keep each file responsible for one clear concern. Never sacrifice maintainability for faster code generation.**

## Constraints
- Jangan menambah dependency besar tanpa konfirmasi
- Pertahankan konvensi penamaan dan struktur proyek
