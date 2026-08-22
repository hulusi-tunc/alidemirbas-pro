import { CANONICAL_COUNT, withCanonicalCount } from "@/lib/canonical-view";

/* The library's size is a fact about the data, not a fact about the copy.
   It used to be typed into six separate strings across two languages, which
   is six places to forget when a journey is added - and it was already wrong
   once (the strings said 72 after the archive had grown past it). The number
   now comes from the canonical registry itself, and the copy carries
   `{count}`, `{categories}` and `{rules}` tokens filled in at render.

   Both callers are server components, so this never reaches the client
   bundle - the counts are baked into the static HTML at build time. */

export const JOURNEY_COUNT = CANONICAL_COUNT;

/** Fills the count tokens in a copy string with the real library size. */
export const withJourneyCount = withCanonicalCount;
