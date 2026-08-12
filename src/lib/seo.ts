import type { Lang } from "@/lib/content";

// The domain this repo is destined for - see sitemap.ts and robots.ts, which
// point at the same origin. Ported from the cv site's own convention: every
// route publishes a canonical + EN/TR hreflang pair.
export const SITE_URL = "https://alidemirbas.com.tr";

/**
 * Canonical + hreflang alternates for a route that exists in both languages.
 * `path` is the EN path with no trailing slash ("" for home, "/about", …);
 * the TR counterpart is always the same path under /tr.
 */
export function pageAlternates(path: string, lang: Lang) {
  const en = `${SITE_URL}${path}`;
  const tr = `${SITE_URL}/tr${path}`;
  return {
    canonical: lang === "en" ? en : tr,
    // x-default falls back to English for visitors whose browser locale
    // matches neither published language.
    languages: { en, tr, "x-default": en },
  };
}
