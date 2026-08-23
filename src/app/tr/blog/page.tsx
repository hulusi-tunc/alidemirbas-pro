import type { Metadata } from "next";
import BlogPage from "@/components/BlogPage";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog - Ali Demirbaş",
  description: "Büyüme, CRM ve lifecycle pazarlama üzerine yazılar.",
  alternates: pageAlternates("/blog", "tr"),
};

export default function Blog() {
  return <BlogPage lang="tr" />;
}
