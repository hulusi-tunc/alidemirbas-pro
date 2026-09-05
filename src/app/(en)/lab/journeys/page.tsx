import type { Metadata } from "next";
import JourneyLibraryPage from "@/components/JourneyLibraryPage";
import { withLibraryCount } from "@/lib/canonical-view";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Canonical Journey Library - Ali Demirbaş",
  /* Computed, not typed: the hub's own copy fills {count}/{categories} from
     the public corpus (canonical-view.ts), and this description must say
     the same number the page does. It used to be a hand-typed "283" and a
     description of a two-way split that no longer exists (the Operations
     surface was archived 2026-09-05 - archive/operational-workflows/). */
  description: withLibraryCount(
    "{count} domain-neutral customer journeys across {categories} categories - each a graph that makes explicit what starts it, where it branches, how long it waits, what stops it, and which lifecycle owns the person next.",
  ),
  alternates: pageAlternates("/lab/journeys", "en"),
};

export default function LabJourneys() {
  return <JourneyLibraryPage lang="en" />;
}
