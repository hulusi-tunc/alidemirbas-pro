# Competition Arbitration — resolved: `OPS-131`, a 25th Runtime Mechanism

This document originally answered the first repair pass's question — *is there a runtime primitive
that actually enforces journey-declared `competition`/`exclusionGroup`/`precedence`
deterministically, or is this metadata nothing consumes?* — with a confirmed **no**, reported as a
P0 architectural blocker and deliberately left unresolved pending a dedicated ownership decision.
**This second repair pass makes that decision.** `OPS-131` (Journey Competition Arbitration) now
exists in `src/canonical/processing.ts`, registered in `MECHANISM_IDS`, exported by id as
`COMPETITION_ARBITRATION_MECHANISM_ID`. This document records the corrected investigation (the
competition-group count the first pass reported was wrong), the decision actually made among the
three options the round's brief required evaluating, and the mechanism's own design.

## Re-derivation: 7 groups / 22 members, not 3 groups / 7

The first repair pass found 3 exclusion groups (`account-restriction-authority`, `purchase-intent`,
`relationship-continuity`) by grepping the corpus for the plain, top-level `competition` field. That
undercounted. `JourneyCompetition` is declared in **two** places in `src/canonical/types.ts`: the
top-level `competition?: JourneyCompetition` field (used by any journey), and, for **vNext
communicating journeys specifically**, the same shape nested as `contact.competition:
JourneyCompetition | "none"`. The earlier grep matched only the first form. Re-deriving directly
from parsed source (the same technique `validate-canonical.mjs` itself uses for its own "N
competition groups" summary line — which was reporting the correct number, 7, all along) found:

| Group | Scope | Members | Precedence order |
|---|---|---|---|
| `account-restriction-authority` | account | `ACC-78`, `IDN-90` | `IDN-90` (highest) > `ACC-78` |
| `purchase-intent` | product | `ACQ-04`, `ACQ-07`, `ACQ-08` | `ACQ-08` (highest) > `ACQ-04` > `ACQ-07` (lowest) |
| `commerce-recovery` | person | `ACQ-11`, `ACQ-12`, `ACQ-13`, `RET-31`, `SCH-282` | `ACQ-11` (highest) > `ACQ-12`/`RET-31` > `ACQ-13`/`SCH-282` (lowest, see note) |
| `lifecycle-stage` | person | `ACT-12`, `ACT-20` | `ACT-12` > `ACT-20` (lowest) |
| `retention-outreach` | account | `ACT-18`, `FBK-46`, `RET-24`, `RET-28`, `RET-30`, `RET-32` | ordered by each member's own precedence text; `RET-28` above risk/offer follow-up, `ACT-18`/`RET-30`/`RET-32` lowest |
| `outbound-ask` | communication-purpose | `FBK-41`, `FBK-42` | `FBK-42` wins over `FBK-41` — each names the other explicitly, a fully resolved pairwise rule, not a tie |
| `relationship-continuity` | subscription | `SUB-163`, `SUB-167` | `SUB-167` (cancellation) > `SUB-163` (renewal) |

22 members total (2+3+5+2+6+2+2). All 22 are vNext (`measurement` declared) customer-facing
journeys — every declaring journey lives in the 68 message-sending / 3 human-routing Customer
Journey surface, never in the mechanism or operational surfaces. `SCH-282`'s own precedence text
reads "alongside interest recovery" before immediately resolving the apparent tie in the same
sentence ("an availability enquiry that asked for a specific window outranks inferred interest") —
read in full, `commerce-recovery` has no unresolved tie either. Cross-checked against
`validate:canonical`'s own summary line (`7 competition groups`) — this document's earlier "3
confirmed" was the error, not the validator's count.

## What was actually checked, again, against current (post-`OPS-131`) source

- **All 25 mechanisms**: zero references to `competition`, `exclusionGroup`, `precedence`, or
  `preemptedBy` in the 24 pre-existing ones (re-confirmed by direct grep after the first repair
  pass's other changes); `OPS-131` itself is the first and only one that does.
- **The remaining 259 non-arbiter journeys**: `competition`/`contact.competition` still appear only
  as *declarations* (`access.ts`, `acquisition.ts`, `activation.ts`, `feedback.ts`, `identity.ts`,
  `retention.ts`, `scheduling.ts`, `subscription.ts`) — none of their own graphs read another
  journey's competing state or decide a winner; `OPS-131` is the first component in the corpus that
  does.
- **`src/canonical/index.ts`'s `COMPETING_JOURNEYS`** remains a declaration-aggregation export only,
  unchanged.
- **`src/lib/canonical-view.ts`/`practitioner-view.ts`** remain confirmed read-only rendering.

## The decision: three options evaluated, Option B (new mechanism) selected

**Option A — extend an existing mechanism: rejected.** The only structurally similar existing
mechanism is `OPS-125` (Work Deduplication) — both resolve a contest between competing claims to
one identity. But `OPS-125`'s claims are multiple attempts at the **same logical operation**
(`logical_operation_key` never varies between claimants); this problem's claims are **different
journeys**, each with its own identity, each independently and legitimately eligible under its own
canonical rules, contesting a shared scope under a declared `exclusionGroup`. Extending `OPS-125` to
also reason about `exclusionGroup`/`precedence`/`onLoss` — concepts entirely foreign to
deduplication — would turn a single-purpose mechanism into exactly the god-object the round's brief
warned against. `OPS-123`/`OPS-128` (worker/job ownership) were also considered and rejected: they
transfer a **work item's** execution ownership between **workers**, an infrastructure-layer concern
with no business precedence and no losing side — the wrong entity type entirely for arbitrating
between **journeys** by **business policy**.

**Option C — a non-canonical owner named with evidence: rejected, for lack of evidence.** The
brief is explicit that "the orchestration platform handles this" is not sufficient without naming a
concrete owner. No such owner exists anywhere in this repository: there is no runtime execution
engine in this Next.js codebase at all (the entire canonical corpus is itself a specification for a
runtime that lives outside it), and the one candidate reference
(`canonical-view.ts`/`practitioner-view.ts`) is confirmed pure rendering, not an owner. Unlike, say,
"the database" or "the message queue" — informal implementation details several journeys' own prose
already assumes exist without naming them — no comparable informal reference to a competition
arbiter exists anywhere in the corpus's own text. Option C requires evidence this repository does
not contain.

**Option B — a new Runtime Mechanism: selected.** `OPS-125` is the corpus's own precedent that
"resolve a contest between two claims to one identity" is a genuine, previously-recognized Runtime
Mechanism *shape*. `OPS-131` is a second instance of that shape, for a different kind of claim
(ownership of a business scope, not correctness of a retried operation) — consistent with the
corpus's own architecture rather than a foreign addition to it. Naming follows the corpus's own
established language: `GLB-01`'s file-level header in `src/canonical/global.ts` already calls this
problem "journey competition and ownership resolution" — `OPS-131`'s `shortName` ("Journey
Competition Arbitration") and `reusableRule` ("GLB-01 through GLB-10 ... made executable") both
quote that existing vocabulary rather than inventing new terms.

## What `OPS-131` actually does

Full node-by-node detail is in `RUNTIME-MECHANISMS-AUDIT.md`'s own `OPS-131` section and
`src/canonical/processing.ts`. Summarized against the eight semantic requirements the round's brief
named:

- **Eligibility**: `a.load-contenders` re-reads every contender's current eligibility from
  authoritative state at arbitration time, never trusting whatever was true when the trigger fired;
  `c.still-contested` re-checks that at least two genuinely still compete before precedence is even
  evaluated.
- **Scope**: `entity.instanceKey: ["exclusion_group", "scope_instance_id"]` is `GLB-01`'s own key
  made structural — two journeys sharing only an exclusion-group name never arbitrate; two sharing
  the group **and** the same concrete scope instance do. `GLB-08`'s mirror holds by construction: a
  decision on one instance never touches another.
- **Precedence**: `c.precedence` applies `GLB-02` literally — explicit declared policy only, no
  invented tie-break; a genuine tie escalates to `DEC-181` (the same escalation target `CMS-203`/
  `CMS-210` already use for undefined-policy cases) rather than falling back to arrival order.
- **Atomic winner establishment**: `a.claim` is atomic create-if-absent on `(exclusion_group,
  scope_instance_id)` — the identical at-most-one-canonical-outcome guarantee `CMS-201`'s own repair
  established for obligation creation, applied here to ownership of a contested scope. Exactly one
  claim ever succeeds for one identity; the losing concurrent evaluator receives the authoritative
  winner, never an error, never a duplicate.
- **Loser handling**: `a.suppress-losers` applies each losing contender's own declared `onLoss`
  (`suppressed`/`paused`/`superseded`/`exit`) — never invented or defaulted, always the losing
  journey's own value (`GLB-05`).
- **Re-evaluation**: `w.ownership` waits on the winner's own release event (resolved, expired,
  failed, or otherwise ineligible) plus a bounded check-in where policy states a maximum ownership
  duration; either path feeds `a.reevaluate`, which re-runs arbitration from current state — a
  previously-suppressed contender is never simply resumed from where it stopped (`GLB-06`/`GLB-10`).
- **Preemption**: a stronger contender becoming eligible while a weaker one already owns the scope
  is not a special case — it re-fires `t.contended`, and `c.precedence` re-resolves the same
  `scope_instance_id` to the new correct winner, with `a.suppress-losers` invalidating whatever the
  previous winner still had queued (`GLB-07`). In-flight, already-executing irreversible side
  effects are not claimed as cancellable by this mechanism — preemption changes **ownership**, and
  physical cancellation of a side effect already in flight is a separate, mechanism-specific concern
  the losing journey's own graph would have to reason about, exactly as the round's brief requires
  keeping the two distinct.
- **Idempotency**: `a.load-contenders`, `a.claim`, `a.suppress-losers` and `a.reevaluate` all carry
  `idempotencyKey` scoped to `(exclusion_group, scope_instance_id)`; repeated arbitration of the
  same contender set resolves to the same owner, not a re-decision.
- **Observability**: `conflictArbitration.contract.observabilityFields` in `OPS-131`'s own
  contract (`runtime-mechanism-contracts.json`) names the minimum a production operator needs —
  which contenders existed, which precedence rule decided, who won, why each loser lost, whether it
  escalated, when re-evaluation last ran.

## Failure semantics and human ownership

**If arbitration infrastructure is temporarily unavailable**, mutually exclusive consequential work
must not default to executing anyway — this mechanism's own contract makes ownership a
precondition a caller checks before a consequential action, not a permission granted once and
cached; an unavailable arbiter is a fail-closed condition for the caller, the same freshness
discipline the round's `Validator I` already expects of every mechanism. No retry count or backoff
value is invented here, consistent with the corpus-wide rule.

**Human ownership (`GLB-09`)** was deliberately **not** built as a special case inside `OPS-131`.
`GLB-09` is explicit that human ownership suppresses automation only where policy names the contest
("permissive rather than automatic... not from the mere existence of a human owner") — and several
`retention-outreach` members already encode exactly this in their own declared precedence text
(`FBK-46`: "an open issue under human ownership outranks automated retention and satisfaction
outreach"; `RET-24`/`RET-28` similarly). Because `OPS-131` re-reads each contender's own *current
eligibility* — which already incorporates whatever human-ownership gates that contender's own
canonical `eligibility` rules declare — human-ownership precedence is honored automatically, as
ordinary declared precedence, without `OPS-131` needing to special-case "is a human involved" as a
distinct primitive. No universal "human always wins" rule was invented, matching the brief's
explicit caution against one without evidence.

## Severity: resolved, not merely relocated

The finding this document tracked as a **P0 architectural blocker** through the first repair pass
is now **closed**. `OPS-131` exists, its contract is complete against the eight semantic
requirements above, and it is registered wherever `MECHANISM_IDS` is read (surface classification,
the search index, the site's own mechanism-count displays, `production/surface-assignment.json`).
A new corpus-wide validator, `competition_runtime_unenforced` (`scripts/validate-canonical.mjs`,
error severity), fails the build if `COMPETITION_ARBITRATION_MECHANISM_ID` is ever removed or
stops resolving to a real mechanism while structured competition groups still exist — so this P0
cannot silently reopen through a future edit without the build catching it immediately.

What remains, honestly disclosed as `OPS-131`'s own two P2 gaps rather than smoothed into a clean
"P0 = 0" headline: (1) none of the 22 current competition-group members are yet wired to call this
mechanism — a company adopting it must fire its trigger event from its own eligibility layer and
have each competing journey's own consequential actions consult current ownership before firing,
mapping work no canonical specification can perform on a company's behalf; (2) its own timeout is
conditional on declared policy stating a maximum ownership duration, so staleness detection outside
that case depends on the release event firing reliably, consistent with (not worse than) the
corpus's general reliance on authoritative events elsewhere. Neither is a defect in the mechanism's
own contract, and neither is hidden — both are recorded in `runtime-mechanism-contracts.json` and
`FIXES-APPLIED.md`.
