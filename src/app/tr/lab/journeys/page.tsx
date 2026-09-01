import type { Metadata } from "next";
import JourneyLibraryPage from "@/components/JourneyLibraryPage";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Canonical Journey Kütüphanesi - Ali Demirbaş",
  description:
    "26 kategoriye yayılmış, sektörden bağımsız 281 lifecycle state machine; bir kişiye ulaşanlar ve tamamen sistem içinde çözülenler olarak ikiye ayrıldı.",
  alternates: pageAlternates("/lab/journeys", "tr"),
};

export default function LabJourneysTr() {
  return <JourneyLibraryPage lang="tr" />;
}
