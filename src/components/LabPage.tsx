import { Suspense } from "react";
import { Search } from "lucide-react";

import JourneyBrowser from "@/components/JourneyBrowser";
import JourneyGallery from "@/components/JourneyGallery";
import JourneyRowCard from "@/components/JourneyRowCard";
import JourneyIdeaCard from "@/components/ui/JourneyIdeaCard";
import LabShell from "@/components/LabShell";
import {
  CATEGORY_META,
  JOURNEY_ROWS,
  MERGED_REDIRECTS,
  withCanonicalCount,
  type JourneyRow,
} from "@/lib/canonical-view";
import { GOAL_LABEL } from "@/lib/journey-taxonomy";
import { CHANNEL_LABEL, sortChannels } from "@/lib/journey-channels";
import { copy, type Lang } from "@/lib/content";
import { breadcrumbList, type BreadcrumbItem } from "@/lib/schema";
import { JsonLdScript } from "@/components/ui/JsonLdScript";

/* JourneyBrowser reads filter state via useSearchParams, which forces its
   subtree to client-render during prerendering (Next's own documented
   behavior for that hook - see next/dist/docs/.../use-search-params.md).
   Without a fallback, that would mean the 255-journey list is absent from
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
            href={`${basePath}/${j.slug}`}
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
function GalleryFallback({ lang, t, basePath, rows }: {
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
  basePath: string;
  rows: readonly JourneyRow[];
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
      <div className="flex items-center gap-3 border border-line bg-paper px-4 py-2.5 opacity-60">
        <Search aria-hidden className="size-4 shrink-0 text-neutral-500" />
        <span className="text-sm text-neutral-500">{t.searchPlaceholder}</span>
      </div>
      <div className="mt-8 flex flex-col gap-12">
        {sections.map(({ meta, items }) => (
          <section key={meta.id}>
            <div className="flex items-start gap-3">
              <span
                aria-hidden
                className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-paper-soft font-mono text-[10px] font-semibold tracking-tight text-ink-500"
              >
                {items[0]?.id.split("-")[0] ?? ""}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="text-base font-semibold tracking-tight text-ink-950">{meta.title}</h2>
                  <span className="shrink-0 font-mono text-xs text-ink-400 tabular-nums">
                    {items.length} {labels.journeysLabel[items.length === 1 ? 0 : 1]}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 max-w-3xl text-sm leading-relaxed text-ink-500">{meta.purpose}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {items.map((j) => (
                <JourneyIdeaCard
                  key={j.id}
                  href={`${basePath}/${j.slug}`}
                  id={j.id}
                  title={j.shortName ?? j.name}
                  categoryTitle={j.categoryTitle}
                  purpose={j.purpose}
                  nodeCount={j.nodeCount}
                  nodesLabel={t.nodesLabel}
                  channelLabels={sortChannels(j.channels).map((c) => CHANNEL_LABEL[c][lang])}
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
  journeyType,
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
  /** Which half a gallery page is showing. Required by "gallery"; the
      gallery uses it for the type switch, which is a link to the other
      route rather than a dropdown. */
  journeyType?: "communication" | "internal";
}) {
  const t = copy[lang];
  const basePath = lang === "en" ? "/lab/journeys" : "/tr/lab/journeys";
  const pageTitle = title ?? t.lab.page.title;
  const pageIntro =
    intro ?? withCanonicalCount(t.lab.page.intro);
  const crumbs: BreadcrumbItem[] = [
    { name: t.footer.home, url: lang === "en" ? "/" : "/tr" },
    { name: t.nav.lab, url: lang === "en" ? "/lab" : "/tr/lab" },
    { name: t.lab.page.title, url: basePath },
  ];
  if (extraCrumb) crumbs.push(extraCrumb);
  const breadcrumb = breadcrumbList(crumbs);

  return (
    <LabShell lang={lang}>
      <JsonLdScript data={breadcrumb} />
      <div className="border-b border-line px-4 py-6 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-ink-950">{pageTitle}</h1>
            <span className="border border-line bg-paper-soft px-2 py-0.5 text-xs font-medium text-neutral-600">
              {rows.length} {t.lab.page.results}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">{pageIntro}</p>
        </div>
      </div>
      <div className="px-4 py-6 md:px-8">
        {/* Wider than the header block: three card columns need the room, and
            the grid is the page - everything above it stays secondary. */}
        <div className="mx-auto max-w-6xl">
          {browser === "gallery" && journeyType ? (
            <Suspense fallback={<GalleryFallback lang={lang} t={t.lab.page} basePath={basePath} rows={rows} />}>
              <JourneyGallery
                lang={lang}
                t={t.lab.page}
                rows={rows}
                merged={MERGED_REDIRECTS}
                basePath={basePath}
                categories={CATEGORY_META}
                journeyType={journeyType}
                siblingHref={
                  journeyType === "communication"
                    ? lang === "en" ? "/lab/internal-journeys" : "/tr/lab/internal-journeys"
                    : lang === "en" ? "/lab/communication-journeys" : "/tr/lab/communication-journeys"
                }
              />
            </Suspense>
          ) : (
            <Suspense fallback={<JourneyBrowserFallback lang={lang} t={t.lab.page} basePath={basePath} rows={rows} />}>
              <JourneyBrowser
                lang={lang}
                t={t.lab.page}
                rows={rows}
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
