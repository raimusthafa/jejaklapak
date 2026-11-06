# Progress Tracker — JejakLapak v1.0

Dokumen ini mencatat riwayat kemajuan implementasi, status tahapan, dan rencana tindakan berikutnya sesuai spesifikasi [PRD v1.0](file:///d:/rai's%20project/adikara/prd.md).

---

## 📌 Status Tahapan Pengembangan

| Tahap | Deskripsi | Status | Tanggal Penyelesaian |
|---|---|:---:|:---:|
| **Tahap 1** | Inisialisasi Proyek Next.js App Router & Setup Dependency Peta | ✅ **Completed** | 2026-11-04 |
| **Tahap 2** | Design System & Token Minimalis (*Anti AI-Slop*) | ✅ **Completed** | 2026-11-04 |
| **Tahap 3** | Domain Types, Mock Data Bandung Raya, & Service Layer | ✅ **Completed** | 2026-11-04 |
| **Tahap 4** | Integrasi WebGL MapLibre GL JS (ESRI/OSM, 60 FPS, 3D, Overscaling) | ✅ **Completed** | 2026-11-04 |
| **Tahap 5** | Fitur Customer (Landing Page, `/explore`, Drawer, & Panggil Gerobak) | ✅ **Completed** | 2026-11-04 |
| **Tahap 6** | Fitur Merchant (Registrasi/Login UI, Dashboard, Sesi, Profil, Jadwal) | ✅ **Completed** | 2026-11-04 |
| **Tahap 7** | Fitur Admin (Simulasi Moderasi Merchant & Metrik) | ✅ **Completed** | 2026-11-04 |
| **Tahap 8** | Verifikasi, Responsivitas Mobile, Build & Laporan PRD Bab 14 | ✅ **Completed** | 2026-11-04 |
| **Fase 2** | Backend & Database (Supabase PostgreSQL, Prisma 7, RLS, Auth SSR, Actions) | ✅ **Completed** | 2026-11-04 |
| **Fase 3** | GPS & Integrasi Lokasi Aktual (Browser Geolocation, Heartbeat, Polling Peta, Telemetri) | ✅ **Completed** | 2026-11-04 |
| **Fase 4** | Stabilitas, Validasi, PWA & Persiapan Publik (Mobile Manifest, Viewport, E2E GPS) | 🚀 **In Progress** | — |

---

## 📝 Log Aktivitas (Riwayat Perubahan)

### 2026-11-04
1. **Audit PRD & Rencana Implementasi:**
   - Membaca dan menganalisis seluruh isi `prd.md` (1050 baris).
   - Menyusun dokumen rencana kerja komprehensif di [implementation-plan.md](file:///C:/Users/user/.gemini/antigravity/brain/08a05890-0038-4cae-a7b4-3095a484345d/implementation-plan.md).
   - Membuat `progress.md` untuk mencatat riwayat dan rencana tindak lanjut.
2. **Tahap 1 — Setup Stack Proyek:**
   - Inisialisasi Next.js 16 (App Router), TypeScript, Tailwind CSS v4, ESLint.
   - Pemasangan dependency utama: `maplibre-gl`, `lucide-react`, `clsx`, `tailwind-merge`.
3. **Tahap 2 — Design System & Token (*minimal-modern-design*):**
   - Konfigurasi token warna di `src/app/globals.css`: Primary Deep Green (`#15803d`), Neutral Surface, Accent Warm Amber (`#d97706`), dan status badge tokens.
   - Mengintegrasikan tipografi `Plus Jakarta Sans` via `next/font/google`.
   - Membuat komponen layout dasar: `Navbar` (dengan `Suspense`), `Footer` (dengan atribusi resmi OpenStreetMap & Esri), serta `StatusBadge` & `FreshnessBadge`.
4. **Tahap 3 — Domain Models & Mock Data Bandung Raya:**
   - Interface TypeScript: `Merchant`, `MerchantLocation`, `SellingSession`, `DaySchedule`, `CulinaryZone`, `LngLat`.
   - Mock data autentik UMKM Bandung: Cuanki Serayu, Batagor Kingsley, Tahu Gejrot Dipati Ukur, Es Cendol Elizabeth, Kue Balok Lengkong, Bandros Cisangkuy, Roti Bakar Dulatip, Cimol Bojot Cimahi.
   - GeoJSON zona kuliner binaan (Cisangkuy, Dipati Ukur, Lengkong Kecil).
   - Service layer: `merchantService` (filter multi-kriteria, kalkulasi freshness waktu deterministik) & `telemetrySimulator` (streaming koordinat GPS gerobak per detik).
5. **Tahap 4 — Integrasi WebGL MapLibre GL JS:**
   - Dynamic wrapper `MaplibreContainer` (`ssr: false`) dengan skeleton loader elegan.
   - Core canvas `MaplibreView` dengan GPU tile overscaling (mencegah error *"Map data not yet available"* pada skala 10m-100m).
   - 5 Basemap gratis bebas API key & tanpa watermark: ESRI Street, OSM HOT, ESRI Satelit, ESRI Dark Canvas, OSM Standard.
   - Marker animasi radar wave (`radar-ping`), heading arrow rotasi, dan pembaruan GPU langsung via `marker.setLngLat()`.
   - Layer GeoJSON: riwayat rute breadcrumbs dan polygon sentra kuliner.
   - Kontrol peta: switch basemap, toggle 3D (pitch 45°), Follow Camera mode, dan console `TelemetryFeed`.
6. **Tahap 5 — Modul Customer:**
   - Landing Page (`/`): Hero headline, 3 langkah cara kerja, grid lapak unggulan, dan banner ajakan pedagang.
   - Halaman Eksplorasi (`/explore`): Desktop 2 kolom (Sidebar filter + Peta WebGL), Mobile view switcher floating (Peta vs Daftar).
   - `VendorSidebar`: pencarian real-time, chips kategori, dropdown wilayah, filter status berjualan & toggle pedagang aktif.
   - `VendorDetailDrawer`: info telemetri lengkap, menu & harga, tombol WhatsApp, petunjuk arah navigasi, dan profil.
   - `CallVendorModal`: modal pemanggilan gerobak dengan estimasi ETA dinamis dan rute garis putus-putus ke titik penjemputan.
   - Halaman Detail Pedagang (`/merchant/[slug]`): profil penuh, jadwal operasional, mini peta, dan daftar produk.
7. **Tahap 6 — Modul Merchant:**
   - Halaman login demo (`/merchant/login`) & registrasi (`/merchant/register`).
   - Dashboard Merchant (`/merchant/dashboard`): kontrol sesi berjualan (`Mulai Berjualan`, `Jeda`, `Lanjutkan`, `Akhiri Sesi` dengan modal konfirmasi).
   - Halaman Kelola Profil (`/merchant/profile`): edit data usaha, emoji, kontak, rute keliling dengan feedback lokal.
   - Halaman Kelola Jadwal (`/merchant/schedule`): sakelar hari operasional (Senin-Minggu) dan input jam buka/tutup.
8. **Tahap 7 — Modul Admin:**
   - Dashboard Admin (`/admin/dashboard`): ringkasan metrik statistik (Total Merchant, Sedang Berjualan, Terverifikasi, Menunggu Verifikasi), pencarian, tabel moderasi dengan aksi verifikasi akun dan toggle aktif/nonaktif.
9. **Tahap 8 — Pengujian & Build:**
   - Verifikasi TypeScript (`npx tsc --noEmit`): **0 Error**.
   - Verifikasi ESLint (`npm run lint`): **0 Error**.
   - Verifikasi Produksi (`npm run build`): **100% Berhasil**, 22 rute berhasil digenerate statis/prerendered.

### 2026-11-04 (Sesi 2 — Perbaikan Map UI)
10. **Instalasi shadcn/ui (v4, Base UI + Nova preset):**
    - `npx shadcn@latest init` → memilih Base UI + Nova (Lucide icons).
    - Dependensi baru: `@base-ui/react`, `class-variance-authority`, `cn`, `tw-animate-css`.
    - `src/components/ui/button.tsx` di-generate otomatis.
    - `src/lib/utils.ts` di-update: `export { cn } from "cn"`.
    - Token shadcn di `globals.css` di-override dengan palet JejakLapak (Deep Green primary, Warm Orange accent).

11. **Perbaikan Bug Basemap Switch (`MaplibreView.tsx`):**
    - **Root cause:** `map.setStyle()` menghapus semua GeoJSON sources/layers. Fungsi `addGeoJsonLayers()` yang bisa dipakai ulang di-extract.
    - **Fix:** Listener `map.once('style.load', onStyleLoad)` dipasang **sebelum** `setStyle()` agar tidak terlewat; lalu `addGeoJsonLayers(map)` dipanggil ulang di dalam callback.
    - Basemap style tidak lagi menyertakan GeoJSON (hanya raster tiles); GeoJSON di-add manual via `addGeoJsonLayers()`.
    - Ref sync (`culinaryZonesRef`, `selectedMerchantIdRef`, dll) dipindah ke `useEffect` untuk menghindari pelanggaran `react-hooks/refs`.

12. **Perbaikan & Redesign `MapControls.tsx`:**
    - Dua layout terpisah: **Desktop** (kolom vertikal `top-3 right-3`, semua label terlihat) dan **Mobile** (baris horizontal `bottom-14`, ikon + label pendek).
    - Tombol Basemap menggunakan dropdown custom dengan ikon `Check` untuk state aktif.
    - Tombol "Lokasi Saya" kini punya state `isLocating` (ikon pulse + teks "Mencari...") saat GPS sedang dicari.
    - Semua tombol punya ukuran sentuh ≥ 36px dan `transition-colors`.

13. **Perbaikan GPS (`explore/page.tsx`):**
    - Tambah state `isLocating` yang di-set `true` saat GPS request dimulai dan `false` saat selesai.
    - Kini `MaplibreView` otomatis `flyTo` user location saat marker user di-mount.

14. **Verifikasi Akhir Sesi 2:**
    - `npx tsc --noEmit`: **0 Error**.
    - `npm run lint`: **0 Error, 0 Warning**.
    - `npm run build`: **100% Berhasil**, 22 rute.

### 2026-11-04 (Sesi 3 — Fase 2: Backend, Database, & Auth)
15. **Instalasi Paket Backend & Database:**
    - Prisma 7 (`@prisma/client`, `prisma`, `@prisma/adapter-pg`, `pg`, `@types/pg`, `dotenv`).
    - Supabase Auth SSR (`@supabase/supabase-js`, `@supabase/ssr`).
    - Validasi & utilitas (`zod`, `server-only`).
16. **Konfigurasi Lingkungan & Prisma 7:**
    - `.env.example` & `.env.local` dikonfigurasi untuk connection pooling Supabase (Transaction Pooler `DATABASE_URL` port 6543, Session Pooler `DIRECT_URL` port 5432).
    - `prisma.config.ts` root dengan `defineConfig` memuat env untuk migrasi CLI.
    - `prisma/schema.prisma` mencakup 6 model utama sesuai PRD Bab 7: `User`, `Merchant`, `MerchantSchedule`, `SellingSession`, `MerchantLocation`, `MenuItem` + 3 Enums (`UserRole`, `VerificationStatus`, `SessionStatus`).
    - Client generator berhasil di-compile ke `src/generated/prisma`.
    - `src/lib/prisma.ts` runtime singleton dengan adapter `PrismaPg`.
17. **Supabase Auth SSR & Next.js 16 Proxy:**
    - `src/lib/supabase/client.ts` (browser) & `server.ts` (SSR cookie-based).
    - `src/lib/supabase/proxy.ts` & `src/proxy.ts` (pengganti `middleware.ts` sesuai standar Next.js 16).
    - `src/server/auth.ts`: helper `requireUser()` dan `getCurrentUser()` dibungkus `cache()` React dengan fallback demo yang aman.
18. **Skrip Migrasi SQL & Keamanan Row Level Security (RLS):**
    - `prisma/migrations/0_init_supabase_rls.sql` siap dijalankan di Supabase SQL Editor.
    - Mengaktifkan RLS pada seluruh tabel di schema `public`.
    - Kebijakan RLS terpisah untuk pembeli (SELECT publik) dan pedagang (CRUD khusus data milik `auth.uid() = owner_id`).
    - Database trigger `on_auth_user_created` otomatis menyinkronkan user baru dari `auth.users` ke `public.users`.
19. **Data Access Layer & Server Actions:**
    - `src/schemas/`: Zod shared schemas untuk auth, merchant profile, schedule, dan location.
    - `src/server/merchants.ts`: Data Access Layer dengan graceful fallback ke dataset mock jika koneksi database offline/belum diisi URL live.
    - `src/actions/auth.ts`: Server Actions `loginAction`, `registerMerchantAction`, `logoutAction`.
    - `src/actions/merchant.ts`: Server Actions `updateMerchantProfileAction`, `updateMerchantSchedulesAction`, `toggleSellingSessionAction`.
    - `src/actions/location.ts`: Server Action `reportMerchantLocationAction`.
    - `src/app/api/merchants/`: REST API endpoints publik untuk list merchant, detail, dan update koordinat lokasi.
20. **Integrasi Form UI:**
    - Halaman login (`/merchant/login`) & registrasi (`/merchant/register`) menggunakan `useActionState` terhubung ke Server Action.
    - Halaman profil (`/merchant/profile`), jadwal (`/merchant/schedule`), dan dashboard (`/merchant/dashboard`) memanggil Server Action dan merefresh cache Next.js (`revalidatePath`).
22. **Verifikasi Supabase Auth Live Client:**
    - Kredensial `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` di `.env.local` terverifikasi valid & terhubung langsung ke API Supabase.
    - Uji coba `supabase.from('merchants').select(...)` via anon role: **Sukses mengambil data live dari Supabase**.
    - Akun demo pedagang (`budi.pedagang@gmail.com`) telah terdaftar dan terkonfirmasi di `auth.users`, terhubung ke pedagang Cuanki Serayu.
    - `signInWithPassword` terverifikasi sukses mendapatkan session JWT token langsung dari Supabase.
    - `npx tsc --noEmit` & `npm run build`: **0 Error, 23/23 routes lolos kompilasi**.

### 2026-11-04 (Sesi 4 — Fase 3: GPS & Integrasi Pelacakan Lokasi Aktual)
23. **Hook Pelacak GPS Perangkat (`useMerchantLocationTracker`):**
    - Mengintegrasikan `navigator.geolocation.watchPosition` dengan opsi presisi tinggi (`enableHighAccuracy: true`).
    - Algoritma pemfilteran pergerakan menggunakan rumus Haversine: transmisi koordinat hanya dikirim jika berpindah ≥ 5 meter atau mencapai interval heartbeat 15 detik (menghemat bandwidth dan baterai).
    - Menghitung kecepatan (`speed`), orientasi (`heading`), dan batas toleransi akurasi perangkat.
    - Fallback titik koordinat manual (`setManualCoords`) jika GPS ditolak oleh pengguna atau perangkat tidak memiliki sensor GPS.
24. **Sinkronisasi Dashboard Pedagang (`/merchant/dashboard`):**
    - Radar badge berkedip (*GPS Live*) saat sesi pedagang berstatus `ACTIVE`.
    - Metrik GPS presisi waktu nyata: koordinat, akurasi radius (±m), kecepatan (km/h), dan arah mata angin (°).
    - Tombol transmisi instan *"Pancarkan Sinyal Sekarang"* untuk mengirim update titik manual ke Supabase.
    - Modal pemilih titik manual dengan tombol pintasan lokasi populer Bandung (Taman Lansia, Dipati Ukur, Lengkong Kecil).
    - Banner edukasi kepatuhan privasi (PRD Bab 6.9: tidak melacak saat tab ditutup).
25. **Pembaruan Data Access Layer & Prisma Supabase:**
    - Fungsi `getPublicMerchants()` kini mengambil riwayat lokasi terbaru (15 titik terakhir) untuk merender breadcrumbs rute gerobak asli di peta.
    - Resolusi UUID otomatis (`resolveMerchantId`) memetakan ID mock maupun UUID database secara aman tanpa error PostgreSQL.
    - Pemetaan emoji ikon dinamis per kategori kuliner Bandung (`categoryEmojiMap`).
26. **Peta Pelanggan Real-Time (`/explore`):**
    - Auto-polling background setiap 8 detik mengambil status dan koordinat terbaru dari `/api/merchants` saat tidak dalam mode simulasi.
    - Peta WebGL memperbarui posisi pin pedagang pada 60 FPS menggunakan GPU `marker.setLngLat()` tanpa me-remount marker atau canvas.
    - Komponen `TelemetryFeed` menampilkan badge status sumber data (*GPS Supabase Live* vs *Simulasi Demo*) dan waktu sinkronisasi terakhir.
27. **PWA Mobile-First & Pengalaman Pengguna (Fase 4 Awal):**
    - Pembuatan metadata Web App Manifest (`src/app/manifest.ts`) untuk instalasi langsung di layar beranda ponsel (PWA).
    - Konfigurasi `viewport` (skala adaptif & tema warna `#15803d`) di `src/app/layout.tsx`.
28. **Verifikasi End-to-End Database & Build:**
    - Pengujian langsung penyimpanan koordinat GPS gerobak ke tabel `merchant_locations` di Supabase PostgreSQL: **Berhasil terverifikasi**.
    - TypeScript compilation (`npx tsc --noEmit`): **0 Error**.
    - ESLint analysis (`npm run lint`): **0 Error, 0 Warning**.
    - Next.js Production Build (`npm run build`): **100% Berhasil, 24 rute teroptimasi**.
29. **Perbaikan Bug Web Worker MapLibre & Hydration Mismatch:**
    - **Worker failed to load:** Di Next.js Turbopack, MapLibre GL JS v6 mencari worker script di relative chunk URL yang mengembalikan 404. Solusi: menyalin `maplibre-gl-worker.mjs` ke folder `public/`, mengatur `maplibregl.config.WORKER_URL = "/maplibre-gl-worker.mjs"`, dan menambahkan skrip `postinstall` di `package.json`.
    - **Hydration Mismatch `<html>` (Browser Extension):** Ekstensi dark mode browser (Dark Reader) menyuntikkan inline style `--dm-k` ke tag `<html>` sebelum React selesai hidrasi. Solusi: menambahkan `suppressHydrationWarning` pada tag `<html>` di `src/app/layout.tsx`.
    - **Hydration Mismatch `FreshnessBadge`:** Perbedaan penghitungan waktu `Date.now()` dinamis antara SSR dan client hydration. Solusi: mengintegrasikan hook React 19 `useSyncExternalStore` (`timeStore`) yang menjamin snapshot identik (`MOCK_BASE_TIMESTAMP`) saat server SSR dan initial client hydration, lalu secara reaktif memperbarui waktu aktual `Date.now()` setiap 30 detik setelah mount tanpa melanggar `react-hooks/purity`.

### 2026-11-05 (Sesi 5 — Redesign Eksplorasi Peta Berbasis Google Stitch MCP)
30. **Eksplorasi Peta UMKM — JejakLapak (Multi-Sidebar):**
    - Mengambil desain dan kode referensi dari proyek Stitch MCP `Minimal Blue UI Design` (Screen ID: `8f7e22142ffa4c07a1bdeaa7380e12c3`).
    - Mengimplementasikan tata letak **Desktop 3-Column Exploration Viewport Layout**:
      1. **Kolom 1 (Sidebar Kiri - `VendorSidebar`):**
         - Pulse dot cyan dan label tracking `"KORIDOR PANTAU GPS"` + pill badge `"X Lapak Aktif"`.
         - Area aktif dinamis (`Dipati Ukur & Dago` / wilayah filter) + subtitle (`Bandung Wetan / Kota Bandung`).
         - Input pencarian real-time dengan tombol toggle filter tambahan (`SlidersHorizontal`).
         - Pills kategori horizontal (`Semua`, `Makanan Berat`, `Camilan`, `Minuman Segar`, `Jajanan Tradisional`).
         - Footer sidebar telemetri (`GPS Receiver Online • 4G LTE`) dan tombol *"Segarkan Peta"*.
      2. **Kolom 2 (Center Map Canvas & HUD - `MaplibreView` & `MapControls`):**
         - WebGL MapLibre canvas full-viewport tanpa border framing kaku.
         - Top Floating HUD: Telemetry pill (`Radius: 1.5 Km`, `Latensi: 0.4 dtk`), basemap switchers (`OSM Street`, `Satelit ESRI`, `Macet / Traffic`), dan tombol *"Posisi Saya"*.
         - Bottom Floating HUD: Map legend status (`● Gerak`, `● Ngetem`, `● Standby`) + skala peta (`1:5.000`), tombol zoom vertikal `+` / `−`, toggle 3D pitch 45°, serta kontrol mini simulasi GPS.
         - Marker interaktif: Efek radar wave ping (`#79d8fd`), heading arrow rotasi dinamis, dan floating attached quick callout card saat marker terpilih dengan status live, sisa porsi, alamat, serta tombol *"Detail"*.
      3. **Kolom 3 (Sidebar Kanan Detail Lapak - `VendorDetailSidebar`):**
         - Komponen terintegrasi di desktop dengan tombol tutup (`X`), status live badge (`LIVE BERGERAK` / `LIVE MANGKAL`), dan badge *"Terverifikasi"*.
         - Hero cover photo dengan gradient overlay dan badge kategori UMKM.
         - Nama pedagang, tagline, indikator jarak presisi (`120m Dari Anda`), dan kecepatan dorong gerobak (`km/j`).
         - Kartu telemetri lokasi dengan alamat dan kode tracker `#BDG-XXX`.
         - 3 Bento metrics: Porsi Siap Saji, Rating & Ulasan (4.8 ★), serta estimasi rentang harga ramah kantong.
         - 3 Tombol aksi cepat: *"Arahkan"* (Google Maps navigation), *"Panggil"* (membuka modal panggil gerobak), dan *"WhatsApp"* (chat pedagang).
         - Daftar Menu Favorit dengan stok porsi tersisa.
         - Briefing rutinitas & jadwal operasional harian.
         - Sticky footer CTA ke profil lengkap pedagang (`/merchant/[slug]`).
    - **Responsivitas Mobile:**
      - Floating view switcher di bagian bawah (`Peta WebGL` vs `Daftar Lapak`).
      - Bottom sheet drawer (`VendorDetailDrawer`) yang mengonsumsi `VendorDetailContent` yang sama sehingga pengalaman pengguna mobile dan desktop konsisten dan bebas duplikasi logika.
31. **Verifikasi Kualitas:**
    - `npx tsc --noEmit`: **0 Error**.
    - `npm run lint`: **0 Error, 0 Warning**.
    - `npm run build`: Kompilasi produksi berjalan optimal.
32. **Perbaikan Tampilan Peta, Lock Viewport & Integrasi Shadcn UI Sheet/Drawer:**
    - **Perbaikan Map Blank / Grey:**
      - Menggunakan fungsi resmi `setWorkerUrl("/maplibre-gl-worker.mjs")` dari MapLibre GL JS untuk memuat Web Worker secara reliabel di Next.js Turbopack.
      - Mengaktifkan `ResizeObserver` pada `mapContainerRef` dan memicu `map.resize()` saat inisialisasi maupun `style.load` agar GPU canvas segera mengkalkulasi dimensi piksel akurat.
      - Menyelaraskan seluruh tile URL basemap (`esri-street`, `osm-standard`, `esri-satellite`, `esri-dark`) ke server resmi dengan latensi rendah (<100ms) dan status 200 OK.
      - Memastikan kontainer peta menggunakan `absolute inset-0 w-full h-full` di dalam relative container.
    - **Pencegahan Scroll Halaman Peta:**
      - Mengondisikan komponen `<Footer />` agar tidak dirender pada rute `/explore`.
      - Mengunci viewport halaman eksplorasi dengan `h-[calc(100vh-64px)] overflow-hidden`.
      - Memastikan hanya daftar lapak (`VendorSidebar`) dan panel detail pedagang yang memiliki internal scrolling (`overflow-y-auto`). Peta tetap diam dan interaktif.
    - **Integrasi Shadcn UI Sheet & Drawer:**
      - Memasang komponen resmi shadcn UI (`@/components/ui/sheet` dan `@/components/ui/drawer`).
33. **In-Flow Sidebars Buka-Tutup, Tombol Batal Tooltip Marker & Dropdown Basemap:**
    - **Sidebar Kiri & Kanan In-Flow (Tanpa Backdrop / Blur):**
      - Mengubah arsitektur sidebar detail pedagang menjadi *in-flow panel* di sebelah kanan kanvas peta tanpa backdrop blur / modal overlay.
      - Sidebar kiri (`VendorSidebar`) dan sidebar kanan (`VendorDetailContent`) kini masing-masing dapat dibuka dan ditutup (*collapsible*).
      - Menambahkan tombol tutup panel kiri pada header sidebar, serta tombol terapung *"Daftar Lapak"* di kanvas peta untuk membuka kembali sidebar saat ditutup.
      - Peta WebGL otomatis menyesuaikan lebar (*auto-resize via ResizeObserver*) saat panel dibuka/ditutup tanpa remount.
    - **Tombol '✕' pada Tooltip Marker (Batal Pilih):**
      - Menambahkan tombol '✕' pada baris header tooltip callout marker aktif di peta.
      - Mengklik tombol ini otomatis melepaskan pilihan pedagang (`selectedMerchantId = null`), menutup panel samping kanan, dan mematikan mode kunci kamera (*follow camera = false*).
    - **Dropdown Pilihan Peta (Satu Tombol Saja):**
      - Merampingkan kontrol basemap di HUD atas-kanan: kini hanya menampilkan 1 tombol aktif dengan nama peta terpilih dan ikon layers/chevron.
      - Seluruh varian peta (ESRI Street, OSM Street, Satelit ESRI, ESRI Dark Canvas) dapat diakses melalui menu dropdown vertikal yang rapi.
    - **Kerapian ID Tracker:** Format kode tracker disederhanakan menjadi `BDG-XXXX` yang rapi tanpa deretan angka nol panjang.

### 2026-11-06 (Sesi 6 — Implementasi Auth Berbasis Role / RBAC Supabase SSR)
34. **Data Access Layer & Server Auth Guards (`src/server/auth.ts`):**
    - Interface `AuthUser` diperluas dengan role (`CUSTOMER`, `MERCHANT`, `ADMIN`) serta data identitas lapak (`merchantId`, `merchantSlug`, `merchantName`).
    - `getCurrentUser()` dibungkus `cache()` React, mengambil session via `supabase.auth.getUser()`, dan memperkaya data dengan profil database Prisma (`public.users` & `public.merchants`).
    - Helper guard server: `requireUser(allowedRoles?)`, `requireMerchant()`, `requireAdmin()` untuk proteksi Server Components & Server Actions.
35. **Server Actions Terintegrasi Role (`src/actions/auth.ts`):**
    - `loginAction`: Memverifikasi email/password via Supabase Auth SSR, mendeteksi role pengguna dari database, dan mengembalikan `redirectTo` yang sesuai (`/admin/dashboard` untuk Admin, `/merchant/dashboard` untuk Pedagang).
    - `registerMerchantAction`: Mendaftarkan akun pedagang ke Supabase Auth (`auth.users`), menyinkronkan data profil ke `public.users` dengan role `MERCHANT`, serta otomatis membuat entri `Merchant` baru lengkap dengan 7 hari jadwal operasional mingguan bawaan.
    - `logoutAction`: Memanggil `supabase.auth.signOut()` dan membersihkan cache layout Next.js.
36. **Proteksi Rute di Next.js 16 Proxy (`src/lib/supabase/proxy.ts`):**
    - Menjaga rute pedagang (`/merchant/dashboard`, `/merchant/profile`, `/merchant/schedule`) agar redirect ke `/merchant/login?redirect=...` jika belum login.
    - Menjaga rute admin (`/admin/*`) hanya bisa diakses role `ADMIN`.
    - Mencegah pengguna yang sudah login membuka kembali halaman login/register (otomatis dialihkan ke dashboard masing-masing).
37. **Navbar Interaktif & Endpoint Sesi (`/api/auth/me`):**
    - Membuat Route Handler `/api/auth/me` untuk membaca user terautentikasi.
    - Memperbarui `Navbar.tsx` dengan langganan event `supabase.auth.onAuthStateChange` sehingga status login dan logout terupdate secara instan tanpa reload penuh.
    - Menampilkan indikator nama pedagang/admin, badge role, menu navigasi spesifik per role, dan tombol logout.
38. **Migrasi Halaman Terproteksi ke Partial Prerendering (PPR):**
    - Memisahkan `/admin/dashboard`, `/merchant/dashboard`, `/merchant/profile`, dan `/merchant/schedule` menjadi Server Component wrapper (`requireMerchant`/`requireAdmin`) dengan `<Suspense>` boundary dan `export const instant = false;` sesuai panduan resmi Next.js 16 Component Caching.

---

## 🎯 Fokus Saat Ini (Current Task)
- **Auth Berbasis Role (RBAC)**: ✅ **Selesai dan terverifikasi penuh** (0 error TypeScript, 0 warning ESLint, 25/25 halaman lolos Next.js build).

## ⏭️ Langkah Berikutnya (Next Task)
- **CRUD Lengkap untuk Penjual (Merchant Management)**:
  1. **CRUD Menu & Produk Lapak:** Tambah menu baru, ubah harga, atur stok porsi siap saji, dan hapus menu makanan/minuman.
  2. **Integrasi Form Profil Usaha:** Simpan perubahan profil, foto, kategori, dan deskripsi langsung ke data merchant terautentikasi.
  3. **Integrasi Jadwal Operasional:** Simpan pengaturan sakelar hari dan jam buka/tutup ke PostgreSQL.
  4. **Kontrol Sesi & GPS:** Sinkronisasi sesi jualan dan koordinat GPS perangkat langsung ke tabel `merchant_locations`.
