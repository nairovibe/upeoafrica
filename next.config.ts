import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/insights", destination: "/blogs", permanent: true },
      { source: "/insights/:slug", destination: "/blogs/:slug", permanent: true },
      { source: "/admin", destination: "/console", permanent: false },
      { source: "/admin/:path*", destination: "/console/:path*", permanent: false },
    ];
  },
  async headers() {
    const hidden = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/console", headers: hidden },
      { source: "/console/:path*", headers: hidden },
      { source: "/api/:path*", headers: hidden },
      { source: "/invoice/:path*", headers: hidden },
      { source: "/indexnow-key.txt", headers: hidden },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "qtynlcczsqqwlcacwwfc.supabase.co" },
    ],
  },
};

export default nextConfig;
