import { ArrowRight, ArrowUpRight, Check, CircleAlert, Plus, Terminal } from "lucide-react";

import { SiteFooter, SiteHeader } from "@/components/Site";
import { PortraitContainer } from "@/components/ui/PortraitContainer";
import { Reveal } from "@/components/ui/Reveal";
import { TerminalCodeTabs } from "@/components/ui/TerminalCodeTabs";
import type { SkillProductContent } from "@/components/SkillProductPage";
import { JsonLdScript } from "@/components/ui/JsonLdScript";
import { breadcrumbList, howTo, softwareApplication } from "@/lib/schema";
import { copy, type Lang } from "@/lib/content";
import { clsx } from "@/lib/clsx";

/* Marketing Dashboard Builder's product page - RESKINNED (2026-09-05) to a
   supplied external reference ("Deterministic Engine": high-contrast
   editorial paper, obsidian ink, hairline outlines instead of shadows, and
   deep dark surfaces reserved for technical enclaves - CLI blocks and the
   worked refusal report), by explicit request, the third page in this
   session to take a supplied Stitch reference.

   A DECLARED, PAGE-SCOPED EXCEPTION, same protocol as Numerspace's and the
   Change History page's reskins - not a global token change. The
   reference's semantic palette maps exactly onto Tailwind's stock scale
   (emerald-500 IS #10b981, amber-500 IS #f59e0b, red-500 IS #ef4444,
   slate-500 IS #64748b, and each -50 surface matches too), so those are
   stock utilities; only the named ink (#0d0f12), slate text (#57606a),
   hairlines (#e2e4e8 / #cbd0d6) and the dark enclave (#090a0c / #121417 /
   #2d333b) are literal values. `ProductSection`/`ProductHeading`/
   `FaqAccordion`/`RelatedGrid` are not reused here for the same reason as
   the other two reskins: they carry this site's own ink/primary/blue
   tokens. SiteHeader/SiteFooter untouched.

   FONTS: the reference specified Manrope + JetBrains Mono, which were this
   site's two families when this page was built, so no substitution was
   needed then. The site moved to a single Inter family on 2026-09-05 and
   this page came with it - `font-sans`/`font-mono` are still the right
   classes, they just resolve somewhere new.

   DATA: `REAL` is carried over from the prior pass completely unchanged.
   Every value in it was verified against the cloned repository then (the
   comparability worked examples, the four states, the mapping levels, the
   quality severities, the 8-question gate, the 11 templates, the three
   install commands, and "17 tests passing" from an actual local run).

   FIVE THINGS FROM THE REFERENCE ARE DELIBERATELY NOT ADOPTED, each an
   unverifiable claim rather than a style choice:

   - "INCIDENT AUDIT #409" on the worked-refusal panel - an invented case
     id. Dropped; the panel keeps its real header only.
   - Per-source attribution annotations in the hero split ("Meta Ads
     (Attributed 7d/1d)", "Google Ads (Attributed 30d)"). The revenue
     example in comparability-rules.md §2.1 records source and amount, not
     each source's window; the 7d/1d figure belongs to a DIFFERENT worked
     example (the Meta vs LinkedIn one, further down this page). Sources
     render with the names the data actually carries.
   - Per-template "Requires: blended spend, net revenue, CAC, payback"
     lines and per-card "Tier 1: Blended" labels. `REAL.templates` records
     each template's letter, name and the question it answers - not its
     data requirements, and not which of the two tiers it belongs to. The
     two-tier fact stays where it is already verified: in the section's
     own subheading.
   - "100% Deterministic" as an invariant-status badge on the reconciled
     panel - a claim with no source. The panel states the actual figure
     and its system of record instead.
   - "Zero real account data retained" - the verified proof line is "No
     real account data in the repo", which is a statement about the
     repository, not about runtime retention. Kept as written.

   The +$1.9M overcount the hero panel names IS shown, because it is
   arithmetic on two verified figures (2.9 naive − 1.0 actual) and is
   computed here rather than hardcoded. */

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
    eyebrow: "Claude Code skill · Marketing & growth analytics",
    heroTitle: "The hardest part of a dashboard isn't the arithmetic. It's knowing which numbers you're allowed to compare.",
    heroSub:
      "A Claude Code skill for marketing and growth data. Most of its work happens before any chart is drawn: classifying which numbers can be placed side by side, and refusing the ones that can't.",
    ctaInstall: "Install via plugin CLI",
    ctaRepo: "View repository",
    proof: ["17 tests passing", "11 dashboard templates", "No real account data in the repo"],

    inspectorTitle: "dashboard-builder · comparability check",
    inspectorBadge: "Attribution conflict intercepted",
    naivePanelLabel: "Naive dashboard calculation",
    naivePanelStatus: "Invalid summation",
    naivePanelNote: "Independent platform reports summed directly, without resolving what each one is counting.",
    naiveTotalLabel: 'Reported "Total Revenue"',
    overcountLabel: "Overcount",
    naiveFootnote: "The platform-of-record only ever collected $1.0M.",
    auditPanelLabel: "Comparability engine",
    auditPanelStatus: "System of record enforced",
    auditPanelNote: "Ad-platform figures are claims about the same transactions, not additional revenue. Reconciled to the platform of record.",
    actualTotalLabel: "Actual total (Shopify, system of record)",
    auditFootnote: "Reported as one figure with its source named, not as a sum of four.",

    pipelineEyebrow: "Deterministic architecture",
    pipelineTitle: "The unified ingestion pipeline",
    pipelineNote:
      "Every stage runs once, on the same data. The dashboard and the presentation are two renderings of one analysis, not two passes that can quietly disagree.",

    compEyebrow: "Comparability engine",
    compTitle: "Every number is classified before it's shown.",
    compSub: "Four states, not a binary blocked/fine flag.",
    verifiedExample: "Verified example",
    compWorkedLabel: "The reporting template when a rule fires, on a real worked example",
    refusalNotComparable: "Not comparable",
    refusalAsked: "What was asked",
    refusalWhy: "Why it fails",
    refusalCanSay: "What I can say",
    refusalFix: "To make it comparable",

    gateEyebrow: "Pre-flight verification",
    gateTitle: "Every metric is tagged. Every dataset is gated.",
    gateSub: "Two checks run before analysis starts: how confident the metric mapping is, and how severe any data-quality issue is.",
    registryLabel: "Metric mapping confidence",
    qualityLabel: "Data quality severity",

    insightEyebrow: "Insight candidate engine",
    insightTitle: "An 8-question gate decides what's worth showing.",
    insightSub: "A rule-based gate, not a numeric score.",
    questionLabel: "Question",
    ifNoLabel: "If no",
    labelsHeading: "How a surviving finding is labelled",
    suppressQuote: '"SUPPRESS is the point of this engine, not a side effect."',

    templatesEyebrow: "Dashboards & presentations",
    templatesTitle: "11 templates. Only the ones your data actually supports.",
    templatesSub: "Two tiers: a blended, multi-domain dataset, or one specific data shape. The same analysis renders as a dashboard or a presentation.",
    templatesFilterNote: "Never a manually-declared vertical",
    templatesFilterFull: "Selection runs three filters in order: data shape → business question → available evidence.",

    installEyebrow: "Install",
    installTitle: "Three install paths, taken from the repository README.",
    tabMarketplace: "Marketplace",
    tabLocal: "Local plugin",
    tabSkillsCli: "Skills CLI",
    testNote: "17 tests pass on the current clone.",
    viewRepo: "Read the repository",

    faqEyebrow: "FAQ",
    faqTitle: "Frequently asked questions",

    relatedEyebrow: "Also in the Lab",
    relatedCta: "Open",

    ctaEyebrow: "Open source",
    ctaTitle: "Run it on your own marketing data.",
  },
  tr: {
    eyebrow: "Claude Code skill'i · Pazarlama ve büyüme analitiği",
    heroTitle: "Bir dashboard'un en zor kısmı aritmetik değil. Hangi sayıları karşılaştırmaya hakkın olduğunu bilmek.",
    heroSub:
      "Pazarlama ve büyüme verisi için bir Claude Code skill'i. İşinin çoğu grafik çizilmeden önce biter: hangi sayıların yan yana konabileceğini sınıflandırır, konamayacakları reddeder.",
    ctaInstall: "Plugin CLI ile kur",
    ctaRepo: "Repoyu görüntüle",
    proof: ["17 test geçiyor", "11 dashboard şablonu", "Repoda gerçek hesap verisi yok"],

    inspectorTitle: "dashboard-builder · karşılaştırılabilirlik kontrolü",
    inspectorBadge: "Attribution çakışması yakalandı",
    naivePanelLabel: "Saf dashboard hesaplaması",
    naivePanelStatus: "Geçersiz toplama",
    naivePanelNote: "Bağımsız platform raporları, her birinin neyi saydığı çözülmeden doğrudan toplanmış.",
    naiveTotalLabel: 'Raporlanan "Toplam Gelir"',
    overcountLabel: "Fazla sayım",
    naiveFootnote: "Kayıt sistemi olan platform yalnızca 1,0 milyon dolar tahsil etti.",
    auditPanelLabel: "Karşılaştırılabilirlik motoru",
    auditPanelStatus: "Kayıt sistemi esas alındı",
    auditPanelNote: "Reklam platformu rakamları aynı işlemlere dair iddialardır, ek gelir değil. Kayıt sistemine göre uzlaştırıldı.",
    actualTotalLabel: "Gerçek toplam (Shopify, kayıt sistemi)",
    auditFootnote: "Dördün toplamı olarak değil, kaynağı belirtilmiş tek bir rakam olarak raporlanır.",

    pipelineEyebrow: "Deterministik mimari",
    pipelineTitle: "Birleşik alım hattı",
    pipelineNote:
      "Her aşama aynı veri üzerinde bir kez çalışır. Dashboard ve sunum tek bir analizin iki farklı render'ı; sessizce birbirinden ayrışabilecek iki ayrı geçiş değil.",

    compEyebrow: "Karşılaştırılabilirlik motoru",
    compTitle: "Her sayı gösterilmeden önce sınıflandırılır.",
    compSub: "İkili engellendi/uygun bayrağı değil, dört durum.",
    verifiedExample: "Doğrulanmış örnek",
    compWorkedLabel: "Bir kural tetiklendiğinde kullanılan raporlama şablonu, gerçek bir örnek üzerinde",
    refusalNotComparable: "Karşılaştırılamaz",
    refusalAsked: "Ne soruldu",
    refusalWhy: "Neden başarısız",
    refusalCanSay: "Söyleyebileceğim",
    refusalFix: "Karşılaştırılabilir yapmak için",

    gateEyebrow: "Ön kontrol",
    gateTitle: "Her metrik etiketlenir. Her veri seti kapıdan geçer.",
    gateSub: "Analiz başlamadan önce iki kontrol çalışır: metrik eşlemesinin ne kadar güvenilir olduğu ve veri kalitesi sorununun ne kadar ciddi olduğu.",
    registryLabel: "Metrik eşleme güveni",
    qualityLabel: "Veri kalitesi ciddiyeti",

    insightEyebrow: "İçgörü aday motoru",
    insightTitle: "8 soruluk bir kapı neyin gösterilmeye değer olduğuna karar verir.",
    insightSub: "Sayısal bir skor değil, kural tabanlı bir kapı.",
    questionLabel: "Soru",
    ifNoLabel: "Hayırsa",
    labelsHeading: "Geçen bir bulgu nasıl etiketlenir",
    suppressQuote: '"SUPPRESS bu motorun yan etkisi değil, amacıdır."',

    templatesEyebrow: "Dashboard'lar ve sunumlar",
    templatesTitle: "11 şablon. Yalnızca verinizin desteklediği olanlar sunulur.",
    templatesSub: "İki katman: karma, çok alanlı bir veri seti ya da tek bir belirli veri şekli. Aynı analiz dashboard ya da sunum olarak render edilir.",
    templatesFilterNote: "Asla elle beyan edilmiş bir vertical değil",
    templatesFilterFull: "Seçim sırasıyla üç filtreden geçer: veri şekli → iş sorusu → mevcut kanıt.",

    installEyebrow: "Kurulum",
    installTitle: "Reponun README'sindeki üç kurulum yolu.",
    tabMarketplace: "Marketplace",
    tabLocal: "Yerel eklenti",
    tabSkillsCli: "Skills CLI",
    testNote: "Mevcut klonda 17 test geçiyor.",
    viewRepo: "Repoyu oku",

    faqEyebrow: "SSS",
    faqTitle: "Sıkça sorulan sorular",

    relatedEyebrow: "Diğer projeler",
    relatedCta: "Aç",

    ctaEyebrow: "Açık kaynak",
    ctaTitle: "Kendi pazarlama verinizde çalıştırın.",
  },
} as const;

const MARKETPLACE_CMD = `/plugin marketplace add ali-demirbas/dashboard-builder\n/plugin install dashboard-builder@dashboard-builder`;
const LOCAL_CMD = `git clone https://github.com/ali-demirbas/dashboard-builder.git\nclaude --plugin-dir ./dashboard-builder`;
const SKILLS_CLI_CMD = `npx skills add ali-demirbas/dashboard-builder --all`;
const TEST_CMD = `python3 -m unittest discover -s tests -v`;

/** The reference's semantic scale: strictly functional, never decorative.
    Each tone is one chip style plus the dot that precedes it. */
const TONE: Record<string, { chip: string; dot: string }> = {
  emerald: { chip: "border-emerald-200 bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  sky: { chip: "border-slate-200 bg-slate-100 text-slate-600", dot: "bg-slate-500" },
  amber: { chip: "border-amber-200 bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  rose: { chip: "border-red-200 bg-red-50 text-red-700", dot: "bg-red-500" },
  /* The quietest tone deliberately reads quieter than `sky`: INFO and LOW
     sit in the same lists as NORMALIZABLE and MEDIUM, and two filled greys
     side by side carry no hierarchy. Hollow plate, hollow dot. */
  neutral: { chip: "border-zinc-200 bg-white text-zinc-500", dot: "border border-zinc-400 bg-transparent" },
  ink: { chip: "border-[#2d333b] bg-[#0d0f12] text-white", dot: "bg-white" },
};

/* ---- Shared editorial primitives, scoped to this page ------------------ */

function Kicker({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={clsx("font-mono text-[11px] font-semibold tracking-[0.05em] uppercase", className ?? "text-[#57606a]")}>
      {children}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  align?: "center" | "start";
}) {
  return (
    <div className={clsx("max-w-2xl", align === "center" ? "mx-auto text-center" : "")}>
      <Kicker>{eyebrow}</Kicker>
      <h2 className="mt-2 text-[1.75rem] leading-[1.2] font-semibold tracking-[-0.02em] text-[#0d0f12] sm:text-[2.375rem] sm:leading-[1.2] sm:tracking-[-0.025em]">
        {title}
      </h2>
      {sub && <p className="mt-3 text-[17px] leading-relaxed text-[#57606a]">{sub}</p>}
    </div>
  );
}

function StateChip({ tone, label }: { tone: string; label: string }) {
  const s = TONE[tone] ?? TONE.neutral;
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[11px] font-semibold tracking-[0.05em]", s.chip)}>
      <span aria-hidden className={clsx("size-1.5 rounded-full", s.dot)} />
      {label}
    </span>
  );
}

/** A state / level card: the chip, the rule it stands for, and the
    reference file's own worked example beneath it. */
function StateCard({ tone, id, rule, example, exampleLabel }: { tone: string; id: string; rule: string; example: string; exampleLabel: string }) {
  return (
    <div className="flex flex-col justify-between border-[#e2e4e8] bg-white p-5 transition-colors hover:bg-[#f9f9f9]">
      <div>
        <StateChip tone={tone} label={id} />
        <p className="mt-3.5 text-[15px] leading-snug font-semibold text-[#0d0f12]">{rule}</p>
      </div>
      <div className="mt-4 rounded bg-[#f1f5f9] p-3">
        <span className="block font-mono text-[10px] font-semibold tracking-[0.05em] text-slate-500 uppercase">{exampleLabel}</span>
        <p className="mt-1 font-mono text-[11.5px] leading-relaxed text-[#57606a]">{example}</p>
      </div>
    </div>
  );
}

/* ---- 01 · Hero + the comparability inspector --------------------------- */
function Hero({ c, t, lang }: { c: SkillProductContent; t: (typeof T)[Lang]; lang: Lang }) {
  const repo = c.primaryLinks.find((l) => l.href.includes("github.com")) ?? c.primaryLinks[0];
  const { parts, naiveSum, trueTotal } = REAL.revenueExample;
  const overcount = naiveSum - trueTotal; // 2.9 - 1.0, computed from the two verified figures
  const money = (v: number) => (lang === "en" ? `$${v.toFixed(1)}M` : `${v.toFixed(1).replace(".", ",")} milyon $`);
  return (
    <section className="bg-white px-5 pt-14 pb-16 sm:px-8 md:pt-20 md:pb-24 lg:px-12">
      <PortraitContainer>
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Reveal className="inline-flex items-center gap-2 rounded-full bg-[#eeeeee] px-3 py-1">
            <span aria-hidden className="size-2 rounded-full bg-emerald-500" />
            <Kicker className="text-[#0d0f12]">{t.eyebrow}</Kicker>
          </Reveal>
          <Reveal delay={60} className="mt-6">
            <h1 className="text-[2.25rem] leading-[1.15] font-semibold tracking-[-0.025em] text-[#0d0f12] sm:text-[3.5rem] sm:leading-[1.1] sm:tracking-[-0.035em]">
              {t.heroTitle}
            </h1>
          </Reveal>
          <Reveal delay={100} className="mt-6">
            <p className="max-w-2xl text-[19px] leading-relaxed text-[#57606a]">{t.heroSub}</p>
          </Reveal>
          <Reveal delay={140} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#install"
              className="inline-flex items-center gap-2 rounded bg-[#0d0f12] px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-[#1e2227]"
            >
              <Terminal aria-hidden className="size-4" />
              {t.ctaInstall}
            </a>
            {repo && (
              <a
                href={repo.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded bg-[#f3f3f3] px-6 py-3 text-[15px] font-medium text-[#0d0f12] transition-colors hover:bg-[#e8e8e8]"
              >
                {t.ctaRepo}
                <ArrowUpRight aria-hidden className="size-4" />
              </a>
            )}
          </Reveal>
          <Reveal delay={180} className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {t.proof.map((item, i) => (
              <span key={item} className="inline-flex items-center gap-1.5 rounded bg-[#f3f3f3] px-2.5 py-1 font-mono text-[11px] text-[#57606a]">
                {i === 0 ? (
                  <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
                ) : (
                  <Check aria-hidden className="size-3 text-slate-400" />
                )}
                {item}
              </span>
            ))}
          </Reveal>
        </div>

        {/* The worked comparability case, as a split inspector: what a naive
            dashboard would report against what the engine reconciles to.
            Both figures and all four sources are comparability-rules.md
            §2.1's own; the overcount is computed from them. */}
        <Reveal delay={220} className="mx-auto mt-14 max-w-4xl">
          <div className="overflow-hidden rounded-xl border border-[#e2e4e8] bg-white shadow-[0_4px_16px_-2px_rgba(13,15,18,0.08)]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e2e4e8] bg-[#f3f3f3] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span aria-hidden className="size-2.5 rounded-full bg-red-400" />
                <span aria-hidden className="size-2.5 rounded-full bg-amber-400" />
                <span aria-hidden className="size-2.5 rounded-full bg-emerald-400" />
                <span className="ml-1.5 font-mono text-[12px] font-medium text-[#0d0f12]">{t.inspectorTitle}</span>
              </div>
              <span className="rounded bg-red-50 px-2 py-0.5 font-mono text-[10.5px] font-semibold tracking-[0.05em] text-red-600 uppercase">
                {t.inspectorBadge}
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left: the naive sum */}
              <div className="flex flex-col justify-between border-b border-[#e2e4e8] p-6 lg:border-r lg:border-b-0">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <Kicker>{t.naivePanelLabel}</Kicker>
                    <span className="shrink-0 rounded bg-red-50 px-2 py-0.5 font-mono text-[10.5px] font-medium text-red-600">{t.naivePanelStatus}</span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#57606a]">{t.naivePanelNote}</p>
                  <div className="mt-4 flex flex-col gap-2">
                    {parts.map((p) => (
                      <div key={p.source} className="flex items-center justify-between rounded bg-[#f3f3f3] px-3 py-2">
                        <span className="flex items-center gap-2 text-[13px] font-medium text-[#0d0f12]">
                          <span aria-hidden className="size-1.5 rounded-full bg-slate-400" />
                          {p.source}
                        </span>
                        <span className="font-mono text-[13px] font-semibold text-[#0d0f12] tabular-nums">{money(p.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-5 -mx-6 -mb-6 bg-red-50/60 p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <span className="text-[13px] font-medium text-red-700 line-through decoration-1">{t.naiveTotalLabel}</span>
                      <div className="font-mono text-2xl font-bold text-red-700 tabular-nums">{money(naiveSum)}</div>
                    </div>
                    <div className="text-right">
                      <Kicker className="text-red-700">{t.overcountLabel}</Kicker>
                      <div className="font-mono text-[13px] font-semibold text-red-700 tabular-nums">+{money(overcount)}</div>
                    </div>
                  </div>
                  <p className="mt-2 flex items-start gap-1.5 font-mono text-[11.5px] leading-relaxed text-red-700">
                    <CircleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
                    {t.naiveFootnote}
                  </p>
                </div>
              </div>
              {/* Right: the reconciled figure */}
              <div className="flex flex-col justify-between bg-[#f9f9f9] p-6">
                {/* Fills rather than floats: the left column is four source
                    rows tall, and a short card here left a hollow gap. */}
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <Kicker className="text-emerald-700">{t.auditPanelLabel}</Kicker>
                    <span className="shrink-0 rounded bg-emerald-50 px-2 py-0.5 font-mono text-[10.5px] font-medium text-emerald-700">
                      {t.auditPanelStatus}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#57606a]">{t.auditPanelNote}</p>
                  <div className="mt-4 flex-1 rounded bg-white p-3">
                    <StateChip tone="rose" label="NOT_COMPARABLE" />
                    <p className="mt-2 font-mono text-[11.5px] leading-relaxed text-[#57606a]">
                      {REAL.comparabilityStates[3].example[lang]}
                    </p>
                  </div>
                </div>
                <div className="mt-5 -mx-6 -mb-6 bg-emerald-50/70 p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <span className="text-[13px] font-medium text-[#0d0f12]">{t.actualTotalLabel}</span>
                      <div className="font-mono text-2xl font-bold text-[#0d0f12] tabular-nums">~{money(trueTotal)}</div>
                    </div>
                  </div>
                  <p className="mt-2 flex items-start gap-1.5 font-mono text-[11.5px] leading-relaxed text-emerald-700">
                    <Check aria-hidden className="mt-px size-3.5 shrink-0" />
                    {t.auditFootnote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 02 · The pipeline ------------------------------------------------- */
function PipelineSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  return (
    <section className="border-y border-[#e2e4e8] bg-[#f9f9f9] px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer>
        <SectionHeading eyebrow={t.pipelineEyebrow} title={t.pipelineTitle} sub={t.pipelineNote} />
        <Reveal delay={100} className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {REAL.pipeline.map((step, i) => (
            <div key={step.en} className="rounded border border-[#e2e4e8] bg-white p-4">
              <span className="font-mono text-[11px] font-semibold text-slate-400 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-1.5 text-[13.5px] leading-snug font-semibold text-[#0d0f12]">{step[lang]}</p>
            </div>
          ))}
        </Reveal>
        <Reveal delay={140} className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <span className="font-mono text-[11px] text-slate-400">→</span>
          {REAL.pipelineOutputs.map((o) => (
            <span key={o.en} className="rounded bg-[#0d0f12] px-3.5 py-1.5 font-mono text-[12px] font-medium text-white">
              {o[lang]}
            </span>
          ))}
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 03 · Comparability engine ----------------------------------------- */
function ComparabilityEngineSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  const r = REAL.refusalExample;
  return (
    <section className="bg-white px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer>
        <SectionHeading eyebrow={t.compEyebrow} title={t.compTitle} sub={t.compSub} />
        <Reveal delay={100} className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-[#e2e4e8] bg-[#e2e4e8] sm:grid-cols-2 lg:grid-cols-4">
          {REAL.comparabilityStates.map((s) => (
            <StateCard key={s.id} tone={s.tone} id={s.id} rule={s[lang]} example={s.example[lang]} exampleLabel={t.verifiedExample} />
          ))}
        </Reveal>

        {/* The refusal report, in the dark "technical enclave" the
            reference reserves for tool output. */}
        <Reveal delay={140} className="mt-8 overflow-hidden rounded-xl border border-[#2d333b] bg-[#090a0c]">
          <div className="flex flex-wrap items-center gap-2 border-b border-[#2d333b] bg-[#121417] px-5 py-3">
            <CircleAlert aria-hidden className="size-4 shrink-0 text-amber-400" />
            <span className="font-mono text-[11.5px] font-medium tracking-[0.05em] text-white uppercase">{t.compWorkedLabel}</span>
          </div>
          <div className="p-5 sm:p-6">
            <p className="flex flex-wrap items-center gap-2 font-mono text-[13px] font-semibold text-amber-400">
              Δ {t.refusalNotComparable.toUpperCase()} — {r.rule[lang].toUpperCase()}
            </p>
            <dl className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              {[
                { label: t.refusalAsked, value: r.asked[lang], tone: "text-white" },
                { label: t.refusalWhy, value: r.why[lang], tone: "text-white" },
                { label: t.refusalCanSay, value: r.canSay[lang], tone: "text-white" },
                { label: t.refusalFix, value: r.fix[lang], tone: "text-emerald-400" },
              ].map((row) => (
                <div key={row.label} className="rounded bg-[#121417] p-4">
                  <dt className="font-mono text-[10px] font-semibold tracking-[0.05em] text-slate-500 uppercase">{row.label}</dt>
                  <dd className={clsx("mt-1.5 font-mono text-[12.5px] leading-relaxed", row.tone)}>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 04 · Registry + quality gate -------------------------------------- */
function RegistryAndGateSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  const panels = [
    { label: t.registryLabel, rows: REAL.registryLevels },
    { label: t.qualityLabel, rows: REAL.qualityLevels },
  ];
  return (
    <section className="border-y border-[#e2e4e8] bg-[#f9f9f9] px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer>
        <SectionHeading eyebrow={t.gateEyebrow} title={t.gateTitle} sub={t.gateSub} />
        <Reveal delay={100} className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {panels.map((panel) => (
            <div key={panel.label} className="overflow-hidden rounded-lg border border-[#e2e4e8] bg-white">
              <div className="border-b border-[#e2e4e8] bg-[#f9f9f9] px-5 py-3">
                <Kicker>{panel.label}</Kicker>
              </div>
              <div className="divide-y divide-[#e2e4e8]">
                {panel.rows.map((row) => (
                  <div key={row.id} className="p-5">
                    <StateChip tone={row.tone} label={row.id} />
                    <p className="mt-2.5 text-[14px] leading-snug font-medium text-[#0d0f12]">{row[lang]}</p>
                    <p className="mt-1.5 font-mono text-[11.5px] leading-relaxed text-[#57606a]">{row.example[lang]}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 05 · Insight candidate engine ------------------------------------- */
function InsightEngineSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  return (
    <section className="bg-white px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer>
        <SectionHeading eyebrow={t.insightEyebrow} title={t.insightTitle} sub={t.insightSub} />
        <Reveal delay={100} className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-lg border border-[#e2e4e8]">
          {REAL.insightQuestions.map((q, i) => (
            <div
              key={q.n}
              className={clsx(
                "flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-5",
                i % 2 === 1 ? "bg-[#f9f9f9]" : "bg-white",
                i > 0 && "border-t border-[#e2e4e8]",
              )}
            >
              <span className="shrink-0 font-mono text-[11px] font-semibold text-slate-400 tabular-nums">
                Q{q.n}
              </span>
              <p className="flex-1 text-[15px] font-semibold text-[#0d0f12]">{q[lang]}</p>
              {/* A fixed column, not max-width: the consequences are what
                  the reader scans down, so they have to start on one axis. */}
              <div className="flex shrink-0 items-baseline gap-2 sm:w-[52%]">
                <span className="font-mono text-[10px] font-semibold tracking-[0.05em] whitespace-nowrap text-slate-400 uppercase">
                  {t.ifNoLabel}
                </span>
                <span className="font-mono text-[11.5px] leading-relaxed text-[#57606a]">{q.ifNo[lang]}</span>
              </div>
            </div>
          ))}
        </Reveal>

        <Reveal delay={140} className="mx-auto mt-8 max-w-3xl">
          <Kicker>{t.labelsHeading}</Kicker>
          <div className="mt-3 flex flex-col gap-2">
            {REAL.insightLabels.map((l) => (
              <div key={l.id} className="flex flex-col gap-2 rounded border border-[#e2e4e8] bg-white p-3.5 sm:flex-row sm:items-center sm:gap-4">
                <span className="shrink-0 sm:w-28">
                  <StateChip tone={l.tone} label={l.id} />
                </span>
                <p className="text-[13px] leading-relaxed text-[#57606a]">{l[lang]}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={180} className="mx-auto mt-8 max-w-3xl border-l-2 border-[#0d0f12] py-1 pl-5">
          <p className="text-[15px] leading-relaxed font-medium text-[#0d0f12]">{t.suppressQuote}</p>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 06 · Dashboards & presentations ----------------------------------- */
function TemplatesSection({ t, lang }: { t: (typeof T)[Lang]; lang: Lang }) {
  return (
    <section className="border-y border-[#e2e4e8] bg-[#f9f9f9] px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <SectionHeading eyebrow={t.templatesEyebrow} title={t.templatesTitle} sub={t.templatesSub} align="start" />
          <span className="shrink-0 rounded bg-[#e8e8e8] px-3 py-1.5 font-mono text-[11.5px] text-[#0d0f12]">
            {t.templatesFilterNote}
          </span>
        </div>
        <Reveal delay={100} className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {REAL.templates.map((tpl) => (
            <div key={tpl.id} className="rounded-lg border border-[#e2e4e8] bg-white p-5 transition-shadow hover:shadow-[0_4px_16px_-2px_rgba(13,15,18,0.08)]">
              <span className="flex size-6 items-center justify-center rounded-full bg-[#0d0f12] font-mono text-[11px] font-bold text-white">
                {tpl.id}
              </span>
              <h3 className="mt-3 text-[15px] font-semibold text-[#0d0f12]">{tpl[lang]}</h3>
              <p className="mt-1 text-[13.5px] leading-relaxed text-[#57606a]">“{tpl.q[lang]}”</p>
            </div>
          ))}
        </Reveal>
        <Reveal delay={140} className="mt-6">
          <p className="font-mono text-[11.5px] text-slate-500">{t.templatesFilterFull}</p>
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 07 · Install ------------------------------------------------------- */
function Install({ c, t, lang }: { c: SkillProductContent; t: (typeof T)[Lang]; lang: Lang }) {
  const repo = c.primaryLinks.find((l) => l.href.includes("github.com")) ?? c.primaryLinks[0];
  return (
    <section id="install" className="scroll-mt-24 bg-white px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer className="max-w-[768px]">
        <SectionHeading eyebrow={t.installEyebrow} title={t.installTitle} />
        <Reveal delay={100} className="mt-10">
          <TerminalCodeTabs
            tabs={[
              { id: "marketplace", label: t.tabMarketplace, code: MARKETPLACE_CMD },
              { id: "local", label: t.tabLocal, code: LOCAL_CMD },
              { id: "skills", label: t.tabSkillsCli, code: SKILLS_CLI_CMD },
            ]}
            copyLabel={lang === "en" ? "Copy" : "Kopyala"}
            copiedLabel={lang === "en" ? "Copied" : "Kopyalandı"}
          />
        </Reveal>
        <Reveal delay={140} className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#e2e4e8] bg-[#f9f9f9] p-4">
          {/* `code`, not `span`: a shell command belongs on the character grid,
              and since the 2026-09-05 single-family move that grid is carried by
              the element, not by `font-mono` (which is now proportional Inter).
              Semantically right anyway. */}
          <code className="text-[11.5px] text-[#0d0f12]">{TEST_CMD}</code>
          <span className="flex items-center gap-1.5 font-mono text-[11.5px] font-semibold text-emerald-700">
            <Check aria-hidden className="size-3.5" />
            {t.testNote}
          </span>
        </Reveal>
        {repo && (
          <Reveal delay={180} className="mt-6">
            <a
              href={repo.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0d0f12] underline decoration-[#cbd0d6] underline-offset-4 transition-colors hover:decoration-[#0d0f12]"
            >
              {t.viewRepo} →
            </a>
          </Reveal>
        )}
      </PortraitContainer>
    </section>
  );
}

/* ---- 08 · FAQ - hairline accordion, not the shared FaqAccordion ---------
   Same accessible <details>/<summary> pattern; the shared component's
   open/hover states are this site's blue/ink tokens, which would fight
   this page's palette. Content is untouched `content.faq`. */
function Faq({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  if (!c.faq || c.faq.length === 0) return null;
  return (
    <section className="border-y border-[#e2e4e8] bg-[#f9f9f9] px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer className="max-w-[768px]">
        <SectionHeading eyebrow={t.faqEyebrow} title={c.faqTitle ?? t.faqTitle} />
        <Reveal delay={80} className="mt-8 border-t border-[#e2e4e8]">
          {c.faq.map((item) => (
            <details key={item.id} className="group border-b border-[#e2e4e8] py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 marker:content-none">
                <span className="text-[15px] font-medium text-[#0d0f12]">{item.q}</span>
                <span aria-hidden className="shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-45">
                  <Plus className="size-4" />
                </span>
              </summary>
              <p className="mt-2.5 text-[14px] leading-relaxed text-[#57606a]">{item.a}</p>
            </details>
          ))}
        </Reveal>
      </PortraitContainer>
    </section>
  );
}

/* ---- 09 · Other Lab projects -------------------------------------------- */
function Related({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  const items = c.related;
  if (items.length === 0) return null;
  return (
    <section className="bg-white px-5 py-16 sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer>
        <SectionHeading eyebrow={t.relatedEyebrow} title={c.relatedTitle} />
        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.href} delay={i * 60}>
              <a
                href={item.href}
                className="group flex h-full flex-col justify-between rounded-lg border border-[#e2e4e8] bg-white p-5 transition-shadow hover:shadow-[0_4px_16px_-2px_rgba(13,15,18,0.08)]"
              >
                <div>
                  <p className="text-[15px] font-semibold text-[#0d0f12]">{item.name}</p>
                  {item.desc ? <p className="mt-2 text-[13px] leading-relaxed text-[#57606a]">{item.desc}</p> : null}
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  {item.proof ? (
                    <span className="font-mono text-[11px] text-slate-400 tabular-nums">{item.proof}</span>
                  ) : (
                    <span />
                  )}
                  <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400 transition-colors group-hover:text-[#0d0f12]">
                    {t.relatedCta}
                    <ArrowRight aria-hidden className="size-3" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </PortraitContainer>
    </section>
  );
}

/* ---- 10 · Closing ------------------------------------------------------- */
function PageCta({ c, t }: { c: SkillProductContent; t: (typeof T)[Lang] }) {
  const repo = c.primaryLinks.find((l) => l.href.includes("github.com")) ?? c.primaryLinks[0];
  return (
    <section className="bg-[#090a0c] px-5 py-20 text-center sm:px-8 md:py-24 lg:px-12">
      <PortraitContainer className="max-w-[768px]">
        <Kicker className="text-slate-500">{t.ctaEyebrow}</Kicker>
        <h2 className="mx-auto mt-3 max-w-2xl text-[1.75rem] leading-[1.2] font-semibold tracking-[-0.025em] text-white sm:text-[2.375rem]">
          {t.ctaTitle}
        </h2>
        {repo && (
          <div className="mt-8 flex justify-center">
            <a
              href={repo.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded bg-white px-6 py-3 text-[15px] font-semibold text-[#0d0f12] transition-colors hover:bg-[#e8e8e8]"
            >
              {t.ctaRepo}
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
          </div>
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
      <main className="font-sans">
        <Hero c={content} t={t} lang={lang} />
        <PipelineSection t={t} lang={lang} />
        <ComparabilityEngineSection t={t} lang={lang} />
        <RegistryAndGateSection t={t} lang={lang} />
        <InsightEngineSection t={t} lang={lang} />
        <TemplatesSection t={t} lang={lang} />
        <Install c={content} t={t} lang={lang} />
        <Faq c={content} t={t} />
        <Related c={content} t={t} />
        <PageCta c={content} t={t} />
      </main>
      <SiteFooter t={copyT} lang={lang} />
    </>
  );
}
