import type { Metadata } from "next";
import Site from "@/components/Site";
import { pageAlternates } from "@/lib/seo";

// Same values as (en)/layout.tsx's defaults - declared here too so this shell
// mirrors tr/page.tsx and the two home routes stay in lockstep.
export const metadata: Metadata = {
  title: "Ali Demirbaş - Growth Marketer",
  description:
    "Data-driven growth for mobile products. Mobile App Growth Lead at Aksigorta; previously Vodafone, Getir and Wingie Enuygun Group.",
  alternates: pageAlternates("", "en"),
};

export default function Home() {
  return <Site lang="en" />;
}
