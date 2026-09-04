import JourneyCanvas from "@/components/JourneyCanvas";
import { CHANNEL_LABEL, humanChannels, messageChannels } from "@/lib/journey-channels";
import type { JourneyDetail } from "@/lib/canonical-view";
import type { ConfigRow, TimelineStep } from "@/lib/practitioner-view";
import type { copy, Lang } from "@/lib/content";

/* GENERALIZED (2026-09-04) from the quote-abandonment pilot (see git history
   for QuoteAbandonmentVisualBody.tsx, which this replaces) into a component
   that renders correctly for any journey - no per-journey authored copy.

   Card 1 is `detail.purpose` verbatim - already free text, already read by
   the header everywhere else. Cards 2 and 3 are projected mechanically from
   `detail.practitioner.timeline` and `.stopsWhen`, the same canonical fields
   PractitionerView already reads for the technical page - not a second
   source of truth, and nothing paraphrased or invented:

   - Card 2's stage titles are `timeline[].stage` (a kebab-case id, e.g.
     "final-notice") with hyphens turned to spaces and the first letter
     capitalised - not reworded.
   - Card 2's timing takes the touch's own wait window, but prefers the
     APPLIED PRESET's override when the current page is a preset that
     changes it (found via `configure[].usedBy` matching `wait <waitId>` -
     the same join PractitionerView's Configure section already uses) -
     otherwise a preset page would show its parent's un-overridden number,
     which is exactly the bug an earlier hand-written version of this page
     would have shipped if the pilot's own numbers had been read from the
     wrong field.
   - Card 3's bullets are the exit/handoff's own `state`/`on` clause, cut at
     its first semicolon (canonical prose here is consistently written as
     "short clause; longer explanation") - a mechanical trim, not a rewrite.

   ENGLISH ON BOTH LOCALES. Every string above is canonical free text, and
   canonical free text stays English on the TR site everywhere else in this
   codebase (a journey's own `purpose`, a calculator's editorial content) -
   this component keeps that rule rather than machine-translating 60+
   journeys' worth of technical prose at build time. Only the four section
   labels below are real bilingual UI copy.

   SCOPE, decided by the caller (JourneyRoutes.tsx), not this file: a
   journey qualifies only if its touches form one straight chain (no two
   touches sharing an `after`) - a flat numbered list would misrepresent a
   journey with real alternate branches, so those keep the technical page.
   See that file's `canUseVisualBody`. */

const UI = {
  en: {
    flowHeading: "Journey flow",
    whatEyebrow: "What this journey does",
    flowEyebrow: "Recommended flow",
    stopsEyebrow: "Stops when",
    onEntry: "On entry",
    afterPreviousTouch: "after the previous touch",
    afterEntry: "after entry",
  },
  tr: {
    flowHeading: "Journey akışı",
    whatEyebrow: "Bu journey ne yapar",
    flowEyebrow: "Önerilen akış",
    stopsEyebrow: "Şu durumlarda durur",
    onEntry: "On entry",
    afterPreviousTouch: "after the previous touch",
    afterEntry: "after entry",
  },
} as const;

function stageTitle(stage: string): string {
  const s = stage.replace(/[-_]/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** The touch's own wait timing, but the applied preset's override when the
    current page is a preset that changes this exact wait's config key. */
function effectiveTiming(step: TimelineStep, configure: readonly ConfigRow[]): string {
  if (!step.gate) return UI.en.onEntry;
  const row = configure.find((c) => c.usedBy.includes(`wait ${step.gate!.waitId}`));
  return row?.override ?? step.gate.timing;
}

function timingPhrase(step: TimelineStep, timing: string): string {
  if (!step.gate) return timing;
  if (step.gate.relativeTo === "previous-touch") return `${timing} ${UI.en.afterPreviousTouch}`;
  if (step.gate.relativeTo === "trigger") return `${timing} ${UI.en.afterEntry}`;
  if (step.gate.relativeTo === "attribute" && step.gate.attribute) {
    // Attribute names are consistently "some_thing_at" (a timestamp field
    // name, e.g. "last_activity_at", "offer_closes_at") - the trailing "_at"
    // is a naming convention, not part of what a reader should say aloud.
    const human = step.gate.attribute.replace(/_at$/, "").replace(/_/g, " ");
    return `${timing} after ${human}`;
  }
  return timing;
}

/** Canonical exit/handoff prose is consistently "short clause; longer
    explanation" - this takes the short clause, or the whole thing when
    there is no semicolon to cut at. */
function firstClause(text: string): string {
  const cut = text.indexOf(";");
  const clause = (cut === -1 ? text : text.slice(0, cut)).trim();
  return clause.charAt(0).toUpperCase() + clause.slice(1);
}

function Card({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="rounded-card border border-line bg-paper p-6">
      <p className="font-mono text-[11px] font-medium tracking-[0.1em] text-ink-400 uppercase">{eyebrow}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default function JourneyVisualBody({
  detail,
  basePath,
  lang,
  t,
}: {
  detail: JourneyDetail;
  basePath: string;
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
}) {
  const ui = UI[lang];
  const p = detail.practitioner!; // caller only routes here when this is non-null (see canUseVisualBody)
  const messageLabels = messageChannels(detail.channels).map((c) => CHANNEL_LABEL[c][lang]);
  const humanLabels = humanChannels(detail.channels).map((c) => CHANNEL_LABEL[c][lang]);

  const count = (kind: JourneyDetail["nodes"][number]["kind"]) => detail.nodes.filter((n) => n.kind === kind).length;
  const plural = (n: number, forms: readonly [string, string]) => `${n} ${forms[n === 1 ? 0 : 1]}`;
  const caption = [
    `${detail.nodes.length} ${t.nodesLabel}`,
    count("condition") ? plural(count("condition"), t.decisionsLabel) : null,
    count("exit") ? plural(count("exit"), t.exitsLabel) : null,
    count("handoff") ? plural(count("handoff"), t.handoffsLabel) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const stops = [
    ...p.stopsWhen.exits.map((e) => firstClause(e.state)),
    ...p.stopsWhen.handoffs.map((h) => firstClause(h.on)),
  ];

  return (
    <div>
      {/* The graph leads - the page's primary visual element, same component
          and same interaction (pan, zoom, node detail) as every other
          journey's canvas, only moved above the notes instead of below
          them and given a plain-language heading. */}
      <h2 className="text-base font-semibold tracking-tight text-ink-950">{ui.flowHeading}</h2>
      <div className="mt-4">
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
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card eyebrow={ui.whatEyebrow}>
          <p className="text-[14px] leading-relaxed text-pretty text-ink-700">{detail.purpose}</p>
        </Card>

        <Card eyebrow={ui.flowEyebrow}>
          <ol className="flex flex-col gap-3.5">
            {p.timeline.map((step, i) => (
              <li key={step.id} className="flex gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-ink-950 font-mono text-[10px] font-semibold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[13.5px] font-medium text-ink-900">{stageTitle(step.stage)}</p>
                  <p className="mt-0.5 text-[12.5px] leading-snug text-ink-500">
                    {timingPhrase(step, effectiveTiming(step, p.configure))}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <Card eyebrow={ui.stopsEyebrow}>
          <ul className="flex flex-col gap-2">
            {stops.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-[13.5px] leading-snug text-ink-700">
                <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-ink-400" />
                {s}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
