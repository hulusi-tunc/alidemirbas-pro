import type { FlowNode } from "@/lib/canonical-view";
import { layoutJourneyCanvas, type CanvasNodeKind } from "@/lib/journey-canvas-layout";

/* Topology thumbnails for the Journey Library cards.

   This is NOT a second graph engine. Every thumbnail's structure comes from
   `layoutJourneyCanvas` - the same layout the journey's own detail page
   renders - so a card and the Canvas it opens are the same graph: same
   longest-path rows, same branch fan-out, same merges, same back-edges.
   Only the PRESENTATION is reduced for card scale: no labels, no node text,
   no interactivity, and each node drawn as its Canvas silhouette rather than
   its full card.

   Two deliberate reductions, both documented rather than silently invented:

   1. TRANSPOSED. The Canvas runs top-to-bottom; the thumbnail runs
      left-to-right (depth on x, branch fan on y). This is measured, not
      taste: 249 of the 255 journeys are taller than they are wide (median
      bounding box ~0.45 w/h), and the card's thumbnail band is the opposite
      shape (~2.2 w/h). Drawn upright, the median journey would use about a
      fifth of the band and the deepest ones would be an unreadable thread.
      Transposing is a rotation - it preserves the graph exactly, including
      every branch, merge and terminal path - and it is also what the
      approved design specifies ("left-to-right layering by graph depth,
      branches fanning vertically").

   2. GRID-SPACE, NOT PIXEL-SPACE. Positions come from each node's `row` and
      `col` (the layout's own structural output) rather than its pixel x/y,
      so the thumbnail is a diagram of the structure rather than a scale
      photograph of a canvas whose row heights vary with node kind. That is
      also what lets the two axes fit independently: grid indices are
      dimensionless, so there is no aspect ratio to distort.

   Everything here is computed once per journey on the server (canonical-view
   builds it into JOURNEY_ROWS at build time) and shipped as small integers.
   The card component maps those integers straight onto SVG elements - no
   layout runs in the browser for any of the 255 cards. */

/** Kinds, in a fixed order - the wire format stores an index into this, so
    the order is part of the format and must not be reshuffled. */
export const PREVIEW_KINDS: readonly CanvasNodeKind[] = [
  "trigger",
  "action",
  "condition",
  "wait",
  "handoff",
  "outcome",
  "exit",
];

const KIND_INDEX = new Map<CanvasNodeKind, number>(PREVIEW_KINDS.map((k, i) => [k, i]));

/** The thumbnail's coordinate space. Integers throughout, so the serialized
    payload for 255 cards stays small; the SVG scales to whatever the card
    band actually is. Aspect matches the band the design specifies. */
export const PREVIEW_VIEWBOX = { width: 1000, height: 440 } as const;
const PAD_X = 46;
const PAD_Y = 44;

/** Node footprints, in multiples of the per-journey glyph unit `u`. These
    keep the Canvas's own size hierarchy (§ JourneyCanvasNodes: Action is
    Level A and the largest; Condition/Wait are Level C and deliberately
    smaller; Exit is the smallest of all), reduced to silhouettes. */
export const PREVIEW_GLYPH: Record<CanvasNodeKind, { w: number; h: number; r: number }> = {
  // r is the corner radius as a fraction of h, mirroring the Canvas's own
  // rounded-lg / rounded-2xl / rounded-full / rounded-md distinction.
  trigger: { w: 2.9, h: 1.5, r: 0.28 },
  action: { w: 3.4, h: 2.0, r: 0.2 },
  condition: { w: 3.1, h: 1.6, r: 0.42 },
  wait: { w: 3.0, h: 1.05, r: 0.5 },
  handoff: { w: 2.9, h: 1.6, r: 0.26 },
  outcome: { w: 2.9, h: 1.5, r: 0.28 },
  exit: { w: 2.5, h: 1.2, r: 0.22 },
};

export type JourneyPreview = {
  /** `[kindIndex, x, y]` per node, in PREVIEW_VIEWBOX coordinates. */
  n: readonly (readonly [number, number, number])[];
  /** Every edge as one combined SVG path (subpaths joined) - one DOM node
      for the whole connection layer instead of one per edge, which is what
      keeps 255 thumbnails cheap. */
  e: string;
  /** The glyph unit for this journey - glyph dimensions are PREVIEW_GLYPH
      multiples of it. Scales with how much room each node actually has. */
  u: number;
};

const round = (v: number) => Math.round(v);

/** The horizontal mirror of `elbowPath` in journey-canvas-layout.ts: across,
    down/up, across. Same orthogonal geometry, transposed with the rest of
    the thumbnail. */
function previewElbow(x1: number, y1: number, x2: number, y2: number, midX: number): string {
  if (Math.abs(y1 - y2) < 1) return `M${x1} ${y1}H${x2}`;
  return `M${x1} ${y1}H${midX}V${y2}H${x2}`;
}

/** A back edge (target at or before the source in depth) bows clear of the
    row it runs along instead of drawing straight back through it - the
    thumbnail-scale equivalent of the Canvas's own detour lane, which exists
    for exactly the same reason: a straight run would cross whatever sits
    between the two ends. */
function previewBackEdge(x1: number, y1: number, x2: number, y2: number, bow: number): string {
  const midX = (x1 + x2) / 2;
  const cy = Math.max(y1, y2) + bow;
  return `M${x1} ${y1}Q${midX} ${cy} ${x2} ${y2}`;
}

export function buildJourneyPreview(nodes: readonly FlowNode[]): JourneyPreview {
  const layout = layoutJourneyCanvas(nodes);

  // Transposed grid extents: depth (row) runs across, branch fan (col) runs down.
  const rows = layout.nodes.map((l) => l.row);
  const cols = layout.nodes.map((l) => l.col);
  const rowMin = Math.min(...rows);
  const rowMax = Math.max(...rows);
  const colMin = Math.min(...cols);
  const colMax = Math.max(...cols);
  const rowSpan = rowMax - rowMin;
  const colSpan = colMax - colMin;

  const availW = PREVIEW_VIEWBOX.width - PAD_X * 2;
  const availH = PREVIEW_VIEWBOX.height - PAD_Y * 2;

  /* A single-row or single-column graph has no extent on that axis and is
     centred rather than divided by zero. `cellW`/`cellH` are the rendered
     pitch between two adjacent grid steps, which is what the glyph unit is
     then derived from - so a deep journey's nodes shrink to stay clear of
     each other instead of overlapping, and a shallow one's grow to fill the
     band, with no per-journey tuning. */
  const cellW = rowSpan > 0 ? availW / rowSpan : 0;
  const cellH = colSpan > 0 ? availH / colSpan : 0;

  const xOf = (row: number) =>
    rowSpan > 0 ? PAD_X + (row - rowMin) * cellW : PREVIEW_VIEWBOX.width / 2;
  const yOf = (col: number) =>
    colSpan > 0 ? PAD_Y + (col - colMin) * cellH : PREVIEW_VIEWBOX.height / 2;

  /* The glyph unit is whatever leaves a clear gap on the tighter of the two
     axes. The fractions are the fraction of a cell a node's own footprint may
     occupy (Action, the widest at 3.4u, lands near 60% of a cell); the floor
     keeps the deepest journeys' nodes visible rather than letting them
     vanish, and the ceiling stops a three-node journey rendering as slabs. */
  const wLimit = cellW > 0 ? (cellW * 0.62) / PREVIEW_GLYPH.action.w : Infinity;
  const hLimit = cellH > 0 ? (cellH * 0.66) / PREVIEW_GLYPH.action.h : Infinity;
  const u = Math.max(9, Math.min(46, Math.min(wLimit, hLimit)));

  const placed = new Map<string, { x: number; y: number; kind: CanvasNodeKind }>();
  for (const l of layout.nodes) {
    placed.set(l.node.id, { x: xOf(l.row), y: yOf(l.col), kind: l.node.kind });
  }

  const subpaths: string[] = [];
  for (const edge of layout.edges) {
    const from = placed.get(edge.from);
    const to = placed.get(edge.to);
    if (!from || !to) continue;
    const fromHalf = (PREVIEW_GLYPH[from.kind].w * u) / 2;
    const toHalf = (PREVIEW_GLYPH[to.kind].w * u) / 2;

    if (to.x <= from.x) {
      // Back edge - bows clear rather than running back through its own row.
      subpaths.push(
        previewBackEdge(
          round(from.x),
          round(from.y + (PREVIEW_GLYPH[from.kind].h * u) / 2),
          round(to.x),
          round(to.y + (PREVIEW_GLYPH[to.kind].h * u) / 2),
          round(Math.max(u * 1.6, cellH * 0.45)),
        ),
      );
      continue;
    }
    const x1 = round(from.x + fromHalf);
    const x2 = round(to.x - toHalf);
    const midX = round((from.x + fromHalf + (to.x - toHalf)) / 2);
    subpaths.push(previewElbow(x1, round(from.y), x2, round(to.y), midX));
  }

  return {
    n: layout.nodes.map(
      (l) =>
        [KIND_INDEX.get(l.node.kind) ?? 0, round(xOf(l.row)), round(yOf(l.col))] as const,
    ),
    e: subpaths.join(""),
    u: Math.round(u * 10) / 10,
  };
}
