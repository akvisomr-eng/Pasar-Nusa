import Link from "next/link";

export default function NotFound() {
  return <main style={{minHeight:"70vh",display:"grid",placeItems:"center",padding:"32px",textAlign:"center"}}>
    <div><p style={{fontWeight:800,letterSpacing:"2px",color:"#52845b"}}>PASAR-NUSA</p><h1 style={{fontSize:"clamp(36px,7vw,64px)",color:"#123b2e"}}>Halaman tidak ditemukan</h1><p style={{color:"#6b7972"}}>Alamatnya mungkin berubah atau belum tersedia.</p><Link href="/" style={{display:"inline-block",marginTop:16,padding:"13px 20px",borderRadius:8,background:"#123b2e",color:"white"}}>Kembali ke beranda</Link></div>
  </main>;
}