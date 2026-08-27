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
   makes 255 of these affordable on one page.

   The silhouettes below are the Canvas's own node grammar reduced to shape
   alone - same fills, same border treatment, same size hierarchy, no text.
   They read from the SAME tokens JourneyCanvasNodes.tsx uses (ink-950 for a
   Trigger's filled card, the neutral left rule on an Action, success on an
   Outcome, blue on a Handoff, a dashed hairline on an Exit), so the card and
   the page it opens are visibly one system rather than two.

   Kept deliberately cheap in DOM terms: one <path> carries every connection
   as joined subpaths, and each node is a single <rect> - so a card costs
   roughly (nodes + 2) elements rather than (nodes + edges) * several. */

/** Per-kind fill and stroke, mirroring JourneyCanvasNodes.tsx. Values are
    the same design tokens those cards use, as literals because SVG
    presentation attributes can't take Tailwind classes for stroke-dasharray
    variants without a class per kind. */
const STYLE: Record<
  (typeof PREVIEW_KINDS)[number],
  { fill: string; stroke: string; dash?: string; rule?: string }
> = {
  // Trigger: the one filled card in the grammar (bg-ink-950).
  trigger: { fill: "var(--color-ink-950)", stroke: "var(--color-ink-950)" },
  // Action: Level A, white card with a 3px left rule in neutral-600.
  action: {
    fill: "var(--color-paper)",
    stroke: "var(--color-ink-200)",
    rule: "var(--color-neutral-600)",
  },
  condition: { fill: "var(--color-paper)", stroke: "var(--color-ink-300)" },
  wait: { fill: "var(--color-paper)", stroke: "var(--color-ink-300)" },
  handoff: { fill: "var(--color-paper-soft)", stroke: "var(--color-primary-700)" },
  outcome: { fill: "var(--color-paper)", stroke: "var(--color-success)" },
  // Exit: transparent with a dashed hairline, exactly as the Canvas draws it.
  exit: { fill: "transparent", stroke: "var(--color-ink-300)", dash: "5 4" },
};

export default function JourneyTopologyPreview({ preview }: { preview: JourneyPreview }) {
  const { n, e, u } = preview;
  return (
    <svg
      viewBox={`0 0 ${PREVIEW_VIEWBOX.width} ${PREVIEW_VIEWBOX.height}`}
      preserveAspectRatio="xMidYMid meet"
      className="block h-full w-full"
      aria-hidden
      focusable="false"
    >
      {e ? (
        <path
          d={e}
          fill="none"
          stroke="var(--color-ink-200)"
          strokeWidth={Math.max(1.6, u * 0.13)}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-[stroke] duration-150 group-hover:stroke-ink-300"
        />
      ) : null}
      {n.map(([kindIndex, x, y], i) => {
        const kind = PREVIEW_KINDS[kindIndex] ?? "action";
        const glyph = PREVIEW_GLYPH[kind];
        const style = STYLE[kind];
        const w = glyph.w * u;
        const h = glyph.h * u;
        const left = x - w / 2;
        const top = y - h / 2;
        return (
          <g key={i}>
            <rect
              x={left}
              y={top}
              width={w}
              height={h}
              rx={h * glyph.r}
              fill={style.fill}
              stroke={style.stroke}
              strokeWidth={Math.max(1.4, u * 0.11)}
              strokeDasharray={style.dash}
            />
            {style.rule ? (
              // The Action card's left accent rule, the one piece of node
              // chrome that survives at thumbnail scale because it is what
              // separates an Action from every other light card.
              <rect
                x={left}
                y={top}
                width={Math.max(1.8, u * 0.2)}
                height={h}
                rx={Math.max(0.9, u * 0.1)}
                fill={style.rule}
              />
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
