import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const findings = [];
const checks = [];
const add = (agent, name, status, detail, severity = "info") => {
  const item = { agent, name, status, detail, severity };
  checks.push(item);
  if (status !== "pass") findings.push(item);
};
const exists = async (file) => {
  try { await readFile(path.join(root, file)); return true; } catch { return false; }
};
const walk = async (dir) => {
  const result = [];
  let entries = [];
  try { entries = await readdir(path.join(root, dir), { withFileTypes: true }); } catch { return result; }
  for (const entry of entries) {
    const rel = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(rel));
    else result.push(rel);
  }
  return result;
};

const routes = ["index.html", "katalog/index.html", "studio/index.html", "seller/index.html"];
let routeFailure = false;
for (const route of routes) {
  const file = path.join(root, "out", route);
  try {
    const html = await readFile(file, "utf8");
    const hasTitle = /<title>[^<]{3,}<\/title>/i.test(html);
    const hasDescription = /<meta name="description" content="[^"]{10,}"/i.test(html);
    const hasLanguage = /<html[^>]*lang="id"/i.test(html);
    const hasLocalhost = /https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(html);
    if (!hasTitle || !hasDescription || !hasLanguage || hasLocalhost) routeFailure = true;
    add("QA", "static-route:" + route, hasTitle && hasDescription && hasLanguage && !hasLocalhost ? "pass" : "fail",
      [!hasTitle && "title hilang", !hasDescription && "meta description hilang", !hasLanguage && "lang=id hilang", hasLocalhost && "tautan localhost ditemukan"].filter(Boolean).join(", ") || "HTML ter-render, metadata ada, tanpa tautan localhost",
      "high");
  } catch {
    routeFailure = true;
    add("QA", "static-route:" + route, "fail", "Berkas hasil build tidak ditemukan: out/" + route, "high");
  }
}
if (await exists("out/studio/index.html")) {
  const studio = await readFile(path.join(root, "out/studio/index.html"), "utf8");
  const hasStudio = /PASAR NUSA STUDIO|Rancang kemasan/i.test(studio);
  const hasExport = /Unduh desain 2D/i.test(studio);
  add("DESIGN", "product-studio-export", hasStudio && hasExport ? "pass" : "fail",
    "Memeriksa halaman Studio dan kontrol ekspor SVG 2D.", "medium");
}

const robotsOk = await exists("out/robots.txt");
const sitemapOk = await exists("out/sitemap.xml");
if (robotsOk && sitemapOk) {
  const robots = await readFile(path.join(root, "out/robots.txt"), "utf8");
  const sitemap = await readFile(path.join(root, "out/sitemap.xml"), "utf8");
  const valid = robots.includes("Sitemap: https://akvisomr-eng.github.io/Pasar-Nusa/sitemap.xml")
    && sitemap.includes("https://akvisomr-eng.github.io/Pasar-Nusa/")
    && sitemap.includes("/katalog/")
    && sitemap.includes("/studio/");
  add("SEO", "robots-and-sitemap", valid ? "pass" : "fail",
    valid ? "robots.txt dan sitemap.xml memuat URL GitHub Pages serta halaman katalog/studio." : "robots.txt atau sitemap.xml tidak sesuai URL produksi.", "high");
} else {
  add("SEO", "robots-and-sitemap", "fail", "robots.txt atau sitemap.xml tidak ikut dalam static export.", "high");
}

const migrationFiles = (await walk("supabase/migrations")).filter((file) => file.endsWith(".sql"));
const migrations = (await Promise.all(migrationFiles.map((file) => readFile(path.join(root, file), "utf8")))).join("\n").toLowerCase();
const coreTables = ["profiles", "stores", "categories", "products", "inventory", "orders", "order_items", "audit_logs"];
const missingRls = coreTables.filter((table) => {
  const pattern = new RegExp("alter\\s+table(?:\\s+if\\s+exists)?\\s+public\\." + table + "\\s+enable\\s+row\\s+level\\s+security", "i");
  return !pattern.test(migrations);
});
add("SECURITY", "core-table-rls-migration", missingRls.length === 0 ? "pass" : "fail",
  missingRls.length ? "Tidak ditemukan deklarasi RLS eksplisit untuk: " + missingRls.join(", ") : "Migrasi mengaktifkan RLS untuk seluruh tabel inti yang diperiksa.", "critical");

const sourceFiles = (await walk("src")).filter((file) => /\.(tsx?|jsx?)$/.test(file));
const secretPatterns = [
  /sb_secret_[A-Za-z0-9_-]{12,}/,
  /SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*["'][^"']{12,}["']/i,
  /service_role\s*[:=]\s*["'][A-Za-z0-9._-]{20,}["']/i,
];
const secretMatches = [];
for (const file of sourceFiles) {
  const source = await readFile(path.join(root, file), "utf8");
  if (secretPatterns.some((pattern) => pattern.test(source))) secretMatches.push(file);
}
add("SECURITY", "client-secret-scan", secretMatches.length === 0 ? "pass" : "fail",
  secretMatches.length ? "Pola secret potensial ditemukan di: " + secretMatches.join(", ") : "Tidak menemukan pola service-role/secret yang umum di source TypeScript/JavaScript.", "critical");

let auditSeverity = "pass";
let auditDetail = "Laporan npm audit tidak tersedia; cek dependency dijalankan terpisah oleh workflow.";
try {
  const audit = JSON.parse(await readFile(path.join(root, "reports/npm-audit.json"), "utf8"));
  const counts = audit.metadata?.vulnerabilities ?? {};
  const high = Number(counts.high ?? 0);
  const critical = Number(counts.critical ?? 0);
  auditSeverity = high + critical > 0 ? "fail" : "pass";
  auditDetail = `npm audit: critical=${critical}, high=${high}, moderate=${Number(counts.moderate ?? 0)}, low=${Number(counts.low ?? 0)}.`;
} catch {}
add("SECURITY", "dependency-audit", auditSeverity, auditDetail, "high");

const report = {
  product: "Pasar Nusa",
  generated_at: new Date().toISOString(),
  mode: "static-rule-based-agent-patrol",
  note: "Pemeriksaan otomatis berbasis aturan; bukan pengganti penetration test atau audit manusia.",
  summary: {
    checks: checks.length,
    passed: checks.filter((item) => item.status === "pass").length,
    failed: checks.filter((item) => item.status === "fail").length,
    agents: [...new Set(checks.map((item) => item.agent))],
  },
  checks,
  findings,
};
await mkdir(path.join(root, "reports"), { recursive: true });
await writeFile(path.join(root, "reports/agent-patrol-latest.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report.summary, null, 2));
for (const item of findings) console.log(`[${item.status.toUpperCase()}] [${item.agent}] ${item.name}: ${item.detail}`);
if (routeFailure || checks.some((item) => item.status === "fail" && ["critical", "high"].includes(item.severity))) {
  process.exitCode = 1;
}
