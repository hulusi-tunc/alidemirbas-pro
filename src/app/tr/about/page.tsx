import type { Metadata } from "next";
import AboutPage from "@/components/AboutPage";
import { copy } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: copy.tr.about.metaTitle,
  description: copy.tr.about.metaDesc,
  alternates: pageAlternates("/about", "tr"),
};

export default function AboutTr() {
  return <AboutPage lang="tr" />;
}
