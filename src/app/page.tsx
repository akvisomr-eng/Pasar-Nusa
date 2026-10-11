import Link from "next/link";

const categories = [
  { icon: "🥬", title: "Sayur & buah", desc: "Hasil segar dari kebun dan petani lokal", query: "sayur" },
  { icon: "🌾", title: "Hasil perkebunan", desc: "Rempah, biji-bijian, dan komoditas lokal", query: "rempah" },
  { icon: "🐟", title: "Hasil laut", desc: "Pilihan hasil perikanan untuk kebutuhanmu", query: "ikan" },
  { icon: "🧺", title: "Pangan & olahan", desc: "Bahan pangan dan produk olahan usaha kecil", query: "pangan" }
];

const principles = [
  "Informasi produk dan harga ditampilkan secara transparan",
  "Stok dikonfirmasi sebelum pesanan diproses",
  "Tidak ada penggantian penjual atau produk secara diam-diam",
  "Penanganan keluhan dan pengembalian dibuat terlacak"
];

export default function HomePage() {
  return (
    <main>
      <div className="announcement"><span>✳</span> Pasar lokal, peluang nasional <span className="announcement-divider">·</span> Tumbuh bersama usaha Indonesia</div>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Pasar-Nusa beranda"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Pasar lokal, peluang nasional</small></span></Link>
        <nav aria-label="Navigasi utama"><a href="#kategori">Kategori</a><Link href="/katalog">Katalog</Link><a href="#cara-kerja">Cara kerja</a><a href="#penjual">Untuk penjual</a></nav>
        <Link className="button button-outline" href="/masuk">Masuk / Daftar</Link>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><span className="live-dot" /> PASAR NUSANTARA, DALAM SATU TEMPAT</span>
          <h1>Belanja lebih dekat.<br /><em>Tumbuh bersama.</em></h1>
          <p>Temukan kebutuhan dari pelaku usaha lokal Indonesia. Belanja dengan informasi yang jelas, sambil membuka peluang tumbuh bagi petani, nelayan, dan UMKM.</p>
          <form className="search" action={`${process.env.PASAR_NUSA_BASE_PATH ?? ""}/katalog`} method="get"><label className="sr-only" htmlFor="q">Cari produk atau toko</label><span aria-hidden="true">⌕</span><input id="q" name="q" placeholder="Cari beras, sayur, ikan, rempah..." /><button type="submit">Cari</button></form>
          <div className="hero-note"><span>✓</span> Harga transparan <span>✓</span> Stok dikonfirmasi <span>✓</span> Dukung usaha lokal</div>
        </div>
        <div className="hero-art" aria-label="Ilustrasi hasil bumi Nusantara"><span className="hero-art-tag">DARI BUMI NUSANTARA</span><img className="hero-illustration" src={`${process.env.PASAR_NUSA_BASE_PATH ?? ""}/hero-hasil-nusantara.svg`} alt="Hasil panen Nusantara berupa sayuran, jagung, cabai, dan hasil bumi dalam keranjang" /><div className="hero-art-caption"><strong>Baik untukmu, berarti bagi mereka.</strong><small>Setiap pilihan ikut menggerakkan usaha lokal.</small></div></div>
      </section>
      <section className="trust-strip"><div><strong>Transparan</strong><span>Harga & informasi jelas</span></div><div><strong>Terhubung</strong><span>Pedagang dan pembeli</span></div><div><strong>Bertumbuh</strong><span>Dari eceran ke grosir</span></div></section>
      <section className="section" id="kategori">
        <div className="section-heading"><div><span className="eyebrow">TEMUKAN YANG KAMU CARI</span><h2>Jelajahi pasar sesuai kebutuhan</h2></div><p>Dari hasil kebun dan laut hingga kebutuhan usaha, temukan pilihan dari pelaku lokal.</p></div>
        <div className="category-grid">{categories.map((item) => <Link className="category-card" href={"/katalog?q="+encodeURIComponent(item.query)} key={item.title}><span className="category-icon">{item.icon}</span><span className="category-title">{item.title}</span><span className="category-desc">{item.desc}</span><span className="arrow">↗</span></Link>)}</div>
      </section>
      <section className="seller-section" id="penjual"><div><span className="eyebrow">UNTUK PEDAGANG & UMKM</span><h2>Usaha Anda layak<br/>punya panggung lebih besar.</h2><p>Kelola katalog dan stok, terima pesanan dengan alur yang jelas, dan siapkan bisnis untuk tumbuh ke grosir serta B2B.</p><Link className="button button-light" href="/seller">Mulai berjualan <span>→</span></Link></div><div className="seller-graphic"><div className="graphic-card"><span>RINGKASAN USAHA</span><div className="graphic-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><strong>Kelola. Layani. Bertumbuh.</strong><small>Operasional dagang dalam satu alur.</small></div><div className="floating-leaf">🌱</div></div></section>
      <section className="section principles" id="cara-kerja"><div className="section-heading"><div><span className="eyebrow">DIBANGUN DENGAN KEPERCAYAAN</span><h2>Dagangan jelas, transaksi tertata.</h2></div><p>Kepercayaan bukan fitur tambahan. Ia adalah fondasi.</p></div><ul>{principles.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul></section>
      <section className="cta" id="mulai"><span className="eyebrow">PASAR-NUSA</span><h2>Ruang tumbuh bagi semua pelaku usaha.</h2><p>Temukan produk aktif dari pedagang yang telah disetujui. Anda dapat membuat pesanan; pembayaran online belum tersedia dan proses pemenuhan tetap mengikuti konfirmasi penjual.</p><div className="cta-actions"><Link className="button button-dark" href="/katalog">Jelajahi katalog <span>→</span></Link><Link className="button button-cta-outline" href="/masuk">Masuk / daftar akun</Link></div></section>
      <footer><Link className="brand brand-footer" href="/"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Pedagang Ecer, Pelayanan Sultan.</small></span></Link><span>© {new Date().getFullYear()} Pasar-Nusa</span><span>Dirancang untuk tumbuh bersama pedagang Indonesia.</span></footer>
    </main>
  );
}