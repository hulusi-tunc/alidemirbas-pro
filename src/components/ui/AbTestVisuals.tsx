import Link from "next/link";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";

import {
  AB_SCALE,
  CATEGORY_COUNTS,
  FEATURED,
  SURFACE_COUNTS,
  SURFACE_MAX,
  canvasRows,
  spreadCards,
} from "@/lib/ab-test-marketing";
import { copy, type Lang } from "@/lib/content";

/* Bespoke product visuals for the A/B Test Playbook page.

   PRODUCT-VISUAL-ASSET-PLAN.md is this file's spec: nine visuals,
   VISUAL-01..09, each teaching a DIFFERENT mental model (a brief, a
   distribution, a diff, a rule ledger, a corpus, three process steps,
   an install). None of them repeats another's composition - that was
   the explicit brief, and it's the reason this is nine hand-built
   compositions rather than one card component reused nine times.

   ALL NINE ARE REACT + CSS. No raster assets are generated for this
   page; PRODUCT-IMAGE-PROMPTS.md records why (live data, bilingual,
   must simplify rather than shrink at 375px, must stay selectable and
   indexable).

   Colour is the site's existing two-hue system only - brand blue +
   ink - used semantically and consistently across every visual:
     control / baseline        -> ink + paper-soft (the quiet side)
     variant / thing tested    -> primary-600 + primary-50
     primary KPI (decides)     -> primary-600
     guardrail (must not drop) -> ink-950 plate
   `--color-success` exists in globals.css but is explicitly gated to
   the hero artwork, so it is deliberately NOT reached for here, and no
   red/amber is invented for "guardrail" or "not significant".

   Every value rendered below comes from ab-test-marketing.ts (derived
   from the frozen 211-record dataset) or from content.ts's own
   already-shipped, already-verified strings. */

const nf = (lang: Lang, n: number) => n.toLocaleString(lang === "en" ? "en-US" : "tr-TR");

/* Surfaces are stored as short slugs. These are display labels for the
   same 14 real values, not a re-categorisation - the set, the counts and
   the membership all still come straight from the dataset. */
const SURFACE_LABEL: Record<string, { en: string; tr: string }> = {
  pdp: { en: "Product page", tr: "Ürün sayfası" },
  home: { en: "Home & landing", tr: "Ana sayfa" },
  form: { en: "Forms & signup", tr: "Form & kayıt" },
  plp: { en: "Category listing", tr: "Kategori listesi" },
  "generic-ui": { en: "UI elements", tr: "Arayüz öğeleri" },
  checkout: { en: "Checkout", tr: "Ödeme" },
  saas: { en: "SaaS & B2B", tr: "SaaS & B2B" },
  pricing: { en: "Pricing", tr: "Fiyatlandırma" },
  mobile: { en: "Mobile app", tr: "Mobil uygulama" },
  cart: { en: "Cart", tr: "Sepet" },
  filters: { en: "Filters", tr: "Filtreler" },
  search: { en: "Search", tr: "Arama" },
  thankyou: { en: "Thank you", tr: "Teşekkürler" },
  dashboard: { en: "Dashboard", tr: "Panel" },
};

const surfaceLabel = (s: string, lang: Lang) => SURFACE_LABEL[s]?.[lang] ?? s;

/* ====================================================================
   VISUAL-01 — Experiment Brief            (Section 01, hero, on dark)
   Teaches: the product's output is a STRUCTURED BRIEF, not a tip.
   ==================================================================== */

export function ExperimentBrief({ lang }: { lang: Lang }) {
  const t = copy[lang].abTesting;
  const b = t.product.brief;
  return (
    <div className="rounded-card border border-white/10 bg-paper shadow-[0_24px_60px_-20px_rgba(3,17,63,0.55)]">
      {/* header: real id / category / surface straight off the record */}
      <div className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-3">
        <span className="font-mono text-[11px] tracking-wide text-ink-400 tabular-nums">
          {FEATURED.id} · {FEATURED.category}
        </span>
        <span className="rounded-xs bg-paper-soft px-2 py-0.5 font-mono text-[11px] text-ink-500">
          {FEATURED.surface}
        </span>
      </div>

      <div className="px-5 py-5 sm:px-6 sm:py-6">
        <p className="altor-eyebrow text-ink-400">{b.label}</p>
        <p className="mt-2 text-[1.0625rem] leading-snug font-medium text-ink-950 sm:text-lg">
          {t.example.title}
        </p>

        {/* the one slot under test — the whole discipline in one row */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-400">{b.testedSlot}</span>
          <span className="rounded-xs bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
            {b.testedSlotValue}
          </span>
        </div>

        {/* control (quiet) vs variant (accent) */}
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-md border border-line-soft bg-paper-soft p-3">
            <p className="font-mono text-[10px] tracking-wider text-ink-400 uppercase">{b.control}</p>
            <p className="mt-1.5 text-[13px] leading-snug text-ink-700">{b.sideA}</p>
          </div>
          <div className="rounded-md border border-primary-200 bg-primary-50 p-3">
            <p className="font-mono text-[10px] tracking-wider text-primary-700 uppercase">{b.variant}</p>
            <p className="mt-1.5 text-[13px] leading-snug text-ink-800">{b.sideB}</p>
          </div>
        </div>

        {/* the two metrics that decide and protect */}
        <div className="mt-5 flex flex-col gap-2.5 border-t border-line-soft pt-4">
          <div className="flex items-baseline gap-3">
            <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary-600" />
            <span className="w-24 shrink-0 text-xs text-ink-400">{b.primaryKpi}</span>
            <span className="text-[13px] font-medium text-ink-950">{b.primaryKpiValue}</span>
          </div>
          <div className="flex items-baseline gap-3">
            <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-[1px] bg-ink-950" />
            <span className="w-24 shrink-0 text-xs text-ink-400">{b.guardrail}</span>
            <span className="text-[13px] text-ink-700">{b.guardrailValue}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================
   VISUAL-02 — Coverage Map                        (Section 03, story 1)
   Teaches: the corpus is DISTRIBUTED and unevenly weighted — an honest
   shape. Bars are the point, so they survive to 375px.
   ==================================================================== */

export function CoverageMap({ lang }: { lang: Lang }) {
  const t = copy[lang].abTesting.product;
  return (
    <div className="rounded-card border border-line-soft bg-paper p-5 sm:p-7">
      <div className="flex items-baseline justify-between gap-4">
        <p className="altor-eyebrow text-ink-400">{t.story1.caption}</p>
        <p className="font-mono text-xs text-ink-400 tabular-nums">
          {AB_SCALE.surfaces} · {nf(lang, AB_SCALE.scenarios)}
        </p>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
        {SURFACE_COUNTS.map((s) => (
          <div key={s.surface} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-[13px] text-ink-600">
              {surfaceLabel(s.surface, lang)}
            </span>
            <span className="h-1.5 min-w-0 flex-1 rounded-full bg-paper-soft">
              <span
                className="block h-full rounded-full bg-primary-600"
                style={{ width: `${Math.max((s.count / SURFACE_MAX) * 100, 4)}%` }}
              />
            </span>
            <span className="w-6 shrink-0 text-right font-mono text-xs text-ink-500 tabular-nums">
              {s.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ====================================================================
   VISUAL-03 — One-Variable Diff                   (Section 04, story 2)
   Teaches: a DIFF. Two sides, one slot moves, everything else held.
   ==================================================================== */

export function VariantDiff({ lang }: { lang: Lang }) {
  const t = copy[lang].abTesting.product;
  const b = copy[lang].abTesting.product.brief;
  return (
    <div className="rounded-card border border-line-soft bg-paper p-5 sm:p-7">
      <div className="flex items-baseline justify-between gap-4">
        <p className="altor-eyebrow text-ink-400">{t.story2.caption}</p>
        <span className="font-mono text-xs text-ink-400 tabular-nums">{FEATURED.id}</span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
        <div className="rounded-md border border-line-soft bg-paper-soft p-4">
          <p className="font-mono text-[10px] tracking-wider text-ink-400 uppercase">{b.control}</p>
          <p className="mt-2 text-sm leading-snug text-ink-700">{b.sideA}</p>
        </div>

        {/* the single moving part, called out between the two sides */}
        <div className="flex items-center justify-center gap-2 md:flex-col">
          <span aria-hidden className="hidden h-6 w-px bg-line md:block" />
          <span className="rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-[11px] font-medium whitespace-nowrap text-primary-700">
            1 · {b.testedSlotValue}
          </span>
          <span aria-hidden className="hidden h-6 w-px bg-line md:block" />
        </div>

        <div className="rounded-md border border-primary-200 bg-primary-50 p-4">
          <p className="font-mono text-[10px] tracking-wider text-primary-700 uppercase">{b.variant}</p>
          <p className="mt-2 text-sm leading-snug text-ink-800">{b.sideB}</p>
        </div>
      </div>

      <p className="mt-5 border-t border-line-soft pt-4 text-[13px] text-ink-500">
        {t.story2.diffNote}
      </p>
      <p className="mt-1 text-[13px] text-ink-400">
        <b className="font-medium text-ink-700 tabular-nums">{nf(lang, AB_SCALE.withSides)}</b>{" "}
        {t.story2.sidesNote}
      </p>
    </div>
  );
}

/* ====================================================================
   VISUAL-04 — Guardrail Ledger                    (Section 05, story 3)
   Teaches: a RULE LEDGER with authority. Dark plate, numbered, real.
   ==================================================================== */

export function GuardrailLedger({ lang }: { lang: Lang }) {
  const t = copy[lang].abTesting;
  const p = t.product;
  return (
    <div className="rounded-card bg-ink-950 p-5 sm:p-7">
      <div className="flex items-baseline justify-between gap-4">
        <p className="altor-eyebrow text-white/45">{p.story3.caption}</p>
        <span className="font-mono text-xs text-white/40 tabular-nums">{FEATURED.id}</span>
      </div>

      <ol className="mt-5 flex flex-col">
        {t.example.dontBox.items.map((item, i) => (
          <li
            key={item}
            className="flex gap-4 border-b border-white/10 py-3 first:pt-0 last:border-0 last:pb-0"
          >
            <span className="font-mono text-[11px] text-white/35 tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[13px] leading-relaxed text-white/75">{item}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex items-baseline gap-3 border-t border-white/10 pt-5">
        <span className="text-3xl font-semibold text-white tabular-nums">
          {nf(lang, AB_SCALE.guardrails)}
        </span>
        <span className="text-[13px] text-white/50">{p.story3.ledgerNote}</span>
      </div>
    </div>
  );
}

/* ====================================================================
   VISUAL-05 — Library Spread                    (Section 06, the big one)
   Teaches: SCALE + BROWSABILITY. The Peerbie screenshot-1 moment: one
   centre card fully visible, neighbours deliberately cropped at the
   container edge so the corpus reads as continuing past the viewport.
   Desktop: a row wider than the container, clipped. Mobile: the crop
   becomes a scroll-snap rail, which is the same affordance by touch.
   ==================================================================== */

function SpreadCardTile({
  card,
  centre,
  lang,
}: {
  card: ReturnType<typeof spreadCards>[number];
  centre: boolean;
  lang: Lang;
}) {
  return (
    <Link
      href={card.href}
      className={`flex w-[19rem] shrink-0 snap-center flex-col rounded-card border bg-paper p-5 transition-[border-color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:border-line-strong ${
        centre
          ? "border-line-strong shadow-[0_20px_50px_-24px_rgba(3,17,63,0.45)] lg:w-[21rem]"
          : "border-line-soft shadow-[0_10px_30px_-24px_rgba(3,17,63,0.35)]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-ink-400 tabular-nums">{card.id}</span>
        <span className="rounded-xs bg-paper-soft px-2 py-0.5 font-mono text-[10px] text-ink-500">
          {card.surface}
        </span>
      </div>
      <p className="mt-3 min-h-[3.25rem] text-[15px] leading-snug font-medium text-ink-950">
        {card.title}
      </p>
      <p className="mt-3 text-xs text-ink-400">{card.category}</p>
      <div className="mt-4 flex items-center gap-2 border-t border-line-soft pt-3">
        <span
          aria-hidden
          className={`size-1.5 rounded-full ${
            card.setupType === "control-vs-treatment" ? "bg-primary-600" : "bg-ink-300"
          }`}
        />
        <span className="font-mono text-[10px] tracking-wide text-ink-400">{card.setupType}</span>
        <ArrowRight
          aria-hidden
          className="ml-auto size-3.5 text-ink-300 transition-colors group-hover:text-primary-600"
        />
      </div>
      <span className="sr-only">{lang === "en" ? "Open scenario" : "Senaryoyu aç"}</span>
    </Link>
  );
}

export function LibrarySpread({ lang }: { lang: Lang }) {
  const cards = spreadCards(lang);
  const centreIndex = 3;
  return (
    <div>
      {/* real category facets, exactly as the library's own browser counts them */}
      <div className="flex flex-wrap justify-center gap-2">
        {CATEGORY_COUNTS.map((c) => (
          <span
            key={c.category}
            className="rounded-full border border-line-soft bg-paper px-3 py-1.5 text-[13px] text-ink-600"
          >
            {c.category}
            <span className="ml-1.5 text-ink-400 tabular-nums">{c.count}</span>
          </span>
        ))}
      </div>

      {/* The crop. `-mx-*` lets the rail bleed past the container measure;
          overflow-hidden on desktop does the cropping, and the same
          element becomes a snap rail on touch. */}
      <div className="mt-10 -mx-5 overflow-x-auto sm:-mx-8 lg:-mx-12 lg:overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex w-max snap-x snap-mandatory gap-5 px-5 sm:px-8 lg:w-full lg:justify-center lg:px-0">
          {cards.map((card, i) => (
            <SpreadCardTile key={card.id} card={card} centre={i === centreIndex} lang={lang} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ====================================================================
   VISUAL-06/07/08 — How It Works, steps 1-3        (Section 07)
   Three DIFFERENT fragments: narrowing, constructing, deciding.
   ==================================================================== */

/* Step 1 — narrowing. Real surfaces, real counts; the "selected" row is
   the featured record's own surface, so the step reads continuously into
   steps 2 and 3, which are that same scenario. */
export function HowStepFind({ lang }: { lang: Lang }) {
  const t = copy[lang].abTesting.product.how;
  const shown = SURFACE_COUNTS.slice(0, 5);
  const active = SURFACE_COUNTS.find((s) => s.surface === FEATURED.surface);
  return (
    <div className="flex h-full flex-col rounded-card border border-line-soft bg-paper p-5">
      <p className="altor-eyebrow text-ink-400">{t.step1.label}</p>
      <div className="mt-4 flex flex-col gap-1.5">
        {shown.map((s) => (
          <div
            key={s.surface}
            className="flex items-center justify-between rounded-sm px-2.5 py-1.5 text-[13px] text-ink-500"
          >
            <span className="truncate">{surfaceLabel(s.surface, lang)}</span>
            <span className="font-mono text-[11px] text-ink-300 tabular-nums">{s.count}</span>
          </div>
        ))}
        {active && (
          <div className="flex items-center justify-between rounded-sm border border-primary-200 bg-primary-50 px-2.5 py-1.5 text-[13px] font-medium text-primary-700">
            <span className="truncate">{surfaceLabel(active.surface, lang)}</span>
            <span className="font-mono text-[11px] tabular-nums">{active.count}</span>
          </div>
        )}
      </div>
      {active && (
        <p className="mt-auto pt-4 text-xs text-ink-400">
          <b className="font-medium text-ink-700 tabular-nums">{active.count}</b> {t.step1.matches}
        </p>
      )}
    </div>
  );
}

/* Step 2 — constructing. A vertical stack, not a list of chips: the
   shape itself says "these three come together or not at all". */
export function HowStepDesign({ lang }: { lang: Lang }) {
  const t = copy[lang].abTesting.product;
  const h = t.how.step2;
  const b = t.brief;
  return (
    <div className="flex h-full flex-col rounded-card border border-line-soft bg-paper p-5">
      <p className="altor-eyebrow text-ink-400">{h.hypothesis}</p>
      <p className="mt-2.5 text-[13px] leading-snug text-ink-700">{b.sideB}</p>

      <div className="mt-4 flex flex-col gap-2">
        <div className="rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5">
          <p className="font-mono text-[10px] tracking-wider text-primary-700 uppercase">{h.kpi}</p>
          <p className="mt-1 text-[13px] font-medium text-ink-950">{b.primaryKpiValue}</p>
        </div>
        <div className="rounded-md bg-ink-950 px-3 py-2.5">
          <p className="font-mono text-[10px] tracking-wider text-white/45 uppercase">{h.guardrail}</p>
          <p className="mt-1 text-[13px] text-white/80">{b.guardrailValue}</p>
        </div>
      </div>
      <p className="mt-auto pt-4 font-mono text-[11px] text-ink-400">
        {FEATURED.setupType} · {FEATURED.comparisonMode}
      </p>
    </div>
  );
}

/* Step 3 — deciding. The only visual on the page carrying computed
   numbers, and they are the LIVE ab-test calculator's own verified
   example (5,000/250 vs 5,000/290 -> p 0.0847, not significant). The
   rates and uplifts below are that example's exact arithmetic:
     250/5000 = 5.00%   290/5000 = 5.80%
     absolute +0.80pp   relative +16.0%
   Deliberately a NON-significant result: a double-digit lift that
   doesn't clear the bar is the single most useful thing this product
   teaches, and inventing a flattering "winner" would be inventing data. */
const AB_EXAMPLE = {
  controlVisitors: 5000,
  controlConversions: 250,
  variantVisitors: 5000,
  variantConversions: 290,
  controlRate: "5.00%",
  variantRate: "5.80%",
  relativeUplift: "+16.0%",
  pValue: "0.0847",
} as const;

export function HowStepRead({ lang }: { lang: Lang }) {
  const t = copy[lang].abTesting.product.how.step3;
  return (
    <div className="flex h-full flex-col rounded-card border border-line-soft bg-paper p-5">
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md border border-line-soft bg-paper-soft p-3">
          <p className="font-mono text-[10px] tracking-wider text-ink-400 uppercase">{t.control}</p>
          <p className="mt-1 text-lg font-semibold text-ink-950 tabular-nums">{AB_EXAMPLE.controlRate}</p>
          <p className="mt-0.5 font-mono text-[10px] text-ink-400 tabular-nums">
            {nf(lang, AB_EXAMPLE.controlConversions)} / {nf(lang, AB_EXAMPLE.controlVisitors)}
          </p>
        </div>
        <div className="rounded-md border border-primary-200 bg-primary-50 p-3">
          <p className="font-mono text-[10px] tracking-wider text-primary-700 uppercase">{t.variant}</p>
          <p className="mt-1 text-lg font-semibold text-ink-950 tabular-nums">{AB_EXAMPLE.variantRate}</p>
          <p className="mt-0.5 font-mono text-[10px] text-primary-700/70 tabular-nums">
            {nf(lang, AB_EXAMPLE.variantConversions)} / {nf(lang, AB_EXAMPLE.variantVisitors)}
          </p>
        </div>
      </div>

      <dl className="mt-3 flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[13px] text-ink-500">{t.uplift}</dt>
          <dd className="font-mono text-[13px] font-medium text-ink-950 tabular-nums">
            {AB_EXAMPLE.relativeUplift}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-[13px] text-ink-500">{t.pValue}</dt>
          <dd className="font-mono text-[13px] font-medium text-ink-950 tabular-nums">
            {AB_EXAMPLE.pValue}
          </dd>
        </div>
      </dl>

      {/* the verdict: ink plate, plain wording, no invented red "fail" */}
      <div className="mt-3 rounded-md bg-ink-950 px-3 py-2.5">
        <p className="font-mono text-[10px] tracking-wider text-white/45 uppercase">{t.verdict}</p>
        <p className="mt-1 text-[13px] font-medium text-white">{t.verdictValue}</p>
      </div>
      {/* mirrors step 2's mono footer so the three cards share a baseline;
          the method name is the calculator's own (formulaPlainEnglish). */}
      <p className="mt-auto pt-4 font-mono text-[11px] text-ink-400">{t.test}</p>
    </div>
  );
}

/* Real, live calculators on this same site — verified against
   LIVE_CALCULATOR_SLUGS in calc-catalog.ts, not aspirational links. */
const STAT_CALCS = [
  { slug: "ab-test", en: "A/B Test Significance", tr: "A/B Test Anlamlılığı" },
  { slug: "sample-size-calculator", en: "Sample Size", tr: "Örneklem Büyüklüğü" },
  { slug: "test-duration-estimator", en: "Test Duration", tr: "Test Süresi" },
] as const;

export function StatCalculatorLinks({ lang }: { lang: Lang }) {
  const base = lang === "en" ? "/calculators" : "/tr/calculators";
  return (
    <div className="flex flex-wrap gap-2">
      {STAT_CALCS.map((c) => (
        <Link
          key={c.slug}
          href={`${base}/${c.slug}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-line-soft bg-paper px-3.5 py-2 text-[13px] text-ink-600 transition-colors duration-[var(--duration-fast)] hover:border-ink-300 hover:text-ink-950"
        >
          {c[lang]}
          <ArrowUpRight aria-hidden className="size-3.5 text-ink-400" />
        </Link>
      ))}
    </div>
  );
}

/* ====================================================================
   VISUAL-10 — Hero Product Canvas         (Section 01, replaces the
   hero's split layout after a second Peerbie reference: centred text,
   then the product itself filling the full width in perspective and
   running off the bottom of the section.)

   What it shows is the REAL library browser - the same facet sidebar,
   search field and result rows that /lab/ab-testing/library actually
   renders - populated with eight real records, one per category, plus
   the scenario brief floating over it. So the hero's claim ("a
   searchable library of 211 scenarios") and the hero's image are the
   same thing, which is the entire point of the composition.

   Perspective is CSS only (`rotateX` on a wrapper), so the text stays
   real DOM text: selectable, translatable, indexable. Below `lg` the
   tilt is dropped entirely and the sidebar is hidden - a tilted,
   scaled-down browser at 375px would be unreadable, and the brief is
   to simplify rather than shrink. */

function CanvasChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-xs bg-paper-soft px-2 py-0.5 font-mono text-[10px] text-ink-500">
      {children}
    </span>
  );
}

export function HeroProductCanvas({ lang }: { lang: Lang }) {
  const rows = canvasRows(lang);
  const t = copy[lang].abTesting.product;
  const searchPlaceholder = lang === "en" ? "Search 211 scenarios…" : "211 senaryoda ara…";

  return (
    <div className="relative">
      {/* The tilt. `perspective` on the parent + `rotateX` on the child,
          origin at the top so the canvas leans away from the reader and
          its lower edge runs past the section's bottom crop. */}
      <div className="lg:[perspective:2200px]">
        <div className="origin-top lg:[transform:rotateX(9deg)_scale(1.02)]">
          <div className="mx-auto max-w-[1120px] overflow-hidden rounded-t-2xl border border-line-soft bg-paper shadow-[0_40px_90px_-30px_rgba(3,17,63,0.35)]">
            {/* window chrome + search, as the real library page has */}
            <div className="flex items-center gap-3 border-b border-line-soft bg-paper-soft/70 px-4 py-3">
              <span aria-hidden className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-ink-200" />
                <span className="size-2.5 rounded-full bg-ink-200" />
                <span className="size-2.5 rounded-full bg-ink-200" />
              </span>
              <span className="ml-2 flex min-w-0 flex-1 items-center gap-2 rounded-full border border-line-soft bg-paper px-3.5 py-1.5">
                <Search aria-hidden className="size-3.5 shrink-0 text-ink-300" />
                <span className="truncate text-xs text-ink-400">{searchPlaceholder}</span>
              </span>
              <span className="hidden shrink-0 font-mono text-[11px] text-ink-400 tabular-nums sm:block">
                {AB_SCALE.scenarios}
              </span>
            </div>

            <div className="flex">
              {/* facet rail — real surfaces, real counts (hidden < lg) */}
              <aside className="hidden w-52 shrink-0 border-r border-line-soft p-4 lg:block">
                <p className="font-mono text-[10px] tracking-wider text-ink-400 uppercase">
                  {t.how.step1.label}
                </p>
                <div className="mt-3 flex flex-col gap-1">
                  {SURFACE_COUNTS.slice(0, 9).map((s, i) => (
                    <span
                      key={s.surface}
                      className={`flex items-center justify-between rounded-sm px-2 py-1.5 text-[12px] ${
                        i === 0
                          ? "bg-primary-50 font-medium text-primary-700"
                          : "text-ink-500"
                      }`}
                    >
                      <span className="truncate">{surfaceLabel(s.surface, lang)}</span>
                      <span className="font-mono text-[10px] tabular-nums">{s.count}</span>
                    </span>
                  ))}
                </div>
              </aside>

              {/* result rows — real records */}
              <div className="min-w-0 flex-1">
                {rows.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-4 border-b border-line-soft px-4 py-3.5 last:border-0 sm:px-5"
                  >
                    <span className="hidden w-16 shrink-0 font-mono text-[11px] text-ink-400 tabular-nums sm:block">
                      {r.id}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-ink-950">
                        {r.title}
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-ink-400">
                        {r.category}
                      </span>
                    </span>
                    <span className="hidden shrink-0 sm:block">
                      <CanvasChip>{r.surface}</CanvasChip>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The scenario brief, floating over the canvas — the product's
          output sitting on top of the product's index. Desktop only:
          at small widths it would cover the rows it is meant to explain,
          and the brief already has its own full section below. */}
      {/* bottom-36 clears the section's own crop (-mb-24/md:-mb-32), so the
          card reads as a whole object floating over a canvas that continues
          past the fold - rather than being sliced through its own content. */}
      <div className="pointer-events-none absolute -right-2 bottom-36 hidden w-[23rem] xl:block">
        <div className="rotate-[-1.5deg]">
          <ExperimentBrief lang={lang} />
        </div>
      </div>
    </div>
  );
}
