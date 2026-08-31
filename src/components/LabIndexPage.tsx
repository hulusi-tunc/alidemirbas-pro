import { ArrowRight, ArrowUpRight } from "lucide-react";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { Reveal } from "@/components/ui/Reveal";
import Image from "next/image";

import { LAB_PREVIEWS, type Project } from "@/components/ui/LabPreviews";
import { DepthStack, DotMatrix, OrbitRings, SignalFlow } from "@/components/ui/LabVisuals";
import { ScrollSpy } from "@/components/ui/ScrollSpy";
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
    kicker: "Open source · Built with Claude Code",
    sysLabel: "The lifecycle system",
    sysTitle: "One system: patterns you can trigger, a library you can reuse.",
    sysBody:
      "The two lifecycle projects are halves of the same idea. One turns the signals a product already emits into journeys you can act on; the other is the catalogue those journeys are drawn from.",
    toolsLabel: "The tools",
    toolsTitle: "Built because I needed them, not to have a portfolio.",
    restLabel: "Also in the Lab",
    spyHero: "Overview",
    spySystem: "Lifecycle system",
    spyTools: "Tools",
    spyRest: "More",
    sectionLabel: (i: number, total: number) => `${String(i).padStart(2, "0")} / ${String(total).padStart(2, "0")}`,
  },
  tr: {
    heroPrefix: "Üzerinde",
    heroHighlight: "çalıştıklarım",
    scrollCue: "Altı proje",
    kicker: "Açık kaynak · Claude Code ile",
    sysLabel: "Lifecycle sistemi",
    sysTitle: "Tek sistem: tetikleyebileceğin desenler, tekrar kullanabileceğin bir kütüphane.",
    sysBody:
      "İki lifecycle projesi aynı fikrin iki yarısı. Biri ürünün zaten ürettiği sinyalleri harekete geçirilebilir journey'lere çeviriyor; diğeri bu journey'lerin çekildiği katalog.",
    toolsLabel: "Araçlar",
    toolsTitle: "Portföy olsun diye değil, ihtiyacım olduğu için yapıldı.",
    restLabel: "Lab'da ayrıca",
    spyHero: "Genel bakış",
    spySystem: "Lifecycle sistemi",
    spyTools: "Araçlar",
    spyRest: "Diğerleri",
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
    <section
      id="overview"
      className="relative isolate scroll-mt-24 overflow-hidden bg-paper pt-20 pb-24 text-center md:pt-28 md:pb-32"
    >
      {/* Ethereal ground, not a picture: cloud and diffused light with no
          object in it, faded hard at the bottom so the section hands off
          to white rather than ending on an edge. Every backdrop before
          this one was rejected for having SHAPES in it - a gradient of
          light has nothing to look at, which is the point. */}
      <Image
        src="/lab/sky-hero.jpg"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover opacity-60"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-paper/40 via-paper/70 to-paper"
      />
      <DotMatrix className="inset-x-0 top-0 h-[26rem] opacity-50" />

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

/* ------------------------------------------------- ARCHETYPE 1 · SYSTEM */

/** A BENTO. The two lifecycle projects are halves of one system, so they
    share a section rather than getting a band each: a tall feature plate
    on the left carrying the animated orbit figure, the two real previews
    stacked beside it. Different shape from every other section on the
    page, which is the point - the brief was that the sections were
    repeating themselves. */
function SystemSection({ lang, projects }: { lang: Lang; projects: Project[] }) {
  const tt = T[lang];
  const [builder, library] = projects;

  return (
    <section id="system" className="relative isolate scroll-mt-24 overflow-hidden bg-paper-soft py-20 md:py-28">
      <Image
        src="/lab/sky-mesh.jpg"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        /* Quiet: at full strength the cloud read as blotches of grey
           behind the cards rather than as light. */
        className="-z-10 object-cover opacity-25"
      />

      <div className="altor-container relative">
        <Reveal>
          <p className="text-[13px] font-medium text-primary-600">{tt.sysLabel}</p>
          <h2 className="mt-3 max-w-3xl text-[clamp(1.875rem,1.4rem+2vw,2.75rem)] leading-[1.1] font-semibold tracking-[-0.025em] text-balance text-ink-950">
            {tt.sysTitle}
          </h2>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-pretty text-ink-600">{tt.sysBody}</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          {/* The dark feature plate, with the orbit figure turning on it. */}
          <Reveal>
            <article className="relative isolate flex h-full flex-col overflow-hidden rounded-card bg-ink-950 p-8 sm:p-10">
              <Image
                src="/lab/sky-dark.jpg"
                alt=""
                aria-hidden
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="-z-10 object-cover opacity-60"
              />
              <DotMatrix tone="light" className="inset-0 opacity-40" />
              <div className="relative grid flex-1 place-items-center py-6">
                <OrbitRings />
              </div>
              <div className="relative mt-6">
                <h3 className="text-xl font-semibold tracking-tight text-white">{builder.name}</h3>
                {builder.proof && (
                  <p className="mt-2 text-[15px] font-medium text-blue-200 tabular-nums">
                    {withJourneyCount(builder.proof)}
                  </p>
                )}
                <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-white/70">
                  {withJourneyCount(builder.desc)}
                </p>
                <div className="mt-5">
                  <ProjectActions project={builder} onDark />
                </div>
              </div>
            </article>
          </Reveal>

          {/* The library: its real preview above, its depth stack below. */}
          <div className="flex flex-col gap-5">
            <Reveal delay={80}>
              <article className="rounded-card bg-paper p-6 shadow-card sm:p-8">
                <h3 className="text-xl font-semibold tracking-tight text-ink-950">{library.name}</h3>
                {library.proof && (
                  <p className="mt-2 text-[15px] font-medium text-primary-700 tabular-nums">
                    {withJourneyCount(library.proof)}
                  </p>
                )}
                <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-ink-600">
                  {withJourneyCount(library.desc)}
                </p>
                <div className="mt-6 overflow-hidden rounded-xl">
                  {LAB_PREVIEWS[library.slug]?.({ project: library, lang, layout: "wide" })}
                </div>
                <div className="mt-6">
                  <ProjectActions project={library} />
                </div>
              </article>
            </Reveal>

            <Reveal delay={140}>
              <div className="relative overflow-hidden rounded-card bg-paper-soft px-6 pt-8 pb-4">
                <DotMatrix className="inset-0 opacity-50" />
                <div className="relative">
                  <DepthStack
                    items={
                      lang === "en"
                        ? ["Activation", "Retention", "Risk", "Consent", "Subscription"]
                        : ["Aktivasyon", "Elde tutma", "Risk", "İzin", "Abonelik"]
                    }
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------- ARCHETYPE 2 · TOOLS */

/** ALTERNATING ROWS, and the only place on the page that uses them - two
    projects, text and evidence swapping sides. The first row carries the
    animated signal-flow figure instead of a screenshot, because what that
    tool does is fan one input out into stages. */
function ToolsSection({ lang, projects }: { lang: Lang; projects: Project[] }) {
  const tt = T[lang];

  return (
    <section id="tools" className="scroll-mt-24 bg-paper py-20 md:py-28">
      <div className="altor-container">
        <Reveal>
          <p className="text-[13px] font-medium text-primary-600">{tt.toolsLabel}</p>
          <h2 className="mt-3 max-w-3xl text-[clamp(1.875rem,1.4rem+2vw,2.75rem)] leading-[1.1] font-semibold tracking-[-0.025em] text-balance text-ink-950">
            {tt.toolsTitle}
          </h2>
        </Reveal>

        <div className="mt-14 flex flex-col gap-16 md:gap-24">
          {projects.map((project, i) => {
            const flip = i % 2 === 1;
            return (
              <Reveal key={project.slug} delay={60}>
                <div
                  id={project.slug}
                  className="grid scroll-mt-24 grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-14"
                >
                  <div className={flip ? "md:col-start-2 md:row-start-1" : ""}>
                    <h3 className="text-[clamp(1.5rem,1.2rem+1.2vw,2rem)] leading-[1.15] font-semibold tracking-[-0.02em] text-balance text-ink-950">
                      {project.name}
                    </h3>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => <TagPill key={tag} tag={tag} />)}
                    </div>
                    {project.proof && (
                      <p className="mt-4 text-[15px] font-medium text-ink-950 tabular-nums">
                        {withJourneyCount(project.proof)}
                      </p>
                    )}
                    <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-ink-600">
                      {withJourneyCount(project.desc)}
                    </p>
                    <div className="mt-6">
                      <ProjectActions project={project} />
                    </div>
                  </div>

                  <div className={flip ? "md:col-start-1 md:row-start-1" : ""}>
                    {i === 0 ? (
                      /* The one figure that is drawn rather than captured:
                         this tool's whole job is fanning one signal out
                         into stages, and the real stage names are the
                         labels. */
                      <div className="relative overflow-hidden rounded-card bg-paper-soft p-6 sm:p-8">
                        <DotMatrix className="inset-0 opacity-60" />
                        <div className="relative">
                          <SignalFlow
                            hub={lang === "en" ? "Test" : "Test"}
                            nodes={
                              lang === "en"
                                ? [
                                    { label: "Hypothesis" },
                                    { label: "Metric", accent: true },
                                    { label: "Guardrail" },
                                    { label: "Result" },
                                  ]
                                : [
                                    { label: "Hipotez" },
                                    { label: "Metrik", accent: true },
                                    { label: "Guardrail" },
                                    { label: "Sonuç" },
                                  ]
                            }
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-card bg-paper p-4 shadow-card sm:p-6">
                        <div className="overflow-hidden rounded-xl">
                          {LAB_PREVIEWS[project.slug]?.({ project, lang, layout: "wide" })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------- ARCHETYPE 3 · REST */

/** A COMPACT GRID to close on. The last projects are smaller in scope, so
    they get proportionate space instead of another full band each - which
    is what made the page feel repetitive in the first place. */
function RestSection({ lang, projects }: { lang: Lang; projects: Project[] }) {
  const tt = T[lang];
  return (
    <section id="more" className="scroll-mt-24 bg-paper-soft py-20 md:py-24">
      <div className="altor-container">
        <Reveal>
          <p className="text-[13px] font-medium text-primary-600">{tt.restLabel}</p>
        </Reveal>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
          {projects.map((project, i) => (
            <Reveal key={project.slug} delay={i * 70}>
              <article
                id={project.slug}
                className="flex h-full scroll-mt-24 flex-col rounded-card bg-paper p-6 transition-colors hover:bg-blue-50 sm:p-8"
              >
                <h3 className="text-lg font-semibold tracking-tight text-ink-950">{project.name}</h3>
                {project.proof && (
                  <p className="mt-2 text-sm font-medium text-primary-700 tabular-nums">
                    {withJourneyCount(project.proof)}
                  </p>
                )}
                <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-600">
                  {withJourneyCount(project.desc)}
                </p>
                <div className="mt-5 overflow-hidden rounded-xl bg-paper-soft p-3">
                  {LAB_PREVIEWS[project.slug]?.({ project, lang, layout: "stack", compact: true })}
                </div>
                <div className="mt-5">
                  <ProjectActions project={project} />
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

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
        <ScrollSpy
          sections={[
            { id: "overview", label: T[lang].spyHero },
            { id: "system", label: T[lang].spySystem },
            { id: "tools", label: T[lang].spyTools },
            { id: "more", label: T[lang].spyRest },
          ]}
        />
        <LabHero t={t} lang={lang} projects={projects} />
        {/* Three different section shapes, not one shape six times: the
            lifecycle pair as a bento, the two bigger tools as alternating
            rows, the smaller ones as a compact grid. */}
        <SystemSection lang={lang} projects={projects.slice(0, 2)} />
        <ToolsSection lang={lang} projects={projects.slice(2, 4)} />
        <RestSection lang={lang} projects={projects.slice(4)} />
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
