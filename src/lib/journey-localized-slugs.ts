import type { Lang } from "@/lib/content";

/** Public locale-specific URL aliases. Canonical data keeps one internal slug;
 * routes and links may expose a clearer localized slug without duplicating a journey. */
const TR_SLUG_BY_ID: Readonly<Record<string, string>> = {
  "ACQ-09": "aday-musteri-gelistirme",
};

export function localizedJourneySlug(id: string, canonicalSlug: string, lang: Lang): string {
  return lang === "tr" ? (TR_SLUG_BY_ID[id] ?? canonicalSlug) : canonicalSlug;
}

export function journeyIdForLocalizedSlug(slug: string, lang: Lang): string | null {
  if (lang !== "tr") return null;
  return Object.entries(TR_SLUG_BY_ID).find(([, localized]) => localized === slug)?.[0] ?? null;
}

export const TR_LOCALIZED_JOURNEY_SLUGS = Object.values(TR_SLUG_BY_ID);
