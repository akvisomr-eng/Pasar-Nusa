import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync("supabase/functions/pasar-nusa-web/index.ts", "utf8");
const start = source.indexOf("const PAGE = ") + "const PAGE = ".length;
const serve = source.indexOf("Deno.serve", start);
const end = source.lastIndexOf(";", serve);
if (start < "const PAGE = ".length || serve < 0 || end < 0) {
  throw new Error("Could not locate the embedded storefront HTML.");
}
const html = JSON.parse(source.slice(start, end));
const scriptStart = html.indexOf("<script>");
const scriptEnd = html.indexOf("</script>", scriptStart + 8);
if (scriptStart < 0 || scriptEnd < 0) {
  throw new Error("Storefront JavaScript block is missing.");
}
new vm.Script(html.slice(scriptStart + 8, scriptEnd), { filename: "pasar-nusa-inline.js" });
for (const marker of ["Pasar Nusa", "Dashboard admin", "Panel pedagang", "checkout_order", "seller_decide_order_item", "bootstrap_platform_admin"]) {
  if (!html.includes(marker)) throw new Error(`Missing required storefront marker: ${marker}`);
}
console.log("Embedded storefront JavaScript syntax and required marketplace flows verified.");
