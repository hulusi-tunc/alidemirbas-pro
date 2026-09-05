import type { Metadata } from "next";
import JourneyLibraryPage from "@/components/JourneyLibraryPage";
import { withCanonicalCount } from "@/lib/canonical-view";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Canonical Journey Kütüphanesi - Ali Demirbaş",
  /* Hesaplanır, elle yazılmaz - bkz. EN karşılığındaki not. */
  description: withCanonicalCount(
    "{categories} kategoriye yayılmış, sektörden bağımsız {count} lifecycle state machine - bir kişiye ulaşan journey'ler ve dayandıkları sessiz durumlar ile çalışma zamanı mekanizmaları.",
  ),
  alternates: pageAlternates("/lab/journeys", "tr"),
};

export default function LabJourneysTr() {
  return <JourneyLibraryPage lang="tr" />;
}
