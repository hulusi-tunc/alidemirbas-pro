import type { ReactNode } from "react";
import { ArrowRight, Ban, Eye, FlaskConical, Hash, Lightbulb, Quote, ShieldCheck, SlidersHorizontal, Target } from "lucide-react";

import { AbCategoryIcon, SurfaceIcon, abCategoryAccent } from "@/components/ui/AbLibraryIdentity";
import { categoryLabel, setupLabel, surfaceLabel } from "@/components/ui/AbTestVisuals";
import { InfoTile } from "@/components/ui/InfoTile";
import { VariableDiagram } from "@/components/ui/VariableDiagram";
import { abPlaybookText, abSetupMode, abVariableKind } from "@/lib/ab-test-playbook";
import type { AbVariableKind } from "@/lib/ab-test-playbook";
import type { AbTestDetail } from "@/lib/ab-test-view";
import { primaryKpiLabel } from "@/lib/ab-test-view";

/* The A/B test detail page, in the journey detail page's idiom (Hulusi,
   2026-09-20: "now the A/B detail - first the layout, fix it with our style,
   the way we did the journey detail"). Until today it was the
   AB001_Detail_Page_v5 reference: a mono rail, ruled columns, a pulled
   hypothesis, a dark closing block - the old Lab idiom the journey Info tab
   left on 2026-09-14 ("text-heavy; icons and more cards, like the Lab
   homepage").

   Same opening as a journey's Info tab: the category as an eyebrow with its
   glyph, the question on the h1 step, the lede, one row of chips with icons
   (the page, the primary KPI, the id). Then the experiment as the big tile
   where the journey shows its canvas - Control beside Variant with the
   A → B arrow, or the one concept diagram - and a Setup tile beside it with
   the record's facts. Then the notes as InfoTiles: the hypothesis across
   the full width, the primary KPI, the guardrail metrics, what to watch,
   the never-do rules, and the reusable rule closing the page where the
   record's own hypothesis ends in one.

   What did NOT change is the content rule this page has always kept: every
   cell is a real field or a clause of the record's own hypothesis, and a
   cell with no data behind it is omitted rather than filled - no invented
   control, no invented variant, no invented values in a diagram (see
   ui/VariableDiagram.tsx and lib/ab-test-playbook.ts). */

type Lang = "en" | "tr";

const T = {
  en: {
    controlVariant: "Control vs Variant",
    testConcept: "Test concept",
    whatChanges: "What changes",
    control: "Control",
    variant: "Variant",
    setup: "Setup",
    changed: "Changed",
    surface: "Page",
    mode: "Mode",
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
    controlVariant: "Kontrol / Varyant",
    testConcept: "Test fikri",
    whatChanges: "Ne değişiyor",
    control: "Kontrol",
    variant: "Varyant",
    setup: "Kurulum",
    changed: "Değişen",
    surface: "Sayfa",
    mode: "Biçim",
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

/** A chip with its own tinted icon tile - the journey Info tab's chip. */
function Chip({ icon, tint, children }: { icon: ReactNode; tint: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2 rounded-full bg-paper py-1 pr-3.5 pl-1 text-sm font-medium text-ink-950 ring-1 ring-ink-950/[0.06]">
      <span aria-hidden className={`grid size-7 place-items-center rounded-full ${tint} [&>svg]:size-3.5`}>{icon}</span>
      {children}
    </li>
  );
}

/** One fact in the Setup tile. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-ink-subtle">{label}</dt>
      <dd className="mt-0.5 text-sm leading-snug text-ink-900">{value}</dd>
    </div>
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

export default function AbTestPlaybookPage({ test, lang }: { test: AbTestDetail; lang: Lang }) {
  const t = T[lang];
  const { lede, hypothesis, takeaway } = abPlaybookText(test.hypothesis);
  const mode = abSetupMode(test);
  /* What the experiment varies. Drives the diagram; exposed as a data
     attribute so the classification can be audited against the rendered
     page rather than against a copy of the rule. */
  const kind = abVariableKind(test);
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

  return (
    <div className="bg-paper-soft px-4 py-10 md:px-8 md:py-14" data-ab-variable={kind} data-ab-mode={mode}>
      <div className="mx-auto max-w-[1180px]">
        <header>
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

        {/* The experiment, where a journey shows its canvas, and the setup
            in facts beside it. Two legitimate modes, chosen by the record
            rather than by template: COMPARISON puts the two named sides side
            by side; CONCEPT shows one diagram of what is under test and says
            outright that no control and variant are prescribed. */}
        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="rounded-[28px] bg-paper p-6 ring-1 ring-ink-950/[0.06]">
            <div className="flex items-center gap-3">
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700 [&>svg]:size-5">
                <FlaskConical />
              </span>
              <h2 className="text-base font-semibold text-ink-950">{mode === "comparison" ? t.controlVariant : t.testConcept}</h2>
            </div>

            {mode === "comparison" ? (
              /* Same surface, same slot, twice - because the surface and the
                 slot ARE the same on both sides. The difference between A and
                 B lives in the data as prose, so it is stated in each side's
                 caption rather than drawn as a difference the data cannot
                 support. */
              <div className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-start">
                <Side label={t.control} letter="A" side={test.sideA!} kind={kind} presence={presenceOf("a")} testedSlot={test.testedSlot} testedElementLabel={t.testedElement} lang={lang} />
                <div className="flex items-center justify-center sm:h-full sm:pt-10">
                  <span aria-hidden className="grid size-8 place-items-center rounded-full bg-paper-soft text-ink-500 max-sm:rotate-90">
                    <ArrowRight className="size-4" />
                  </span>
                </div>
                <Side label={t.variant} letter="B" side={test.sideB!} kind={kind} presence={presenceOf("b")} testedSlot={test.testedSlot} testedElementLabel={t.testedElement} lang={lang} />
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 sm:items-center">
                <VariableDiagram kind={kind} testedSlot={test.testedSlot} label={t.testedElement} lang={lang} />
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-xs font-medium text-ink-subtle">{t.whatChanges}</p>
                    <p className="mt-1 text-lg leading-snug font-semibold text-ink-950">{test.testedSlot ?? "—"}</p>
                  </div>
                  <p className="text-sm leading-relaxed text-pretty text-ink-muted">{t.conceptNote}</p>
                </div>
              </div>
            )}
          </section>

          <InfoTile icon={<SlidersHorizontal />} tint={accent.tile} title={t.setup}>
            <dl className="flex flex-col gap-3.5">
              <Fact label={t.changed} value={test.testedSlot ?? "—"} />
              <Fact label={t.surface} value={surfaceLabel(test.surface, lang)} />
              <Fact label={t.mode} value={mode === "comparison" ? t.controlVariant : t.testConcept} />
              <Fact label={t.difference} value={setupLabel(test.differenceBehavior, lang)} />
            </dl>
          </InfoTile>
        </div>

        {/* The notes as tiles. The hypothesis first and full width - it is
            the record's one claim; the four cells of the old "how to run"
            grid as four tiles; the reusable rule closing, where the record
            has one (see ab-test-playbook.ts on why it is not synthesised for
            the ones that don't). */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoTile icon={<Quote />} title={t.hypothesis} className="sm:col-span-2">
            <p className="max-w-4xl text-lg leading-relaxed font-medium text-balance text-ink-950 md:text-xl">{hypothesis}</p>
          </InfoTile>

          <InfoTile icon={<Target />} title={t.primaryKpi}>
            <p className="text-2xl font-semibold tracking-tight text-ink-950">{kpi}</p>
            <p className="mt-2 text-sm leading-relaxed text-pretty text-ink-muted">{test.primaryKpi.explanation}</p>
          </InfoTile>

          <InfoTile icon={<ShieldCheck />} tint="bg-emerald-50 text-emerald-700" title={t.guardrailMetrics}>
            <ul className="flex list-none flex-col gap-3 p-0">
              {test.otherKpis.map((k) => (
                <Note key={k.label} label={k.label} note={k.explanation} />
              ))}
            </ul>
          </InfoTile>

          <InfoTile icon={<Eye />} tint="bg-amber-50 text-amber-700" title={t.whatToTest}>
            <ul className="flex list-none flex-col gap-3 p-0">
              {test.whatToTest.map((w) => (
                <Note key={w.label} label={w.label} note={w.explanation} />
              ))}
            </ul>
          </InfoTile>

          <InfoTile icon={<Ban />} tint="bg-rose-50 text-rose-700" title={t.neverDo}>
            <ol className="flex list-none flex-col gap-3 p-0">
              {test.guardrails.map((g, i) => (
                <li key={g} className="flex gap-3 text-sm leading-relaxed text-pretty text-ink-700">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-paper-soft text-xs font-semibold text-ink-700 tabular-nums">
                    {i + 1}
                  </span>
                  {g}
                </li>
              ))}
            </ol>
          </InfoTile>

          {takeaway && (
            <InfoTile icon={<Lightbulb />} title={t.reusableRule} className="sm:col-span-2">
              <p className="max-w-4xl text-lg leading-relaxed font-medium text-balance text-ink-950 md:text-xl">{takeaway}</p>
            </InfoTile>
          )}
        </div>
      </div>
    </div>
  );
}

/** One side of the comparison: the drawing with the tested slot named, and
    the side's own label beneath it. The label is the record's words for what
    this side actually is - the only place the A/B difference is stated,
    because it is the only place the data states it. */
function Side({
  label,
  letter,
  side,
  kind,
  presence,
  testedSlot,
  testedElementLabel,
  lang,
}: {
  label: string;
  letter: string;
  side: { role: string; label: string | null; sourceBasis: string | null };
  kind: AbVariableKind;
  presence: "absent" | "present" | null;
  testedSlot: string | null;
  testedElementLabel: string;
  lang: Lang;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink-950">{label}</span>
        <span aria-hidden className="grid size-6 place-items-center rounded-full bg-paper-soft text-xs font-semibold text-ink-700">
          {letter}
        </span>
      </div>
      <VariableDiagram kind={kind} testedSlot={testedSlot} label={testedElementLabel} lang={lang} presence={presence} />
      <p className="text-sm leading-relaxed text-pretty text-ink-700">{side.label ?? "—"}</p>
      {side.sourceBasis && <p className="text-xs leading-relaxed text-ink-subtle">{side.sourceBasis}</p>}
    </div>
  );
}
