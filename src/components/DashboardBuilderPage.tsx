import { ArrowUpRight, Ban, BookOpen, Check, CircleCheck, Info, LayoutDashboard, Lightbulb, Presentation, Scale, ShieldCheck, Store, Terminal, TriangleAlert } from "lucide-react";

import { FinalCta, SiteFooter, SiteHeader } from "@/components/Site";
import { buttonStyles } from "@/components/ui/Button";
import { PixelFill } from "@/components/ui/PixelFill";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { GitHubMark } from "@/components/ui/BrandIcons";
import { InstallPanel } from "@/components/ui/InstallPanel";
import { labAccent } from "@/components/ui/LabProjectIdentity";
import { ProductFrame, ProductMark } from "@/components/ui/ProductFrame";
import { Reveal } from "@/components/ui/Reveal";
import { ProductBenefitStory, ProductHeading, ProductSection } from "@/components/ui/ProductPage";
import { DashboardHeroWindow } from "@/components/ui/LabProductWindows";
import { AppBar, AppMeta, AppTitle, Badge, type BadgeTone, codeLabel, KeyValues, Table, Td, Th, Tr, Window } from "@/components/ui/LabWindow";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import type { SkillProductContent } from "@/components/SkillProductPage";
import { DASHBOARD_BUILDER_PAGE_COPY as T } from "@/lib/skill-pages/dashboard-builder";
import { resolveLabCopy } from "@/lib/lab-project-facts";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { breadcrumbList, softwareApplication } from "@/lib/schema";
import { clsx } from "@/lib/clsx";
import { copy, type Lang } from "@/lib/content";
import { DASHBOARD_REAL } from "@/lib/lab-material";

/* Marketing Dashboard Builder's product page.

   Built the same way as ChangeHistoryExplorerPage.tsx: cloned
   ali-demirbas/dashboard-builder and read README.md,
   skills/dashboard-builder/references/comparability-rules.md,
   data-quality-gate.md, kpi-framework.md and analysis-playbook.md in
   full, then built the page's sections around the mechanisms those
   files actually describe - a comparability engine, a metric registry,
   a data-quality gate, an insight-candidate engine, and an 11-template
   dashboard/presentation output - rather than the generic "what it
   does / how it works" template dashboard-builder.tsx used to feed
   SkillProductPage with.

   EVERY EXAMPLE BELOW IS REAL:
   - The "$2.9M vs ~$1.0M Total Revenue" example (Hero) is
     comparability-rules.md §2.1's own worked case, described there as
     "the single most common real-world instance of this whole
     hard-block category."
   - The "rank Meta and LinkedIn by ROAS" refusal (Comparability Engine
     section) is comparability-rules.md §4's own worked example,
     verbatim, translated for the TR page.
   - The four comparability states, the EXACT/INFERRED/AMBIGUOUS mapping
     levels, the BLOCKER/WARNING/INFO severities, the 8-question insight
     gate and its CRITICAL/HIGH/MEDIUM/LOW/SUPPRESS scale, and the
     11-template table are each condensed from their own reference file,
     not invented for this page.
   - The three install commands are README's own "Install" section.
   - "17 tests passing" was verified this session by running
     `python3 -m unittest discover -s tests -v` inside the cloned repo
     (Ran 17 tests ... OK), not copied from the README badge unchecked. */

const REAL = DASHBOARD_REAL;



const MARKETPLACE_CMD = `/plugin marketplace add ali-demirbas/dashboard-builder\n/plugin install dashboard-builder@dashboard-builder`;
const LOCAL_CMD = `git clone https://github.com/ali-demirbas/dashboard-builder.git\nclaude --plugin-dir ./dashboard-builder`;
const SKILLS_CLI_CMD = `npx skills add ali-demirbas/dashboard-builder --all`;
const TEST_CMD = `python3 -m unittest discover -s tests -v`;

/* The README's tone words as the window kit's badge hues. NOT_COMPARABLE
   and BLOCKER take rose, the kit's "this is the bad one" hue - the same
   hue the change explorer's window uses for an old value. */
const TONE_HUE: Record<string, BadgeTone> = { emerald: "emerald", sky: "sky", amber: "amber", rose: "rose", neutral: "neutral", ink: "ink" };

/* ---- The product's surfaces, drawn --------------------------------
   Hulusi (2026-09-06): the Lab's product visuals must "feel like real
   product screenshots, not Claude design". The three visuals below are
   the skill's own reference files as the tables they define - the
   comparability rules with the refusal template filled in, the mapping
   and quality levels side by side, the eight-question gate with its
   labels - drawn with the window parts in ui/LabWindow.tsx; the hero's
   window is ui/LabProductWindows.tsx. Every value is the file's own. */

const WIN = {
  en: {
    comp: { label: "Screenshot of the comparability rules: the four states with rule and example, and one refused comparison.", address: "references/comparability-rules.md", title: "Comparability classes", states: "4 classes", cls: "Class", rule: "Rule", example: "Example" },
    gate: { label: "Screenshot of the metric registry and the data-quality gate: three mapping levels and three severities, each with its example.", address: "references/kpi-framework.md · data-quality-gate.md", levels: "levels" },
    insight: { label: "Screenshot of the insight gate: the numbered questions with what happens on a no, and the five labels a finding can get.", address: "references/analysis-playbook.md", title: "Insight check", gate: "5 of 8 questions", question: "Question", ifNo: "If no", labels: "Labels" },
  },
  tr: {
    comp: { label: "Karşılaştırılabilirlik kurallarının ekran görüntüsü: kural ve örnekleriyle dört durum ve reddedilen bir karşılaştırma.", address: "references/comparability-rules.md", title: "Karşılaştırılabilirlik sınıfları", states: "4 sınıf", cls: "Sınıf", rule: "Kural", example: "Örnek" },
    gate: { label: "Metrik kaydı ve veri kalitesi kontrolünün ekran görüntüsü: üç eşleme seviyesi ve üç önem derecesi, her biri örneğiyle.", address: "references/kpi-framework.md · data-quality-gate.md", levels: "seviye" },
    insight: { label: "İçgörü kontrolünün ekran görüntüsü: numaralı sorular, hayır cevabında olacaklar ve bir bulgunun alabileceği beş etiket.", address: "references/analysis-playbook.md", title: "İçgörü kontrolü", gate: "8 sorudan 5'i", question: "Soru", ifNo: "Hayırsa", labels: "Etiketler" },
  },
} as const;

/* Each enum id's icon, by the README's tone word: a check for the safe
   level, an info mark for the conditional one, a warning for the one
   that needs a caveat, a ban for the one that stops. */
const TONE_ICON: Record<string, React.ReactNode> = {
  emerald: <CircleCheck aria-hidden />,
  sky: <Info aria-hidden />,
  amber: <TriangleAlert aria-hidden />,
  rose: <Ban aria-hidden />,
  neutral: <Info aria-hidden />,
  ink: <Ban aria-hidden />,
};

/** An enum id as the product's badge: its hue, its icon, and the label a
    reader sees. The id is the skill's own enum and never changes - the
    display layer is `label` on the lab-material entry, per language, with
    `codeLabel` as the fallback for an entry that carries no label yet. */
function IdBadge({ id, tone, label, lang }: { id: string; tone: string; label?: { en: string; tr: string }; lang: Lang }) {
  return (
    <Badge hue={TONE_HUE[tone] ?? "neutral"} icon={TONE_ICON[tone]} code>
      {label ? label[lang] : codeLabel(id)}
    </Badge>
  );
}

/** The comparability engine's own rule table, then the reporting template
    it fills in when a rule fires - the README's worked refusal, all four
    fields, as the console line it is. */
function ComparabilityWindow({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  const w = WIN[lang].comp;
  const ex = REAL.refusalExample;
  return (
    <Window label={w.label} address={w.address} meta={w.states}>
      <AppBar>
        <AppTitle icon={<Scale aria-hidden />}>{w.title}</AppTitle>
      </AppBar>
      <Table>
        <thead>
          <tr>
            <Th>{w.cls}</Th>
            <Th className="w-[42%]">{w.rule}</Th>
            <Th className="hidden w-[36%] md:table-cell">{w.example}</Th>
          </tr>
        </thead>
        <tbody>
          {REAL.comparabilityStates.map((s) => (
            <Tr key={s.id}>
              <Td className="align-top whitespace-nowrap">
                <IdBadge id={s.id} tone={s.tone} label={s.label} lang={lang} />
              </Td>
              <Td className="align-top leading-snug text-ink-800">{s[lang]}</Td>
              <Td className="hidden align-top text-[12.5px] leading-snug text-ink-600 md:table-cell">{s.example[lang]}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      <div className="border-t border-line-soft bg-rose-50/40 px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge hue="rose" icon={<Ban aria-hidden />}>
            {t.refusalNotComparable}
          </Badge>
          <span className="text-[13px] font-medium text-ink-800">{ex.rule[lang]}</span>
          <span className="ml-auto hidden text-[12px] text-ink-500 sm:block">{t.compWorkedLabel}</span>
        </div>
        <KeyValues
          wide
          className="mt-2.5"
          rows={[
            [t.refusalAsked, ex.asked[lang]],
            [t.refusalWhy, ex.why[lang]],
            [t.refusalCanSay, ex.canSay[lang]],
            [t.refusalFix, ex.fix[lang]],
          ]}
        />
      </div>
    </Window>
  );
}

/** The two checks that run before analysis, side by side: the metric
    registry's mapping levels and the quality gate's severities, each
    level with its own example from the reference file. */
function RegistryGateWindow({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  const w = WIN[lang].gate;
  const panes = [
    { title: t.registryLabel, icon: <BookOpen aria-hidden />, levels: REAL.registryLevels },
    { title: t.qualityLabel, icon: <ShieldCheck aria-hidden />, levels: REAL.qualityLevels },
  ];
  return (
    <Window label={w.label} address={w.address} meta={`${REAL.registryLevels.length + REAL.qualityLevels.length} ${w.levels}`}>
      {/* The two panes sit side by side only when the WINDOW is wide
          enough for two readable columns (a container query, not the
          viewport): inside a benefit story's column they stack. */}
      <div className="@container">
      <div className="grid grid-cols-1 divide-y divide-line-soft @2xl:grid-cols-2 @2xl:divide-x @2xl:divide-y-0">
        {panes.map((pane) => (
          <div key={pane.title} className="min-w-0">
            <AppBar>
              <AppTitle icon={pane.icon}>{pane.title}</AppTitle>
              <AppMeta className="ml-auto">{pane.levels.length}</AppMeta>
            </AppBar>
            <ul className="m-0 list-none p-0">
              {pane.levels.map((l) => (
                <li key={l.id} className="flex gap-3 border-b border-line-soft px-3.5 py-3 last:border-0">
                  <span className="w-28 shrink-0">
                    <IdBadge id={l.id} tone={l.tone} label={l.label} lang={lang} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] leading-snug text-ink-900">{l[lang]}</span>
                    <span className="mt-1 block text-[12.5px] leading-snug text-ink-500">{l.example[lang]}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      </div>
    </Window>
  );
}

/** The insight candidate engine's gate: the playbook's numbered questions
    with what a no does, then the five labels a finding can end up with. */
function InsightGateWindow({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  const w = WIN[lang].insight;
  return (
    <Window label={w.label} address={w.address} meta={w.gate}>
      <AppBar>
        <AppTitle icon={<Lightbulb aria-hidden />}>{w.title}</AppTitle>
      </AppBar>
      <Table>
        <thead>
          <tr>
            <Th>#</Th>
            <Th className="w-[50%]">{w.question}</Th>
            <Th className="hidden w-[42%] sm:table-cell">{w.ifNo}</Th>
          </tr>
        </thead>
        <tbody>
          {REAL.insightQuestions.map((q) => (
            <Tr key={q.n}>
              <Td className="text-[12.5px] whitespace-nowrap text-ink-500 tabular-nums">{String(q.n).padStart(2, "0")}</Td>
              <Td className="font-semibold text-ink-950">
                {q[lang]}
                <span className="mt-1 block text-[12.5px] font-normal text-ink-600 sm:hidden">
                  {t.ifNoLabel} {q.ifNo[lang]}
                </span>
              </Td>
              <Td className="hidden text-[12.5px] leading-snug text-ink-600 sm:table-cell">{q.ifNo[lang]}</Td>
            </Tr>
          ))}
        </tbody>
      </Table>
      <div className="border-t border-line-soft bg-paper-soft/60">
        <p className="px-3.5 pt-3 pb-1.5 text-[12px] font-semibold text-ink-600">{w.labels}</p>
        <ul className="m-0 list-none p-0 pb-2">
          {REAL.insightLabels.map((l) => (
            <li key={l.id} className="flex items-start gap-3 px-3.5 py-1.5">
              <span className="w-28 shrink-0">
                <IdBadge id={l.id} tone={l.tone} label={l.label} lang={lang} />
              </span>
              <span className="text-[12.5px] leading-snug text-ink-800">{l[lang]}</span>
            </li>
          ))}
        </ul>
      </div>
    </Window>
  );
}

/* ---- 01 · Hero ------------------------------------------------------ */
function Hero({ c, t, lang }: { c: SkillProductContent; t: (typeof T)[Lang]; lang: Lang }) {
  const repo = c.primaryLinks.find((l) => l.href.includes("github.com")) ?? c.primaryLinks[0];
  return (
    <section className="relative isolate overflow-hidden bg-paper pt-16 pb-24 md:pt-20 md:pb-32">
      <PortraitContainer className="text-center">
        <Reveal>
          <ProductMark slug="dashboard-builder" lang={lang} className="mb-5" />
          <h1 className="mx-auto max-w-4xl text-h1 text-ink-950">{t.heroTitle}</h1>
        </Reveal>
        <Reveal delay={90} className="mt-6">
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-ink-muted">{t.heroSub}</p>
        </Reveal>
        {repo && (
          <Reveal delay={140} className="mt-8 flex flex-wrap justify-center gap-2.5">
            <a href={repo.href} target="_blank" rel="noreferrer" className={buttonStyles({ variant: "primary", size: "md" })}>
              <PixelFill />
              {repo.label}
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </Reveal>
        )}
        <Reveal delay={180} className="mt-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[12.5px] text-ink-500">
            {t.proof.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check aria-hidden className="size-3 shrink-0 text-primary-600" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={220} className="mx-auto mt-14 max-w-4xl text-left">
          {/* On the project's plate, in its hue - the frame language of the
              Lab index (ui/ProductFrame.tsx). */}
          <ProductFrame slug="dashboard-builder">
            <DashboardHeroWindow lang={lang} labels={{ revenue: t.revenueLabel, naive: t.naiveSumLabel, actual: t.trueTotalLabel }} />
          </ProductFrame>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 02 · Pipeline band ----------------------------------------------
   The README's own pipeline as a drawn flow (2026-09-20, Hulusi's sub-page
   pass): the stages as numbered paper tiles on hairline connectors, the
   two outputs as the product's own tiles at the end, in the homepage's
   miniature idiom - it was a row of bordered chips before. */
const OUTPUT_ICON = [<LayoutDashboard key="dashboard" aria-hidden />, <Presentation key="deck" aria-hidden />];

function PipelineSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  const accent = labAccent("dashboard-builder");
  return (
    <ProductSection tone="soft" space="md">
      <PortraitContainer>
        <Reveal className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-y-3">
          {REAL.pipeline.map((step, i) => (
            <div key={step.en} className="flex items-center">
              {i > 0 && <span aria-hidden className="h-px w-4 shrink-0 bg-ink-300" />}
              <span className="flex items-center gap-2.5 rounded-xl bg-paper py-2.5 pr-4 pl-2.5 text-[13px] font-medium text-ink-900 ring-1 ring-ink-950/[0.06]">
                <span className={clsx("grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold tabular-nums", accent.tile)}>{i + 1}</span>
                {step[lang]}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 pl-4">
            {REAL.pipelineOutputs.map((o, i) => (
              <span key={o.en} className="flex items-center gap-2 rounded-xl bg-ink-950 px-3.5 py-2.5 text-[13px] font-medium text-white [&>svg]:size-4 [&>svg]:text-white/70">
                {OUTPUT_ICON[i]}
                {o[lang]}
              </span>
            ))}
          </div>
        </Reveal>
        <Reveal delay={80} className="mx-auto mt-6 max-w-xl text-center">
          <p className="text-sm leading-relaxed text-pretty text-ink-600">{t.pipelineNote}</p>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 03 · Comparability Engine ---------------------------------------- */
function ComparabilityEngineSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  return (
    <ProductSection tone="paper" space="xl">
      <PortraitContainer>
        <ProductHeading eyebrow={t.compEyebrow} title={t.compTitle} body={t.compSub} align="center" />
        <Reveal delay={100} className="mx-auto mt-12 max-w-4xl text-left">
          <ProductFrame slug="dashboard-builder" inset="sm">
            <ComparabilityWindow t={t} lang={lang} />
          </ProductFrame>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 04 · Metric registry + Quality gate ------------------------------
   The three engine sections used to be three centred headings over three
   full-width plates in a row. Now the comparability check keeps the wide
   centred moment (it is the product's core) and the two checks after it
   alternate sides as benefit stories, the rhythm the A/B page set. */
function RegistryAndGateSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer>
        <ProductBenefitStory
          eyebrow={t.gateEyebrow}
          title={t.gateTitle}
          body={t.gateSub}
          side="left"
          visual={
            <ProductFrame slug="dashboard-builder" inset="sm">
              <RegistryGateWindow t={t} lang={lang} />
            </ProductFrame>
          }
        />
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 05 · Insight Candidate Engine ------------------------------------- */
function InsightEngineSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  return (
    <ProductSection tone="paper" space="lg">
      <PortraitContainer>
        <ProductBenefitStory
          eyebrow={t.insightEyebrow}
          title={t.insightTitle}
          body={t.insightSub}
          side="right"
          aside={
            <p className="max-w-md border-l-2 border-primary-600 py-1 pl-5 text-[15px] leading-relaxed text-ink-600 italic">{t.suppressQuote}</p>
          }
          visual={
            <ProductFrame slug="dashboard-builder" inset="sm">
              <InsightGateWindow t={t} lang={lang} />
            </ProductFrame>
          }
        />
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 06 · Dashboards & Presentations ----------------------------------- */
function TemplatesSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer>
        <ProductHeading eyebrow={t.templatesEyebrow} title={t.templatesTitle} body={t.templatesSub} align="center" />
        {/* The README's eleven templates as the site's tiles - paper on the
            soft ground, the template's number in the product's hue - in
            place of the bordered boxes with black mono badges. */}
        <Reveal delay={100} className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-3 text-left sm:grid-cols-2 lg:grid-cols-3">
          {REAL.templates.map((tpl) => (
            <div key={tpl.id} className="flex items-start gap-3 rounded-2xl bg-paper p-4 ring-1 ring-ink-950/[0.06]">
              <span className={clsx("grid size-7 shrink-0 place-items-center rounded-full text-[12px] font-semibold tabular-nums", labAccent("dashboard-builder").tile)}>
                {tpl.id}
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-semibold text-ink-950">{tpl[lang]}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-pretty text-ink-600">{tpl.q[lang]}</p>
              </div>
            </div>
          ))}
        </Reveal>
        <Reveal delay={140} className="mx-auto mt-8 max-w-2xl text-center">
          <p className="text-sm leading-relaxed text-pretty text-ink-600">{t.templatesFilterNote}</p>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 07 · Install -------------------------------------------------------- */
function Install({ c, t, lang }: { c: SkillProductContent; t: (typeof T)[Lang]; lang: Lang }) {
  const repo = c.primaryLinks.find((l) => l.href.includes("github.com")) ?? c.primaryLinks[0];
  /* The shared install panel (ui/InstallPanel): the steps tile beside the
     terminal on the product's plate. The three ways in and the test
     command are the README's own. */
  return (
    <ProductSection tone="paper" space="lg">
      <PortraitContainer>
        <InstallPanel
          slug="dashboard-builder"
          title={t.installTitle}
          body={t.installSub}
          methodsTitle={t.stepAdd}
          methods={[
            { id: "marketplace", label: t.tabMarketplace, code: MARKETPLACE_CMD, icon: <Store aria-hidden /> },
            { id: "local", label: t.tabLocal, code: LOCAL_CMD, icon: <GitHubMark /> },
            { id: "skills", label: t.tabSkillsCli, code: SKILLS_CLI_CMD, icon: <Terminal aria-hidden /> },
          ]}
          then={{ title: t.stepTest, note: t.testNote, code: TEST_CMD }}
          linksTitle={t.viewRepo}
          links={repo ? [{ label: repo.label, href: repo.href }] : []}
          copyLabel={lang === "en" ? "Copy" : "Kopyala"}
          copiedLabel={lang === "en" ? "Copied" : "Kopyalandı"}
        />
      </PortraitContainer>
    </ProductSection>
  );
}

function Faq({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  if (!c.faq || c.faq.length === 0) return null;
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer className="max-w-2xl">
        <ProductHeading eyebrow={t.faqEyebrow} title={c.faqTitle ?? "FAQ"} />
        <Reveal delay={80} className="mt-10">
          <FaqAccordion items={c.faq} />
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* The "Other Lab projects" grid that stood before the closing band is
   gone (2026-09-20): the footer lists the same projects, and the A/B and
   Journey Builder pages never carried one. */

export default function DashboardBuilderPage({ lang, content }: { lang: Lang; content: SkillProductContent }) {
  const copyT = copy[lang];
  const t = resolveLabCopy(T[lang]);
  const home = lang === "en" ? "/" : "/tr";
  const langHref = lang === "en" ? `/tr/lab/${content.slug}` : `/lab/${content.slug}`;
  const path = lang === "en" ? `/lab/${content.slug}` : `/tr/lab/${content.slug}`;

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
  /* No HowTo (2026-09-20): it described the old generic install steps,
     not the ones the Install panel shows, and Google stopped showing
     HowTo rich results in 2023 - the site's structured-data contract
     never asked for it. Breadcrumbs and the application node stay. */

  return (
    <>
      <JsonLdScript data={jsonLd} />
      <SiteHeader t={copyT} anchorBase={home} langHref={langHref} />
      <main>
        <Hero c={content} t={t} lang={lang} />
        <PipelineSection t={t} lang={lang} />
        <ComparabilityEngineSection t={t} lang={lang} />
        <RegistryAndGateSection t={t} lang={lang} />
        <InsightEngineSection t={t} lang={lang} />
        <TemplatesSection t={t} lang={lang} />
        <Install c={content} t={t} lang={lang} />
        <Faq c={content} t={t} />
        <FinalCta t={copy[lang]} />
      </main>
      <SiteFooter t={copyT} lang={lang} />
    </>
  );
}
