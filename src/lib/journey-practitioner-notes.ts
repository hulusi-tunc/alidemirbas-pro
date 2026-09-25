import type { Lang } from "@/lib/content";

export type PractitionerJourneyNotes = {
  trigger: string;
  eligibility: readonly string[];
  kpis: readonly string[];
};

const NOTES: Readonly<Record<string, Readonly<Record<Lang, PractitionerJourneyNotes>>>> = {
  "ACQ-09": {
    tr: {
      trigger: "Aday müşteri oluşması veya teklif talebinin alınması.",
      eligibility: [
        "Ürün veya hizmete ilgi göstermiş ancak henüz satın almaya hazır olmayan adaylar.",
        "İletişim izni bulunan ve satış / satın alma sürecine henüz geçmemiş adaylar.",
      ],
      kpis: [
        "Yeniden etkileşim oranı",
        "Satış / conversion sürecine aktarım oranı",
        "Journey kaynaklı dönüşüm oranı",
      ],
    },
    en: {
      trigger: "A lead is captured or a quote request is received.",
      eligibility: [
        "Leads who have shown interest in the product or service but are not yet ready to buy.",
        "Leads who can be contacted and have not yet entered the sales / purchase path.",
      ],
      kpis: [
        "Re-engagement rate",
        "Sales / conversion handoff rate",
        "Journey-attributed conversion rate",
      ],
    },
  },
};

export function practitionerJourneyNotes(id: string, lang: Lang): PractitionerJourneyNotes | null {
  return NOTES[id]?.[lang] ?? null;
}
