import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Katalog Komoditas dan Produk UMKM Indonesia | Pasar Nusa",
  description: "Jelajahi katalog komoditas pertanian, perkebunan, perikanan, pangan, dan produk UMKM dari pedagang lokal di Pasar Nusa.",
  robots: { index: true, follow: true }
};

export default function CatalogLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
