import { ArrowRight, ArrowUpRight } from "lucide-react";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { Reveal } from "@/components/ui/Reveal";
import { LAB_PREVIEWS, type Project } from "@/components/ui/LabPreviews";
import { withJourneyCount } from "@/lib/archive";
import { copy, type Lang } from "@/lib/content";
import { breadcrumbList } from "@/lib/schema";
import { JsonLdScript } from "@/components/ui/JsonLdScript";

/* Lab index — LANDING-PAGE REDESIGN (2026-08-31).

   The page was six instances of one card stacked in a column: same ground,
   same shape, same rhythm, top to bottom. It read as an index, and the
   brief was that it should read as a product landing page - sections that
   differentiate, grounds that change, scroll that has movement in it.

   THE STRUCTURE. A clean opening, then one BAND PER PROJECT rather than
   one card per project. Each band owns a full stripe of the page and the
   ground alternates paper -> tinted -> paper, so no two neighbours share a
   backdrop - the "her section farklı" note, executed as a real tone change
   rather than a border.

   THE SCROLL. Inside every band the text column is `lg:sticky` and the
   visual is what moves past it, so the project's name and claim stay
   parked while its evidence scrolls - the sticky-scroll feel, with no
   JavaScript and no scroll listener. `Reveal` (already in the system)
   fades each band in on entry. Both are neutralised under
   `prefers-reduced-motion` by the global rule in globals.css.

   THE VISUALS ARE STILL THE REAL TOOLS. Every preview is the same
   LAB_PREVIEWS component the page already used - real journey-canvas
   nodes, the real category registry counts, the real AB-004 record. What
   changed is their PRESENTATION: each one now sits on a raised stage
   (rounded plate, soft shadow, its own ground) at a much larger size, the
   "in-app görsellerin kalitesi" note. No generated product screenshot,
   no mocked dashboard, no invented number - the site's own absolute rule
   (AGENTS.md), and these pages exist precisely to prove the tools are
   real.

   NO BACKDROP ART, ANYWHERE ON THIS PAGE. Three were tried and all three
   were rejected: an ink-950 hero slab with a blue gradient, CSS brand
   blooms, and Higgsfield-generated parallax layers behind the hero, plus
   two generated grounds behind the bands. The page carries itself on type,
   tone changes between bands, and the real tool previews - which is the
   quieter and, on this evidence, the correct answer. `ParallaxField` and
   the generated files are deleted rather than left switched off, so
   nobody re-enables them by accident. */

const T = {
  en: {
    heroPrefix: "Things I've been",
    heroHighlight: "building",
    scrollCue: "Six projects",
    sectionLabel: (i: number, total: number) => `${String(i).padStart(2, "0")} / ${String(total).padStart(2, "0")}`,
  },
  tr: {
    heroPrefix: "Üzerinde",
    heroHighlight: "çalıştıklarım",
    scrollCue: "Altı proje",
    sectionLabel: (i: number, total: number) => `${String(i).padStart(2, "0")} / ${String(total).padStart(2, "0")}`,
  },
} as const;

/** The one tag the two lifecycle projects share - the understated cue
    that they're parts of the same system without merging their cards. */
function isEcosystemTag(tag: string) {
  return tag === "Lifecycle";
}

function TagPill({ tag, onDark = false }: { tag: string; onDark?: boolean }) {
  if (onDark) {
    return (
      <span
        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
          isEcosystemTag(tag) ? "bg-primary-500/25 text-blue-100" : "bg-white/10 text-white/70"
        }`}
      >
        {tag}
      </span>
    );
  }
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
        isEcosystemTag(tag) ? "bg-primary-50 text-primary-700" : "bg-paper text-ink-500"
      }`}
    >
      {tag}
    </span>
  );
}

function ProjectActions({ project, onDark = false }: { project: Project; onDark?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {project.links.map((link, i) => {
        const external = link.href.startsWith("http");
        const primary = i === 0;
        const Icon = external ? ArrowUpRight : ArrowRight;
        return (
          <a
            key={link.label}
            href={link.href}
            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
            className={`group/action flex items-center gap-1.5 text-sm transition-colors duration-[var(--duration-fast)] ${
              onDark
                ? primary
                  ? "font-medium text-white hover:text-blue-200"
                  : "text-white/60 hover:text-white"
                : primary
                  ? "font-medium text-ink-950 hover:text-primary-600"
                  : "text-ink-500 hover:text-primary-600"
            }`}
          >
            {link.label}
            <Icon
              aria-hidden
              className="size-3.5 transition-transform duration-[var(--duration-fast)] group-hover/action:translate-x-0.5"
            />
          </a>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- HERO */

function LabHero({ t, lang, projects }: { t: (typeof copy)[Lang]; lang: Lang; projects: Project[] }) {
  const tt = T[lang];

  return (
    /* CLEAN WHITE, AND NOTHING BEHIND IT. This band has been through three
       backdrops - an ink-950 slab with a blue gradient, then CSS brand
       blooms, then the generated parallax layers - and every one of them
       was rejected. The decision now is that the hero has no ground at
       all: paper, centred type, the six real projects under it. The art
       that was here is not "temporarily off", it is gone; the page gets
       its interest from the banded sections below instead. */
    <section className="bg-paper pt-20 pb-24 text-center md:pt-28 md:pb-32">
      <div className="altor-container relative">
        <Reveal>
          <p className="text-[13px] font-medium text-ink-400">{t.lab.label}</p>
          <h1 className="mx-auto mt-4 max-w-4xl text-[clamp(2.5rem,1.6rem+3.6vw,4.5rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance text-ink-950">
            {tt.heroPrefix}{" "}
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              {tt.heroHighlight}
            </span>
          </h1>
        </Reveal>
        <Reveal delay={90}>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-pretty text-ink-600">
            {t.lab.intro}
          </p>
        </Reveal>

        {/* WHAT'S INSIDE, above the fold. Still the six real projects and
            still jump links into the bands below - but each entry now
            carries that project's own `proof`, so the opening states the
            Lab's scale instead of only naming its parts.

            The mechanism is taken from mobbin.com/mcp, which opens by
            saying how much it holds ("621,500+ shipped screens") and only
            then shows the evidence. Its surface is not taken: no card
            imagery, no borrowed palette, nothing about how that page
            looks. Claim first, witnesses below, is the transferable part.

            This also retires six single-label pills. A box around one word
            is a fence, not a card (anti-patterns.md #6, whose detector is
            content-node diversity per card <= 1); these hold two real
            nodes now - a name and a sourced number - so the tile earns
            its ground.

            NOTHING HERE IS COMPUTED. Every number is the project's own
            `proof` string from content.ts, already sourced and already
            rendered inside its band; `withJourneyCount` fills the Journey
            Library's live {count}/{categories} tokens exactly as the band
            does. All six carry one today, but `proof` is nullable by
            design and the second line is therefore conditional: a project
            without a real number shows its name alone. An absent line,
            never an invented one. */}
        <Reveal delay={160}>
          <ul className="mx-auto mt-10 grid max-w-3xl list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => {
              const proof = p.proof ? withJourneyCount(p.proof) : null;
              return (
                <li key={p.slug}>
                  <a
                    href={`#${p.slug}`}
                    className="flex h-full flex-col gap-0.5 rounded-card bg-paper-soft px-4 py-3 text-left transition-colors hover:bg-blue-50"
                  >
                    <span className="text-[14px] leading-snug font-medium text-ink-950">{p.name}</span>
                    {proof && <span className="text-[13px] text-ink-500 tabular-nums">{proof}</span>}
                  </a>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- BANDS */

/** The ground each band sits on: plain tone, alternating.

    NO ART HERE. Two generated grounds were tried behind these bands and
    removed on sight - they had been produced for the abandoned dark-hero
    direction, so they were deep navy, and a dark image at low opacity
    under a light band does not read as texture, it reads as dirt: the
    whole stripe went muddy grey. A band earns its separation from the one
    above it by changing TONE, which it already does. The generated art
    stays where it works, in the hero, where it is light art on a light
    ground at full strength. */
const GROUNDS = ["paper", "tint"] as const;

function ProjectBand({
  project, lang, index, total,
}: {
  project: Project;
  lang: Lang;
  index: number;
  total: number;
}) {
  const tt = T[lang];
  const desc = withJourneyCount(project.desc);
  const proof = project.proof ? withJourneyCount(project.proof) : null;
  const preview = LAB_PREVIEWS[project.slug]?.({ project, lang, layout: "wide" });
  const tinted = GROUNDS[index % GROUNDS.length] === "tint";
  // Alternate which side the visual takes, so the eye moves across the
  // page rather than down a single column.
  const flip = index % 2 === 1;

  return (
    <section
      id={project.slug}
      className={`relative isolate overflow-hidden scroll-mt-24 py-16 md:py-24 ${
        tinted ? "bg-paper-soft" : "bg-paper"
      }`}
    >

      <div className="altor-container relative">
        <div
          className={`grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-16`}
        >
          {/* The text column parks while the visual scrolls past it. */}
          <Reveal className={flip ? "lg:col-start-2 lg:row-start-1" : ""}>
            <div className="lg:sticky lg:top-28">
              <p className="text-[13px] font-medium text-ink-400 tabular-nums">
                {tt.sectionLabel(index + 1, total)}
              </p>
              <h2 className="mt-3 text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.025em] text-balance text-ink-950">
                {project.name}
              </h2>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => <TagPill key={tag} tag={tag} />)}
              </div>
              {proof && (
                <p className="mt-4 text-[15px] font-medium text-ink-950 tabular-nums">{proof}</p>
              )}
              <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-ink-600">{desc}</p>
              <div className="mt-6">
                <ProjectActions project={project} />
              </div>
            </div>
          </Reveal>

          {/* The real tool, staged. */}
          <Reveal delay={80} className={flip ? "lg:col-start-1 lg:row-start-1" : ""}>
            <div className="rounded-card bg-paper p-4 shadow-card sm:p-6">
              <div className="overflow-hidden rounded-xl">{preview}</div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- PAGE */

export default function LabIndexPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? "/tr/lab" : "/lab";
  const projects = t.lab.projects as unknown as Project[];
  const breadcrumb = breadcrumbList([
    { name: t.footer.home, url: home },
    { name: t.nav.lab, url: lang === "en" ? "/lab" : "/tr/lab" },
  ]);

  return (
    <>
      <JsonLdScript data={breadcrumb} />
      <SiteHeader t={t} anchorBase={home} langHref={langHref} />
      <main>
        <LabHero t={t} lang={lang} projects={projects} />
        {projects.map((project, i) => (
          <ProjectBand
            key={project.slug}
            project={project}
            lang={lang}
            index={i}
            total={projects.length}
          />
        ))}
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
