import { ArrowUpRight } from "lucide-react";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { FaqAccordion, type FaqItem } from "@/components/ui/FaqAccordion";
import { InstallationStepper, type InstallStep } from "@/components/ui/InstallationStepper";
import { RelatedGrid, type RelatedItem } from "@/components/ui/RelatedGrid";
import { Reveal } from "@/components/ui/Reveal";
import { copy, type Lang } from "@/lib/content";

/* Reusable Skill/Plugin Product Page template - foundation for
   ab-test-playbook-style pages that don't have a bespoke one yet.

   Section order: Hero -> What it does -> How it works / examples ->
   Installation -> FAQ -> Related tools. Same visual language as the
   existing bespoke AbTestingPage (dark intro band, altor-container,
   alternating bg-paper/bg-paper-soft, Reveal stagger) - not a new
   design, a generalization of the pattern that page already
   established, so this template and AbTestingPage read as siblings, not
   two different systems.

   AbTestingPage itself is intentionally NOT rewritten to use this
   template in this pass - it already has real hand-authored content
   (methodology, worked example, 5 rules) that doesn't fit this
   foundation's generic 5 sections without losing detail. This template
   is for projects that don't have a page yet. */

export type SkillProductContent = {
  slug: string;
  eyebrow: string;
  title: string;
  sub: string;
  /** Hero CTAs - GitHub, live demo, etc. External links open in a new tab. */
  primaryLinks: { label: string; href: string }[];
  whatItDoes: { title: string; body: string; bullets?: string[] };
  howItWorks?: { title: string; body?: string; bullets?: string[] };
  installTitle: string;
  installSteps: InstallStep[];
  faqTitle?: string;
  faq?: FaqItem[];
  relatedTitle: string;
  related: RelatedItem[];
};

function Hero({ c }: { c: SkillProductContent }) {
  return (
    // pt-40 -> pt-24: SiteHeader is now a real, solid header, not an
    // absolute overlay - see its own comment in Site.tsx.
    <section data-tone="dark" className="relative isolate overflow-hidden bg-ink-950 pt-24 pb-16 md:pb-20">
      <div
        aria-hidden
        className="absolute inset-x-0 top-[-18rem] -z-10 h-[36rem] bg-[radial-gradient(50%_50%_at_50%_50%,var(--color-blue-600)_0%,transparent_70%)] opacity-40"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px)] [background-size:calc(100%/8)_100%]"
      />
      <div className="altor-container">
        <Reveal>
          <p className="altor-eyebrow mb-5 text-white/45">{c.eyebrow}</p>
          <h1 className="max-w-3xl bg-gradient-to-r from-primary-300 to-white bg-clip-text text-display-xl text-transparent">
            {c.title}
          </h1>
        </Reveal>
        <Reveal delay={90} className="mt-6">
          <p className="max-w-2xl text-xl leading-relaxed text-white/75">{c.sub}</p>
        </Reveal>
        {c.primaryLinks.length > 0 && (
          <Reveal delay={140} className="mt-8">
            <div className="flex flex-wrap gap-2.5">
              {c.primaryLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  {...(link.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="flex items-center gap-2 border border-white/20 px-4 py-2 text-sm text-white/80 transition-colors hover:border-white/40 hover:text-white"
                >
                  {link.label}
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </a>
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

function WhatItDoes({ c }: { c: SkillProductContent }) {
  const w = c.whatItDoes;
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="altor-container">
        <Reveal>
          <h2 className="max-w-2xl text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] leading-[1.1] text-ink-900">{w.title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600">{w.body}</p>
        </Reveal>
        {w.bullets && w.bullets.length > 0 && (
          <Reveal delay={80} className="mt-8 flex max-w-2xl flex-wrap gap-2">
            {w.bullets.map((b) => (
              <span key={b} className="rounded-md border border-line bg-paper-soft px-3 py-1.5 text-sm text-ink-700">
                {b}
              </span>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  );
}

function HowItWorks({ c }: { c: SkillProductContent }) {
  if (!c.howItWorks) return null;
  const h = c.howItWorks;
  return (
    <section className="bg-paper-soft py-24 md:py-32">
      <div className="altor-container">
        <Reveal>
          <h2 className="max-w-2xl text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] leading-[1.1] text-ink-900">{h.title}</h2>
          {h.body && <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-600">{h.body}</p>}
        </Reveal>
        {h.bullets && h.bullets.length > 0 && (
          <Reveal delay={80} className="mt-8 flex flex-col gap-2 border-t border-line pt-6">
            {h.bullets.map((b) => (
              <p key={b} className="flex gap-2 text-sm leading-relaxed text-ink-600">
                <span aria-hidden className="text-neutral-400">–</span>
                <span>{b}</span>
              </p>
            ))}
          </Reveal>
        )}
      </div>
    </section>
  );
}

function Install({ c }: { c: SkillProductContent }) {
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="altor-container max-w-2xl">
        <Reveal>
          <h2 className="text-[clamp(1.5rem,1.1rem+1.6vw,2.25rem)] leading-[1.1] text-ink-900">{c.installTitle}</h2>
        </Reveal>
        <Reveal delay={80} className="mt-10">
          <InstallationStepper steps={c.installSteps} />
        </Reveal>
      </div>
    </section>
  );
}

function Faq({ c }: { c: SkillProductContent }) {
  if (!c.faq || c.faq.length === 0) return null;
  return (
    <section className="bg-paper-soft py-24 md:py-32">
      <div className="altor-container max-w-2xl">
        <Reveal>
          <FaqAccordion title={c.faqTitle ?? "FAQ"} items={c.faq} />
        </Reveal>
      </div>
    </section>
  );
}

function Related({ c }: { c: SkillProductContent }) {
  if (c.related.length === 0) return null;
  return (
    <section className="bg-paper py-24 md:py-32">
      <div className="altor-container">
        <Reveal>
          <RelatedGrid title={c.relatedTitle} items={c.related} />
        </Reveal>
      </div>
    </section>
  );
}

export default function SkillProductPage({ lang, content }: { lang: Lang; content: SkillProductContent }) {
  const t = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? `/tr/lab/${content.slug}` : `/lab/${content.slug}`;
  return (
    <>
      <SiteHeader t={t} anchorBase={home} langHref={langHref} />
      <main>
        <Hero c={content} />
        <WhatItDoes c={content} />
        <HowItWorks c={content} />
        <Install c={content} />
        <Faq c={content} />
        <Related c={content} />
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
