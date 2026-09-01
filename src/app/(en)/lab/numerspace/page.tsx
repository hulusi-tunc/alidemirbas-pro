import type { Metadata } from "next";
import { notFound } from "next/navigation";

import NumerspacePage from "@/components/NumerspacePage";
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
  return <NumerspacePage lang="en" content={content} />;
}
