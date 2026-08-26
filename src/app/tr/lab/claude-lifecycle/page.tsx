import type { Metadata } from "next";
import JourneyBuilderPage from "@/components/JourneyBuilderPage";
import { copy } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: copy.tr.journeyBuilder.metaTitle,
  description: copy.tr.journeyBuilder.metaDesc,
  alternates: pageAlternates("/lab/claude-lifecycle", "tr"),
};

export default function ClaudeLifecycleTr() {
  return <JourneyBuilderPage lang="tr" />;
}
