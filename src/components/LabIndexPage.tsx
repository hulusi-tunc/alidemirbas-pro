import { ArrowUpRight } from "lucide-react";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { Section } from "@/components/ui/Section";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { HoverLift } from "@/components/ui/HoverLift";
import { Reveal } from "@/components/ui/Reveal";
import { withJourneyCount } from "@/lib/archive";
import { copy, type Lang } from "@/lib/content";

/* Lab index — PORTRAIT PILOT, continuing the locked visual system from
   Contact/Stack/Blog (PORTRAIT-DESIGN-SOURCE-AUDIT.md remains this round's
   source of truth). Same rules as those rounds: reuse the locked tokens/
   patterns verbatim, don't invent a second design language, don't touch
   Home/About/Calculators/Journey-internals/global chrome.

   SHARED-COMPONENT NOTE: `LabProjectGrid.tsx` (the old card grid) is used
   by BOTH this page and the Home page's own Lab teaser section
   (`Site.tsx`) — confirmed by grep before touching anything. Since Home
   is explicitly out of scope this round, that file is NOT modified and
   NOT imported here; this file's own `FeaturedProjectCard`/
   `SecondaryProjectRow` below are new, but local to this page only (not
   a new shared primitive) — Home's Lab teaser keeps its exact current
   look, untouched.

   REAL DATA, NOT INVENTED: all 6 projects, names, descriptions, tags and
   links below are `t.lab.projects` from content.ts, unchanged. The
   featured/secondary split is a LOCAL, EXPLICIT list (`FEATURED_SLUGS`)
   rather than a change to the shared data model, per this round's own
   "derive a local explicit featured list instead of changing global data
   architecture" instruction — content.ts's own project array order and
   fields are untouched. */

const FEATURED_SLUGS = [
  "claude-lifecycle",
  "lifecycle-card-archive",
  "ab-test-playbook",
  "dashboard-builder",
  "google-ads-change-history-dashboard",
];

function Intro({ t }: { t: (typeof copy)[Lang] }) {
  return (
    // Light, open composition — same LOCKED reasoning as Contact/Stack/
    // Blog: no dark band, no gradient, no collage, no counters. `Intro`
    // is local to this file, so this is fully scoped to Lab.
    //
    // `pb-14!`/`md:pb-13!`: shrinks this section's own bottom padding at
    // every width — `md:pb-16!` originally (round 1), reduced again this
    // polish round per approval feedback: real measured hero->Featured
    // gap was 128px at 1440/820 (now ~104px, -18.75%) and 144px at 375
    // (now ~128px, -11%, a lighter touch than desktop's, per "mobilde
    // hafifçe azalt"). Paired with Projects' own `md:pt-13!` below for
    // the desktop/tablet side of the reduction; mobile's reduction is
    // 100% from this side (Projects' base `pt` is untouched).
    <Section tone="paper" size="md" className="pb-14! md:pb-13!">
      <PortraitContainer>
        <Reveal>
          <p className="altor-eyebrow mb-4 text-ink-400">{t.lab.label}</p>
          <h1 className="max-w-md text-h1-fluid font-medium text-ink-950">{t.lab.title}</h1>
          <p className="mt-3 max-w-md text-lg leading-relaxed text-ink-950/65">{t.lab.intro}</p>
        </Reveal>
      </PortraitContainer>
    </Section>
  );
}

type Project = (typeof copy)[Lang]["lab"]["projects"][number];

/** First tag doubles as the project's category — real data (`tags[0]` is
    always a type/category label like "Claude Code Plugin" or "Python" in
    every one of the 6 real entries, verified by reading content.ts
    directly), not a separately-authored field. */
function categoryOf(project: Project) {
  return project.tags[0];
}

/** The remaining tags are the real, factual metadata (counts, scope) —
    shown as one muted line, not a badge per tag ("no badges everywhere",
    per this round's own instruction). `withJourneyCount` resolves the
    `{count}`/`{categories}`/`{rules}` tokens Canonical Journey Library's
    own tags carry, from the real canonical registry — same helper
    LabProjectGrid.tsx already used, not a new counting mechanism. */
function metadataOf(project: Project) {
  return project.tags.slice(1, -1).map((tag) => withJourneyCount(tag)).join(" · ");
}

function ProjectAction({ label, href }: { label: string; href: string }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="group/action flex items-center gap-1.5 text-sm font-medium text-ink-900 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:text-ink-600"
    >
      {label}
      <ArrowUpRight
        aria-hidden
        className="size-3.5 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5"
      />
    </a>
  );
}

/* Featured project card. Locked surface grammar, reused verbatim from
   Blog's own grid card (rounded-card + ring-line-soft + shadow-sm at
   rest, matching Portrait's real confirmed repeating-tile pattern —
   PORTRAIT-DESIGN-SOURCE-AUDIT.md §6/§7) — "feels like the same website"
   per this round's own brief, not a new card system.

   INTERACTION SAFETY: a project with exactly one real link renders as one
   whole-card `<Link>` (HoverLift's already-established -translate-y on
   hover, same as Blog cards). A project with two real, DIFFERENT link
   targets (e.g. "view the tool" vs. "view on GitHub") does NOT make the
   whole card one ambiguous link — nesting or conflating two distinct
   destinations under one click target is not semantically safe, per this
   round's own conditional wording ("if semantically safe"). Those render
   as a non-link surface with both real actions as separate, clearly
   labeled rows instead. */
function FeaturedProjectCard({ project, delay }: { project: Project; delay: number }) {
  const category = categoryOf(project);
  const metadata = metadataOf(project);
  const desc = withJourneyCount(project.desc);

  const body = (
    <>
      <span className="w-fit rounded-full bg-paper-soft px-2.5 py-1 text-xs text-ink-950/65 ring-1 ring-line-soft">
        {category}
      </span>
      <h3 className="mt-4 text-lg font-medium tracking-tight text-ink-950">{project.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-950/65">{desc}</p>
      {/* mt-3 -> mt-4 (desc->metadata): a very light loosening, per
          approval feedback — description/metadata/actions read as one
          undifferentiated block at the tighter spacing. +4px, not enough
          to notably grow card height. */}
      {metadata && <p className="mt-4 text-xs text-ink-950/65">{metadata}</p>}
    </>
  );

  if (project.links.length === 1) {
    const link = project.links[0];
    const external = link.href.startsWith("http");
    return (
      <Reveal delay={delay}>
        <HoverLift distance={3}>
          <a
            href={link.href}
            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
            className="group flex h-full flex-col rounded-card bg-paper p-7 ring-1 ring-line-soft shadow-sm transition-shadow duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] hover:shadow-[var(--shadow-card-hover)]"
          >
            {body}
            {/* mt-5 -> mt-6 (metadata->actions): same very-light loosening
                as the desc->metadata gap above. */}
            <span className="mt-6 flex items-center gap-1.5 text-sm font-medium text-ink-900">
              {link.label}
              <ArrowUpRight
                aria-hidden
                className="size-3.5 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </a>
        </HoverLift>
      </Reveal>
    );
  }

  return (
    <Reveal delay={delay}>
      <div className="flex h-full flex-col rounded-card bg-paper p-7 ring-1 ring-line-soft shadow-sm">
        {body}
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
          {project.links.map((link) => (
            <ProjectAction key={link.label} label={link.label} href={link.href} />
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/* Secondary/"Other tools" row — compact, per this round's own "render in
   a more compact secondary list/grid" instruction. Numerspace is the only
   real project outside FEATURED_SLUGS today; the row-based (not card-
   grid) treatment is what "compact" means with one real item, rather than
   forcing a whole second grid for a single row. */
function SecondaryProjectRow({ project, delay }: { project: Project; delay: number }) {
  const category = categoryOf(project);
  const link = project.links[0];
  const external = link.href.startsWith("http");
  const desc = withJourneyCount(project.desc);

  return (
    <Reveal delay={delay}>
      <a
        href={link.href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className="group flex flex-col gap-3 border-t border-line-soft py-6 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-base font-medium text-ink-950">{project.name}</h3>
            <span className="rounded-full bg-paper-soft px-2.5 py-1 text-xs text-ink-950/65 ring-1 ring-line-soft">
              {category}
            </span>
          </div>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-950/65">{desc}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-ink-900 transition-colors group-hover:text-ink-600">
          {link.label}
          <ArrowUpRight
            aria-hidden
            className="size-3.5 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-smooth)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </span>
      </a>
    </Reveal>
  );
}

function Projects({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const all = t.lab.projects;
  const featured = FEATURED_SLUGS.map((slug) => all.find((p) => p.slug === slug)).filter(
    (p): p is Project => Boolean(p),
  );
  const secondary = all.filter((p) => !FEATURED_SLUGS.includes(p.slug));

  const T = {
    en: { featured: "Featured", other: "Other tools" },
    tr: { featured: "Öne çıkanlar", other: "Diğer araçlar" },
  } as const;
  const labels = T[lang];

  return (
    // `md:pt-13!`: paired with Intro's `md:pb-13!` above — see that
    // function's own comment for the reasoning. Mobile's own `pt` here is
    // deliberately untouched — the mobile reduction lives entirely on
    // Intro's `pb-14!` side, per approval feedback's "hafifçe azalt".
    <Section tone="paper" size="md" className="md:pt-13!">
      <PortraitContainer>
        {/* Section label style reused verbatim from Stack's category
            headings (LOCKED look, not reinvented for this page). */}
        <h2 className="border-b border-line-soft pb-2 text-base font-medium tracking-tight text-ink-950">
          {labels.featured}
        </h2>
        {/* `md:grid-cols-2` (not `lg:`): checked at 820px specifically -
            each column lands at ~366px there, comfortable for the 2-3
            line descriptions and the 2-action rows some cards carry, so
            tablet gets the 2-column layout the brief suggested rather
            than falling back to 1 column until 1024px. */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {featured.map((project, i) => (
            <FeaturedProjectCard key={project.slug} project={project} delay={i * 60} />
          ))}
        </div>

        {secondary.length > 0 && (
          <div className="mt-14">
            <h2 className="border-b border-line-soft pb-2 text-base font-medium tracking-tight text-ink-950">
              {labels.other}
            </h2>
            <div className="flex flex-col">
              {secondary.map((project, i) => (
                <SecondaryProjectRow key={project.slug} project={project} delay={featured.length * 60 + i * 60} />
              ))}
            </div>
          </div>
        )}
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
        <Intro t={t} />
        <Projects t={t} lang={lang} />
        {/* FinalCta is a shared component (Site.tsx, ~11 page families) —
            consumed exactly as before, not modified. */}
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
