import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";
import {
  ProductBenefitStory,
  ProductHeading,
  ProductHowItWorks,
  ProductMetricStrip,
  ProductSection,
} from "@/components/ui/ProductPage";
import {
  CoverageMap,
  ExperimentBrief,
  GuardrailLedger,
  HowStepDesign,
  HowStepFind,
  HowStepRead,
  LibrarySpread,
  StatCalculatorLinks,
  VariantDiff,
} from "@/components/ui/AbTestVisuals";
import { AB_SCALE } from "@/lib/ab-test-marketing";
import { copy, type Lang } from "@/lib/content";

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
   The dark band this site's Lab pages already use, but re-proportioned:
   text is the narrower column and the product brief is the wider one. */
function Hero({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const c = t.abTesting;
  const p = c.product;
  return (
    <section
      data-tone="dark"
      className="relative isolate overflow-hidden bg-ink-950 pt-20 pb-20 md:pt-24 md:pb-28"
    >
      <div
        aria-hidden
        className="absolute inset-x-0 top-[-18rem] -z-10 h-[36rem] bg-[radial-gradient(50%_50%_at_50%_50%,var(--color-blue-600)_0%,transparent_70%)] opacity-40"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px)] [background-size:calc(100%/8)_100%]"
      />
      <PortraitContainer>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <Reveal>
              <p className="altor-eyebrow mb-5 text-white/45">{c.eyebrow}</p>
              <h1 className="max-w-xl text-h1-fluid font-medium text-white">{c.title}</h1>
            </Reveal>
            <Reveal delay={90} className="mt-6">
              <p className="max-w-xl text-lg leading-relaxed text-white/70">{c.sub}</p>
            </Reveal>
            <Reveal delay={140} className="mt-8">
              <div className="flex flex-wrap gap-2.5">
                <Link
                  href={libraryHref(lang)}
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-medium text-ink-950 transition-colors duration-[var(--duration-fast)] hover:bg-white/90"
                >
                  {p.heroCtaLibrary}
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
                <a
                  href={REPO}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-sm text-white/80 transition-colors duration-[var(--duration-fast)] hover:border-white/40 hover:text-white"
                >
                  {c.repoLink}
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </a>
              </div>
            </Reveal>
            {/* proof line — only claims the repo/content already make */}
            <Reveal delay={180} className="mt-7">
              <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[13px] text-white/45">
                {p.heroProof.map((item, i) => (
                  <li key={item} className="flex items-center gap-3">
                    {i > 0 && <span aria-hidden className="size-1 rounded-full bg-white/25" />}
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* VISUAL-01 — the product's own output, dominating the hero */}
          <Reveal delay={120} className="min-w-0">
            <ExperimentBrief lang={lang} />
          </Reveal>
        </div>
      </PortraitContainer>
    </section>
  );
}

/* ---- 02 · Scale band ------------------------------------------------- */
function Scale({ t, lang }: { t: (typeof copy)[Lang]; lang: Lang }) {
  const s = t.abTesting.product.scale;
  const n = (v: number) => v.toLocaleString(lang === "en" ? "en-US" : "tr-TR");
  return (
    <ProductSection tone="paper" space="band" className="border-b border-line-soft">
      <ProductMetricStrip
        items={[
          { value: n(AB_SCALE.scenarios), label: s.scenarios },
          { value: n(AB_SCALE.surfaces), label: s.surfaces },
          { value: n(AB_SCALE.categories), label: s.categories },
          { value: n(AB_SCALE.guardrails), label: s.guardrails },
        ]}
      />
    </ProductSection>
  );
}

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
            visual={<CoverageMap lang={lang} />}
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
            visual={<VariantDiff lang={lang} />}
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
            visual={<GuardrailLedger lang={lang} />}
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
          <Link
            href={libraryHref(lang)}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-ink-950 px-6 text-sm font-medium text-white transition-colors duration-[var(--duration-fast)] hover:bg-primary-600"
          >
            {p.cta}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
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
          <p className="max-w-xl text-[15px] leading-relaxed text-ink-950/65">{h.step3.note}</p>
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
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer>
        <ProductHeading eyebrow={c.product.rulesEyebrow} title={c.principlesTitle} />
        <div className="mt-12">
          {c.principles.map((r, i) => (
            <Reveal key={r.title} delay={i * 60}>
              <div className="grid grid-cols-1 gap-3 border-t border-line py-7 last:border-b md:grid-cols-[4rem_18rem_1fr] md:gap-8">
                <span className="font-mono text-sm text-ink-300 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-base font-medium tracking-tight text-ink-950">{r.title}</h3>
                <p className="max-w-2xl text-[15px] leading-relaxed text-ink-950/65">{r.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 09 · Install ---------------------------------------------------- */
function Install({ t }: { t: (typeof copy)[Lang] }) {
  const c = t.abTesting;
  return (
    <ProductSection tone="paper" space="md">
      <PortraitContainer>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
          <div>
            <ProductHeading eyebrow={c.product.installEyebrow} title={c.install.title} />
            <Reveal delay={80} className="mt-6">
              <a
                href={DEMO}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                {c.demoLink}
                <ArrowUpRight aria-hidden className="size-3.5" />
              </a>
            </Reveal>
          </div>
          <div className="flex flex-col gap-3">
            {c.install.options.map((opt, i) => (
              <Reveal key={opt.label} delay={i * 70}>
                <div className="overflow-hidden rounded-card border border-line-soft">
                  <p className="border-b border-line-soft bg-paper-soft px-4 py-2.5 text-sm font-medium text-ink-700">
                    {opt.label}
                  </p>
                  <pre className="overflow-x-auto bg-ink-950 p-4 font-mono text-xs leading-relaxed text-white/85">
                    {opt.code}
                  </pre>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 10 · FAQ -------------------------------------------------------- */
function Faq({ t }: { t: (typeof copy)[Lang] }) {
  const c = t.abTesting;
  return (
    <ProductSection tone="soft" space="md">
      <PortraitContainer>
        <ProductHeading eyebrow={c.product.faqEyebrow} title={c.faqTitle} body={c.faqIntro} />
        <div className="mt-10 max-w-3xl">
          {c.faq.map((item, i) => (
            <Reveal key={item.q} delay={i * 50}>
              <div className="border-t border-line py-6 last:border-b">
                <h3 className="text-base font-medium tracking-tight text-ink-950">{item.q}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-950/65">{item.a}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </PortraitContainer>
    </ProductSection>
  );
}

export default function AbTestingPage({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? "/tr/lab/ab-testing" : "/lab/ab-testing";
  return (
    <>
      <SiteHeader t={t} anchorBase={home} langHref={langHref} />
      <main>
        <Hero t={t} lang={lang} />
        <Scale t={t} lang={lang} />
        <Stories t={t} lang={lang} />
        <Library t={t} lang={lang} />
        <HowItWorks t={t} lang={lang} />
        <Rules t={t} />
        <Install t={t} />
        <Faq t={t} />
        <FinalCta t={t} />
      </main>
      <SiteFooter t={t} lang={lang} />
    </>
  );
}
