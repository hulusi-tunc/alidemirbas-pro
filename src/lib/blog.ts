import type { Lang } from "@/lib/content";
import { BLOG_POSTS } from "@/lib/blog-posts";

/* Blog data model + accessor. blog-posts.ts holds the actual authored
   posts (real writing, no placeholders) - this file is just the type and
   the read layer the editorial-library shell (search, filters, grid/
   list) reads from. */

export type BlogSection = { heading: string; body: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  category: string;
  topic?: string;
  contentType?: string;
  sections: BlogSection[];
  /** A pull-quote for the post detail page - always a VERBATIM sentence
      lifted from one of this post's own `sections[].body` (never written
      fresh for display), so the quote can't drift from what the post
      actually says. Optional so a post can go without one rather than
      forcing a weak pull from thin material. */
  pullQuote?: string;
  /** Internal links relevant to the post - the calculator or Lab tool it
      references, so the post actually connects to the rest of the site. */
  related?: { href: string; label: string }[];
};

/** Single real byline - this is a one-author blog (see AboutPage.tsx's own
    "Mobile App Growth Lead, Aksigorta" line), so this is a shared constant
    rather than a per-post field to keep in sync. `bio` restates the same
    real role plus this blog's own real subject (its H1 on /blog: "Writing
    on growth, CRM and lifecycle marketing") - not a new claim. */
export const BLOG_AUTHOR = {
  name: "Ali Demirbaş",
  role: "Mobile App Growth Lead, Aksigorta",
  bio: "Ali Demirbaş is the Mobile App Growth Lead at Aksigorta. He writes about growth, lifecycle marketing and the metrics behind them.",
};

// EN only for now, matching the same precedent already established for
// calculator Phase 4 content (calc-content.ts): real long-form writing is
// authored once, in English, and TR falls back rather than shipping a
// half-translated page. lang is kept in the signature so callers don't
// need special-casing and TR posts can be added later without a call-site
// change.
export function getAllBlogPosts(lang: Lang): BlogPost[] {
  if (lang !== "en") return [];
  return BLOG_POSTS;
}

export function getBlogPost(lang: Lang, slug: string): BlogPost | undefined {
  return getAllBlogPosts(lang).find((p) => p.slug === slug);
}

export type BlogFacetCount = { id: string; count: number };

/** Computes filter options purely from the real post set - a category/
    topic/content-type only appears as a filter if at least one real post
    uses it. Never invents a taxonomy value the data doesn't have. */
export function getBlogFacets(posts: BlogPost[]) {
  const count = (values: (string | undefined)[]): BlogFacetCount[] => {
    const counts = new Map<string, number>();
    for (const v of values) {
      if (!v) continue;
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    return [...counts.entries()].map(([id, c]) => ({ id, count: c })).sort((a, b) => b.count - a.count);
  };
  return {
    categories: count(posts.map((p) => p.category)),
    topics: count(posts.map((p) => p.topic)),
    contentTypes: count(posts.map((p) => p.contentType)),
  };
}
