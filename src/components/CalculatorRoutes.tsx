import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import CalculatorTool from "@/components/CalculatorTool";
import CalculatorContent from "@/components/CalculatorContent";
import UtmBuilder from "@/components/UtmBuilder";
import CharacterCounter from "@/components/CharacterCounter";
import { SiteFooter, SiteHeader } from "@/components/Site";
import { Section } from "@/components/ui/Section";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { CalculatorLibrary, type CalcEntry, type CategoryFacet } from "@/components/ui/CalculatorLibrary";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGrid } from "@/components/ui/RelatedGrid";
import { copy } from "@/lib/content";
import { TEXT_TOOLS } from "@/lib/text-tools";
import { getAllLiveSpecs, getCalcSpec, toRuntimeSpec, LIVE_CALCULATOR_SLUGS, correctedFormulaPlainEnglish } from "@/lib/calc-catalog";
import { getContent } from "@/lib/calc-content";
import type { Lang } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";

/* Top-level section, a sibling of Lab and Stack - not a Lab project. Uses
   the same SiteHeader/SiteFooter chrome as About/Stack, not LabShell.
   Calculator metadata is sourced from the Phase 1 catalog
   (production/calculators/calculator-catalog.json) via calc-catalog.ts -
   this file no longer owns any calculator data of its own. */
export const basePathFor = (lang: Lang) => (lang === "en" ? "/calculators" : "/tr/calculators");

// SEO metadata copy (page <title>/<meta description>) — UNCHANGED by this
// round's visual pass. `calculatorIndexMetadata()` below still reads from
// this exact object. The visible hero below now uses its own,
// Portrait-composition copy (`HERO`) instead — the two are intentionally
// decoupled, so the already-indexed <title>/description text is never
// touched even though the on-page H1/sub copy changed. Same separation
// this codebase already draws elsewhere (a calculator detail page's
// `heroTitle` override vs. its own `seoTitle`).
const T = {
  en: { title: "Marketing Calculators", intro: "Quick, correct formulas for the numbers marketing teams check daily. No account, no tracking of your inputs." },
  tr: { title: "Pazarlama Hesaplayıcıları", intro: "Pazarlama ekiplerinin günlük kontrol ettiği rakamlar için hızlı ve doğru formüller. Hesap gerektirmez, girdileriniz izlenmez." },
};

const HERO = {
  en: {
    eyebrow: "Calculators",
    title: "Growth math, without the spreadsheet.",
    sub: "A collection of practical calculators covering growth, acquisition, retention, experimentation and unit economics - no account, no tracking of your inputs.",
  },
  tr: {
    eyebrow: "Hesaplayıcılar",
    title: "Excel'e gerek kalmadan büyüme matematiği.",
    sub: "Büyüme, edinme, elde tutma, deneysel test ve birim ekonomisini kapsayan pratik hesaplayıcılardan oluşan bir koleksiyon - hesap gerektirmez, girdileriniz izlenmez.",
  },
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
  const description = content ? content.seo.seoDescription : spec ? correctedFormulaPlainEnglish(spec) : textTool!.desc[lang];
  return {
    title: `${title} - Ali Demirbaş`,
    description,
    alternates: pageAlternates(`/calculators/${slug}`, lang),
    robots: content ? { index: content.seo.index, follow: content.seo.follow } : undefined,
  };
}

/* PORTRAIT PILOT (this round). Reuses the exact server-computes-data /
   client-filters architecture already approved for Blog
   (BlogPage.tsx -> BlogLibrary.tsx): the full 43-calculator catalog is
   still rendered into the initial server HTML via `CalculatorLibrary`
   (real hrefs, real text, present before any client hydration — nothing
   about server-rendered discoverability changes), and category counts
   below are computed once from the real, unmodified `CATEGORY_LABEL`
   map and `getAllLiveSpecs()` — no category is invented, none is
   hidden. TEXT_TOOLS (UTM Builder, Character Counter) are NOT part of
   the searchable/filterable set: they carry no `category` field in the
   real data model, and forcing them into the calculator taxonomy would
   be exactly the kind of invented category this round's brief warns
   against — they render as their own small, always-visible "Other
   tools" list below, the same secondary-list treatment already approved
   on Lab's index for Numerspace. */
function calcSearchText(name: string, description: string, categoryLabel: string, aliases: string[]) {
  return [name, description, categoryLabel, ...aliases].join(" ").toLowerCase();
}

export function CalculatorIndexPage({ lang }: { lang: Lang }) {
  const hero = HERO[lang];
  const c = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const base = basePathFor(lang);
  const specs = getAllLiveSpecs();

  const categoryCounts = new Map<string, number>();
  for (const s of specs) categoryCounts.set(s.category, (categoryCounts.get(s.category) ?? 0) + 1);

  const entries: CalcEntry[] = specs.map((spec) => {
    const categoryLabel = CATEGORY_LABEL[spec.category]?.[lang] ?? spec.category;
    const description = correctedFormulaPlainEnglish(spec);
    return {
      slug: spec.slug,
      name: spec.name,
      description,
      categoryLabel,
      searchText: calcSearchText(spec.name, description, categoryLabel, spec.aliases),
      href: `${base}/${spec.slug}`,
    };
  });

  // `id` is the display label itself (not the raw category key) — the
  // only join key CalculatorLibrary needs, and every label is already
  // unique across the real 10-category taxonomy, so this stays a plain
  // 1:1 mapping with no separate id scheme to keep in sync.
  const categoryFacets: CategoryFacet[] = [...categoryCounts.entries()]
    .map(([cat, count]) => ({ id: CATEGORY_LABEL[cat]?.[lang] ?? cat, label: CATEGORY_LABEL[cat]?.[lang] ?? cat, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <>
      <SiteHeader t={c} anchorBase={home} langHref={lang === "en" ? "/tr/calculators" : "/calculators"} />
      <main>
        {/* Light, open composition — same LOCKED reasoning as Contact/
            Stack/Blog/Lab: no dark band, no gradient. `pb-14!`/`md:pb-13!`
            applied from the start (not as a later correction) — the
            exact values the Stack/Blog/Lab polish rounds converged on,
            reused here per this round's own "don't create a dead zone
            between hero and library" instruction. */}
        <Section tone="paper" size="md" className="pb-14! md:pb-13!">
          <PortraitContainer>
            <p className="altor-eyebrow mb-4 text-ink-400">{hero.eyebrow}</p>
            <h1 className="max-w-md text-h1-fluid font-medium text-ink-950">{hero.title}</h1>
            <p className="mt-3 max-w-md text-lg leading-relaxed text-ink-950/65">{hero.sub}</p>
          </PortraitContainer>
        </Section>

        <Section tone="paper" size="md" className="md:pt-13!">
          <PortraitContainer>
            <CalculatorLibrary lang={lang} entries={entries} categoryFacets={categoryFacets} />

            {/* "Other tools" — compact, always-visible, unfiltered (see
                this function's own top comment). Same visual treatment
                Lab's index already established for its own secondary
                list (a plain divider + row, not a card). */}
            <div className="mt-14">
              <h2 className="border-b border-line-soft pb-2 text-base font-medium tracking-tight text-ink-950">
                {lang === "en" ? "Other tools" : "Diğer araçlar"}
              </h2>
              <div className="flex flex-col divide-y divide-line-soft">
                {TEXT_TOOLS.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`${base}/${tool.slug}`}
                    className="group flex flex-col gap-1 py-4 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                  >
                    <span className="flex items-center gap-1.5 text-[15px] font-medium text-ink-950 transition-colors group-hover:text-ink-600">
                      {tool.title[lang]}
                      <ArrowUpRight
                        aria-hidden
                        className="size-3.5 shrink-0 text-ink-950/40 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </span>
                    <span className="text-sm text-ink-950/65 sm:max-w-md sm:text-right">{tool.desc[lang]}</span>
                  </Link>
                ))}
              </div>
            </div>
          </PortraitContainer>
        </Section>
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
  const desc = content ? content.intro : spec ? correctedFormulaPlainEnglish(spec) : textTool!.desc[lang];

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
