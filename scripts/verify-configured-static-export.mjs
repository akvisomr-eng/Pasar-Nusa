import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const outputDir = "out";
const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!publicUrl || !publicKey) {
  throw new Error("Konfigurasi publik Supabase tidak tersedia. Periksa repository variables.");
}

const jsFiles = [];
function walk(dir) {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith(".js")) jsFiles.push(full);
  }
}
walk(join(outputDir, "_next", "static"));

if (jsFiles.length === 0) {
  throw new Error("Tidak ada berkas JavaScript Next.js di hasil static export.");
}

const bundles = jsFiles.map((file) => readFileSync(file, "utf8"));
if (!bundles.some((content) => content.includes(publicUrl))) {
  throw new Error("URL Supabase tidak ditemukan dalam bundle JavaScript.");
}
if (!bundles.some((content) => content.includes(publicKey))) {
  throw new Error("Publishable/anon key Supabase tidak ditemukan dalam bundle JavaScript.");
}
if (publicKey.toLowerCase().includes("service_role") || publicKey.startsWith("sb_secret_")) {
  throw new Error("Kunci server/secret tidak boleh digunakan di bundle browser.");
}

console.log("Bundle static terhubung dengan konfigurasi publik Supabase.");
console.log("Berkas JavaScript diperiksa:", jsFiles.length);
