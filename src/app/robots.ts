import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    /* Still `allow`, even though the whole site is noindex (see the root
       layouts' own note): a crawler has to be able to FETCH a page to read
       the noindex tag on it. Disallowing here would leave anything already
       indexed stuck in the index with no way to learn it should come out.
       The sitemap below stays for the same reason - it is what gets the
       existing URLs re-crawled so the noindex is picked up. */
    rules: [
      { userAgent: "*", allow: "/" },
      // Explicit allow for the AI crawlers that power citations in AI
      // Overviews, ChatGPT search, and Perplexity - redundant with the
      // wildcard rule above today, but future rule changes here won't
      // silently cut off AI visibility for a site whose own subject matter
      // is AI tooling.
      { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot"], allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
