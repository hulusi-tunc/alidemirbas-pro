"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { JourneyWorld, actionSequenceOf, type CanvasLabels } from "@/components/JourneyCanvas";
import type { ChannelId } from "@/canonical/types";
import type { FlowNode } from "@/lib/canonical-view";
import type { CanvasLayout } from "@/lib/journey-canvas-layout";

/* THE PREVIEW - the canvas itself, small (Hulusi, 2026-09-20: "make the
   preview real, not wireframe"). The same world the Canvas tab renders -
   the same laid-out cards with their words, icons and pills, the same
   edges and branch labels - scaled to the tile's width and windowed on the
   beginning of the journey, cut with a fade at the bottom. Nothing in it
   responds: it is a picture of the canvas that opens the canvas. The
   scale follows the tile's real width (ResizeObserver), so the window
   always shows the same stretch of the graph. */

const WINDOW = 1240; // world px the tile shows across

export function JourneyMiniMap({
  nodes,
  layout,
  labels,
  messageLabels,
  humanLabels,
}: {
  nodes: readonly FlowNode[];
  layout: CanvasLayout;
  labels: CanvasLabels;
  messageLabels?: readonly { id: ChannelId; label: string }[];
  humanLabels?: readonly { id: ChannelId; label: string }[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Window width in world px and the scale that fits it: a narrow tile (a
  // phone) shows less of the graph at a readable size rather than the whole
  // window shrunk to specks.
  const [view, setView] = useState({ window: WINDOW, scale: 0.6 });
  const actionSequence = useMemo(() => actionSequenceOf(nodes), [nodes]);
  const entry = layout.nodes.find((l) => l.node.isEntry) ?? layout.nodes[0];
  const x0 = entry.x - view.window / 2;
  const y0 = Math.max(0, entry.y - 36);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const width = el.clientWidth;
      const win = Math.min(Math.max(layout.width, 760), Math.max(760, Math.round(width * 1.6)), WINDOW);
      setView({ window: win, scale: width / win });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    measure();
    return () => ro.disconnect();
  }, [layout.width]);

  return (
    <div ref={ref} aria-hidden inert className="pointer-events-none relative h-full w-full overflow-hidden select-none">
      <div
        style={{ width: layout.width, height: layout.height, transform: `translate(${-x0 * view.scale}px, ${-y0 * view.scale}px) scale(${view.scale})`, transformOrigin: "0 0" }}
        className="absolute top-0 left-0"
      >
        <JourneyWorld
          layout={layout}
          actionSequence={actionSequence}
          labels={labels}
          messageLabels={messageLabels}
          humanLabels={humanLabels}
          onOpen={() => {}}
        />
      </div>
    </div>
  );
}
