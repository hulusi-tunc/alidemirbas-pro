import { ArrowRight, ArrowUpRight } from "lucide-react";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { Section } from "@/components/ui/Section";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { HoverLift } from "@/components/ui/HoverLift";
import { Reveal } from "@/components/ui/Reveal";
import { LAB_PREVIEWS, type Project } from "@/components/ui/LabPreviews";
import { withJourneyCount } from "@/lib/archive";
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
  const preview = LAB_PREVIEWS[project.slug]?.({ project, lang, layout });

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
