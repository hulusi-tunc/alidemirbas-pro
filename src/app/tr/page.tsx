import type { Metadata } from "next";
import Site from "@/components/Site";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Ali Demirbaş - Growth Marketer",
  description:
    "Mobil ürünler için veriyle büyüme. Aksigorta'da Mobile App Growth Lead; öncesinde Vodafone, Getir ve Wingie Enuygun Group.",
  alternates: pageAlternates("", "tr"),
};

export default function HomeTr() {
  return <Site lang="tr" />;
}
