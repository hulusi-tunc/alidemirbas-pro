import type { Metadata } from "next";
import JourneyLibraryPage from "@/components/JourneyLibraryPage";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Canonical Journey Library - Ali Demirbaş",
  description:
    "281 domain-neutral lifecycle state machines across 26 categories, split into the journeys that reach a person and the ones that resolve inside the system.",
  alternates: pageAlternates("/lab/journeys", "en"),
};

export default function LabJourneys() {
  return <JourneyLibraryPage lang="en" />;
}
