import type { Metadata } from "next";
import BlogPage from "@/components/BlogPage";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog - Ali Demirbaş",
  description: "LTV:CAC, elde tutma eğrileri, ROAS attribution, lifecycle journey ile kampanya farkı ve guardrail metrikleri üzerine kısa yazılar. İçerik İngilizce.",
  alternates: pageAlternates("/blog", "tr"),
};

export default function Blog() {
  return <BlogPage lang="tr" />;
}
