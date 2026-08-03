export type Lang = "en" | "tr";

export const copy = {
  en: {
    nav: { about: "About", aboutHref: "/about", expertise: "Expertise", experience: "Experience", lab: "Lab", labHref: "/lab", contact: "Contact", cta: "Get in touch", lang: "TR", langHref: "/tr" },
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
        { years: "2026 -", role: "Mobile App Growth Lead", co: "Aksigorta", logo: "/logos/aksigorta.svg", desc: "Acquisition, activation and lifecycle for an insurer's mobile app." },
        { years: "2024 - 26", role: "Growth Marketing Lead", co: "Vodafone", logo: "/logos/vodafone.svg", desc: "Leading growth marketing programs in telco." },
        { years: "2023 - 24", role: "Growth, CRM Analytics", co: "Getir", logo: "/logos/getir.svg", desc: "Growth and CRM analytics in q-commerce delivery." },
        { years: "2021 - 23", role: "Lifecycle Marketing", co: "Wingie Enuygun Group", logo: "/logos/enuygun.png", desc: "Lifecycle marketing for travel products." },
        { years: "2020 - 21", role: "Digital Marketing", co: "Albayrak Grubu", logo: "/logos/albayrak.svg", desc: "Digital marketing across the group's brands." },
        { years: "2019 - 20", role: "Digital Marketing", co: "Doğuş Oto", logo: "/logos/dogus-oto.svg", desc: "Digital marketing in automotive retail." },
      ],
    },
    lab: {
      label: "Lab",
      title: "Where I test what I preach",
      intro: "Side projects that turn lifecycle practice into public, reusable work.",
      viewAll: "Explore the archive",
      projects: [
        {
          name: "claude-lifecycle",
          desc: "An open-source Claude plugin that drafts CRM journeys from proven patterns - 26 journey blueprints across 9 industries.",
          meta: "Open source - Claude plugin",
          links: [
            { label: "GitHub", href: "https://github.com/ali-demirbas/claude-lifecycle" },
            { label: "Live demo", href: "https://ali-demirbas.github.io/claude-lifecycle/demo/journey-canvas.html" },
          ],
        },
        {
          name: "CRM Journey Archive",
          desc: "70 lifecycle journey teardowns: how each flow is built, what to test, which KPI to track, which classic mistake to avoid.",
          meta: "70 teardowns - 5 channels",
          links: [{ label: "Browse the archive", href: "/lab" }],
        },
      ],
      shell: {
        backToSite: "Back to site",
        tools: "Tools",
        comingSoon: "Coming soon",
        soon: "Soon",
        library: [
          { name: "CRM Journey Archive", desc: "70 lifecycle teardowns", href: "/lab", active: true },
          { name: "claude-lifecycle", desc: "Claude plugin - GitHub", href: "https://github.com/ali-demirbas/claude-lifecycle" },
          { name: "Journey Canvas", desc: "Live demo", href: "https://ali-demirbas.github.io/claude-lifecycle/demo/journey-canvas.html" },
        ],
        planned: [
          { name: "Push benchmarks", desc: "Send-time and CTR data by vertical" },
          { name: "Subject line lab", desc: "Test archive with uplift notes" },
          { name: "RFM playground", desc: "Interactive segmentation sandbox" },
        ],
      },
      page: {
        title: "CRM Journey Archive",
        intro: "70 lifecycle journey teardowns across sectors and channels. Filter by sector or channel, or search - each entry is a flow I have researched and documented.",
        searchPlaceholder: "Search journeys...",
        allSectors: "All sectors",
        allChannels: "All channels",
        results: "journeys",
        empty: "Nothing matches those filters.",
        back: "Back to home",
      },
    },
    about: {
      metaTitle: "About - Ali Demirbaş",
      metaDesc:
        "Who Ali Demirbaş is: seven years of mobile growth, CRM and lifecycle marketing across insurance, telco, delivery, travel and automotive.",
      eyebrow: "About",
      title1: "The story",
      title2: "behind the numbers.",
      lead: "From automotive showrooms to insurance apps: how seven years across five industries became one discipline - growth you can measure.",
      bio: {
        label: "Biography",
        title: "A growth marketer who argues with data.",
        paragraphs: [
          "I'm Ali Demirbaş, a growth marketer for mobile products, based in Istanbul. For more than seven years I've been building acquisition, CRM and lifecycle programs on data - not guesswork - across six brands in five industries: insurance, telco, delivery, travel and automotive.",
          "I started out in digital marketing in automotive retail at Doğuş Oto, then across Albayrak Grubu's brands. At Wingie Enuygun Group I moved into lifecycle marketing for travel products; at Getir I worked on growth and CRM analytics in q-commerce; at Vodafone I led growth marketing in telco. Today I lead mobile app growth at Aksigorta.",
          "Along the way I kept one habit: turning practice into public, reusable work. That's where the Lab comes from - claude-lifecycle, an open-source plugin that drafts CRM journeys from 26 blueprints across 9 industries, and an archive of 70 lifecycle journey teardowns documenting how each flow is built, what to test and which KPI to track.",
        ],
      },
      facts: {
        title: "At a glance",
        rows: [
          { label: "Current role", value: "Mobile App Growth Lead, Aksigorta" },
          { label: "Based in", value: "Istanbul" },
          { label: "Focus", value: "Mobile growth, CRM & lifecycle, analytics" },
          { label: "Industries", value: "Insurance, telco, delivery, travel, automotive" },
        ],
        email: "Write me",
        linkedin: "LinkedIn",
      },
      timeline: {
        label: "Experience",
        title: "The path, year by year",
        intro: "Six brands in seven years - each one a different sector, the same discipline: programs built on data and reported so decisions follow.",
      },
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
    nav: { about: "Hakkında", aboutHref: "/tr/about", expertise: "Uzmanlık", experience: "Deneyim", lab: "Lab", labHref: "/tr/lab", contact: "İletişim", cta: "İletişime geç", lang: "EN", langHref: "/" },
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
        { years: "2026 -", role: "Mobile App Growth Lead", co: "Aksigorta", logo: "/logos/aksigorta.svg", desc: "Bir sigorta şirketinin mobil uygulamasında edinim, aktivasyon ve lifecycle." },
        { years: "2024 - 26", role: "Growth Marketing Lead", co: "Vodafone", logo: "/logos/vodafone.svg", desc: "Telekomda growth marketing programlarının liderliği." },
        { years: "2023 - 24", role: "Growth, CRM Analytics", co: "Getir", logo: "/logos/getir.svg", desc: "Q-commerce teslimatta growth ve CRM analitiği." },
        { years: "2021 - 23", role: "Lifecycle Marketing", co: "Wingie Enuygun Group", logo: "/logos/enuygun.png", desc: "Seyahat ürünleri için lifecycle marketing." },
        { years: "2020 - 21", role: "Dijital Pazarlama", co: "Albayrak Grubu", logo: "/logos/albayrak.svg", desc: "Grup markaları genelinde dijital pazarlama." },
        { years: "2019 - 20", role: "Dijital Pazarlama", co: "Doğuş Oto", logo: "/logos/dogus-oto.svg", desc: "Otomotiv perakendesinde dijital pazarlama." },
      ],
    },
    lab: {
      label: "Lab",
      title: "Anlattığımı test ettiğim yer",
      intro: "Lifecycle pratiğini herkese açık, yeniden kullanılabilir işe dönüştüren yan projeler.",
      viewAll: "Arşivi keşfet",
      projects: [
        {
          name: "claude-lifecycle",
          desc: "Kanıtlanmış kalıplardan CRM journey'leri taslaklayan açık kaynak Claude eklentisi - 9 sektörde 26 journey şablonu.",
          meta: "Açık kaynak - Claude eklentisi",
          links: [
            { label: "GitHub", href: "https://github.com/ali-demirbas/claude-lifecycle" },
            { label: "Canlı demo", href: "https://ali-demirbas.github.io/claude-lifecycle/demo/journey-canvas.html" },
          ],
        },
        {
          name: "CRM Journey Arşivi",
          desc: "70 lifecycle journey incelemesi: her akış nasıl kurulur, ne test edilir, hangi KPI izlenir, hangi klasik hatadan kaçınılır.",
          meta: "70 inceleme - 5 kanal",
          links: [{ label: "Arşive göz at", href: "/tr/lab" }],
        },
      ],
      shell: {
        backToSite: "Siteye dön",
        tools: "Araçlar",
        comingSoon: "Yakında",
        soon: "Yakında",
        library: [
          { name: "CRM Journey Arşivi", desc: "70 lifecycle incelemesi", href: "/tr/lab", active: true },
          { name: "claude-lifecycle", desc: "Claude eklentisi - GitHub", href: "https://github.com/ali-demirbas/claude-lifecycle" },
          { name: "Journey Canvas", desc: "Canlı demo", href: "https://ali-demirbas.github.io/claude-lifecycle/demo/journey-canvas.html" },
        ],
        planned: [
          { name: "Push benchmark'ları", desc: "Sektöre göre gönderim saati ve CTR verisi" },
          { name: "Konu satırı lab'ı", desc: "Uplift notlarıyla test arşivi" },
          { name: "RFM playground", desc: "İnteraktif segmentasyon sahası" },
        ],
      },
      page: {
        title: "CRM Journey Arşivi",
        intro: "Sektörler ve kanallar genelinde 70 lifecycle journey incelemesi. Sektöre veya kanala göre filtrele ya da ara - her kayıt araştırıp belgelediğim bir akış.",
        searchPlaceholder: "Journey ara...",
        allSectors: "Tüm sektörler",
        allChannels: "Tüm kanallar",
        results: "journey",
        empty: "Bu filtrelerle eşleşen kayıt yok.",
        back: "Ana sayfaya dön",
      },
    },
    about: {
      metaTitle: "Hakkında - Ali Demirbaş",
      metaDesc:
        "Ali Demirbaş kimdir: sigorta, telekom, teslimat, seyahat ve otomotivde yedi yıllık mobil büyüme, CRM ve lifecycle marketing deneyimi.",
      eyebrow: "Hakkında",
      title1: "Rakamların",
      title2: "arkasındaki hikâye.",
      lead: "Otomotiv bayilerinden sigorta uygulamalarına: beş sektörde geçen yedi yılın tek bir disipline dönüşmesi - ölçülebilir büyüme.",
      bio: {
        label: "Biyografi",
        title: "Veriyle tartışan bir growth marketer.",
        paragraphs: [
          "Ben Ali Demirbaş, İstanbul'da yaşayan, mobil ürünler için çalışan bir growth marketer'ım. Yedi yılı aşkın süredir edinim, CRM ve lifecycle programlarını tahminle değil veriyle kuruyorum - beş sektörde altı markada: sigorta, telekom, teslimat, seyahat ve otomotiv.",
          "Dijital pazarlamaya otomotiv perakendesinde, Doğuş Oto'da başladım; ardından Albayrak Grubu markalarında devam ettim. Wingie Enuygun Group'ta seyahat ürünleri için lifecycle marketing'e geçtim; Getir'de q-commerce tarafında growth ve CRM analitiği üzerine çalıştım; Vodafone'da growth marketing'i yönettim. Bugün Aksigorta'da mobil uygulama büyümesine liderlik ediyorum.",
          "Bu yolda tek bir alışkanlığı hep korudum: pratiği herkese açık, yeniden kullanılabilir işe dönüştürmek. Lab bölümü buradan doğdu - kanıtlanmış kalıplardan CRM journey'leri taslaklayan açık kaynak claude-lifecycle eklentisi ve her akışın nasıl kurulduğunu, neyin test edileceğini, hangi KPI'ın izleneceğini belgeleyen 70 journey'lik inceleme arşivi.",
        ],
      },
      facts: {
        title: "Bir bakışta",
        rows: [
          { label: "Şu anki rol", value: "Mobile App Growth Lead, Aksigorta" },
          { label: "Şehir", value: "İstanbul" },
          { label: "Odak", value: "Mobil büyüme, CRM & lifecycle, analitik" },
          { label: "Sektörler", value: "Sigorta, telekom, teslimat, seyahat, otomotiv" },
        ],
        email: "Yaz bana",
        linkedin: "LinkedIn",
      },
      timeline: {
        label: "Deneyim",
        title: "Yıl yıl izlenen yol",
        intro: "Yedi yılda altı marka - her biri farklı bir sektör, disiplin hep aynı: veriyle kurulan ve karar aldıracak şekilde raporlanan programlar.",
      },
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
