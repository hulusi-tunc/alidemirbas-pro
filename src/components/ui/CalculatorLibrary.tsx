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
    countAll: (n: number) => `${n} calculator${n === 1 ? "" : "s"}`,
    countFiltered: (n: number, total: number) => `${n} of ${total} calculators`,
    empty: "No calculators match your search.",
    clear: "Clear search & filters",
  },
  tr: {
    searchPlaceholder: "Hesaplayıcılarda ara...",
    countAll: (n: number) => `${n} hesaplayıcı`,
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

/** Exported: the homepage's Calculators teaser renders this same card, so
    the two grids stay one design by construction. The old `index` prop
    (which varied the retired two-shape badge) is accepted and ignored so
    that call site keeps compiling. */
export function EntryCard({ entry }: { entry: CalcEntry; index?: number }) {
  const Icon = SLUG_ICON[entry.slug] ?? CATEGORY_ICON[entry.categoryKey] ?? TrendingUp;
  return (
    <Link
      href={entry.href}
      className="group flex flex-col gap-2.5 rounded-card bg-paper-soft p-6 transition-[background-color,box-shadow] hover:bg-paper hover:shadow-card"
    >
      <span aria-hidden className="mb-1 grid size-10 place-items-center rounded-full bg-blue-100 text-primary-600">
        <Icon className="size-5" />
      </span>
      <span className="text-base font-semibold tracking-tight text-ink-950">{entry.name}</span>
      <span className="text-sm leading-relaxed text-ink-600">{entry.description}</span>
      <span className="mt-auto flex items-center justify-between gap-2 pt-1.5">
        <span className="text-[12px] text-ink-400">{entry.categoryLabel}</span>
        <ArrowRight
          aria-hidden
          className="size-3.5 shrink-0 text-ink-200 transition-colors group-hover:text-blue-600"
        />
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
  lang, entries, categoryFacets,
}: {
  lang: Lang;
  entries: CalcEntry[];
  categoryFacets: CategoryFacet[];
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-96">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
            className="box-border w-full rounded-full bg-paper-soft py-2.5 pr-4 pl-10 text-sm text-ink-950 outline-none transition-shadow focus:shadow-[inset_0_0_0_1px_var(--color-primary-400)]"
          />
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-400" />
        </div>
        <p className="text-sm whitespace-nowrap text-ink-500">
          {filtered ? t.countFiltered(results.length, entries.length) : t.countAll(entries.length)}
        </p>
      </div>

      {/* The category facet as a multi-select chip row above the grid: the
          filter is multi-select and a chip row reads that way, where a
          checkbox sidebar read as a form. Selected chips take the brand
          plate, exactly the active-state grammar the mode selector on the
          detail pages already uses. */}
      <div className="mt-5 flex flex-wrap gap-2">
        {categoryFacets.map((f) => (
          <FacetChip
            key={f.id}
            label={f.label}
            count={f.count}
            checked={category.has(f.id)}
            onToggle={() => toggle(f.id)}
          />
        ))}
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
