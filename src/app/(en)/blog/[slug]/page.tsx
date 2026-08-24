import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BlogPostPage from "@/components/BlogPostPage";
import { getAllBlogPosts, getBlogPost } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";

// No tr/blog/[slug] route - posts are EN-only for now (see lib/blog.ts),
// and nothing links to a TR post URL. A stray visit to one falls through
// to tr/[...catchall] and gets a real, locale-correct 404 rather than a
// route that half-exists.
export function generateStaticParams() {
  return getAllBlogPosts("en").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost("en", slug);
  if (!post) return {};
  return {
    title: `${post.title} - Ali Demirbaş`,
    description: post.excerpt,
    // No pageAlternates() here on purpose: it always builds a `tr` entry in
    // the hreflang languages block, but there's no tr/blog/[slug] route (see
    // the comment above) - that alternate would 404. Canonical-only, same
    // pattern already used for the journey-merged case (JourneyRoutes.tsx).
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost("en", slug);
  if (!post) notFound();
  return <BlogPostPage lang="en" post={post} />;
}
