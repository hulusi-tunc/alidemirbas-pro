import { ArrowLeft, Ban, Eye, Lightbulb, Quote, ShieldCheck, Target } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { AbCategoryIcon, AbSurfaceIcon, abCategoryAccent } from "@/components/ui/LibraryChrome";
import { categoryLabel, surfaceLabel } from "@/components/ui/AbTestVisuals";
import { VariableDiagram } from "@/components/ui/VariableDiagram";
import { clsx } from "@/lib/clsx";
import { abPlaybookText, abSetupMode, abVariableKind } from "@/lib/ab-test-playbook";
import type { AbVariableKind } from "@/lib/ab-test-playbook";
import type { AbTestDetail } from "@/lib/ab-test-view";
import { primaryKpiLabel } from "@/lib/ab-test-view";

/* The A/B test detail page. Rebuilt 2026-09-20 onto the site's design
   system (Hulusi: the A/B library and detail pages were never updated),
   in the same order the AB001_Detail_Page_v5 reference set: the way back,
   the experiment header, Control vs Variant, the spec, the hypothesis as
   a pulled statement, "How to run this test" as four tiles, and the
   reusable rule as the closing dark tile.

   What changed in the rebuild: the mono rail (back link, "TEST 004 / 211")
   is a pill link plus a plain sentence; the category and page are the
   library's own icon tiles and pills (ui/LibraryChrome), so the page
   matches the card that opened it; the bordered grid became tiles with
   icon tiles; the A/B marks are the house badges (A ink, B rose) the
   homepage miniatures use; no uppercase, no mono except the record id.

   CONTENT is unchanged and still the record's own: every cell is a real
   field or a clause of the record's hypothesis, and a cell with no data
   behind it is omitted rather than filled. The reference's Newsreader
   pull quotes stay in the sans at a larger size, per the site's own rule. */

type Lang = "en" | "tr";

const T = {
  en: {
    back: "All A/B tests",
    position: "Test {n} of {total}",
    controlVariant: "Control vs Variant",
    testConcept: "Test concept",
    whatChanges: "What changes",
    control: "Control",
    variant: "Variant",
    changed: "Changed",
    surface: "Page",
    category: "Category",
    testedElement: "Tested element",
    conceptNote:
      "This record defines the element to test, not a prescribed control and variant.",
    hypothesis: "Hypothesis",
    howToRun: "How to run this test",
    primaryKpi: "Primary KPI",
    guardrailMetrics: "Guardrail metrics",
    whatToTest: "What to watch during the test",
    neverDo: "Never do",
    reusableRule: "Reusable rule",
  },
  tr: {
    back: "Tüm A/B testleri",
    position: "Test {n} / {total}",
    controlVariant: "Kontrol / Varyant",
    testConcept: "Test fikri",
    whatChanges: "Ne değişiyor",
    control: "Kontrol",
    variant: "Varyant",
    changed: "Değişen",
    surface: "Sayfa",
    category: "Kategori",
    testedElement: "Test edilen öğe",
    conceptNote:
      "Bu kayıt test edilecek öğeyi tanımlar; hazır bir kontrol ve varyant önermez.",
    hypothesis: "Hipotez",
    howToRun: "Bu test nasıl yürütülür",
    primaryKpi: "Birincil KPI",
    guardrailMetrics: "Guardrail metrikleri",
    whatToTest: "Test sırasında bakılacaklar",
    neverDo: "Yapılmaması gerekenler",
    reusableRule: "Yeniden kullanılabilir kural",
  },
} as const;

/** A small label over a value: sans, 13px, medium, sentence case. */
const LABEL = "text-[13px] font-medium text-ink-500";

export default function AbTestPlaybookPage({
  test,
  lang,
  basePath,
  position,
  total,
}: {
  test: AbTestDetail;
  lang: Lang;
  basePath: string;
  /** 1-based index of this test in the library, for the header line. */
  position: number;
  total: number;
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

  return (
    <div className="altor-container pt-8 pb-20 md:pb-28" data-ab-variable={kind} data-ab-mode={mode}>
      {/* The way back, and where this record sits in the library. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ButtonLink href={basePath} variant="outline" size="sm">
          <ArrowLeft aria-hidden className="size-4" />
          {t.back}
        </ButtonLink>
        <p className="text-sm text-ink-500 tabular-nums">
          {t.position.replace("{n}", String(position)).replace("{total}", String(total))}
        </p>
      </div>

      {/* The experiment header: the category's tile, the id and category
          as the eyebrow, the question as the title, the lede, then the
          record's three facts as pills. */}
      <header className="mt-10 max-w-3xl">
        <p className="flex items-center gap-3">
          <span className={clsx("grid size-9 shrink-0 place-items-center rounded-lg", accent.tile)}>
            <AbCategoryIcon id={test.category} />
          </span>
          <span className="text-sm text-ink-600">
            <span className="font-mono text-[13px] text-ink-500 tabular-nums">{test.id}</span>
            <span className="text-ink-400"> · </span>
            {categoryLabel(test.category, lang)}
          </span>
        </p>
        <h1 className="mt-5 text-h1 text-pretty text-ink-950">{test.question}</h1>
        {lede && <p className="mt-5 max-w-[56ch] text-lg leading-relaxed text-pretty text-ink-600">{lede}</p>}
        <ul className="mt-6 flex list-none flex-wrap gap-2 p-0">
          <Fact icon={<AbSurfaceIcon id={test.surface} className="size-4" />} label={t.surface} value={surfaceLabel(test.surface, lang)} />
          {/* differenceBehavior (add / remove / move / change) is not shown
              as a pill: it has no approved label in either language beyond
              the raw value, and the diagram already draws add and remove. */}
          {test.testedSlot ? <Fact icon={<Target aria-hidden className="size-4" />} label={t.changed} value={test.testedSlot} /> : null}
        </ul>
      </header>

      {/* Two legitimate modes, chosen by the record rather than by template.
          COMPARISON puts the two named sides side by side; CONCEPT shows one
          diagram of what is under test and says outright that no control and
          variant are prescribed. */}
      <section className="mt-14">
        <h2 className="text-h3 text-ink-950">{mode === "comparison" ? t.controlVariant : t.testConcept}</h2>
        {mode === "comparison" ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <SidePanel label={t.control} letter="A" side={test.sideA!} kind={kind} presence={presenceOf("a")} testedSlot={test.testedSlot} testedElementLabel={t.testedElement} lang={lang} />
            <SidePanel label={t.variant} letter="B" side={test.sideB!} kind={kind} presence={presenceOf("b")} testedSlot={test.testedSlot} testedElementLabel={t.testedElement} lang={lang} />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 rounded-2xl bg-paper-soft p-5 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-10 lg:p-6">
            <VariableDiagram kind={kind} testedSlot={test.testedSlot} label={t.testedElement} lang={lang} />
            <div className="flex flex-col justify-center gap-5">
              <div>
                <p className={LABEL}>{t.whatChanges}</p>
                <p className="mt-1.5 text-lg leading-snug font-semibold text-ink-950">{test.testedSlot ?? "—"}</p>
              </div>
              <p className="max-w-[46ch] text-sm leading-relaxed text-pretty text-ink-600">{t.conceptNote}</p>
            </div>
          </div>
        )}
      </section>

      {/* The hypothesis, pulled: the category's tint as the ground, set
          large in the sans per the site's own pull-quote rule. */}
      <section className="mt-14">
        <div className={clsx("rounded-2xl px-6 py-10 sm:px-12 sm:py-14", accent.tile.split(" ")[0])}>
          <p className={clsx("flex items-center gap-2 text-[13px] font-medium", accent.ink)}>
            <Lightbulb aria-hidden className="size-4" />
            {t.hypothesis}
          </p>
          <p className="mt-5 max-w-[38ch] text-h3 text-pretty text-ink-950 sm:text-[1.75rem] sm:leading-[1.3]">{hypothesis}</p>
        </div>
      </section>

      {/* Four tiles, two by two. The reference's fourth cell was KEEP
          CONSTANT, which has no field behind it; this uses the slot for the
          record's own guardrails. */}
      <section className="mt-14">
        <h2 className="text-h3 text-ink-950">{t.howToRun}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Tile icon={<Target aria-hidden />} title={t.primaryKpi}>
            <p className="text-h3 text-ink-950">{primaryKpiLabel(test.primaryKpi.label, lang)}</p>
            <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-ink-600">{test.primaryKpi.explanation}</p>
          </Tile>

          <Tile icon={<ShieldCheck aria-hidden />} title={t.guardrailMetrics}>
            <Rows items={test.otherKpis} />
          </Tile>

          <Tile icon={<Eye aria-hidden />} title={t.whatToTest}>
            <Rows items={test.whatToTest} />
          </Tile>

          <Tile icon={<Ban aria-hidden />} title={t.neverDo}>
            <ul className="flex list-none flex-col p-0">
              {test.guardrails.map((g) => (
                <li key={g} className="border-b border-line-soft py-2.5 text-[15px] leading-relaxed text-pretty text-ink-700 last:border-0">
                  {g}
                </li>
              ))}
            </ul>
          </Tile>
        </div>
      </section>

      {/* The closing statement. One per page, and only where the record's own
          hypothesis ends in a stated point - see ab-test-playbook.ts on why
          this is not synthesised for the records that don't have one. */}
      {takeaway && (
        <section className="mt-14">
          <div className="rounded-2xl bg-ink-950 px-6 py-10 text-white sm:px-12 sm:py-14">
            <p className="flex items-center gap-2 text-[13px] font-medium text-white/60">
              <Quote aria-hidden className="size-4" />
              {t.reusableRule}
            </p>
            <p className="mt-5 max-w-[42ch] text-h3 text-pretty text-white sm:text-[1.6rem] sm:leading-[1.35]">{takeaway}</p>
          </div>
        </section>
      )}
    </div>
  );
}

/** One of the record's facts as a pill: a glyph, the label in ink-500,
    the value in ink-950. */
function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <li className="inline-flex items-center gap-2 rounded-full bg-paper-soft py-1.5 pr-3.5 pl-2.5 text-sm [&>svg]:size-4 [&>svg]:text-ink-500">
      {icon}
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-950">{value}</span>
    </li>
  );
}

/** The A / B badge the homepage miniatures and the A/B product page use:
    A on ink, B on rose. */
function SideMark({ letter }: { letter: "A" | "B" }) {
  return (
    <span
      aria-hidden
      className={clsx("grid size-6 place-items-center rounded-full text-xs font-semibold text-white", letter === "A" ? "bg-ink-950" : "bg-rose-600")}
    >
      {letter}
    </span>
  );
}

/** One side of the comparison: a tile with the side's badge and name, the
    surface with the tested slot marked, and the side's own label beneath
    it - the record's words for what this side actually is, the only place
    the A/B difference is stated, because it is the only place the data
    states it. */
function SidePanel({
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
  letter: "A" | "B";
  side: { role: string; label: string | null; sourceBasis: string | null };
  kind: AbVariableKind;
  presence: "absent" | "present" | null;
  testedSlot: string | null;
  testedElementLabel: string;
  lang: Lang;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-paper-soft p-5 lg:p-6">
      <p className="flex items-center gap-2.5 text-sm font-semibold text-ink-950">
        <SideMark letter={letter} />
        {label}
      </p>
      <VariableDiagram kind={kind} testedSlot={testedSlot} label={testedElementLabel} lang={lang} presence={presence} />
      <p className="text-[15px] leading-relaxed text-pretty text-ink-800">{side.label ?? "—"}</p>
      {side.sourceBasis && <p className="text-[13px] leading-relaxed text-ink-500">{side.sourceBasis}</p>}
    </div>
  );
}

/** One tile of the how-to-run grid: an icon tile and a title, then the
    content. */
function Tile({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-paper p-5 ring-1 ring-ink-950/[0.06] lg:p-6">
      <p className="flex items-center gap-2.5 text-sm font-semibold text-ink-950">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-paper-soft text-ink-700 [&>svg]:size-4">{icon}</span>
        {title}
      </p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/** Label + explanation rows, ruled. */
function Rows({ items }: { items: readonly { label: string; explanation: string }[] }) {
  return (
    <ul className="flex list-none flex-col p-0">
      {items.map((k) => (
        <li key={k.label} className="border-b border-line-soft py-2.5 last:border-0">
          <span className="text-[15px] font-medium text-ink-950">{k.label}</span>
          <span className="ml-2 text-[13px] text-ink-600">{k.explanation}</span>
        </li>
      ))}
    </ul>
  );
}
