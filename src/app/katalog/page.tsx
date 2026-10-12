"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  description: string;
  brand: string | null;
  unit_label: string;
  price_idr: number | string;
  stores: { name: string; slug: string } | null;
};

const rupiah = (value: number | string) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0
}).format(Number(value));

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [cartNotice, setCartNotice] = useState("");

  useEffect(() => {
    try { const stored = JSON.parse(localStorage.getItem("pasar-nusa-cart") || "[]") as { quantity: number }[]; setCartCount(stored.reduce((sum, item) => sum + item.quantity, 0)); } catch { setCartCount(0); }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSearchQuery(params.get("q") ?? "");
  }, []);

  function addToCart(product: Product) {
    try {
      const stored = JSON.parse(localStorage.getItem("pasar-nusa-cart") || "[]") as { product_id: string; quantity: number; name: string; price_idr: number; unit_label: string }[];
      const found = stored.find(item => item.product_id === product.id);
      if (found) found.quantity = Math.min(found.quantity + 1, 10000);
      else stored.push({ product_id: product.id, quantity: 1, name: product.name, price_idr: Number(product.price_idr), unit_label: product.unit_label });
      localStorage.setItem("pasar-nusa-cart", JSON.stringify(stored));
      setCartCount(stored.reduce((sum, item) => sum + item.quantity, 0));
      setCartNotice(product.name + " ditambahkan ke keranjang.");
    } catch { setError("Keranjang tidak dapat disimpan di perangkat ini."); }
  }

  useEffect(() => {
    let alive = true;
    async function load() {
      const supabase = createClient();
      if (!supabase) {
        setError("Katalog belum tersambung. Konfigurasi Supabase diperlukan pada lingkungan aplikasi.");
        setLoading(false);
        return;
      }
      const { data, error: queryError } = await supabase
        .from("products")
        .select("id,name,description,brand,unit_label,price_idr,stores(name,slug)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(60);
      if (!alive) return;
      if (queryError) setError("Katalog belum dapat dimuat. Silakan coba lagi nanti.");
      else setProducts((data ?? []) as unknown as Product[]);
      setLoading(false);
    }
    void load();
    return () => { alive = false; };
  }, []);

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("id-ID");
  const productCategory = (product: Product) => {
    const text = (product.name + " " + product.description + " " + (product.brand ?? "")).toLocaleLowerCase("id-ID");
    if (/ikan|udang|cumi|kepiting|bandeng|lele|nila|gurami|laut|teri|kerang|rumput laut/.test(text)) return "Perikanan";
    if (/sayur|buah|cabai|cabe|tomat|wortel|bayam|kangkung|pisang|mangga|jeruk|apel|alpukat|singkong|kentang/.test(text)) return "Sayur & buah";
    if (/kopi|teh|kakao|cokelat|kelapa|sawit|karet|cengkeh|lada|merica|pala|vanili|rempah|jahe|kunyit|kunir|kencur|kapulaga/.test(text)) return "Perkebunan";
    return "Pangan & olahan";
  };
  const productVisual = (product: Product) => {
    const text = (product.name + " " + product.description).toLocaleLowerCase("id-ID");
    if (/ikan|udang|cumi|kepiting|bandeng|lele|nila|gurami|laut|teri|kerang/.test(text)) return "🐟";
    if (/sayur|bayam|kangkung|wortel|cabai|cabe|tomat|kentang/.test(text)) return "🥬";
    if (/buah|pisang|mangga|jeruk|apel|alpukat/.test(text)) return "🍊";
    if (/kopi|teh|kakao|cokelat/.test(text)) return "☕";
    if (/beras|padi|gabah|jagung|gandum/.test(text)) return "🌾";
    if (/kelapa|sawit|karet|cengkeh|lada|merica|pala|vanili|rempah|jahe|kunyit|kunir|kencur/.test(text)) return "🌿";
    return "🧺";
  };
  const categories = ["Semua", "Sayur & buah", "Perkebunan", "Perikanan", "Pangan & olahan"];
  const filteredProducts = products
    .filter(product => selectedCategory === "Semua" || productCategory(product) === selectedCategory)
    .filter(product => !normalizedQuery || normalizedQuery.split(/\s+/).some(term =>
      [product.name, product.description, product.brand ?? "", product.stores?.name ?? ""]
        .some(value => value.toLocaleLowerCase("id-ID").includes(term))
    ))
    .sort((a,b) => sortBy === "price-asc" ? Number(a.price_idr)-Number(b.price_idr)
      : sortBy === "price-desc" ? Number(b.price_idr)-Number(a.price_idr)
      : sortBy === "name" ? a.name.localeCompare(b.name,"id")
      : 0);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const navCategories = [
    { title: "Sayur & buah", query: "sayur" },
    { title: "Beras & pangan", query: "beras" },
    { title: "Hasil perikanan", query: "ikan" },
    { title: "Perkebunan & rempah", query: "rempah" },
  ];

  return <main className="pn-market catalog-page" data-build="pasar-nusa-shared-storefront-2026-10-12">
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
        <input name="q" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Cari beras, cabai, ikan, kopi..." aria-label="Cari produk" />
        <button type="submit">Cari produk</button>
      </form>
      <div className="pn-header-links">
        <Link href="/masuk"><span className="pn-line-icon">♙</span><span>Masuk<small>Akun saya</small></span></Link>
        <Link href="/keranjang"><span className="pn-line-icon">🛒</span><span>Keranjang<small>{cartCount} barang</small></span></Link>
      </div>
    </header>
    <nav className="pn-main-nav" aria-label="Navigasi utama">
      <div className="pn-wrap pn-main-nav-inner">
        <Link className="pn-nav-all" href="/katalog">☷ <span>Jelajahi pasar</span></Link>
        {navCategories.map(item => <Link key={item.title} href={"/katalog?q=" + encodeURIComponent(item.query)}>{item.title}</Link>)}
        <Link className="pn-nav-seller" href="/seller">Untuk penjual <span>↗</span></Link>
      </div>
    </nav>
    <section className="catalog-hero"><span className="eyebrow">JELAJAHI PASAR</span><h1>Temukan produk<br/><em>dari pedagang lokal.</em></h1><p>Katalog menampilkan produk aktif dari toko yang telah disetujui.</p></section>
    <section className="catalog-content"><div className="catalog-toolbar"><label className="catalog-search-field"><span aria-hidden="true">⌕</span><input type="search" value={searchQuery} onChange={event=>setSearchQuery(event.target.value)} placeholder="Cari nama produk, merek, atau pedagang..." aria-label="Cari katalog"/></label><label className="catalog-sort">Urutkan<select value={sortBy} onChange={event=>setSortBy(event.target.value)}><option value="newest">Terbaru</option><option value="price-asc">Harga terendah</option><option value="price-desc">Harga tertinggi</option><option value="name">Nama A–Z</option></select></label></div><div className="catalog-category-filters" role="group" aria-label="Filter kategori">{categories.map(category => <button key={category} type="button" className={selectedCategory === category ? "category-filter active" : "category-filter"} aria-pressed={selectedCategory === category} onClick={() => setSelectedCategory(category)}>{category}</button>)}</div><div className="catalog-heading"><h2>{normalizedQuery ? "Hasil pencarian" : selectedCategory === "Semua" ? "Produk tersedia" : selectedCategory}</h2><span>{filteredProducts.length} produk</span></div>{cartNotice && <p className="cart-feedback" role="status"><span aria-hidden="true">✓</span> {cartNotice} <Link href="/keranjang">Lihat keranjang →</Link></p>}
      {loading ? <div className="catalog-state">Memuat katalog...</div> : error ? <div className="catalog-state"><strong>Belum siap ditampilkan</strong><p>{error}</p></div> : products.length === 0 ? <div className="catalog-state"><span className="empty-icon">🧺</span><strong>Pasar sedang disiapkan.</strong><p>Produk akan tampil setelah pedagang dan katalog pertama selesai diverifikasi.</p><Link className="button button-outline" href="/masuk">Daftar atau masuk</Link></div> : filteredProducts.length === 0 ? <div className="catalog-state"><span className="empty-icon">⌕</span><strong>Belum ada produk yang cocok.</strong><p>Coba kata kunci lain atau hapus pencarian untuk melihat semua produk aktif.</p><button className="button button-outline" type="button" onClick={()=>setSearchQuery("")}>Hapus pencarian</button></div> : <div className="product-grid">{filteredProducts.map(product=><article className="product-card" key={product.id}><div className="product-visual" aria-hidden="true"><span className="product-visual-mark">{productVisual(product)}</span><span className="product-category-pill">{productCategory(product)}</span></div><div className="product-info"><span className="product-store">{product.stores?.name ?? "Pedagang Pasar-Nusa"}</span><h3>{product.name}</h3>{product.brand && <p className="product-brand">{product.brand}</p>}<p className="product-description">{product.description || "Informasi produk dari pedagang."}</p><div className="product-price-row"><strong>{rupiah(product.price_idr)} <small>/ {product.unit_label}</small></strong></div><button className="add-cart" type="button" onClick={()=>addToCart(product)}><span aria-hidden="true">＋</span> Tambah ke keranjang</button></div></article>)}</div>}
    </section>
    <footer><Link className="brand brand-footer" href="/"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Pedagang Ecer, Pelayanan Sultan.</small></span></Link><span>© {new Date().getFullYear()} Pasar-Nusa</span></footer>
  </main>;
}