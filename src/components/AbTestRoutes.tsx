import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AbTestBrowser from "@/components/AbTestBrowser";
import AbTestPlaybookPage from "@/components/AbTestPlaybookPage";
import LabShell from "@/components/LabShell";
import { AB_TEST_COUNT, AB_TEST_ROWS, SURFACES, abTestDetail, type Surface } from "@/lib/ab-test-view";
import { pageAlternates } from "@/lib/seo";

type Lang = "en" | "tr";

export const basePathFor = (lang: Lang) => (lang === "en" ? "/lab/ab-testing/library" : "/tr/lab/ab-testing/library");

const T = {
  en: { title: "A/B Test Library", intro: `${AB_TEST_COUNT} searchable A/B test scenarios: the variable under test, the primary KPI, and the guardrails for each.`, back: "A/B Test Library" },
  tr: { title: "A/B Test Kütüphanesi", intro: `${AB_TEST_COUNT} aranabilir A/B test senaryosu: test edilen değişken, birincil KPI ve her biri için guardrail'ler.`, back: "A/B Test Kütüphanesi" },
};

export function abLibraryIndexMetadata(lang: Lang): Metadata {
  const t = T[lang];
  return { title: `${t.title} - Ali Demirbaş`, description: t.intro, alternates: pageAlternates("/lab/ab-testing/library", lang) };
}

export function abLibraryDetailMetadata(lang: Lang, slug: string): Metadata {
  const r = abTestDetail(slug);
  if (!r) return {};
  return {
    title: r.seoTitle ?? r.question,
    description: r.seoDescription ?? r.hypothesis.slice(0, 155),
    alternates: pageAlternates(`/lab/ab-testing/library/${slug}`, lang),
  };
}

export function AbLibraryIndexPage({ lang }: { lang: Lang }) {
  const t = T[lang];
  const base = basePathFor(lang);
  return (
    <LabShell lang={lang}>
      <div className="border-b border-line px-4 py-6 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-ink-950">{t.title}</h1>
            <span className="border border-line bg-paper-soft px-2 py-0.5 text-xs font-medium text-neutral-600">
              {AB_TEST_COUNT}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">{t.intro}</p>
        </div>
      </div>
      <div className="px-4 py-6 md:px-8">
        <div className="mx-auto max-w-6xl">
          <AbTestBrowser lang={lang} rows={AB_TEST_ROWS} surfaces={SURFACES as readonly Surface[]} basePath={base} />
        </div>
      </div>
    </LabShell>
  );
}

export function AbLibraryDetailPage({ lang, slug }: { lang: Lang; slug: string }) {
  const r = abTestDetail(slug);
  if (!r) notFound();
  const base = basePathFor(lang);
  // Position in the library, for the header rail. Derived from the same
  // ordered row list the index page renders, so the two can't disagree.
  const position = AB_TEST_ROWS.findIndex((row) => row.id === r.id) + 1;

  return (
    <LabShell lang={lang}>
      <AbTestPlaybookPage
        test={r}
        lang={lang}
        basePath={base}
        position={position}
        total={AB_TEST_COUNT}
      />
    </LabShell>
  );
}
