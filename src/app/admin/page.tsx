"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Store={id:string;name:string;slug:string;description:string;status:string;owner_id:string};
type Product={id:string;name:string;description:string;price_idr:number|string;status:string;store_id:string;stores:{name:string;status:string}|null};
const rupiah=(v:number|string)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(v));

export default function AdminPage(){
 const [loading,setLoading]=useState(true);const [allowed,setAllowed]=useState(false);const [stores,setStores]=useState<Store[]>([]);const [products,setProducts]=useState<Product[]>([]);const [message,setMessage]=useState("");const [busy,setBusy]=useState(false);
 const refresh=useCallback(async()=>{
  const supabase=createClient();if(!supabase){setMessage("Supabase belum dikonfigurasi.");setLoading(false);return;}
  const {data:userData}=await supabase.auth.getUser();if(!userData.user){setMessage("Masuk dengan akun administrator.");setLoading(false);return;}
  const {data:profile}=await supabase.from("profiles").select("role").eq("id",userData.user.id).maybeSingle();
  if(profile?.role!=="platform_admin"){setAllowed(false);setMessage("Akun ini belum memiliki peran administrator platform.");setLoading(false);return;}
  setAllowed(true);
  const [{data:storeRows,error:storeError},{data:productRows,error:productError}]=await Promise.all([
   supabase.from("stores").select("id,name,slug,description,status,owner_id").in("status",["pending","active","paused"]).order("created_at",{ascending:true}),
   supabase.from("products").select("id,name,description,price_idr,status,store_id,stores(name,status)").in("status",["draft","paused"]).order("created_at",{ascending:true})
  ]);
  if(storeError||productError)setMessage("Sebagian data moderasi gagal dimuat.");
  setStores((storeRows??[]) as Store[]);setProducts((productRows??[]) as unknown as Product[]);setLoading(false);
 },[]);
 useEffect(()=>{void refresh();},[refresh]);
 async function moderate(kind:"store"|"product",id:string,status:string){
  const supabase=createClient();if(!supabase)return;
  setBusy(true);setMessage("");
  const {data,error}=kind==="store"?await supabase.rpc("admin_set_store_status",{p_store_id:id,p_status:status}):await supabase.rpc("admin_set_product_status",{p_product_id:id,p_status:status});
  if(error||data!==true)setMessage(error?.message??"Perubahan status tidak berhasil.");else{setMessage("Status berhasil diperbarui dan tercatat di audit.");await refresh();}
  setBusy(false);
 }
 if(loading)return <main className="seller-page"><div className="catalog-state">Memeriksa akses administrator...</div></main>;
 return <main className="seller-page"><header className="topbar"><Link className="brand" href="/"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Administrasi platform</small></span></Link><nav><Link href="/seller">Ruang penjual</Link><Link href="/katalog">Katalog</Link></nav><Link className="button button-outline" href="/">Beranda</Link></header>
 <section className="seller-hero"><span className="eyebrow">OPERASIONAL PLATFORM</span><h1>Jaga kualitas.<br/><em>Bangun kepercayaan.</em></h1><p>Pemeriksaan toko dan produk sebelum ditampilkan kepada pembeli.</p></section>
 {message&&<p className="seller-message" role="status">{message}</p>}
 {!allowed?<section className="seller-workspace"><div className="review-notice"><strong>Akses administrator dibatasi.</strong><p>Untuk keamanan, peran platform_admin hanya dapat diberikan melalui proses bootstrap tepercaya di basis data. Akun biasa tidak dapat menaikkan hak aksesnya sendiri.</p><Link className="button button-dark" href="/masuk">Masuk / daftar akun</Link></div></section>:<section className="seller-workspace"><div className="seller-list-card"><h2>Toko untuk ditinjau <span>{stores.filter(s=>s.status==="pending").length}</span></h2>{stores.filter(s=>s.status==="pending").length===0?<p className="seller-empty">Tidak ada toko menunggu pemeriksaan.</p>:stores.filter(s=>s.status==="pending").map(store=><div className="moderation-row" key={store.id}><div><strong>{store.name}</strong><small>/{store.slug}</small><p>{store.description||"Tanpa deskripsi"}</p></div><div className="seller-order-actions"><button disabled={busy} onClick={()=>void moderate("store",store.id,"active")}>Setujui toko</button><button className="reject-button" disabled={busy} onClick={()=>void moderate("store",store.id,"rejected")}>Tolak</button></div></div>)}</div>
 <div className="seller-list-card moderation-products"><h2>Produk untuk ditinjau <span>{products.filter(p=>p.status==="draft").length}</span></h2>{products.filter(p=>p.status==="draft").length===0?<p className="seller-empty">Tidak ada produk menunggu pemeriksaan.</p>:products.filter(p=>p.status==="draft").map(product=><div className="moderation-row" key={product.id}><div><strong>{product.name}</strong><small>{product.stores?.name??"Toko"} · {rupiah(product.price_idr)}</small><p>{product.description||"Tanpa deskripsi"}</p></div><div className="seller-order-actions"><button disabled={busy||product.stores?.status!=="active"} title={product.stores?.status!=="active"?"Setujui tokonya terlebih dahulu":""} onClick={()=>void moderate("product",product.id,"active")}>Aktifkan produk</button><button className="reject-button" disabled={busy} onClick={()=>void moderate("product",product.id,"archived")}>Arsipkan</button></div></div>)}</div></section>}
 <footer><Link className="brand brand-footer" href="/"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Pedagang Ecer, Pelayanan Sultan.</small></span></Link><span>© {new Date().getFullYear()} Pasar-Nusa</span></footer></main>;
}