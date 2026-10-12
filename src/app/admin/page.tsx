"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
type Store={id:string;name:string;slug:string;description:string;status:string;owner_id:string};
type Product={id:string;name:string;description:string;price_idr:number|string;status:string;store_id:string;stores:{name:string;status:string}|null};
type AdminOrderItem={id:string;product_name_snapshot:string;quantity:number;unit_price_idr:number|string;status:string;store_id:string;orders:{id:string;buyer_id:string;status:string;created_at:string}|null;stores:{name:string}|null};
type AdminInventory={product_id:string;on_hand:number;reserved:number;products:{store_id:string}|null};
const rupiah=(v:number|string)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(v));
export default function AdminPage(){
 const [loading,setLoading]=useState(true),[allowed,setAllowed]=useState(false),[stores,setStores]=useState<Store[]>([]),[products,setProducts]=useState<Product[]>([]),[orderItems,setOrderItems]=useState<AdminOrderItem[]>([]),[inventoryRows,setInventoryRows]=useState<AdminInventory[]>([]),[message,setMessage]=useState(""),[busy,setBusy]=useState(false),[storeSearch,setStoreSearch]=useState(""),[productSearch,setProductSearch]=useState("");
 const refresh=useCallback(async()=>{
  const supabase=createClient();if(!supabase){setMessage("Supabase belum dikonfigurasi.");setLoading(false);return;}
  const {data:userData}=await supabase.auth.getUser();if(!userData.user){setMessage("Masuk dengan akun administrator.");setLoading(false);return;}
  const {data:profile}=await supabase.from("profiles").select("role").eq("id",userData.user.id).maybeSingle();
  if(profile?.role!=="platform_admin"){setAllowed(false);setMessage("Akun ini belum memiliki peran administrator platform.");setLoading(false);return;}
  setAllowed(true);
  const [{data:storeRows,error:storeError},{data:productRows,error:productError},{data:orderRows},{data:inventoryData}]=await Promise.all([
   supabase.from("stores").select("id,name,slug,description,status,owner_id").in("status",["pending","active","paused","rejected"]).order("created_at",{ascending:false}),
   supabase.from("products").select("id,name,description,price_idr,status,store_id,stores(name,status)").in("status",["draft","active","paused","archived"]).order("created_at",{ascending:false}),
   supabase.from("order_items").select("id,product_name_snapshot,quantity,unit_price_idr,status,store_id,orders!inner(id,buyer_id,status,created_at),stores(name)").order("created_at",{ascending:false}).limit(500),
   supabase.from("inventory").select("product_id,on_hand,reserved,products!inner(store_id)").limit(1000)
  ]);
  if(storeError||productError)setMessage("Sebagian data dashboard gagal dimuat. Coba muat ulang.");
  setStores((storeRows??[]) as Store[]);setProducts((productRows??[]) as unknown as Product[]);setOrderItems((orderRows??[]) as unknown as AdminOrderItem[]);setInventoryRows((inventoryData??[]) as unknown as AdminInventory[]);setLoading(false);
 },[]);
 useEffect(()=>{void refresh();},[refresh]);
 async function moderate(kind:"store"|"product",id:string,status:string){
  const supabase=createClient();if(!supabase)return;setBusy(true);setMessage("");
  const {data,error}=kind==="store"?await supabase.rpc("admin_set_store_status",{p_store_id:id,p_status:status}):await supabase.rpc("admin_set_product_status",{p_product_id:id,p_status:status});
  if(error||data!==true)setMessage(error?.message??"Perubahan status tidak berhasil.");else{setMessage("Status berhasil diperbarui dan tercatat di audit.");await refresh();}setBusy(false);
 }
 const pendingStores=stores.filter(s=>s.status==="pending"),pendingProducts=products.filter(p=>p.status==="draft");
 const filteredStores=pendingStores.filter(s=>(s.name+" "+s.slug+" "+s.description).toLowerCase().includes(storeSearch.toLowerCase()));
 const filteredProducts=pendingProducts.filter(p=>(p.name+" "+(p.stores?.name??"")+" "+p.description).toLowerCase().includes(productSearch.toLowerCase()));
 if(loading)return <main className="seller-page"><div className="catalog-state">Memeriksa akses administrator...</div></main>;
 return <main className="seller-page admin-page">
  <header className="topbar"><Link className="brand" href="/" aria-label="Pasar Nusa beranda"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Pusat kendali platform</small></span></Link><nav aria-label="Navigasi admin"><a href="#ringkasan">Ringkasan</a><a href="#toko">Toko</a><a href="#produk">Produk</a><Link href="/seller">Ruang penjual</Link></nav><Link className="button button-outline" href="/">Lihat toko publik ↗</Link></header>
  <section className="admin-welcome" id="ringkasan"><div><span className="eyebrow">PUSAT OPERASIONAL · PASAR NUSA</span><h1>Selamat datang di<br/><em>ruang kendali.</em></h1><p>Awasi kualitas katalog dan onboarding penjual dari satu tempat. Keputusan moderasi menggunakan RPC terlindungi dan dicatat di audit.</p></div><div className="admin-welcome-art" aria-hidden="true"><span>PN</span><i>✳</i><b>EKOSISTEM<br/>DAGANG LOKAL</b></div></section>
  {message&&<p className="seller-message admin-message" role="status">{message}</p>}
  {!allowed?<section className="seller-workspace"><div className="review-notice"><strong>Akses administrator dibatasi.</strong><p>Peran platform_admin hanya dapat diberikan melalui proses bootstrap tepercaya di basis data. Akun biasa tidak dapat menaikkan hak aksesnya sendiri.</p><Link className="button button-dark" href="/masuk">Masuk / daftar akun</Link></div></section>:<>
   <section className="admin-dashboard"><div className="admin-section-heading"><div><span className="eyebrow">RINGKASAN OPERASIONAL</span><h2>Gambaran platform</h2></div><button className="admin-refresh" disabled={busy} onClick={()=>{setLoading(true);void refresh();}}>↻ Muat ulang</button></div>
    <div className="admin-metrics">
     <article className="admin-metric metric-attention"><span className="metric-icon">⌁</span><span className="metric-label">Toko menunggu</span><strong>{pendingStores.length}</strong><small>{pendingStores.length?"Perlu keputusan admin":"Semua toko ditinjau"}</small></article>
     <article className="admin-metric"><span className="metric-icon">▧</span><span className="metric-label">Toko terdaftar</span><strong>{stores.length}</strong><small>{stores.filter(s=>s.status==="active").length} aktif · {stores.filter(s=>s.status==="paused").length} dijeda</small></article>
     <article className="admin-metric metric-attention"><span className="metric-icon">◈</span><span className="metric-label">Produk menunggu</span><strong>{pendingProducts.length}</strong><small>Produk draft dalam antrean pemeriksaan</small></article>
     <article className="admin-metric"><span className="metric-icon">▤</span><span className="metric-label">Produk terdaftar</span><strong>{products.length}</strong><small>{products.filter(p=>p.status==="active").length} aktif · {products.filter(p=>p.status==="paused").length} dijeda</small></article>
    </div>
    <section className="admin-erp-overview" id="operasional">
    <div className="admin-section-heading"><div><span className="eyebrow">ERP · CRM · PERSEDIAAN</span><h2>Operasional lintas toko</h2><p>Ringkasan berdasarkan transaksi dan stok yang tersimpan di Supabase.</p></div></div>
    <div className="admin-metrics">
     <article className="admin-metric"><span className="metric-icon">▤</span><span className="metric-label">Item pesanan</span><strong>{orderItems.length}</strong><small>Data item yang dapat diakses admin</small></article>
     <article className="admin-metric"><span className="metric-icon">♙</span><span className="metric-label">Pembeli teridentifikasi</span><strong>{new Set(orderItems.map(item=>item.orders?.buyer_id).filter(Boolean)).size}</strong><small>CRM awal berbasis riwayat order</small></article>
     <article className="admin-metric"><span className="metric-icon">▦</span><span className="metric-label">Unit stok fisik</span><strong>{inventoryRows.reduce((sum,row)=>sum+Number(row.on_hand||0),0)}</strong><small>Di seluruh produk yang tercatat</small></article>
     <article className="admin-metric"><span className="metric-icon">◷</span><span className="metric-label">Perlu konfirmasi</span><strong>{orderItems.filter(item=>item.status==="pending_seller").length}</strong><small>Item menunggu keputusan penjual</small></article>
    </div>
    <div className="admin-accounting-note"><strong>Laporan penjualan bukan laporan kas.</strong><p>Nilai item pesanan selesai: <b>{rupiah(orderItems.filter(item=>item.status==="fulfilled").reduce((sum,item)=>sum+Number(item.unit_price_idr)*item.quantity,0))}</b>. Pembayaran daring, jurnal akuntansi, biaya, pajak, dan rekonsiliasi belum aktif; angka ini tidak boleh dianggap sebagai uang yang sudah diterima.</p></div>
    <div className="admin-module-links"><a href="#toko">Moderasi penjual <span>→</span></a><a href="#produk">Moderasi katalog <span>→</span></a><Link href="/seller">Gudang & CRM penjual <span>→</span></Link></div>
   </section>
   <div className="admin-quicklinks"><Link href="/katalog"><span>↗</span><div><strong>Periksa katalog publik</strong><small>Pastikan produk aktif tampil dengan benar</small></div><b>→</b></Link><Link href="/seller"><span>⌂</span><div><strong>Ruang operasional penjual</strong><small>Alur toko, produk, stok, dan pesanan</small></div><b>→</b></Link><Link href="/pesanan"><span>▣</span><div><strong>Halaman pesanan</strong><small>Masuk ke tampilan pesanan pembeli</small></div><b>→</b></Link></div>
   </section>
   <section className="admin-review-grid">
    <div className="seller-list-card admin-review-card" id="toko"><div className="admin-card-heading"><div><span className="eyebrow">ONBOARDING PENJUAL</span><h2>Tinjauan toko <span>{pendingStores.length}</span></h2></div><span className="admin-card-symbol">⌂</span></div><label className="admin-search"><span>⌕</span><input value={storeSearch} onChange={e=>setStoreSearch(e.target.value)} placeholder="Cari nama toko atau slug..." aria-label="Cari toko"/></label>
     {filteredStores.length===0?<div className="admin-empty"><span>✓</span><strong>{pendingStores.length?"Toko tidak ditemukan":"Antrean toko bersih"}</strong><p>{pendingStores.length?"Ubah kata kunci pencarian.":"Tidak ada toko yang menunggu pemeriksaan."}</p></div>:filteredStores.map(store=><div className="moderation-row admin-moderation-row" key={store.id}><div className="admin-row-main"><span className="admin-avatar">{store.name.trim().charAt(0).toUpperCase()}</span><div><strong>{store.name}</strong><small>/{store.slug}</small><p>{store.description||"Belum ada deskripsi toko."}</p></div></div><div className="seller-order-actions"><button disabled={busy} onClick={()=>void moderate("store",store.id,"active")}>Setujui</button><button className="reject-button" disabled={busy} onClick={()=>void moderate("store",store.id,"rejected")}>Tolak</button></div></div>)}
    </div>
    <div className="seller-list-card admin-review-card" id="produk"><div className="admin-card-heading"><div><span className="eyebrow">KUALITAS KATALOG</span><h2>Tinjauan produk <span>{pendingProducts.length}</span></h2></div><span className="admin-card-symbol">◈</span></div><label className="admin-search"><span>⌕</span><input value={productSearch} onChange={e=>setProductSearch(e.target.value)} placeholder="Cari produk atau toko..." aria-label="Cari produk"/></label>
     {filteredProducts.length===0?<div className="admin-empty"><span>✓</span><strong>{pendingProducts.length?"Produk tidak ditemukan":"Antrean produk bersih"}</strong><p>{pendingProducts.length?"Ubah kata kunci pencarian.":"Tidak ada produk draft yang menunggu pemeriksaan."}</p></div>:filteredProducts.map(product=><div className="moderation-row admin-moderation-row" key={product.id}><div className="admin-row-main"><span className="admin-avatar admin-product-avatar">▧</span><div><strong>{product.name}</strong><small>{product.stores?.name??"Toko belum diketahui"} · {rupiah(product.price_idr)}</small><p>{product.description||"Belum ada deskripsi produk."}</p>{product.stores?.status!=="active"&&<small className="admin-inline-warning">Toko belum aktif — aktifkan toko terlebih dahulu</small>}</div></div><div className="seller-order-actions"><button disabled={busy||product.stores?.status!=="active"} title={product.stores?.status!=="active"?"Setujui tokonya terlebih dahulu":""} onClick={()=>void moderate("product",product.id,"active")}>Aktifkan</button><button className="reject-button" disabled={busy} onClick={()=>void moderate("product",product.id,"archived")}>Arsipkan</button></div></div>)}
    </div>
   </section>
   <section className="admin-integrity"><span className="admin-integrity-icon">✓</span><div><strong>Kontrol akses tetap aktif</strong><p>Dashboard memeriksa peran admin di Supabase. Persetujuan memakai RPC berizin; perubahan tidak dilakukan lewat update tabel langsung dari browser.</p></div><span className="admin-integrity-tag">SUPABASE · RLS</span></section>
  </>}
  <footer><Link className="brand brand-footer" href="/"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Pedagang Ecer, Pelayanan Sultan.</small></span></Link><span>© {new Date().getFullYear()} Pasar-Nusa</span></footer>
 </main>;
}