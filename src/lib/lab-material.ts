/* The Lab's REAL MATERIAL, in one place.

   Each block below was the private `const REAL` of one Lab product page
   (DashboardBuilderPage, ChangeHistoryExplorerPage, NumerspacePage) and is
   moved here unchanged so the Lab index can show the same real records in
   its hero window and its project sections without keeping a second copy
   that would drift. The provenance comments stay on each page, next to the
   sections that render the data; the page reads `const REAL = X_REAL`, so
   every `REAL.foo` reference there is untouched.

   Nothing here is invented: the dashboard templates are the README's own
   11-row table; the change-history rows are the tool's own demo dataset;
   the Numerspace categories and counts were read off numerspace.com and
   sum to 97; the calorie example is the real formula with its real result.
   Plain data, no imports - safe for any server component to read. */

export const DASHBOARD_REAL = {
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

export const CHANGE_HISTORY_REAL = {
  // `user` is the export's own user_name per change, read from the demo
  // file (examples/dashboard-demo.html); `automated` marks the one row the
  // demo attributes to a system account rather than a person.
  explorerRows: [
    { campaign: "Campaign Alpha", account: "Account A", adGroup: "—", user: "User A", category: "Budget", en: { date: "Aug 1, 2026 · 9:12 AM", old: "150,000", new: "200,000" }, tr: { date: "1 Ağu 2026 · 09:12", old: "150.000", new: "200.000" } },
    { campaign: "Campaign Alpha", account: "Account A", adGroup: "Ad Group 1", user: "User A", category: "Bidding", en: { date: "Aug 1, 2026 · 9:15 AM", old: "3.50", new: "4.20" }, tr: { date: "1 Ağu 2026 · 09:15", old: "3,50", new: "4,20" } },
    { campaign: "Campaign Beta", account: "Account A", adGroup: "—", user: "ads-budget-system", automated: true, category: "Budget", en: { date: "Aug 3, 2026 · 2:22 PM", old: "80,000", new: "100,000" }, tr: { date: "3 Ağu 2026 · 14:22", old: "80.000", new: "100.000" } },
    { campaign: "Campaign Alpha", account: "Account A", adGroup: "—", user: "User A", category: "Status", en: { date: "Aug 4, 2026 · 8:40 AM", old: "Enabled", new: "Paused" }, tr: { date: "4 Ağu 2026 · 08:40", old: "Etkin", new: "Duraklatıldı" } },
    { campaign: "Campaign Gamma", account: "Account B", adGroup: "—", user: "User C", category: "Budget", en: { date: "Aug 6, 2026 · 10:00 AM", old: "50,000", new: "45,000" }, tr: { date: "6 Ağu 2026 · 10:00", old: "50.000", new: "45.000" } },
    { campaign: "Campaign Alpha", account: "Account B", adGroup: "—", user: "User A", category: "Status", en: { date: "Aug 17, 2026 · 9:45 AM", old: "Enabled", new: "Paused" }, tr: { date: "17 Ağu 2026 · 09:45", old: "Etkin", new: "Duraklatıldı" } },
  ],
  // Each campaign's real days_since_last_change_at_generation, from the
  // demo file's own "untouched" array - a fact the tool itself computes
  // and states this way, not a relative "ago" claim about today.
  lastChanges: [
    { campaign: "Campaign Beta", account: "Account A", days: 14 },
    { campaign: "Campaign Alpha", account: "Account A", days: 13 },
    { campaign: "Campaign Gamma", account: "Account B", days: 11 },
    { campaign: "Campaign Delta", account: "Account B", days: 10 },
    { campaign: "Campaign Alpha", account: "Account B", days: 0 },
  ],
  accountActivity: [
    { account: "Account A", count: 6 },
    { account: "Account B", count: 4 },
  ],
  totalChanges: 10,
  period: { en: "Aug 1 - 17, 2026", tr: "1 - 17 Ağustos 2026" },
  magnitudeRules: [
    { label: { en: "Budget change", tr: "Bütçe değişimi" }, value: 50 },
    { label: { en: "Target CPA change", tr: "Target CPA değişimi" }, value: 30 },
    { label: { en: "Target ROAS change", tr: "Target ROAS değişimi" }, value: 30 },
    { label: { en: "Bid/CPC change", tr: "Teklif/TBM değişimi" }, value: 50 },
  ],
  structuralRules: [
    { label: { en: "Campaign paused", tr: "Kampanya duraklatıldı" }, on: true },
    { label: { en: "Campaign removed", tr: "Kampanya kaldırıldı" }, on: true },
    { label: { en: "Ad group removed", tr: "Reklam grubu kaldırıldı" }, on: true },
    { label: { en: "Campaign enabled", tr: "Kampanya etkinleştirildi" }, on: false },
  ],
};

export const NUMERSPACE_REAL = {
  calorie: {
    title: { en: "Daily Calorie Calculator", tr: "Günlük Kalori İhtiyacı Hesaplayıcı" },
    formula: {
      en: "BMR = 10 × weight + 6.25 × height − 5 × age + 5 (male) or −161 (female)",
      tr: "BMR = 10 × kilo + 6,25 × boy − 5 × yaş + 5 (erkek) ya da −161 (kadın)",
    },
    inputs: [
      { label: { en: "Gender", tr: "Cinsiyet" }, value: { en: "Male", tr: "Erkek" } },
      { label: { en: "Age", tr: "Yaş" }, value: "30" },
      { label: { en: "Height (cm)", tr: "Boy (cm)" }, value: "180" },
      { label: { en: "Weight (kg)", tr: "Kilo (kg)" }, value: "80" },
      { label: { en: "Activity", tr: "Aktivite" }, value: { en: "Sedentary", tr: "Hareketsiz" } },
    ] as { label: { en: string; tr: string }; value: string | { en: string; tr: string } }[],
    bmr: { en: "1,780", tr: "1.780" },
    resultLabel: { en: "Daily calorie need (×1.20)", tr: "Günlük kalori ihtiyacı (×1,20)" },
    result: { en: "2,136 kcal/day", tr: "2.136 kcal/gün" },
  },
  /** All 13, with the real per-category tool count. `featured` marks the
      8 shown on this page - the rest are one click away at the real site,
      not reproduced here (this is a project page, not the catalogue). */
  categories: [
    { en: "Finance & Investment", tr: "Finans & Yatırım", count: 8, featured: true, ex: { en: ["Loan Calculator", "Deposit Interest Calculator", "Rent Increase Calculator"], tr: ["Kredi Hesaplama", "Mevduat Getirisi Hesaplama", "Kira Artış Hesaplama"] } },
    { en: "Health & Fitness", tr: "Sağlık & Fitness", count: 15, featured: true, ex: { en: ["BMI Calculator", "Daily Calorie Calculator", "Ideal Weight Calculator"], tr: ["Vücut Kitle İndeksi Hesaplama", "Günlük Kalori İhtiyacı Hesaplama", "İdeal Kilo Hesaplama"] } },
    { en: "Work & Career", tr: "İş & Kariyer", count: 7, featured: true, ex: { en: ["Salary Calculator", "Annual Leave Calculator", "Overtime Calculator"], tr: ["Maaş Hesaplama", "Yıllık İzin Hesaplama", "Fazla Mesai Hesaplama"] } },
    { en: "Time & Date", tr: "Zaman & Tarih", count: 8, featured: true, ex: { en: ["Age Calculator", "Date Difference Calculator", "Time Difference Calculator"], tr: ["Yaş Hesaplama", "Tarih Farkı Hesaplama", "Saat Farkı Hesaplama"] } },
    { en: "Marketing & Analytics", tr: "Pazarlama & Analitik", count: 17, featured: true, ex: { en: ["ROAS Calculator", "Conversion Rate Calculator", "CAC Calculator"], tr: ["ROAS Hesaplama", "CR Hesaplama", "CAC Hesaplama"] } },
    { en: "Math & Converters", tr: "Matematik & Çeviri", count: 13, featured: true, ex: { en: ["Percentage Calculator", "Standard Deviation", "Basic Calculator"], tr: ["Yüzde Hesaplama", "Standart Sapma Hesaplama", "Hesap Makinesi"] } },
    { en: "Education & Productivity", tr: "Eğitim & Üretkenlik", count: 4, featured: false, ex: { en: ["GPA Calculator", "Reading Time Calculator", "Writing Speed Test"], tr: ["Not Ortalaması Hesaplama", "Okuma Süresi Hesaplama", "Yazma Hızı Testi"] } },
    { en: "Home & Living", tr: "Ev & Yaşam", count: 6, featured: true, ex: { en: ["Paint Calculator", "Electricity Bill Calculator", "TV Size Calculator"], tr: ["Boya Hesaplama", "Elektrik Faturası Hesaplama", "TV Boyut Hesaplama"] } },
    { en: "Clothing & Sizing", tr: "Giyim & Beden", count: 4, featured: false, ex: { en: ["Bra Size Calculator", "Belt Size Calculator", "Jacket Size Calculator"], tr: ["Sütyen Bedeni Hesaplama", "Kemer Ölçüsü Hesaplama", "Ceket Bedeni Hesaplama"] } },
    { en: "Pets", tr: "Evcil Hayvan", count: 4, featured: false, ex: { en: ["Dog Age Calculator", "Cat Age Calculator", "Cat Pregnancy Calculator"], tr: ["Köpek Yaşı Hesaplama", "Kedi Yaşı Hesaplama", "Kedi Gebelik Hesaplama"] } },
    { en: "Vehicle & Travel", tr: "Araç & Seyahat", count: 2, featured: false, ex: { en: ["Fuel Consumption Calculator", "Distance Calculator"], tr: ["Yakıt Tüketimi Hesaplama", "Mesafe Hesaplama"] } },
    { en: "Faith", tr: "İnanç", count: 4, featured: false, ex: { en: ["Prayer Times", "Zakat Calculator", "Ramadan Schedule"], tr: ["Namaz Vakitleri", "Zekat Hesaplama", "İmsakiye"] } },
    { en: "Astrology", tr: "Astroloji", count: 5, featured: false, ex: { en: ["Zodiac Compatibility", "Rising Sign Calculator", "Chinese Zodiac Calculator"], tr: ["Burç Uyumu Hesaplama", "Yükselen Burç Hesaplama", "Çin Burcu Hesaplama"] } },
  ],
};
