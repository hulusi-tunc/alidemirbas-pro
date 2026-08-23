import type { Lang } from "@/lib/content";

/* Blog data model + accessor. There is no blog content yet - BlogPage.tsx
   has always rendered an honest "nothing published yet" empty state (see
   its own comment), and that hasn't changed. This file exists so the new
   editorial-library shell (search, filters, grid/list) has a real,
   typed data source to read from - one that returns an empty array today
   and needs no rewiring the day the first post is added. No placeholder
   posts are defined here. */

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date (YYYY-MM-DD). */
  date: string;
  category: string;
  topic?: string;
  contentType?: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getAllBlogPosts(lang: Lang): BlogPost[] {
  return [];
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
