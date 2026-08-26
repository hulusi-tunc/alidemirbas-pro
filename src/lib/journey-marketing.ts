import { CATEGORIES, JOURNEYS, byId } from "@/canonical";
import type { CanonicalJourney, CanonicalNode } from "@/canonical/types";

/* Read model for the Journey Builder PRODUCT PAGE (/lab/claude-lifecycle).

   Separate from canonical-view.ts, which serves the LIBRARY (rows, facets,
   detail pages). This one serves the marketing page's visuals: corpus-wide
   counts, node-kind counts, a small curated card set, and one journey's
   graph projected into something a diagram can lay out.

   Same discipline as canonical-view.ts: SERVER-ONLY. The client never
   imports this. Everything is resolved here and passed down as small,
   already-shaped props, which is what keeps 255 journeys and 3,186 nodes
   out of the browser bundle. The library showcase deliberately projects
   SIX journeys, not 255 - the marketing page has no reason to ship the
   whole graph to draw a preview.

   NOTHING IS INVENTED. Every count is computed from the canonical library
   at module load; every label is a real field. */

export type Lang = "en" | "tr";

export type NodeKind = CanonicalNode["kind"];

/* ---- Corpus-wide scale, all derived ---------------------------------- */

const ALL_NODES = JOURNEYS.flatMap((j) => j.nodes);

const kindCounts = (() => {
  const m = new Map<NodeKind, number>();
  for (const n of ALL_NODES) m.set(n.kind, (m.get(n.kind) ?? 0) + 1);
  return m;
})();

export const JOURNEY_SCALE = {
  /** 255 */
  journeys: JOURNEYS.length,
  /** 26 */
  categories: CATEGORIES.length,
  /** 3,186 */
  nodes: ALL_NODES.length,
  /** 7 - trigger, action, condition, wait, outcome, exit, handoff */
  nodeKinds: kindCounts.size,
  /** 702 - every one carries at least two named branches, by schema */
  conditions: kindCounts.get("condition") ?? 0,
  /** 164 - every one carries a timeout and both arms, by schema */
  waits: kindCounts.get("wait") ?? 0,
  /** 500 - ownership moving to another lifecycle */
  handoffs: kindCounts.get("handoff") ?? 0,
} as const;

export type KindCount = { kind: NodeKind; count: number };

/** Node kinds, heaviest first. `outcome` is genuinely in the schema and
    genuinely rare (1 of 3,186) - it is reported at its real weight rather
    than promoted to look like a peer of the other six. */
export const NODE_KIND_COUNTS: readonly KindCount[] = [...kindCounts.entries()]
  .map(([kind, count]) => ({ kind, count }))
  .sort((a, b) => b.count - a.count);

/* ---- Category breadth ------------------------------------------------ */

export type CategoryCount = { id: string; title: string; count: number };

export const JOURNEY_CATEGORY_COUNTS: readonly CategoryCount[] = (() => {
  const m = new Map<string, number>();
  for (const j of JOURNEYS) m.set(j.category, (m.get(j.category) ?? 0) + 1);
  return CATEGORIES.map((c) => ({ id: c.id, title: c.title, count: m.get(c.id) ?? 0 }))
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
})();

/* ---- The featured journey -------------------------------------------
   ACQ-01. Chosen because it is the one journey that exercises six of the
   seven node kinds in eight nodes: a behavioural trigger, a two-armed
   condition, a wait with both arms named, an append-mode action, a second
   condition, a handoff to another canonical journey, and two non-terminal
   exits. That makes it legible as a diagram AND complete as a teaching
   example, which no larger journey manages. */

const FEATURED_ID = "ACQ-01";

function requireJourney(id: string): CanonicalJourney {
  const j = byId(id);
  if (!j) throw new Error(`journey-marketing: ${id} is no longer in the canonical library`);
  return j;
}

/** A node flattened into exactly what a diagram needs: one headline, an
    optional detail, and its outgoing edges with their real branch labels.
    The canonical record is never mutated - this is a projection over it. */
export type FlowNode = {
  id: string;
  kind: NodeKind;
  /** The node's own primary text, straight from its kind-specific field. */
  label: string;
  /** Secondary line, where the schema has one worth drawing. */
  detail?: string;
  /** Outgoing edges. `label` is the condition's own branch label, the
      wait's arm, or undefined for a plain `next`. */
  edges: { to: string; label?: string }[];
};

function projectNode(n: CanonicalNode): FlowNode {
  switch (n.kind) {
    case "trigger":
      return { id: n.id, kind: n.kind, label: n.event, detail: n.evidence.source, edges: [{ to: n.next }] };
    case "action":
      return { id: n.id, kind: n.kind, label: n.does, edges: [{ to: n.next }] };
    case "condition":
      return {
        id: n.id, kind: n.kind, label: n.asks,
        edges: n.branches.map((b) => ({ to: b.to, label: b.label })),
      };
    case "wait":
      return {
        id: n.id, kind: n.kind, label: n.until.join(", "), detail: n.timeout.after,
        edges: [{ to: n.onEvent, label: "on event" }, { to: n.onTimeout, label: "on timeout" }],
      };
    case "outcome":
      return { id: n.id, kind: n.kind, label: n.state, detail: n.means, edges: [{ to: n.next }] };
    case "exit":
      return { id: n.id, kind: n.kind, label: n.state, detail: n.terminal ? "terminal" : undefined, edges: [] };
    case "handoff":
      return { id: n.id, kind: n.kind, label: n.to, detail: n.on, edges: [] };
  }
}

export type FeaturedJourney = {
  id: string;
  slug: string;
  name: string;
  purpose: string;
  category: string;
  categoryTitle: string;
  nodeCount: number;
  href: (lang: Lang) => string;
  nodes: FlowNode[];
  /** The raw pieces the story/anatomy sections quote directly. */
  trigger: {
    event: string;
    source: string;
    requires: readonly string[];
    insufficientAlone: readonly string[];
  };
  /** The first condition, with its real branch labels and conditions. */
  branch: { asks: string; branches: readonly { label: string; when: string }[] };
  /** The wait, with both arms and the real timeout reason. */
  wait: {
    until: readonly string[];
    timeoutAfter: string;
    timeoutReason: string;
    extendsOnEngagement: boolean;
  } | null;
  /** The handoff, with its real destination and payload. */
  handoff: { to: string; toName: string | null; on: string; carries: readonly string[] } | null;
};

export const FEATURED_JOURNEY: FeaturedJourney = (() => {
  const j = requireJourney(FEATURED_ID);
  const cat = CATEGORIES.find((c) => c.id === j.category);
  const trigger = j.nodes.find((n) => n.kind === "trigger");
  if (!trigger || trigger.kind !== "trigger") throw new Error("journey-marketing: featured journey has no trigger");
  const condition = j.nodes.find((n) => n.kind === "condition");
  if (!condition || condition.kind !== "condition") throw new Error("journey-marketing: featured journey has no condition");
  const wait = j.nodes.find((n) => n.kind === "wait");
  const handoff = j.nodes.find((n) => n.kind === "handoff");
  const handoffTarget = handoff?.kind === "handoff" ? byId(handoff.to) : null;

  return {
    id: j.id,
    slug: j.slug,
    name: j.name,
    purpose: j.purpose,
    category: j.category,
    categoryTitle: cat?.title ?? j.category,
    nodeCount: j.nodes.length,
    href: (lang: Lang) => (lang === "en" ? `/lab/journeys/${j.slug}` : `/tr/lab/journeys/${j.slug}`),
    nodes: j.nodes.map(projectNode),
    trigger: {
      event: trigger.event,
      source: trigger.evidence.source,
      requires: trigger.evidence.requires,
      insufficientAlone: trigger.evidence.insufficientAlone ?? [],
    },
    branch: {
      asks: condition.asks,
      branches: condition.branches.map((b) => ({ label: b.label, when: b.when })),
    },
    wait:
      wait?.kind === "wait"
        ? {
            until: wait.until,
            timeoutAfter: wait.timeout.after,
            timeoutReason: wait.timeout.reason,
            extendsOnEngagement: wait.windowExtendsOnEngagement,
          }
        : null,
    handoff:
      handoff?.kind === "handoff"
        ? {
            to: handoff.to,
            toName: handoffTarget?.name ?? null,
            on: handoff.on,
            carries: handoff.carries,
          }
        : null,
  };
})();

/* ---- Library showcase cards ------------------------------------------
   SIX real journeys, one per category, each projected to a short node-kind
   strip so a card reads as a FLOW rather than as an article. Six, not 255:
   the marketing page has no reason to render the whole library. */

/* FIVE, not six: the spread highlights its centre card, and with an even
   count there is no true centre to highlight. Five also crops symmetrically
   against the 1280 measure. */
const SHOWCASE_IDS = ["ACQ-09", "ACT-12", "CON-38", "TIM-65", "OWN-53"] as const;

export type ShowcaseCard = {
  id: string;
  name: string;
  purpose: string;
  categoryTitle: string;
  nodeCount: number;
  /** The journey's node kinds in graph order - the card's mini flow strip. */
  strip: NodeKind[];
  href: string;
};

export function showcaseCards(lang: Lang): ShowcaseCard[] {
  const base = lang === "en" ? "/lab/journeys" : "/tr/lab/journeys";
  return SHOWCASE_IDS.map((id) => {
    const j = requireJourney(id);
    const cat = CATEGORIES.find((c) => c.id === j.category);
    return {
      id: j.id,
      name: j.name,
      purpose: j.purpose,
      categoryTitle: cat?.title ?? j.category,
      nodeCount: j.nodes.length,
      strip: j.nodes.slice(0, 6).map((n) => n.kind),
      href: `${base}/${j.slug}`,
    };
  });
}
