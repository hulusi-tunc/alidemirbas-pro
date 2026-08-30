import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/Site";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";
import { ProductBenefitStory, ProductHeading, ProductSection } from "@/components/ui/ProductPage";
import { JourneyLibraryCta } from "@/components/ui/JourneyFlows";
import { JourneyCarousel, type CarouselSlide } from "@/components/ui/JourneyCarousel";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { HeroVideoCard } from "@/components/ui/HeroVideoCard";
import { JOURNEY_SCALE } from "@/lib/journey-marketing";
import { copy, type Lang } from "@/lib/content";

/* Product page for the Lifecycle Marketing Journey Builder.

   Peerbie-composition pass (this round): the page previously led with a
   text/graph hero and worked through Scale/Stories/Anatomy/Inspector/
   Library/HowItWorks bands - all real, all removed per explicit
   site-owner direction in favour of this leaner shape: a video-first
   hero, three "why different" feature stories, a real-journey carousel,
   an FAQ, and a page-local final CTA. Every visual is still real: ACQ-01,
   ACQ-05 and CON-38 are journey ids verified against src/canonical/*.ts,
   not invented, and JOURNEY_SCALE.journeys stays a live count. */

const REPO = "https://github.com/ali-demirbas/claude-lifecycle";

/* ---- 01 · Hero — text left, the demo video right ---------------------
   The video is the primary hero visual (poster + play, swaps in place on
   click) rather than a small corner trigger on a separate graphic - per
   explicit site-owner direction to bring it to the top of the page. */
function Hero({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const c = t.journeyBuilder;
  return (
    <section className="relative isolate overflow-hidden bg-paper pt-16 pb-24 md:pt-20 md:pb-32">
      <PortraitContainer className="text-center">
        <Reveal>
          <p className="altor-eyebrow mb-5 text-ink-400">{c.eyebrow}</p>
          <h1 className="mx-auto max-w-3xl text-h1-fluid font-medium text-ink-950">{c.title}</h1>
        </Reveal>
        <Reveal delay={90} className="mt-6">
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-ink-950/65">{c.sub}</p>
        </Reveal>
        <Reveal delay={140} className="mt-8 flex flex-wrap justify-center gap-2.5">
          <JourneyLibraryCta lang={lang} label={c.ctaLibrary} />
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-line-strong px-5 text-sm font-medium text-ink-700 transition-colors duration-[var(--duration-fast)] hover:border-ink-300 hover:text-ink-950"
          >
            {t.abTesting.repoLink}
            <ArrowUpRight aria-hidden className="size-3.5" />
          </a>
        </Reveal>
        <Reveal delay={180} className="mt-7">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-[13px] text-ink-500">
            {c.proof.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check aria-hidden className="size-3.5 shrink-0 text-primary-600" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Video-first product visual, with floating real-fragment
            decoration around it - the same three fragments the final CTA
            uses, echoed here per the Peerbie hero's own composition
            (a dominant screenshot with a few decorative shapes drifting
            past its edges), desktop only. */}
        <Reveal delay={220} className="relative mx-auto mt-16 max-w-4xl">
          <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
            <div className="absolute -top-8 -left-14 w-32 -rotate-6 opacity-90">
              <Image src="/images/claude-lifecycle/13-fragment-trigger.jpg" alt="" width={280} height={175} className="rounded-lg shadow-lg" />
            </div>
            <div className="absolute -top-10 -right-10 w-36 rotate-3 opacity-90">
              <Image src="/images/claude-lifecycle/14-fragment-handoff.jpg" alt="" width={280} height={175} className="rounded-lg shadow-lg" />
            </div>
            <div className="absolute -bottom-10 -left-8 w-32 rotate-2 opacity-90">
              <Image src="/images/claude-lifecycle/15-fragment-validated.jpg" alt="" width={280} height={175} className="rounded-lg shadow-lg" />
            </div>
          </div>
          <HeroVideoCard
            poster="/images/claude-lifecycle/08-journey-acq-01.jpg"
            posterAlt="ACQ-01, a real acquisition journey, as a claude-lifecycle state machine"
            video="/images/claude-lifecycle/02-hero-workflow-demo.mp4"
          />
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 10 · Why different — two large feature visuals ------------------ */
function WhyDifferent({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const c = t.journeyBuilder.whyDifferent;
  return (
    <>
      <ProductSection tone="paper" space="md" className="pb-0! md:pb-0!">
        <PortraitContainer>
          <ProductHeading eyebrow={c.eyebrow} title={c.title} align="center" />
          <Reveal delay={100} className="mt-8 flex flex-wrap justify-center gap-2.5">
            <a
              href={REPO}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-ink-950 px-5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
              {t.abTesting.repoLink}
              <ArrowUpRight aria-hidden className="size-3.5" />
            </a>
            <JourneyLibraryCta lang={lang} label={t.journeyBuilder.pageCta.secondary} />
          </Reveal>
        </PortraitContainer>
      </ProductSection>

      <ProductSection tone="paper" space="lg">
        <PortraitContainer>
          <ProductBenefitStory
            title={c.feature1.title}
            body={c.feature1.body}
            side="right"
            visual={
              <div className="overflow-hidden rounded-card border border-line">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src="/images/claude-lifecycle/03-explicit-paths.jpg"
                    alt="Every branch in a claude-lifecycle journey resolves to another state, a handoff or an explicit exit"
                    fill
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            }
          />
        </PortraitContainer>
      </ProductSection>

      <ProductSection tone="soft" space="lg">
        <PortraitContainer>
          <ProductBenefitStory
            title={c.feature2.title}
            body={c.feature2.body}
            side="left"
            visual={
              <div className="overflow-hidden rounded-card border border-line">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src="/images/claude-lifecycle/04-state-handoff.jpg"
                    alt="A handoff transfers lifecycle state from one journey to another"
                    fill
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            }
          />
        </PortraitContainer>
      </ProductSection>

      <ProductSection tone="paper" space="lg">
        <PortraitContainer>
          <ProductBenefitStory
            title={c.feature3.title}
            body={c.feature3.body}
            side="right"
            visual={
              <div className="overflow-hidden rounded-card border border-line">
                <div className="relative aspect-[16/10] w-full">
                  <Image
                    src="/images/claude-lifecycle/05-journey-architecture.jpg"
                    alt="ACQ-01, a real acquisition journey, as a reusable state machine"
                    fill
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            }
          />
        </PortraitContainer>
      </ProductSection>
    </>
  );
}

/* ---- 11 · Journey carousel — five real journeys, swiped ---------------
   Slides are real journeys already covered elsewhere on this page
   (ACQ-01, ACQ-05, CON-38 and the identity/audience path each render on)
   - the carousel is a second, glanceable view of the same real library,
   not a second data source. */
function CarouselSection({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const c = t.journeyBuilder.carousel;
  const n = JOURNEY_SCALE.journeys.toLocaleString(lang === "en" ? "en-US" : "tr-TR");
  const slides: CarouselSlide[] = [
    { src: "/images/claude-lifecycle/08-journey-acq-01.jpg", alt: "ACQ-01 - anonymous intent to known identity", caption: "ACQ-01 · Acquisition" },
    { src: "/images/claude-lifecycle/09-journey-explicit-path.jpg", alt: "Every lifecycle decision has an explicit path", caption: "ACQ-05 · Qualification" },
    { src: "/images/claude-lifecycle/10-journey-con-38.jpg", alt: "CON-38 - suppression to release", caption: "CON-38 · Consent" },
    { src: "/images/claude-lifecycle/11-journey-handoff.jpg", alt: "Structured state transfer bridge between two journeys", caption: "ACQ-01 → ACQ-05 · Handoff" },
    { src: "/images/claude-lifecycle/12-journey-segment.jpg", alt: "Audience segment definition and build", caption: "Audience segment" },
  ];
  return (
    <ProductSection tone="paper" space="xl" className="overflow-hidden">
      <PortraitContainer>
        <ProductHeading eyebrow={c.eyebrow} title={c.title.replace("{count}", n)} body={c.body} align="center" />
        <Reveal delay={100} className="mt-14">
          <JourneyCarousel slides={slides} />
        </Reveal>
        <Reveal delay={160} className="mt-12 flex flex-wrap justify-center gap-2.5">
          <JourneyLibraryCta lang={lang} label={t.journeyBuilder.pageCta.secondary} />
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full border border-line-strong px-5 text-sm font-medium text-ink-700 transition-colors hover:border-ink-300 hover:text-ink-950"
          >
            {t.abTesting.repoLink}
            <ArrowUpRight aria-hidden className="size-3.5" />
          </a>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 12 · FAQ ---------------------------------------------------------- */
function Faq({ t }: { t: (typeof copy)[Lang] }) {
  const c = t.journeyBuilder.faq;
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer>
        <ProductHeading eyebrow={c.eyebrow} title={c.title} align="center" />
        <Reveal delay={100} className="mx-auto mt-12 max-w-2xl">
          <FaqAccordion items={c.items.map((item, i) => ({ id: `journey-faq-${i}`, ...item }))} />
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 13 · Final CTA — page-local, not the shared contact CTA ----------
   The shared <FinalCta> (Site.tsx) points at the contact form, which is
   the wrong destination for an open-source repo. Same dark band language
   (bg-ink-950), this page's own two CTAs, three floating fragment images
   as decoration (desktop only, matching the brief). */
function PageCta({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const c = t.journeyBuilder.pageCta;
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 py-24 text-white md:py-32">
      {/* Floating fragments - desktop only, purely decorative */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
        <div className="absolute top-[14%] left-[8%] w-40 -rotate-6 opacity-90">
          <Image src="/images/claude-lifecycle/13-fragment-trigger.jpg" alt="" width={320} height={200} className="rounded-lg" />
        </div>
        <div className="absolute top-[18%] right-[10%] w-44 rotate-3 opacity-90">
          <Image src="/images/claude-lifecycle/14-fragment-handoff.jpg" alt="" width={320} height={200} className="rounded-lg" />
        </div>
        <div className="absolute bottom-[16%] left-[14%] w-40 rotate-2 opacity-90">
          <Image src="/images/claude-lifecycle/15-fragment-validated.jpg" alt="" width={320} height={200} className="rounded-lg" />
        </div>
      </div>

      <PortraitContainer className="relative text-center">
        <Reveal>
          <p className="altor-eyebrow mb-5 text-white/45">{c.eyebrow}</p>
          <h2 className="mx-auto max-w-2xl text-h2-fluid font-medium text-white">{c.title}</h2>
        </Reveal>
        <Reveal delay={90} className="mt-9 flex flex-wrap justify-center gap-3">
          <a
            href={REPO}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-ink-950 transition-colors hover:bg-primary-50"
          >
            {c.primary}
            <ArrowUpRight aria-hidden className="size-4" />
          </a>
          <Link
            href={lang === "en" ? "/lab/journeys" : "/tr/lab/journeys"}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/25 px-6 text-sm font-medium text-white transition-colors hover:border-white/50"
          >
            {c.secondary}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

export default function JourneyBuilderPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? "/tr/lab/claude-lifecycle" : "/lab/claude-lifecycle";
  return (
    <>
      <SiteHeader t={t} anchorBase={home} langHref={langHref} />
      <main>
        <Hero t={t} lang={lang} />
        <WhyDifferent t={t} lang={lang} />
        <CarouselSection t={t} lang={lang} />
        <Faq t={t} />
        <PageCta t={t} lang={lang} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
