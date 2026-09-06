import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CircleSlash, MapPin } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { CtaBurst } from "@/components/ui/CtaBurst";
import { GitHubMark, LinkedInMark } from "@/components/ui/BrandIcons";
import { LabProjectIcon, labAccent } from "@/components/ui/LabProjectIdentity";
import { LabNavDropdown } from "@/components/ui/LabNavDropdown";
import { MobileNav } from "@/components/ui/MobileNav";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Section";
import { StackShowcase } from "@/components/ui/StackShowcase";
import { EntryCard } from "@/components/ui/CalculatorLibrary";
import { withJourneyCount } from "@/lib/archive";
import { JOURNEY_ROWS } from "@/lib/canonical-view";
import { DASHBOARD_REAL } from "@/lib/lab-material";
import { NUMERSPACE_CATALOG } from "@/lib/numerspace-catalog";
import JourneyTopologyPreview from "@/components/ui/JourneyTopologyPreview";
import {
  getFeaturedCalcEntries,
  LIVE_CALCULATOR_SLUGS,
} from "@/lib/calc-catalog";
import { copy, EMAIL, LINKEDIN, type Lang } from "@/lib/content";

const HEADER_T = {
  en: { viewAllLab: "View all projects" },
  tr: { viewAllLab: "Tüm projeleri gör" },
} as const;

const GITHUB = "https://github.com/ali-demirbas";

/* Corporate one-pager for Ali Demirbaş in the Altor design language:
   white-first editorial, Altor Blue, dark hero. */

export function SiteHeader({
  t,
  anchorBase = "",
  langHref,
}: {
  t: (typeof copy)[Lang];
  /** Target for the logo link — "" (i.e. "#top") on the home page itself,
      the home path ("/" or "/tr") when the header is reused on a subpage. */
  anchorBase?: string;
  /** Language-switch target when the counterpart page isn't the home page. */
  langHref?: string;
}) {
  const lang: Lang = t === copy.en ? "en" : "tr";
  const ht = HEADER_T[lang];
  const navItems = [
    { label: t.nav.about, href: t.nav.aboutHref },
    { label: t.nav.lab, href: t.nav.labHref },
    { label: t.nav.calculators, href: t.nav.calculatorsHref },
    { label: t.nav.blog, href: t.nav.blogHref },
    { label: t.nav.stack, href: t.nav.stackHref },
    { label: t.nav.contact, href: t.nav.contactHref },
  ];
  // Real Lab projects (same data LabIndexPage/SiteFooter already use),
  // resolved server-side - `withJourneyCount` is server-only, so the
  // Canonical Journey Library's real {count} token is already filled in
  // before this reaches the client-only LabNavDropdown below. The slug is
  // what the dropdown and the phone menu look the project's glyph up by
  // (LabProjectIdentity.tsx); the tagline replaces the two-line desc.
  const labProjects = t.lab.projects.map((p) => ({
    slug: p.slug,
    name: p.name,
    tagline: withJourneyCount(p.tagline),
    href: p.links[0].href,
  }));

  return (
    // Apollo.io-style header: a normal, solid, sticky bar (not an
    // absolute transparent overlay) - a real fix, not just a restyle:
    // the previous transparent+white-text header was designed to blend
    // into Home's own dark hero band, but every other page (Contact/
    // Stack/Blog/Lab/Calculators/404) has since moved to a light,
    // no-dark-band composition, which made that white text effectively
    // invisible there. A solid white bar reads correctly everywhere,
    // including Home (see that page's own Hero, whose top padding was
    // reduced to match - it no longer needs to reserve space under an
    // overlay). `sticky` (not `fixed`) - it participates in the
    // document's own top of flow rather than needing every page to
    // manually offset its first section under it.
    <header className="sticky top-0 z-40 border-b border-line-soft bg-paper/95 backdrop-blur-sm">
      <div className="altor-container flex h-16 items-center justify-between">
        <a href={anchorBase || "#top"} className="text-[15px] font-semibold tracking-tight text-ink-950">
          Ali Demirbaş
        </a>
        <nav className="hidden items-center gap-8 text-sm text-ink-600 md:flex">
          <Link className="transition-colors hover:text-ink-950" href={t.nav.aboutHref}>{t.nav.about}</Link>
          <LabNavDropdown label={t.nav.lab} href={t.nav.labHref} viewAllLabel={ht.viewAllLab} projects={labProjects} />
          <Link className="transition-colors hover:text-ink-950" href={t.nav.calculatorsHref}>{t.nav.calculators}</Link>
          <Link className="transition-colors hover:text-ink-950" href={t.nav.blogHref}>{t.nav.blog}</Link>
          <Link className="transition-colors hover:text-ink-950" href={t.nav.stackHref}>{t.nav.stack}</Link>
          <Link className="transition-colors hover:text-ink-950" href={t.nav.contactHref}>{t.nav.contact}</Link>
        </nav>
        <div className="flex items-center gap-6">
          <Link href={langHref ?? t.nav.langHref} className="text-sm text-ink-600 transition-colors hover:text-ink-950">
            {t.nav.lang}
          </Link>
          <a
            href={`mailto:${EMAIL}`}
            className="hidden h-10 items-center rounded-full bg-ink-950 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-600 sm:inline-flex"
          >
            {t.nav.cta}
          </a>
          <MobileNav
            items={navItems}
            langHref={langHref ?? t.nav.langHref}
            langLabel={t.nav.lang}
            ctaHref={`mailto:${EMAIL}`}
            ctaLabel={t.nav.cta}
            // Same Lab projects the desktop dropdown lists, so the phone
            // menu is not a shorter version of the site's navigation.
            labHref={t.nav.labHref}
            labProjects={labProjects}
          />
        </div>
      </div>
    </header>
  );
}

const HERO_TILES = ["lifecycle-card-archive", "ab-test-playbook", "numerspace"] as const;

/* THE HERO (Hulusi, 2026-09-06, "focused work on the hero", then "this is a
   personal site, your examples are companies", then "a mix of both"): the
   opening of a PERSON'S site, in two moves borrowed from personal-site
   patterns rather than product landings. First the statement, a
   first-person lead and the two actions, centred (the Contra-style
   introduction above them - avatar, name, role line, chips - was cut by
   Hulusi the same evening: "remove this part from the hero"). Then, still
   in the hero, the bento Portrait
   opens a profile with: the portrait in colour as one tall tile, and tiles
   for the things he built, each with its icon, its name, one plain sentence
   saying what it is and the real count from the data - so a first-time
   visitor reads "a library of journeys", never "what is 284". The dark tile
   carries the career line that used to be a five-row spec table. The
   greyscale portrait under a blue multiply, the spec table and the photo
   frame that came before it are gone. */
/* The miniature inside each product tile - one real thing from the tool,
   not an illustration: a journey's actual graph (the third-largest in the
   library, so the Lab index's largest is not repeated), the A/B pair drawn
   as two carts with the tested element ringed, and the calculator
   categories on the same endless marquee the Lab index uses. Hulusi,
   2026-09-06: "the hero feels a little dead, needs more liveliness". */
const HERO_JOURNEY = [...JOURNEY_ROWS].sort((a, b) => b.nodeCount - a.nodeCount || a.id.localeCompare(b.id))[2];

function TileMini({ slug, lang }: { slug: string; lang: Lang }) {
  if (slug === "lifecycle-card-archive") {
    return (
      <div aria-hidden className="mt-5 -mx-2 h-28 overflow-hidden rounded-xl bg-paper-soft">
        <div className="mx-auto -mt-2 w-[150%] -translate-x-[16%]">
          <JourneyTopologyPreview preview={HERO_JOURNEY.preview} />
        </div>
      </div>
    );
  }
  if (slug === "ab-test-playbook") {
    return (
      <div aria-hidden className="mt-5 -mx-2 grid grid-cols-2 gap-2">
        {(["A", "B"] as const).map((mark) => (
          <div key={mark} className="rounded-xl bg-paper-soft p-3">
            <div className="flex items-center gap-1.5">
              <span className={`grid size-5 place-items-center rounded-full text-xs font-semibold ${mark === "A" ? "bg-ink-950 text-white" : "bg-rose-600 text-white"}`}>{mark}</span>
              <span className="h-1.5 w-10 rounded-full bg-ink-950/10" />
            </div>
            <span className="mt-2.5 block h-1.5 w-full rounded-full bg-ink-950/10" />
            <span className="mt-1.5 block h-1.5 w-2/3 rounded-full bg-ink-950/10" />
            {mark === "A" ? (
              <span className="mt-3 block h-6 rounded-md bg-paper ring-2 ring-rose-300" />
            ) : (
              <span className="mt-3 flex h-6 items-center"><span className="h-1.5 w-1/2 rounded-full bg-primary-500 ring-2 ring-rose-300 ring-offset-2 ring-offset-paper-soft" /></span>
            )}
          </div>
        ))}
      </div>
    );
  }
  if (slug === "numerspace") {
    const names = NUMERSPACE_CATALOG[lang].map((c) => c.name.replace(/ (Calculators|Hesaplayıcıları|Hesaplayıcılar)$/u, ""));
    return (
      <div aria-hidden className="mt-5 -mx-6 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="lab-marquee" style={{ "--marquee-duration": "48s" } as React.CSSProperties}>
          {[...names, ...names].map((name, i) => (
            <span key={`${name}-${i}`} className="mr-2 shrink-0 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-teal-800">
              {name}
            </span>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

function Hero({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const projects = HERO_TILES.map((slug) => t.lab.projects.find((p) => p.slug === slug)).filter((p) => p !== undefined);
  return (
    <section id="top" className="relative isolate overflow-hidden bg-paper-soft pt-14 pb-16 lg:pt-18 lg:pb-20">
      {/* A brand-blue bloom behind the statement, fading out before the
          tiles - the page opens light and warms, it does not open flat. */}
      <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[34rem] bg-[radial-gradient(55%_60%_at_50%_0%,var(--color-primary-100),transparent_70%)]" />
      <div className="altor-container">
        <Reveal delay={60}>
          <h1 className="mx-auto max-w-4xl text-center text-h1 text-balance text-ink-950">
            {t.hero.line1}
            <br className="hidden sm:block" />{" "}
            {t.hero.line2}
          </h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="mx-auto mt-6 max-w-3xl text-center text-xl leading-relaxed text-pretty text-ink-700">{t.hero.lead}</p>
        </Reveal>
        <Reveal delay={180} className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href={`mailto:${EMAIL}`} variant="primary" size="md">
            {t.hero.ctaPrimary}
            <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
          <ButtonLink href={LINKEDIN} variant="outline" size="md">
            {t.hero.ctaSecondary}
            <ArrowUpRight aria-hidden className="size-4" />
          </ButtonLink>
        </Reveal>

        {/* The bento: the person and the things he built as equals. On lg the
            portrait takes the left third across both rows; the four tiles
            fill the rest two by two. */}
        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Reveal delay={240} className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-paper md:row-span-2 md:aspect-auto md:min-h-[26rem]">
            <Image src="/portrait.jpg" alt="Ali Demirbaş" fill sizes="(min-width: 1024px) 24rem, (min-width: 768px) 50vw, 100vw" priority className="object-cover" />
            <p className="absolute bottom-5 left-5 flex items-center gap-1.5 rounded-full bg-paper/95 px-3.5 py-2 text-sm font-medium text-ink-950 ring-1 ring-ink-950/[0.06]">
              <MapPin aria-hidden className="size-4 text-primary-600" />
              {t.hero.portraitPill}
            </p>
          </Reveal>
          {projects.map((project, i) => {
            const accent = labAccent(project.slug);
            const [primary] = project.links;
            return (
              <Reveal key={project.slug} delay={280 + i * 60} className="flex">
                <Link
                  href={primary.href}
                  className="group flex w-full flex-col overflow-hidden rounded-[28px] bg-paper p-6 ring-1 ring-ink-950/[0.06] transition-shadow duration-[var(--duration-fast)] hover:shadow-[0_18px_40px_-24px_rgb(10_16_32/0.35)]"
                >
                  <span aria-hidden className={`grid size-10 place-items-center rounded-xl ${accent.tile}`}>
                    <LabProjectIcon slug={project.slug} className="size-5" />
                  </span>
                  <p className="mt-4 text-lg font-semibold text-ink-950">{project.short}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-pretty text-ink-600">{t.hero.tiles[project.slug as (typeof HERO_TILES)[number]]}</p>
                  <TileMini slug={project.slug} lang={lang} />
                  <p className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm font-medium text-ink-950">
                    <span className="tabular-nums">{withJourneyCount(project.proof ?? "")}</span>
                    <ArrowRight aria-hidden className="size-4 text-ink-400 transition-transform duration-[var(--duration-fast)] group-hover:translate-x-0.5" />
                  </p>
                </Link>
              </Reveal>
            );
          })}
          <Reveal delay={460} className="flex">
            <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-[28px] bg-ink-950 p-6 text-white">
              <span aria-hidden className="absolute -top-16 -right-16 size-56 rounded-full bg-primary-600/40 blur-3xl" />
              <p className="relative text-lg leading-snug font-semibold text-balance">{t.hero.statement}</p>
              <Link href={t.nav.aboutHref} className="mt-6 flex w-fit items-center gap-1.5 text-sm font-medium text-white/80 transition-colors duration-[var(--duration-fast)] hover:text-white">
                {t.hero.statementLink}
                <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/** Short teaser between the hero and the rest of the page - eyebrow, one
    real paragraph from the About page's own lead copy (not new writing),
    and a link out to the full page. */
/* AboutTeaser used to be its own band here: an eyebrow, five lines of prose
   and a link, set at max-w-2xl inside the 1248px container - so the right
   46% of the section was empty - on the same bg-paper as the two sections
   either side of it, which left padding as the only thing separating three
   consecutive bands.

   The prose was not the problem; the band was. It is now the right-hand
   column of Work's heading (below), where it reads as the lede to
   "measurement problems wearing a costume" that it always was. The copy is
   moved verbatim - t.about.eyebrow / teaserLead / moreLink - not rewritten,
   and one dead band leaves the page. */

/* THE BIO (Hulusi, 2026-09-06: "the second section should be a bio - do
   not forget this is a personal website"). Right after the hero, the person:
   the About page's own statement and its own lead paragraph on the left,
   with the way to the full page; on the right the career as it is in
   content.ts's `about.timeline` - the site's source of truth for those
   facts - one row per role, the company's real logo, the period. Nothing
   written for this band alone. It replaces the "More from the Lab" plates
   that sat here for an hour and repeated the hero's tools. */
type BioRow = { key: string; co: string; logo: string; role: string; period: string };

function Bio({ t }: { t: (typeof copy)[Lang] }) {
  const rows = t.about.timeline.flatMap((e): BioRow[] =>
    "roles" in e
      ? e.roles.map((r) => ({ key: `${e.co}-${r.role}`, co: e.co, logo: e.logo, role: r.role, period: r.period }))
      : [{ key: `${e.co}-${e.role}`, co: e.co, logo: e.logo, role: e.role, period: e.period }],
  );
  return (
    <section id="bio" className="bg-paper py-20 md:py-28">
      <div className="altor-container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <Reveal>
            <p className="altor-eyebrow text-ink-400">{t.about.eyebrow}</p>
            <h2 className="mt-5 max-w-[30ch] text-h2 text-balance text-ink-950">{t.home.bio.title}</h2>
            <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-pretty text-ink-600">{t.about.teaserLead}</p>
            <div className="mt-8">
              <ButtonLink href={t.nav.aboutHref} variant="outline" size="md">
                {t.about.moreLink}
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
            </div>
          </Reveal>
          {/* THE TIMELINE (Hulusi, 2026-09-06: "logos are so small, don't
              put them in a box, some fancy animation here, maybe a
              timeline"). The wordmarks bare at 28px, one rail that draws
              itself in brand blue when the band scrolls into view, the rows
              arriving one after another behind it, and a pulse on the node
              of the role he holds today. All CSS (globals.css, THE BIO
              TIMELINE), keyed off the Reveal wrapper; off under reduced
              motion. */}
          <Reveal delay={80}>
            <p className="text-sm font-medium text-ink-500">{t.about.experience}</p>
            <ol className="relative mt-4 flex list-none flex-col p-0 [--bio-rail:0.375rem] md:[--bio-rail:11rem]">
              <span aria-hidden className="bio-rail absolute top-3 bottom-3 left-[var(--bio-rail)] w-px" />
              {rows.map((r, i) => (
                <li
                  key={r.key}
                  className="bio-row relative grid grid-cols-[minmax(0,1fr)] gap-y-1.5 py-5 pl-8 md:grid-cols-[9.5rem_minmax(0,1fr)] md:gap-x-10 md:pl-0"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <span
                    aria-hidden
                    className={`absolute top-[1.65rem] left-[calc(var(--bio-rail)-0.3125rem)] size-2.5 rounded-full ring-4 ring-paper ${i === 0 ? "bio-node-live bg-primary-600" : "bg-ink-300"}`}
                  />
                  <span className="text-sm whitespace-nowrap text-ink-500 tabular-nums md:pt-1 md:text-right">{r.period}</span>
                  <div className="min-w-0">
                    <Image src={r.logo} alt={r.co} width={140} height={28} className="h-7 w-auto max-w-[9rem] object-contain object-left" />
                    <span className="mt-2.5 block text-lg leading-snug font-semibold text-balance text-ink-950">{r.role}</span>
                    <span className="mt-0.5 block text-sm text-ink-600">{r.co}</span>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* THE CHECK, drawn small: the Dashboard Builder's comparability rule on
   the README's own example - four revenue figures that must not be added
   up, the naive total struck through, the platform of record standing.
   It is the one object under "Measurement that survives an audit", and
   it is what "measurement problems in disguise" looks like. */
function ComparabilityMini({ lang }: { lang: Lang }) {
  const ex = DASHBOARD_REAL.revenueExample;
  const max = Math.max(...ex.parts.map((x) => x.value));
  return (
    <div aria-hidden className="rounded-2xl bg-paper p-4 ring-1 ring-ink-950/[0.06]">
      <ul className="flex flex-col gap-2">
        {ex.parts.map((x) => (
          <li key={x.source} className="grid grid-cols-[5.5rem_minmax(0,1fr)_3.5rem] items-center gap-3 text-xs">
            <span className="truncate text-ink-600">{x.source}</span>
            <span className="h-2 rounded-full bg-primary-100">
              <span className="block h-2 rounded-full bg-primary-500" style={{ width: `${(x.value / max) * 100}%` }} />
            </span>
            <span className="text-right font-mono text-ink-950 tabular-nums">${x.value.toFixed(1)}M</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-xs">
        <span className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 font-medium text-rose-700">
          <CircleSlash aria-hidden className="size-3.5" />
          {lang === "en" ? "Not comparable" : "Karşılaştırılamaz"}
        </span>
        <span className="text-ink-500">
          {lang === "en" ? "Added up" : "Toplanınca"}{" "}
          <span className="font-mono text-ink-400 line-through tabular-nums">${ex.naiveSum.toFixed(1)}M</span>
          {" · "}
          {lang === "en" ? "Platform of record" : "Kayıt platformu"}{" "}
          <span className="font-mono font-semibold text-ink-950 tabular-nums">${ex.trueTotal.toFixed(1)}M</span>
        </span>
      </div>
    </div>
  );
}

/** What I do: four services as rows, the first opened with its object. The
    ranking the old "Primary + 02 03 04" list only labelled is now visible:
    measurement gets the room and the evidence, the other three get one
    line each, and every row links to the tool that came out of it -
    services with proof, the way Phantom Studios lists its practice areas
    beside a real piece of work. The About paragraph that used to sit in
    this band is gone; the hero's dark tile already points to About. */
function Work({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  return (
    <section id="work" className="bg-paper py-20 md:py-28">
      <div className="altor-container">
        <SectionHeading eyebrow={t.home.work.eyebrow} title={t.home.work.title} intro={t.home.work.lede} />

        <ul className="mt-14 flex list-none flex-col gap-3 p-0">
          {t.home.work.services.map((service, i) => {
            const project = t.lab.projects.find((p) => p.slug === service.tool);
            const accent = labAccent(service.tool);
            const opened = i === 0;
            return (
              <Reveal key={service.title} delay={60 + i * 60} as="li">
                <div
                  className={`grid gap-6 rounded-[28px] bg-paper-soft p-6 md:p-8 ${
                    opened ? "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-12" : "md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-10"
                  }`}
                >
                  <div className={opened ? "flex flex-col" : "flex items-start gap-4"}>
                    <span aria-hidden className={`grid size-10 shrink-0 place-items-center rounded-xl ${accent.tile}`}>
                      <LabProjectIcon slug={service.tool} className="size-5" />
                    </span>
                    <div className={opened ? "mt-5" : ""}>
                      <h3 className="text-h3 text-ink-950">{service.title}</h3>
                      {opened && <p className="mt-3 max-w-[52ch] leading-relaxed text-pretty text-ink-600">{service.body}</p>}
                      {opened && project && (
                        <Link href={project.links[0].href} className="mt-6 flex w-fit items-center gap-1.5 text-sm font-medium text-ink-950 transition-colors duration-[var(--duration-fast)] hover:text-primary-600">
                          {t.home.work.builtFor}: {project.short}
                          <ArrowRight aria-hidden className="size-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                  {opened ? (
                    <ComparabilityMini lang={lang} />
                  ) : (
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-8">
                      <p className="max-w-[52ch] leading-relaxed text-pretty text-ink-600">{service.body}</p>
                      {project && (
                        <Link href={project.links[0].href} className="flex w-fit shrink-0 items-center gap-1.5 text-sm font-medium whitespace-nowrap text-ink-950 transition-colors duration-[var(--duration-fast)] hover:text-primary-600">
                          {t.home.work.builtFor}: {project.short}
                          <ArrowRight aria-hidden className="size-4" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </ul>
        <Reveal delay={360} className="mt-12">
          <ButtonLink href={t.nav.labHref} variant="outline" size="md">
            {t.home.labMore}
            <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}

/* Calculators.

   Was a heading + a grouped text-link rail (names only, no cards) - see
   git history for the prior reasoning against boxing all 19 at once. Per
   explicit site-owner direction, now a 6-card teaser reusing the exact
   card CalculatorLibrary's own /calculators grid renders (EntryCard),
   plus one "see all" link - the same shape as the Lab section above it.
   getFeaturedCalcEntries() returns a genuine prefix of the real,
   routable catalog (funnel order), not a hand-picked or invented list. */
function Calculators({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const entries = getFeaturedCalcEntries(lang, 6);

  return (
    <section id="calculators" className="bg-paper py-20 md:py-28">
      <div className="altor-container">
        <SectionHeading
          eyebrow={t.home.calc.eyebrow}
          title={t.home.calc.title}
          intro={t.home.calc.intro}
        />
        <p className="mt-6 text-sm text-ink-500">
          <span className="tnum">{LIVE_CALCULATOR_SLUGS.length}</span> {t.home.calc.countSuffix}
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry, i) => (
            <Reveal key={entry.slug} delay={i * 50}>
              <EntryCard entry={{ ...entry, searchText: "" }} index={i} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={entries.length * 50 + 40}>
          <div className="mt-12">
            <ButtonLink href={t.nav.calculatorsHref} variant="outline" size="md">
              {t.home.calc.more}
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* THE CLOSING PLATE. Every page ends on this, so it is a site-wide
   surface (seven callers), changed on Hulusi's ask (2026-09-05: the global
   CTA "does not have any bg and effect on it").

   What it was: a flat ink-950 slab with white type - the retired dark
   stage. Two answers were rendered and rejected the same day: a
   photographic sky with a slow drift ("I really didn't like the cloud
   background effect"), then a blue-50 band with the journey library on a
   marquee. Hulusi picked this one from three rendered candidates.

   The plate is the calculator's answer plate: the primary button's own
   bg-primary-600 ground, rounded, inside the container, and it answers
   the same way - the pixel wavefront (ui/PixelField.tsx) sweeps across it
   once as it scrolls into view and again when the pointer enters it
   (ui/CtaBurst.tsx). Clean at rest, like the answer plate: no ambient
   texture ever, the pixel language fires only as an event. `data-tone`
   dark flips the email button to its white plate and the LinkedIn ghost
   to the dark-ground ring. */
export function FinalCta({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section id="contact" className="bg-paper py-20 md:py-28">
      <div className="altor-container">
        <Reveal>
          <div
            data-tone="dark"
            className="relative isolate overflow-hidden rounded-[28px] bg-primary-600 px-6 py-16 text-center sm:px-12 md:py-24"
          >
            <CtaBurst />
            <h2 className="mx-auto max-w-2xl text-h2 text-balance text-white">
              {t.finalCta.title}
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-pretty text-white/75">{t.finalCta.body}</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href={`mailto:${EMAIL}`} variant="primary" size="md">
                {t.finalCta.button}
              </ButtonLink>
              <ButtonLink href={LINKEDIN} variant="outlineInverted" size="md">
                <span className="flex items-center gap-2">
                  {t.finalCta.linkedin}
                  <ArrowUpRight aria-hidden className="size-4" />
                </span>
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function SiteFooter({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const home = lang === "en" ? "/" : "/tr";
  const quickLinks = [
    { label: t.footer.home, href: home },
    { label: t.nav.about, href: t.nav.aboutHref },
    { label: t.nav.lab, href: t.nav.labHref },
    { label: t.nav.calculators, href: t.nav.calculatorsHref },
    { label: t.nav.blog, href: t.nav.blogHref },
    { label: t.nav.stack, href: t.nav.stackHref },
    { label: t.nav.contact, href: t.nav.contactHref },
  ];

  return (
    // Restyled after a Slack-footer reference: light background (was a
    // near-black `bg-ink-950` plate) with the wordmark on its own at the
    // left and the link groups laid out as a row of bold-uppercase-header
    // columns to its right, rather than stacked under a single dark band.
    // `bg-paper-soft` (the site's own barely-there off-white tint, already
    // used for the Contact form zone) - explicitly lighter than the old
    // black footer, per request. Link/heading colors flip from
    // white-on-dark to ink-on-light using the same token ramp.
    <footer className="bg-paper-soft pt-16 pb-8">
      <div className="altor-container">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:gap-16">
          <Link href={home} className="shrink-0 text-[15px] font-semibold tracking-tight text-ink-950">
            Ali Demirbaş
          </Link>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-16">
            <div>
              <p className="altor-eyebrow font-semibold tracking-wide text-ink-950 uppercase">{t.footer.quickLinks}</p>
              <ul className="mt-4 flex flex-col gap-3">
                {quickLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-ink-600 transition-colors hover:text-ink-950">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="altor-eyebrow font-semibold tracking-wide text-ink-950 uppercase">{t.footer.projects}</p>
              <ul className="mt-4 flex flex-col gap-3">
                {t.lab.projects.map((project) => (
                  <li key={project.slug}>
                    <a
                      href={project.links[0].href}
                      {...(project.links[0].href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="text-sm text-ink-600 transition-colors hover:text-ink-950"
                    >
                      {project.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="altor-eyebrow font-semibold tracking-wide text-ink-950 uppercase">{t.footer.connect}</p>
              <ul className="mt-4 flex flex-col gap-3">
                <li>
                  <a href={`mailto:${EMAIL}`} className="text-sm text-ink-600 transition-colors hover:text-ink-950">
                    {EMAIL}
                  </a>
                </li>
                <li>
                  <a href={LINKEDIN} target="_blank" rel="noreferrer" className="text-sm text-ink-600 transition-colors hover:text-ink-950">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href={GITHUB} target="_blank" rel="noreferrer" className="text-sm text-ink-600 transition-colors hover:text-ink-950">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 text-sm text-ink-400 sm:flex-row">
          <div className="flex items-center gap-3">
            <span>{t.footer.left}</span>
            <span aria-hidden>·</span>
            <span>{t.footer.right}</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={LINKEDIN} target="_blank" rel="noreferrer" aria-label="LinkedIn"
              className="text-ink-400 transition-colors hover:text-ink-950"
            >
              <LinkedInMark className="size-4" />
            </a>
            <a
              href={GITHUB} target="_blank" rel="noreferrer" aria-label="GitHub"
              className="text-ink-400 transition-colors hover:text-ink-950"
            >
              <GitHubMark className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Site({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return (
    <>
      <SiteHeader t={t} />
      <main>
        <Hero t={t} lang={lang} />
        <Bio t={t} />
        <Work t={t} lang={lang} />
        {/* Expertise, StatsBand and Experience pulled off the home page for
            now - components kept below, just not rendered. Re-add
            <Expertise t={t} />, <StatsBand t={t} /> and/or <Experience
            t={t} /> here to bring any of them back. */}
        <Calculators t={t} lang={lang} />
        <StackShowcase lang={lang} />
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
