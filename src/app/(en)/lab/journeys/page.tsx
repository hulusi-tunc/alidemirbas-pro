import type { Metadata } from "next";
import LabPage from "@/components/LabPage";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Canonical Journey Library - Ali Demirbaş",
  description:
    "256 domain-neutral lifecycle state machines across 26 categories, filterable by category and by what the trigger is allowed to conclude.",
  alternates: pageAlternates("/lab/journeys", "en"),
};

export default function LabJourneys() {
  return <LabPage lang="en" />;
}
