import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const outputDir = "out";
if (!existsSync(outputDir) || !statSync(outputDir).isDirectory()) {
  throw new Error("Direktori out/ tidak ditemukan. Ekspor statis belum menghasilkan artefak.");
}

const requiredRoutes = ["index", "katalog", "keranjang", "masuk", "seller", "admin", "pesanan"];
const missing = requiredRoutes.filter((route) => {
  const flat = join(outputDir, route === "index" ? "index.html" : `${route}.html`);
  const nested = join(outputDir, route, "index.html");
  return !existsSync(flat) && !existsSync(nested);
});

if (missing.length) {
  console.error("Rute statis yang wajib tidak ditemukan:", missing.join(", "));
  console.error("Berkas yang tersedia:", readdirSync(outputDir).join(", "));
  process.exit(1);
}

const faviconFile = join(outputDir, "favicon.svg");
if (!existsSync(faviconFile) || !statSync(faviconFile).isFile()) {
  throw new Error("public/favicon.svg tidak ditemukan pada hasil ekspor (out/favicon.svg).");
}

const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? process.env.PASAR_NUSA_BASE_PATH ?? "/Pasar-Nusa";
const basePath = configuredBasePath === "/" ? "" : `/${configuredBasePath.split("/").filter(Boolean).join("/")}`;
const expectedFaviconPath = `${basePath}/favicon.svg`;
const homeHtml = readFileSync(join(outputDir, "index.html"), "utf8");
if (!homeHtml.includes(expectedFaviconPath)) {
  throw new Error(`Metadata favicon tidak menggunakan path yang benar. Diharapkan: ${expectedFaviconPath}`);
}

const htmlFiles = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}
walk(outputDir);

if (htmlFiles.length < requiredRoutes.length) {
  throw new Error(`Jumlah halaman HTML terlalu sedikit: ${htmlFiles.length}`);
}

console.log("Ekspor statis diverifikasi.");
console.log("Rute wajib:", requiredRoutes.join(", "));
console.log("Favicon:", expectedFaviconPath);
console.log("Jumlah berkas HTML:", htmlFiles.length);
console.log("Berkas root:", readdirSync(outputDir).join(", "));
