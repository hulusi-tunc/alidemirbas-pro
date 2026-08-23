import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkle } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { GitHubMark, LinkedInMark } from "@/components/ui/BrandIcons";
import { LabProjectGrid } from "@/components/ui/LabProjectGrid";
import { MobileNav } from "@/components/ui/MobileNav";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Section";
import { copy, EMAIL, LINKEDIN, type Lang } from "@/lib/content";
import { logoSrc, stackPreview } from "@/lib/stack";

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
  const navItems = [
    { label: t.nav.about, href: t.nav.aboutHref },
    { label: t.nav.lab, href: t.nav.labHref },
    { label: t.nav.calculators, href: t.nav.calculatorsHref },
    { label: t.nav.blog, href: t.nav.blogHref },
    { label: t.nav.stack, href: t.nav.stackHref },
    { label: t.nav.contact, href: t.nav.contactHref },
  ];

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="altor-container flex h-[4.5rem] items-center justify-between">
        <a href={anchorBase || "#top"} className="text-[15px] font-semibold tracking-tight text-white">
          Ali Demirbaş
        </a>
        <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          <Link className="transition-colors hover:text-white" href={t.nav.aboutHref}>{t.nav.about}</Link>
          <Link className="transition-colors hover:text-white" href={t.nav.labHref}>{t.nav.lab}</Link>
          <Link className="transition-colors hover:text-white" href={t.nav.calculatorsHref}>{t.nav.calculators}</Link>
          <Link className="transition-colors hover:text-white" href={t.nav.blogHref}>{t.nav.blog}</Link>
          <Link className="transition-colors hover:text-white" href={t.nav.stackHref}>{t.nav.stack}</Link>
          <Link className="transition-colors hover:text-white" href={t.nav.contactHref}>{t.nav.contact}</Link>
        </nav>
        <div className="flex items-center gap-6">
          <Link href={langHref ?? t.nav.langHref} className="text-sm text-white/70 transition-colors hover:text-white">
            {t.nav.lang}
          </Link>
          <a
            href={`mailto:${EMAIL}`}
            className="hidden h-10 items-center bg-white px-4 text-sm font-medium text-ink-900 transition-colors hover:bg-neutral-100 sm:inline-flex"
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
      data-tone="dark"
      className="relative isolate flex min-h-[92svh] flex-col overflow-hidden bg-ink-950 pt-32 pb-12 lg:pt-36"
    >
      {/* quiet blue wash + vertical rules, the reference hero's ground */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-[-18rem] -z-10 h-[36rem] bg-[radial-gradient(50%_50%_at_50%_50%,var(--color-blue-600)_0%,transparent_70%)] opacity-40"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px)] [background-size:calc(100%/8)_100%]"
      />

      <div className="relative flex flex-1 flex-col justify-center">
        <div className="altor-container">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
            <div>
              <Reveal>
                <h1 className="max-w-3xl bg-gradient-to-r from-primary-300 to-white bg-clip-text text-display-xl text-transparent">
                  {t.hero.line1}
                  <br />
                  {t.hero.line2}
                </h1>
              </Reveal>
              <Reveal delay={90} className="mt-6">
                <p className="max-w-lg text-xl leading-relaxed text-white">{t.hero.lead}</p>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-white/75">{t.hero.sub}</p>
              </Reveal>
              <Reveal delay={170} className="mt-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-0">
                  <ButtonLink href={`mailto:${EMAIL}`} variant="primary" size="sm" className="btn-col-1 max-w-full">
                    <span className="flex w-full items-center justify-between gap-4">
                      {t.hero.ctaPrimary}
                      <ArrowRight aria-hidden className="size-4" />
                    </span>
                  </ButtonLink>
                  <ButtonLink href={LINKEDIN} variant="ghost" size="sm" className="btn-col-1 max-w-full">
                    <span className="flex w-full items-center justify-between gap-4">
                      {t.hero.ctaSecondary}
                      <ArrowUpRight aria-hidden className="size-4" />
                    </span>
                  </ButtonLink>
                </div>
              </Reveal>
              <Reveal delay={240} className="mt-8">
                <ul className="flex flex-wrap items-center gap-x-7 gap-y-3">
                  {t.hero.reassurance.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-base">
                      <Sparkle aria-hidden className="size-3.5 text-white" />
                      <span className="bg-gradient-to-r from-primary-300 to-white bg-clip-text text-transparent">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            {/* portrait plate: the photograph on a blue field, framed by rules */}
            <Reveal delay={120} className="hidden lg:block">
              <div className="relative mx-auto w-full max-w-sm">
                <div aria-hidden className="absolute -inset-3 border border-white/15" />
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
function AboutTeaser({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="altor-container">
        <Reveal>
          <p className="altor-eyebrow text-ink-400">{t.about.eyebrow}</p>
          <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-600">{t.about.teaserLead}</p>
          <Link
            href={t.nav.aboutHref}
            className="mt-6 flex w-fit items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            {t.about.moreLink}
            <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function Lab({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section id="lab" className="bg-paper py-24 md:py-32">
      <div className="altor-container">
        <SectionHeading eyebrow={t.lab.label} title={t.lab.title} intro={t.lab.intro} />
        <div className="mt-14">
          <LabProjectGrid t={t} />
        </div>
      </div>
    </section>
  );
}

/** Short teaser for the Stack page - eyebrow, a curated 8-tool subset of
    the full stack (same names as the cv site's own home-page preview),
    a link to the full /stack page. */
function StackTeaser({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const tools = stackPreview();
  return (
    <section className="bg-paper-soft py-24 md:py-32">
      <div className="altor-container">
        <SectionHeading eyebrow={t.stack.eyebrow} title={t.stack.homeTitle} intro={t.stack.homeIntro} />
        <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tools.map((tool) => (
            <div key={tool.name} className="flex items-center gap-3 border border-line bg-paper p-3.5">
              <span className="relative size-11 shrink-0 border border-line bg-paper-soft p-2">
                <Image src={logoSrc(tool.domain)} alt="" fill sizes="2.75rem" className="object-contain" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[15px] font-medium tracking-tight text-ink-950">{tool.name}</span>
                <span className="block truncate text-xs text-neutral-500">{tool.tag[lang]}</span>
              </span>
            </div>
          ))}
        </div>
        <Link
          href={t.nav.stackHref}
          className="mt-8 flex w-fit items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          {t.stack.homeMore}
          <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      </div>
    </section>
  );
}

export function FinalCta({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section id="contact" data-tone="dark" className="relative isolate overflow-hidden bg-ink-950 py-24 text-white md:py-32">
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-[-18rem] -z-10 h-[32rem] bg-[radial-gradient(50%_50%_at_50%_50%,var(--color-blue-600)_0%,transparent_70%)] opacity-40"
      />
      <div className="altor-container text-center">
        <Reveal>
          <h2 className="mx-auto max-w-2xl bg-gradient-to-r from-primary-300 to-white bg-clip-text text-[clamp(1.75rem,1.15rem+2.4vw,2.875rem)] leading-[1.08] text-transparent">
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
    <footer className="border-t border-white/10 bg-ink-950 pt-16 pb-8 text-white">
      <div className="altor-container">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p className="altor-eyebrow text-white/40">{t.footer.quickLinks}</p>
            <ul className="mt-4 flex flex-col gap-3">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-white/70 transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="altor-eyebrow text-white/40">{t.footer.projects}</p>
            <ul className="mt-4 flex flex-col gap-3">
              {t.lab.projects.map((project) => (
                <li key={project.slug}>
                  <a
                    href={project.links[0].href}
                    {...(project.links[0].href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {project.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="altor-eyebrow text-white/40">{t.footer.connect}</p>
            <ul className="mt-4 flex flex-col gap-3">
              <li>
                <a href={`mailto:${EMAIL}`} className="text-sm text-white/70 transition-colors hover:text-white">
                  {EMAIL}
                </a>
              </li>
              <li>
                <a href={LINKEDIN} target="_blank" rel="noreferrer" className="text-sm text-white/70 transition-colors hover:text-white">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href={GITHUB} target="_blank" rel="noreferrer" className="text-sm text-white/70 transition-colors hover:text-white">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/50 sm:flex-row">
          <div className="flex items-center gap-3">
            <span>{t.footer.left}</span>
            <span aria-hidden>·</span>
            <span>{t.footer.right}</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={LINKEDIN} target="_blank" rel="noreferrer" aria-label="LinkedIn"
              className="text-white/50 transition-colors hover:text-white"
            >
              <LinkedInMark className="size-4" />
            </a>
            <a
              href={GITHUB} target="_blank" rel="noreferrer" aria-label="GitHub"
              className="text-white/50 transition-colors hover:text-white"
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
        <AboutTeaser t={t} />
        {/* Expertise, StatsBand and Experience pulled off the home page for
            now - components kept below, just not rendered. Re-add
            <Expertise t={t} />, <StatsBand t={t} /> and/or <Experience
            t={t} /> here to bring any of them back. */}
        <Lab t={t} />
        <StackTeaser t={t} lang={lang} />
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
