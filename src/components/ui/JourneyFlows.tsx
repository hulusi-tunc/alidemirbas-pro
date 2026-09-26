import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Ban, CircleCheck, CircleX, Clock, Radio, ShieldCheck } from "lucide-react";

import { journeyCanvasProps } from "@/components/JourneyDetailBody";
import { buttonStyles } from "@/components/ui/Button";
import { JourneyMiniMap } from "@/components/ui/JourneyMiniMap";
import { NodeFigure } from "@/components/ui/JourneyNodeFigure";
import { CategoryIcon, categoryAccent } from "@/components/ui/LibraryChrome";
import { DOT_STYLE } from "@/lib/canvas-dots";
import { JOURNEY_ROWS, LIBRARY_ROWS, journeyDetail, type JourneyDetail } from "@/lib/canonical-view";
import { copy, type Lang } from "@/lib/content";
import { FEATURED_JOURNEY, JOURNEY_SCALE, showcaseCards } from "@/lib/journey-marketing";
import { localizedFeaturedJourney, localizedJourneyDetail, localizedJourneyNaming } from "@/lib/journey-tr-overrides";
import { journeyPath } from "@/lib/journey-localized-slugs";
import { PUBLIC_JOURNEY_CATEGORIES } from "@/lib/journey-public-categories";

/* THE LANDING PAGE'S FIGURES, on the canvas's own kit (2026-09-20, Hulusi:
   "update the journey library landing page's visuals - we made such nice
   updates in the details"). Every figure is the real thing, not a drawing
   of it: the hero is ACQ-01's canvas exactly as its detail page renders it,
   the three story figures stand the real trigger, condition and wait cards
   on the canvas's dot sheet with their real data beside them, and the
   showcase cards open on each journey's own canvas. The hand-composed kit
   that drew these before (ui/JourneyVisuals.tsx) is gone.

     hero       ACQ-01, the whole graph, scaled - opens the canvas
     story 1    the trigger card + what counts / what does not
     story 2    the condition card + both branches, named
     story 3    the wait card + its two ends, the window's rule
     showcase   four journeys, each on its own canvas preview

   Every string below that is not a UI label is a real canonical field. */

/* THE FEATURED JOURNEY, PER LOCALE. The figures below quote canonical
   fields the card beside them does not show - a trigger's evidence lists, a
   condition's branch labels and reasons, a wait's arms and timeout reason -
   and read them off FEATURED_JOURNEY, which is locale-blind by design
   (journey-marketing.ts serves the English record). Reading it directly put
   English prose next to a Turkish card on /tr/lab/journeys. One call through
   the site's TR content layer, once per locale, fixes every one of them:
   nothing below quotes journey-marketing.ts unlocalized. */
const featured = (lang: Lang) => localizedFeaturedJourney(FEATURED_JOURNEY, lang);
const nf = (lang: Lang, n: number) => n.toLocaleString(lang === "en" ? "en-US" : "tr-TR");

function detailOf(id: string, lang: Lang): JourneyDetail | null {
  const d = journeyDetail(id);
  return d ? localizedJourneyDetail(d, lang) : null;
}

/** A figure: a paper card on the project's plate, its stage on the dot sheet. */
function Figure({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`overflow-hidden rounded-2xl bg-paper ring-1 ring-ink-950/[0.08] shadow-[0_28px_70px_-30px_rgb(10_16_32/0.5)] ${className}`}>{children}</div>;
}

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div style={DOT_STYLE} className={`bg-paper-soft px-6 pt-8 pb-6 ${className}`}>
      {children}
    </div>
  );
}

function Tile({ icon, tint, title, children }: { icon: ReactNode; tint: string; title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-paper-soft p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink-950">
        <span aria-hidden className={`grid size-7 place-items-center rounded-lg ${tint} [&>svg]:size-3.5`}>{icon}</span>
        {title}
      </p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** The fork under a card: a stem, then a rounded bracket into two arms,
    each ending in an arrowhead - the canvas's own line language in CSS. */
function ForkLines() {
  return (
    <div aria-hidden className="mx-auto w-full max-w-md">
      <span className="mx-auto block h-5 w-px bg-ink-300" />
      <div className="flex">
        <span className="h-5 flex-1 rounded-tl-xl border-t border-l border-ink-300" />
        <span className="h-5 flex-1 rounded-tr-xl border-t border-r border-ink-300" />
      </div>
      <div className="flex justify-between px-px">
        <Arrow />
        <Arrow />
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 10 6" className="size-2.5 fill-ink-400" aria-hidden>
      <path d="M0 0 L10 0 L5 6 Z" />
    </svg>
  );
}

function BranchPill({ children, on = false }: { children: ReactNode; on?: boolean }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${on ? "bg-primary-50 text-primary-700 ring-primary-200" : "bg-paper text-ink-700 ring-ink-950/[0.08]"}`}>
      {children}
    </span>
  );
}

/* ====================================================================
   The hero: ACQ-01's canvas, whole, as the detail page draws it.
   ==================================================================== */

export async function JourneyCanvas({ lang }: { lang: Lang }) {
  /* The library's largest journey, whole (2026-09-26). It used to be
     ACQ-01, the featured journey the three stories below still witness -
     but ACQ-01 is a silent lifecycle state and left the library rows in
     the 2026-09 audit, so the hero rendered nothing but its plate. The
     largest library journey is the one the "Where to start" tile leads
     with, and the richest canvas the library has. */
  const row = [...LIBRARY_ROWS].sort((a, b) => b.nodeCount - a.nodeCount)[0];
  const detail = row ? detailOf(row.id, lang) : null;
  if (!detail || !row) return null;
  const page = copy[lang].lab.page;
  const canvas = await journeyCanvasProps(detail, lang, page);
  const accent = categoryAccent(row.category);
  return (
    <Link href={`${journeyPath(lang, detail.id, detail.slug)}#canvas`} className="group block">
      <Figure className="transition-shadow duration-[var(--duration-fast)] group-hover:shadow-[0_32px_80px_-30px_rgb(10_16_32/0.6)]">
        <div className="h-[24rem] sm:h-[30rem]">
          <JourneyMiniMap layout={canvas.layout} labels={canvas.labels} messageLabels={canvas.messageLabels} humanLabels={canvas.humanLabels} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft px-5 py-3.5">
          <span className="flex min-w-0 items-center gap-2.5 text-sm">
            <span aria-hidden className={`grid size-7 shrink-0 place-items-center rounded-full ${accent.tile}`}>
              <CategoryIcon id={row.category} className="size-3.5" />
            </span>
            <span className="truncate font-semibold text-ink-950">{detail.shortName ?? detail.name}</span>
            <span className="hidden text-ink-subtle sm:inline">· {canvas.caption}</span>
          </span>
          <span className={buttonStyles({ variant: "primary", size: "sm" })}>
            {page.openCanvas}
            <ArrowRight aria-hidden className="size-4" />
          </span>
        </div>
      </Figure>
    </Link>
  );
}

/* ====================================================================
   Story 1 - the trigger: what counts as evidence, what does not.
   ==================================================================== */

export function TriggerEvidence({ lang }: { lang: Lang }) {
  const t = copy[lang].journeyBuilder.story1;
  const page = copy[lang].lab.page;
  const J = featured(lang);
  const detail = detailOf(J.id, lang);
  const trigger = detail?.nodes.find((n) => n.isEntry) ?? detail?.nodes.find((n) => n.kind === "trigger");
  if (!trigger) return null;
  return (
    <Figure>
      <Stage>
        <NodeFigure node={trigger} lang={lang} entryLabel={page.canvas.entry} terminalLabel={page.terminalLabel} className="mx-auto max-w-[16rem]" />
      </Stage>
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
        <Tile icon={<CircleCheck aria-hidden />} tint="bg-emerald-50 text-emerald-700" title={t.requires}>
          <ul className="flex list-none flex-col gap-2 p-0">
            {J.trigger.requires.map((r) => (
              <li key={r} className="flex items-start gap-2 text-sm leading-snug text-ink-700">
                <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                {r}
              </li>
            ))}
          </ul>
        </Tile>
        <Tile icon={<Ban aria-hidden />} tint="bg-rose-50 text-rose-700" title={t.insufficient}>
          <ul className="flex list-none flex-col gap-2 p-0">
            {J.trigger.insufficientAlone.map((r) => (
              <li key={r} className="flex items-start gap-2 text-sm leading-snug text-ink-subtle line-through decoration-ink-300">
                <CircleX aria-hidden className="mt-0.5 size-4 shrink-0 text-rose-500" />
                {r}
              </li>
            ))}
          </ul>
        </Tile>
      </div>
    </Figure>
  );
}

/* ====================================================================
   Story 2 - the fork: one condition, both branches named and written.
   ==================================================================== */

export function BranchFork({ lang }: { lang: Lang }) {
  const t = copy[lang].journeyBuilder.story2;
  const page = copy[lang].lab.page;
  const J = featured(lang);
  const detail = detailOf(J.id, lang);
  const condition = detail?.nodes.find((n) => n.kind === "condition" && n.headline === J.branch.asks) ?? detail?.nodes.find((n) => n.kind === "condition");
  if (!condition) return null;
  return (
    <Figure>
      <Stage className="pb-4">
        <NodeFigure node={condition} lang={lang} entryLabel={page.canvas.entry} terminalLabel={page.terminalLabel} className="mx-auto max-w-[17rem]" />
        <ForkLines />
        <div className="mx-auto mt-2 grid max-w-md grid-cols-2 gap-3">
          {J.branch.branches.map((b, i) => (
            <div key={b.label} className="flex flex-col items-center">
              <BranchPill on={i === 0}>{b.label}</BranchPill>
              <p className="mt-2.5 w-full rounded-2xl bg-paper px-3.5 py-3 text-sm leading-snug text-ink-700 ring-1 ring-ink-950/[0.08]">{b.when}</p>
            </div>
          ))}
        </div>
      </Stage>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft px-5 py-3.5 text-sm">
        <span className="text-ink-muted">{t.note}</span>
        <span className="text-ink-subtle tabular-nums">
          {nf(lang, JOURNEY_SCALE.conditions)} {t.conditionsLabel}
        </span>
      </div>
    </Figure>
  );
}

/* ====================================================================
   Story 3 - the wait: one pause, two ends, a window that does not stretch.
   ==================================================================== */

export function WaitTimeline({ lang }: { lang: Lang }) {
  const t = copy[lang].journeyBuilder.story3;
  const page = copy[lang].lab.page;
  const J = featured(lang);
  const detail = detailOf(J.id, lang);
  const wait = detail?.nodes.find((n) => n.kind === "wait");
  const w = J.wait;
  if (!wait || !w) return null;
  return (
    <Figure>
      <Stage className="pb-4">
        <NodeFigure node={wait} lang={lang} entryLabel={page.canvas.entry} terminalLabel={page.terminalLabel} className="mx-auto w-fit" />
        <ForkLines />
        <div className="mx-auto mt-2 grid max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-paper p-3.5 ring-1 ring-ink-950/[0.08]">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink-950">
              <span aria-hidden className="grid size-7 place-items-center rounded-lg bg-teal-50 text-teal-700 [&>svg]:size-3.5">
                <Radio />
              </span>
              {t.onEvent}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {w.until.map((e) => (
                <span key={e} className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800">
                  {e}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-paper p-3.5 ring-1 ring-ink-950/[0.08]">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink-950">
              <span aria-hidden className="grid size-7 place-items-center rounded-lg bg-amber-50 text-amber-700 [&>svg]:size-3.5">
                <Clock />
              </span>
              {t.onTimeout}
            </p>
            <p className="mt-2.5 text-sm font-medium text-ink-950 tabular-nums">{w.timeoutAfter}</p>
            <p className="mt-1 text-sm leading-snug text-ink-muted">{w.timeoutReason}</p>
          </div>
        </div>
      </Stage>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft px-5 py-3.5 text-sm">
        <span className="flex items-center gap-2 text-ink-muted">
          <ShieldCheck aria-hidden className="size-4 text-emerald-600" />
          {t.note}
        </span>
        <span className="text-ink-subtle tabular-nums">
          {nf(lang, JOURNEY_SCALE.waits)} {t.waitsLabel}
        </span>
      </div>
    </Figure>
  );
}

/* ====================================================================
   The showcase: four journeys, each on its own canvas.
   ==================================================================== */

export async function JourneyLibrarySpread({ lang }: { lang: Lang }) {
  const t = copy[lang].journeyBuilder.library;
  const page = copy[lang].lab.page;
  const cards = await Promise.all(
    /* The cards carry a journey's name, shortName, purpose and category
       title - showcaseCards() takes a `lang` but spends it only on the href,
       so every one of those four came back English. Same layer as everything
       else on this page. */
    showcaseCards(lang).map((c) => localizedJourneyNaming(c, lang)).map(async (card) => {
      const detail = detailOf(card.id, lang);
      const row = JOURNEY_ROWS.find((r) => r.id === card.id);
      if (!detail || !row) return null;
      const canvas = await journeyCanvasProps(detail, lang, page);
      return { card, detail, row, canvas };
    }),
  );
  const shown = cards.filter((x): x is NonNullable<typeof x> => x !== null);
  return (
    <div>
      {/* The library's public categories, all of them, with their counts -
          the same seven groups the list page and its rail show
          (lib/journey-public-categories.ts). Until 2026-09-26 this row
          showed six of the fifteen canonical domains and "+9 more", while
          the list one click away showed seven different groups. */}
      <div className="flex flex-wrap justify-center gap-2">
        {PUBLIC_JOURNEY_CATEGORIES.map((c) => {
          const count = c.journeyIds.filter((id) => LIBRARY_ROWS.some((r) => r.id === id)).length;
          if (count === 0) return null;
          const accent = categoryAccent(c.iconCategory);
          return (
            <span key={c.id} className="flex items-center gap-2 rounded-full bg-paper py-1 pr-3 pl-1 text-sm font-medium text-ink-950 ring-1 ring-ink-950/[0.06]">
              <span aria-hidden className={`grid size-7 place-items-center rounded-full ${accent.tile}`}>
                <CategoryIcon id={c.iconCategory} className="size-3.5" />
              </span>
              {c.label[lang]}
              <span className="text-ink-subtle tabular-nums">{count}</span>
            </span>
          );
        })}
      </div>

      <div className="mt-10 -mx-5 overflow-x-auto sm:-mx-8 lg:mx-0 lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* The grid takes as many columns as there are cards, so a journey
            leaving the library never leaves a hole at the right. */}
        <div className={`flex w-max snap-x snap-mandatory gap-5 px-5 sm:px-8 lg:grid lg:w-full lg:px-0 ${shown.length >= 4 ? "lg:grid-cols-2 xl:grid-cols-4" : shown.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}>
          {shown.map((x) => {
            const accent = categoryAccent(x.row.category);
            return (
              <Link
                key={x.card.id}
                href={x.card.href}
                className="group flex w-[19rem] shrink-0 snap-center flex-col overflow-hidden rounded-[24px] bg-paper ring-1 ring-ink-950/[0.06] transition-shadow duration-[var(--duration-fast)] hover:shadow-[0_18px_40px_-24px_rgb(10_16_32/0.35)] lg:w-auto"
              >
                <div className="h-44 bg-paper-soft [mask-image:linear-gradient(to_bottom,black_75%,transparent)]">
                  <JourneyMiniMap layout={x.canvas.layout} labels={x.canvas.labels} messageLabels={x.canvas.messageLabels} humanLabels={x.canvas.humanLabels} />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className={`flex items-center gap-2 text-xs font-medium ${accent.ink}`}>
                    <span aria-hidden className={`grid size-6 place-items-center rounded-md ${accent.tile}`}>
                      <CategoryIcon id={x.row.category} className="size-3" />
                    </span>
                    <span className="truncate">{x.card.categoryTitle}</span>
                  </p>
                  <p className="mt-3 text-base leading-snug font-semibold text-balance text-ink-950">{x.card.shortName}</p>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-muted">{x.card.purpose}</p>
                  <p className="mt-auto flex items-center justify-between gap-3 pt-4 text-sm text-ink-subtle tabular-nums">
                    {x.card.nodeCount} {t.nodes}
                    <ArrowRight aria-hidden className="size-4 text-ink-400 transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5" />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
