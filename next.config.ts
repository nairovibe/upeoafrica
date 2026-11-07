import type { NextConfig } from "next";

const consoleHost = process.env.NEXT_PUBLIC_CONSOLE_HOST || "console.upeoafricatechnologies.co.ke";
const publicHosts = ["upeoafricatechnologies.co.ke", "www.upeoafricatechnologies.co.ke"];

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/insights", destination: "/blogs", permanent: true },
      { source: "/insights/:slug", destination: "/blogs/:slug", permanent: true },
      { source: "/admin", destination: "/console", permanent: false },
      { source: "/admin/:path*", destination: "/console/:path*", permanent: false },
      ...publicHosts.flatMap((host) => [
        {
          source: "/console",
          has: [{ type: "host" as const, value: host }],
          destination: `https://${consoleHost}/console`,
          permanent: false,
        },
        {
          source: "/console/:path*",
          has: [{ type: "host" as const, value: host }],
          destination: `https://${consoleHost}/console/:path*`,
          permanent: false,
        },
      ]),
      {
        source: "/",
        has: [{ type: "host", value: consoleHost }],
        destination: `https://${consoleHost}/console`,
        permanent: false,
      },
      {
        source: "/:path((?!console(?:/|$)|api(?:/|$)|_next(?:/|$)|favicon\\.ico|icon\\.png|robots\\.txt|indexnow-key\\.txt).*)",
        has: [{ type: "host", value: consoleHost }],
        destination: `https://${consoleHost}/console`,
        permanent: false,
      },
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
    minimumCacheTTL: 60 * 60 * 24 * 31,
    remotePatterns: [
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "qtynlcczsqqwlcacwwfc.supabase.co" },
    ],
  },
};

export default nextConfig;
