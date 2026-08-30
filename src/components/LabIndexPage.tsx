import fs from "node:fs";
import path from "node:path";

import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { Reveal } from "@/components/ui/Reveal";
import { LAB_PREVIEWS, type Project } from "@/components/ui/LabPreviews";
import { ParallaxField } from "@/components/ui/ParallaxField";
import { withJourneyCount } from "@/lib/archive";
import { copy, type Lang } from "@/lib/content";

/* Lab index — LANDING-PAGE REDESIGN (2026-08-31).

   The page was six instances of one card stacked in a column: same ground,
   same shape, same rhythm, top to bottom. It read as an index, and the
   brief was that it should read as a product landing page - sections that
   differentiate, grounds that change, scroll that has movement in it.

   THE STRUCTURE. An atmospheric opening, then one BAND PER PROJECT rather
   than one card per project. Each band owns a full stripe of the page, and
   the ground alternates through a fixed cycle (paper -> tinted-with-art ->
   paper -> tinted-with-art ...) so no two neighbours share a backdrop -
   the "her section farklı" note, executed as a real ground change rather
   than a border.

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

   THE GENERATED ART IS GROUND ONLY. The hero backdrop and the two band
   grounds are Higgsfield-generated abstract fields (public/lab/*). They
   carry no information, so they sit behind content at low opacity and
   never depict an interface, a chart, or a figure. */

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

/** Whether a generated ground has actually been produced yet.

    The grounds are art, not content: the page's composition is carried by
    its own tone changes, and every band reads correctly with nothing
    behind it. So a missing file degrades to the plain ground rather than
    to a broken image - which also means a fresh clone, or a run before the
    art is regenerated, never renders a 404 rectangle. Server component, so
    this is a build-time check with no client cost. */
function hasArt(src: string) {
  return fs.existsSync(path.join(process.cwd(), "public", src));
}

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
  /* Only the layers that actually exist. The hero is composed on white and
     reads correctly with no art at all, so a missing file is a quieter
     hero rather than a broken one. */
  const layers = (
    [
      { src: "/lab/layer-orb.png", depth: 0.06 },
      { src: "/lab/layer-ribbons.png", depth: 0.14 },
      { src: "/lab/layer-shapes.png", depth: 0.24 },
    ] as const
  ).filter((l) => hasArt(l.src));

  return (
    /* WHITE AND CENTRED. This band used to be an ink-950 slab with a blue
       gradient over it; that was rejected outright ("no black gradient
       hero"). The page opens on paper now, the art carries the colour, and
       the statement sits in the middle of it the way a product's own
       landing page opens. */
    <section className="relative isolate overflow-hidden bg-paper pt-20 pb-24 text-center md:pt-28 md:pb-32">
      {layers.length > 0 ? (
        <ParallaxField layers={[...layers]} />
      ) : (
        /* THE AMBIENT FALLBACK, and it is not a placeholder. Three soft
           brand blooms on the same drift keyframes the art layers use, so
           the hero has colour and motion from CSS alone. The generated
           illustration is an upgrade to this, never a dependency of it -
           which matters because the art is produced by a queue that can be
           slow or down, and a hero that renders as a blank white box in
           that case would be the wrong trade. */
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="parallax-drift absolute -top-40 left-1/2 h-[38rem] w-[38rem] -translate-x-[70%] rounded-full bg-[radial-gradient(circle,var(--color-primary-400)_0%,transparent_70%)] opacity-25" />
          <div className="parallax-drift-slow absolute -top-24 left-1/2 h-[32rem] w-[32rem] translate-x-[10%] rounded-full bg-[radial-gradient(circle,var(--color-primary-300)_0%,transparent_70%)] opacity-30" />
          <div className="parallax-drift absolute top-32 left-1/2 h-[26rem] w-[26rem] -translate-x-[10%] rounded-full bg-[radial-gradient(circle,#7c3aed_0%,transparent_70%)] opacity-[0.12]" />
        </div>
      )}
      {/* Keeps the type legible over whatever sits underneath, without
          flattening it. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-paper/50 via-paper/30 to-paper"
      />

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

        {/* The six real projects as chips under the statement: a product
            landing page says what it contains above the fold, and these
            double as jump links into the bands below. */}
        <Reveal delay={160}>
          <ul className="mx-auto mt-10 flex max-w-3xl list-none flex-wrap justify-center gap-2 p-0">
            {projects.map((p) => (
              <li key={p.slug}>
                <a
                  href={`#${p.slug}`}
                  className="inline-flex rounded-full bg-paper-soft px-3.5 py-1.5 text-sm text-ink-700 transition-colors hover:bg-blue-50 hover:text-primary-700"
                >
                  {p.name}
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- BANDS */

/** The ground each band sits on. Four grounds cycling, so no project
    shares a backdrop with the one above or below it, and two of them
    carry generated art. */
const GROUNDS = [
  { key: "paper", art: null as string | null },
  { key: "tint", art: "/lab/ground-flow.jpg" },
  { key: "paper", art: null },
  { key: "tint", art: "/lab/ground-glass.jpg" },
] as const;

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
  const ground = GROUNDS[index % GROUNDS.length];
  const tinted = ground.key === "tint";
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
      {ground.art && hasArt(ground.art) && (
        <Image
          src={ground.art}
          alt=""
          aria-hidden
          fill
          sizes="100vw"
          /* Very low opacity: this is a ground, not a picture. Busy
             texture behind content was rejected in review on the
             calculator plate, and the same restraint applies here. */
          className="-z-10 object-cover opacity-[0.18]"
        />
      )}

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

  return (
    <>
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
