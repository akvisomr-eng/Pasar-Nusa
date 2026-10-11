import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pasar-Nusa — Pedagang Ecer, Pelayanan Sultan",
  description: "Pasar digital untuk pedagang lokal, pembeli, dan pelaku usaha Indonesia.",
  applicationName: "Pasar-Nusa",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#123b2e"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}