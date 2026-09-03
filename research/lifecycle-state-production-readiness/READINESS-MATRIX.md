# Silent Lifecycle States — readiness matrix

Generated mechanically from `lifecycle-state-contracts.json` (source of truth for the counts
below); see `LIFECYCLE-STATES-AUDIT.md` for the full per-state narrative and
`build/build-matrix.mjs` in the scratch build directory for how this table is derived. "Canonical
change?" is "No" for all 64 states — this round found zero gaps requiring a change to
`src/canonical/*.ts`; every finding is resolvable at the implementation-contract layer.

Totals: 64 states — READY 0, READY_WITH_MAPPING 27,
NEEDS_CONTRACT_WORK 37, NEEDS_CANONICAL_CHANGE 0. P0 41, P1 15, P2
46, total findings 102.

| State | Readiness | P0 | P1 | P2 | Main gap | Canonical change? |
|---|---|---|---|---|---|---|
| ACC-71 (Entitlement Qualification) | NEEDS_CONTRACT_WORK | 1 | 0 | 1 | [idempotency] a.evaluate/a.reconcile/a.grant idempotencyKeys reference undeclared person_id; real key is account_… | No |
| ACC-78 (Access Suspension) | NEEDS_CONTRACT_WORK | 2 | 0 | 1 | [idempotency] a.scope/a.preserve/a.full/a.extend idempotencyKeys reference undeclared person_id; real key is acco… | No |
| ACC-79 (Capability Restoration) | NEEDS_CONTRACT_WORK | 1 | 1 | 0 | [idempotency] a.reevaluate/a.restore-full/a.restore-subset idempotencyKeys reference undeclared person_id; real k… | No |
| ACQ-01 (Anonymous Identity Resolution) | NEEDS_CONTRACT_WORK | 1 | 1 | 0 | [idempotency] a.reconcile's idempotencyKey references account_id and person_id, neither of which exists in this s… | No |
| ACQ-02 (Interest Qualification Routing) | NEEDS_CONTRACT_WORK | 1 | 0 | 0 | [idempotency] a.record's idempotencyKey references undeclared account_id; real key is lead_id + a.record. | No |
| ACQ-03 (Intent Escalation Handoff) | READY_WITH_MAPPING | 0 | 0 | 1 | [observability] The specific evidence that made c.strength judge a signal real (vs. noise) is not retained as data … | No |
| ACQ-05 (Qualification State Routing) | NEEDS_CONTRACT_WORK | 1 | 0 | 0 | [idempotency] a.read/a.mark-recycle/a.requalify idempotencyKeys reference undeclared account_id; real key is lead… | No |
| ACQ-06 (Eligibility Recalculation) | NEEDS_CONTRACT_WORK | 1 | 0 | 0 | [idempotency] a.evaluate/a.reconcile/a.block idempotencyKeys reference undeclared account_id/person_id; real key … | No |
| ACQ-07 (Intent Decay) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| ACQ-08 (Acquisition Exit Handoff) | NEEDS_CONTRACT_WORK | 1 | 0 | 0 | [idempotency] a.scope/a.suppress idempotencyKeys reference undeclared contact_point_id; real key is person_id + d… | No |
| ACQ-10 (Commercial Decline Routing) | NEEDS_CONTRACT_WORK | 1 | 0 | 0 | [idempotency] a.capture's idempotencyKey references undeclared account_id; real key is lead_id + decline_id + a.c… | No |
| ACT-16 (Onboarding Completion Handoff) | READY_WITH_MAPPING | 0 | 1 | 0 | [handoff] h.adoption -> ACT-17 does not visibly carry use_case_id, which ACT-17's own instance key includes; … | No |
| CON-31 (Permission Validation) | NEEDS_CONTRACT_WORK | 1 | 0 | 0 | [idempotency] All four actions' idempotencyKeys reference undeclared consent_record_id; real key is the declared … | No |
| CON-32 (Preference Capture) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| CON-33 (Preference Recalculation) | NEEDS_CONTRACT_WORK | 1 | 0 | 1 | [idempotency] a.adapt has no idempotencyKey and no writes, despite being a state-changing action in the graph. | No |
| CON-38 (Communication Suppression) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| FBK-48 (Declared Context Recalculation) | READY_WITH_MAPPING | 0 | 1 | 0 | [config] a.volatile's revalidation condition has no bound attribute or ConfigRef despite the graph's own tex… | No |
| FBK-50 (Relationship State Reassessment) | READY_WITH_MAPPING | 0 | 0 | 2 | [observability] x.owned names no owner field. | No |
| FIN-131 (Financial Obligation Tracking) | READY_WITH_MAPPING | 0 | 0 | 1 | [instance] implementation.attributes.required names only obligation_id and obligation_log, while a.record's ow… | No |
| FIN-136 (Balance Reconciliation) | NEEDS_CONTRACT_WORK | 1 | 0 | 0 | [handoff] h.restore -> ACC-79 does not carry or mint restoration_case_id, which ACC-79's own instance key req… | No |
| FUL-141 (Fulfillment Request Validation) | NEEDS_CONTRACT_WORK | 1 | 0 | 1 | [idempotency] All four actions' idempotencyKeys reference undeclared order_id; real key is the declared instance … | No |
| FUL-142 (Fulfillment Allocation) | NEEDS_CONTRACT_WORK | 1 | 0 | 0 | [idempotency] a.evaluate/a.backorder/a.unavailable idempotencyKeys reference undeclared person_id; real key is th… | No |
| FUL-143 (Resource Reservation) | NEEDS_CONTRACT_WORK | 1 | 1 | 0 | [idempotency] All five actions' idempotencyKeys reference undeclared order_id; real key is the declared instance … | No |
| FUL-144 (Fulfillment Execution) | NEEDS_CONTRACT_WORK | 1 | 3 | 0 | [idempotency] All four actions' idempotencyKeys reference undeclared order_id; real key is the declared instance … | No |
| FUL-145 (Fulfillment Exception Recovery) | READY_WITH_MAPPING | 0 | 0 | 1 | [observability] w.approval names no approver field. | No |
| FUL-147 (Delivery Outcome Tracking) | NEEDS_CONTRACT_WORK | 1 | 1 | 1 | [idempotency] a.persist/a.unknown idempotencyKeys reference undeclared order_id; real key is the declared instanc… | No |
| FUL-149 (Delivery Acceptance Finalization) | NEEDS_CONTRACT_WORK | 1 | 1 | 0 | [idempotency] a.record/a.finalize idempotencyKeys reference undeclared order_id/person_id; real key is the declar… | No |
| FUL-150 (Fulfillment Cancellation Reconciliation) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| IDN-87 (Authentication Risk Assessment) | READY_WITH_MAPPING | 0 | 1 | 0 | [handoff] h.security -> IDN-90 missing incident_id (shared gap with IDN-88's own h.security into the same tar… | No |
| IDN-88 (Account Recovery Verification) | NEEDS_CONTRACT_WORK | 1 | 1 | 1 | [idempotency] All five actions' idempotencyKeys reference undeclared issue_id; real key is the declared instance … | No |
| IDN-89 (Identity Attribute Update) | NEEDS_CONTRACT_WORK | 1 | 1 | 1 | [idempotency] account_id + person_id + <action> used on a.sensitivity, a.update, a.propagate, a.reconcile; person… | No |
| IDN-90 (Account Compromise Recovery) | NEEDS_CONTRACT_WORK | 1 | 0 | 2 | [handoff] h.recover and h.lift both hand off to ACC-79 without a contract block; ACC-79 needs restoration_cas… | No |
| REL-100 (Orphan Relationship Recovery) | NEEDS_CONTRACT_WORK | 1 | 0 | 2 | [idempotency] a.state, a.hold, a.reassign, a.revalidate all key on relationship_id, which is not declared and, by… | No |
| REL-91 (Relationship Validation) | READY_WITH_MAPPING | 0 | 1 | 1 | [config] x.pending has no wait node, timeout, or SLA -- a relationship can sit PENDING_EVIDENCE indefinitely… | No |
| REL-92 (Relationship Impact Recalculation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.ownership and h.entitlement both omit contract blocks. | No |
| REL-93 (Entity Relationship End Reconciliation) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| REL-94 (Role Authority Update) | NEEDS_CONTRACT_WORK | 1 | 0 | 1 | [idempotency] a.delta and a.apply key on account_id + relationship_id + <action>; relationship_id is undeclared, … | No |
| REM-156 (Corrective Reperformance) | NEEDS_CONTRACT_WORK | 1 | 0 | 1 | [idempotency] a.define, a.preserve, a.execute, a.partial all key on order_id + obligation_id + <action>; neither … | No |
| RET-21 (Engagement Reclassification) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.health -> RET-23 omits a contract block. | No |
| RET-22 (Usage Gap Assessment) | READY_WITH_MAPPING | 0 | 1 | 0 | [observability] No action writes to corroborating_evidence or any other field, yet the stated re-entry model requir… | No |
| RET-23 (Health Deterioration Diagnosis) | NEEDS_CONTRACT_WORK | 2 | 0 | 2 | [idempotency] a.decompose and a.diagnostic both key on subscription_id + account_id + <action>; subscription_id i… | No |
| RET-27 (Recovery Stability Check) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.rediagnose -> RET-23 omits a contract block. | No |
| RET-29 (Cancellation Wind-Down) | NEEDS_CONTRACT_WORK | 2 | 0 | 0 | [idempotency] a.invalidate, a.termination-state, a.wind-down all key on subscription_id + relationship_id + <acti… | No |
| SCH-172 (Temporary Slot Hold) | NEEDS_CONTRACT_WORK | 1 | 0 | 1 | [idempotency] a.create, a.expire, a.release, a.consume all key on person_id + <action>; person_id is undeclared, … | No |
| SCH-173 (Reservation Validation) | NEEDS_CONTRACT_WORK | 1 | 0 | 1 | [idempotency] a.capture, a.reject, a.pending, a.lapse, a.confirm all key on booking_id + <action>; booking_id is … | No |
| SCH-174 (Reservation Readiness) | NEEDS_CONTRACT_WORK | 1 | 0 | 1 | [idempotency] None of a.determine, a.initiate, a.at-risk, a.ready declares an idempotencyKey despite four of the … | No |
| SCH-175 (Reschedule Validation) | NEEDS_CONTRACT_WORK | 1 | 0 | 2 | [idempotency] a.preserve, a.no-replacement, a.transfer, a.release-old, a.reconcile all key on booking_id + <actio… | No |
| SCH-176 (Reservation Cancellation Reconciliation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.provider, h.refund, h.fee all omit contract blocks (h.reconcile is clean). | No |
| SCH-177 (Pre-Service Revalidation) | NEEDS_CONTRACT_WORK | 1 | 0 | 1 | [idempotency] a.suppress, a.blocked, a.ready all write state but declare no idempotencyKey. | No |
| SCH-178 (Service Completion) | READY_WITH_MAPPING | 0 | 0 | 0 | none found | No |
| SCH-179 (No-Show Validation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] All five outbound handoffs omit contract blocks. | No |
| SUB-161 (Relationship Activation) | NEEDS_CONTRACT_WORK | 1 | 0 | 1 | [idempotency] a.create, a.pending-date, a.requirements, a.pending-req, a.abandon, a.activate all key on subscript… | No |
| SUB-162 (Future Activation Revalidation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.entitlement -> ACC-71 omits a contract block. | No |
| SUB-165 (Renewal Payment Recovery) | NEEDS_CONTRACT_WORK | 2 | 0 | 1 | [idempotency] a.recovery ('renewal_cycle_id + grace state') and a.restrict ('renewal_cycle_id + restriction scope… | No |
| SUB-166 (Plan Change Validation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] All four outbound handoffs omit contract blocks. | No |
| SUB-167 (Cancellation Effective-Date Resolution) | READY_WITH_MAPPING | 0 | 0 | 2 | [handoff] All four outbound handoffs omit contract blocks. | No |
| SUB-168 (Scheduled Cancellation Revalidation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.end -> SUB-170 omits a contract block. | No |
| SUB-169 (Relationship Suspension) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.review and h.end both omit contract blocks. | No |
| SUB-170 (Continuing Relationship End Reconciliation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.escalate -> OWN-55 omits a contract block. | No |
| TIM-62 (Overdue State Recalculation) | READY_WITH_MAPPING | 0 | 0 | 1 | [handoff] h.orphan and h.escalate omit contract blocks (h.consequence is clean). | No |
| TIM-65 (Grace Period Management) | NEEDS_CONTRACT_WORK | 1 | 0 | 1 | [idempotency] Neither a.record nor a.restore declares an idempotencyKey, despite both writing to grace_log. | No |
| TRM-105 (Responsibility Handover) | NEEDS_CONTRACT_WORK | 1 | 0 | 1 | [idempotency] a.define, a.inventory, a.prepare, a.revalidate, a.activate, a.invalidate all key on person_id + <ac… | No |
| TRM-107 (Account Closure Reconciliation) | NEEDS_CONTRACT_WORK | 1 | 0 | 1 | [idempotency] a.inventory, a.verify-termination, a.separate, a.record-final, a.record-unresolved, a.record-remain… | No |
| TRM-108 (Account Closure Wind-Down) | NEEDS_CONTRACT_WORK | 1 | 0 | 1 | [idempotency] a.suppress, a.guard, a.scope all key on obligation_id + account_id + <action>; obligation_id is und… | No |
