import type { MetadataRoute } from "next";
import { JOURNEY_ROWS, PRESET_ROWS, SURFACE_PATH } from "@/lib/canonical-view";
import { getAllBlogPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";
import { journeyPath } from "@/lib/journey-localized-slugs";
import { ALL_TOOL_SLUGS } from "@/lib/calc-catalog";
import { ALL_AB_TEST_SLUGS } from "@/lib/ab-test-view";

// Ported from the cv site's sitemap.ts. "/content" (Insights, the LinkedIn
// post archive) is deliberately not in this list - it was decided the new
// site won't carry that section at all.
const routes = [
  "", "/about", "/lab", "/lab/journeys",
  // The library's public Customer Journey surface. It is deliberately not
  // under /lab/journeys/: that segment belongs to journey detail slugs.
  ...Object.values(SURFACE_PATH),
  "/lab/ab-testing", "/lab/dashboard-builder", "/stack", "/contact", "/blog",
  // The Journey Builder product page. /lab/journeys above is the LIBRARY;
  // this is the product page in front of it, added this round.
  "/lab/claude-lifecycle",
  // The Change History Explorer's product page, added when that project
  // stopped being the one Lab entry whose only link left the site.
  "/lab/google-ads-change-history-dashboard",
  // Numerspace's portfolio page. The product itself is hosted elsewhere;
  // this is the entry describing it, and it is a real route here.
  "/lab/numerspace",
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
  // Journeys are listed below, not here: a Turkish journey page can live at
  // a localized slug, so its pair is not the English path under /tr.
  // Presets are their own pages: a parent journey with the preset applied.
  ...PRESET_ROWS.map((p) => `/lab/journeys/${p.slug}`),
  // Every blog post is real in both languages (lib/blog.ts /
  // lib/blog-posts.ts) - each gets both a /blog and a /tr/blog entry
  // through the normal bilingual path below.
  ...getAllBlogPosts("en").map((p) => `/blog/${p.slug}`),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Every PUBLIC canonical journey is its own page (JOURNEY_ROWS is already
  // the public corpus - src/lib/public-corpus.ts; archived operational
  // journeys are not routes). Retired ids that resolve into a survivor are
  // absent: they are noindex. The Turkish URL is the localized slug where
  // one exists (lib/journey-localized-slugs) - until 2026-09-26 this listed
  // the English slug under /tr, which the Turkish route no longer serves.
  const journeys = JOURNEY_ROWS.flatMap((j) => {
    const en = `${SITE_URL}${journeyPath("en", j.id, j.slug)}`;
    const tr = `${SITE_URL}${journeyPath("tr", j.id, j.slug)}`;
    const alternates = { languages: { en, tr } };
    return [
      { url: en, lastModified: now, changeFrequency: "monthly" as const, priority: 0.4, alternates },
      { url: tr, lastModified: now, changeFrequency: "monthly" as const, priority: 0.4, alternates },
    ];
  });

  // Each route is published in both languages: English at the root, Turkish
  // under /tr, cross-referenced with hreflang alternates - blog posts
  // included now that every post has a real /tr counterpart.
  return [...routes.flatMap((path) => {
    const en = `${SITE_URL}${path}`;
    const priority = path === "" ? 1 : path.startsWith("/lab/journeys/") ? 0.4 : 0.7;
    const tr = `${SITE_URL}/tr${path}`;
    const alternates = { languages: { en, tr } };
    return [
      { url: en, lastModified: now, changeFrequency: "monthly" as const, priority, alternates },
      { url: tr, lastModified: now, changeFrequency: "monthly" as const, priority, alternates },
    ];
  }), ...journeys];
}
