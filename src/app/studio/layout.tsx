import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio Desain Produk 2D & 3D | Pasar Nusa",
  description: "Rancang konsep label kemasan komoditas dan produk UMKM, sesuaikan warna dan bentuk, lalu ekspor desain awal sebagai SVG di Pasar Nusa Studio.",
  robots: { index: true, follow: true }
};

export default function StudioLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
