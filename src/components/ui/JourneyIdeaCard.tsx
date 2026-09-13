import { Cog, UserRound } from "lucide-react";

import IdeaCard, { type IdeaCardBadge } from "@/components/ui/IdeaCard";
import { CategoryIcon, ChannelIcon } from "@/components/ui/LibraryChrome";
import { CHANNEL_LABEL } from "@/lib/journey-channels";
import type { Lang } from "@/lib/content";
import type { ChannelId } from "@/canonical/types";

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
  lang,
  title,
  category,
  categoryTitle,
  purpose,
  nodeCount,
  nodesLabel,
  channels,
  internalLabel,
  typeLabel,
}: {
  href: string;
  id: string;
  lang: Lang;
  /** The journey's plain-language name (CanonicalJourney.shortName). */
  title: string;
  /** The category id - the card's icon tile comes from it. */
  category: string;
  categoryTitle: string;
  purpose: string;
  nodeCount: number;
  nodesLabel: string;
  /** The journey's real execution channels, in canonical order; each
      becomes an accent badge with the channel's own glyph. Empty on an
      internal journey, which gets `internalLabel` instead - the two must
      not look alike, because one can reach a person and the other cannot. */
  channels: readonly ChannelId[];
  internalLabel: string;
  /** A fact about the entry, not a channel - the muted badge Sales/Task
      cards already earn under Customer Journeys (isHumanRoutingRow). Not a
      channel, so it is prepended rather than mixed into the channels. */
  typeLabel?: string;
}) {
  const badges: IdeaCardBadge[] = [
    ...(typeLabel ? [{ label: typeLabel, tone: "muted" as const, icon: <UserRound aria-hidden /> }] : []),
    ...(channels.length === 0
      ? [{ label: internalLabel, tone: "muted" as const, icon: <Cog aria-hidden /> }]
      : channels.map((c) => ({ label: CHANNEL_LABEL[c][lang], tone: "accent" as const, icon: <ChannelIcon id={c} /> }))),
  ];

  return (
    <IdeaCard
      href={href}
      icon={<CategoryIcon id={category} />}
      title={title}
      badges={badges}
      body={purpose}
      footLeft={categoryTitle}
      footRight={`${id} · ${nodeCount} ${nodesLabel}`}
    />
  );
}
