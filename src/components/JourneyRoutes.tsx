import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import JourneyDetailBody from "@/components/JourneyDetailBody";
import JourneyModal from "@/components/JourneyModal";
import LabShell from "@/components/LabShell";
import { resolveDetailSlug } from "@/lib/canonical-view";
import { copy, type Lang } from "@/lib/content";
import { pageAlternates, SITE_URL } from "@/lib/seo";

/* One journey, in the two shapes it is asked for.

   Both are server components. The journey's own detail is resolved here and
   the graph goes to a client island as props, so a reader who opens ACQ-01
   downloads ACQ-01 and not the other 255. */

export const basePathFor = (lang: Lang) => (lang === "en" ? "/lab/journeys" : "/tr/lab/journeys");

export function journeyMetadata(lang: Lang, slug: string): Metadata {
  const resolved = resolveDetailSlug(slug);
  if (!resolved) return {};
  const { detail, merged } = resolved;
  const suffix = lang === "en" ? "Canonical Journey Library" : "Canonical Journey Kütüphanesi";

  /* A merged id is a real URL because old references deserve to land, but it
     is not a second canonical page for the same journey. */
  if (merged) {
    return {
      title: `${merged.from} → ${detail.id} - ${suffix}`,
      description: detail.purpose,
      robots: { index: false, follow: true },
      alternates: { canonical: `${SITE_URL}${basePathFor(lang)}/${detail.slug}` },
    };
  }
  return {
    title: `${detail.id} ${detail.name} - ${suffix}`,
    description: detail.purpose,
    alternates: pageAlternates(`/lab/journeys/${detail.slug}`, lang),
  };
}

export function JourneyFullPage({ lang, slug }: { lang: Lang; slug: string }) {
  const resolved = resolveDetailSlug(slug);
  if (!resolved) notFound();

  const { detail, merged } = resolved;
  const t = copy[lang].lab.page;
  const basePath = basePathFor(lang);
  /* The canvas needs 70-80% of the viewport (§2 of the visual grammar) - a
     max-w-3xl reading column would crop it to a fraction of that. Every
     journey now uses the wide shell; JourneyDetailBody itself re-narrows
     its own prose sections back to max-w-3xl even inside this wider shell,
     so guardrails and the reusable rule stay a comfortable reading width. */
  const wide = true;

  return (
    <LabShell lang={lang}>
      <div className="border-b border-line px-4 py-6 md:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href={basePath}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 transition-colors hover:text-ink-900"
          >
            <ArrowLeft aria-hidden className="size-3.5" />
            {t.backToLibrary}
          </Link>
          <p className="mt-4 font-mono text-xs text-neutral-500 tabular-nums">
            {detail.id} - {detail.categoryTitle}
          </p>
          <h1 className="mt-1 text-xl leading-snug font-semibold tracking-tight text-ink-950">
            {detail.name}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-600">{detail.purpose}</p>
        </div>
      </div>
      <div className="px-4 py-8 md:px-8">
        <div className={`mx-auto ${wide ? "max-w-[1400px]" : "max-w-3xl"}`}>
          <JourneyDetailBody detail={detail} merged={merged} basePath={basePath} lang={lang} t={t} />
        </div>
      </div>
    </LabShell>
  );
}

export function JourneyModalPage({ lang, slug }: { lang: Lang; slug: string }) {
  const resolved = resolveDetailSlug(slug);
  if (!resolved) notFound();

  const { detail, merged } = resolved;
  const t = copy[lang].lab.page;
  const basePath = basePathFor(lang);
  const wide = true;

  return (
    <JourneyModal closeLabel={t.close} wide={wide}>
      <header className="border-b border-line px-6 py-5 pr-16">
        <p className="font-mono text-xs text-neutral-500 tabular-nums">
          {detail.id} - {detail.categoryTitle}
        </p>
        <h2
          id="journey-modal-title"
          className="mt-1 text-lg leading-snug font-semibold tracking-tight text-ink-950"
        >
          {detail.name}
        </h2>
        <p className="mt-2 text-sm text-ink-600">{detail.purpose}</p>
      </header>
      <div className="flex-1 overflow-y-auto bg-paper-soft px-5 py-6">
        <JourneyDetailBody detail={detail} merged={merged} basePath={basePath} lang={lang} t={t} />
      </div>
    </JourneyModal>
  );
}
