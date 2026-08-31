import { ArrowRight, ArrowUpRight, Check, ShieldAlert, SlidersHorizontal } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/Site";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";
import { ProductBenefitStory, ProductHeading, ProductSection } from "@/components/ui/ProductPage";
import { ChangeHistoryPreview } from "@/components/ui/LabPreviews";
import { InstallationStepper } from "@/components/ui/InstallationStepper";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGrid } from "@/components/ui/RelatedGrid";
import type { SkillProductContent } from "@/components/SkillProductPage";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { breadcrumbList, howTo, softwareApplication } from "@/lib/schema";
import { copy, type Lang } from "@/lib/content";

/* Google Ads Change History Explorer - same Peerbie-composition pass as
   claude-lifecycle's JourneyBuilderPage (centered hero with a dominant
   real visual, three "why different" feature stories, install, FAQ, a
   page-local final CTA), applied to a different real product. No new
   image/video assets exist for this one, so every visual here is either
   the site's own existing ChangeHistoryPreview illustration or a new
   small panel built the same way - real behaviour already documented in
   change-history.tsx (57 self-test checks, the human/automation split,
   Rule Matches, the stop-not-guess error path), never an invented claim.

   Deliberately NOT a change to SkillProductPage.tsx: that template is
   shared with numerspace and dashboard-builder, and this pass is scoped
   to the one page the site-owner asked for. */

const T = {
  en: {
    proof: ["57 self-test checks pass", "Zero dependencies", "Works fully offline"],
    whyEyebrow: "Why it's different",
    whyTitle: "Reports. Doesn't grade.",
    feature1: {
      title: "Human or automation - never guessed",
      body: "Every change is attributed to a person or to the automation that made it - a script, a bidding rule, a Recommendation - so a budget swing doesn't get pinned on the wrong actor.",
    },
    feature2: {
      title: "Rule Matches, on your own thresholds",
      body: "Off by default. Set a magnitude threshold in the browser and a match reads \"crossed the threshold you set\", always shown with the exact number beside it - never a bare severity colour.",
    },
    feature3: {
      title: "Stops rather than guesses",
      body: "An unrecognised column, an ambiguous date, or an uncategorised change combination exits with a structured status naming exactly which flag to re-run with.",
    },
    installEyebrow: "Install",
    installSub: "No account, no API key, no dependencies to install.",
    faqEyebrow: "FAQ",
    ctaEyebrow: "OPEN SOURCE",
    ctaTitle: "Read the change history your account already logged.",
  },
  tr: {
    proof: ["57 self-test kontrolü geçiyor", "Sıfır bağımlılık", "Tamamen çevrimdışı çalışır"],
    whyEyebrow: "Neden farklı",
    whyTitle: "Raporlar. Not vermez.",
    feature1: {
      title: "İnsan mı, otomasyon mu - tahmin edilmez",
      body: "Her değişiklik bir kişiye ya da onu yapan otomasyona (bir script, bir teklif kuralı, bir Recommendation) atfedilir - bir bütçe değişikliği yanlış aktöre mal edilmez.",
    },
    feature2: {
      title: "Kendi eşiğinizle Rule Matches",
      body: "Varsayılan olarak kapalı. Tarayıcıda bir büyüklük eşiği belirleyin; bir eşleşme \"belirlediğiniz eşiği aştı\" der, her zaman tam sayısıyla birlikte - hiçbir zaman açıklamasız bir önem rengiyle değil.",
    },
    feature3: {
      title: "Tahmin etmek yerine durur",
      body: "Tanınmayan bir sütun, belirsiz bir tarih ya da kategorize edilemeyen bir değişiklik bileşimi, tam olarak hangi bayrakla yeniden çalıştırılacağını adlandıran yapılandırılmış bir durumla sonlanır.",
    },
    installEyebrow: "Kurulum",
    installSub: "Hesap yok, API anahtarı yok, kurulacak bağımlılık yok.",
    faqEyebrow: "SSS",
    ctaEyebrow: "AÇIK KAYNAK",
    ctaTitle: "Hesabınızın zaten kaydettiği değişiklik geçmişini okuyun.",
  },
} as const;

function Hero({ c, t, lang }: { c: SkillProductContent; t: (typeof T)[Lang]; lang: Lang }) {
  const repo = c.primaryLinks.find((l) => l.href.includes("github.com")) ?? c.primaryLinks[0];
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
        {repo && (
          <Reveal delay={140} className="mt-8 flex flex-wrap justify-center gap-2.5">
            <a
              href={repo.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-ink-950 px-6 text-sm font-medium text-white transition-colors hover:bg-primary-600"
            >
              {repo.label}
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </Reveal>
        )}
        <Reveal delay={180} className="mt-7">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-[13px] text-ink-500">
            {t.proof.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check aria-hidden className="size-3.5 shrink-0 text-primary-600" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={220} className="mx-auto mt-16 max-w-lg">
          <div className="scale-[1.15] overflow-hidden rounded-t-[12px] shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_2px_rgb(10_16_32/0.04),0_24px_48px_-16px_rgb(10_16_32/0.18)]">
            <ChangeHistoryPreview lang={lang} />
          </div>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* Small illustrative panels for the three feature stories - built the
   same way JourneyCanvasPreview is: real vocabulary from the tool's own
   documented behaviour (change-history.tsx), nothing invented. */
function AttributionPanel({ lang }: { lang: Lang }) {
  const T2 = {
    // "User A" - the tool's own --mask-users placeholder label (see FAQ),
    // not an invented name, so this stays illustrative rather than
    // reading as a real person's activity.
    en: [
      { who: "User A", what: "Campaign budget updated", kind: "Person" },
      { who: "Auto-bidding rule", what: "Bid strategy changed", kind: "Automation" },
    ],
    tr: [
      { who: "User A", what: "Kampanya bütçesi güncellendi", kind: "Kişi" },
      { who: "Otomatik teklif kuralı", what: "Teklif stratejisi değişti", kind: "Otomasyon" },
    ],
  }[lang];
  return (
    <div className="flex flex-col gap-2.5 rounded-card border border-line bg-paper p-5">
      {T2.map((row) => (
        <div key={row.what} className="flex items-center justify-between gap-3 rounded-md bg-paper-soft px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-ink-900">{row.what}</p>
            <p className="truncate text-[12px] text-ink-500">{row.who}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${
              row.kind === "Person" || row.kind === "Kişi"
                ? "bg-primary-100 text-primary-700"
                : "bg-sand-50 text-neutral-700"
            }`}
          >
            {row.kind}
          </span>
        </div>
      ))}
    </div>
  );
}

function RuleMatchPanel({ lang }: { lang: Lang }) {
  const T2 = {
    en: { rule: "Budget change > 20%", match: "Campaign \"Search - Brand\" budget +34%", note: "crossed the threshold you set" },
    tr: { rule: "Bütçe değişimi > %20", match: "\"Search - Brand\" kampanyası bütçesi +%34", note: "belirlediğiniz eşiği aştı" },
  }[lang];
  return (
    <div className="rounded-card border border-line bg-paper p-5">
      <div className="flex items-center gap-2 rounded-md bg-paper-soft px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--color-line)]">
        <SlidersHorizontal aria-hidden className="size-3.5 text-ink-400" />
        <span className="text-xs text-ink-500">{T2.rule}</span>
      </div>
      <div className="mt-3 rounded-md bg-primary-50/70 px-3 py-2.5">
        <p className="text-[13px] font-medium text-ink-900">{T2.match}</p>
        <p className="mt-1 text-[12px] text-primary-700">{T2.note}</p>
      </div>
    </div>
  );
}

function StopPanel({ lang }: { lang: Lang }) {
  const T2 = {
    en: { col: "chg_type", flag: "--mapping-file" },
    tr: { col: "chg_type", flag: "--mapping-file" },
  }[lang];
  const label = lang === "en" ? "Unrecognised column" : "Tanınmayan sütun";
  const rerun = lang === "en" ? "Re-run with" : "Şununla yeniden çalıştırın";
  return (
    <div className="rounded-card border border-line bg-paper p-5">
      <div className="flex items-start gap-2.5 rounded-md bg-[#fdf3f0] px-3 py-3">
        <ShieldAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-[#c65d3f]" />
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-ink-900">
            {label}: <span className="font-mono">{T2.col}</span>
          </p>
          <p className="mt-1 text-[12px] text-ink-600">
            {rerun} <span className="font-mono text-ink-900">{T2.flag}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function WhyDifferent({ lang, t }: { lang: Lang; t: (typeof T)[Lang] }) {
  return (
    <>
      <ProductSection tone="paper" space="md" className="pb-0! md:pb-0!">
        <PortraitContainer>
          <ProductHeading eyebrow={t.whyEyebrow} title={t.whyTitle} align="center" />
        </PortraitContainer>
      </ProductSection>

      <ProductSection tone="paper" space="lg">
        <PortraitContainer>
          <ProductBenefitStory title={t.feature1.title} body={t.feature1.body} side="right" visual={<AttributionPanel lang={lang} />} />
        </PortraitContainer>
      </ProductSection>

      <ProductSection tone="soft" space="lg">
        <PortraitContainer>
          <ProductBenefitStory title={t.feature2.title} body={t.feature2.body} side="left" visual={<RuleMatchPanel lang={lang} />} />
        </PortraitContainer>
      </ProductSection>

      <ProductSection tone="paper" space="lg">
        <PortraitContainer>
          <ProductBenefitStory title={t.feature3.title} body={t.feature3.body} side="right" visual={<StopPanel lang={lang} />} />
        </PortraitContainer>
      </ProductSection>
    </>
  );
}

function Install({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer className="max-w-2xl">
        <ProductHeading eyebrow={t.installEyebrow} title={c.installTitle} body={t.installSub} align="center" />
        {/* The stepper itself stays left-aligned inside the centered
            header, same split the Mobbin-style reference this was
            modelled on uses: a centered intro, a left-aligned numbered
            list below it. */}
        <Reveal delay={80} className="mt-10">
          <InstallationStepper steps={c.installSteps} />
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

function Faq({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  if (!c.faq || c.faq.length === 0) return null;
  return (
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

function Related({ c }: { c: SkillProductContent }) {
  if (c.related.length === 0) return null;
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer>
        <RelatedGrid title={c.relatedTitle} items={c.related} />
      </PortraitContainer>
    </ProductSection>
  );
}

function PageCta({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  const repo = c.primaryLinks.find((l) => l.href.includes("github.com")) ?? c.primaryLinks[0];
  return (
    <section className="relative isolate overflow-hidden bg-ink-950 py-24 text-white md:py-32">
      <PortraitContainer className="text-center">
        <Reveal>
          <p className="altor-eyebrow mb-5 text-white/45">{t.ctaEyebrow}</p>
          <h2 className="mx-auto max-w-2xl text-h2-fluid font-medium text-white">{t.ctaTitle}</h2>
        </Reveal>
        {repo && (
          <Reveal delay={90} className="mt-9 flex flex-wrap justify-center gap-3">
            <a
              href={repo.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-white px-6 text-sm font-medium text-ink-950 transition-colors hover:bg-primary-50"
            >
              {repo.label}
              <ArrowRight aria-hidden className="size-4" />
            </a>
          </Reveal>
        )}
      </PortraitContainer>
    </section>
  );
}

export default function ChangeHistoryExplorerPage({ lang, content }: { lang: Lang; content: SkillProductContent }) {
  const copyT = copy[lang];
  const t = T[lang];
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? `/tr/lab/${content.slug}` : `/lab/${content.slug}`;
  const path = lang === "en" ? `/lab/${content.slug}` : `/tr/lab/${content.slug}`;

  // Same construction SkillProductPage.tsx uses for the two products still
  // on the generic template - kept in step with it deliberately, since this
  // page's `content` comes from the exact same getChangeHistoryContent()
  // that feeds appSchema/installSteps.
  const appUrl =
    content.primaryLinks.find((l) => l.href.includes("github.com"))?.href ??
    content.primaryLinks.find((l) => l.href.startsWith("http"))?.href ??
    content.primaryLinks[0]?.href;
  const jsonLd: object[] = [
    breadcrumbList([
      { name: copyT.footer.home, url: home },
      { name: copyT.nav.lab, url: lang === "en" ? "/lab" : "/tr/lab" },
      { name: content.title, url: path },
    ]),
  ];
  if (content.appSchema && appUrl) {
    jsonLd.push(
      softwareApplication({
        name: content.title,
        description: content.sub,
        url: appUrl,
        applicationCategory: content.appSchema.applicationCategory,
        operatingSystem: content.appSchema.operatingSystem ?? "Cross-platform",
        ...(appUrl.includes("github.com") ? { codeRepository: appUrl } : {}),
      }),
    );
  }
  if (content.installSteps.length > 0) {
    jsonLd.push(
      howTo({
        name: content.installTitle,
        description: content.whatItDoes.body,
        steps: content.installSteps.map((s) => ({ name: s.title, text: s.desc ?? s.title })),
      }),
    );
  }

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <SiteHeader t={copyT} anchorBase={home} langHref={langHref} />
      <main>
        <Hero c={content} t={t} lang={lang} />
        <WhyDifferent lang={lang} t={t} />
        <Install c={content} t={t} />
        <Faq c={content} t={t} />
        <Related c={content} />
        <PageCta c={content} t={t} />
      </main>
      <SiteFooter t={copyT} lang={lang} />
    </>
  );
}
