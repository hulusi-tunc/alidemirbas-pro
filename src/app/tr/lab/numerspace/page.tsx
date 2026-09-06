import type { Metadata } from "next";
import { notFound } from "next/navigation";

import NumerspacePage from "@/components/NumerspacePage";
import { getNumerspaceContent } from "@/lib/skill-pages/numerspace";
import { pageAlternates } from "@/lib/seo";

const content = getNumerspaceContent("tr");

export const metadata: Metadata = content
  ? {
      title: `${content.title} - Ali Demirbaş`,
      description: content.sub,
      alternates: pageAlternates("/lab/numerspace", "tr"),
    }
  : {};

export default function NumerspaceTr() {
  if (!content) notFound();
  return <NumerspacePage lang="tr" content={content} />;
}
