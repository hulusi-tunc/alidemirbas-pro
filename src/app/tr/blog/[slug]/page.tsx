import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BlogPostPage from "@/components/BlogPostPage";
import { getAllBlogPosts, getBlogPost } from "@/lib/blog";
import { pageAlternates } from "@/lib/seo";

export function generateStaticParams() {
  return getAllBlogPosts("tr").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost("tr", slug);
  if (!post) return {};
  return {
    title: `${post.title} - Ali Demirbaş`,
    description: post.excerpt,
    alternates: pageAlternates(`/blog/${slug}`, "tr"),
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPost("tr", slug);
  if (!post) notFound();
  return <BlogPostPage lang="tr" post={post} />;
}
