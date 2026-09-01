import type { Metadata } from "next";
import LabPage from "@/components/LabPage";
import { COMMUNICATION_JOURNEY_ROWS } from "@/lib/canonical-view";
import { copy } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "İletişim journey'leri - Canonical Journey Kütüphanesi",
  description: `Kendi işi bir kişiye ulaşan ${COMMUNICATION_JOURNEY_ROWS.length} canonical journey - mesajla ya da birine yönlendirerek. Aranabilir, goal'e göre filtrelenebilir.`,
  alternates: pageAlternates("/lab/communication-journeys", "tr"),
};

export default function LabJourneysCommunicationTr() {
  const t = copy.tr.lab.journeysSplit.communication;
  return (
    <LabPage
      lang="tr"
      rows={COMMUNICATION_JOURNEY_ROWS}
      title={t.title}
      intro={t.intro.replace("{count}", String(COMMUNICATION_JOURNEY_ROWS.length))}
      extraCrumb={{ name: copy.tr.lab.journeysSplit.communicationLabel, url: "/tr/lab/communication-journeys" }}
      browser="grouped"
    />
  );
}
