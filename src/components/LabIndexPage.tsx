import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { Section } from "@/components/ui/Section";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { HoverLift } from "@/components/ui/HoverLift";
import { Reveal } from "@/components/ui/Reveal";
import { JOURNEY_COUNT, withJourneyCount } from "@/lib/archive";
import { CATEGORY_COUNT } from "@/lib/canonical-view";
import { copy, type Lang } from "@/lib/content";

/* Lab index — REFINEMENT ROUND. The page was structurally sound (same
   locked system: PortraitContainer, Section, SiteHeader/SiteFooter/
   FinalCta, ink-950/line-soft/rounded-card tokens) but read as one card
   component repeated six times: a rank number, one metadata sentence
   mixing taxonomy and proof together, a circular icon-button duplicating
   the text CTA right below it, and an identical stacked layout on every
   panel regardless of what the project actually is. This pass keeps the
   system and changes the composition:

   - No more 01-06 numbering and no circular arrow buttons (HeaderAction
     is gone) - the text CTAs in ProjectActions were always the real
     navigation; the icon button was a duplicate.
   - Title -> semantic tag pills -> one proof highlight -> description ->
     CTAs -> visual, per project, instead of a single run-on metadata
     line. Tags and proof are separate fields in content.ts now (see that
     file's own note on this reshape) - not derived by slicing a mixed
     array here.
   - Six different compositions sharing one ProjectPanel primitive: the
     two lifecycle projects sit side by side with a shared accent (see
     `isEcosystemTag`) as understated relationship cue, not a merged
     card; A/B Test Playbook gets a wide text-left/larger-visual-right
     panel; Dashboard Builder and the Google Ads explorer sit side by
     side but text-first vs visual-first, a genuine compositional
     contrast rather than a matched pair; Numerspace closes the page as
     a wide, visual-dominant finale (see Projects() below for the exact
     grid).
   - Hero: no stat row (it added taxonomy, not value, per this round's
     brief), new two-sentence intro (content.ts), tightened vertical
     rhythm.

   REAL DATA, NOT INVENTED — unchanged discipline from the previous pass:
   - All 6 projects (names, descriptions, tags, proof, links) are
     `t.lab.projects` from content.ts.
   - The Canonical Journey Library preview's counts/category pills are
     real, live values from the canonical registry (`JOURNEY_COUNT`,
     `CATEGORY_COUNT`), computed at build time.
   - The A/B Test Playbook preview mirrors real entry AB-004 from
     `src/data/ab-tests.json`.
   - The dashboard/change-history/tool-grid previews are small, explicitly
     decorative (`aria-hidden`) illustrations of what each real tool does,
     not a claim of specific historical data. */

const T = {
  en: { heroPrefix: "Things I've been", heroHighlight: "building" },
  tr: { heroPrefix: "Üzerinde", heroHighlight: "çalıştıklarım" },
} as const;

type Project = (typeof copy)[Lang]["lab"]["projects"][number];

/** The one tag the two lifecycle projects share - the understated cue
    that they're parts of the same system without merging their cards.
    Keys off real tag content, not a hardcoded slug list, so it stays
    correct if a project's own tags ever change. */
function isEcosystemTag(tag: string) {
  return tag === "Lifecycle";
}

function TagPill({ tag }: { tag: string }) {
  return (
    <span
      className={
        isEcosystemTag(tag)
          ? "rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700"
          : "rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-ink-500 shadow-[inset_0_0_0_1px_var(--color-line)]"
      }
    >
      {tag}
    </span>
  );
}

/** The proof metric - visibly more present than a tag (larger, tabular,
    its own row) but still an editorial line, not a KPI-card treatment. */
function ProofLine({ proof }: { proof: string }) {
  return <p className="mt-3 text-[15px] font-medium text-ink-950 tabular-nums">{proof}</p>;
}

function ProjectActions({ project }: { project: Project }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {project.links.map((link, i) => {
        const external = link.href.startsWith("http");
        // The first link is always this project's one primary CTA
        // ("Explore project" for the internal route it has, or the
        // single external action where it has no internal page at all -
        // Google Ads Explorer/Numerspace). Only it gets the heavier
        // weight; GitHub/Live demo stay understated secondaries.
        const primary = i === 0;
        const Icon = external ? ArrowUpRight : ArrowRight;
        return (
          <a
            key={link.label}
            href={link.href}
            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
            className={`group/action flex items-center gap-1.5 text-sm transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:text-primary-600 ${
              primary ? "font-medium text-ink-950" : "text-ink-500"
            }`}
          >
            {link.label}
            <Icon
              aria-hidden
              className="size-3.5 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] group-hover/action:translate-x-0.5"
            />
          </a>
        );
      })}
    </div>
  );
}

function Intro({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const tt = T[lang];
  return (
    // pb-6/md:pb-8 (was pb-8/md:pb-12): the stat row that used to fill
    // this space is gone, and with it the reason for the larger gap -
    // per this round's "reduce hero height, keep it spacious, not
    // cramped" brief.
    <Section tone="paper" size="md" className="pb-6! md:pb-8!">
      <PortraitContainer>
        <Reveal>
          <div className="text-center">
            <p className="altor-eyebrow mb-6 text-ink-400">{t.lab.label}</p>
            <h1 className="mx-auto max-w-[16ch] text-balance text-h1-fluid font-medium text-ink-950">
              {tt.heroPrefix}{" "}
              <span className="relative inline-flex translate-y-[0.03em] items-center gap-[0.3em] whitespace-nowrap rounded-full bg-primary-100 px-[0.32em] pb-[0.05em] align-baseline">
                <span aria-hidden className="inline-block size-[0.28em] shrink-0 rounded-full bg-primary-600" />
                {tt.heroHighlight}
              </span>
            </h1>
            {/* mt-5 (was mt-6): the stat row's removal already opens up
                room below; a slightly tighter heading-to-body gap keeps
                the hero from reading as emptier than before rather than
                just shorter. */}
            <p className="mx-auto mt-5 max-w-[46ch] text-lg leading-relaxed text-ink-950/65">
              {t.lab.intro}
            </p>
          </div>
        </Reveal>
      </PortraitContainer>
    </Section>
  );
}

/* -------------------------------------------------------------------- */
/* Per-project decorative previews. Each is `aria-hidden` — illustrative
   of what the real tool actually does, not a second copy of its content.
   Corner radius tightened to ~12px (was 10px) per this round's brief;
   `group-hover:scale-[1.01]` on the outer shell is this round's "the
   product visual, not just the card, responds to hover" touch - HoverLift
   already puts `group` on the card's own hover root (see ProjectPanel). */

function JourneyCanvasPreview({ lang, size = "md" }: { lang: Lang; size?: "md" | "lg" }) {
  const T2 = {
    en: { label: "Journey canvas", nodes: ["Trigger", "Condition", "Wait", "Outcome", "Exit", "Handoff"] },
    tr: { label: "Journey şeması", nodes: ["Tetikleyici", "Koşul", "Bekleme", "Sonuç", "Çıkış", "Devir"] },
  }[lang];
  const [trigger, condition, wait, outcome, exit, handoff] = T2.nodes;
  return (
    <div
      aria-hidden
      className={`rounded-t-[12px] bg-paper p-5 pb-6 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(10_16_32/0.04),0_8px_24px_-12px_rgb(10_16_32/0.12)] transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-smooth)] group-hover:scale-[1.01] ${size === "lg" ? "min-h-[240px]" : "min-h-[190px]"}`}
    >
      <p className="text-[13px] font-semibold text-ink-950">{T2.label}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-primary-100 px-2.5 py-1.5 text-xs font-medium text-primary-700">{trigger}</span>
        <span className="h-px w-3.5 bg-ink-200" />
        <span className="rounded-md bg-paper px-2.5 py-1.5 text-xs font-medium text-ink-700 shadow-[inset_0_0_0_1px_var(--color-line)]">{condition}</span>
        <span className="h-px w-3.5 bg-ink-200" />
        <span className="rounded-md bg-sand-50 px-2.5 py-1.5 text-xs font-medium text-neutral-700 shadow-[inset_0_0_0_1px_var(--color-sand-200)]">{wait}</span>
        <span className="h-px w-3.5 bg-ink-200" />
        <span className="rounded-md bg-[#e8f9e7] px-2.5 py-1.5 text-xs font-medium text-[#2c7a35]">{outcome}</span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className="w-10" />
        <span className="h-3.5 w-px bg-ink-200" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-6" />
        <span className="rounded-md bg-paper px-2.5 py-1.5 text-xs font-medium text-ink-500 shadow-[inset_0_0_0_1px_var(--color-line)]">{exit}</span>
        <span className="h-px w-3.5 bg-ink-200" />
        <span className="rounded-md bg-paper px-2.5 py-1.5 text-xs font-medium text-ink-500 shadow-[inset_0_0_0_1px_var(--color-line)]">{handoff}</span>
      </div>
    </div>
  );
}

/** Real, live counts + a curated real-category highlight. */
function CategoryLibraryPreview({ lang }: { lang: Lang }) {
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
function AbTestPreview({ lang }: { lang: Lang }) {
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
      <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
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

function DashboardBarsPreview({ project, lang }: { project: Project; lang: Lang }) {
  const T2 = {
    en: { label: "Decision-ready dashboard", tags: ["Comparable", "Cross-platform", "Validated"] },
    tr: { label: "Karara hazır dashboard", tags: ["Karşılaştırılabilir", "Platformlar arası", "Doğrulanmış"] },
  }[lang];
  const heights = [42, 68, 54, 88, 62, 74];
  const fills = ["bg-primary-200", "bg-primary-400", "bg-primary-200", "bg-primary-600", "bg-primary-400", "bg-primary-200"];
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
function ChangeHistoryPreview({ lang }: { lang: Lang }) {
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

function ToolGridPreview({ lang, size = "md" }: { lang: Lang; size?: "md" | "lg" }) {
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
      <div className={`grid grid-cols-2 gap-2.5 sm:grid-cols-4 ${size === "lg" ? "mt-5" : "mt-3.5"}`}>
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

/* -------------------------------------------------------------------- */
/* ProjectPanel: one primitive, several compositions. `layout` decides how
   the header (title/tags/proof/desc/CTAs) and the preview relate:

   "stack"        header above preview, both full width - the default for
                  panels that share a half-width row with a neighbour.
   "stack-reverse" preview above header - used once (Google Ads), so its
                  half-width row visibly contrasts with its neighbour's
                  text-first "stack" instead of matching it.
   "wide"         two-column, text left / preview right, preview the
                  wider of the two - A/B Test Playbook.
   "wide-reverse" two-column, preview left / text right, preview
                  significantly the wider column - Numerspace's finale. */
function ProjectPanel({
  project, lang, layout = "stack", delay,
}: {
  project: Project;
  lang: Lang;
  layout?: "stack" | "stack-reverse" | "wide" | "wide-reverse";
  delay: number;
}) {
  const desc = withJourneyCount(project.desc);
  const proof = project.proof ? withJourneyCount(project.proof) : null;
  const preview = PREVIEWS[project.slug]?.({ project, lang, layout });

  const header = (
    <div className={layout === "wide" || layout === "wide-reverse" ? "pb-7 md:pb-9" : ""}>
      <h2 className="text-[1.375rem] leading-[1.15] font-semibold tracking-tight text-ink-950 text-balance">
        {project.name}
      </h2>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.tags.map((tag) => <TagPill key={tag} tag={tag} />)}
      </div>
      {proof && <ProofLine proof={proof} />}
      <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-ink-950/65">{desc}</p>
      <div className="mt-4">
        <ProjectActions project={project} />
      </div>
    </div>
  );

  const isWide = layout === "wide" || layout === "wide-reverse";
  const reverse = layout === "stack-reverse" || layout === "wide-reverse";

  return (
    <Reveal delay={delay}>
      {/* `group` here (not on the article) is what lets the preview's
          `group-hover:scale-[1.01]` and this card's own `hover:` styles
          both key off the SAME hover root that HoverLift already tracks. */}
      <HoverLift distance={2} className="group h-full">
        <article
          className={`flex h-full flex-col overflow-hidden rounded-card bg-paper-soft px-7 pt-7 transition-colors duration-[var(--duration-base)] sm:px-9 sm:pt-9 ${
            isWide ? "gap-2" : "gap-6"
          }`}
        >
          {isWide ? (
            <div
              className={`grid grid-cols-1 items-end gap-6 md:gap-8 ${
                layout === "wide-reverse"
                  ? "md:grid-cols-[minmax(0,1.22fr)_minmax(0,0.78fr)]"
                  : "md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
              }`}
            >
              {reverse ? (
                // Explicit col-start placement, not `order` - `order` on a
                // grid item also reorders it into the auto-placement
                // sequence, which silently swapped which fr-track each
                // side landed in (the preview ended up in the NARROW
                // column, the opposite of "finale, visual-dominant"). DOM
                // order stays header-then-preview (so mobile still stacks
                // text-first with no extra styling); only the desktop grid
                // position is reassigned.
                <>
                  <div className="md:col-start-2 md:row-start-1">{header}</div>
                  <div className="md:col-start-1 md:row-start-1">{preview}</div>
                </>
              ) : (
                <>
                  {header}
                  {preview}
                </>
              )}
            </div>
          ) : reverse ? (
            <>
              {preview}
              {header}
            </>
          ) : (
            <>
              {header}
              {preview}
            </>
          )}
        </article>
      </HoverLift>
    </Reveal>
  );
}

const PREVIEWS: Record<
  string,
  (p: { project: Project; lang: Lang; layout: "stack" | "stack-reverse" | "wide" | "wide-reverse" }) => ReactNode
> = {
  "claude-lifecycle": ({ lang }) => <JourneyCanvasPreview lang={lang} />,
  "lifecycle-card-archive": ({ lang }) => <CategoryLibraryPreview lang={lang} />,
  "ab-test-playbook": ({ lang }) => <AbTestPreview lang={lang} />,
  "dashboard-builder": ({ project, lang }) => <DashboardBarsPreview project={project} lang={lang} />,
  "google-ads-change-history-dashboard": ({ lang }) => <ChangeHistoryPreview lang={lang} />,
  numerspace: ({ lang, layout }) => <ToolGridPreview lang={lang} size={layout === "wide-reverse" ? "lg" : "md"} />,
};

/* Six projects, six compositions sharing one system:

   Row 1 - the two lifecycle projects, side by side, both "stack"
   (text above preview - the natural shape at half width). Their shared
   "Lifecycle" tag renders in the accent colour on both (isEcosystemTag),
   the understated cue that they're one system without merging the cards.

   Row 2 - A/B Test Playbook, full width, "wide": text left, its
   three-column example noticeably wider on the right - this is the
   ~15-25% larger visual the brief asked for, and reads naturally at
   full width where the half-width row above couldn't fit it.

   Row 3 - Dashboard Builder ("stack", text-first) beside the Google Ads
   explorer ("stack-reverse", visual-first) - two panels that are
   genuinely differently composed rather than a matched pair.

   Row 4 - Numerspace, full width, "wide-reverse": preview LEFT (mirroring
   row 2's text-left so the page doesn't repeat one axis), and the widest
   preview column on the page - the finale the brief asked for, not just
   the last item in the list. */
function Projects({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const all = t.lab.projects;
  return (
    // pt-6/md:pt-8 (was pt-4/md:pt-6): a touch more room now that the
    // hero's stat row is gone, so the two sections don't read as
    // touching.
    <Section tone="paper" size="md" className="pt-6! md:pt-8!">
      <PortraitContainer>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ProjectPanel project={all[0]} lang={lang} delay={0} />
            <ProjectPanel project={all[1]} lang={lang} delay={60} />
          </div>
          <ProjectPanel project={all[2]} lang={lang} layout="wide" delay={120} />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ProjectPanel project={all[3]} lang={lang} delay={180} />
            <ProjectPanel project={all[4]} lang={lang} layout="stack-reverse" delay={240} />
          </div>
          <ProjectPanel project={all[5]} lang={lang} layout="wide-reverse" delay={300} />
        </div>
      </PortraitContainer>
    </Section>
  );
}

export default function LabIndexPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? "/tr/lab" : "/lab";
  return (
    <>
      <SiteHeader t={t} anchorBase={home} langHref={langHref} />
      <main>
        <Intro t={t} lang={lang} />
        <Projects t={t} lang={lang} />
        {/* FinalCta is a shared component (Site.tsx, ~11 page families) —
            consumed exactly as before, not modified. */}
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
