// Ported from alidemirbas.com.tr/stack (the cv repo's stack-data.ts).
export type Tool = { name: string; domain: string; logo?: string; tag: { en: string; tr: string } };
export type ToolGroup = {
  id: string;
  nav: { en: string; tr: string };
  title: { en: string; tr: string };
  desc: { en: string; tr: string };
  tools: Tool[];
};

// Logos come from each tool's own domain (Google favicon service) so every
// tile renders - even brands that aren't on icon sets.
export const logoSrc = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

// Data Studio's app shell does not expose a usable favicon through the same
// derived path as the other tools, so it keeps the verified direct asset.
export const resolveLogo = (tool: Tool) => tool.logo ?? logoSrc(tool.domain);

export const stackGroups: ToolGroup[] = [
  {
    id: "web-product-analytics",
    nav: { en: "Web Analytics", tr: "Web Analitiği" },
    title: { en: "Web & Product Analytics", tr: "Web ve Ürün Analitiği" },
    desc: {
      en: "For understanding user behavior, event flows, and web performance.",
      tr: "Kullanıcı davranışını, event akışlarını ve web performansını anlamak için.",
    },
    tools: [
      { name: "Mixpanel", domain: "mixpanel.com", tag: { en: "Product analytics", tr: "Ürün analitiği" } },
      { name: "Hotjar", domain: "hotjar.com", tag: { en: "Heatmaps & recordings", tr: "Isı haritaları ve oturum kayıtları" } },
      { name: "Microsoft Clarity", domain: "clarity.microsoft.com", tag: { en: "Behavior analytics", tr: "Davranış analitiği" } },
      { name: "Google Analytics 4", domain: "analytics.google.com", tag: { en: "Web & product analytics", tr: "Web ve ürün analitiği" } },
      { name: "Google Tag Manager", domain: "tagmanager.google.com", tag: { en: "Tag management", tr: "Etiket yönetimi" } },
      { name: "Smartlook", domain: "smartlook.com", tag: { en: "Session analytics", tr: "Oturum analitiği" } },
    ],
  },
  {
    id: "mobile-analytics-measurement",
    nav: { en: "Mobile Analytics", tr: "Mobil Analitik" },
    title: { en: "Mobile Analytics & Measurement", tr: "Mobil Analitik ve Ölçümleme" },
    desc: {
      en: "For attribution, app behavior, and mobile measurement.",
      tr: "Attribution, uygulama davranışı ve mobil ölçümleme için.",
    },
    tools: [
      { name: "Adjust", domain: "adjust.com", tag: { en: "Mobile measurement & attribution", tr: "Mobil ölçümleme ve attribution" } },
      { name: "AppsFlyer", domain: "appsflyer.com", tag: { en: "Mobile attribution", tr: "Mobil attribution" } },
      { name: "Firebase", domain: "firebase.google.com", tag: { en: "App analytics & platform", tr: "Uygulama analitiği ve altyapı" } },
      { name: "RevenueCat", domain: "revenuecat.com", tag: { en: "In-app subscriptions", tr: "Uygulama içi abonelikler" } },
    ],
  },
  {
    id: "crm-engagement",
    nav: { en: "CRM", tr: "CRM" },
    title: { en: "CRM & Engagement", tr: "CRM ve Etkileşim" },
    desc: {
      en: "For segmentation, lifecycle messaging, and personalization.",
      tr: "Segmentasyon, lifecycle iletişimi ve kişiselleştirme için.",
    },
    tools: [
      { name: "Insider", domain: "useinsider.com", tag: { en: "CRM, personalization & experimentation", tr: "CRM, kişiselleştirme ve deneyler" } },
      { name: "Braze", domain: "braze.com", tag: { en: "Customer engagement", tr: "Müşteri etkileşimi" } },
      { name: "Mailchimp", domain: "mailchimp.com", tag: { en: "Email marketing", tr: "E-posta pazarlaması" } },
      { name: "OneSignal", domain: "onesignal.com", tag: { en: "Push notifications", tr: "Push bildirimleri" } },
      { name: "D·engage", domain: "dengage.com", tag: { en: "Marketing automation", tr: "Pazarlama otomasyonu" } },
    ],
  },
  {
    id: "seo-content",
    nav: { en: "SEO", tr: "SEO" },
    title: { en: "SEO & Content", tr: "SEO ve İçerik" },
    desc: {
      en: "For organic visibility, technical checks, and content research.",
      tr: "Organik görünürlük, teknik kontroller ve içerik araştırması için.",
    },
    tools: [
      { name: "Ahrefs", domain: "ahrefs.com", tag: { en: "SEO analysis", tr: "SEO analizi" } },
      { name: "Semrush", domain: "semrush.com", tag: { en: "SEO & search analytics", tr: "SEO ve arama analizi" } },
      { name: "Screaming Frog", domain: "screamingfrog.co.uk", tag: { en: "Technical SEO crawler", tr: "Teknik SEO taraması" } },
      { name: "Search Console", domain: "search.google.com", tag: { en: "Organic search analytics", tr: "Organik arama analitiği" } },
    ],
  },
  {
    id: "bi-data-visualization",
    nav: { en: "BI", tr: "BI" },
    title: { en: "BI & Data Visualization", tr: "BI ve Veri Görselleştirme" },
    desc: {
      en: "For bringing data together, reporting it, and making it easier to read.",
      tr: "Veriyi bir araya getirip raporlamak ve daha okunabilir hâle getirmek için.",
    },
    tools: [
      { name: "Data Studio", domain: "datastudio.google.com", logo: "https://www.gstatic.com/analytics-lego/svg/favicon_data_studio.png", tag: { en: "Data visualization", tr: "Veri görselleştirme" } },
      { name: "Tableau", domain: "tableau.com", tag: { en: "Data visualization", tr: "Veri görselleştirme" } },
      { name: "Power BI", domain: "powerbi.microsoft.com", tag: { en: "Business intelligence & reporting", tr: "İş zekâsı ve raporlama" } },
      { name: "Qlik", domain: "qlik.com", tag: { en: "Business intelligence", tr: "İş zekâsı" } },
      { name: "Graylog", domain: "graylog.org", tag: { en: "Log management", tr: "Log yönetimi" } },
      { name: "Kibana", domain: "elastic.co", tag: { en: "Log & data analytics", tr: "Log ve veri analitiği" } },
    ],
  },
  {
    id: "work-management",
    nav: { en: "Work Management", tr: "İş Yönetimi" },
    title: { en: "Work Management", tr: "İş Yönetimi" },
    desc: {
      en: "For planning, documentation, and keeping team work on track.",
      tr: "Planlama, dokümantasyon ve ekip işlerini takip etmek için.",
    },
    tools: [
      { name: "Jira", domain: "atlassian.com", tag: { en: "Project management", tr: "Proje yönetimi" } },
      { name: "Notion", domain: "notion.so", tag: { en: "Notes & documentation", tr: "Notlar ve dokümantasyon" } },
      { name: "Trello", domain: "trello.com", tag: { en: "Task management", tr: "Görev yönetimi" } },
    ],
  },
  {
    id: "ai-productivity",
    nav: { en: "AI", tr: "AI" },
    title: { en: "AI & Productivity", tr: "Yapay Zekâ ve Üretkenlik" },
    desc: {
      en: "For research, idea development, and day-to-day productivity.",
      tr: "Araştırma, fikir geliştirme ve günlük üretkenlik için.",
    },
    tools: [
      { name: "ChatGPT", domain: "openai.com", tag: { en: "Research & productivity", tr: "Araştırma ve üretkenlik" } },
      { name: "Claude", domain: "claude.ai", tag: { en: "Research & productivity", tr: "Araştırma ve üretkenlik" } },
    ],
  },
  {
    id: "design-prototyping",
    nav: { en: "Design", tr: "Tasarım" },
    title: { en: "Design & Prototyping", tr: "Tasarım ve Prototipleme" },
    desc: {
      en: "For interface work, prototyping, and visual content.",
      tr: "Arayüz, prototip ve görsel içerik üretmek için.",
    },
    tools: [
      { name: "Figma", domain: "figma.com", tag: { en: "Design & prototyping", tr: "Tasarım ve prototipleme" } },
      { name: "Framer", domain: "framer.com", tag: { en: "Web design & prototyping", tr: "Web tasarımı ve prototipleme" } },
      { name: "Canva", domain: "canva.com", tag: { en: "Visual content creation", tr: "Görsel içerik üretimi" } },
      { name: "Midjourney", domain: "midjourney.com", tag: { en: "AI image generation", tr: "Yapay zekâ ile görsel üretimi" } },
    ],
  },
];

// Homepage teaser: each category's first tool, kept in the same order as the
// full stack so the teaser cannot drift from the source list.
export function stackOnePerCategory(): Tool[] {
  const seen = new Set<string>();
  const picks: Tool[] = [];
  for (const group of stackGroups) {
    const tool = group.tools[0];
    if (!tool || seen.has(tool.name)) continue;
    seen.add(tool.name);
    picks.push(tool);
  }
  return picks;
}
