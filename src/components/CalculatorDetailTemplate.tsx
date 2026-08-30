import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { FaqAccordion } from "@/components/ui/FaqAccordion";
import type { CalcContent } from "@/lib/calc-content";
import type { Lang } from "@/lib/content";

/* The one calculator-detail page. Every live calculator renders through this;
   nothing below is per-calculator except the data it is handed and the tool
   passed in as `children`.

   Reading order is the argument: breadcrumb, title, one line of what it does,
   the tool, the example that proves the tool, then what the number means,
   then the single thing not to get wrong, then when to reach for it and what
   will fool you, then the FAQ, and Related last. Explanation gets lighter as
   it goes down the page, so a reader who only wanted the number never has to
   scroll past a wall to leave with it.

   The FAQ sits above Related: the FAQ is still this page answering this
   calculator's questions, while Related is a way out of the page - the exit
   belongs after the last thing worth staying for.

   Deliberately not all cards. The tool is contained because it is an
   interface and needs an edge - and its answer panel carries the page's one
   dark plate, because the answer is what the page exists to produce. The
   worked example is a quiet card because it is evidence; the takeaway is a
   blue-ruled pull quote because it interrupts without competing with the
   answer for the dark plate. Everything else sits open on the page, because
   boxing prose is how a reference page turns into a dashboard. */

const T = {
  en: {
    back: "Marketing Calculators",
    workedExample: "Worked example",
    meaning: "What this number means",
    whenToUse: "When to use it",
    misleads: "What can mislead you",
    related: "Related calculators",
    faq: "Frequently asked questions",
  },
  tr: {
    back: "Pazarlama Hesaplayıcıları",
    workedExample: "Örnek hesap",
    meaning: "Bu sayı ne anlama geliyor",
    whenToUse: "Ne zaman kullanılır",
    misleads: "Sizi ne yanıltabilir",
    related: "İlgili hesaplayıcılar",
    faq: "Sık sorulan sorular",
  },
} as const;

export default function CalculatorDetailTemplate({
  lang,
  basePath,
  title,
  content,
  related,
  children,
  workedExampleFallback,
}: {
  lang: Lang;
  basePath: string;
  title: string;
  content: CalcContent;
  related: readonly { href: string; name: string }[];
  /** The calculator itself - one of the three tools. */
  children: ReactNode;
  /** Used when `page.workedExample` is absent because the example doesn't
      fit on one line. */
  workedExampleFallback?: ReactNode;
}) {
  const t = T[lang];
  const page = content.page;

  return (
    /* Banded, not one flat column: the ground shifts at each section
       boundary (soft hero stage → white explanation → soft FAQ → white
       exit), so the seams are real surfaces rather than padding-only gaps.
       Two measures on purpose - the tool stages at 880px, wider than the
       760px prose below it, because the working surface is the page's
       anchor and its size should say so. */
    <div className="pb-24">
      {/* The stage, LIGHT (2026-08-30). This was the site's first homepage
          hero ground - ink-950 with a blue radial wash and faint vertical
          rules - ported here verbatim. It is retired: on a page whose job
          is one number, the darkest, loudest surface was the band holding
          the title, and the tool sat inside it as a bright rectangle
          fighting its own ground.

          The colour has not been removed, it has been MOVED. The stage is
          quiet `paper-soft`; the one saturated surface on the page is now
          the blue answer plate inside the tool, which is the thing the
          visitor came for. That ordering - open clean, colour where the
          product is - is the mechanism, and the reason the wash and the
          gradient title are gone rather than re-tinted: a coloured glow on
          white is a default, not a decision. */}
      <section className="border-b border-line bg-paper-soft">
        <div className="mx-auto max-w-[880px] px-5 pt-10 pb-12 sm:px-6 md:pt-14 md:pb-14">
          <header className="text-center">
            <Link
              href={basePath}
              className="inline-flex items-center gap-1.5 text-[13px] text-ink-400 transition-colors hover:text-ink-900"
            >
              <ArrowLeft aria-hidden className="size-3.5" />
              {t.back}
            </Link>
            <h1 className="mt-5 text-[clamp(2rem,1.4rem+2.4vw,2.875rem)] leading-[1.1] font-semibold tracking-[-0.025em] text-balance text-ink-950">
              {title}
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-pretty text-ink-500">
              {page.tagline}
            </p>
          </header>

          <div className="mt-9">{children}</div>

          {/* The example, as evidence rather than as another section: a
              SOLID paper card (a translucent wash sat here and was
              rejected in review), echoing the tool card's own white half.
              Still white now that the stage is `paper-soft` - one step of
              ground is what separates it, the same relationship the tool
              card above it has. Monospace, no heading competing with the
              prose below it. */}
          {(page.workedExample || workedExampleFallback) && (
            <div className="mt-4 rounded-card bg-paper px-5 py-4">
              <p className="text-[13px] font-medium text-blue-700">{t.workedExample}</p>
              {page.workedExample ? (
                <p className="mt-2 overflow-x-auto font-mono text-[13px] whitespace-nowrap text-ink-700">
                  {withArrowIcons(page.workedExample)}
                </p>
              ) : (
                <div className="mt-2">{workedExampleFallback}</div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* The explanation, back on white at reading measure. */}
      <div className="mx-auto max-w-[760px] px-5 sm:px-6">
        <section className="mt-14">
          <h2 className="text-[1.35rem] font-semibold tracking-[-0.015em] text-ink-950">{t.meaning}</h2>
          <div className="mt-4 flex flex-col gap-4">
            {page.meaning.map((para, i) => (
              <Prose key={i} text={para} className="text-[15px] leading-[1.65] text-pretty text-ink-700" />
            ))}
          </div>
        </section>

        {/* The one thing not to get wrong, as a pull quote rather than a
            plate: the page's single dark block belongs to the calculator's
            answer panel (CalcPanel), and a second one here would destroy the
            first. The blue rule is the brand doing its functional job -
            marking the sentence a skimmer must not skip. */}
        <aside className="mt-12 border-l-2 border-primary-600 py-1 pl-6 sm:pl-7">
          <p className="max-w-[46ch] text-[clamp(1.05rem,0.95rem+0.4vw,1.25rem)] leading-[1.45] font-medium text-balance text-ink-950">
            {page.takeaway}
          </p>
        </aside>

        <div className="mt-12 grid gap-x-12 gap-y-9 sm:grid-cols-2">
          <EditorialColumn label={t.whenToUse} body={page.whenToUse} />
          <EditorialColumn label={t.misleads} body={page.misleads} />
        </div>
      </div>

      {content.faq.length > 0 && (
        /* A real section on its own band, at the same rank as "What this
           number means" - not an appendix. The accordion keeps its shared
           styling; only the heading and the ground are this page's own. */
        <section className="mt-14 border-y border-line bg-paper-soft">
          <div className="mx-auto max-w-[760px] px-5 py-12 sm:px-6">
            <h2 className="text-[1.35rem] font-semibold tracking-[-0.015em] text-ink-950">
              {t.faq}
            </h2>
            <div className="mt-4">
              <FaqAccordion items={[...content.faq]} />
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mx-auto max-w-[760px] px-5 pt-12 sm:px-6">
          <p className="text-[15px] font-semibold text-ink-950">{t.related}</p>
          {/* Quiet and secondary: small boxes, no descriptions, no icons
              beyond the direction arrow. This is a way out of the page, not
              another thing to read on it. */}
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {related.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="group flex items-center justify-between gap-2 rounded-xl bg-paper-soft px-4 py-3 transition-colors hover:bg-blue-50"
              >
                <span className="text-[13px] leading-snug text-ink-800">{r.name}</span>
                <ArrowRight
                  aria-hidden
                  className="size-3.5 shrink-0 text-ink-300 transition-colors group-hover:text-blue-600"
                />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EditorialColumn({ label, body }: { label: string; body: string }) {
  return (
    <section>
      <h2 className="text-[15px] font-semibold text-ink-950">{label}</h2>
      <Prose text={body} className="mt-3 text-[14px] leading-[1.65] text-pretty text-ink-700" />
    </section>
  );
}

/** "→" in content strings is a source convention, never a rendered glyph:
    on screen an arrow is always the real icon from the site's one icon set
    (Lucide), sized to the text and inheriting its colour. */
function withArrowIcons(text: string, keyPrefix = ""): ReactNode[] {
  return text.split("→").flatMap((part, i) =>
    i === 0
      ? [part]
      : [
          <ArrowRight
            key={`${keyPrefix}arrow-${i}`}
            aria-hidden
            className="inline size-3.5 shrink-0 align-[-0.155em]"
          />,
          part,
        ],
  );
}

/** Inline-link-aware text, same contract as CalculatorContent's own Prose:
    `[label](href)` is the only markup, internal paths render as a real Next
    Link and external URLs as a new-tab anchor. */
function Prose({ text, className }: { text: string; className?: string }) {
  const parts: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(...withArrowIcons(text.slice(last, m.index), `p${i}-`));
    const [, label, href] = m;
    parts.push(
      href.startsWith("/") ? (
        <Link key={i++} href={href} className="text-blue-700 underline underline-offset-2 hover:text-blue-800">
          {label}
        </Link>
      ) : (
        <a
          key={i++}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-blue-700 underline underline-offset-2 hover:text-blue-800"
        >
          {label}
        </a>
      ),
    );
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(...withArrowIcons(text.slice(last), "tail-"));
  return <p className={className}>{parts}</p>;
}
