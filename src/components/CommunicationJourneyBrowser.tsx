"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import JourneyIdeaCard from "@/components/ui/JourneyIdeaCard";
import type { JourneyRow, MergedRedirect } from "@/lib/canonical-view";
import { GOALS, GOAL_LABEL, type Goal } from "@/lib/journey-taxonomy";
import { CHANNEL_LABEL, sortChannels } from "@/lib/journey-channels";
import { useJourneyFilters } from "@/lib/useJourneyFilters";
import { copy, type Lang } from "@/lib/content";

/* The communication-journey list, grouped by Goal - the one place on the
   site that groups rather than lists (see JourneyBrowser.tsx/
   JourneyRowCard.tsx for the flat 281-journey library's own, deliberately
   different, "a row not a card" decision, which this does not touch).

   MECHANISM SOURCE: Klaviyo's "Flows / Browse Ideas" screen (2026-09
   review) groups its curated flow templates under outcome sections
   ("Prevent lost sales", "Nurture subscribers", ...) rather than one flat
   list - each section a real named use-case, not an arbitrary bucket.
   Goal (journey-taxonomy.ts) is this library's own equivalent real
   taxonomy - "the single primary discovery filter", already computed on
   every CanonicalJourney via a full semantic audit, not invented for this
   page - so grouping by it here is reusing an existing real field for a
   new purpose, not adding one.

   Groups only render in the DEFAULT view (no search, no goal filter) -
   the moment either is active, "which Goal each result belongs to" stops
   being the point and a flat grid of just the matches takes over, same
   split BlogLibrary.tsx uses for its own featured-vs-filtered views. */

const GROUP_PREVIEW_COUNT = 6;

function GoalGroupSection({
  goal,
  items,
  lang,
  t,
  basePath,
}: {
  goal: Goal;
  items: readonly JourneyRow[];
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
  basePath: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, GROUP_PREVIEW_COUNT);
  const remaining = items.length - visible.length;
  const tSplit = copy[lang].lab.journeysSplit;

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-[15px] font-semibold tracking-tight text-ink-950">{GOAL_LABEL[goal][lang]}</h2>
        <span className="shrink-0 font-mono text-xs text-ink-400 tabular-nums">
          {items.length} {tSplit.journeysLabel[items.length === 1 ? 0 : 1]}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((j) => (
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
      {remaining > 0 || expanded ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          {expanded ? tSplit.showLess : tSplit.showMore.replace("{count}", String(remaining))}
        </button>
      ) : null}
    </section>
  );
}

export default function CommunicationJourneyBrowser({
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
  const { query, setQuery, goal, setGoal, rows, mergedHit, activeCount, isDefaultView, clearAll } =
    useJourneyFilters(allRows, merged, lang);

  /* Biggest group first, alphabetical (GOALS' own order) as the tie-break.
     NOT alphabetical throughout, which is what the goal `<select>` above
     deliberately is: a dropdown is scanned for a name you already have in
     mind, so alphabetical is right there. This is a page you scroll, and
     grouping 87 journeys by Goal produces a real long tail - 8 groups of
     5-10, then 5 groups of exactly one. Alphabetical order interleaves
     those, so the page opened on a one-card section with two empty grid
     columns beside it. Size-descending puts the substantial sections
     first and lets the tail be a tail. */
  const groups = useMemo(() => {
    if (!isDefaultView) return [];
    const byGoal = new Map<Goal, JourneyRow[]>();
    for (const j of allRows) {
      const arr = byGoal.get(j.goal) ?? [];
      arr.push(j);
      byGoal.set(j.goal, arr);
    }
    return GOALS.filter((g) => byGoal.has(g))
      .map((g) => ({ goal: g, items: byGoal.get(g)! }))
      .sort((a, b) => b.items.length - a.items.length);
  }, [allRows, isDefaultView]);

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

      {!isDefaultView ? (
        <p className="mt-5 text-sm text-ink-500 tabular-nums">{rows.length} / {allRows.length} {t.results}</p>
      ) : null}
      {activeCount > 0 ? (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            <X aria-hidden className="size-3.5" />
            {t.clearAll}
          </button>
        </div>
      ) : null}

      {mergedHit ? (
        <p className="mt-4 border border-line bg-paper-soft px-4 py-3 text-[13px] leading-snug text-ink-600">
          {t.mergedNote.replace("{from}", mergedHit.from).replace("{to}", mergedHit.to)}
        </p>
      ) : null}

      {isDefaultView ? (
        <div className="mt-8 flex flex-col gap-10">
          {groups.map((group) => (
            <GoalGroupSection key={group.goal} goal={group.goal} items={group.items} lang={lang} t={t} basePath={basePath} />
          ))}
        </div>
      ) : rows.length === 0 ? (
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
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((j) => (
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
      )}
    </div>
  );
}
