"use client";

import { Search, X } from "lucide-react";

import JourneyRowCard from "@/components/JourneyRowCard";
import type { JourneyRow, MergedRedirect } from "@/lib/canonical-view";
import { GOALS, GOAL_LABEL, type Goal } from "@/lib/journey-taxonomy";
import { CHANNEL_LABEL, sortChannels } from "@/lib/journey-channels";
import { useJourneyFilters } from "@/lib/useJourneyFilters";
import type { copy, Lang } from "@/lib/content";

/* The list. It takes rows as props and imports nothing from the canonical
   library, so the browser downloads one-line rows rather than node graphs;
   a journey's graph arrives on that journey's own route.

   Discovery architecture (post goal-vocabulary-audit): search is the primary
   mechanism, Goal is the single primary taxonomy filter. Category is not a
   filter - it stays canonical metadata, shown on the card and searchable,
   never a second facet to intersect with Goal. This replaces the earlier
   three-checkbox-facet design (Goal multi-select, Lifecycle Stage, Trigger
   Evidence): Lifecycle Stage never fit this corpus (281 independent entity
   state machines, not one customer's timeline, so 85% of it was
   "cross-lifecycle" and answered nothing) and is gone entirely; Trigger
   Evidence stays real canonical metadata but is no longer a visible filter.
   See production/journey-goal-vocabulary-audit for why.

   Filter state lives in the URL (?q=&goal=), read with useSearchParams and
   written with the History API, so it survives a refresh and restores correctly on
   browser back/forward. A Goal change pushes a new history entry (a
   discrete, meaningful state change); the search query is debounced and
   written with replace so a history entry isn't created per keystroke. */

export default function JourneyBrowser({
  lang,
  t,
  rows: allRows,
  merged,
  basePath,
}: {
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
  rows: readonly JourneyRow[];
  merged: readonly MergedRedirect[];
  basePath: string;
}) {
  const { query, setQuery, goal, setGoal, rows, mergedHit, activeCount, clearAll } =
    useJourneyFilters(allRows, merged, lang);

  const removeFilterLabel = (label: string) => t.removeFilterLabel.replace("{label}", label);

  return (
    <div>
      <div className="flex items-center gap-3 border border-line bg-paper px-4 py-2.5 focus-within:border-blue-600">
        <Search aria-hidden className="size-4 shrink-0 text-neutral-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-neutral-500"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={t.clearAll}
            className="shrink-0 text-neutral-400 transition-colors hover:text-ink-700"
          >
            <X aria-hidden className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-3">
        <label className="block">
          <span className="sr-only">{t.goalLabel}</span>
          <select
            value={goal ?? ""}
            onChange={(e) => setGoal(e.target.value ? (e.target.value as Goal) : null)}
            className="w-full border border-line bg-paper px-4 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-blue-600 sm:w-auto"
          >
            <option value="">{t.allGoals}</option>
            {GOALS.map((g) => (
              <option key={g} value={g}>
                {GOAL_LABEL[g][lang]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {goal ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setGoal(null)}
            aria-label={removeFilterLabel(GOAL_LABEL[goal][lang])}
            className="flex items-center gap-1.5 border border-line bg-paper-soft px-2.5 py-1 text-xs font-medium text-ink-700 transition-colors hover:border-neutral-400"
          >
            {GOAL_LABEL[goal][lang]}
            <X aria-hidden className="size-3" />
          </button>
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-500 tabular-nums">
          {rows.length} / {allRows.length} {t.results}
        </p>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            <X aria-hidden className="size-3.5" />
            {t.clearAll}
          </button>
        ) : null}
      </div>

      {mergedHit ? (
        <p className="mt-4 border border-line bg-paper-soft px-4 py-3 text-[13px] leading-snug text-ink-600">
          {t.mergedNote.replace("{from}", mergedHit.from).replace("{to}", mergedHit.to)}
        </p>
      ) : null}

      {rows.length === 0 ? (
        /* A designed dead end, not a bare sentence. The mono count says
           what happened in the page's own meta register, the copy says it
           in prose, and the one action offered is the only one that helps
           from here. Bounded by the same hairlines the rows use, so the
           empty list still reads as the list. */
        <div className="mt-5 border-t border-b border-line py-16 text-center">
          <p className="font-mono text-[11px] tracking-[0.12em] text-ink-400 uppercase tabular-nums">
            0 / {allRows.length}
          </p>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-ink-700">{t.empty}</p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            <X aria-hidden className="size-3.5" />
            {t.clearAll}
          </button>
        </div>
      ) : (
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
      )}
    </div>
  );
}
