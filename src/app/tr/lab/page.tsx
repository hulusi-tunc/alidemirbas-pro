import type { Metadata } from "next";
import LabIndexPage from "@/components/LabIndexPage";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Lab - Ali Demirbaş",
  description:
    "Gerçek pazarlama, growth ve lifecycle işinden çıkan açık kaynak projeler: bir lifecycle journey üretici, bir CRM journey arşivi, bir A/B test playbook'u ve pazarlama dashboard araçları.",
  alternates: pageAlternates("/lab", "tr"),
};

export default function LabTr() {
  return <LabIndexPage lang="tr" />;
}
