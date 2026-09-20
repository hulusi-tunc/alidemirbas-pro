import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Bookmark, Check } from "lucide-react";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { ButtonLink } from "@/components/ui/Button";
import { ProductFrame, ProductMark } from "@/components/ui/ProductFrame";
import { CategoryIcon, SURFACE_ICON, categoryAccent } from "@/components/ui/LibraryChrome";
import { Reveal } from "@/components/ui/Reveal";
import { ProductBenefitStory, ProductHeading, ProductMetricStrip, ProductSection } from "@/components/ui/ProductPage";
import { BranchFork, JourneyCanvas, JourneyLibrarySpread, TriggerEvidence, WaitTimeline } from "@/components/ui/JourneyFlows";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import {
  PRESET_ROWS,
  SURFACE_PATH,
  SURFACE_ROWS,
  type SurfaceKey,
  withLibraryCount,
} from "@/lib/canonical-view";
import { JOURNEY_SCALE } from "@/lib/journey-marketing";
import { localizedJourneyNaming } from "@/lib/journey-tr-overrides";
import { copy, type Lang } from "@/lib/content";
import { breadcrumbList } from "@/lib/schema";

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
  // The four tones this page names, on the site's one button family. The
  // page's main action is the brand blue (Hulusi, 2026-09-14: "they have to
  // be blue"); black is the header's, not a page's.
  const variant = tone === "dark" ? "primary" : tone === "light" ? "inverted" : tone === "ghost" ? "outlineInverted" : "outline";
  return (
    <ButtonLink href={href} variant={variant} size="md">
      {children}
      <ArrowRight aria-hidden className="size-4" />
    </ButtonLink>
  );
}

/* ---- 01 · Hero - the claim, then one real journey as its witness ------ */
function Hero({ lang }: { lang: Lang }) {
  const c = copy[lang].lab.journeysHub;
  return (
    <section className="relative isolate overflow-hidden bg-paper pt-16 pb-24 md:pt-20 md:pb-32">
      <PortraitContainer className="text-center">
        <Reveal>
          <ProductMark slug="lifecycle-card-archive" lang={lang} className="mb-5" />
          <h1 className="mx-auto max-w-4xl text-h1 text-ink-950">{withLibraryCount(c.title)}</h1>
        </Reveal>
        <Reveal delay={90} className="mt-6">
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-ink-950/65">{withLibraryCount(c.sub)}</p>
        </Reveal>
        <Reveal delay={140} className="mt-8 flex flex-wrap justify-center gap-2.5">
          <Pill href={P(lang, SURFACE_PATH["customer-journeys"])} tone="dark">{c.ctaCommunication}</Pill>
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
        <Reveal delay={220} className="mx-auto mt-16 max-w-4xl">
          {/* On the project's plate, in its hue - the frame language of the
              Lab index (ui/ProductFrame.tsx). */}
          <ProductFrame slug="lifecycle-card-archive">
            <JourneyCanvas lang={lang} />
          </ProductFrame>
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

/* ---- 03 · Where to start - the three surfaces as tiles ------------------
   Was a paragraph, a card with a blurb, a preset row, three full cards and
   two more blurbs (Hulusi, 2026-09-20: "so ugly, so much text, I don't
   understand anything"). Now the homepage's bento: the customer journeys
   as the large tile - icon, the count large, one line, the three largest
   journeys as compact rows, the presets as chips, the way in - and the two
   supporting surfaces as small tiles beside it, each with its icon, its
   count, one line and a link. Every count is read from the rows. */
const SECONDARY_SURFACE_KEYS: readonly SurfaceKey[] = ["lifecycle-states", "runtime-mechanisms"];

function SurfaceTile({ surfaceKey, lang, delay }: { surfaceKey: SurfaceKey; lang: Lang; delay: number }) {
  const t = copy[lang];
  const c = t.lab.journeysHub.split;
  const rows = SURFACE_ROWS[surfaceKey];
  return (
    <Reveal delay={delay} className="flex flex-col rounded-[28px] bg-paper-soft p-6">
      <span aria-hidden className="grid size-10 place-items-center rounded-xl bg-paper text-ink-700 ring-1 ring-ink-950/[0.06]">
        {SURFACE_ICON[surfaceKey]}
      </span>
      <p className="mt-4 text-h3 text-ink-950 tabular-nums">{nf(lang, rows.length)}</p>
      <h3 className="mt-0.5 text-base font-semibold text-ink-950">{t.lab.journeysSplit.surfaceLabels[surfaceKey]}</h3>
      <p className="mt-2 text-sm leading-relaxed text-pretty text-ink-muted">{c.lines[surfaceKey]}</p>
      <Link
        href={P(lang, SURFACE_PATH[surfaceKey])}
        className="mt-auto flex w-fit items-center gap-1.5 pt-5 text-sm font-medium text-ink-950 transition-colors duration-[var(--duration-fast)] hover:text-primary-600"
      >
        {t.lab.journeysSplit.browseAll.replace("{count}", String(rows.length))}
        <ArrowRight aria-hidden className="size-4" />
      </Link>
    </Reveal>
  );
}

function Split({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const c = t.lab.journeysHub.split;
  const s = t.lab.journeysSplit;
  const rows = SURFACE_ROWS["customer-journeys"];
  // The three rows below are named on the page - same TR content layer as the
  // gallery cards (LabPage) and the showcase (JourneyFlows).
  const largest = [...rows]
    .sort((a, b) => b.nodeCount - a.nodeCount)
    .slice(0, 3)
    .map((j) => localizedJourneyNaming(j, lang));
  const basePath = P(lang, "/lab/journeys");
  return (
    <ProductSection tone="paper" space="lg">
      <PortraitContainer>
        <ProductHeading eyebrow={c.eyebrow} title={c.title} body={c.body} align="center" />
        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Reveal delay={60} className="flex flex-col rounded-[28px] bg-paper-soft p-6 md:p-8 lg:col-span-2">
            <span aria-hidden className="grid size-10 place-items-center rounded-xl bg-primary-50 text-primary-700">
              {SURFACE_ICON["customer-journeys"]}
            </span>
            <p className="mt-4 text-h2 text-ink-950 tabular-nums">{nf(lang, rows.length)}</p>
            <h3 className="mt-0.5 text-lg font-semibold text-ink-950">{s.surfaceLabels["customer-journeys"]}</h3>
            <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-pretty text-ink-muted">{c.lines["customer-journeys"]}</p>

            <p className="mt-6 text-xs font-medium text-ink-subtle">{c.largest}</p>
            <ul className="mt-2 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-3">
              {largest.map((j) => {
                const accent = categoryAccent(j.category);
                return (
                  <li key={j.id}>
                    <Link
                      href={`${basePath}/${j.slug}`}
                      className="flex items-center gap-2.5 rounded-2xl bg-paper px-3.5 py-3 ring-1 ring-ink-950/[0.06] transition-shadow duration-[var(--duration-fast)] hover:shadow-[0_12px_30px_-18px_rgb(10_16_32/0.35)]"
                    >
                      <span aria-hidden className={`grid size-8 shrink-0 place-items-center rounded-lg ${accent.tile}`}>
                        <CategoryIcon id={j.category} className="size-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-ink-950">{j.shortName ?? j.name}</span>
                        <span className="block text-xs text-ink-subtle tabular-nums">
                          {j.nodeCount} {t.lab.page.nodesLabel}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <p className="mt-5 flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs font-medium text-ink-subtle">{s.presetsTitle}</span>
              {PRESET_ROWS.map((p) => (
                <Link
                  key={p.id}
                  href={`${basePath}/${p.slug}`}
                  className="flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1 text-xs font-medium text-ink-700 ring-1 ring-ink-950/[0.06] transition-colors duration-[var(--duration-fast)] hover:text-ink-950"
                >
                  <Bookmark aria-hidden className="size-3 text-primary-600" />
                  {p.name}
                </Link>
              ))}
            </p>

            <div className="mt-auto pt-7">
              <Pill href={P(lang, SURFACE_PATH["customer-journeys"])} tone="dark">
                {s.browseAll.replace("{count}", String(rows.length))}
              </Pill>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {SECONDARY_SURFACE_KEYS.map((k, i) => (
              <SurfaceTile key={k} surfaceKey={k} lang={lang} delay={140 + i * 60} />
            ))}
          </div>
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
            visual={
              <ProductFrame slug="lifecycle-card-archive" inset="sm">
                <TriggerEvidence lang={lang} />
              </ProductFrame>
            }
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
            visual={
              <ProductFrame slug="lifecycle-card-archive" inset="sm">
                <BranchFork lang={lang} />
              </ProductFrame>
            }
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
            visual={
              <ProductFrame slug="lifecycle-card-archive" inset="sm">
                <WaitTimeline lang={lang} />
              </ProductFrame>
            }
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
        <ProductHeading eyebrow={c.eyebrow} title={withLibraryCount(c.title)} body={c.body} align="center" />
        <Reveal delay={100} className="mt-14">
          <JourneyLibrarySpread lang={lang} />
        </Reveal>
        <Reveal delay={160} className="mt-12 flex flex-wrap justify-center gap-2.5">
          <Pill href={P(lang, SURFACE_PATH["customer-journeys"])} tone="dark">{h.ctaCommunication}</Pill>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
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
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </div>
  );
}
