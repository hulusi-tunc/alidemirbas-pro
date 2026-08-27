import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import JourneyDetailBody from "@/components/JourneyDetailBody";
import JourneyDetailHeader from "@/components/JourneyDetailHeader";
import JourneyModal from "@/components/JourneyModal";
import LabShell from "@/components/LabShell";
import { resolveDetailSlug } from "@/lib/canonical-view";
import { copy, type Lang } from "@/lib/content";
import { pageAlternates, SITE_URL } from "@/lib/seo";

/* One journey, in the two shapes it is asked for.

   Both are server components. The journey's own detail is resolved here and
   the graph goes to a client island as props, so a reader who opens ACQ-01
   downloads ACQ-01 and not the other 280.

   Both shapes are the same document: header, figure, rule, notes, every band
   on the same measure. The page used to put its header in a full-bleed band
   at a reading width and then open out to a much wider canvas below it, which
   read as two pages stacked. One column, one set of edges. */

export const basePathFor = (lang: Lang) => (lang === "en" ? "/lab/journeys" : "/tr/lab/journeys");

/* The page's own measure, and the canvas's with it. Wider than a reading
   column because the graph is the subject, narrower than the old 1400 because
   at that width the median journey's graph filled 64% of the frame and the
   rest read as empty workspace; measured across all 281, 1180 takes that to
   75% while still leaving the widest journeys the horizontal pan they have
   always needed. Individual prose blocks re-narrow themselves inside it. */
const PAGE_MEASURE = "max-w-[1180px]";

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

  return (
    <LabShell lang={lang}>
      <div className="px-4 py-7 md:px-8 md:py-10">
        <div className={`mx-auto ${PAGE_MEASURE}`}>
          <Link
            href={basePath}
            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 transition-colors hover:text-ink-900"
          >
            <ArrowLeft aria-hidden className="size-3.5" />
            {t.backToLibrary}
          </Link>
          <div className="mt-6">
            <JourneyDetailHeader detail={detail} lang={lang} t={t} />
          </div>
          <div className="mt-9">
            <JourneyDetailBody detail={detail} merged={merged} basePath={basePath} lang={lang} t={t} />
          </div>
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

  return (
    <JourneyModal closeLabel={t.close} wide>
      {/* One scrolling document, same as the page - the modal used to pin the
          header above a separately scrolling body, which meant the title
          stayed put while the figure it names scrolled away from it. */}
      <div className="flex-1 overflow-y-auto bg-paper px-5 py-6 md:px-8">
        <div className={`mx-auto ${PAGE_MEASURE}`}>
          {/* Clears the close button, which is pinned to the panel rather
              than scrolling with this content. */}
          <div className="pr-10 sm:pr-12">
            <JourneyDetailHeader
              detail={detail}
              lang={lang}
              t={t}
              as="h2"
              titleId="journey-modal-title"
              compact
            />
          </div>
          <div className="mt-8">
            <JourneyDetailBody detail={detail} merged={merged} basePath={basePath} lang={lang} t={t} />
          </div>
        </div>
      </div>
    </JourneyModal>
  );
}
