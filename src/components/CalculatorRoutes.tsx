import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import CalculatorTool from "@/components/CalculatorTool";
import { BreakEvenSliderTool } from "@/components/ui/BreakEvenSliderTool";
import EmailPerformanceTool from "@/components/ui/EmailPerformanceTool";
import CalculatorDetailTemplate from "@/components/CalculatorDetailTemplate";
import UtmBuilder from "@/components/UtmBuilder";
import CharacterCounter from "@/components/CharacterCounter";
import { SiteFooter, SiteHeader } from "@/components/Site";
import { CalculatorLibrary, type CalcEntry, type CategoryFacet } from "@/components/ui/CalculatorLibrary";
import { copy } from "@/lib/content";
import { TEXT_TOOLS } from "@/lib/text-tools";
import {
  getAllLiveSpecs, getCalcSpec, toRuntimeSpec, LIVE_CALCULATOR_SLUGS,
  correctedFormulaPlainEnglish, LIBRARY_GROUP, LIBRARY_GROUP_ORDER, TEXT_TOOL_GROUP,
  type LibraryGroup,
  GROUP_LABEL,
} from "@/lib/calc-catalog";
import { getContent, type CalcContent } from "@/lib/calc-content";
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

  /* One grid, calculators and text tools together. The two tools used to
     render as a separate "Other tools" list below it, on the grounds that
     they carry no `category` field to file them under - but that was a
     data problem being shown to the reader. Somebody looking for a tool on
     this page should find all of them in one place, filterable and
     searchable the same way; TEXT_TOOL_GROUP supplies the group the data
     could not. */
  const calcEntries: CalcEntry[] = specs.map((spec) => {
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

  const toolEntries: CalcEntry[] = TEXT_TOOLS.map((tool) => {
    const categoryLabel = GROUP_LABEL[TEXT_TOOL_GROUP][lang];
    return {
      slug: tool.slug,
      name: tool.title[lang],
      description: tool.desc[lang],
      categoryLabel,
      categoryKey: TEXT_TOOL_GROUP,
      // No aliases to pass: a text tool has no catalog record and so no
      // alias list, unlike every calculator above.
      searchText: calcSearchText(tool.title[lang], tool.desc[lang], categoryLabel, []),
      href: `${base}/${tool.slug}`,
    };
  });

  // Funnel order, not catalog order: the grid should read in the same
  // sequence as the facet list beside it.
  const entries = [...calcEntries, ...toolEntries].sort(
    (a, b) =>
      LIBRARY_GROUP_ORDER.indexOf(a.categoryKey as LibraryGroup) -
      LIBRARY_GROUP_ORDER.indexOf(b.categoryKey as LibraryGroup),
  );

  /* `id` is the display label itself (not the raw group key) - the only
     join key CalculatorLibrary needs, and every label is unique across the
     seven groups, so this stays a plain 1:1 mapping with no separate id
     scheme to keep in sync. Ordered by LIBRARY_GROUP_ORDER rather than by
     count: the groups describe a funnel, and sorting them by size would
     scramble that for no gain across seven items. Counted off `entries`
     so the facet totals can never disagree with the grid. */
  const groupCounts = new Map<LibraryGroup, number>();
  for (const e of entries) {
    const g = e.categoryKey as LibraryGroup;
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
          {/* The blue wash this hero borrowed from Contact came off in the
              site-wide quieting: this page runs its own deliberate cream
              palette (a user-supplied mockup), and blue blobs floating on
              a cream ground were the one place two design languages sat
              in the same viewport. The cream page now opens on its own
              ground. */}
          <div className="relative mx-auto max-w-320 px-6 text-center sm:px-12">
            <p className="mb-4 text-xs font-medium tracking-[0.12em] uppercase" style={{ color: "#9c978c" }}>{hero.eyebrow}</p>
            <h1 className="mx-auto max-w-xl text-[2.75rem] leading-[1.1] font-medium tracking-tight" style={{ color: "#141311" }}>{hero.title}</h1>
            <p className="mx-auto mt-3 max-w-xl text-lg leading-relaxed" style={{ color: "rgba(20,19,17,0.65)" }}>{hero.sub}</p>
          </div>
        </section>

        <section className="pt-3 pb-24">
          <div className="mx-auto max-w-320 px-6 sm:px-12">
            <CalculatorLibrary lang={lang} entries={entries} categoryFacets={categoryFacets} />

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
  const c = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const base = basePathFor(lang);

  /* The text tools keep the page they already had. They carry no CalcSpec
     and no content file, so they have no result to headline, no worked
     example and no "what this number means" - running them through the
     calculator template would mean inventing all four. */
  if (textTool) {
    return (
      <>
        <SiteHeader t={c} anchorBase={home} langHref={lang === "en" ? `/tr/calculators/${slug}` : `/calculators/${slug}`} />
        <main>
          <section data-tone="dark" className="relative isolate overflow-hidden bg-ink-950 pt-24 pb-14">
            <div className="altor-container">
              <Link href={base} className="inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white">
                <ArrowLeft aria-hidden className="size-3.5" />
                {T[lang].title}
              </Link>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{textTool.title[lang]}</h1>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-white/70">{textTool.desc[lang]}</p>
            </div>
          </section>
          <div className="altor-container max-w-2xl py-12">
            {textTool.slug === "utm-builder" && <UtmBuilder lang={lang} />}
            {textTool.slug === "character-counter" && <CharacterCounter lang={lang} />}
          </div>
        </main>
        <SiteFooter t={c} lang={lang} />
      </>
    );
  }

  const runtime = toRuntimeSpec(spec!);
  /* EN-only editorial content, same as before. TR falls back to an
     English-derived page rather than showing a half-translated one, which
     is the existing convention (see getContent's own note); the template
     itself is fully localised, so a TR page differs only in that its prose
     is the same English the catalog holds. */
  const content = getContent(slug, lang) ?? getContent(slug, "en")!;
  const title = content.heroTitle ?? spec!.name;

  /* Authored related links first, catalog-derived as the fallback - both
     re-checked against the live library so a retired slug can never render
     as a link to a 404. Capped at four: the row is four wide, and a fifth
     wrapping onto its own line makes a quiet section loud. */
  const authored = (content.related ?? []).filter((r) => LIVE_CALCULATOR_SLUGS.includes(r.slug));
  const relatedItems = (
    authored.length > 0
      ? authored.map((r) => ({ href: `${base}/${r.slug}`, name: r.name }))
      : runtime.related.map((r) => ({ href: `${base}/${r.slug}`, name: r.name }))
  ).slice(0, 4);

  const tool =
    spec!.slug === "break-even-point" ? (
      <BreakEvenSliderTool spec={runtime} lang={lang} />
    ) : spec!.slug === "email-performance" ? (
      <EmailPerformanceTool spec={runtime} lang={lang} />
    ) : (
      <CalculatorTool spec={runtime} lang={lang} />
    );

  return (
    <>
      <SiteHeader t={c} anchorBase={home} langHref={lang === "en" ? `/tr/calculators/${slug}` : `/calculators/${slug}`} />
      <main>
        <CalculatorDetailTemplate
          lang={lang}
          basePath={base}
          title={title}
          content={content}
          related={relatedItems}
          workedExampleFallback={<WorkedExampleRows content={content} />}
        >
          {tool}
        </CalculatorDetailTemplate>
      </main>
      <SiteFooter t={c} lang={lang} />
    </>
  );
}

/* The structured worked example, for the one calculator whose example can't
   be stated on a single line (ten inputs, eight results). Rendered inside
   the template's own strip, so it reads as the same element either way. */
function WorkedExampleRows({ content }: { content: CalcContent }) {
  const section = content.sections.find((s) => s.type === "worked-example");
  if (!section) return null;
  return (
    <div className="font-mono text-[13px]">
      {(section.inputs ?? []).map((row) => (
        <div key={row.label} className="flex justify-between gap-4 py-0.5 text-ink-600">
          <span>{row.label}</span>
          <span className="text-ink-900 tabular-nums">{row.value}</span>
        </div>
      ))}
      {section.output && (
        <div className="mt-1.5 flex justify-between gap-4 border-t border-line pt-1.5 font-medium text-ink-950">
          <span>{section.output.label}</span>
          <span className="tabular-nums">{section.output.value}</span>
        </div>
      )}
    </div>
  );
}
