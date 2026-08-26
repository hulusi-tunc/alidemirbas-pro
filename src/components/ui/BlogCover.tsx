import { Calendar, Repeat, TrendingDown, TrendingUp } from "lucide-react";

/* Reusable editorial cover system, replacing the old pastel gradient
   placeholder rectangles (which read as missing images, not a design
   choice). Every cover is built from typography, a rule or two, a tiny
   diagram, and a category accent - no photography, no illustration, no
   generated imagery. The subject matter (a ratio, a curve, a fork, a
   trade-off) becomes the visual material, which is the point: these
   posts are about growth/analytics/experimentation, so the covers should
   look like that rather than like generic blog thumbnails.

   ACCENT SYSTEM: three variants, one per REAL category in blog-posts.ts
   (`categoryAccent` below maps the real string, never invents a fourth).
   All three stay inside this site's existing token families - no new hue
   is introduced (the palette has ink/paper/primary-blue/sand/neutral and
   nothing else generally available; a gated `--color-success` green is
   reserved for one specific hero elsewhere and is deliberately not
   reached for here). "Growth Metrics" reads warm via the sand ground
   token, not via a new orange; "Lifecycle & CRM" reads structural via a
   dark ink diagram rather than a second blue. Differentiation comes from
   which existing family leads, not from adding hues - the brief's own
   "no rainbow" constraint.

   Each post's cover is an explicit, hand-authored spec below (COVERS),
   keyed by real slug - not derived automatically from category, because
   the diagram in each one quotes a specific real idea from that post's
   own first section (e.g. the guardrail cover's up/down pair is
   "conversion" vs "refund rate", the article's own opening example). A
   future post gets its own entry the same way; nothing here guesses. */

export type CoverAccent = "experimentation" | "growth" | "lifecycle";

const ACCENT: Record<
  CoverAccent,
  { ground: string; dot: string; text: string; diagram: string; big: string }
> = {
  experimentation: {
    ground: "bg-primary-50",
    dot: "bg-primary-600",
    text: "text-primary-700",
    diagram: "text-primary-600",
    big: "text-primary-900",
  },
  growth: {
    ground: "bg-sand-100",
    dot: "bg-neutral-600",
    text: "text-neutral-700",
    diagram: "text-neutral-600",
    big: "text-ink-900",
  },
  lifecycle: {
    ground: "bg-paper-soft",
    dot: "bg-ink-700",
    text: "text-ink-700",
    diagram: "text-ink-800",
    big: "text-ink-950",
  },
};

/** Maps a real `BlogPost.category` to one of the three accents. Any
    category not in this list falls through to "lifecycle" (the most
    neutral of the three) rather than guessing - today's real category
    set is exactly these three, verified against blog-posts.ts. */
export function categoryAccent(category: string): CoverAccent {
  if (category === "Experimentation") return "experimentation";
  if (category === "Growth Metrics") return "growth";
  return "lifecycle";
}

/* ---- Diagram slot components — small, honest, content-derived -------- */

function UpDownPair({ up, down, accent }: { up: string; down: string; accent: CoverAccent }) {
  const a = ACCENT[accent];
  return (
    <div className="flex items-center gap-3">
      <span className={`flex items-center gap-1 text-[11px] font-medium ${a.text}`}>
        <TrendingUp aria-hidden className="size-3.5" />
        {up}
      </span>
      <span aria-hidden className="h-3 w-px bg-current opacity-20" />
      <span className="flex items-center gap-1 text-[11px] font-medium text-ink-400">
        <TrendingDown aria-hidden className="size-3.5" />
        {down}
      </span>
    </div>
  );
}

function ConditionVsDate({ ongoing, fixed }: { ongoing: string; fixed: string }) {
  return (
    <div className="flex items-center gap-3 text-[11px] font-medium text-ink-500">
      <span className="flex items-center gap-1">
        <Repeat aria-hidden className="size-3.5" />
        {ongoing}
      </span>
      <span aria-hidden className="h-3 w-px bg-current opacity-20" />
      <span className="flex items-center gap-1">
        <Calendar aria-hidden className="size-3.5" />
        {fixed}
      </span>
    </div>
  );
}

/** Three small blocks of differing heights - each ad platform's dashboard
    reporting a different number for the same underlying spend, the
    article's own real thesis. */
function PlatformBlocks() {
  const heights = [55, 78, 40];
  return (
    <div className="flex items-end gap-1.5">
      {heights.map((h, i) => (
        <span
          key={i}
          aria-hidden
          className={`w-4 rounded-[2px] ${i === 1 ? "bg-neutral-600" : "bg-neutral-300"}`}
          style={{ height: `${h * 0.28}px` }}
        />
      ))}
    </div>
  );
}

/** A minimal declining sparkline - the retention curve's real shape
    (steep early drop, flattening tail), not a generic chart icon. */
function RetentionCurve() {
  return (
    <svg aria-hidden viewBox="0 0 64 24" className="h-6 w-16 overflow-visible text-neutral-500">
      <path
        d="M1 3 C 10 14, 18 18, 30 19 S 50 20.5, 63 21"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {[1, 30, 63].map((x, i) => (
        <circle key={i} cx={x} cy={i === 0 ? 3 : i === 1 ? 19 : 21} r="1.6" fill="currentColor" />
      ))}
    </svg>
  );
}

/** A split ratio bar - the LTV segment wider than the CAC segment, which
    is the whole shape of the ratio the post is about. */
function RatioBar() {
  return (
    <div className="flex h-2 w-16 overflow-hidden rounded-full bg-neutral-200">
      <span aria-hidden className="h-full w-[62%] bg-neutral-600" />
      <span aria-hidden className="h-full w-[38%] bg-neutral-300" />
    </div>
  );
}

/* ---- The cover itself -------------------------------------------------
   `lines` is 1-3 short strings, the cover's dominant typographic mark.
   `rule` (optional) renders a short horizontal line between two lines,
   for the ratio-notation covers (LTV / CAC). `tag` is the small accent
   label (a real topic string). `diagram` is one of the slot components
   above, chosen per post below - never the same one twice, so six covers
   read as six different diagrams, not one template with new words. */
export type CoverSpec = {
  lines: string[];
  rule?: boolean;
  tag: string;
  accent: CoverAccent;
  diagram: "updown" | "condition" | "platforms" | "curve" | "ratio";
};

function Diagram({ kind, spec }: { kind: CoverSpec["diagram"]; spec: CoverSpec }) {
  switch (kind) {
    case "updown":
      return <UpDownPair up="Conversion" down="Refund rate" accent={spec.accent} />;
    case "condition":
      return <ConditionVsDate ongoing="Ongoing condition" fixed="Fixed date" />;
    case "platforms":
      return <PlatformBlocks />;
    case "curve":
      return <RetentionCurve />;
    case "ratio":
      return <RatioBar />;
  }
}

export function BlogCover({ spec, size = "grid" }: { spec: CoverSpec; size?: "grid" | "featured" }) {
  const a = ACCENT[spec.accent];
  const featured = size === "featured";
  return (
    <div
      aria-hidden
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden ${a.ground} ${
        featured ? "p-7 sm:p-9" : "p-5"
      }`}
    >
      <p
        className={`font-mono text-[10px] tracking-[0.14em] uppercase ${a.text}`}
      >
        {spec.tag}
      </p>
      <div className={featured ? "my-2" : "my-1"}>
        {spec.lines.map((line, i) => (
          <span key={line} className="block">
            <span
              className={`font-semibold tracking-tight ${a.big} ${
                featured ? "text-[2.75rem] leading-[0.98] sm:text-[3.25rem]" : "text-[1.75rem] leading-[0.98]"
              }`}
            >
              {line}
            </span>
            {spec.rule && i === 0 && (
              <span
                aria-hidden
                className={`my-1.5 block h-px w-10 ${spec.accent === "experimentation" ? "bg-primary-300" : "bg-ink-300"}`}
              />
            )}
          </span>
        ))}
      </div>
      <div className={a.diagram}>
        <Diagram kind={spec.diagram} spec={spec} />
      </div>
    </div>
  );
}

/** Per-post covers, keyed by the real slug in blog-posts.ts. */
export const COVERS: Record<string, CoverSpec> = {
  "the-guardrail-metric-most-ab-tests-forget": {
    lines: ["GUARDRAIL"],
    tag: "A/B Testing",
    accent: "experimentation",
    diagram: "updown",
  },
  "what-belongs-in-a-lifecycle-journey-vs-a-campaign": {
    lines: ["JOURNEY", "≠ CAMPAIGN"],
    tag: "Lifecycle Marketing",
    accent: "lifecycle",
    diagram: "condition",
  },
  "why-your-roas-looks-different-on-every-ad-platform": {
    lines: ["ROAS", "≠ ROAS"],
    tag: "Advertising",
    accent: "growth",
    diagram: "platforms",
  },
  "reading-d1-d7-d30-retention-without-fooling-yourself": {
    lines: ["D1 · D7", "D30"],
    tag: "Retention",
    accent: "growth",
    diagram: "curve",
  },
  "ltv-cac-ratio-doesnt-tell-you-when-to-scale": {
    lines: ["LTV", "CAC"],
    rule: true,
    tag: "Unit Economics",
    accent: "growth",
    diagram: "ratio",
  },
};
