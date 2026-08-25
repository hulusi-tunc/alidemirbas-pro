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

/* Lab index — "Lab_Page_v4" mockup, converted to real code against real
   data. Same locked system as the rest of the site (PortraitContainer,
   Section, SiteHeader/SiteFooter/FinalCta, ink-950/line-soft/rounded-card
   tokens); the bespoke bits (the pill-highlighted hero word, the
   numbered/preview-panel project cards) are new to this page only, per
   the mockup, not retrofitted onto Blog/Stack/Calculators.

   REAL DATA, NOT INVENTED — same discipline as the previous Lab pass:
   - All 6 projects (names, descriptions, tags, links) are `t.lab.projects`
     from content.ts, unchanged, in their existing order (which already
     matches the mockup's 01-06 numbering).
   - The hero's project-type stat row is DERIVED from those same 6
     projects' real `tags[0]` category, grouped and counted here
     (`CATEGORY_STAT_LABEL` is a local, editorial relabeling of a real
     category into a friendlier stat word — e.g. "CRM" -> "journey
     library" for the one Canonical Journey Library entry — not a
     separate invented figure).
   - The Canonical Journey Library preview's "255 journeys / 26
     categories" and its category pills are real, live values from the
     canonical registry (`JOURNEY_COUNT`, `CATEGORY_COUNT`, the 11
     category ids below) — computed at build time, not copied from the
     mockup as static numbers, so they can't drift from the real archive.
   - The A/B Test Playbook preview mirrors one real entry from
     `src/data/ab-tests.json` (id AB-004, "Açık kupon kodu alanı sepet
     terkini artırır mı?" / cart-abandonment coupon field), with an EN
     paraphrase for the English page (matching that entry's own real
     `seoTitle`) and the real Turkish text on the Turkish page — not an
     invented example.
   - The dashboard/change-history/tool-grid previews are small, explicitly
     decorative (`aria-hidden`) illustrations of what each real tool does,
     same treatment as BlogCard's own decorative pattern zone — not a
     claim of specific historical data. */

const T = {
  en: {
    heroPrefix: "Things I've been",
    heroHighlight: "building",
    projectsLabel: (n: number) => `${n} project${n === 1 ? "" : "s"}`,
  },
  tr: {
    heroPrefix: "Üzerinde",
    heroHighlight: "çalıştıklarım",
    projectsLabel: (n: number) => `${n} proje`,
  },
} as const;

/** Local, editorial relabeling of a real `tags[0]` category into the
    friendlier noun the hero stat row uses — see this file's own top
    comment. Every key here is a real category that appears in
    `t.lab.projects`; nothing here is a category that doesn't exist. */
const CATEGORY_STAT_LABEL: Record<string, { en: string; tr: string }> = {
  "Claude Code Plugin": { en: "Claude Code plugin", tr: "Claude Code eklentisi" },
  CRM: { en: "journey library", tr: "journey kütüphanesi" },
  Python: { en: "Python tool", tr: "Python aracı" },
  "Web App": { en: "web app", tr: "web uygulaması" },
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

type Project = (typeof copy)[Lang]["lab"]["projects"][number];

function categoryOf(project: Project) {
  return project.tags[0];
}

/** Same helper as before: the real, factual middle tags, joined as one
    muted metadata line rather than a badge per tag. */
function metadataOf(project: Project) {
  return project.tags.slice(1, -1).map((tag) => withJourneyCount(tag)).join(" · ");
}

function Intro({ t, lang, all }: { t: (typeof copy)[Lang]; lang: Lang; all: readonly Project[] }) {
  const tt = T[lang];

  // Real per-category counts, in first-seen project order — see this
  // file's own top comment.
  const stats: { count: number; label: string }[] = [];
  const seenCats = new Set<string>();
  const countOf = new Map<string, number>();
  for (const p of all) {
    const cat = categoryOf(p);
    countOf.set(cat, (countOf.get(cat) ?? 0) + 1);
  }
  for (const p of all) {
    const cat = categoryOf(p);
    if (seenCats.has(cat)) continue;
    seenCats.add(cat);
    const count = countOf.get(cat) ?? 0;
    const stat = CATEGORY_STAT_LABEL[cat]?.[lang] ?? cat;
    stats.push({ count, label: `${stat}${count === 1 ? "" : "s"}` });
  }

  return (
    <Section tone="paper" size="md" className="pb-8! md:pb-12!">
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
            <p className="mx-auto mt-6 max-w-[46ch] text-lg leading-relaxed text-ink-950/65">
              {t.lab.intro}
            </p>
            <div className="mx-auto mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] tabular-nums">
              <span className="font-medium text-ink-950">{tt.projectsLabel(all.length)}</span>
              {stats.map((s) => (
                <span key={s.label} className="text-ink-400">
                  {s.count} {s.label}
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </PortraitContainer>
    </Section>
  );
}

/** Round icon button in each panel's header — external links get the
    diagonal arrow, internal routes get the horizontal one, matching the
    mockup's own two glyphs exactly. */
function HeaderAction({ project, link }: { project: Project; link: Project["links"][number] }) {
  const external = link.href.startsWith("http");
  const label = link.href.includes("github.com")
    ? `${project.name} on GitHub`
    : external
      ? link.label.replace(/\s*↗?\s*$/, "")
      : `Explore the ${project.name}`;
  const Icon = external ? ArrowUpRight : ArrowRight;
  return (
    <a
      href={link.href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      aria-label={label}
      className="group/icon flex size-10 shrink-0 items-center justify-center rounded-full bg-ink-950 text-white transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:bg-primary-600"
    >
      <Icon aria-hidden className="size-4" />
    </a>
  );
}

function ProjectActions({ project }: { project: Project }) {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2">
      {project.links.map((link) => {
        const external = link.href.startsWith("http");
        return (
          <a
            key={link.label}
            href={link.href}
            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
            className="group/action flex items-center gap-1.5 text-sm font-medium text-ink-900 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:text-primary-600"
          >
            {link.label}
            <ArrowUpRight
              aria-hidden
              className="size-3.5 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5"
            />
          </a>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Per-project decorative previews. Each is `aria-hidden` — illustrative
   of what the real tool actually does, not a second copy of its content. */

function JourneyCanvasPreview({ lang }: { lang: Lang }) {
  const T2 = {
    en: { label: "Journey canvas", nodes: ["Trigger", "Condition", "Wait", "Outcome", "Exit", "Handoff"] },
    tr: { label: "Journey şeması", nodes: ["Tetikleyici", "Koşul", "Bekleme", "Sonuç", "Çıkış", "Devir"] },
  }[lang];
  const [trigger, condition, wait, outcome, exit, handoff] = T2.nodes;
  return (
    <div aria-hidden className="mt-7 min-h-[190px] rounded-t-[10px] bg-paper p-5 pb-6 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(10_16_32/0.04),0_8px_24px_-12px_rgb(10_16_32/0.12)]">
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

/** Real, live counts + a curated real-category highlight — see this
    file's own top comment. */
function CategoryLibraryPreview({ lang }: { lang: Lang }) {
  const T2 = { en: { journeys: "journeys", categories: "categories", more: "more" }, tr: { journeys: "journey", categories: "kategori", more: "daha" } }[lang];
  // A curated highlight, not the full 26 — every id below is a real
  // category id in the canonical registry (verified against
  // `@/canonical`'s own CATEGORIES export). `+N more` is computed from
  // the real CATEGORY_COUNT, so it can't drift as the registry grows.
  const HIGHLIGHT = ["Activation", "Communication", "Consent", "Decision", "Feedback", "Financial", "Incident", "Retention", "Risk", "Scheduling", "Subscription"];
  const more = Math.max(CATEGORY_COUNT - HIGHLIGHT.length, 0);
  return (
    <div aria-hidden className="mt-7 min-h-[190px] rounded-t-[10px] bg-paper p-5 pb-6 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(10_16_32/0.04),0_8px_24px_-12px_rgb(10_16_32/0.12)]">
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

/** Mirrors real AB-004 ("Açık kupon kodu alanı sepet terkini artırır mı?")
    — see this file's own top comment. */
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
    <div aria-hidden className="rounded-t-[10px] bg-paper p-5 pb-2 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(10_16_32/0.04),0_8px_24px_-12px_rgb(10_16_32/0.12)]">
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
  const templates = project.tags[2]; // real tag: "11 dashboard templates"
  const T2 = {
    en: { label: "Decision-ready dashboard", tags: ["Comparable", "Cross-platform", "Validated"] },
    tr: { label: "Karara hazır dashboard", tags: ["Karşılaştırılabilir", "Platformlar arası", "Doğrulanmış"] },
  }[lang];
  const heights = [42, 68, 54, 88, 62, 74];
  const fills = ["bg-primary-200", "bg-primary-400", "bg-primary-200", "bg-primary-600", "bg-primary-400", "bg-primary-200"];
  return (
    <div aria-hidden className="mt-7 min-h-[190px] rounded-t-[10px] bg-paper p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(10_16_32/0.04),0_8px_24px_-12px_rgb(10_16_32/0.12)]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-semibold text-ink-950">{T2.label}</p>
        <p className="text-xs text-ink-400">{templates}</p>
      </div>
      <div className="mt-4.5 flex h-24 items-end gap-2.5">
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

function ChangeHistoryPreview({ lang }: { lang: Lang }) {
  const T2 = {
    en: {
      search: "Search changes…",
      rows: [
        ["Campaign budget updated", "Mon 14:02"],
        ["Keyword paused", "Mon 11:37"],
        ["Ad copy edited", "Sun 18:20"],
      ],
    },
    tr: {
      search: "Değişikliklerde ara…",
      rows: [
        ["Kampanya bütçesi güncellendi", "Pzt 14:02"],
        ["Anahtar kelime duraklatıldı", "Pzt 11:37"],
        ["Reklam metni düzenlendi", "Paz 18:20"],
      ],
    },
  }[lang];
  return (
    <div aria-hidden className="mt-7 min-h-[190px] rounded-t-[10px] bg-paper p-5 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(10_16_32/0.04),0_8px_24px_-12px_rgb(10_16_32/0.12)]">
      <div className="flex items-center gap-2 rounded-lg bg-paper-soft px-3 py-2 shadow-[inset_0_0_0_1px_var(--color-line)]">
        <Search aria-hidden className="size-3.5 text-ink-400" />
        <span className="text-xs text-ink-400">{T2.search}</span>
      </div>
      <div className="mt-3 flex flex-col">
        {T2.rows.map(([label, time], i) => (
          <div key={label} className={`flex items-center justify-between gap-3 py-2.5 ${i > 0 ? "border-t border-[#eef0f4]" : ""}`}>
            <span className="text-xs text-ink-700">{label}</span>
            <span className="text-[11px] text-ink-300">{time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolGridPreview({ lang }: { lang: Lang }) {
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
    <div aria-hidden className="rounded-t-[10px] bg-paper p-5 pb-2 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(10_16_32/0.04),0_8px_24px_-12px_rgb(10_16_32/0.12)]">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13px] font-semibold text-ink-950">{T2.label}</p>
        <p className="text-xs text-ink-400">{T2.sub}</p>
      </div>
      <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {T2.items.map(([cat, item], i) => (
          <div key={cat} className={`rounded-lg p-3 ${i === 3 ? "bg-primary-50" : "bg-paper-soft"}`}>
            <p className={`text-[11px] ${i === 3 ? "text-primary-700" : "text-ink-400"}`}>{cat}</p>
            <p className={`mt-1 text-xs font-medium ${i === 3 ? "text-primary-700" : "text-ink-700"}`}>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const PREVIEWS: Record<string, (p: { project: Project; lang: Lang }) => ReactNode> = {
  "claude-lifecycle": ({ lang }) => <JourneyCanvasPreview lang={lang} />,
  "lifecycle-card-archive": ({ lang }) => <CategoryLibraryPreview lang={lang} />,
  "ab-test-playbook": ({ lang }) => <AbTestPreview lang={lang} />,
  "dashboard-builder": ({ project, lang }) => <DashboardBarsPreview project={project} lang={lang} />,
  "google-ads-change-history-dashboard": ({ lang }) => <ChangeHistoryPreview lang={lang} />,
  numerspace: ({ lang }) => <ToolGridPreview lang={lang} />,
};

/* One panel, two layouts: `wide` (a two-column split — text left, preview
   right, on the mockup's row-3 items) and the default stacked layout
   (paired two-up in a grid). Both share the same header/body markup. */
function ProjectPanel({
  project, index, lang, wide, delay,
}: {
  project: Project;
  index: number;
  lang: Lang;
  wide?: boolean;
  delay: number;
}) {
  const category = categoryOf(project);
  const metadata = metadataOf(project);
  const desc = withJourneyCount(project.desc);
  const preview = PREVIEWS[project.slug]?.({ project, lang });

  const header = (
    <div className={wide ? "pb-7 md:pb-10" : ""}>
      <p className="text-sm text-ink-500 tabular-nums">{pad2(index + 1)} · {category}</p>
      <div className="mt-3 flex items-start justify-between gap-5">
        <h2 className="text-[1.375rem] leading-[1.15] font-semibold tracking-tight text-ink-950 text-balance">
          {project.name}
        </h2>
        <HeaderAction project={project} link={project.links[0]} />
      </div>
      <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-ink-950/65">{desc}</p>
      {metadata && <p className="mt-3 text-xs text-ink-400 tabular-nums">{metadata}</p>}
      <div className="mt-3.5">
        <ProjectActions project={project} />
      </div>
    </div>
  );

  return (
    <Reveal delay={delay}>
      <HoverLift distance={3}>
        <article className="flex h-full flex-col overflow-hidden rounded-card bg-paper-soft px-7 pt-7 sm:px-9 sm:pt-9">
          {wide ? (
            <div className="grid grid-cols-1 items-end gap-2 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              {header}
              {preview}
            </div>
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

function Projects({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const all = t.lab.projects;
  return (
    <Section tone="paper" size="md" className="pt-4! md:pt-6!">
      <PortraitContainer>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ProjectPanel project={all[0]} index={0} lang={lang} delay={0} />
            <ProjectPanel project={all[1]} index={1} lang={lang} delay={60} />
          </div>
          <ProjectPanel project={all[2]} index={2} lang={lang} wide delay={120} />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ProjectPanel project={all[3]} index={3} lang={lang} delay={180} />
            <ProjectPanel project={all[4]} index={4} lang={lang} delay={240} />
          </div>
          <ProjectPanel project={all[5]} index={5} lang={lang} wide delay={300} />
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
        <Intro t={t} lang={lang} all={t.lab.projects} />
        <Projects t={t} lang={lang} />
        {/* FinalCta is a shared component (Site.tsx, ~11 page families) —
            consumed exactly as before, not modified. */}
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
