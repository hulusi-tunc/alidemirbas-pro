import { Suspense } from "react";
import { Search } from "lucide-react";

import JourneyBrowser from "@/components/JourneyBrowser";
import JourneyGallery from "@/components/JourneyGallery";
import JourneyRowCard from "@/components/JourneyRowCard";
import JourneyIdeaCard from "@/components/ui/JourneyIdeaCard";
import LabShell from "@/components/LabShell";
import { ALL_CHANNELS_ICON, ALL_GOALS_ICON, CategoryHeader, ChevronSelect, SEARCH_SHELL, TOOLBAR_ROW } from "@/components/ui/LibraryChrome";
import { ProductMark } from "@/components/ui/ProductFrame";
import {
  CATEGORY_META,
  JOURNEY_ROWS,
  MERGED_REDIRECTS,
  PRESET_ROWS,
  SURFACE_PATH,
  withLibraryCount,
  type JourneyRow,
  type SurfaceKey,
} from "@/lib/canonical-view";
import { GOAL_LABEL } from "@/lib/journey-taxonomy";
import { CHANNEL_LABEL, sortChannels } from "@/lib/journey-channels";
import { copy, type Lang } from "@/lib/content";
import { localizedJourneySlug } from "@/lib/journey-localized-slugs";
import { localizedJourneyNaming, localizedPreset } from "@/lib/journey-tr-overrides";
import { breadcrumbList, type BreadcrumbItem } from "@/lib/schema";
import { JsonLdScript } from "@/components/ui/JsonLdScript";

/* JourneyBrowser reads filter state via useSearchParams, which forces its
   subtree to client-render during prerendering (Next's own documented
   behavior for that hook - see next/dist/docs/.../use-search-params.md).
   Without a fallback, that would mean the journey list is absent from
   the initial HTML until hydration. This fallback is the same list,
   unfiltered, rendered as a plain server component with an inert copy of the
   toolbar above it, so search engines and no-JS clients still see the full
   library immediately; JourneyBrowser replaces it once the client mounts. */
function JourneyBrowserFallback({ lang, t, basePath, rows }: {
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
  basePath: string;
  rows: readonly JourneyRow[];
}) {
  return (
    <div>
      <div className="flex items-center gap-3 border border-line bg-paper px-4 py-2.5 opacity-60">
        <Search aria-hidden className="size-4 shrink-0 text-neutral-500" />
        <span className="text-sm text-neutral-500">{t.searchPlaceholder}</span>
      </div>
      <div className="mt-3">
        <div className="w-full border border-line bg-paper px-4 py-2.5 text-sm text-ink-900 opacity-60 sm:w-auto">
          {t.allGoals}
        </div>
      </div>
      <p className="mt-4 text-sm text-ink-500 tabular-nums">
        {rows.length} / {rows.length} {t.results}
      </p>
      <div className="mt-5">
        {rows.map((j) => (
          <JourneyRowCard
            key={j.id}
            href={`${basePath}/${localizedJourneySlug(j.id, j.slug, lang)}`}
            id={j.id}
            name={j.name}
            shortName={j.shortName}
            goalLabel={GOAL_LABEL[j.goal][lang]}
            categoryTitle={j.categoryTitle}
            nodeCount={j.nodeCount}
            nodesLabel={t.nodesLabel}
            channelLabels={sortChannels(j.channels).map((c) => CHANNEL_LABEL[c][lang])}
            preview={j.preview}
          />
        ))}
      </div>
    </div>
  );
}

/* The gallery's prerender fallback. JourneyGallery calls useJourneyFilters,
   which reads useSearchParams and so cannot render during static
   generation; without this the list would be missing from the initial HTML
   until hydration. Same sections in the same order, every card shown (there
   is no "show more" to honour before there is any interactivity), and an
   inert copy of the controls above it. */
function GalleryFallback({ lang, t, basePath, rows, surface }: {
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
  basePath: string;
  rows: readonly JourneyRow[];
  surface: SurfaceKey;
}) {
  const labels = copy[lang].lab.journeysSplit;
  const byCat = new Map<string, JourneyRow[]>();
  for (const j of rows) {
    const arr = byCat.get(j.category) ?? [];
    arr.push(j);
    byCat.set(j.category, arr);
  }
  const sections = CATEGORY_META.filter((c) => byCat.has(c.id)).map((c) => ({ meta: c, items: byCat.get(c.id)! }));
  return (
    <div>
      <div className={`${TOOLBAR_ROW} opacity-60`}>
        <div className={`${SEARCH_SHELL} min-w-0 lg:flex-1`}>
          <Search aria-hidden className="size-4 shrink-0 text-ink-500" />
          <span className="text-ink-500">{t.searchPlaceholder}</span>
        </div>
        <ChevronSelect icon={ALL_CHANNELS_ICON}>{labels.allChannels}</ChevronSelect>
        <ChevronSelect icon={ALL_GOALS_ICON}>{t.allGoals}</ChevronSelect>
      </div>
      <div className="mt-10 flex flex-col gap-14">
        {sections.map(({ meta, items }) => (
          <section key={meta.id} id={`cat-${meta.id}`} className="scroll-mt-24">
            <CategoryHeader
              id={meta.id}
              code={items[0]?.id.split("-")[0] ?? ""}
              title={lang === "en" ? meta.title : meta.titleTr}
              count={items.length}
              countLabel={labels.journeysLabel[surface][items.length === 1 ? 0 : 1]}
              purpose={lang === "en" ? meta.purpose : meta.descriptionTr}
            />
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((j) => (
                <JourneyIdeaCard
                  key={j.id}
                  href={`${basePath}/${localizedJourneySlug(j.id, j.slug, lang)}`}
                  id={j.id}
                  lang={lang}
                  title={j.shortName ?? j.name}
                  category={j.category}
                  categoryTitle={j.categoryTitle}
                  purpose={j.purpose}
                  nodeCount={j.nodeCount}
                  nodesLabel={t.nodesLabel}
                  channels={sortChannels(j.channels)}
                  internalLabel={labels.internalBadge}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/* The archive list. A server component: it reads the canonical library here
   and hands the browser rows, not node graphs. The detail of any one journey
   arrives on its own route.

   Used to also carry a "Tools" sidebar linking to the other Lab projects, but
   that's redundant now that /lab is its own landing page people arrive from -
   re-add it (see git history before this comment) if that stops being true.

   PARAMETRIZED (2026-09) for the two child list pages under this same route
   - /lab/communication-journeys and /lab/internal-journeys - which reuse
   this exact component with a filtered `rows` set and their own
   title/intro, rather than a forked copy of the whole page. `rows`/`title`/
   `intro` default to the full unified library, so the existing
   `/lab/journeys` route (still this page's default call) is unchanged.
   The two child pages are NOT under /lab/journeys/ - that single segment
   belongs to journey slugs, and the @modal slot's `(.)[slug]` interceptor
   claims every one-segment path under it. A list page there either 500s
   (unlisted param, dynamicParams=false) or gets silently intercepted, which
   changes the URL and leaves the hub on screen. They live at
   /lab/communication-journeys and /lab/internal-journeys instead; the
   hierarchy is carried by this hub and the breadcrumb, not by the path.

   The parent, /lab/journeys, is NOT this component any more: it is
   JourneyLibraryPage, a product page in the claude-lifecycle shape that
   hands off to the two child pages here. This component is the two
   children's list view (and the historical full-library default). */
export default function LabPage({
  lang,
  rows = JOURNEY_ROWS,
  title,
  intro,
  extraCrumb,
  browser = "flat",
  surface,
}: {
  lang: Lang;
  rows?: readonly JourneyRow[];
  title?: string;
  intro?: string;
  extraCrumb?: { name: string; url: string };
  /** "gallery" renders JourneyGallery - category sections of cards, with
      search plus Category/Channel/Goal filters - instead of the flat
      JourneyBrowser row list. Both split pages use it. */
  browser?: "flat" | "gallery";
  /** Which surface a gallery page is showing. Required by "gallery"; the
      gallery uses it for the surface switch, which is a row of links to the
      other routes rather than a dropdown. */
  surface?: SurfaceKey;
}) {
  const t = copy[lang];
  /* EVERY CARD ON THIS PAGE, THROUGH THE TR CONTENT LAYER. The three surface
     galleries render a JourneyRow's name, shortName, purpose and category
     title, and JOURNEY_ROWS is the English canonical projection
     (canonical-view.ts, computed once at module load and shared by both
     locales). Passing it straight to the gallery listed every card's purpose
     in English on /tr - 58 of them on Customer Journeys alone. One map here,
     at the one boundary all three surfaces pass through; the row's shape,
     order, counts and thumbnails are untouched, and on `en` the function
     returns its argument. */
  const localizedRows = rows.map((r) => localizedJourneyNaming(r, lang));
  /* Same boundary, same rule, for the preset cards the customer-journeys
     gallery shows above the list: name, applicable-when, parent name and
     category title, translated once here rather than inside the client
     component. `localizedPreset` returns its argument on `en`. */
  const localizedPresets = PRESET_ROWS.map((p) => localizedPreset(p, lang));
  const basePath = lang === "en" ? "/lab/journeys" : "/tr/lab/journeys";
  const pageTitle = title ?? t.lab.page.title;
  const pageIntro =
    intro ?? withLibraryCount(t.lab.page.intro);
  const crumbs: BreadcrumbItem[] = [
    { name: t.footer.home, url: lang === "en" ? "/" : "/tr" },
    { name: t.nav.lab, url: lang === "en" ? "/lab" : "/tr/lab" },
    { name: t.lab.page.title, url: basePath },
  ];
  if (extraCrumb) crumbs.push(extraCrumb);
  const breadcrumb = breadcrumbList(crumbs);

  return (
    <LabShell lang={lang} chrome="site" langHref={surface ? (lang === "en" ? "/tr" : "") + SURFACE_PATH[surface] : undefined}>
      <JsonLdScript data={breadcrumb} />
      {/* The hero (2026-09-13, Hulusi: "the header and hero here do not
          match the other Lab pages, and the divider is bad"): the same
          opening the product pages have - the Journey Library's mark, the
          title on the h1 step and the intro, centred, no rule under it -
          then the count as a pill. The list below sits on the wide
          container: a category rail plus three card columns need the
          90rem measure. */}
      <section className="bg-paper pt-14 pb-8 md:pt-16 md:pb-10">
        <div className="altor-container text-center">
          {surface ? <ProductMark slug="lifecycle-card-archive" lang={lang} className="mb-5" /> : null}
          <h1 className="mx-auto max-w-4xl text-h1 text-ink-950">{pageTitle}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-ink-950/65">{pageIntro}</p>
          <p className="mt-6">
            <span className="rounded-full bg-paper-soft px-3 py-1 text-sm font-medium text-ink-700 tabular-nums">
              {rows.length} {surface ? t.lab.journeysSplit.journeysLabel[surface][rows.length === 1 ? 0 : 1] : t.lab.page.results}
            </span>
          </p>
        </div>
      </section>
      <div className="pt-4 pb-16 md:pb-24">
        <div className="altor-container-wide">
          {browser === "gallery" && surface ? (
            <Suspense fallback={<GalleryFallback lang={lang} t={t.lab.page} basePath={basePath} rows={localizedRows} surface={surface} />}>
              <JourneyGallery
                lang={lang}
                t={t.lab.page}
                rows={localizedRows}
                merged={MERGED_REDIRECTS}
                basePath={basePath}
                categories={CATEGORY_META}
                surface={surface}
                presets={surface === "customer-journeys" ? localizedPresets : []}
                emptyChannelLabel={t.lab.journeysSplit.internalBadge}
              />
            </Suspense>
          ) : (
            <Suspense fallback={<JourneyBrowserFallback lang={lang} t={t.lab.page} basePath={basePath} rows={localizedRows} />}>
              <JourneyBrowser
                lang={lang}
                t={t.lab.page}
                rows={localizedRows}
                merged={MERGED_REDIRECTS}
                basePath={basePath}
              />
            </Suspense>
          )}
        </div>
      </div>
    </LabShell>
  );
}
