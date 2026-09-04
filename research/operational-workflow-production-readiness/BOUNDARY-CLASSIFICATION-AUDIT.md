# Operational Workflows — boundary classification audit

Candidates that may actually belong to a different canonical surface. **None reclassified this
round** — per the brief's explicit instruction, report candidates only; a reclassification decision
belongs to a dedicated round, the same discipline the Runtime Mechanism round applied to the
competition-arbitration gap before resolving it in a follow-up.

> **POST-REPAIR UPDATE (2026-09-04):** Still none reclassified. All 7 boundary candidates this
> document names (`REL-95`, `REL-96`, `RSK-191`, `RSK-198`, `IDN-86`, `ACC-75`, `ACC-76`) remain
> classified as Operational Workflows, unchanged, including `RSK-198` specifically — its P0
> concurrency defect was repaired *as an operational workflow* (`entity.concurrency:
> "one-active-per-key"` on `exception_id`, closing the check-then-act race structurally) rather than
> used as a reason to move it to Runtime Mechanisms; per the governing brief, operational workflows
> can legitimately need idempotency/concurrency semantics, and this fix is itself evidence for that,
> not evidence the classification is wrong.

## Method

For every workflow, this audit asked whether its own ownership/assignment/evidence/approval/SLA
dimensions resolve to real content or to "N/A by nature" across the board — the signal that a
workflow isn't operational work a team executes, but deterministic infrastructure wearing
operational clothes, or a pure status representation with no work attached to it. 7 candidates
surfaced, all low-to-medium confidence, none confirmed.

## Candidates: suspected Runtime Mechanism

| Workflow | Confidence | Why |
|---|---|---|
| `REL-95` (Parent State Propagation) | medium | Deterministic, policy-driven state cascade; no human owner, queue, approval, or SLA; guardrails read like a mechanism's dedupe/scope-limiting rules. |
| `REL-96` (Parent State Aggregation) | medium | Same shape as `REL-95` — deterministic recomputation, explicit idempotency-by-recompute-from-source, zero human touchpoints. |
| `RSK-191` (Policy Evaluation) | medium | Zero human ownership, zero queue, a fully synchronous deterministic gate with only a single escape hatch to `DEC-181` — matches the closed round's typical mechanism shape. |
| `RSK-198` (Policy Exception Lifecycle) | medium | Zero handoffs, zero human/queue ownership, a purely mechanical validity/consumption state machine over an authorization token — closer to a lease/token-lifecycle mechanism than human-executed work. |
| `IDN-86` (Step-Up Authentication) | medium | Zero human ownership, zero queue, zero `DEC-181` handoff — an entirely mechanical challenge/revalidate/resume control flow. |
| `ACC-75` (Access Authorization) | medium | No persisting work instance, no queue, no human decision point; the workflow's own `entity.note` describes the decision as a single stateless attempt re-evaluated fresh each time — the same shape as the closed round's real-time authorization checks. |

## Candidate: suspected Silent Lifecycle State

| Workflow | Confidence | Why |
|---|---|---|
| `ACC-76` (Credential Lifecycle) | low | No human decision point, no queue, no discretionary judgment anywhere — a pure time-and-event-driven state machine tracking an artifact's own validity, the same shape as the closed Silent Lifecycle States round's subjects. |

## Impact if reclassified — uniformly low

For every one of the 7, the audit's own honest conclusion is the same: reclassification would not
change any finding's substance, only which round's rubric the workflow is graded against. Where
these workflows' ownership/assignment/evidence/approval dimensions currently read as "N/A" in
`OPERATIONAL-WORKFLOWS-AUDIT.md`, that is because the work genuinely has no human-facing shape —
not because this round's audit missed something. `RSK-198`'s idempotency gap (already counted in
the corpus-wide idempotency finding) needs fixing regardless of which round owns the workflow.

## Why none were reclassified

Two reasons converge: first, the brief's own instruction ("do not reclassify during audit, report
candidates only") applies directly; second, every candidate above is genuinely borderline rather
than a clear misclassification — each one performs real, if narrow, operational functions
(`REL-95`/`96` cascade state a company's own operational tooling would likely implement as a
background job, not a customer-facing runtime path; `RSK-191`/`198` and `IDN-86` gate access in
ways that could plausibly live in either layer depending on a company's own architecture). A
confident reclassification would require the same kind of dedicated, evidence-gathering
investigation the Runtime Mechanism round's own competition-arbitration finding received before it
was resolved — not a byproduct of a 124-workflow audit pass.

## No candidates found for the reverse boundary

Per Part 29 of the round's brief, this audit also checked for the opposite leakage — an operational
workflow embedding customer communication or channel orchestration that should instead be a handoff
to a Customer Journey. **None found.** Every workflow in the 124 that needs to reach a customer
correctly hands off to a Customer Journey or a human-routing pattern rather than embedding
email/SMS orchestration itself — the corpus-wide discipline held throughout.
