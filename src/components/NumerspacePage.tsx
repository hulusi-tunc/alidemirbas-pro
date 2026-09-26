import Image from "next/image";
import {
  ArrowUpRight,
  Briefcase,
  Calculator,
  CalendarClock,
  Car,
  CircleCheck,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  Megaphone,
  Moon,
  PawPrint,
  Shirt,
  Sigma,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { buttonStyles } from "@/components/ui/Button";
import { PixelFill } from "@/components/ui/PixelFill";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { ProductFrame, ProductMark } from "@/components/ui/ProductFrame";
import { Reveal } from "@/components/ui/Reveal";
import { ProductBenefitStory, ProductHeading, ProductSection } from "@/components/ui/ProductPage";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import type { SkillProductContent } from "@/lib/skill-product";
import { NUMERSPACE_PAGE_COPY as T } from "@/lib/skill-pages/numerspace";
import { resolveLabCopy } from "@/lib/lab-project-facts";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { breadcrumbList, webApplication } from "@/lib/schema";
import { copy, type Lang } from "@/lib/content";
import { clsx } from "@/lib/clsx";
import { NUMERSPACE_CATALOG } from "@/lib/numerspace-catalog";

/* Numerspace's product page - revised (2026-09) for length and repetition,
   not for a new visual language. The prior pass ran seven sections through
   one rhythm (centred eyebrow -> centred headline -> grey paragraph ->
   rounded card), which read as a second Numerspace homepage rather than
   Ali's own case page for it. This pass:

   - drops three sections that didn't earn their own screen (Bilingual,
     Accuracy, How to use it) - their one useful fact each survives as
     microcopy where it already belongs, not as a fourth headline;
   - adds one new section ("Why I built it") that a portfolio page needs
     and a marketing page doesn't - product thinking, not another feature
     list, set left-aligned and editorial rather than centred, so the page
     visibly changes register partway through instead of repeating itself;
   - keeps every other section's real material (the real category counts,
     the real calorie-calculator mock, the real FAQ, the real project
     proof lines) and re-composes it more compactly.

   EVERY VALUE BELOW IS REAL, re-checked against the live site this pass.
   The 13 category names, their example tool names and the calorie
   calculator's fields/formula/arithmetic carry over unchanged from the
   prior pass (see its own note, preserved below) - re-verified, not
   re-guessed. What's NEW this pass: the per-category tool counts (fetched
   directly from numerspace.com/en, category by category; they sum to
   exactly 97, the same sitemap-counted total this page already used,
   which is what makes them trustworthy enough to print). */




/* ---- The product, drawn ------------------------------------------------
   Hulusi (2026-09-06): the Lab's product visuals must "feel like real
   product screenshots, not Claude design". The hero used to frame a
   compact grid of the calorie calculator's fields; it now shows the
   calculator PAGE as numerspace.com lays it out - nav, breadcrumb,
   category, title, formula, the segmented gender and goal controls, the
   four inputs with the worked example in them, BMR and the result
   (ui/LabProductWindows.tsx). Same real fields, same real arithmetic. */

/* ---- 01 · Hero - centred / visual -------------------------------------- */
function Hero({ c, t, lang, siteHref }: { c: SkillProductContent; t: (typeof T)[Lang]; lang: Lang; siteHref: string }) {
  const link = c.primaryLinks[0];
  return (
    <section className="relative isolate overflow-hidden bg-paper pt-16 pb-20 md:pt-20 md:pb-24">
      <PortraitContainer className="text-center">
        <Reveal>
          <ProductMark slug="numerspace" lang={lang} className="mb-5" />
          <h1 className="mx-auto max-w-4xl text-h1 text-ink-950">{t.heroTitle}</h1>
        </Reveal>
        <Reveal delay={90} className="mt-6">
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-ink-muted">{t.heroSub}</p>
        </Reveal>
        {link && (
          <Reveal delay={140} className="mt-8 flex flex-wrap justify-center gap-2.5">
            <a href={link.href} target="_blank" rel="noreferrer" className={buttonStyles({ variant: "primary", size: "md" })}>
              <PixelFill />
              {t.ctaVisit}
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </Reveal>
        )}
        <Reveal delay={180} className="mt-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[12.5px] text-ink-500">
            {t.heroStats.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={220} className="mx-auto mt-14 max-w-5xl text-left">
          {/* THE REAL SITE. Numerspace exists and is Ali's, so its hero is a
              photograph of it - numerspace.com's homepage in this language,
              captured on 2026-09-06 (public/lab/numerspace/home-<lang>.jpg,
              1440×900 at 2x) - not a drawing of it (Hulusi: "this is not the
              website he built; go there, take a screenshot"). On the
              project's plate, in its hue (ui/ProductFrame.tsx). */}
          <ProductFrame slug="numerspace">
            <a href={siteHref} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl bg-paper ring-1 ring-ink-950/10 shadow-[0_28px_70px_-28px_rgb(10_16_32/0.55)]">
              <Image
                src={`/lab/numerspace/home-${lang}.jpg`}
                alt={t.heroShotAlt}
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

/* ---- 02 · Why I built it - editorial / left-aligned --------------------
   The page's register change: everything above and below this is centred;
   this one section reads as a note from Ali, not a product claim, and the
   left-aligned heading is the visible signal of that before a reader has
   parsed a single word. */
/* Since 2026-09-20 (Hulusi's sub-page pass: "remove what is only text")
   the note is no longer a band of its own: it is the text side of one
   benefit story whose visual is the catalogue itself - see
   ProjectSection below. */

/* ---- 03 · The catalogue - every calculator, as cards --------------------
   Hulusi (2026-09-06): "show all of the available calculators for that
   specific project - look at the calculator page and do something like
   that". So this is the site's own calculator-library grammar (ui/
   CalculatorLibrary.tsx: soft cards, a Lucide icon on a round tile tinted
   per category, chips to jump by category) over numerspace.com's real
   catalogue: src/lib/numerspace-catalog.ts, generated from the site's
   sitemap and category pages by scripts/fetch-numerspace-catalog.mjs -
   97 calculators in 13 categories, each with the site's own name, one-line
   description and link. Nothing here is typed in by hand. */

const CATEGORY_LOOK: Record<string, { icon: LucideIcon; tint: string }> = {
  "finance-investment": { icon: Landmark, tint: "bg-emerald-100 text-emerald-700" },
  "health-fitness": { icon: HeartPulse, tint: "bg-rose-100 text-rose-700" },
  "business-career": { icon: Briefcase, tint: "bg-sky-100 text-sky-700" },
  "time-date": { icon: CalendarClock, tint: "bg-amber-100 text-amber-700" },
  "math-converter": { icon: Sigma, tint: "bg-violet-100 text-violet-700" },
  "education-productivity": { icon: GraduationCap, tint: "bg-indigo-100 text-indigo-700" },
  "home-living": { icon: House, tint: "bg-orange-100 text-orange-700" },
  "clothing-size": { icon: Shirt, tint: "bg-fuchsia-100 text-fuchsia-700" },
  "marketing-analytics": { icon: Megaphone, tint: "bg-blue-100 text-blue-700" },
  pet: { icon: PawPrint, tint: "bg-lime-100 text-lime-700" },
  "cars-travel": { icon: Car, tint: "bg-cyan-100 text-cyan-700" },
  faith: { icon: Moon, tint: "bg-teal-100 text-teal-700" },
  astrology: { icon: Sparkles, tint: "bg-purple-100 text-purple-700" },
};
const FALLBACK_LOOK = { icon: Calculator, tint: "bg-teal-100 text-teal-700" };

/* The two languages list the same 13 categories in the same order, so a
   Turkish category takes its look from its English twin by position. */
const LOOK_BY_INDEX = NUMERSPACE_CATALOG.en.map((c) => CATEGORY_LOOK[c.slug] ?? FALLBACK_LOOK);

/** The category's short name: the site's own page title without its
    trailing "Calculators" / "Hesaplayıcıları". */
function shortName(name: string) {
  return name.replace(/\s+(Calculators?|Hesaplay[ıi]c[ıi]lar[ıi]?|Hesaplama Araçlar[ıi])$/iu, "");
}

/** One story in place of two bands (2026-09-20): Ali's note on the left,
    the catalogue on the right as a soft tile of the 13 real categories
    with their counts - the chips display only, no per-calculator listing
    or outbound links (Hulusi, 2026-09-12) - and the formula note as the
    aside under the text. The "Categories" heading over a bare chip row
    and the text-only "Why I built it" band are what it replaced. */
function ProjectSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  const cats = NUMERSPACE_CATALOG[lang];
  return (
    <ProductSection tone="paper" space="lg">
      <PortraitContainer>
        <ProductBenefitStory
          eyebrow={t.whyEyebrow}
          title={t.whyTitle}
          body={t.whyBody}
          side="right"
          aside={
            <div className="flex max-w-md items-start gap-3 rounded-2xl bg-paper-soft p-4">
              <CircleCheck aria-hidden className="mt-0.5 size-5 shrink-0 text-emerald-600" />
              <p className="text-sm leading-relaxed text-pretty text-ink-600">
                <span className="font-semibold text-ink-950">{t.verifyCaption}</span> {t.verifyNote}
              </p>
            </div>
          }
          visual={
            <div className="rounded-[28px] bg-paper-soft p-6 md:p-8">
              <p className="text-sm leading-relaxed text-pretty text-ink-600">{t.catSub}</p>
              <ul className="mt-5 flex list-none flex-wrap gap-2 p-0">
                {cats.map((c, i) => {
                  const Icon = LOOK_BY_INDEX[i].icon;
                  return (
                    <li key={c.slug}>
                      <span className="inline-flex h-9 items-center gap-2 rounded-full bg-paper px-3.5 text-[13px] font-medium text-ink-700 shadow-hairline">
                        <Icon aria-hidden className={clsx("size-4", LOOK_BY_INDEX[i].tint.split(" ")[1])} />
                        {shortName(c.name)}
                        <span className="text-ink-400 tabular-nums">{c.count}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          }
        />
      </PortraitContainer>
    </ProductSection>
  );
}

function Faq({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  if (!c.faq || c.faq.length === 0) return null;
  return (
    // paper, not soft: FaqAccordion's own items are already bg-paper-soft
    // filled cards (see that file's own comment) - on a soft-toned section
    // they sit on the exact same colour as their own fill and disappear
    // into it. CalculatorDetailTemplate.tsx hit the same thing and fixed
    // it the same way - white ground, so the cards read as cards.
    <ProductSection tone="paper" space="lg">
      <PortraitContainer className="max-w-2xl">
        <ProductHeading eyebrow={t.faqEyebrow} title={c.faqTitle ?? "FAQ"} />
        <Reveal delay={80} className="mt-10">
          <FaqAccordion items={c.faq} />
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- Other Lab projects - visual project cards --------------------------
   Deliberately NOT RelatedGrid (the plain bordered-link row used
   elsewhere): the brief for this pass asks the four other Lab projects to
   read as distinct from the category rows above, each with a small,
   restrained visual keyed to what that project actually is - not a fifth
   repeat of "bordered rectangle, name, one line of grey text". All four
   get the same size and treatment; nothing here is a featured card. */
/* The "Other Lab projects" cards are gone (2026-09-20): the footer lists
   the same projects, and no other product page carries them now. */

export default function NumerspacePage({ lang, content }: { lang: Lang; content: SkillProductContent }) {
  const copyT = copy[lang];
  const t = resolveLabCopy(T[lang]);
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? `/tr/lab/${content.slug}` : `/lab/${content.slug}`;
  const path = lang === "en" ? `/lab/${content.slug}` : `/tr/lab/${content.slug}`;
  const siteHref = content.primaryLinks[0]?.href ?? "https://www.numerspace.com";

  const jsonLd: object[] = [
    breadcrumbList([
      { name: copyT.footer.home, url: home },
      { name: copyT.nav.lab, url: lang === "en" ? "/lab" : "/tr/lab" },
      { name: content.title, url: path },
    ]),
  ];
  // No HowTo entry this pass: the page no longer walks a visible 1-2-3
  // "how to use it" sequence (see this file's header comment), and a
  // HowTo result should describe steps a visitor can actually see on the
  // page, not steps that used to be here.
  if (content.appSchema && siteHref) {
    jsonLd.push(
      webApplication({
        name: content.title,
        description: content.sub,
        url: siteHref,
        applicationCategory: content.appSchema.applicationCategory,
      }),
    );
  }

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <SiteHeader t={copyT} anchorBase={home} langHref={langHref} />
      <main>
        <Hero c={content} t={t} lang={lang} siteHref={siteHref} />
        <ProjectSection t={t} lang={lang} />
        <Faq c={content} t={t} />
        <FinalCta t={copyT} />
      </main>
      <SiteFooter t={copyT} lang={lang} />
    </>
  );
}
