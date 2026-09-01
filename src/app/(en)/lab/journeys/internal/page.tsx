import type { Metadata } from "next";
import LabPage from "@/components/LabPage";
import { INTERNAL_JOURNEY_ROWS } from "@/lib/canonical-view";
import { copy } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Internal journeys - Canonical Journey Library",
  description:
    `${INTERNAL_JOURNEY_ROWS.length} canonical journeys that resolve entirely inside the system - no message, no human route. Searchable, filterable by goal.`,
  alternates: pageAlternates("/lab/journeys/internal", "en"),
};

export default function LabJourneysInternal() {
  const t = copy.en.lab.journeysSplit.internal;
  return (
    <LabPage
      lang="en"
      rows={INTERNAL_JOURNEY_ROWS}
      title={t.title}
      intro={t.intro.replace("{count}", String(INTERNAL_JOURNEY_ROWS.length))}
      extraCrumb={{ name: copy.en.lab.journeysSplit.internalLabel, url: "/lab/journeys/internal" }}
    />
  );
}
