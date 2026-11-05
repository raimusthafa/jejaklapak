# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# JejakLapak — v1.0

**Versi:** 1.0  
**Tanggal:** 3 November 2026  
**Status:** Final — Baseline Pengembangan  
**Platform:** Responsive Web Application  
**Wilayah Operasional:** Bandung Raya  
**Tahap Pengembangan Saat Ini:** Frontend Development

---

# 1. Ringkasan Produk

## 1.1 Deskripsi Produk

**JejakLapak** adalah platform berbasis web yang membantu masyarakat menemukan dan memantau keberadaan UMKM keliling, seperti pedagang kaki lima, pedagang gerobak, pedagang makanan keliling, dan penjual yang berpindah-pindah lokasi.

Berbeda dengan marketplace konvensional yang berfokus pada transaksi online dan toko permanen, JejakLapak berfokus pada informasi keberadaan pedagang secara geografis, jadwal operasional, serta status aktivitas berjualan.

Melalui JejakLapak, pelanggan dapat melihat pedagang yang sedang berjualan di sekitar wilayahnya, mengetahui lokasi terakhir, melihat jadwal operasional, dan mengunjungi pedagang secara langsung.

Pedagang dapat mengelola profil usahanya, mengatur jadwal, serta membagikan lokasi ketika sedang berjualan.

## 1.2 Permasalahan yang Ingin Diselesaikan

Banyak UMKM keliling memiliki pelanggan potensial, tetapi sulit ditemukan karena lokasi berjualan tidak selalu tetap.

Beberapa permasalahan utama:

1. Pelanggan kesulitan mengetahui lokasi pedagang keliling.
2. Pelanggan tidak mengetahui apakah pedagang sedang berjualan atau sudah berpindah lokasi.
3. Informasi jadwal operasional pedagang sering kali tidak tersedia.
4. Pedagang kesulitan memberi tahu pelanggan mengenai lokasi berjualan hari ini.
5. Informasi keberadaan pedagang masih tersebar melalui komunikasi langsung atau media sosial.

JejakLapak berusaha mengatasi permasalahan tersebut melalui satu platform pencarian UMKM keliling berbasis peta.

## 1.3 Tujuan Produk

Tujuan utama JejakLapak v1.0:

- Membantu pelanggan menemukan pedagang keliling berdasarkan lokasi.
- Memudahkan pelanggan mengetahui status berjualan pedagang.
- Menyediakan informasi lokasi terakhir yang transparan dan memiliki timestamp.
- Memudahkan pedagang membagikan lokasi berjualan.
- Menyediakan informasi profil dan jadwal operasional pedagang.
- Memvalidasi konsep produk melalui implementasi awal di Bandung Raya.

## 1.4 Nilai Utama Produk

**Know where they sell, know when they're there.**

JejakLapak bukan sekadar direktori UMKM. Nilai utamanya adalah menghubungkan informasi usaha dengan keberadaan pedagang secara geografis dan berdasarkan waktu.

---

# 2. Target Pengguna

JejakLapak memiliki tiga jenis pengguna utama.

## 2.1 Customer / Pelanggan

Pengguna yang ingin menemukan pedagang keliling.

Kebutuhan:
- Melihat pedagang di sekitar wilayahnya.
- Mencari pedagang berdasarkan nama atau kategori.
- Mengetahui status berjualan.
- Melihat informasi lokasi terakhir.
- Mengetahui jadwal operasional.
- Melihat informasi profil pedagang.
- Membuka navigasi menuju lokasi pedagang.

Pelanggan tidak wajib membuat akun untuk menggunakan fitur pencarian pada v1.0.

## 2.2 Merchant / Pedagang

Pengguna yang mendaftarkan usaha dan membagikan informasi keberadaan tempat berjualan.

Kebutuhan:
- Membuat akun dan profil usaha.
- Mengatur informasi usaha.
- Mengatur jadwal berjualan.
- Memulai sesi berjualan.
- Menjeda dan melanjutkan sesi berjualan.
- Mengakhiri sesi berjualan.
- Membagikan lokasi melalui GPS perangkat.

## 2.3 Admin

Pengguna yang memiliki tanggung jawab mengelola platform.

Kebutuhan:
- Melihat daftar pedagang.
- Melihat informasi pedagang.
- Memantau status akun.
- Memverifikasi atau menonaktifkan pedagang.

Pada tahap frontend, halaman admin hanya berupa simulasi UI menggunakan mock data.

---

# 3. Cakupan Wilayah Operasional

## 3.1 Wilayah v1.0

JejakLapak v1.0 berfokus pada **Bandung Raya**.

Cakupan operasional yang menjadi acuan:
- Kota Bandung.
- Kota Cimahi.
- Kabupaten Bandung.
- Kabupaten Bandung Barat.
- Wilayah Kabupaten Sumedang yang termasuk dalam cakupan geografis Bandung Raya yang ditetapkan oleh tim.

Batas geografis akhir harus direpresentasikan menggunakan polygon GeoJSON yang dapat diperbarui.

Jangan menggunakan lingkaran atau bounding box perkiraan sebagai satu-satunya validasi wilayah operasional.

## 3.2 Persyaratan Wilayah

- Peta awal berpusat pada Bandung Raya.
- Daftar pedagang hanya menampilkan data yang berada dalam wilayah operasional.
- Koordinat pedagang di luar wilayah tidak boleh diterima sebagai lokasi operasional yang valid.
- Filter wilayah dapat digunakan untuk mempersempit pencarian.
- Konfigurasi batas wilayah harus terpusat dan mudah diperbarui.
- Jangan menanamkan koordinat batas wilayah secara berulang di berbagai komponen.

Pada frontend, gunakan konfigurasi GeoJSON sementara. Validasi sisi server akan diterapkan pada tahap backend.

---

# 4. Teknologi dan Arsitektur

## 4.1 Frontend Stack

Teknologi utama:

| Kebutuhan | Teknologi |
|---|---|
| Framework | Next.js |
| Routing | Next.js App Router |
| Bahasa | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Icons | lucide-react |
| Map Library | MapLibre GL JS (`maplibre-gl`) |
| Rendering Engine | WebGL Hardware GPU Acceleration (60 FPS) |
| React Integration | Next.js Client Component (`dynamic` import `ssr: false`) |
| Map Tiles / Provider | Multi-Basemap Bebas API Key (ESRI & OpenStreetMap) |
| Marker & Layer System | Custom HTML Animated Markers + Dynamic GeoJSON Layers |
| Mock Data | Local typed data / mock real-time GPS telemetry stream |

Gunakan versi package yang kompatibel dengan versi Next.js dan React yang sudah terpasang di project. Jangan melakukan downgrade atau upgrade major dependency tanpa alasan teknis.

## 4.2 Map Technology

Teknologi peta yang digunakan secara resmi pada JejakLapak adalah:

**MapLibre GL JS + Multi-Basemap Bebas API Key (ESRI & OpenStreetMap).**

Keputusan ini diambil setelah evaluasi dan pengujian mendalam terhadap sistem pelacakan gerobak UMKM yang berpindah-pindah (*real-time tracking*):

1. **Rendering Hardware WebGL (GPU) 60 FPS:**
   Pergerakan gerobak pedagang keliling membutuhkan pembaruan koordinat marker dan lintasan rute secara dinamis setiap beberapa detik. Library berbasis manipulasi DOM murni (seperti Leaflet) mengalami degradasi performa (*stuttering/lag*) saat jumlah marker bertambah atau rute diperpanjang. MapLibre memproses render langsung pada GPU browser pengguna, sehingga animasi perpindahan gerobak dan manipulasi layer GeoJSON berjalan mulus tanpa lag.
2. **Bebas Biaya Lisensi & Bebas API Key (Rp 0 / Selamanya):**
   - Menghindari Google Maps JavaScript API yang menarik biaya mahal ($7.00 per 1.000 load setelah kuota gratis).
   - Menghindari penyedia tile komersial seperti CARTO yang mewajibkan API Key dan menyematkan watermark *"API KEY REQUIRED"* pada peta jika diakses tanpa autentikasi.
   - Menggunakan kombinasi **ESRI** dan **OpenStreetMap** yang 100% gratis, tanpa perlu pendaftaran token/API key, dan bebas watermark.
3. **Perspektif 3D & Rotasi Kamera Bebas:**
   Mendukung sudut kamera miring (*pitch 0° - 60°*) dan rotasi bebas (*bearing 360°*) yang dapat mengikuti arah hadap gerobak.
4. **Tile GPU Overscaling (Solusi Zoom Dekat 10m & 100m):**
   Server raster tile publik memiliki batas kedalaman ubin (*native zoom level*). Tanpa konfigurasi batas zoom pada level source, MapLibre akan terus meminta ubin ke server hingga level 22 dan menyebabkan server ESRI mengembalikan gambar abu-abu bertuliskan *"Map data not yet available"*.
   Dengan menyetel parameter `maxzoom` pada definisi sumber ubin (`sources['basemap-tiles'].maxzoom`):
   - Ketika pengguna memperbesar peta melewati level zoom asli server, engine WebGL MapLibre otomatis melakukan **GPU texture overscaling** dari ubin terakhir.
   - Tulisan abu-abu *"Map data not yet available"* tidak akan pernah muncul, dan peta tetap utuh serta tajam.

### Komponen & Layer Peta Utama:

- **Instance Peta WebGL:** Menggunakan `new MapLibreMap({...})` dengan kontrol navigasi 3D (Pitch, Compass, Zoom) dan Scale bar metrik.
- **Marker Gerobak Interaktif:** Elemen HTML kustom dengan animasi gelombang radar (*pulsing wave*), ikon emoji kategori makanan, badge warna status, dan rotasi arah hadap (*heading*).
- **GeoJSON Source & Layer Jejak Riwayat (`routes-line`):** Menampilkan garis lintasan yang telah dilalui gerobak hari ini (*breadcrumbs*) menggunakan LineString layer yang dirender di GPU.
- **GeoJSON Source & Layer Zona Kuliner (`culinary-zones-fill` & `line`):** Visualisasi area binaan UMKM (misal Zona Hijau Kuliner Sabang dan Sentra Transit Gondangdia).
- **Marker Titik Pemanggil (`UserLocationMarker`):** Pin titik jemput pemesan saat memanggil gerobak mampir ke lokasi pembeli.

### Daftar Basemap Resmi yang Didukung (100% Gratis & No Key):

| ID | Nama Basemap | URL Pattern | Maxzoom Source | Keunggulan & Karakteristik |
|---|---|---|---|---|
| `esri-street` | **ESRI World Street Map** *(Default)* | `.../World_Street_Map/MapServer/tile/{z}/{y}/{x}` | 19 | Tampilan jalan modern, kontras tajam, paling menyerupai Google Maps. |
| `osm-hot` | **OpenStreetMap HOT (Humanitarian)** | `https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png` | 20 | Paling tajam di skala 10m: detail gang, lorong, nomor jalan, dan gedung terlihat jelas. |
| `esri-imagery` | **ESRI Satelit Foto Nyata** | `.../World_Imagery/MapServer/tile/{z}/{y}/{x}` | 19 | Foto udara resolusi tinggi asli dari luar angkasa (seperti Google Earth). |
| `esri-dark` | **ESRI Dark Canvas** | `.../Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}` | 16 | Mode malam monokrom bersih tanpa watermark untuk navigasi malam (auto overscale di zoom dekat). |
| `osm-standard` | **OpenStreetMap Standard** | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` | 19 | Peta resmi komunitas OSM sedunia. |

Persyaratan teknis:
- Seluruh URL tile wajib menggunakan protokol HTTPS.
- Wajib menampilkan attribution kredit penyedia peta (Esri / OpenStreetMap contributors).
- Jangan menerapkan Referrer-Policy yang memblokir HTTP Referer untuk server OSM.
- Konfigurasi basemap disimpan terpusat di `data/basemapStyles.ts` agar mudah diubah.

## 4.3 Integrasi MapLibre GL JS dengan Next.js

MapLibre GL JS membutuhkan objek browser global (`window`, `navigator`) dan konteks WebGL, sehingga tidak kompatibel dengan server-side rendering (SSR).

Persyaratan implementasi Next.js:
- Gunakan direktif `'use client'` pada komponen peta dan halaman terkait.
- Muat komponen peta menggunakan `next/dynamic` dengan opsi `{ ssr: false }`.
- Import stylesheet MapLibre `@import "maplibre-gl/dist/maplibre-gl.css";` pada `app/globals.css`.
- Pastikan container peta memiliki dimensi tinggi yang eksplisit (misal `w-full h-full`).
- **Optimalisasi Pergerakan Marker:** Saat koordinat gerobak berubah dari WebSocket/stream GPS, perbarui posisi marker menggunakan method `marker.setLngLat(newCoords)` secara langsung tanpa me-remount instance peta atau merender ulang seluruh komponen halaman.
- Cleanup instance peta dengan `map.remove()` pada callback return `useEffect`.

## 4.4 Backend Stack untuk Tahap Berikutnya

Backend bukan bagian dari implementasi frontend saat ini.

Stack yang direncanakan:
- Prisma ORM.
- Supabase PostgreSQL.
- Next.js atau backend API sesuai keputusan arsitektur tahap backend.

Frontend harus disiapkan agar mock service nantinya dapat diganti dengan API tanpa mengubah seluruh komponen UI.

---

# 5. Ruang Lingkup Fitur v1.0

Fitur dibagi menjadi tiga prioritas.

## P0 — Core Features

Fitur yang wajib tersedia pada versi awal:

1. Landing page.
2. Eksplorasi pedagang melalui peta.
3. Pencarian pedagang.
4. Filter pedagang.
5. Detail pedagang.
6. Registrasi dan login merchant (UI).
7. Dashboard merchant.
8. Pengelolaan profil merchant.
9. Pengelolaan jadwal operasional.
10. Simulasi sesi berjualan dan status lokasi.
11. Dashboard admin dasar (UI).

## P1 — Pengembangan Berikutnya

- Favorit pedagang.
- Katalog produk yang lebih lengkap.
- Rating dan ulasan.
- Notifikasi perubahan status.
- Riwayat aktivitas berjualan.
- Konfirmasi keberadaan pedagang oleh pelanggan.

## P2 — Pengembangan Lanjutan

- Notifikasi pedagang terdekat.
- Rekomendasi pedagang berdasarkan kebiasaan pengguna.
- Prediksi lokasi dan waktu berjualan.
- QR Code profil pedagang.
- Fitur analitik untuk pedagang.
- Fitur pengembangan wilayah operasional di luar Bandung Raya.

P1 dan P2 tidak perlu diimplementasikan saat ini.

---

# 6. Detail Kebutuhan Fungsional

## 6.1 Landing Page

Tujuan: memperkenalkan JejakLapak dan mengarahkan pengguna untuk menemukan pedagang.

Komponen:
- Navbar.
- Hero section.
- Headline utama yang menjelaskan fungsi JejakLapak.
- CTA "Jelajahi Pedagang".
- Bagian cara kerja JejakLapak.
- Bagian keunggulan platform.
- Preview pedagang pilihan.
- Footer.

Persyaratan:
- Desain responsive.
- CTA menuju halaman eksplorasi.
- Jangan menampilkan fitur yang belum tersedia sebagai fitur aktif.
- Tidak perlu memuat peta interaktif pada landing page.

## 6.2 Halaman Eksplorasi Pedagang

Route: `/explore`

Ini adalah fitur utama JejakLapak.

Layout desktop:
- Area peta sebagai konten utama.
- Daftar pedagang pada panel samping.
- Search dan filter di bagian atas.
- Kartu pedagang yang dapat dipilih.

Layout mobile:
- Tampilan peta dan daftar yang nyaman pada layar kecil.
- Sediakan toggle atau tab untuk berpindah antara tampilan peta dan daftar.
- Jangan memaksakan layout dua kolom yang terlalu sempit.

Fitur:
- Menampilkan peta Bandung Raya.
- Menampilkan marker dari mock data pedagang.
- Menampilkan popup ketika marker dipilih.
- Menampilkan informasi ringkas pada kartu pedagang.
- Klik kartu akan memilih marker terkait.
- Klik marker akan memilih kartu terkait.
- Search berdasarkan nama pedagang.
- Filter kategori.
- Filter status berjualan.
- Filter wilayah.
- Filter hanya pedagang yang sedang aktif.
- Tombol lokasi pengguna jika pengguna memberi izin GPS.

Peta harus memiliki loading state dan error state.

Jika tile gagal dimuat:
- Jangan menampilkan area kosong tanpa penjelasan.
- Tampilkan pesan bahwa peta sementara tidak tersedia.
- Tetap tampilkan daftar pedagang.
- Search dan filter daftar tetap berfungsi.

## 6.3 Pencarian dan Filter

Search dapat mencari:
- Nama pedagang.
- Nama usaha.
- Kategori usaha.

Filter:
- Kategori makanan/minuman atau kategori lain yang tersedia.
- Status berjualan.
- Wilayah administratif.
- Status kesegaran lokasi.

Pencarian pelanggan pada v1.0 dilakukan terhadap data pedagang di aplikasi, bukan melalui layanan autocomplete alamat publik.

Jangan menambahkan Nominatim autocomplete secara otomatis.

## 6.4 Detail Pedagang

Route: `/merchant/[slug]`

Informasi yang ditampilkan:
- Foto usaha atau foto pedagang.
- Nama usaha.
- Nama pedagang jika tersedia.
- Kategori usaha.
- Deskripsi.
- Status berjualan.
- Status kesegaran lokasi.
- Waktu terakhir lokasi diperbarui.
- Jadwal operasional.
- Wilayah operasional.
- Kontak pedagang.
- Lokasi pada peta.
- Tombol navigasi eksternal.

Informasi lokasi harus selalu menampilkan waktu pembaruan yang relevan.

Jangan menampilkan status "Live" jika data lokasi sudah kedaluwarsa.

## 6.5 Registrasi dan Login Merchant

Route:
- `/merchant/register`
- `/merchant/login`

Untuk fase frontend, buat UI registrasi dan login tanpa autentikasi backend nyata.

Form registrasi mencakup:
- Nama pemilik.
- Email.
- Nomor telepon.
- Password.
- Konfirmasi password.
- Nama usaha.
- Kategori usaha.
- Persetujuan syarat penggunaan.

Form login:
- Email.
- Password.
- Tombol login.
- Link ke registrasi.

Persyaratan:
- Validasi input dasar.
- Pesan error dan success.
- Password menggunakan input type password.
- Navigasi simulasi ke dashboard merchant setelah login demo.
- Jangan mengklaim akun sudah tersimpan di database.

## 6.6 Dashboard Merchant

Route: `/merchant/dashboard`

Tujuan: memberikan kendali kepada pedagang dalam mengelola aktivitas berjualan.

Komponen:
- Greeting atau informasi pedagang.
- Status aktivitas saat ini.
- Informasi lokasi terakhir.
- Ringkasan profil usaha.
- Jadwal hari ini.
- Tombol kontrol sesi berjualan.

Kontrol utama:

| Status | Aksi yang tersedia |
|---|---|
| Belum mulai | Mulai Berjualan |
| ACTIVE | Jeda |
| PAUSED | Lanjutkan |
| ENDED | Mulai Sesi Baru |

Ketentuan:
- Tampilkan konfirmasi sebelum mengakhiri sesi.
- Tampilkan feedback setelah aksi.
- Gunakan local UI state selama fase frontend.
- Tidak boleh mengklaim perubahan status sudah tersimpan permanen ke backend.

## 6.7 Pengelolaan Profil Merchant

Route: `/merchant/profile`

Field profil:
- Nama usaha.
- Nama pemilik.
- Deskripsi usaha.
- Kategori.
- Nomor telepon.
- Foto usaha.
- Alamat atau area usaha.
- Titik lokasi dasar bila dibutuhkan.
- Informasi kontak.
- Status profil.

Ketentuan:
- Form memiliki validation.
- Mendukung upload preview foto di frontend.
- Perubahan disimpan sementara melalui mock service atau local state.
- Struktur data disiapkan untuk integrasi database berikutnya.

## 6.8 Pengelolaan Jadwal

Route: `/merchant/schedule`

Pedagang dapat mengatur jadwal operasional mingguan.

Informasi:
- Hari operasional.
- Status buka atau libur.
- Waktu mulai.
- Waktu selesai.

Ketentuan:
- Pedagang dapat mengaktifkan atau menonaktifkan hari operasional.
- Validasi waktu mulai dan selesai.
- Sediakan tampilan jadwal mingguan.
- Tampilkan jadwal secara ringkas pada halaman detail pedagang.

Jadwal operasional adalah informasi rencana, bukan bukti bahwa pedagang benar-benar sedang berjualan.

## 6.9 Sesi Berjualan dan Lokasi Pedagang

Fitur ini merupakan salah satu nilai utama JejakLapak.

Status sesi:
- `ACTIVE`
- `PAUSED`
- `ENDED`

Alur:
1. Pedagang menekan "Mulai Berjualan".
2. Aplikasi meminta izin lokasi apabila belum diberikan.
3. Aplikasi mengambil koordinat perangkat.
4. Status sesi menjadi ACTIVE.
5. Lokasi dapat diperbarui selama halaman dan browser tetap aktif.
6. Pedagang dapat menjeda sesi.
7. Pedagang dapat melanjutkan sesi.
8. Pedagang dapat mengakhiri sesi.

Catatan penting:
- Browser Geolocation API membutuhkan izin pengguna.
- Pelacakan GPS melalui browser tidak boleh diklaim berjalan terus-menerus setelah tab ditutup atau browser dihentikan.
- Background tracking tidak dijamin oleh browser biasa.
- Jika izin lokasi ditolak, sediakan alternatif memilih titik lokasi secara manual pada peta.
- Pada fase frontend, lokasi aktual hanya boleh digunakan untuk demonstrasi lokal atas persetujuan pengguna.
- Jangan mengklaim lokasi demo telah tersimpan dan tersedia bagi pelanggan lain sebelum backend terintegrasi.

## 6.10 Kesegaran Lokasi

Status aktivitas pedagang dan kesegaran lokasi adalah dua hal berbeda.

Contoh:
- Pedagang dapat berstatus ACTIVE, tetapi lokasi terakhirnya sudah lama diperbarui.
- Pedagang dapat memiliki jadwal buka, tetapi belum tentu benar-benar sedang berjualan.

Gunakan field waktu `capturedAt` untuk menentukan kesegaran lokasi.

Default threshold yang dapat diatur melalui konfigurasi:

| Kondisi | Kriteria | Label |
|---|---|---|
| LIVE | Lokasi diperbarui maksimal 2 menit lalu | Lokasi terkini |
| RECENT | Lebih dari 2 menit sampai 15 menit | Baru diperbarui |
| STALE | Lebih dari 15 menit | Lokasi mungkin sudah berubah |

Aturan:
- Jangan menganggap status ACTIVE otomatis berarti lokasi LIVE.
- Tampilkan timestamp pembaruan lokasi.
- Jika lokasi STALE, berikan label peringatan.
- Lokasi lama tidak boleh disebut sebagai posisi pedagang saat ini.
- Lokasi yang sudah berakhir sesinya tidak boleh ditampilkan sebagai pedagang yang sedang live.
- Ambang waktu disimpan terpusat agar mudah disesuaikan.

Pada backend nantinya, timestamp lokasi harus berasal dari waktu pengambilan koordinat, bukan waktu ketika pelanggan membuka halaman.

## 6.11 Dashboard Admin

Route: `/admin/dashboard`

Untuk fase frontend, buat simulasi halaman admin sederhana.

Informasi:
- Total merchant.
- Merchant aktif.
- Merchant yang menunggu verifikasi.
- Daftar merchant.
- Status akun.
- Aksi verifikasi.
- Aksi menonaktifkan merchant.

Semua data masih mock data.

Jangan membuat autentikasi admin atau otorisasi backend nyata pada fase frontend.

---

# 7. Struktur Data dan Domain Model

Frontend harus menggunakan TypeScript types yang terstruktur.

Model konseptual untuk integrasi backend mendatang:

## 7.1 User

- id
- name
- email
- phone
- passwordHash (backend saja)
- role: CUSTOMER / MERCHANT / ADMIN
- createdAt
- updatedAt

## 7.2 Merchant

- id
- ownerId
- name
- slug
- description
- category
- image
- phone
- address
- district
- city
- operatingArea
- verificationStatus
- createdAt
- updatedAt

## 7.3 MerchantSchedule

- id
- merchantId
- dayOfWeek
- isOpen
- startTime
- endTime

## 7.4 SellingSession

- id
- merchantId
- status: ACTIVE / PAUSED / ENDED
- startedAt
- pausedAt
- endedAt
- createdAt
- updatedAt

## 7.5 MerchantLocation

- id
- merchantId
- sessionId
- latitude
- longitude
- accuracy
- capturedAt

## 7.6 Product (Tahap Berikutnya)

- id
- merchantId
- name
- description
- price
- image
- availability

Produk terpisah dari profil pedagang dan dapat ditambahkan pada fase pengembangan berikutnya.

---

# 8. Arsitektur Frontend

Gunakan pemisahan concern agar implementasi mudah dikembangkan.

Struktur konseptual:

```text
src/
├── app/
│   ├── page.tsx
│   ├── explore/
│   ├── merchant/
│   │   ├── [slug]/
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── schedule/
│   └── admin/
│       └── dashboard/
│
├── components/
│   ├── layout/
│   ├── map/
│   ├── merchant/
│   ├── dashboard/
│   ├── forms/
│   └── ui/
│
├── features/
│   ├── explore/
│   ├── merchant/
│   ├── schedule/
│   └── admin/
│
├── data/
│   └── mock/
│
├── services/
│   └── mock/
│
├── types/
│
├── config/
│   ├── map.ts
│   └── region.ts
│
└── lib/
```

Struktur akhir boleh disesuaikan dengan struktur project yang sudah ada. Jangan memaksakan struktur baru dengan menghapus struktur yang masih relevan.

## 8.1 Pemisahan Mock Data

Jangan menanamkan seluruh data pedagang langsung di dalam komponen UI.

Pisahkan:
- Type definitions.
- Mock data.
- Mock service.
- UI components.

Contoh alur:

```text
Page
  ↓
Feature Component
  ↓
Mock Service
  ↓
Mock Data
```

Ketika backend sudah tersedia, implementasi service dapat diganti dengan API service tanpa perlu menulis ulang seluruh komponen.

## 8.2 Map Component & Modul Terkait

Struktur komponen peta yang modular dan teruji:

- `MaplibreView`: Komponen canvas peta WebGL inti. Mengelola instance MapLibre, layer GeoJSON (zona kuliner, breadcrumb history), kontrol kamera 3D, serta sinkronisasi marker HTML dengan hardware acceleration.
- `Navbar`: Header kontrol interaktif yang memuat pemilih 5 basemap ESRI & OSM, tombol sakelar sudut perspektif 3D (pitch 45°), pengatur kecepatan simulasi GPS (Pause, 1x Live, 3x), tombol reset kamera, dan tombol evaluasi arsitektur.
- `VendorSidebar`: Panel daftar gerobak yang responsif (dapat disembunyikan/dimunculkan), dilengkapi input pencarian real-time, filter kategori makanan (Makanan Berat, Camilan, Minuman Segar, Jajanan), serta filter status operasional (Keliling, Mangkal, Istirahat).
- `VendorDetailDrawer`: Kartu detail gerobak interaktif yang menampilkan telemetri real-time (kecepatan km/j, arah kompas, status baterai IoT), alamat terkini, tombol **"Follow Camera Mode"**, daftar menu & harga, tombol **"Chat WhatsApp Pedagang"**, dan tombol **"Panggil Gerobak"**.
- `CallVendorModal`: Modal pemanggilan gerobak ke titik lokasi pemesan dengan kalkulasi rute dinamis dan estimasi waktu tiba (ETA).
- `TelemetryFeed`: Konsol monitor streaming data mentah GPS IoT WebGL (lat, lng, speed, heading, battery, latency render) yang membuktikan kesiapan integrasi perangkat pelacak fisik.

Komponen peta menerima data melalui props dan memancarkan event pemilihan pedagang ke parent state, menjaga arsitektur tetap unidirectional dan mudah diuji.

---

# 9. Non-Functional Requirements

## 9.1 Responsive Design

Aplikasi harus nyaman digunakan pada:
- Desktop.
- Tablet.
- Smartphone.

Prioritaskan penggunaan mobile karena pelanggan kemungkinan mencari pedagang melalui smartphone.

## 9.2 Performance

- Gunakan dynamic import untuk komponen peta.
- Jangan memuat peta pada halaman yang tidak membutuhkannya.
- Hindari render ulang peta yang tidak diperlukan.
- Optimalkan gambar.
- Gunakan lazy loading untuk konten yang relevan.
- Hindari terlalu banyak marker tanpa clustering.
- Jaga ukuran bundle agar tidak berlebihan.

## 9.3 Usability

- Navigasi jelas.
- Status pedagang mudah dibedakan.
- Informasi lokasi memiliki timestamp.
- Loading, empty, error, dan success state tersedia.
- Form memiliki validasi dan pesan kesalahan yang mudah dipahami.

## 9.4 Security dan Privacy

- Jangan menyimpan password dalam plain text.
- Jangan menampilkan informasi pribadi yang tidak diperlukan.
- Minta izin lokasi hanya ketika diperlukan.
- Jangan mengakses GPS secara diam-diam.
- Jangan menampilkan koordinat personal pengguna tanpa persetujuan.
- Jangan menyimpan API key atau secret yang sebenarnya belum dibutuhkan pada fase frontend.
- Persiapkan validasi backend untuk semua data yang kelak dikirim pengguna.

---

# 10. Batasan Implementasi v1.0

Karena fokus saat ini adalah frontend, hal berikut tidak boleh diimplementasikan sebagai integrasi nyata:

- Prisma ORM.
- Supabase PostgreSQL.
- Database migration.
- Backend API.
- Authentication dan authorization nyata.
- Session management nyata.
- GPS tracking yang tersimpan secara permanen.
- Background location tracking.
- Notifikasi push.
- Payment gateway.
- Google Maps JavaScript API.
- Google Map Tiles API.
- Google Maps API key dan billing.
- Google Maps Dynamic Maps quota.
- Places API.
- Geocoding API.
- Routes API.
- Nominatim autocomplete.
- Download tile secara offline.
- Bulk download atau prefetch tile OSM.

Mock data hanya untuk kebutuhan demonstrasi UI dan bukan data produksi.

---

# 11. Desain dan Pengalaman Pengguna

Arah visual yang diinginkan:

- Modern.
- Bersih.
- Ramah.
- Mudah dipahami.
- Mengutamakan kemudahan menemukan pedagang.
- Tidak terlihat seperti dashboard admin generik.

Palet visual yang direkomendasikan:
- Primary: Deep Green.
- Background: White / Neutral.
- Surface: Light Gray.
- Text: Dark Neutral.
- Accent: Warm Orange atau Yellow untuk elemen tertentu.

Green digunakan untuk menonjolkan identitas usaha dan aktivitas positif.

Status aktivitas harus memiliki pembeda visual yang jelas:
- ACTIVE: hijau.
- PAUSED: kuning/oranye.
- ENDED: abu-abu.
- STALE: indikator peringatan yang berbeda dari status aktivitas.

Hindari penggunaan warna sebagai satu-satunya cara membedakan status. Selalu sertakan teks label.

---

# 12. Acceptance Criteria

Implementasi frontend v1.0 dinyatakan selesai apabila:

## Customer
- Landing page dapat dibuka.
- Halaman eksplorasi menampilkan daftar pedagang.
- Peta WebGL dapat dimuat menggunakan MapLibre GL JS dengan basemap ESRI & OSM.
- Attribution penyedia peta (Esri / OpenStreetMap) terlihat dengan jelas.
- Pilihan basemap (ESRI Street, Satelit, Dark, OSM HOT, Standard) dapat diganti secara instan tanpa reload halaman.
- Tile overscaling bekerja mulus saat zoom in dekat (skala 10m / 100m) tanpa muncul error "Map data not yet available".
- Marker pedagang menampilkan ikon kustom, badge status, dan denyut gelombang radar saat aktif keliling.
- Marker dapat diklik untuk membuka kartu informasi detail pedagang.
- Memilih kartu di sidebar otomatis memfokuskan kamera peta ke gerobak yang dipilih.
- Mode Follow Camera dapat mengunci dan mengikuti pergerakan gerobak secara berkelanjutan.
- Search dan filter kategori/status bekerja secara real-time.
- Fitur Panggil Gerobak dapat mengarahkan rute gerobak menuju titik koordinat pemesan.

## Merchant
- Halaman registrasi tersedia.
- Halaman login tersedia.
- Dashboard merchant dapat dibuka.
- Tombol mulai, jeda, lanjutkan, dan akhiri sesi bekerja melalui local UI state.
- Profil usaha dapat diedit melalui mock state.
- Jadwal operasional dapat diubah melalui mock state.
- Tidak ada klaim bahwa data sudah tersimpan pada database.

## Admin
- Dashboard admin dasar tersedia.
- Daftar merchant ditampilkan dari mock data.
- Aksi verifikasi dan penonaktifan bekerja pada UI state.
- Tidak ada klaim bahwa data telah diubah pada server.

## Technical
- Tidak ada error TypeScript yang belum ditangani.
- Aplikasi dapat dijalankan secara lokal.
- Build berhasil.
- Komponen peta tidak mengalami masalah SSR (dimuat via dynamic import ssr: false).
- Stylesheet MapLibre GL telah dimuat dengan benar.
- Container peta mempunyai tinggi dan lebar yang benar (w-full h-full).
- Marker HTML kustom ter-render sempurna tanpa broken asset.
- Animasi perpindahan marker berjalan 60 FPS di GPU tanpa lag atau memory leak.
- Layer GeoJSON jejak riwayat rute (breadcrumbs) ter-update secara dinamis.
- Fitur 3D pitch (45°) dan bearing rotation berfungsi tanpa distorsi visual.
- Penggunaan tile ESRI dan OSM mengikuti kebijakan resmi tanpa biaya API dan tanpa watermark.
- Struktur kode siap dihubungkan ke backend.

---

# 13. Urutan Implementasi

AI harus mengerjakan project secara bertahap dan tidak langsung membuat seluruh fitur tanpa memeriksa kondisi project.

## Tahap 1 — Audit Project

- Periksa struktur folder.
- Periksa package.json.
- Periksa versi Next.js, React, TypeScript, dan Tailwind.
- Periksa komponen dan dependency yang sudah tersedia.
- Jangan menghapus kode yang masih digunakan.
- Identifikasi dependency yang perlu ditambahkan.

## Tahap 2 — Design System

- Buat warna dan typography.
- Buat layout utama.
- Buat navbar dan footer.
- Siapkan komponen reusable.
- Pastikan desain responsive.

## Tahap 3 — Types dan Mock Data

- Definisikan tipe Merchant.
- Definisikan tipe Location.
- Definisikan tipe SellingSession.
- Definisikan tipe Schedule.
- Buat mock data pedagang Bandung Raya.
- Buat mock service untuk mengambil dan mengubah data.

Gunakan koordinat demonstrasi yang jelas ditandai sebagai mock data. Jangan menampilkan koordinat yang tidak diketahui sebagai lokasi GPS aktual.

## Tahap 4 — Customer Interface

- Landing page.
- Explore page.
- Map component.
- Marker dan popup.
- Merchant list.
- Search dan filter.
- Merchant detail.

## Tahap 5 — Merchant Interface

- Register UI.
- Login UI.
- Dashboard.
- Profile management.
- Schedule management.
- Selling session controls.

## Tahap 6 — Admin Interface

- Dashboard admin.
- Merchant list.
- Status dan verification UI.

## Tahap 7 — Testing dan Refinement

- Periksa responsivitas.
- Uji seluruh tombol.
- Uji search dan filter.
- Uji marker dan list synchronization.
- Uji fallback map.
- Uji loading dan error state.
- Uji build dan TypeScript.
- Perbaiki bug tanpa menghapus fitur yang sudah selesai.

---

# 14. Instruksi Khusus untuk AI Implementer

Perlakukan dokumen PRD ini sebagai acuan utama implementasi JejakLapak v1.0.

Aturan kerja:

1. Kerjakan frontend terlebih dahulu.
2. Jangan langsung membangun backend atau database.
3. Jangan mengimplementasikan Prisma dan Supabase pada tahap ini.
4. Gunakan TypeScript dengan tipe data yang jelas.
5. Gunakan shadcn/ui sebagai dasar komponen UI.
6. Gunakan MapLibre GL JS + Multi-Basemap Bebas API Key (ESRI & OpenStreetMap) sebagai arsitektur resmi sistem peta.
7. Jangan mengganti dengan Google Maps API berbayar dan jangan menggunakan CARTO yang mewajibkan API Key / menampilkan watermark.
8. Konfigurasikan maxzoom pada masing-masing sumber ubin (ESRI Street: 19, ESRI Dark: 16, OSM HOT: 20) untuk mengaktifkan tile overscaling pada zoom dekat.
9. Pertahankan performa 60 FPS dengan memperbarui marker via method setLngLat langsung di GPU tanpa me-remount peta.
10. Pisahkan mock data, service, types, dan UI components.
11. Semua tombol dan interaksi yang terlihat harus memiliki fungsi.
12. Jangan membuat tombol dekoratif yang tidak bekerja.
13. Jangan menghapus field, fitur, atau kode project yang masih relevan tanpa alasan.
14. Lakukan audit terlebih dahulu sebelum memodifikasi struktur yang sudah tersedia.
15. Hindari implementasi yang terlalu kompleks untuk tahap validasi awal.
16. Pastikan frontend mudah diintegrasikan dengan backend pada fase selanjutnya.
17. Jangan membuat klaim bahwa data mock adalah data produksi atau GPS live.

## Output yang wajib dilaporkan setelah implementasi

Setelah selesai, berikan laporan berisi:

- Fitur yang sudah selesai.
- Halaman yang sudah dibuat.
- Struktur folder akhir.
- Dependency yang ditambahkan.
- Konfigurasi environment jika ada.
- Cara menjalankan project.
- Fitur yang masih menggunakan mock data.
- Fitur yang belum selesai.
- Error atau kendala yang masih ditemukan.
- Rekomendasi langkah pengembangan berikutnya.

---

# 15. Roadmap Setelah v1.0

Setelah frontend selesai dan disetujui, pengembangan dapat dilanjutkan sebagai berikut:

**Fase 2 — Backend dan Database**
- Setup Supabase PostgreSQL.
- Setup Prisma.
- Implementasi autentikasi.
- Implementasi merchant profile.
- Implementasi schedule.
- Implementasi selling session.
- Implementasi API merchant.

**Fase 3 — GPS dan Integrasi Lokasi**
- Browser Geolocation.
- Penyimpanan lokasi merchant.
- Pembaruan lokasi selama sesi aktif.
- Pengelolaan timestamp.
- Perhitungan freshness.
- Integrasi lokasi aktual dengan peta pelanggan.

**Fase 4 — Stabilitas dan Validasi**
- Testing bersama pengguna.
- Validasi pengalaman pelanggan.
- Validasi pengalaman pedagang.
- Monitoring penggunaan tile.
- Evaluasi kebutuhan provider tile komersial.
- Persiapan pembukaan akses publik.

**Fase 5 — Pengembangan Fitur Lanjutan**
- Favorit.
- Produk.
- Rating.
- Notifikasi.
- Rekomendasi.
- Analitik merchant.

---

# 16. Keputusan Final JejakLapak v1.0

| Aspek | Keputusan |
|---|---|
| Nama produk | JejakLapak |
| Bentuk produk | Responsive web application |
| Framework | Next.js |
| Bahasa | TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| Map library | MapLibre GL JS (`maplibre-gl`) |
| Rendering engine | Hardware WebGL GPU Acceleration (60 FPS) |
| React integration | Next.js Client Component (`dynamic` import `ssr: false`) |
| Map provider | Multi-Basemap Bebas API Key (ESRI Street, Satelit, Dark, OSM HOT, Standard) |
| Biaya lisensi peta | Rp 0 / Bebas & Open Source (Tanpa API Key, Bebas Watermark) |
| 3D & Rotasi | Mendukung Pitch 0°-60° & Bearing 360° |
| Zoom Dekat (10m) | Aktif otomatis via WebGL GPU Tile Overscaling |
| Wilayah | Bandung Raya |
| Target pengguna awal | 2 developer + maksimal 3 juri |
| Fokus pengembangan | Frontend terlebih dahulu |
| Sumber data awal | Mock data |
| Database mendatang | Supabase PostgreSQL |
| ORM mendatang | Prisma |
| Autentikasi saat ini | Simulasi UI |
| GPS saat ini | Kontrak UI dan demonstrasi lokal |
| Google Maps API | Tidak digunakan |
| Google Maps billing | Tidak diperlukan |
| Google Maps map load quota | Tidak berlaku |
| OSM tile usage | Mengikuti kebijakan resmi OSM |
| Fitur inti | Discovery, Map, Merchant Profile, Schedule, Selling Status |

**Prinsip utama v1.0:**

Bangun produk yang bisa digunakan dan didemonstrasikan terlebih dahulu. Utamakan pengalaman menemukan pedagang, kejelasan status keberadaan, dan kemudahan pedagang membagikan informasi lokasi. Jaga arsitektur tetap rapi agar integrasi backend dan GPS aktual dapat dilakukan tanpa membangun ulang frontend dari awal.