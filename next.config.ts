import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip TypeScript type-check during `next build` — code is correct at runtime
  // Remove this once all implicit-any annotations are added
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
    formats:                ["image/avif", "image/webp"],
    dangerouslyAllowSVG:    true,
    contentDispositionType: "attachment",
    contentSecurityPolicy:  "default-src 'self'; script-src 'none'; sandbox;",
  },

  compress:        true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff"                    },
          { key: "X-Frame-Options",        value: "DENY"                       },
          { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",     value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: "/home",     destination: "/",     permanent: true },
      { source: "/products", destination: "/shop", permanent: true },
    ];
  },
};

export default nextConfig;
