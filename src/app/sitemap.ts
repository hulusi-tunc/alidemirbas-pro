import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Ported from the cv site's sitemap.ts. "/content" (Insights, the LinkedIn
// post archive) is deliberately not in this list - it was decided the new
// site won't carry that section at all.
const routes = ["", "/about", "/lab", "/lab/journeys", "/lab/ab-testing", "/stack", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Each route is published in both languages: English at the root, Turkish
  // under /tr, cross-referenced with hreflang alternates.
  return routes.flatMap((path) => {
    const en = `${SITE_URL}${path}`;
    const tr = `${SITE_URL}/tr${path}`;
    const alternates = { languages: { en, tr } };
    const priority = path === "" ? 1 : 0.7;

    return [
      { url: en, lastModified: now, changeFrequency: "monthly" as const, priority, alternates },
      { url: tr, lastModified: now, changeFrequency: "monthly" as const, priority, alternates },
    ];
  });
}
