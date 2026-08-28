import type { MetadataRoute } from "next";
import { JOURNEY_ROWS } from "@/lib/canonical-view";
import { getAllBlogPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";
import { ALL_TOOL_SLUGS } from "@/lib/calc-catalog";
import { ALL_AB_TEST_SLUGS } from "@/lib/ab-test-view";

// Ported from the cv site's sitemap.ts. "/content" (Insights, the LinkedIn
// post archive) is deliberately not in this list - it was decided the new
// site won't carry that section at all.
const routes = [
  "", "/about", "/lab", "/lab/journeys", "/lab/ab-testing", "/lab/dashboard-builder", "/stack", "/contact", "/blog",
  // The Journey Builder product page. /lab/journeys above is the LIBRARY;
  // this is the product page in front of it, added this round.
  "/lab/claude-lifecycle",
  // The Change History Explorer's product page, added when that project
  // stopped being the one Lab entry whose only link left the site.
  "/lab/google-ads-change-history-dashboard",
  // The Marketing Calculators index, plus every live calculator/text-tool
  // route - previously missing from this list entirely, meaning the whole
  // /calculators section (index + every individual calculator page) was
  // never in the sitemap despite being indexable, real, EN+TR content.
  "/calculators",
  ...ALL_TOOL_SLUGS.map((slug) => `/calculators/${slug}`),
  // The A/B Test Library index, plus all 211 scenario detail pages - same
  // gap as the calculators one above: real, live, indexable, metadata-
  // complete pages (AbTestRoutes.tsx) that were never in this list at all.
  "/lab/ab-testing/library",
  ...ALL_AB_TEST_SLUGS.map((slug) => `/lab/ab-testing/library/${slug}`),
  // Every canonical journey is its own page now. The 5 retired ids that
  // resolve into a survivor are deliberately absent: they are noindex, and a
  // sitemap entry would ask for exactly the indexing they decline.
  ...JOURNEY_ROWS.map((j) => `/lab/journeys/${j.slug}`),
  // Blog posts are EN-only (see lib/blog.ts) - no /tr/blog/{slug} entries.
  ...getAllBlogPosts("en").map((p) => `/blog/${p.slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Each route is published in both languages: English at the root, Turkish
  // under /tr, cross-referenced with hreflang alternates - except individual
  // blog posts, which are EN-only (see lib/blog.ts) and have no real /tr
  // counterpart to list.
  return routes.flatMap((path) => {
    const en = `${SITE_URL}${path}`;
    const priority = path === "" ? 1 : path.startsWith("/lab/journeys/") ? 0.4 : 0.7;
    const isEnOnlyPost = path.startsWith("/blog/");

    if (isEnOnlyPost) {
      return [{ url: en, lastModified: now, changeFrequency: "monthly" as const, priority }];
    }

    const tr = `${SITE_URL}/tr${path}`;
    const alternates = { languages: { en, tr } };
    return [
      { url: en, lastModified: now, changeFrequency: "monthly" as const, priority, alternates },
      { url: tr, lastModified: now, changeFrequency: "monthly" as const, priority, alternates },
    ];
  });
}
