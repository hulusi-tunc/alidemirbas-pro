import Link from "next/link";
import PractitionerView from "@/components/PractitionerView";

import { Box, Plus, Quote, Scale, ShieldCheck, Split, Zap } from "lucide-react";

import JourneyCanvas from "@/components/JourneyCanvas";
import { InfoTile } from "@/components/ui/InfoTile";
import type { JourneyDetail, MergedRedirect } from "@/lib/canonical-view";
import { layoutJourneyCanvas } from "@/lib/journey-canvas-layout";
import { CHANNEL_LABEL, humanChannels, messageChannels } from "@/lib/journey-channels";
import type { copy, Lang } from "@/lib/content";

/** Everything the canvas needs from a journey, composed once so the figure
    inside the notes and the full-page canvas tab (JourneyRoutes) cannot
    disagree: the laid-out graph, the localised labels, the caption in
    counts, the channel names per node kind. Async because the layout is
    (ELK) - computed here on the server, shipped to the client island as a
    prop. Moved here from the now-retired JourneyVisualBody.tsx, whose only
    other content (a linear-chain-only "Recommended flow" card list) was a
    partial, duplicate rendering of the same `practitioner.timeline`/
    `.stopsWhen` data PractitionerView already covers in full - see
    JourneyDetailBody's own comment on the technical-details disclosure. */
export async function journeyCanvasProps(detail: JourneyDetail, lang: Lang, t: (typeof copy)[Lang]["lab"]["page"]) {
  const layout = await layoutJourneyCanvas(detail.nodes);
  const messageLabels = messageChannels(detail.channels).map((c) => ({ id: c, label: CHANNEL_LABEL[c][lang] }));
  const humanLabels = humanChannels(detail.channels).map((c) => ({ id: c, label: CHANNEL_LABEL[c][lang] }));
  const count = (kind: JourneyDetail["nodes"][number]["kind"]) => detail.nodes.filter((n) => n.kind === kind).length;
  const plural = (n: number, forms: readonly [string, string]) => `${n} ${forms[n === 1 ? 0 : 1]}`;
  const shape: { kind: "nodes" | "decisions" | "exits" | "handoffs"; label: string }[] = [{ kind: "nodes", label: `${detail.nodes.length} ${t.nodesLabel}` }];
  if (count("condition")) shape.push({ kind: "decisions", label: plural(count("condition"), t.decisionsLabel) });
  if (count("exit")) shape.push({ kind: "exits", label: plural(count("exit"), t.exitsLabel) });
  if (count("handoff")) shape.push({ kind: "handoffs", label: plural(count("handoff"), t.handoffsLabel) });
  const caption = shape.map((x) => x.label).join(" · ");
  const labels = {
    entry: t.canvas.entry,
    zoomIn: t.canvas.zoomIn,
    zoomOut: t.canvas.zoomOut,
    fitToView: t.canvas.fitToView,
    reset: t.canvas.reset,
    close: t.close,
    terminal: t.terminalLabel,
    lang,
  };
  return { nodes: detail.nodes, layout, labels, caption, shape, messageLabels, humanLabels };
}

/* Connector word for the Competes note's inline "on loss: <state>" clause.
   Everything else in that line (exclusionGroup, scope, onLoss) is canonical
   technical vocabulary and stays English on both locales, same as every
   other note column here (entityScope, guardrails, ...) - only this one
   word is UI-authored prose, so only it needs a TR counterpart. */
const ON_LOSS_PREFIX: Record<Lang, string> = { en: "on loss:", tr: "kaybedince:" };

/* The body of one journey, shared by the full page and the modal that
   intercepts it. A server component: it takes one journey's detail and hands
   the graph to a client island, so the browser receives this journey and no
   other.

   Composition, top to bottom: the canvas as a captioned figure, the reusable
   rule as the figure's stated takeaway, then the supporting notes in tiles
   (Reusable rule / Entity / Guardrails / Distinct from / Competes /
   Pre-empted by - every field here is base schema, present on any journey
   whether or not it has migrated to vNext, so this is the ONE default body
   every journey gets, not a fallback for journeys lacking richer data). The
   rule sits directly under the graph rather than last because it is what
   the graph is FOR - the one sentence a reader should leave with - and at the
   bottom of a long single column it read as a footnote.

   A migrated (vNext) journey ALSO carries `detail.practitioner`: the full
   trigger/eligibility/suppression/touch-plan/measurement write-up
   PractitionerView renders. That used to lead the page, open, above the
   graph - correct as documentation but wrong as a first screen: a reader
   met a wall of ruled technical sections (Trigger, Who enters, Suppressed
   when, Configure, Required data, Recommended flow, Channel roles, Stops
   when, Collision & priority, Measurement...) before ever seeing the one
   paragraph and three cards every other journey leads with, and the
   two-thirds of journeys that qualified for the old JourneyVisualBody
   shortcut (a partial, duplicate rendering of the same timeline/stopsWhen
   data, retired along with it - see journeyCanvasProps's comment above)
   got a DIFFERENT default layout again. Nothing in that write-up is lost:
   it now sits under one native <details> disclosure, closed by default,
   after the notes tiles - reachable by every reader, imposed on none. */

/* Journey Canvas is now the single journey-detail renderer for every
   canonical journey - CanonicalFlow's old vertical-list rendering is gone
   (see git history if it's ever needed again), and there is no more
   per-journey gate deciding which renderer a given id gets.

   JOURNEY_CANVAS_REGRESSION_FIXTURE below is NOT a rendering gate - nothing
   reads it to decide how a journey renders. It is a curated list the QA
   harness targets on every change (a fast, high-signal subset instead of
   the full corpus on every edit), kept here because this is where the ids were
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
   sample of the other public journeys, selected by bucketing the full
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
   cheaper than) the full-library sweep. Every journey renders through the
   same JourneyCanvas regardless of membership here.

   2026-09-05: 19 of the 39 are on the Operational surface, which was
   removed from the public site and archived (archive/operational-workflows/).
   Their /lab/journeys/ routes no longer exist, so qa-gate.mjs lists them
   under ARCHIVED_JOURNEYS and reaches them only through the env-gated
   /qa-canvas-sweep/<id> route. The ids stay in this Set on purpose - it
   records which journeys the fixture was built from, and the renderer
   still has to handle every one of them. */
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
  "ACT-17",
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

export default async function JourneyDetailBody({
  detail,
  merged,
  basePath,
  lang,
  t,
  showCanvas = true,
}: {
  detail: JourneyDetail;
  merged: MergedRedirect | null;
  basePath: string;
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
  /** The full page shows the graph on its own tab; the modal keeps it here. */
  showCanvas?: boolean;
}) {
  /* Localised once here rather than inside the canvas, which is a client
     island: the labels are static copy, so resolving them on the server
     keeps the channel vocabulary out of the browser bundle. The layout
     comes with them - laid out here, on the server, for the same reason. */
  const canvas = showCanvas ? await journeyCanvasProps(detail, lang, t) : null;
  return (
    <div>
      {/* A retired id resolves here rather than 404ing, and says so before
          anything else - the journey below is the survivor, not the id in
          the address bar. */}
      {merged ? (
        <p className="mb-6 rounded-2xl bg-paper px-5 py-4 text-sm leading-snug text-ink-muted ring-1 ring-ink-950/[0.06]">
          {t.mergedNote.replace("{from}", merged.from).replace("{to}", merged.to)}
        </p>
      ) : null}

      {canvas && <JourneyCanvas {...canvas} basePath={basePath} />}

      {/* The canonical archive's deeper note fields are still authored in
          English. Keep them on the English route only; the Turkish route
          stays fully Turkish instead of mixing translated journey copy with
          untranslated technical prose. */}
      {lang === "en" ? (
      <div className={`${showCanvas ? "mt-10" : ""} grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
        <InfoTile icon={<Quote />} title={t.ruleLabel} className="sm:col-span-2 lg:col-span-3">
          <p className="max-w-4xl text-xl leading-snug font-medium text-balance text-ink-950">{detail.reusableRule}</p>
        </InfoTile>

        <InfoTile icon={<Box />} tint="bg-teal-50 text-teal-700" title={t.entityLabel}>
          <p className="text-sm font-medium text-ink-950">{detail.entityScope}</p>
          <p className="mt-2 text-sm leading-relaxed text-pretty text-ink-muted">{detail.entityNote}</p>
        </InfoTile>

        <InfoTile icon={<ShieldCheck />} tint="bg-emerald-50 text-emerald-700" title={t.guardrailsLabel}>
          <ol className="flex list-none flex-col gap-3 p-0">
            {detail.guardrails.map((g, i) => (
              <li key={g} className="flex gap-3">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-paper-soft text-xs font-semibold text-ink-700 tabular-nums">{i + 1}</span>
                <span className="text-sm leading-relaxed text-pretty text-ink-muted">{g}</span>
              </li>
            ))}
          </ol>
        </InfoTile>

        {detail.distinctFrom.length ? (
          <InfoTile icon={<Split />} tint="bg-violet-50 text-violet-700" title={t.distinctLabel}>
            <ul className="flex list-none flex-col gap-3.5 p-0">
              {detail.distinctFrom.map((d) => (
                <li key={d.journey} className="text-sm leading-relaxed text-pretty text-ink-muted">
                  {d.slug ? (
                    <Link href={`${basePath}/${d.slug}`} className="font-medium text-ink-950 underline decoration-ink-300 underline-offset-4 hover:decoration-ink-950">
                      {d.name ?? d.journey}
                    </Link>
                  ) : (
                    <span className="font-medium text-ink-950">{d.name ?? d.journey}</span>
                  )}
                  <span className="mt-1 block">{d.because}</span>
                </li>
              ))}
            </ul>
          </InfoTile>
        ) : null}

        {detail.competition ? (
          <InfoTile icon={<Scale />} tint="bg-amber-50 text-amber-700" title={t.competesLabel}>
            <p className="text-sm font-medium text-ink-950">
              {detail.competition.exclusionGroup} · {detail.competition.scope} · {ON_LOSS_PREFIX[lang]} {detail.competition.onLoss}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-pretty text-ink-muted">{detail.competition.precedence}</p>
          </InfoTile>
        ) : null}

        {detail.preemptedBy.length ? (
          <InfoTile icon={<Zap />} tint="bg-amber-50 text-amber-700" title={t.preemptedLabel}>
            <ul className="flex list-none flex-col gap-3.5 p-0">
              {detail.preemptedBy.map((p) => (
                <li key={p.event} className="text-sm leading-relaxed text-pretty text-ink-muted">
                  <span className="font-medium text-ink-950">{p.event}</span>
                  <span className="mt-1 block">{p.then}</span>
                </li>
              ))}
            </ul>
          </InfoTile>
        ) : null}
      </div>
      ) : null}

      {/* vNext only: the practitioner's full write-up - trigger, eligibility,
          suppressions, touch plan, measurement - closed by default. Native
          <details>, same zero-client-JS disclosure FaqAccordion already
          uses elsewhere on the site, so opening it costs nothing on every
          other journey's page weight. */}
      {detail.practitioner && lang === "en" ? (
        <details className="group mt-10 rounded-2xl bg-paper ring-1 ring-ink-950/[0.06]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 text-sm font-medium text-ink-950 marker:content-none">
            {t.practitioner.technical}
            <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-paper-soft text-ink-500 transition-transform duration-200 group-open:rotate-45">
              <Plus className="size-4" />
            </span>
          </summary>
          <div className="border-t border-line-soft px-6 pb-6">
            <PractitionerView view={detail.practitioner} lang={lang} t={t.practitioner} basePath={basePath} />
          </div>
        </details>
      ) : null}
    </div>
  );
}
