import type { Metadata } from "next";
import { notFound } from "next/navigation";

import SkillProductPage from "@/components/SkillProductPage";
import { getChangeHistoryContent } from "@/lib/skill-pages/change-history";
import { pageAlternates } from "@/lib/seo";

const content = getChangeHistoryContent("tr");

export const metadata: Metadata = content
  ? {
      title: `${content.title} - Ali Demirbaş`,
      description: content.sub,
      alternates: pageAlternates("/lab/google-ads-change-history-dashboard", "tr"),
    }
  : {};

export default function ChangeHistoryExplorerTr() {
  if (!content) notFound();
  return <SkillProductPage lang="tr" content={content} />;
}
