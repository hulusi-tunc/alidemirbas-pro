"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import JourneyIdeaCard from "@/components/ui/JourneyIdeaCard";
import { Button } from "@/components/ui/Button";
import { ALL_CHANNELS_ICON, ALL_GOALS_ICON, CategoryHeader, CategoryIcon, CategoryRail, ChannelIcon, GoalIcon, SEARCH_SHELL, TOOLBAR_ROW, categoryAccent, shortCategoryTitle } from "@/components/ui/LibraryChrome";
import { PUBLIC_JOURNEY_CATEGORIES, publicJourneyCategoryLabel } from "@/lib/journey-public-categories";
import { FilterMenu } from "@/components/ui/FilterMenu";
import { clsx } from "@/lib/clsx";
import { isHumanRoutingRow, type CategoryMeta, type JourneyRow, type MergedRedirect, type PresetRow, type SurfaceKey } from "@/lib/canonical-view";
import { GOAL_LABEL } from "@/lib/journey-taxonomy";
import { CHANNELS, CHANNEL_LABEL, sortChannels } from "@/lib/journey-channels";
import { useJourneyFilters } from "@/lib/useJourneyFilters";
import { copy, type Lang } from "@/lib/content";
import type { ChannelId } from "@/canonical/types";

/* The journey library as a browsable gallery: category sections, each with
   the category's own title and purpose, over a responsive grid of cards.

   MECHANISM SOURCE: Klaviyo's "Flows / Browse Ideas" screen. What crossed
   over is its structure - a section heading with one supporting sentence
   over a card grid, "Show more (N)" instead of an exhausting wall, filters
   above the whole thing. What did not: its brand styling, its platform
   badges, its personalized carousel, and its template variants.

   Sections are CATEGORY, not Goal. The flat library's own Goal filter is
   still here as a control, because Goal remains this library's audited
   primary discovery filter - but "what domain is this" is what a browsing
   reader groups by, and every category carries a real `purpose` sentence to
   head its section with, which Goal does not.

   Grouping only survives the DEFAULT view. The moment a search or any
   filter is active, which category a result sits in stops being the point
   and a flat grid of matches takes over - the same default-vs-filtered
   split BlogLibrary.tsx uses. */

const SECTION_PREVIEW_COUNT = 6;

/* The customer-journey library has 26 canonical categories, but showing
   all 26 as first-level navigation makes the rail harder to scan than the
   content itself. Keep the canonical taxonomy untouched and group only the
   browse/navigation layer into seven practitioner-friendly buckets. The
   original category headers and card metadata still render below. */



function CategorySection({
  meta,
  items,
  lang,
  t,
  basePath,
  labels,
  surface,
  emptyChannelLabel,
  humanRoutingLabel,
  trackInRail = true,
}: {
  meta: CategoryMeta;
  items: readonly JourneyRow[];
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
  basePath: string;
  labels: (typeof copy)[Lang]["lab"]["journeysSplit"];
  /** Which surface these cards belong to - picks the right noun
      ("journey"/"journeys" vs "durum"/"mekanizma") out of
      `labels.journeysLabel`, which is keyed per surface. */
  surface: SurfaceKey;
  emptyChannelLabel: string;
  /** Customer Journeys surface only - the badge for the 3 journeys that
      reach a customer by routing to a person rather than by message
      (isHumanRoutingRow). Undefined on every other surface. */
  humanRoutingLabel?: string;
  /** False when several canonical categories sit inside one grouped rail item. */
  trackInRail?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, SECTION_PREVIEW_COUNT);
  const remaining = items.length - visible.length;

  return (
    <section id={`cat-${meta.id}`} data-cat={trackInRail ? meta.id : undefined} className="scroll-mt-24">
      {/* The visual marker is the category's own id prefix, which is real
          addressable data (every journey in here is ACQ-nn, RET-nn, ...)
          rather than an icon invented for 26 categories nobody could
          verify the meaning of. */}
      <CategoryHeader
        id={meta.id}
        code={items[0]?.id.split("-")[0] ?? ""}
        title={lang === "en" ? meta.title : meta.titleTr}
        count={items.length}
        countLabel={labels.journeysLabel[surface][items.length === 1 ? 0 : 1]}
        purpose={lang === "en" ? meta.purpose : meta.descriptionTr}
      />

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((j) => (
          <JourneyIdeaCard
            key={j.id}
            href={`${basePath}/${j.slug}`}
            id={j.id}
            lang={lang}
            title={j.shortName ?? j.name}
            category={j.category}
            categoryTitle={j.categoryTitle}
            purpose={j.purpose}
            nodeCount={j.nodeCount}
            nodesLabel={t.nodesLabel}
            channels={sortChannels(j.channels)}
            internalLabel={emptyChannelLabel}
            typeLabel={humanRoutingLabel && isHumanRoutingRow(j) ? humanRoutingLabel : undefined}
          />
        ))}
      </div>

      {remaining > 0 || expanded ? (
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => setExpanded((v) => !v)}>
          {expanded ? labels.showLess : labels.showMore.replace("{count}", String(remaining))}
        </Button>
      ) : null}
    </section>
  );
}

export default function JourneyGallery({
  lang,
  t,
  rows: allRows,
  merged,
  basePath,
  categories,
  surface,
  presets = [],
  emptyChannelLabel,
}: {
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
  rows: readonly JourneyRow[];
  merged: readonly MergedRedirect[];
  basePath: string;
  categories: readonly CategoryMeta[];
  /** The public Customer Journey surface. */
  surface: SurfaceKey;
  /** Practitioner presets, shown first on the customer surface: the
      recognisable use cases a practitioner searches by name. */
  presets?: readonly PresetRow[];
  /** What a card says where a journey has no channels - a statement about
      what it is on this surface, never a missing value. */
  emptyChannelLabel: string;
}) {
  const { query, setQuery, goal, setGoal, rows, mergedHit, activeCount, isDefaultView, clearAll } =
    useJourneyFilters(allRows, merged, lang);

  const labels = copy[lang].lab.journeysSplit;
  // No category filter here: the category rail is the way to a category,
  // and a select over 23 long titles was a second, worse one (Hulusi,
  // 2026-09-14).
  const [channel, setChannel] = useState<string>("");
  /* The Operations surface used to swap Goal for its own coarser Type
     filter here (archive/operational-workflows/taxonomy/). That surface is
     archived, so every remaining surface filters by Goal. */

  // Only offer a filter value that some real row on this page actually has.
  const presentChannels = useMemo(() => {
    const present = new Set(allRows.flatMap((j) => j.channels));
    return CHANNELS.filter((c) => present.has(c));
  }, [allRows]);
  const localFiltered = useMemo(
    () =>
      rows.filter((j) => !channel || j.channels.includes(channel as ChannelId)),
    [rows, channel],
  );

  const isDefault = isDefaultView && !channel;
  const totalActive = activeCount + (channel ? 1 : 0);

  const sections = useMemo(() => {
    if (!isDefault) return [];
    const byCat = new Map<string, JourneyRow[]>();
    for (const j of allRows) {
      const arr = byCat.get(j.category) ?? [];
      arr.push(j);
      byCat.set(j.category, arr);
    }
    return categories
      .filter((c) => byCat.has(c.id))
      .map((c) => ({ meta: c, items: byCat.get(c.id)! }));
  }, [allRows, categories, isDefault]);

  const customerGroups = useMemo(() => {
    if (surface !== "customer-journeys" || !isDefault) return [];
    const rowById = new Map(allRows.map((row) => [row.id, row]));
    return PUBLIC_JOURNEY_CATEGORIES.map((group) => {
      const items = group.journeyIds
        .map((id) => rowById.get(id))
        .filter((row): row is JourneyRow => Boolean(row));
      return {
        id: group.id,
        label: group.label[lang],
        description: group.description[lang],
        iconCategory: group.iconCategory,
        items,
        count: items.length,
      };
    }).filter((group) => group.items.length > 0);
  }, [surface, isDefault, allRows, lang]);

  // Presets answer to their own names and aliases; a category or channel
  // filter does not apply to them (they are cards over a parent, not rows).
  const matchingPresets: readonly PresetRow[] = [];

  const clearEverything = () => {
    setChannel("");
    clearAll();
  };

  // Which section sits under the reading line - the last one whose top has
  // passed it. Read on a frame, written only when it changes.
  const [activeCat, setActiveCat] = useState<string>("");
  useEffect(() => {
    if (!isDefault) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-cat]"));
    if (!els.length) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = 128;
      let best = els[0].dataset.cat ?? "";
      for (const el of els) if (el.getBoundingClientRect().top <= line) best = el.dataset.cat ?? best;
      setActiveCat(best);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isDefault, sections]);

  // Customer Journeys only - see isHumanRoutingRow.
  const humanRoutingLabel = surface === "customer-journeys" ? labels.humanRoutingBadge : undefined;

  return (
    <div>
      <div className={TOOLBAR_ROW}>
      <div className={`${SEARCH_SHELL} min-w-0 lg:flex-1`}>
        <Search aria-hidden className="size-4 shrink-0 text-ink-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-500"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label={t.clearAll}
            className="shrink-0 text-ink-500 transition-colors duration-[var(--duration-fast)] hover:text-ink-950"
          >
            <X aria-hidden className="size-4" />
          </button>
        ) : null}
      </div>

        {presentChannels.length > 0 ? (
          <FilterMenu
            label={labels.channelFilterLabel}
            all={{ label: labels.allChannels, icon: ALL_CHANNELS_ICON }}
            options={presentChannels.map((c) => ({ id: c, label: CHANNEL_LABEL[c][lang], icon: <ChannelIcon id={c} className="size-4" /> }))}
            value={channel}
            onChange={setChannel}
            align="end"
          />
        ) : null}
        <FilterMenu
          label={t.goalLabel}
          all={{ label: t.allGoals, icon: ALL_GOALS_ICON }}
          options={[...new Set(allRows.map((j) => j.goal))]
            .sort((a, b) => GOAL_LABEL[a][lang].localeCompare(GOAL_LABEL[b][lang], lang))
            .map((g) => ({ id: g, label: GOAL_LABEL[g][lang], icon: <GoalIcon id={g} /> }))}
          value={goal ?? ""}
          onChange={(id) => setGoal(id ? (id as typeof goal) : null)}
          align="end"
        />
      </div>

      {!isDefault ? (
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-500 tabular-nums">
            {localFiltered.length} / {allRows.length} {t.results}
          </p>
          {totalActive > 0 ? (
            <button
              type="button"
              onClick={clearEverything}
              className="flex items-center gap-1.5 text-sm font-medium text-primary-600 transition-colors duration-[var(--duration-fast)] hover:text-primary-700"
            >
              <X aria-hidden className="size-3.5" />
              {t.clearAll}
            </button>
          ) : null}
        </div>
      ) : null}

      {mergedHit ? (
        <p className="mt-4 rounded-xl bg-paper-soft px-4 py-3 text-sm leading-snug text-ink-600">
          {t.mergedNote.replace("{from}", mergedHit.from).replace("{to}", mergedHit.to)}
        </p>
      ) : null}

      <div className={clsx("mt-10", isDefault && "lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10")}>
      {isDefault ? (
        <CategoryRail
          title={labels.railTitle}
          items={[
            ...(surface === "customer-journeys"
              ? customerGroups.map((group) => ({
                  id: group.id,
                  anchor: `group-${group.id}`,
                  label: group.label,
                  count: group.count,
                  icon: <CategoryIcon id={group.iconCategory} className={categoryAccent(group.iconCategory).ink} />,
                }))
              : sections.map((s) => ({
                  id: s.meta.id,
                  anchor: `cat-${s.meta.id}`,
                  label: shortCategoryTitle(lang === "en" ? s.meta.title : s.meta.titleTr),
                  count: s.items.length,
                  icon: <CategoryIcon id={s.meta.id} className={categoryAccent(s.meta.id).ink} />,
                }))),
          ]}
          active={activeCat}
        />
      ) : null}
      <div className="min-w-0">


      {isDefault ? (
        surface === "customer-journeys" ? (
          <div className="flex flex-col gap-14">
            {customerGroups.map((group) => (
              <section
                key={group.id}
                id={`group-${group.id}`}
                data-cat={group.id}
                className="scroll-mt-24"
              >
                <CategoryHeader
                  id={group.iconCategory}
                  code=""
                  title={group.label}
                  count={group.count}
                  countLabel={labels.journeysLabel[surface][group.count === 1 ? 0 : 1]}
                  purpose={group.description}
                />
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((j) => (
                    <JourneyIdeaCard
                      key={j.id}
                      href={`${basePath}/${j.slug}`}
                      id={j.id}
                      lang={lang}
                      title={j.shortName ?? j.name}
                      category={j.category}
                      categoryTitle={group.label}
                      purpose={j.purpose}
                      nodeCount={j.nodeCount}
                      nodesLabel={t.nodesLabel}
                      channels={sortChannels(j.channels)}
                      internalLabel={emptyChannelLabel}
                      typeLabel={humanRoutingLabel && isHumanRoutingRow(j) ? humanRoutingLabel : undefined}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-14">
            {sections.map((s) => (
              <CategorySection
                key={s.meta.id}
                meta={s.meta}
                items={s.items}
                lang={lang}
                t={t}
                basePath={basePath}
                labels={labels}
                surface={surface}
                emptyChannelLabel={emptyChannelLabel}
                humanRoutingLabel={humanRoutingLabel}
              />
            ))}
          </div>
        )
      ) : localFiltered.length === 0 && matchingPresets.length === 0 ? (
        <div className="rounded-2xl bg-paper-soft px-6 py-16 text-center">
          <p className="text-sm text-ink-500 tabular-nums">0 / {allRows.length}</p>
          <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-ink-700">{t.empty}</p>
          <Button type="button" variant="outline" size="sm" className="mt-6" onClick={clearEverything}>
            <X aria-hidden className="size-4" />
            {t.clearAll}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {localFiltered.map((j) => (
            <JourneyIdeaCard
              key={j.id}
              href={`${basePath}/${j.slug}`}
              id={j.id}
              lang={lang}
              title={j.shortName ?? j.name}
              category={j.category}
              categoryTitle={publicJourneyCategoryLabel(j.id, lang) ?? j.categoryTitle}
              purpose={j.purpose}
              nodeCount={j.nodeCount}
              nodesLabel={t.nodesLabel}
              channels={sortChannels(j.channels)}
              internalLabel={emptyChannelLabel}
              typeLabel={humanRoutingLabel && isHumanRoutingRow(j) ? humanRoutingLabel : undefined}
            />
          ))}
        </div>
      )}
      </div>
      </div>
    </div>
  );
}
