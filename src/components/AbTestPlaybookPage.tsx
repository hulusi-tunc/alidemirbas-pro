import type { ReactNode } from "react";
import { ArrowRight, Ban, ClipboardList, Eye, FlaskConical, Hash, Lightbulb, Quote, ShieldCheck, Target } from "lucide-react";

import { AbCategoryIcon, SurfaceIcon, abCategoryAccent } from "@/components/ui/AbLibraryIdentity";
import { categoryLabel, setupLabel, surfaceLabel } from "@/components/ui/AbTestVisuals";
import { CardCarousel } from "@/components/ui/CardCarousel";
import { InfoTile } from "@/components/ui/InfoTile";
import { ProductFrame } from "@/components/ui/ProductFrame";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { AbScreen, abCaption } from "@/components/ui/AbScreen";
import { abElementKind, abPlaybookText, abSetupMode, abVariableKind } from "@/lib/ab-test-playbook";
import type { AbElementKind, AbVariableKind } from "@/lib/ab-test-playbook";
import type { AbTestDetail } from "@/lib/ab-test-view";
import { primaryKpiLabel } from "@/lib/ab-test-view";

/* The A/B test detail page, in the journey detail page's idiom (Hulusi,
   2026-09-20: "now the A/B detail - first the layout, fix it with our style,
   the way we did the journey detail"; then, on the first pass: "we need
   bigger space for the previews - everything in boxes is hard to
   understand; a multi-tab layout, or more compact, or direct the reader
   where to look").

   It was two tabs for a day (Experiment / How to run, the journey page's
   shape); Hulusi cancelled them the same evening - "put the four cards
   under the main page as a horizontal carousel" - so it is one page: the
   header, the experiment, the run notes as a row of cards. The header is
   the record as a person meets it: the category as an eyebrow with its
   glyph, the question on the h1 step, the lede, one row of chips (the
   page, the primary KPI, the id).

   EXPERIMENT - the subject, at the page's full width. The two sides stand
   side by side with the A → B arrow between them, each a card with its
   role's own name (Control / Variant, Option A / B, Variant A / B - the
   record's `setupType` decides), the drawing of what varies, and the
   record's own words for that side. The reader is pointed at the change:
   the variant carries a pill naming it (+ added, − removed, ≠ changed,
   ↔ moved - `differenceBehavior` and `testedSlot`, both real fields) and a
   brand ring. The setup facts sit on one line in the stage's own header
   rather than in a third box, and the hypothesis - the claim - closes the
   tab. The pipeline's `sourceBasis` note under each side is gone from the
   page: it explains how the record was authored, not what the test is.

   HOW TO RUN - the primary KPI, the guardrail metrics, what to watch, the
   never-do rules and, where the record's own hypothesis ends in one, the
   reusable rule, as InfoTiles in a snap-scrolling row (ui/CardCarousel).

   What did NOT change is the content rule this page has always kept: every
   cell is a real field or a clause of the record's own hypothesis, and a
   cell with no data behind it is omitted rather than filled - no invented
   control, no invented variant, no invented values in a diagram (see
   ui/VariableDiagram.tsx and lib/ab-test-playbook.ts). */

type Lang = "en" | "tr";

const T = {
  en: {
    run: "How to run this test",
    runStrip: "Run notes",
    prev: "Previous card",
    next: "Next card",
    controlVariant: "Control vs Variant",
    optionVsOption: "Option A vs Option B",
    variantVsVariant: "Variant A vs Variant B",
    testConcept: "Test concept",
    roles: { control: "Control", variant: "Variant", "option-a": "Option A", "option-b": "Option B", "variant-a": "Variant A", "variant-b": "Variant B" } as Record<string, string>,
    diff: { add: "added", remove: "removed", change: "changed", move: "moved" } as Record<string, string>,
    whatChanges: "What changes",
    changed: "Changed",
    surface: "Page",
    difference: "Difference",
    testedElement: "Tested element",
    conceptNote: "This record defines the element to test, not a prescribed control and variant.",
    hypothesis: "Hypothesis",
    primaryKpi: "Primary KPI",
    guardrailMetrics: "Guardrail metrics",
    whatToTest: "What to watch during the test",
    neverDo: "Never do",
    reusableRule: "Reusable rule",
  },
  tr: {
    run: "Bu test nasıl yürütülür",
    runStrip: "Yürütme notları",
    prev: "Önceki kart",
    next: "Sonraki kart",
    controlVariant: "Kontrol / Varyant",
    optionVsOption: "Seçenek A / Seçenek B",
    variantVsVariant: "Varyant A / Varyant B",
    testConcept: "Test fikri",
    roles: { control: "Kontrol", variant: "Varyant", "option-a": "Seçenek A", "option-b": "Seçenek B", "variant-a": "Varyant A", "variant-b": "Varyant B" } as Record<string, string>,
    diff: { add: "eklendi", remove: "kaldırıldı", change: "değişti", move: "taşındı" } as Record<string, string>,
    whatChanges: "Ne değişiyor",
    changed: "Değişen",
    surface: "Sayfa",
    difference: "Fark",
    testedElement: "Test edilen öğe",
    conceptNote: "Bu kayıt test edilecek öğeyi tanımlar; hazır bir kontrol ve varyant önermez.",
    hypothesis: "Hipotez",
    primaryKpi: "Birincil KPI",
    guardrailMetrics: "Guardrail metrikleri",
    whatToTest: "Test sırasında bakılacaklar",
    neverDo: "Yapılmaması gerekenler",
    reusableRule: "Yeniden kullanılabilir kural",
  },
} as const;

const DIFF_SIGN: Record<string, string> = { add: "+", remove: "−", change: "≠", move: "↔" };

/** The photograph behind the screens, and whether it is dark - the role
    labels and the arrow flip to white on a dark plate. Hulusi went
    through the path through the meadow and the night photo (2026-09-20)
    and settled on the plate the homepage's Tools band stands on, the
    bright meadow under the sky (`numerspace`). */
const STAGE = { plate: "numerspace", dark: false } as const;

/** A chip with its own tinted icon tile - the journey Info tab's chip. */
function Chip({ icon, tint, children }: { icon: ReactNode; tint: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2 rounded-full bg-paper py-1 pr-3.5 pl-1 text-sm font-medium text-ink-950 ring-1 ring-ink-950/[0.06]">
      <span aria-hidden className={`grid size-7 place-items-center rounded-full ${tint} [&>svg]:size-3.5`}>{icon}</span>
      {children}
    </li>
  );
}

/** A labelled list entry - a metric or a thing to watch, with its note. */
function Note({ label, note }: { label: string; note: string }) {
  return (
    <li className="text-sm leading-relaxed">
      <span className="font-medium text-ink-900">{label}</span>
      <span className="block text-ink-muted">{note}</span>
    </li>
  );
}

export default function AbTestPlaybookPage({ test, lang, breadcrumb }: { test: AbTestDetail; lang: Lang; breadcrumb: object }) {
  const t = T[lang];
  const { lede, hypothesis, takeaway } = abPlaybookText(test.hypothesis);
  const mode = abSetupMode(test);
  /* What the experiment varies. Drives the diagram; exposed as a data
     attribute so the classification can be audited against the rendered
     page rather than against a copy of the rule. */
  const kind = abVariableKind(test);
  /* Which interface element the screens draw as real UI (ui/AbScreen.tsx). */
  const element = abElementKind(test);
  /* The one behaviour whose two sides the data fixes: on `add` the control
     lacks the element and the variant has it, on `remove` the reverse. Any
     other kind draws the same diagram on both sides. */
  const presenceOf = (side: "a" | "b"): "absent" | "present" | null => {
    if (kind !== "presence") return null;
    if (test.differenceBehavior === "add") return side === "a" ? "absent" : "present";
    if (test.differenceBehavior === "remove") return side === "a" ? "present" : "absent";
    return null;
  };
  const accent = abCategoryAccent(test.category);
  const kpi = primaryKpiLabel(test.primaryKpi.label, lang);
  const stageTitle =
    mode !== "comparison" ? t.testConcept
    : test.setupType === "option-vs-option" ? t.optionVsOption
    : test.setupType === "variant-vs-variant" ? t.variantVsVariant
    : t.controlVariant;
  const roleLabel = (role: string, fallback: string) => t.roles[role] ?? fallback;
  const diffWord = t.diff[test.differenceBehavior];
  const diffSign = DIFF_SIGN[test.differenceBehavior];

  const header = (
    <header data-ab-variable={kind} data-ab-element={element} data-ab-mode={mode}>
      <JsonLdScript data={breadcrumb} />
      <p className={`flex items-center gap-2 text-sm font-medium ${accent.ink}`}>
        <span aria-hidden className={`grid size-7 place-items-center rounded-lg ${accent.tile}`}>
          <AbCategoryIcon id={test.category} className="size-3.5" />
        </span>
        {categoryLabel(test.category, lang)}
      </p>
      <h1 data-ab-id={test.id} className="mt-5 max-w-4xl text-h1 text-balance text-ink-950">
        {test.question}
      </h1>
      {lede && <p className="mt-5 max-w-3xl text-lg leading-relaxed text-pretty text-ink-muted">{lede}</p>}
      <ul className="mt-6 flex list-none flex-wrap gap-2 p-0">
        <Chip icon={<SurfaceIcon id={test.surface} className="size-3.5" />} tint={accent.tile}>
          {surfaceLabel(test.surface, lang)}
        </Chip>
        <Chip icon={<Target aria-hidden />} tint="bg-primary-50 text-primary-700">
          {kpi}
        </Chip>
        <Chip icon={<Hash aria-hidden />} tint="bg-paper-soft text-ink-700">
          {test.id}
        </Chip>
      </ul>
    </header>
  );

  const facts: { label: string; value: string }[] = [
    { label: t.changed, value: test.testedSlot ?? "—" },
    { label: t.surface, value: surfaceLabel(test.surface, lang) },
    // The same word the variant's pill uses; the raw stored value only for
    // a behaviour the two label maps do not know.
    { label: t.difference, value: diffWord ?? setupLabel(test.differenceBehavior, lang) },
  ];

  const experiment = (
    <section className="mt-10">
      {/* The stage's header: what this comparison is, and the setup facts
          on one line rather than in a box of their own. */}
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
        <div className="flex items-center gap-3">
          <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700 [&>svg]:size-5">
            <FlaskConical />
          </span>
          <div>
            <h2 className="text-base font-semibold text-ink-950">{stageTitle}</h2>
            <p className="text-sm text-ink-muted">{abCaption(kind, lang)}</p>
          </div>
        </div>
        {/* Label over value, one column per fact, a hairline between them
            (Hulusi, 2026-09-20: inline "Changed geri sayım sayacı · Page
            Category listing" ran together and was hard to read). */}
        <dl className="flex flex-wrap gap-y-3 divide-x divide-line-soft">
          {facts.map((f) => (
            <div key={f.label} className="px-5 first:pl-0 last:pr-0">
              <dt className="text-xs font-medium text-ink-subtle">{f.label}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-ink-950">{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {mode === "comparison" ? (
        /* Same surface, same slot, twice - because the surface and the slot
           ARE the same on both sides. The difference between A and B lives
           in the data as prose, so it is stated in each side's own words;
           the variant's pill names the change from the two fields that
           fix it. */
        /* On the plate (Hulusi, 2026-09-20: "I want the photo behind the
           A/B test screens", then "not red, no colour overlay", then "can
           we change the bg image" - picked the builder's path-through-the-
           meadow from the nine plates rendered side by side): the product
           page's frame with the photograph as it is, the two screens
           standing on it. */
        <ProductFrame slug="ab-test-playbook" plate={STAGE.plate} wash={false} clip={false} inset="none" className="mt-6">
        <div className="grid gap-4 p-4 pb-20 sm:p-8 sm:pb-24 md:p-10 md:pb-28 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-stretch">
          <Side
            label={roleLabel(test.sideA!.role, t.roles.control)}
            letter="A"
            screen={{ surface: test.surface, element, kind, side: "a", presence: presenceOf("a"), behavior: test.differenceBehavior, slot: test.testedSlot, lang, address: surfaceLabel(test.surface, lang) }}
          />
          <div className="flex items-center justify-center">
            <span aria-hidden className={`grid size-9 place-items-center rounded-full max-lg:rotate-90 ${STAGE.dark ? "bg-white/15 text-white ring-1 ring-white/20" : "bg-paper text-ink-500 ring-1 ring-ink-950/[0.06]"}`}>
              <ArrowRight className="size-4" />
            </span>
          </div>
          <Side
            label={roleLabel(test.sideB!.role, t.roles.variant)}
            letter="B"
            screen={{ surface: test.surface, element, kind, side: "b", presence: presenceOf("b"), behavior: test.differenceBehavior, slot: test.testedSlot, lang, address: surfaceLabel(test.surface, lang) }}
            change={diffWord && test.testedSlot ? { sign: diffSign, word: diffWord, slot: test.testedSlot } : undefined}
          />
        </div>
        </ProductFrame>
      ) : (
        <ProductFrame slug="ab-test-playbook" plate={STAGE.plate} wash={false} clip={false} inset="none" className="mt-6">
        <div className="p-4 pb-20 sm:p-8 sm:pb-24 md:p-10 md:pb-28">
        <div className="mx-auto max-w-3xl rounded-[28px] bg-paper p-6 shadow-[0_24px_60px_-32px_rgb(10_16_32/0.35)] ring-1 ring-ink-950/[0.06] sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
            <AbScreen surface={test.surface} element={element} kind={kind} side="solo" slot={test.testedSlot} lang={lang} label={t.testConcept} address={surfaceLabel(test.surface, lang)} />
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-medium text-ink-subtle">{t.whatChanges}</p>
                <p className="mt-1 text-lg leading-snug font-semibold text-ink-950">{test.testedSlot ?? "—"}</p>
              </div>
              <p className="text-sm leading-relaxed text-pretty text-ink-muted">{t.conceptNote}</p>
            </div>
          </div>
        </div>
        </div>
        </ProductFrame>
      )}

      {/* The claim, floating over the photograph (Hulusi, 2026-09-20:
          "make the hypothesis floating", then "liquid glass"): the
          `.liquid-glass` recipe in globals.css - blur with lifted
          saturation, a specular rim, and in Chromium the displacement
          lens below - sitting deep in the plate's bottom band so the
          meadow shows through and bends at the edges. */}
      {/* The lens behind `.liquid-glass` (globals.css): a low-frequency
          noise field displacing the backdrop, so the meadow ripples at
          the card's edges. Mounted once, size zero, next to the card. */}
      <svg aria-hidden className="absolute size-0 overflow-hidden" focusable="false">
        <filter id="liquid-lens" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.006 0.009" numOctaves="2" seed="7" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="3" result="soft" />
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="80" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <div className="liquid-glass z-10 mx-auto -mt-14 flex max-w-3xl gap-4 rounded-[24px] p-6 sm:-mt-16 sm:p-7 md:-mt-20">
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700 [&>svg]:size-5">
          <Quote />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-subtle">{t.hypothesis}</p>
          <p className="mt-1.5 text-xl leading-relaxed font-medium text-balance text-ink-950">{hypothesis}</p>
        </div>
      </div>
    </section>
  );

  /* The run notes as a row of cards under the stage (Hulusi, 2026-09-20:
     "cancel the tabs, put the four cards under the main page as a
     horizontal carousel"): the primary KPI, the guardrail metrics, what to
     watch, the never-do rules - and the reusable rule as a fifth card
     where the record's own hypothesis ends in one. */
  const card = "flex w-[min(22rem,85vw)] shrink-0 snap-start";
  const tile = "w-full bg-paper-soft ring-0";
  const run = (
    /* The cards are grey, the page stays white (Hulusi, 2026-09-20: "add a
       grey background" - then "not the section, the cards"): each card on
       the site's soft surface with no hairline, the way the phone menu's
       rows and the calculator cards sit. */
    <section className="mt-14">
      <CardCarousel
        label={t.runStrip}
        prevLabel={t.prev}
        nextLabel={t.next}
        heading={
          <h2 className="flex items-center gap-3 text-base font-semibold text-ink-950">
            <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700 [&>svg]:size-5">
              <ClipboardList />
            </span>
            {t.run}
          </h2>
        }
      >
        <div data-card className={card}>
          <InfoTile icon={<Target />} title={t.primaryKpi} className={tile}>
            <p className="text-2xl font-semibold tracking-tight text-ink-950">{kpi}</p>
            <p className="mt-2 text-sm leading-relaxed text-pretty text-ink-muted">{test.primaryKpi.explanation}</p>
          </InfoTile>
        </div>
        <div data-card className={card}>
          <InfoTile icon={<ShieldCheck />} tint="bg-emerald-50 text-emerald-700" title={t.guardrailMetrics} className={tile}>
            <ul className="flex list-none flex-col gap-3 p-0">
              {test.otherKpis.map((k) => (
                <Note key={k.label} label={k.label} note={k.explanation} />
              ))}
            </ul>
          </InfoTile>
        </div>
        <div data-card className={card}>
          <InfoTile icon={<Eye />} tint="bg-amber-50 text-amber-700" title={t.whatToTest} className={tile}>
            <ul className="flex list-none flex-col gap-3 p-0">
              {test.whatToTest.map((w) => (
                <Note key={w.label} label={w.label} note={w.explanation} />
              ))}
            </ul>
          </InfoTile>
        </div>
        <div data-card className={card}>
          <InfoTile icon={<Ban />} tint="bg-rose-50 text-rose-700" title={t.neverDo} className={tile}>
            <ol className="flex list-none flex-col gap-3 p-0">
              {test.guardrails.map((g, i) => (
                <li key={g} className="flex gap-3 text-sm leading-relaxed text-pretty text-ink-700">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-paper text-xs font-semibold text-ink-700 tabular-nums ring-1 ring-ink-950/[0.06]">
                    {i + 1}
                  </span>
                  {g}
                </li>
              ))}
            </ol>
          </InfoTile>
        </div>
        {takeaway && (
          <div data-card className={card}>
            <InfoTile icon={<Lightbulb />} title={t.reusableRule} className={tile}>
              <p className="text-lg leading-relaxed font-medium text-balance text-ink-950">{takeaway}</p>
            </InfoTile>
          </div>
        )}
      </CardCarousel>
    </section>
  );

  return (
    <div className="px-4 py-10 md:px-8 md:py-14">
      <div className="mx-auto max-w-[1180px]">
        {header}
        {experiment}
        {run}
      </div>
    </div>
  );
}

/** One side of the comparison: a card with the role's name, the drawing of
    what varies with the tested slot named, and the record's own words for
    what this side is. The variant, where the change lives, carries the
    change as a pill and a brand ring - the reader's "look here". */
function Side({
  label,
  letter,
  screen,
  change,
}: {
  label: string;
  letter: string;
  screen: { surface: string; element: AbElementKind; kind: AbVariableKind; side: "a" | "b"; presence: "absent" | "present" | null; behavior: string; slot: string | null; lang: Lang; address: string };
  change?: { sign: string; word: string; slot: string };
}) {
  return (
    /* No card around the screen (Hulusi, 2026-09-20: "it still looks like
       fake UI - maybe the box in the box"): the window stands on the plate
       by itself, the role and the change pill above it. The record's own
       words for the side used to run under the window; Hulusi had them
       removed the same day ("remove the small texts under the screens") -
       the change pill and the screen itself say what the side is. */
    <div className="group flex min-w-0 flex-col">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <span className={`flex items-center gap-2.5 text-base font-semibold ${STAGE.dark ? "text-white" : "text-ink-950"}`}>
          <span aria-hidden className={`grid size-7 place-items-center rounded-full text-xs font-semibold ${change ? "bg-primary-600 text-white" : STAGE.dark ? "bg-white text-ink-950" : "bg-ink-950 text-white"}`}>
            {letter}
          </span>
          {label}
        </span>
        {change ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm">
            <span aria-hidden className="font-semibold">{change.sign}</span>
            {change.slot} · {change.word}
          </span>
        ) : null}
      </div>
      <AbScreen {...screen} label={label} ring={Boolean(change)} className="flex-1" />
    </div>
  );
}
