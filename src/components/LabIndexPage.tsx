import Image from "next/image";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, CircleCheck, Radio, Workflow } from "lucide-react";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { ButtonLink, buttonStyles } from "@/components/ui/Button";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import {
  BuilderScene,
  DashboardScene,
  ExplorerScene,
  LabHeroPanel,
  LibraryScene,
  NumerspaceScene,
  PlaybookScene,
} from "@/components/ui/LabPanels";
import type { Project } from "@/components/ui/LabPreviews";
import { LabProjectIcon, labAccent } from "@/components/ui/LabProjectIdentity";
import { SpyList } from "@/components/ui/LabScroll";
import { LabShowcase, type ShowcaseItem } from "@/components/ui/LabShowcase";
import { PixelFill } from "@/components/ui/PixelFill";
import { Reveal } from "@/components/ui/Reveal";
import { withJourneyCount } from "@/lib/archive";
import { JOURNEY_ROWS } from "@/lib/canonical-view";
import { clsx } from "@/lib/clsx";
import { copy, type Lang } from "@/lib/content";
import { breadcrumbList } from "@/lib/schema";

/* Lab index.

   HISTORY, BRIEFLY. The page was six copies of one card; the 2026-08-31
   redesign made it a landing page with three section shapes and tried and
   rejected three hero backdrops before settling on clean white. On
   2026-09-05 the hero became a scene - one generated daylight meadow that
   depicts nothing, with a real product window floating on its horizon,
   cut by the fold - and gained a six-tab rail (ui/LabShowcase.tsx) that
   shows each project's REAL material (ui/LabPanels.tsx), never a mock-up.
   The same round gave every project one section, opened by its own mark
   (glyph + hue, ui/LabProjectIdentity.tsx), and made every action a real
   button (ui/Button.tsx). Earlier on 2026-09-06 the six sections were
   briefly one sticky card deck - rejected the same day, see below.

   THIS ROUND (2026-09-06, Hulusi, two reviews). First: "sections keep
   repeating itself, no scroll animation, stick sections, make one section
   dark bg, be creative." Read as "make the sections stick", that became a
   deck of six pinned cards - and the second review corrected it: "I meant
   each section needs its own thing, not all sections' structure stick;
   one section can have a two-column structure, title can be sticky and
   the right side three images with scroll animation, another one can
   have a three-card structure." So: SIX SECTIONS, SIX STRUCTURES, and
   sticky is one of them. In order:

     Journey Builder    STICKY RAIL. Two columns; the statement stays put on
                        the left while three product windows scroll past
                        on the right - the builder's canvas with each of its
                        three patterns open. A spy list under the statement
                        (ui/LabScroll.tsx) names the one passing.
     Journey Library    HEADLINE + THREE FRAMES. The headline rail, then
                        three frames side by side: a journey as a graph, a
                        fan of journeys, the browser's search.
     A/B Test Playbook  CENTRED + ONE SCENARIO. The statement centred, then
                        one frame: the question, the two carts, the split,
                        the deciding metric, the library's scale.
     Dashboard Builder  MIRRORED SPLIT. The pipeline as three beats on the
                        left - exports in, the check, dashboard out - the
                        statement on the right.
     Change History     DARK CONSOLE. The page's single dark block; one
                        timeline card on the warm plate, cut by the frame's
                        right and bottom edges.
     Numerspace         SPLIT + SHELF. The statement on the left; on the right
                        a frame holding two rows of the 13 calculator
                        categories, icons and counts, gliding endlessly in
                        opposite directions on their own.

   THE VISUALS ARE FRAMES. Hulusi's reference (2026-09-06, third review):
   a tinted, grainy, clouded plate per project - "matching background,
   different tone colours, a bit abstract" - and on it only the part of
   the product that tells the story, cropped by the plate's edge: the
   library browser cut by the right edge, the builder's canvas alone. So
   each section places ONE fragment inside a `LabFrame` (below; ground in
   globals.css) with its own anchoring - top-left and cut right, cut on
   the left, centred and run off the bottom, chrome cut away above. The
   fragments are the product windows drawn by the parallel session on the
   "real product screenshots" ask (ui/LabWindow.tsx is the kit, the
   *Window components in ui/LabPanels.tsx the screenshots, every value the
   product's own); this file decides the frame and the structure around it.

   MOTION HAS A JOB IN EACH: the sticky rail keeps the claim beside its
   three proofs; the spy list orients; the three cards and the console
   rows arrive in sequence because sequence is what they are; the rail
   slides so scrolling down reads a row left to right. Nothing loops,
   nothing floats. Grounds: paper (with the sky-mesh ramp out of the hero)
   / soft / paper / soft / ink-950 / teal-50 - neutral to the dark block,
   one colour to close. The closing FinalCta is the brand-blue plate
   (Site.tsx), so the dark section is the only dark one. */

const T = {
  en: {
    heroPrefix: "Things I've been",
    heroHighlight: "building",
    tablist: "Lab projects",
    builderViews: ["A signal becomes a journey", "A journey, as the builder draws it", "Where journeys end"],
  },
  tr: {
    heroPrefix: "Üzerinde",
    heroHighlight: "çalıştıklarım",
    tablist: "Lab projeleri",
    builderViews: ["Bir sinyal journey'e dönüşür", "Builder'ın çizdiği haliyle bir journey", "Journey'lerin bittiği yer"],
  },
} as const;

/** The one tag the two lifecycle projects share - the understated cue
    that they're parts of the same system without merging their sections. */
function isEcosystemTag(tag: string) {
  return tag === "Lifecycle";
}

function TagPill({ tag, dark }: { tag: string; dark: boolean }) {
  return (
    <span
      className={clsx(
        "rounded-full px-2.5 py-1 text-xs font-medium",
        dark
          ? "bg-white/10 text-white/80"
          : isEcosystemTag(tag)
            ? "bg-primary-50 text-primary-700"
            : "bg-paper text-ink-600 shadow-hairline",
      )}
    >
      {tag}
    </span>
  );
}

type Action = Project["links"][number];

/** One action as a button. External links keep `buttonStyles` + PixelFill
    on an <a>, the component's own convention, so a GitHub button and its
    neighbour answer the pointer identically. */
function ActionButton({ link, variant, size }: { link: Action; variant: "primary" | "outline"; size: "sm" | "md" }) {
  const external = link.href.startsWith("http");
  const label = (
    <>
      {link.label}
      {external ? <ArrowUpRight aria-hidden className="size-4" /> : <ArrowRight aria-hidden className="size-4" />}
    </>
  );
  if (external) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={buttonStyles({ variant, size })}>
        <PixelFill />
        {label}
      </a>
    );
  }
  return (
    <ButtonLink href={link.href} variant={variant} size={size}>
      {label}
    </ButtonLink>
  );
}

/** The project's actions, as buttons. The first link is always the
    project's own page on this site (content.ts's CTA convention), so it
    takes the primary plate; GitHub, demos and the one external product
    take the outline. `stack` is for a narrow column with three actions:
    the primary alone on its line, the secondaries compact beneath it -
    a hierarchy, not a wrap. On the dark section both flip to their
    dark-ground forms through `data-tone` - nothing here knows about tone. */
function ProjectActions({ project, center = false, stack = false }: { project: Project; center?: boolean; stack?: boolean }) {
  const [primary, ...secondary] = project.links;
  if (stack) {
    return (
      <div className="flex flex-col items-start gap-3">
        <ActionButton link={primary} variant="primary" size="md" />
        {secondary.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {secondary.map((link) => (
              <ActionButton key={link.label} link={link} variant="outline" size="sm" />
            ))}
          </div>
        )}
      </div>
    );
  }
  return (
    <div className={clsx("flex flex-wrap items-center gap-3", center && "justify-center")}>
      {project.links.map((link, i) => (
        <ActionButton key={link.label} link={link} variant={i === 0 ? "primary" : "outline"} size="md" />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- HERO */

/** The library tab's product: the library's largest graph. Derived,
    never hand-picked - the same rule experiment-a uses - so it follows
    the library as journeys are added. Computed once at module load,
    server side, like JOURNEY_ROWS itself. */
const HERO_JOURNEY = JOURNEY_ROWS.reduce((a, b) => (b.nodeCount > a.nodeCount ? b : a));

function LabHero({ t, lang, projects }: { t: (typeof copy)[Lang]; lang: Lang; projects: Project[] }) {
  const tt = T[lang];

  /* Everything the client tab rail needs, resolved here on the server:
     the real counts filled into the facts and taglines, and each panel
     already rendered. The showcase receives nodes and strings only. */
  const items: ShowcaseItem[] = projects.map((p) => ({
    slug: p.slug,
    label: p.short,
    name: p.name,
    fact: withJourneyCount(p.proof),
    tagline: withJourneyCount(p.tagline),
    tags: p.tags,
    href: p.links[0].href,
    cta: p.links[0].label,
    panel: <LabHeroPanel slug={p.slug} lang={lang} journey={HERO_JOURNEY} />,
  }));

  return (
    /* THE HERO IS A SCENE, AND THE PRODUCT IS IN IT. Centred type over a
       photographic daylight sky, and one real product window floating on
       the horizon, cut by the fold - the reference Hulusi supplied. */
    <section
      id="overview"
      className="relative isolate scroll-mt-24 overflow-hidden pt-20 text-center md:pt-28"
    >
      {/* THE SCENE. A level grass horizon under a pale daylight sky,
          generated (Higgsfield, 2026-09-05) to depict nothing: no object,
          no figure, no interface, no text - so the only thing in the
          picture is the real product window. The plate keeps its upper
          three quarters almost empty so ink-950 type stays readable, and
          puts the horizon at ~75% of its height; with `object-bottom`
          that line crosses the lower half of the window at every width.
          Chosen in two rounds (eight candidates across four scene
          directions, then three refinements of the meadow); the shipped
          plate is the early-morning one - a cloudless, even sky, since
          cirrus read as blotches behind the headline, and a faint warm
          haze on the horizon that lifts the window's top edge. */}
      <Image
        src="/lab/hero-meadow.jpg"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-bottom opacity-65"
      />
      {/* The plate at sixty-five percent over the paper ground (Hulusi,
          2026-09-06: "I want the hero background image to be softer") -
          the wind-streak plate keeps its colour in the field and the sky
          washes toward paper under the headline. */}
      {/* Hand-off to the header above: the top few rems fade to paper so
          the translucent header does not sit on a hard photographic edge. */}
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-paper/80 to-transparent" />

      <div className="altor-container relative">
        <Reveal>
          <p className="altor-eyebrow text-ink-subtle">{t.lab.label}</p>
          <h1 className="mx-auto mt-4 max-w-4xl text-display-xl text-balance text-ink-950">
            {tt.heroPrefix}{" "}
            <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
              {tt.heroHighlight}
            </span>
          </h1>
        </Reveal>
        <Reveal delay={90}>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-pretty text-ink-muted">
            {t.lab.intro}
          </p>
        </Reveal>
      </div>

      <Reveal delay={160}>
        <LabShowcase items={items} tablistLabel={tt.tablist} />
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------- THE STATEMENT */

/* The statement's parts, shared by every section and laid out
   differently per section below. `dark` is only true on the dark
   section; `center` only in the two centred ones. */

function Mark({ project, dark, center }: { project: Project; dark: boolean; center?: boolean }) {
  const accent = labAccent(project.slug);
  return (
    <p className={clsx("altor-eyebrow flex items-center gap-2.5", center && "justify-center", dark ? accent.darkInk : accent.ink)}>
      <span className={clsx("grid size-8 shrink-0 place-items-center rounded-md", dark ? accent.darkTile : accent.tile)}>
        <LabProjectIcon slug={project.slug} className="size-4" />
      </span>
      {project.short}
    </p>
  );
}

function Title({ project, dark }: { project: Project; dark: boolean }) {
  return (
    <h2
      className={clsx(
        "mt-5 text-h2 text-balance",
        dark ? "text-white" : "text-ink-950",
      )}
    >
      {project.name}
    </h2>
  );
}

function Tags({ project, dark, center }: { project: Project; dark: boolean; center?: boolean }) {
  return (
    <div className={clsx("mt-4 flex flex-wrap gap-1.5", center && "justify-center")}>
      {project.tags.map((tag) => (
        <TagPill key={tag} tag={tag} dark={dark} />
      ))}
    </div>
  );
}

function Proof({ project, dark }: { project: Project; dark: boolean }) {
  if (!project.proof) return null;
  return (
    <p className={clsx("mt-5 text-[15px] font-medium tabular-nums", dark ? "text-white" : "text-ink-950")}>
      {withJourneyCount(project.proof)}
    </p>
  );
}

function Desc({ project, dark, center }: { project: Project; dark: boolean; center?: boolean }) {
  return (
    <p className={clsx("mt-3 max-w-[52ch] text-[15px] leading-relaxed", center && "mx-auto", dark ? "text-white/70" : "text-ink-600")}>
      {withJourneyCount(project.desc)}
    </p>
  );
}

/** The stacked statement - the text side of a split, or, centred, the
    opening of a section whose material runs full width below it. */
function Statement({
  project,
  dark = false,
  center = false,
  stack = false,
  extra,
}: {
  project: Project;
  dark?: boolean;
  center?: boolean;
  stack?: boolean;
  /** A real node between the text and the actions (the builder's steps). */
  extra?: ReactNode;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : undefined}>
      <Mark project={project} dark={dark} center={center} />
      <Title project={project} dark={dark} />
      <Tags project={project} dark={dark} center={center} />
      <Proof project={project} dark={dark} />
      <Desc project={project} dark={dark} center={center} />
      {extra && <div className="mt-6">{extra}</div>}
      <div className="mt-7">
        <ProjectActions project={project} center={center} stack={stack} />
      </div>
    </div>
  );
}

/** The headline rail: the statement laid across the section's top - name
    and tags on the left, proof, text and actions on the right, bottoms
    aligned - so a full-width object can take the rest of the section. */
function Headline({ project, dark = false }: { project: Project; dark?: boolean }) {
  return (
    <div className="grid gap-6 md:grid-cols-12 md:items-end md:gap-10">
      <div className="md:col-span-7">
        <Mark project={project} dark={dark} />
        <Title project={project} dark={dark} />
        <Tags project={project} dark={dark} />
      </div>
      <div className="md:col-span-5">
        <Proof project={project} dark={dark} />
        <Desc project={project} dark={dark} />
        <div className="mt-6">
          <ProjectActions project={project} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------- THE SECTIONS */

/** Each section's ground, by project. Neutral and alternating until the
    dark block, then one tinted close - see the file comment. */
const GROUND: Record<string, string> = {
  "claude-lifecycle": "bg-paper",
  "lifecycle-card-archive": "bg-paper-soft",
  "ab-test-playbook": "bg-paper",
  "dashboard-builder": "bg-paper-soft",
  "google-ads-change-history-dashboard": "bg-ink-950 text-white",
  numerspace: "bg-teal-50",
};

function Shell({
  project,
  dark = false,
  className = "overflow-hidden py-20 md:py-28",
  children,
}: {
  project: Project;
  dark?: boolean;
  /** Padding and overflow, when a section's structure needs its own. */
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={project.slug}
      data-tone={dark ? "dark" : undefined}
      className={clsx("relative isolate scroll-mt-24", className, GROUND[project.slug] ?? "bg-paper")}
    >
      {children}
    </section>
  );
}

/** THE FRAME: the project's plate. A grainy ground in the project's own
    hue (`.lab-frame`, globals.css) holding one SCENE (ui/LabPanels.tsx):
    two or three product components with real data, composed differently
    in every frame and cut by the frame's edges - only the parts that tell
    the story, never the whole page. The reference frames Hulusi sent
    (2026-09-06) are this: a tinted, clouded plate with the library
    browser cut by the right edge, the builder's canvas alone on another;
    his follow-up: "arrange different components, no full screens". */
function LabFrame({
  project,
  plate,
  ground = "photo",
  className,
  children,
}: {
  project: Project;
  /** Which photograph: defaults to the project's own plate; a section with
      several frames names a different plate for each, since the same
      photograph three times over read as a mistake. */
  plate?: string;
  /** `photo`: the plate carries the photograph. `glass`: the photograph is
      behind the SECTION instead, and the plate is black glass over it -
      thirty percent, blurred (Hulusi, 2026-09-06, tried first on the
      Change History section). */
  ground?: "photo" | "glass";
  className?: string;
  children: ReactNode;
}) {
  if (ground === "glass") {
    return (
      <div className={clsx("relative isolate overflow-hidden rounded-[28px] bg-black/30 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.1)] backdrop-blur-2xl", className)}>
        {children}
      </div>
    );
  }
  return (
    <div data-hue={labAccent(project.slug).hue} className={clsx("lab-frame relative isolate overflow-hidden rounded-[28px]", className)}>
      {/* THE GROUND IS A PHOTOGRAPH (Hulusi, 2026-09-06: "apply all in lab
          page frames"). One generated plate per project, the same meadow
          as the hero shot dreamy (soft focus, film grain, pastel) with one
          thing on the horizon that says which project this is: a track,
          a row of turbines, two turbines, poles at intervals, blue hour,
          hay bales (public/lab/frames/<slug>.jpg, chosen from the served
          gallery round of 2026-09-06). It depicts no interface and no
          figure, so it stays ground. Anchored at the bottom and scaled up
          a little from there, so a short or square frame crops the sky
          rather than the field - the one note on the plates was too much
          sky. Shown CLEAN, at full opacity: the tinted version (the hue
          gradient showing through a 60% photograph) read as a colour overlay,
          and Hulusi keeps the colour overlays for the product pages only
          ("I don't want a colour overlay on this page, keep it in the
          subpages; clean up the main lab page like before", 2026-09-06).
          The grain in `.lab-frame::before` still sits over it. */}
      <Image
        src={`/lab/frames/${plate ?? project.slug}.jpg`}
        alt=""
        aria-hidden
        fill
        sizes="(min-width: 1280px) 1168px, 100vw"
        className="-z-10 origin-bottom scale-[1.3] object-cover object-bottom"
      />
      {children}
    </div>
  );
}

/** Journey Builder - the sticky rail. */
function BuilderSection({ project, lang }: { project: Project; lang: Lang }) {
  const tt = T[lang];
  const icons = [<Radio key="signals" aria-hidden />, <Workflow key="journey" aria-hidden />, <CircleCheck key="exits" aria-hidden />];
  const spy = tt.builderViews.map((label, i) => ({ id: `builder-view-${i}`, label, icon: icons[i] }));
  return (
    /* No overflow-hidden here: an overflow-hidden ancestor turns
       `position: sticky` off (it becomes the sticky element's scrollport),
       and the fill image clips to its own box anyway. */
    <Shell project={project} className="py-20 md:py-28">
      {/* No image behind the section (Hulusi, 2026-09-06: "all section bg
          remove that"): the photographs live inside the frames only, the
          section ground is paper. */}
      <div className="altor-container relative grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <Reveal>
              {/* The three views as an icon stepper inside the statement,
                  before the actions - one column, one read, the lit step
                  following the frames on the right. */}
              <Statement project={project} stack extra={<SpyList items={spy} activeTile="bg-violet-600 text-white" />} />
            </Reveal>
          </div>
        </div>
        <div className="flex flex-col gap-8 lg:col-span-7">
          {tt.builderViews.map((label, i) => (
            <Reveal key={label} delay={i === 0 ? 120 : 0}>
              <div id={`builder-view-${i}`} className="scroll-mt-28">
                {/* Three frames, three views of the same tool: signal to
                    journey to channel as one diagram; one journey drawn;
                    where journeys end and what they are made of. */}
                <LabFrame project={project} plate={`claude-lifecycle-${i}`} className="aspect-[4/5] sm:aspect-[3/2]">
                  <BuilderScene lang={lang} view={i} />
                </LabFrame>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/** Journey Library - the headline rail, then three frames side by side. */
function LibrarySection({ project, lang }: { project: Project; lang: Lang }) {
  return (
    <Shell project={project}>
      <div className="altor-container">
        <Reveal>
          <Headline project={project} />
        </Reveal>
        {/* Three facets of the library, one frame each: a journey is a
            graph; a library of them; find the one you need. */}
        <div className="mt-10 grid grid-cols-1 gap-4 md:mt-12 md:grid-cols-3">
          {[0, 1, 2].map((view) => (
            <Reveal key={view} delay={120 + view * 90}>
              <LabFrame project={project} className="h-[20rem] md:h-[22rem]">
                <LibraryScene lang={lang} view={view} />
              </LabFrame>
            </Reveal>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/** A/B Test Playbook - centred, then one scenario as a picture. */
function PlaybookSection({ project, lang }: { project: Project; lang: Lang }) {
  return (
    <Shell project={project}>
      <div className="altor-container">
        <Reveal>
          <Statement project={project} center />
        </Reveal>
        <Reveal delay={120} className="mt-12 md:mt-14">
          {/* The question at headline size, the two carts people were
              shown with the tested element as the only difference, the
              metric that decides it, and the library's scale in one strip.
              The frame is as tall as the story (the scene lays itself out
              in flow). */}
          <LabFrame project={project}>
            <PlaybookScene lang={lang} />
          </LabFrame>
        </Reveal>
      </div>
    </Shell>
  );
}

/** Dashboard Builder - the mirrored split. */
function DashboardSection({ project, lang }: { project: Project; lang: Lang }) {
  return (
    <Shell project={project}>
      <div className="altor-container grid items-center gap-10 md:grid-cols-12 md:gap-12">
        <Reveal delay={120} className="md:col-span-7 lg:col-span-8">
          {/* The pipeline in three beats: exports in, the check that refuses
              to sum them, the dashboard out. The frame is as tall as the
              story (the scene lays itself out in flow). */}
          <LabFrame project={project}>
            <DashboardScene lang={lang} />
          </LabFrame>
        </Reveal>
        <Reveal className="md:col-span-5 lg:col-span-4">
          <Statement project={project} />
        </Reveal>
      </div>
    </Shell>
  );
}

/** Change History Explorer - the dark block that hands over. */
function ExplorerSection({ project, lang }: { project: Project; lang: Lang }) {
  return (
    /* The frame stays inside the section: the overhang into the next
       section was tried and dropped (Hulusi, 2026-09-06: "I don't want
       frame overflow"). */
    <Shell project={project} dark>
      {/* The photograph behind the whole section (blue hour over the
          meadow), and the frame as black glass over it - the variant
          Hulusi asked to see (2026-09-06). */}
      <Image
        src="/lab/frames/google-ads-change-history-dashboard.jpg"
        alt=""
        aria-hidden
        fill
        sizes="100vw"
        className="-z-10 object-cover object-bottom opacity-70"
      />
      <div className="altor-container">
        <Reveal>
          <Headline project={project} dark />
        </Reveal>
        <Reveal delay={120} className="mt-10 md:mt-12">
          {/* One piece of UI on the glass: the dashboard the tool writes,
              read as a timeline, cut by the frame's bottom edge. */}
          <LabFrame project={project} ground="glass" className="h-[26rem] md:h-[30rem]">
            <ExplorerScene lang={lang} />
          </LabFrame>
        </Reveal>
      </div>
    </Shell>
  );
}

/** Numerspace - the split: statement on the left, the shelf on the right. */
function NumerspaceSection({ project, lang }: { project: Project; lang: Lang }) {
  return (
    <Shell project={project}>
      <div className="altor-container grid items-center gap-10 md:grid-cols-12 md:gap-12">
        <Reveal className="md:col-span-5">
          <Statement project={project} />
        </Reveal>
        <Reveal delay={120} className="md:col-span-7">
          {/* Two shelves of the 13 categories, icons and counts, gliding in
              opposite directions on their own - the whole catalogue, not
              tied to the scroll. */}
          <LabFrame project={project} className="h-[20rem] md:h-[26rem]">
            <NumerspaceScene lang={lang} />
          </LabFrame>
        </Reveal>
      </div>
    </Shell>
  );
}

/** Slug -> section. A project without one gets the wide band, which is
    the least presumptuous shape - but give it its own. */
function ProjectSection({ project, lang }: { project: Project; lang: Lang }) {
  switch (project.slug) {
    case "claude-lifecycle":
      return <BuilderSection project={project} lang={lang} />;
    case "lifecycle-card-archive":
      return <LibrarySection project={project} lang={lang} />;
    case "ab-test-playbook":
      return <PlaybookSection project={project} lang={lang} />;
    case "dashboard-builder":
      return <DashboardSection project={project} lang={lang} />;
    case "google-ads-change-history-dashboard":
      return <ExplorerSection project={project} lang={lang} />;
    case "numerspace":
      return <NumerspaceSection project={project} lang={lang} />;
    default:
      return (
        <Shell project={project}>
          <div className="altor-container">
            <Reveal>
              <Headline project={project} />
            </Reveal>
          </div>
        </Shell>
      );
  }
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
        <LabHero t={t} lang={lang} projects={projects} />
        {/* Six sections, one per project, in tab order - six structures. */}
        {projects.map((project) => (
          <ProjectSection key={project.slug} project={project} lang={lang} />
        ))}
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
