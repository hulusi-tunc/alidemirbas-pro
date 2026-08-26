import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";
import {
  ProductBenefitStory, ProductHeading, ProductHowItWorks, ProductMetricStrip, ProductSection,
} from "@/components/ui/ProductPage";
import {
  BranchFork, HandoffInspector, JourneyCanvas, JourneyLibraryCta, JourneyLibrarySpread,
  TriggerEvidence, WaitTimeline,
} from "@/components/ui/JourneyFlows";
import { JourneyNode, NodeLegend } from "@/components/ui/JourneyVisuals";
import {
  FEATURED_JOURNEY, JOURNEY_CATEGORY_COUNTS, JOURNEY_SCALE, NODE_KIND_COUNTS,
} from "@/lib/journey-marketing";
import { copy, type Lang } from "@/lib/content";

/* Product page for the Lifecycle Marketing Journey Builder.

   NEW PAGE. The project previously had no internal page at all - it existed
   only as a Lab index card linking to GitHub and an external demo, while
   /lab/journeys served the LIBRARY. This adds the product page and leaves
   all 255 journey routes, their slugs and the library untouched.

   DELIBERATELY NOT THE A/B TEST PAGE WITH DIFFERENT COPY. That product is
   an experiment - an object - so its page is built from cards, rows and
   result panels. This product is a graph, so this page is built from nodes,
   connectors, named branches and time. The two share typography, spacing,
   container, buttons, borders and motion; they share no composition:

     A/B hero      centred text, full-width browser canvas underneath
     Journey hero  text left, a live journey graph on the right

     A/B library   result rows, an index
     Journey lib   flow cards, each carrying its own node strip

     A/B has       significance, p-values, guardrails
     Journey has   evidence thresholds, forks, timeouts, handoffs

   And this page carries two sections the A/B page has no equivalent of:
   an ANATOMY teardown of one real journey, and a NODE INSPECTOR that zooms
   into a single handoff - the deliberate scale change.

   All numbers and every quoted field come from the canonical library via
   journey-marketing.ts (server-only). ACQ-01 is rendered unmodified. */

const REPO = "https://github.com/ali-demirbas/claude-lifecycle";
const DEMO = "https://ali-demirbas.github.io/claude-lifecycle/demo/journey-canvas.html";

/* ---- 01 · Hero — text left, the journey graph right ------------------ */
function Hero({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const c = t.journeyBuilder;
  return (
    <section className="relative isolate overflow-hidden bg-paper pt-16 pb-20 md:pt-20 md:pb-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-[8%] size-[34rem] rounded-full bg-primary-300/28 blur-3xl" />
        <div className="absolute -top-20 right-[6%] size-[30rem] rounded-full bg-primary-500/15 blur-3xl" />
        <div className="absolute top-[45%] left-[40%] size-[26rem] rounded-full bg-primary-100/55 blur-3xl" />
      </div>
      <PortraitContainer>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-14">
          <div>
            <Reveal>
              <p className="altor-eyebrow mb-5 text-ink-400">{c.eyebrow}</p>
              <h1 className="text-h1-fluid font-medium text-ink-950">{c.title}</h1>
            </Reveal>
            <Reveal delay={90} className="mt-6">
              <p className="max-w-xl text-lg leading-relaxed text-ink-950/65">{c.sub}</p>
            </Reveal>
            <Reveal delay={140} className="mt-8">
              <div className="flex flex-wrap gap-2.5">
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
              </div>
            </Reveal>
            <Reveal delay={180} className="mt-7">
              <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-ink-400">
                {c.proof.map((item, i) => (
                  <li key={item} className="flex items-center gap-3">
                    {i > 0 && <span aria-hidden className="size-1 rounded-full bg-ink-200" />}
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* VISUAL-J01 — a real journey graph, not a dashboard screenshot */}
          <Reveal delay={120} className="min-w-0">
            <JourneyCanvas lang={lang} />
          </Reveal>
        </div>
      </PortraitContainer>
    </section>
  );
}

/* ---- 02 · Scale band ------------------------------------------------- */
function Scale({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const s = t.journeyBuilder.scale;
  const n = (v: number) => v.toLocaleString(lang === "en" ? "en-US" : "tr-TR");
  return (
    <ProductSection tone="paper" space="band" className="border-y border-line-soft">
      <ProductMetricStrip
        items={[
          { value: n(JOURNEY_SCALE.journeys), label: s.journeys },
          { value: n(JOURNEY_SCALE.categories), label: s.categories },
          { value: n(JOURNEY_SCALE.nodes), label: s.nodes },
          { value: n(JOURNEY_SCALE.nodeKinds), label: s.kinds },
        ]}
      />
    </ProductSection>
  );
}

/* ---- 03/04/05 · The three product stories ---------------------------- */
function Stories({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const c = t.journeyBuilder;
  return (
    <>
      <ProductSection tone="paper" space="lg">
        <PortraitContainer>
          <ProductBenefitStory
            eyebrow={c.story1.eyebrow} title={c.story1.title} body={c.story1.body}
            side="right" visual={<TriggerEvidence lang={lang} />}
          />
        </PortraitContainer>
      </ProductSection>

      <ProductSection tone="soft" space="lg">
        <PortraitContainer>
          <ProductBenefitStory
            eyebrow={c.story2.eyebrow} title={c.story2.title} body={c.story2.body}
            side="left" visual={<BranchFork lang={lang} />}
          />
        </PortraitContainer>
      </ProductSection>

      <ProductSection tone="paper" space="lg">
        <PortraitContainer>
          <ProductBenefitStory
            eyebrow={c.story3.eyebrow} title={c.story3.title} body={c.story3.body}
            side="right" visual={<WaitTimeline lang={lang} />}
          />
        </PortraitContainer>
      </ProductSection>
    </>
  );
}

/* ---- 06 · Anatomy — the section the A/B page has no equivalent of ---- */
function Anatomy({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const c = t.journeyBuilder.anatomy;
  const j = FEATURED_JOURNEY;
  return (
    <ProductSection tone="tint" space="xl">
      <PortraitContainer>
        <ProductHeading eyebrow={c.eyebrow} title={c.title} body={c.body} align="center" />

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)] lg:gap-14">
          <Reveal delay={80} className="min-w-0">
            <JourneyCanvas lang={lang} />
          </Reveal>
          <Reveal delay={140} className="flex flex-col gap-6">
            <div>
              <p className="font-mono text-[11px] text-ink-400 tabular-nums">{j.id}</p>
              <h3 className="mt-1.5 text-lg leading-snug font-medium text-ink-950">{j.name}</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-ink-950/65">{j.purpose}</p>
              <Link
                href={j.href(lang)}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                {t.journeyBuilder.ctaJourney}
                <ArrowRight aria-hidden className="size-3.5" />
              </Link>
            </div>
            <div className="border-t border-line-soft pt-6">
              <p className="altor-eyebrow mb-3.5 text-ink-400">{c.legendTitle}</p>
              <NodeLegend counts={NODE_KIND_COUNTS} lang={lang} />
            </div>
          </Reveal>
        </div>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 07 · Node inspector — the deliberate scale change --------------- */
function Inspector({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const c = t.journeyBuilder.inspector;
  const n = (v: number) => v.toLocaleString(lang === "en" ? "en-US" : "tr-TR");
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer>
        <ProductBenefitStory
          eyebrow={c.eyebrow}
          title={c.title}
          body={c.body}
          side="right"
          aside={
            <p className="text-[13px] text-ink-500">
              <b className="font-medium text-ink-700 tabular-nums">{n(JOURNEY_SCALE.handoffs)}</b>{" "}
              {c.handoffsLabel}
            </p>
          }
          visual={
            <div className="mx-auto max-w-md">
              <HandoffInspector lang={lang} />
            </div>
          }
        />
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 08 · The library ------------------------------------------------ */
function Library({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const c = t.journeyBuilder.library;
  const n = JOURNEY_SCALE.journeys.toLocaleString(lang === "en" ? "en-US" : "tr-TR");
  return (
    <ProductSection tone="paper" space="xl" className="overflow-hidden">
      <PortraitContainer>
        <ProductHeading
          eyebrow={c.eyebrow}
          title={c.title.replace("{count}", n)}
          body={c.body}
          align="center"
        />
        <Reveal delay={80} className="mt-12">
          <JourneyLibrarySpread lang={lang} />
        </Reveal>
        <Reveal delay={140} className="mt-12 flex justify-center">
          <JourneyLibraryCta lang={lang} label={c.cta} />
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 09 · How it works — three DIFFERENT mini visuals ---------------- */
function HowStepFind({ lang }: { lang: Lang }) {
  return (
    <div className="flex h-full flex-col rounded-card border border-line-soft bg-paper p-5">
      <p className="altor-eyebrow text-ink-400">{copy[lang].journeyBuilder.scale.categories}</p>
      <div className="mt-3.5 flex flex-col gap-1">
        {JOURNEY_CATEGORY_COUNTS.slice(0, 6).map((cat, i) => (
          <span
            key={cat.id}
            className={`flex items-center justify-between rounded-sm px-2.5 py-1.5 text-[13px] ${
              i === 0 ? "bg-primary-50 font-medium text-primary-700" : "text-ink-500"
            }`}
          >
            <span className="truncate">{cat.title}</span>
            <span className="font-mono text-[11px] tabular-nums">{cat.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function HowStepRead({ lang }: { lang: Lang }) {
  const j = FEATURED_JOURNEY;
  const trigger = j.nodes.find((x) => x.kind === "trigger");
  const condition = j.nodes.find((x) => x.kind === "condition");
  return (
    <div className="flex h-full flex-col gap-0 rounded-card border border-line-soft bg-paper p-5">
      {trigger && <JourneyNode kind="trigger" title={trigger.label} lang={lang} size="sm" />}
      <div aria-hidden className="mx-auto h-5 w-px bg-line-strong" />
      {condition && <JourneyNode kind="condition" title={condition.label} lang={lang} size="sm" />}
      <div aria-hidden className="mx-auto h-5 w-px bg-line-strong" />
      <div className="flex gap-2">
        {j.branch.branches.map((b) => (
          <span
            key={b.label}
            className="min-w-0 flex-1 truncate rounded-full border border-line-soft bg-paper-soft px-2.5 py-1 text-center text-[10px] font-medium text-ink-600"
          >
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function HowStepAdapt({ lang }: { lang: Lang }) {
  return (
    <div className="flex h-full flex-col rounded-card border border-line-soft bg-paper p-5">
      <p className="altor-eyebrow text-ink-400">{copy[lang].journeyBuilder.anatomy.legendTitle}</p>
      <div className="mt-3.5">
        <NodeLegend counts={NODE_KIND_COUNTS.slice(0, 5)} lang={lang} />
      </div>
    </div>
  );
}

function HowItWorks({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const h = t.journeyBuilder.how;
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer>
        <ProductHeading eyebrow={h.eyebrow} title={h.title} body={h.body} align="center" />
        <div className="mt-14">
          <ProductHowItWorks
            steps={[
              { ...h.steps[0], visual: <HowStepFind lang={lang} /> },
              { ...h.steps[1], visual: <HowStepRead lang={lang} /> },
              { ...h.steps[2], visual: <HowStepAdapt lang={lang} /> },
            ]}
          />
        </div>
        <Reveal delay={120} className="mt-12 flex flex-wrap justify-center gap-2.5">
          <a
            href={DEMO}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-line-soft bg-paper px-4 py-2.5 text-[13px] text-ink-600 transition-colors hover:border-ink-300 hover:text-ink-950"
          >
            {t.abTesting.demoLink}
            <ArrowUpRight aria-hidden className="size-3.5 text-ink-400" />
          </a>
          <Link
            href={lang === "en" ? "/lab/ab-testing" : "/tr/lab/ab-testing"}
            className="inline-flex items-center gap-1.5 rounded-full border border-line-soft bg-paper px-4 py-2.5 text-[13px] text-ink-600 transition-colors hover:border-ink-300 hover:text-ink-950"
          >
            {t.journeyBuilder.related.abTest}
            <ArrowRight aria-hidden className="size-3.5 text-ink-400" />
          </Link>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
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
        <Scale t={t} lang={lang} />
        <Stories t={t} lang={lang} />
        <Anatomy t={t} lang={lang} />
        <Inspector t={t} lang={lang} />
        <Library t={t} lang={lang} />
        <HowItWorks t={t} lang={lang} />
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
