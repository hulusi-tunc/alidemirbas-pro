import ELK from "elkjs/lib/elk.bundled.js";
import type { ElkExtendedEdge, ElkNode, ElkPort } from "elkjs/lib/elk-api";

import type { FlowEdge, FlowNode } from "@/lib/canonical-view";

/* Layout for the journey canvas, computed by ELK (Eclipse Layout Kernel,
   `elkjs`) - the layered algorithm, top to bottom, orthogonal edge routing.

   This module owns exactly two things:

   1. THE DISPLAY GRAPH. The canonical FlowNode[]/FlowEdge[] shape stays what
      canonical-view.ts projects; nothing here rewrites it. What ELK lays
      out is a projection of it in which a shared terminal (an `exit` or
      `handoff` - or a terminal `outcome` - that several nodes point at) is
      drawn once PER PARENT: `x.converted@c.state`, `x.converted@c.state2`.
      Every instance keeps its `canonicalNodeId`, so the detail panel opens
      the one canonical node whichever instance was clicked, and only the
      `layoutId` differs. Ordinary continuation nodes (a merge into the
      same action, a wait several branches reach) are NOT duplicated: they
      carry the flow on, and drawing them twice would draw the rest of the
      journey twice with them. A shared exit carries nothing on, so its
      instances cost nothing and they are what keep a condition's terminal
      branches beside that condition instead of at the bottom of the canvas
      with one connector each running the whole height to get there.

   2. THE ELK GRAPH and its read-back. Ports, labels, spacing and the
      option set below; then ELK's own coordinates, bend points and label
      positions copied into CanvasLayout as they are. No row/column
      arithmetic, no post-layout label shifting, no detour lanes: if a
      drawing is wrong the fix is a graph or option change here, not a
      patch on ELK's output.

   Everything is asynchronous because ELK is (its API is Promise-based).
   Layouts are computed on the server - in the async server components that
   feed JourneyCanvas its `layout` prop, and at module load for the
   thumbnails in JOURNEY_ROWS - and cached per structural signature, so the
   same journey is never laid out twice in one process. */

export type CanvasNodeKind = FlowNode["kind"];

export type CanvasPoint = { x: number; y: number };

/** One node as drawn: either a canonical node itself (`layoutId ===
    canonicalNodeId`) or a per-parent instance of a shared terminal
    (`layoutId === "<node>@<parent>"`). */
export type DisplayNode = {
  layoutId: string;
  canonicalNodeId: string;
  node: FlowNode;
  /** Family B (`collapsibleWaitFollowers` below): the wait node this
      condition is the sole, exclusive successor of - both its "on event"
      and "on timeout" arms land here and nothing else points at it, so the
      card carries a compact duration strip above the question instead of
      drawing the wait as a second box. Undefined for every ordinary node;
      only ever set on a `kind: "condition"` DisplayNode. */
  mergedWait?: FlowNode;
};

export type CanvasEdgeKind = "linear" | "branch" | "wait-event" | "wait-timeout";

export type DisplayEdge = {
  id: string;
  /** Source/target as layout ids. */
  from: string;
  to: string;
  canonicalFrom: string;
  canonicalTo: string;
  edge: FlowEdge;
  kind: CanvasEdgeKind;
  label: string | null;
  /** Position among the source's outgoing edges - the branch order declared
      in the canonical data, which is also the port order. */
  branchIndex: number;
  branchCount: number;
  /** A back edge closing a real cycle (SCH-178's resume → wait). Kept out
      of the layering (ELK reverses it) and routed through the left side. */
  loop: boolean;
};

export type DisplayGraph = {
  nodes: DisplayNode[];
  edges: DisplayEdge[];
};

export type LaidOutNode = {
  layoutId: string;
  canonicalNodeId: string;
  node: FlowNode;
  /** Carried through from `DisplayNode.mergedWait` - see there. */
  mergedWait?: FlowNode;
  /** Layer index from the top and rank from the left within it - the
      structural coordinates the card thumbnails draw from. Derived from
      ELK's placement (ELK does not export layer ids through its JSON
      output), see `structuralGrid`. */
  row: number;
  col: number;
  /** Horizontal CENTRE and top edge, in canvas pixels. */
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LaidOutEdge = {
  id: string;
  from: string;
  to: string;
  canonicalFrom: string;
  canonicalTo: string;
  kind: CanvasEdgeKind;
  label: string | null;
  /** True when the source has more than one outgoing edge in this journey. */
  isFork: boolean;
  loop: boolean;
  /** ELK's route: start point, every bend, end point. Orthogonal - each
      consecutive pair shares an x or a y. */
  points: CanvasPoint[];
  /** Centre of the label chip, from ELK's own edge-label placement. */
  labelX: number;
  labelY: number;
};

export type CanvasLayout = {
  nodes: LaidOutNode[];
  edges: LaidOutEdge[];
  width: number;
  height: number;
};

/* Card footprint per kind - the SLOT the layout reserves, not a measurement
   of the DOM (there is none at layout time). Every number is the worst case
   measured across the library with the slot released (`height: auto`); the
   cards overflow visibly, so a slot shorter than its card shows as a card
   drawing outside its own border. Re-measure after changing anything in
   JourneyCanvasNodes.tsx: the padding, the badges and the line-clamps all
   feed these. */
export const SIZE: Record<CanvasNodeKind, { width: number; height: number }> = {
  trigger: { width: 240, height: 124 },
  /* 108 -> 140 (2026-09-20): the message card gained a one-line preview of
     what it actually says, and the worst case measured across all 51 public
     journeys in both locales is 138 against the old 108 slot - the card was
     drawing 30px outside its own border. Re-measured with `offsetHeight`
     against the button's `scrollHeight`, both unscaled layout pixels; the
     canvas is CSS-transformed, so a `getBoundingClientRect` reading here is
     the zoomed value and will report every card as overflowing. */
  action: { width: 264, height: 140 },
  condition: { width: 240, height: 100 },
  wait: { width: 240, height: 56 },
  handoff: { width: 240, height: 124 },
  outcome: { width: 232, height: 100 },
  /* 48 -> 68 (2026-09-20). A PARTIAL fix to a pre-existing overflow, not a
     complete one - stated plainly so the next reader does not trust this
     number the way the others can be trusted.

     Measured over all 51 public journeys in both locales with the slot
     released to `height: auto` (the method this table's own doctrine
     prescribes): 343 of 772 exit capsules render at 46px and fit the old
     48px slot, 43 do not - 38 at 50px, 4 at 59px, 1 at 68px - and were
     drawing outside their own border. 68 covers all 43.

     What it does NOT cover: released to auto AND given the full slot width,
     the worst Turkish exit state wants 103px, because a 200px slot leaves
     roughly 24 characters a line and "bu pencerede daha fazla kapasiteye
     giden bir yol olmaksızın limitte kalındı" is 75 characters with no
     clause boundary to cut at. Sizing to 103 would make a terminal capsule
     the tallest small card on the canvas, against the visual language's own
     "exit should be lightweight"; the real fix is either a wider exit slot
     or per-node content-aware sizing (`sizeOf` already exists and handles
     one such case), and both are bigger than this change. Recorded as open
     in audit/visual-review.md rather than papered over here. */
  exit: { width: 200, height: 68 },
};

/** Height of a label chip (`text-xs` pill with `py-0.5`), as ELK sees it. */
const LABEL_HEIGHT = 24;

/* Canvas padding. The bottom carries 64px extra so the floating camera
   controls never sit over the last row. */
const PAD_X = 56;
const PAD_Y = 40;
const PAD_BOTTOM = PAD_Y + 64;

/** Estimated width of a label chip from its text, in canvas pixels. Fitted
    against 260 real labels (4-57 characters) rendered in Inter at `text-xs`
    with the chip's own padding, zoom-corrected; the weighted count is what
    lets one linear fit clear both "UNKNOWN" and "Cancelled, expired or
    emptied" without wasting width on ordinary labels. Deliberately biased
    high: an overestimate costs a little space, an underestimate a
    collision. */
const LABEL_CHAR_WEIGHT = (char: string): number => {
  if (/[A-Z]/.test(char)) return 1.2;
  if (/[ ,.'\-/]/.test(char)) return 0.55;
  return 1;
};

export function estimatedLabelWidth(label: string | null): number {
  if (!label) return 70;
  let weighted = 0;
  for (const char of label) weighted += LABEL_CHAR_WEIGHT(char);
  return Math.min(360, Math.max(70, 6 * weighted + 36));
}

/** Height a Family B combined card needs beyond an ordinary condition slot:
    a compact duration strip above the question - icon, one clamped line,
    a hairline rule, its own margin (`ConditionCard`'s `waitNode` header in
    JourneyCanvasNodes.tsx). Measured against that markup at ~31px; biased
    high like every other estimate here (`LABEL_CHAR_WEIGHT`'s own comment:
    "an overestimate costs a little space, an underestimate a collision"). */
const MERGED_WAIT_STRIP = 40;

/** The SLOT a display node reserves - `SIZE[kind]` for every ordinary node,
    `SIZE.condition` plus `MERGED_WAIT_STRIP` for a Family B combined card.
    The one place both the ELK graph and its read-back size a node, so they
    can never disagree about how tall a merged card is. */
function sizeOf(d: DisplayNode): { width: number; height: number } {
  const base = SIZE[d.node.kind];
  return d.mergedWait ? { width: base.width, height: base.height + MERGED_WAIT_STRIP } : base;
}

function edgeKindFor(node: FlowNode, edge: FlowEdge): CanvasEdgeKind {
  if (node.kind === "wait") return edge.label === "on timeout" ? "wait-timeout" : "wait-event";
  if (node.kind === "condition") return "branch";
  return "linear";
}

/* Kinds that may be drawn once per parent when shared. A node of one of
   these kinds with no outgoing edge inside the journey is a leaf: an
   instance of it is a complete drawing of it. */
const INSTANCED_KINDS: ReadonlySet<CanvasNodeKind> = new Set(["exit", "handoff", "outcome"]);

/* A channel-selecting action (`FlowNode.channelPriority`, self-detected -
   see canonical-view.ts) that leads directly into the one send action it
   selects for is, on the CANVAS, the same step as that send - "pick a
   channel" and "send on it" read as one action to a journey reader, not
   two. The canonical graph keeps both nodes exactly as authored (nothing
   here reads or writes src/canonical); this is a DISPLAY GRAPH decision
   only, the same kind this module already makes for a shared terminal
   drawn once per parent below - here the router simply draws no box of
   its own, and whatever fed into it connects straight through to the
   message/human action instead. Detail panel access to the router's own
   full priority/fallback prose is JourneyCanvas.tsx's concern (it still
   has the router as an ordinary FlowNode, just not laid out); this
   function only decides what gets a box. Generic: works for any journey
   with the shape, not looked up by journey or node id. */
export function collapsibleRouters(nodes: readonly FlowNode[], byId: ReadonlyMap<string, FlowNode>): ReadonlyMap<string, string> {
  const collapsed = new Map<string, string>();
  for (const n of nodes) {
    if (n.kind !== "action" || n.execution || (n.channelPriority?.length ?? 0) < 2) continue;
    const out = n.edges.filter((e) => e.kind === "node");
    if (out.length !== 1) continue;
    const next = byId.get(out[0].to);
    if (next?.kind === "action" && (next.execution === "communication" || next.execution === "human")) {
      collapsed.set(n.id, out[0].to);
    }
  }
  return collapsed;
}

/** A binary condition (exactly two branches) where one side is a real
    continuation and the other is a bookkeeping short-circuit is, on the
    DISPLAY graph, not a decision a reader needs to see - "may this touch
    go out" is inherent to every communication node's own permission/
    reachability/pressure rules, and "is this instance even eligible to
    open" right after a trigger is entry plumbing, not a journey branch.
    The qualifying signal is `ExitNode.class === "no-action"` on the short
    side (resolved through at most one plain-internal bookkeeping hop, the
    corpus's own "record why nothing was sent" step) - already-authored
    vNext data, not a guess from either branch's prose or the condition's
    own question. That is what tells this apart from a structurally
    identical-looking gate a reader DOES need (ACQ-11's "is a final notice
    enabled, and is there a real expiry to name?" short-circuits to
    `x.lapsed`, class `timeout` - a business-meaningful ending, not a
    no-action record - so it is left alone and drawn as an ordinary
    branch). Absorbed the same way `collapsibleRouters` absorbs a channel-
    selecting action: the gate (and the bookkeeping hop on either side, and
    the no-action exit itself) draw no box, and whatever fed into the gate
    connects straight through to the continuation side. Generic: any
    condition with this exact shape qualifies, not looked up by journey or
    node id - collapsibleGates never reads a journey id, only edge/kind/
    class shape shared by the whole corpus's Config schema. */
export function collapsibleGates(
  nodes: readonly FlowNode[],
  byId: ReadonlyMap<string, FlowNode>,
): { hidden: ReadonlySet<string>; into: ReadonlyMap<string, string> } {
  const isPlainInternal = (n: FlowNode | undefined): n is FlowNode => !!n && n.kind === "action" && !n.execution;
  const soleNext = (n: FlowNode): FlowNode | undefined => {
    const out = n.edges.filter((e) => e.kind === "node");
    return out.length === 1 ? byId.get(out[0].to) : undefined;
  };
  // Up to one plain-internal hop past `start`; returns the real target and
  // any internal node stepped over on the way to it.
  const resolveChain = (start: FlowNode): { end: FlowNode; hops: readonly string[] } => {
    if (isPlainInternal(start)) {
      const next = soleNext(start);
      if (next) return { end: next, hops: [start.id] };
    }
    return { end: start, hops: [] };
  };

  /* Who points at what, canonically - needed because a bookkeeping hop is
     frequently SHARED between several gates, and hiding it on behalf of one
     of them would cut the arm of another that is still drawn. */
  const parents = new Map<string, Set<string>>();
  for (const n of nodes) {
    for (const e of n.edges) {
      if (e.kind !== "node") continue;
      const set = parents.get(e.to) ?? new Set<string>();
      set.add(n.id);
      parents.set(e.to, set);
    }
  }

  type Candidate = { gate: string; contEnd: string; contHops: readonly string[]; shortHops: readonly string[] };
  const candidates: Candidate[] = [];
  for (const n of nodes) {
    if (n.kind !== "condition") continue;
    const branchTargets = n.edges.filter((e) => e.kind === "node").map((e) => byId.get(e.to));
    if (branchTargets.length !== 2 || branchTargets.some((t) => !t)) continue;
    const chains = branchTargets.map((t) => resolveChain(t!));
    const shortCircuits = chains.filter((c) => c.end.kind === "exit" && c.end.exitClass === "no-action");
    const continuations = chains.filter((c) => !(c.end.kind === "exit" && c.end.exitClass === "no-action"));
    if (shortCircuits.length !== 1 || continuations.length !== 1) continue;
    const cont = continuations[0];
    // Never collapse into another (possibly also-collapsible) condition -
    // this stays a single hop, not a chain of guesses.
    if (cont.end.kind === "condition" || cont.end.kind === "exit") continue;
    /* THE SHORT ARM MUST RECORD BEFORE IT ENDS. An exit classed
       "no-action" was not, on its own, enough evidence that a gate is
       plumbing: a genuine business decision can end in one too, and
       collapsing those erased authored logic - RET-24's "is a
       proportionate automated recovery available?" (the journey's whole
       objective, and its ONLY exit) and TIM-63's "is telling anyone useful
       even though nothing can be done?" (its authored `s.nothing-to-say`
       suppression) both disappeared. What separates them is where the
       short arm goes FIRST: a business decision branches straight to its
       outcome, while a send-path gate books the reason it did not send and
       only then ends. Requiring that bookkeeping hop takes the rule from
       24 gates to 9 corpus-wide, and those 9 are exactly the ones whose
       own question is "may this touch go out?" - the 15 it now leaves
       alone are all real questions a reader needs. */
    if (shortCircuits[0].hops.length === 0) continue;
    candidates.push({ gate: n.id, contEnd: cont.end.id, contHops: cont.hops, shortHops: shortCircuits[0].hops });
  }

  const collapsedGates = new Set(candidates.map((c) => c.gate));
  /* A hop may only disappear when EVERY node pointing at it is a gate that
     collapsed. RET-32 is the case that proves it: its `a.record-no-action`
     is reached from three conditions, two of which collapse and one of
     which (its eligibility check, whose own continuation is another
     condition) does not - hiding the hop for the two would have deleted
     the third's "Excluded" arm from the drawing while leaving the decision
     itself on screen, a branch silently lost. */
  const hideable = (hop: string): boolean => {
    const ps = parents.get(hop);
    return !!ps && [...ps].every((p) => collapsedGates.has(p));
  };

  const hidden = new Set<string>(collapsedGates);
  const into = new Map<string, string>();
  for (const c of candidates) {
    for (const id of c.shortHops) if (hideable(id)) hidden.add(id);
    /* The continuation hop is the same question: where it is shared and
       stays drawn, this gate collapses only as far as the hop rather than
       past it, so the node still has its edge in. */
    const contHopsHidden = c.contHops.every((id) => hideable(id));
    for (const id of c.contHops) if (hideable(id)) hidden.add(id);
    into.set(c.gate, contHopsHidden ? c.contEnd : (c.contHops[0] ?? c.contEnd));
  }
  /* The no-action exit itself is deliberately NOT hidden here. It is
     usually reached only through gates like this one and then falls away
     on its own as unreachable (buildDisplayGraph prunes that below), but
     a journey where something still visible points at the same exit
     keeps it drawn - hiding it eagerly would cut a live branch off at
     the knee on a shape this function has not seen. */
  return { hidden, into };
}

/* A journey's own bookkeeping - "open the instance and start the clock",
   "record the return and re-arm the wait", "read what they currently hold"
   - is real implementation work and stays in the canonical graph, but it is
   not a step in the story the canvas tells. Drawn as full cards these are
   both the most numerous boxes on the canvas and the longest text on it
   (audited across all 73 library journeys: the single biggest source of
   clutter, and every card over 110 characters is one of them).

   Three conditions, all structural or authored - never a journey or node id:

   1. `execution` is unset. A communication or human action reaches a
      person and is always its own step.
   2. It is a pass-through: exactly one node points at it, and it points at
      exactly one node. Anything a branch converges on, or that forks, is
      load-bearing on the drawing.
   3. It writes nothing, or writes ONLY the corpus's own journal fields
      (`*_log`, `*_history`, `suppressed_sends`). This is the line between
      bookkeeping and work: measured across the library, 103 of 117
      pass-through internal actions journal or write nothing, while the 14
      that write real state are exactly the ones a reader needs - the
      channel routers (`selected_channel_*`, already collapsed by
      `collapsibleRouters`), and steps like "resolve the existing account"
      (`commercial_entity_link`), "identify the exact requirement"
      (`blocking_requirement`) or "assemble the signals" (`risk_evidence`),
      whose output later steps depend on. Those keep their card.

   The absorbed node keeps everything: it is still in `FlowNode[]`, still
   carries its full prose, and JourneyCanvas hands it to the detail panel
   of the card that absorbed it, so a reader who opens that card sees every
   canonical step it represents. Nothing is deleted, only un-boxed. */
const JOURNAL_WRITE = /(_log$|_history$|_trail$|_audit$|^suppressed_sends$)/;

export function absorbableBookkeeping(
  nodes: readonly FlowNode[],
  byId: ReadonlyMap<string, FlowNode>,
): ReadonlyMap<string, string> {
  const inDegree = new Map<string, number>();
  for (const n of nodes) {
    for (const e of n.edges) {
      if (e.kind === "node") inDegree.set(e.to, (inDegree.get(e.to) ?? 0) + 1);
    }
  }
  const absorbed = new Map<string, string>();
  for (const n of nodes) {
    if (n.kind !== "action" || n.execution || n.isEntry) continue;
    if ((inDegree.get(n.id) ?? 0) !== 1) continue;
    const out = n.edges.filter((e) => e.kind === "node");
    if (out.length !== 1) continue;
    const host = byId.get(out[0].to);
    if (!host) continue;
    /* `writesFields` (FlowNode, canonical-view.ts) carries the authored
       `writes[].field` names raw and unlocalized - read that structural
       fact directly rather than pattern-matching `meta`'s "writes <field>
       (<mode>)" display line, which is Turkish prose on the TR route and
       does not start with the English word "writes" there. Matching
       against `meta` used to make this test vacuously pass on `/tr` for
       any node with real, non-journal writes (an empty `.filter()` result
       makes `.every()` true), silently absorbing a node on TR that EN
       correctly kept drawn - see `writesFields`'s own doc for the five
       journeys this cost before the fix. */
    const writes = n.writesFields ?? [];
    const journalOnly = writes.every((field) => JOURNAL_WRITE.test(field));
    if (!journalOnly) continue;
    absorbed.set(n.id, out[0].to);
  }
  return absorbed;
}

/* Family B (Hulusi's spec, 2026-09-20): a wait whose "on event" and "on
   timeout" arms both land on the SAME condition, with nothing else pointing
   at that condition, is one reading unit on the canvas - "wait, then read
   what happened" - not two boxes. The canonical graph keeps both wait edges
   and the condition node exactly as authored; this only decides that the
   condition's own card carries a compact duration strip instead of the wait
   being drawn as a card of its own.

   Two conditions, both structural, read straight off the edges every
   journey already has - never a journey or node id:

   1. The wait's "on event" and "on timeout" arms name the exact same
      target, and that target is a condition. `canonical-view.ts` already
      collapses this pair to two unlabeled edges when they agree (the twin-
      route edge merge draws one line for them either way), so this is the
      SAME signal the drawing already uses for "these two arms say the same
      thing" - not a second test invented for this collapse.
   2. That condition's only incoming edges - by distinct SOURCE, not raw
      count, which is what lets the wait's own two same-target arms both
      count as "one source" instead of failing an `=== 1` check they can
      never pass - all come from this wait. A condition three routes lead
      into is not exclusively this wait's question.

   Measured against the corpus (`audit/family-b-detector.mjs`, not
   estimated): of the library's 105 waits, 86 send the two arms to DIFFERENT
   nodes - collapsing those would erase a real branch, so condition 1 is
   exact equality, not "usually agree". Of the 19 that agree, 2 land on
   something that is not a condition and 2 share that condition with another
   route - collapsing either would delete or misattribute an edge that is
   not this wait's alone. The remaining 15, across 7 journeys, are
   exclusive. A broader reading - any wait whose "on event" target is a
   sole-parent condition, letting the two arms disagree - was tested and
   rejected: the corpus does not populate a branch's `observes` with event
   ids, so there is no way to tell "this branch is naming which event fired"
   from "this is an unrelated decision that happens to be this wait's only
   child" at the other 24 sites that shape matches. */
export function collapsibleWaitFollowers(
  nodes: readonly FlowNode[],
  byId: ReadonlyMap<string, FlowNode>,
): ReadonlyMap<string, string> {
  const sources = new Map<string, Set<string>>();
  for (const n of nodes) {
    for (const e of n.edges) {
      if (e.kind !== "node") continue;
      const set = sources.get(e.to) ?? new Set<string>();
      set.add(n.id);
      sources.set(e.to, set);
    }
  }

  const collapsed = new Map<string, string>();
  for (const n of nodes) {
    if (n.kind !== "wait") continue;
    const out = n.edges.filter((e) => e.kind === "node");
    // Every corpus wait carries both arms (WaitNode.onEvent/onTimeout are
    // both required in src/canonical/types.ts) - defensive only.
    if (out.length !== 2) continue;
    const [onEvent, onTimeout] = out;
    if (onEvent.to !== onTimeout.to) continue;
    const target = byId.get(onEvent.to);
    if (!target || target.kind !== "condition") continue;
    const only = sources.get(target.id);
    if (!only || only.size !== 1 || !only.has(n.id)) continue;
    collapsed.set(n.id, target.id);
  }
  return collapsed;
}

/** Drawn node id -> the canonical nodes it stands in for, in canonical
    order. The traceability half of every collapse this module makes: a card
    that represents more than itself must be able to say so, and the detail
    panel renders this list as "represented canonical steps" so the
    simplification never costs a reader the implementation. Covers all four
    collapses (channel router, permission gate and its bookkeeping hop,
    absorbed bookkeeping, Family B's wait+condition merge). */
export function representedSteps(nodes: readonly FlowNode[]): ReadonlyMap<string, readonly FlowNode[]> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const routers = collapsibleRouters(nodes, byId);
  const gates = collapsibleGates(nodes, byId);
  const bookkeeping = absorbableBookkeeping(nodes, byId);
  const waitFollowers = collapsibleWaitFollowers(nodes, byId);

  const order = new Map(nodes.map((n, i) => [n.id, i]));
  const hostOf = new Map<string, string>();
  for (const [absorbed, host] of routers) hostOf.set(absorbed, host);
  for (const [gate, host] of gates.into) hostOf.set(gate, host);
  for (const [absorbed, host] of bookkeeping) hostOf.set(absorbed, host);
  for (const [waitId, host] of waitFollowers) hostOf.set(waitId, host);
  /* A gate's own hidden bookkeeping hop has no `into` of its own; it belongs
     to whatever that gate collapsed into. */
  for (const hidden of gates.hidden) {
    if (hostOf.has(hidden)) continue;
    const parent = nodes.find((n) => n.edges.some((e) => e.kind === "node" && e.to === hidden && gates.into.has(n.id)));
    const host = parent ? gates.into.get(parent.id) : undefined;
    if (host) hostOf.set(hidden, host);
  }

  /* Resolve chains so an absorbed node whose host was itself absorbed lands
     on the card actually drawn. Bounded, like `resolve` below. */
  const resolveHost = (id: string): string => {
    let at = id;
    for (let i = 0; i < 4; i++) {
      const next = hostOf.get(at);
      if (!next || next === at) break;
      at = next;
    }
    return at;
  };

  const out = new Map<string, FlowNode[]>();
  for (const absorbed of hostOf.keys()) {
    const host = resolveHost(absorbed);
    if (host === absorbed) continue;
    const node = byId.get(absorbed);
    if (!node) continue;
    const list = out.get(host) ?? [];
    list.push(node);
    out.set(host, list);
  }
  for (const list of out.values()) list.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  return out;
}

/* ---------------------------------------------------------------- display graph */

export function buildDisplayGraph(nodes: readonly FlowNode[]): DisplayGraph {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const entry = nodes.find((n) => n.isEntry) ?? nodes[0];
  const routers = collapsibleRouters(nodes, byId);
  const gates = collapsibleGates(nodes, byId);
  const bookkeeping = absorbableBookkeeping(nodes, byId);
  const waitFollowers = collapsibleWaitFollowers(nodes, byId);
  /* All four collapses answer the same question - "what does an edge
     pointing at this node actually reach on the canvas?" - so they share
     one resolver. Chained (a gate whose continuation is itself a collapsed
     router) resolves through in a bounded loop rather than one hop; the
     bound is what keeps a pathological cycle of collapses from spinning. */
  const hop = (id: string): string => routers.get(id) ?? gates.into.get(id) ?? bookkeeping.get(id) ?? waitFollowers.get(id) ?? id;
  const resolve = (id: string): string => {
    let at = id;
    for (let i = 0; i < 4; i++) {
      const next = hop(at);
      if (next === at) break;
      at = next;
    }
    return at;
  };
  const hiddenNodes = new Set<string>([...routers.keys(), ...gates.hidden, ...bookkeeping.keys(), ...waitFollowers.keys()]);
  /* Family B's host is drawn from ITS OWN kind (the condition), not
     absorbed invisibly like the other three collapses - its card needs the
     wait's own data to draw the duration strip. Inverted from
     `waitFollowers` (wait -> host) to host -> wait, and resolved through
     `resolve()` below only implicitly: if the host condition is itself
     later hidden by something else, `reachable`/`hiddenNodes` already keep
     it (and this map) from ever being read. */
  const mergedWaitOf = new Map<string, FlowNode>();
  for (const [waitId, hostId] of waitFollowers) {
    const waitNode = byId.get(waitId);
    if (waitNode) mergedWaitOf.set(hostId, waitNode);
  }

  /* Internal edges only - an edge to another journey or an external system
     is where this journey's drawing ends. A collapsed router contributes
     no edges of its own (its one edge, into the node it selects for, is
     what the collapse absorbs); any edge that targeted it is retargeted to
     what it resolves to, so the rest of this function never has to know
     the collapse happened. */
  const internal = new Map<string, FlowEdge[]>();
  const parents = new Map<string, Set<string>>();
  for (const n of nodes) {
    if (hiddenNodes.has(n.id)) {
      internal.set(n.id, []);
      continue;
    }
    const raw = n.edges
      .filter((e) => e.kind === "node" && byId.has(e.to))
      .map((e) => (hiddenNodes.has(e.to) ? { ...e, to: resolve(e.to) } : e))
      /* An edge whose target is still hidden after resolving is one of the
         collapsed short-circuit's own arms (the bookkeeping hop a gate
         absorbed); it has no box to point at any more. */
      .filter((e) => !hiddenNodes.has(e.to));
    /* Twin routes (Hulusi, 2026-09-20: "why do two lines leave here?"): a
       wait whose "on event" and "on timeout" both lead to the same node -
       ACQ-11's second wait feeds one decision either way - drew two
       identical lines. They become one line carrying both labels ("on
       event · on timeout"), which says the same thing once. The canonical
       graph keeps both edges; only the drawing merges them. */
    const out: FlowEdge[] = [];
    for (const e of raw) {
      const twin = out.find((o) => o.to === e.to);
      if (twin) {
        const labels = [twin.label, e.label].filter((l): l is string => Boolean(l));
        twin.label = labels.length ? [...new Set(labels)].join(" · ") : twin.label;
        continue;
      }
      out.push({ ...e });
    }
    internal.set(n.id, out);
    for (const e of out) {
      const set = parents.get(e.to) ?? new Set<string>();
      set.add(n.id);
      parents.set(e.to, set);
    }
  }

  /* Loop edges: DFS from the entry, an edge to a node still on the current
     path closes a cycle. A node reached a second time on a longer path (a
     merge) is not a cycle and stays an ordinary edge - only a real cycle
     is drawn upward. */
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map(nodes.map((n) => [n.id, WHITE]));
  const loops = new Set<string>();
  const visit = (id: string) => {
    color.set(id, GRAY);
    internal.get(id)!.forEach((e, i) => {
      const c = color.get(e.to);
      if (c === GRAY) loops.add(`${id}#${i}`);
      else if (c === WHITE) visit(e.to);
    });
    color.set(id, BLACK);
  };
  if (entry) visit(entry.id);
  for (const n of nodes) if (color.get(n.id) === WHITE) visit(n.id);

  const instanced = new Set(
    nodes
      .filter((n) => INSTANCED_KINDS.has(n.kind) && internal.get(n.id)!.length === 0 && (parents.get(n.id)?.size ?? 0) >= 2)
      .map((n) => n.id),
  );

  /* Reachability AFTER the collapses. A node whose only parents were gates
     that just collapsed - the corpus's shared "no touch sent" exit is the
     usual one - has nothing pointing at it any more, and a box nothing
     reaches is not a step a reader can follow. Measured from the
     post-collapse edges rather than assumed, so the same exit stays drawn
     on a journey where something still visible points at it. */
  const reachable = new Set<string>();
  const walk = (id: string) => {
    if (reachable.has(id)) return;
    reachable.add(id);
    for (const e of internal.get(id) ?? []) walk(e.to);
  };
  if (entry) walk(entry.id);

  const displayNodes: DisplayNode[] = [];
  const displayEdges: DisplayEdge[] = [];
  for (const n of nodes) {
    if (!reachable.has(n.id)) continue;
    if (!instanced.has(n.id)) {
      const mergedWait = mergedWaitOf.get(n.id);
      displayNodes.push({ layoutId: n.id, canonicalNodeId: n.id, node: n, ...(mergedWait ? { mergedWait } : {}) });
    }
    const out = internal.get(n.id)!;
    /* Instances go into the model order right after their parent, which is
       where ELK's model-order tie-breaking keeps them on the canvas too. */
    const pushed = new Set<string>();
    out.forEach((e, i) => {
      let to = e.to;
      if (instanced.has(e.to)) {
        to = `${e.to}@${n.id}`;
        if (!pushed.has(to)) {
          pushed.add(to);
          displayNodes.push({ layoutId: to, canonicalNodeId: e.to, node: byId.get(e.to)! });
        }
      }
      displayEdges.push({
        id: `${n.id}->${to}#${i}`,
        from: n.id,
        to,
        canonicalFrom: n.id,
        canonicalTo: e.to,
        edge: e,
        kind: edgeKindFor(n, e),
        label: e.label,
        branchIndex: i,
        branchCount: out.length,
        loop: loops.has(`${n.id}#${i}`),
      });
    });
  }
  return { nodes: displayNodes, edges: displayEdges };
}

/* ------------------------------------------------------------------- ELK graph */

/* Spacing, in canvas pixels. Between siblings in a layer 48; between
   layers 72; an edge keeps 24 from a node it passes and 16 from another
   edge. Tuned only downward from here if at all - never widened. */
const ROOT_OPTIONS: Record<string, string> = {
  "elk.algorithm": "layered",
  "elk.direction": "DOWN",
  "elk.edgeRouting": "ORTHOGONAL",
  "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
  "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
  "elk.layered.thoroughness": "10",
  /* LAYER ASSIGNMENT (which row a node lands in) is NETWORK_SIMPLEX too
     (ELK's own default, left unset here) - it minimises total edge length
     across the WHOLE graph, which is what keeps almost every single-parent
     node at exactly parent-row+1. On a journey with two independent
     branches of unequal depth running in parallel (e.g. a wait's "on
     event"/"on timeout" splitting into a 4-hop chain and a 2-hop chain) it
     can land the short chain's terminal nodes a row or two later than
     ASAP-from-parent would, when that reduces the graph's total edge
     length - pure vertical padding, no overlap, no crossing, no horizontal
     growth (measured: see the session that tuned this - about 7% of
     corpus edges, only ever 2-3 rows). Both alternatives tried and
     rejected: LONGEST_PATH (as-LATE-as-possible layering) drags every leaf
     with no further children toward the graph's LAST layer regardless of
     its own parent's depth, turning this into double-digit-row gaps
     corpus-wide; node promotion (NIKOLOV and NO_BOUNDARY strategies, both
     tried) measured byte-identical to the default, so it is not carried
     here as dead configuration. */
  /* The canonical order of nodes and of a condition's branches is a
     statement, not an accident: ties in crossing minimisation resolve to
     it rather than to whatever the sweep happened to try first. */
  "elk.layered.considerModelOrder.strategy": "NODES_AND_EDGES",
  /* A loop edge (marked below) is what closes the cycle; depth-first cycle
     breaking reverses the same edge the display graph found, so the loop
     never turns a forward edge upward instead. */
  "elk.layered.cycleBreaking.strategy": "DEPTH_FIRST",
  "elk.spacing.nodeNode": "48",
  "elk.layered.spacing.nodeNodeBetweenLayers": "72",
  "elk.spacing.edgeNode": "32",
  "elk.spacing.edgeEdge": "28",
  "elk.layered.spacing.edgeNodeBetweenLayers": "32",
  "elk.layered.spacing.edgeEdgeBetweenLayers": "28",
  "elk.spacing.edgeLabel": "8",
  "elk.padding": `[top=${PAD_Y},left=${PAD_X},bottom=${PAD_BOTTOM},right=${PAD_X}]`,
};

/* Port index runs clockwise from the top-left corner: NORTH left→right,
   then EAST, then SOUTH right→left, then WEST bottom→top. So the first
   branch, which must leave leftmost, takes the HIGHEST south index. */
function toElkGraph(graph: DisplayGraph): ElkNode {
  const southEdges = new Map<string, DisplayEdge[]>();
  const loopOut = new Map<string, DisplayEdge[]>();
  const loopIn = new Set<string>();
  for (const e of graph.edges) {
    if (e.loop) {
      (loopOut.get(e.from) ?? loopOut.set(e.from, []).get(e.from)!).push(e);
      loopIn.add(e.to);
    } else {
      (southEdges.get(e.from) ?? southEdges.set(e.from, []).get(e.from)!).push(e);
    }
  }

  const sourcePort = new Map<string, string>();
  const children: ElkNode[] = graph.nodes.map((d) => {
    const ports: ElkPort[] = [
      { id: `${d.layoutId}.in`, width: 0, height: 0, layoutOptions: { "elk.port.side": "NORTH", "elk.port.index": "0" } },
    ];
    const south = southEdges.get(d.layoutId) ?? [];
    south.forEach((e, rank) => {
      const id = `${d.layoutId}.out${e.branchIndex}`;
      sourcePort.set(e.id, id);
      ports.push({
        id,
        width: 0,
        height: 0,
        layoutOptions: { "elk.port.side": "SOUTH", "elk.port.index": String(1 + (south.length - 1 - rank)) },
      });
    });
    let next = south.length + 1;
    if (loopIn.has(d.layoutId)) {
      ports.push({ id: `${d.layoutId}.loop-in`, width: 0, height: 0, layoutOptions: { "elk.port.side": "WEST", "elk.port.index": String(next++) } });
    }
    for (const e of loopOut.get(d.layoutId) ?? []) {
      const id = `${d.layoutId}.loop-out${e.branchIndex}`;
      sourcePort.set(e.id, id);
      ports.push({ id, width: 0, height: 0, layoutOptions: { "elk.port.side": "WEST", "elk.port.index": String(next++) } });
    }
    const size = sizeOf(d);
    return {
      id: d.layoutId,
      width: size.width,
      height: size.height,
      ports,
      layoutOptions: { "elk.portConstraints": "FIXED_ORDER" },
    };
  });

  const edges: ElkExtendedEdge[] = graph.edges.map((e) => ({
    id: e.id,
    sources: [sourcePort.get(e.id)!],
    targets: [e.loop ? `${e.to}.loop-in` : `${e.to}.in`],
    ...(e.label
      ? {
          labels: [
            {
              text: e.label,
              width: estimatedLabelWidth(e.label),
              height: LABEL_HEIGHT,
              layoutOptions: { "elk.edgeLabels.inline": "true" },
            },
          ],
        }
      : {}),
  }));

  return { id: "root", layoutOptions: ROOT_OPTIONS, children, edges };
}

/* ------------------------------------------------------------------- read-back */

/** Layer index and in-layer rank from ELK's placement. Nodes of one layer
    overlap vertically (a layer is one horizontal band); nodes of different
    layers are separated by the between-layer spacing. So a node opens a
    new row exactly when it starts below every node of the row before. */
function structuralGrid(placed: Omit<LaidOutNode, "row" | "col">[]): Map<string, { row: number; col: number }> {
  const sorted = [...placed].sort((a, b) => a.y - b.y || a.x - b.x);
  const rows: Omit<LaidOutNode, "row" | "col">[][] = [];
  let rowBottom = -Infinity;
  for (const n of sorted) {
    if (rows.length && n.y < rowBottom) {
      rows[rows.length - 1].push(n);
      rowBottom = Math.min(rowBottom, n.y + n.height);
    } else {
      rows.push([n]);
      rowBottom = n.y + n.height;
    }
  }
  const grid = new Map<string, { row: number; col: number }>();
  rows.forEach((row, r) => {
    [...row].sort((a, b) => a.x - b.x).forEach((n, c) => grid.set(n.layoutId, { row: r, col: c }));
  });
  return grid;
}

function readBack(graph: DisplayGraph, out: ElkNode): CanvasLayout {
  const byLayoutId = new Map(graph.nodes.map((d) => [d.layoutId, d]));
  const placed = (out.children ?? []).map((c) => {
    const d = byLayoutId.get(c.id)!;
    const size = sizeOf(d);
    const width = c.width ?? size.width;
    const height = c.height ?? size.height;
    return {
      layoutId: d.layoutId,
      canonicalNodeId: d.canonicalNodeId,
      node: d.node,
      ...(d.mergedWait ? { mergedWait: d.mergedWait } : {}),
      x: (c.x ?? 0) + width / 2,
      y: c.y ?? 0,
      width,
      height,
    };
  });
  const grid = structuralGrid(placed);
  const nodes: LaidOutNode[] = placed.map((p) => ({ ...p, ...grid.get(p.layoutId)! }));
  const nodeAt = new Map(nodes.map((n) => [n.layoutId, n]));

  const outgoing = new Map<string, number>();
  for (const e of graph.edges) outgoing.set(e.from, (outgoing.get(e.from) ?? 0) + 1);
  const elkEdge = new Map((out.edges ?? []).map((e) => [e.id, e]));

  const edges: LaidOutEdge[] = graph.edges.map((e) => {
    const laid = elkEdge.get(e.id);
    const from = nodeAt.get(e.from)!;
    const to = nodeAt.get(e.to)!;
    const points: CanvasPoint[] = [];
    for (const s of laid?.sections ?? []) {
      points.push({ x: s.startPoint.x, y: s.startPoint.y });
      for (const b of s.bendPoints ?? []) points.push({ x: b.x, y: b.y });
      points.push({ x: s.endPoint.x, y: s.endPoint.y });
    }
    if (points.length < 2) {
      // Defensive only: ELK routes every edge it is given.
      points.length = 0;
      points.push({ x: from.x, y: from.y + from.height }, { x: to.x, y: to.y });
    }
    const label = laid?.labels?.[0];
    let labelX: number;
    let labelY: number;
    if (label && label.x !== undefined && label.y !== undefined) {
      labelX = label.x + (label.width ?? 0) / 2;
      labelY = label.y + (label.height ?? LABEL_HEIGHT) / 2;
    } else {
      const mid = points[Math.floor(points.length / 2)];
      labelX = mid.x;
      labelY = mid.y;
    }
    return {
      id: e.id,
      from: e.from,
      to: e.to,
      canonicalFrom: e.canonicalFrom,
      canonicalTo: e.canonicalTo,
      kind: e.kind,
      label: e.label,
      isFork: (outgoing.get(e.from) ?? 0) > 1,
      loop: e.loop,
      points,
      labelX,
      labelY,
    };
  });

  return {
    nodes,
    edges,
    width: Math.ceil(out.width ?? 0),
    height: Math.ceil(out.height ?? 0),
  };
}

/* ---------------------------------------------------------------------- entry */

const elk = new ELK();

/* One layout per structural signature per process. The signature is the
   display graph - ids, kinds, edges, labels (label text sets label width,
   so a translated journey is its own entry) - not the FlowNode identity,
   because canonical-view builds its node arrays fresh per call. */
const cache = new Map<string, Promise<CanvasLayout>>();

function signature(graph: DisplayGraph): string {
  return (
    // `+w` when a condition carries a Family B merged wait: not otherwise
    // implied by layoutId/kind/edges (the absorbed wait itself is hidden,
    // so it leaves no trace in either), and it changes the node's own
    // reserved height (`sizeOf`) - two graphs identical everywhere else
    // must still cache separately if they differ only in this.
    graph.nodes.map((d) => `${d.layoutId}:${d.node.kind}${d.mergedWait ? "+w" : ""}`).join("|") +
    "//" +
    graph.edges.map((e) => `${e.from}>${e.to}:${e.label ?? ""}:${e.loop ? "L" : ""}`).join("|")
  );
}

export function layoutJourneyCanvas(nodes: readonly FlowNode[]): Promise<CanvasLayout> {
  const graph = buildDisplayGraph(nodes);
  const key = signature(graph);
  let pending = cache.get(key);
  if (!pending) {
    pending = elk.layout(toElkGraph(graph)).then((out) => readBack(graph, out));
    cache.set(key, pending);
  }
  return pending;
}

/** The SVG path for an edge's route - a polyline through ELK's points. */
export function edgePath(points: readonly CanvasPoint[]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
}
