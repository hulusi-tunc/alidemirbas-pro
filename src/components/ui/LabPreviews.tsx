import type { ReactNode } from "react";
import { Search } from "lucide-react";

import { JOURNEY_COUNT } from "@/lib/archive";
import { CATEGORY_COUNT } from "@/lib/canonical-view";
import { copy, type Lang } from "@/lib/content";

/* Per-project decorative previews, extracted from LabIndexPage.tsx so the
   homepage's Lab teaser (Site.tsx) and the full Lab index can share one
   set of real, structurally-grounded illustrations instead of the
   homepage inventing a second, generic set (icon-in-a-box placeholders)
   for the same six projects. Each is `aria-hidden` - illustrative of what
   the real tool does, not a second copy of its content - and every number
   inside one is real: live journey/category counts, a real AB-004 record,
   or an honestly-labelled illustrative bar chart for the two projects
   with no single number to visualize.

   LabIndexPage.tsx renders these unchanged (same components, same props);
   nothing about that page's output should move. */

export type Project = (typeof copy)[Lang]["lab"]["projects"][number];

/** All seven real node kinds (journey-marketing.ts's `NodeKind`), not the
    six this preview showed before — "action" was missing from both the
    label list and the render. Two rows now instead of one broken chain,
    so the canvas reads as a fuller graph rather than a single path -
    still every label is one of the library's own seven, nothing invented. */
export function JourneyCanvasPreview({ lang, size = "md" }: { lang: Lang; size?: "md" | "lg" }) {
  const T2 = {
    en: {
      label: "Journey canvas",
      trigger: "Trigger", condition: "Condition", wait: "Wait", action: "Action",
      outcome: "Outcome", exit: "Exit", handoff: "Handoff",
    },
    tr: {
      label: "Journey şeması",
      trigger: "Tetikleyici", condition: "Koşul", wait: "Bekleme", action: "Aksiyon",
      outcome: "Sonuç", exit: "Çıkış", handoff: "Devir",
    },
  }[lang];
  return (
    <div
      aria-hidden
      className={`rounded-t-[12px] bg-paper p-5 pb-6 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(10_16_32/0.04),0_8px_24px_-12px_rgb(10_16_32/0.12)] transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-smooth)] group-hover:scale-[1.01] ${size === "lg" ? "min-h-[240px]" : "min-h-[190px]"}`}
    >
      <p className="text-[13px] font-semibold text-ink-950">{T2.label}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-primary-100 px-2.5 py-1.5 text-xs font-medium text-primary-700">{T2.trigger}</span>
        <span className="h-px w-3.5 bg-ink-200" />
        <span className="rounded-md bg-paper px-2.5 py-1.5 text-xs font-medium text-ink-700 shadow-[inset_0_0_0_1px_var(--color-line)]">{T2.condition}</span>
        <span className="h-px w-3.5 bg-ink-200" />
        <span className="rounded-md bg-sand-50 px-2.5 py-1.5 text-xs font-medium text-neutral-700 shadow-[inset_0_0_0_1px_var(--color-sand-200)]">{T2.wait}</span>
        <span className="h-px w-3.5 bg-ink-200" />
        <span className="rounded-md bg-paper px-2.5 py-1.5 text-xs font-medium text-ink-700 shadow-[inset_0_0_0_1px_var(--color-line)]">{T2.action}</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="w-10" />
        <span className="h-3.5 w-px bg-ink-200" />
        <span className="ml-[4.5rem] h-3.5 w-px bg-ink-200" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-6" />
        <span className="rounded-md bg-[#e8f9e7] px-2.5 py-1.5 text-xs font-medium text-[#2c7a35]">{T2.outcome}</span>
        <span className="h-px w-3.5 bg-ink-200" />
        <span className="rounded-md bg-paper px-2.5 py-1.5 text-xs font-medium text-ink-500 shadow-[inset_0_0_0_1px_var(--color-line)]">{T2.exit}</span>
        <span className="h-px w-3.5 bg-ink-200" />
        <span className="rounded-md bg-paper px-2.5 py-1.5 text-xs font-medium text-ink-500 shadow-[inset_0_0_0_1px_var(--color-line)]">{T2.handoff}</span>
      </div>
    </div>
  );
}

/** Real, live counts + a curated real-category highlight. */
export function CategoryLibraryPreview({ lang }: { lang: Lang }) {
  const T2 = { en: { journeys: "journeys", categories: "categories", more: "more" }, tr: { journeys: "journey", categories: "kategori", more: "daha" } }[lang];
  // A curated highlight, not the full 26 — every id below is a real
  // category id in the canonical registry.
  const HIGHLIGHT = ["Activation", "Communication", "Consent", "Decision", "Feedback", "Financial", "Incident", "Retention", "Risk", "Scheduling", "Subscription"];
  const more = Math.max(CATEGORY_COUNT - HIGHLIGHT.length, 0);
  return (
    <div aria-hidden className="min-h-[190px] rounded-t-[12px] bg-paper p-5 pb-6 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(10_16_32/0.04),0_8px_24px_-12px_rgb(10_16_32/0.12)] transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-smooth)] group-hover:scale-[1.01]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-semibold text-ink-950 tabular-nums">{JOURNEY_COUNT} {T2.journeys}</p>
        <p className="text-xs text-ink-400 tabular-nums">{CATEGORY_COUNT} {T2.categories}</p>
      </div>
      <div className="mt-3.5 flex flex-wrap gap-2">
        {HIGHLIGHT.map((c, i) => (
          <span
            key={c}
            className={
              i % 3 === 0
                ? "rounded-md bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700"
                : "rounded-md bg-paper px-2.5 py-1 text-xs font-medium text-ink-700 shadow-[inset_0_0_0_1px_var(--color-line)]"
            }
          >
            {c}
          </span>
        ))}
        <span className="rounded-md bg-paper px-2.5 py-1 text-xs font-medium text-ink-400 shadow-[inset_0_0_0_1px_var(--color-line)]">
          + {more} {T2.more}
        </span>
      </div>
    </div>
  );
}

/** Mirrors real AB-004 ("Açık kupon kodu alanı sepet terkini artırır mı?"). */
export function AbTestPreview({ lang, compact = false }: { lang: Lang; compact?: boolean }) {
  const T2 = {
    en: {
      category: "Cart & Checkout",
      question: "Does a visible coupon-code field increase cart abandonment?",
      whatToTestLabel: "What to test",
      whatToTest: "Does moving the coupon field behind a link reduce abandonment?",
      kpiLabel: "KPI to track",
      kpi: "Revenue Per Visitor — the primary metric",
      avoidLabel: "What not to do",
      avoid: "Don't change both the position and the copy in the same test.",
    },
    tr: {
      category: "Sepet ve Ödeme",
      question: "Açık kupon kodu alanı sepet terkini artırır mı?",
      whatToTestLabel: "Neyi test et",
      whatToTest: "Kupon alanını bağlantı arkasına almak terk oranını düşürüyor mu?",
      kpiLabel: "Takip edilecek KPI",
      kpi: "Ziyaretçi Başına Gelir (RPV) — birincil metrik",
      avoidLabel: "Ne yapılmamalı",
      avoid: "Aynı testte hem konumu hem metni değiştirmeyin.",
    },
  }[lang];
  return (
    <div aria-hidden className="rounded-t-[12px] bg-paper p-5 pb-2 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(10_16_32/0.04),0_8px_24px_-12px_rgb(10_16_32/0.12)] transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-smooth)] group-hover:scale-[1.01]">
      <div className="flex items-center gap-2">
        <span className="rounded bg-primary-50 px-2 py-1 text-[11px] font-semibold tracking-wide text-primary-700 uppercase">{T2.category}</span>
        <p className="text-[13px] font-semibold text-ink-950">{T2.question}</p>
      </div>
      {/* grid-cols-3 only when NOT compact: the old `sm:grid-cols-3` fired on
          any ≥640px viewport regardless of this panel's own width, which at
          teaser-thumbnail scale (~150px) produced three ~40px slivers of
          hard-wrapped text instead of one readable column. */}
      <div className={`mt-3.5 grid grid-cols-1 gap-2.5 ${compact ? "" : "sm:grid-cols-3"}`}>
        <div className="rounded-lg bg-paper-soft p-3">
          <p className="text-[11px] font-semibold text-ink-500">{T2.whatToTestLabel}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-700">{T2.whatToTest}</p>
        </div>
        <div className="rounded-lg bg-paper-soft p-3">
          <p className="text-[11px] font-semibold text-ink-500">{T2.kpiLabel}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-700">{T2.kpi}</p>
        </div>
        <div className="rounded-lg bg-paper-soft p-3">
          <p className="text-[11px] font-semibold text-ink-500">{T2.avoidLabel}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-700">{T2.avoid}</p>
        </div>
      </div>
    </div>
  );
}

export function DashboardBarsPreview({ project, lang }: { project: Project; lang: Lang }) {
  const T2 = {
    en: { label: "Decision-ready dashboard", tags: ["Comparable", "Cross-platform", "Validated"] },
    tr: { label: "Karara hazır dashboard", tags: ["Karşılaştırılabilir", "Platformlar arası", "Doğrulanmış"] },
  }[lang];
  const heights = [38, 62, 48, 88, 56, 70, 44, 60];
  const fills = [
    "bg-primary-200", "bg-primary-400", "bg-primary-200", "bg-primary-600",
    "bg-primary-400", "bg-primary-200", "bg-primary-200", "bg-primary-400",
  ];
  return (
    <div aria-hidden className="min-h-[190px] rounded-t-[12px] bg-paper p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(10_16_32/0.04),0_8px_24px_-12px_rgb(10_16_32/0.12)] transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-smooth)] group-hover:scale-[1.01]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-semibold text-ink-950">{T2.label}</p>
        <p className="text-xs text-ink-400">{project.proof}</p>
      </div>
      <div className="mt-4 flex h-24 items-end gap-2.5">
        {heights.map((h, i) => (
          <span key={i} className={`flex-1 rounded-t-[3px] ${fills[i]}`} style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="mt-2.5 flex gap-4 border-t border-line pt-2.5 pb-1">
        {T2.tags.map((tag) => (
          <span key={tag} className="text-[11px] text-ink-400">{tag}</span>
        ))}
      </div>
    </div>
  );
}

/** Visual-dominant variant: the search/rows fill more of the panel, and
    one row is tinted to show the tool's real significance-flagging
    behaviour (its actual value prop) rather than a plain change log. */
export function ChangeHistoryPreview({ lang }: { lang: Lang }) {
  const T2 = {
    en: {
      search: "Search changes…",
      rows: [
        ["Campaign budget updated", "Mon 14:02", true],
        ["Keyword paused", "Mon 11:37", false],
        ["Ad copy edited", "Sun 18:20", false],
        ["Bid strategy changed", "Sun 09:14", true],
      ] as const,
    },
    tr: {
      search: "Değişikliklerde ara…",
      rows: [
        ["Kampanya bütçesi güncellendi", "Pzt 14:02", true],
        ["Anahtar kelime duraklatıldı", "Pzt 11:37", false],
        ["Reklam metni düzenlendi", "Paz 18:20", false],
        ["Teklif stratejisi değişti", "Paz 09:14", true],
      ] as const,
    },
  }[lang];
  return (
    <div aria-hidden className="min-h-[240px] rounded-t-[12px] bg-paper p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(10_16_32/0.04),0_8px_24px_-12px_rgb(10_16_32/0.12)] transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-smooth)] group-hover:scale-[1.01]">
      <div className="flex items-center gap-2 rounded-lg bg-paper-soft px-3 py-2 shadow-[inset_0_0_0_1px_var(--color-line)]">
        <Search aria-hidden className="size-3.5 text-ink-400" />
        <span className="text-xs text-ink-400">{T2.search}</span>
      </div>
      <div className="mt-3 flex flex-col">
        {T2.rows.map(([label, time, significant], i) => (
          <div
            key={label}
            className={`flex items-center justify-between gap-3 rounded-md px-2 py-2.5 ${i > 0 ? "mt-0.5" : ""} ${significant ? "bg-primary-50/70" : ""}`}
          >
            <span className="flex items-center gap-2 text-xs text-ink-700">
              {significant && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-primary-600" />}
              {label}
            </span>
            <span className="text-[11px] text-ink-300">{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ToolGridPreview({ lang, size = "md" }: { lang: Lang; size?: "md" | "lg" }) {
  const T2 = {
    en: {
      label: "numerspace.com",
      sub: "75+ tools · EN/TR",
      items: [
        ["Finance", "Compound interest"],
        ["Health", "BMI"],
        ["Career", "Net salary"],
        ["Marketing", "ROAS"],
      ],
    },
    tr: {
      label: "numerspace.com",
      sub: "75+ araç · EN/TR",
      items: [
        ["Finans", "Bileşik faiz"],
        ["Sağlık", "VKİ"],
        ["Kariyer", "Net maaş"],
        ["Pazarlama", "ROAS"],
      ],
    },
  }[lang];
  return (
    <div
      aria-hidden
      className={`rounded-t-[12px] bg-paper p-5 pb-2 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(10_16_32/0.04),0_8px_24px_-12px_rgb(10_16_32/0.12)] transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-smooth)] group-hover:scale-[1.01] ${size === "lg" ? "pt-6" : ""}`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className={size === "lg" ? "text-base font-semibold text-ink-950" : "text-[13px] font-semibold text-ink-950"}>{T2.label}</p>
        <p className="text-xs text-ink-400">{T2.sub}</p>
      </div>
      {/* Column count is driven by `size`, not a viewport breakpoint: the
          old `sm:grid-cols-4` fired on any ≥640px viewport regardless of
          this panel's own width, which crammed 4 columns into a ~150px
          teaser thumbnail and cut every label off mid-word. */}
      <div className={`grid grid-cols-2 gap-2.5 ${size === "lg" ? "sm:grid-cols-4" : ""} ${size === "lg" ? "mt-5" : "mt-3.5"}`}>
        {T2.items.map(([cat, item], i) => (
          <div key={cat} className={`rounded-lg p-3 ${size === "lg" ? "py-5" : ""} ${i === 3 ? "bg-primary-50" : "bg-paper-soft"}`}>
            <p className={`text-[11px] ${i === 3 ? "text-primary-700" : "text-ink-400"}`}>{cat}</p>
            <p className={`mt-1 font-medium ${size === "lg" ? "text-sm" : "text-xs"} ${i === 3 ? "text-primary-700" : "text-ink-700"}`}>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Slug -> preview lookup, shared by LabIndexPage.tsx and Site.tsx's
    homepage Lab teaser. `layout` is only consumed by numerspace's "lg" vs
    "md" sizing (the detail page's finale panel wants the larger variant;
    every other caller gets "md"). */
export const LAB_PREVIEWS: Record<
  string,
  (p: {
    project: Project;
    lang: Lang;
    layout: "stack" | "stack-reverse" | "wide" | "wide-reverse";
    /** True only for the homepage's small teaser thumbnail. Multi-column
        inner grids (AbTestPreview, ToolGridPreview) collapse to one column
        at this scale instead of cramming viewport-breakpoint columns into
        a ~150px frame. LabIndexPage never passes this, so its render is
        unaffected. */
    compact?: boolean;
  }) => ReactNode
> = {
  "claude-lifecycle": ({ lang }) => <JourneyCanvasPreview lang={lang} />,
  "lifecycle-card-archive": ({ lang }) => <CategoryLibraryPreview lang={lang} />,
  "ab-test-playbook": ({ lang, compact }) => <AbTestPreview lang={lang} compact={compact} />,
  "dashboard-builder": ({ project, lang }) => <DashboardBarsPreview project={project} lang={lang} />,
  "google-ads-change-history-dashboard": ({ lang }) => <ChangeHistoryPreview lang={lang} />,
  numerspace: ({ lang, layout, compact }) => (
    <ToolGridPreview lang={lang} size={!compact && layout === "wide-reverse" ? "lg" : "md"} />
  ),
};
