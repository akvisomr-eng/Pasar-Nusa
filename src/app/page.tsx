import Link from "next/link";
import HomeProductShelf from "@/components/home-product-shelf";

const categories = [
  { icon: "🥬", title: "Sayur & buah", desc: "Panen segar langsung dari kebun", query: "sayur", tone: "leaf" },
  { icon: "🌾", title: "Beras & pangan", desc: "Bahan pokok untuk rumah dan usaha", query: "beras", tone: "grain" },
  { icon: "🐟", title: "Hasil perikanan", desc: "Hasil laut dan budidaya lokal", query: "ikan", tone: "sea" },
  { icon: "🌿", title: "Perkebunan & rempah", desc: "Komoditas khas dari Nusantara", query: "rempah", tone: "spice" },
];

const benefits = [
  { icon: "✓", title: "Harga transparan", desc: "Harga dan satuan terlihat sebelum membeli." },
  { icon: "⌂", title: "Dukung usaha lokal", desc: "Terhubung dengan petani, nelayan, dan UMKM." },
  { icon: "↗", title: "Belanja eceran & usaha", desc: "Cari kebutuhan rumah maupun pasokan usaha." },
];

export default function HomePage() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return (
    <main className="storefront template-storefront" data-build="pasar-nusa-khareedo-erpcrm-2026-10-11">
      <div className="storefront-promo">
        <span>PASAR NUSA · HASIL NUSANTARA</span>
        <span>Belanja lokal, tumbuhkan ekonomi bersama</span>
        <Link href="/katalog">Promo & produk <span aria-hidden="true">→</span></Link>
      </div>
      <header className="store-header">
        <Link className="store-logo" href="/" aria-label="Pasar Nusa beranda">
          <span className="store-logo-mark">P</span>
          <span>pasar<span>nusa</span><small>MARKETPLACE KOMODITAS INDONESIA</small></span>
        </Link>
        <form className="store-search" action={`${basePath}/katalog`} method="get">
          <span aria-hidden="true">⌕</span>
          <input id="store-q" name="q" placeholder="Cari beras, sayur, ikan, rempah..." aria-label="Cari produk" />
          <button type="submit">Cari produk</button>
        </form>
        <div className="store-header-actions">
          <Link href="/masuk" aria-label="Masuk ke akun"><span>♙</span><small>Akun saya</small></Link>
          <Link href="/keranjang" aria-label="Buka keranjang"><span>🛒</span><small>Keranjang</small></Link>
        </div>
      </header>
      <nav className="store-nav" aria-label="Navigasi kategori">
        <Link className="nav-all" href="/katalog">☰ Semua kategori</Link>
        <Link href="/katalog?q=sayur">Sayur & buah</Link>
        <Link href="/katalog?q=beras">Beras & pangan</Link>
        <Link href="/katalog?q=ikan">Hasil perikanan</Link>
        <Link href="/katalog?q=rempah">Perkebunan & rempah</Link>
        <Link href="/seller">Jadi penjual <span aria-hidden="true">↗</span></Link>
      </nav>

      <section className="shop-hero">
        <div className="shop-hero-copy">
          <span className="shop-kicker"><i /> PASAR LOKAL · PELUANG NASIONAL</span>
          <h1>Belanja hasil bumi<br />dengan cara <em>lebih mudah.</em></h1>
          <p>Temukan komoditas pertanian, perkebunan, perikanan, dan produk UMKM Indonesia dalam satu pasar digital. Harga jelas, informasi tertata, peluang terbuka lebih luas.</p>
          <div className="shop-hero-actions">
            <Link className="shop-primary-btn" href="/katalog">Jelajahi produk <span>→</span></Link>
            <Link className="shop-secondary-btn" href="/seller">Mulai berjualan</Link>
          </div>
          <div className="shop-hero-points"><span>✓ Informasi produk transparan</span><span>✓ Mendukung usaha lokal</span></div>
        </div>
        <div className="shop-hero-art">
          <div className="shop-art-sun" />
          <div className="shop-art-orbit orbit-one" />
          <div className="shop-art-orbit orbit-two" />
          <img src={`${basePath}/hero-hasil-nusantara.svg`} alt="Ilustrasi keranjang hasil panen Nusantara" />
          <div className="shop-art-sticker"><span>✳</span><b>Dari lokal,<br />untuk semua.</b></div>
          <div className="shop-art-caption"><span>HASIL PILIHAN</span><b>Segar. Lokal. Bernilai.</b></div>
        </div>
      </section>

      <section className="shop-benefits" aria-label="Keunggulan Pasar Nusa">
        {benefits.map(item => <div className="shop-benefit" key={item.title}><span className="shop-benefit-icon">{item.icon}</span><div><b>{item.title}</b><p>{item.desc}</p></div></div>)}
      </section>

      <section className="shop-section" id="kategori">
        <div className="shop-section-head"><div><span className="shop-eyebrow">BELANJA BERDASARKAN KATEGORI</span><h2>Jelajahi pasar Nusantara</h2><p>Temukan produk sesuai kebutuhan rumah, toko, maupun usaha Anda.</p></div><Link href="/katalog">Lihat semua produk <span>→</span></Link></div>
        <div className="shop-category-grid">
          {categories.map(item => <Link className={`shop-category-card ${item.tone}`} href={`/katalog?q=${encodeURIComponent(item.query)}`} key={item.title}><span className="shop-category-art" aria-hidden="true">{item.icon}</span><span className="shop-category-arrow">↗</span><b>{item.title}</b><p>{item.desc}</p><span className="shop-category-link">Jelajahi kategori <span>→</span></span></Link>)}
        </div>
      </section>

      <HomeProductShelf />

      <section className="shop-seller-banner">
        <div className="seller-banner-mark">✳</div>
        <div><span className="shop-eyebrow">UNTUK PETANI, NELAYAN & UMKM</span><h2>Produk lokal pantas menjangkau pasar lebih luas.</h2><p>Bangun etalase digital, kelola produk, dan kembangkan usaha bersama ekosistem Pasar Nusa.</p></div>
        <Link className="shop-primary-btn" href="/seller">Daftarkan toko <span>→</span></Link>
      </section>

      <section className="shop-trust-section">
        <div><span className="shop-eyebrow">BELANJA DENGAN LEBIH PERCAYA DIRI</span><h2>Satu pasar untuk<br />peluang yang lebih luas.</h2></div>
        <div className="shop-trust-list">
          <p><span>01</span><b>Informasi produk yang jelas</b><small>Harga, satuan, dan deskripsi membantu pembeli memahami produk.</small></p>
          <p><span>02</span><b>Pengelolaan penjual terstruktur</b><small>Toko dan produk melalui alur pengajuan serta moderasi platform.</small></p>
          <p><span>03</span><b>Transaksi yang dapat ditelusuri</b><small>Alur pesanan dirancang agar pembeli dan penjual mudah memantau proses.</small></p>
        </div>
      </section>
      <footer className="shop-footer">
        <Link className="store-logo" href="/"><span className="store-logo-mark">P</span><span>pasar<span>nusa</span><small>MARKETPLACE KOMODITAS INDONESIA</small></span></Link>
        <span>© {new Date().getFullYear()} Pasar Nusa</span>
        <span>Dibangun untuk tumbuh bersama pelaku usaha Indonesia.</span>
      </footer>
    </main>
  );
}
