import {
  CATEGORIES,
  GLOBAL_RULES,
  JOURNEYS,
  MERGED_INTO,
  RULES,
  byId,
  resolveJourneyId,
} from "@/canonical";
import type { CanonicalJourney, CanonicalNode, CategoryId } from "@/canonical/types";

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
const BY_SLUG = new Map<string, CanonicalJourney>(JOURNEYS.map((j) => [j.slug, j]));

/** Where a journey's trigger evidence comes from. It is the second facet
    because it is the one property that changes what a journey is allowed to
    conclude, which is more useful to filter on than anything cosmetic would be. */
export type EvidenceSource = "authoritative" | "declared" | "behavioral" | "inferred";

export const EVIDENCE_SOURCES: readonly EvidenceSource[] = [
  "authoritative",
  "declared",
  "behavioral",
  "inferred",
];

export type CategoryFacet = { id: CategoryId; title: string };

export type JourneyRow = {
  id: string;
  slug: string;
  name: string;
  purpose: string;
  category: CategoryId;
  categoryTitle: string;
  evidence: EvidenceSource;
  nodeCount: number;
  /** The exclusion group this journey competes in, where it competes at all. */
  competesIn: string | null;
};

const triggerOf = (j: CanonicalJourney) => j.nodes.find((n) => n.kind === "trigger");

export const JOURNEY_ROWS: readonly JourneyRow[] = JOURNEYS.map((j) => ({
  id: j.id,
  slug: j.slug,
  name: j.name,
  purpose: j.purpose,
  category: j.category,
  categoryTitle: CATEGORY_TITLE.get(j.category) ?? j.category,
  evidence: (triggerOf(j)?.evidence.source ?? "authoritative") as EvidenceSource,
  nodeCount: j.nodes.length,
  competesIn: j.competition?.exclusionGroup ?? null,
}));

export const CATEGORY_FACETS: readonly CategoryFacet[] = CATEGORIES.map((c) => ({
  id: c.id,
  title: c.title,
}));

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
  isEntry: boolean;
  /** Exit nodes only, and only where the state itself forbids re-entry. The
      ordinary case is not flagged: 431 of 436 exits allow re-entry, so a
      badge saying so on all of them is not information. */
  terminal: boolean;
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
      };
    case "action":
      return {
        ...base,
        headline: n.does,
        detail: null,
        meta: (n.writes ?? []).map((w) => `writes ${w.field} (${w.mode})`),
        edges: [edge(n.next)],
      };
    case "condition":
      return {
        ...base,
        headline: n.asks,
        detail: null,
        meta: [],
        edges: n.branches.map((b) => edge(b.to, b.label, b.when)),
      };
    case "wait":
      return {
        ...base,
        headline: `until ${n.until.join(", or ")}`,
        detail: `timeout after ${n.timeout.after}`,
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
      };
  }
};

export type JourneyDetail = {
  id: string;
  slug: string;
  name: string;
  purpose: string;
  categoryTitle: string;
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

function detailOf(j: CanonicalJourney): JourneyDetail {
  const nodes = orderedNodes(j).map((n) => nodeView(n, j.entry));
  // Reading order is settled now, so an edge can finally say whether its
  // target is above it. Done here rather than in nodeView because a node on
  // its own has no idea where it sits.
  const position = new Map(nodes.map((n, i) => [n.id, i]));
  const withDirection = nodes.map((n, i) => ({
    ...n,
    edges: n.edges.map((e) =>
      e.kind === "node" && (position.get(e.to) ?? i) < i ? { ...e, back: true } : e,
    ),
  }));

  return {
    id: j.id,
    slug: j.slug,
    name: j.name,
    purpose: j.purpose,
    categoryTitle: CATEGORY_TITLE.get(j.category) ?? j.category,
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
  };
}

export function journeyDetail(id: string): JourneyDetail | null {
  const j = byId(resolveJourneyId(id));
  return j ? detailOf(j) : null;
}

/** What the detail route resolves a URL segment to. A merged id resolves to
    the journey that absorbed it and says so; anything unknown resolves to
    nothing and the route 404s. */
export type ResolvedDetail = { detail: JourneyDetail; merged: MergedRedirect | null };

export function resolveDetailSlug(slug: string): ResolvedDetail | null {
  const j = BY_SLUG.get(slug);
  if (j) return { detail: detailOf(j), merged: null };

  const merged = MERGED_BY_SLUG.get(slug);
  if (merged) {
    const target = byId(merged.to);
    if (target) return { detail: detailOf(target), merged };
  }
  return null;
}
