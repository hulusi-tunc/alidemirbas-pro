import type { Metadata } from "next";
import { notFound } from "next/navigation";

import JourneyDetailBody, { journeyCanvasProps } from "@/components/JourneyDetailBody";
import JourneyDetailHeader from "@/components/JourneyDetailHeader";
import JourneyCanvas from "@/components/JourneyCanvas";
import { JourneyDetailShell } from "@/components/JourneyDetailShell";
import JourneyInfo, { JourneyChips, journeyCategoryId, journeyTitle } from "@/components/JourneyInfo";
import { CategoryIcon, categoryAccent } from "@/components/ui/LibraryChrome";
import JourneyModal from "@/components/JourneyModal";
import { resolveDetailSlug } from "@/lib/canonical-view";
import { localizedJourneyDetail, localizedPreset } from "@/lib/journey-tr-overrides";
import { copy, EMAIL, type Lang } from "@/lib/content";
import { pageAlternates, SITE_URL } from "@/lib/seo";
import { breadcrumbList } from "@/lib/schema";
import { JsonLdScript } from "@/components/ui/JsonLdScript";

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
  const { detail, merged, preset } = resolved;
  const localizedDetail = localizedJourneyDetail(detail, lang);
  const suffix = lang === "en" ? "Journey Library" : "Journey Kütüphanesi";

  /* A preset is its own page: its own title, its own canonical, the parent's
     practitioner view with the preset applied. The title and the description
     ARE the preset's own two strings, so they take the same TR content layer
     the page body does - a Turkish page whose <title> and meta description
     are English is the same leak one layer up. */
  if (preset) {
    const p = localizedPreset(preset, lang);
    return {
      title: `${p.name} - ${suffix}`,
      description: p.applicableWhen,
      alternates: pageAlternates(`/lab/journeys/${preset.slug}`, lang),
    };
  }

  /* A merged id is a real URL because old references deserve to land, but it
     is not a second canonical page for the same journey. */
  if (merged) {
    return {
      title: `${merged.from} → ${localizedDetail.id} - ${suffix}`,
      description: localizedDetail.purpose,
      robots: { index: false, follow: true },
      alternates: { canonical: `${SITE_URL}${basePathFor(lang)}/${detail.slug}` },
    };
  }
  return {
    title: `${localizedDetail.id} ${localizedDetail.shortName ?? localizedDetail.name} - ${suffix}`,
    description: localizedDetail.purpose,
    alternates: pageAlternates(`/lab/journeys/${detail.slug}`, lang),
  };
}

export async function JourneyFullPage({ lang, slug }: { lang: Lang; slug: string }) {
  const resolved = resolveDetailSlug(slug);
  if (!resolved) notFound();

  const { detail: rawDetail, merged, preset } = resolved;
  const detail = localizedJourneyDetail(rawDetail, lang);
  const t = copy[lang].lab.page;
  const basePath = basePathFor(lang);
  // Skipped for a merged id: it's noindex with its canonical pointing at
  // the survivor (see journeyMetadata above), so it isn't the page search
  // engines should be reading a breadcrumb from - the survivor's own page
  // already carries one.
  const breadcrumb = merged
    ? null
    : breadcrumbList([
        { name: copy[lang].footer.home, url: lang === "en" ? "/" : "/tr" },
        { name: copy[lang].nav.lab, url: lang === "en" ? "/lab" : "/tr/lab" },
        { name: t.title, url: basePath },
        ...(preset
          ? [
              { name: `${detail.id} ${detail.shortName ?? detail.name}`, url: `${basePath}/${detail.slug}` },
              // The crumb names the preset, so it names it the way the page does.
              { name: localizedPreset(preset, lang).name, url: `${basePath}/${preset.slug}` },
            ]
          : [{ name: `${detail.id} ${detail.shortName ?? detail.name}`, url: `${basePath}/${detail.slug}` }]),
      ]);

  const canvas = await journeyCanvasProps(detail, lang, t);
  const c = copy[lang];
  const langHref = lang === "en" ? `/tr/lab/journeys/${slug}` : `/lab/journeys/${slug}`;

  return (
    <JourneyDetailShell
      labels={{ back: t.backToLibrary, info: t.tabs.info, canvas: t.tabs.canvas, lang: c.nav.lang, cta: c.nav.cta, lab: "Lab", minimize: t.card.minimize, expand: t.card.expand }}
      hrefs={{ library: basePath, lab: c.nav.labHref, lang: langHref, cta: `mailto:${EMAIL}` }}
      info={
        <>
          {breadcrumb && <JsonLdScript data={breadcrumb} />}
          <JourneyInfo detail={detail} merged={merged} basePath={basePath} lang={lang} t={t} canvas={canvas} />
        </>
      }
      canvas={<JourneyCanvas {...canvas} basePath={basePath} mode="page" />}
      summary={{
        mark: (
          <span aria-hidden className={`grid size-7 shrink-0 place-items-center rounded-full ${categoryAccent(journeyCategoryId(detail)).tile}`}>
            <CategoryIcon id={journeyCategoryId(detail)} className="size-3.5" />
          </span>
        ),
        category: detail.categoryTitle,
        title: journeyTitle(detail),
        purpose: detail.purpose,
        chips: <JourneyChips detail={detail} lang={lang} />,
      }}
    />
  );
}

export function JourneyModalPage({ lang, slug }: { lang: Lang; slug: string }) {
  const resolved = resolveDetailSlug(slug);
  if (!resolved) notFound();

  const { detail: rawDetail, merged } = resolved;
  const detail = localizedJourneyDetail(rawDetail, lang);
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
