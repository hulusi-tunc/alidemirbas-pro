import type { BlogPost } from "@/lib/blog";

/* Real, authored posts - short and direct, not padded for SEO (that's a
   separate phase). No client-specific numbers or case studies from past
   employers; the frameworks are real, the illustrative figures are
   round and clearly hypothetical. */

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "ltv-cac-ratio-doesnt-tell-you-when-to-scale",
    title: "LTV:CAC alone doesn't tell you when to scale",
    excerpt:
      "A 3:1 ratio is the industry shorthand for \"healthy.\" It's a fine sanity check and a bad scaling signal on its own. Here's what to look at alongside it.",
    date: "2026-08-10",
    category: "Growth Metrics",
    topic: "Unit Economics",
    contentType: "Article",
    pullQuote:
      "A channel can post a great ratio at low volume and fall apart the moment you push more budget through it.",
    sections: [
      {
        heading: "The ratio hides its own denominator",
        body: "LTV:CAC of 3:1 gets treated as a pass/fail line, but the ratio doesn't say how fast you're allowed to spend to hit it. A channel can post a great ratio at low volume and fall apart the moment you push more budget through it, not because the unit economics changed, but because CAC on the marginal customer is rarely the same as CAC on the average one. The ratio is a snapshot of what already happened, not a forecast of what happens next.",
      },
      {
        heading: "Marginal CAC, not average CAC",
        body: "Before scaling a channel, look at what the last 10-20% of spend actually cost to acquire, not the blended average. If average CAC is $40 but the newest cohort of spend is landing closer to $65, your real ratio at the margin is worse than the dashboard number, and that's the number that decides whether the next dollar of budget is still profitable.",
      },
      {
        heading: "Payback period is the faster warning light",
        body: "LTV takes months or years to fully realize, which makes a bad LTV:CAC ratio a lagging indicator: you find out you overspent well after the money is gone. CAC payback period (how many months of gross margin it takes to recover acquisition cost) reacts faster, because you don't need the full LTV curve to know a cohort is paying back slower than the last one.",
      },
      {
        heading: "What to check before increasing spend",
        body: "Three things, in order: marginal CAC on the last spend increment, payback period trend over the last 3 cohorts, and whether retention on recent cohorts matches older ones. If all three hold, the ratio is probably telling the truth. If retention is quietly declining while CAC holds flat, the ratio will look fine right up until it doesn't.",
      },
    ],
    related: [
      { href: "/calculators/ltv-cac-ratio", label: "LTV:CAC Ratio Calculator" },
      { href: "/calculators/cac-payback-period", label: "CAC Payback Period Calculator" },
      { href: "/calculators/ltv", label: "LTV Calculator" },
    ],
    tr: {
      title: "LTV:CAC oranı tek başına ne zaman büyüyeceğini söylemez",
      excerpt:
        "3:1 oranı sektörde \"sağlıklı\" için kısayol haline geldi. Tek başına iyi bir kontrol ama kötü bir büyüme sinyali. Yanında nelere bakman gerektiği burada.",
      pullQuote:
        "Bir kanal düşük hacimde harika bir oran gösterip bütçeyi artırdığın anda dağılabilir.",
      sections: [
        {
          heading: "Oran, kendi paydasını gizler",
          body: "3:1'lik LTV:CAC bir geç/kal çizgisi gibi ele alınıyor ama oran, buna ulaşmak için ne kadar hızlı harcayabileceğini söylemiyor. Bir kanal düşük hacimde harika bir oran gösterip bütçeyi artırdığın anda dağılabilir. Sebep birim ekonominin değişmesi değil, marjinal müşterinin CAC'inin ortalama müşterininkiyle nadiren aynı olması. Oran, zaten olmuş bitmiş bir şeyin fotoğrafıdır, bundan sonra ne olacağının tahmini değil.",
        },
        {
          heading: "Ortalama değil, marjinal CAC",
          body: "Bir kanalı büyütmeden önce harmanlanmış ortalamaya değil, harcamanın son yüzde 10-20'sinin gerçekte neye mal olduğuna bak. Ortalama CAC 40 dolarsa ama en yeni harcama kohortu 65 dolara yaklaşıyorsa, marjindeki gerçek oranın dashboard'daki sayıdan daha kötü demektir. Bir sonraki bütçe dolarının hâlâ kârlı olup olmadığına karar veren sayı budur.",
        },
        {
          heading: "Geri ödeme süresi daha hızlı bir uyarı ışığıdır",
          body: "LTV'nin tam olarak gerçekleşmesi aylar, hatta yıllar sürer; bu da kötü bir LTV:CAC oranını gecikmeli bir gösterge yapar: fazla harcadığını para gittikten çok sonra fark edersin. CAC geri ödeme süresi (kazanım maliyetini geri kazanmak için kaç ay brüt marj gerektiği) çok daha hızlı tepki verir, çünkü bir kohortun bir öncekinden daha yavaş geri ödediğini görmek için LTV eğrisinin tamamına ihtiyacın yok.",
        },
        {
          heading: "Harcamayı artırmadan önce neye bakılır",
          body: "Sırasıyla üç şey: son harcama artışındaki marjinal CAC, son 3 kohorttaki geri ödeme süresi trendi ve yeni kohortların elde tutmasının eski kohortlarla eşleşip eşleşmediği. Üçü de yerindeyse oran muhtemelen doğruyu söylüyordur. CAC sabit kalırken elde tutma sessizce düşüyorsa, oran bozulana kadar iyi görünmeye devam eder.",
        },
      ],
      related: [
        { href: "/tr/calculators/ltv-cac-ratio", label: "LTV:CAC Oranı Hesaplayıcısı" },
        { href: "/tr/calculators/cac-payback-period", label: "CAC Geri Ödeme Süresi Hesaplayıcısı" },
        { href: "/tr/calculators/ltv", label: "LTV Hesaplayıcısı" },
      ],
      topic: "Birim Ekonomisi",
    },
  },
  {
    slug: "reading-d1-d7-d30-retention-without-fooling-yourself",
    title: "Reading D1/D7/D30 retention without fooling yourself",
    excerpt:
      "The most common retention-reporting mistake isn't a bad number. It's comparing cohorts that were never comparable to begin with.",
    date: "2026-08-14",
    category: "Growth Metrics",
    topic: "Retention",
    contentType: "Article",
    pullQuote:
      "A curve that's still falling at D30 has a different problem than one that's flat by D7 at a lower level than you'd like.",
    sections: [
      {
        heading: "A curve, not a single number",
        body: "D1/D7/D30 retention gets reported as three numbers, but they only mean something as a curve. A product with steep D1 drop-off and a flat tail from D7 onward has a very different retention story than one with a slow, steady decline all the way to D30, even if the D30 number lands in the same place. Report the shape, not just the endpoints.",
      },
      {
        heading: "Cohort contamination is the usual culprit",
        body: "The classic mistake: comparing this month's D7 retention to last month's, when this month's acquisition mix shifted toward a channel that brings in lower-intent users. The retention number moved, but the story isn't \"retention got worse.\" It's \"the population changed.\" Always segment retention by acquisition source before concluding anything about product changes.",
      },
      {
        heading: "Day-of-week and seasonality distort short windows",
        body: "D1 retention measured from a Friday acquisition looks different from D1 measured from a Tuesday one, for reasons that have nothing to do with the product. Short windows are more sensitive to this than long ones. If you're tracking D1 weekly, expect noise; don't react to a single week's dip without checking what day of week drove the cohort.",
      },
      {
        heading: "What a healthy curve looks like",
        body: "Steep early drop-off is normal. Most products lose 60-80% of users by D7, and that's not automatically a crisis. What matters is where the curve flattens. A curve that's still falling at D30 has a different problem than one that's flat by D7 at a lower level than you'd like. The first is a retention problem; the second might be an acquisition-quality problem.",
      },
    ],
    related: [
      { href: "/calculators/retention-rate", label: "Retention Rate Calculator" },
      { href: "/calculators/logo-churn", label: "Logo Churn Calculator" },
      { href: "/calculators/nrr", label: "Net Revenue Retention (NRR) Calculator" },
    ],
    tr: {
      title: "D1/D7/D30 elde tutmayı kendini kandırmadan okumak",
      excerpt:
        "Elde tutma raporlamasındaki en yaygın hata kötü bir sayı değil. Baştan beri karşılaştırılamaz kohortları karşılaştırmak.",
      pullQuote:
        "D30'da hâlâ düşmeye devam eden bir eğri, D7'de istediğinden daha düşük bir seviyede düzleşen eğriden farklı bir soruna işaret eder.",
      sections: [
        {
          heading: "Tek bir sayı değil, bir eğri",
          body: "D1/D7/D30 elde tutma üç ayrı sayı olarak raporlanır ama bir anlam ifade etmeleri için bir eğri olarak okunmaları gerekir. D1'de sert bir düşüş yaşayıp D7'den sonra düzleşen bir ürünle, D30'a kadar yavaş ve istikrarlı düşen bir ürün, D30 sayısı aynı yere denk gelse bile çok farklı bir elde tutma hikayesi anlatır. Sadece uç noktaları değil, şekli raporla.",
        },
        {
          heading: "Kohort kirlenmesi genelde asıl suçludur",
          body: "Klasik hata: bu ayki kazanım karması daha düşük niyetli kullanıcı getiren bir kanala kaydığında, bu ayın D7 elde tutmasını geçen ayla karşılaştırmak. Elde tutma sayısı değişti ama hikaye \"elde tutma kötüleşti\" değil, \"nüfus değişti\"dir. Üründeki bir değişiklik hakkında herhangi bir sonuca varmadan önce elde tutmayı her zaman kazanım kaynağına göre segmentlere ayır.",
        },
        {
          heading: "Haftanın günü ve mevsimsellik kısa pencereleri bozar",
          body: "Cuma günü kazanılan bir kohorttan ölçülen D1 elde tutma, Salı günü kazanılandan, ürünle hiçbir ilgisi olmayan sebeplerle farklı görünür. Kısa pencereler buna uzun pencerelerden daha duyarlıdır. D1'i haftalık takip ediyorsan gürültü bekle; kohortu hangi günün oluşturduğuna bakmadan tek bir haftalık düşüşe tepki verme.",
        },
        {
          heading: "Sağlıklı bir eğri neye benzer",
          body: "Erken dönemde sert düşüş normaldir. Çoğu ürün D7'ye kadar kullanıcılarının yüzde 60-80'ini kaybeder ve bu otomatik olarak bir kriz değildir. Önemli olan eğrinin nerede düzleştiğidir. D30'da hâlâ düşmeye devam eden bir eğri, D7'de istediğinden daha düşük bir seviyede düzleşen eğriden farklı bir soruna işaret eder. Birincisi bir elde tutma sorunu; ikincisi bir kazanım kalitesi sorunu olabilir.",
        },
      ],
      related: [
        { href: "/tr/calculators/retention-rate", label: "Elde Tutma Oranı Hesaplayıcısı" },
        { href: "/tr/calculators/logo-churn", label: "Logo Churn Hesaplayıcısı" },
        { href: "/tr/calculators/nrr", label: "Net Gelir Elde Tutma (NRR) Hesaplayıcısı" },
      ],
      topic: "Elde Tutma",
    },
  },
  {
    slug: "why-your-roas-looks-different-on-every-ad-platform",
    title: "Why your ROAS looks different on every ad platform",
    excerpt:
      "Same campaign, same spend, three different ROAS numbers depending on which platform's dashboard you're reading. The formula isn't the problem. The attribution window is.",
    date: "2026-08-18",
    category: "Growth Metrics",
    topic: "Advertising",
    contentType: "Article",
    pullQuote: "Neither number is wrong; they're answering different questions.",
    sections: [
      {
        heading: "ROAS is simple; attribution isn't",
        body: "The formula is one line: revenue from ads divided by ad spend. What varies between platforms is what counts as \"revenue from ads\" in the first place, and that's entirely a function of the attribution window each platform defaults to, which is rarely the same window as your own analytics tool uses.",
      },
      {
        heading: "Click windows vs. view windows",
        body: "A platform crediting a 7-day click / 1-day view window will report a different ROAS than one crediting 28-day click / 7-day view, for the exact same spend and the exact same underlying purchases, because the second window catches more conversions and attributes them back to the ad. Neither number is wrong; they're answering different questions.",
      },
      {
        heading: "Last-click vs. multi-touch",
        body: "If a user sees an ad on platform A, then converts after a search on platform B, both platforms may claim full credit under their own last-touch model. Add up ROAS across every platform's own dashboard and the total revenue claimed can exceed 100% of what you actually made. That's not fraud; it's each platform crediting itself under its own rules.",
      },
      {
        heading: "Pick one source of truth for cross-channel comparison",
        body: "Use each platform's own ROAS to optimize within that platform; it's internally consistent for that purpose. But when comparing channels against each other, pull revenue from one attribution source (your own analytics, ideally with a consistent window) rather than trusting each platform's self-reported number. Otherwise you're not comparing channels, you're comparing attribution models.",
      },
    ],
    related: [
      { href: "/calculators/roas", label: "ROAS Calculator" },
      { href: "/calculators/cac", label: "CAC Calculator" },
      { href: "/calculators/cpc", label: "CPC Calculator" },
    ],
    tr: {
      title: "ROAS'ın her reklam platformunda neden farklı göründüğü",
      excerpt:
        "Aynı kampanya, aynı harcama, hangi platformun panosuna baktığına göre üç farklı ROAS sayısı. Sorun formül değil. Atıf penceresi.",
      pullQuote: "İki sayı da yanlış değil; farklı sorulara cevap veriyorlar.",
      sections: [
        {
          heading: "ROAS basit; atıf değil",
          body: "Formül tek satır: reklamdan gelen gelirin reklam harcamasına bölümü. Platformlar arasında değişen şey, \"reklamdan gelen gelir\"in aslında ne sayıldığı; bu da tamamen her platformun varsayılan atıf penceresine bağlı ve bu pencere kendi analitik aracının kullandığı pencereyle nadiren aynı.",
        },
        {
          heading: "Tıklama pencereleri ve görüntülenme pencereleri",
          body: "7 günlük tıklama / 1 günlük görüntülenme penceresi kullanan bir platform, aynı harcama ve aynı satın almalar için 28 günlük tıklama / 7 günlük görüntülenme penceresi kullanan bir platformdan farklı bir ROAS raporlar, çünkü ikinci pencere daha fazla dönüşümü yakalayıp reklama mal eder. İki sayı da yanlış değil; farklı sorulara cevap veriyorlar.",
        },
        {
          heading: "Son tıklama ve çoklu temas",
          body: "Bir kullanıcı A platformunda bir reklam görüp B platformunda arama yaptıktan sonra dönüşüm gerçekleştirirse, iki platform da kendi son-temas modeline göre tüm krediyi kendine yazabilir. Her platformun kendi panosundaki ROAS'ları toplarsan, iddia edilen toplam gelir gerçekte kazandığının yüzde 100'ünü aşabilir. Bu hile değil; her platformun kendi kurallarına göre kendini kredilendirmesi.",
        },
        {
          heading: "Kanallar arası karşılaştırma için tek bir doğru kaynak seç",
          body: "Bir platform içinde optimizasyon yaparken o platformun kendi ROAS'ını kullan; bu amaç için içsel olarak tutarlıdır. Ama kanalları birbiriyle karşılaştırırken, her platformun kendi bildirdiği sayıya güvenmek yerine geliri tek bir atıf kaynağından (tercihen tutarlı bir pencereyle kendi analitiğinden) çek. Aksi halde kanalları değil, atıf modellerini karşılaştırıyorsundur.",
        },
      ],
      related: [
        { href: "/tr/calculators/roas", label: "ROAS Hesaplayıcısı" },
        { href: "/tr/calculators/cac", label: "Müşteri Kazanım Maliyeti (CAC) Hesaplayıcısı" },
        { href: "/tr/calculators/cpc", label: "CPC Hesaplayıcısı" },
      ],
      topic: "Reklamcılık",
    },
  },
  {
    slug: "what-belongs-in-a-lifecycle-journey-vs-a-campaign",
    title: "What actually belongs in a lifecycle journey vs. a one-off campaign",
    excerpt:
      "Not every recurring message needs a journey behind it, and not every journey should be built like a campaign. The difference is what decides whether someone enters.",
    date: "2026-08-21",
    category: "Lifecycle & CRM",
    topic: "Lifecycle Marketing",
    contentType: "Article",
    pullQuote:
      "If your \"journey\" only ever runs once, on a schedule, for a static list - it's a campaign wearing a journey's name.",
    sections: [
      {
        heading: "The entry condition is the whole difference",
        body: "A campaign enters a fixed audience at a fixed time: everyone who matches a segment, on this date. A journey enters people continuously, as they meet a condition: everyone who abandons a cart, whenever that happens. If your \"journey\" only ever runs once, on a schedule, for a static list - it's a campaign wearing a journey's name.",
      },
      {
        heading: "Journeys are for conditions that recur; campaigns are for moments",
        body: "A price drop on a wishlisted item recurs indefinitely and unpredictably: that's a journey. A Black Friday sale happens once a year on a known date: that's a campaign, even if you send it through the same tool. Building a Black Friday journey with an entry condition of \"date equals November 28\" just adds orchestration overhead a scheduled send didn't need.",
      },
      {
        heading: "The trap: journeys that never exit anyone",
        body: "A journey needs an exit condition as much as an entry one. Cart abandonment recovery has to stop the moment someone purchases. If it doesn't, you've built a journey that keeps messaging people about a decision they already made. The exit condition is usually the same event that would have made the campaign version's next send irrelevant.",
      },
      {
        heading: "A quick test before you build one",
        body: "Ask: does this need to check a condition on an ongoing basis, or does it need to reach a list on a given day? If the answer is \"ongoing basis,\" it's a journey: build the entry and exit conditions first, content second. If it's \"a given day,\" save the orchestration complexity and send it as a campaign.",
      },
    ],
    related: [
      { href: "/lab/journeys", label: "Journey Library" },
      { href: "/calculators/funnel-analysis-multistep", label: "Multi-Step Funnel Analysis Calculator" },
      { href: "/calculators/cr", label: "Conversion Rate Calculator" },
    ],
    tr: {
      title: "Bir yaşam döngüsü journey'sine mi, tek seferlik bir kampanyaya mı ait",
      excerpt:
        "Her tekrarlanan mesajın arkasında bir journey olması gerekmez, her journey de bir kampanya gibi kurulmamalı. Aradaki fark, birinin ne zaman gireceğini belirleyen şey.",
      pullQuote:
        "Journey'in sadece bir kez, belirli bir tarihte, sabit bir liste için çalışıyorsa, journey adını taşıyan bir kampanyadır.",
      sections: [
        {
          heading: "Giriş koşulu tüm farkı yaratır",
          body: "Bir kampanya sabit bir kitleye sabit bir zamanda girer: bu tarihte, bir segmente uyan herkes. Bir journey ise insanları bir koşulu karşıladıkları anda, sürekli olarak içine alır: ne zaman olursa olsun, sepetini terk eden herkes. Journey'in sadece bir kez, belirli bir tarihte, sabit bir liste için çalışıyorsa, journey adını taşıyan bir kampanyadır.",
        },
        {
          heading: "Journey'ler tekrarlanan koşullar için, kampanyalar anlar için",
          body: "İstek listesindeki bir üründe fiyat düşüşü belirsiz aralıklarla, sonsuza kadar tekrarlanır: bu bir journey'dir. Black Friday indirimi yılda bir kez, bilinen bir tarihte olur: aynı araçtan gönderilse bile bu bir kampanyadır. \"Tarih 28 Kasım'a eşit\" giriş koşuluyla bir Black Friday journey'i kurmak, planlanmış bir gönderimin ihtiyaç duymadığı bir orkestrasyon yükü ekler.",
        },
        {
          heading: "Tuzak: kimseyi hiç çıkarmayan journey'ler",
          body: "Bir journey'in giriş koşulu kadar bir çıkış koşuluna da ihtiyacı var. Sepet terk kurtarma, biri satın alma yaptığı anda durmalı. Durmuyorsa, insanlara zaten verdikleri bir karar hakkında mesaj göndermeye devam eden bir journey kurmuşsundur demektir. Çıkış koşulu genelde, kampanya versiyonunun bir sonraki gönderimini anlamsız kılacak olan olayın kendisidir.",
        },
        {
          heading: "Kurmadan önce hızlı bir test",
          body: "Şunu sor: bu, bir koşulu sürekli mi kontrol etmeli, yoksa belirli bir günde bir listeye mi ulaşmalı? Cevap \"sürekli\" ise bu bir journey'dir: önce giriş ve çıkış koşullarını, sonra içeriği kur. Cevap \"belirli bir gün\" ise orkestrasyon karmaşasından kaçın ve bunu bir kampanya olarak gönder.",
        },
      ],
      related: [
        { href: "/tr/lab/journeys", label: "Journey Kütüphanesi" },
        { href: "/tr/calculators/funnel-analysis-multistep", label: "Çok Adımlı Huni Analizi Hesaplayıcısı" },
        { href: "/tr/calculators/cr", label: "Dönüşüm Oranı Hesaplayıcısı" },
      ],
      topic: "Yaşam Döngüsü Pazarlaması",
    },
  },
  {
    slug: "the-guardrail-metric-most-ab-tests-forget",
    title: "The guardrail metric most A/B tests forget",
    excerpt:
      "A test can win on its primary metric and still be a net loss for the business. Guardrails exist to catch exactly that, and they're the first thing a rushed test setup skips.",
    date: "2026-08-23",
    category: "Experimentation",
    topic: "A/B Testing",
    contentType: "Article",
    pullQuote:
      "The primary metric decides who wins; the guardrail decides whether the win is allowed to count.",
    sections: [
      {
        heading: "Winning the metric you're watching isn't the same as winning",
        body: "A checkout redesign that lifts conversion rate by removing a coupon-code field can look like an unambiguous win, until refund rate climbs, because customers who would have used a valid code now feel like they overpaid. The primary metric moved in the right direction; the business didn't necessarily come out ahead.",
      },
      {
        heading: "A guardrail is a metric that must not get worse",
        body: "It's not a second goal; it's a constraint. The primary metric decides who wins; the guardrail decides whether the win is allowed to count. Common guardrails: margin (a discount-heavy variant can win on conversion and lose on profit), refund/support-ticket rate, page speed, and anything related to accessibility or legal consent.",
      },
      {
        heading: "Pick the guardrail before you see results, not after",
        body: "If you only look for a guardrail metric after the primary metric wins, you'll find a reason to ignore it; confirmation bias works exactly that efficiently. Guardrails need to be named in the test plan up front, with a pre-agreed threshold for what counts as \"got worse enough to matter,\" before a single result comes in.",
      },
      {
        heading: "One exception to \"don't peek early\"",
        body: "The standard rule is to decide sample size or duration up front and look once, to avoid inflating false positives from repeated checking. The one carve-out: a guardrail metric breaking visibly mid-test is a reason to stop early. You're not stopping because the primary metric looks good. You're stopping because the constraint failed, which is a different decision with different statistics behind it.",
      },
    ],
    related: [
      { href: "/lab/ab-testing", label: "A/B Test Playbook" },
      { href: "/calculators/ab-test", label: "A/B Test Significance Calculator" },
      { href: "/calculators/sample-size-calculator", label: "Sample Size Calculator" },
    ],
    tr: {
      title: "Çoğu A/B testinin unuttuğu guardrail metriği",
      excerpt:
        "Bir test birincil metriğinde kazanabilir ve yine de işletme için net bir kayıp olabilir. Guardrail'ler tam olarak bunu yakalamak için var ve aceleye getirilmiş bir test kurulumunun ilk atladığı şey onlar.",
      pullQuote:
        "Birincil metrik kazananı belirler; guardrail ise bu kazancın sayılıp sayılmayacağına karar verir.",
      sections: [
        {
          heading: "İzlediğin metriği kazanmak, kazanmakla aynı şey değil",
          body: "Kupon kodu alanını kaldırarak dönüşüm oranını artıran bir ödeme sayfası yenilemesi, iade oranı yükselene kadar net bir kazanç gibi görünebilir; çünkü geçerli bir kod kullanacak müşteriler artık fazla ödediklerini hissediyordur. Birincil metrik doğru yönde hareket etti ama işletme mutlaka kârlı çıkmadı.",
        },
        {
          heading: "Guardrail, kötüleşmemesi gereken bir metriktir",
          body: "İkinci bir hedef değil, bir kısıtlama. Birincil metrik kazananı belirler; guardrail ise bu kazancın sayılıp sayılmayacağına karar verir. Yaygın guardrail'ler: marj (indirim ağırlıklı bir varyant dönüşümü kazanıp kârı kaybedebilir), iade/destek talebi oranı, sayfa hızı ve erişilebilirlik ya da yasal onayla ilgili her şey.",
        },
        {
          heading: "Guardrail'i sonuçları görmeden önce seç, sonra değil",
          body: "Bir guardrail metriğini sadece birincil metrik kazandıktan sonra ararsan, onu görmezden gelmek için bir sebep bulursun; doğrulama yanlılığı tam olarak bu kadar etkili çalışır. Guardrail'lerin, tek bir sonuç gelmeden önce, \"önemli ölçüde kötüleşme\" sayılacak eşik üzerinde önceden anlaşılmış olarak test planında baştan belirlenmesi gerekir.",
        },
        {
          heading: "\"Erken bakma\" kuralının tek istisnası",
          body: "Standart kural, örneklem büyüklüğüne veya süreye baştan karar verip tekrar tekrar kontrol etmenin yanlış pozitifleri şişirmesini önlemek için bir kez bakmaktır. Tek istisna: test ortasında bir guardrail metriğinin görünür şekilde bozulması, erken durmak için bir sebeptir. Birincil metrik iyi göründüğü için durmuyorsun. Kısıtlama başarısız olduğu için duruyorsun ve bu, arkasında farklı istatistikler olan farklı bir karar.",
        },
      ],
      related: [
        { href: "/tr/lab/ab-testing", label: "A/B Test Playbook" },
        { href: "/tr/calculators/ab-test", label: "A/B Test Anlamlılık Hesaplayıcısı" },
        { href: "/tr/calculators/sample-size-calculator", label: "Örneklem Büyüklüğü Hesaplayıcısı" },
      ],
      topic: "A/B Test",
    },
  },
];
