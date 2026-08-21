import type { Metadata } from "next";
import LabPage from "@/components/LabPage";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "CRM Journey Arşivi - Ali Demirbaş",
  description: "Sektöre ve kanala göre filtrelenebilir 70 lifecycle journey incelemesi.",
  alternates: pageAlternates("/lab/journeys", "tr"),
};

export default function LabJourneysTr() {
  return <LabPage lang="tr" />;
}
