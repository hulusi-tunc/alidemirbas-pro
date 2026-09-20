import type { ReactNode } from "react";
import { ArrowRight, Ban, Eye, FlaskConical, Hash, Lightbulb, Quote, ShieldCheck, Target } from "lucide-react";

import { AbDetailShell } from "@/components/AbDetailShell";
import { AbCategoryIcon, SurfaceIcon, abCategoryAccent } from "@/components/ui/AbLibraryIdentity";
import { categoryLabel, setupLabel, surfaceLabel } from "@/components/ui/AbTestVisuals";
import { InfoTile } from "@/components/ui/InfoTile";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { VariableDiagram } from "@/components/ui/VariableDiagram";
import { abPlaybookText, abSetupMode, abVariableKind } from "@/lib/ab-test-playbook";
import type { AbVariableKind } from "@/lib/ab-test-playbook";
import type { AbTestDetail } from "@/lib/ab-test-view";
import { primaryKpiLabel } from "@/lib/ab-test-view";

/* The A/B test detail page, in the journey detail page's idiom (Hulusi,
   2026-09-20: "now the A/B detail - first the layout, fix it with our style,
   the way we did the journey detail"; then, on the first pass: "we need
   bigger space for the previews - everything in boxes is hard to
   understand; a multi-tab layout, or more compact, or direct the reader
   where to look").

   So, two tabs under one shared header, as the journey page has (ui:
   AbDetailShell). The header is the record as a person meets it: the
   category as an eyebrow with its glyph, the question on the h1 step, the
   lede, one row of chips (the page, the primary KPI, the id).

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
   reusable rule, as InfoTiles.

   What did NOT change is the content rule this page has always kept: every
   cell is a real field or a clause of the record's own hypothesis, and a
   cell with no data behind it is omitted rather than filled - no invented
   control, no invented variant, no invented values in a diagram (see
   ui/VariableDiagram.tsx and lib/ab-test-playbook.ts). */

type Lang = "en" | "tr";

const T = {
  en: {
    tabExperiment: "Experiment",
    tabRun: "How to run",
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
    tabExperiment: "Deney",
    tabRun: "Nasıl yürütülür",
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

export default function AbTestPlaybookPage({
  test,
  lang,
  labels,
  hrefs,
  breadcrumb,
}: {
  test: AbTestDetail;
  lang: Lang;
  labels: { back: string; lab: string; lang: string; cta: string };
  hrefs: { library: string; lab: string; lang: string; cta: string };
  breadcrumb: object;
}) {
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
  const stageTitle =
    mode !== "comparison" ? t.testConcept
    : test.setupType === "option-vs-option" ? t.optionVsOption
    : test.setupType === "variant-vs-variant" ? t.variantVsVariant
    : t.controlVariant;
  const roleLabel = (role: string, fallback: string) => t.roles[role] ?? fallback;
  const diffWord = t.diff[test.differenceBehavior];
  const diffSign = DIFF_SIGN[test.differenceBehavior];

  const header = (
    <header data-ab-variable={kind} data-ab-mode={mode}>
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
        <h2 className="flex items-center gap-3 text-base font-semibold text-ink-950">
          <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700 [&>svg]:size-5">
            <FlaskConical />
          </span>
          {stageTitle}
        </h2>
        <dl className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
          {facts.map((f) => (
            <div key={f.label} className="flex items-baseline gap-1.5">
              <dt className="text-ink-subtle">{f.label}</dt>
              <dd className="font-medium text-ink-900">{f.value}</dd>
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
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-stretch">
          <Side
            label={roleLabel(test.sideA!.role, t.roles.control)}
            letter="A"
            side={test.sideA!}
            kind={kind}
            presence={presenceOf("a")}
            testedSlot={test.testedSlot}
            testedElementLabel={t.testedElement}
            lang={lang}
          />
          <div className="flex items-center justify-center">
            <span aria-hidden className="grid size-9 place-items-center rounded-full bg-paper text-ink-500 ring-1 ring-ink-950/[0.06] max-lg:rotate-90">
              <ArrowRight className="size-4" />
            </span>
          </div>
          <Side
            label={roleLabel(test.sideB!.role, t.roles.variant)}
            letter="B"
            side={test.sideB!}
            kind={kind}
            presence={presenceOf("b")}
            testedSlot={test.testedSlot}
            testedElementLabel={t.testedElement}
            lang={lang}
            change={diffWord && test.testedSlot ? { sign: diffSign, word: diffWord, slot: test.testedSlot } : undefined}
          />
        </div>
      ) : (
        <div className="mx-auto mt-6 max-w-3xl rounded-[28px] bg-paper p-6 ring-1 ring-ink-950/[0.06] sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
            <VariableDiagram kind={kind} testedSlot={test.testedSlot} label={t.testedElement} lang={lang} />
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-xs font-medium text-ink-subtle">{t.whatChanges}</p>
                <p className="mt-1 text-lg leading-snug font-semibold text-ink-950">{test.testedSlot ?? "—"}</p>
              </div>
              <p className="text-sm leading-relaxed text-pretty text-ink-muted">{t.conceptNote}</p>
            </div>
          </div>
        </div>
      )}

      {/* The claim, closing the experiment - not a box: one icon and the
          sentence at reading size. */}
      <div className="mt-10 flex gap-4">
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700 [&>svg]:size-5">
          <Quote />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-subtle">{t.hypothesis}</p>
          <p className="mt-1.5 max-w-4xl text-xl leading-relaxed font-medium text-balance text-ink-950">{hypothesis}</p>
        </div>
      </div>
    </section>
  );

  const run = (
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
  );

  return (
    <AbDetailShell
      labels={{ ...labels, experiment: t.tabExperiment, run: t.tabRun }}
      hrefs={hrefs}
      header={header}
      experiment={experiment}
      run={run}
    />
  );
}

/** One side of the comparison: a card with the role's name, the drawing of
    what varies with the tested slot named, and the record's own words for
    what this side is. The variant, where the change lives, carries the
    change as a pill and a brand ring - the reader's "look here". */
function Side({
  label,
  letter,
  side,
  kind,
  presence,
  testedSlot,
  testedElementLabel,
  lang,
  change,
}: {
  label: string;
  letter: string;
  side: { role: string; label: string | null; sourceBasis: string | null };
  kind: AbVariableKind;
  presence: "absent" | "present" | null;
  testedSlot: string | null;
  testedElementLabel: string;
  lang: Lang;
  change?: { sign: string; word: string; slot: string };
}) {
  return (
    <div className={`flex min-w-0 flex-col rounded-[28px] bg-paper p-6 ring-1 sm:p-7 ${change ? "ring-primary-300" : "ring-ink-950/[0.06]"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2.5 text-base font-semibold text-ink-950">
          <span aria-hidden className="grid size-7 place-items-center rounded-full bg-paper-soft text-xs font-semibold text-ink-700">
            {letter}
          </span>
          {label}
        </span>
        {change ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
            <span aria-hidden className="font-semibold">{change.sign}</span>
            {change.slot} · {change.word}
          </span>
        ) : null}
      </div>
      <div className="mt-5 flex-1">
        <VariableDiagram kind={kind} testedSlot={testedSlot} label={testedElementLabel} lang={lang} presence={presence} />
      </div>
      <p className="mt-5 text-base leading-relaxed text-pretty text-ink-900">{side.label ?? "—"}</p>
    </div>
  );
}
