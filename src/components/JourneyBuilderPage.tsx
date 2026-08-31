import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Lock } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/Site";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";
import { ProductBenefitStory, ProductHeading, ProductSection } from "@/components/ui/ProductPage";
import { JourneyLibraryCta } from "@/components/ui/JourneyFlows";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { HeroVideoCard } from "@/components/ui/HeroVideoCard";
import { copy, type Lang } from "@/lib/content";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { breadcrumbList, softwareApplication } from "@/lib/schema";

/* Product page for the Lifecycle Marketing Journey Builder.

   Peerbie-composition pass: the page previously led with a text/graph
   hero and worked through Scale/Stories/Anatomy/Inspector/Library/
   HowItWorks bands - all real, all removed per explicit site-owner
   direction in favour of this leaner shape: a video-first hero, three
   "why different" feature panels, a real-pattern flow section, an FAQ,
   and a page-local final CTA.

   Real-data pass: the feature panels and the pattern section used to
   show either Gemini-generated "journey screenshots" or real screenshots
   of the Canonical Journey Library (/lab/journeys - a different, generic
   281-journey subsystem, NOT this product's own output; ACQ-01/CON-38
   are that library's ids, not claude-lifecycle's). Both were wrong for
   this page. Every visual below is now a small React component rendered
   from claude-lifecycle's own real repository (cloned and read directly -
   knowledge/journey-patterns/*.md front matter and step-blueprint tables,
   docs/data-quality-score.md's own worked example, knowledge/channels/
   *.md's hard character limits) - see PATTERNS below for the exact
   source of every number. */

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

/* ---- 09 · Why-different panels — real data, drawn as clean UI cards --
   Replaces the three Gemini-generated "journey screenshot" images (and,
   before that, screenshots of the Canonical Journey Library - a
   different, generic subsystem, not this product's own output). Every
   number and label below is copied from the claude-lifecycle repo
   itself: docs/data-quality-score.md (DQS bands + the doc's own worked
   example, 69), knowledge/journey-patterns/*.md front matter
   (depth_range, default_channels - abandoned-cart, trial-conversion,
   winback), the README's own portfolio example table (Replenishment
   blocked on missing item-level params), and knowledge/channels/*.md
   (email/sms/push hard character limits). Nothing here is a screenshot
   and nothing is invented - it's the site's own design system rendering
   real facts, the same pattern ChangeHistoryExplorerPage.tsx uses for
   its three feature panels. */

const PANEL_CARD = "overflow-hidden rounded-card border border-line bg-paper shadow-[0_0_0_1px_rgb(0_0_0/0.04),0_8px_24px_-16px_rgb(10_16_32/0.15)]";

/** Feature 1 - "Data quality is scored, not assumed." A segmented 0-100
    meter with the three real depth bands, marked at the doc's own worked
    example (DQS 69, an e-commerce store one point short of branched). */
function DqsDepthPanel({ lang }: { lang: Lang }) {
  const t = {
    en: { label: "Data Quality Score", worked: "Worked example (e-commerce, GA4)", bands: ["Simple · 3-5 steps", "Standard · 4-7 steps", "Branched · 7-12 steps"] },
    tr: { label: "Data Quality Score", worked: "Örnek hesap (e-ticaret, GA4)", bands: ["Basit · 3-5 adım", "Standart · 4-7 adım", "Dallanmalı · 7-12 adım"] },
  }[lang];
  return (
    <div className={PANEL_CARD}>
      <div className="p-6">
        <div className="flex items-baseline justify-between">
          <p className="text-sm font-medium text-ink-950">{t.label}</p>
          <p className="font-mono text-2xl font-semibold text-primary-600 tabular-nums">69</p>
        </div>
        <p className="mt-1 text-xs text-ink-500">{t.worked}</p>
        {/* 0–40 / 40–70 / 70–100, widths proportional to the real bands,
            marker at the real worked-example score (69% of the 0-100
            scale = 69, positioned against the whole bar, not one band). */}
        <div className="relative mt-4">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-paper-soft">
            <div className="h-full w-[40%] bg-ink-200" />
            <div className="h-full w-[30%] bg-primary-300" />
            <div className="h-full w-[30%] bg-primary-600" />
          </div>
          <span
            aria-hidden
            style={{ left: "69%" }}
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink-950 shadow"
          />
        </div>
        <ul className="mt-4 flex flex-col gap-1.5 text-[13px] text-ink-600">
          {t.bands.map((b, i) => (
            <li key={b} className={`flex items-center gap-2 ${i === 1 ? "font-medium text-ink-950" : ""}`}>
              <span aria-hidden className={`size-1.5 rounded-full ${i === 0 ? "bg-ink-300" : i === 1 ? "bg-primary-400" : "bg-primary-600"}`} />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Feature 2 - "A portfolio, not a listicle." Three real patterns from
    knowledge/journey-patterns/*.md (depth_range, default_channels), plus
    the README's own "blocked" example so a reader sees both real
    outcomes the engine actually produces. */
function PortfolioPanel({ lang }: { lang: Lang }) {
  const rows = [
    { name: lang === "en" ? "Abandoned cart" : "Terk edilmiş sepet", steps: lang === "en" ? "3-8 steps" : "3-8 adım", channels: ["Email", "Push"], blocked: false },
    { name: lang === "en" ? "Trial conversion" : "Deneme dönüşümü", steps: lang === "en" ? "4-10 steps" : "4-10 adım", channels: ["Email", "In-app", "Push"], blocked: false },
    { name: "Winback", steps: lang === "en" ? "3-6 steps" : "3-6 adım", channels: ["Email", "SMS"], blocked: false },
    {
      name: lang === "en" ? "Replenishment" : "Yeniden stoklama",
      steps: lang === "en" ? "missing item-level params" : "ürün seviyesi parametre eksik",
      channels: [],
      blocked: true,
    },
  ];
  return (
    <div className={PANEL_CARD}>
      <ul className="divide-y divide-line">
        {rows.map((r) => (
          <li key={r.name} className={`flex items-center justify-between gap-3 px-5 py-3.5 ${r.blocked ? "opacity-60" : ""}`}>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink-950">{r.name}</p>
              <p className="mt-0.5 text-xs text-ink-500">{r.steps}</p>
            </div>
            {r.blocked ? (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-paper-soft px-2.5 py-1 text-[11px] font-medium text-ink-500">
                <Lock aria-hidden className="size-3" />
                {lang === "en" ? "blocked" : "kilitli"}
              </span>
            ) : (
              <div className="flex shrink-0 gap-1.5">
                {r.channels.map((c) => (
                  <span key={c} className="rounded-full bg-primary-50 px-2.5 py-1 text-[11px] font-medium text-primary-700">
                    {c}
                  </span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Feature 3 - "Copy is an engineered artifact." Real hard character
    limits from knowledge/channels/email.md, sms.md, push.md - not house
    style, actual validator-enforced numbers. */
function ChannelRulesPanel({ lang }: { lang: Lang }) {
  const rows = [
    { channel: lang === "en" ? "Email" : "E-posta", limits: lang === "en" ? "Subject 20-50 · Body ≤350 · CTA ≤20" : "Konu 20-50 · Gövde ≤350 · CTA ≤20" },
    { channel: "SMS", limits: lang === "en" ? "Body ≤160 (GSM-7)" : "Gövde ≤160 (GSM-7)" },
    { channel: "Push", limits: lang === "en" ? "Title ≤40 · Body ≤120" : "Başlık ≤40 · Gövde ≤120" },
  ];
  return (
    <div className={PANEL_CARD}>
      <ul className="divide-y divide-line">
        {rows.map((r) => (
          <li key={r.channel} className="flex items-center justify-between gap-4 px-5 py-4">
            <span className="w-20 shrink-0 text-sm font-medium text-ink-950">{r.channel}</span>
            <span className="text-right font-mono text-[12.5px] text-ink-600">{r.limits}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---- 10 · Why different — real-data panels, not screenshots ----------- */
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
            visual={<DqsDepthPanel lang={lang} />}
          />
        </PortraitContainer>
      </ProductSection>

      <ProductSection tone="soft" space="lg">
        <PortraitContainer>
          <ProductBenefitStory
            title={c.feature2.title}
            body={c.feature2.body}
            side="left"
            visual={<PortfolioPanel lang={lang} />}
          />
        </PortraitContainer>
      </ProductSection>

      <ProductSection tone="paper" space="lg">
        <PortraitContainer>
          <ProductBenefitStory
            title={c.feature3.title}
            body={c.feature3.body}
            side="right"
            visual={<ChannelRulesPanel lang={lang} />}
          />
        </PortraitContainer>
      </ProductSection>
    </>
  );
}

/* ---- 11 · Pattern flow section — three real patterns, real blueprints
   Replaces the old five-slide image carousel (Gemini renders of the
   Canonical Journey Library - a different subsystem, see the header
   comment). Each card below is drawn from one real
   knowledge/journey-patterns/<slug>.md file's own "Step blueprint
   (standard, N steps)" table - the exact wait/channel/intent/branch the
   engine's knowledge base defines, not a mockup of one. */

type FlowChannel = "email" | "push" | "sms" | "in-app";

const CHANNEL_STYLE: Record<FlowChannel, { label: string; badge: string; bar: string }> = {
  email: { label: "Email", badge: "bg-violet-50 text-violet-700", bar: "bg-violet-500" },
  push: { label: "Push", badge: "bg-sky-50 text-sky-700", bar: "bg-sky-500" },
  sms: { label: "SMS", badge: "bg-teal-50 text-teal-700", bar: "bg-teal-500" },
  "in-app": { label: "In-app", badge: "bg-amber-50 text-amber-700", bar: "bg-amber-500" },
};

type FlowStep = { wait: string; channel: FlowChannel; intent: string; branch?: string };
type Pattern = { name: { en: string; tr: string }; trigger: string; steps: FlowStep[]; exit: { en: string; tr: string } };

/** Source: knowledge/journey-patterns/abandoned-cart.md, winback.md,
    trial-conversion.md - front matter (trigger/depth) and each file's own
    "Step blueprint (standard, N steps)" table, copied verbatim. */
const PATTERNS: Pattern[] = [
  {
    name: { en: "Abandoned cart", tr: "Terk edilmiş sepet" },
    trigger: "add_to_cart",
    steps: [
      { wait: "+1h", channel: "email", intent: "Reminder: cart contents, zero pressure" },
      { wait: "+20h", channel: "push", intent: "Short nudge, deeplink to cart", branch: "if not opened" },
      { wait: "+24h", channel: "email", intent: "Objection handling: shipping/returns/trust" },
      { wait: "+48h", channel: "email", intent: "Social proof on cart items", branch: "if clicked, no purchase" },
      { wait: "+72h", channel: "push", intent: "Last call, no fake urgency" },
    ],
    exit: { en: "purchase · 7-day window", tr: "purchase · 7 günlük pencere" },
  },
  {
    name: { en: "Trial conversion", tr: "Deneme dönüşümü" },
    trigger: "trial_start",
    steps: [
      { wait: "+1h", channel: "email", intent: "Welcome: the one action that predicts success" },
      { wait: "+2d", channel: "in-app", intent: "Nudge toward the core feature", branch: "if no feature used" },
      { wait: "+2d", channel: "email", intent: "Use-case deepening or \"what's blocking you?\"", branch: "split on feature use" },
      { wait: "midpoint", channel: "email", intent: "Progress recap, what stays behind on free" },
      { wait: "−72h", channel: "email", intent: "Expiry notice: date, price, plain and factual" },
      { wait: "−24h", channel: "push", intent: "Last call, real deadline only", branch: "if not clicked" },
    ],
    exit: { en: "subscription_start", tr: "subscription_start" },
  },
  {
    name: { en: "Winback", tr: "Winback" },
    trigger: "segment: lapsed",
    steps: [
      { wait: "on entry", channel: "email", intent: "What changed since you left, no discount" },
      { wait: "+5d", channel: "email", intent: "Personalized best-of, restates original value" },
      { wait: "+7d", channel: "sms", intent: "Short direct reminder, one link", branch: "if steps 1-2 not opened" },
      { wait: "+10d", channel: "email", intent: "Incentive, gated on LTV tier, needs approval" },
    ],
    exit: { en: "purchase or session_start", tr: "purchase veya session_start" },
  },
];

function PatternFlowCard({ pattern, lang }: { pattern: Pattern; lang: Lang }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-card border border-line bg-paper shadow-[0_0_0_1px_rgb(0_0_0/0.04),0_8px_24px_-16px_rgb(10_16_32/0.15)]">
      <div className="border-b border-line px-5 py-4">
        <p className="text-sm font-semibold text-ink-950">{pattern.name[lang]}</p>
        <p className="mt-0.5 font-mono text-[11px] text-ink-400">{pattern.trigger}</p>
      </div>
      <div className="flex flex-col gap-0 px-5 py-5">
        {/* Trigger pill */}
        <div className="flex justify-center">
          <span className="rounded-full bg-ink-950 px-3 py-1 text-[11px] font-medium text-white">
            {pattern.trigger}
          </span>
        </div>
        {pattern.steps.map((step, i) => {
          const cs = CHANNEL_STYLE[step.channel];
          return (
            <div key={i} className="flex flex-col items-center">
              <span aria-hidden className="h-4 w-px bg-line-strong" />
              {step.branch && (
                <span className="-mt-1 mb-1 rounded-full bg-paper-soft px-2 py-0.5 text-[10px] text-ink-500">
                  {step.branch}
                </span>
              )}
              <div className="flex w-full items-stretch overflow-hidden rounded-lg border border-line">
                <span aria-hidden className={`w-1 shrink-0 ${cs.bar}`} />
                <div className="flex-1 bg-paper-soft/60 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${cs.badge}`}>{cs.label}</span>
                    <span className="font-mono text-[10.5px] text-ink-400">{step.wait}</span>
                  </div>
                  <p className="mt-1 text-[12px] leading-snug text-ink-700">{step.intent}</p>
                </div>
              </div>
            </div>
          );
        })}
        <span aria-hidden className="h-4 w-px self-center bg-line-strong" />
        <div className="flex justify-center">
          <span className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-medium text-white">
            {pattern.exit[lang]}
          </span>
        </div>
      </div>
    </div>
  );
}

function CarouselSection({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const c = t.journeyBuilder.carousel;
  return (
    <ProductSection tone="paper" space="xl" className="overflow-hidden">
      <PortraitContainer>
        <ProductHeading eyebrow={c.eyebrow} title={c.title} body={c.body} align="center" />
        <Reveal delay={100} className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {PATTERNS.map((p) => (
            <PatternFlowCard key={p.name.en} pattern={p} lang={lang} />
          ))}
        </Reveal>
        <Reveal delay={160} className="mt-12 flex flex-wrap justify-center gap-2.5">
          <a
            href={`${REPO}/tree/main/knowledge/journey-patterns`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-ink-950 px-5 text-sm font-medium text-white transition-colors hover:bg-primary-600"
          >
            {lang === "en" ? "See all 26 patterns" : "26 pattern'in tümünü gör"}
            <ArrowUpRight aria-hidden className="size-3.5" />
          </a>
          <JourneyLibraryCta lang={lang} label={t.journeyBuilder.pageCta.secondary} />
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
  const path = lang === "en" ? "/lab/claude-lifecycle" : "/tr/lab/claude-lifecycle";
  const jsonLd = [
    breadcrumbList([
      { name: t.footer.home, url: home },
      { name: t.nav.lab, url: lang === "en" ? "/lab" : "/tr/lab" },
      { name: t.journeyBuilder.title, url: path },
    ]),
    // A TypeScript library/repository, not a hosted app - REPO is the same
    // constant the hero's own GitHub link uses.
    softwareApplication({
      name: t.journeyBuilder.title,
      description: t.journeyBuilder.sub,
      url: REPO,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Cross-platform (TypeScript)",
      codeRepository: REPO,
    }),
  ];
  return (
    <>
      <JsonLdScript data={jsonLd} />
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
