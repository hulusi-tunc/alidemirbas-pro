/* Interactive text tools that aren't formula calculators (no compute
   function, no catalog entry) - kept separate from the Phase 1 catalog
   on purpose; see calc-catalog.ts's header note. Moved out of the old
   src/lib/calculators.ts, which Phase 2 retired in favor of the
   catalog + calc-registry engine. */
import type { Lang } from "@/lib/content";

export const TEXT_TOOLS: readonly { slug: string; title: { en: string; tr: string }; desc: { en: string; tr: string } }[] = [
  {
    slug: "utm-builder",
    title: { en: "UTM Builder", tr: "UTM Oluşturucu" },
    desc: { en: "Adds source, medium, campaign, and content parameters to a URL.", tr: "Bir bağlantıya kaynak, mecra, kampanya ve içerik parametreleri ekler." },
  },
  {
    slug: "character-counter",
    title: { en: "Character Counter", tr: "Karakter Sayacı" },
    desc: { en: "Counts characters and words against common ad and metadata limits.", tr: "Metni karakter ve kelime bazında ölçer ve yaygın uzunluk sınırlarıyla karşılaştırır." },
  },
];

export const TEXT_TOOL_SLUGS: readonly string[] = TEXT_TOOLS.map((t) => t.slug);
export type { Lang };
