# Pasar Nusa — Multi-Agent Automation & Product Studio

## Prinsip arsitektur

Pasar Nusa tetap memakai **GitHub + Supabase saja**. GitHub menjadi repositori, CI/CD, penjadwal dan tempat laporan audit; Supabase tetap menjadi basis data, Auth, RLS dan backend transaksi. Tidak ada Cloudflare, Render, Railway, layanan AI eksternal, atau dependensi baru dalam fondasi ini.

Penting: implementasi tahap pertama adalah **agen otomatis berbasis aturan**, bukan model bahasa/LLM otonom. Ia menjalankan pemeriksaan yang bisa diulang dan dibuktikan. Tidak ada klaim bahwa pemeriksaan statis ini setara dengan penetration test atau audit keamanan manusia.

## Agen yang sudah diaktifkan di repositori

| Agen | Tugas otomatis | Keluaran |
| --- | --- | --- |
| **Sentinel — Security** | Memeriksa deklarasi RLS tabel inti, mencari pola secret/service-role di source browser, membaca hasil `npm audit` dan menggagalkan pemeriksaan untuk temuan high/critical | Temuan berprioritas pada laporan patrol |
| **QA — Quality Gate** | TypeScript, lint, static build, route HTML, metadata, bahasa Indonesia, dan tautan localhost yang tidak sengaja tertanam | CI gagal jika gate penting tidak lolos |
| **SEO — Technical Search** | Memastikan halaman publik utama punya title/description, `robots.txt` dan `sitemap.xml` terbit serta menunjuk ke domain GitHub Pages yang benar | Laporan kesehatan SEO teknis |
| **Studio — Product Design** | Editor konsep label 2D berbasis SVG, warna dan bentuk kemasan, pratinjau kemasan bergaya 3D, ekspor SVG | Berkas SVG dan konsep lokal pada browser |
| **XR Planner — AR/VR/XR** | Menetapkan batas dan prasyarat integrasi model 3D dan WebXR agar tidak mengklaim fitur yang belum ada | Roadmap teknis di Studio |

### Penjadwalan dan hasil

Workflow `.github/workflows/agent-patrol.yml` berjalan pada push relevan ke `main`, bisa dijalankan manual, dan dijadwalkan harian pukul 02:17 UTC (09:17 WIB). Workflow membuat artefak laporan JSON yang bertahan 30 hari. Workflow membaca kode dan menghasilkan laporan; ia tidak mengubah database produksi, tidak mengubah status produk/toko, tidak mengirim pesan pelanggan, dan tidak melakukan auto-merge.

## SEO bertingkat — pendekatan yang aman

1. **Tier 1 — Technical:** metadata per halaman, sitemap, robots, konsistensi URL, performa build, struktur HTML dan mobile-first.
2. **Tier 2 — On-page:** judul produk yang jelas, deskripsi unik, kategori konsisten, alt text, breadcrumb, internal links dan data produk yang benar.
3. **Tier 3 — Katalog & intent:** halaman kategori yang benar-benar berguna, informasi asal/varietas/satuan/ketersediaan bila disediakan penjual, dan halaman produk yang tidak dibuat-buat.
4. **Tier 4 — Authority & distribusi:** panduan komoditas yang ditinjau manusia, profil pelaku usaha, kemitraan dan tautan editorial yang sah.
5. **Tier 5 — Monitoring:** audit rutin, perubahan indeksasi, broken links, metadata duplikat, dan regresi rilis.

Tidak digunakan cloaking, keyword stuffing, doorway pages, ulasan palsu, tautan spam, atau halaman produk palsu. SEO agresif berarti cakupan dan iterasi luas, bukan manipulasi mesin pencari. Katalog produksi saat ini harus tetap kosong jika belum ada listing pedagang nyata.

## Batas kemampuan saat ini

- **2D:** ekspor SVG label konsep aktif. Hasil perlu ditinjau sebelum cetak dan bukan label regulasi siap produksi.
- **3D:** pratinjau perspektif berbasis CSS untuk eksplorasi bentuk; belum merupakan mesh 3D atau berkas GLB/glTF.
- **AR/VR/XR:** belum aktif. Integrasi nyata membutuhkan aset 3D terstruktur, pipeline konversi/validasi, viewer WebXR, dukungan perangkat/browser dan pengujian nyata.
- **AI generatif:** belum diaktifkan. Menjalankan model yang menghasilkan desain atau melakukan reasoning bebas memerlukan runtime model yang tersedia atau endpoint/model yang dikonfigurasi. Karena batasan GitHub + Supabase dan Rp0, tahap ini tidak diam-diam memanggil penyedia eksternal atau menambahkan kunci API.
- **Security:** pemeriksaan kode dan dependency membantu menemukan kelas risiko tertentu, tetapi tidak menjamin “aman 100%”. Pengujian penetrasi, review otorisasi transaksi, pemulihan insiden dan uji perangkat tetap diperlukan sebelum skala produksi.

## Tahap pengembangan berikutnya

1. Simpan histori laporan agen di Supabase dengan tabel audit terproteksi RLS, tanpa mengekspos temuan sensitif kepada pengguna publik.
2. Tambahkan pengujian transaksi/otorisasi yang memakai akun uji dan data sintetis pada lingkungan terisolasi; jangan menjalankan operasi destruktif di produksi.
3. Tambahkan agen kualitas katalog yang memeriksa kelengkapan listing asli, satuan/harga, duplikasi dan metadata SEO.
4. Tingkatkan Studio menjadi pipeline 3D: model glTF/GLB, validasi ukuran/material, lalu viewer interaktif; aktifkan AR/VR setelah pengujian browser/perangkat.
5. Evaluasi runtime AI lokal/yang telah disetujui untuk generasi desain dan rekomendasi. Agen yang punya akses tindakan tetap memerlukan batas izin, audit trail, rate limit, dan persetujuan manusia untuk perubahan berisiko tinggi.

## Menjalankan patrol lokal

```bash
npm ci
npm run typecheck
npm run lint
npm run build:static
node scripts/verify-static-export.mjs
npm run agent:patrol
```

Patrol membutuhkan folder `out/` dari static build. Laporan ditulis ke `reports/agent-patrol-latest.json`; laporan dependency dibaca dari `reports/npm-audit.json` jika tersedia.
