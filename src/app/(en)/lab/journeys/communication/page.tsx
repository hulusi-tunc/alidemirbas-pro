import type { Metadata } from "next";
import LabPage from "@/components/LabPage";
import { COMMUNICATION_JOURNEY_ROWS } from "@/lib/canonical-view";
import { copy } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Communication journeys - Canonical Journey Library",
  description:
    `${COMMUNICATION_JOURNEY_ROWS.length} canonical journeys whose own work reaches a person - by message or by routing to someone. Searchable, filterable by goal.`,
  alternates: pageAlternates("/lab/journeys/communication", "en"),
};

export default function LabJourneysCommunication() {
  const t = copy.en.lab.journeysSplit.communication;
  return (
    <LabPage
      lang="en"
      rows={COMMUNICATION_JOURNEY_ROWS}
      title={t.title}
      intro={t.intro.replace("{count}", String(COMMUNICATION_JOURNEY_ROWS.length))}
      extraCrumb={{ name: copy.en.lab.journeysSplit.communicationLabel, url: "/lab/journeys/communication" }}
      browser="grouped"
    />
  );
}
