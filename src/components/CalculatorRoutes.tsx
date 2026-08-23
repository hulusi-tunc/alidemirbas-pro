import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import CalculatorTool from "@/components/CalculatorTool";
import CalculatorContent from "@/components/CalculatorContent";
import UtmBuilder from "@/components/UtmBuilder";
import CharacterCounter from "@/components/CharacterCounter";
import { SiteFooter, SiteHeader } from "@/components/Site";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGrid } from "@/components/ui/RelatedGrid";
import { copy } from "@/lib/content";
import { TEXT_TOOLS } from "@/lib/text-tools";
import { getAllLiveSpecs, getCalcSpec, toRuntimeSpec, LIVE_CALCULATOR_SLUGS } from "@/lib/calc-catalog";
import { getContent } from "@/lib/calc-content";
import type { Lang } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";

/* Top-level section, a sibling of Lab and Stack - not a Lab project. Uses
   the same SiteHeader/SiteFooter chrome as About/Stack, not LabShell.
   Calculator metadata is sourced from the Phase 1 catalog
   (production/calculators/calculator-catalog.json) via calc-catalog.ts -
   this file no longer owns any calculator data of its own. */
export const basePathFor = (lang: Lang) => (lang === "en" ? "/calculators" : "/tr/calculators");

const T = {
  en: { title: "Marketing Calculators", intro: "Quick, correct formulas for the numbers marketing teams check daily. No account, no tracking of your inputs." },
  tr: { title: "Pazarlama Hesaplayıcıları", intro: "Pazarlama ekiplerinin günlük kontrol ettiği rakamlar için hızlı ve doğru formüller. Hesap gerektirmez, girdileriniz izlenmez." },
};

const CATEGORY_LABEL: Record<string, { en: string; tr: string }> = {
  advertising: { en: "Advertising & Paid Media", tr: "Reklam ve Medya" },
  acquisition: { en: "Acquisition", tr: "Edinme" },
  ecommerce: { en: "E-commerce", tr: "E-ticaret" },
  "lifecycle-retention": { en: "Lifecycle & Retention", tr: "Yaşam Döngüsü ve Elde Tutma" },
  "crm-email": { en: "CRM & Email", tr: "CRM ve E-posta" },
  "mobile-growth": { en: "Mobile Growth", tr: "Mobil Büyüme" },
  saas: { en: "SaaS", tr: "SaaS" },
  "unit-economics": { en: "Unit Economics", tr: "Birim Ekonomisi" },
  "cro-funnel": { en: "CRO & Funnel", tr: "CRO ve Huni" },
  experimentation: { en: "Experimentation", tr: "Deneysel Test" },
};

const RELATED_TITLE = { en: "Related calculators", tr: "İlgili hesaplayıcılar" };

export function calculatorIndexMetadata(lang: Lang): Metadata {
  const t = T[lang];
  return { title: `${t.title} - Ali Demirbaş`, description: t.intro, alternates: pageAlternates("/calculators", lang) };
}

export function calculatorDetailMetadata(lang: Lang, slug: string): Metadata {
  const spec = getCalcSpec(slug);
  const textTool = TEXT_TOOLS.find((c) => c.slug === slug);
  if (!spec && !textTool) return {};
  const content = getContent(slug, lang);
  // Phase 4 content carries its own editorially-written seoTitle/
  // seoDescription (EN only, 13 calculators) - prefer it over the
  // Phase 2 fallback (spec name + formulaPlainEnglish) when present.
  const title = content ? content.seo.seoTitle : spec ? spec.name : textTool!.title[lang];
  const description = content ? content.seo.seoDescription : spec ? spec.formulaPlainEnglish : textTool!.desc[lang];
  return {
    title: `${title} - Ali Demirbaş`,
    description,
    alternates: pageAlternates(`/calculators/${slug}`, lang),
    robots: content ? { index: content.seo.index, follow: content.seo.follow } : undefined,
  };
}

export function CalculatorIndexPage({ lang }: { lang: Lang }) {
  const t = T[lang];
  const c = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const base = basePathFor(lang);
  const specs = getAllLiveSpecs();

  const byCategory = new Map<string, typeof specs>();
  for (const s of specs) {
    if (!byCategory.has(s.category)) byCategory.set(s.category, []);
    byCategory.get(s.category)!.push(s);
  }

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
          {[...byCategory.entries()].map(([cat, list]) => (
            <div key={cat} id={`cat-${cat}`} className="mb-10 scroll-mt-24">
              <h2 className="mb-3 text-sm font-medium tracking-wide text-neutral-500 uppercase">
                {CATEGORY_LABEL[cat]?.[lang] ?? cat}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {list.map((spec) => (
                  <Link
                    key={spec.slug}
                    href={`${base}/${spec.slug}`}
                    className="rounded-lg border border-line p-4 transition-colors hover:border-ink-900"
                  >
                    <p className="font-medium text-ink-950">{spec.name}</p>
                    <p className="mt-1 text-sm text-neutral-600">{spec.formulaPlainEnglish}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="mb-10">
            <h2 className="mb-3 text-sm font-medium tracking-wide text-neutral-500 uppercase">
              {lang === "en" ? "Text tools" : "Metin araçları"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {TEXT_TOOLS.map((tool) => (
                <Link key={tool.slug} href={`${base}/${tool.slug}`} className="rounded-lg border border-line p-4 transition-colors hover:border-ink-900">
                  <p className="font-medium text-ink-950">{tool.title[lang]}</p>
                  <p className="mt-1 text-sm text-neutral-600">{tool.desc[lang]}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter t={c} lang={lang} />
    </>
  );
}

export function CalculatorDetailPage({ lang, slug }: { lang: Lang; slug: string }) {
  const spec = getCalcSpec(slug);
  const textTool = TEXT_TOOLS.find((c) => c.slug === slug);
  if (!spec && !textTool) notFound();
  const content = getContent(slug, lang);
  const c = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const base = basePathFor(lang);
  // heroTitle is an optional Phase 4 override for the H1 only (see
  // CalcContent.heroTitle) - everything else on the site (breadcrumbs,
  // index listing, related-card labels) keeps using spec.name.
  const title = content?.heroTitle ?? (spec ? spec.name : textTool!.title[lang]);
  // Phase 4's intro is a short, tool-first 1-3 sentence description
  // (instruction 24) - prefer it in the hero when it exists; it's
  // written specifically to sit above the calculator, unlike
  // formulaPlainEnglish which is documentation prose.
  const desc = content ? content.intro : spec ? spec.formulaPlainEnglish : textTool!.desc[lang];

  // Section order below: Hero -> Calculator -> short desc/formula area ->
  // FAQ -> Related calculators. Text tools (UTM builder, character
  // counter) have no CalcSpec, so the FAQ/related sections - both
  // spec-driven - simply don't render for them. The "Browse by category"
  // grid that used to sit here was removed by request - category
  // browsing lives on the /calculators index page only.
  const runtime = spec ? toRuntimeSpec(spec) : null;

  // Phase 4 content can author its own Related Calculators with a real
  // one-sentence relationship (see CalcContent.related) - preferred over
  // the catalog's relatedCalculators field, which carries no description
  // and can list a slug that's no longer live. Every content-authored
  // slug is re-verified against LIVE_CALCULATOR_SLUGS here regardless, so
  // a typo or a slug that goes dark later can't silently produce a 404.
  const authoredRelated = (content?.related ?? []).filter((r) => LIVE_CALCULATOR_SLUGS.includes(r.slug));
  const relatedItems = authoredRelated.length > 0
    ? authoredRelated.map((r) => ({ href: `${base}/${r.slug}`, name: r.name, desc: r.desc }))
    : (runtime?.related ?? []).map((r) => ({ href: `${base}/${r.slug}`, name: r.name }));

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
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-white/70">{desc}</p>
          </div>
        </section>
        <div className="altor-container max-w-2xl py-12">
          {spec && <CalculatorTool spec={toRuntimeSpec(spec)} lang={lang} />}
          {textTool?.slug === "utm-builder" && <UtmBuilder lang={lang} />}
          {textTool?.slug === "character-counter" && <CharacterCounter lang={lang} />}
        </div>

        {content && <CalculatorContent content={content} />}

        {spec && (
          <div className="altor-container max-w-2xl pb-16">
            <div className="flex flex-col gap-12 border-t border-line pt-10">
              {/* The "short desc / formula area" the section order calls
                  for is CalculatorTool's own inline FormulaBlock, rendered
                  just above (formula + plain-English, for every live
                  calculator, not only the 13 with Phase 4 content) - a
                  second one here would just repeat it, so this template
                  starts at Related Calculators instead. Related comes
                  before FAQ by request - it's closer to what someone who
                  just finished reading Common Mistakes wants next. */}
              <RelatedGrid title={RELATED_TITLE[lang]} items={relatedItems} />

              <FaqAccordion title="FAQ" items={content?.faq ?? []} />
            </div>
          </div>
        )}
      </main>
      <SiteFooter t={c} lang={lang} />
    </>
  );
}
