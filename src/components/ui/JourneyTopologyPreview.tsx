import {
  PREVIEW_GLYPH,
  PREVIEW_KINDS,
  PREVIEW_VIEWBOX,
  type JourneyPreview,
} from "@/lib/journey-preview";

/* The topology thumbnail on a Journey Library card.

   Purely presentational and purely arithmetic: every coordinate arrives
   pre-computed on `preview` (built server-side from the journey's real
   canonical graph by the same layout engine the detail Canvas uses - see
   lib/journey-preview.ts), so nothing here lays anything out. That is what
   makes 281 of these affordable on one page.

   The silhouettes are the Canvas's own node grammar reduced to shape alone -
   same fills, same border treatment, same size hierarchy, no text. Their
   colours live in globals.css under `.jp-*`, reading the SAME tokens
   JourneyCanvasNodes.tsx uses (ink-950 for a Trigger's filled card, the
   neutral left rule on an Action, success on an Outcome, blue on a Handoff,
   a dashed hairline on an Exit), so the card and the page it opens are
   visibly one system rather than two.

   Kept deliberately cheap in bytes as well as in DOM: one <path> carries
   every connection as joined subpaths, each node is a single <rect> with a
   class instead of repeated inline `fill`/`stroke`/`stroke-width`
   attributes, the two stroke widths ride on the <svg> as custom properties
   once per card rather than once per shape, and every emitted number is
   rounded - across 281 cards that markup is the page. */

const KIND_CLASS: Record<(typeof PREVIEW_KINDS)[number], string> = {
  trigger: "jp-trigger",
  action: "jp-action",
  condition: "jp-condition",
  wait: "jp-wait",
  handoff: "jp-handoff",
  outcome: "jp-outcome",
  exit: "jp-exit",
};

/** One decimal is well below a device pixel at this scale, and keeps the
    serialized markup short. */
const r1 = (v: number) => Math.round(v * 10) / 10;

export default function JourneyTopologyPreview({ preview }: { preview: JourneyPreview }) {
  const { n, e, u } = preview;
  return (
    <svg
      viewBox={`0 0 ${PREVIEW_VIEWBOX.width} ${PREVIEW_VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid meet"
      className="jp block h-full w-full"
      style={
        {
          "--jp-edge-w": r1(Math.max(1.6, u * 0.13)),
          "--jp-node-w": r1(Math.max(1.4, u * 0.11)),
        } as React.CSSProperties
      }
      aria-hidden
      focusable="false"
    >
      {e ? <path d={e} className="jp-edge" /> : null}
      {n.map(([kindIndex, x, y], i) => {
        const kind = PREVIEW_KINDS[kindIndex] ?? "action";
        const glyph = PREVIEW_GLYPH[kind];
        const w = r1(glyph.w * u);
        const h = r1(glyph.h * u);
        const left = r1(x - w / 2);
        const top = r1(y - h / 2);
        return (
          <g key={i}>
            <rect x={left} y={top} width={w} height={h} rx={r1(h * glyph.r)} className={KIND_CLASS[kind]} />
            {kind === "action" ? (
              // The Action card's left accent rule, the one piece of node
              // chrome that survives at thumbnail scale because it is what
              // separates an Action from every other light card.
              <rect
                x={left}
                y={top}
                width={r1(Math.max(1.8, u * 0.2))}
                height={h}
                rx={r1(Math.max(0.9, u * 0.1))}
                className="jp-rule"
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
