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
} from "@/lib/canonical-view";
import {
  JOURNEY_CATEGORY_COUNTS,
  JOURNEY_SCALE,
  NODE_KIND_COUNTS,
  type NodeKind,
} from "@/lib/journey-marketing";
import { GOALS, GOAL_LABEL } from "@/lib/journey-taxonomy";

/* Standalone explainer for the Canonical Journey Library. Server component,
   statically rendered, no site chrome — <main> only. Every figure on the
   page is imported from the live library exports; nothing is typed in. */

const DEK = withCanonicalCount(
  "A library of {count} reusable lifecycle journeys across {categories} categories, held together by {rules} orchestration rules — each entry is a graph, not a sequence.",
);

export const metadata: Metadata = {
  title: "Inside the Canonical Journey Library - Ali Demirbaş",
  description: DEK,
};

/* ------------------------------------------------------------ real data */

/** The largest graph in the library — the hero's proof that even the most
    complex entry stays legible. Derived, never hard-picked. */
const HERO_JOURNEY = JOURNEY_ROWS.reduce((a, b) => (b.nodeCount > a.nodeCount ? b : a));

const nf = new Intl.NumberFormat("en-US");

const KIND_COUNT = new Map<NodeKind, number>(NODE_KIND_COUNTS.map((k) => [k.kind, k.count]));

/** The seven node kinds in the vocabulary's own teaching order. The role
    lines are lifted from the fixed anatomy copy — no new claims. */
const KIND_META: readonly { kind: NodeKind; label: string; role: string }[] = [
  { kind: "trigger", label: "Trigger", role: "Starts the journey from a real signal." },
  { kind: "condition", label: "Condition", role: "Branches it." },
  { kind: "wait", label: "Wait", role: "Holds it — resolving both ways, on event and on timeout." },
  { kind: "action", label: "Action", role: "Does the work." },
  { kind: "handoff", label: "Handoff", role: "Transfers the entity to another journey." },
  { kind: "outcome", label: "Outcome", role: "Ends it with a result." },
  { kind: "exit", label: "Exit", role: "Ends it without one." },
];

const MAX_CATEGORY = JOURNEY_CATEGORY_COUNTS[0]?.count ?? 1;

/* ------------------------------------------------------- local pieces */

function SectionHeading({ index, title }: { index: string; title: string }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-400">{index}</p>
      <h2 className="mt-3 text-h2-fluid font-semibold text-ink-900">{title}</h2>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="border-t border-line-strong pt-4">
      <p className="font-mono text-3xl font-medium tracking-tight text-ink-900">{value}</p>
      <p className="mt-1.5 text-xs uppercase tracking-[0.14em] text-ink-500">{label}</p>
    </div>
  );
}

/* ---------------------------------------------------------------- page */

export default function ExperimentAPage() {
  return (
    <main className="bg-paper text-ink-900">
      {/* ------------------------------------------------------- hero */}
      <header className="altor-container pt-20 pb-16 sm:pt-28 md:pt-32">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-500">
          Lab · Open source
        </p>
        <h1 className="mt-5 max-w-[15ch] text-display-xl text-ink-950">
          Inside the Canonical Journey Library
        </h1>
        <p className="mt-6 max-w-[52ch] text-xl text-ink-500">{DEK}</p>

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 md:mt-16">
          <Stat value={String(CANONICAL_COUNT)} label="Journeys" />
          <Stat value={String(CATEGORY_COUNT)} label="Categories" />
          <Stat value={nf.format(JOURNEY_SCALE.nodes)} label="Nodes" />
          <Stat value={String(RULE_COUNT + GLOBAL_RULE_COUNT)} label="Rules" />
        </div>

        {/* One real figure from the corpus: the library's largest graph,
            drawn by the same layout engine the library cards use. */}
        <figure className="mt-14 md:mt-20">
          <div className="rounded-2xl border border-line bg-paper-soft px-4 py-6 sm:px-8 sm:py-8">
            <div className="mx-auto aspect-[1000/440] w-full max-w-[880px]">
              <JourneyTopologyPreview preview={HERO_JOURNEY.preview} />
            </div>
          </div>
          <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-ink-400">
              {HERO_JOURNEY.id}
            </span>
            <span className="text-sm text-ink-600">
              {HERO_JOURNEY.name} — the library&apos;s largest graph, {HERO_JOURNEY.nodeCount}{" "}
              nodes, drawn from its real topology.
            </span>
          </figcaption>
        </figure>
      </header>

      {/* ------------------------------------------------------- what */}
      <section className="altor-container py-16 md:py-24">
        <div className="max-w-[760px]">
          <SectionHeading index="01" title="What it is" />
          <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-ink-600">
            Every journey in the library is an entity state machine: it describes how one thing —
            a subscription, a consent record, an incident, a delivery — moves through its
            lifecycle. The library is domain-neutral by construction, so the same journey serves
            an e-commerce order and an insurance claim without rewriting.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------- anatomy */}
      <section className="altor-container py-16 md:py-24">
        <div className="max-w-[760px]">
          <SectionHeading index="02" title="The anatomy of a journey" />
          <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-ink-600">
            Seven node kinds are the entire vocabulary. A trigger starts the journey from a real
            signal. A condition branches it. A wait holds it — and every wait resolves both ways,
            on event and on timeout. An action does the work. A handoff transfers the entity to
            another journey. An outcome ends it with a result; an exit ends it without one.
            Nothing else exists, which is what keeps {CANONICAL_COUNT} graphs readable.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
          {KIND_META.map(({ kind, label, role }) => (
            <li key={kind} className="bg-paper p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-h6 font-semibold text-ink-900">{label}</h3>
                <span className="font-mono text-sm text-ink-400">
                  ×{nf.format(KIND_COUNT.get(kind) ?? 0)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{role}</p>
            </li>
          ))}
          {/* The count under each kind is its real total across the corpus. */}
          <li className="bg-paper-soft p-6">
            <p className="text-sm leading-relaxed text-ink-500">
              <span className="font-mono text-ink-400">×n</span> — how many of each kind exist
              across all {nf.format(JOURNEY_SCALE.nodes)} nodes in the corpus.
            </p>
          </li>
        </ul>
      </section>

      {/* ------------------------------------------------------ scale */}
      <section className="altor-container py-16 md:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <SectionHeading index="03" title="The shape of the corpus" />
            <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-600">
              The corpus is not evenly distributed, and the skew is informative: lifecycle work
              clusters where entities change state most often.
            </p>
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.14em] text-ink-400">
              Journeys per category · all {CATEGORY_COUNT}
            </p>
          </div>

          <ol className="space-y-4">
            {JOURNEY_CATEGORY_COUNTS.map((c) => (
              <li key={c.id}>
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-sm font-medium text-ink-800">{c.title}</span>
                  <span className="font-mono text-sm text-ink-500">{c.count}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-ink-100">
                  <div
                    className="h-1.5 rounded-full bg-ink-900"
                    style={{ width: `${Math.max((c.count / MAX_CATEGORY) * 100, 2)}%` }}
                  />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------ rules */}
      <section className="altor-container py-16 md:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
          <div className="max-w-[760px]">
            <SectionHeading index="04" title="What holds it together" />
            <p className="mt-6 max-w-[62ch] text-lg leading-relaxed text-ink-600">
              Journeys do not run in isolation. Orchestration rules describe how they hand off,
              suppress and wake each other; global rules apply to every journey at once. Retired
              journey ids do not 404 — each one resolves into the journey that absorbed it.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 self-end">
            <div className="border-t border-line-strong pt-4">
              <p className="font-mono text-4xl font-medium tracking-tight text-ink-900">
                {RULE_COUNT}
              </p>
              <p className="mt-1.5 text-xs uppercase tracking-[0.14em] text-ink-500">
                Orchestration rules
              </p>
            </div>
            <div className="border-t border-line-strong pt-4">
              <p className="font-mono text-4xl font-medium tracking-tight text-ink-900">
                {GLOBAL_RULE_COUNT}
              </p>
              <p className="mt-1.5 text-xs uppercase tracking-[0.14em] text-ink-500">
                Global rules
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------- principles */}
      <section className="altor-container py-16 md:py-24">
        <SectionHeading index="05" title="Three positions the corpus takes" />
        <ol className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          <li>
            <p className="font-mono text-5xl font-medium text-ink-200">1</p>
            <p className="mt-4 text-base leading-relaxed text-ink-600">
              <strong className="font-semibold text-ink-900">Graphs, not sequences.</strong> A
              journey is where it forks, what each arm means, and what happens when a wait runs
              out — not a numbered list of steps.
            </p>
          </li>
          <li>
            <p className="font-mono text-5xl font-medium text-ink-200">2</p>
            <p className="mt-4 text-base leading-relaxed text-ink-600">
              <strong className="font-semibold text-ink-900">
                Entity state machines, not one customer timeline.
              </strong>{" "}
              {CANONICAL_COUNT} independent lifecycles beat one mythical funnel.
            </p>
          </li>
          <li>
            <p className="font-mono text-5xl font-medium text-ink-200">3</p>
            <p className="mt-4 text-base leading-relaxed text-ink-600">
              <strong className="font-semibold text-ink-900">
                Domain-neutral by construction.
              </strong>{" "}
              Nothing in a journey names an industry; the same machine runs wherever the entity
              exists.
            </p>
          </li>
        </ol>
      </section>

      {/* ---------------------------------- explore: the one dark plate */}
      <section className="bg-ink-950">
        <div className="altor-container py-20 md:py-28">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-400">06</p>
          <h2 className="mt-3 text-h2-fluid font-semibold text-white">Explore it</h2>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-ink-300">
            The full library is searchable and filterable by goal.
          </p>

          <ul className="mt-10 flex max-w-[880px] flex-wrap gap-2">
            {GOALS.map((g) => (
              <li
                key={g}
                className="rounded-full border border-line-inverse px-3 py-1 font-mono text-xs text-ink-300"
              >
                {GOAL_LABEL[g].en}
              </li>
            ))}
          </ul>
          <p className="mt-3 font-mono text-xs uppercase tracking-[0.14em] text-ink-500">
            The {GOALS.length} goals, as they filter
          </p>

          <div className="mt-12">
            <Link
              href="/lab/journeys"
              className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-500"
            >
              Open the library
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
