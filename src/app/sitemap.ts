import type { MetadataRoute } from "next";
import { JOURNEY_ROWS } from "@/lib/canonical-view";
import { getAllBlogPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";

// Ported from the cv site's sitemap.ts. "/content" (Insights, the LinkedIn
// post archive) is deliberately not in this list - it was decided the new
// site won't carry that section at all.
const routes = [
  "", "/about", "/lab", "/lab/journeys", "/lab/ab-testing", "/lab/dashboard-builder", "/stack", "/contact", "/blog",
  // Every canonical journey is its own page now. The 4 retired ids that
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
