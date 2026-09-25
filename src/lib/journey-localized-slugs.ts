import type { Lang } from "@/lib/content";

const TR_SLUG_BY_ID: Readonly<Record<string, string>> = {
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
