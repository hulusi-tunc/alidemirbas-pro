// Ported from alidemirbas.com.tr/stack (the cv repo's stack-data.ts), verbatim.
export type Tool = { name: string; domain: string; logo?: string; tag: { en: string; tr: string } };
export type ToolGroup = { title: { en: string; tr: string }; tools: Tool[] };

// Logos come from each tool's own domain (Google favicon service) so every
// tile renders - even brands that aren't on icon sets.
export const logoSrc = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

// Data Studio (renamed to Looker Studio, then back to Data Studio) sits
// behind Google's own auth-gated app shell, which the s2 favicon guesser
// never manages to crawl - both `datastudio.google.com` and
// `lookerstudio.google.com` come back 404 from that endpoint, which is
// exactly the broken-image tile that got reported. Verified against the
// domain's own real `<link rel="icon">` tag, which points at this stable
// gstatic asset instead - so this one tool gets a direct `logo` override
// rather than the derived-from-domain path every other tool uses.
export const resolveLogo = (tool: Tool) => tool.logo ?? logoSrc(tool.domain);

export const stackGroups: ToolGroup[] = [
  {
    title: { en: "Design & Build", tr: "Tasarım ve Üretim" },
    tools: [
      { name: "Figma", domain: "figma.com", tag: { en: "Design & Prototyping", tr: "Tasarım ve Prototipleme" } },
      { name: "Framer", domain: "framer.com", tag: { en: "Web Design Platform", tr: "Web Tasarım Platformu" } },
      { name: "ChatGPT", domain: "openai.com", tag: { en: "OpenAI", tr: "OpenAI" } },
      { name: "Canva", domain: "canva.com", tag: { en: "Design & Graphics", tr: "Tasarım ve Grafik" } },
      { name: "Claude", domain: "claude.ai", tag: { en: "Anthropic AI", tr: "Anthropic AI" } },
      { name: "Midjourney", domain: "midjourney.com", tag: { en: "AI Image Generation", tr: "Yapay Zeka Görsel Üretimi" } },
    ],
  },
  {
    title: { en: "Web & Product Analytics", tr: "Web ve Ürün Analitiği" },
    tools: [
      { name: "Mixpanel", domain: "mixpanel.com", tag: { en: "Product Analytics", tr: "Ürün Analitiği" } },
      { name: "Hotjar", domain: "hotjar.com", tag: { en: "Heatmaps & Recordings", tr: "Isı Haritası ve Kayıtlar" } },
      { name: "Microsoft Clarity", domain: "clarity.microsoft.com", tag: { en: "Behavior Analytics", tr: "Davranış Analitiği" } },
      { name: "Google Analytics 4", domain: "analytics.google.com", tag: { en: "Web Analytics", tr: "Web Analitiği" } },
      { name: "Google Tag Manager", domain: "tagmanager.google.com", tag: { en: "Tag Management", tr: "Etiket Yönetimi" } },
      { name: "Smartlook", domain: "smartlook.com", tag: { en: "Session Analytics", tr: "Oturum Analitiği" } },
    ],
  },
  {
    title: { en: "Mobile / Attribution (MMP)", tr: "Mobil / Atıf (MMP)" },
    tools: [
      { name: "Adjust", domain: "adjust.com", tag: { en: "Mobile App Analytics", tr: "Mobil Uygulama Analitiği" } },
      { name: "AppsFlyer", domain: "appsflyer.com", tag: { en: "Mobile Attribution", tr: "Mobil Atıf" } },
      { name: "Firebase", domain: "firebase.google.com", tag: { en: "App Platform & Analytics", tr: "Uygulama Platformu ve Analitik" } },
      { name: "RevenueCat", domain: "revenuecat.com", tag: { en: "In-App Subscriptions", tr: "Uygulama İçi Abonelikler" } },
    ],
  },
  {
    title: { en: "BI / Data Visualization", tr: "BI / Veri Görselleştirme" },
    tools: [
      { name: "Data Studio", domain: "datastudio.google.com", logo: "https://www.gstatic.com/analytics-lego/svg/favicon_data_studio.png", tag: { en: "Data Visualisation", tr: "Veri Görselleştirme" } },
      { name: "Tableau", domain: "tableau.com", tag: { en: "Data Visualisation", tr: "Veri Görselleştirme" } },
      { name: "Power BI", domain: "powerbi.microsoft.com", tag: { en: "Business Intelligence", tr: "İş Zekası" } },
      { name: "Mixpanel", domain: "mixpanel.com", tag: { en: "Product Analytics", tr: "Ürün Analitiği" } },
      { name: "Qlik", domain: "qlik.com", tag: { en: "Business Intelligence", tr: "İş Zekası" } },
      { name: "Graylog", domain: "graylog.org", tag: { en: "Log Management", tr: "Log Yönetimi" } },
      { name: "Kibana", domain: "elastic.co", tag: { en: "Log & Data Analytics", tr: "Log ve Veri Analitiği" } },
    ],
  },
  {
    title: { en: "CRM & Engagement", tr: "CRM ve Etkileşim" },
    tools: [
      { name: "Insider", domain: "useinsider.com", tag: { en: "Omnichannel Marketing", tr: "Omnichannel Pazarlama" } },
      { name: "Braze", domain: "braze.com", tag: { en: "Customer Engagement", tr: "Müşteri Etkileşimi" } },
      { name: "Mailchimp", domain: "mailchimp.com", tag: { en: "Email Marketing", tr: "E-posta Pazarlaması" } },
      { name: "OneSignal", domain: "onesignal.com", tag: { en: "Push Notifications", tr: "Push Bildirimleri" } },
      { name: "D·engage", domain: "dengage.com", tag: { en: "Marketing Automation", tr: "Pazarlama Otomasyonu" } },
    ],
  },
  {
    title: { en: "SEO & Content", tr: "SEO ve İçerik" },
    tools: [
      { name: "Ahrefs", domain: "ahrefs.com", tag: { en: "SEO Toolset", tr: "SEO Araç Seti" } },
      { name: "Semrush", domain: "semrush.com", tag: { en: "SEO & Marketing", tr: "SEO ve Pazarlama" } },
      { name: "Screaming Frog", domain: "screamingfrog.co.uk", tag: { en: "SEO Crawler", tr: "SEO Tarayıcı" } },
      { name: "Search Console", domain: "search.google.com", tag: { en: "Search Analytics", tr: "Arama Analitiği" } },
    ],
  },
  {
    title: { en: "CRO / A-B Test / Experimentation", tr: "CRO / A-B Test / Deneyler" },
    tools: [
      { name: "Insider", domain: "useinsider.com", tag: { en: "Web Personalization & A/B", tr: "Web Kişiselleştirme ve A/B" } },
    ],
  },
  {
    title: { en: "Work Management", tr: "İş Yönetimi" },
    tools: [
      { name: "Jira", domain: "atlassian.com", tag: { en: "Project Management", tr: "Proje Yönetimi" } },
      { name: "Notion", domain: "notion.so", tag: { en: "Work Management Tool", tr: "İş Yönetim Aracı" } },
      { name: "Trello", domain: "trello.com", tag: { en: "Task Boards", tr: "Görev Panoları" } },
    ],
  },
];

// A curated cross-section of the full stack, surfaced on the home page -
// ported from the cv site's own stack-data.ts (same 8 names, same order).
export const stackPreviewNames = [
  "Figma",
  "Google Analytics 4",
  "Google Tag Manager",
  "Adjust",
  "Mixpanel",
  "Data Studio",
  "Insider",
  "Braze",
];

export function stackPreview(): Tool[] {
  const byName = new Map<string, Tool>();
  stackGroups.forEach((g) => g.tools.forEach((tool) => byName.set(tool.name, tool)));
  return stackPreviewNames.map((name) => byName.get(name)).filter((t): t is Tool => Boolean(t));
}
