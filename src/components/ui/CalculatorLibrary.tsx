"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import type { Lang } from "@/lib/content";

/* Calculators index — converted to a user-supplied mockup (warm cream
   palette #faf9f6, square checkbox facets, two-shape OKLCH icon badges
   per category). A DELIBERATE one-off, same reasoning as the About page
   conversion: this mockup specifies its own colors/card grammar, not the
   Portrait system the rest of the site (Contact/Stack/Blog/Lab/404) still
   uses — reproducing it exactly means not forcing it through those
   pages' tokens. Nothing here touches globals.css or any shared
   primitive; `CalculatorRoutes.tsx`'s own `CalculatorDetailPage` (the
   real calculator tool pages) is untouched and keeps its current
   look.

   REAL DATA ONLY, same discipline as before: `entries`/`categoryFacets`
   are computed by `CalculatorIndexPage` from the live catalog
   (calc-catalog.ts) + TEXT_TOOLS and passed in as props - this file
   holds no calculator data of its own. Search/filter logic (OR within
   the category facet, `.includes()` over name+description+category+
   aliases) is unchanged from the previous Portrait-styled version -
   only the visual grammar changed. The facet list is now the six
   library groups rather than the ten research categories; nothing about
   how filtering works changed with it. */

export type CalcEntry = {
  slug: string;
  name: string;
  description: string;
  categoryLabel: string;
  /** Real internal category key (e.g. "advertising") - used only to pick
      a deterministic icon hue, never displayed. */
  categoryKey: string;
  searchText: string;
  href: string;
};

export type CategoryFacet = { id: string; label: string; count: number };

const T = {
  en: {
    searchPlaceholder: "Search calculators...",
    categoryLabel: "Category",
    countAll: (n: number) => `${n} calculator${n === 1 ? "" : "s"}`,
    countFiltered: (n: number, total: number) => `${n} of ${total} calculators`,
    empty: "No calculators match your search.",
  },
  tr: {
    searchPlaceholder: "Hesaplayıcılarda ara...",
    categoryLabel: "Kategori",
    countAll: (n: number) => `${n} hesaplayıcı`,
    countFiltered: (n: number, total: number) => `${n} / ${total} hesaplayıcı`,
    empty: "Bu aramayla eşleşen hesaplayıcı yok.",
  },
} as const;

// Library group key -> a deterministic OKLCH hue. Keyed by LibraryGroup
// (calc-catalog.ts) since the trim to six groups, carrying over each
// group's hue from whichever of the old ten categories it absorbed, so
// the icons people already recognise don't all change colour: Ads keeps
// advertising's 250, Revenue & Unit Economics keeps unit-economics' 75,
// Retention & SaaS keeps saas' 280, Conversion & Funnel keeps cro-funnel's
// 200. "tools" is the one synthetic bucket (UTM Builder/Character Counter
// carry no spec at all — see CalculatorRoutes.tsx's own note on why they
// sit outside the taxonomy).
const CATEGORY_HUE: Record<string, number> = {
  ads: 250,
  "revenue-unit-economics": 75,
  "retention-saas": 280,
  "conversion-funnel": 200,
  experimentation: 305,
  "email-crm": 225,
  tools: 250,
};

export function CategoryIcon({ categoryKey, index }: { categoryKey: string; index: number }) {
  const hue = CATEGORY_HUE[categoryKey] ?? 250;
  const shift = index % 2 === 0;
  return (
    <span aria-hidden className="relative mb-2.5 block size-10">
      <span
        className="absolute rounded-[7px]"
        style={{ left: 0, top: 3, width: 26, height: 26, background: `oklch(0.87 0.07 ${hue})` }}
      />
      <span
        className="absolute opacity-92"
        style={{
          left: shift ? 14 : 12,
          top: shift ? 14 : 0,
          width: 20,
          height: 20,
          borderRadius: shift ? 6 : 999,
          background: `oklch(0.55 0.15 ${hue})`,
        }}
      />
    </span>
  );
}

function EntryCard({ entry, index }: { entry: CalcEntry; index: number }) {
  return (
    <Link
      href={entry.href}
      className="flex flex-col gap-2.5 rounded-[10px] border border-[#e8e5df] bg-white p-6.5 transition-[border-color,box-shadow] duration-150 hover:border-[#cfcabf] hover:shadow-[0_1px_3px_rgba(20,19,17,0.06)]"
    >
      <CategoryIcon categoryKey={entry.categoryKey} index={index} />
      <span className="text-base font-semibold tracking-tight" style={{ color: "#141311" }}>{entry.name}</span>
      <span className="text-sm leading-relaxed" style={{ color: "rgba(20,19,17,0.65)" }}>{entry.description}</span>
      <span className="mt-auto pt-1.5 text-xs" style={{ color: "#9c978c" }}>{entry.categoryLabel}</span>
    </Link>
  );
}

function FacetRow({ label, count, checked, onToggle }: { label: string; count: number; checked: boolean; onToggle: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm select-none">
      <input type="checkbox" checked={checked} onChange={onToggle} className="sr-only" />
      <span
        aria-hidden
        className="grid size-4.5 shrink-0 place-items-center border-2 box-border"
        style={{ borderColor: "#d8d4cc" }}
      >
        <span className="size-2.5" style={{ background: "#171614", opacity: checked ? 1 : 0, transition: "opacity .1s" }} />
      </span>
      <span style={{ color: "#4a463f" }}>
        {label} <span className="tabular-nums" style={{ color: "#9c978c" }}>({count})</span>
      </span>
    </label>
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
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-96">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchPlaceholder}
            className="box-border w-full rounded-full border py-2.5 pr-4 pl-10 text-sm outline-none transition-colors"
            style={{ borderColor: "#e3e0d9", background: "#faf9f6", color: "#201f1c" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#8f8a80"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#e3e0d9"; }}
          />
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" style={{ color: "#9c978c" }} />
        </div>
        <p className="text-sm whitespace-nowrap" style={{ color: "rgba(20,19,17,0.65)" }}>
          {filtered ? t.countFiltered(results.length, entries.length) : t.countAll(entries.length)}
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-10 lg:grid-cols-[13rem_1fr]">
        <aside>
          <p className="text-sm font-semibold tracking-tight" style={{ color: "#141311" }}>{t.categoryLabel}</p>
          <div className="mt-2.5 flex flex-col">
            {categoryFacets.map((f) => (
              <FacetRow key={f.id} label={f.label} count={f.count} checked={category.has(f.id)} onToggle={() => toggle(f.id)} />
            ))}
          </div>
        </aside>

        <div>
          {results.length === 0 ? (
            <p className="my-12 text-sm" style={{ color: "rgba(20,19,17,0.55)" }}>{t.empty}</p>
          ) : (
            <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
              {results.map((entry, i) => (
                <EntryCard key={entry.slug} entry={entry} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
