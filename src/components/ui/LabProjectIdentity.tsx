import {
  Calculator,
  FileClock,
  LayoutDashboard,
  LibraryBig,
  SquareSplitHorizontal,
  Workflow,
} from "lucide-react";

/* ONE IDENTITY PER LAB PROJECT: a glyph and a hue, keyed by slug.

   Why this exists (2026-09-05). Hulusi's review of the Lab surfaces: the
   header dropdown "looks so messy, no message delivery", and on /lab
   "each section represents one lab project but we do not feel like that".
   Both are the same missing thing - nothing on any surface said WHICH
   project you were looking at except its five-word name. The six projects
   are the site's real taxonomy, so each gets a mark that travels with it:
   the same glyph and tint in the header dropdown, the phone menu, the
   hero's tab rail and the section it opens into. A reader who learns the
   mark once can find the project on every surface. That is the job a hue
   is allowed to have on this site (navigation significance, identity -
   site-constitution "accent allocation"), not decoration.

   THE HUES ARE TINTS, NOT ATMOSPHERE. A -50 ground, -700 ink, one -500
   dot; never a filled plate. As a whole card's ground only once, where the
   Lab deck closes (LabIndexPage.tsx: Numerspace's teal-50 card after four
   neutral cards and the dark one) - a single tinted close, not a paint
   chart. Blue stays the
   functional brand colour and is spent on exactly one project - the
   site's own Journey Library, which already renders in primary tints on
   every page it appears on. The builder takes violet, the hue the flow
   vocabulary (PatternFlow.tsx) gives to email - deliberate, since sending
   is what the builder does. The glyphs are literal: a workflow, a
   library, a split, a dashboard, a file with a clock, a calculator.

   Every class string is written out in full. Tailwind's scanner cannot
   see a tint composed at runtime, so `bg-${hue}-50` would silently ship
   nothing (the same trap the calculator groups fell into once). */

export type LabAccent = {
  /** The icon tile: tinted ground plus coloured glyph. */
  tile: string;
  /** Label ink - the eyebrow over a section title, the caption in a rail. */
  ink: string;
  /** The stage a project's visual sits on: its tint fading to paper. */
  stage: string;
  /** The hairline around that stage, one step deeper than its ground. */
  ring: string;
  /** The same mark on the Lab deck's dark card (LabIndexPage.tsx): the
      hue lifted to -300 on a translucent tile, because a -50 tint
      disappears on ink-950. */
  darkTile: string;
  darkInk: string;
  /** The frame plate's tone on /lab (`.lab-frame[data-hue]`, globals.css):
      the same hue two steps deeper than the tile. */
  hue: string;
};

type Glyph = typeof Workflow;

const IDENTITY: Record<string, { icon: Glyph; accent: LabAccent }> = {
  "claude-lifecycle": {
    icon: Workflow,
    accent: {
      tile: "bg-violet-50 text-violet-700",
      ink: "text-violet-700",
      stage: "from-violet-50 to-paper",
      ring: "ring-violet-100",
      darkTile: "bg-violet-400/15 text-violet-300",
      darkInk: "text-violet-300",
      hue: "violet",
    },
  },
  "lifecycle-card-archive": {
    icon: LibraryBig,
    accent: {
      tile: "bg-primary-50 text-primary-700",
      ink: "text-primary-700",
      stage: "from-primary-50 to-paper",
      ring: "ring-primary-100",
      darkTile: "bg-primary-400/15 text-primary-300",
      darkInk: "text-primary-300",
      hue: "primary",
    },
  },
  "ab-test-playbook": {
    icon: SquareSplitHorizontal,
    accent: {
      tile: "bg-rose-50 text-rose-700",
      ink: "text-rose-700",
      stage: "from-rose-50 to-paper",
      ring: "ring-rose-100",
      darkTile: "bg-rose-400/15 text-rose-300",
      darkInk: "text-rose-300",
      hue: "rose",
    },
  },
  "dashboard-builder": {
    icon: LayoutDashboard,
    accent: {
      tile: "bg-emerald-50 text-emerald-700",
      ink: "text-emerald-700",
      stage: "from-emerald-50 to-paper",
      ring: "ring-emerald-100",
      darkTile: "bg-emerald-400/15 text-emerald-300",
      darkInk: "text-emerald-300",
      hue: "emerald",
    },
  },
  "google-ads-change-history-dashboard": {
    icon: FileClock,
    accent: {
      tile: "bg-amber-50 text-amber-700",
      ink: "text-amber-700",
      stage: "from-amber-50 to-paper",
      ring: "ring-amber-100",
      darkTile: "bg-amber-400/15 text-amber-300",
      darkInk: "text-amber-300",
      hue: "amber",
    },
  },
  numerspace: {
    icon: Calculator,
    accent: {
      tile: "bg-teal-50 text-teal-700",
      ink: "text-teal-700",
      stage: "from-teal-50 to-paper",
      ring: "ring-teal-100",
      darkTile: "bg-teal-400/15 text-teal-300",
      darkInk: "text-teal-300",
      hue: "teal",
    },
  },
};

/** A project added to content.ts before it is added here still renders -
    in the neutral tint, with the builder's glyph - rather than crashing
    the header. Add its entry above; do not let the fallback ship. */
const FALLBACK = {
  icon: Workflow,
  accent: {
    tile: "bg-paper-soft text-ink-700",
    ink: "text-ink-500",
    stage: "from-paper-soft to-paper",
    ring: "ring-line",
    darkTile: "bg-white/10 text-white",
    darkInk: "text-white/70",
    hue: "neutral",
  },
} satisfies { icon: Glyph; accent: LabAccent };

export function labAccent(slug: string): LabAccent {
  return (IDENTITY[slug] ?? FALLBACK).accent;
}

export function LabProjectIcon({ slug, className = "size-4" }: { slug: string; className?: string }) {
  const Icon = (IDENTITY[slug] ?? FALLBACK).icon;
  return <Icon aria-hidden className={className} />;
}
