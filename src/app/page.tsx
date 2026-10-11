import Link from "next/link";

const categories = [
  { icon: "🥬", title: "Pangan segar", desc: "Sayur, buah, bumbu, dan hasil tani", query: "sayur" },
  { icon: "🧺", title: "Kebutuhan harian", desc: "Barang rumah tangga dan kebutuhan pokok", query: "kebutuhan" },
  { icon: "🛠️", title: "Peralatan & bahan", desc: "Perlengkapan usaha dan kebutuhan proyek", query: "peralatan" },
  { icon: "📦", title: "Grosir & B2B", desc: "Pembelian usaha dengan jumlah besar", query: "grosir" }
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
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Pasar-Nusa beranda"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Pasar lokal, peluang nasional</small></span></Link>
        <nav aria-label="Navigasi utama"><a href="#kategori">Kategori</a><Link href="/katalog">Katalog</Link><a href="#cara-kerja">Cara kerja</a><a href="#penjual">Untuk penjual</a></nav>
        <Link className="button button-outline" href="/masuk">Masuk / Daftar</Link>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow"><span className="live-dot" /> EKOSISTEM DAGANG INDONESIA</span>
          <h1>Pedagang Ecer,<br /><em>Pelayanan Sultan.</em></h1>
          <p>Belanja kebutuhan harian, temukan pedagang lokal, dan bangun peluang usaha dari satu tempat.</p>
          <form className="search" action="/katalog" method="get"><label className="sr-only" htmlFor="q">Cari produk atau toko</label><span aria-hidden="true">⌕</span><input id="q" name="q" placeholder="Cari beras, sayur, toko, atau grosir..." /><button type="submit">Cari</button></form>
          <div className="hero-note"><span>✓</span> Harga jelas <span>✓</span> Stok terkonfirmasi <span>✓</span> Pedagang lokal</div>
        </div>
        <div className="hero-art" aria-label="Ilustrasi pasar dan produk lokal">
          <div className="sun"></div><div className="art-label label-top">DARI PEDAGANG LOKAL</div>
          <div className="market-building"><div className="awning"><i></i><i></i><i></i><i></i><i></i><i></i></div><div className="store-window"><span>pasar<br/>nusa</span></div></div>
          <div className="produce produce-one">🥬</div><div className="produce produce-two">🍊</div><div className="produce produce-three">🌾</div>
          <div className="art-label label-bottom">TUMBUH BERSAMA</div>
        </div>
      </section>
      <section className="trust-strip"><div><strong>Transparan</strong><span>Harga & informasi jelas</span></div><div><strong>Terhubung</strong><span>Pedagang dan pembeli</span></div><div><strong>Bertumbuh</strong><span>Dari eceran ke grosir</span></div></section>
      <section className="section" id="kategori">
        <div className="section-heading"><div><span className="eyebrow">JELAJAHI PASAR</span><h2>Mulai dari yang Anda butuhkan</h2></div><p>Beragam kategori untuk kebutuhan rumah, usaha, dan pengadaan.</p></div>
        <div className="category-grid">{categories.map((item) => <a className="category-card" href={"/katalog?q="+encodeURIComponent(item.query)} key={item.title}><span className="category-icon">{item.icon}</span><span className="category-title">{item.title}</span><span className="category-desc">{item.desc}</span><span className="arrow">↗</span></a>)}</div>
      </section>
      <section className="seller-section" id="penjual"><div><span className="eyebrow">UNTUK PEDAGANG & UMKM</span><h2>Usaha Anda layak<br/>punya panggung lebih besar.</h2><p>Kelola katalog dan stok, terima pesanan dengan alur yang jelas, dan siapkan bisnis untuk tumbuh ke grosir serta B2B.</p><Link className="button button-light" href="/seller">Mulai berjualan <span>→</span></Link></div><div className="seller-graphic"><div className="graphic-card"><span>RINGKASAN USAHA</span><div className="graphic-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><strong>Kelola. Layani. Bertumbuh.</strong><small>Operasional dagang dalam satu alur.</small></div><div className="floating-leaf">🌱</div></div></section>
      <section className="section principles" id="cara-kerja"><div className="section-heading"><div><span className="eyebrow">DIBANGUN DENGAN KEPERCAYAAN</span><h2>Dagangan jelas, transaksi tertata.</h2></div><p>Kepercayaan bukan fitur tambahan. Ia adalah fondasi.</p></div><ul>{principles.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul></section>
      <section className="cta" id="mulai"><span className="eyebrow">PASAR-NUSA</span><h2>Ruang tumbuh bagi semua pelaku usaha.</h2><p>Temukan produk aktif dari pedagang yang telah disetujui. Anda dapat membuat pesanan; pembayaran online belum tersedia dan proses pemenuhan tetap mengikuti konfirmasi penjual.</p><div className="cta-actions"><Link className="button button-dark" href="/katalog">Jelajahi katalog <span>→</span></Link><Link className="button button-cta-outline" href="/masuk">Masuk / daftar akun</Link></div></section>
      <footer><Link className="brand brand-footer" href="/"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Pedagang Ecer, Pelayanan Sultan.</small></span></Link><span>© {new Date().getFullYear()} Pasar-Nusa</span><span>Dirancang untuk tumbuh bersama pedagang Indonesia.</span></footer>
    </main>
  );
}