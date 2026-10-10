"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Item={id:string;product_name_snapshot:string;brand_snapshot:string|null;unit_snapshot:string;unit_price_idr:number|string;quantity:number;line_total_idr:number|string;status:string};
type Order={id:string;status:string;subtotal_idr:number|string;buyer_note:string;created_at:string;order_items:Item[]};
const rupiah=(v:number|string)=>new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(v));
const statusLabel:Record<string,string>={pending_seller:"Menunggu konfirmasi pedagang",accepted:"Dikonfirmasi pedagang",rejected:"Pesanan ditolak",cancelled:"Pesanan dibatalkan",fulfilled:"Pesanan selesai",disputed:"Dalam penanganan keluhan"};

export default function OrderDetail({id}:{id:string}) {
  const [order,setOrder]=useState<Order|null>(null);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  const refresh=useCallback(async()=>{
    const supabase=createClient();
    if(!supabase){setMessage("Layanan pesanan belum dikonfigurasi.");setLoading(false);return;}
    const {data:userData}=await supabase.auth.getUser();
    if(!userData.user){setMessage("Masuk dengan akun pembeli untuk melihat pesanan.");setLoading(false);return;}
    const {data,error}=await supabase.from("orders").select("id,status,subtotal_idr,buyer_note,created_at,order_items(id,product_name_snapshot,brand_snapshot,unit_snapshot,unit_price_idr,quantity,line_total_idr,status)").eq("id",id).single();
    if(error)setMessage("Pesanan tidak ditemukan atau Anda tidak memiliki akses.");
    else setOrder(data as unknown as Order);
    setLoading(false);
  },[id]);
  useEffect(()=>{void refresh();},[refresh]);
  async function cancel(){
    const supabase=createClient();if(!supabase)return;
    setBusy(true);setMessage("");
    const {error}=await supabase.rpc("cancel_order_by_buyer",{p_order_id:id});
    if(error)setMessage(error.message);else{setMessage("Pesanan dibatalkan dan stok yang ditahan dilepas.");await refresh();}
    setBusy(false);
  }
  return <main className="catalog-page"><header className="topbar"><Link className="brand" href="/"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Pesanan Anda</small></span></Link><nav><Link href="/katalog">Katalog</Link><Link href="/seller">Ruang penjual</Link></nav><Link className="button button-outline" href="/">Beranda</Link></header>
    <section className="catalog-hero"><span className="eyebrow">STATUS PESANAN</span><h1>Transaksi yang<br/><em>jelas dan terlacak.</em></h1><p>Setiap pesanan dikonfirmasi oleh penjual. Produk atau penjual tidak akan diganti secara diam-diam.</p></section>
    <section className="order-content">{loading?<div className="catalog-state">Memuat pesanan...</div>:!order?<div className="catalog-state"><strong>Pesanan belum dapat ditampilkan.</strong><p>{message}</p><Link className="button button-dark" href="/masuk">Masuk</Link></div>:<><div className="order-summary"><div><span className="eyebrow">NOMOR PESANAN</span><h2>{order.id.slice(0,8).toUpperCase()}</h2><p>Dibuat {new Date(order.created_at).toLocaleString("id-ID")}</p></div><span className={"status-pill status-"+order.status}>{statusLabel[order.status]??order.status}</span></div><div className="order-items-card"><h2>Rincian barang</h2>{order.order_items.map(item=><div className="order-line" key={item.id}><div><strong>{item.product_name_snapshot}</strong>{item.brand_snapshot&&<small>{item.brand_snapshot}</small>}<small>{item.quantity} × {rupiah(item.unit_price_idr)} / {item.unit_snapshot}</small><span className={"status-pill status-"+item.status}>{statusLabel[item.status]??item.status}</span></div><strong>{rupiah(item.line_total_idr)}</strong></div>)}<div className="order-total"><span>Subtotal</span><strong>{rupiah(order.subtotal_idr)}</strong></div><p className="checkout-disclaimer">Pembayaran belum diaktifkan. Silakan ikuti konfirmasi penjual untuk pengaturan pemenuhan pesanan.</p>{order.buyer_note&&<p className="order-note"><strong>Catatan:</strong> {order.buyer_note}</p>}{order.status==="pending_seller"&&<button className="button cancel-order" disabled={busy} onClick={()=>void cancel()}>{busy?"Memproses...":"Batalkan pesanan"}</button>}</div></>}{message&&order&&<p className="auth-message" role="status">{message}</p>}<Link className="back-link" href="/katalog">← Kembali ke katalog</Link></section>
    <footer><Link className="brand brand-footer" href="/"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Pedagang Ecer, Pelayanan Sultan.</small></span></Link><span>© {new Date().getFullYear()} Pasar-Nusa</span></footer>
  </main>;
}