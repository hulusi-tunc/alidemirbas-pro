import type { Metadata } from "next";
import LabPage from "@/components/LabPage";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Lab - Ali Demirbaş",
  description: "CRM Journey Archive: 70 lifecycle journey teardowns, filterable by sector and channel.",
  alternates: pageAlternates("/lab", "en"),
};

export default function Lab() {
  return <LabPage lang="en" />;
}
