import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import AbTestBrowser from "@/components/AbTestBrowser";
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

  return (
    <LabShell lang={lang}>
      <div className="border-b border-line px-4 py-6 md:px-8">
        <div className="mx-auto max-w-3xl">
          <Link href={base} className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-ink-900">
            <ArrowLeft aria-hidden className="size-3.5" />
            {T[lang].back}
          </Link>
          <p className="mt-4 font-mono text-xs text-neutral-500 tabular-nums">{r.id} · {r.category}</p>
          <h1 className="mt-1 text-xl leading-snug font-semibold tracking-tight text-ink-950">{r.question}</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">{r.hypothesis}</p>
        </div>
      </div>
      <div className="px-4 py-8 md:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          {r.sideA && r.sideB && (
            <section>
              <h2 className="mb-4 font-mono text-xs font-medium tracking-wide text-neutral-500 uppercase">
                {lang === "en" ? "Control vs Variant" : "Kontrol / Varyant"}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {[r.sideA, r.sideB].map((side, i) => (
                  <div key={i} className="border border-line bg-paper-soft p-4">
                    <p className="font-mono text-[11px] tracking-wide text-neutral-500 uppercase">{side.role}</p>
                    <p className="mt-1 text-sm text-ink-900">{side.label ?? "—"}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          <section>
            <h2 className="mb-3 font-mono text-xs font-medium tracking-wide text-neutral-500 uppercase">
              {lang === "en" ? "Primary KPI" : "Birincil KPI"}
            </h2>
            <p className="text-sm text-ink-900"><b>{r.primaryKpi.label}</b> — {r.primaryKpi.explanation}</p>
            {r.otherKpis.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1.5 text-sm text-ink-600">
                {r.otherKpis.map((k) => <li key={k.label}><b className="text-ink-800">{k.label}</b> — {k.explanation}</li>)}
              </ul>
            )}
          </section>
          <section>
            <h2 className="mb-3 font-mono text-xs font-medium tracking-wide text-neutral-500 uppercase">
              {lang === "en" ? "What to test" : "Test edilecekler"}
            </h2>
            <ul className="flex flex-col gap-1.5 text-sm text-ink-600">
              {r.whatToTest.map((w) => <li key={w.label}><b className="text-ink-800">{w.label}</b> — {w.explanation}</li>)}
            </ul>
          </section>
          <section>
            <h2 className="mb-3 font-mono text-xs font-medium tracking-wide text-neutral-500 uppercase">
              {lang === "en" ? "Never do" : "Yapılmaması gerekenler"}
            </h2>
            <ul className="flex flex-col gap-2 text-sm text-ink-600">
              {r.guardrails.map((g) => <li key={g} className="border-b border-line pb-2 last:border-0">{g}</li>)}
            </ul>
          </section>
        </div>
      </div>
    </LabShell>
  );
}
