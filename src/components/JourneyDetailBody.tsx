import Link from "next/link";

import JourneyCanvas from "@/components/JourneyCanvas";
import { CHANNEL_LABEL, humanChannels, messageChannels } from "@/lib/journey-channels";
import type { JourneyDetail, MergedRedirect } from "@/lib/canonical-view";
import type { copy, Lang } from "@/lib/content";

/* The body of one journey, shared by the full page and the modal that
   intercepts it. A server component: it takes one journey's detail and hands
   the graph to a client island, so the browser receives this journey and no
   other.

   Composition, top to bottom: the canvas as a captioned figure, the reusable
   rule as the figure's stated takeaway, then the supporting notes in columns.
   The rule sits directly under the graph rather than last because it is what
   the graph is FOR - the one sentence a reader should leave with - and at the
   bottom of a long single column it read as a footnote. The notes below it
   are reference material and are laid out as such: hairline-separated
   columns, not cards. */

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

  /* The caption: the journey's shape stated in counts. Only the parts that
     exist are named - a journey with no handoff says nothing about handoffs
     rather than "0 handoffs", which would be four words spent on an absence.
     Composed here rather than in the canvas for the same reason as the
     channel labels above: it is static copy, and the client island should
     not be carrying two locales' count words. */
  const count = (kind: JourneyDetail["nodes"][number]["kind"]) =>
    detail.nodes.filter((n) => n.kind === kind).length;
  const plural = (n: number, forms: readonly [string, string]) => `${n} ${forms[n === 1 ? 0 : 1]}`;
  const caption = [
    `${detail.nodes.length} ${t.nodesLabel}`,
    count("condition") ? plural(count("condition"), t.decisionsLabel) : null,
    count("exit") ? plural(count("exit"), t.exitsLabel) : null,
    count("handoff") ? plural(count("handoff"), t.handoffsLabel) : null,
  ]
    .filter(Boolean)
    .join(" · ");

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
        caption={caption}
        messageLabels={messageLabels}
        humanLabels={humanLabels}
      />

      {/* The takeaway, stated at the size of a takeaway. Ruled top and bottom
          so it reads as a pulled statement rather than another paragraph -
          the heavier top rule ties it to the figure it belongs to, the
          lighter bottom rule hands off to the notes. */}
      <section className="mt-10 border-t border-ink-900 border-b border-b-line pt-6 pb-7">
        <p className="font-mono text-[11px] tracking-[0.1em] text-ink-400 uppercase">{t.ruleLabel}</p>
        <p className="mt-3 max-w-4xl text-[clamp(1.125rem,0.95rem+0.85vw,1.6rem)] leading-[1.32] font-medium tracking-[-0.01em] text-balance text-ink-950">
          {detail.reusableRule}
        </p>
      </section>

      {/* The notes, as columns rather than one narrow stack. Each cell is
          separated by a hairline on its leading edge and nothing else: no
          card, no fill, no radius - the rules do the dividing and the type
          does the ranking. Competes and Pre-empted by are rare (a handful of
          journeys carry either) and flow into the same grid where they exist,
          so they are separated the same way instead of getting a treatment of
          their own. */}
      <div className="mt-8 grid grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3 lg:gap-x-10">
        <NoteColumn label={t.entityLabel}>
          <p className="font-mono text-[13px] leading-snug text-ink-900">{detail.entityScope}</p>
          <p className="mt-3 text-sm leading-relaxed text-pretty text-ink-600">{detail.entityNote}</p>
        </NoteColumn>

        {detail.distinctFrom.length ? (
          <NoteColumn label={t.distinctLabel}>
            <ul className="space-y-3.5">
              {detail.distinctFrom.map((d) => (
                <li key={d.journey} className="text-sm leading-relaxed text-pretty text-ink-600">
                  {d.slug ? (
                    <Link
                      href={`${basePath}/${d.slug}`}
                      className="font-mono text-[13px] text-blue-700 hover:underline"
                    >
                      {d.journey}
                    </Link>
                  ) : (
                    <span className="font-mono text-[13px] text-ink-900">{d.journey}</span>
                  )}
                  {d.name ? <span className="text-ink-800"> {d.name}</span> : null}
                  <span className="mt-1 block">{d.because}</span>
                </li>
              ))}
            </ul>
          </NoteColumn>
        ) : null}

        {/* Numbered because guardrails are a checklist a reader works
            through, not a paragraph - and the numbers give the longest
            column in the grid something to scan by. */}
        <NoteColumn label={t.guardrailsLabel}>
          <ol className="space-y-3.5">
            {detail.guardrails.map((g, i) => (
              <li key={g} className="flex gap-3">
                <span className="shrink-0 pt-0.5 font-mono text-[11px] text-ink-300 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm leading-relaxed text-pretty text-ink-600">{g}</span>
              </li>
            ))}
          </ol>
        </NoteColumn>

        {detail.competition ? (
          <NoteColumn label={t.competesLabel}>
            <p className="font-mono text-[13px] leading-snug text-ink-900">
              {detail.competition.exclusionGroup} · {detail.competition.scope} · on loss:{" "}
              {detail.competition.onLoss}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-pretty text-ink-600">
              {detail.competition.precedence}
            </p>
          </NoteColumn>
        ) : null}

        {/* Two journeys in the library carry this. It is rendered where it
            exists and shipped nowhere else. */}
        {detail.preemptedBy.length ? (
          <NoteColumn label={t.preemptedLabel}>
            <ul className="space-y-3.5">
              {detail.preemptedBy.map((p) => (
                <li key={p.event} className="text-sm leading-relaxed text-pretty text-ink-600">
                  <span className="font-mono text-[13px] text-ink-900">{p.event}</span>
                  <span className="mt-1 block">{p.then}</span>
                </li>
              ))}
            </ul>
          </NoteColumn>
        ) : null}
      </div>
    </div>
  );
}

/* One cell of the notes grid. The hairline sits on the leading edge at every
   breakpoint including mobile, where the grid is a single column - a rule
   above each stacked note would read as a section divider and re-introduce
   exactly the undifferentiated vertical list this layout replaces. */
function NoteColumn({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-l border-line pl-5">
      <p className="mb-3 font-mono text-[11px] tracking-[0.1em] text-ink-400 uppercase">{label}</p>
      {children}
    </section>
  );
}
