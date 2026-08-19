import type { Metadata } from "next";
import AboutPage from "@/components/AboutPage";
import { copy } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: copy.en.about.metaTitle,
  description: copy.en.about.metaDesc,
  alternates: pageAlternates("/about", "en"),
};

export default function About() {
  return <AboutPage lang="en" />;
}
