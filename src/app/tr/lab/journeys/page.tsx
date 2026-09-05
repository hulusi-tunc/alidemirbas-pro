import type { Metadata } from "next";
import JourneyLibraryPage from "@/components/JourneyLibraryPage";
import { withLibraryCount } from "@/lib/canonical-view";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Canonical Journey Kütüphanesi - Ali Demirbaş",
  /* Hesaplanır, elle yazılmaz - bkz. EN karşılığındaki not. */
  description: withLibraryCount(
    "{categories} kategoriye yayılmış, sektörden bağımsız {count} müşteri journey'si - her biri neyin başlattığını, nerede çatallandığını, ne kadar beklediğini, neyin durdurduğunu ve kişinin sonra hangi lifecycle'a ait olduğunu açıkça söyleyen bir graf.",
  ),
  alternates: pageAlternates("/lab/journeys", "tr"),
};

export default function LabJourneysTr() {
  return <JourneyLibraryPage lang="tr" />;
}
