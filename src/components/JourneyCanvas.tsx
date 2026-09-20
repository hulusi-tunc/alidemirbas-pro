"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowRightLeft, LogOut, Maximize2, Minus, Plus, RotateCcw, Split, Workflow } from "lucide-react";

import type { FlowNode } from "@/lib/canonical-view";
import type { ChannelId } from "@/canonical/types";
import { collapsibleRouters, edgePath, type CanvasLayout, type LaidOutEdge } from "@/lib/journey-canvas-layout";
import {
  ActionCard,
  ConditionCard,
  ExitCard,
  HandoffCard,
  OutcomeCard,
  TriggerCard,
  WaitCard,
} from "@/components/ui/JourneyCanvasNodes";
import { NodeDetailPanel, type PanelLabels } from "@/components/ui/NodeDetailPanel";
import { dotGap, dotSheet } from "@/components/ui/JourneyMiniMap";

/* The graph canvas itself: pan is native scroll (so trackpad, touch and
   scrollbar dragging all work for free, on any screen size, without a
   hand-rolled drag handler), zoom is a CSS transform on the world layer,
   sized by an outer spacer so the scrollable area always matches what is
   actually on screen. A dot grid sits on the clipping container's own
   background rather than the world layer, which is what keeps it from
   visibly sliding as the graph pans - a quiet, static texture instead of an
   infinite-canvas grid, which is plenty for a graph this size and reads
   quieter regardless (§11 of the grammar: "considerably quieter than
   classic CRM builder interfaces"). */

export type CanvasLabels = PanelLabels & {
  entry: string;
  zoomIn: string;
  zoomOut: string;
  fitToView: string;
  reset: string;
};

// Below this container width the canvas gets the mobile treatment: a fixed
// readable zoom instead of a shrink-to-contain fit. 640px is Tailwind's own
// `sm` breakpoint, reused here rather than inventing a second one.
const MOBILE_BREAKPOINT = 640;
// A fit-to-CONTAIN zoom (both dimensions fully visible, no scrolling) is
// the wrong instinct for a tall top-to-bottom flowchart: it shrinks the
// whole graph to whatever the SHORTER dimension allows, which is how the
// desktop view ended up reading as mostly empty canvas around a small
// graph. 0.7 is a deliberate floor, tuned so ACQ-01's own width comes
// close to filling the canvas at 1440px with no horizontal scroll, while
// vertical scrolling still reaches the rest of a tall journey - which is
// exactly what the scrollable canvas is for.
const DESKTOP_MIN_ZOOM = 0.7;
// Fixed rather than fit-computed (§ mobile: "do not squeeze the desktop
// graph to 375px") - the same card sizes as desktop, just requiring
// horizontal pan to reach a branch that doesn't fit in one screen width.
const MOBILE_ZOOM = 0.78;
const MAX_ZOOM = 1.6;

/* The frame's own height, derived from the journey rather than fixed.

   A single hard-coded canvas height is wrong for a library where the laid-out
   graphs run from 890px to 3820px tall. Measured across all 281: only 14 are
   short enough to fit a frame of any sane size at the floor zoom, so a fixed
   frame is not "sometimes too small" - it is dead space under those 14 and a
   crop for the other 267. The frame therefore asks for the height the graph
   would actually occupy at DESKTOP_MIN_ZOOM, and the clamp decides what it
   gets: short journeys shrink the frame to their own bounds instead of
   floating in it, everything taller pins to FRAME_MAX and pans, which is what
   the scrollable canvas is for.

   FRAME_MAX is a co-limit with the `max-h-[78vh]` below, not a duplicate of
   it: the pixel cap keeps the figure from turning into a full-bleed workspace
   on a tall monitor, the viewport cap keeps it from pushing the reusable rule
   below the fold on a short one, and whichever binds first wins. */
const FRAME_MIN = 460;
const FRAME_MAX = 880;
const FRAME_BREATHING = 24;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export default function JourneyCanvas({
  nodes,
  layout,
  basePath,
  labels,
  caption,
  messageLabels = [],
  humanLabels = [],
  mode = "figure",
  shape = [],
}: {
  nodes: readonly FlowNode[];
  /** The graph as laid out by the server (`layoutJourneyCanvas`, ELK) -
      the layout engine is asynchronous and server-only, so the client
      island receives coordinates, never computes them. A laid-out node is
      keyed by its `layoutId` (a shared exit is drawn once per parent) and
      opens the detail panel by its `canonicalNodeId`. */
  layout: CanvasLayout;
  basePath: string;
  labels: CanvasLabels;
  /** The journey's shape in counts, one entry per kind present, for the
      page canvas's legend. */
  shape?: readonly { kind: "nodes" | "decisions" | "exits" | "handoffs"; label: string }[];
  /** `figure` (default): the framed, scrolling plate inside a document.
      `page`: the free canvas - fills whatever box it is given, pans by
      dragging or wheel, zooms about the cursor with ctrl/pinch, the dot grid
      moving with the world (Hulusi, 2026-09-13: "a full-page free canvas
      like FigJam"). Same nodes, same edges, same detail panel. */
  mode?: "figure" | "page";
  /** The figure's caption - the journey's own shape in counts, composed and
      localised by the server. Optional so a caller with nothing to say (the
      QA sweep route) gets a bare control bar rather than an empty line. */
  caption?: string;
  /** The journey's message-delivery surfaces and its human routes, localised
      and ordered by the server. Each is named only on the node kind it
      applies to; both default to none, so a caller with no channels to pass
      is a valid caller rather than a type error. */
  messageLabels?: readonly { id: ChannelId; label: string }[];
  humanLabels?: readonly { id: ChannelId; label: string }[];
}) {
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const actionSequence = useMemo(() => actionSequenceOf(nodes), [nodes]);
  /* The channel-selecting action a message/human card absorbed on the
     canvas (see journey-canvas-layout.ts's own collapse - same detection,
     reused rather than re-derived) - still a real FlowNode, just not laid
     out as its own box. Keyed by the MESSAGE's id, so opening that card can
     hand the detail panel the router's own full priority/fallback prose
     alongside its own, which is the "still reachable from the detail
     panel" half of the collapse. */
  const collapsedRouterOf = useMemo(() => {
    const collapsed = collapsibleRouters(nodes, byId);
    const inverse = new Map<string, FlowNode>();
    for (const [routerId, messageId] of collapsed) {
      const router = byId.get(routerId);
      if (router) inverse.set(messageId, router);
    }
    return inverse;
  }, [nodes, byId]);

  /* Computed during render from `layout`, which is deterministic for a given
     journey - so the server and the first client paint agree on the frame's
     height and it never resizes under the reader after hydration. */
  const frameHeight = clamp(
    Math.round(layout.height * DESKTOP_MIN_ZOOM + FRAME_BREATHING),
    FRAME_MIN,
    FRAME_MAX,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedNode = selectedId ? (byId.get(selectedId) ?? null) : null;
  const selectedRouter = selectedId ? (collapsedRouterOf.get(selectedId) ?? null) : null;

  const isMobile = () => (containerRef.current?.clientWidth ?? 0) < MOBILE_BREAKPOINT;

  /* The DEFAULT view - mount, and "Reset." Mobile gets a fixed readable
     zoom rather than a shrink-to-contain fit (§ mobile: never squeeze the
     desktop graph down to fit 375px); desktop gets a real fit-to-contain
     but floored well above where the first pass sat, which is what was
     reading as mostly-empty canvas around a small graph. */
  const initialZoom = () => {
    const el = containerRef.current;
    if (!el) return 1;
    if (isMobile()) return MOBILE_ZOOM;
    const fit = Math.min(el.clientWidth / layout.width, el.clientHeight / layout.height);
    return clamp(fit, DESKTOP_MIN_ZOOM, MAX_ZOOM);
  };

  /* Desktop centers the graph on its own bounds (horizontally exact,
     starting at the very top so the trigger's own entry pin is never
     scrolled past). Mobile instead centers on the TRIGGER's own column -
     the main path - leaving branches that fan out sideways just
     off-screen, reachable by the horizontal pan the canvas already
     supports natively.

     Centering on the full bounding box only keeps that "never scrolled
     past" promise when the entry sits near the box's own horizontal
     midpoint - true for the overwhelming majority of journeys, but a
     journey whose fan-out grows lopsided (most of the width added on one
     side of a mostly-linear entry column) can push the bbox midpoint far
     enough from the entry that the naive centering scrolls the entry pin
     fully out of view on load. The clamp below keeps the same bbox-centered
     framing whenever it already contains the entry, and only pulls the
     scroll position toward the entry - never further than needed - when it
     wouldn't. */
  const centerInitial = (z: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = 0;
    const entry = layout.nodes.find((l) => l.node.isEntry) ?? layout.nodes[0];
    if (isMobile()) {
      el.scrollLeft = Math.max(0, entry.x * z - el.clientWidth * 0.32);
      return;
    }
    const centered = (layout.width * z - el.clientWidth) / 2;
    const entryScreenX = entry.x * z;
    const margin = Math.min(48, el.clientWidth / 4);
    const minScroll = entryScreenX - el.clientWidth + margin;
    const maxScroll = entryScreenX - margin;
    el.scrollLeft = Math.min(Math.max(centered, minScroll), maxScroll);
  };

  // Set once on mount, when the container's real size is known. Deferred to
  // a rAF callback rather than called synchronously in the effect body,
  // which is the one part of this that reacts to a real external system
  // (the container's laid-out size) rather than to React state. Depends
  // only on `layout` (stable across re-renders of this same journey) - it
  // must NOT re-run when a node is selected, which is what keeps the
  // camera exactly where the reader left it while the detail panel is
  // open, and exactly where they left it again once it closes. */
  useLayoutEffect(() => {
    const raf = requestAnimationFrame(() => {
      const z = initialZoom();
      setZoom(z);
      centerInitial(z);
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  const zoomBy = (factor: number) => {
    const el = containerRef.current;
    if (!el) return;
    const cx = el.scrollLeft + el.clientWidth / 2;
    const cy = el.scrollTop + el.clientHeight / 2;
    const worldX = cx / zoom;
    const worldY = cy / zoom;
    const floor = isMobile() ? MOBILE_ZOOM * 0.7 : DESKTOP_MIN_ZOOM * 0.55;
    const next = clamp(zoom * factor, floor, MAX_ZOOM);
    setZoom(next);
    requestAnimationFrame(() => {
      el.scrollLeft = worldX * next - el.clientWidth / 2;
      el.scrollTop = worldY * next - el.clientHeight / 2;
    });
  };

  const reset = () => {
    const z = initialZoom();
    setZoom(z);
    requestAnimationFrame(() => centerInitial(z));
  };

  /* Unlike Reset, an explicit "Fit to view" press really does mean show
     the whole graph, even on mobile - a deliberate request to see
     everything at once is different from the automatic default this
     round's feedback asked to stop shrinking down. */
  const fitToView = () => {
    const el = containerRef.current;
    if (!el) return;
    const z = clamp(Math.min(el.clientWidth / layout.width, el.clientHeight / layout.height, 1), 0.35, MAX_ZOOM);
    setZoom(z);
    requestAnimationFrame(() => {
      el.scrollLeft = (layout.width * z - el.clientWidth) / 2;
      el.scrollTop = 0;
    });
  };

  /* The world: edges and node cards in layout coordinates. Both modes scale
     this same block; only the camera around it differs - and the Info
     page's preview (ui/JourneyMiniMap.tsx) renders the very same block,
     so the preview IS the canvas, not a drawing of it. */
  /* THE LEGEND AS A NAVIGATOR (Hulusi, 2026-09-20: "is the thing at the
     bottom necessary? if we keep it, make it useful"): pressing a kind in
     the legend spotlights every node of that kind - the rest sit back -
     and flies the camera to the first one; pressing again steps to the
     next, with the count shown as "2/5"; pressing "nodes" clears the
     spotlight and returns home. */
  const [spot, setSpot] = useState<{ kind: LegendKind; index: number } | null>(null);
  /* The spotlit nodes of a kind, one per canonical node: a shared exit is
     drawn once per parent, so the step count would otherwise say 15 where
     the legend says 5. The first drawn instance stands for each. */
  const spotNodes = useMemo(() => {
    if (!spot || spot.kind === "nodes") return [];
    const nodeKind = SPOT_KIND[spot.kind];
    const seen = new Set<string>();
    return layout.nodes.filter((l) => {
      if (l.node.kind !== nodeKind || seen.has(l.canonicalNodeId)) return false;
      seen.add(l.canonicalNodeId);
      return true;
    });
  }, [spot, layout]);
  const spotKind = spot && spot.kind !== "nodes" ? SPOT_KIND[spot.kind] : null;
  const flyTo = useMemo(() => {
    if (!spot) return null;
    if (spot.kind === "nodes") return { key: "home", x: 0, y: 0 };
    const l = spotNodes[spot.index];
    return l ? { key: `${spot.kind}-${spot.index}`, x: l.x, y: l.y + l.height / 2 } : null;
  }, [spot, spotNodes]);
  const onLegend = (kind: LegendKind) => {
    if (kind === "nodes") {
      setSpot({ kind, index: 0 });
      return;
    }
    const count = new Set(layout.nodes.filter((l) => l.node.kind === SPOT_KIND[kind]).map((l) => l.canonicalNodeId)).size;
    setSpot((prev) => (prev && prev.kind === kind ? { kind, index: (prev.index + 1) % count } : { kind, index: 0 }));
  };

  const world: ReactNode = (
    <JourneyWorld
      layout={layout}
      actionSequence={actionSequence}
      labels={labels}
      messageLabels={messageLabels}
      humanLabels={humanLabels}
      onOpen={(canonicalNodeId) => setSelectedId(canonicalNodeId)}
      focusId={selectedId}
      spotKind={spotKind}
    />
  );

  if (mode === "page") {
    return (
      <FreeCanvas
        layout={layout}
        world={world}
        labels={labels}
        caption={caption}
        shape={shape}
        spot={spot ? { kind: spot.kind, index: spot.index, count: spotNodes.length } : null}
        onLegend={onLegend}
        flyTo={flyTo}
        basePath={basePath}
        selectedNode={selectedNode}
        selectedRouter={selectedRouter}
        onClose={() => setSelectedId(null)}
      />
    );
  }

  return (
    /* The figure: one framed plate carrying the graph, with a caption bar
       ruled off underneath it. The stage below is its own positioning
       context so the detail panel spans the graph exactly and stops at the
       caption rather than floating over it. */
    <figure className="m-0 overflow-hidden rounded-lg border border-line-soft bg-paper">
      <div className="relative">
        <div
          ref={containerRef}
          style={{ height: frameHeight }}
          className="relative max-h-[78vh] min-h-[380px] w-full overflow-auto bg-paper-soft"
        >
          {/* The scroll spacer, sized to the graph's own scaled bounds so the
              scrollable area always matches what is actually drawn. Centred
              rather than flush-left: measured across the library, 236 of 281
              journeys are narrower than this frame at the floor zoom, and
              left-aligning them piled every pixel of the slack into one
              margin - the graph hugging one edge with a quarter of the plate
              empty beside it. Auto margins resolve to zero the moment the
              graph is wider than the frame, so the journeys that do pan are
              untouched. */}
          <div
            style={{ width: layout.width * zoom, height: layout.height * zoom, marginInline: "auto" }}
            className="relative"
          >
            <div
              style={{ width: layout.width, height: layout.height, transform: `scale(${zoom})`, transformOrigin: "top left" }}
              className="relative"
            >
              {world}
            </div>
          </div>
        </div>

        {/* Rendered as a sibling of the scrollable canvas, not a child of it -
            living inside the `overflow-auto` element made closing it reset
            the canvas's own scrollTop (the panel's exit animation briefly
            changed that element's own scrollable bounds, and the browser
            committed the clamped value). Positioned against the stage that
            wraps them both, it still overlays exactly the same visible area. */}
        <NodeDetailPanel node={selectedNode} collapsedRouter={selectedRouter} basePath={basePath} labels={labels} onClose={() => setSelectedId(null)} />
      </div>

      {/* The caption bar. It states what the figure contains and carries the
          camera controls, which used to float over the bottom-right of the
          graph itself; down here they stop overlapping nodes, stop needing to
          out-stack the detail panel, and read as apparatus rather than as
          part of the drawing. Deliberately not a legend: node kinds are named
          on the cards themselves, and a permanent key would be four more
          things competing with the graph on every journey page. */}
      <figcaption className="flex items-center justify-between gap-4 border-t border-line-soft px-3 py-1.5">
        {caption ? (
          <p className="min-w-0 truncate font-mono text-[11px] text-ink-400 tabular-nums">{caption}</p>
        ) : (
          <span />
        )}
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.25)}
            aria-label={labels.zoomOut}
            className="grid size-7 place-items-center rounded-full text-ink-500 transition-colors hover:bg-paper-soft hover:text-ink-900"
          >
            <Minus aria-hidden className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1.25)}
            aria-label={labels.zoomIn}
            className="grid size-7 place-items-center rounded-full text-ink-500 transition-colors hover:bg-paper-soft hover:text-ink-900"
          >
            <Plus aria-hidden className="size-3.5" />
          </button>
          <span aria-hidden className="mx-0.5 h-4 w-px bg-line" />
          <button
            type="button"
            onClick={fitToView}
            aria-label={labels.fitToView}
            className="grid size-7 place-items-center rounded-full text-ink-500 transition-colors hover:bg-paper-soft hover:text-ink-900"
          >
            <Maximize2 aria-hidden className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={reset}
            aria-label={labels.reset}
            className="grid size-7 place-items-center rounded-full text-ink-500 transition-colors hover:bg-paper-soft hover:text-ink-900"
          >
            <RotateCcw aria-hidden className="size-3.5" />
          </button>
        </div>
      </figcaption>
    </figure>
  );
}

/** The graph itself - the edges as one SVG and a positioned card per laid-out
    node - in layout coordinates, with no camera. Exported so the Info page's
    preview can show the real thing. */
export function JourneyWorld({
  layout,
  actionSequence,
  labels,
  messageLabels = [],
  humanLabels = [],
  onOpen,
  focusId = null,
  spotKind = null,
}: {
  layout: CanvasLayout;
  actionSequence: ReadonlyMap<string, number>;
  labels: CanvasLabels;
  messageLabels?: readonly { id: ChannelId; label: string }[];
  humanLabels?: readonly { id: ChannelId; label: string }[];
  onOpen: (canonicalNodeId: string) => void;
  /** A node whose routes stay lit while its detail panel is open. */
  focusId?: string | null;
  /** A kind to spotlight: every other card and every line sit back. */
  spotKind?: FlowNode["kind"] | null;
}) {
  /* TRACING (Hulusi, 2026-09-20: "two lines come in and we cannot
     understand which one goes where"): resting the pointer on a card - or
     opening it - lights every route into and out of it in brand blue and
     sits the rest back, so a line is followed by pointing at either end. */
  const [hoverId, setHoverId] = useState<string | null>(null);
  const focus = hoverId ?? focusId;
  const hi = (e: LaidOutEdge) => (focus ? (e.canonicalFrom === focus || e.canonicalTo === focus ? "on" : "off") : undefined);
  return (
    <>
      <svg
        width={layout.width}
        height={layout.height}
        style={{ opacity: spotKind ? 0.3 : 1 }}
        className="pointer-events-none absolute inset-0 transition-opacity duration-[var(--duration-fast)]"
        aria-hidden
      >
        {layout.edges.map((e) => (
          <EdgeShape key={e.id} edge={e} hi={hi(e)} />
        ))}
      </svg>

      {layout.nodes.map((l) => {
        const n = l.node;
        const open = () => onOpen(l.canonicalNodeId);
        return (
          <div
            key={l.layoutId}
            data-canvas-node-id={n.id}
            data-canvas-layout-id={l.layoutId}
            data-canvas-node-kind={n.kind}
            style={{ left: l.x - l.width / 2, top: l.y, width: l.width, height: l.height, opacity: spotKind && n.kind !== spotKind ? 0.25 : 1 }}
            className="absolute transition-opacity duration-[var(--duration-fast)]"
            onPointerEnter={() => setHoverId(l.canonicalNodeId)}
            onPointerLeave={() => setHoverId(null)}
          >
            {n.kind === "trigger" ? (
              <TriggerCard node={n} onOpen={open} entryLabel={labels.entry} lang={labels.lang} />
            ) : n.kind === "action" ? (
              <ActionCard
                node={n}
                sequence={actionSequence.get(n.id) ?? 1}
                onOpen={open}
                messageLabels={messageLabels}
                humanLabels={humanLabels}
                lang={labels.lang}
              />
            ) : n.kind === "condition" ? (
              <ConditionCard node={n} onOpen={open} lang={labels.lang} />
            ) : n.kind === "wait" ? (
              <WaitCard node={n} onOpen={open} />
            ) : n.kind === "handoff" ? (
              <HandoffCard node={n} onOpen={open} lang={labels.lang} />
            ) : n.kind === "outcome" ? (
              <OutcomeCard node={n} onOpen={open} lang={labels.lang} />
            ) : (
              <ExitCard node={n} onOpen={open} terminalLabel={labels.terminal} lang={labels.lang} />
            )}
          </div>
        );
      })}

      {/* The arrowheads, on a layer above the cards: a route's end used to
          hide under the card it entered. */}
      <svg width={layout.width} height={layout.height} style={{ opacity: spotKind ? 0.3 : 1 }} className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-[var(--duration-fast)]" aria-hidden>
        {layout.edges.map((e) => (
          <EdgeArrow key={e.id} edge={e} hi={hi(e)} />
        ))}
      </svg>
    </>
  );
}

/** The action numbering the cards show ("Message · 03"): the order the
    journey lists its actions in. Shared with the preview. */
export function actionSequenceOf(nodes: readonly FlowNode[]): ReadonlyMap<string, number> {
  const map = new Map<string, number>();
  let i = 0;
  for (const n of nodes) if (n.kind === "action") map.set(n.id, ++i);
  return map;
}

/* An orthogonal route drawn with rounded bends (Hulusi, 2026-09-20: "the
   lines are so sharp"): every interior corner becomes a quadratic arc of
   up to 12px, shortened where a segment is too short to carry it. */
const BEND = 12;
function roundedEdgePath(points: readonly { x: number; y: number }[]): string {
  if (points.length < 3) return edgePath(points);
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1];
    const b = points[i];
    const c = points[i + 1];
    const inLen = Math.hypot(b.x - a.x, b.y - a.y);
    const outLen = Math.hypot(c.x - b.x, c.y - b.y);
    const r = Math.min(BEND, inLen / 2, outLen / 2);
    if (r < 1 || inLen === 0 || outLen === 0) {
      d += ` L ${b.x} ${b.y}`;
      continue;
    }
    const p1 = { x: b.x - ((b.x - a.x) / inLen) * r, y: b.y - ((b.y - a.y) / inLen) * r };
    const p2 = { x: b.x + ((c.x - b.x) / outLen) * r, y: b.y + ((c.y - b.y) / outLen) * r };
    d += ` L ${p1.x} ${p1.y} Q ${b.x} ${b.y} ${p2.x} ${p2.y}`;
  }
  const last = points[points.length - 1];
  return `${d} L ${last.x} ${last.y}`;
}

function EdgeShape({ edge, hi }: { edge: LaidOutEdge; hi?: "on" | "off" }) {
  const d = roundedEdgePath(edge.points);
  return (
    <g
      data-canvas-edge-from={edge.canonicalFrom}
      data-canvas-edge-to={edge.canonicalTo}
      data-canvas-edge-label={edge.label ?? ""}
      data-hi={hi}
      className="group transition-opacity duration-[var(--duration-fast)] data-[hi=off]:opacity-25"
    >
      {/* The halo: a ground-coloured stroke under the line, so where two
          routes cross the one drawn later visibly passes over the other
          instead of merging into it ("I am not sure where it is going"). */}
      <path d={d} fill="none" className="stroke-paper-soft" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path
        d={d}
        fill="none"
        className="stroke-ink-300 transition-[stroke] duration-[var(--duration-fast)] group-data-[hi=on]:stroke-primary-600"
        strokeWidth={hi === "on" ? 2.5 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {edge.label ? (
        <foreignObject
          x={edge.labelX - 100}
          y={edge.labelY - 12}
          width={200}
          height={24}
          className="overflow-visible"
        >
          <div className="flex justify-center [[data-lod=far]_&]:hidden">
            <span className="rounded-full bg-paper px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-ink-700 ring-1 ring-ink-950/[0.08] group-data-[hi=on]:text-primary-700 group-data-[hi=on]:ring-primary-300">
              {edge.label}
            </span>
          </div>
        </foreignObject>
      ) : null}
    </g>
  );
}

/** The arrowhead alone, at a route's end, pointed along its last segment -
    drawn on the layer above the cards. */
function EdgeArrow({ edge, hi }: { edge: LaidOutEdge; hi?: "on" | "off" }) {
  const pts = edge.points;
  if (pts.length < 2) return null;
  const end = pts[pts.length - 1];
  const prev = pts[pts.length - 2];
  const angle = (Math.atan2(end.y - prev.y, end.x - prev.x) * 180) / Math.PI;
  return (
    <g data-canvas-edge-from={edge.canonicalFrom} data-canvas-edge-to={edge.canonicalTo} data-hi={hi} className="group transition-opacity duration-[var(--duration-fast)] data-[hi=off]:opacity-25">
      <path
        d="M -8 -4.5 L 1 0 L -8 4.5 Z"
        transform={`translate(${end.x} ${end.y}) rotate(${angle})`}
        className="fill-ink-400 transition-[fill] duration-[var(--duration-fast)] group-data-[hi=on]:fill-primary-600"
      />
    </g>
  );
}


/* THE FREE CANVAS. The world layer carries one transform - translate then
   scale - and the camera lives in a ref, written straight to the DOM on
   every move; React state changes only for the zoom readout. The dot grid
   sits on the stage's own background but moves and scales with the world,
   which is what makes it read as an endless sheet rather than a framed
   plate. Drag anywhere to pan (a drag over a card pans too, and swallows
   the click that would have opened it); the wheel pans, ctrl/meta + wheel
   - which is how a trackpad pinch arrives - zooms about the cursor. Fit is
   the default view: the whole graph, centred, with breathing room. */
type LegendKind = "nodes" | "decisions" | "exits" | "handoffs";
const SPOT_KIND: Record<Exclude<LegendKind, "nodes">, FlowNode["kind"]> = { decisions: "condition", exits: "exit", handoffs: "handoff" };

const LEGEND = {
  nodes: { icon: <Workflow aria-hidden />, tint: "bg-paper-soft text-ink-700" },
  decisions: { icon: <Split aria-hidden />, tint: "bg-violet-50 text-violet-700" },
  exits: { icon: <LogOut aria-hidden />, tint: "bg-paper-soft text-ink-500" },
  handoffs: { icon: <ArrowRightLeft aria-hidden />, tint: "bg-indigo-50 text-indigo-700" },
} as const;

const PAGE_MIN_ZOOM = 0.2;
const PAGE_MAX_ZOOM = 2;

function FreeCanvas({
  layout,
  world,
  labels,
  caption,
  shape,
  spot,
  onLegend,
  flyTo,
  basePath,
  selectedNode,
  selectedRouter,
  onClose,
}: {
  layout: CanvasLayout;
  world: ReactNode;
  labels: CanvasLabels;
  caption?: string;
  shape: readonly { kind: LegendKind; label: string }[];
  spot: { kind: LegendKind; index: number; count: number } | null;
  onLegend: (kind: LegendKind) => void;
  /** Where the legend asked the camera to go: a world point to centre, or
      "home". */
  flyTo: { key: string; x: number; y: number } | null;
  basePath: string;
  selectedNode: FlowNode | null;
  selectedRouter: FlowNode | null;
  onClose: () => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const camera = useRef({ x: 0, y: 0, z: 1 });
  const [zoomPct, setZoomPct] = useState(100);

  const apply = () => {
    const stage = stageRef.current;
    const w = worldRef.current;
    const { x, y, z } = camera.current;
    if (w) {
      w.style.transform = `translate(${x}px, ${y}px) scale(${z})`;
      w.dataset.lod = z < 0.45 ? "far" : "near";
    }
    if (stage) {
      // FigJam's sheet: one fine dot every 24 world px, moving with the
      // world, doubling its gap as the world zooms out so it never crowds
      // (Hulusi, 2026-09-20). Drawn as an SVG pattern so it stays crisp on
      // a 2x display - see dotSheet in ui/JourneyMiniMap.tsx.
      stage.style.backgroundImage = dotSheet(z);
      stage.style.backgroundSize = `${dotGap(z) * z}px ${dotGap(z) * z}px`;
      stage.style.backgroundPosition = `${x}px ${y}px`;
    }
    setZoomPct(Math.round(z * 100));
  };

  /* Fit: the whole graph, centred, with breathing room - the "show me
     everything" press. */
  const fit = () => {
    const stage = stageRef.current;
    if (!stage || !stage.clientWidth) return;
    const pad = 64;
    const z = clamp(Math.min((stage.clientWidth - pad * 2) / layout.width, (stage.clientHeight - pad * 2) / layout.height, 1), PAGE_MIN_ZOOM, PAGE_MAX_ZOOM);
    camera.current = {
      x: (stage.clientWidth - layout.width * z) / 2,
      y: Math.max(pad, (stage.clientHeight - layout.height * z) / 2),
      z,
    };
    apply();
  };

  /* The default view, and Reset: a READABLE zoom with the entry card at the
     top centre, the rest reachable by panning - a fit-to-contain of a tall
     graph lands at 20% and reads as confetti. Phones get the figure mode's
     own fixed zoom; desktops a fit floored well above unreadable. */
  const home = () => {
    const stage = stageRef.current;
    if (!stage || !stage.clientWidth) return;
    const mobile = stage.clientWidth < MOBILE_BREAKPOINT;
    const fitZ = Math.min((stage.clientWidth - 48) / layout.width, (stage.clientHeight - 48) / layout.height);
    const z = mobile ? MOBILE_ZOOM : clamp(fitZ, 0.6, 1);
    const entry = layout.nodes.find((l) => l.node.isEntry) ?? layout.nodes[0];
    // 6rem down: clear of the floating bar the page shell lays over the top.
    camera.current = {
      x: stage.clientWidth / 2 - entry.x * z,
      y: 96 - entry.y * z,
      z,
    };
    apply();
  };

  const zoomAt = (factor: number, px: number, py: number) => {
    const { x, y, z } = camera.current;
    const next = clamp(z * factor, PAGE_MIN_ZOOM, PAGE_MAX_ZOOM);
    const k = next / z;
    camera.current = { x: px - (px - x) * k, y: py - (py - y) * k, z: next };
    apply();
  };

  const zoomCentre = (factor: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    zoomAt(factor, stage.clientWidth / 2, stage.clientHeight / 2);
  };

  // The legend's request: centre the spotlit node at a readable zoom, or go
  // home when the spotlight clears.
  useEffect(() => {
    const stage = stageRef.current;
    if (!flyTo || !stage) return;
    if (flyTo.key === "home") {
      home();
      return;
    }
    const z = Math.max(camera.current.z, 0.7);
    camera.current = { x: stage.clientWidth / 2 - flyTo.x * z, y: stage.clientHeight / 2 - flyTo.y * z, z };
    apply();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyTo]);

  useLayoutEffect(() => {
    const raf = requestAnimationFrame(home);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    /* The canvas lives on a tab: at mount it may be `hidden` (zero size),
       so the first real size it gets is when the tab opens - home then. */
    let hadSize = stage.clientWidth > 0;
    const ro = new ResizeObserver(() => {
      const has = stage.clientWidth > 0;
      if (has && !hadSize) home();
      hadSize = has;
    });
    ro.observe(stage);
    let dragging = false;
    let moved = false;
    let lastX = 0;
    let lastY = 0;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      dragging = true;
      moved = false;
      lastX = e.clientX;
      lastY = e.clientY;
      stage.setPointerCapture(e.pointerId);
      stage.classList.add("cursor-grabbing");
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
      lastX = e.clientX;
      lastY = e.clientY;
      camera.current = { ...camera.current, x: camera.current.x + dx, y: camera.current.y + dy };
      apply();
    };
    const onUp = () => {
      dragging = false;
      stage.classList.remove("cursor-grabbing");
    };
    // A drag that ends over a card must not open it.
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
        moved = false;
      }
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = stage.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) {
        zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX - rect.left, e.clientY - rect.top);
      } else {
        camera.current = { ...camera.current, x: camera.current.x - e.deltaX, y: camera.current.y - e.deltaY };
        apply();
      }
    };
    const onResize = () => home();
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerup", onUp);
    stage.addEventListener("pointercancel", onUp);
    stage.addEventListener("click", onClick, true);
    stage.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerup", onUp);
      stage.removeEventListener("pointercancel", onUp);
      stage.removeEventListener("click", onClick, true);
      stage.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  const control = "grid size-9 place-items-center rounded-full text-ink-600 transition-colors duration-[var(--duration-fast)] hover:bg-paper-soft hover:text-ink-950";

  return (
    <div className="relative h-full w-full">
      <div
        ref={stageRef}
        className="absolute inset-0 cursor-grab touch-none overflow-hidden bg-paper-soft select-none"
        aria-label={caption}
      >
        {/* No `will-change: transform` here on purpose: it pins the world to a
            raster made at 100% and merely scales that bitmap, which is why
            zooming in read as blurry (Hulusi, 2026-09-20). Without it the
            browser re-rasterises at the current zoom once the camera settles,
            so text and edges stay crisp at 200%. */}
        <div ref={worldRef} style={{ width: layout.width, height: layout.height, transformOrigin: "0 0" }} className="absolute top-0 left-0">
          {world}
        </div>
      </div>
      <NodeDetailPanel node={selectedNode} collapsedRouter={selectedRouter} basePath={basePath} labels={labels} onClose={onClose} />
      {/* The legend: the journey's shape as icon tiles with counts, in the
          kinds' own colours - a key to the drawing, centred at the bottom
          where a map keeps its key. */}
      {shape.length > 0 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-paper/95 p-1 shadow-[0_12px_30px_-16px_rgb(10_16_32/0.35)] ring-1 ring-ink-950/[0.06]">
          {shape.map((item) => {
            const on = spot?.kind === item.kind && item.kind !== "nodes";
            return (
              <button
                key={item.kind}
                type="button"
                onClick={() => onLegend(item.kind)}
                aria-pressed={on}
                className={`flex h-9 items-center gap-1.5 rounded-full py-1 pr-3 pl-1 text-sm tabular-nums transition-colors duration-[var(--duration-fast)] ${
                  on ? "bg-ink-950 text-white" : "text-ink-700 hover:bg-paper-soft hover:text-ink-950"
                }`}
              >
                <span aria-hidden className={`grid size-7 place-items-center rounded-full ${on ? "bg-white/15 text-white" : LEGEND[item.kind].tint} [&>svg]:size-3.5`}>{LEGEND[item.kind].icon}</span>
                {item.label}
                {on && spot ? <span className="text-white/70">{spot.index + 1}/{spot.count}</span> : null}
              </button>
            );
          })}
        </div>
      )}
      <div className="absolute right-4 bottom-4 flex items-center gap-0.5 rounded-full bg-paper/95 p-1 ring-1 ring-ink-950/[0.06] shadow-[0_12px_30px_-16px_rgb(10_16_32/0.35)]">
        <button type="button" onClick={() => zoomCentre(1 / 1.25)} aria-label={labels.zoomOut} className={control}>
          <Minus aria-hidden className="size-4" />
        </button>
        <span className="min-w-[3.25rem] text-center text-sm text-ink-600 tabular-nums">{zoomPct}%</span>
        <button type="button" onClick={() => zoomCentre(1.25)} aria-label={labels.zoomIn} className={control}>
          <Plus aria-hidden className="size-4" />
        </button>
        <span aria-hidden className="mx-1 h-5 w-px bg-line" />
        <button type="button" onClick={fit} aria-label={labels.fitToView} className={control}>
          <Maximize2 aria-hidden className="size-4" />
        </button>
        <button type="button" onClick={home} aria-label={labels.reset} className={control}>
          <RotateCcw aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  );
}
