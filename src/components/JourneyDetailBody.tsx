import Link from "next/link";

import JourneyCanvas from "@/components/JourneyCanvas";
import { CHANNEL_LABEL, humanChannels, messageChannels } from "@/lib/journey-channels";
import type { JourneyDetail, MergedRedirect } from "@/lib/canonical-view";
import type { copy, Lang } from "@/lib/content";

/* The body of one journey, shared by the full page and the modal that
   intercepts it. A server component: it takes one journey's detail and hands
   the graph to a client island, so the browser receives this journey and no
   other. */

/* Journey Canvas is now the single journey-detail renderer for all 255
   canonical journeys - CanonicalFlow's old vertical-list rendering is gone
   (see git history if it's ever needed again), and there is no more
   per-journey gate deciding which renderer a given id gets.

   JOURNEY_CANVAS_REGRESSION_FIXTURE below is NOT a rendering gate - nothing
   reads it to decide how a journey renders. It is a curated list the QA
   harness targets on every change (a fast, high-signal subset instead of
   the full 255 on every edit), kept here because this is where the ids were
   chosen and the reasoning for each one lives. It has two tiers, kept
   deliberately separate because they answer two different questions:

   TIER 1 - EXTREME/TOPOLOGY STRESS COVERAGE (14 journeys). Chosen to prove
   the renderer survives deliberately difficult structures: ACQ-01 is the
   reference implementation; RET-27/REL-97/SCH-178 exercise a merge-free
   linear journey, a single 4-way condition, and a genuine cycle. SUB-166
   (largest graph, 23 nodes), OWN-54 (deepest path, 17 rows, and the
   longest node title in the library, 483 chars), FBK-43 (widest branch,
   6-way fan-out, re-forks after its own merge), DOC-216 (heaviest
   reconvergence, 5 true merges), CTL-231 (condition-immediately-after-
   condition chained six deep), OPS-121 (two waits, dense handoffs),
   DEC-183 (6 handoffs, a second nested-condition chain), TIM-61 (a second,
   structurally different cycle - two back-edges converging on one wait
   target, vs SCH-178's single back-edge), RSK-194 (non-adjacent nested
   conditions, longest branch label at the time, 57 chars), and ACT-15
   (the smallest journey in the library, 5 nodes). See journey-canvas-
   layout.ts's own comments for what each one forced the layout engine to
   generalize.

   TIER 2 - POPULATION/DISTRIBUTION COVERAGE (25 journeys). A stratified
   sample of the other 241 journeys, selected by bucketing the full
   library across node count, depth, branch fan-out, condition/merge/wait
   density, cycles, handoff density and terminal structure, then greedily
   picking journeys that closed the biggest gaps against Tier 1's own
   (heavily extreme-skewed) coverage - not more maxima, but the ordinary
   middle of the distribution Tier 1 doesn't represent: TIM-68 and CMS-203
   carry the library's next-longest node title (432 chars) and branch
   label (73 chars) once Tier 1's own record-holders are excluded; the
   rest span 24 further categories at typical (not extreme) node counts,
   depths and branch widths, plus four more independently-shaped cycles
   (INC-255, TRM-110, SCH-172, ACT-17) so cycle handling isn't proven only
   against SCH-178/TIM-61's two shapes. See the selection report for the
   full bucketing method and before/after coverage numbers.

   Together these 39 are the permanent visual regression fixture the QA
   harness runs after every renderer change, distinct from (and much
   cheaper than) the full 255-journey sweep. All 255 journeys render through
   the same JourneyCanvas regardless of membership here. */
export const JOURNEY_CANVAS_REGRESSION_FIXTURE: ReadonlySet<string> = new Set([
  // Tier 1 - extreme/topology stress coverage
  "ACQ-01",
  "RET-27",
  "REL-97",
  "SCH-178",
  "SUB-166",
  "OWN-54",
  "FBK-43",
  "DOC-216",
  "CTL-231",
  "OPS-121",
  "DEC-183",
  "TIM-61",
  "RSK-194",
  "ACT-15",
  // Tier 2 - population/distribution coverage
  "TIM-68",
  "CMS-203",
  "INC-255",
  "REM-160",
  "TRM-110",
  "OWN-56",
  "SCH-172",
  "DEC-189",
  "FIN-140",
  "REL-99",
  "RET-30",
  "INT-119",
  "FUL-150",
  "SUB-167",
  "DAT-227",
  "DOC-214",
  "IDN-89",
  "CTL-234",
  "RLT-241",
  "ACT-17",
  "OPS-126",
  "ACQ-08",
  "CON-32",
  "FBK-48",
  "ACC-73",
]);

export default function JourneyDetailBody({
  detail,
  merged,
  basePath,
  lang,
  t,
}: {
  detail: JourneyDetail;
  merged: MergedRedirect | null;
  basePath: string;
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
}) {
  /* Localised once here rather than inside the canvas, which is a client
     island: the labels are static copy, so resolving them on the server
     keeps the channel vocabulary out of the browser bundle. */
  const messageLabels = messageChannels(detail.channels).map((c) => CHANNEL_LABEL[c][lang]);
  const humanLabels = humanChannels(detail.channels).map((c) => CHANNEL_LABEL[c][lang]);

  return (
    <div>
      {/* A retired id resolves here rather than 404ing, and says so before
          anything else - the journey below is the survivor, not the id in
          the address bar. */}
      {merged ? (
        <p className="mb-6 border border-line bg-paper-soft px-4 py-3 text-[13px] leading-snug text-ink-600">
          {t.mergedNote.replace("{from}", merged.from).replace("{to}", merged.to)}
        </p>
      ) : null}

      <section className="mb-8">
        <JourneyCanvas
          nodes={detail.nodes}
          basePath={basePath}
          labels={{
            entry: t.canvas.entry,
            zoomIn: t.canvas.zoomIn,
            zoomOut: t.canvas.zoomOut,
            fitToView: t.canvas.fitToView,
            reset: t.canvas.reset,
            close: t.close,
            terminal: t.terminalLabel,
          }}
          messageLabels={messageLabels}
          humanLabels={humanLabels}
        />
      </section>

      {/* The shell around the canvas goes wide (§2: the canvas needs
          70-80% of the viewport); everything below is prose, so it
          re-narrows to the same reading width every other page on the
          site already uses, rather than stretching guardrail sentences
          across 1400px. */}
      <div className="mx-auto max-w-3xl">
        <section className="mb-6">
          <p className="altor-eyebrow text-ink-400">{t.entityLabel}</p>
          <p className="mt-1 text-sm text-ink-700">{detail.entityScope}</p>
          <p className="mt-1 text-[13px] leading-snug text-ink-500">{detail.entityNote}</p>
        </section>

        {detail.competition ? (
          <section className="mb-6">
            <p className="altor-eyebrow text-ink-400">{t.competesLabel}</p>
            <p className="mt-1 text-sm text-ink-700">
              {detail.competition.exclusionGroup} · {detail.competition.scope} · on loss:{" "}
              {detail.competition.onLoss}
            </p>
            <p className="mt-1 text-[13px] leading-snug text-ink-500">
              {detail.competition.precedence}
            </p>
          </section>
        ) : null}

        {/* Two journeys in the library carry this. It is rendered where it
            exists and shipped nowhere else. */}
        {detail.preemptedBy.length ? (
          <section className="mb-6">
            <p className="altor-eyebrow text-ink-400">{t.preemptedLabel}</p>
            <ul className="mt-1 space-y-2">
              {detail.preemptedBy.map((p) => (
                <li key={p.event} className="text-[13px] leading-snug text-ink-500">
                  <span className="text-ink-700">{p.event}</span> - {p.then}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {detail.distinctFrom.length ? (
          <section className="mb-6">
            <p className="altor-eyebrow text-ink-400">{t.distinctLabel}</p>
            <ul className="mt-1 space-y-2">
              {detail.distinctFrom.map((d) => (
                <li key={d.journey} className="text-[13px] leading-snug text-ink-500">
                  {d.slug ? (
                    <Link href={`${basePath}/${d.slug}`} className="font-mono text-blue-700 hover:underline">
                      {d.journey}
                    </Link>
                  ) : (
                    <span className="font-mono text-ink-700">{d.journey}</span>
                  )}
                  {d.name ? <span className="text-ink-600"> {d.name}</span> : null} - {d.because}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mb-6">
          <p className="altor-eyebrow text-ink-400">{t.guardrailsLabel}</p>
          <ul className="mt-1 space-y-1.5">
            {detail.guardrails.map((g) => (
              <li key={g} className="text-[13px] leading-snug text-ink-600">
                {g}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="altor-eyebrow text-ink-400">{t.ruleLabel}</p>
          <p className="mt-1 text-sm leading-snug text-ink-700">{detail.reusableRule}</p>
        </section>
      </div>
    </div>
  );
}
