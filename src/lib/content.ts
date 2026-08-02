export type Lang = "en" | "tr";

export const copy = {
  en: {
    nav: { expertise: "Expertise", experience: "Experience", contact: "Contact", cta: "Get in touch", lang: "TR", langHref: "/tr" },
    hero: {
      line1: "Growth you can measure.",
      line2: "Products that keep users.",
      lead: "I'm Ali Demirbaş, a growth marketer for mobile products. I build acquisition, CRM and lifecycle programs on data - not guesswork.",
      sub: "Currently leading mobile app growth at Aksigorta in Istanbul, after growth roles at Vodafone, Getir and Wingie Enuygun Group.",
      ctaPrimary: "Get in touch",
      ctaSecondary: "LinkedIn",
      reassurance: ["Mobile App Growth Lead, Aksigorta", "7+ years in growth", "Istanbul"],
    },
    trust: "Growth experience across",
    stats: {
      title: "Track record",
      items: [
        { value: "7+", label: "years building growth, CRM and lifecycle programs" },
        { value: "6", label: "brands, from telco to insurance to q-commerce" },
        { value: "70+", label: "CRM journey teardowns researched and documented" },
        { value: "5", label: "industries: insurance, telco, delivery, travel, automotive" },
      ],
    },
    expertise: {
      label: "Expertise",
      title: "Three disciplines, one goal: retention that compounds.",
      cards: [
        { title: "Mobile app growth", body: "Acquisition and activation for iOS and Android products: store funnels, paid and organic loops, onboarding experiments that move retention." },
        { title: "CRM & lifecycle", body: "Journey design across push, email and in-app. Segmentation, triggers and campaigns that meet users at the right moment of their lifecycle." },
        { title: "Analytics & experimentation", body: "Measurement plans, cohort and funnel analysis, A/B testing discipline. Decisions argued with data, and reported so leadership can act on them." },
      ],
    },
    xp: {
      label: "Experience",
      title: "Where I've built it",
      rows: [
        { years: "2026 -", role: "Mobile App Growth Lead", co: "Aksigorta", logo: "/logos/aksigorta.svg" },
        { years: "2024 - 26", role: "Growth Marketing Lead", co: "Vodafone", logo: "/logos/vodafone.svg" },
        { years: "2023 - 24", role: "Growth, CRM Analytics", co: "Getir", logo: "/logos/getir.svg" },
        { years: "2021 - 23", role: "Lifecycle Marketing", co: "Wingie Enuygun Group", logo: "/logos/enuygun.png" },
        { years: "2020 - 21", role: "Digital Marketing", co: "Albayrak Grubu", logo: "/logos/albayrak.svg" },
        { years: "2019 - 20", role: "Digital Marketing", co: "Doğuş Oto", logo: "/logos/dogus-oto.svg" },
      ],
    },
    finalCta: {
      title: "Let's talk growth.",
      body: "Whether it's a role, a project or a question about lifecycle marketing - my inbox is open.",
      button: "mehmetalidemirbas@gmail.com",
      linkedin: "Connect on LinkedIn",
    },
    footer: { left: "Ali Demirbaş, 2026", right: "Istanbul" },
  },
  tr: {
    nav: { expertise: "Uzmanlık", experience: "Deneyim", contact: "İletişim", cta: "İletişime geç", lang: "EN", langHref: "/" },
    hero: {
      line1: "Ölçülebilir büyüme.",
      line2: "Kullanıcıyı tutan ürünler.",
      lead: "Ben Ali Demirbaş, mobil ürünler için growth marketer. Edinim, CRM ve lifecycle programlarını tahminle değil veriyle kuruyorum.",
      sub: "Şu an İstanbul'da Aksigorta'da mobil uygulama büyümesini yönetiyorum; öncesinde Vodafone, Getir ve Wingie Enuygun Group'ta growth rollerindeydim.",
      ctaPrimary: "İletişime geç",
      ctaSecondary: "LinkedIn",
      reassurance: ["Mobile App Growth Lead, Aksigorta", "Growth'ta 7+ yıl", "İstanbul"],
    },
    trust: "Growth deneyimi",
    stats: {
      title: "Deneyim",
      items: [
        { value: "7+", label: "yıl growth, CRM ve lifecycle programları" },
        { value: "6", label: "marka; telekomdan sigortaya, q-commerce'e" },
        { value: "70+", label: "CRM journey incelemesi araştırıldı ve belgelendi" },
        { value: "5", label: "sektör: sigorta, telekom, teslimat, seyahat, otomotiv" },
      ],
    },
    expertise: {
      label: "Uzmanlık",
      title: "Üç disiplin, tek hedef: birikerek büyüyen retention.",
      cards: [
        { title: "Mobil uygulama büyümesi", body: "iOS ve Android ürünlerinde edinim ve aktivasyon: mağaza hunileri, ücretli ve organik döngüler, retention'ı hareket ettiren onboarding deneyleri." },
        { title: "CRM & lifecycle", body: "Push, e-posta ve in-app kanallarında journey tasarımı. Kullanıcıyı yaşam döngüsünün doğru anında yakalayan segmentasyon, tetikleyici ve kampanyalar." },
        { title: "Analitik & deney", body: "Ölçüm planları, kohort ve huni analizi, A/B test disiplini. Veriyle savunulan ve yönetimin aksiyon alabileceği şekilde raporlanan kararlar." },
      ],
    },
    xp: {
      label: "Deneyim",
      title: "Nerelerde kurdum",
      rows: [
        { years: "2026 -", role: "Mobile App Growth Lead", co: "Aksigorta", logo: "/logos/aksigorta.svg" },
        { years: "2024 - 26", role: "Growth Marketing Lead", co: "Vodafone", logo: "/logos/vodafone.svg" },
        { years: "2023 - 24", role: "Growth, CRM Analytics", co: "Getir", logo: "/logos/getir.svg" },
        { years: "2021 - 23", role: "Lifecycle Marketing", co: "Wingie Enuygun Group", logo: "/logos/enuygun.png" },
        { years: "2020 - 21", role: "Dijital Pazarlama", co: "Albayrak Grubu", logo: "/logos/albayrak.svg" },
        { years: "2019 - 20", role: "Dijital Pazarlama", co: "Doğuş Oto", logo: "/logos/dogus-oto.svg" },
      ],
    },
    finalCta: {
      title: "Büyümeyi konuşalım.",
      body: "Bir rol, bir proje ya da lifecycle marketing üzerine bir soru - kutum açık.",
      button: "mehmetalidemirbas@gmail.com",
      linkedin: "LinkedIn'de bağlan",
    },
    footer: { left: "Ali Demirbaş, 2026", right: "İstanbul" },
  },
} as const;

export const LINKEDIN = "https://www.linkedin.com/in/ali-demirbas/";
export const EMAIL = "mehmetalidemirbas@gmail.com";
