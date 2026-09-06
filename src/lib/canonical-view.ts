import {
  CATEGORIES,
  GLOBAL_RULES,
  JOURNEYS,
  MERGED_INTO,
  RULES,
  byId,
  resolveJourneyId,
} from "@/canonical";
import { configText } from "@/canonical/config-text";
import { eventText } from "@/canonical/events";
import { practitionerView, type PractitionerView } from "@/lib/practitioner-view";
import { surfaceOf } from "@/canonical/surface";
import type { Preset } from "@/canonical/types";
import type { CanonicalJourney, CanonicalNode, CategoryId, ChannelId, GoalId, SignalSource } from "@/canonical/types";
import { buildJourneyPreview, type JourneyPreview } from "@/lib/journey-preview";

/* The read model the archive renders from.

   The canonical library is written for correctness, not for a list view: a
   journey is a node graph with an entity scope, guardrails and a reusable
   rule, and nothing in it knows what a facet is. This module is the only
   place that turns that into rows and counts, so the shape the UI wants can
   change without anything in src/canonical moving.

   It reads canonical and never writes to it. Where the two disagree about
   what a journey is, canonical is right and this file is the thing that
   adapts.

   This module is imported by server components only. The client components
   take what they need as props and import nothing from here but types, which
   is what keeps 256 journeys and 3197 nodes out of the browser bundle. */

export const CANONICAL_COUNT = JOURNEYS.length;
export const CATEGORY_COUNT = CATEGORIES.length;
export const RULE_COUNT = RULES.length;
export const GLOBAL_RULE_COUNT = GLOBAL_RULES.length;

/** Fills `{count}` in a copy string with the real library size. */
export function withCanonicalCount(text: string): string {
  return text
    .replaceAll("{count}", String(CANONICAL_COUNT))
    .replaceAll("{categories}", String(CATEGORY_COUNT))
    .replaceAll("{rules}", String(RULE_COUNT + GLOBAL_RULE_COUNT));
}

const CATEGORY_TITLE = new Map<CategoryId, string>(CATEGORIES.map((c) => [c.id, c.title]));

/** Category identity for the gallery's section headers - the title and the
    category's OWN `purpose` from src/canonical/index.ts, not a sentence
    written for the UI. Ordered as the canonical library orders them. */
export type CategoryMeta = { id: CategoryId; title: string; purpose: string };
export const CATEGORY_META: readonly CategoryMeta[] = CATEGORIES.map((c) => ({
  id: c.id,
  title: c.title,
  purpose: c.purpose,
}));
const BY_SLUG = new Map<string, CanonicalJourney>(JOURNEYS.map((j) => [j.slug, j]));

/** Where a journey's trigger evidence comes from - the one property that
    changes what a journey is allowed to conclude. Canonical metadata, read
    by the detail view from the trigger node itself; kept here as the shared
    vocabulary for it. Not a library filter and not on JourneyRow - see the
    note there. */
export type EvidenceSource = "authoritative" | "declared" | "behavioral" | "inferred";

export const EVIDENCE_SOURCES: readonly EvidenceSource[] = [
  "authoritative",
  "declared",
  "behavioral",
  "inferred",
];

export type SurfaceName = "customer" | "mechanism" | "operational";

export type JourneyRow = {
  id: string;
  slug: string;
  name: string;
  /** The plain-language label - see CanonicalJourney.shortName. Undefined on
      journeys not named yet; every caller falls back to `name`. */
  shortName?: string;
  purpose: string;
  category: CategoryId;
  categoryTitle: string;
  nodeCount: number;
  /* Trigger evidence and the competition exclusion group are deliberately
     NOT on this row. Both are real canonical metadata and both stay exactly
     where they live - on the journey's own trigger node and `competition`
     field, still read by the detail view - but neither is rendered on a
     library card or searched from one, and every field here is serialized
     255 times into the page. Re-add either the day something on this screen
     actually reads it. */
  /** The single primary discovery filter - explicit canonical metadata, not
      derived here. See src/canonical/types.ts and lib/journey-taxonomy.ts. */
  goal: GoalId;
  /** The execution channels this journey's communication may use. Explicit
      canonical metadata; empty where the journey is entirely internal. */
  channels: readonly ChannelId[];
  /** Product surface, read from the journey by src/canonical/surface.ts -
      the one rule the site and the validator share. `communicating` is
      true only where the journey sends a message on a customer channel. */
  surface: SurfaceName;
  communicating: boolean;
  /** Whether the journey routes work to a person via `sales` or `task`,
      independent of `communicating` - src/canonical/surface.ts's own
      `routesToHuman`. A journey can have this true and `communicating`
      false (ACQ-04, ACT-11, RET-24: they route to a person but send no
      message) and it is still a Customer Journey on the site's listing -
      see `surfaceKeyOf` below. Not a lifecycle state: a silent lifecycle
      state does neither. */
  routesToHuman: boolean;
  /** Practitioner names the journey answers to (discovery.aliases). */
  aliases: readonly string[];
  presetCount: number;
  /** The card's topology thumbnail, laid out here (server, once, at build
      time) rather than in the browser - see lib/journey-preview.ts. */
  preview: JourneyPreview;
};

/* ------------------------------------------------------------ merged ids */

/** A journey id that was merged into another one. It is not a journey, it is
    not counted, and it must never render as if it were still active - but a
    reader who has the old id in a note or a link still deserves to land
    somewhere true. */
export type MergedRedirect = {
  from: string;
  to: string;
  toSlug: string;
  toName: string;
};

const mergedEntry = (from: string): MergedRedirect | null => {
  const to = resolveJourneyId(from);
  const target = byId(to);
  return target ? { from, to: target.id, toSlug: target.slug, toName: target.name } : null;
};

export const MERGED_REDIRECTS: readonly MergedRedirect[] = Object.keys(MERGED_INTO)
  .map(mergedEntry)
  .filter((x): x is MergedRedirect => x !== null);

/** Merged ids get their own addressable slug so an old link resolves rather
    than 404s. `con-37` is the id lowercased; it is not a journey slug. */
const MERGED_BY_SLUG = new Map<string, MergedRedirect>(
  MERGED_REDIRECTS.map((m) => [m.from.toLowerCase(), m]),
);

/** Every slug the detail route builds: 256 journeys plus 4 merged redirects. */
export const ALL_DETAIL_SLUGS: readonly string[] = [
  ...JOURNEYS.map((j) => j.slug),
  ...MERGED_REDIRECTS.map((m) => m.from.toLowerCase()),
  // Presets are real URLs: each opens its parent with the preset applied.
  ...JOURNEYS.flatMap((j) => (j.discovery?.presets ?? []).map((p) => p.id)),
];

/** Resolves a search term to a merged redirect, so typing an old id in the
    list finds the journey that absorbed it. */
export function mergedFor(term: string): MergedRedirect | null {
  return MERGED_BY_SLUG.get(term.trim().toLowerCase()) ?? null;
}

/* ------------------------------------------------------------- detail view */

/** One outgoing edge. `kind` says what the target is, because the three are
    not the same promise: a node in this journey can be jumped to, another
    journey can be opened, and an `external:` name is a destination this
    library does not own. `back` marks an edge whose target is above it on
    screen, which is the one case where following the arrow means scrolling
    the wrong way. */
export type FlowEdge = {
  /** The short label. On a condition this is the branch name, not the test. */
  label: string | null;
  /** The condition text behind the label, kept separate so a branch reads as
      a label with a reason rather than one long inline sentence. */
  detail: string | null;
  to: string;
  href: string | null;
  kind: "node" | "journey" | "external";
  back: boolean;
};

export type FlowNode = {
  id: string;
  kind: CanonicalNode["kind"];
  /** The line that says what this node is, in words. */
  headline: string;
  /** The raw canonical event id, on triggers only. Kept as metadata rather
      than as the headline: it is the engine's name for the event, and the
      engine's name is not the sentence a reader needs first. */
  eventId: string | null;
  /** The supporting detail, where the node carries any. */
  detail: string | null;
  /** Evidence, timeout reason, writes - whatever this node kind adds. */
  meta: readonly string[];
  edges: readonly FlowEdge[];
  /** Action nodes only. What this action's effect is outside the system -
      see ActionNode.execution. Absent means an internal operation, which is
      the ordinary case. */
  execution?: "communication" | "human";
  isEntry: boolean;
  /** Exit nodes only, and only where the state itself forbids re-entry. The
      ordinary case is not flagged: 431 of 436 exits allow re-entry, so a
      badge saying so on all of them is not information. */
  terminal: boolean;
  /** Trigger nodes only - how this trigger's evidence was established
      (TriggerNode.evidence.source). Real schema field, surfaced on the card
      itself rather than left inside `meta`'s free-text detail list, per the
      Journey Node System design exploration's "secondary states are badges,
      not new shapes" mechanism. */
  evidenceSource?: SignalSource;
  /** Condition nodes only - branch count (n.branches.length). A condition's
      branch count is real layout-relevant information (79% of the library's
      conditions are binary, 21% fan wider) - not invented for display. */
  branchCount?: number;
  /** Handoff nodes only - whether the destination lies outside the canonical
      library (`to` starts with `external:`) rather than resolving to a real
      journey. Already computed once for the headline text below; exposed
      here too so the card can badge it without re-deriving it. */
  external?: boolean;
};

const humanEvent = (event: string): string => {
  const words = event.replace(/[_.]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const edge = (
  to: string,
  label: string | null = null,
  detail: string | null = null,
): FlowEdge => {
  if (to.startsWith("external:")) {
    return { label, detail, to, href: null, kind: "external", back: false };
  }
  const target = byId(to);
  if (target && target.id === to) {
    return { label, detail, to, href: target.slug, kind: "journey", back: false };
  }
  return { label, detail, to, href: null, kind: "node", back: false };
};

const nodeView = (n: CanonicalNode, entry: string): FlowNode => {
  const base = { id: n.id, kind: n.kind, isEntry: n.id === entry, eventId: null, terminal: false } as const;

  switch (n.kind) {
    case "trigger":
      return {
        ...base,
        headline: humanEvent(n.event),
        eventId: n.event,
        detail: null,
        meta: [
          `evidence: ${n.evidence.source}`,
          ...n.evidence.requires.map((r) => `requires: ${r}`),
          ...(n.evidence.insufficientAlone ?? []).map((r) => `not enough on its own: ${r}`),
        ],
        edges: [edge(n.next)],
        evidenceSource: n.evidence.source,
      };
    case "action":
      return {
        ...base,
        headline: n.does,
        detail: null,
        meta: (n.writes ?? []).map((w) => `writes ${w.field} (${w.mode})`),
        edges: [edge(n.next)],
        ...(n.execution ? { execution: n.execution } : {}),
      };
    case "condition":
      return {
        ...base,
        headline: n.asks,
        detail: null,
        meta: [],
        edges: n.branches.map((b) => edge(b.to, b.label, b.when)),
        branchCount: n.branches.length,
      };
    case "wait":
      return {
        ...base,
        headline: `until ${n.until.map(eventText).join(", or ")}`,
        detail: `timeout after ${configText(n.timeout.after)}`,
        meta: [
          n.timeout.reason,
          n.windowExtendsOnEngagement
            ? "the window extends on engagement"
            : "engagement does not extend the window",
        ],
        edges: [edge(n.onEvent, "on event"), edge(n.onTimeout, "on timeout")],
      };
    case "outcome":
      return {
        ...base,
        headline: n.state,
        detail: n.means,
        meta: [],
        edges: [edge(n.next)],
      };
    case "exit":
      return {
        ...base,
        headline: n.state,
        detail: n.reEntry,
        meta: [],
        edges: [],
        terminal: n.terminal,
      };
    case "handoff":
      return {
        ...base,
        headline: n.to.startsWith("external:") ? n.to : (byId(n.to)?.name ?? n.to),
        detail: n.on,
        meta: [
          ...n.carries.map((c) => `carries: ${c}`),
          ...(n.suppresses ?? []).map((s) => `suppresses: ${s}`),
        ],
        edges: [edge(n.to)],
        external: n.to.startsWith("external:"),
      };
  }
};

export type JourneyDetail = {
  id: string;
  slug: string;
  name: string;
  /** See CanonicalJourney.shortName. The detail page leads with this and
      keeps `name` beneath it, so the state-machine form is still stated. */
  shortName?: string;
  purpose: string;
  categoryTitle: string;
  /** The audited discovery goal. The detail page states it under the purpose
      as the journey's own one-line answer to "what is this for"; the library
      list filters on the same field. */
  goal: GoalId;
  /** The journey's declared execution channels, so the canvas can name what
      a communication action may actually run on. */
  channels: readonly ChannelId[];
  entityScope: string;
  entityNote: string;
  reusableRule: string;
  guardrails: readonly string[];
  distinctFrom: readonly { journey: string; slug: string | null; name: string | null; because: string }[];
  competition: CanonicalJourney["competition"] | null;
  /** Only ever set on the two journeys that carry it. A journey with no
      pre-emption ships no empty array to the browser. */
  preemptedBy: readonly { event: string; then: string }[];
  nodes: readonly FlowNode[];
  /** vNext: the practitioner's view, projected from the journey's own
      orchestration/timing/contact/measurement fields. Null until a journey
      is migrated - no view is better than a half view. */
  practitioner: PractitionerView | null;
  surface: SurfaceName;
  communicating: boolean;
  /** Set when the URL was a preset's: the parent's detail with the preset
      applied to its practitioner view. */
  preset: PresetRow | null;
  presets: readonly { id: string; name: string }[];
};

/** Breadth-first from the entry, so the order on screen follows the order the
    journey actually runs in rather than the order the file happens to list. */
function orderedNodes(j: CanonicalJourney): CanonicalNode[] {
  const byNodeId = new Map(j.nodes.map((n) => [n.id, n]));
  const seen = new Set<string>();
  const out: CanonicalNode[] = [];
  const queue = [j.entry];
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const n = byNodeId.get(id);
    if (!n) continue;
    out.push(n);
    for (const e of nodeView(n, j.entry).edges) if (e.kind === "node") queue.push(e.to);
  }
  // Anything the walk did not reach still renders - the validator forbids it,
  // and a silent omission here would hide the thing it forbids.
  for (const n of j.nodes) if (!seen.has(n.id)) out.push(n);
  return out;
}

/** The FlowNode projection of one journey - the exact input both the detail
    page's Canvas and the library card's topology thumbnail lay out, so the
    two can never drift into being different graphs. */
function flowNodesOf(j: CanonicalJourney): FlowNode[] {
  const nodes = orderedNodes(j).map((n) => nodeView(n, j.entry));
  // Reading order is settled now, so an edge can finally say whether its
  // target is above it. Done here rather than in nodeView because a node on
  // its own has no idea where it sits.
  const position = new Map(nodes.map((n, i) => [n.id, i]));
  return nodes.map((n, i) => ({
    ...n,
    edges: n.edges.map((e) =>
      e.kind === "node" && (position.get(e.to) ?? i) < i ? { ...e, back: true } : e,
    ),
  }));
}

/* Declared here rather than beside the JourneyRow type because building each
   row's topology thumbnail needs `flowNodesOf` above - and `nodeView`, which
   it calls, is a const rather than a hoisted declaration, so evaluating this
   any earlier in the module would hit its temporal dead zone. */
export const JOURNEY_ROWS: readonly JourneyRow[] = JOURNEYS.map((j) => ({
  id: j.id,
  ...(() => { const sf = surfaceOf(j); return { surface: sf.surface as SurfaceName, communicating: sf.sends, routesToHuman: sf.routesToHuman }; })(),
  aliases: j.discovery?.aliases ?? [],
  presetCount: j.discovery?.presets?.length ?? 0,
  slug: j.slug,
  name: j.name,
  ...(j.shortName ? { shortName: j.shortName } : {}),
  purpose: j.purpose,
  category: j.category,
  categoryTitle: CATEGORY_TITLE.get(j.category) ?? j.category,
  nodeCount: j.nodes.length,
  goal: j.goal,
  channels: j.channels,
  preview: buildJourneyPreview(flowNodesOf(j)),
}));

/* The four product surfaces. The rule is src/canonical/surface.ts's, read
   per journey - the site never keeps its own notion of what is a customer
   journey, and the old "has channels / has none" split is gone: a silent
   customer lifecycle state and an internal operational workflow both have
   no channels and are different products.

   Within the canonical "customer" surface, the site's own Customer
   Journeys / Lifecycle States split is `communicating OR routesToHuman`:
   a journey the customer's own request actually moves - by message, or by
   putting a person on it - is a journey a practitioner looks for by name,
   even where it never sends anything itself (ACQ-04, ACT-11, RET-24:
   `routesToHuman: true`, `communicating: false`). Only a journey that does
   neither is a silent lifecycle state - state a communicating journey
   reads and writes, not a thing anyone opens looking for it. This is a
   listing-classification choice read from src/canonical/surface.ts's own
   `sends`/`routesToHuman` fields, not a new canonical rule - see
   research/journey-library-user-taxonomy-audit.md §12. */
export type SurfaceKey = "customer-journeys" | "lifecycle-states" | "runtime-mechanisms" | "operational-workflows";

export const SURFACE_KEYS: readonly SurfaceKey[] = ["customer-journeys", "lifecycle-states", "runtime-mechanisms", "operational-workflows"];

export const SURFACE_PATH: Readonly<Record<SurfaceKey, string>> = {
  "customer-journeys": "/lab/customer-journeys",
  "lifecycle-states": "/lab/lifecycle-states",
  "runtime-mechanisms": "/lab/runtime-mechanisms",
  "operational-workflows": "/lab/operational-workflows",
};

export const surfaceKeyOf = (row: Pick<JourneyRow, "surface" | "communicating" | "routesToHuman">): SurfaceKey =>
  row.surface === "customer"
    ? (row.communicating || row.routesToHuman) ? "customer-journeys" : "lifecycle-states"
    : row.surface === "mechanism" ? "runtime-mechanisms" : "operational-workflows";

/** Within Customer Journeys only: the practitioner-facing distinction
    between a journey that reaches a customer by message and the 3 that
    reach one only by putting a person on it (see surfaceKeyOf above).
    Not a canonical concept and not a new filter - it is what the card's
    own channel badges (Sales/Task vs Email/SMS/...) already say, named for
    when a caller needs the boolean rather than the channel list. */
export const isHumanRoutingRow = (row: Pick<JourneyRow, "communicating" | "routesToHuman">): boolean =>
  !row.communicating && row.routesToHuman;

export const SURFACE_ROWS: Readonly<Record<SurfaceKey, readonly JourneyRow[]>> = {
  "customer-journeys": JOURNEY_ROWS.filter((j) => surfaceKeyOf(j) === "customer-journeys"),
  "lifecycle-states": JOURNEY_ROWS.filter((j) => surfaceKeyOf(j) === "lifecycle-states"),
  "runtime-mechanisms": JOURNEY_ROWS.filter((j) => surfaceKeyOf(j) === "runtime-mechanisms"),
  "operational-workflows": JOURNEY_ROWS.filter((j) => surfaceKeyOf(j) === "operational-workflows"),
};

/** A preset is a named specialisation of a communicating customer journey
    whose only differences are config values, a destination and vocabulary.
    It renders as its own card and its own URL and opens the parent's
    practitioner view with the preset applied - it is never a journey. */
export type PresetRow = {
  id: string;
  slug: string;
  name: string;
  parentId: string;
  parentSlug: string;
  parentName: string;
  categoryTitle: string;
  applicableWhen: string;
  aliases: readonly string[];
  overrideKeys: readonly string[];
  destination: string | null;
  preset: Preset;
};

export const PRESET_ROWS: readonly PresetRow[] = JOURNEYS.flatMap((j) =>
  (j.discovery?.presets ?? []).map((p) => ({
    id: p.id,
    slug: p.id,
    name: p.name,
    parentId: j.id,
    parentSlug: j.slug,
    parentName: j.shortName ?? j.name,
    categoryTitle: CATEGORY_TITLE.get(j.category) ?? j.category,
    applicableWhen: p.applicableWhen.text,
    aliases: p.aliases ?? [],
    overrideKeys: Object.keys(p.overrides ?? {}),
    destination: p.destination ?? null,
    preset: p,
  })),
);
const PRESET_BY_SLUG = new Map(PRESET_ROWS.map((p) => [p.slug, p]));
for (const p of PRESET_ROWS) if (BY_SLUG.has(p.slug) || MERGED_BY_SLUG.has(p.slug)) throw new Error(`preset slug collides with a journey slug: ${p.slug}`);

function detailOf(j: CanonicalJourney, preset: PresetRow | null = null): JourneyDetail {
  const withDirection = flowNodesOf(j);
  const sf = surfaceOf(j);

  return {
    id: j.id,
    slug: j.slug,
    name: j.name,
    ...(j.shortName ? { shortName: j.shortName } : {}),
    purpose: j.purpose,
    categoryTitle: CATEGORY_TITLE.get(j.category) ?? j.category,
    goal: j.goal,
    channels: j.channels,
    entityScope: j.entity.scope,
    entityNote: j.entity.note,
    reusableRule: j.reusableRule,
    guardrails: j.guardrails,
    distinctFrom: (j.distinctFrom ?? []).map((d) => {
      const target = byId(d.journey);
      return {
        journey: d.journey,
        slug: target?.slug ?? null,
        name: target?.name ?? null,
        because: d.because,
      };
    }),
    competition: j.competition ?? null,
    preemptedBy: j.preemptedBy ?? [],
    nodes: withDirection,
    surface: sf.surface as SurfaceName,
    communicating: sf.sends,
    preset,
    presets: (j.discovery?.presets ?? []).map((p) => ({ id: p.id, name: p.name })),
    practitioner: practitionerView(j, preset?.preset ?? null),
  };
}

export function journeyDetail(id: string): JourneyDetail | null {
  const j = byId(resolveJourneyId(id));
  return j ? detailOf(j) : null;
}

/** What the detail route resolves a URL segment to. A merged id resolves to
    the journey that absorbed it and says so; anything unknown resolves to
    nothing and the route 404s. */
export type ResolvedDetail = { detail: JourneyDetail; merged: MergedRedirect | null; preset: PresetRow | null };

export function resolveDetailSlug(slug: string): ResolvedDetail | null {
  const j = BY_SLUG.get(slug);
  if (j) return { detail: detailOf(j), merged: null, preset: null };

  const preset = PRESET_BY_SLUG.get(slug);
  if (preset) {
    const parent = byId(preset.parentId);
    if (parent) return { detail: detailOf(parent, preset), merged: null, preset };
  }

  const merged = MERGED_BY_SLUG.get(slug);
  if (merged) {
    const target = byId(merged.to);
    if (target) return { detail: detailOf(target), merged, preset: null };
  }
  return null;
}
