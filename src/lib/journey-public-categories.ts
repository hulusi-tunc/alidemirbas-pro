import type { Lang } from "@/lib/content";

export type PublicJourneyCategory = {
  id: string;
  label: Record<Lang, string>;
  description: Record<Lang, string>;
  iconCategory: string;
  journeyIds: readonly string[];
};

/* Public browse taxonomy for the 40 reviewed journeys.
   This is intentionally separate from the canonical domain taxonomy:
   the canonical category says where a state machine belongs internally;
   this grouping says where a CRM / lifecycle practitioner would look for it. */
export const PUBLIC_JOURNEY_CATEGORIES: readonly PublicJourneyCategory[] = [
  {
    id: "acquisition-intent",
    label: { en: "Acquisition & Intent", tr: "Kazanım & Niyet" },
    description: {
      en: "Flows that turn early interest into a clearer next step before purchase.",
      tr: "Satın alma öncesindeki ilgiyi daha net bir sonraki adıma taşıyan akışlar.",
    },
    iconCategory: "acquisition",
    journeyIds: ["ACQ-09", "ACT-20", "ACQ-12", "ACQ-13", "ACQ-289", "SCH-282"],
  },
  {
    id: "activation-usage",
    label: { en: "Activation & Usage", tr: "Aktivasyon & Kullanım" },
    description: {
      en: "Flows that help a user get started, keep using the product and overcome early friction.",
      tr: "Kullanıcının başlamasını, kullanmaya devam etmesini ve ilk sürtünmeleri aşmasını sağlayan akışlar.",
    },
    iconCategory: "activation",
    journeyIds: ["ACT-14", "ACT-17", "RLT-279", "RSK-273"],
  },
  {
    id: "conversion-purchase",
    label: { en: "Conversion & Purchase", tr: "Dönüşüm & Satın Alma" },
    description: {
      en: "Flows that recover purchase intent and move customers toward a completed or repeat purchase.",
      tr: "Satın alma niyetini geri kazanan ve müşteriyi tamamlanmış ya da tekrar satın almaya taşıyan akışlar.",
    },
    iconCategory: "financial",
    journeyIds: ["ACQ-288", "ACQ-287", "RET-290", "RET-294", "RET-31", "SCH-303"],
  },
  {
    id: "retention-subscriptions",
    label: { en: "Retention & Subscriptions", tr: "Elde Tutma & Abonelik" },
    description: {
      en: "Flows for renewal, cancellation, churn risk and keeping an ongoing customer relationship healthy.",
      tr: "Yenileme, iptal, churn riski ve devam eden müşteri ilişkisini korumaya yönelik akışlar.",
    },
    iconCategory: "retention",
    journeyIds: ["RET-24", "RET-32", "SUB-163", "SUB-262", "CON-300", "ACC-261"],
  },
  {
    id: "loyalty-relationship",
    label: { en: "Loyalty & Relationship", tr: "Sadakat & İlişki" },
    description: {
      en: "Flows that build loyalty through rewards, milestones, referrals and relationship moments.",
      tr: "Ödül, seviye, davet ve dönüm noktalarıyla müşteri ilişkisini güçlendiren akışlar.",
    },
    iconCategory: "feedback",
    journeyIds: ["SUB-296", "SUB-297", "SUB-298", "SUB-299", "REL-284", "RET-292", "RET-295"],
  },
  {
    id: "transactions-delivery-support",
    label: { en: "Transactions, Delivery & Support", tr: "İşlem, Teslimat & Destek" },
    description: {
      en: "Flows that recover failed transactions, delivery problems and post-purchase issues.",
      tr: "Başarısız işlemleri, teslimat sorunlarını ve satış sonrası problemleri yöneten akışlar.",
    },
    iconCategory: "fulfillment",
    journeyIds: ["FIN-134", "FIN-302", "FUL-146", "FUL-148", "REM-151", "DOC-214", "SCH-266"],
  },
  {
    id: "feedback-communication",
    label: { en: "Feedback & Communication", tr: "Geri Bildirim & İletişim" },
    description: {
      en: "Flows for asking, routing and following up on feedback and communication permissions.",
      tr: "Geri bildirim isteme, yönlendirme, takip ve iletişim izinlerini yöneten akışlar.",
    },
    iconCategory: "consent",
    journeyIds: ["FBK-41", "FBK-43", "CON-272", "FUL-291"],
  },
];

const CATEGORY_BY_JOURNEY = new Map(
  PUBLIC_JOURNEY_CATEGORIES.flatMap((category) =>
    category.journeyIds.map((journeyId) => [journeyId, category] as const),
  ),
);

export function publicJourneyCategory(journeyId: string): PublicJourneyCategory | null {
  return CATEGORY_BY_JOURNEY.get(journeyId) ?? null;
}

export function publicJourneyCategoryLabel(journeyId: string, lang: Lang): string | null {
  return publicJourneyCategory(journeyId)?.label[lang] ?? null;
}
