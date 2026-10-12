"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type PackageShape = "pouch" | "bottle" | "jar";

const shapeLabels: Record<PackageShape, string> = {
  pouch: "Kemasan pouch",
  bottle: "Botol",
  jar: "Toples",
};

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  })[char] ?? char);
}

export default function ProductStudioPage() {
  const [brand, setBrand] = useState("Nusa Organik");
  const [product, setProduct] = useState("Kopi Lereng Nusantara");
  const [subtitle, setSubtitle] = useState("Aroma asli, dari kebun lokal");
  const [shape, setShape] = useState<PackageShape>("pouch");
  const [color, setColor] = useState("#24543d");
  const [accent, setAccent] = useState("#e6c878");
  const [saved, setSaved] = useState(false);

  const svg = useMemo(() => {
    const b = escapeXml(brand || "Nama Merek");
    const p = escapeXml(product || "Nama Produk");
    const s = escapeXml(subtitle || "Deskripsi singkat produk");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
      <rect width="1200" height="1500" rx="48" fill="${color}"/>
      <circle cx="600" cy="360" r="240" fill="${accent}" opacity=".18"/>
      <circle cx="600" cy="360" r="180" fill="none" stroke="${accent}" stroke-width="3" opacity=".75"/>
      <path d="M600 205 C480 300 490 435 600 505 C710 435 720 300 600 205Z" fill="${accent}"/>
      <path d="M600 250 L600 465 M600 355 C555 325 535 300 530 275 M600 395 C645 365 670 335 680 305" stroke="${color}" stroke-width="9" fill="none" stroke-linecap="round"/>
      <text x="600" y="680" text-anchor="middle" fill="${accent}" font-family="Arial,sans-serif" font-size="35" letter-spacing="8">${b.toUpperCase()}</text>
      <path d="M300 730 H900" stroke="${accent}" stroke-width="2" opacity=".8"/>
      <text x="600" y="835" text-anchor="middle" fill="#fffdf5" font-family="Arial,sans-serif" font-size="64" font-weight="700">${p}</text>
      <text x="600" y="910" text-anchor="middle" fill="#fffdf5" opacity=".85" font-family="Arial,sans-serif" font-size="29">${s}</text>
      <rect x="390" y="1030" width="420" height="72" rx="36" fill="${accent}"/>
      <text x="600" y="1076" text-anchor="middle" fill="${color}" font-family="Arial,sans-serif" font-size="22" font-weight="700">HASIL PILIHAN NUSANTARA</text>
      <text x="600" y="1370" text-anchor="middle" fill="#fffdf5" opacity=".75" font-family="Arial,sans-serif" font-size="23">KONSEP DESAIN • PERLU CEK CETAK</text>
    </svg>`;
  }, [brand, product, subtitle, color, accent]);

  function downloadSvg() {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "konsep-kemasan-pasar-nusa.svg";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function saveConcept() {
    try {
      const current = JSON.parse(localStorage.getItem("pasar-nusa-design-concepts") || "[]") as unknown[];
      current.unshift({ brand, product, subtitle, shape, color, accent, updated_at: new Date().toISOString() });
      localStorage.setItem("pasar-nusa-design-concepts", JSON.stringify(current.slice(0, 20)));
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  return (
    <main className="pn-market pn-studio" data-build="pasar-nusa-product-studio-v1">
      <div className="pn-topline"><div className="pn-wrap pn-topline-inner"><span>Pasar digital komoditas Indonesia</span><span className="pn-topline-right">Studio kreatif pelaku usaha <i>✳</i> <Link href="/seller">Area penjual ↗</Link></span></div></div>
      <header className="pn-header pn-wrap">
        <Link className="pn-logo" href="/" aria-label="Pasar Nusa beranda"><span className="pn-logo-icon">N</span><span className="pn-logo-type">PASAR<span>NUSA</span><small>HASIL NUSANTARA, SATU PASAR</small></span></Link>
        <div className="pn-studio-headline"><span className="pn-section-kicker">PASAR NUSA STUDIO</span><strong>Ide produk, jadi lebih nyata.</strong></div>
        <div className="pn-header-links"><Link href="/katalog"><span className="pn-line-icon">⌕</span><span>Katalog<small>Jelajahi pasar</small></span></Link><Link href="/seller"><span className="pn-line-icon">♙</span><span>Penjual<small>Kelola toko</small></span></Link></div>
      </header>
      <div className="pn-wrap pn-studio-body">
        <div className="pn-studio-intro"><div><span className="pn-section-kicker">ALAT KREATIF UNTUK UMKM</span><h1>Rancang kemasan yang<br/><em>mencuri perhatian.</em></h1><p>Buat konsep label 2D dan pratinjau kemasan bergaya 3D untuk komoditas atau produk olahan Anda. Hasil saat ini adalah konsep visual awal, bukan berkas produksi cetak.</p></div><Link className="pn-text-link" href="/">← Kembali ke beranda</Link></div>
        <div className="pn-studio-workspace">
          <section className="pn-studio-controls">
            <div className="pn-studio-panel-heading"><span>01</span><div><h2>Identitas produk</h2><p>Isi detail dasar untuk membentuk desain.</p></div></div>
            <label className="pn-field">Nama merek<input value={brand} onChange={e => {setBrand(e.target.value);setSaved(false);}} maxLength={40} placeholder="Contoh: Nusa Organik"/></label>
            <label className="pn-field">Nama produk<input value={product} onChange={e => {setProduct(e.target.value);setSaved(false);}} maxLength={48} placeholder="Contoh: Kopi Lereng Nusantara"/></label>
            <label className="pn-field">Deskripsi singkat<input value={subtitle} onChange={e => {setSubtitle(e.target.value);setSaved(false);}} maxLength={60} placeholder="Keunggulan utama produk"/></label>
            <div className="pn-field"><span>Bentuk kemasan</span><div className="pn-shape-options">{(Object.keys(shapeLabels) as PackageShape[]).map(item => <button type="button" key={item} className={shape===item?"active":""} onClick={()=>{setShape(item);setSaved(false);}}>{shapeLabels[item]}</button>)}</div></div>
            <div className="pn-color-row"><label className="pn-field">Warna utama<span className="pn-color-control"><input aria-label="Warna utama" type="color" value={color} onChange={e=>{setColor(e.target.value);setSaved(false);}}/><code>{color.toUpperCase()}</code></span></label><label className="pn-field">Warna aksen<span className="pn-color-control"><input aria-label="Warna aksen" type="color" value={accent} onChange={e=>{setAccent(e.target.value);setSaved(false);}}/><code>{accent.toUpperCase()}</code></span></label></div>
            <div className="pn-studio-actions"><button className="pn-btn-primary" type="button" onClick={downloadSvg}>Unduh desain 2D <span>↓</span></button><button className="pn-studio-save" type="button" onClick={saveConcept}>Simpan konsep</button></div>
            {saved && <p className="pn-studio-success" role="status">Konsep disimpan di browser ini. Belum tersimpan ke akun atau Supabase.</p>}
            <p className="pn-studio-note">Tip: cek keterbacaan, bahan kemasan, aturan label pangan, komposisi, berat bersih, dan legalitas sebelum produksi.</p>
          </section>
          <section className="pn-studio-preview" aria-label="Pratinjau desain produk">
            <div className="pn-preview-top"><div><span className="pn-section-kicker">LIVE PREVIEW</span><h2>Konsep kemasan</h2></div><span className="pn-preview-badge">KONSEP</span></div>
            <div className="pn-preview-stage">
              <div className={"pn-package pn-package-"+shape} style={{"--package-color":color,"--package-accent":accent} as React.CSSProperties}>
                <div className="pn-package-side"></div><div className="pn-package-face"><div className="pn-package-seal">✳</div><small>{brand || "NAMA MEREK"}</small><div className="pn-package-rule"></div><strong>{product || "Nama Produk"}</strong><p>{subtitle || "Deskripsi singkat produk"}</p><span>HASIL PILIHAN NUSANTARA</span></div>
              </div>
              <div className="pn-preview-shadow"></div>
            </div>
            <div className="pn-preview-caption"><span><i></i> Pratinjau bergaya 3D</span><span>{shapeLabels[shape]}</span></div>
            <div className="pn-preview-2d"><div className="pn-label-mini" style={{background:color,color:accent}}><span>✳</span><small>{brand || "NAMA MEREK"}</small><b>{product || "Nama Produk"}</b><p>{subtitle || "Deskripsi singkat produk"}</p></div><div><span className="pn-section-kicker">02 / LABEL DATAR</span><strong>Desain 2D siap diekspor</strong><p>Unduh sebagai SVG untuk diedit atau dikembangkan di aplikasi desain.</p></div></div>
          </section>
        </div>
        <section className="pn-xr-roadmap"><div className="pn-xr-icon">◇</div><div><span className="pn-section-kicker">TAHAP BERIKUTNYA · AR / VR / XR</span><h2>Dari konsep layar ke pengalaman ruang.</h2><p>Fondasi visual sudah dimulai. Integrasi AR di kamera, ruang pamer VR, dan alur XR lintas perangkat memerlukan model 3D produksi (misalnya GLB/glTF), pengujian perangkat, serta dukungan WebXR. Fitur tersebut belum aktif pada versi ini.</p><div className="pn-xr-tags"><span>AR · Coba di ruang nyata</span><span>VR · Ruang pamer virtual</span><span>XR · Pengalaman lintas perangkat</span></div></div></section>
      </div>
      <footer className="pn-footer"><div className="pn-wrap pn-footer-bottom"><span>© {new Date().getFullYear()} Pasar Nusa Studio</span><span>Konsep visual lokal · tanpa biaya layanan desain eksternal</span></div></footer>
    </main>
  );
}
