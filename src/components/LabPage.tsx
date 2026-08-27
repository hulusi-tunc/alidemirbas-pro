import { Suspense } from "react";
import { Search } from "lucide-react";

import JourneyBrowser from "@/components/JourneyBrowser";
import JourneyRowCard from "@/components/JourneyRowCard";
import LabShell from "@/components/LabShell";
import {
  JOURNEY_ROWS,
  MERGED_REDIRECTS,
  withCanonicalCount,
} from "@/lib/canonical-view";
import { GOAL_LABEL } from "@/lib/journey-taxonomy";
import { copy, type Lang } from "@/lib/content";

/* JourneyBrowser reads filter state via useSearchParams, which forces its
   subtree to client-render during prerendering (Next's own documented
   behavior for that hook - see next/dist/docs/.../use-search-params.md).
   Without a fallback, that would mean the 255-journey list is absent from
   the initial HTML until hydration. This fallback is the same list,
   unfiltered, rendered as a plain server component with an inert copy of the
   toolbar above it, so search engines and no-JS clients still see the full
   library immediately; JourneyBrowser replaces it once the client mounts. */
function JourneyBrowserFallback({ lang, t, basePath }: {
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
  basePath: string;
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
        {JOURNEY_ROWS.length} / {JOURNEY_ROWS.length} {t.results}
      </p>
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {JOURNEY_ROWS.map((j) => (
          <JourneyRowCard
            key={j.id}
            href={`${basePath}/${j.slug}`}
            id={j.id}
            name={j.name}
            goalLabel={GOAL_LABEL[j.goal][lang]}
            categoryTitle={j.categoryTitle}
            nodeCount={j.nodeCount}
            nodesLabel={t.nodesLabel}
            preview={j.preview}
          />
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
   re-add it (see git history before this comment) if that stops being true. */

export default function LabPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const basePath = lang === "en" ? "/lab/journeys" : "/tr/lab/journeys";

  return (
    <LabShell lang={lang}>
      <div className="border-b border-line px-4 py-6 md:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-ink-950">{t.lab.page.title}</h1>
            <span className="border border-line bg-paper-soft px-2 py-0.5 text-xs font-medium text-neutral-600">
              {JOURNEY_ROWS.length} {t.lab.page.results}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-500">
            {withCanonicalCount(t.lab.page.intro)}
          </p>
        </div>
      </div>
      <div className="px-4 py-6 md:px-8">
        {/* Wider than the header block: three card columns need the room, and
            the grid is the page - everything above it stays secondary. */}
        <div className="mx-auto max-w-6xl">
          <Suspense fallback={<JourneyBrowserFallback lang={lang} t={t.lab.page} basePath={basePath} />}>
            <JourneyBrowser
              lang={lang}
              t={t.lab.page}
              rows={JOURNEY_ROWS}
              merged={MERGED_REDIRECTS}
              basePath={basePath}
            />
          </Suspense>
        </div>
      </div>
    </LabShell>
  );
}
