import type { Metadata } from "next";
import { notFound } from "next/navigation";

import SkillProductPage from "@/components/SkillProductPage";
import { getDashboardBuilderContent } from "@/lib/skill-pages/dashboard-builder";
import { pageAlternates } from "@/lib/seo";

const content = getDashboardBuilderContent("tr");

export const metadata: Metadata = content
  ? {
      title: `${content.title} - Ali Demirbaş`,
      description: content.sub,
      alternates: pageAlternates("/lab/dashboard-builder", "tr"),
    }
  : {};

export default function DashboardBuilderTr() {
  if (!content) notFound();
  return <SkillProductPage lang="tr" content={content} />;
}
