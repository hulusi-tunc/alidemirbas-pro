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
  action: { width: 264, height: 168 },
  condition: { width: 240, height: 128 },
  wait: { width: 240, height: 56 },
  handoff: { width: 240, height: 124 },
  outcome: { width: 232, height: 100 },
  exit: { width: 208, height: 88 },
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

function edgeKindFor(node: FlowNode, edge: FlowEdge): CanvasEdgeKind {
  if (node.kind === "wait") return edge.label === "on timeout" ? "wait-timeout" : "wait-event";
  if (node.kind === "condition") return "branch";
  return "linear";
}

/* Kinds that may be drawn once per parent when shared. A node of one of
   these kinds with no outgoing edge inside the journey is a leaf: an
   instance of it is a complete drawing of it. */
const INSTANCED_KINDS: ReadonlySet<CanvasNodeKind> = new Set(["exit", "handoff", "outcome"]);

/* ---------------------------------------------------------------- display graph */

export function buildDisplayGraph(nodes: readonly FlowNode[]): DisplayGraph {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const entry = nodes.find((n) => n.isEntry) ?? nodes[0];

  /* Internal edges only - an edge to another journey or an external system
     is where this journey's drawing ends. */
  const internal = new Map<string, FlowEdge[]>();
  const parents = new Map<string, Set<string>>();
  for (const n of nodes) {
    const out = n.edges.filter((e) => e.kind === "node" && byId.has(e.to));
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

  const displayNodes: DisplayNode[] = [];
  const displayEdges: DisplayEdge[] = [];
  for (const n of nodes) {
    if (!instanced.has(n.id)) displayNodes.push({ layoutId: n.id, canonicalNodeId: n.id, node: n });
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
  "elk.spacing.edgeNode": "24",
  "elk.spacing.edgeEdge": "16",
  "elk.layered.spacing.edgeNodeBetweenLayers": "24",
  "elk.layered.spacing.edgeEdgeBetweenLayers": "16",
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
    const size = SIZE[d.node.kind];
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
    const width = c.width ?? SIZE[d.node.kind].width;
    const height = c.height ?? SIZE[d.node.kind].height;
    return { layoutId: d.layoutId, canonicalNodeId: d.canonicalNodeId, node: d.node, x: (c.x ?? 0) + width / 2, y: c.y ?? 0, width, height };
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
    graph.nodes.map((d) => `${d.layoutId}:${d.node.kind}`).join("|") +
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
