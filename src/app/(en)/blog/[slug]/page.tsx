import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BlogPostPage from "@/components/BlogPostPage";
import { getAllBlogPosts, getBlogPost } from "@/lib/blog";
import { pageAlternates } from "@/lib/seo";

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
    alternates: pageAlternates(`/blog/${post.slug}`, "en"),
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost("en", slug);
  if (!post) notFound();
  return <BlogPostPage lang="en" post={post} />;
}
