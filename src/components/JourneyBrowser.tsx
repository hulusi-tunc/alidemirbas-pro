"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import JourneyRowCard from "@/components/JourneyRowCard";
import type { JourneyRow, MergedRedirect } from "@/lib/canonical-view";
import { GOALS, GOAL_LABEL, isGoalId, type Goal } from "@/lib/journey-taxonomy";
import { CHANNEL_LABEL, sortChannels } from "@/lib/journey-channels";
import type { copy, Lang } from "@/lib/content";

/* The list. It takes rows as props and imports nothing from the canonical
   library, so the browser downloads one-line rows rather than node graphs;
   a journey's graph arrives on that journey's own route.

   Discovery architecture (post goal-vocabulary-audit): search is the primary
   mechanism, Goal is the single primary taxonomy filter. Category is not a
   filter - it stays canonical metadata, shown on the card and searchable,
   never a second facet to intersect with Goal. This replaces the earlier
   three-checkbox-facet design (Goal multi-select, Lifecycle Stage, Trigger
   Evidence): Lifecycle Stage never fit this corpus (255 independent entity
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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q") ?? "";
  const goalParam = searchParams.get("goal");
  const goal: Goal | null = goalParam && isGoalId(goalParam) ? goalParam : null;

  // The search box is buffered locally so typing feels instant and doesn't
  // wait on a router round-trip; it stays in sync with the URL in both
  // directions (browser back/forward changes urlQuery, which flows back in).
  // Adjusted during render rather than in an effect - the documented React
  // pattern for resetting local state when a derived value changes, since
  // doing it in an effect would cause an extra, avoidable render.
  const [query, setQuery] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setQuery(urlQuery);
  }

  /* The one place filter state is written to the URL.

     Uses the native History API rather than `router.push`/`replace`, which is
     what Next documents for query-string-only updates (see next/dist/docs/
     .../linking-and-navigating.md § Native History API: pushState and
     replaceState "integrate into the Next.js Router, allowing you to sync
     with usePathname and useSearchParams"). It is not a preference: on this
     route `router.push` to a URL that differs from the current one only in
     its query string is coalesced away and emits no navigation at all, so
     clearing the last filter left the old query in the address bar while the
     list below it had already reset. pushState has no such dedupe, and still
     produces a real history entry for back/forward.

     It also reads the LIVE query string rather than the `searchParams`
     captured when this callback was created: the debounced search write
     below fires up to 400ms after its own render, and anything that changed
     the URL in between - picking a Goal, or Clear all - would otherwise be
     undone by that stale snapshot being written back. Only ever called from
     an event handler or a timeout, never during render, so `window` is
     always available here. */
  const setParams = useCallback(
    (updates: Record<string, string | null>, mode: "push" | "replace") => {
      const params = new URLSearchParams(window.location.search);
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      if (mode === "push") window.history.pushState(null, "", url);
      else window.history.replaceState(null, "", url);
    },
    [pathname],
  );

  // Debounced URL sync for the search box - replace, so a paused-then-resumed
  // typing session doesn't spam browser history with one entry per pause.
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim() !== urlQuery.trim()) {
        setParams({ q: query.trim() || null }, "replace");
      }
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const setGoal = (g: Goal | null) => setParams({ goal: g }, "push");

  /* Names the params to drop rather than resetting to a bare pathname, so
     this stays honest if another one is ever added. */
  const clearAll = () => {
    setQuery("");
    setParams({ q: null, goal: null }, "push");
  };

  /* The searchable text per row, lowercased once for the whole list rather
     than rebuilt on every keystroke - concatenating and case-folding five
     fields across 255 rows per character typed is real work, and none of it
     depends on the query. Category and Category Title stay in here: Category
     is no longer a filter, but it is still something people search by. */
  const haystack = useMemo(
    () =>
      allRows.map((j) =>
        [j.id, j.name, j.purpose, j.category, j.categoryTitle, GOAL_LABEL[j.goal][lang]]
          .join(" ")
          .toLocaleLowerCase(lang),
      ),
    [allRows, lang],
  );

  const { rows, mergedHit } = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang);
    const byGoal = (j: JourneyRow) => goal === null || j.goal === goal;

    const matched = allRows.filter(
      (j, i) => (!q || haystack[i].includes(q)) && byGoal(j),
    );

    /* A merged id is not a journey and matches nothing, which would leave
       someone holding an old reference at a dead end. Answer with the journey
       that absorbed it instead, and say which id they typed. */
    const hit = merged.find((m) => m.from.toLocaleLowerCase(lang) === q) ?? null;
    const survivor = hit ? allRows.filter((j) => j.id === hit.to) : null;

    return { rows: survivor ?? matched, mergedHit: hit };
  }, [query, goal, lang, allRows, merged, haystack]);

  const activeCount = (goal ? 1 : 0) + (query.trim() ? 1 : 0);

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
        <p className="py-16 text-center text-sm text-neutral-500">{t.empty}</p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
