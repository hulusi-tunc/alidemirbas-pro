import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import CalculatorTool from "@/components/CalculatorTool";
import UtmBuilder from "@/components/UtmBuilder";
import CharacterCounter from "@/components/CharacterCounter";
import { SiteFooter, SiteHeader } from "@/components/Site";
import { copy } from "@/lib/content";
import { CALCULATORS, TEXT_TOOLS, type Lang } from "@/lib/calculators";
import { pageAlternates } from "@/lib/seo";

/* Top-level section, a sibling of Lab and Stack - not a Lab project. Uses
   the same SiteHeader/SiteFooter chrome as About/Stack, not LabShell. */
export const basePathFor = (lang: Lang) => (lang === "en" ? "/calculators" : "/tr/calculators");

const T = {
  en: { title: "Marketing Calculators", intro: "Quick, correct formulas for the numbers marketing teams check daily. No account, no tracking of your inputs." },
  tr: { title: "Pazarlama Hesaplayıcıları", intro: "Pazarlama ekiplerinin günlük kontrol ettiği rakamlar için hızlı ve doğru formüller. Hesap gerektirmez, girdileriniz izlenmez." },
};

export function calculatorIndexMetadata(lang: Lang): Metadata {
  const t = T[lang];
  return { title: `${t.title} - Ali Demirbaş`, description: t.intro, alternates: pageAlternates("/calculators", lang) };
}

export function calculatorDetailMetadata(lang: Lang, slug: string): Metadata {
  const calc = CALCULATORS.find((c) => c.slug === slug) ?? TEXT_TOOLS.find((c) => c.slug === slug);
  if (!calc) return {};
  return {
    title: `${calc.title[lang]} - Ali Demirbaş`,
    description: calc.desc[lang],
    alternates: pageAlternates(`/calculators/${slug}`, lang),
  };
}

export function CalculatorIndexPage({ lang }: { lang: Lang }) {
  const t = T[lang];
  const c = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const base = basePathFor(lang);
  const all = [...CALCULATORS, ...TEXT_TOOLS];
  return (
    <>
      <SiteHeader t={c} anchorBase={home} langHref={lang === "en" ? "/tr/calculators" : "/calculators"} />
      <main>
        <section data-tone="dark" className="relative isolate overflow-hidden bg-ink-950 pt-40 pb-16 md:pb-20">
          <div className="altor-container">
            <p className="altor-eyebrow text-white/50">{lang === "en" ? "Calculators" : "Hesaplayıcılar"}</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{t.title}</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">{t.intro}</p>
          </div>
        </section>
        <div className="altor-container py-16">
          <div className="grid gap-3 sm:grid-cols-2">
            {all.map((tool) => (
              <Link key={tool.slug} href={`${base}/${tool.slug}`} className="rounded-lg border border-line p-4 transition-colors hover:border-ink-900">
                <p className="font-medium text-ink-950">{tool.title[lang]}</p>
                <p className="mt-1 text-sm text-neutral-600">{tool.desc[lang]}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter t={c} lang={lang} />
    </>
  );
}

export function CalculatorDetailPage({ lang, slug }: { lang: Lang; slug: string }) {
  const calc = CALCULATORS.find((c) => c.slug === slug);
  const textTool = TEXT_TOOLS.find((c) => c.slug === slug);
  if (!calc && !textTool) notFound();
  const meta = calc ?? textTool!;
  const c = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const base = basePathFor(lang);

  return (
    <>
      <SiteHeader t={c} anchorBase={home} langHref={lang === "en" ? `/tr/calculators/${slug}` : `/calculators/${slug}`} />
      <main>
        <section data-tone="dark" className="relative isolate overflow-hidden bg-ink-950 pt-40 pb-14">
          <div className="altor-container">
            <Link href={base} className="inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white">
              <ArrowLeft aria-hidden className="size-3.5" />
              {T[lang].title}
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{meta.title[lang]}</h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-white/70">{meta.desc[lang]}</p>
          </div>
        </section>
        <div className="altor-container max-w-2xl py-12">
          {calc && <CalculatorTool slug={calc.slug} lang={lang} />}
          {textTool?.slug === "utm-builder" && <UtmBuilder lang={lang} />}
          {textTool?.slug === "character-counter" && <CharacterCounter lang={lang} />}
        </div>
      </main>
      <SiteFooter t={c} lang={lang} />
    </>
  );
}
