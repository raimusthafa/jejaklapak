---
name: minimal-modern-design
description: Guides the agent to produce simple, minimalist, modern UI that does not look AI-generated. Defines a design plan step, restrained design tokens, and a blacklist of generic AI-slop patterns. Use for any request to design, style, redesign, or beautify a page, landing page, dashboard, or component, and whenever the user mentions desain, tampilan, UI, minimalis, modern, or "jangan terlihat buatan AI".
---

# Minimal, Modern Design (anti AI-slop)

Minimalis bukan "kosong". Minimalis adalah keputusan yang disengaja: satu hal dibuat menonjol, yang lain dibuat tenang dan disiplin.

## Use this skill when
- Membuat atau merombak tampilan halaman, landing page, dashboard, form, atau komponen
- User ingin hasil yang bersih, simpel, modern, dan tidak generik

## Langkah 1: Design plan (sebelum menulis kode)
Tulis ringkas (5-8 baris, tampilkan ke user) berdasarkan produk yang nyata:
- **Subjek:** produk apa, untuk siapa, tugas utama halaman ini
- **Palet:** 4-6 warna bernama dengan nilai hex/oklch (background, surface, border, teks, teks redup, 1 aksen)
- **Tipografi:** 1 keluarga font (atau 2 yang jelas berbeda) dan perannya
- **Layout:** satu kalimat konsep + wireframe ASCII + perataan (kiri/tengah)
- **Satu momen memorable:** satu elemen yang diberi bobot visual lebih

Lalu **kritik rencana itu:** jika kamu akan menghasilkan hal yang sama untuk prompt serupa apa pun, itu default, bukan pilihan. Revisi bagian itu dan sebutkan apa yang diubah. Baru setelah itu tulis kode. Jika kamu belum tahu subjek produknya, usulkan satu dan minta konfirmasi singkat.

## Langkah 2: Sistem desain minimalis
- **Warna:** netral mendominasi (>90% permukaan). Maksimal 1 aksen, hanya untuk aksi utama, state aktif, dan link. Aksen default boleh monokrom. Tambahkan hue bila subjeknya mendukung. Kontras teks minimal 4.5:1. Dark mode (bila ada) dirancang sebagai set token terpisah, bukan sekadar inversi.
- **Spacing:** skala 4/8px (4, 8, 12, 16, 24, 32, 48, 64, 96). Jarak antar-section lega (64-120px desktop). Elemen yang berkaitan didekatkan, yang tidak berkaitan dijauhkan.
- **Tipografi:** skala ~1.2-1.25 (body 15-16px, lalu 20, 24, 32-48). Maksimal 2-3 weight. Panjang baris 60-75 karakter. Line-height body 1.5-1.6, heading 1.1-1.25. Heading besar dengan tracking sedikit rapat. Angka tabular untuk data.
- **Bentuk:** radius berjenjang (mis. 6px untuk kontrol, 12px untuk panel), bukan satu radius untuk semua. Pemisah memakai border 1px halus atau whitespace. Shadow hanya untuk elemen melayang (popover, dialog).
- **Layout:** grid jelas, lebar konten maks ~1100-1200px, blok teks ~65ch. Rata kiri sebagai default. Rata tengah hanya untuk momen singkat.
- **Ikon:** satu set konsisten (mis. lucide), ukuran 16/20px. Hanya bila menambah makna. Tidak ada emoji sebagai ikon UI.
- **Gambar:** foto/ilustrasi nyata, atau tanpa gambar. Bukan blob abstrak atau gradien mesh.
- **Motion:** hanya sebagai respons aksi (150-200ms ease-out). Maksimal satu momen saat halaman dimuat. Hormati `prefers-reduced-motion`.
- **Komponen:** satu tombol primary per area; secondary berupa outline/ghost. Input punya label terlihat. Setiap kontrol punya state hover, `focus-visible`, disabled, loading, dan error.

## Langkah 3: Hindari tanda AI-slop
- Gradien ungu/biru-indigo, gradien sebagai dekorasi, gradient text, glow, glassmorphism/blur
- Hero generik: badge kecil "New" + headline dengan satu kata diwarnai + dua tombol + mockup mengambang
- Grid 3 kartu fitur identik dengan ikon di lingkaran berwarna
- Semuanya dibungkus kartu `rounded-2xl` + `shadow-lg` dengan radius dan bayangan yang sama
- Eyebrow ALL CAPS ber-tracking di atas tiap heading, nomor 01/02/03 padahal bukan urutan, "->" di tiap link, string dipisah titik tengah
- Fade-slide-up di tiap section dan hover scale/shadow di tiap kartu
- Font default tanpa dipilih (Inter/Geist/Roboto). Pilih secara sadar sesuai karakter produk (contoh kandidat di Google Fonts: Instrument Sans, Manrope, DM Sans, Figtree, Hanken Grotesk, Public Sans, Newsreader untuk serif)
- Latar krem + serif + aksen terracotta, atau hitam pekat + satu aksen neon, kecuali brief memintanya
- Data karangan: lorem ipsum, "Acme Inc", "John Doe", testimoni dan statistik palsu ("10k+ pengguna"), logo klien palsu
- Copy klise: "Elevate", "Seamless", "Unlock", "Revolutionize", "Supercharge", "all-in-one"

## Copy (kata adalah bagian dari desain)
- Bahasa mengikuti audiens (Indonesia bila produknya untuk pengguna Indonesia), huruf kecil gaya kalimat, kata kerja aktif
- CTA spesifik: "Simpan perubahan", bukan "Submit". Nama aksi konsisten di seluruh alur
- Error menjelaskan masalah dan cara memperbaikinya, tanpa basa-basi atau permintaan maaf. Empty state mengajak beraksi
- Gunakan konten asli proyek. Bila belum ada, tulis placeholder yang realistis dan beri tahu user

## Implementasi di Next.js + Tailwind
- Definisikan token sekali di CSS global (lihat `examples/tokens.css`) dan pakai lewat kelas utilitas. Jangan menaruh hex acak di komponen.
- Muat font lewat `next/font` (1-2 keluarga) dan hubungkan ke token `--font-sans`.
- Bila memakai shadcn/ui, **override** token (warna, radius, font) supaya tidak tampil seperti tema default.
- Mobile-first, `focus-visible` jelas, target sentuh minimal ~40px.

## Langkah 4: Kritik diri sebelum selesai
- Squint test: apa yang terbaca pertama? Itu harus hal terpenting.
- Seperti kata Chanel, lepaskan satu aksesori: hapus satu elemen dekoratif.
- Cek kontras, tampilan 375px, dan navigasi keyboard.
- Bila agent punya akses browser, ambil screenshot dan tinjau hasilnya.

## Constraints
- Jika brief atau user menyebut arah visual tertentu, ikuti itu secara persis, termasuk bila itu salah satu pola di daftar hindari
