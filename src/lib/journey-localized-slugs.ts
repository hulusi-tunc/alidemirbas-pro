import type { Lang } from "@/lib/content";

const TR_SLUG_BY_ID: Readonly<Record<string, string>> = {
  "RET-31": "tahmini-yenileme-hatirlatmasi",
  "RET-32": "eski-musteriyi-geri-kazanma",
  "CON-272": "iletisim-izni-kurtarma",
  "RET-290": "ilk-alisveristen-ikinciye",
  "RET-292": "ilk-satin-alma-yil-donumu",
  "RET-294": "tamamlayici-teklif",
  "RET-295": "dogum-gunu-ve-donum-noktasi",
  "CON-300": "yanit-vermeyen-aboneyi-sonlandirma",
  "FBK-41": "geri-bildirim-talebi",
  "FBK-43": "geri-bildirim-takibi",
  "ACC-261": "odeme-gecikmesi-ve-erisim-kisiti",
  "REL-284": "arkadas-daveti-odulu",
  "FIN-134": "basarisiz-odemeyi-kurtarma",
  "FIN-302": "iade-sonrasi-geri-kazanim",
  "FUL-146": "teslimat-gecikmesi-yonetimi",
  "FUL-148": "basarisiz-teslimat-kurtarma",
  "FUL-291": "satin-alma-sonrasi-takip",
  "REM-151": "satis-sonrasi-sorun-cozumu",
  "SCH-266": "randevu-hatirlatmasi",
  "SCH-282": "musaitlik-arama-terki",
  "SCH-303": "rezervasyon-odeme-hatirlatmasi",
  "SUB-163": "yenileme-hatirlatmasi",
  "SUB-262": "iptal-onayi",
  "SUB-296": "sadakat-programi-aktivasyonu",
  "SUB-297": "kullanilmayan-sadakat-odulu",
  "SUB-298": "odul-onayi",
  "SUB-299": "sadakat-seviyesi-degisimi",
  "DOC-214": "eksik-belge-takibi",
  "RLT-279": "yukseltme-tamamlama-hatirlatmasi",
  "RSK-273": "kullanim-limiti-yonetimi",
  "ACQ-01": "anonim-niyeti-nitelendirme",
  "ACQ-02": "ilgiyi-nitelendirme",
  "ACQ-03": "niyet-yukseltme",
  "ACQ-04": "yuksek-niyetli-lead-yonlendirme",
  "ACQ-05": "nitelik-durumu-yonlendirme",
  "ACQ-06": "uygunlugu-yeniden-degerlendirme",
  "ACQ-07": "niyet-zayiflamasi",
  "ACQ-08": "kazanim-sonrasi-devir",
  "ACQ-10": "ticari-ret-yonlendirme",
  "ACQ-285": "ilk-lead-temasi",
  "ACT-11": "onboarding-rotasi-secimi",
  "ACT-12": "onboarding-sonraki-adim",
  "ACT-13": "aktivasyon-engelini-cozme",
  "ACT-16": "onboarding-tamamlama-ve-devir",
  "ACT-18": "adoption-durgunlugunu-cozme",
  "ACQ-09": "satin-alma-niyetini-guclendirme",
  "ACQ-12": "kaydedilen-urun-hatirlatmasi",
  "ACQ-13": "urun-inceleme-sonrasi-hatirlatma",
  "ACQ-287": "checkout-tamamlama",
  "ACQ-288": "sepet-hatirlatma",
  "ACQ-289": "stok-bildirimi",
  "ACT-14": "onboarding-yardimi",
  "ACT-17": "kullanim-aliskanligi-gelistirme",
  "ACT-20": "pasif-leadi-yeniden-aktiflestirme",
  "RET-24": "churn-riski-yonetimi",
};

export function localizedJourneySlug(id: string, canonicalSlug: string, lang: Lang): string {
  return lang === "tr" ? (TR_SLUG_BY_ID[id] ?? canonicalSlug) : canonicalSlug;
}

export function journeyIdForLocalizedSlug(slug: string, lang: Lang): string | null {
  if (lang !== "tr") return null;
  return Object.entries(TR_SLUG_BY_ID).find(([, value]) => value === slug)?.[0] ?? null;
}

export const TR_LOCALIZED_JOURNEY_SLUGS = Object.values(TR_SLUG_BY_ID);

export const TR_REPLACED_CANONICAL_SLUGS: readonly string[] = [
  "predicted-need-replenishment",
  "lapsed-customer-win-back",
  "contactability-repair",
  "first-purchase-welcome",
  "first-purchase-anniversary",
  "complementary-next-offer",
  "milestone-recognition",
  "unengaged-sunset",
  "feedback-eligibility",
  "feedback-routing-and-loop-closure",
  "access-restriction-route-back",
  "relationship-invitation",
  "payment-failure-recovery",
  "refund-notification",
  "fulfillment-delay",
  "delivery-attempt-failure",
  "post-purchase-follow-up",
  "post-completion-issue",
  "appointment-readiness-reminder",
  "availability-searched-no-booking",
  "reservation-payment-reminder",
  "renewal-decision",
  "cancellation-wind-down-notice",
  "loyalty-welcome",
  "loyalty-nurture",
  "reward-confirmation",
  "loyalty-tier-change",
  "document-distribution",
  "upgrade-blocker-prompt",
  "usage-limit-capacity-path",
  "anonymous-intent-to-qualified-entry",
  "captured-interest-to-destination",
  "intent-escalation-handoff",
  "high-intent-human-or-automated-route",
  "qualification-state-change-routing",
  "dynamic-eligibility-consequence",
  "intent-decay-cooldown",
  "destination-reached-acquisition-suppression",
  "commercial-decline-reason-routing",
  "captured-interest-first-touch",
  "onboarding-route-selection",
  "onboarding-progress-next-step",
  "activation-blocker-resolution",
  "activation-stops-onboarding",
  "adoption-stall-diagnosis",
  "bounded-education-progress-or-sunset",
  "abandoned-selection-recovery",
  "unresolved-interest-recovery",
  "checkout-abandonment",
  "cart-abandonment",
  "back-in-stock-alert",
  "struggling-user-assistance",
  "early-adoption-to-stable-use",
  "dormant-non-customer-reactivation",
  "churn-risk-escalation",
];

/** The path of a journey's detail page in `lang` (2026-09-26). The Turkish
    route serves only the localized slug for the journeys above, so a Turkish
    link built from the canonical slug is a 404 - every list card, hand-off
    link, breadcrumb, canonical tag and sitemap entry went through that path
    until this helper existed. Every link to a journey is built here. */
export function journeyPath(lang: Lang, id: string, canonicalSlug: string): string {
  return `${lang === "en" ? "" : "/tr"}/lab/journeys/${localizedJourneySlug(id, canonicalSlug, lang)}`;
}
