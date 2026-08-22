import { journeys } from "@/lib/journeys";

/* The archive's size is a fact about the data, not a fact about the copy.
   It used to be typed into six separate strings across two languages, which
   is six places to forget when a journey is added - and it was already wrong
   once (the strings said 72 after the archive had grown past it). The number
   now lives in exactly one place, the array itself, and the copy carries a
   `{count}` token that gets filled in at render.

   Both callers are server components, so this never reaches the client
   bundle - the count is baked into the static HTML at build time. */

export const JOURNEY_COUNT = journeys.length;

/** Fills `{count}` in a copy string with the real archive size. */
export function withJourneyCount(text: string): string {
  return text.replaceAll("{count}", String(JOURNEY_COUNT));
}
