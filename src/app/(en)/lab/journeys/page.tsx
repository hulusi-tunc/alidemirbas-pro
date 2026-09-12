import type { Metadata } from "next";
import JourneyLibraryPage from "@/components/JourneyLibraryPage";
import { withLibraryCount } from "@/lib/canonical-view";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Journey Library - Ali Demirbaş",
  /* Computed, not typed: the hub's own copy fills {count}/{categories} from
     the public corpus (canonical-view.ts), and this description must say
     the same number the page does. It used to be a hand-typed "283" and a
     description of a two-way split that no longer exists (the Operations
     surface was archived 2026-09-05 - archive/operational-workflows/). */
  description: withLibraryCount(
    "Domain-neutral journeys across {categories} categories. Each one states what starts it, where it branches, how long it waits, what stops it and where the person goes next. No message copy.",
  ),
  alternates: pageAlternates("/lab/journeys", "en"),
};

export default function LabJourneys() {
  return <JourneyLibraryPage lang="en" />;
}
