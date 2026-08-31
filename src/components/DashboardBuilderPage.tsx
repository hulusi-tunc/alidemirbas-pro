import { ArrowRight, ArrowUpRight, Check } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/Site";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";
import { ProductHeading, ProductSection } from "@/components/ui/ProductPage";
import { CodeTabs } from "@/components/ui/CodeTabs";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { RelatedGrid } from "@/components/ui/RelatedGrid";
import type { SkillProductContent } from "@/components/SkillProductPage";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { breadcrumbList, howTo, softwareApplication } from "@/lib/schema";
import { copy, type Lang } from "@/lib/content";

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

const REAL = {
  pipeline: [
    { en: "Data", tr: "Veri" },
    { en: "Quality gate", tr: "Kalite kapısı" },
    { en: "Metric registry", tr: "Metrik kaydı" },
    { en: "Comparability engine", tr: "Karşılaştırılabilirlik motoru" },
    { en: "Analysis", tr: "Analiz" },
    { en: "Insight engine", tr: "İçgörü motoru" },
  ],
  pipelineOutputs: [
    { en: "Dashboard", tr: "Dashboard" },
    { en: "Presentation", tr: "Sunum" },
  ],

  // comparability-rules.md §2.1, "Revenue summed across ad platforms and
  // a platform-of-record" - exact figures from the file's own example.
  revenueExample: {
    parts: [
      { source: "GA4", value: 1.0 },
      { source: "Meta", value: 0.4 },
      { source: "Google Ads", value: 0.5 },
      { source: "Shopify", value: 1.0 },
    ],
    naiveSum: 2.9,
    trueTotal: 1.0,
  },

  comparabilityStates: [
    {
      id: "DIRECT",
      tone: "emerald",
      en: "Same counting unit, denominator, attribution window/model, date basis.",
      tr: "Aynı sayım birimi, payda, attribution penceresi/modeli, tarih tabanı.",
      example: {
        en: "Two exports from the same GA4 property, same date range.",
        tr: "Aynı GA4 property'sinden, aynı tarih aralığından iki dışa aktarım.",
      },
    },
    {
      id: "NORMALIZABLE",
      tone: "sky",
      en: "A pure unit/scale conversion - nothing else differs.",
      tr: "Sadece birim/ölçek dönüşümü - başka hiçbir şey farklı değil.",
      example: {
        en: "MER as spend÷revenue (Triple Whale) vs revenue÷spend (others) - a reciprocal.",
        tr: "MER: spend÷revenue (Triple Whale) ile revenue÷spend (diğerleri) - birbirinin tersi.",
      },
    },
    {
      id: "CONDITIONAL",
      tone: "amber",
      en: "Both valid, answering different questions - state each, never rank them.",
      tr: "İkisi de geçerli ama farklı soruları yanıtlıyor - her birini ayrı belirtin, sıralamayın.",
      example: {
        en: "Play Console ~70% D30 vs Firebase ~20% D30 - both correct.",
        tr: "Play Console ~%70 D30 ile Firebase ~%20 D30 - ikisi de doğru.",
      },
    },
    {
      id: "NOT_COMPARABLE",
      tone: "rose",
      en: "The definitions themselves diverge. Refuse, and name the mechanic.",
      tr: "Tanımların kendisi farklı. Reddedin ve mekanizmayı adlandırın.",
      example: {
        en: 'GA4 + Meta + Google Ads + Shopify revenue summed into one "Total Revenue."',
        tr: 'GA4 + Meta + Google Ads + Shopify gelirinin tek bir "Toplam Gelir"de toplanması.',
      },
    },
  ],

  // comparability-rules.md §4's own worked example, verbatim.
  refusalExample: {
    rule: { en: "attribution window mismatch", tr: "attribution penceresi uyuşmazlığı" },
    asked: { en: "rank Meta and LinkedIn by ROAS.", tr: "Meta ve LinkedIn'i ROAS'a göre sıralamak." },
    why: {
      en: "LinkedIn's account is on its recommended 90-day click / 90-day view window; Meta's default is 7-day click / 1-day view / 1-day engage. LinkedIn is crediting a 90× longer view window.",
      tr: "LinkedIn hesabı önerilen 90 günlük tıklama / 90 günlük görüntüleme penceresinde; Meta'nın varsayılanı 7 günlük tıklama / 1 günlük görüntüleme / 1 günlük etkileşim. LinkedIn 90 kat daha uzun bir görüntüleme penceresine kredi veriyor.",
    },
    canSay: {
      en: "each platform's ROAS trend against its own prior period is valid.",
      tr: "her platformun ROAS trendi kendi önceki dönemine karşı geçerli.",
    },
    fix: {
      en: "re-pull both at 7-day click / 1-day view, or settle it with a geo holdout - attributed ROAS will not answer this at any window.",
      tr: "ikisini de 7 günlük tıklama / 1 günlük görüntüleme ile yeniden çekin ya da bir geo holdout ile çözün - attribution'lu ROAS bunu hiçbir pencerede yanıtlamaz.",
    },
  },

  registryLevels: [
    {
      id: "EXACT",
      tone: "emerald",
      en: "A known, named field of an identified platform.",
      tr: "Tanımlanmış bir platformun bilinen, adlandırılmış alanı.",
      example: { en: "purchaseRevenue from a confirmed GA4 export.", tr: "Doğrulanmış bir GA4 dışa aktarımından purchaseRevenue." },
    },
    {
      id: "INFERRED",
      tone: "sky",
      en: "Very likely, but rests on a stated assumption.",
      tr: "Çok olası, ama belirtilmiş bir varsayıma dayanıyor.",
      example: {
        en: "A column called media_cost is almost certainly spend - which cost scope isn't established.",
        tr: "media_cost adlı bir sütun neredeyse kesin harcamadır - hangi maliyet kapsamı olduğu belirsiz.",
      },
    },
    {
      id: "AMBIGUOUS",
      tone: "amber",
      en: "Multiple definitions fit, nothing settles it. Never picked silently.",
      tr: "Birden çok tanım uyuyor, hiçbiri kesin değil. Asla sessizce seçilmez.",
      example: {
        en: 'A bare "revenue" column could be gross, net, purchase-only, or GMV.',
        tr: 'Sade bir "revenue" sütunu brüt, net, sadece satın alma ya da GMV olabilir.',
      },
    },
  ],

  qualityLevels: [
    {
      id: "BLOCKER",
      tone: "rose",
      en: "Stops the analysis of the affected slice.",
      tr: "Etkilenen dilimin analizini durdurur.",
      example: { en: "Primary key has duplicates, or a declared grain is violated.", tr: "Primary key'de tekrar var ya da beyan edilen grain ihlal edilmiş." },
    },
    {
      id: "WARNING",
      tone: "amber",
      en: "Computed, but labeled with the caveat inline.",
      tr: "Hesaplanır, ama uyarı satır içinde belirtilir.",
      example: { en: "5-50% nulls in an analysis column, or an unexplained 3σ spike.", tr: "Bir analiz sütununda %5-50 null ya da açıklanamayan 3σ sıçraması." },
    },
    {
      id: "INFO",
      tone: "neutral",
      en: "Noted once in the ingestion summary, not repeated.",
      tr: "Alım özetinde bir kez belirtilir, tekrarlanmaz.",
      example: { en: "Minor naming variance, rounding differences.", tr: "Küçük adlandırma farkı, yuvarlama farkları." },
    },
  ],

  // analysis-playbook.md's 8-question gate - 5 of the 8 shown, numbered
  // as in the source file (skipping 4, 6, 7, which are about
  // concentration / an open alternative explanation / evidence grading
  // rather than a straightforward pass-or-suppress question).
  insightQuestions: [
    { n: 1, en: "Is the change real?", tr: "Değişiklik gerçek mi?", ifNo: { en: "SUPPRESS - a data finding, not a business finding.", tr: "SUPPRESS - bu bir veri bulgusu, iş bulgusu değil." } },
    { n: 2, en: "Is it statistically supportable?", tr: "İstatistiksel olarak desteklenebilir mi?", ifNo: { en: "SUPPRESS - noise wearing a percentage sign.", tr: "SUPPRESS - yüzde işareti takmış gürültü." } },
    { n: 3, en: "Is it material?", tr: "Önemli mi?", ifNo: { en: "LOW at most, usually SUPPRESS.", tr: "En fazla LOW, genelde SUPPRESS." } },
    { n: 5, en: "Is it economically important?", tr: "Ekonomik olarak önemli mi?", ifNo: { en: "MEDIUM at most.", tr: "En fazla MEDIUM." } },
    { n: 8, en: "Is it actionable?", tr: "Aksiyona dönüştürülebilir mi?", ifNo: { en: "MEDIUM/LOW - real but not urgent.", tr: "MEDIUM/LOW - gerçek ama acil değil." } },
  ],

  insightLabels: [
    { id: "CRITICAL", tone: "rose", en: "Clears 1-3 and 5, actionable, no open alternative explanation.", tr: "1-3 ve 5'i geçer, aksiyona dönüştürülebilir, açık alternatif açıklama yok." },
    { id: "HIGH", tone: "amber", en: "Clears 1-3, actionable, but one open question stated explicitly.", tr: "1-3'ü geçer, aksiyona dönüştürülebilir ama bir açık soru açıkça belirtilmiş." },
    { id: "MEDIUM", tone: "sky", en: "Real and supported, not yet economically sized or actionable.", tr: "Gerçek ve destekli, ama henüz ekonomik olarak ölçeklendirilmemiş ya da aksiyona dönüştürülmemiş." },
    { id: "LOW", tone: "neutral", en: "Real, small, or a context/guardrail metric.", tr: "Gerçek, küçük ya da bir bağlam/koruma metriği." },
    { id: "SUPPRESS", tone: "ink", en: "Fails question 1, 2 or 3 - not shown as a business observation at all.", tr: "1, 2 ya da 3. soruyu geçemez - bir iş gözlemi olarak hiç gösterilmez." },
  ],

  // README's own 11-row table, condensed - name + the question it answers.
  templates: [
    { id: "A", en: "Executive Summary", tr: "Yönetici Özeti", q: { en: "Is growth healthy, efficient and profitable?", tr: "Büyüme sağlıklı, verimli ve kârlı mı?" } },
    { id: "B", en: "Growth & Acquisition", tr: "Büyüme ve Edinim", q: { en: "Where are we acquiring users and how efficiently?", tr: "Kullanıcıları nereden ve ne kadar verimli ediniyoruz?" } },
    { id: "C", en: "Lifecycle & CRM", tr: "Yaşam Döngüsü ve CRM", q: { en: "How effectively are we activating, retaining and monetizing existing users?", tr: "Mevcut kullanıcıları ne kadar etkili aktive ediyor, elde tutuyor ve gelire çeviriyoruz?" } },
    { id: "D", en: "All-in-One Growth Tower", tr: "Hepsi Bir Arada Büyüme Kulesi", q: { en: "What is the complete growth system telling us?", tr: "Tüm büyüme sistemi bize ne söylüyor?" } },
    { id: "E", en: "E-commerce & Revenue", tr: "E-ticaret ve Gelir", q: { en: "Are we selling well, and to whom?", tr: "İyi satıyor muyuz, kime satıyoruz?" } },
    { id: "F", en: "SaaS / Subscription", tr: "SaaS / Abonelik", q: { en: "Is the subscription base healthy and growing sustainably?", tr: "Abonelik tabanı sağlıklı mı ve sürdürülebilir şekilde büyüyor mu?" } },
    { id: "G", en: "Mobile App & Store", tr: "Mobil Uygulama ve Mağaza", q: { en: "How is the app performing in the stores, and are people sticking with it?", tr: "Uygulama mağazalarda nasıl performans gösteriyor, insanlar kalıyor mu?" } },
    { id: "H", en: "Web Analytics", tr: "Web Analitiği", q: { en: "How are visitors behaving on the site, independent of what brought them there?", tr: "Ziyaretçiler sitede nasıl davranıyor, onları oraya ne getirdiğinden bağımsız olarak?" } },
    { id: "I", en: "Single-Channel Deep Dive", tr: "Tek Kanal Derinlemesine İnceleme", q: { en: "How is this one channel actually performing, campaign by campaign?", tr: "Bu tek kanal kampanya kampanya gerçekte nasıl performans gösteriyor?" } },
    { id: "J", en: "Cross-Source Reconciliation", tr: "Kaynaklar Arası Uzlaştırma", q: { en: "Why don't these two platforms agree, and which one should I trust for what?", tr: "Bu iki platform neden uyuşmuyor, hangisine ne için güvenmeliyim?" } },
    { id: "K", en: "SEO & Organic Search", tr: "SEO ve Organik Arama", q: { en: "Is organic search actually bringing people in, and for what?", tr: "Organik arama gerçekten insan getiriyor mu, ne için?" } },
  ],
};

const T = {
  en: {
    eyebrow: "Lab / Data Analysis",
    heroTitle: "The hardest part of a dashboard isn't the arithmetic. It's knowing which numbers you're allowed to compare.",
    heroSub:
      "A Claude Code skill for marketing and growth data. Most of its work happens before any chart is drawn - classifying which numbers are safe to place side by side, and refusing the ones that aren't.",
    proof: ["17 tests passing", "11 dashboard templates", "No real account data in the repo"],

    pipelineNote:
      "Every stage runs once, on the same data - the dashboard and the presentation are two renderings of one analysis, never two separate passes that can quietly disagree with each other.",

    compEyebrow: "Comparability Engine",
    compTitle: "Every number is classified before it's shown.",
    compSub: "Four states, not a binary blocked/fine flag.",
    compWorkedLabel: "The reporting template when a rule fires - a real worked example",
    refusalNotComparable: "Not comparable",
    refusalAsked: "What was asked",
    refusalWhy: "Why it fails",
    refusalCanSay: "What I can say",
    refusalFix: "To make it comparable",
    revenueLabel: "Revenue by source",
    naiveSumLabel: 'Naive "Total Revenue"',
    trueTotalLabel: "Actual total (Shopify, system of record)",

    gateEyebrow: "Before any number is trusted",
    gateTitle: "Every metric is tagged. Every dataset is gated.",
    gateSub: "Two checks run before analysis starts: how confident the metric mapping is, and how severe any data-quality issue is.",
    registryLabel: "Metric mapping confidence",
    qualityLabel: "Data quality severity",

    insightEyebrow: "Insight Candidate Engine",
    insightTitle: "An 8-question gate decides what's worth showing.",
    insightSub: "Not a numeric score - a rule-based gate. Failing the first three suppresses a finding outright.",
    ifNoLabel: "If no:",
    suppressQuote: '"SUPPRESS is the point of this engine, not a side effect."',

    templatesEyebrow: "Dashboards & Presentations",
    templatesTitle: "11 templates. Only the ones your data actually supports.",
    templatesSub: "Two tiers - a blended, multi-domain dataset or one specific data shape. The same analysis renders as either a dashboard or a presentation.",
    templatesFilterNote: "Selection runs three filters in order: data shape → business question → available evidence - never a manually-declared vertical.",

    installEyebrow: "Install",
    installTitle: "Install",
    installSub: "Three ways in, all from the repository's own README.",
    tabMarketplace: "Marketplace",
    tabLocal: "Local plugin",
    tabSkillsCli: "Skills CLI",
    testNote: "17 tests pass on the current clone.",
    viewRepo: "Read the repository",

    faqEyebrow: "FAQ",
    ctaEyebrow: "OPEN SOURCE",
    ctaTitle: "Read what your own marketing data is actually telling you.",
  },
  tr: {
    eyebrow: "Lab / Veri Analizi",
    heroTitle: "Bir dashboard'un en zor kısmı aritmetik değil. Hangi sayıları karşılaştırmaya hakkınız olduğunu bilmek.",
    heroSub:
      "Pazarlama ve büyüme verisi için bir Claude Code skill'i. İşinin çoğu herhangi bir grafik çizilmeden önce olur - hangi sayıların yan yana konulmasının güvenli olduğunu sınıflandırmak, olmayanları reddetmek.",
    proof: ["17 test geçiyor", "11 dashboard şablonu", "Repoda gerçek hesap verisi yok"],

    pipelineNote:
      "Her aşama aynı veri üzerinde bir kez çalışır - dashboard ve sunum, birbirinden habersiz kalabilecek iki ayrı geçiş değil, tek bir analizin iki farklı render'ıdır.",

    compEyebrow: "Comparability Engine",
    compTitle: "Her sayı gösterilmeden önce sınıflandırılır.",
    compSub: "İkili engellendi/uygun bayrağı değil, dört durum.",
    compWorkedLabel: "Bir kural tetiklendiğinde kullanılan raporlama şablonu - gerçek bir örnek",
    refusalNotComparable: "Karşılaştırılamaz",
    refusalAsked: "Ne soruldu",
    refusalWhy: "Neden başarısız",
    refusalCanSay: "Söyleyebileceğim",
    refusalFix: "Karşılaştırılabilir yapmak için",
    revenueLabel: "Kaynağa göre gelir",
    naiveSumLabel: 'Saf "Toplam Gelir"',
    trueTotalLabel: "Gerçek toplam (Shopify, sistem kaydı)",

    gateEyebrow: "Bir sayıya güvenilmeden önce",
    gateTitle: "Her metrik etiketlenir. Her veri seti kapıdan geçer.",
    gateSub: "Analiz başlamadan önce iki kontrol çalışır: metrik eşlemesinin ne kadar güvenilir olduğu ve veri kalitesi sorununun ne kadar ciddi olduğu.",
    registryLabel: "Metrik eşleme güveni",
    qualityLabel: "Veri kalitesi ciddiyeti",

    insightEyebrow: "İçgörü Aday Motoru",
    insightTitle: "8 soruluk bir kapı neyin gösterilmeye değer olduğuna karar verir.",
    insightSub: "Sayısal bir skor değil - kural tabanlı bir kapı. İlk üçünü geçemeyen bir bulgu doğrudan bastırılır.",
    ifNoLabel: "Hayırsa:",
    suppressQuote: '"SUPPRESS bu motorun yan etkisi değil, amacıdır."',

    templatesEyebrow: "Dashboard'lar ve Sunumlar",
    templatesTitle: "11 şablon. Sadece verinizin gerçekten desteklediği olanlar.",
    templatesSub: "İki katman - karma, çok alanlı bir veri seti ya da tek bir spesifik veri şekli. Aynı analiz ister dashboard ister sunum olarak render edilir.",
    templatesFilterNote: "Seçim sırasıyla üç filtreden geçer: veri şekli → iş sorusu → mevcut kanıt - asla elle beyan edilmiş bir vertical değil.",

    installEyebrow: "Kurulum",
    installTitle: "Kurulum",
    installSub: "Reponun kendi README'sinden üç kurulum yolu.",
    tabMarketplace: "Marketplace",
    tabLocal: "Yerel eklenti",
    tabSkillsCli: "Skills CLI",
    testNote: "Mevcut klonda 17 test geçiyor.",
    viewRepo: "Repoyu okuyun",

    faqEyebrow: "SSS",
    ctaEyebrow: "AÇIK KAYNAK",
    ctaTitle: "Kendi pazarlama verinizin gerçekte ne söylediğini okuyun.",
  },
} as const;

const MARKETPLACE_CMD = `/plugin marketplace add ali-demirbas/dashboard-builder\n/plugin install dashboard-builder@dashboard-builder`;
const LOCAL_CMD = `git clone https://github.com/ali-demirbas/dashboard-builder.git\nclaude --plugin-dir ./dashboard-builder`;
const SKILLS_CLI_CMD = `npx skills add ali-demirbas/dashboard-builder --all`;
const TEST_CMD = `python3 -m unittest discover -s tests -v`;

const TONE: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-700",
  sky: "bg-sky-50 text-sky-700",
  amber: "bg-amber-50 text-amber-700",
  // Reuses the exact terracotta pair ChangeHistoryExplorerPage already
  // established for a negative/old value, so NOT_COMPARABLE and BLOCKER
  // read as this site's own existing "this is the bad one" color, not a
  // new one introduced just for this page.
  rose: "bg-[#fdf3f0] text-[#c65d3f]",
  neutral: "bg-paper-soft text-ink-500",
  ink: "bg-ink-900 text-white",
};

/* ---- Shared bits -------------------------------------------------- */

/** Same purely-decorative macOS-style chrome ChangeHistoryExplorerPage
    uses - not shared as a component yet, so redefined locally here, same
    as that file does. */
function BrowserChrome({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-paper shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_24px_48px_-16px_rgb(10_16_32/0.18)]">
      <div className="flex items-center gap-3 border-b border-line bg-paper-soft px-4 py-2.5">
        <div className="flex gap-1.5">
          <span aria-hidden className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span aria-hidden className="size-2.5 rounded-full bg-[#febc2e]" />
          <span aria-hidden className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 truncate rounded-md bg-paper px-3 py-1 text-center font-mono text-[11px] text-ink-400">
          {title}
        </div>
      </div>
      {children}
    </div>
  );
}

function StateChip({ tone, label }: { tone: string; label: string }) {
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold tracking-wide ${TONE[tone]}`}>
      {label}
    </span>
  );
}

function ComparabilityTable({ lang }: { lang: Lang }) {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-card border border-line bg-paper">
      {REAL.comparabilityStates.map((s) => (
        <div key={s.id} className="flex flex-col gap-2 p-5 text-left sm:flex-row sm:items-start sm:gap-6">
          <div className="shrink-0 sm:w-40">
            <StateChip tone={s.tone} label={s.id} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] leading-relaxed text-ink-700">{s[lang]}</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-400 italic">{s.example[lang]}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RefusalCard({
  t,
  rule,
  asked,
  why,
  canSay,
  fix,
}: {
  t: (typeof T)[Lang];
  rule: string;
  asked: string;
  why: string;
  canSay: string;
  fix: string;
}) {
  return (
    <div className="rounded-card border border-[#f0d9d0] bg-[#fdf6f3] p-5">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-[#c65d3f]">
        <span aria-hidden>⚠️</span> {t.refusalNotComparable} — {rule}
      </p>
      <dl className="mt-3.5 flex flex-col gap-2.5 text-[13px] leading-relaxed">
        <div>
          <dt className="font-medium text-ink-900">{t.refusalAsked}</dt>
          <dd className="text-ink-600">{asked}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink-900">{t.refusalWhy}</dt>
          <dd className="text-ink-600">{why}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink-900">{t.refusalCanSay}</dt>
          <dd className="text-ink-600">{canSay}</dd>
        </div>
        <div>
          <dt className="font-medium text-ink-900">{t.refusalFix}</dt>
          <dd className="text-ink-600">{fix}</dd>
        </div>
      </dl>
    </div>
  );
}

function RevenueBarsCard({ t }: { t: (typeof T)[Lang] }) {
  const { parts, naiveSum, trueTotal } = REAL.revenueExample;
  const max = Math.max(...parts.map((p) => p.value), naiveSum);
  return (
    <div className="p-5">
      <p className="text-[11px] font-medium tracking-wide text-ink-400 uppercase">{t.revenueLabel}</p>
      <div className="mt-3 flex flex-col gap-2">
        {parts.map((p) => (
          <div key={p.source} className="flex items-center gap-3">
            <span className="w-[70px] shrink-0 text-[12px] text-ink-600">{p.source}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-paper-soft">
              <div className="h-full rounded-full bg-primary-400" style={{ width: `${(p.value / max) * 100}%` }} />
            </div>
            <span className="w-12 shrink-0 text-right font-mono text-[12px] text-ink-700">${p.value.toFixed(1)}M</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 rounded-md bg-[#fdf3f0] px-3.5 py-2.5">
        <span className="text-[12.5px] font-medium text-[#c65d3f]">{t.naiveSumLabel}</span>
        <span className="shrink-0 font-mono text-sm font-semibold text-[#c65d3f] line-through decoration-1">
          ${naiveSum.toFixed(1)}M
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 rounded-md bg-emerald-50 px-3.5 py-2.5">
        <span className="text-[12.5px] font-medium text-emerald-700">{t.trueTotalLabel}</span>
        <span className="shrink-0 font-mono text-sm font-semibold text-emerald-700">~${trueTotal.toFixed(1)}M</span>
      </div>
    </div>
  );
}

/* ---- 01 · Hero ------------------------------------------------------ */
function Hero({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  const repo = c.primaryLinks.find((l) => l.href.includes("github.com")) ?? c.primaryLinks[0];
  return (
    <section className="relative isolate overflow-hidden bg-paper pt-16 pb-24 md:pt-20 md:pb-32">
      <PortraitContainer className="text-center">
        <Reveal>
          <p className="altor-eyebrow mb-5 text-ink-400">{t.eyebrow}</p>
          <h1 className="mx-auto max-w-3xl text-h1-fluid font-medium text-ink-950">{t.heroTitle}</h1>
        </Reveal>
        <Reveal delay={90} className="mt-6">
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-ink-950/65">{t.heroSub}</p>
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

        <Reveal delay={220} className="mx-auto mt-14 max-w-md text-left">
          <BrowserChrome title="dashboard-builder — comparability check">
            <RevenueBarsCard t={t} />
          </BrowserChrome>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 02 · Pipeline band ---------------------------------------------- */
function PipelineSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  return (
    <ProductSection tone="soft" space="band">
      <PortraitContainer>
        <Reveal className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-2.5">
          {REAL.pipeline.map((step) => (
            <div key={step.en} className="flex items-center gap-2.5">
              <span className="rounded-full border border-line-strong bg-paper px-3.5 py-1.5 text-[12.5px] font-medium text-ink-700">
                {step[lang]}
              </span>
              <ArrowRight aria-hidden className="size-3.5 shrink-0 text-ink-300" />
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2">
            {REAL.pipelineOutputs.map((o) => (
              <span
                key={o.en}
                className="rounded-full border border-primary-200 bg-primary-50 px-3.5 py-1.5 text-[12.5px] font-medium text-primary-700"
              >
                {o[lang]}
              </span>
            ))}
          </div>
        </Reveal>
        <Reveal delay={80} className="mx-auto mt-4 max-w-xl text-center">
          <p className="text-[12.5px] text-ink-500">{t.pipelineNote}</p>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 03 · Comparability Engine ---------------------------------------- */
function ComparabilityEngineSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  const ex = REAL.refusalExample;
  return (
    <ProductSection tone="paper" space="xl">
      <PortraitContainer>
        <ProductHeading eyebrow={t.compEyebrow} title={t.compTitle} body={t.compSub} align="center" />
        <Reveal delay={100} className="mx-auto mt-12 max-w-3xl">
          <ComparabilityTable lang={lang} />
        </Reveal>
        <Reveal delay={140} className="mx-auto mt-10 max-w-2xl text-left">
          <p className="mb-3 text-[12px] font-medium tracking-wide text-ink-400 uppercase">{t.compWorkedLabel}</p>
          <RefusalCard
            t={t}
            rule={ex.rule[lang]}
            asked={ex.asked[lang]}
            why={ex.why[lang]}
            canSay={ex.canSay[lang]}
            fix={ex.fix[lang]}
          />
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 04 · Metric registry + Quality gate ------------------------------ */
function RegistryAndGateSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  return (
    <ProductSection tone="soft" space="lg">
      <PortraitContainer>
        <ProductHeading eyebrow={t.gateEyebrow} title={t.gateTitle} body={t.gateSub} align="center" />
        <Reveal delay={100} className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 text-left md:grid-cols-2">
          <div className="rounded-card border border-line bg-paper p-5">
            <p className="text-[13px] font-medium text-ink-950">{t.registryLabel}</p>
            <div className="mt-4 flex flex-col gap-3.5">
              {REAL.registryLevels.map((l) => (
                <div key={l.id}>
                  <StateChip tone={l.tone} label={l.id} />
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-600">{l[lang]}</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-400 italic">{l.example[lang]}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-card border border-line bg-paper p-5">
            <p className="text-[13px] font-medium text-ink-950">{t.qualityLabel}</p>
            <div className="mt-4 flex flex-col gap-3.5">
              {REAL.qualityLevels.map((l) => (
                <div key={l.id}>
                  <StateChip tone={l.tone} label={l.id} />
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-600">{l[lang]}</p>
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-400 italic">{l.example[lang]}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 05 · Insight Candidate Engine ------------------------------------- */
function InsightEngineSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  return (
    <ProductSection tone="paper" space="lg">
      <PortraitContainer>
        <ProductHeading eyebrow={t.insightEyebrow} title={t.insightTitle} body={t.insightSub} align="center" />
        <Reveal delay={100} className="mx-auto mt-10 max-w-2xl text-left">
          <div className="flex flex-col divide-y divide-line rounded-card border border-line bg-paper">
            {REAL.insightQuestions.map((q) => (
              <div key={q.n} className="flex items-start gap-3 p-4">
                <span className="mt-0.5 shrink-0 font-mono text-[11px] text-ink-400">{String(q.n).padStart(2, "0")}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-ink-900">{q[lang]}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
                    {t.ifNoLabel} {q.ifNo[lang]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={140} className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-2.5 text-left sm:grid-cols-2">
          {REAL.insightLabels.map((l) => (
            <div key={l.id} className="rounded-lg border border-line bg-paper p-3.5">
              <StateChip tone={l.tone} label={l.id} />
              <p className="mt-1.5 text-[12px] leading-relaxed text-ink-600">{l[lang]}</p>
            </div>
          ))}
        </Reveal>
        <Reveal delay={180} className="mx-auto mt-8 max-w-2xl border-l-2 border-primary-600 py-1 pl-5 text-left">
          <p className="text-[13px] leading-relaxed text-ink-600 italic">{t.suppressQuote}</p>
        </Reveal>
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
        <Reveal delay={100} className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-2.5 text-left sm:grid-cols-2">
          {REAL.templates.map((tpl) => (
            <div key={tpl.id} className="flex items-start gap-3 rounded-lg border border-line bg-paper p-3.5">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ink-950 font-mono text-[11px] font-semibold text-white">
                {tpl.id}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-ink-900">{tpl[lang]}</p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-ink-500">{tpl.q[lang]}</p>
              </div>
            </div>
          ))}
        </Reveal>
        <Reveal delay={140} className="mx-auto mt-6 max-w-2xl text-center">
          <p className="text-[12.5px] text-ink-500">{t.templatesFilterNote}</p>
        </Reveal>
      </PortraitContainer>
    </ProductSection>
  );
}

/* ---- 07 · Install -------------------------------------------------------- */
function Install({ c, t, lang }: { c: SkillProductContent; t: (typeof T)[Lang]; lang: Lang }) {
  const repo = c.primaryLinks.find((l) => l.href.includes("github.com")) ?? c.primaryLinks[0];
  return (
    <ProductSection tone="paper" space="lg">
      <PortraitContainer className="max-w-2xl">
        <ProductHeading eyebrow={t.installEyebrow} title={t.installTitle} body={t.installSub} align="center" />
        <Reveal delay={100} className="mt-10">
          <CodeTabs
            tabs={[
              { id: "marketplace", label: t.tabMarketplace, code: MARKETPLACE_CMD },
              { id: "local", label: t.tabLocal, code: LOCAL_CMD },
              { id: "skills", label: t.tabSkillsCli, code: SKILLS_CLI_CMD },
            ]}
            copyLabel={lang === "en" ? "Copy" : "Kopyala"}
            copiedLabel={lang === "en" ? "Copied" : "Kopyalandı"}
          />
        </Reveal>
        <Reveal delay={140} className="mt-6 flex flex-wrap items-center gap-2 text-[12.5px] text-ink-500">
          <span className="rounded-md border border-line bg-paper px-2.5 py-1 font-mono text-[11.5px] text-ink-700">
            {TEST_CMD}
          </span>
          <span>{t.testNote}</span>
        </Reveal>
        {repo && (
          <Reveal delay={180} className="mt-6">
            <a
              href={repo.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              {t.viewRepo} →
            </a>
          </Reveal>
        )}
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

function Related({ c }: { c: SkillProductContent }) {
  if (c.related.length === 0) return null;
  return (
    <ProductSection tone="paper" space="lg">
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

export default function DashboardBuilderPage({ lang, content }: { lang: Lang; content: SkillProductContent }) {
  const copyT = copy[lang];
  const t = T[lang];
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
        <Hero c={content} t={t} />
        <PipelineSection t={t} lang={lang} />
        <ComparabilityEngineSection t={t} lang={lang} />
        <RegistryAndGateSection t={t} lang={lang} />
        <InsightEngineSection t={t} lang={lang} />
        <TemplatesSection t={t} lang={lang} />
        <Install c={content} t={t} lang={lang} />
        <Faq c={content} t={t} />
        <Related c={content} />
        <PageCta c={content} t={t} />
      </main>
      <SiteFooter t={copyT} lang={lang} />
    </>
  );
}
