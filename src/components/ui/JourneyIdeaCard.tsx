import IdeaCard from "@/components/ui/IdeaCard";

/* One journey in the gallery grid, as opposed to JourneyRowCard's full-width
   row (still the shape the A/B library settled for scan-everything archives).

   MECHANISM SOURCE: Klaviyo's "Flows / Browse Ideas" screen (reviewed
   2026-09) - grouped sections of small template cards, each one title +
   secondary metadata + a clamped description + a footer badge, whole card
   clickable. What was deliberately NOT taken: its platform badges (Shopify
   and friends - this library integrates with nothing and a badge would be
   fabricated), its personalized "Recommended for you" carousel (no account
   to personalize for), its template variants ("Standard", "A/B Test",
   "Localized" - the canonical library counts those as one journey by rule),
   and any performance or conversion figure.

   THE CANONICAL NAME IS NOT ON THE CARD. It was, briefly: the card led with
   `shortName` and put `name` underneath in grey. The brief this round asks
   for the opposite and it is right - "Cancellation intent -> understand
   state -> save or proceed" under "Cancellation Save" is a second title
   competing with the first, in a grid where the eye is scanning titles. The
   canonical name still leads the DETAIL page, where there is room for it and
   a graph for it to describe.

   Rendering moved into ui/IdeaCard (2026-09) when the A/B test library
   adopted the same gallery; this file keeps the journey-specific mapping -
   channels are the accent badges, an internal journey gets the muted pill
   instead, and the footer's right side is the node count. */

export default function JourneyIdeaCard({
  href,
  id,
  title,
  categoryTitle,
  purpose,
  nodeCount,
  nodesLabel,
  channelLabels,
  internalLabel,
  typeLabel,
}: {
  href: string;
  id: string;
  /** The journey's plain-language name (CanonicalJourney.shortName). */
  title: string;
  categoryTitle: string;
  purpose: string;
  nodeCount: number;
  nodesLabel: string;
  /** The journey's real execution channels, localised and ordered. Empty on
      an internal journey, which gets `internalLabel` instead - the two must
      not look alike, because one can reach a person and the other cannot. */
  channelLabels: readonly string[];
  internalLabel: string;
  /** A fact about the entry, not a channel - the muted badge Sales/Task
      cards already earn under Customer Journeys (isHumanRoutingRow). Not a
      channel, so it is prepended rather than mixed into `channelLabels`. */
  typeLabel?: string;
}) {
  const badges = [
    ...(typeLabel ? [{ label: typeLabel, tone: "muted" as const }] : []),
    ...(channelLabels.length === 0
      ? [{ label: internalLabel, tone: "muted" as const }]
      : channelLabels.map((label) => ({ label, tone: "accent" as const }))),
  ];

  return (
    <IdeaCard
      href={href}
      title={title}
      badges={badges}
      body={purpose}
      footLeft={categoryTitle}
      footRight={`${id} · ${nodeCount} ${nodesLabel}`}
    />
  );
}
