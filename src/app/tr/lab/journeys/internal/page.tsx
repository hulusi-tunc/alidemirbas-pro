import type { Metadata } from "next";
import LabPage from "@/components/LabPage";
import { INTERNAL_JOURNEY_ROWS } from "@/lib/canonical-view";
import { copy } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Internal journey'ler - Canonical Journey Kütüphanesi",
  description: `Tamamen sistemin içinde çözülen ${INTERNAL_JOURNEY_ROWS.length} canonical journey - mesaj yok, insana yönlendirme yok. Aranabilir, goal'e göre filtrelenebilir.`,
  alternates: pageAlternates("/lab/journeys/internal", "tr"),
};

export default function LabJourneysInternalTr() {
  const t = copy.tr.lab.journeysSplit.internal;
  return (
    <LabPage
      lang="tr"
      rows={INTERNAL_JOURNEY_ROWS}
      title={t.title}
      intro={t.intro.replace("{count}", String(INTERNAL_JOURNEY_ROWS.length))}
      extraCrumb={{ name: copy.tr.lab.journeysSplit.internalLabel, url: "/tr/lab/journeys/internal" }}
    />
  );
}
