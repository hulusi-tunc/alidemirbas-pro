import JourneyBrowser from "@/components/JourneyBrowser";
import LabShell from "@/components/LabShell";
import {
  JOURNEY_ROWS,
  MERGED_REDIRECTS,
  withCanonicalCount,
} from "@/lib/canonical-view";
import { copy, type Lang } from "@/lib/content";

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
        {/* wider than the header block: the facet sidebar takes 15rem out of
            the row, and the list still needs room for title plus badges */}
        <div className="mx-auto max-w-6xl">
          <JourneyBrowser
            lang={lang}
            t={t.lab.page}
            rows={JOURNEY_ROWS}
            merged={MERGED_REDIRECTS}
            basePath={basePath}
          />
        </div>
      </div>
    </LabShell>
  );
}
