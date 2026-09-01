import { Suspense } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import JourneyBrowser from "@/components/JourneyBrowser";
import CommunicationJourneyBrowser from "@/components/CommunicationJourneyBrowser";
import JourneyRowCard from "@/components/JourneyRowCard";
import JourneyIdeaCard from "@/components/ui/JourneyIdeaCard";
import LabShell from "@/components/LabShell";
import {
  COMMUNICATION_JOURNEY_ROWS,
  INTERNAL_JOURNEY_ROWS,
  JOURNEY_ROWS,
  MERGED_REDIRECTS,
  withCanonicalCount,
  type JourneyRow,
} from "@/lib/canonical-view";
import { GOALS, GOAL_LABEL, type Goal } from "@/lib/journey-taxonomy";
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

/* The grouped (by Goal) fallback for /lab/journeys/communication - mirrors
   JourneyBrowserFallback's role (CommunicationJourneyBrowser also calls
   useJourneyFilters, which reads useSearchParams and so forces the same
   client-render-during-prerender behavior) but renders every group's cards
   in full rather than reproducing the client component's own "show more"
   truncation - there is no interactivity to truncate FOR before hydration,
   so showing everything is the honest inert state, not a smaller one. */
function CommunicationBrowserFallback({ lang, t, basePath, rows }: {
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
  basePath: string;
  rows: readonly JourneyRow[];
}) {
  const byGoal = new Map<Goal, JourneyRow[]>();
  for (const j of rows) {
    const arr = byGoal.get(j.goal) ?? [];
    arr.push(j);
    byGoal.set(j.goal, arr);
  }
  // Same size-descending order as the client component - see its own
  // comment for why; the two must agree or the list visibly reorders on
  // hydration.
  const groups = GOALS.filter((g) => byGoal.has(g))
    .map((g) => ({ goal: g, items: byGoal.get(g)! }))
    .sort((a, b) => b.items.length - a.items.length);

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
      <div className="mt-8 flex flex-col gap-10">
        {groups.map((group) => (
          <section key={group.goal}>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-[15px] font-semibold tracking-tight text-ink-950">{GOAL_LABEL[group.goal][lang]}</h2>
              <span className="shrink-0 font-mono text-xs text-ink-400 tabular-nums">
                {group.items.length}{" "}
                {copy[lang].lab.journeysSplit.journeysLabel[group.items.length === 1 ? 0 : 1]}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((j) => (
                <JourneyIdeaCard
                  key={j.id}
                  href={`${basePath}/${j.slug}`}
                  id={j.id}
                  name={j.name}
                  categoryTitle={j.categoryTitle}
                  purpose={j.purpose}
                  nodeCount={j.nodeCount}
                  nodesLabel={t.nodesLabel}
                  channelLabels={sortChannels(j.channels).map((c) => CHANNEL_LABEL[c][lang])}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/** One row of the hub split link block - real counts, computed from the same
    rows the two child pages themselves list from, never restated by hand. */
function SplitLink({ href, label, count, nodesLabel }: { href: string; label: string; count: number; nodesLabel: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 border border-line bg-paper px-4 py-3 text-sm transition-colors hover:border-neutral-400 hover:bg-paper-soft"
    >
      <span className="font-medium text-ink-900">{label}</span>
      <span className="font-mono text-xs text-ink-500 tabular-nums">
        {count} {nodesLabel}
      </span>
    </Link>
  );
}

/* The archive list. A server component: it reads the canonical library here
   and hands the browser rows, not node graphs. The detail of any one journey
   arrives on its own route.

   Used to also carry a "Tools" sidebar linking to the other Lab projects, but
   that's redundant now that /lab is its own landing page people arrive from -
   re-add it (see git history before this comment) if that stops being true.

   PARAMETRIZED (2026-09) for the two child list pages under this same route
   - /lab/journeys/communication and /lab/journeys/internal - which reuse
   this exact component with a filtered `rows` set and their own
   title/intro, rather than a forked copy of the whole page. `rows`/`title`/
   `intro` default to the full unified library, so the existing
   `/lab/journeys` route (still this page's default call) is unchanged.
   `showSplitLinks` renders the two child pages' entry point ONLY on the
   parent/unfiltered view - the split pages themselves don't link back to
   siblings they're not showing. */
export default function LabPage({
  lang,
  rows = JOURNEY_ROWS,
  title,
  intro,
  extraCrumb,
  showSplitLinks = false,
  browser = "flat",
}: {
  lang: Lang;
  rows?: readonly JourneyRow[];
  title?: string;
  intro?: string;
  extraCrumb?: { name: string; url: string };
  showSplitLinks?: boolean;
  /** "grouped" renders CommunicationJourneyBrowser (cards grouped by Goal,
      see that file's own comment) instead of the flat JourneyBrowser row
      list - used only by /lab/journeys/communication today. */
  browser?: "flat" | "grouped";
}) {
  const t = copy[lang];
  const basePath = lang === "en" ? "/lab/journeys" : "/tr/lab/journeys";
  const pageTitle = title ?? t.lab.page.title;
  const pageIntro = intro ?? withCanonicalCount(t.lab.page.intro);
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
          {showSplitLinks ? (
            <div className="mt-5 grid max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2">
              <SplitLink
                href={`${basePath}/communication`}
                label={t.lab.journeysSplit.communicationLabel}
                count={COMMUNICATION_JOURNEY_ROWS.length}
                nodesLabel={t.lab.page.results}
              />
              <SplitLink
                href={`${basePath}/internal`}
                label={t.lab.journeysSplit.internalLabel}
                count={INTERNAL_JOURNEY_ROWS.length}
                nodesLabel={t.lab.page.results}
              />
            </div>
          ) : null}
        </div>
      </div>
      <div className="px-4 py-6 md:px-8">
        {/* Wider than the header block: three card columns need the room, and
            the grid is the page - everything above it stays secondary. */}
        <div className="mx-auto max-w-6xl">
          {browser === "grouped" ? (
            <Suspense fallback={<CommunicationBrowserFallback lang={lang} t={t.lab.page} basePath={basePath} rows={rows} />}>
              <CommunicationJourneyBrowser
                lang={lang}
                t={t.lab.page}
                rows={rows}
                merged={MERGED_REDIRECTS}
                basePath={basePath}
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
