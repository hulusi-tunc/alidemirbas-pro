"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import type { JourneyRow, MergedRedirect } from "@/lib/canonical-view";
import { GOAL_LABEL, isGoalId, type Goal } from "@/lib/journey-taxonomy";
import type { Lang } from "@/lib/content";

/* The search/goal filter state machine, extracted from JourneyBrowser.tsx
   unchanged (2026-09) so a second list renderer - the grouped card view on
   /lab/journeys/communication - can share it exactly rather than
   reimplementing (and inevitably drifting from) the same URL-sync,
   debounce and merged-id-redirect behavior. JourneyBrowser.tsx itself now
   calls this hook instead of carrying the logic inline; its own rendering
   (the flat row list) is unchanged.

   See the original JourneyBrowser.tsx history for the reasoning behind each
   piece below - it is preserved here verbatim, not re-derived. */
export function useJourneyFilters(
  allRows: readonly JourneyRow[],
  merged: readonly MergedRedirect[],
  lang: Lang,
) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q") ?? "";
  const goalParam = searchParams.get("goal");
  const goal: Goal | null = goalParam && isGoalId(goalParam) ? goalParam : null;

  const [query, setQuery] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setQuery(urlQuery);
  }

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

  const clearAll = () => {
    setQuery("");
    setParams({ q: null, goal: null }, "push");
  };

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

    const hit = merged.find((m) => m.from.toLocaleLowerCase(lang) === q) ?? null;
    const survivor = hit ? allRows.filter((j) => j.id === hit.to) : null;

    return { rows: survivor ?? matched, mergedHit: hit };
  }, [query, goal, lang, allRows, merged, haystack]);

  const activeCount = (goal ? 1 : 0) + (query.trim() ? 1 : 0);
  const isDefaultView = activeCount === 0;

  return { query, setQuery, goal, setGoal, rows, mergedHit, activeCount, isDefaultView, clearAll };
}
