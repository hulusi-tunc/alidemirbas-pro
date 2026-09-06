# Silent Lifecycle States — readiness matrix

Generated mechanically from `lifecycle-state-contracts.json` (source of truth for the counts
below); see `LIFECYCLE-STATES-AUDIT.md` for the full per-state narrative and
`build/build-matrix.mjs` in the scratch build directory for how this table is derived. "Canonical
change?" is "No" for all 64 states — this round found zero gaps requiring a change to
`src/canonical/*.ts`; every finding is resolvable at the implementation-contract layer.

Totals: 64 states — READY 0, READY_WITH_MAPPING 64,
NEEDS_CONTRACT_WORK 0, NEEDS_CANONICAL_CHANGE 0. P0 0, P1 3, P2
42, total findings 45.

| State | Readiness | P0 | P1 | P2 | Main gap | Canonical change? |
|---|---|---|---|---|---|---|
| ACC-71 (Entitlement Qualification) | READY_WITH_MAPPING | 0 | 0 | 1 | [correction] Entity note references two expiries/two revocations as a failure mode reconciliation prevents, impl… | No |
| ACC-78 (Access Suspension) | READY_WITH_MAPPING | 0 | 0 | 1 | [observability] c.review's human decision (extend/lift/escalate) names no reviewer/owner field. | No |
| ACC-79 (Capability Restoration) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| ACQ-01 (Anonymous Identity Resolution) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| ACQ-02 (Interest Qualification Routing) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| ACQ-03 (Intent Escalation Handoff) | READY_WITH_MAPPING | 0 | 0 | 1 | [observability] The specific evidence that made c.strength judge a signal real (vs. noise) is not retained as data … | No |
| ACQ-05 (Qualification State Routing) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| ACQ-06 (Eligibility Recalculation) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| ACQ-07 (Intent Decay) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| ACQ-08 (Acquisition Exit Handoff) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| ACQ-10 (Commercial Decline Routing) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| ACT-16 (Onboarding Completion Handoff) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| CON-31 (Permission Validation) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| CON-32 (Preference Capture) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| CON-33 (Preference Recalculation) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| CON-38 (Communication Suppression) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| FBK-48 (Declared Context Recalculation) | READY_WITH_MAPPING | 0 | 1 | 0 | [config] a.volatile's revalidation condition has no bound attribute or ConfigRef despite the graph's own tex… | No |
| FBK-50 (Relationship State Reassessment) | READY_WITH_MAPPING | 0 | 0 | 2 | [observability] x.owned names no owner field. | No |
| FIN-131 (Financial Obligation Tracking) | READY_WITH_MAPPING | 0 | 0 | 1 | [instance] implementation.attributes.required names only obligation_id and obligation_log, while a.record's ow… | No |
| FIN-136 (Balance Reconciliation) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| FUL-141 (Fulfillment Request Validation) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| FUL-142 (Fulfillment Allocation) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| FUL-143 (Resource Reservation) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| FUL-144 (Fulfillment Execution) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| FUL-145 (Fulfillment Exception Recovery) | READY_WITH_MAPPING | 0 | 0 | 1 | [observability] w.approval names no approver field. | No |
| FUL-147 (Delivery Outcome Tracking) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| FUL-149 (Delivery Acceptance Finalization) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| FUL-150 (Fulfillment Cancellation Reconciliation) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| IDN-87 (Authentication Risk Assessment) | READY_WITH_MAPPING | 0 | 1 | 0 | [handoff] h.security -> IDN-90 missing incident_id resolution (IDN-88's identical handoff into the same targe… | No |
| IDN-88 (Account Recovery Verification) | READY_WITH_MAPPING | 0 | 0 | 1 | [observability] h.review names no reviewer field (same pattern as ACC-78). | No |
| IDN-89 (Identity Attribute Update) | READY_WITH_MAPPING | 0 | 0 | 1 | [idempotency] a.verify carries neither an idempotencyKey nor a writes entry; it only triggers the wait. | No |
| IDN-90 (Account Compromise Recovery) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.review -> DEC-181 has no contract block. | No |
| REL-100 (Orphan Relationship Recovery) | READY_WITH_MAPPING | 0 | 0 | 2 | [handoff] h.manual and h.escalate omit contract blocks. | No |
| REL-91 (Relationship Validation) | READY_WITH_MAPPING | 0 | 1 | 1 | [config] x.pending has no wait node, timeout, or SLA -- a relationship can sit PENDING_EVIDENCE indefinitely… | No |
| REL-92 (Relationship Impact Recalculation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.ownership and h.entitlement both omit contract blocks. | No |
| REL-93 (Entity Relationship End Reconciliation) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| REL-94 (Role Authority Update) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.authority and h.entitlement omit contract blocks. | No |
| REM-156 (Corrective Reperformance) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.verify, h.alternative, h.escalate all omit contract blocks. | No |
| RET-21 (Engagement Reclassification) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.health -> RET-23 omits a contract block. | No |
| RET-22 (Usage Gap Assessment) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| RET-23 (Health Deterioration Diagnosis) | READY_WITH_MAPPING | 0 | 0 | 2 | [conflict] The stated RET-23/RET-24 coexistence is documented in prose only, not as a ConflictRef. | No |
| RET-27 (Recovery Stability Check) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.rediagnose -> RET-23 omits a contract block. | No |
| RET-29 (Cancellation Wind-Down) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| SCH-172 (Temporary Slot Hold) | READY_WITH_MAPPING | 0 | 0 | 1 | [conflict] s.g4's real-capacity-vs-assumed-capacity rule is prose-only, not a ConflictRef. | No |
| SCH-173 (Reservation Validation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.alternative and h.prepare both omit contract blocks; h.prepare should carry the booking_id minted… | No |
| SCH-174 (Reservation Readiness) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.escalate omits a contract block. | No |
| SCH-175 (Reschedule Validation) | READY_WITH_MAPPING | 0 | 0 | 2 | [conflict] The two-concurrent-reschedule-requests case the instance key structurally allows is not arbitrated … | No |
| SCH-176 (Reservation Cancellation Reconciliation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.provider, h.refund, h.fee all omit contract blocks (h.reconcile is clean). | No |
| SCH-177 (Pre-Service Revalidation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] All five outbound handoffs omit contract blocks. | No |
| SCH-178 (Service Completion) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| SCH-179 (No-Show Validation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] All five outbound handoffs omit contract blocks. | No |
| SUB-161 (Relationship Activation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.scheduled and h.entitlement both omit contract blocks. | No |
| SUB-162 (Future Activation Revalidation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.entitlement -> ACC-71 omits a contract block. | No |
| SUB-165 (Renewal Payment Recovery) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.undefined, h.complete, h.end all omit contract blocks. | No |
| SUB-166 (Plan Change Validation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] All four outbound handoffs omit contract blocks. | No |
| SUB-167 (Cancellation Effective-Date Resolution) | READY_WITH_MAPPING | 0 | 0 | 2 | [handoff] All four outbound handoffs omit contract blocks. | No |
| SUB-168 (Scheduled Cancellation Revalidation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.end -> SUB-170 omits a contract block. | No |
| SUB-169 (Relationship Suspension) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.review and h.end both omit contract blocks. | No |
| SUB-170 (Continuing Relationship End Reconciliation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.escalate -> OWN-55 omits a contract block. | No |
| TIM-62 (Overdue State Recalculation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.orphan and h.escalate omit contract blocks (h.consequence is clean). | No |
| TIM-65 (Grace Period Management) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.revalidate and h.expire both omit contract blocks. | No |
| TRM-105 (Responsibility Handover) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.hold and h.escalate both omit contract blocks. | No |
| TRM-107 (Account Closure Reconciliation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.escalate omits a contract block. | No |
| TRM-108 (Account Closure Wind-Down) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.escalate omits a contract block. | No |
