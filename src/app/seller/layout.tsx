import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mulai Berjualan di Pasar Nusa | Toko Komoditas Lokal",
  description: "Daftarkan toko dan kelola katalog komoditas pertanian, perkebunan, perikanan, atau produk UMKM di Pasar Nusa.",
  robots: { index: true, follow: true }
};

export default function SellerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
