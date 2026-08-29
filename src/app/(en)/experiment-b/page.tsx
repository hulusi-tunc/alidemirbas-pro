import type { Metadata } from "next";
import Link from "next/link";
import JourneyTopologyPreview from "@/components/ui/JourneyTopologyPreview";
import {
  CANONICAL_COUNT,
  CATEGORY_COUNT,
  GLOBAL_RULE_COUNT,
  JOURNEY_ROWS,
  RULE_COUNT,
  withCanonicalCount,
  type JourneyRow,
} from "@/lib/canonical-view";
import {
  JOURNEY_CATEGORY_COUNTS,
  JOURNEY_SCALE,
  NODE_KIND_COUNTS,
  type NodeKind,
} from "@/lib/journey-marketing";
import { GOALS, GOAL_LABEL } from "@/lib/journey-taxonomy";

/* Experiment B — "Inside the Canonical Journey Library".

   Standalone, unlinked explainer route. Composition follows
   /experiment-b-plan.md (composition-grammar vocabulary): statement+witness
   hero → measure-narrowed definition with a spec plate → repetition+break
   anatomy grid on shifted ground → rail+body distribution → the page's one
   interruption plate (site's single ink-950 surface) → an unforced triptych
   → index-as-texture peak resolving into the single CTA.

   Server component; every figure on the page is imported live from the
   canonical read models. Nothing is typed by hand. */

const DEK = withCanonicalCount(
  "A library of {count} reusable lifecycle journeys across {categories} categories, held together by {rules} orchestration rules — each entry is a graph, not a sequence.",
);

export const metadata: Metadata = {
  title: "Inside the Canonical Journey Library",
  description: DEK,
};

const fmt = (n: number) => n.toLocaleString("en-US");

/* ---- Real objects picked deterministically from the corpus ------------- */

/** Hero witness: the largest graph in the library. */
const HERO_JOURNEY: JourneyRow = JOURNEY_ROWS.reduce((max, row) =>
  row.nodeCount > max.nodeCount ? row : max,
);

/** Explore index: one journey per category for the twelve largest
    categories — in each, the category's biggest graph. Deterministic, real,
    and every card links to its live detail route. */
const EXPLORE_ROWS: JourneyRow[] = JOURNEY_CATEGORY_COUNTS.slice(0, 12)
  .map((cat) =>
    JOURNEY_ROWS.filter((row) => row.category === cat.id).reduce((max, row) =>
      row.nodeCount > max.nodeCount ? row : max,
    ),
  )
  .filter((row): row is JourneyRow => Boolean(row));

/* ---- Node-kind silhouettes (the library's own .jp-* grammar) ----------- */

const KIND_GLYPH: Record<NodeKind, { w: number; h: number; r: number }> = {
  trigger: { w: 30, h: 17, r: 3 },
  action: { w: 30, h: 16, r: 3 },
  condition: { w: 26, h: 16, r: 8 },
  wait: { w: 26, h: 16, r: 8 },
  handoff: { w: 30, h: 16, r: 3 },
  outcome: { w: 30, h: 16, r: 3 },
  exit: { w: 30, h: 16, r: 3 },
};

/** The Canvas node grammar reduced to one silhouette, exactly as the
    library's topology thumbnails draw it (colours live in globals.css under
    `.jp-*`), so the anatomy grid and the product read as one system. */
function NodeKindGlyph({ kind }: { kind: NodeKind }) {
  const g = KIND_GLYPH[kind];
  const x = (48 - g.w) / 2;
  const y = (28 - g.h) / 2;
  return (
    <svg
      viewBox="0 0 48 28"
      className="jp h-7 w-12"
      style={{ "--jp-node-w": 1.6, "--jp-edge-w": 1.6 } as React.CSSProperties}
      aria-hidden
      focusable="false"
    >
      <rect x={x} y={y} width={g.w} height={g.h} rx={g.r} className={`jp-${kind}`} />
      {kind === "action" ? (
        <rect x={x} y={y} width={2.4} height={g.h} rx={1.2} className="jp-rule" />
      ) : null}
    </svg>
  );
}

/** Role captions — restatements of the S-ANATOMY body, no new claims. */
const KIND_ROLE: Record<NodeKind, string> = {
  trigger: "starts the journey from a real signal",
  condition: "branches it",
  wait: "holds it — resolves on event and on timeout",
  action: "does the work",
  handoff: "transfers the entity to another journey",
  outcome: "ends it with a result",
  exit: "ends it without one",
};

/* ---- Small shared pieces ------------------------------------------------ */

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="altor-eyebrow text-ink-400">{children}</p>;
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-line py-2.5 last:border-b-0">
      <dt className="altor-eyebrow text-ink-400">{label}</dt>
      <dd className="font-mono text-sm text-ink-900 tabular-nums">{value}</dd>
    </div>
  );
}

/* ========================================================================= */

export default function ExperimentBPage() {
  const maxCategory = JOURNEY_CATEGORY_COUNTS[0]?.count ?? 1;
  const rarest = NODE_KIND_COUNTS[NODE_KIND_COUNTS.length - 1];

  return (
    <main className="bg-paper text-ink-900">
      {/* ================= HERO — statement + witness ==================== */}
      <section className="altor-container pt-16 pb-14 sm:pt-24 sm:pb-16">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <div>
            <Kicker>Lab · Canonical Journey Library</Kicker>
            <h1 className="mt-4 text-display-xl text-balance">
              Inside the Canonical Journey Library
            </h1>
            <p className="mt-6 max-w-[55ch] text-lg leading-relaxed text-ink-500">{DEK}</p>
          </div>
          <figure className="min-w-0">
            <div className="rounded-lg border border-line bg-paper-soft p-4 sm:p-6">
              <div className="aspect-[1000/440]">
                <JourneyTopologyPreview preview={HERO_JOURNEY.preview} />
              </div>
            </div>
            <figcaption className="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 font-mono text-[11px] tracking-[0.08em] text-ink-400 uppercase">
              <span className="text-ink-500">
                {HERO_JOURNEY.id} · {HERO_JOURNEY.name}
              </span>
              <span>
                {HERO_JOURNEY.nodeCount} nodes · {HERO_JOURNEY.categoryTitle}
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ================= S-WHAT — narrowed prose + spec plate ========== */}
      <section className="altor-container border-t border-line pt-12 pb-16 sm:pb-20">
        <div className="mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-20">
          <div>
            <Kicker>What it is</Kicker>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">What it is</h2>
            <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-ink-500 sm:text-lg">
              Every journey in the library is an entity state machine: it describes how one
              thing — a subscription, a consent record, an incident, a delivery — moves
              through its lifecycle. The library is domain-neutral by construction, so the
              same journey serves an e-commerce order and an insurance claim without
              rewriting.
            </p>
          </div>
          <dl className="self-end border-t border-line-strong">
            <SpecRow label="Journeys" value={fmt(CANONICAL_COUNT)} />
            <SpecRow label="Categories" value={fmt(CATEGORY_COUNT)} />
            <SpecRow label="Nodes" value={fmt(JOURNEY_SCALE.nodes)} />
            <SpecRow label="Node kinds" value={fmt(JOURNEY_SCALE.nodeKinds)} />
            <SpecRow label="Orchestration rules" value={fmt(RULE_COUNT)} />
            <SpecRow label="Global rules" value={fmt(GLOBAL_RULE_COUNT)} />
          </dl>
        </div>
      </section>

      {/* ============ S-ANATOMY — repetition + break on shifted ground === */}
      <section className="bg-paper-soft">
        <div className="altor-container pt-16 pb-14 sm:pt-20">
          <Kicker>The vocabulary</Kicker>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">
            The anatomy of a journey
          </h2>
          <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-ink-500 sm:text-lg">
            Seven node kinds are the entire vocabulary. A trigger starts the journey from a
            real signal. A condition branches it. A wait holds it — and every wait resolves
            both ways, on event and on timeout. An action does the work. A handoff transfers
            the entity to another journey. An outcome ends it with a result; an exit ends it
            without one. Nothing else exists, which is what keeps {CANONICAL_COUNT} graphs
            readable.
          </p>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {NODE_KIND_COUNTS.map(({ kind, count }) => {
              const deviant = kind === rarest?.kind;
              return (
                <li
                  key={kind}
                  className={`rounded-lg border bg-paper p-5 ${
                    deviant ? "border-ink-950" : "border-line"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <NodeKindGlyph kind={kind} />
                    <span
                      className={`font-mono text-sm tabular-nums ${
                        deviant ? "font-semibold text-ink-950" : "text-ink-400"
                      }`}
                    >
                      ×{fmt(count)}
                    </span>
                  </div>
                  <h3 className="mt-4 text-sm font-semibold capitalize">{kind}</h3>
                  <p className="mt-1 text-sm leading-snug text-ink-500">{KIND_ROLE[kind]}</p>
                  {deviant ? (
                    <p className="altor-eyebrow mt-3 text-ink-950">
                      {fmt(count)} of {fmt(JOURNEY_SCALE.nodes)} nodes in the corpus
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>

        {/* ============ S-SCALE — rail + body distribution =============== */}
        <div className="altor-container border-t border-line pt-12 pb-16 sm:pb-20">
          <div className="mx-auto max-w-[1120px]">
            <Kicker>The distribution</Kicker>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              The shape of the corpus
            </h2>
            <p className="mt-5 max-w-[62ch] text-base leading-relaxed text-ink-500 sm:text-lg">
              The corpus is not evenly distributed, and the skew is informative: lifecycle
              work clusters where entities change state most often.
            </p>

            <div className="mt-10 grid gap-x-16 gap-y-4 md:grid-cols-2">
              {JOURNEY_CATEGORY_COUNTS.map((cat) => (
                <div key={cat.id} className="min-w-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="truncate text-sm text-ink-700">{cat.title}</span>
                    <span className="font-mono text-xs text-ink-400 tabular-nums">
                      {cat.count}
                    </span>
                  </div>
                  <div className="mt-1.5 h-px w-full bg-line">
                    <div
                      className="h-[3px] -translate-y-px bg-ink-700"
                      style={{ width: `${(cat.count / maxCategory) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="altor-eyebrow mt-8 text-ink-400">
              {fmt(CANONICAL_COUNT)} journeys across {fmt(CATEGORY_COUNT)} categories — real
              counts, largest first
            </p>
          </div>
        </div>
      </section>

      {/* ========= S-RULES — the page's single interruption plate ======== */}
      <section className="bg-ink-950 text-white">
        <div className="altor-container py-16 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-20">
            <div>
              <p className="altor-eyebrow text-ink-400">The system</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                What holds it together
              </h2>
              <p className="mt-6 max-w-[52ch] text-base leading-relaxed text-ink-300 sm:text-lg">
                Journeys do not run in isolation. Orchestration rules describe how they hand
                off, suppress and wake each other; global rules apply to every journey at
                once. Retired journey ids do not 404 — each one resolves into the journey
                that absorbed it.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-10 self-end border-t border-line-inverse pt-8 lg:grid-cols-1 lg:gap-8">
              <div>
                <dd className="font-mono text-5xl font-semibold tabular-nums sm:text-6xl">
                  {fmt(RULE_COUNT)}
                </dd>
                <dt className="altor-eyebrow mt-2 text-ink-400">Orchestration rules</dt>
              </div>
              <div>
                <dd className="font-mono text-5xl font-semibold tabular-nums sm:text-6xl">
                  {fmt(GLOBAL_RULE_COUNT)}
                </dd>
                <dt className="altor-eyebrow mt-2 text-ink-400">
                  Global rules, on every journey
                </dt>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ============ S-PRINCIPLES — unforced triptych ==================== */}
      <section className="altor-container pt-16 pb-14 sm:pt-20">
        <Kicker>Positions</Kicker>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">
          Three positions the corpus takes
        </h2>
        <ol className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
          <li className="border-t border-line-strong pt-5">
            <span className="font-mono text-xs text-ink-400">01</span>
            <p className="mt-3 text-base leading-relaxed">
              <strong className="font-semibold">Graphs, not sequences.</strong>{" "}
              <span className="text-ink-500">
                A journey is where it forks, what each arm means, and what happens when a
                wait runs out — not a numbered list of steps.
              </span>
            </p>
          </li>
          <li className="border-t border-line-strong pt-5">
            <span className="font-mono text-xs text-ink-400">02</span>
            <p className="mt-3 text-base leading-relaxed">
              <strong className="font-semibold">
                Entity state machines, not one customer timeline.
              </strong>{" "}
              <span className="text-ink-500">
                {CANONICAL_COUNT} independent lifecycles beat one mythical funnel.
              </span>
            </p>
          </li>
          <li className="border-t border-line-strong pt-5">
            <span className="font-mono text-xs text-ink-400">03</span>
            <p className="mt-3 text-base leading-relaxed">
              <strong className="font-semibold">Domain-neutral by construction.</strong>{" "}
              <span className="text-ink-500">
                Nothing in a journey names an industry; the same machine runs wherever the
                entity exists.
              </span>
            </p>
          </li>
        </ol>
      </section>

      {/* ====== S-EXPLORE — index as texture, resolving to the CTA ======= */}
      <section className="altor-container border-t border-line pt-12 pb-20 sm:pb-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Kicker>The library</Kicker>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Explore it</h2>
            <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-ink-500 sm:text-lg">
              The full library is searchable and filterable by goal.
            </p>
          </div>
          <p className="altor-eyebrow text-ink-400">
            Showing {EXPLORE_ROWS.length} of {fmt(CANONICAL_COUNT)} journeys
          </p>
        </div>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {EXPLORE_ROWS.map((row) => (
            <li key={row.id} className="min-w-0">
              <Link
                href={`/lab/journeys/${row.slug}`}
                className="group block rounded-lg border border-line bg-paper transition-colors hover:border-line-strong"
              >
                <div className="border-b border-line bg-paper-soft p-3">
                  <div className="aspect-[1000/440]">
                    <JourneyTopologyPreview preview={row.preview} />
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-mono text-[11px] tracking-[0.08em] text-ink-400 uppercase">
                    {row.id} · {row.nodeCount} nodes
                  </p>
                  <h3 className="mt-1.5 truncate text-sm font-semibold" title={row.name}>
                    {row.name}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-ink-500">{row.categoryTitle}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* The 26 real goal facets — the literal witness for "filterable by
            goal". Texture, not navigation: the filter itself lives in the
            library. */}
        <div className="mt-12 border-t border-line pt-8">
          <p className="altor-eyebrow text-ink-400">
            {GOALS.length} goals to filter by
          </p>
          <p className="mt-4 font-mono text-[11px] leading-6 tracking-[0.06em] text-ink-400 uppercase">
            {GOALS.map((goal, i) => (
              <span key={goal}>
                {i > 0 ? <span className="mx-2 text-ink-200">/</span> : null}
                <span className="whitespace-nowrap">{GOAL_LABEL[goal].en}</span>
              </span>
            ))}
          </p>
        </div>

        <div className="mt-14 flex justify-center">
          <Link
            href="/lab/journeys"
            className="inline-flex items-center rounded-md bg-primary-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 active:bg-primary-800"
          >
            Open the library
          </Link>
        </div>
      </section>
    </main>
  );
}
