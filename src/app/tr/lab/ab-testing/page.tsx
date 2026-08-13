import type { Metadata } from "next";
import AbTestingPage from "@/components/AbTestingPage";
import { copy } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: copy.tr.abTesting.metaTitle,
  description: copy.tr.abTesting.metaDesc,
  alternates: pageAlternates("/lab/ab-testing", "tr"),
};

export default function AbTestingTr() {
  return <AbTestingPage lang="tr" />;
}
