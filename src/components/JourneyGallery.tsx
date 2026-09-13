"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import JourneyIdeaCard from "@/components/ui/JourneyIdeaCard";
import IdeaCard from "@/components/ui/IdeaCard";
import { Button } from "@/components/ui/Button";
import { CategoryHeader, CategoryIcon, SEARCH_SHELL, SELECT_CLASS, SelectShell, SurfaceTabs, TOOLBAR_ROW, categoryAccent, shortCategoryTitle } from "@/components/ui/LibraryChrome";
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
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, SECTION_PREVIEW_COUNT);
  const remaining = items.length - visible.length;

  return (
    <section id={`cat-${meta.id}`} data-cat={meta.id} className="scroll-mt-24">
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

/* THE CATEGORY RAIL (2026-09-13). Twenty-one sections make a page nine
   screens tall; the rail is the way across it - every category with its
   count, anchored to its section, the one under the reading line held. It
   only exists in the default view (a filtered result is one flat grid) and
   only from lg, where there is a column for it; below that the selects
   are the way in. */
function CategoryRail({
  title,
  presets,
  sections,
  active,
}: {
  title: string;
  presets?: { label: string; count: number };
  sections: readonly { id: string; title: string; count: number }[];
  active: string;
}) {
  const item = (id: string, label: string, count: number) => (
    <li key={id}>
      <a
        href={`#${id === "presets" ? "presets" : `cat-${id}`}`}
        title={label}
        aria-current={active === id ? "true" : undefined}
        className={clsx(
          "flex items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors duration-[var(--duration-fast)]",
          active === id ? "bg-paper-soft font-medium text-ink-950" : "text-ink-600 hover:bg-paper-soft hover:text-ink-950",
        )}
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <CategoryIcon id={id} className={clsx("size-4 shrink-0", categoryAccent(id).ink)} />
          <span className="truncate">{label}</span>
        </span>
        <span className="shrink-0 text-xs text-ink-500 tabular-nums">{count}</span>
      </a>
    </li>
  );
  return (
    <nav aria-label={title} className="hidden lg:block">
      <div className="sticky top-20 max-h-[calc(100svh-6rem)] overflow-y-auto pr-2">
        <p className="px-3 text-sm font-semibold text-ink-950">{title}</p>
        <ol className="mt-2 flex list-none flex-col gap-0.5 p-0">
          {presets ? item("presets", presets.label, presets.count) : null}
          {sections.map((c) => item(c.id, c.title, c.count))}
        </ol>
      </div>
    </nav>
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
      {/* Surface: the public surfaces are routes, so this is navigation
          rather than a select - it changes the page, its title and its
          metadata, not just the rows. */}
      <div className="flex justify-center">
        <SurfaceTabs links={surfaceLinks} active={surface} label={labels.surfaceNavLabel} />
      </div>

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

        <SelectShell>
          <span className="sr-only">{labels.categoryFilterLabel}</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={SELECT_CLASS}>
            <option value="">{labels.allCategories}</option>
            {presentCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {lang === "en" ? c.title : c.titleTr}
              </option>
            ))}
          </select>
        </SelectShell>

        {presentChannels.length > 0 ? (
          <SelectShell>
            <span className="sr-only">{labels.channelFilterLabel}</span>
            <select value={channel} onChange={(e) => setChannel(e.target.value)} className={SELECT_CLASS}>
              <option value="">{labels.allChannels}</option>
              {presentChannels.map((c) => (
                <option key={c} value={c}>
                  {CHANNEL_LABEL[c][lang]}
                </option>
              ))}
            </select>
          </SelectShell>
        ) : null}

        <SelectShell>
          <span className="sr-only">{t.goalLabel}</span>
          <select
            value={goal ?? ""}
            onChange={(e) => setGoal(e.target.value ? (e.target.value as typeof goal) : null)}
            className={SELECT_CLASS}
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
        </SelectShell>
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
          presets={matchingPresets.length ? { label: labels.presetsTitle, count: matchingPresets.length } : undefined}
          sections={sections.map((s) => ({ id: s.meta.id, title: shortCategoryTitle(lang === "en" ? s.meta.title : s.meta.titleTr), count: s.items.length }))}
          active={activeCat}
        />
      ) : null}
      <div className="min-w-0">
      {matchingPresets.length ? (
        <section id="presets" data-cat="presets" className="scroll-mt-24">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-h3 text-ink-950">{labels.presetsTitle}</h2>
            <span className="shrink-0 text-sm text-ink-500 tabular-nums">{matchingPresets.length}</span>
          </div>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-600">{labels.presetsIntro}</p>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {matchingPresets.map((p) => (
              <IdeaCard
                key={p.id}
                href={`${basePath}/${p.slug}`}
                icon={<CategoryIcon id="presets" />}
                iconTone={categoryAccent("presets").tile}
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
        <div className={clsx("flex flex-col gap-14", matchingPresets.length ? "mt-14" : "")}>
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
        <div className={clsx("grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3", matchingPresets.length ? "mt-14" : "")}>
          {localFiltered.map((j) => (
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
      )}
      </div>
      </div>
    </div>
  );
}
