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

  /* The four URLs that die when alidemirbas.com.tr moves from the
     predecessor CV site to this one.

     The domain still serves that older project, whose sitemap carries 13
     URLs. Nine of them exist here unchanged (/about, /contact, /lab,
     /stack and their /tr twins, plus /tr); the four below do not, and
     without these they would start 404ing the moment the domain is
     repointed. Each maps to the page that actually succeeded it rather
     than to the home page - a redirect to "/" is what people write when
     they have not checked what the old URL was:

       /lab/crm-journeys  "CRM Journey Archive"  ->  the Canonical Journey
                          Library, the same archive rebuilt (281 journeys)
       /content           "Insights", the LinkedIn post archive  ->  /blog,
                          the writing section that replaced it

     Permanent (308), because these moves are permanent. They are cheap to
     keep: four static rules, no matcher work at request time. Verified
     against the live sitemap of the site currently on the domain, not
     guessed - see the session that added them. */
  async redirects() {
    return [
      { source: "/lab/crm-journeys", destination: "/lab/journeys", permanent: true },
      { source: "/tr/lab/crm-journeys", destination: "/tr/lab/journeys", permanent: true },
      { source: "/content", destination: "/blog", permanent: true },
      { source: "/tr/content", destination: "/tr/blog", permanent: true },
    ];
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
