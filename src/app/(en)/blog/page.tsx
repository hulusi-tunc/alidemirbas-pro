import type { Metadata } from "next";
import BlogPage from "@/components/BlogPage";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog - Ali Demirbaş",
  description: "Writing on growth, CRM and lifecycle marketing.",
  alternates: pageAlternates("/blog", "en"),
};

export default function Blog() {
  return <BlogPage lang="en" />;
}
