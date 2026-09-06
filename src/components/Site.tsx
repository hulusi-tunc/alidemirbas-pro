import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { ButtonLink, buttonStyles } from "@/components/ui/Button";
import { PixelFill } from "@/components/ui/PixelFill";
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

function Hero({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section
      id="top"
      // The last dark band on the site comes off. Every other page had
      // already moved to a light composition (see SiteHeader's own note on
      // why the transparent white-text bar had to go); the home page was
      // the only thing still asking the reader to cross a tone boundary at
      // the top of the site. Ink on paper, hairline rules, and the portrait
      // plate left as the one place colour does any work.
      // Tinted stage, no rule under it. The hero and the Work band below
      // were both white, so a hairline was doing all the seam work; one
      // step of ground does it without a stroke, and matches the stage on
      // every calculator page. Deleting the line without the tint would
      // leave a padding-only seam - this project's own known defect.
      className="relative isolate flex flex-col overflow-hidden bg-paper-soft pt-16 pb-16 lg:pt-20 lg:pb-20"
    >

      <div className="relative flex flex-1 flex-col justify-center">
        <div className="altor-container">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
            <div>
              <Reveal>
                <h1 className="max-w-3xl text-display-xl text-ink-950">
                  {t.hero.line1}
                  <br />
                  {t.hero.line2}
                </h1>
              </Reveal>
              <Reveal delay={90} className="mt-6">
                <p className="max-w-lg text-xl leading-relaxed text-ink-900">{t.hero.lead}</p>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-600">{t.hero.sub}</p>
              </Reveal>
              <Reveal delay={170} className="mt-8">
                <div className="flex flex-wrap gap-3">
                  <ButtonLink href={`mailto:${EMAIL}`} variant="primary" size="md">
                    {t.hero.ctaPrimary}
                    <ArrowRight aria-hidden className="size-4" />
                  </ButtonLink>
                  <ButtonLink href={LINKEDIN} variant="outline" size="md">
                    {t.hero.ctaSecondary}
                    <ArrowUpRight aria-hidden className="size-4" />
                  </ButtonLink>
                </div>
              </Reveal>
              <Reveal delay={240} className="mt-10">
                {/* The three chips that used to sit here carried the same
                    facts, but a chip row reads as decoration and could hold
                    only three. Set as a data sheet on the mono rail the
                    detail pages already speak in, they read as a record, and
                    the two facts that had nowhere to go (what I work on, and
                    that the work happens in two languages) fit. */}
                <dl className="max-w-xl border-t border-line">
                  {t.home.spec.map((row) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-[7rem_minmax(0,1fr)] gap-4 border-b border-line py-3"
                    >
                      <dt className="text-[13px] font-medium text-ink-400">
                        {row.label}
                      </dt>
                      <dd className="text-[0.9375rem] text-ink-900">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>

            {/* portrait plate: the photograph on a blue field, framed by rules */}
            <Reveal delay={120} className="hidden lg:block">
              <div className="relative mx-auto w-full max-w-sm">
                {/* The square double-frame this plate used to carry came off
                    with the hard-technical direction: one soft rounded plate,
                    no drawn frame around it. */}
                <div className="relative aspect-4/5 overflow-hidden rounded-3xl bg-blue-600">
                  <Image
                    src="/portrait.jpg"
                    alt="Ali Demirbaş"
                    fill
                    sizes="(min-width: 1024px) 24rem, 0px"
                    priority
                    className="object-cover opacity-95 grayscale"
                  />
                  <div aria-hidden className="absolute inset-0 bg-blue-600/20 mix-blend-multiply" />
                </div>
              </div>
            </Reveal>
          </div>
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

/** What I do: one ranked item with room, then the rest as a numbered list.
    A row of equal cards would claim the four are equally important; they are
    not, and the first is what the other three are built on. */
function Work({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section id="work" className="bg-paper py-20 md:py-28">
      <div className="altor-container">
        {/* Two columns, so the statement has something to sit against. The
            heading alone left the right half of this band empty; the About
            prose that used to occupy its own dead band now answers it. */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          <SectionHeading eyebrow={t.home.work.eyebrow} title={t.home.work.title} />
          <Reveal delay={60} className="lg:pt-10">
            <p className="text-[13px] font-medium text-ink-400">{t.about.eyebrow}</p>
            <p className="mt-4 max-w-[46ch] text-[1.0625rem] leading-relaxed text-ink-600">
              {t.about.teaserLead}
            </p>
            <Link
              href={t.nav.aboutHref}
              className="mt-5 flex w-fit items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              {t.about.moreLink}
              <ArrowRight aria-hidden className="size-3.5" />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={90}>
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-[9rem_minmax(0,1fr)] md:gap-8">
            {/* Plain case, like every other label since the mono rail was
                retired. */}
            <p className="text-[13px] font-medium text-ink-400">
              {t.home.work.primaryLabel}
            </p>
            <div>
              <h3 className="text-2xl font-semibold text-ink-950">{t.home.work.primary.title}</h3>
              <p className="mt-3 max-w-[62ch] leading-relaxed text-ink-600">{t.home.work.primary.body}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={140}>
          {/* Soft filled rows rather than a ruled table: three hairlines
              stacked under three lines of prose was the stroke-heavy habit
              the site has left, and the rows read as a list either way. */}
          <ul className="mt-12 flex list-none flex-col gap-2.5 p-0 md:ml-[11rem]">
            {t.home.work.rest.map((item, i) => (
              <li
                key={item.title}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 rounded-xl bg-paper-soft px-5 py-4"
              >
                <span className="tnum pt-0.5 font-mono text-xs text-ink-400">
                  {String(i + 2).padStart(2, "0")}
                </span>
                <span className="text-[0.9375rem] leading-relaxed text-ink-600">
                  <b className="font-semibold text-ink-950">{item.title}.</b> {item.body}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* LAB TEASER (2026-09-06). Six plates in the language the Lab index now
   speaks (LabIndexPage.tsx / ui/ProductFrame.tsx): the project's own
   photograph - clean, no colour overlay here, like the index - with the
   project's mark and its real proof line on it; under the plate the name,
   the tagline and real buttons. The scenes that tell each project's story
   stay on the index, where they have room; the homepage's job is to route
   there. What it replaced: six bordered cards with deep editorial-dark
   panels around illustrative previews and a green outline link in a
   colour the button system does not have. */

function LabPlate({ project }: { project: (typeof copy)[Lang]["lab"]["projects"][number] }) {
  const accent = labAccent(project.slug);
  const [primary, ...secondary] = project.links;
  const github = secondary.find((l) => l.href.includes("github.com"));
  return (
    <article className="flex h-full flex-col">
      <div data-hue={accent.hue} className="lab-frame relative isolate aspect-[4/3] overflow-hidden rounded-[28px]">
        <Image
          src={`/lab/frames/${project.slug}.jpg`}
          alt=""
          aria-hidden
          fill
          sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
          className="-z-10 origin-bottom scale-[1.3] object-cover object-bottom"
        />
        <span className={`absolute top-5 left-5 grid size-11 place-items-center rounded-xl ${accent.tile} shadow-[0_12px_30px_-14px_rgb(10_16_32/0.5)]`}>
          <LabProjectIcon slug={project.slug} className="size-5" />
        </span>
        {project.proof && (
          <span className="absolute bottom-5 left-5 rounded-full bg-paper/90 px-3.5 py-2 text-[13px] font-medium text-ink-950 tabular-nums shadow-[0_12px_30px_-14px_rgb(10_16_32/0.4)] backdrop-blur">
            {withJourneyCount(project.proof)}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-1 pt-5">
        <h3 className="text-[19px] leading-snug font-semibold tracking-tight text-ink-950">{project.name}</h3>
        <p className="mt-1.5 flex-1 text-[15px] leading-relaxed text-ink-600">{withJourneyCount(project.tagline)}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <ButtonLink href={primary.href} variant="primary" size="sm">
            {primary.label}
            <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
          {github && (
            <a href={github.href} target="_blank" rel="noreferrer" className={buttonStyles({ variant: "outline", size: "sm" })}>
              <PixelFill />
              {github.label}
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function Lab({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section id="lab" className="bg-paper-soft py-24 md:py-28">
      <div className="altor-container">
        <SectionHeading eyebrow={t.lab.label} title={t.lab.title} intro={t.lab.intro} />

        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {t.lab.projects.map((project, i) => (
            <Reveal key={project.slug} delay={i * 60}>
              <LabPlate project={project} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={t.lab.projects.length * 60 + 40} className="mt-14">
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
          <Link
            href={t.nav.calculatorsHref}
            className="mt-10 flex w-fit items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            {t.home.calc.more}
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
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
            <h2 className="mx-auto max-w-2xl text-[clamp(1.75rem,1.15rem+2.4vw,2.875rem)] leading-[1.08] font-semibold tracking-[-0.025em] text-balance text-white">
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
        <Hero t={t} />
        <Work t={t} />
        {/* Expertise, StatsBand and Experience pulled off the home page for
            now - components kept below, just not rendered. Re-add
            <Expertise t={t} />, <StatsBand t={t} /> and/or <Experience
            t={t} /> here to bring any of them back. */}
        <Lab t={t} />
        <Calculators t={t} lang={lang} />
        <StackShowcase lang={lang} />
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
