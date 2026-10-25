import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/insights", destination: "/blogs", permanent: true },
      { source: "/insights/:slug", destination: "/blogs/:slug", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "ohhvhmqjtrbdkkojsaml.supabase.co" },
    ],
  },
};

export default nextConfig;
