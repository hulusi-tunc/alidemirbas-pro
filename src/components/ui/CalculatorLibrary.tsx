"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Activity,
  CalendarClock,
  Coins,
  Divide,
  Eye,
  FlaskConical,
  Funnel,
  Gauge,
  Gem,
  Link2,
  Mail,
  Megaphone,
  MousePointerClick,
  PieChart,
  RefreshCw,
  Scale,
  Search,
  ShoppingCart,
  Target,
  TrendingUp,
  Type,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

import type { Lang } from "@/lib/content";

/* Calculators index, in the calculator family's own language (the cream
   mockup one-off this file used to be is retired - the family now has a
   real design language, set on the detail pages): square-edged cards on
   the site tokens, Lucide category icons on brand tiles (one icon set,
   never a drawn shape standing in for one), category filters as a
   multi-select chip row ABOVE the grid rather than a sidebar - the
   filter is multi-select, and a chip row reads that way (and was where
   the owner suggested it belonged).

   REAL DATA ONLY, same discipline as before: `entries`/`categoryFacets`
   are computed by `CalculatorIndexPage` from the live catalog
   (calc-catalog.ts) + TEXT_TOOLS and passed in as props - this file
   holds no calculator data of its own. Search/filter logic (OR within
   the category facet, `.includes()` over name+description+category+
   aliases) is unchanged - only the visual grammar changed. */

export type CalcEntry = {
  slug: string;
  name: string;
  description: string;
  categoryLabel: string;
  /** Real internal category key (e.g. "ads") - picks the category icon,
      never displayed. */
  categoryKey: string;
  searchText: string;
  href: string;
};

export type CategoryFacet = { id: string; label: string; count: number };

const T = {
  en: {
    searchPlaceholder: "Search calculators...",
    // No resting total any more - it only appears while a filter is on.
    countFiltered: (n: number, total: number) => `${n} of ${total} calculators`,
    empty: "No calculators match your search.",
    clear: "Clear search & filters",
  },
  tr: {
    searchPlaceholder: "Hesaplayıcılarda ara...",
    countFiltered: (n: number, total: number) => `${n} / ${total} hesaplayıcı`,
    empty: "Bu aramayla eşleşen hesaplayıcı yok.",
    clear: "Aramayı ve filtreleri temizle",
  },
} as const;

/* One Lucide icon PER CALCULATOR - each tool wears its own meaning, not
   its category's (a category icon repeated across four cards reads as a
   rendering bug, not a system). The icon rule holds: always the real icon
   from the site's one set, never a drawn stand-in. */
const SLUG_ICON: Record<string, LucideIcon> = {
  // Ads
  roas: Coins,
  cpc: MousePointerClick,
  cpm: Eye,
  cac: UserPlus,
  // Revenue & Unit Economics
  aov: ShoppingCart,
  "gross-margin": PieChart,
  "break-even-point": Scale,
  ltv: Gem,
  "ltv-cac-ratio": Divide,
  "cac-payback-period": CalendarClock,
  // Retention & SaaS
  "retention-rate": UserCheck,
  nrr: Activity,
  "logo-churn": UserMinus,
  "rule-of-40": Gauge,
  // Conversion & Funnel
  cr: Target,
  "funnel-analysis-multistep": Funnel,
  // Experimentation
  "ab-test": FlaskConical,
  "sample-size-calculator": Users,
  // Email & CRM
  "email-performance": Mail,
  // Text tools
  "utm-builder": Link2,
  "character-counter": Type,
};

/* Category fallback, for a future calculator added before anyone picks it
   an icon of its own. */
const CATEGORY_ICON: Record<string, LucideIcon> = {
  ads: Megaphone,
  "revenue-unit-economics": TrendingUp,
  "retention-saas": RefreshCw,
  "conversion-funnel": Funnel,
  experimentation: FlaskConical,
  "email-crm": Mail,
  "text-tools": Type,
};

/* One tint per CATEGORY, so the badge carries two signals at once: the icon
   says which tool this is, the colour says which family it belongs to - and
   a grid of 21 all-blue badges stops reading as a system and starts reading
   as one repeated element. Written as whole class strings because that is
   what Tailwind's scanner can see; brand blue stays with Ads, the group the
   brand colour belongs to, so the accent is not spent arbitrarily. */
const CATEGORY_TINT: Record<string, string> = {
  ads: "bg-blue-100 text-blue-600",
  "revenue-unit-economics": "bg-emerald-100 text-emerald-600",
  "retention-saas": "bg-violet-100 text-violet-600",
  "conversion-funnel": "bg-amber-100 text-amber-600",
  experimentation: "bg-fuchsia-100 text-fuchsia-600",
  "email-crm": "bg-teal-100 text-teal-600",
  "text-tools": "bg-slate-200 text-slate-600",
};

/** Exported: the homepage's Calculators teaser renders this same card, so
    the two grids stay one design by construction. The old `index` prop
    (which varied the retired two-shape badge) is accepted and ignored so
    that call site keeps compiling. */
export function EntryCard({ entry }: { entry: CalcEntry; index?: number }) {
  const Icon = SLUG_ICON[entry.slug] ?? CATEGORY_ICON[entry.categoryKey] ?? TrendingUp;
  return (
    /* Two shapes, one card. On mobile it is a compact ROW - icon at the
       left as the scanning anchor, two lines of description at most - so
       four or five land on a phone screen instead of two near-identical
       tall blocks. From `sm` up it is the stacked card the grid wants.
       `sm:contents` dissolves the mobile text wrapper at that breakpoint,
       so the same markup gives both layouts with no duplicated content. */
    <Link
      href={entry.href}
      /* Hover is a quiet brand tint and nothing else - the white-plate-plus-
         shadow lift this used to do was reviewed as cheap. The card stays
         flat on its ground; only the colour temperature moves. */
      className="group flex gap-4 rounded-card bg-paper-soft p-4 transition-colors hover:bg-blue-50 sm:flex-col sm:gap-2.5 sm:p-6"
    >
      <span
        aria-hidden
        className={`grid size-10 shrink-0 place-items-center rounded-full sm:mb-1 ${
          CATEGORY_TINT[entry.categoryKey] ?? CATEGORY_TINT.ads
        }`}
      >
        <Icon className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col sm:contents">
        <span className="text-base font-semibold tracking-tight text-ink-950">{entry.name}</span>
        <span className="mt-1 line-clamp-2 text-sm leading-relaxed text-ink-600 sm:mt-0 sm:line-clamp-none">
          {entry.description}
        </span>
        <span className="mt-2 flex items-center justify-between gap-2 sm:mt-auto sm:pt-1.5">
          <span className="text-[12px] text-ink-400">{entry.categoryLabel}</span>
          <ArrowRight
            aria-hidden
            className="size-3.5 shrink-0 text-ink-200 transition-colors group-hover:text-blue-600"
          />
        </span>
      </span>
    </Link>
  );
}

function FacetChip({
  label,
  count,
  checked,
  onToggle,
}: {
  label: string;
  count: number;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={onToggle}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors ${
        checked
          ? "bg-primary-600 text-white"
          : "bg-paper-soft text-ink-700 hover:bg-blue-50 hover:text-primary-700"
      }`}
    >
      {label}
      <span className={`tabular-nums ${checked ? "text-white/70" : "text-ink-400"}`}>{count}</span>
    </button>
  );
}

export function CalculatorLibrary({
  lang, entries, categoryFacets, heroTitle, heroSub,
}: {
  lang: Lang;
  entries: CalcEntry[];
  categoryFacets: CategoryFacet[];
  /** The page's title copy. Rendered here, above the search field, so the
      two read as one composed hero - search is the primary action on an
      index of 21 tools and belongs with the title, not in a utility strip
      below it.

      PLAIN STRINGS, not a JSX slot. The route is a Server Component and
      this is a Client Component: JSX handed across that boundary is
      serialised, which loses the marker React uses to tell a static child
      list from a dynamic one, so a `<div>` holding an h1 and a p arrives
      looking like an unkeyed array and warns. Strings cross cleanly. */
  heroTitle: string;
  heroSub: string;
}) {
  const t = T[lang];
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Set<string>>(new Set());

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (q && !e.searchText.includes(q)) return false;
      if (category.size > 0 && !category.has(e.categoryLabel)) return false;
      return true;
    });
  }, [entries, query, category]);

  const toggle = (id: string) => {
    const next = new Set(category);
    if (next.has(id)) next.delete(id); else next.add(id);
    setCategory(next);
  };

  const filtered = query.trim().length > 0 || category.size > 0;

  return (
    <>
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-h1 text-balance text-ink-950">
          {heroTitle}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-pretty text-ink-500">{heroSub}</p>
      </div>

      {/* Search, centred under the title and at a size that reads as the
          page's primary control rather than as a filter accessory. It used
          to sit left in a strip with a running total on the right; the
          total is gone (the facet chips already carry per-category counts,
          and a bare "21 calculators" beside an empty field only told the
          reader something the grid below already showed). */}
      <div className="relative mx-auto mt-8 w-full max-w-xl">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          aria-label={t.searchPlaceholder}
          className="box-border w-full rounded-full bg-paper-soft py-4 pr-5 pl-13 text-base text-ink-950 outline-none transition-shadow placeholder:text-ink-400 focus:shadow-[inset_0_0_0_1px_var(--color-primary-400)]"
        />
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-5 size-4.5 -translate-y-1/2 text-ink-400" />
      </div>

      {/* The count survives ONLY while a filter is on, where it answers a
          question the reader just asked ("did that narrow it to anything?").
          At rest it said nothing the grid did not. */}
      {filtered && (
        <p aria-live="polite" className="mt-3 text-center text-sm text-ink-500">
          {t.countFiltered(results.length, entries.length)}
        </p>
      )}

      {/* The category facet as a multi-select chip row above the grid: the
          filter is multi-select and a chip row reads that way, where a
          checkbox sidebar read as a form. Selected chips take the brand
          plate, exactly the active-state grammar the mode selector on the
          detail pages already uses.

          ON MOBILE IT IS A SCROLLING RAIL, not a wrapped block: seven chips
          wrap onto four lines on a phone, which pushes the actual results
          off the first screen - the filter costing more space than the
          content it filters. One swipeable line, snapping to a chip, with
          a fade at the edge so it reads as scrollable. It goes back to
          wrapping at `sm`, where the whole set fits in one or two lines. */}
      <div className="relative mt-7">
        {/* Centred from `sm` up, to sit under a centred title and search
            rather than hanging off the left edge of the grid. Still the
            swipeable rail below that. */}
        <div className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-2 overflow-x-auto px-6 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
          {categoryFacets.map((f) => (
            <div key={f.id} className="shrink-0 snap-start">
              <FacetChip
                label={f.label}
                count={f.count}
                checked={category.has(f.id)}
                onToggle={() => toggle(f.id)}
              />
            </div>
          ))}
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-paper to-transparent sm:hidden"
        />
      </div>

      <div className="mt-8">
        {results.length === 0 ? (
          /* The same designed dead end the two Lab libraries use - count,
             message, one recovery action - on the site tokens. */
          <div className="my-8 rounded-card bg-paper-soft py-14 text-center">
            <p className="text-[13px] font-medium text-ink-400 tabular-nums">
              0 / {entries.length}
            </p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-600">{t.empty}</p>
            <button
              type="button"
              onClick={() => { setQuery(""); setCategory(new Set()); }}
              className="mt-5 text-sm font-medium text-blue-700 underline underline-offset-4 transition-colors hover:text-blue-800"
            >
              {t.clear}
            </button>
          </div>
        ) : (
          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
            {results.map((entry) => (
              <EntryCard key={entry.slug} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
