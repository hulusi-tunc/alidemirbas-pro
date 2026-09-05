import type { Metadata } from "next";
import JourneyLibraryPage from "@/components/JourneyLibraryPage";
import { withCanonicalCount } from "@/lib/canonical-view";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Canonical Journey Library - Ali Demirbaş",
  /* Computed, not typed: the hub's own copy fills {count}/{categories} from
     the public corpus (canonical-view.ts), and this description must say
     the same number the page does. It used to be a hand-typed "283" and a
     description of a two-way split that no longer exists (the Operations
     surface was archived 2026-09-05 - archive/operational-workflows/). */
  description: withCanonicalCount(
    "{count} domain-neutral lifecycle state machines across {categories} categories - the journeys that reach a person, and the silent states and runtime mechanisms they depend on.",
  ),
  alternates: pageAlternates("/lab/journeys", "en"),
};

export default function LabJourneys() {
  return <JourneyLibraryPage lang="en" />;
}
