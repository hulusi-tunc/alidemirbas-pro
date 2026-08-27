import type { Metadata } from "next";
import LabPage from "@/components/LabPage";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Canonical Journey Kütüphanesi - Ali Demirbaş",
  description:
    "26 kategoriye yayılmış, sektörden bağımsız 255 lifecycle state machine; aranabilir, goal'e göre filtrelenebilir.",
  alternates: pageAlternates("/lab/journeys", "tr"),
};

export default function LabJourneysTr() {
  return <LabPage lang="tr" />;
}
