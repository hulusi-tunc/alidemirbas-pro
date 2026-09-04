# Competition Arbitration — architectural gap, confirmed

This document answers the question the runtime-mechanism repair round's brief asked directly:
*is there a runtime primitive that actually enforces journey-declared `competition` /
`exclusionGroup` / `precedence` deterministically, or is this metadata that nothing consumes?*
The answer, after inspecting the full canonical corpus (not only the 24 mechanisms) and the
site's own application layer, is **no runtime primitive exists anywhere in this repository.**
This is Outcome C from the brief's own three-way test, confirmed rather than assumed.

## What was actually checked

- **All 24 Runtime Mechanisms** (`src/canonical/communication.ts`, `consent.ts`,
  `processing.ts`): zero references to `competition`, `exclusionGroup`, `precedence`, or
  `preemptedBy` anywhere in their prose, conditions, or handoffs. Confirmed by direct grep
  against the full mechanism source, not by absence of a finding in the earlier audit alone.
- **The remaining 259 canonical journeys** (customer-facing and operational): `competition` and
  `preemptedBy` appear as *declarations* on individual journeys (`access.ts`, `acquisition.ts`,
  `activation.ts`, `feedback.ts`, `identity.ts`, `retention.ts`, `scheduling.ts`,
  `subscription.ts`) - stating what a journey wants to happen when it competes with another. None
  of these journeys' own graphs *read* another journey's competing state or *decide* a winner;
  each only states its own side of the contest.
- **`src/canonical/index.ts`**: exports `COMPETING_JOURNEYS`, a filtered list of journeys that
  declare a `competition` field, with an explicit comment - "Journeys that declare a standing
  contest for ownership of a scope" - confirming by the corpus's own documentation that this is a
  *declaration* export, not an arbitration one.
- **`src/lib/canonical-view.ts` and `src/lib/practitioner-view.ts`**: both read `competition` and
  `preemptedBy` purely to *render* them on the site's own journey-detail pages (the practitioner
  view literally formats it as a human-readable string: `"${exclusionGroup} (${scope}) -
  ${precedence}"`). This confirms the one place in the entire repository that touches this
  metadata beyond declaring it is a **read-only documentation surface**, not an execution path.

**Conclusion:** the repository is a canonical journey specification plus its own documentation
site, not a live orchestration engine. `competition` metadata is a complete, well-formed
*specification* of what a company's own runtime must do - it is not, and was never meant to be,
self-executing. The gap is real: nothing in this codebase currently tells an implementer *how* to
build the arbitration the specification promises, only *what* the outcome should be once it
exists.

## Affected competition groups

Three structured groups exist in the corpus today (confirmed via `validate:canonical`'s own "7
competition groups" summary line, which counts distinct `exclusionGroup` values across the
corpus - the number is higher than 3 because several groups have members outside this round's
scope to verify; these three are the ones with both sides confirmed present and readable):

| Group | Members | Scope | Can both sides genuinely become eligible at once? |
|---|---|---|---|
| `purchase-intent` | ACQ-07 (Intent Decay, lower) / ACQ-08 (Acquisition Exit Handoff, higher) | entity | Yes - a decay judgment and a completed-destination signal are independent events on the same lead/entity |
| `relationship-continuity` | SUB-167 (Cancellation Effective-Date Resolution) / its declared counterpart | relationship | Yes - a cancellation request and a renewal decision are independently triggerable |
| `account-restriction-authority` | ACC-78 (Access Suspension, lower) / IDN-90 (Suspected Account Compromise, higher) | account | Yes - a business-reason suspension and a security incident are triggered by unrelated events and can both fire on the same account |

**Every one of the three groups describes a scenario where simultaneous eligibility is a real,
not theoretical, possibility.** None of them is a case where the two sides are mutually exclusive
by construction (unlike, say, ACC-78/TIM-65, which the conflict audit found to be a genuine
boundary rather than a contest - see `CONCURRENCY-AND-ORDERING-AUDIT.md`). This is exactly the
condition the brief names as elevating the finding beyond documentation: *"if competition metadata
exists but nothing consumes it and simultaneous eligibility can occur, then this is likely more
serious than documentation."*

## Why metadata alone is insufficient

A journey's own `competition` block answers *"if I lose, what happens to me"* (`onLoss`) and
*"where do I rank"* (`precedence`) - it does not, and structurally cannot, answer:

- **Who evaluates both sides at the moment they conflict?** Nothing reads ACC-78's and IDN-90's
  states *together*; each journey's own graph only knows about itself.
- **What breaks the tie atomically?** Two journeys becoming eligible within the same event-
  processing window is exactly the race the silent-lifecycle-state round's CMS-201 fix addressed
  for obligation creation - the identical shape of problem exists here, one level up, for
  ownership of the account-restriction-authority scope itself.
- **Who applies `onLoss` to the loser?** `paused`/`suppressed`/`superseded`/`exit` are outcomes
  the *losing* journey's own graph does not self-apply, because the losing journey's own
  execution has no way to know it lost without something external telling it.
- **Who re-evaluates when the winner ends?** `IDN-90`'s own `competition` block states the
  precedence but not the re-evaluation trigger that would let `ACC-78` resume once the security
  incident clears.

Every one of these four questions is exactly the shape of question this round's brief asks of a
Runtime Mechanism (input contract, atomicity, side-effect boundary, freshness) - not of a
customer journey.

## Candidate ownership

Two placements are defensible; this document does not pick one, because doing so is a product-
architecture decision this repair round's brief explicitly reserves ("do NOT create a new
mechanism... describe... but do not add canonical topology without a dedicated decision"):

1. **A 25th Runtime Mechanism**, alongside the 24 audited this round, with a shape parallel to
   `OPS-125` (Work Deduplication) - itself a mechanism whose whole job is comparing two claims to
   the same identity and picking a canonical one. A `competition`-arbitration mechanism would be
   structurally similar: given two journeys claiming the same `exclusionGroup` on the same scope
   value, apply `precedence` deterministically, atomically establish the winner, and apply
   `onLoss` to the loser.
2. **Outside the canonical corpus entirely**, in whatever orchestration engine a company builds
   to actually run these journeys - the same way "the database" or "the message queue" is never
   itself a canonical journey. Under this reading, the corpus's job stops at fully specifying the
   contract (`competition`'s own fields already do this), and arbitration is purely a company-
   specific implementation detail with no canonical representation needed.

**This document leans toward reading 1, without asserting it**, for one structural reason: OPS-
125 already exists as the corpus's own precedent that "resolve a contest between two claims to
one identity" is a genuine, previously-recognized Runtime Mechanism *shape* - the corpus has
already decided this class of problem belongs in the reusable execution layer once (for
duplicate work), and a second instance of the identical shape (duplicate *ownership*, not
duplicate *work*) sitting entirely outside that layer would be an inconsistency worth resolving
explicitly, not a settled design choice.

## Required runtime contract, if built

Following this round's own `RuntimeMechanismContract` schema shape (see
`runtime-mechanism-contract.schema.ts`), a candidate specification:

- **Input contract:** `exclusionGroup`, the two (or more) competing journey instances each with
  their own `scope` value and `precedence`, and current authoritative state for each (is the
  competitor journey still actually open, or has it since exited).
- **Output contract:** `decision` (which instance wins), `ownership-transfer` (the winner is
  granted exclusive ownership of the scope), `suppression-result` (the loser's `onLoss` is
  applied).
- **Side-effect boundary:** `decides-only` for the arbitration itself; `transfers-ownership` for
  applying the winner's grant; `suppresses-queued-work` for applying the loser's `onLoss`.
- **Atomicity requirement:** the read-both-sides-and-decide-a-winner step must be atomic against
  a third late entrant claiming the same scope mid-decision - structurally the same
  check-then-act race this round's CMS-201 fix closed, one level up. A compare-and-set on
  (`exclusionGroup`, `scope`) is the natural primitive, exactly as CMS-201's own fix uses on
  (`recipient_id`, `obligation_subject`).
- **Suppression semantics:** apply the loser's own declared `onLoss` value
  (`paused`/`suppressed`/`superseded`/`exit`) - never invented or defaulted, since the brief's
  own DO-NOT list forbids inventing company-specific policy, and `onLoss` is exactly the field the
  journey's own author already supplied for this purpose.
- **Re-evaluation semantics:** when the winner's own instance ends (exits, or its own
  `competition` scope closes), the mechanism must re-evaluate whether a paused loser should
  resume - this is the freshness/revalidation concern this round's audit found the corpus
  otherwise handles well (`CMS-205`, `OPS-124`'s own revalidate-before-consequential-action
  pattern is the template to follow here too).
- **Observability:** which two (or more) instances contended, which `exclusionGroup` and `scope`,
  which won and by what `precedence` rule, when the loser's `onLoss` was applied, and when (if
  ever) re-evaluation happened - the same minimum this round's `RUNTIME-OBSERVABILITY-AUDIT.md`
  recommends for every mechanism, applied to this one.

## Whether a new Runtime Mechanism is recommended

**Not implemented this round, per the brief's own explicit instruction** ("do NOT create a new
mechanism merely to satisfy taxonomy neatness... do not add canonical topology without a
dedicated decision"). The finding is reported as a confirmed architectural gap, not resolved as
one, because resolving it requires a product decision (candidate ownership, above) this repair
round is not positioned to make unilaterally.

## Severity classification

**P0 architectural blocker**, not P1 documentation debt - per the brief's own stated test. All
three confirmed competition groups describe scenarios where both sides can become eligible
independently and simultaneously; nothing in the codebase (mechanism, customer journey, or
application layer) currently arbitrates that condition deterministically. A company implementing
this corpus today would have to invent the entire arbitration contract from scratch, with no
guidance beyond the `precedence`/`onLoss` fields themselves - and a naive implementation (first
worker wins, last write wins) would silently violate the corpus's own stated precedence rules
under real concurrent load, which is exactly the class of defect this round's audit exists to
catch. This finding is carried at the architecture level in `RUNTIME-MECHANISMS-AUDIT.md` and
`FIXES-APPLIED.md` rather than attached to any single mechanism's own `gaps` array, since it
belongs to none of the 24 individually - it is the corpus's collective absence of a 25th
primitive, not a defect in one of the 24 that exist.
