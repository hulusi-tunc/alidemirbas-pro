import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
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
