import type { GoalId } from "@/canonical/types";

/* The Journey Library's single primary discovery filter.

   Goal used to be derived at runtime by a first-match-wins regex over each
   journey's name + purpose text (production/generate-journey-filter-
   taxonomy.mjs). That approach is retired: a full semantic re-audit read
   every one of the 255 journeys individually - name, purpose, category,
   distinctFrom notes and the actual node graph - against "what problem is a
   practitioner trying to solve", and the result was written back onto each
   journey as explicit canonical metadata (`goal: GoalId` on CanonicalJourney,
   see src/canonical/types.ts and every file under src/canonical/). 144 of
   255 journeys (56.5%) ended up with a different Goal than the old regex
   produced; the full migration matrix and per-journey reasoning live in
   production/journey-goal-vocabulary-audit.

   This module now does nothing but declare the vocabulary and its display
   labels - there is no derivation logic left to keep in sync. Lifecycle
   Stage (the old second facet) is gone entirely: the corpus is 255
   independent entity state machines, not one customer's timeline, and
   forcing a cross-lifecycle axis onto journeys that aren't lifecycle-shaped
   produced an 85%-populated "cross-lifecycle" bucket that answered no real
   question. Each journey's own graph already shows its internal lifecycle. */

export type Goal = GoalId;

/** Alphabetical by English label - a 26-value single-select list is scanned,
    not memorized in frequency order. */
export const GOALS: readonly Goal[] = [
  "access-entitlement-change",
  "cancellation-termination",
  "change-versioning",
  "compensation-remedy",
  "consent-permission",
  "data-integrity",
  "decision-approval",
  "delivery-confirmation",
  "eligibility-qualification",
  "escalation-exception",
  "expiry-renewal",
  "health-risk-signal-scoring",
  "identity-verification",
  "merge-consolidation",
  "ownership-transfer",
  "progression-milestone",
  "readiness-revalidation",
  "reconciliation-correction",
  "recovery-retry",
  "relationship-hierarchy-structure",
  "relationship-recovery-intervention",
  "risk-compliance",
  "root-cause-diagnostic-correlation",
  "routing-assignment",
  "scheduling-commitment",
  "suspension-restoration",
];

export const GOAL_LABEL: Record<Goal, { en: string; tr: string }> = {
  "access-entitlement-change": { en: "Access & Entitlement Change", tr: "Erişim ve yetki değişikliği" },
  "cancellation-termination": { en: "Cancellation & Termination", tr: "İptal ve sonlandırma" },
  "change-versioning": { en: "Change & Versioning", tr: "Değişiklik ve sürümleme" },
  "compensation-remedy": { en: "Compensation & Remedy", tr: "Tazminat ve telafi" },
  "consent-permission": { en: "Consent & Permission", tr: "Onay ve izin" },
  "data-integrity": { en: "Data Integrity", tr: "Veri bütünlüğü" },
  "decision-approval": { en: "Decision & Approval", tr: "Karar ve onay" },
  "delivery-confirmation": { en: "Delivery & Confirmation", tr: "Teslimat ve onay" },
  "eligibility-qualification": { en: "Eligibility & Qualification", tr: "Uygunluk ve nitelendirme" },
  "escalation-exception": { en: "Escalation & Exception", tr: "Eskalasyon ve istisna" },
  "expiry-renewal": { en: "Expiry & Renewal", tr: "Süre dolumu ve yenileme" },
  "health-risk-signal-scoring": { en: "Health & Risk Signal Scoring", tr: "Sağlık ve risk sinyali puanlaması" },
  "identity-verification": { en: "Identity Verification", tr: "Kimlik doğrulama" },
  "merge-consolidation": { en: "Merge & Consolidation", tr: "Birleştirme ve konsolidasyon" },
  "ownership-transfer": { en: "Ownership Transfer", tr: "Sahiplik devri" },
  "progression-milestone": { en: "Progression & Milestone", tr: "İlerleme ve kilometre taşı" },
  "readiness-revalidation": { en: "Readiness & Revalidation", tr: "Hazırlık ve yeniden doğrulama" },
  "reconciliation-correction": { en: "Reconciliation & Correction", tr: "Mutabakat ve düzeltme" },
  "recovery-retry": { en: "Recovery & Retry", tr: "Kurtarma ve yeniden deneme" },
  "relationship-hierarchy-structure": { en: "Relationship & Hierarchy Structure", tr: "İlişki ve hiyerarşi yapısı" },
  "relationship-recovery-intervention": { en: "Relationship Recovery & Intervention", tr: "İlişki kurtarma ve müdahale" },
  "risk-compliance": { en: "Risk & Compliance", tr: "Risk ve uyum" },
  "root-cause-diagnostic-correlation": { en: "Root Cause & Diagnostic Correlation", tr: "Kök neden ve tanısal korelasyon" },
  "routing-assignment": { en: "Routing & Assignment", tr: "Yönlendirme ve atama" },
  "scheduling-commitment": { en: "Scheduling & Commitment", tr: "Zamanlama ve taahhüt" },
  "suspension-restoration": { en: "Suspension & Restoration", tr: "Askıya alma ve geri yükleme" },
};

const GOAL_SET: ReadonlySet<string> = new Set(GOALS);

/** Guards a query-param value before it's trusted as a Goal filter. */
export function isGoalId(value: string): value is Goal {
  return GOAL_SET.has(value);
}
