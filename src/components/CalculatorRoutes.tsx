import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import CalculatorTool from "@/components/CalculatorTool";
import { BreakEvenSliderTool } from "@/components/ui/BreakEvenSliderTool";
import EmailPerformanceTool from "@/components/ui/EmailPerformanceTool";
import CalculatorContent from "@/components/CalculatorContent";
import UtmBuilder from "@/components/UtmBuilder";
import CharacterCounter from "@/components/CharacterCounter";
import { SiteFooter, SiteHeader } from "@/components/Site";
import { CalculatorLibrary, CategoryIcon, type CalcEntry, type CategoryFacet } from "@/components/ui/CalculatorLibrary";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGrid } from "@/components/ui/RelatedGrid";
import { copy } from "@/lib/content";
import { TEXT_TOOLS } from "@/lib/text-tools";
import {
  getAllLiveSpecs, getCalcSpec, toRuntimeSpec, LIVE_CALCULATOR_SLUGS,
  correctedFormulaPlainEnglish, LIBRARY_GROUP, LIBRARY_GROUP_ORDER, type LibraryGroup,
} from "@/lib/calc-catalog";
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

/* The library's six groups, plus Text Tools which renders as its own list
   below the grid. Keyed by LibraryGroup (calc-catalog.ts), NOT by the
   catalog's own `category` field - see that map's own comment for why the
   two deliberately disagree. Replaces the previous ten labels, which were
   the research taxonomy showing through: with 19 calculators it produced
   groups of one and split ad spend across three headings. */
const GROUP_LABEL: Record<LibraryGroup, { en: string; tr: string }> = {
  ads: { en: "Ads", tr: "Reklam" },
  "revenue-unit-economics": { en: "Revenue & Unit Economics", tr: "Gelir ve Birim Ekonomisi" },
  "retention-saas": { en: "Retention & SaaS", tr: "Elde Tutma ve SaaS" },
  "conversion-funnel": { en: "Conversion & Funnel", tr: "Dönüşüm ve Huni" },
  experimentation: { en: "Experimentation", tr: "Deneysel Test" },
  "email-crm": { en: "Email & CRM", tr: "E-posta ve CRM" },
};

const RELATED_TITLE = { en: "Related calculators", tr: "İlgili hesaplayıcılar" };

/** The calculators whose tool is too wide for the default reading column. */
const WIDE_TOOLS = new Set(["break-even-point", "email-performance"]);

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
    /* The content files carry their own seo.index/seo.follow, and they say
       "index". Not honoured any more: the site is deliberately noindex
       site-wide (see the root layouts), and a per-page `robots` here would
       override that inherited tag for exactly the pages that have content -
       opting the best pages back into search while the thin ones stayed
       out. Left unset so every calculator inherits the site-wide rule. */
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

/* Bespoke dark FOOTER for this page only — matches a user-supplied mockup
   (warm near-black #141311, full real site nav). The matching bespoke
   dark HEADER this comment used to describe was removed per explicit
   request ("header siyah, ikinci görseldeki gibi olsun" — dark headers
   should match the shared light SiteHeader every other page uses);
   CalculatorIndexPage now renders SiteHeader directly, same as
   CalculatorDetailPage below already did. The footer wasn't part of
   that request and is unchanged. */
function CalcFooter({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const quickLinks = [
    { label: t.footer.home, href: home },
    { label: t.nav.about, href: t.nav.aboutHref },
    { label: t.nav.lab, href: t.nav.labHref },
    { label: t.nav.calculators, href: t.nav.calculatorsHref },
    { label: t.nav.blog, href: t.nav.blogHref },
    { label: t.nav.stack, href: t.nav.stackHref },
    { label: t.nav.contact, href: t.nav.contactHref },
  ];
  const labProjects = copy[lang].lab.projects.map((p) => ({ label: p.name, href: p.links[0].href }));
  return (
    <footer style={{ background: "#141311", color: "#ffffff" }} className="border-t border-white/10 pt-16 pb-8">
      <div className="mx-auto max-w-320 px-6 sm:px-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div>
            <p className="altor-eyebrow" style={{ color: "rgba(255,255,255,0.4)" }}>{t.footer.quickLinks}</p>
            <ul className="mt-4 flex list-none flex-col gap-3 p-0">
              {quickLinks.map((l) => (
                <li key={l.href}><Link href={l.href} className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.7)" }}>{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="altor-eyebrow" style={{ color: "rgba(255,255,255,0.4)" }}>{t.footer.projects}</p>
            <ul className="mt-4 flex list-none flex-col gap-3 p-0">
              {labProjects.map((l) => {
                const external = l.href.startsWith("http");
                return (
                  <li key={l.href}>
                    <a href={l.href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.7)" }}>
                      {l.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <p className="altor-eyebrow" style={{ color: "rgba(255,255,255,0.4)" }}>Connect</p>
            <ul className="mt-4 flex list-none flex-col gap-3 p-0">
              <li><a href="mailto:mehmetalidemirbas@gmail.com" className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.7)" }}>mehmetalidemirbas@gmail.com</a></li>
              <li><a href="https://www.linkedin.com/in/ali-demirbas/" target="_blank" rel="noreferrer" className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.7)" }}>LinkedIn</a></li>
              <li><a href="https://github.com/ali-demirbas" target="_blank" rel="noreferrer" className="text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.7)" }}>GitHub</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          <div className="flex items-center gap-3">
            <span>{t.footer.left}</span><span aria-hidden>·</span><span>{t.footer.right}</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://www.linkedin.com/in/ali-demirbas/" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">LinkedIn</a>
            <a href="https://github.com/ali-demirbas" target="_blank" rel="noreferrer" className="transition-colors hover:text-white">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function CalculatorIndexPage({ lang }: { lang: Lang }) {
  const hero = HERO[lang];
  const base = basePathFor(lang);
  const specs = getAllLiveSpecs();

  /* Everything below is grouped by LIBRARY_GROUP, not by each spec's own
     research `category`. LIVE_CALCULATOR_SLUGS and LIBRARY_GROUP are the
     same 19 keys, so the lookup below cannot miss - and if a calculator is
     ever added to one without the other, it lands in `groupOf`'s fallback
     rather than silently vanishing from the index. */
  const groupOf = (slug: string): LibraryGroup => LIBRARY_GROUP[slug] ?? "revenue-unit-economics";

  const entries: CalcEntry[] = specs
    // Funnel order, not catalog order: the grid should read in the same
    // sequence as the facet list beside it.
    .slice()
    .sort((a, b) => LIBRARY_GROUP_ORDER.indexOf(groupOf(a.slug)) - LIBRARY_GROUP_ORDER.indexOf(groupOf(b.slug)))
    .map((spec) => {
      const group = groupOf(spec.slug);
      const categoryLabel = GROUP_LABEL[group][lang];
      const description = correctedFormulaPlainEnglish(spec);
      return {
        slug: spec.slug,
        name: spec.name,
        description,
        categoryLabel,
        categoryKey: group,
        searchText: calcSearchText(spec.name, description, categoryLabel, spec.aliases),
        href: `${base}/${spec.slug}`,
      };
    });

  // `id` is the display label itself (not the raw group key) — the only
  // join key CalculatorLibrary needs, and every label is unique across the
  // six groups, so this stays a plain 1:1 mapping with no separate id
  // scheme to keep in sync. Ordered by LIBRARY_GROUP_ORDER rather than by
  // count: the groups describe a funnel, and sorting them by size would
  // scramble that for no gain across six items.
  const groupCounts = new Map<LibraryGroup, number>();
  for (const spec of specs) {
    const g = groupOf(spec.slug);
    groupCounts.set(g, (groupCounts.get(g) ?? 0) + 1);
  }
  const categoryFacets: CategoryFacet[] = LIBRARY_GROUP_ORDER.filter((g) => groupCounts.has(g)).map((g) => ({
    id: GROUP_LABEL[g][lang],
    label: GROUP_LABEL[g][lang],
    count: groupCounts.get(g)!,
  }));

  return (
    <div style={{ background: "#faf9f6", color: "#201f1c" }} className="min-h-screen">
      {/* Was a bespoke black CalcHeader (#171614) - replaced with the
          shared light SiteHeader per explicit request to match every
          other page's header. CalcFooter below is unchanged - only the
          header was flagged. */}
      <SiteHeader
        t={copy[lang]}
        anchorBase={lang === "en" ? "/" : "/tr"}
        langHref={lang === "en" ? "/tr/calculators" : "/calculators"}
      />
      <main>
        <section className="relative overflow-hidden pt-22 pb-10">
          {/* Same soft, multi-tone blue wash as the Contact page hero, per
              request ("bu sayfanın da üst kısmını contact sayfası gibi
              mavı yapsana"). Several overlapping blurred circles, not one
              gradient, for the same reason as Contact's own note - a
              single blurred gradient reads as one flat color. Reuses the
              site's global `primary-*` blue tokens (they exist site-wide
              in globals.css, not scoped to the Portrait pages), even
              though this page otherwise runs its own bespoke cream
              palette - only this hero band gets the blue treatment, the
              rest of the page (cards/facets/footer) is unchanged. First
              child + no z-index: the section becomes `position:relative`
              here, and the real heading/copy below paints over it as a
              later sibling, same technique as Contact. */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 left-[8%] size-[34rem] rounded-full bg-primary-300/40 blur-3xl" />
            <div className="absolute -top-16 right-[5%] size-[30rem] rounded-full bg-primary-500/25 blur-3xl" />
            <div className="absolute top-[45%] left-[35%] size-[26rem] rounded-full bg-primary-100/70 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-320 px-6 text-center sm:px-12">
            <p className="mb-4 text-xs font-medium tracking-[0.12em] uppercase" style={{ color: "#9c978c" }}>{hero.eyebrow}</p>
            <h1 className="mx-auto max-w-xl text-[2.75rem] leading-[1.1] font-medium tracking-tight" style={{ color: "#141311" }}>{hero.title}</h1>
            <p className="mx-auto mt-3 max-w-xl text-lg leading-relaxed" style={{ color: "rgba(20,19,17,0.65)" }}>{hero.sub}</p>
          </div>
        </section>

        <section className="pt-3 pb-24">
          <div className="mx-auto max-w-320 px-6 sm:px-12">
            <CalculatorLibrary lang={lang} entries={entries} categoryFacets={categoryFacets} />

            {/* "Other tools" — same white-card grammar as the main grid,
                always visible/unfiltered (see calcSearchText's own top
                comment on why TEXT_TOOLS stay outside the taxonomy). */}
            <div className="mt-16">
              <h2 className="mb-5 border-b pb-2.5 text-base font-medium tracking-tight" style={{ color: "#141311", borderColor: "#e8e5df" }}>
                {lang === "en" ? "Other tools" : "Diğer araçlar"}
              </h2>
              <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
                {TEXT_TOOLS.map((tool, i) => (
                  <Link
                    key={tool.slug}
                    href={`${base}/${tool.slug}`}
                    className="flex flex-col gap-2.5 rounded-[10px] border border-[#e8e5df] bg-white p-6.5 transition-[border-color,box-shadow] duration-150 hover:border-[#cfcabf] hover:shadow-[0_1px_3px_rgba(20,19,17,0.06)]"
                  >
                    <CategoryIcon categoryKey="tools" index={i + 1} />
                    <span className="text-base font-semibold tracking-tight" style={{ color: "#141311" }}>{tool.title[lang]}</span>
                    <span className="text-sm leading-relaxed" style={{ color: "rgba(20,19,17,0.65)" }}>{tool.desc[lang]}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <CalcFooter lang={lang} />
    </div>
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
        {/* pt-40 -> pt-24: SiteHeader is now a real, solid header, not an
            absolute overlay - see its own comment in Site.tsx. */}
        <section data-tone="dark" className="relative isolate overflow-hidden bg-ink-950 pt-24 pb-14">
          <div className="altor-container">
            <Link href={base} className="inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white">
              <ArrowLeft aria-hidden className="size-3.5" />
              {T[lang].title}
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-white/70">{desc}</p>
          </div>
        </section>
        {/* Two calculators need more than the default single reading column:
            break-even-point's slider tool is a 2-column layout, and
            email-performance carries ten inputs and eight results. Both are
            one-offs with their own component (see each one's own top comment
            on why), not a change to the generic CalculatorTool every other
            calculator still renders in max-w-2xl. */}
        <div className={`altor-container py-12 ${spec && WIDE_TOOLS.has(spec.slug) ? "max-w-4xl" : "max-w-2xl"}`}>
          {spec && spec.slug === "break-even-point" ? (
            <BreakEvenSliderTool spec={toRuntimeSpec(spec)} lang={lang} />
          ) : spec && spec.slug === "email-performance" ? (
            <EmailPerformanceTool spec={toRuntimeSpec(spec)} lang={lang} />
          ) : (
            spec && <CalculatorTool spec={toRuntimeSpec(spec)} lang={lang} />
          )}
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
