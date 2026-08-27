"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import JourneyRowCard from "@/components/JourneyRowCard";
import { CATEGORY_OPTIONS, isCategoryId, type JourneyRow, type MergedRedirect } from "@/lib/canonical-view";
import type { CategoryId } from "@/canonical/types";
import { GOALS, GOAL_LABEL, isGoalId, type Goal } from "@/lib/journey-taxonomy";
import type { copy, Lang } from "@/lib/content";

/* The list. It takes rows as props and imports nothing from the canonical
   library, so the browser downloads one-line rows rather than node graphs;
   a journey's graph arrives on that journey's own route.

   Discovery architecture (post goal-vocabulary-audit): search is the primary
   mechanism, Goal is the single primary taxonomy filter, Category is a
   second, independent filter - both single-select, combined by intersection.
   This replaces the earlier three-checkbox-facet design (Goal multi-select,
   Lifecycle Stage, Trigger Evidence): Lifecycle Stage never fit this corpus
   (255 independent entity state machines, not one customer's timeline, so
   85% of it was "cross-lifecycle" and answered nothing) and is gone
   entirely; Trigger Evidence stays real canonical metadata but is no longer
   a visible filter. See production/journey-goal-vocabulary-audit for why.

   Filter state lives in the URL (?q=&goal=&category=), read with
   useSearchParams and written with useRouter, so it survives a refresh and
   restores correctly on browser back/forward. Goal and Category changes push
   a new history entry each (a discrete, meaningful state change); the search
   query is debounced and written with replace so a history entry isn't
   created per keystroke. */

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q") ?? "";
  const goalParam = searchParams.get("goal");
  const goal: Goal | null = goalParam && isGoalId(goalParam) ? goalParam : null;
  const categoryParam = searchParams.get("category");
  const category: CategoryId | null =
    categoryParam && isCategoryId(categoryParam) ? categoryParam : null;

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

  const setParams = useCallback(
    (updates: Record<string, string | null>, mode: "push" | "replace") => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      const qs = params.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      router[mode](url, { scroll: false });
    },
    [pathname, router, searchParams],
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
  const setCategory = (c: CategoryId | null) => setParams({ category: c }, "push");

  const clearAll = () => {
    setQuery("");
    router.push(pathname, { scroll: false });
  };

  const { rows, mergedHit } = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang);
    const byQuery = (j: JourneyRow) =>
      !q ||
      [j.id, j.name, j.purpose, j.categoryTitle, GOAL_LABEL[j.goal][lang]]
        .join(" ")
        .toLocaleLowerCase(lang)
        .includes(q);
    const byGoal = (j: JourneyRow) => goal === null || j.goal === goal;
    const byCategory = (j: JourneyRow) => category === null || j.category === category;

    const matched = allRows.filter((j) => byQuery(j) && byGoal(j) && byCategory(j));

    /* A merged id is not a journey and matches nothing, which would leave
       someone holding an old reference at a dead end. Answer with the journey
       that absorbed it instead, and say which id they typed. */
    const hit = merged.find((m) => m.from.toLocaleLowerCase(lang) === q) ?? null;
    const survivor = hit ? allRows.filter((j) => j.id === hit.to) : null;

    return { rows: survivor ?? matched, mergedHit: hit };
  }, [query, goal, category, lang, allRows, merged]);

  const activeCount = (goal ? 1 : 0) + (category ? 1 : 0) + (query.trim() ? 1 : 0);

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

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="sr-only">{t.goalLabel}</span>
          <select
            value={goal ?? ""}
            onChange={(e) => setGoal(e.target.value ? (e.target.value as Goal) : null)}
            className="w-full border border-line bg-paper px-4 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-blue-600"
          >
            <option value="">{t.allGoals}</option>
            {GOALS.map((g) => (
              <option key={g} value={g}>
                {GOAL_LABEL[g][lang]}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="sr-only">{t.categoryLabel}</span>
          <select
            value={category ?? ""}
            onChange={(e) => setCategory(e.target.value ? (e.target.value as CategoryId) : null)}
            className="w-full border border-line bg-paper px-4 py-2.5 text-sm text-ink-900 outline-none transition-colors focus:border-blue-600"
          >
            <option value="">{t.allCategories}</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>
      </div>

      {goal || category ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {goal ? (
            <button
              type="button"
              onClick={() => setGoal(null)}
              aria-label={removeFilterLabel(GOAL_LABEL[goal][lang])}
              className="flex items-center gap-1.5 border border-line bg-paper-soft px-2.5 py-1 text-xs font-medium text-ink-700 transition-colors hover:border-neutral-400"
            >
              {GOAL_LABEL[goal][lang]}
              <X aria-hidden className="size-3" />
            </button>
          ) : null}
          {category ? (
            <button
              type="button"
              onClick={() => setCategory(null)}
              aria-label={removeFilterLabel(
                CATEGORY_OPTIONS.find((c) => c.id === category)?.title ?? category,
              )}
              className="flex items-center gap-1.5 border border-line bg-paper-soft px-2.5 py-1 text-xs font-medium text-ink-700 transition-colors hover:border-neutral-400"
            >
              {CATEGORY_OPTIONS.find((c) => c.id === category)?.title ?? category}
              <X aria-hidden className="size-3" />
            </button>
          ) : null}
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
        <div className="mt-4">
          {rows.map((j) => (
            <JourneyRowCard
              key={j.id}
              href={`${basePath}/${j.slug}`}
              id={j.id}
              name={j.name}
              goalLabel={GOAL_LABEL[j.goal][lang]}
              categoryTitle={j.categoryTitle}
              competesIn={j.competesIn}
              nodeCount={j.nodeCount}
              nodesLabel={t.nodesLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
