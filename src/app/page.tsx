import Link from "next/link";
import HomeProductShelf from "@/components/home-product-shelf";

const categories = [
  { icon: "🥬", title: "Sayur & buah", desc: "Panen segar langsung dari kebun", query: "sayur", tone: "leaf" },
  { icon: "🌾", title: "Beras & pangan", desc: "Bahan pokok untuk rumah dan usaha", query: "beras", tone: "grain" },
  { icon: "🐟", title: "Hasil perikanan", desc: "Hasil laut dan budidaya lokal", query: "ikan", tone: "sea" },
  { icon: "🌿", title: "Perkebunan & rempah", desc: "Komoditas khas dari Nusantara", query: "rempah", tone: "spice" },
];

const benefits = [
  { icon: "✓", title: "Harga transparan", desc: "Informasi harga dan satuan jelas sejak awal." },
  { icon: "⌂", title: "Dukung usaha lokal", desc: "Belanja membantu petani, nelayan, dan UMKM." },
  { icon: "↗", title: "Dari eceran ke grosir", desc: "Temukan pasokan untuk kebutuhan rumah dan usaha." },
];

export default function HomePage() {
  return (
    <main className="storefront">
      <div className="storefront-promo"><span>SELAMAT DATANG DI PASAR NUSA</span><span>Pasar lokal, peluang nasional <b>✳</b></span><Link href="/katalog">Mulai belanja <span aria-hidden="true">→</span></Link></div>
      <header className="store-header">
        <Link className="store-logo" href="/" aria-label="Pasar Nusa beranda"><span className="store-logo-mark">P</span><span>pasar<span>nusa</span><small>HASIL NUSANTARA, SATU PASAR</small></span></Link>
        <form className="store-search" action={`${process.env.PASAR_NUSA_BASE_PATH ?? ""}/katalog`} method="get"><span aria-hidden="true">⌕</span><input id="store-q" name="q" placeholder="Cari beras, sayur, ikan, rempah..." aria-label="Cari produk"/><button type="submit">Cari produk</button></form>
        <div className="store-header-actions"><Link href="/masuk" aria-label="Masuk ke akun"><span>♙</span><small>Akun saya</small></Link><Link href="/keranjang" aria-label="Buka keranjang"><span>🛒</span><small>Keranjang</small></Link></div>
      </header>
      <nav className="store-nav" aria-label="Navigasi kategori"><Link className="nav-all" href="/katalog">☰ Semua kategori</Link><Link href="/katalog?q=sayur">Sayur & buah</Link><Link href="/katalog?q=beras">Beras & pangan</Link><Link href="/katalog?q=ikan">Hasil perikanan</Link><Link href="/katalog?q=rempah">Perkebunan & rempah</Link><Link href="/seller">Jadi penjual <span aria-hidden="true">↗</span></Link></nav>

      <section className="shop-hero">
        <div className="shop-hero-copy"><span className="shop-kicker"><i/> PASAR LOKAL, KUALITAS PILIHAN</span><h1>Hasil terbaik<br/>dari <em>bumi Nusantara.</em></h1><p>Belanja hasil tani, kebun, laut, dan produk UMKM dalam satu tempat. Dukung usaha lokal, tumbuh bersama.</p><div className="shop-hero-actions"><Link className="shop-primary-btn" href="/katalog">Jelajahi produk <span>→</span></Link><Link className="shop-secondary-btn" href="/seller">Mulai berjualan</Link></div><div className="shop-hero-points"><span>✓ Harga jelas</span><span>✓ Produk dari pedagang lokal</span></div></div>
        <div className="shop-hero-art"><div className="shop-art-sun"/><div className="shop-art-orbit orbit-one"/><div className="shop-art-orbit orbit-two"/><img src={`${process.env.PASAR_NUSA_BASE_PATH ?? ""}/hero-hasil-nusantara.svg`} alt="Ilustrasi keranjang hasil panen Nusantara" /><div className="shop-art-sticker"><span>✳</span><b>Dari lokal,<br/>untuk semua.</b></div><div className="shop-art-caption"><span>HASIL PILIHAN</span><b>Segar. Lokal. Bernilai.</b></div></div>
      </section>

      <section className="shop-benefits" aria-label="Keunggulan Pasar Nusa">{benefits.map(item=><div className="shop-benefit" key={item.title}><span className="shop-benefit-icon">{item.icon}</span><div><b>{item.title}</b><p>{item.desc}</p></div></div>)}</section>

      <section className="shop-section" id="kategori"><div className="shop-section-head"><div><span className="shop-eyebrow">JELAJAHI PASAR</span><h2>Belanja sesuai kebutuhan</h2><p>Temukan komoditas pilihan dari pelaku usaha Indonesia.</p></div><Link href="/katalog">Lihat semua produk <span>→</span></Link></div><div className="shop-category-grid">{categories.map(item=><Link className={`shop-category-card ${item.tone}`} href={`/katalog?q=${encodeURIComponent(item.query)}`} key={item.title}><span className="shop-category-art" aria-hidden="true">{item.icon}</span><span className="shop-category-arrow">↗</span><b>{item.title}</b><p>{item.desc}</p><span className="shop-category-link">Jelajahi kategori <span>→</span></span></Link>)}</div></section>

      <HomeProductShelf />

      <section className="shop-seller-banner"><div className="seller-banner-mark">✳</div><div><span className="shop-eyebrow">UNTUK PETANI, NELAYAN & UMKM</span><h2>Produk lokal layak dikenal lebih luas.</h2><p>Bawa produk dan hasil usaha Anda ke pasar digital yang dirancang untuk tumbuh bersama.</p></div><Link className="shop-primary-btn" href="/seller">Mulai berjualan <span>→</span></Link></section>

      <section className="shop-trust-section"><div><span className="shop-eyebrow">BELANJA DENGAN TENANG</span><h2>Pasar yang dibangun<br/>di atas kepercayaan.</h2></div><div className="shop-trust-list"><p><span>01</span><b>Informasi produk yang jelas</b><small>Harga, satuan, dan deskripsi ditampilkan secara transparan.</small></p><p><span>02</span><b>Stok dikonfirmasi penjual</b><small>Pesanan diproses sesuai konfirmasi dan ketersediaan.</small></p><p><span>03</span><b>Transaksi lebih tertata</b><small>Alur pesanan dirancang agar pembeli dan pedagang lebih mudah berkoordinasi.</small></p></div></section>
      <footer className="shop-footer"><Link className="store-logo" href="/"><span className="store-logo-mark">P</span><span>pasar<span>nusa</span><small>HASIL NUSANTARA, SATU PASAR</small></span></Link><span>© {new Date().getFullYear()} Pasar Nusa</span><span>Dibangun untuk tumbuh bersama pelaku usaha Indonesia.</span></footer>
    </main>
  );
}
