"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  description: string | null;
  brand: string | null;
  unit_label: string;
  price_idr: number | string;
  stores: { name: string; slug: string } | null;
};

type CartItem = { product_id: string; quantity: number; name: string; price_idr: number; unit_label: string };
const CART_KEY = "pasar-nusa-cart";
const FAVORITES_KEY = "pasar-nusa-favorites";
const rupiah = (value: number | string) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value));
function visual(product: Product) {
  const text = (product.name + " " + (product.description ?? "")).toLocaleLowerCase("id-ID");
  if (/ikan|udang|cumi|kepiting|bandeng|lele|nila|gurami|laut|teri|kerang/.test(text)) return "🐟";
  if (/sayur|bayam|kangkung|wortel|cabai|cabe|tomat|kentang/.test(text)) return "🥬";
  if (/buah|pisang|mangga|jeruk|apel|alpukat/.test(text)) return "🍊";
  if (/kopi|teh|kakao|cokelat/.test(text)) return "☕";
  if (/beras|padi|gabah|jagung|gandum/.test(text)) return "🌾";
  if (/kelapa|sawit|karet|cengkeh|lada|merica|pala|vanili|rempah|jahe|kunyit|kunir|kencur/.test(text)) return "🌿";
  return "🧺";
}

export default function HomeProductShelf() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try { setFavorites(JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]") as string[]); } catch { setFavorites([]); }
    let alive = true;
    async function load() {
      const supabase = createClient();
      if (!supabase) { setLoading(false); return; }
      const { data, error } = await supabase.from("products")
        .select("id,name,description,brand,unit_label,price_idr,stores(name,slug)")
        .eq("status", "active").order("created_at", { ascending: false }).limit(6);
      if (alive && !error) setProducts((data ?? []) as unknown as Product[]);
      if (alive) setLoading(false);
    }
    void load();
    return () => { alive = false; };
  }, []);

  function toggleFavorite(id: string) {
    const next = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
    setFavorites(next);
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(next)); } catch { setNotice("Favorit tidak dapat disimpan di perangkat ini."); }
  }

  function addToCart(product: Product) {
    try {
      const items = JSON.parse(localStorage.getItem(CART_KEY) || "[]") as CartItem[];
      const existing = items.find(item => item.product_id === product.id);
      if (existing) existing.quantity = Math.min(existing.quantity + 1, 10000);
      else items.push({ product_id: product.id, quantity: 1, name: product.name, price_idr: Number(product.price_idr), unit_label: product.unit_label });
      localStorage.setItem(CART_KEY, JSON.stringify(items));
      setNotice(product.name + " ditambahkan ke keranjang.");
    } catch { setNotice("Keranjang tidak dapat disimpan di perangkat ini."); }
  }

  return <section className="home-products" aria-labelledby="home-products-title">
    <div className="home-products-heading"><div><span className="shop-eyebrow">BARU DI PASAR</span><h2 id="home-products-title">Pilihan dari pedagang lokal.</h2><p>Produk aktif dari toko yang telah disetujui, diperbarui dari katalog Pasar Nusa.</p></div><Link href="/katalog">Jelajahi semua produk <span>→</span></Link></div>
    {notice && <p className="home-product-notice" role="status">{notice}</p>}
    {loading ? <div className="home-products-state">Memuat produk terbaru…</div> : products.length === 0 ? <div className="home-products-empty"><span>🧺</span><div><strong>Pasar sedang disiapkan.</strong><p>Produk akan muncul di sini setelah pedagang mengaktifkan katalog mereka.</p></div><Link href="/seller">Mulai berjualan →</Link></div> : <div className="home-product-grid">{products.map(product => <article className="home-product-card" key={product.id}><Link href="/katalog" className="home-product-visual" aria-label={"Jelajahi " + product.name}><span>{visual(product)}</span><small>PRODUK LOKAL</small></Link><div className="home-product-info"><div className="home-product-store">{product.stores?.name ?? "Pedagang lokal"}</div><div className="home-product-name-row"><h3>{product.name}</h3><button className={favorites.includes(product.id) ? "favorite-button is-favorite" : "favorite-button"} type="button" onClick={() => toggleFavorite(product.id)} aria-label={favorites.includes(product.id) ? "Hapus dari favorit" : "Tambahkan ke favorit"} aria-pressed={favorites.includes(product.id)}>{favorites.includes(product.id) ? "♥" : "♡"}</button></div><p>{product.description || "Informasi produk dari pedagang."}</p><strong className="home-product-price">{rupiah(product.price_idr)} <small>/ {product.unit_label}</small></strong><button className="home-product-add" type="button" onClick={() => addToCart(product)}>＋ Tambah ke keranjang</button></div></article>)}</div>}
  </section>;
}
