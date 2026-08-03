import type { Metadata } from "next";
import AboutPage from "@/components/AboutPage";
import { copy } from "@/lib/content";

export const metadata: Metadata = {
  title: copy.tr.about.metaTitle,
  description: copy.tr.about.metaDesc,
};

export default function AboutTr() {
  return <AboutPage lang="tr" />;
}
