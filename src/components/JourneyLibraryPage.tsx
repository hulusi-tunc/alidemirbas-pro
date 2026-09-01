import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/Site";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";
import { ProductBenefitStory, ProductHeading, ProductMetricStrip, ProductSection } from "@/components/ui/ProductPage";
import { BranchFork, JourneyCanvas, JourneyLibrarySpread, TriggerEvidence, WaitTimeline } from "@/components/ui/JourneyFlows";
import JourneyIdeaCard from "@/components/ui/JourneyIdeaCard";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import {
  COMMUNICATION_JOURNEY_ROWS,
  INTERNAL_JOURNEY_ROWS,
  withCanonicalCount,
  type JourneyRow,
} from "@/lib/canonical-view";
import { JOURNEY_SCALE } from "@/lib/journey-marketing";
import { CHANNEL_LABEL, sortChannels } from "@/lib/journey-channels";
import { copy, type Lang } from "@/lib/content";
import { breadcrumbList } from "@/lib/schema";
import { clsx } from "@/lib/clsx";

/* The Canonical Journey Library's HUB - /lab/journeys.

   Rebuilt (2026-09) in the shape of the /lab/claude-lifecycle product
   page, per site-owner direction ("a page like that one"). What was
   taken from that page is its MECHANISM, not its skin: a centred claim
   followed by one real artifact as its witness; statement+witness bands
   whose visual column is the wider one and whose side and ground
   alternate; a section of real objects in a row; exactly one dark plate,
   page-local, at the end; the marketing shell (SiteHeader/SiteFooter)
   rather than the Lab tool chrome. Its channel-pill palette and its
   product's own numbers stayed where they were.

   Every witness on this page already existed. JourneyFlows.tsx's canvas,
   trigger-evidence, fork, wait-rail and library-spread diagrams were
   built from THIS library's real data (journey-marketing.ts, ACQ-01 and
   the corpus counts) for the claude-lifecycle page, then removed from it
   because they showed the wrong product - and sat unused since. This is
   the product they were showing. Nothing on this page is a screenshot,
   and every number is computed from the canonical library at build.

   The hub used to be a LabShell page (LabPage's `hub` mode: two labelled
   previews and a screenful of white). The two child list pages keep the
   LabShell tool chrome; this parent is a product page about them. The
   `data-lab-root` wrapper is what JourneyModal makes inert when a card
   click opens a journey over this page - LabShell used to carry it. */

const nf = (lang: Lang, n: number) => n.toLocaleString(lang === "en" ? "en-US" : "tr-TR");
const P = (lang: Lang, en: string) => (lang === "en" ? en : `/tr${en}`);

/* ---- CTA pill --------------------------------------------------------
   The reference page's four pill treatments, in one place. Two per
   surface: dark+outline on paper, light+ghost on the ink plate. */
function Pill({
  href,
  tone,
  children,
}: {
  href: string;
  tone: "dark" | "outline" | "light" | "ghost";
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-medium transition-colors duration-[var(--duration-fast)]",
        {
          "bg-ink-950 text-white hover:bg-primary-600": tone === "dark",
          "border border-line-strong text-ink-700 hover:border-ink-300 hover:text-ink-950": tone === "outline",
          "bg-white text-ink-950 hover:bg-primary-50": tone === "light",
          "border border-white/25 text-white hover:border-white/50": tone === "ghost",
        },
      )}
    >
      {children}
      <ArrowRight aria-hidden className="size-4" />
    </Link>
  );
}

/* ---- 01 · Hero - the claim, then one real journey as its witness ------ */
function Hero({ lang }: { lang: Lang }) {
  const c = copy[lang].lab.journeysHub;
  return (
    <section className="relative isolate overflow-hidden bg-paper pt-16 pb-24 md:pt-20 md:pb-32">
      <PortraitContainer className="text-center">
        <Reveal>
          <p className="altor-eyebrow mb-5 text-ink-400">{c.eyebrow}</p>
          <h1 className="mx-auto max-w-3xl text-h1-fluid font-medium text-ink-950">{withCanonicalCount(c.title)}</h1>
        </Reveal>
        <Reveal delay={90} className="mt-6">
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-ink-950/65">{withCanonicalCount(c.sub)}</p>
        </Reveal>
        <Reveal delay={140} className="mt-8 flex flex-wrap justify-center gap-2.5">
          <Pill href={P(lang, "/lab/communication-journeys")} tone="dark">{c.ctaCommunication}</Pill>
          <Pill href={P(lang, "/lab/internal-journeys")} tone="outline">{c.ctaInternal}</Pill>
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

        {/* ACQ-01, whole, as the hero's witness: the one journey that
            exercises six of the seven node kinds in eight nodes. Real
            graph, real branch labels - journey-marketing.ts throws at
            build if it ever leaves the library. */}
        <Reveal delay={220} className="mx-auto mt-16 max-w-2xl">
          <JourneyCanvas lang={lang} />
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 02 · Scale strip - the page's low-density breath ----------------- */
function Scale({ lang }: { lang: Lang }) {
  const s = copy[lang].journeyBuilder.scale;
  return (
    <ProductSection tone="soft" space="band">
      <ProductMetricStrip
        items={[
          { value: nf(lang, JOURNEY_SCALE.journeys), label: s.journeys },
          { value: nf(lang, JOURNEY_SCALE.categories), label: s.categories },
          { value: nf(lang, JOURNEY_SCALE.nodes), label: s.nodes },
          { value: nf(lang, JOURNEY_SCALE.nodeKinds), label: s.kinds },
        ]}
      />
    </ProductSection>
  );
}

/* ---- 03 · The split - the hub's actual job --------------------------
   Two facing halves. Each previews its three LARGEST graphs by node
   count - a computed ordering, not an editorial "featured" pick - and
   every card carries its own node count so the rule is visible on the
   cards themselves. A half is a window-card in the grammar's sense: a
   label, a count, prose, three real journeys and a route, not a fence
   around a link. */
function Half({
  lang,
  rows,
  label,
  blurb,
  href,
  tone,
  delay,
}: {
  lang: Lang;
  rows: readonly JourneyRow[];
  label: string;
  blurb: string;
  href: string;
  tone: "dark" | "outline";
  delay: number;
}) {
  const t = copy[lang];
  const preview = [...rows].sort((a, b) => b.nodeCount - a.nodeCount).slice(0, 3);
  const basePath = P(lang, "/lab/journeys");
  return (
    <Reveal
      delay={delay}
      className="flex h-full flex-col rounded-card border border-line bg-paper p-6 shadow-[0_0_0_1px_rgb(0_0_0/0.04),0_8px_24px_-16px_rgb(10_16_32/0.15)] sm:p-7"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-xl font-medium tracking-tight text-ink-950">{label}</h3>
        <span className="shrink-0 font-mono text-xs text-ink-400 tabular-nums">
          {rows.length} {t.lab.page.results}
        </span>
      </div>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-950/65">{blurb}</p>
      <div className="mt-6 flex flex-1 flex-col gap-3">
        {preview.map((j) => (
          <JourneyIdeaCard
            key={j.id}
            href={`${basePath}/${j.slug}`}
            id={j.id}
            title={j.shortName ?? j.name}
            categoryTitle={j.categoryTitle}
            purpose={j.purpose}
            nodeCount={j.nodeCount}
            nodesLabel={t.lab.page.nodesLabel}
            channelLabels={sortChannels(j.channels).map((c) => CHANNEL_LABEL[c][lang])}
            internalLabel={t.lab.journeysSplit.internalBadge}
          />
        ))}
      </div>
      <div className="mt-7">
        <Pill href={href} tone={tone}>
          {t.lab.journeysSplit.browseAll.replace("{count}", String(rows.length))}
        </Pill>
      </div>
    </Reveal>
  );
}

function Split({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const c = t.lab.journeysHub.split;
  return (
    <ProductSection tone="paper" space="lg">
      <PortraitContainer>
        <ProductHeading eyebrow={c.eyebrow} title={c.title} body={c.body} align="center" />
        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <Half
            lang={lang}
            rows={COMMUNICATION_JOURNEY_ROWS}
            label={t.lab.journeysSplit.communicationLabel}
            blurb={t.lab.journeysSplit.communicationBlurb}
            href={P(lang, "/lab/communication-journeys")}
            tone="dark"
            delay={80}
          />
          <Half
            lang={lang}
            rows={INTERNAL_JOURNEY_ROWS}
            label={t.lab.journeysSplit.internalLabel}
            blurb={t.lab.journeysSplit.internalBlurb}
            href={P(lang, "/lab/internal-journeys")}
            tone="outline"
            delay={140}
          />
        </div>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 04 · Three schema stories - statement + witness, alternating ----
   The three invariants the validator actually enforces on every journey:
   a trigger names what is insufficient alone, a condition carries both
   arms, a wait names its timeout. Each witness is ACQ-01's own node. */
function Stories({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const c = t.lab.journeysHub.stories;
  const s = t.journeyBuilder;
  return (
    <>
      <ProductSection tone="soft" space="md" className="pb-0! md:pb-0!">
        <PortraitContainer>
          <ProductHeading eyebrow={c.eyebrow} title={c.title} align="center" />
        </PortraitContainer>
      </ProductSection>

      <ProductSection tone="soft" space="lg">
        <PortraitContainer>
          <ProductBenefitStory
            eyebrow={s.story1.eyebrow}
            title={s.story1.title}
            body={s.story1.body}
            side="right"
            visual={<TriggerEvidence lang={lang} />}
          />
        </PortraitContainer>
      </ProductSection>

      <ProductSection tone="paper" space="lg">
        <PortraitContainer>
          <ProductBenefitStory
            eyebrow={s.story2.eyebrow}
            title={s.story2.title}
            body={s.story2.body}
            side="left"
            visual={<BranchFork lang={lang} />}
          />
        </PortraitContainer>
      </ProductSection>

      <ProductSection tone="soft" space="lg">
        <PortraitContainer>
          <ProductBenefitStory
            eyebrow={s.story3.eyebrow}
            title={s.story3.title}
            body={s.story3.body}
            side="right"
            visual={<WaitTimeline lang={lang} />}
          />
        </PortraitContainer>
      </ProductSection>
    </>
  );
}

/* ---- 05 · The library spread - real journeys as flows, in a row ------- */
function Library({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const c = t.journeyBuilder.library;
  const h = t.lab.journeysHub;
  return (
    <ProductSection tone="paper" space="xl" className="overflow-hidden">
      <PortraitContainer>
        <ProductHeading eyebrow={c.eyebrow} title={withCanonicalCount(c.title)} body={c.body} align="center" />
        <Reveal delay={100} className="mt-14">
          <JourneyLibrarySpread lang={lang} />
        </Reveal>
        <Reveal delay={160} className="mt-12 flex flex-wrap justify-center gap-2.5">
          <Pill href={P(lang, "/lab/communication-journeys")} tone="dark">{h.ctaCommunication}</Pill>
          <Pill href={P(lang, "/lab/internal-journeys")} tone="outline">{h.ctaInternal}</Pill>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 06 · Final plate - the page's one dark block ---------------------- */
function Final({ lang }: { lang: Lang }) {
  const c = copy[lang].lab.journeysHub.final;
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 py-24 text-white md:py-32">
      <PortraitContainer className="relative text-center">
        <Reveal>
          <p className="altor-eyebrow mb-5 text-white/45">{c.eyebrow}</p>
          <h2 className="mx-auto max-w-2xl text-h2-fluid font-medium text-white">{c.title}</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70">{c.body}</p>
        </Reveal>
        <Reveal delay={90} className="mt-9 flex flex-wrap justify-center gap-3">
          <Pill href={P(lang, "/lab/communication-journeys")} tone="light">{copy[lang].lab.journeysHub.ctaCommunication}</Pill>
          <Pill href={P(lang, "/lab/internal-journeys")} tone="ghost">{copy[lang].lab.journeysHub.ctaInternal}</Pill>
        </Reveal>
        <Reveal delay={140} className="mt-10">
          <p className="text-sm text-white/55">
            {c.relatedLabel}:{" "}
            <Link
              href={P(lang, "/lab/claude-lifecycle")}
              className="text-white/85 underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              {c.relatedName}
            </Link>
          </p>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

export default function JourneyLibraryPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const jsonLd = breadcrumbList([
    { name: t.footer.home, url: home },
    { name: t.nav.lab, url: P(lang, "/lab") },
    { name: t.lab.page.title, url: P(lang, "/lab/journeys") },
  ]);
  return (
    <div data-lab-root className="bg-paper">
      <JsonLdScript data={jsonLd} />
      <SiteHeader t={t} anchorBase={home} langHref={lang === "en" ? "/tr/lab/journeys" : "/lab/journeys"} />
      <main>
        <Hero lang={lang} />
        <Scale lang={lang} />
        <Split lang={lang} />
        <Stories lang={lang} />
        <Library lang={lang} />
        <Final lang={lang} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </div>
  );
}
