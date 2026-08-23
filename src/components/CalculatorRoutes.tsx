import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import CalculatorTool from "@/components/CalculatorTool";
import UtmBuilder from "@/components/UtmBuilder";
import CharacterCounter from "@/components/CharacterCounter";
import LabShell from "@/components/LabShell";
import { CALCULATORS, TEXT_TOOLS, type Lang } from "@/lib/calculators";
import { pageAlternates } from "@/lib/seo";

export const basePathFor = (lang: Lang) => (lang === "en" ? "/lab/calculators" : "/tr/lab/calculators");

const T = {
  en: { title: "Marketing Calculators", back: "Back to Lab", intro: "Quick, correct formulas for the numbers marketing teams check daily. No account, no tracking of your inputs." },
  tr: { title: "Pazarlama Hesaplayıcıları", back: "Lab'a dön", intro: "Pazarlama ekiplerinin günlük kontrol ettiği rakamlar için hızlı ve doğru formüller. Hesap gerektirmez, girdileriniz izlenmez." },
};

export function calculatorIndexMetadata(lang: Lang): Metadata {
  const t = T[lang];
  return { title: `${t.title} - Ali Demirbaş`, description: t.intro, alternates: pageAlternates("/lab/calculators", lang) };
}

export function calculatorDetailMetadata(lang: Lang, slug: string): Metadata {
  const calc = CALCULATORS.find((c) => c.slug === slug) ?? TEXT_TOOLS.find((c) => c.slug === slug);
  if (!calc) return {};
  return {
    title: `${calc.title[lang]} - Ali Demirbaş`,
    description: calc.desc[lang],
    alternates: pageAlternates(`/lab/calculators/${slug}`, lang),
  };
}

export function CalculatorIndexPage({ lang }: { lang: Lang }) {
  const t = T[lang];
  const base = basePathFor(lang);
  const all = [...CALCULATORS, ...TEXT_TOOLS];
  return (
    <LabShell lang={lang}>
      <div className="border-b border-line px-4 py-6 md:px-8">
        <div className="mx-auto max-w-3xl">
          <Link href={lang === "en" ? "/lab" : "/tr/lab"} className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-ink-900">
            <ArrowLeft aria-hidden className="size-3.5" />
            {t.back}
          </Link>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-ink-950">{t.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">{t.intro}</p>
        </div>
      </div>
      <div className="px-4 py-8 md:px-8">
        <div className="mx-auto grid max-w-3xl gap-3 sm:grid-cols-2">
          {all.map((c) => (
            <Link key={c.slug} href={`${base}/${c.slug}`} className="rounded-lg border border-line p-4 transition-colors hover:border-ink-900">
              <p className="font-medium text-ink-950">{c.title[lang]}</p>
              <p className="mt-1 text-sm text-neutral-600">{c.desc[lang]}</p>
            </Link>
          ))}
        </div>
      </div>
    </LabShell>
  );
}

export function CalculatorDetailPage({ lang, slug }: { lang: Lang; slug: string }) {
  const calc = CALCULATORS.find((c) => c.slug === slug);
  const textTool = TEXT_TOOLS.find((c) => c.slug === slug);
  if (!calc && !textTool) notFound();
  const meta = calc ?? textTool!;
  const base = basePathFor(lang);

  return (
    <LabShell lang={lang}>
      <div className="border-b border-line px-4 py-6 md:px-8">
        <div className="mx-auto max-w-2xl">
          <Link href={base} className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-ink-900">
            <ArrowLeft aria-hidden className="size-3.5" />
            {T[lang].title}
          </Link>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-ink-950">{meta.title[lang]}</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">{meta.desc[lang]}</p>
        </div>
      </div>
      <div className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-2xl">
          {calc && <CalculatorTool slug={calc.slug} lang={lang} />}
          {textTool?.slug === "utm-builder" && <UtmBuilder lang={lang} />}
          {textTool?.slug === "character-counter" && <CharacterCounter lang={lang} />}
        </div>
      </div>
    </LabShell>
  );
}
