import Image from "next/image";
import { ArrowUpRight, BellRing, Check, CircleCheck, Gauge, LayoutList, Lock, Mail, MessageSquare, Ruler, Smartphone } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/Site";
import { buttonStyles } from "@/components/ui/Button";
import { PixelFill } from "@/components/ui/PixelFill";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { ProductCta } from "@/components/ui/ProductCta";
import { ProductFrame, ProductMark } from "@/components/ui/ProductFrame";
import { Reveal } from "@/components/ui/Reveal";
import { AppBar, AppMeta, AppTitle, Badge, FormLabel, Table, Td, Th, Tr, Window } from "@/components/ui/LabWindow";
import { PATTERNS, PatternFlowCard } from "@/components/ui/PatternFlow";
import { ProductBenefitStory, ProductHeading, ProductSection } from "@/components/ui/ProductPage";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { copy, type Lang } from "@/lib/content";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { breadcrumbList, softwareApplication } from "@/lib/schema";

/* Product page for the Lifecycle Marketing Journey Builder.

   Peerbie-composition pass: the page previously led with a text/graph
   hero and worked through Scale/Stories/Anatomy/Inspector/Library/
   HowItWorks bands - all real, all removed per explicit site-owner
   direction in favour of this leaner shape: a hero, three "why
   different" feature panels, a real-pattern flow section, an FAQ, and a
   page-local final CTA.

   Real-data pass: every photographic/video asset this page used to carry
   (the hero's "demo" video and its poster, the three "fragment" images
   floating around the hero and the final CTA, the three old feature
   images, the five old carousel slides) was either a Gemini/Veo-generated
   fake or a real screenshot of the wrong product (the Canonical Journey
   Library at /lab/journeys - a different, generic 281-journey subsystem,
   NOT this product's own output; ACQ-01/CON-38 are that library's ids,
   not claude-lifecycle's). The AI-generated ones were confirmed, not
   assumed: every one of those files carries an identical Google C2PA
   content-credential signature embedded in the file itself. All of it is
   gone. Every visual below is now a small React component rendered from
   claude-lifecycle's own real repository (cloned and read directly -
   knowledge/journey-patterns/*.md front matter and step-blueprint tables,
   docs/data-quality-score.md's own worked example, knowledge/channels/
   *.md's hard character limits) - see PATTERNS below for the exact
   source of every number. No photo, no video, no AI-generated image
   remains on this page. */

const REPO = "https://github.com/ali-demirbas/claude-lifecycle";
/* The plugin's own hosted demo - the same URL content.ts's Lab project
   entry links. This page used to send people to /lab/journeys, the
   Canonical Journey Library, as its second destination everywhere; that
   library is a different subsystem with no relation to this plugin (site-
   owner correction, 2026-09), so every one of those links is gone and the
   demo is the second destination instead. */
const DEMO = "https://ali-demirbas.github.io/claude-lifecycle/demo/journey-canvas.html";

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
          <ProductMark slug="claude-lifecycle" lang={lang} className="mb-5" />
          <h1 className="mx-auto max-w-3xl text-h1-fluid font-medium text-ink-950">{c.title}</h1>
        </Reveal>
        <Reveal delay={90} className="mt-6">
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-ink-950/65">{c.sub}</p>
        </Reveal>
        <Reveal delay={140} className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={REPO} target="_blank" rel="noreferrer" className={buttonStyles({ variant: "primary", size: "md" })}>
            <PixelFill />
            {t.abTesting.repoLink}
            <ArrowUpRight aria-hidden className="size-4" />
          </a>
          <a href={DEMO} target="_blank" rel="noreferrer" className={buttonStyles({ variant: "outline", size: "md" })}>
            <PixelFill />
            {t.abTesting.demoLink}
            <ArrowUpRight aria-hidden className="size-4" />
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

        {/* The hero visual used to be an AI-generated "demo" video and
            poster - traced to a batch of Gemini/Veo-generated assets (all
            of it, plus the three "fragment" decorations below, carry an
            identical Google C2PA content-credential signature embedded in
            the files themselves: none of it was a real recording of this
            product). Then one real blueprint as a bare card. Now
            (2026-09-06, "real product screenshots, not Claude design") it
            is the builder's canvas itself: the pattern rail, the
            trial-conversion blueprint drawn as nodes - six real steps,
            two real branches - and the inspector open on step one
            (ui/LabProductWindows.tsx). Still nothing is a screenshot of
            anything; it is the engine's own definition, rendered. */}
        <Reveal delay={220} className="mx-auto mt-16 max-w-5xl text-left">
          {/* THE LIVE DEMO, photographed: the builder's own journey canvas
              (ali-demirbas.github.io/claude-lifecycle/demo/journey-canvas.html)
              captured on 2026-09-06, scrolled to the trial-activation
              journey's nodes - a screenshot of the real thing, not a
              drawing of it (Hulusi: "if you want to update the screenshots,
              you can"). On the project's plate, in its hue. */}
          <ProductFrame slug="claude-lifecycle" plate="claude-lifecycle-1">
            <a href={DEMO} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl bg-ink-950 ring-1 ring-white/10 shadow-[0_28px_70px_-28px_rgb(10_16_32/0.6)]">
              <Image
                src="/lab/claude-lifecycle/demo.jpg"
                alt={lang === "en" ? "The journey canvas demo: a trial-activation journey drawn as entry, email, decision and email nodes on a dark canvas." : "Journey tuvali demosu: koyu bir tuvalde giriş, e-posta, karar ve e-posta düğümleri olarak çizilmiş bir deneme aktivasyonu journey'si."}
                width={2880}
                height={1800}
                sizes="(min-width: 1280px) 1024px, 100vw"
                className="block h-auto w-full"
                priority
              />
            </a>
          </ProductFrame>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 09 · Why-different windows - real data, drawn as the product ----
   Replaces the three Gemini-generated "journey screenshot" images (and,
   before that, screenshots of the Canonical Journey Library - a
   different, generic subsystem, not this product's own output), and then
   the three plain cards that replaced them. Every number and label below
   is copied from the claude-lifecycle repo itself:
   docs/data-quality-score.md (DQS bands + the doc's own worked example,
   69), knowledge/journey-patterns/*.md front matter (depth_range,
   default_channels - abandoned-cart, trial-conversion, winback), the
   README's own portfolio example table (Replenishment blocked on missing
   item-level params), and knowledge/channels/*.md (email/sms/push hard
   character limits). Each is now drawn as the surface it comes from - a
   scored report, an eligibility table, a validator's rule table - with
   the window parts in ui/LabWindow.tsx, so they read as the product at
   work rather than as a website's cards about it. Nothing is a
   screenshot and nothing is invented. */

const PANEL_T = {
  en: {
    dqs: {
      label: "Screenshot of the builder's data-quality report: score 69 of 100, the standard depth band.",
      address: "docs/data-quality-score.md",
      scale: "0–100",
      title: "Data Quality Score",
      worked: "Worked example · e-commerce, GA4",
      score: "Score",
      depth: "Depth",
      range: "DQS",
      steps: "Journey depth",
      current: "this dataset",
      bands: [
        { name: "Simple", range: "0–39", steps: "3-5 steps" },
        { name: "Standard", range: "40–69", steps: "4-7 steps · one branch" },
        { name: "Branched", range: "70–100", steps: "7-12 steps · behavioral" },
      ],
    },
    portfolio: {
      label: "Screenshot of the builder's portfolio: three eligible patterns with their depth and channels, one blocked on a missing event.",
      address: "claude-lifecycle · portfolio",
      eligible: "eligible",
      title: "Pattern eligibility",
      source: "README · portfolio example",
      pattern: "Pattern",
      depth: "Depth",
      channels: "Channels",
      status: "Status",
      ready: "Ready",
      blocked: "Blocked",
      rows: [
        { name: "Abandoned cart", steps: "3-8 steps", channels: ["Email", "Push"], blocked: false },
        { name: "Trial conversion", steps: "4-10 steps", channels: ["Email", "In-app", "Push"], blocked: false },
        { name: "Winback", steps: "3-6 steps", channels: ["Email", "SMS"], blocked: false },
        { name: "Replenishment", steps: "missing item-level params", channels: [], blocked: true },
      ],
    },
    channels: {
      label: "Screenshot of the builder's channel rules: the hard character limits for email, SMS and push.",
      address: "knowledge/channels",
      validator: "validator rules",
      title: "Hard character limits",
      files: "email.md · sms.md · push.md",
      channel: "Channel",
      field: "Field",
      limit: "Limit",
      rows: [
        { channel: "Email", field: "Subject", limit: "20–50" },
        { channel: "Email", field: "Body", limit: "≤ 350" },
        { channel: "Email", field: "CTA", limit: "≤ 20" },
        { channel: "SMS", field: "Body", limit: "≤ 160 · GSM-7" },
        { channel: "Push", field: "Title", limit: "≤ 40" },
        { channel: "Push", field: "Body", limit: "≤ 120" },
      ],
    },
  },
  tr: {
    dqs: {
      label: "Builder'ın veri kalitesi raporunun ekran görüntüsü: 100 üzerinden 69, standart derinlik bandı.",
      address: "docs/data-quality-score.md",
      scale: "0–100",
      title: "Data Quality Score",
      worked: "Örnek hesap · e-ticaret, GA4",
      score: "Skor",
      depth: "Derinlik",
      range: "DQS",
      steps: "Journey derinliği",
      current: "bu veri seti",
      bands: [
        { name: "Basit", range: "0–39", steps: "3-5 adım" },
        { name: "Standart", range: "40–69", steps: "4-7 adım · tek dal" },
        { name: "Dallanmalı", range: "70–100", steps: "7-12 adım · davranışsal" },
      ],
    },
    portfolio: {
      label: "Builder'ın portföyünün ekran görüntüsü: derinlik ve kanallarıyla üç uygun desen, eksik bir event yüzünden kilitli bir tane.",
      address: "claude-lifecycle · portfolio",
      eligible: "uygun",
      title: "Desen uygunluğu",
      source: "README · portföy örneği",
      pattern: "Desen",
      depth: "Derinlik",
      channels: "Kanallar",
      status: "Durum",
      ready: "Hazır",
      blocked: "Kilitli",
      rows: [
        { name: "Terk edilmiş sepet", steps: "3-8 adım", channels: ["Email", "Push"], blocked: false },
        { name: "Deneme dönüşümü", steps: "4-10 adım", channels: ["Email", "In-app", "Push"], blocked: false },
        { name: "Winback", steps: "3-6 adım", channels: ["Email", "SMS"], blocked: false },
        { name: "Yeniden stoklama", steps: "ürün seviyesi parametre eksik", channels: [], blocked: true },
      ],
    },
    channels: {
      label: "Builder'ın kanal kurallarının ekran görüntüsü: e-posta, SMS ve push için katı karakter sınırları.",
      address: "knowledge/channels",
      validator: "doğrulayıcı kuralları",
      title: "Katı karakter sınırları",
      files: "email.md · sms.md · push.md",
      channel: "Kanal",
      field: "Alan",
      limit: "Sınır",
      rows: [
        { channel: "Email", field: "Konu", limit: "20–50" },
        { channel: "Email", field: "Gövde", limit: "≤ 350" },
        { channel: "Email", field: "CTA", limit: "≤ 20" },
        { channel: "SMS", field: "Gövde", limit: "≤ 160 · GSM-7" },
        { channel: "Push", field: "Başlık", limit: "≤ 40" },
        { channel: "Push", field: "Gövde", limit: "≤ 120" },
      ],
    },
  },
} as const;

/* The flow vocabulary (PatternFlow.tsx): a channel keeps its hue and its
   icon here, on the canvas above and in the legend. */
const CHANNEL_HUE = { Email: "violet", SMS: "teal", Push: "sky", "In-app": "amber" } as const;
const CHANNEL_ICON = {
  Email: <Mail aria-hidden />,
  SMS: <MessageSquare aria-hidden />,
  Push: <BellRing aria-hidden />,
  "In-app": <Smartphone aria-hidden />,
} as const;
type ChannelName = keyof typeof CHANNEL_HUE;
const isChannel = (c: string): c is ChannelName => c in CHANNEL_HUE;

/** Feature 1 - "Data quality is scored, not assumed." The report the
    score comes from: the 0-100 meter with its three real bands, marked
    at the doc's own worked example (69, one point short of branched),
    and the bands as a table with the current one selected. */
function DqsWindow({ lang }: { lang: Lang }) {
  const t = PANEL_T[lang].dqs;
  return (
    <Window label={t.label} address={t.address} meta={t.scale}>
      <AppBar>
        <AppTitle icon={<Gauge aria-hidden />}>{t.title}</AppTitle>
        <AppMeta className="ml-auto truncate">{t.worked}</AppMeta>
      </AppBar>
      <div className="px-4 pt-4 pb-1">
        <div className="flex items-baseline justify-between">
          <FormLabel>{t.score}</FormLabel>
          <span className="font-mono text-[28px] leading-none font-semibold text-primary-600 tabular-nums">69</span>
        </div>
        {/* 0–40 / 40–70 / 70–100, widths proportional to the real bands,
            marker at the real worked-example score (69% of the 0-100
            scale = 69, positioned against the whole bar, not one band). */}
        <div className="relative mt-3">
          <div className="flex h-2.5 overflow-hidden rounded-full bg-paper-soft">
            <div className="h-full w-[40%] bg-ink-200" />
            <div className="h-full w-[30%] bg-primary-300" />
            <div className="h-full w-[30%] bg-primary-600" />
          </div>
          <span
            aria-hidden
            style={{ left: "69%" }}
            className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink-950 shadow"
          />
        </div>
      </div>
      <Table className="mt-3">
        <thead>
          <tr>
            <Th>{t.depth}</Th>
            <Th>{t.range}</Th>
            <Th className="w-full">{t.steps}</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {t.bands.map((band, i) => (
            <Tr key={band.name} selected={i === 1}>
              <Td className="whitespace-nowrap">
                <Badge hue={i === 0 ? "neutral" : i === 1 ? "primary" : "ink"}>{band.name}</Badge>
              </Td>
              <Td className="font-mono text-[12.5px] whitespace-nowrap text-ink-700 tabular-nums">{band.range}</Td>
              <Td className="text-ink-800">{band.steps}</Td>
              <Td className="whitespace-nowrap">
                {i === 1 && (
                  <Badge hue="emerald" icon={<CircleCheck aria-hidden />}>
                    {t.current}
                  </Badge>
                )}
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>
    </Window>
  );
}

/** Feature 2 - "A portfolio, not a listicle." The eligibility table the
    engine produces: three real patterns from knowledge/journey-patterns
    (depth_range, default_channels) ready, plus the README's own blocked
    example, so a reader sees both real outcomes. */
function PortfolioWindow({ lang }: { lang: Lang }) {
  const t = PANEL_T[lang].portfolio;
  const ready = t.rows.filter((r) => !r.blocked).length;
  return (
    /* `@container`: the table answers to the window's own width. In the
       story's narrow slot the depth and the channels move under the
       pattern name; in a wide one they get their columns back. */
    <Window label={t.label} address={t.address} meta={`${ready}/${t.rows.length} ${t.eligible}`} className="@container">
      <AppBar>
        <AppTitle icon={<LayoutList aria-hidden />}>{t.title}</AppTitle>
        <AppMeta className="ml-auto truncate">{t.source}</AppMeta>
      </AppBar>
      <Table>
        <thead>
          <tr>
            <Th className="w-full">{t.pattern}</Th>
            <Th className="hidden @xl:table-cell">{t.depth}</Th>
            <Th className="hidden @xl:table-cell">{t.channels}</Th>
            <Th>{t.status}</Th>
          </tr>
        </thead>
        <tbody>
          {t.rows.map((r) => {
            const channels =
              r.channels.length === 0 ? (
                <span className="text-ink-500">—</span>
              ) : (
                r.channels.map((c) => (
                  <Badge key={c} hue={isChannel(c) ? CHANNEL_HUE[c] : "neutral"} icon={isChannel(c) ? CHANNEL_ICON[c] : undefined}>
                    {c}
                  </Badge>
                ))
              );
            return (
              <Tr key={r.name}>
                <Td className="w-full max-w-0">
                  <span className={`block truncate font-semibold ${r.blocked ? "text-ink-600" : "text-ink-950"}`}>{r.name}</span>
                  <span className="block text-[12px] leading-snug text-ink-500 tabular-nums">{r.steps}</span>
                  {r.channels.length > 0 && <span className="mt-1.5 flex flex-wrap gap-1.5 @xl:hidden">{channels}</span>}
                </Td>
                <Td className="hidden text-[12.5px] whitespace-nowrap text-ink-700 tabular-nums @xl:table-cell">{r.blocked ? "—" : r.steps}</Td>
                <Td className="hidden @xl:table-cell">
                  <span className="flex gap-1.5">{channels}</span>
                </Td>
                <Td className="align-top whitespace-nowrap">
                  {r.blocked ? (
                    <Badge hue="neutral" icon={<Lock aria-hidden />}>
                      {t.blocked}
                    </Badge>
                  ) : (
                    <Badge hue="emerald" icon={<CircleCheck aria-hidden />}>
                      {t.ready}
                    </Badge>
                  )}
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </Window>
  );
}

/** Feature 3 - "Copy is an engineered artifact." The validator's own
    rule table: real hard character limits from knowledge/channels/
    email.md, sms.md, push.md - not house style, actual enforced numbers. */
function ChannelRulesWindow({ lang }: { lang: Lang }) {
  const t = PANEL_T[lang].channels;
  return (
    <Window label={t.label} address={t.address} meta={t.validator}>
      <AppBar>
        <AppTitle icon={<Ruler aria-hidden />}>{t.title}</AppTitle>
        <AppMeta className="ml-auto truncate">{t.files}</AppMeta>
      </AppBar>
      <Table>
        <thead>
          <tr>
            <Th>{t.channel}</Th>
            <Th className="w-full">{t.field}</Th>
            <Th className="text-right">{t.limit}</Th>
          </tr>
        </thead>
        <tbody>
          {t.rows.map((r, i) => {
            const first = i === 0 || t.rows[i - 1].channel !== r.channel;
            return (
              <Tr key={`${r.channel}-${r.field}`}>
                <Td className="whitespace-nowrap">
                  {first && (
                    <Badge hue={isChannel(r.channel) ? CHANNEL_HUE[r.channel] : "neutral"} icon={isChannel(r.channel) ? CHANNEL_ICON[r.channel] : undefined}>
                      {r.channel}
                    </Badge>
                  )}
                </Td>
                <Td className="text-ink-800">{r.field}</Td>
                <Td className="text-right font-mono text-[12.5px] whitespace-nowrap text-ink-900 tabular-nums">{r.limit}</Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
    </Window>
  );
}

/* ---- 10 · Why different — the product at work, not screenshots ------- */
function WhyDifferent({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const c = t.journeyBuilder.whyDifferent;
  return (
    <>
      <ProductSection tone="paper" space="md" className="pb-0! md:pb-0!">
        <PortraitContainer>
          <ProductHeading eyebrow={c.eyebrow} title={c.title} align="center" />
          <Reveal delay={100} className="mt-8 flex flex-wrap justify-center gap-2.5">
            <a href={REPO} target="_blank" rel="noreferrer" className={buttonStyles({ variant: "outline", size: "sm" })}>
              <PixelFill />
              {t.abTesting.repoLink}
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
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
              <ProductFrame slug="claude-lifecycle" plate="claude-lifecycle-2" inset="sm">
                <DqsWindow lang={lang} />
              </ProductFrame>
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
              <ProductFrame slug="claude-lifecycle" plate="claude-lifecycle-0" inset="sm">
                <PortfolioWindow lang={lang} />
              </ProductFrame>
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
              <ProductFrame slug="claude-lifecycle" plate="claude-lifecycle-1" inset="sm">
                <ChannelRulesWindow lang={lang} />
              </ProductFrame>
            }
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

function CarouselSection({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const c = t.journeyBuilder.carousel;
  return (
    <ProductSection tone="paper" space="xl" className="overflow-hidden">
      <PortraitContainer>
        <ProductHeading eyebrow={c.eyebrow} title={c.title} body={c.body} align="center" />
        <Reveal delay={100} className="mt-14">
          <ProductFrame slug="claude-lifecycle" plate="claude-lifecycle-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
              {PATTERNS.map((p) => (
                <PatternFlowCard key={p.name.en} pattern={p} lang={lang} />
              ))}
            </div>
          </ProductFrame>
        </Reveal>
        <Reveal delay={160} className="mt-12 flex flex-wrap justify-center gap-2.5">
          <a href={`${REPO}/tree/main/knowledge/journey-patterns`} target="_blank" rel="noreferrer" className={buttonStyles({ variant: "primary", size: "md" })}>
            <PixelFill />
            {lang === "en" ? "Browse the pattern library" : "Pattern kütüphanesine göz at"}
            <ArrowUpRight aria-hidden className="size-4" />
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
function PageCta({ t }: { t: (typeof copy)[Lang] }) {
  const c = t.journeyBuilder.pageCta;
  return <ProductCta eyebrow={c.eyebrow} title={c.title} primary={{ label: c.primary, href: REPO }} secondary={{ label: c.secondary, href: DEMO }} />;
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
        <PageCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
