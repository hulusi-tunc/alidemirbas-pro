import type { Metadata } from "next";
import JourneyBuilderPage from "@/components/JourneyBuilderPage";
import { copy } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: copy.en.journeyBuilder.metaTitle,
  description: copy.en.journeyBuilder.metaDesc,
  alternates: pageAlternates("/lab/claude-lifecycle", "en"),
};

export default function ClaudeLifecycle() {
  return <JourneyBuilderPage lang="en" />;
}
