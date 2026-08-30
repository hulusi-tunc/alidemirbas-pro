import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { GitHubMark, LinkedInMark } from "@/components/ui/BrandIcons";
import { LAB_PREVIEWS } from "@/components/ui/LabPreviews";
import { LabNavDropdown } from "@/components/ui/LabNavDropdown";
import { MobileNav } from "@/components/ui/MobileNav";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Section";
import { StackShowcase } from "@/components/ui/StackShowcase";
import { withJourneyCount } from "@/lib/archive";
import {
  getAllLiveSpecs,
  GROUP_LABEL,
  LIBRARY_GROUP,
  LIBRARY_GROUP_ORDER,
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
  // before this reaches the client-only LabNavDropdown below.
  const labProjects = t.lab.projects.map((p) => ({
    name: p.name,
    desc: withJourneyCount(p.desc),
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
      className="relative isolate flex flex-col overflow-hidden border-b border-line bg-paper pt-16 pb-16 lg:pt-20 lg:pb-20"
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
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-0">
                  <ButtonLink href={`mailto:${EMAIL}`} variant="primary" size="sm" className="btn-col-1 max-w-full">
                    <span className="flex w-full items-center justify-between gap-4">
                      {t.hero.ctaPrimary}
                      <ArrowRight aria-hidden className="size-4" />
                    </span>
                  </ButtonLink>
                  <ButtonLink href={LINKEDIN} variant="outline" size="sm" className="btn-col-1 max-w-full">
                    <span className="flex w-full items-center justify-between gap-4">
                      {t.hero.ctaSecondary}
                      <ArrowUpRight aria-hidden className="size-4" />
                    </span>
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
                      <dt className="font-mono text-[11px] tracking-[0.12em] text-ink-400 uppercase">
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
                <div aria-hidden className="absolute -inset-3 border border-line" />
                <div className="relative aspect-4/5 overflow-hidden bg-blue-600">
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
            <p className="altor-eyebrow text-ink-400">{t.about.eyebrow}</p>
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
            <p className="font-mono text-[11px] tracking-[0.12em] text-ink-400 uppercase">
              {t.home.work.primaryLabel}
            </p>
            <div>
              <h3 className="text-2xl font-semibold text-ink-950">{t.home.work.primary.title}</h3>
              <p className="mt-3 max-w-[62ch] leading-relaxed text-ink-600">{t.home.work.primary.body}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={140}>
          <ul className="mt-12 md:ml-[11rem]">
            {t.home.work.rest.map((item, i) => (
              <li
                key={item.title}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 border-t border-line py-4"
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

/** Lab, as bordered cards - frame on top, title, description, one action
    pill below - reusing the exact illustrative preview LabIndexPage
    already builds for that project (LabPreviews.tsx) instead of a fake
    "product screenshot": real journey-canvas nodes, real category counts,
    the real AB-004 record, honestly-labelled bar/row illustrations for the
    two tools with no single number to show. A user-supplied reference for
    this layout used AI-generated screenshot mockups with garbled,
    meaningless UI text baked into the images - realistic-looking fabricated
    evidence, which this project's own constitution (AGENTS.md, anti-
    patterns.md #9) bans outright. Same card shape, same one-per-project
    frame-then-text-then-button structure; every pixel inside the frame is
    real.

    One column, full-width cards on narrow viewports; two columns side by
    side from `md` up. */
function Lab({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  return (
    <section id="lab" className="bg-paper-soft py-24 md:py-28">
      <div className="altor-container">
        <SectionHeading eyebrow={t.lab.label} title={t.lab.title} intro={t.lab.intro} />

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2">
          {t.lab.projects.map((project, i) => {
            const preview = LAB_PREVIEWS[project.slug]?.({ project, lang, layout: "stack" });
            // Prefer the real GitHub link when one exists; five of six
            // projects have one. The Canonical Journey Library doesn't (it
            // lives at /lab/journeys, not a separate repo) - falling back to
            // its own first link rather than fabricating a GitHub URL.
            const action = project.links.find((l) => l.href.includes("github.com")) ?? project.links[0];
            const external = action.href.startsWith("http");
            return (
              <Reveal key={project.slug} delay={i * 60}>
                <article className="flex h-full flex-col rounded-2xl border border-line bg-paper p-6 sm:p-7">
                  <div className="overflow-hidden rounded-xl bg-paper-soft p-3 sm:p-4 [&>div]:!shadow-none">
                    {preview}
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-ink-950 sm:text-xl">{project.name}</h3>
                  <p className="mt-3 flex-1 text-[0.9375rem] leading-relaxed text-ink-600">
                    {withJourneyCount(project.desc)}
                  </p>
                  <a
                    href={action.href}
                    {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary-200 px-4 py-2 text-sm font-medium text-primary-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
                  >
                    {action.label}
                  </a>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={t.lab.projects.length * 60 + 40}>
          <Link
            href={t.nav.labHref}
            className="mt-14 flex w-fit items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            {t.home.labMore}
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* Calculators.

   This band used to be a heading, a two-line intro, one mono count and a
   link - four lines of text holding a full py-32 section, with the right
   half of the page empty and roughly 270px of nothing below it. The
   emptiness was not restraint: the section had a real anchor available and
   showed none of it.

   The anchor is the library itself. getAllLiveSpecs() returns the 19 live
   calculators with their real names, and LIBRARY_GROUP puts each one in its
   real product group, so the right-hand column is the actual index - no
   invented names, no placeholder tiles, and it cannot drift from what is
   routable because it is read from the same catalog the routes are.

   Names only, as a rail rather than cards: a name is not structured enough
   to earn a border, and 19 bordered boxes is exactly the failure the Lab
   index above already avoids. */
function Calculators({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const specs = getAllLiveSpecs();
  const groups = LIBRARY_GROUP_ORDER.map((group) => ({
    group,
    items: specs.filter((spec) => LIBRARY_GROUP[spec.slug] === group),
  })).filter((g) => g.items.length > 0);

  return (
    <section id="calculators" className="bg-paper py-20 md:py-28">
      <div className="altor-container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div>
            <SectionHeading
              eyebrow={t.home.calc.eyebrow}
              title={t.home.calc.title}
              intro={t.home.calc.intro}
            />
            <Reveal delay={90}>
              <p className="mt-8 font-mono text-sm text-ink-500">
                <span className="tnum">{LIVE_CALCULATOR_SLUGS.length}</span> {t.home.calc.countSuffix}
              </p>
              <Link
                href={t.nav.calculatorsHref}
                className="mt-5 flex w-fit items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
              >
                {t.home.calc.more}
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </Reveal>
          </div>

          <Reveal delay={140}>
            <div className="flex flex-col gap-7 border-t border-line pt-7 lg:border-t-0 lg:pt-1">
              {groups.map(({ group, items }) => (
                <div key={group} className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-[10rem_minmax(0,1fr)]">
                  <p className="altor-eyebrow pt-1 text-ink-400">{GROUP_LABEL[group][lang]}</p>
                  <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
                    {items.map((spec) => (
                      <li key={spec.slug}>
                        <Link
                          href={`${t.nav.calculatorsHref}/${spec.slug}`}
                          className="text-[0.9375rem] text-ink-700 underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink-950 hover:decoration-ink-400"
                        >
                          {spec.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function FinalCta({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section id="contact" data-tone="dark" className="relative isolate overflow-hidden bg-ink-950 py-24 text-white md:py-32">
      <div className="altor-container text-center">
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-[clamp(1.75rem,1.15rem+2.4vw,2.875rem)] leading-[1.08] text-white">
            {t.finalCta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-white/75">{t.finalCta.body}</p>
        </Reveal>
        <Reveal delay={120} className="mt-9">
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href={`mailto:${EMAIL}`} variant="primary" size="md">
              {t.finalCta.button}
            </ButtonLink>
            <ButtonLink href={LINKEDIN} variant="ghost" size="md">
              <span className="flex items-center gap-2">
                {t.finalCta.linkedin}
                <ArrowUpRight aria-hidden className="size-4" />
              </span>
            </ButtonLink>
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
    <footer className="border-t border-line bg-paper-soft pt-16 pb-8">
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
        <Lab t={t} lang={lang} />
        <Calculators t={t} lang={lang} />
        <StackShowcase lang={lang} />
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
