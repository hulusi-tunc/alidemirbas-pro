import type { MetadataRoute } from "next";
import { JOURNEY_ROWS } from "@/lib/canonical-view";
import { SITE_URL } from "@/lib/seo";

// Ported from the cv site's sitemap.ts. "/content" (Insights, the LinkedIn
// post archive) is deliberately not in this list - it was decided the new
// site won't carry that section at all.
const routes = [
  "", "/about", "/lab", "/lab/journeys", "/lab/ab-testing", "/lab/dashboard-builder", "/stack", "/contact",
  // Every canonical journey is its own page now. The 4 retired ids that
  // resolve into a survivor are deliberately absent: they are noindex, and a
  // sitemap entry would ask for exactly the indexing they decline.
  ...JOURNEY_ROWS.map((j) => `/lab/journeys/${j.slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Each route is published in both languages: English at the root, Turkish
  // under /tr, cross-referenced with hreflang alternates.
  return routes.flatMap((path) => {
    const en = `${SITE_URL}${path}`;
    const tr = `${SITE_URL}/tr${path}`;
    const alternates = { languages: { en, tr } };
    const priority = path === "" ? 1 : path.startsWith("/lab/journeys/") ? 0.4 : 0.7;

    return [
      { url: en, lastModified: now, changeFrequency: "monthly" as const, priority, alternates },
      { url: tr, lastModified: now, changeFrequency: "monthly" as const, priority, alternates },
    ];
  });
}
