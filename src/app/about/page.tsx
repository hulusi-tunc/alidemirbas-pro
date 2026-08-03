import type { Metadata } from "next";
import AboutPage from "@/components/AboutPage";
import { copy } from "@/lib/content";

export const metadata: Metadata = {
  title: copy.en.about.metaTitle,
  description: copy.en.about.metaDesc,
};

export default function About() {
  return <AboutPage lang="en" />;
}
