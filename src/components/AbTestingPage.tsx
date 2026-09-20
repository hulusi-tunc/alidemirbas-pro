import { ArrowRight, CheckCircle2, Store, Terminal } from "lucide-react";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { ButtonLink } from "@/components/ui/Button";
import { GitHubMark } from "@/components/ui/BrandIcons";
import { InstallPanel } from "@/components/ui/InstallPanel";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { PlaybookScene } from "@/components/ui/LabPanels";
import { labAccent } from "@/components/ui/LabProjectIdentity";
import { ProductFrame, ProductMark } from "@/components/ui/ProductFrame";
import { Reveal } from "@/components/ui/Reveal";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import {
  ProductBenefitStory,
  ProductHeading,
  ProductHowItWorks,
  ProductSection,
} from "@/components/ui/ProductPage";
import {
  CoverageMap,
  GuardrailLedger,
  HowStepDesign,
  HowStepFind,
  HowStepRead,
  LibrarySpread,
  StatCalculatorLinks,
  VariantDiff,
} from "@/components/ui/AbTestVisuals";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { AB_SCALE } from "@/lib/ab-test-marketing";
import { clsx } from "@/lib/clsx";
import { copy, type Lang } from "@/lib/content";
import { breadcrumbList } from "@/lib/schema";

/* Product page for the ab-test-playbook Claude Code plugin.

   REDESIGN (this round) — PRODUCT STORYTELLING PILOT. The previous
   version was a documentation page in card form: heading, paragraph,
   N cards, repeated six times at identical density. This one is
   composed as a product page:

     dark hero where the product's own output dominates the right 58%
       -> a thin scale band (a breath, not a section)
       -> three benefit stories, sides alternating, each with a LARGE
          visual teaching a different mental model
       -> the library as the page's single biggest visual moment
       -> how it works, three steps, three different mini-fragments
       -> the rules, install, FAQ
       -> the shared FinalCta

   Composition reference: peerbie.com/custom-workflow. Design language:
   unchanged - this project's Portrait-derived tokens, PortraitContainer,
   Reveal, ink/primary ramp. See PRODUCT-VISUAL-ASSET-PLAN.md.

   CONTENT: metaTitle/metaDesc/title/sub/install/framework/principles/
   example/faq are the SAME verified strings this page already shipped,
   still sourced from the plugin's own README and methodology docs. The
   new storytelling copy lives under `abTesting.product`. Every number
   rendered is derived from the real 211-record dataset at build time
   (ab-test-marketing.ts), never typed into copy.

   NOT TOUCHED: the route files, their metadata/canonical/hreflang, the
   ab-tests.json dataset, ab-test-view.ts, the library index/detail
   pages, slugs, or the GitHub/demo URLs. */

const REPO = "https://github.com/ali-demirbas/ab-test-playbook";
const DEMO = "https://ali-demirbas.github.io/ab-test-playbook/";

const libraryHref = (lang: Lang) =>
  lang === "en" ? "/lab/ab-testing/library" : "/tr/lab/ab-testing/library";

/* ---- 01 · Hero -------------------------------------------------------
   Recomposed after a second Peerbie reference (peerbie.com/custom-workflow's
   own hero): centred text, ONE primary CTA, the three real steps as inline
   checkmarks, and then the product itself filling the full width in
   perspective and running off the bottom edge.

   Light ground, not the dark band this page used before: the site's other
   pages moved to the soft multi-tone blue wash this round, and the
   reference's own hero is light. The wash is the same treatment and the
   same `primary-*` tokens as Contact / Calculators / Stack, so this reads
   as one system rather than a fourth hero style.

   The section crops its own bottom (`overflow-hidden` + a negative bottom
   margin on the canvas), which is what produces the "the product continues
   past the fold" effect rather than a screenshot sitting in a box. */
function Hero({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const c = t.abTesting;
  const p = c.product;
  return (
    <section className="relative isolate overflow-hidden bg-paper pt-16 pb-0 md:pt-20">
      {/* No atmospheric wash. The library and playbook pages this hero
          leads into are plain paper with mono rails; a blue blob field on
          the doorstep made the doorway the loudest thing in the flow. */}
      <PortraitContainer>
        <div className="relative mx-auto max-w-3xl text-center">
          <Reveal>
            <ProductMark slug="ab-test-playbook" lang={lang} className="mb-5" />
            <h1 className="text-h1 text-ink-950">{c.title}</h1>
          </Reveal>
          <Reveal delay={90} className="mt-6">
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-ink-950/65">{c.sub.replace("{count}", AB_SCALE.scenarios.toLocaleString(lang === "en" ? "en-US" : "tr-TR"))}</p>
          </Reveal>
          <Reveal delay={140} className="mt-9 flex justify-center">
            <ButtonLink href={libraryHref(lang)} variant="primary" size="md">
              {p.heroCtaLibrary}
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          </Reveal>
          {/* the three real steps, doubling as the reference's checkmark row */}
          <Reveal delay={180} className="mt-7">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
              {p.how.steps.map((s) => (
                <li key={s.title} className="flex items-center gap-2 text-[13px] text-ink-600">
                  <CheckCircle2 aria-hidden className="size-4 text-primary-600" />
                  {s.title}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </PortraitContainer>

      {/* The product on the project's plate, in its hue - the frame
          language of the Lab index (ui/ProductFrame.tsx). It used to hang
          over the section's lower edge; frames stay inside their section
          now (Hulusi, 2026-09-06). */}
      <Reveal delay={220} className="relative mt-14 md:mt-16">
        <div className="px-5 pb-20 sm:px-8 md:pb-28 lg:px-12">
          {/* THE RECORD, DRAWN (Hulusi, 2026-09-06: the photographed demo page
              - a dark GitHub Pages sheet with two half-empty phone mockups -
              was "super ugly nonsense"). The same picture the Lab index tells
              for this project: AB-004 as it is in the data - the question,
              its category, "1 of 211", the control cart with the coupon
              field and the treatment cart with the link, the traffic split
              between them, the KPI the record is decided by. Nothing here is
              invented; only the drawing is the site's. */}
          <ProductFrame slug="ab-test-playbook" inset="none">
            <PlaybookScene lang={lang} />
          </ProductFrame>
        </div>
      </Reveal>
    </section>
  );
}

/* ---- 02 · (gone) ------------------------------------------------------
   The scale band - four bare numerals with one-word labels - went on
   2026-09-20 (Hulusi's pass over the sub lab pages; his standing rule: a
   number never stands alone, it needs a name and a sentence). Each of
   its four numbers already appears with its sentence further down: the
   scenario count in the hero and the library title, the pages in the
   coverage map, the guardrail rules in the ledger, the categories as the
   library's chips. */

/* ---- 03/04/05 · Benefit stories, sides alternating ------------------- */
function Stories({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const p = t.abTesting.product;
  return (
    <>
      <ProductSection tone="paper" space="lg">
        <PortraitContainer>
          <ProductBenefitStory
            eyebrow={p.story1.eyebrow}
            title={p.story1.title}
            body={p.story1.body}
            side="right"
            visual={
              <ProductFrame slug="ab-test-playbook" inset="sm">
                <CoverageMap lang={lang} />
              </ProductFrame>
            }
          />
        </PortraitContainer>
      </ProductSection>

      <ProductSection tone="soft" space="lg">
        <PortraitContainer>
          <ProductBenefitStory
            eyebrow={p.story2.eyebrow}
            title={p.story2.title}
            body={p.story2.body}
            side="left"
            visual={
              <ProductFrame slug="ab-test-playbook" inset="sm">
                <VariantDiff lang={lang} />
              </ProductFrame>
            }
          />
        </PortraitContainer>
      </ProductSection>

      <ProductSection tone="paper" space="lg">
        <PortraitContainer>
          <ProductBenefitStory
            eyebrow={p.story3.eyebrow}
            title={p.story3.title}
            body={p.story3.body}
            side="right"
            visual={
              <ProductFrame slug="ab-test-playbook" inset="sm">
                <GuardrailLedger lang={lang} />
              </ProductFrame>
            }
          />
        </PortraitContainer>
      </ProductSection>
    </>
  );
}

/* ---- 06 · The library — the page's largest visual moment ------------- */
function Library({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const p = t.abTesting.product.library;
  return (
    <ProductSection tone="tint" space="xl" className="overflow-hidden">
      <PortraitContainer>
        <ProductHeading
          eyebrow={p.eyebrow}
          title={p.title.replace("{count}", AB_SCALE.scenarios.toLocaleString(lang === "en" ? "en-US" : "tr-TR"))}
          body={p.body}
          align="center"
        />
        <Reveal delay={80} className="mt-12">
          <LibrarySpread lang={lang} />
        </Reveal>
        <Reveal delay={140} className="mt-12 flex justify-center">
          <ButtonLink href={libraryHref(lang)} variant="primary" size="md">
            {p.cta}
            <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 07 · How it works ----------------------------------------------- */
function HowItWorks({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const h = t.abTesting.product.how;
  return (
    <ProductSection tone="paper" space="lg">
      <PortraitContainer>
        <ProductHeading eyebrow={h.eyebrow} title={h.title} body={h.body} align="center" />
        <div className="mt-14">
          <ProductHowItWorks
            steps={[
              { ...h.steps[0], visual: <HowStepFind lang={lang} /> },
              { ...h.steps[1], visual: <HowStepDesign lang={lang} /> },
              { ...h.steps[2], visual: <HowStepRead lang={lang} /> },
            ]}
          />
        </div>
        {/* the third step's honest follow-through: run it on real numbers */}
        <Reveal delay={120} className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="max-w-xl text-base leading-relaxed text-ink-muted">{h.step3.note}</p>
          <StatCalculatorLinks lang={lang} />
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 08 · The rules --------------------------------------------------
   The five principles, unchanged in wording. Presented as wide editorial
   rows with oversized numerals rather than a card grid - a different
   composition from every other section, which is the point. */
function Rules({ t }: { t: (typeof copy)[Lang] }) {
  const c = t.abTesting;
  const accent = labAccent("ab-test-playbook");
  /* The five rules as the site's tiles (2026-09-20): the number in the
     product's hue, the rule as the tile's title, the reason under it -
     in place of the hairline table with grey mono numerals. */
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer>
        <ProductHeading eyebrow={c.product.rulesEyebrow} title={c.principlesTitle} align="center" />
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.principles.map((r, i) => (
            <Reveal key={r.title} delay={i * 60} className={i === c.principles.length - 1 ? "sm:col-span-2 lg:col-span-1" : ""}>
              <div className="flex h-full flex-col rounded-[28px] bg-paper p-6 ring-1 ring-ink-950/[0.06]">
                <span className={clsx("grid size-8 place-items-center rounded-full text-sm font-semibold tabular-nums", accent.tile)}>{i + 1}</span>
                <h3 className="mt-4 text-base font-semibold tracking-tight text-ink-950">{r.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-pretty text-ink-600">{r.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 09 · Install ---------------------------------------------------- */
/* The three ways in, in content.ts's order: the plugin marketplace, a
   clone from GitHub, the skills CLI. */
const WAY_ICONS = [<Store key="store" aria-hidden />, <GitHubMark key="github" />, <Terminal key="terminal" aria-hidden />];

function Install({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const c = t.abTesting;
  const en = lang === "en";
  /* The shared install panel (ui/InstallPanel): the steps tile beside the
     terminal on the product's plate. The three ways in are the
     repository's own, as the terminal's tabs. */
  return (
    <ProductSection tone="paper" space="md">
      <PortraitContainer>
        <InstallPanel
          slug="ab-test-playbook"
          title={c.install.title}
          methodsTitle={en ? "Add the plugin to Claude Code" : "Eklentiyi Claude Code'a ekleyin"}
          methods={c.install.options.map((opt, i) => ({ id: `opt-${i}`, label: opt.label, code: opt.code, icon: WAY_ICONS[i] }))}
          linksTitle={en ? "Read the repository, or try the demo" : "Repoyu okuyun ya da demoyu deneyin"}
          links={[
            { label: c.repoLink, href: REPO },
            { label: c.demoLink, href: DEMO },
          ]}
          copyLabel={en ? "Copy" : "Kopyala"}
          copiedLabel={en ? "Copied" : "Kopyalandı"}
        />
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 10 · FAQ -------------------------------------------------------- */
/* Same FaqAccordion (soft filled cards, blue-tinted open state) every
   other product page on the site uses - was a hand-rolled hairline-
   divided list before this pass, the one FAQ on the site that didn't
   match. content.ts's abTesting.faq array has no `id` field (it predates
   FaqAccordion), so ids are generated the same way
   JourneyBuilderPage.tsx's Faq already does for the same situation. */
function Faq({ t }: { t: (typeof copy)[Lang] }) {
  const c = t.abTesting;
  return (
    <ProductSection tone="soft" space="md">
      <PortraitContainer className="max-w-3xl">
        <ProductHeading eyebrow={c.product.faqEyebrow} title={c.faqTitle} body={c.faqIntro} />
        <Reveal delay={80} className="mt-10">
          <FaqAccordion items={c.faq.map((item, i) => ({ id: `ab-faq-${i}`, ...item }))} />
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

export default function AbTestingPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? "/tr/lab/ab-testing" : "/lab/ab-testing";
  const path = lang === "en" ? "/lab/ab-testing" : "/tr/lab/ab-testing";
  /* The breadcrumb trail every other product page carries and this one
     did not (2026-09-20): Home › Lab › <project name>, per
     seo/breadcrumb-contract.json's lab-product family. Only the approved
     type - the contract marks SoftwareApplication as not appropriate for
     an unrated, free repository. */
  const projectName = t.lab.projects.find((p) => p.slug === "ab-test-playbook")?.name ?? t.abTesting.title;
  const jsonLd = breadcrumbList([
    { name: t.footer.home, url: home },
    { name: t.nav.lab, url: lang === "en" ? "/lab" : "/tr/lab" },
    { name: projectName, url: path },
  ]);
  return (
    <>
      <JsonLdScript data={jsonLd} />
      <SiteHeader t={t} anchorBase={home} langHref={langHref} />
      <main>
        <Hero t={t} lang={lang} />
        <Stories t={t} lang={lang} />
        <Library t={t} lang={lang} />
        <HowItWorks t={t} lang={lang} />
        <Rules t={t} />
        <Install t={t} lang={lang} />
        <Faq t={t} />
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
