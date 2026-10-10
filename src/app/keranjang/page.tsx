"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CartItem = { product_id: string; quantity: number; name: string; price_idr: number; unit_label: string };
const CART_KEY = "pasar-nusa-cart";
const rupiah = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(CART_KEY) || "[]") as CartItem[]); } catch { setItems([]); }
  }, []);

  function save(next: CartItem[]) {
    setItems(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  }

  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.price_idr) * item.quantity, 0), [items]);

  async function checkout() {
    setMessage("");
    if (items.length === 0) { setMessage("Keranjang masih kosong."); return; }
    if (note.length > 1000) { setMessage("Catatan maksimal 1.000 karakter."); return; }
    const supabase = createClient();
    if (!supabase) { setMessage("Layanan pesanan belum dikonfigurasi."); return; }
    setBusy(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) { router.push("/masuk"); return; }
      const idempotencyKey = crypto.randomUUID();
      const { data, error } = await supabase.rpc("checkout_order", {
        p_items: items.map(item => ({ product_id: item.product_id, quantity: item.quantity })),
        p_buyer_note: note.trim(),
        p_idempotency_key: idempotencyKey
      });
      if (error) throw error;
      localStorage.removeItem(CART_KEY);
      router.push("/pesanan/" + encodeURIComponent(String(data)));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Pesanan belum dapat dibuat. Periksa stok dan coba lagi.");
    } finally { setBusy(false); }
  }

  return <main className="catalog-page">
    <header className="topbar"><Link className="brand" href="/"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Pedagang Ecer, Pelayanan Sultan.</small></span></Link><nav><Link href="/katalog">Katalog</Link><Link href="/seller">Untuk penjual</Link></nav><Link className="button button-outline" href="/masuk">Akun saya</Link></header>
    <section className="catalog-hero cart-hero"><span className="eyebrow">KERANJANG BELANJA</span><h1>Periksa pesanan<br/><em>sebelum dikirim.</em></h1><p>Harga akhir dan stok akan divalidasi kembali di server saat pesanan dibuat.</p></section>
    <section className="cart-layout">
      <div className="cart-items"><div className="catalog-heading"><h2>Barang pilihan</h2><span>{items.length} jenis produk</span></div>
        {items.length === 0 ? <div className="catalog-state"><span className="empty-icon">🧺</span><strong>Keranjang masih kosong.</strong><p>Jelajahi katalog untuk memilih produk.</p><Link className="button button-dark" href="/katalog">Buka katalog</Link></div> : items.map(item=><article className="cart-row" key={item.product_id}><div className="cart-product-icon">🛍️</div><div className="cart-product-main"><strong>{item.name}</strong><span>{rupiah(Number(item.price_idr))} / {item.unit_label}</span><div className="quantity-controls"><button type="button" aria-label="Kurangi jumlah" onClick={()=>save(items.map(x=>x.product_id===item.product_id?{...x,quantity:Math.max(1,x.quantity-1)}:x))}>−</button><span>{item.quantity}</span><button type="button" aria-label="Tambah jumlah" onClick={()=>save(items.map(x=>x.product_id===item.product_id?{...x,quantity:Math.min(10000,x.quantity+1)}:x))}>+</button></div></div><div className="cart-line-end"><strong>{rupiah(Number(item.price_idr)*item.quantity)}</strong><button type="button" className="remove-item" onClick={()=>save(items.filter(x=>x.product_id!==item.product_id))}>Hapus</button></div></article>)}
      </div>
      <aside className="checkout-card"><h2>Ringkasan</h2><div className="checkout-total"><span>Subtotal perkiraan</span><strong>{rupiah(total)}</strong></div><p className="checkout-disclaimer">Belum termasuk biaya pengiriman. Pasar-Nusa tidak akan mengganti penjual atau produk tanpa persetujuan Anda.</p><label className="checkout-note">Catatan untuk penjual<textarea value={note} onChange={e=>setNote(e.target.value)} maxLength={1000} rows={3} placeholder="Instruksi tambahan (opsional)" /></label><button type="button" className="button checkout-button" disabled={busy || items.length===0} onClick={checkout}>{busy ? "Memproses pesanan..." : "Buat pesanan"} <span>→</span></button>{message && <p className="auth-message" role="status">{message}</p>}<p className="checkout-disclaimer">Pembayaran belum diaktifkan. Pesanan hanya diteruskan ke pedagang untuk konfirmasi stok.</p></aside>
    </section>
    <footer><Link className="brand brand-footer" href="/"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Pedagang Ecer, Pelayanan Sultan.</small></span></Link><span>© {new Date().getFullYear()} Pasar-Nusa</span></footer>
  </main>;
}