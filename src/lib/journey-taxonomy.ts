import type { CanonicalJourney, CategoryId } from "@/canonical/types";

/* Lifecycle Stage and Goal/Use Case derivation - the two filters approved
   in the filter taxonomy audit (production/journey-filter-taxonomy-audit.md),
   now wired into the live /lab/journeys UI instead of only existing as an
   offline classification file.

   These rules are ported verbatim from
   production/generate-journey-filter-taxonomy.mjs (the audit's own
   generator script). That script stays standalone and dependency-free on
   purpose - it patches its own temp copy of src/canonical and runs outside
   the Next build, so it can't import this file. Keep the two in sync by
   hand if either changes; they're small and rarely touched. */

export type LifecycleStage =
  | "acquisition-qualification"
  | "activation-onboarding"
  | "engagement-retention"
  | "ending-closure"
  | "cross-lifecycle";

const STAGE_BY_CATEGORY: Partial<Record<CategoryId, LifecycleStage>> = {
  acquisition: "acquisition-qualification",
  activation: "activation-onboarding",
  retention: "engagement-retention",
  terminal: "ending-closure",
};

export function lifecycleStageOf(category: CategoryId): LifecycleStage {
  return STAGE_BY_CATEGORY[category] ?? "cross-lifecycle";
}

export const LIFECYCLE_STAGES: readonly LifecycleStage[] = [
  "acquisition-qualification",
  "activation-onboarding",
  "engagement-retention",
  "ending-closure",
  "cross-lifecycle",
];

export type Goal =
  | "eligibility-qualification" | "consent-permission" | "identity-verification"
  | "expiry-renewal" | "cancellation-termination" | "suspension-restoration"
  | "revocation-access-change" | "ownership-transfer" | "merge-consolidation"
  | "reconciliation-correction" | "recovery-retry" | "escalation-exception"
  | "delivery-confirmation" | "compensation-remedy" | "change-versioning"
  | "scheduling-commitment" | "decision-approval" | "risk-compliance"
  | "data-integrity" | "progression-milestone" | "review-required";

const GOAL_RULES: readonly [Goal, RegExp][] = [
  ["eligibility-qualification", /eligib|qualif/i],
  ["consent-permission", /consent|permission|preference|contactability|opt.?(in|out)/i],
  ["identity-verification", /identit|verif|authenticat/i],
  ["expiry-renewal", /expir|renew/i],
  ["cancellation-termination", /cancel|terminat|closure|closed|close\b/i],
  ["suspension-restoration", /suspen|restor|reinstat/i],
  ["revocation-access-change", /revok|entitlement|provision|deprovision|capability|credential/i],
  ["ownership-transfer", /ownership|transfer|delegat|custody|assign\b/i],
  ["merge-consolidation", /merge|consolidat|duplicate|link(ed)?\b|split\b/i],
  ["reconciliation-correction", /reconcil|correct|mismatch|discrepan|financial obligation/i],
  ["recovery-retry", /recover|retry|resume|failure|failed/i],
  ["escalation-exception", /escalat|exception|override|violation/i],
  ["delivery-confirmation", /deliver|confirm|submit|dispatch/i],
  ["compensation-remedy", /compensat|remedy|refund|credit\b|dispute|chargeback/i],
  ["change-versioning", /version|amend|supersede|migrat|rollout|deploy|cutover/i],
  ["scheduling-commitment", /schedul|reservat|appointment|slot|booking|availability/i],
  ["decision-approval", /approv|review|decision|authoris|authoriz/i],
  ["risk-compliance", /risk|complian|polic(y|ies)|block|threshold/i],
  ["data-integrity", /\bdata\b|import|parse|backfill|transform/i],
  ["progression-milestone", /onboarding|activation|adoption|progress|queue|process(ing)?\b|execution|attendance/i],
];

export function goalOf(j: Pick<CanonicalJourney, "name" | "purpose">): Goal {
  const text = j.name + " " + j.purpose;
  for (const [goal, re] of GOAL_RULES) if (re.test(text)) return goal;
  return "review-required";
}

export const GOALS: readonly Goal[] = [...GOAL_RULES.map(([g]) => g), "review-required"];
