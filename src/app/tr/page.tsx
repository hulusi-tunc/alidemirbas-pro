import type { Metadata } from "next";
import Site from "@/components/Site";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Ali Demirbaş - Büyüme, CRM ve ölçümleme",
  description:
    "Aksigorta'da Mobil Uygulama Büyüme Lideri. Öncesinde Vodafone, Getir ve Wingie Enuygun Group. Büyüme, CRM ve ölçümleme üzerine çalışıyorum.",
  alternates: pageAlternates("", "tr"),
};

export default function HomeTr() {
  return <Site lang="tr" />;
}
