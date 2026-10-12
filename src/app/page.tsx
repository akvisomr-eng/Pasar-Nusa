import Link from "next/link";
import HomeProductShelf from "@/components/home-product-shelf";

const categories = [
  { icon: "🥬", title: "Sayur & buah", detail: "Segar dari kebun", query: "sayur", tone: "leaf" },
  { icon: "🌾", title: "Beras & pangan", detail: "Pangan sehari-hari", query: "beras", tone: "grain" },
  { icon: "🐟", title: "Hasil perikanan", detail: "Laut dan budidaya", query: "ikan", tone: "sea" },
  { icon: "🌶️", title: "Rempah & bumbu", detail: "Rasa khas Nusantara", query: "rempah", tone: "spice" },
  { icon: "☕", title: "Perkebunan", detail: "Kopi, kakao, kelapa", query: "kopi", tone: "estate" },
  { icon: "🧺", title: "UMKM & olahan", detail: "Karya usaha lokal", query: "olahan", tone: "craft" },
];

export default function HomePage() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return (
    <main className="pn-market" data-build="pasar-nusa-modern-storefront-2026-10-11">
      <div className="pn-topline">
        <div className="pn-wrap pn-topline-inner">
          <span>Pasar digital komoditas Indonesia</span>
          <span className="pn-topline-right">Dukung petani, nelayan & UMKM lokal <i>✳</i> <Link href="/seller">Mulai berjualan gratis ↗</Link></span>
        </div>
      </div>

      <header className="pn-header pn-wrap">
        <Link className="pn-logo" href="/" aria-label="Pasar Nusa beranda">
          <span className="pn-logo-icon">N</span>
          <span className="pn-logo-type">PASAR<span>NUSA</span><small>HASIL NUSANTARA, SATU PASAR</small></span>
        </Link>
        <form className="pn-search" action={basePath + "/katalog"} method="get">
          <span className="pn-search-symbol" aria-hidden="true">⌕</span>
          <input name="q" placeholder="Cari beras, cabai, ikan, kopi..." aria-label="Cari produk" />
          <button type="submit">Cari produk</button>
        </form>
        <div className="pn-header-links">
          <Link href="/masuk"><span className="pn-line-icon">♙</span><span>Masuk<small>Akun saya</small></span></Link>
          <Link href="/keranjang"><span className="pn-line-icon">🛒</span><span>Keranjang<small>Belanja Anda</small></span></Link>
        </div>
      </header>

      <nav className="pn-main-nav" aria-label="Navigasi utama">
        <div className="pn-wrap pn-main-nav-inner">
          <Link className="pn-nav-all" href="/katalog">☷ <span>Jelajahi pasar</span></Link>
          {categories.map((item) => <Link key={item.title} href={"/katalog?q=" + encodeURIComponent(item.query)}>{item.title}</Link>)}
          <Link href="/studio">Studio produk <span>✳</span></Link><Link className="pn-nav-seller" href="/seller">Untuk penjual <span>↗</span></Link>
        </div>
      </nav>

      <div className="pn-wrap pn-page">
        <section className="pn-hero-layout">
          <div className="pn-hero-banner">
            <div className="pn-hero-copy">
              <span className="pn-label"><i /> PASAR LOKAL, PELUANG NASIONAL</span>
              <h1>Hasil bumi Indonesia.<br />Lebih dekat <em>dengan Anda.</em></h1>
              <p>Temukan komoditas pertanian, perkebunan, perikanan, dan produk UMKM langsung dari pelaku usaha lokal.</p>
              <div className="pn-hero-buttons">
                <Link className="pn-btn-primary" href="/katalog">Jelajahi produk <span>→</span></Link>
                <Link className="pn-text-link" href="/seller">Punya produk untuk dijual? ↗</Link>
              </div>
              <div className="pn-hero-trust"><span>✓ Harga dan satuan jelas</span><span>✓ Mendukung usaha lokal</span></div>
            </div>
            <div className="pn-hero-visual">
              <div className="pn-visual-orbit" />
              <div className="pn-visual-sun">✳</div>
              <img src={basePath + "/hero-hasil-nusantara.svg"} alt="Ilustrasi hasil bumi Nusantara" />
              <div className="pn-visual-tag"><b>Dari lokal</b><span>untuk Indonesia</span></div>
            </div>
          </div>
        </section>

        <section className="pn-categories-section" aria-labelledby="pn-categories-title">
          <div className="pn-section-title">
            <div><span className="pn-section-kicker">JELAJAHI PASAR</span><h2 id="pn-categories-title">Apa yang Anda cari?</h2><p>Pilih kategori untuk menemukan kebutuhan Anda.</p></div>
            <Link href="/katalog">Semua produk <b>→</b></Link>
          </div>
          <div className="pn-category-grid">
            {categories.map((item) => <Link key={item.title} href={"/katalog?q=" + encodeURIComponent(item.query)} className="pn-category-tile">
              <span className={"pn-category-illustration " + item.tone}>{item.icon}</span>
              <span className="pn-category-copy"><b>{item.title}</b><small>{item.detail}</small></span><span className="pn-category-arrow">↗</span>
            </Link>)}
          </div>
        </section>

        <section className="pn-product-section" aria-labelledby="pn-products-title">
          <div className="pn-section-title">
            <div><span className="pn-section-kicker">DARI PEDAGANG LOKAL</span><h2 id="pn-products-title">Temukan produk pilihan</h2><p>Katalog diperbarui dari toko yang aktif di Pasar Nusa.</p></div>
            <Link href="/katalog">Lihat katalog <b>→</b></Link>
          </div>
          <HomeProductShelf />
        </section>

        <section className="pn-seller-band">
          <div className="pn-seller-symbol">✳</div>
          <div className="pn-seller-copy"><span className="pn-section-kicker">UNTUK PETANI · NELAYAN · UMKM</span><h2>Produk Anda punya tempat di sini.</h2><p>Buka toko, tampilkan katalog, kelola stok dan pesanan dalam satu tempat.</p></div>
          <Link className="pn-btn-primary" href="/seller">Mulai berjualan <span>→</span></Link>
        </section>
      </div>

      <footer className="pn-footer">
        <div className="pn-wrap pn-footer-main">
          <Link className="pn-logo pn-footer-logo" href="/"><span className="pn-logo-icon">N</span><span className="pn-logo-type">PASAR<span>NUSA</span><small>HASIL NUSANTARA, SATU PASAR</small></span></Link>
          <p>Mempertemukan komoditas lokal dengan peluang pasar yang lebih luas.</p>
          <div className="pn-footer-links"><Link href="/katalog">Katalog</Link><Link href="/seller">Untuk penjual</Link><Link href="/studio">Studio produk</Link><Link href="/pesanan">Pesanan</Link><Link href="/masuk">Akun saya</Link></div>
        </div>
        <div className="pn-wrap pn-footer-bottom"><span>© {new Date().getFullYear()} Pasar Nusa</span><span>Dibangun untuk tumbuh bersama pelaku usaha Indonesia.</span></div>
      </footer>
    </main>
  );
}
