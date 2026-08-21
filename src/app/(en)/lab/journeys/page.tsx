import type { Metadata } from "next";
import LabPage from "@/components/LabPage";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "CRM Journey Archive - Ali Demirbaş",
  description: "70 lifecycle journey teardowns, filterable by sector and channel.",
  alternates: pageAlternates("/lab/journeys", "en"),
};

export default function LabJourneys() {
  return <LabPage lang="en" />;
}
