# Operational Workflows — authority and approval audit

Decision authority, approval, evidence, separation of duties, revocation, override, correction —
across the 124. Companion to `OWNERSHIP-AND-ASSIGNMENT-AUDIT.md` (ownership answers "who has the
work"; this document answers "who is allowed to decide what happens to it").

> **POST-REPAIR UPDATE (2026-09-04):** The Authority P0 family is fixed for the two workflows the
> re-derived audit confirmed as true P0 (not the full `RLT-247`/`TRM-101`/`TRM-103`/`TRM-104`/
> `TRM-109` list assumed by the original brief — `TRM-103`, `TRM-104`, `TRM-109`, and `REM-154`
> were confirmed P1, not P0, and were deliberately left unrepaired this round per the "do not force
> P1 to zero" instruction). `RLT-247` now requires an "authorized recovery-decision role" and
> `TRM-101` an "authorized identity-consolidation role" — both abstract, structural role names, not
> invented company-specific teams — before their consequential/irreversible actions proceed; both
> gained `execution: "human"` + `channels: ["task"]` so the work surfaces as an assignable task.
> `OWN-56`'s self-approval gap (a distinct, workflow-local authority defect, not part of this
> "undefined authority" family) is fixed separately — see `OWNERSHIP-AND-ASSIGNMENT-AUDIT.md`'s own
> update note. See `FIXES-APPLIED.md` for both repairs' before/after detail. The remaining 22
> authority/approval findings this document catalogs were deliberately left unrepaired — none was
> proven to require canonical-source changes, and none required inventing a company policy this
> round would have had to fabricate.

## The pattern: "assigned operator" is not automatically "decision authority"

This round's brief explicitly warns against treating the two as equivalent, and the corpus itself
mostly avoids the mistake — but 22 findings show where authority is genuinely unnamed for a
consequential, often irreversible decision, concentrated in a specific shape: **the workflow's own
text already flags the decision as high-stakes or irreversible, and leaves the authority unnamed
anyway**, meaning the authors already knew the bar was high and simply didn't close the gap:

- **`RLT-247` (Rollback Decision, P0)**: no decision authority named for choosing rollback vs.
  forward-recovery, despite the journey's own explicit statement that choosing wrong here is
  irreversible in the other direction.
- **`TRM-101` (Entity Merge, P0)**: no role or system named as holding authority to authorize a
  merge, particularly at the *elevated* evidence bar the journey itself requires for irreversible
  merges. The same "generic authority" gap (says "authorized by" without ever naming who) recurs
  across `TRM-103`/`TRM-104` (account consolidation, primary-relationship transfer) and `TRM-109`
  (no separate human approval before an irreversible deletion executes, beyond automated
  classification and a manual-review safety net).
- **`DAT-225`**: permanently closing unresolved, submitter-owned data as "unrecovered" has no
  stated decision authority or human review gate, unlike this same file's other consequential
  branches.
- **`DAT-229` (P0)**: `a.reconcile-current` is described in its own prose as "a consequential
  correction somebody has to own," but is modeled as an unowned, unmarked automated action with no
  escalation path — a direct contradiction between the workflow's own stated intent and its actual
  graph, unlike the parallel `c.side-effects` gate in the same workflow which correctly escalates.
- **`INC-253`**: `c.safe` (accept-or-reject a mitigation's secondary risk) has no named authority
  and no `execution: "human"` flag, despite the workflow's own prose describing it as high-stakes.
- **`INC-258`**: formalizing a temporary mitigation as a permanent change has no named approver
  despite being a durable, semi-irreversible operational decision.
- **`RLT-246`**: the decision to *abandon* a rollout (a business call) and the decision to
  *rollback* (a technical call) are both produced by the same undifferentiated diagnosis step with
  no distinguishing authority between the two very different kinds of call.

## Approval semantics

Where approval exists, the corpus is generally careful about who may approve and what triggers it
— the recurring gap is self-approval, not approval mechanics:

- **`OWN-56` (Approval Request, P0)**: the workflow's own stated purpose is specifically "keep
  approving separate from doing," yet it never states whether the requester may be the same person
  as the approver, and nothing in the graph structurally prevents it — the round's clearest
  instance of a self-approval gap that directly contradicts the workflow's own text (per the
  brief's own instruction: flag self-approval where it is structurally possible *and* clearly
  contrary to the workflow's own purpose, without inventing a universal four-eyes rule).
- **`CTL-235` (Delegation Authorization)**: no consent/acceptance step exists for the delegate
  before authority is granted and capabilities raised — unlike `CTL-231`'s own explicit "must the
  proposed owner accept?" branch for the structurally similar ownership-transfer case.
- **`CTL-231`**: self-assignment (the assigner naming themselves as proposed owner) is neither
  explicitly permitted nor blocked — a narrower, P2-level instance of the same self-approval
  question `OWN-56` raises at P0.
- **`REM-159`**: no approval hierarchy is stated for who authorizes compensation, so whether
  self-approval is structurally possible cannot even be confirmed from this workflow alone.

No workflow was found inventing a four-eyes/separation-of-duties rule the source doesn't actually
require — the corpus's own restraint on this point held throughout.

## The document-domain entry-authority gap (a paired finding)

`DOC-213` and `DOC-217` both require "authority to issue/change established" as part of their own
trigger evidence, but nothing in the document domain cluster — including `DOC-212`'s own handoff
into `DOC-213` (`h.issue` does not carry it) — actually supplies or names that authorization. This
is reported as one paired finding across both workflows rather than two independent ones, since
it's the identical entry-contract gap at the same domain boundary.

## Evidence

Fewer findings here than ownership/authority — most review/verification workflows in the corpus
already distinguish authoritative from behavioral/inferred evidence correctly and gate a decision
step before treating an inference as conclusive. `RSK-194`: `c.remediated` ("did the remediation
resolve the violation") has no stated authority for whether confirmation is automated/system-
verified, self-attested, or requires a human check — the one genuine evidence-authority conflation
found in the round.

## What already works well

`DEC-181`'s own `c.deterministic` condition — filtering policy-decidable actions out of the
human-judgment queue before they ever reach it — is the round's cleanest example of *not* routing a
decision to human authority when none is actually required. `CTL-231`'s explicit acceptance branch
and `RSK-199`'s "atomic check-and-record" language are the reference patterns worth generalizing
where other workflows in the same domains left the equivalent question unanswered.
