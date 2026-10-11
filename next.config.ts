import type { NextConfig } from "next";

const staticExport = process.env.PASAR_NUSA_STATIC_EXPORT === "1";

const sharedConfig = {
  poweredByHeader: false,
  reactStrictMode: true
};

const nextConfig: NextConfig = staticExport
  ? {
      ...sharedConfig,
      output: "export",
      basePath: "/Pasar-Nusa",
      trailingSlash: true,
      images: { unoptimized: true }
    }
  : {
      ...sharedConfig,
      async headers() {
        return [
          {
            source: "/:path*",
            headers: [
              { key: "X-Content-Type-Options", value: "nosniff" },
              { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
              { key: "X-Frame-Options", value: "DENY" },
              { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
            ]
          }
        ];
      }
    };

export default nextConfig;
