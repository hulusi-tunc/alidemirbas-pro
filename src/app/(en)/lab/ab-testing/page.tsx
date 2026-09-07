import type { Metadata } from "next";
import AbTestingPage from "@/components/AbTestingPage";
import { copy } from "@/lib/content";
import { AB_TEST_COUNT } from "@/lib/ab-test-view";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: copy.en.abTesting.metaTitle,
  description: copy.en.abTesting.metaDesc.replace("{count}", String(AB_TEST_COUNT)),
  alternates: pageAlternates("/lab/ab-testing", "en"),
};

export default function AbTesting() {
  return <AbTestingPage lang="en" />;
}
