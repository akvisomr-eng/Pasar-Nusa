"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Store = { id: string; name: string; slug: string; status: string };
type Product = { id: string; name: string; status: string; price_idr: number | string; unit_label: string };
type OrderItem = { id: string; order_id: string; product_name_snapshot: string; quantity: number; unit_price_idr: number | string; status: string; orders: { id: string; status: string; created_at: string; buyer_note: string } | null };
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
        supabase.from("products").select("id,name,status,price_idr,unit_label").eq("store_id",current.id).order("created_at",{ascending:false}),
        supabase.from("order_items").select("id,order_id,product_name_snapshot,quantity,unit_price_idr,status,orders!inner(id,status,created_at,buyer_note)").eq("store_id",current.id).order("created_at",{ascending:false}).limit(50)
      ]);
      setProducts((productData??[]) as Product[]);
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
  if(!userId)return <main className="seller-page"><div className="catalog-state"><strong>Masuk untuk mengelola usaha.</strong><p>Ruang penjual membutuhkan akun Pasar-Nusa.</p><Link className="button button-dark" href="/masuk">Masuk / daftar</Link></div></main>;

  return <main className="seller-page">
    <header className="topbar"><Link className="brand" href="/"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Ruang penjual</small></span></Link><nav><Link href="/katalog">Katalog</Link><Link href="/keranjang">Keranjang</Link></nav><Link className="button button-outline" href="/">Beranda</Link></header>
    <section className="seller-hero"><span className="eyebrow">PUSAT OPERASIONAL PENJUAL</span><h1>Kelola usaha.<br/><em>Tumbuh bersama.</em></h1><p>Daftarkan toko, kelola katalog dan stok, serta tanggapi pesanan yang masuk.</p></section>
    {message&&<p className="seller-message" role="status">{message}</p>}
    {!store?<section className="seller-workspace"><div className="seller-form-card"><h2>Daftarkan toko</h2><p>Toko akan berstatus menunggu pemeriksaan sebelum tampil di katalog publik.</p><form className="seller-form" onSubmit={createStore}><label>Nama toko<input required minLength={2} maxLength={140} value={storeName} onChange={e=>setStoreName(e.target.value)} placeholder="Contoh: Toko Sumber Rejeki"/></label><label>Deskripsi toko<textarea rows={3} maxLength={1500} value={storeDescription} onChange={e=>setStoreDescription(e.target.value)} placeholder="Ceritakan usaha Anda"/></label><button className="button button-dark" disabled={busy}>{busy?"Menyimpan...":"Daftarkan toko"} →</button></form></div></section>:<section className="seller-workspace">
      <div className="seller-overview"><div><span className="eyebrow">TOKO ANDA</span><h2>{store.name}</h2><p>/{store.slug}</p></div><span className={"status-pill status-"+store.status}>{store.status==="pending"?"Menunggu pemeriksaan":store.status==="active"?"Aktif":store.status==="paused"?"Dijeda":"Ditolak"}</span></div>
      {store.status!=="active"&&<div className="review-notice"><strong>Toko belum aktif di katalog publik.</strong><p>Admin perlu menyetujui toko dan produk sebelum pembeli dapat menemukannya.</p></div>}
      <div className="seller-columns"><div className="seller-form-card"><h2>Tambah produk</h2><p>Produk baru disimpan sebagai draft. Harga dan stok awal dicatat terpisah.</p><form className="seller-form" onSubmit={createProduct}><label>Nama produk<input required minLength={2} maxLength={180} value={productName} onChange={e=>setProductName(e.target.value)} placeholder="Nama produk"/></label><label>Deskripsi<textarea rows={3} maxLength={3000} value={productDescription} onChange={e=>setProductDescription(e.target.value)} placeholder="Detail produk yang terverifikasi"/></label><div className="form-two"><label>Harga (IDR)<input required inputMode="numeric" type="number" min="0" step="1" value={price} onChange={e=>setPrice(e.target.value)} placeholder="25000"/></label><label>Satuan<input required maxLength={24} value={unit} onChange={e=>setUnit(e.target.value)} placeholder="kg, pcs, ikat"/></label></div><label>Stok awal<input required type="number" min="0" step="1" value={stock} onChange={e=>setStock(e.target.value)}/></label><button className="button button-dark" disabled={busy}>{busy?"Menyimpan...":"Simpan sebagai draft"} →</button></form></div>
      <div className="seller-list-card"><h2>Produk Anda <span>{products.length}</span></h2>{products.length===0?<p className="seller-empty">Belum ada produk. Tambahkan produk pertama Anda.</p>:products.map(product=><div className="seller-product-row" key={product.id}><div><strong>{product.name}</strong><small>{rupiah(product.price_idr)} / {product.unit_label}</small></div><span className={"status-pill status-"+product.status}>{product.status==="draft"?"Draft":product.status==="active"?"Aktif":product.status==="paused"?"Dijeda":"Arsip"}</span></div>)}</div></div>
      <div className="seller-list-card seller-orders"><h2>Pesanan masuk <span>{orders.length}</span></h2>{orders.length===0?<p className="seller-empty">Pesanan dari pembeli akan muncul di sini.</p>:orders.map(item=><div className="seller-order-row" key={item.id}><div><strong>{item.product_name_snapshot} × {item.quantity}</strong><small>{item.orders?.id.slice(0,8)} · {rupiah(Number(item.unit_price_idr)*item.quantity)}</small>{item.orders?.buyer_note&&<small>Catatan: {item.orders.buyer_note}</small>}</div><div className="seller-order-actions"><span className={"status-pill status-"+item.status}>{item.status==="pending_seller"?"Perlu konfirmasi":item.status==="accepted"?"Diterima":item.status==="fulfilled"?"Selesai":item.status==="rejected"?"Ditolak":"Dibatalkan"}</span>{item.status==="pending_seller"&&<><button disabled={busy} onClick={()=>void itemAction(item,"accept")}>Terima</button><button disabled={busy} className="reject-button" onClick={()=>void itemAction(item,"reject")}>Tolak</button></>}{item.status==="accepted"&&<button disabled={busy} onClick={()=>void itemAction(item,"fulfill")}>Tandai selesai</button>}</div></div>)}</div>
    </section>}
    <footer><Link className="brand brand-footer" href="/"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Pedagang Ecer, Pelayanan Sultan.</small></span></Link><span>© {new Date().getFullYear()} Pasar-Nusa</span></footer>
  </main>;
}