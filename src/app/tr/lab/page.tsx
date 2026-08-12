import type { Metadata } from "next";
import LabPage from "@/components/LabPage";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Lab - Ali Demirbaş",
  description: "CRM Journey Arşivi: sektöre ve kanala göre filtrelenebilir 70 lifecycle journey incelemesi.",
  alternates: pageAlternates("/lab", "tr"),
};

export default function LabTr() {
  return <LabPage lang="tr" />;
}
