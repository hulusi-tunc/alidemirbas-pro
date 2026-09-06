import type { Metadata } from "next";
import { notFound } from "next/navigation";

import DashboardBuilderPage from "@/components/DashboardBuilderPage";
import { getDashboardBuilderContent } from "@/lib/skill-pages/dashboard-builder";
import { pageAlternates } from "@/lib/seo";

const content = getDashboardBuilderContent("en");

export const metadata: Metadata = content
  ? {
      title: `${content.title} - Ali Demirbaş`,
      description: content.sub,
      alternates: pageAlternates("/lab/dashboard-builder", "en"),
    }
  : {};

export default function DashboardBuilder() {
  if (!content) notFound();
  return <DashboardBuilderPage lang="en" content={content} />;
}
