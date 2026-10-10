import { spawnSync } from "node:child_process";

const nextBin = "node_modules/next/dist/bin/next";
const result = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  env: { ...process.env, PASAR_NUSA_STATIC_EXPORT: "1" }
});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
