import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Sparkle } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { MobileNav } from "@/components/ui/MobileNav";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/Section";
import { copy, EMAIL, LINKEDIN, type Lang } from "@/lib/content";

/* Corporate one-pager for Ali Demirbaş in the Altor design language:
   white-first editorial, Altor Blue, dark hero, full-bleed blue stats band. */

export function SiteHeader({
  t,
  anchorBase = "",
  langHref,
}: {
  t: (typeof copy)[Lang];
  /** Prefix for the home page's section anchors — "" on the home page itself,
      the home path ("/" or "/tr") on subpages so #expertise still resolves. */
  anchorBase?: string;
  /** Language-switch target when the counterpart page isn't the home page. */
  langHref?: string;
}) {
  const navItems = [
    { label: t.nav.about, href: t.nav.aboutHref },
    { label: t.nav.lab, href: t.nav.labHref },
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

      {/* trust rail pinned to the section's bottom edge */}
      <Reveal delay={300}>
        <div className="altor-container mt-16 lg:mt-20">
          <p className="text-sm text-white/50">{t.trust}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-12 gap-y-6 border-t border-white/10 pt-6">
            {t.xp.rows.map((row) => (
              <span key={row.co} className="relative h-5 w-28">
                <Image
                  src={row.logo}
                  alt={row.co}
                  fill
                  sizes="7rem"
                  className="object-contain object-left brightness-0 invert opacity-55 transition-opacity hover:opacity-90"
                />
              </span>
            ))}
          </div>
        </div>
      </Reveal>
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
          <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-ink-600">{t.about.lead}</p>
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

function Expertise({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section id="expertise" className="bg-paper py-24 md:py-32">
      <div className="altor-container">
        <SectionHeading eyebrow={t.expertise.label} title={t.expertise.title} />
        <div className="mt-14 grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-3">
          {t.expertise.cards.map((card, i) => (
            <Reveal key={card.title} delay={i * 80} className="bg-paper">
              <div className="flex h-full flex-col p-8">
                <span className="text-sm font-medium text-neutral-500">0{i + 1}</span>
                <h3 className="mt-6 text-xl font-semibold tracking-tight text-ink-950">{card.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-ink-600">{card.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsBand({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section aria-labelledby="stats-title" className="altor-grain relative isolate overflow-hidden bg-blue-600 py-16 text-white md:py-20">
      <div
        aria-hidden
        className="absolute inset-x-0 top-[-16rem] -z-10 h-[30rem] bg-[radial-gradient(50%_50%_at_50%_50%,var(--color-blue-400)_0%,transparent_70%)] opacity-60"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px)] [background-size:calc(100%/8)_100%]"
      />
      <div className="altor-container">
        <h2 id="stats-title" className="sr-only">{t.stats.title}</h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4 lg:gap-x-10">
          {t.stats.items.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 70}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block text-[clamp(2.25rem,1.4rem+2.6vw,3.5rem)] leading-none font-medium tracking-[-0.04em] text-white">
                  {stat.value}
                </span>
                <span className="mt-4 block max-w-64 text-sm leading-snug text-white/65">{stat.label}</span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Experience({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section id="experience" className="bg-paper-soft py-24 md:py-32">
      <div className="altor-container">
        <SectionHeading eyebrow={t.xp.label} title={t.xp.title} />
        <div className="mt-14">
          {t.xp.rows.map((row, i) => (
            <Reveal key={row.co + row.years} delay={i * 50}>
              <div className="group grid grid-cols-[7rem_1fr_auto] items-center gap-6 border-t border-line py-6 last:border-b">
                <span className="text-sm text-neutral-500 tabular-nums">{row.years}</span>
                <div>
                  <h3 className="text-lg font-medium tracking-tight text-ink-950">{row.role}</h3>
                  <p className="mt-0.5 text-sm text-ink-500 md:hidden">{row.co}</p>
                </div>
                <div className="relative hidden h-5 w-32 md:block">
                  <Image
                    src={row.logo}
                    alt={row.co}
                    fill
                    sizes="8rem"
                    className="object-contain object-right opacity-55 grayscale transition-[filter,opacity] duration-200 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Lab({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <section id="lab" className="bg-paper py-24 md:py-32">
      <div className="altor-container">
        <SectionHeading eyebrow={t.lab.label} title={t.lab.title} intro={t.lab.intro} />
        <div className="mt-14 flex flex-col gap-6">
          {t.lab.projects.map((project, i) => (
            <Reveal key={project.slug} delay={i * 80}>
              <article className="group flex flex-col border border-line p-8 transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-neutral-400 hover:shadow-[0_12px_32px_-16px_rgba(10,16,32,0.18)]">
                <h3 className="text-xl font-semibold tracking-tight text-ink-950">{project.name}</h3>
                <p className="mt-1 font-mono text-sm text-neutral-500">{project.slug}</p>
                <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-600">{project.desc}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span key={tag} className="border border-line px-2.5 py-1 text-xs text-ink-600">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                  {project.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      {...(link.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
                    >
                      {link.label}
                      <ArrowUpRight aria-hidden className="size-3.5" />
                    </a>
                  ))}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
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

export function SiteFooter({ t }: { t: (typeof copy)[Lang] }) {
  return (
    <footer className="border-t border-white/10 bg-ink-950 py-8 text-sm text-white/50">
      <div className="altor-container flex items-center justify-between">
        <span>{t.footer.left}</span>
        <span>{t.footer.right}</span>
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
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} />
    </>
  );
}
