import Link from "next/link";
import HomeProductShelf from "@/components/home-product-shelf";

const categories = [
  { icon: "🥬", title: "Sayur & buah", detail: "Segar dari kebun", query: "sayur", tone: "leaf" },
  { icon: "🌾", title: "Beras & pangan", detail: "Pangan pilihan", query: "beras", tone: "grain" },
  { icon: "🐟", title: "Hasil perikanan", detail: "Laut & budidaya", query: "ikan", tone: "sea" },
  { icon: "🌶️", title: "Rempah & bumbu", detail: "Aroma Nusantara", query: "rempah", tone: "spice" },
  { icon: "☕", title: "Perkebunan", detail: "Kopi, kakao, kelapa", query: "kopi", tone: "estate" },
  { icon: "🥜", title: "UMKM & olahan", detail: "Produk lokal", query: "olahan", tone: "craft" },
];

export default function HomePage() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return (
    <main className="pn-market" data-build="pasar-nusa-khareedo-erpcrm-2026-10-11">
      <div className="pn-topline"><div className="pn-wrap"><span>Pasar digital komoditas Indonesia</span><span className="pn-topline-right">Dukung petani, nelayan & UMKM lokal <i>✳</i> <Link href="/seller">Buka toko gratis ↗</Link></span></div></div>
      <header className="pn-header pn-wrap">
        <Link className="pn-logo" href="/" aria-label="Pasar Nusa beranda"><span className="pn-logo-icon">N</span><span className="pn-logo-type">PASAR<span>NUSA</span><small>HASIL NUSANTARA, SATU PASAR</small></span></Link>
        <form className="pn-search" action={`${basePath}/katalog`} method="get"><select aria-label="Kategori pencarian" defaultValue="all"><option value="all">Semua kategori</option><option value="pangan">Pangan</option><option value="perikanan">Perikanan</option><option value="perkebunan">Perkebunan</option></select><input name="q" placeholder="Cari beras, cabai, ikan, kopi..." aria-label="Cari produk"/><button type="submit" aria-label="Cari">⌕</button></form>
        <div className="pn-header-links"><Link href="/masuk"><span className="pn-line-icon">♙</span><span>Masuk<small>Akun saya</small></span></Link><Link href="/keranjang"><span className="pn-line-icon">🛒</span><span>Keranjang<small>Produk pilihan</small></span></Link></div>
      </header>
      <nav className="pn-main-nav"><div className="pn-wrap"><Link className="pn-nav-all" href="/katalog">☰ <span>Semua kategori</span></Link><Link href="/katalog?q=sayur">Sayur & Buah</Link><Link href="/katalog?q=beras">Beras & Pangan</Link><Link href="/katalog?q=ikan">Perikanan</Link><Link href="/katalog?q=rempah">Rempah</Link><Link href="/katalog?q=kopi">Perkebunan</Link><Link href="/seller">Untuk Penjual ↗</Link></div></nav>
      <div className="pn-wrap pn-page">
        <div className="pn-breadcrumb"><span>Beranda</span><b>/</b><span>Marketplace Nusantara</span></div>
        <section className="pn-hero-layout">
          <aside className="pn-category-menu"><h2>Jelajahi kategori</h2>{categories.map((item)=><Link key={item.title} href={`/katalog?q=${encodeURIComponent(item.query)}`}><span className={`pn-menu-icon ${item.tone}`}>{item.icon}</span><span>{item.title}<small>{item.detail}</small></span><b>›</b></Link>)}<Link className="pn-all-categories" href="/katalog">Lihat semua kategori <span>→</span></Link></aside>
          <div className="pn-hero-stack">
            <section className="pn-hero-banner">
              <div className="pn-hero-copy"><span className="pn-label"><i/> PASAR LOKAL, PELUANG NASIONAL</span><h1>Belanja hasil bumi<br/>jadi <em>lebih mudah.</em></h1><p>Temukan hasil pertanian, perkebunan, perikanan, dan produk UMKM dari pelaku usaha Indonesia.</p><div className="pn-hero-buttons"><Link className="pn-btn-red" href="/katalog">Mulai belanja <span>→</span></Link><Link className="pn-text-link" href="/seller">Saya ingin berjualan ↗</Link></div><div className="pn-hero-trust"><span>✓ Harga dan satuan jelas</span><span>✓ Dukung usaha lokal</span></div></div>
              <div className="pn-hero-visual"><div className="pn-visual-circle"></div><div className="pn-visual-sun">✳</div><img src={`${basePath}/hero-hasil-nusantara.svg`} alt="Ilustrasi hasil bumi Nusantara"/><div className="pn-visual-tag"><b>100%</b><span>semangat lokal</span></div><div className="pn-visual-stamp">HASIL<br/>NUSANTARA</div></div>
              <div className="pn-hero-pagination"><i className="active"/><i/><i/></div>
            </section>
            <div className="pn-promo-pair"><Link href="/katalog?q=beras" className="pn-promo-card pn-promo-grain"><span className="pn-promo-overline">KEBUTUHAN PANGAN</span><b>Penuhi stok<br/>usaha Anda.</b><span className="pn-promo-cta">Cari produk <i>↗</i></span><span className="pn-promo-art">🌾</span></Link><Link href="/seller" className="pn-promo-card pn-promo-seller"><span className="pn-promo-overline">UNTUK PELAKU USAHA</span><b>Bawa produk lokal<br/>ke pasar yang luas.</b><span className="pn-promo-cta">Mulai jualan <i>↗</i></span><span className="pn-promo-art">🧺</span></Link></div>
          </div>
        </section>
        <section className="pn-service-strip"><div><span>✓</span><p><b>Belanja lebih praktis</b><small>Produk dalam satu katalog</small></p></div><div><span>♧</span><p><b>Langsung dukung lokal</b><small>Petani, nelayan & UMKM</small></p></div><div><span>▤</span><p><b>Informasi transparan</b><small>Harga dan satuan terlihat</small></p></div><div><span>↗</span><p><b>Pasar untuk bertumbuh</b><small>Eceran maupun kebutuhan usaha</small></p></div></section>
        <section className="pn-categories-section"><div className="pn-section-title"><div><span className="pn-section-kicker">PILIHAN UNTUK ANDA</span><h2>Belanja berdasarkan kategori</h2></div><Link href="/katalog">Semua kategori <b>→</b></Link></div><div className="pn-category-grid">{categories.map(item=><Link key={item.title} href={`/katalog?q=${encodeURIComponent(item.query)}`} className="pn-category-tile"><span className={`pn-category-illustration ${item.tone}`}>{item.icon}</span><b>{item.title}</b><small>{item.detail}</small></Link>)}</div></section>
        <section className="pn-product-section"><div className="pn-section-title"><div><span className="pn-section-kicker">DARI TOKO PILIHAN</span><h2>Produk untuk kebutuhan Anda</h2><p>Jelajahi produk aktif yang tersedia di Pasar Nusa.</p></div><Link href="/katalog">Lihat katalog <b>→</b></Link></div><HomeProductShelf /></section>
        <section className="pn-seller-band"><div className="pn-seller-symbol">✳</div><div><span className="pn-section-kicker">PETANI · NELAYAN · UMKM</span><h2>Produk lokal layak dikenal lebih luas.</h2><p>Bangun etalase digital, kelola katalog, stok, dan pesanan usaha Anda.</p></div><Link className="pn-btn-red" href="/seller">Daftarkan toko <span>→</span></Link></section>
      </div>
      <footer className="pn-footer"><div className="pn-wrap pn-footer-main"><Link className="pn-logo pn-footer-logo" href="/"><span className="pn-logo-icon">N</span><span className="pn-logo-type">PASAR<span>NUSA</span><small>HASIL NUSANTARA, SATU PASAR</small></span></Link><p>Mempertemukan komoditas lokal dengan peluang pasar yang lebih luas.</p><div className="pn-footer-links"><Link href="/katalog">Katalog</Link><Link href="/seller">Untuk penjual</Link><Link href="/pesanan">Pesanan</Link><Link href="/masuk">Akun</Link></div></div><div className="pn-wrap pn-footer-bottom"><span>© {new Date().getFullYear()} Pasar Nusa</span><span>Dibangun untuk tumbuh bersama pelaku usaha Indonesia.</span></div></footer>
    </main>
  );
}
