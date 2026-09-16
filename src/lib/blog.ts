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
  /** Stays the English category id even on a `tr`-resolved post: it's the
      key BlogLibrary.tsx's tab filter and CATEGORY_TAB_LABEL match on, not
      display text. Display text is resolved from this id at render time. */
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
  /** Present only on the authored (English) record in blog-posts.ts - the
      Turkish variant of every field above that's actually rendered
      (title/excerpt/pullQuote/sections/related/topic). `category` and the
      post's identity (slug/date/contentType) don't need a `tr` override:
      the id stays the same, only its label changes at display time. See
      getAllBlogPosts()'s "tr" branch for how this gets merged in. */
  tr?: {
    title: string;
    excerpt: string;
    pullQuote?: string;
    sections: BlogSection[];
    related?: { href: string; label: string }[];
    topic?: string;
  };
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

/** Every post, in `lang`. On `en` this is the authored record itself. On
    `tr` each post's `tr` override is merged over it - same shape, real
    Turkish writing (not a translation-layer stub) - falling back to the
    English field only for a post that genuinely has no `tr` yet, so a
    future post added without one degrades instead of breaking the page. */
export function getAllBlogPosts(lang: Lang): BlogPost[] {
  if (lang !== "tr") return BLOG_POSTS;
  return BLOG_POSTS.map((p) => {
    if (!p.tr) return p;
    const { title, excerpt, pullQuote, sections, related, topic } = p.tr;
    return { ...p, title, excerpt, pullQuote: pullQuote ?? p.pullQuote, sections, related: related ?? p.related, topic: topic ?? p.topic };
  });
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
