"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Store = { id: string; name: string; slug: string; status: string };
type Product = { id: string; name: string; status: string; price_idr: number | string; unit_label: string; inventory: { on_hand: number; reserved: number } | null };
type OrderItem = { id: string; order_id: string; product_name_snapshot: string; quantity: number; unit_price_idr: number | string; status: string; orders: { id: string; status: string; created_at: string; buyer_note: string; buyer_id: string } | null };
const rupiah=(value:number|string)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(value));
const slugify=(value:string)=>value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80);

export default function SellerPage() {
  const [loading,setLoading]=useState(true);
  const [userId,setUserId]=useState("");
  const [store,setStore]=useState<Store|null>(null);
  const [products,setProducts]=useState<Product[]>([]);
  const [orders,setOrders]=useState<OrderItem[]>([]);
  const [storeName,setStoreName]=useState("");
  const [storeDescription,setStoreDescription]=useState("");
  const [productName,setProductName]=useState("");
  const [productDescription,setProductDescription]=useState("");
  const [price,setPrice]=useState("");
  const [unit,setUnit]=useState("pcs");
  const [stock,setStock]=useState("0");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const [activeModule,setActiveModule]=useState<"overview"|"products"|"orders"|"warehouse"|"crm"|"accounting">("overview");
  const [stockDrafts,setStockDrafts]=useState<Record<string,string>>({});

  const refresh=useCallback(async()=>{
    const supabase=createClient();
    if(!supabase){setMessage("Layanan penjual belum dikonfigurasi.");setLoading(false);return;}
    const {data:userData}=await supabase.auth.getUser();
    if(!userData.user){setLoading(false);return;}
    setUserId(userData.user.id);
    const {data:storeData,error:storeError}=await supabase.from("stores").select("id,name,slug,status").eq("owner_id",userData.user.id).maybeSingle();
    if(storeError){setMessage("Data toko belum dapat dimuat.");setLoading(false);return;}
    const current=storeData as Store|null;
    setStore(current);
    if(current){
      const [{data:productData},{data:orderData}]=await Promise.all([
        supabase.from("products").select("id,name,status,price_idr,unit_label,inventory(on_hand,reserved)").eq("store_id",current.id).order("created_at",{ascending:false}),
        supabase.from("order_items").select("id,order_id,product_name_snapshot,quantity,unit_price_idr,status,orders!inner(id,status,created_at,buyer_note,buyer_id)").eq("store_id",current.id).order("created_at",{ascending:false}).limit(100)
      ]);
      setProducts((productData??[]) as unknown as Product[]);
      setOrders((orderData??[]) as unknown as OrderItem[]);
    }
    setLoading(false);
  },[]);

  useEffect(()=>{void refresh();},[refresh]);

  async function createStore(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setMessage("");
    const supabase=createClient();
    if(!supabase||!userId){setMessage("Silakan masuk terlebih dahulu.");setBusy(false);return;}
    const slug=slugify(storeName);
    if(slug.length<2){setMessage("Nama toko perlu memiliki minimal dua karakter.");setBusy(false);return;}
    const {error}=await supabase.from("stores").insert({owner_id:userId,name:storeName.trim(),slug,description:storeDescription.trim(),status:"pending"});
    if(error)setMessage(error.message);
    else{setMessage("Toko berhasil didaftarkan dan menunggu pemeriksaan.");await refresh();}
    setBusy(false);
  }

  async function createProduct(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setMessage("");
    const supabase=createClient();
    if(!supabase||!store){setMessage("Toko belum tersedia.");setBusy(false);return;}
    const numericPrice=Number(price),numericStock=Number(stock);
    if(!Number.isSafeInteger(numericPrice)||numericPrice<0||!Number.isSafeInteger(numericStock)||numericStock<0){setMessage("Harga dan stok harus berupa bilangan bulat yang valid.");setBusy(false);return;}
    const slug=slugify(productName);
    const {data,error}=await supabase.from("products").insert({store_id:store.id,name:productName.trim(),slug,description:productDescription.trim(),price_idr:numericPrice,unit_label:unit.trim()||"pcs",status:"draft"}).select("id").single();
    if(error){setMessage(error.message);setBusy(false);return;}
    const {data:stockOk,error:stockError}=await supabase.rpc("set_inventory_on_hand",{p_product_id:data.id,p_on_hand:numericStock});
    if(stockError||stockOk!==true){setMessage("Produk tersimpan sebagai draft, tetapi stok belum berhasil disimpan. Silakan periksa kembali.");}
    else{setMessage("Produk tersimpan sebagai draft dan menunggu pemeriksaan admin.");setProductName("");setProductDescription("");setPrice("");setStock("0");await refresh();}
    setBusy(false);
  }

  async function saveStock(product:Product){
    const supabase=createClient();if(!supabase)return;
    const value=Number(stockDrafts[product.id] ?? product.inventory?.on_hand ?? 0);
    if(!Number.isSafeInteger(value)||value<0){setMessage("Stok harus berupa bilangan bulat nol atau lebih.");return;}
    setBusy(true);setMessage("");
    const {data,error}=await supabase.rpc("set_inventory_on_hand",{p_product_id:product.id,p_on_hand:value});
    if(error||data!==true)setMessage(error?.message??"Perubahan stok tidak berhasil.");
    else{setMessage("Stok diperbarui.");setStockDrafts(current=>({...current,[product.id]:String(value)}));await refresh();}
    setBusy(false);
  }

  async function itemAction(item:OrderItem,action:"accept"|"reject"|"fulfill"){
    const supabase=createClient();if(!supabase)return;
    setBusy(true);setMessage("");
    const {error}= action==="fulfill"
      ? await supabase.rpc("complete_order_item",{p_item_id:item.id})
      : await supabase.rpc("seller_decide_order_item",{p_item_id:item.id,p_accept:action==="accept"});
    if(error)setMessage(error.message);else{setMessage("Status pesanan diperbarui.");await refresh();}
    setBusy(false);
  }

  if(loading)return <main className="seller-page"><div className="catalog-state">Memuat ruang penjual...</div></main>;
  if(!userId)return <main className="seller-page"><div className="catalog-state"><strong>Masuk untuk mengelola usaha.</strong><p>Buat akun atau masuk, lalu daftarkan toko untuk mulai mengelola produk, stok, pesanan, pelanggan, dan laporan usaha.</p><Link className="button button-dark" href="/masuk?mode=signup&role=pedagang">Daftar akun pedagang</Link><p><Link href="/masuk">Sudah punya akun? Masuk</Link></p></div></main>;

  return <main className="seller-page">
    <header className="topbar"><Link className="brand" href="/"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Ruang penjual</small></span></Link><nav><Link href="/katalog">Katalog</Link><Link href="/keranjang">Keranjang</Link></nav><Link className="button button-outline" href="/">Beranda</Link></header>
    <section className="seller-hero"><span className="eyebrow">PUSAT OPERASIONAL PENJUAL</span><h1>Kelola usaha.<br/><em>Tumbuh bersama.</em></h1><p>Daftarkan toko, kelola katalog dan stok, serta tanggapi pesanan yang masuk.</p></section>
    {message&&<p className="seller-message" role="status">{message}</p>}
    {!store?<section className="seller-workspace"><div className="seller-form-card"><h2>Daftarkan toko</h2><p>Toko akan berstatus menunggu pemeriksaan sebelum tampil di katalog publik.</p><form className="seller-form" onSubmit={createStore}><label>Nama toko<input required minLength={2} maxLength={140} value={storeName} onChange={e=>setStoreName(e.target.value)} placeholder="Contoh: Toko Sumber Rejeki"/></label><label>Deskripsi toko<textarea rows={3} maxLength={1500} value={storeDescription} onChange={e=>setStoreDescription(e.target.value)} placeholder="Ceritakan usaha Anda"/></label><button className="button button-dark" disabled={busy}>{busy?"Menyimpan...":"Daftarkan toko"} →</button></form></div></section>:<section className="seller-workspace">
      <div className="seller-overview"><div><span className="eyebrow">TOKO ANDA</span><h2>{store.name}</h2><p>/{store.slug}</p></div><span className={"status-pill status-"+store.status}>{store.status==="pending"?"Menunggu pemeriksaan":store.status==="active"?"Aktif":store.status==="paused"?"Dijeda":"Ditolak"}</span></div>
      {store.status!=="active"&&<div className="review-notice"><strong>Toko belum aktif di katalog publik.</strong><p>Admin perlu menyetujui toko dan produk sebelum pembeli dapat menemukannya.</p></div>}
      <nav className="seller-module-nav" aria-label="Modul usaha">{([{id:"overview",label:"Ringkasan"},{id:"products",label:"Produk"},{id:"orders",label:"Pesanan"},{id:"warehouse",label:"Gudang & stok"},{id:"crm",label:"Pelanggan (CRM)"},{id:"accounting",label:"Keuangan"}] as const).map(item=><button key={item.id} type="button" className={activeModule===item.id?"active":""} onClick={()=>setActiveModule(item.id)}>{item.label}</button>)}</nav>
      {activeModule==="overview"&&<div className="seller-module-overview"><div className="seller-kpi"><span>Produk terdaftar</span><strong>{products.length}</strong><small>{products.filter(p=>p.status==="active").length} tayang di katalog</small></div><div className="seller-kpi"><span>Pesanan tercatat</span><strong>{orders.length}</strong><small>{orders.filter(o=>o.status==="pending_seller").length} menunggu konfirmasi</small></div><div className="seller-kpi"><span>Perlu diproses</span><strong>{orders.filter(o=>o.status==="accepted").length}</strong><small>Pesanan yang diterima penjual</small></div><div className="seller-kpi"><span>Stok tersedia</span><strong>{products.reduce((sum,p)=>sum+Math.max(0,(p.inventory?.on_hand??0)-(p.inventory?.reserved??0)),0)}</strong><small>Jumlah unit setelah reservasi</small></div></div>}
      {activeModule==="products"&&<div className="seller-columns"><div className="seller-form-card"><h2>Tambah produk</h2><p>Produk baru disimpan sebagai draft. Harga dan stok awal dicatat terpisah.</p><form className="seller-form" onSubmit={createProduct}><label>Nama produk<input required minLength={2} maxLength={180} value={productName} onChange={e=>setProductName(e.target.value)} placeholder="Nama produk"/></label><label>Deskripsi<textarea rows={3} maxLength={3000} value={productDescription} onChange={e=>setProductDescription(e.target.value)} placeholder="Detail produk yang terverifikasi"/></label><div className="form-two"><label>Harga (IDR)<input required inputMode="numeric" type="number" min="0" step="1" value={price} onChange={e=>setPrice(e.target.value)} placeholder="25000"/></label><label>Satuan<input required maxLength={24} value={unit} onChange={e=>setUnit(e.target.value)} placeholder="kg, pcs, ikat"/></label></div><label>Stok awal<input required type="number" min="0" step="1" value={stock} onChange={e=>setStock(e.target.value)}/></label><button className="button button-dark" disabled={busy}>{busy?"Menyimpan...":"Simpan sebagai draft"} →</button></form></div>
      <div className="seller-list-card"><h2>Produk Anda <span>{products.length}</span></h2>{products.length===0?<p className="seller-empty">Belum ada produk. Tambahkan produk pertama Anda.</p>:products.map(product=><div className="seller-product-row" key={product.id}><div><strong>{product.name}</strong><small>{rupiah(product.price_idr)} / {product.unit_label}</small></div><span className={"status-pill status-"+product.status}>{product.status==="draft"?"Draft":product.status==="active"?"Aktif":product.status==="paused"?"Dijeda":"Arsip"}</span></div>)}</div></div>
      </div>}
      {activeModule==="orders"&&<div className="seller-list-card seller-orders"><h2>Pesanan masuk <span>{orders.length}</span></h2>{orders.length===0?<p className="seller-empty">Pesanan dari pembeli akan muncul di sini.</p>:orders.map(item=><div className="seller-order-row" key={item.id}><div><strong>{item.product_name_snapshot} × {item.quantity}</strong><small>{item.orders?.id.slice(0,8)} · {rupiah(Number(item.unit_price_idr)*item.quantity)}</small>{item.orders?.buyer_note&&<small>Catatan: {item.orders.buyer_note}</small>}</div><div className="seller-order-actions"><span className={"status-pill status-"+item.status}>{item.status==="pending_seller"?"Perlu konfirmasi":item.status==="accepted"?"Diterima":item.status==="fulfilled"?"Selesai":item.status==="rejected"?"Ditolak":"Dibatalkan"}</span>{item.status==="pending_seller"&&<><button disabled={busy} onClick={()=>void itemAction(item,"accept")}>Terima</button><button disabled={busy} className="reject-button" onClick={()=>void itemAction(item,"reject")}>Tolak</button></>}{item.status==="accepted"&&<button disabled={busy} onClick={()=>void itemAction(item,"fulfill")}>Tandai selesai</button>}</div></div>)}</div>
      </div>}
      {activeModule==="warehouse"&&<section className="seller-list-card seller-warehouse"><div className="seller-module-heading"><div><span className="eyebrow">OPERASIONAL PERSEDIAAN</span><h2>Gudang & stok</h2><p>Stok tersimpan di Supabase. Perubahan dilakukan melalui fungsi berizin dan divalidasi di database.</p></div></div>{products.length===0?<p className="seller-empty">Tambahkan produk terlebih dahulu untuk mengelola stok.</p>:products.map(product=><div className="seller-stock-row" key={product.id}><div><strong>{product.name}</strong><small>{product.status==="active"?"Produk aktif":product.status==="draft"?"Menunggu tinjauan":product.status}</small><small>Stok tersedia: {Math.max(0,(product.inventory?.on_hand??0)-(product.inventory?.reserved??0))} · Dipesan: {product.inventory?.reserved??0}</small></div><label>Stok fisik<input type="number" min="0" step="1" value={stockDrafts[product.id]??String(product.inventory?.on_hand??0)} onChange={e=>setStockDrafts(old=>({...old,[product.id]:e.target.value}))}/></label><button disabled={busy} onClick={()=>void saveStock(product)}>Simpan stok</button></div>)}</section>}
      {activeModule==="crm"&&<section className="seller-list-card seller-crm"><span className="eyebrow">CUSTOMER RELATIONSHIP MANAGEMENT</span><h2>Ringkasan pelanggan</h2><p>Data ini diturunkan dari pesanan yang terlihat oleh toko. Kontak pelanggan belum dikumpulkan di sistem; kami tidak menampilkan data pribadi yang tidak tersedia atau tidak diizinkan.</p><div className="seller-module-overview"><div className="seller-kpi"><span>Pembeli unik</span><strong>{new Set(orders.map(o=>o.orders?.buyer_id).filter(Boolean)).size}</strong><small>Berdasarkan ID pembeli pada pesanan</small></div><div className="seller-kpi"><span>Pesanan dari pembeli</span><strong>{orders.length}</strong><small>Item pesanan yang terlihat toko</small></div><div className="seller-kpi"><span>Catatan pesanan</span><strong>{orders.filter(o=>Boolean(o.orders?.buyer_note)).length}</strong><small>Pesanan dengan catatan pembeli</small></div></div></section>}
      {activeModule==="accounting"&&<section className="seller-list-card seller-accounting"><span className="eyebrow">LAPORAN USAHA</span><h2>Keuangan & penjualan</h2><p>Ringkasan nilai pesanan dari data order yang ada. Ini bukan saldo kas, bukan rekonsiliasi pembayaran, dan bukan laporan pajak karena pembayaran daring belum diaktifkan.</p><div className="seller-module-overview"><div className="seller-kpi"><span>Nilai pesanan selesai</span><strong>{rupiah(orders.filter(o=>o.status==="fulfilled").reduce((sum,o)=>sum+Number(o.unit_price_idr)*o.quantity,0))}</strong><small>Nilai item berstatus selesai</small></div><div className="seller-kpi"><span>Nilai pesanan diterima</span><strong>{rupiah(orders.filter(o=>o.status==="accepted").reduce((sum,o)=>sum+Number(o.unit_price_idr)*o.quantity,0))}</strong><small>Belum berarti sudah dibayar</small></div><div className="seller-kpi"><span>Pesanan dibatalkan/ditolak</span><strong>{orders.filter(o=>["cancelled","rejected"].includes(o.status)).length}</strong><small>Tidak dihitung sebagai penjualan selesai</small></div></div><p className="seller-module-note">Tahap berikutnya untuk akuntansi penuh memerlukan jurnal, biaya, piutang/hutang, bukti pembayaran, dan periode buku yang terpisah.</p></section>}
    </section>}
    <footer><Link className="brand brand-footer" href="/"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Pedagang Ecer, Pelayanan Sultan.</small></span></Link><span>© {new Date().getFullYear()} Pasar-Nusa</span></footer>
  </main>;
}