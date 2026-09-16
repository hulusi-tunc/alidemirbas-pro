import type { Metadata } from "next";
import { notFound } from "next/navigation";

import JourneyDetailBody from "@/components/JourneyDetailBody";
import JourneyDetailHeader from "@/components/JourneyDetailHeader";
import JourneyVisualBody, { journeyCanvasProps } from "@/components/JourneyVisualBody";
import JourneyCanvas from "@/components/JourneyCanvas";
import { JourneyDetailShell } from "@/components/JourneyDetailShell";
import JourneyInfo, { journeyTitle } from "@/components/JourneyInfo";
import JourneyModal from "@/components/JourneyModal";
import { resolveDetailSlug, type JourneyDetail } from "@/lib/canonical-view";
import { localizedJourneyDetail } from "@/lib/journey-tr-overrides";
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

/** GENERALIZED (2026-09-04) from a single-slug pilot (quote-abandonment) into
    a data-driven rule, applied here - the one place both page shapes (full
    page and modal) already share, so this changes exactly the journeys it
    qualifies and nothing else.

    A journey qualifies when it has a practitioner view with at least one
    orchestration touch, those touches form one straight chain - no two
    touches sharing an `after` - AND at least one touch is actually gated by
    a wait (has real timing to show). Both conditions were found empirically,
    not assumed:

    - THE CHAIN REQUIREMENT. A flat numbered "1, 2, 3" card is an honest
      rendering of a straight sequence, but 8 of the 71 communicating
      journeys have real alternate branches (e.g. FIN-134's payment-failure
      journey offers a corrective request OR an alternate path, not
      one-then-the-other) - forcing those into the same numbered list would
      misrepresent the journey.
    - THE GATED-TOUCH REQUIREMENT. Of the 63 that ARE a straight chain, 35
      have NO gated touch at all - their "touches" are synchronous internal
      routing steps (classify, store, route), not timed customer contact.
      Rendered through the same card those come out as N stages all reading
      "On entry", sometimes with the same stage name repeated (confirmed on
      FBK-43's feedback-routing journey) - technically accurate, but not what
      "Recommended flow" is for, so those keep the technical page too.

    That leaves 28: 8 fully time-gated (identical in shape to the
    quote-abandonment pilot) plus 20 where some touches are immediate and
    others wait - both render honestly, since "On entry" is simply true for
    the immediate ones. The other 256 keep JourneyDetailBody. See
    JourneyVisualBody.tsx's own comment for what each card is built from. */
function canUseVisualBody(detail: JourneyDetail): boolean {
  const timeline = detail.practitioner?.timeline;
  if (!timeline || timeline.length === 0) return false;
  const afterCounts = new Map<string, number>();
  for (const step of timeline) if (step.after) afterCounts.set(step.after, (afterCounts.get(step.after) ?? 0) + 1);
  const isLinearChain = ![...afterCounts.values()].some((n) => n > 1);
  const hasRealTiming = timeline.some((step) => step.gate !== null);
  return isLinearChain && hasRealTiming;
}

export function journeyMetadata(lang: Lang, slug: string): Metadata {
  const resolved = resolveDetailSlug(slug);
  if (!resolved) return {};
  const { detail, merged, preset } = resolved;
  const suffix = lang === "en" ? "Journey Library" : "Journey Kütüphanesi";

  /* A preset is its own page: its own title, its own canonical, the parent's
     practitioner view with the preset applied. */
  if (preset) {
    return {
      title: `${preset.name} - ${suffix}`,
      description: preset.applicableWhen,
      alternates: pageAlternates(`/lab/journeys/${preset.slug}`, lang),
    };
  }

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
    title: `${detail.id} ${detail.shortName ?? detail.name} - ${suffix}`,
    description: detail.purpose,
    alternates: pageAlternates(`/lab/journeys/${detail.slug}`, lang),
  };
}

export function JourneyFullPage({ lang, slug }: { lang: Lang; slug: string }) {
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
              { name: preset.name, url: `${basePath}/${preset.slug}` },
            ]
          : [{ name: `${detail.id} ${detail.shortName ?? detail.name}`, url: `${basePath}/${detail.slug}` }]),
      ]);

  const canvas = journeyCanvasProps(detail, lang, t);
  const c = copy[lang];
  const langHref = lang === "en" ? `/tr/lab/journeys/${slug}` : `/lab/journeys/${slug}`;

  return (
    <JourneyDetailShell
      labels={{ back: t.backToLibrary, info: t.tabs.info, canvas: t.tabs.canvas, lang: c.nav.lang, cta: c.nav.cta, lab: "Lab", minimize: t.card.minimize, expand: t.card.expand }}
      hrefs={{ library: basePath, lab: c.nav.labHref, lang: langHref, cta: `mailto:${EMAIL}` }}
      info={
        <>
          {breadcrumb && <JsonLdScript data={breadcrumb} />}
          <JourneyInfo detail={detail} merged={merged} basePath={basePath} lang={lang} t={t} visual={canUseVisualBody(detail)} />
        </>
      }
      canvas={<JourneyCanvas {...canvas} basePath={basePath} mode="page" />}
      titleCard={
        <>
          <p className="text-xs font-medium text-ink-subtle">{detail.categoryTitle}</p>
          <p className="mt-1 text-lg leading-snug font-semibold text-balance text-ink-950">{journeyTitle(detail)}</p>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-muted">{detail.purpose}</p>
        </>
      }
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
            {canUseVisualBody(detail) ? (
              <JourneyVisualBody detail={detail} basePath={basePath} lang={lang} t={t} />
            ) : (
              <JourneyDetailBody detail={detail} merged={merged} basePath={basePath} lang={lang} t={t} />
            )}
          </div>
        </div>
      </div>
    </JourneyModal>
  );
}
