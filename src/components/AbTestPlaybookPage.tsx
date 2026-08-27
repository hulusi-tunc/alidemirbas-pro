import Link from "next/link";

import { VariableDiagram } from "@/components/ui/VariableDiagram";
import { abPlaybookText, abSetupMode, abVariableKind } from "@/lib/ab-test-playbook";
import type { AbVariableKind } from "@/lib/ab-test-playbook";
import type { AbTestDetail } from "@/lib/ab-test-view";

/* The A/B test detail page, built to the AB001_Detail_Page_v5 reference.

   Structure, in the reference's order: a mono rail (back link, position in
   the library), the experiment header, Control vs Variant with an A → B
   arrow between the two, a spec strip, the hypothesis as a large pulled
   statement, a four-cell "How to run this test" grid, and the reusable rule
   as the closing dark block.

   Two departures from the mockup, both deliberate.

   FONT. The reference sets the hypothesis and the rule in Newsreader. This
   site removed its serif on purpose - globals.css clamps `--font-serif` to
   the sans so the utility cannot produce one - and states the replacement
   rule in the same breath: pull quotes are re-set in the sans at a larger
   size with tighter tracking. That is what both blocks do here. Applying the
   design through the site's own stated rule rather than re-introducing a
   font it deliberately dropped.

   CONTENT. The mockup is populated with invented material - a Flowbase
   landing page, "14 gün ücretsiz deneyin", "2.400+ ekip kullanıyor", a
   HELD CONSTANT list, a rewritten reusable rule. None of it exists in the
   dataset, and the standing instruction is not to fabricate experiment
   detail. So every cell below is a real field or a clause of the record's
   own hypothesis, and a cell with no data behind it is omitted rather than
   filled. See the section comments for which ones that hits. */

type Lang = "en" | "tr";

const T = {
  en: {
    back: "A/B Test Library",
    test: "TEST",
    controlVariant: "Control vs Variant",
    testConcept: "Test concept",
    whatChanges: "What changes",
    control: "Control",
    variant: "Variant",
    changed: "Changed",
    surface: "Surface",
    testedElement: "Tested element",
    conceptNote:
      "This record defines the element to test, not a prescribed control and variant.",
    hypothesis: "Hypothesis",
    howToRun: "How to run this test",
    primaryKpi: "Primary KPI",
    guardrailMetrics: "Guardrail metrics",
    whatToTest: "What to test",
    neverDo: "Never do",
    reusableRule: "Reusable rule",
  },
  tr: {
    back: "A/B Test Kütüphanesi",
    test: "TEST",
    controlVariant: "Kontrol / Varyant",
    testConcept: "Test fikri",
    whatChanges: "Değişen ne",
    control: "Kontrol",
    variant: "Varyant",
    changed: "Değişen",
    surface: "Yüzey",
    testedElement: "Test edilen öğe",
    conceptNote:
      "Bu kayıt test edilecek öğeyi tanımlıyor; belirlenmiş bir kontrol ve varyant tanımlamıyor.",
    hypothesis: "Hipotez",
    howToRun: "Bu test nasıl yürütülür",
    primaryKpi: "Birincil KPI",
    guardrailMetrics: "Guardrail metrikleri",
    whatToTest: "Test edilecekler",
    neverDo: "Yapılmaması gerekenler",
    reusableRule: "Yeniden kullanılabilir kural",
  },
} as const;

const RAIL = "font-mono text-[11px] tracking-[0.12em] text-ink-400 uppercase";

/* `surface` is a lowercase enum key on the record ("cart", "pdp",
   "generic-ui"). Presented as-is it reads as a slug sitting next to fully
   formed prose, so the hyphen becomes a space and the acronyms - which are
   what most of these keys are - stay upper. No mapping table: that would be
   a second name for each surface to keep in sync with the data. */
const ACRONYMS = new Set(["pdp", "plp", "ui", "saas"]);
const surfaceLabel = (surface: string) =>
  surface
    .split("-")
    .map((w) => (ACRONYMS.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");

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
  /** 1-based index of this test in the library, for the header rail. */
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

  return (
    <div className="mx-auto max-w-[1120px] px-6 pb-24 sm:px-8" data-ab-variable={kind} data-ab-mode={mode}>
      <header className={`flex items-baseline justify-between border-b border-line py-5 ${RAIL}`}>
        <Link href={basePath} className="transition-colors hover:text-ink-800">
          ← {t.back}
        </Link>
        <span className="text-ink-300 tabular-nums">
          {t.test} {String(position).padStart(3, "0")} / {total}
        </span>
      </header>

      <section className="pt-11 pb-13">
        {/* id · category · what the difference does. All three are real
            fields; the mockup's "CTA" segment came from the tested element,
            which already has its own cell in the spec strip below. */}
        <p className={RAIL}>
          {test.id} · {test.category} · {test.differenceBehavior}
        </p>
        <h1 className="mt-5 max-w-[20ch] text-[clamp(1.75rem,1.25rem+1.8vw,2.125rem)] leading-[1.25] font-semibold tracking-[-0.015em] text-pretty text-ink-950 sm:max-w-[34ch]">
          {test.question}
        </h1>
        {lede && (
          <p className="mt-4 max-w-[46ch] text-[15px] leading-[1.7] text-pretty text-ink-600">{lede}</p>
        )}
      </section>

      {/* Two legitimate modes, chosen by the record rather than by template.
          COMPARISON puts the two named sides side by side; CONCEPT shows one
          diagram of what is under test and says outright that no control and
          variant are prescribed. Same type, same spacing, same metadata
          styling either way - only the claim differs. */}
      <section className="border-t border-line pt-9 pb-10">
        <h2 className={RAIL}>{mode === "comparison" ? t.controlVariant : t.testConcept}</h2>

        {mode === "comparison" ? (
          /* Same surface, same slot, twice - because the surface and the slot
             ARE the same on both sides. The difference between A and B lives
             in the data as prose, so it is stated in each card's caption
             rather than drawn as a visual difference the data cannot
             support. */
          <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
            <SidePanel
              label={t.control}
              letter="A"
              side={test.sideA!}
              kind={kind}
              presence={presenceOf("a")}
              testedSlot={test.testedSlot}
              testedElementLabel={t.testedElement}
              lang={lang}
            />
            <div className="flex items-center justify-center lg:h-full">
              <span aria-hidden className="font-mono text-[13px] text-ink-300 max-lg:rotate-90">
                A → B
              </span>
            </div>
            <SidePanel
              label={t.variant}
              letter="B"
              side={test.sideB!}
              kind={kind}
              presence={presenceOf("b")}
              testedSlot={test.testedSlot}
              testedElementLabel={t.testedElement}
              lang={lang}
            />
          </div>
        ) : (
          <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-10">
            <VariableDiagram kind={kind} testedSlot={test.testedSlot} label={t.testedElement} lang={lang} />
            <div className="flex flex-col justify-center gap-6">
              <div>
                <p className={RAIL}>{t.whatChanges}</p>
                <p className="mt-2.5 text-[1.05rem] leading-snug font-medium text-ink-950">
                  {test.testedSlot ?? "—"}
                </p>
              </div>
              <p className="max-w-[46ch] text-[14px] leading-relaxed text-pretty text-ink-500">
                {t.conceptNote}
              </p>
            </div>
          </div>
        )}

        {/* Spec strip. The reference had a third cell, HELD CONSTANT; no
            field behind it exists on any of the 211 records, and inventing
            one is exactly what this round rules out - so two cells. In
            concept mode the "changed" cell is already stated beside the
            diagram above, leaving surface as the only new fact, so the strip
            is comparison-only rather than repeating itself. */}
        {mode === "comparison" && (
          <div className="mt-10 grid border border-line-strong bg-paper sm:grid-cols-[1.15fr_1fr]">
            <div className="p-6 sm:p-7">
              <p className={RAIL}>{t.changed}</p>
              <p className="mt-3 text-[1rem] leading-snug font-semibold text-ink-950">
                {test.testedSlot ?? "—"}
              </p>
            </div>
            <div className="border-t border-line p-6 sm:border-t-0 sm:border-l sm:p-7">
              <p className={RAIL}>{t.surface}</p>
              <p className="mt-3 text-[1rem] leading-snug text-ink-700">{surfaceLabel(test.surface)}</p>
            </div>
          </div>
        )}
        {mode === "concept" && (
          <div className="mt-10 border border-line-strong bg-paper p-6 sm:p-7">
            <p className={RAIL}>{t.surface}</p>
            <p className="mt-3 text-[1rem] leading-snug text-ink-700">{surfaceLabel(test.surface)}</p>
          </div>
        )}
      </section>

      {/* The hypothesis, pulled. Warm tint, generous padding, set large in
          the sans per the site's own pull-quote rule. */}
      <section className="mt-3 mb-13">
        <div className="rounded-md bg-paper-soft px-8 py-12 sm:px-16 sm:py-16">
          <p className={RAIL}>{t.hypothesis}</p>
          <p className="mt-6 max-w-[30ch] text-[clamp(1.5rem,1.1rem+1.6vw,2.125rem)] leading-[1.36] font-medium tracking-[-0.02em] text-pretty text-ink-950 sm:max-w-[38ch]">
            {hypothesis}
          </p>
        </div>
      </section>

      {/* Four cells, two by two. The mockup's fourth cell was KEEP CONSTANT,
          which has no field behind it; this uses the slot for the record's
          own guardrails - the five "never do" rules the mockup left with
          nowhere to go. */}
      <section className="pb-14">
        <h2 className={RAIL}>{t.howToRun}</h2>
        <div className="mt-6 grid border-t border-line-strong sm:grid-cols-2">
          <RunCell>
            <p className={RAIL}>{t.primaryKpi}</p>
            <p className="mt-3.5 text-[clamp(1.5rem,1.2rem+1vw,2rem)] leading-[1.1] font-semibold tracking-[-0.02em] text-ink-950">
              {test.primaryKpi.label}
            </p>
            <p className="mt-2 max-w-[40ch] text-sm leading-relaxed text-ink-600">
              {test.primaryKpi.explanation}
            </p>
          </RunCell>

          <RunCell divided>
            <p className={RAIL}>{t.guardrailMetrics}</p>
            <ul className="mt-3.5 flex flex-col">
              {test.otherKpis.map((k) => (
                <li key={k.label} className="border-b border-line py-2.5 last:border-0">
                  <span className="text-[15px] text-ink-900">{k.label}</span>
                  <span className="ml-2 text-[13px] text-ink-500">{k.explanation}</span>
                </li>
              ))}
            </ul>
          </RunCell>

          <RunCell>
            <p className={RAIL}>{t.whatToTest}</p>
            <ul className="mt-3.5 flex flex-col">
              {test.whatToTest.map((w) => (
                <li key={w.label} className="border-b border-line py-2.5 last:border-0">
                  <span className="text-[15px] text-ink-900">{w.label}</span>
                  <span className="ml-2 text-[13px] text-ink-500">{w.explanation}</span>
                </li>
              ))}
            </ul>
          </RunCell>

          <RunCell divided>
            <p className={RAIL}>{t.neverDo}</p>
            <ul className="mt-3.5 flex flex-col">
              {test.guardrails.map((g) => (
                <li
                  key={g}
                  className="border-b border-line py-2.5 text-[15px] leading-relaxed text-pretty text-ink-700 last:border-0"
                >
                  {g}
                </li>
              ))}
            </ul>
          </RunCell>
        </div>
      </section>

      {/* The closing statement. One per page, and only where the record's own
          hypothesis ends in a stated point - see ab-test-playbook.ts on why
          this is not synthesised for the records that don't have one. */}
      {takeaway && (
        <section>
          <div className="rounded-md bg-ink-950 px-8 py-11 sm:px-16 sm:py-14">
            <p className="font-mono text-[11px] tracking-[0.12em] text-white/40 uppercase">
              {t.reusableRule}
            </p>
            <p className="mt-6 max-w-[34ch] text-[clamp(1.35rem,1.05rem+1.3vw,1.8rem)] leading-[1.42] font-medium tracking-[-0.02em] text-pretty text-white sm:max-w-[42ch]">
              {takeaway}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

/** One side of the comparison: the surface with the tested slot marked, and
    the side's own label beneath it. The label is the record's words for what
    this side actually is - the only place the A/B difference is stated,
    because it is the only place the data states it. */
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
  letter: string;
  side: { role: string; label: string | null; sourceBasis: string | null };
  kind: AbVariableKind;
  presence: "absent" | "present" | null;
  testedSlot: string | null;
  testedElementLabel: string;
  lang: Lang;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[12px] tracking-[0.12em] text-ink-800 uppercase">{label}</span>
        <span className="font-mono text-[11px] text-ink-400">{letter}</span>
      </div>
      <VariableDiagram kind={kind} testedSlot={testedSlot} label={testedElementLabel} lang={lang} presence={presence} />
      <p className="text-[14px] leading-relaxed text-pretty text-ink-700">{side.label ?? "—"}</p>
      {side.sourceBasis && (
        <p className="text-[12px] leading-relaxed text-ink-400">{side.sourceBasis}</p>
      )}
    </div>
  );
}

/** One cell of the how-to-run grid. `divided` adds the rule that separates
    the right column from the left on desktop only - stacked, the horizontal
    borders already do that work. */
function RunCell({ children, divided = false }: { children: React.ReactNode; divided?: boolean }) {
  return (
    <div
      className={`border-b border-line py-7 ${
        divided ? "sm:border-l sm:pl-10" : "sm:pr-10"
      }`}
    >
      {children}
    </div>
  );
}
