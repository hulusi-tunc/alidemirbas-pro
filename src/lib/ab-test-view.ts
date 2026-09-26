import rawTests from "@/data/ab-tests.json";
export { primaryKpiLabel } from "@/lib/ab-test-kpi-labels";

/* The A/B test library read model. Source data is frozen (produced by the
   ab-test-playbook repo's authoring pipeline) and lives in src/data/ab-tests.json.
   This module is the only place that turns it into list rows and detail
   pages, mirroring src/lib/canonical-view.ts's separation for the journey
   library - server-only import, so the full 211-record set never reaches
   the client bundle; the list gets rows, a detail page gets its own record. */

export type SetupType = "control-vs-treatment" | "variant-vs-variant" | "option-vs-option" | "unresolved";
export type ComparisonMode = "element" | "structural" | "media";
export type Surface =
  | "pdp" | "plp" | "home" | "cart" | "checkout" | "search" | "filters" | "form"
  | "pricing" | "saas" | "mobile" | "thankyou" | "dashboard" | "generic-ui";

export type AbTestDetail = {
  id: string;
  slug: string;
  category: string;
  surface: Surface;
  question: string;
  hypothesis: string;
  setupType: SetupType;
  comparisonMode: ComparisonMode;
  differenceBehavior: string;
  testedSlot: string | null;
  primaryKpi: { label: string; explanation: string };
  otherKpis: { label: string; explanation: string }[];
  whatToTest: { label: string; explanation: string }[];
  guardrails: string[];
  sideA: { role: string; label: string | null; sourceBasis: string | null } | null;
  sideB: { role: string; label: string | null; sourceBasis: string | null } | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

const TESTS = rawTests as AbTestDetail[];

export const AB_TEST_COUNT = TESTS.length;

export const SURFACES: readonly Surface[] = [
  "pdp", "plp", "home", "cart", "checkout", "search", "filters", "form",
  "pricing", "saas", "mobile", "thankyou", "dashboard", "generic-ui",
];

export type AbTestRow = {
  id: string;
  slug: string;
  question: string;
  category: string;
  surface: Surface;
  setupType: SetupType;
  /** The card body on the gallery. Real, and the most useful sentence the
      record has short of the whole playbook. */
  hypothesis: string;
  /** Label only - the one metric that decides the winner, shown on the
      card because the playbook's first rule is that there is exactly one. */
  primaryKpi: string;
};

export const AB_TEST_ROWS: readonly AbTestRow[] = TESTS.map((r) => ({
  id: r.id, slug: r.slug, question: r.question, category: r.category, surface: r.surface, setupType: r.setupType,
  hypothesis: r.hypothesis, primaryKpi: r.primaryKpi.label,
}));

/** A category as the gallery sections it: its title (which is also its
    id - the archive has no separate code), the surfaces its tests actually
    sit on, and its count. Ordered by first appearance in the archive, so
    AB-001's category opens the page - the order the archive itself has. */
export type AbCategory = { id: string; surfaces: Surface[]; count: number };

export const AB_CATEGORIES: readonly AbCategory[] = (() => {
  const m = new Map<string, { surfaces: Set<Surface>; count: number }>();
  for (const r of TESTS) {
    const c = m.get(r.category) ?? { surfaces: new Set<Surface>(), count: 0 };
    c.surfaces.add(r.surface);
    c.count += 1;
    m.set(r.category, c);
  }
  return [...m.entries()].map(([id, c]) => ({
    id,
    surfaces: SURFACES.filter((s) => c.surfaces.has(s)),
    count: c.count,
  }));
})();

/* Surface keys are not prose, so the hyphen becomes a space and the
   acronyms - which are what most of these keys are - stay upper. No
   mapping table: that would be a second name for each surface to keep in
   sync with the data. Lived in AbTestPlaybookPage until the gallery needed
   it too. */
const ACRONYMS = new Set(["pdp", "plp", "ui", "saas"]);
export const surfaceLabel = (surface: string) =>
  surface
    .split("-")
    .map((w) => (ACRONYMS.has(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");

export const ALL_AB_TEST_SLUGS: readonly string[] = TESTS.map((r) => r.slug);

/* 21 source slugs were mechanically cut at 80 characters and several ended
   mid-word. Keep those URLs alive, but expose short, readable canonical
   slugs in the library. */
export const AB_TEST_SLUG_ALIASES: Readonly<Record<string, string>> = {
  "stokta-olmayan-urunleri-listede-gri-gosterip-birakmak-mi-tamamen-gizlemek-mi-dah": "stokta-olmayan-urunleri-gosterme",
  "bos-durumda-henuz-veri-yokken-yonlendirici-bir-aksiyon-karti-gostermek-etkilesim": "bos-durumda-aksiyon-karti",
  "kullanilmayan-bir-ozelligi-dashboard-da-tek-seferlik-bir-ipucu-kartiyla-tanitmak": "dashboard-ipucu-karti",
  "asil-formdan-once-kucuk-bir-isindirma-sorusu-sormak-tamamlama-oranini-artirir-mi": "form-oncesi-isindirma-sorusu",
  "tek-secimlik-bir-alanda-radio-button-mu-acilir-liste-dropdown-mu-daha-cok-tamaml": "radio-button-vs-dropdown",
  "sayfa-acilisinda-icerigi-kismen-kaplayan-buyuk-bir-karsilama-ekrani-ilgiyi-artir": "buyuk-karsilama-ekrani",
  "anasayfayi-tek-bir-anlati-yerine-ziyaretci-tipine-gore-ayri-bloklara-bolmek-iler": "ziyaretci-tipine-gore-anasayfa",
  "ucuncu-bir-cekici-alternatif-plan-eklemek-orta-planin-secilme-oranini-artiriyor-": "cekici-alternatif-ucuncu-plan",
  "stokta-olmayan-bir-urunun-satin-alma-butonunu-kaldirmak-mi-haber-ver-secenegi-mi": "stokta-yoksa-haber-ver",
  "satin-almadan-once-urunu-ozellestirme-imkani-sunmak-satin-alma-niyetini-artirir-": "urun-ozellestirme-secenegi",
  "urunun-uretildigi-veya-tasarlandigi-ulkeyi-gostermek-satin-alma-kararini-etkiler": "urun-koken-bilgisi",
  "paket-icerigini-benzer-fiyat-araligindaki-urunlerden-mi-farkli-fiyat-araligindak": "paket-urun-fiyat-araligi",
  "deneme-suresi-bitmeden-gonderilen-mesaji-kayip-cercevesiyle-mi-kazanim-cercevesi": "kayip-vs-kazanim-mesaji",
  "alanin-yanina-neden-soruyoruz-aciklamasi-eklemek-amaci-belirsiz-gorunen-bir-alan": "formda-neden-soruyoruz-aciklamasi",
  "satis-sayfasini-tek-sutunlu-mu-ikinci-bir-sutunla-yan-baglantilar-ek-bilgi-mi-ku": "tek-sutun-vs-iki-sutun-satis-sayfasi",
  "misafir-olarak-odeme-yapana-tesekkur-sayfasinda-hesap-olusturma-daveti-gostermek": "tesekkur-sayfasinda-hesap-daveti",
  "tesekkur-sayfasinda-arkadasini-davet-et-teklifini-gostermek-paylasim-oranini-art": "tesekkur-sayfasinda-arkadasini-davet-et",
  "siparis-onayini-rutin-bir-bilgi-ekrani-yerine-akilda-kalici-bir-an-olarak-tasarl": "siparis-onayinda-kisisellestirilmis-tesekkur",
  "buton-metnini-komut-kipiyle-mi-baslat-birinci-sahis-bildirimiyle-mi-basliyorum-y": "buton-metni-komut-vs-birinci-sahis",
  "ic-promosyon-banner-i-tek-bir-motivasyona-mi-birden-fazla-secenege-mi-odaklanmal": "promosyon-banner-tek-vs-cok-mesaj",
  "birden-fazla-secenek-arasindan-birini-gorsel-agirlikla-one-cikarmak-secimi-hizla": "secenegi-arka-plan-rengiyle-one-cikarma",
};

export const ALL_AB_TEST_ROUTE_SLUGS: readonly string[] = [
  ...ALL_AB_TEST_SLUGS,
  ...Object.keys(AB_TEST_SLUG_ALIASES),
];

export const canonicalAbTestSlug = (slug: string): string => AB_TEST_SLUG_ALIASES[slug] ?? slug;

const BY_SLUG = new Map(TESTS.map((r) => [r.slug, r]));

export function abTestDetail(slug: string): AbTestDetail | null {
  return BY_SLUG.get(canonicalAbTestSlug(slug)) ?? null;
}
