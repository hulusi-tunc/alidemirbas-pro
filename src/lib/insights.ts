import type { Lang } from "@/lib/content";

/* Insights (/content). The posts, their bodies and the attached case studies are
   the cv's, verbatim in both languages.

   Only `body` and the PDF labels differ per language — the LinkedIn permalinks
   and PDF paths are shared, so they are keyed by id here and merged below
   rather than duplicated across `en` and `tr`, where they would be free to
   drift apart. */

type Pdf = { title: string; meta: string; href: string };
export type Post = { id: string; href: string; body: string; pdf?: Pdf };

const LINKS: Record<string, string> = {
  measurement: "https://www.linkedin.com/feed/update/urn:li:activity:7470079770823901185/",
  experiments: "https://www.linkedin.com/feed/update/urn:li:activity:7467539714124906498/",
  adsMemory: "https://www.linkedin.com/feed/update/urn:li:activity:7480288554309292032/",
  inhouse: "https://www.linkedin.com/feed/update/urn:li:activity:7462119181740617728/",
  numerspace: "https://www.linkedin.com/feed/update/urn:li:activity:7457125720335556609/",
  ecommerce: "https://www.linkedin.com/feed/update/urn:li:activity:7448339752757702656/",
  caseBank: "https://www.linkedin.com/feed/update/urn:li:activity:7444258376672354304/",
  lifecycle: "https://www.linkedin.com/feed/update/urn:li:activity:7442933404221796353/",
  speed: "https://www.linkedin.com/feed/update/urn:li:activity:7434669739295232002/",
};

const PDFS: Record<string, string> = {
  adsMemory: "/case-studies/google-ads-karar-hafizasi.pdf",
  inhouse: "/case-studies/buyume-ikilemi.pdf",
};

type Draft = { id: string; body: string; pdf?: Omit<Pdf, "href"> };

const EN: Draft[] = [
  {
    id: "measurement",
    body: "A reliable measurement setup is the foundation of every growth decision. In this post I break down how I structure GA4 and GTM so events stay consistent across web and app. I share the naming conventions and validation checks I run before trusting a single number. The goal is simple: data you can actually build strategy on, not dashboards nobody trusts.",
  },
  {
    id: "experiments",
    body: "Growth is rarely about one big lever; it is the compounding of many small, deliberate improvements. Here I walk through how I prioritize experiments when time and traffic are limited. I explain the framework I use to weigh impact against effort and confidence. I also cover why killing a losing test quickly matters as much as scaling a winning one.",
  },
  {
    id: "adsMemory",
    body: "Nobody could explain why a Google Ads change made three months ago happened, because the reasoning never got written down anywhere. I built an hourly Google Ads Script that catches every change, posts it to Slack, and opens a Google Sheets log with campaign, change type, and old/new value. The person who made the change replies with a one-line reason directly in the Slack thread, which the system files back into the sheet automatically. A reminder goes out 30 days later asking what the outcome was.",
    pdf: { title: "Google Ads Karar Hafızası Sistemi", meta: "1 page" },
  },
  {
    id: "inhouse",
    body: "Every growing company hits the same fork: in-house core team, outsourced ecosystem, or a hybrid model — and the wrong call quietly drains runway and slows time-to-market. I built a decision framework based on company stage, existing capabilities, and capital structure, arguing that the right model isn't fixed: it should evolve as the company's growth stage changes.",
    pdf: { title: "Startup'larda Büyüme İkilemi", meta: "10 pages" },
  },
  {
    id: "numerspace",
    body: 'AI is flawless in theory; the real learning starts once you get your hands dirty turning theory into a live product. With Eyüp Poyraz, I built numerspace.com to stress-test AI\'s limits in coding, design, and SEO — treating it as a working partner rather than a shortcut. The lesson: speed without strategy means nothing, and a tool merely "working" isn\'t the same as working well.',
  },
  {
    id: "ecommerce",
    body: 'Designing a flawless e-commerce experience comes down to mapping out the flows that look complex correctly. I put together an "E-commerce Process and User Flows" template that visualizes the full user journey — from signup through product details, checkout steps, referral flows, and account settings. It\'s a starting point meant to be copied and adapted to your own project.',
  },
  {
    id: "caseBank",
    body: "Recruiting case studies in this field are often generic and years out of date. I built a comprehensive, current, data-driven case study bank across Growth, Performance, and CRM/Lifecycle Marketing — 13 cases and 350+ questions drawn from real-world scenarios, meant to be picked from selectively rather than run wholesale in an interview.",
  },
  {
    id: "lifecycle",
    body: "Retention is where sustainable growth is won or lost. In this post I unpack how I design lifecycle programs that reach users at the right moment instead of spamming them. I share how I segment by behavior rather than guesswork, and how I measure incremental impact. Good lifecycle marketing feels helpful to the user and shows up clearly in the numbers.",
  },
  {
    id: "speed",
    body: "Speed = better UX = higher conversion = more revenue. A slow website isn't just a technical problem, it's a direct sales problem: a user lands, the page takes a few seconds to load, and they leave before ever seeing the offer. Sometimes the biggest growth opportunity isn't pulling in new traffic — it's turning the traffic you already have into a faster, smoother experience.",
  },
];

const TR: Draft[] = [
  {
    id: "measurement",
    body: "Güvenilir bir ölçümleme kurgusu, her büyüme kararının temelidir. Bu yazıda GA4 ve GTM'i web ve uygulama genelinde tutarlı kalacak şekilde nasıl yapılandırdığımı anlatıyorum. Bir sayıya güvenmeden önce uyguladığım isimlendirme kurallarını ve doğrulama kontrollerini paylaşıyorum. Amaç basit: kimsenin güvenmediği panolar değil, üzerine strateji kurabileceğiniz veri.",
  },
  {
    id: "experiments",
    body: "Büyüme nadiren tek bir büyük kaldıraçla gelir; birçok küçük, bilinçli iyileştirmenin birikmesidir. Bu yazıda zaman ve trafik kısıtlıyken deneyleri nasıl önceliklendirdiğimi anlatıyorum. Etkiyi çaba ve güven düzeyine karşı tartarken kullandığım çerçeveyi açıklıyorum. Ayrıca kaybeden bir testi hızla sonlandırmanın, kazananı büyütmek kadar önemli olduğundan bahsediyorum.",
  },
  {
    id: "adsMemory",
    body: 'Google Ads\'te 3 ay önce yapılan bir değişikliğin sebebini bulmak neredeyse imkansızdı, çünkü gerekçe hiçbir yere yazılmıyordu. Saatlik çalışan bir Google Ads Script kurdum: her değişikliği yakalıyor, Slack\'e bildirim düşürüyor ve kampanya, değişiklik türü, eski/yeni değeri içeren bir Google Sheets kaydı açıyor. Değişikliği yapan kişi Slack thread\'ine tek cümlelik gerekçe yazıyor, sistem bunu otomatik olarak Sheet\'e işliyor. 30 gün sonra da "sonuç ne oldu?" hatırlatması otomatik gidiyor.',
    pdf: { title: "Google Ads Karar Hafızası Sistemi", meta: "1 sayfa" },
  },
  {
    id: "inhouse",
    body: "Büyüyen her şirket aynı kavşakla karşılaşır: in-house çekirdek ekip mi, outsource ekosistemi mi, yoksa hibrit model mi — ve yanlış karar runway'i sessizce eritir, pazara çıkış hızını düşürür. Şirketin aşamasına, mevcut yetkinliklerine ve sermaye yapısına dayalı bir karar çerçevesi kurguladım: doğru model sabit değildir, şirketin büyüme evresi değiştikçe evrilmelidir.",
    pdf: { title: "Startup'larda Büyüme İkilemi", meta: "10 sayfa" },
  },
  {
    id: "numerspace",
    body: 'AI teoride kusursuz. Ancak iş "elleri kirletip" teoriyi canlı bir ürüne dönüştürmeye gelince asıl öğrenme başlıyor. Eyüp Poyraz ile birlikte, AI\'ın kodlama, tasarım ve SEO süreçlerindeki sınırlarını sıfırdan test etmek için numerspace.com\'u hayata geçirdik. Stratejisiz hız hiçtir; bir aracın sadece "çalışması" yetmiyor.',
  },
  {
    id: "ecommerce",
    body: 'Kusursuz bir e-ticaret deneyimi tasarlamanın sırrı, karmaşık görünen süreçleri doğru şekilde haritalandırmaktan geçiyor. Yeni kullanıcı kaydından ürün detaylarına, sipariş adımlarından referral akışlarına ve hesap ayarlarına kadar temel akışları topladığım "E-Ticaret Süreç ve Kullanıcı Akışları" şablonunu paylaştım. Dosyanın kopyasını alıp kendi projenize göre düzenleyebilirsiniz.',
  },
  {
    id: "caseBank",
    body: "İşe alım süreçlerinde hepimizin sıkça karşılaştığı bir tablo var: yıllardır güncellenmemiş, jenerik ve yüzeysel case study'ler. Growth Marketing, Performance Marketing ve CRM/Lifecycle Marketing alanlarında güncel, veri odaklı, gerçek dünya senaryolarına dayanan bir vaka çalışması havuzu hazırladım: 13 case, 350'den fazla soru. Amaç, kendi şirket dinamiklerinize uygun soruları seçip alabileceğiniz bir kaynak.",
  },
  {
    id: "lifecycle",
    body: "Sürdürülebilir büyüme, elde tutmada kazanılır ya da kaybedilir. Bu yazıda, kullanıcıları spam yapmak yerine doğru anda yakalayan yaşam döngüsü programlarını nasıl tasarladığımı anlatıyorum. Tahmine değil davranışa göre segmentlemeyi ve artan etkiyi nasıl ölçtüğümü paylaşıyorum. İyi bir yaşam döngüsü pazarlaması kullanıcıya faydalı hisettirir ve sayılara net şekilde yansır.",
  },
  {
    id: "speed",
    body: "Hız = Daha iyi kullanıcı deneyimi = Daha yüksek dönüşüm = Daha fazla gelir. Web sitenizin yavaş olması yalnızca teknik bir problem değil, doğrudan satış problemidir: kullanıcı sitenize giriyor, sayfa geç açılıyor, birkaç saniye bekliyor ve ardından çıkıyor. Bazen büyüme için en büyük fırsat yeni trafik çekmek değil, mevcut trafiği daha hızlı ve verimli bir deneyime dönüştürmektir.",
  },
];

const build = (drafts: Draft[]): Post[] =>
  drafts.map(({ id, body, pdf }) => ({
    id,
    body,
    href: LINKS[id],
    ...(pdf ? { pdf: { ...pdf, href: PDFS[id] } } : {}),
  }));

export const insights: Record<Lang, {
  eyebrow: string;
  title: string;
  sub: string;
  kicker: string;
  read: string;
  copy: string;
  copied: string;
  download: string;
  seeAll: string;
  posts: Post[];
}> = {
  en: {
    eyebrow: "Insights",
    title: "Insights.",
    sub: "Insights, frameworks, and practical lessons on growth, CRO, and analytics, shared on LinkedIn.",
    kicker: "Growth Marketing | CRM Marketing",
    read: "Read on LinkedIn",
    copy: "Copy link",
    copied: "Copied",
    download: "Download PDF",
    seeAll: "See all on LinkedIn",
    posts: build(EN),
  },
  tr: {
    eyebrow: "İçgörüler",
    title: "İçgörüler.",
    sub: "LinkedIn'de paylaştığım büyüme, CRO ve analitik üzerine içgörüler, çerçeveler ve pratik dersler.",
    kicker: "Büyüme Pazarlaması | CRM Pazarlaması",
    read: "LinkedIn’de oku",
    copy: "Linki kopyala",
    copied: "Kopyalandı",
    download: "PDF İndir",
    seeAll: "Tümünü LinkedIn'de gör",
    posts: build(TR),
  },
};
