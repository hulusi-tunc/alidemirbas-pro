"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";

import JourneyIdeaCard from "@/components/ui/JourneyIdeaCard";
import IdeaCard from "@/components/ui/IdeaCard";
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


function CategorySection({
  meta,
  items,
  lang,
  t,
  basePath,
  labels,
  emptyChannelLabel,
  humanRoutingLabel,
}: {
  meta: CategoryMeta;
  items: readonly JourneyRow[];
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
  basePath: string;
  labels: (typeof copy)[Lang]["lab"]["journeysSplit"];
  emptyChannelLabel: string;
  /** Customer Journeys surface only - the badge for the 3 journeys that
      reach a customer by routing to a person rather than by message
      (isHumanRoutingRow). Undefined on every other surface. */
  humanRoutingLabel?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, SECTION_PREVIEW_COUNT);
  const remaining = items.length - visible.length;

  return (
    <section>
      <div className="flex items-start gap-3">
        {/* The visual marker is the category's own id prefix, which is real
            addressable data (every journey in here is ACQ-nn, RET-nn, ...)
            rather than an icon invented for 26 categories nobody could
            verify the meaning of. */}
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
        {visible.map((j) => (
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
            internalLabel={emptyChannelLabel}
            typeLabel={humanRoutingLabel && isHumanRoutingRow(j) ? humanRoutingLabel : undefined}
          />
        ))}
      </div>

      {remaining > 0 || expanded ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 border border-line bg-paper px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:border-neutral-400 hover:bg-paper-soft"
        >
          {expanded ? labels.showLess : labels.showMore.replace("{count}", String(remaining))}
        </button>
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
  surfaceLinks,
  presets = [],
  emptyChannelLabel,
}: {
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
  rows: readonly JourneyRow[];
  merged: readonly MergedRedirect[];
  basePath: string;
  categories: readonly CategoryMeta[];
  /** Which surface this page is. The surface "filter" is the page itself
      rather than a dropdown - the public surfaces are separate routes with
      their own titles and metadata, so switching is a navigation, not a
      state change. `surfaceLinks` are those surfaces, this one marked. */
  surface: SurfaceKey;
  surfaceLinks: readonly { key: SurfaceKey; href: string; label: string }[];
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
  const [category, setCategory] = useState<string>("");
  const [channel, setChannel] = useState<string>("");
  /* The Operations surface used to swap Goal for its own coarser Type
     filter here (archive/operational-workflows/taxonomy/). That surface is
     archived, so every remaining surface filters by Goal. */

  // Only offer a filter value that some real row on this page actually has.
  const presentCategories = useMemo(() => {
    const present = new Set(allRows.map((j) => j.category));
    return categories.filter((c) => present.has(c.id));
  }, [allRows, categories]);
  const presentChannels = useMemo(() => {
    const present = new Set(allRows.flatMap((j) => j.channels));
    return CHANNELS.filter((c) => present.has(c));
  }, [allRows]);
  const localFiltered = useMemo(
    () =>
      rows.filter(
        (j) =>
          (!category || j.category === category) &&
          (!channel || j.channels.includes(channel as ChannelId)),
      ),
    [rows, category, channel],
  );

  const isDefault = isDefaultView && !category && !channel;
  const totalActive = activeCount + (category ? 1 : 0) + (channel ? 1 : 0);

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

  // Presets answer to their own names and aliases; a category or channel
  // filter does not apply to them (they are cards over a parent, not rows).
  const matchingPresets = useMemo(() => {
    if (!presets.length || category || channel || goal) return isDefault ? presets : [];
    const q = query.trim().toLowerCase();
    if (!q) return presets;
    return presets.filter((p) => [p.name, p.parentName, ...p.aliases].some((x) => x.toLowerCase().includes(q)));
  }, [presets, query, category, channel, goal, isDefault]);

  const clearEverything = () => {
    setCategory("");
    setChannel("");
    clearAll();
  };

  // Customer Journeys only - see isHumanRoutingRow.
  const humanRoutingLabel = surface === "customer-journeys" ? labels.humanRoutingBadge : undefined;

  const selectClass =
    "w-full border border-line bg-paper px-3 py-2 text-sm text-ink-900 outline-none transition-colors focus:border-blue-600 sm:w-auto";

  return (
    <div>
      {/* Surface: the public surfaces are routes, so this is a link row rather
          than a select - it changes the page, its title and its metadata,
          not just the rows. */}
      <div className="flex flex-wrap gap-2">
        {surfaceLinks.map((l) =>
          l.key === surface ? (
            <span key={l.key} className="border border-ink-950 bg-ink-950 px-3 py-1.5 text-sm font-medium text-paper">
              {l.label}
            </span>
          ) : (
            <Link
              key={l.key}
              href={l.href}
              className="border border-line bg-paper px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:border-neutral-400 hover:bg-paper-soft"
            >
              {l.label}
            </Link>
          ),
        )}
      </div>

      <div className="mt-3 flex items-center gap-3 border border-line bg-paper px-4 py-2.5 focus-within:border-blue-600">
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

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <label className="block">
          <span className="sr-only">{labels.categoryFilterLabel}</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
            <option value="">{labels.allCategories}</option>
            {presentCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </label>

        {presentChannels.length > 0 ? (
          <label className="block">
            <span className="sr-only">{labels.channelFilterLabel}</span>
            <select value={channel} onChange={(e) => setChannel(e.target.value)} className={selectClass}>
              <option value="">{labels.allChannels}</option>
              {presentChannels.map((c) => (
                <option key={c} value={c}>
                  {CHANNEL_LABEL[c][lang]}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block">
          <span className="sr-only">{t.goalLabel}</span>
          <select
            value={goal ?? ""}
            onChange={(e) => setGoal(e.target.value ? (e.target.value as typeof goal) : null)}
            className={selectClass}
          >
            <option value="">{t.allGoals}</option>
            {[...new Set(allRows.map((j) => j.goal))]
              .sort((a, b) => GOAL_LABEL[a][lang].localeCompare(GOAL_LABEL[b][lang], lang))
              .map((g) => (
                <option key={g} value={g}>
                  {GOAL_LABEL[g][lang]}
                </option>
              ))}
          </select>
        </label>
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
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              <X aria-hidden className="size-3.5" />
              {t.clearAll}
            </button>
          ) : null}
        </div>
      ) : null}

      {mergedHit ? (
        <p className="mt-4 border border-line bg-paper-soft px-4 py-3 text-[13px] leading-snug text-ink-600">
          {t.mergedNote.replace("{from}", mergedHit.from).replace("{to}", mergedHit.to)}
        </p>
      ) : null}

      {matchingPresets.length ? (
        <section className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-base font-semibold tracking-tight text-ink-950">{labels.presetsTitle}</h2>
            <span className="shrink-0 font-mono text-xs text-ink-400 tabular-nums">{matchingPresets.length}</span>
          </div>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-500">{labels.presetsIntro}</p>
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {matchingPresets.map((p) => (
              <IdeaCard
                key={p.id}
                href={`${basePath}/${p.slug}`}
                title={p.name}
                badges={[{ label: labels.presetBadge, tone: "accent" }]}
                body={p.applicableWhen}
                footLeft={`${labels.presetOf} ${p.parentName}`}
                footRight={p.categoryTitle}
              />
            ))}
          </div>
        </section>
      ) : null}

      {isDefault ? (
        <div className="mt-8 flex flex-col gap-12">
          {sections.map((s) => (
            <CategorySection
              key={s.meta.id}
              meta={s.meta}
              items={s.items}
              lang={lang}
              t={t}
              basePath={basePath}
              labels={labels}
              emptyChannelLabel={emptyChannelLabel}
              humanRoutingLabel={humanRoutingLabel}
            />
          ))}
        </div>
      ) : localFiltered.length === 0 && matchingPresets.length === 0 ? (
        <div className="mt-5 border-t border-b border-line py-16 text-center">
          <p className="font-mono text-[11px] tracking-[0.12em] text-ink-400 uppercase tabular-nums">
            0 / {allRows.length}
          </p>
          <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-ink-700">{t.empty}</p>
          <button
            type="button"
            onClick={clearEverything}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            <X aria-hidden className="size-3.5" />
            {t.clearAll}
          </button>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {localFiltered.map((j) => (
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
              internalLabel={emptyChannelLabel}
              typeLabel={humanRoutingLabel && isHumanRoutingRow(j) ? humanRoutingLabel : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
