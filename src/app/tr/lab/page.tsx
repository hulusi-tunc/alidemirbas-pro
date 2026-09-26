import type { Metadata } from "next";
import LabIndexPage from "@/components/LabIndexPage";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Lab - Ali Demirbaş",
  description:
    "Büyüme, CRM ve analitik tarafında karşılaştığım problemler için geliştirdiğim açık kaynak projeler: Journey Oluşturucu, Journey Kütüphanesi, A/B Test Playbook, Dashboard Oluşturucu, Google Ads Değişiklik Geçmişi ve Numerspace.",
  alternates: pageAlternates("/lab", "tr"),
};

export default function LabTr() {
  return <LabIndexPage lang="tr" />;
}
