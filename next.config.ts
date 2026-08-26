import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't advertise the framework in responses.
  poweredByHeader: false,

  images: {
    // Stack page tool logos come from Google's favicon service...
    remotePatterns: [
      { protocol: "https", hostname: "www.google.com", pathname: "/s2/favicons" },
      // ...except Data Studio, whose real favicon that service can't crawl
      // (see src/lib/stack.ts's own comment) - it gets a direct gstatic
      // asset URL instead, so gstatic needs its own allow entry.
      { protocol: "https", hostname: "www.gstatic.com", pathname: "/analytics-lego/svg/**" },
    ],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // HSTS only takes effect once the site is served over HTTPS (Vercel
          // does this by default); harmless to set ahead of that.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
        // No Content-Security-Policy yet - the third-party origins that would
        // need allowing (Vercel's own preview/analytics scripts, the Google
        // favicon service) aren't fully mapped out, and a wrong CSP silently
        // breaks things rather than failing loudly. Left for a follow-up pass.
      },
    ];
  },
};

export default nextConfig;
