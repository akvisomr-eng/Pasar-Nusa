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

  useEffect(() => {
    try { const stored = JSON.parse(localStorage.getItem("pasar-nusa-cart") || "[]") as { quantity: number }[]; setCartCount(stored.reduce((sum, item) => sum + item.quantity, 0)); } catch { setCartCount(0); }
  }, []);

  function addToCart(product: Product) {
    try {
      const stored = JSON.parse(localStorage.getItem("pasar-nusa-cart") || "[]") as { product_id: string; quantity: number; name: string; price_idr: number; unit_label: string }[];
      const found = stored.find(item => item.product_id === product.id);
      if (found) found.quantity = Math.min(found.quantity + 1, 10000);
      else stored.push({ product_id: product.id, quantity: 1, name: product.name, price_idr: Number(product.price_idr), unit_label: product.unit_label });
      localStorage.setItem("pasar-nusa-cart", JSON.stringify(stored));
      setCartCount(stored.reduce((sum, item) => sum + item.quantity, 0));
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

  return <main className="catalog-page">
    <header className="topbar"><Link className="brand" href="/"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Pasar lokal, peluang nasional</small></span></Link><nav><Link href="/">Beranda</Link><Link href="/masuk">Masuk / Daftar</Link></nav><div className="catalog-actions"><Link className="button button-outline" href="/keranjang">Keranjang ({cartCount})</Link><Link className="button button-outline" href="/masuk">Akun saya</Link></div></header>
    <section className="catalog-hero"><span className="eyebrow">JELAJAHI PASAR</span><h1>Temukan produk<br/><em>dari pedagang lokal.</em></h1><p>Katalog menampilkan produk aktif dari toko yang telah disetujui.</p></section>
    <section className="catalog-content"><div className="catalog-heading"><h2>Produk tersedia</h2><span>{products.length} produk</span></div>
      {loading ? <div className="catalog-state">Memuat katalog...</div> : error ? <div className="catalog-state"><strong>Belum siap ditampilkan</strong><p>{error}</p></div> : products.length === 0 ? <div className="catalog-state"><span className="empty-icon">🧺</span><strong>Pasar sedang disiapkan.</strong><p>Produk akan tampil setelah pedagang dan katalog pertama selesai diverifikasi.</p><Link className="button button-outline" href="/masuk">Daftar atau masuk</Link></div> : <div className="product-grid">{products.map(product=><article className="product-card" key={product.id}><div className="product-placeholder">🛍️</div><div className="product-info"><span className="product-store">{product.stores?.name ?? "Pedagang Pasar-Nusa"}</span><h3>{product.name}</h3>{product.brand && <p className="product-brand">{product.brand}</p>}<p className="product-description">{product.description || "Informasi produk dari pedagang."}</p><strong>{rupiah(product.price_idr)} <small>/ {product.unit_label}</small></strong><button className="add-cart" type="button" onClick={()=>addToCart(product)}>Tambah ke keranjang +</button></div></article>)}</div>}
    </section>
    <footer><Link className="brand brand-footer" href="/"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Pedagang Ecer, Pelayanan Sultan.</small></span></Link><span>© {new Date().getFullYear()} Pasar-Nusa</span></footer>
  </main>;
}