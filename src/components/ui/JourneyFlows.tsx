import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";

import {
  Connector, FlowStrip, Fork, ForkArm, JourneyNode, NODE_KIND_META, kindLabel, nodeById,
} from "@/components/ui/JourneyVisuals";
import {
  FEATURED_JOURNEY, JOURNEY_CATEGORY_COUNTS, JOURNEY_SCALE, showcaseCards,
} from "@/lib/journey-marketing";
import { copy, type Lang } from "@/lib/content";

/* Composed journey diagrams. Each one teaches a DIFFERENT thing and uses a
   DIFFERENT composition - the brief's hardest constraint, and the reason
   these are hand-built rather than one diagram component reused six times:

     VISUAL-J01  hero canvas        the whole graph, at a glance
     VISUAL-J02  trigger evidence   two facing columns - what counts, what doesn't
     VISUAL-J03  branch fork        a single fork, enlarged, both arms named
     VISUAL-J04  wait timeline      a horizontal rail - time, not sequence
     VISUAL-J05  anatomy            the whole graph again, but annotated
     VISUAL-J06  handoff inspector  ONE node, zoomed - the scale change
     VISUAL-J07  library flow cards journeys as flows, cropped

   All of them read from FEATURED_JOURNEY (ACQ-01) or the corpus counts.
   Every string below that is not a UI label is a real canonical field. */

const J = FEATURED_JOURNEY;
const nf = (lang: Lang, n: number) => n.toLocaleString(lang === "en" ? "en-US" : "tr-TR");

/* ====================================================================
   VISUAL-J01 — Hero journey canvas
   ==================================================================== */

export function JourneyCanvas({ lang }: { lang: Lang }) {
  const t = copy[lang].journeyBuilder;
  const n = (id: string) => nodeById(J.nodes, id);
  const trigger = n("t.threshold");
  const cIdentity = n("c.identity");
  const wIdentity = n("w.identity");
  const xStale = n("x.stale");
  const aReconcile = n("a.reconcile");
  const cEligible = n("c.eligible");
  const hQual = n("h.qualification");
  const xKnown = n("x.known-only");
  if (!trigger || !cIdentity || !wIdentity || !xStale || !aReconcile || !cEligible || !hQual || !xKnown) return null;

  const branchLabel = (nodeId: string, i: number) => n(nodeId)?.edges[i]?.label ?? "";

  return (
    <div className="overflow-hidden rounded-card border border-line-soft bg-paper shadow-[0_30px_70px_-30px_rgba(3,17,63,0.3)]">
      {/* canvas toolbar — real id, category and node count, nothing invented */}
      <div className="flex items-center justify-between gap-3 border-b border-line-soft bg-paper-soft/70 px-4 py-2.5">
        <span className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-[11px] text-ink-400 tabular-nums">{J.id}</span>
          <span aria-hidden className="text-ink-200">/</span>
          <span className="truncate text-xs text-ink-600">{J.categoryTitle}</span>
        </span>
        <span className="shrink-0 font-mono text-[11px] text-ink-400 tabular-nums">
          {J.nodeCount} {t.canvas.nodes}
        </span>
      </div>

      <div className="px-4 py-6 sm:px-7 sm:py-8">
        <div className="mx-auto flex max-w-lg flex-col">
          <JourneyNode kind="trigger" title={trigger.label} detail={trigger.detail} lang={lang} />
          <Connector />
          <JourneyNode kind="condition" title={cIdentity.label} lang={lang} />

          {/* the identity fork: deterministic rejoins, probabilistic waits */}
          <Fork>
            <ForkArm label={branchLabel("c.identity", 0)}>
              {/* no h-full: Fork is a 2-col grid, so a stretching child here
                  rendered as a large empty box next to the taller wait arm.
                  This is a label on the rejoining path, not a node. */}
              <div className="self-start rounded-md border border-dashed border-line-strong bg-paper-soft/60 px-3 py-2.5">
                <p className="text-[11px] leading-snug text-ink-500">{t.canvas.rejoins}</p>
              </div>
            </ForkArm>
            <ForkArm label={branchLabel("c.identity", 1)}>
              <JourneyNode kind="wait" title={wIdentity.label} lang={lang} size="sm" />
              <Fork nested>
                <ForkArm label={branchLabel("w.identity", 0)}>
                  <div className="rounded-md border border-dashed border-line-strong bg-paper-soft/60 px-2.5 py-2">
                    <p className="text-[10px] leading-snug text-ink-500">{t.canvas.rejoins}</p>
                  </div>
                </ForkArm>
                <ForkArm label={branchLabel("w.identity", 1)}>
                  <JourneyNode kind="exit" title={xStale.label} lang={lang} size="sm" />
                </ForkArm>
              </Fork>
            </ForkArm>
          </Fork>

          {/* the converge back into the shared action */}
          <div aria-hidden className="mx-auto mt-5 h-px w-1/2 bg-line-strong sm:w-2/3" />
          <Connector height="h-5" />
          <JourneyNode kind="action" title={aReconcile.label} lang={lang} />
          <Connector />
          <JourneyNode kind="condition" title={cEligible.label} lang={lang} />
          <Fork>
            <ForkArm label={branchLabel("c.eligible", 0)}>
              <JourneyNode kind="handoff" title={hQual.label} detail={J.handoff?.toName ?? undefined} lang={lang} size="sm" />
            </ForkArm>
            <ForkArm label={branchLabel("c.eligible", 1)}>
              <JourneyNode kind="exit" title={xKnown.label} lang={lang} size="sm" />
            </ForkArm>
          </Fork>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================
   VISUAL-J02 — Trigger evidence: two facing columns
   Teaches: a journey refuses to start on a weak signal. The
   `insufficientAlone` field is the whole point and has no equivalent
   anywhere on the A/B page.
   ==================================================================== */

export function TriggerEvidence({ lang }: { lang: Lang }) {
  const t = copy[lang].journeyBuilder.story1;
  return (
    <div className="rounded-card border border-line-soft bg-paper p-5 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="altor-eyebrow text-ink-400">{t.caption}</p>
        <span className="font-mono text-[11px] text-ink-400">{J.trigger.source}</span>
      </div>

      <div className="mt-4">
        <JourneyNode kind="trigger" title={J.trigger.event} lang={lang} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-primary-700 uppercase">
            <Check aria-hidden className="size-3" />
            {t.requires}
          </p>
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {J.trigger.requires.map((r) => (
              <li key={r} className="flex gap-2 text-[12px] leading-snug text-ink-700">
                <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-primary-600" />
                {r}
              </li>
            ))}
          </ul>
        </div>
        <div className="sm:border-l sm:border-line-soft sm:pl-5">
          <p className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-ink-400 uppercase">
            <Minus aria-hidden className="size-3" />
            {t.insufficient}
          </p>
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {J.trigger.insufficientAlone.map((r) => (
              <li key={r} className="flex gap-2 text-[12px] leading-snug text-ink-400 line-through decoration-ink-200">
                <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-ink-200" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================
   VISUAL-J03 — The fork, enlarged. Both arms carry their real `when`.
   ==================================================================== */

export function BranchFork({ lang }: { lang: Lang }) {
  const t = copy[lang].journeyBuilder.story2;
  return (
    <div className="rounded-card border border-line-soft bg-paper p-5 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="altor-eyebrow text-ink-400">{t.caption}</p>
        <span className="font-mono text-[11px] text-ink-400 tabular-nums">
          {nf(lang, JOURNEY_SCALE.conditions)} {t.conditionsLabel}
        </span>
      </div>

      <div className="mt-4">
        <JourneyNode kind="condition" title={J.branch.asks} lang={lang} />
      </div>

      <div aria-hidden className="mx-auto mt-4 flex h-4 justify-center">
        <span className="w-px bg-line-strong" />
      </div>
      <div aria-hidden className="mx-auto h-px w-2/3 bg-line-strong" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        {J.branch.branches.map((b, i) => (
          <div key={b.label} className="flex flex-col">
            <div aria-hidden className="mx-auto flex h-4 justify-center">
              <span className="w-px bg-line-strong" />
            </div>
            <span
              className={`mx-auto mb-2.5 rounded-full border px-3 py-1 text-[11px] font-medium ${
                i === 0
                  ? "border-primary-200 bg-primary-50 text-primary-700"
                  : "border-line-soft bg-paper-soft text-ink-600"
              }`}
            >
              {b.label}
            </span>
            <p className="rounded-md border border-line-soft bg-paper-soft/60 px-3.5 py-3 text-[12px] leading-relaxed text-ink-600">
              {b.when}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-5 border-t border-line-soft pt-4 text-[12px] text-ink-500">{t.note}</p>
    </div>
  );
}

/* ====================================================================
   VISUAL-J04 — The wait, as a horizontal time rail.
   Teaches: TIME. The one dimension the A/B page does not have.
   ==================================================================== */

export function WaitTimeline({ lang }: { lang: Lang }) {
  const t = copy[lang].journeyBuilder.story3;
  const w = J.wait;
  if (!w) return null;
  return (
    <div className="rounded-card border border-line-soft bg-paper p-5 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="altor-eyebrow text-ink-400">{t.caption}</p>
        <span className="font-mono text-[11px] text-ink-400 tabular-nums">
          {nf(lang, JOURNEY_SCALE.waits)} {t.waitsLabel}
        </span>
      </div>

      {/* the rail: entry, an open dashed span, and two named ends */}
      <div className="mt-6">
        <div className="flex items-center">
          <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-ink-300" />
          <span aria-hidden className="h-px flex-1 border-t border-dashed border-ink-300" />
          <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-ink-300" />
        </div>
        <div className="mt-2 flex items-start justify-between gap-4">
          <span className="max-w-[45%] text-[11px] leading-snug text-ink-500">{t.opens}</span>
          <span className="max-w-[45%] text-right text-[11px] leading-snug text-ink-500">
            {w.timeoutAfter}
          </span>
        </div>
      </div>

      {/* the two arms, as outcomes of the same pause */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-primary-200 bg-primary-50 px-3.5 py-3">
          <p className="font-mono text-[10px] tracking-wider text-primary-700 uppercase">{t.onEvent}</p>
          <p className="mt-1 text-[12px] leading-snug text-ink-800">{w.until.join(", ")}</p>
        </div>
        <div className="rounded-md bg-ink-950 px-3.5 py-3">
          <p className="font-mono text-[10px] tracking-wider text-white/45 uppercase">{t.onTimeout}</p>
          <p className="mt-1 text-[12px] leading-snug text-white/80">{w.timeoutReason}</p>
        </div>
      </div>

      {/* the field that makes the window real rather than nominal */}
      <p className="mt-5 flex items-center gap-2 border-t border-line-soft pt-4 font-mono text-[11px] text-ink-500">
        windowExtendsOnEngagement
        <span className="rounded-xs bg-paper-soft px-1.5 py-0.5 text-ink-700">
          {String(w.extendsOnEngagement)}
        </span>
      </p>
      <p className="mt-1.5 text-[12px] leading-snug text-ink-500">{t.note}</p>
    </div>
  );
}

/* ====================================================================
   VISUAL-J06 — Node inspector: ONE node, zoomed.
   The page's deliberate scale change, per the brief's "shift between the
   whole product and a small product detail".
   ==================================================================== */

export function HandoffInspector({ lang }: { lang: Lang }) {
  const t = copy[lang].journeyBuilder.inspector;
  const h = J.handoff;
  if (!h) return null;
  const meta = NODE_KIND_META.handoff;
  const Icon = meta.icon;
  return (
    <div className="overflow-hidden rounded-card border border-line-soft bg-paper">
      <div className="flex items-center gap-2 border-b border-line-soft bg-paper-soft/70 px-4 py-2.5">
        <span aria-hidden className={`h-4 w-[3px] rounded-full ${meta.rule}`} />
        <Icon aria-hidden className="size-3.5 text-ink-400" />
        <span className="font-mono text-[10px] tracking-wider text-ink-500 uppercase">
          {kindLabel("handoff", lang)}
        </span>
        <span className="ml-auto font-mono text-[11px] text-ink-400">{J.id}</span>
      </div>

      <dl className="divide-y divide-line-soft">
        <div className="grid grid-cols-[5.5rem_1fr] gap-3 px-4 py-3">
          <dt className="font-mono text-[11px] text-ink-400">{t.to}</dt>
          <dd className="min-w-0">
            <span className="font-mono text-[12px] text-primary-700">{h.to}</span>
            {h.toName && <span className="mt-0.5 block text-[12px] leading-snug text-ink-600">{h.toName}</span>}
          </dd>
        </div>
        <div className="grid grid-cols-[5.5rem_1fr] gap-3 px-4 py-3">
          <dt className="font-mono text-[11px] text-ink-400">{t.on}</dt>
          <dd className="text-[12px] leading-snug text-ink-700">{h.on}</dd>
        </div>
        <div className="grid grid-cols-[5.5rem_1fr] gap-3 px-4 py-3">
          <dt className="font-mono text-[11px] text-ink-400">{t.carries}</dt>
          <dd>
            <ul className="flex flex-col gap-1.5">
              {h.carries.map((c) => (
                <li key={c} className="flex gap-2 text-[12px] leading-snug text-ink-700">
                  <span aria-hidden className="mt-1.5 size-1 shrink-0 rounded-full bg-primary-600" />
                  {c}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
    </div>
  );
}

/* ====================================================================
   VISUAL-J07 — Library showcase: journeys as FLOWS, cropped.
   The Peerbie-screenshot-1 moment, but a journey card is a flow object,
   not an article card - the mini node strip is what makes that read.
   ==================================================================== */

function JourneyCardTile({
  card, centre, lang,
}: {
  card: ReturnType<typeof showcaseCards>[number];
  centre: boolean;
  lang: Lang;
}) {
  const t = copy[lang].journeyBuilder.library;
  return (
    <Link
      href={card.href}
      className={`flex w-[19rem] shrink-0 snap-center flex-col rounded-card border bg-paper p-5 transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:border-line-strong lg:w-[20rem] ${
        centre
          ? "border-line-strong shadow-[0_20px_50px_-24px_rgba(3,17,63,0.4)]"
          : "border-line-soft shadow-[0_10px_30px_-24px_rgba(3,17,63,0.3)]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-ink-400 tabular-nums">{card.id}</span>
        <span
          title={card.categoryTitle}
          className="max-w-[11rem] truncate rounded-xs bg-paper-soft px-2 py-0.5 text-[10px] text-ink-500"
        >
          {card.categoryTitle}
        </span>
      </div>
      <p className="mt-3 min-h-[3.25rem] text-[14px] leading-snug font-medium text-ink-950">{card.name}</p>
      <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-ink-500">{card.purpose}</p>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line-soft pt-3.5">
        <FlowStrip strip={card.strip} lang={lang} />
        <span className="font-mono text-[10px] whitespace-nowrap text-ink-400 tabular-nums">
          {card.nodeCount} {t.nodes}
        </span>
      </div>
    </Link>
  );
}

export function JourneyLibrarySpread({ lang }: { lang: Lang }) {
  const cards = showcaseCards(lang);
  const t = copy[lang].journeyBuilder.library;
  return (
    <div>
      {/* real categories, real counts — a curated top slice, not all 26 */}
      <div className="flex flex-wrap justify-center gap-2">
        {JOURNEY_CATEGORY_COUNTS.slice(0, 6).map((c) => (
          <span
            key={c.id}
            className="rounded-full border border-line-soft bg-paper px-3 py-1.5 text-[13px] text-ink-600"
          >
            {c.title}
            <span className="ml-1.5 text-ink-400 tabular-nums">{c.count}</span>
          </span>
        ))}
        <span className="rounded-full border border-dashed border-line-strong px-3 py-1.5 text-[13px] text-ink-400 tabular-nums">
          +{JOURNEY_SCALE.categories - 6} {t.moreCategories}
        </span>
      </div>

      <div className="mt-10 -mx-5 overflow-x-auto sm:-mx-8 lg:-mx-12 lg:overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max snap-x snap-mandatory gap-5 px-5 sm:px-8 lg:w-full lg:justify-center lg:px-0">
          {cards.map((card, i) => (
            <JourneyCardTile key={card.id} card={card} centre={i === 2} lang={lang} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---- A small shared CTA used by the library + hero -------------------- */
export function JourneyLibraryCta({ lang, label }: { lang: Lang; label: string }) {
  return (
    <Link
      href={lang === "en" ? "/lab/journeys" : "/tr/lab/journeys"}
      className="inline-flex h-12 items-center gap-2 rounded-full bg-ink-950 px-6 text-sm font-medium text-white transition-colors duration-[var(--duration-fast)] hover:bg-primary-600"
    >
      {label}
      <ArrowRight aria-hidden className="size-4" />
    </Link>
  );
}
