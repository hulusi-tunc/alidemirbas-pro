import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import type { CalcContent } from "@/lib/calc-content";
import type { Lang } from "@/lib/content";

/* The one calculator-detail page. Every live calculator renders through this;
   nothing below is per-calculator except the data it is handed and the tool
   passed in as `children`.

   Reading order is the argument: breadcrumb, title, one line of what it does,
   the tool, the example that proves the tool, then what the number means,
   then the single thing not to get wrong, then when to reach for it and what
   will fool you, then where to go next. Explanation gets lighter as it goes
   down the page, so a reader who only wanted the number never has to scroll
   past a wall to leave with it.

   Deliberately not all cards. The tool is contained because it is an
   interface and needs an edge; the worked example is a tinted strip because
   it is evidence; the takeaway is a dark block because it is the one thing
   worth interrupting for. Everything else sits open on the page, because
   boxing prose is how a reference page turns into a dashboard. */

const T = {
  en: {
    back: "Marketing Calculators",
    workedExample: "Worked example",
    meaning: "What this number means",
    whenToUse: "When to use it",
    misleads: "What can mislead you",
    related: "Related calculators",
  },
  tr: {
    back: "Pazarlama Hesaplayıcıları",
    workedExample: "Örnek hesap",
    meaning: "Bu sayı ne anlama geliyor",
    whenToUse: "Ne zaman kullanılır",
    misleads: "Sizi ne yanıltabilir",
    related: "İlgili hesaplayıcılar",
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
    /* One measure for the whole page. The reference sets the tool and the
       prose to the same width on purpose - it is what makes the page read as
       a single document rather than a tool with an article stapled under it. */
    <div className="mx-auto max-w-[760px] px-5 pt-10 pb-24 sm:px-6 md:pt-14">
      <header className="text-center">
        <Link
          href={basePath}
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-500 transition-colors hover:text-ink-900"
        >
          <ArrowLeft aria-hidden className="size-3.5" />
          {t.back}
        </Link>
        <h1 className="mt-5 text-[clamp(1.875rem,1.3rem+2.2vw,2.625rem)] leading-[1.1] font-semibold tracking-[-0.025em] text-balance text-ink-950">
          {title}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-pretty text-ink-500">
          {page.tagline}
        </p>
      </header>

      <div className="mt-9">{children}</div>

      {/* The example, as evidence rather than as another section: one tinted
          strip, monospace, no heading competing with the prose below it. */}
      {(page.workedExample || workedExampleFallback) && (
        <div className="mt-4 rounded-lg bg-paper-soft px-5 py-4">
          <p className="font-mono text-[10px] tracking-[0.12em] text-ink-400 uppercase">
            {t.workedExample}
          </p>
          {page.workedExample ? (
            <p className="mt-2 overflow-x-auto font-mono text-[13px] whitespace-nowrap text-ink-700">
              {page.workedExample}
            </p>
          ) : (
            <div className="mt-2">{workedExampleFallback}</div>
          )}
        </div>
      )}

      <section className="mt-14">
        <h2 className="text-[1.35rem] font-semibold tracking-[-0.015em] text-ink-950">{t.meaning}</h2>
        <div className="mt-4 flex flex-col gap-4">
          {page.meaning.map((para, i) => (
            <Prose key={i} text={para} className="text-[15px] leading-[1.65] text-pretty text-ink-700" />
          ))}
        </div>
      </section>

      {/* One per page, by construction: the template renders exactly one and
          the content model carries exactly one string for it. */}
      <aside className="mt-12 rounded-xl bg-ink-950 px-7 py-8 sm:px-9 sm:py-9">
        <p className="max-w-[46ch] text-[clamp(1.05rem,0.95rem+0.4vw,1.25rem)] leading-[1.45] font-medium text-balance text-white">
          {page.takeaway}
        </p>
      </aside>

      <div className="mt-12 grid gap-x-12 gap-y-9 sm:grid-cols-2">
        <EditorialColumn label={t.whenToUse} body={page.whenToUse} />
        <EditorialColumn label={t.misleads} body={page.misleads} />
      </div>

      {related.length > 0 && (
        <section className="mt-14 border-t border-line pt-8">
          <p className="font-mono text-[10px] tracking-[0.12em] text-ink-400 uppercase">{t.related}</p>
          {/* Quiet and secondary: small boxes, no descriptions, no icons
              beyond the direction arrow. This is a way out of the page, not
              another thing to read on it. */}
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {related.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="group flex items-center justify-between gap-2 rounded-lg border border-line bg-paper px-3.5 py-3 transition-colors hover:border-ink-300"
              >
                <span className="text-[13px] leading-snug text-ink-800">{r.name}</span>
                <ArrowRight
                  aria-hidden
                  className="size-3.5 shrink-0 text-ink-300 transition-colors group-hover:text-ink-600"
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
      <h2 className="font-mono text-[10px] tracking-[0.12em] text-ink-400 uppercase">{label}</h2>
      <Prose text={body} className="mt-3 text-[14px] leading-[1.65] text-pretty text-ink-700" />
    </section>
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
    if (m.index > last) parts.push(text.slice(last, m.index));
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
  if (last < text.length) parts.push(text.slice(last));
  return <p className={className}>{parts}</p>;
}
