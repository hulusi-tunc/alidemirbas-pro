import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AbTestGallery from "@/components/AbTestGallery";
import AbTestPlaybookPage from "@/components/AbTestPlaybookPage";
import LabShell from "@/components/LabShell";
import { categoryLabel, surfaceLabel } from "@/components/ui/AbTestVisuals";
import { ProductMark } from "@/components/ui/ProductFrame";
import { AB_CATEGORIES, AB_TEST_COUNT, AB_TEST_ROWS, SURFACES, abTestDetail } from "@/lib/ab-test-view";
import { pageAlternates } from "@/lib/seo";
import { breadcrumbList } from "@/lib/schema";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { copy } from "@/lib/content";

type Lang = "en" | "tr";

export const basePathFor = (lang: Lang) => (lang === "en" ? "/lab/ab-testing/library" : "/tr/lab/ab-testing/library");

const T = {
  en: { title: "A/B Test Library", intro: `${AB_TEST_COUNT} searchable A/B test scenarios. The variable under test, the primary KPI and the guardrails for each.`, back: "A/B Test Library", count: "scenarios", allScenarios: "All scenarios" },
  tr: { title: "A/B Test Kütüphanesi", intro: `${AB_TEST_COUNT} aranabilir A/B test senaryosu. Test edilen değişken, birincil KPI ve her biri için guardrail'ler.`, back: "A/B Test Kütüphanesi", count: "senaryo", allScenarios: "Tüm senaryolar" },
};

/* The gallery is a client component, so the category and surface display
   labels are resolved here - on the server - and passed down as plain
   maps. See the note beside LabelMap in AbTestGallery.tsx. */
const categoryLabelsFor = (lang: Lang): Record<string, string> =>
  Object.fromEntries(AB_CATEGORIES.map((c) => [c.id, categoryLabel(c.id, lang)]));

const surfaceLabelsFor = (lang: Lang): Record<string, string> =>
  Object.fromEntries(SURFACES.map((s) => [s, surfaceLabel(s, lang)]));

export function abLibraryIndexMetadata(lang: Lang): Metadata {
  const t = T[lang];
  return { title: `${t.title} - Ali Demirbaş`, description: t.intro, alternates: pageAlternates("/lab/ab-testing/library", lang) };
}

// The upstream record's only authored-English fields are seoTitle/
// seoDescription; question/hypothesis are the archive's native Turkish
// (see AbTestPlaybookPage, which renders test.question/test.hypothesis
// verbatim regardless of lang). Use the Turkish fields on tr so the
// title/description match what that route actually renders, and keep
// the authored English pair on en. Shared by abLibraryDetailMetadata and
// the detail page's own breadcrumb JSON-LD so they can't disagree.
function abLibraryDetailTitle(lang: Lang, r: NonNullable<ReturnType<typeof abTestDetail>>) {
  return lang === "tr" ? r.question : r.seoTitle ?? r.question;
}

export function abLibraryDetailMetadata(lang: Lang, slug: string): Metadata {
  const r = abTestDetail(slug);
  if (!r) return {};
  return {
    title: abLibraryDetailTitle(lang, r),
    description: lang === "tr" ? r.hypothesis.slice(0, 155) : r.seoDescription ?? r.hypothesis.slice(0, 155),
    alternates: pageAlternates(`/lab/ab-testing/library/${slug}`, lang),
  };
}

export function AbLibraryIndexPage({ lang }: { lang: Lang }) {
  const t = T[lang];
  const base = basePathFor(lang);
  const breadcrumb = breadcrumbList([
    { name: copy[lang].footer.home, url: lang === "en" ? "/" : "/tr" },
    { name: copy[lang].nav.lab, url: lang === "en" ? "/lab" : "/tr/lab" },
    { name: t.title, url: base },
  ]);
  return (
    /* The Journey Library's page, for the A/B archive (Hulusi, 2026-09-20:
       "here is the journey library UI, now update the A/B Test Library"):
       the site chrome rather than the slim workspace bar, the same opening
       the library list pages have - the project's mark, the title on the
       h1 step, the intro, centred, the count as a pill - and the gallery on
       the wide container, where a category rail plus three card columns
       need the 90rem measure. */
    <LabShell lang={lang} chrome="site" langHref={basePathFor(lang === "en" ? "tr" : "en")}>
      <JsonLdScript data={breadcrumb} />
      <section className="bg-paper pt-14 pb-8 md:pt-16 md:pb-10">
        <div className="altor-container text-center">
          <ProductMark slug="ab-test-playbook" lang={lang} className="mb-5" />
          <h1 className="mx-auto max-w-4xl text-h1 text-ink-950">{t.title}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-950/65">{t.intro}</p>
          <p className="mt-6">
            <span className="rounded-full bg-paper-soft px-3 py-1 text-sm font-medium text-ink-700 tabular-nums">
              {AB_TEST_COUNT} {t.count}
            </span>
          </p>
        </div>
      </section>
      <div className="pt-4 pb-16 md:pb-24">
        <div className="altor-container-wide">
          <AbTestGallery
            lang={lang}
            rows={AB_TEST_ROWS}
            categories={AB_CATEGORIES}
            surfaces={SURFACES}
            basePath={base}
            categoryLabels={categoryLabelsFor(lang)}
            surfaceLabels={surfaceLabelsFor(lang)}
          />
        </div>
      </div>
    </LabShell>
  );
}

export function AbLibraryDetailPage({ lang, slug }: { lang: Lang; slug: string }) {
  const r = abTestDetail(slug);
  if (!r) notFound();
  const base = basePathFor(lang);
  const breadcrumb = breadcrumbList([
    { name: copy[lang].footer.home, url: lang === "en" ? "/" : "/tr" },
    { name: copy[lang].nav.lab, url: lang === "en" ? "/lab" : "/tr/lab" },
    { name: T[lang].title, url: base },
    { name: abLibraryDetailTitle(lang, r), url: `${base}/${slug}` },
  ]);

  return (
    /* The journey detail's bar: the way back to the library on the left,
       the Lab mark, the language and the CTA - and the page in the journey
       Info tab's idiom under it (AbTestPlaybookPage). */
    <LabShell lang={lang} back={{ href: base, label: T[lang].allScenarios }} langHref={`${basePathFor(lang === "en" ? "tr" : "en")}/${slug}`}>
      <JsonLdScript data={breadcrumb} />
      <AbTestPlaybookPage test={r} lang={lang} />
    </LabShell>
  );
}
