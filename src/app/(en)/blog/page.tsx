import type { Metadata } from "next";
import BlogPage from "@/components/BlogPage";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog - Ali Demirbaş",
  description: "Short pieces on LTV:CAC, retention curves, ROAS attribution, lifecycle journeys versus campaigns, and guardrail metrics.",
  alternates: pageAlternates("/blog", "en"),
};

export default function Blog() {
  return <BlogPage lang="en" />;
}
