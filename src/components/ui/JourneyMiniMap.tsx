import type { FlowNode } from "@/lib/canonical-view";
import { elbowPath, layoutJourneyCanvas } from "@/lib/journey-canvas-layout";

/* THE MINI MAP - the canvas, drawn small (Hulusi, 2026-09-14: "the preview
   of the canvas looks disgusting"). The real layout the canvas uses, the
   same orientation, the same kinds in the same colours, each card as the
   homepage's drawn miniature: a tinted plate, the icon tile as a square,
   the sentence as skeleton bars. It shows the beginning of the journey at
   a readable size - a window around the entry, cut at the bottom with a
   fade - rather than the whole graph shrunk to confetti. Server-rendered
   SVG, no client code. */

const KIND_FILL: Record<FlowNode["kind"], { plate: string; tile: string; stroke: string }> = {
  trigger: { plate: "fill-primary-600", tile: "fill-white/25", stroke: "stroke-primary-700" },
  action: { plate: "fill-paper", tile: "fill-ink-200", stroke: "stroke-ink-200" },
  condition: { plate: "fill-violet-50", tile: "fill-violet-300", stroke: "stroke-violet-200" },
  wait: { plate: "fill-teal-50", tile: "fill-teal-300", stroke: "stroke-teal-200" },
  handoff: { plate: "fill-indigo-50", tile: "fill-indigo-300", stroke: "stroke-indigo-200" },
  outcome: { plate: "fill-emerald-50", tile: "fill-emerald-300", stroke: "stroke-emerald-200" },
  exit: { plate: "fill-paper", tile: "fill-ink-200", stroke: "stroke-ink-300" },
};

const ACTION_TILE: Record<string, string> = {
  communication: "fill-primary-300",
  human: "fill-amber-300",
};

export function JourneyMiniMap({ nodes, className = "" }: { nodes: readonly FlowNode[]; className?: string }) {
  const layout = layoutJourneyCanvas(nodes);
  const entry = layout.nodes.find((l) => l.node.isEntry) ?? layout.nodes[0];
  const W = Math.min(layout.width, 1440);
  const H = Math.round(W * 0.34);
  const x0 = Math.max(0, Math.min(entry.x - W / 2, layout.width - W));
  return (
    <svg
      viewBox={`${x0} 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMin slice"
      aria-hidden
      focusable="false"
      className={`block h-full w-full ${className}`}
    >
      {layout.edges.map((e) => (
        <path
          key={e.id}
          d={elbowPath(e.x1, e.y1, e.x2, e.y2, e.labelY, e.detourX)}
          fill="none"
          className="stroke-ink-300"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      ))}
      {layout.nodes.map((l) => {
        const kind = l.node.kind;
        const look = KIND_FILL[kind];
        const tile = kind === "action" ? (ACTION_TILE[l.node.execution ?? ""] ?? look.tile) : look.tile;
        const x = l.x - l.width / 2;
        const y = l.y;
        const r = kind === "wait" ? l.height / 2 : 18;
        const bars = kind === "wait" ? 1 : kind === "exit" ? 1 : kind === "action" ? 3 : 2;
        const pad = 16;
        const tileSize = 26;
        const textX = kind === "wait" ? x + pad + tileSize + 10 : x + pad;
        const textY0 = kind === "wait" ? l.y + l.height / 2 - 4 : y + pad + tileSize + 14;
        return (
          <g key={l.node.id}>
            <rect x={x} y={y} width={l.width} height={l.height} rx={r} className={`${look.plate} ${look.stroke}`} strokeWidth={kind === "exit" ? 2 : 1.5} strokeDasharray={kind === "exit" ? "6 5" : undefined} />
            <rect x={x + pad} y={kind === "wait" ? l.y + (l.height - tileSize) / 2 : y + pad} width={tileSize} height={tileSize} rx={8} className={tile} />
            {Array.from({ length: bars }).map((_, i) => (
              <rect
                key={i}
                x={textX}
                y={textY0 + i * 16}
                width={Math.max(40, (l.width - (textX - x) - pad) * (i === bars - 1 ? 0.6 : 1))}
                height={7}
                rx={3.5}
                className={kind === "trigger" ? "fill-white/40" : "fill-ink-950/10"}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
