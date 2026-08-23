/* Marketing calculator tools. Formulas only - no copied text from any
   external calculator site. Each tool: a slug, EN/TR labels, numeric
   inputs, and a compute function returning a labeled result. */

export type Lang = "en" | "tr";

export type CalcInput = {
  key: string;
  label: { en: string; tr: string };
  unit?: string;
  placeholder?: string;
};

export type CalcResult = { label: { en: string; tr: string }; value: string; unit?: string };

export type Calculator = {
  slug: string;
  title: { en: string; tr: string };
  desc: { en: string; tr: string };
  inputs: CalcInput[];
  compute: (v: Record<string, number>) => CalcResult[];
};

const pct = (n: number) => (Number.isFinite(n) ? `${(n * 100).toFixed(2)}%` : "-");
const num = (n: number, d = 2) => (Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: d }) : "-");
const money = (n: number) => (Number.isFinite(n) ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-");

export const CALCULATORS: readonly Calculator[] = [
  {
    slug: "roas",
    title: { en: "ROAS Calculator", tr: "ROAS Hesaplama" },
    desc: { en: "Return on ad spend: revenue generated per unit of ad spend.", tr: "Reklam harcaması başına elde edilen gelir." },
    inputs: [
      { key: "revenue", label: { en: "Revenue from ads", tr: "Reklamdan gelen gelir" } },
      { key: "spend", label: { en: "Ad spend", tr: "Reklam harcaması" } },
    ],
    compute: (v) => {
      const roas = v.revenue / v.spend;
      return [{ label: { en: "ROAS", tr: "ROAS" }, value: `${num(roas)}x`, unit: undefined }];
    },
  },
  {
    slug: "cr",
    title: { en: "Conversion Rate Calculator", tr: "CR Hesaplama" },
    desc: { en: "Share of visitors who completed the target action.", tr: "Hedef aksiyonu tamamlayan ziyaretçi oranı." },
    inputs: [
      { key: "conversions", label: { en: "Conversions", tr: "Dönüşüm sayısı" } },
      { key: "visitors", label: { en: "Total visitors", tr: "Toplam ziyaretçi" } },
    ],
    compute: (v) => [{ label: { en: "Conversion Rate", tr: "Dönüşüm Oranı" }, value: pct(v.conversions / v.visitors) }],
  },
  {
    slug: "cac",
    title: { en: "CAC Calculator", tr: "CAC Hesaplama" },
    desc: { en: "Customer acquisition cost: total spend divided by new customers.", tr: "Yeni müşteri başına toplam edinme maliyeti." },
    inputs: [
      { key: "spend", label: { en: "Total acquisition spend", tr: "Toplam edinme harcaması" } },
      { key: "customers", label: { en: "New customers acquired", tr: "Edinilen yeni müşteri" } },
    ],
    compute: (v) => [{ label: { en: "CAC", tr: "CAC" }, value: money(v.spend / v.customers) }],
  },
  {
    slug: "ltv",
    title: { en: "LTV Calculator", tr: "LTV Hesaplama" },
    desc: { en: "Customer lifetime value from average order value, purchase frequency and lifespan.", tr: "Ortalama sipariş değeri, satın alma sıklığı ve müşteri ömründen LTV." },
    inputs: [
      { key: "aov", label: { en: "Average order value", tr: "Ortalama sipariş değeri" } },
      { key: "frequency", label: { en: "Purchases per year", tr: "Yıllık satın alma sayısı" } },
      { key: "lifespan", label: { en: "Customer lifespan (years)", tr: "Müşteri ömrü (yıl)" } },
    ],
    compute: (v) => [{ label: { en: "LTV", tr: "LTV" }, value: money(v.aov * v.frequency * v.lifespan) }],
  },
  {
    slug: "ctr",
    title: { en: "CTR Calculator", tr: "CTR Hesaplama" },
    desc: { en: "Click-through rate: clicks divided by impressions.", tr: "Gösterim başına tıklama oranı." },
    inputs: [
      { key: "clicks", label: { en: "Clicks", tr: "Tıklama" } },
      { key: "impressions", label: { en: "Impressions", tr: "Gösterim" } },
    ],
    compute: (v) => [{ label: { en: "CTR", tr: "CTR" }, value: pct(v.clicks / v.impressions) }],
  },
  {
    slug: "cpc",
    title: { en: "CPC Calculator", tr: "CPC Hesaplama" },
    desc: { en: "Cost per click: total spend divided by clicks.", tr: "Tıklama başına maliyet." },
    inputs: [
      { key: "spend", label: { en: "Total spend", tr: "Toplam harcama" } },
      { key: "clicks", label: { en: "Clicks", tr: "Tıklama" } },
    ],
    compute: (v) => [{ label: { en: "CPC", tr: "CPC" }, value: money(v.spend / v.clicks) }],
  },
  {
    slug: "cpm",
    title: { en: "CPM Calculator", tr: "CPM Hesaplama" },
    desc: { en: "Cost per 1,000 impressions.", tr: "Bin gösterim başına maliyet." },
    inputs: [
      { key: "spend", label: { en: "Total spend", tr: "Toplam harcama" } },
      { key: "impressions", label: { en: "Impressions", tr: "Gösterim" } },
    ],
    compute: (v) => [{ label: { en: "CPM", tr: "CPM" }, value: money((v.spend / v.impressions) * 1000) }],
  },
  {
    slug: "cpl",
    title: { en: "CPL Calculator", tr: "CPL Hesaplama" },
    desc: { en: "Cost per lead: total spend divided by leads generated.", tr: "Lead başına maliyet." },
    inputs: [
      { key: "spend", label: { en: "Total spend", tr: "Toplam harcama" } },
      { key: "leads", label: { en: "Leads generated", tr: "Oluşan lead sayısı" } },
    ],
    compute: (v) => [{ label: { en: "CPL", tr: "CPL" }, value: money(v.spend / v.leads) }],
  },
  {
    slug: "aov",
    title: { en: "AOV Calculator", tr: "AOV Hesaplama" },
    desc: { en: "Average order value: revenue divided by number of orders.", tr: "Sipariş başına ortalama gelir." },
    inputs: [
      { key: "revenue", label: { en: "Total revenue", tr: "Toplam gelir" } },
      { key: "orders", label: { en: "Number of orders", tr: "Sipariş sayısı" } },
    ],
    compute: (v) => [{ label: { en: "AOV", tr: "AOV" }, value: money(v.revenue / v.orders) }],
  },
  {
    slug: "ab-test",
    title: { en: "A/B Test Significance Calculator", tr: "A/B Testi Hesaplama" },
    desc: { en: "Two-proportion z-test for A/B conversion rates.", tr: "İki oran için z-testi ile A/B anlamlılığı." },
    inputs: [
      { key: "visitorsA", label: { en: "Control visitors", tr: "Kontrol ziyaretçi" } },
      { key: "conversionsA", label: { en: "Control conversions", tr: "Kontrol dönüşüm" } },
      { key: "visitorsB", label: { en: "Variant visitors", tr: "Varyant ziyaretçi" } },
      { key: "conversionsB", label: { en: "Variant conversions", tr: "Varyant dönüşüm" } },
    ],
    compute: (v) => {
      const p1 = v.conversionsA / v.visitorsA;
      const p2 = v.conversionsB / v.visitorsB;
      const pPooled = (v.conversionsA + v.conversionsB) / (v.visitorsA + v.visitorsB);
      const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / v.visitorsA + 1 / v.visitorsB));
      const z = (p2 - p1) / se;
      // standard normal CDF via erf approximation (Abramowitz-Stegun)
      const erf = (x: number) => {
        const s = x < 0 ? -1 : 1;
        x = Math.abs(x);
        const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
        const t = 1 / (1 + p * x);
        const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        return s * y;
      };
      const cdf = (x: number) => 0.5 * (1 + erf(x / Math.SQRT2));
      const pValue = 2 * (1 - cdf(Math.abs(z)));
      const uplift = p2 / p1 - 1;
      return [
        { label: { en: "Control rate", tr: "Kontrol oranı" }, value: pct(p1) },
        { label: { en: "Variant rate", tr: "Varyant oranı" }, value: pct(p2) },
        { label: { en: "Relative uplift", tr: "Göreli artış" }, value: pct(uplift) },
        { label: { en: "z-score", tr: "z-skoru" }, value: num(z, 3) },
        { label: { en: "p-value", tr: "p-değeri" }, value: num(pValue, 4) },
        { label: { en: "Significant at 95%?", tr: "%95'te anlamlı mı?" }, value: pValue < 0.05 ? (v.visitorsA ? "Yes / Evet" : "-") : "No / Hayır" },
      ];
    },
  },
  {
    slug: "marketing-roi",
    title: { en: "Marketing ROI Calculator", tr: "Pazarlama ROI Hesaplama" },
    desc: { en: "Net return on marketing investment.", tr: "Pazarlama yatırımının net getirisi." },
    inputs: [
      { key: "revenue", label: { en: "Revenue attributed to marketing", tr: "Pazarlamaya atfedilen gelir" } },
      { key: "cost", label: { en: "Marketing cost", tr: "Pazarlama maliyeti" } },
    ],
    compute: (v) => [{ label: { en: "Marketing ROI", tr: "Pazarlama ROI" }, value: pct((v.revenue - v.cost) / v.cost) }],
  },
  {
    slug: "profit-margin",
    title: { en: "Profit Margin Calculator", tr: "Kâr Marjı Hesaplama" },
    desc: { en: "Net profit as a percentage of revenue.", tr: "Gelirin yüzdesi olarak net kâr." },
    inputs: [
      { key: "revenue", label: { en: "Revenue", tr: "Gelir" } },
      { key: "cost", label: { en: "Total cost", tr: "Toplam maliyet" } },
    ],
    compute: (v) => [{ label: { en: "Profit Margin", tr: "Kâr Marjı" }, value: pct((v.revenue - v.cost) / v.revenue) }],
  },
  {
    slug: "retention-rate",
    title: { en: "Customer Retention Rate Calculator", tr: "Müşteri Elde Tutma Oranı Hesaplama" },
    desc: { en: "Share of existing customers retained over a period.", tr: "Dönem boyunca elde tutulan mevcut müşteri oranı." },
    inputs: [
      { key: "start", label: { en: "Customers at period start", tr: "Dönem başı müşteri" } },
      { key: "end", label: { en: "Customers at period end", tr: "Dönem sonu müşteri" } },
      { key: "acquired", label: { en: "New customers acquired", tr: "Yeni edinilen müşteri" } },
    ],
    compute: (v) => [{ label: { en: "Retention Rate", tr: "Elde Tutma Oranı" }, value: pct((v.end - v.acquired) / v.start) }],
  },
  {
    slug: "cart-abandonment",
    title: { en: "Cart Abandonment Rate Calculator", tr: "Sepet Terk Oranı Hesaplama" },
    desc: { en: "Share of started carts that were never completed.", tr: "Tamamlanmayan sepetlerin oranı." },
    inputs: [
      { key: "carts", label: { en: "Carts created", tr: "Oluşan sepet" } },
      { key: "completed", label: { en: "Completed purchases", tr: "Tamamlanan satın alma" } },
    ],
    compute: (v) => [{ label: { en: "Cart Abandonment Rate", tr: "Sepet Terk Oranı" }, value: pct((v.carts - v.completed) / v.carts) }],
  },
  {
    slug: "engagement-rate",
    title: { en: "Web Engagement Rate Calculator", tr: "Web Etkileşim Oranı Hesaplama" },
    desc: { en: "Engaged sessions as a share of total sessions.", tr: "Toplam oturum içinde etkileşimli oturum payı." },
    inputs: [
      { key: "engaged", label: { en: "Engaged sessions", tr: "Etkileşimli oturum" } },
      { key: "sessions", label: { en: "Total sessions", tr: "Toplam oturum" } },
    ],
    compute: (v) => [{ label: { en: "Engagement Rate", tr: "Etkileşim Oranı" }, value: pct(v.engaged / v.sessions) }],
  },
];

/** UTM builder and character counter are interactive text tools, not
    single-formula calculators - handled by their own components but listed
    here so the index page and routing stay data-driven. */
export const TEXT_TOOLS: readonly { slug: string; title: { en: string; tr: string }; desc: { en: string; tr: string } }[] = [
  {
    slug: "utm-builder",
    title: { en: "UTM Builder", tr: "UTM Oluşturucu" },
    desc: { en: "Append source, medium, campaign and content parameters to any URL.", tr: "Herhangi bir URL'ye source, medium, campaign ve content parametreleri ekler." },
  },
  {
    slug: "character-counter",
    title: { en: "Character Counter", tr: "Karakter Sayacı" },
    desc: { en: "Live character and word count against common ad and meta length limits.", tr: "Yaygın reklam ve meta uzunluk limitlerine göre canlı karakter ve kelime sayacı." },
  },
];

export const ALL_TOOL_SLUGS: readonly string[] = [...CALCULATORS.map((c) => c.slug), ...TEXT_TOOLS.map((t) => t.slug)];
