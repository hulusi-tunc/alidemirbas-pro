import type { Metadata } from "next";
import JourneyLibraryPage from "@/components/JourneyLibraryPage";
import { withLibraryCount } from "@/lib/canonical-view";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Journey Kütüphanesi - Ali Demirbaş",
  /* Hesaplanır, elle yazılmaz - bkz. EN karşılığındaki not. */
  description: withLibraryCount(
    "{categories} kategoride, sektörden bağımsız journey'ler. Her biri neyin başlattığını, nerede dallandığını, ne kadar beklediğini, neyin durdurduğunu ve kişinin sonra nereye geçtiğini söyler. Mesaj metni içermez. Kayıtlar İngilizce.",
  ),
  alternates: pageAlternates("/lab/journeys", "tr"),
};

export default function LabJourneysTr() {
  return <JourneyLibraryPage lang="tr" />;
}
