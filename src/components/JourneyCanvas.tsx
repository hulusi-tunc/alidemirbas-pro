"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minus, Plus, RotateCcw } from "lucide-react";

import type { FlowNode } from "@/lib/canonical-view";
import { elbowPath, layoutJourneyCanvas, type LaidOutEdge } from "@/lib/journey-canvas-layout";
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
  basePath,
  labels,
  caption,
  messageLabels = [],
  humanLabels = [],
}: {
  nodes: readonly FlowNode[];
  basePath: string;
  labels: CanvasLabels;
  /** The figure's caption - the journey's own shape in counts, composed and
      localised by the server. Optional so a caller with nothing to say (the
      QA sweep route) gets a bare control bar rather than an empty line. */
  caption?: string;
  /** The journey's message-delivery surfaces and its human routes, localised
      and ordered by the server. Each is named only on the node kind it
      applies to; both default to none, so a caller with no channels to pass
      is a valid caller rather than a type error. */
  messageLabels?: readonly string[];
  humanLabels?: readonly string[];
}) {
  const layout = useMemo(() => layoutJourneyCanvas(nodes), [nodes]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);
  const actionSequence = useMemo(() => {
    const map = new Map<string, number>();
    let i = 0;
    for (const n of nodes) if (n.kind === "action") map.set(n.id, ++i);
    return map;
  }, [nodes]);

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
          className="altor-dot-grid relative max-h-[78vh] min-h-[380px] w-full overflow-auto bg-paper-soft"
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
              <svg
                width={layout.width}
                height={layout.height}
                className="pointer-events-none absolute inset-0"
                aria-hidden
              >
                <defs>
                  <marker id="journey-arrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
                    <path d="M0,0 L7,3.5 L0,7 Z" className="fill-ink-300" />
                  </marker>
                </defs>
                {layout.edges.map((e) => (
                  <EdgeShape key={e.id} edge={e} />
                ))}
              </svg>

              {layout.nodes.map((l) => {
                const n = l.node;
                const onOpen = () => setSelectedId(n.id);
                return (
                  <div
                    key={n.id}
                    data-canvas-node-id={n.id}
                    data-canvas-node-kind={n.kind}
                    style={{ left: l.x - l.width / 2, top: l.y, width: l.width, height: l.height }}
                    className="absolute"
                  >
                    {n.kind === "trigger" ? (
                      <TriggerCard node={n} onOpen={onOpen} entryLabel={labels.entry} />
                    ) : n.kind === "action" ? (
                      <ActionCard
                        node={n}
                        sequence={actionSequence.get(n.id) ?? 1}
                        onOpen={onOpen}
                        messageLabels={messageLabels}
                        humanLabels={humanLabels}
                      />
                    ) : n.kind === "condition" ? (
                      <ConditionCard node={n} onOpen={onOpen} />
                    ) : n.kind === "wait" ? (
                      <WaitCard node={n} onOpen={onOpen} />
                    ) : n.kind === "handoff" ? (
                      <HandoffCard node={n} onOpen={onOpen} />
                    ) : n.kind === "outcome" ? (
                      <OutcomeCard node={n} onOpen={onOpen} />
                    ) : (
                      <ExitCard node={n} onOpen={onOpen} terminalLabel={labels.terminal} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Rendered as a sibling of the scrollable canvas, not a child of it -
            living inside the `overflow-auto` element made closing it reset
            the canvas's own scrollTop (the panel's exit animation briefly
            changed that element's own scrollable bounds, and the browser
            committed the clamped value). Positioned against the stage that
            wraps them both, it still overlays exactly the same visible area. */}
        <NodeDetailPanel node={selectedNode} basePath={basePath} labels={labels} onClose={() => setSelectedId(null)} />
      </div>

      {/* The caption bar. It states what the figure contains and carries the
          camera controls, which used to float over the bottom-right of the
          graph itself; down here they stop overlapping nodes, stop needing to
          out-stack the detail panel, and read as apparatus rather than as
          part of the drawing. Deliberately not a legend: node kinds are named
          on the cards themselves, and a permanent key would be four more
          things competing with the graph on every one of 281 pages. */}
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

function EdgeShape({ edge }: { edge: LaidOutEdge }) {
  const d = elbowPath(edge.x1, edge.y1, edge.x2, edge.y2, edge.labelY, edge.detourX);
  return (
    <g data-canvas-edge-from={edge.from} data-canvas-edge-to={edge.to} data-canvas-edge-label={edge.label ?? ""}>
      <path d={d} fill="none" className="stroke-ink-200" strokeWidth={1.4} markerEnd="url(#journey-arrow)" />
      {edge.label ? (
        <foreignObject
          x={edge.labelX - 100}
          y={edge.labelY - 12}
          width={200}
          height={24}
          className="overflow-visible"
        >
          <div className="flex justify-center">
            <span className="rounded-full border border-badge-border bg-paper px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap text-badge-ink">
              {edge.label}
            </span>
          </div>
        </foreignObject>
      ) : null}
    </g>
  );
}
