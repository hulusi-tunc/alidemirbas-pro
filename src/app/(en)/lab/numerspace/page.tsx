import type { Metadata } from "next";
import { notFound } from "next/navigation";

import SkillProductPage from "@/components/SkillProductPage";
import { getNumerspaceContent } from "@/lib/skill-pages/numerspace";
import { pageAlternates } from "@/lib/seo";

const content = getNumerspaceContent("en");

export const metadata: Metadata = content
  ? {
      title: `${content.title} - Ali Demirbaş`,
      description: content.sub,
      alternates: pageAlternates("/lab/numerspace", "en"),
    }
  : {};

export default function Numerspace() {
  if (!content) notFound();
  return <SkillProductPage lang="en" content={content} />;
}
