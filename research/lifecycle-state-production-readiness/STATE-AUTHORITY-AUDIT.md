# Silent Lifecycle States — state authority audit

Every one of the 64 states' entry trigger is classified against the `StateAuthority` union
required by this round's brief:

```ts
type StateAuthority =
  | "authoritative-system" | "deterministic-rule" | "human-decision"
  | "declared-by-customer" | "derived-from-authoritative-inputs" | "behavioral-inference";
```

The classification is read directly from each state's own `trigger.evidence.source` in
`src/canonical/*.ts` (`authoritative` → `authoritative-system`, `declared` → `declared-by-customer`,
`behavioral` and `inferred` both → `behavioral-inference` — the canonical corpus itself uses two
different words for the same concept in different files; IDN-87 and IDN-90 say `"inferred"` where
every other behavioral trigger in the corpus says `"behavioral"`, and both mean the same thing:
"not yet authoritative, not yet declared, derived from observed activity"). No state's entry
trigger reads as `deterministic-rule`, `human-decision`, or `derived-from-authoritative-inputs` at
the point of *entry* — those three show up instead inside individual conditions further into a
graph (routing decisions, human review points), which is the expected shape: a state's authority
to *exist* is almost always authoritative-system, declared, or behavioral; its authority to
*route* once open is where the other three appear, and that is out of this document's scope (see
each state's own `TRANSITIONS` line in `LIFECYCLE-STATES-AUDIT.md` for those).

## Breakdown

| Authority | Count | % |
|---|---|---|
| `authoritative-system` | 48 | 75% |
| `behavioral-inference` | 9 | 14% |
| `declared-by-customer` | 7 | 11% |
| `deterministic-rule` (as entry authority) | 0 | 0% |
| `human-decision` (as entry authority) | 0 | 0% |
| `derived-from-authoritative-inputs` (as entry authority) | 0 | 0% |

The corpus is overwhelmingly system-of-record-driven at entry — three of every four silent states
open only once an authoritative system has already recorded a fact (a payment failed, a
cancellation executed, a role changed). This matches the domain: unlike a communicating journey,
which can legitimately open off engagement to *decide whether to reach out*, a silent state exists
to represent or transition something that already happened, so its own bar for opening is
naturally higher.

## `declared-by-customer` states (7)

A deliberate, first-party act — a form submission, a request, a stated intention — never inferred
from passive behavior. All seven correctly exclude passive signals in their own
`insufficientAlone` list:

- **ACQ-02** (Interest Qualification Routing) — a form/content-request submission; excludes an ad
  click, a page visit, an email open.
- **CON-31** (Permission Validation) — excludes nothing passive; the request is definitionally
  declared.
- **CON-32** (Preference Capture) — a stated preference; not inferred from usage patterns.
- **FBK-48** (Declared Context Recalculation) — a stated context fact changing; not inferred.
- **SCH-173** (Reservation Validation) — a request to reserve; excludes a payment attempt alone
  and a slot merely held.
- **SCH-175** (Reschedule Validation) — an authorized move request; excludes someone merely
  viewing other times.
- **SUB-167** (Cancellation Effective-Date Resolution) — an authorized end request; excludes
  someone asking how to cancel or viewing a cancellation page.

No gap found in this group: every one of the seven states correctly gates on an actual declared
act, never a proxy for one.

## `behavioral-inference` states (9) — every inferred trigger, audited

This is the group the brief calls out by name: **"A behavioral/inferred signal may open
investigation or prioritization. It must not silently become a conclusive state unless the
canonical graph explicitly validates it first."** All nine are listed below with what validates
the inference before any conclusive action, and the round's central finding on this group is that
**zero exceptions were found** — every one of the nine gates the behavioral signal behind a
further check before treating it as anything more than an opening.

| State | Validated by | How |
|---|---|---|
| ACQ-01 (Anonymous Identity Resolution) | `c.identity` | Deterministic-only merging; a probabilistic match never resolves an identity, only a deterministic one (session, first-party id, signed link) does. |
| ACQ-03 (Intent Escalation Handoff) | `c.strength` | Requires a strong-evidence act or a repeated moderate one, fresh enough; a single weak or stale signal is explicitly noise (`x.unchanged`). |
| ACQ-07 (Intent Decay) | `c.credible` | Re-validates recorded intent is "still credible" against synthesized evidence before ever downgrading it — decay is a judgment, not a clock. |
| FBK-50 (Relationship State Reassessment) | `c.immediate` | Gates whether a signal is immediate/actionable before recalculating relationship state from it. |
| IDN-87 (Authentication Risk Assessment) | `c.assessment` | Assesses what the evidence actually supports before any conclusive action; a single failed attempt or an unfamiliar device alone is explicitly insufficient. |
| IDN-90 (Suspected Account Compromise) | `c.containment` / `c.outcome` | Containment is only applied where justified by evidence, and "suspected" never becomes "confirmed" by anything other than investigation outcome (`c.outcome`) — the strongest example in the corpus of a behavioral signal never becoming conclusive on its own. |
| RET-21 (Engagement Reclassification) | `c.direction` / `c.intervention` | A recalculated categorical engagement state (already one level removed from a raw signal) is further gated: `c.intervention` decides separately whether a movement is even worth acting on. |
| RET-22 (Usage Gap Assessment) | `c.episodic` / `c.corroborated` | A missed-usage signal alone routes to a no-action observation state (`x.observe`); only a signal corroborated by independent negative evidence routes onward. |
| RET-27 (Recovery Stability Check) | `w.stability` | The trigger only opens observation — `a.mark` explicitly records `RECOVERY_OBSERVED`, not `RECOVERED` — and conclusive `RECOVERED` is written only after surviving a full stability window with no relapse. |

**No behavioral/inferred trigger in this corpus silently becomes a conclusive state.** This is the
silent-state analogue of the communication round's "engagement is never conclusive by itself"
guardrail, and — unlike some guardrails that hold "mostly" — this one holds with zero counter-
examples across all 64 states. Where the corpus fell short on this group was never authority
discipline but idempotency: ACQ-01, IDN-90 (via its downstream ACC-79 handoff) both carried
unrelated P0 findings — both fixed in the round-2 repair (see `FIXES-APPLIED.md`) — and neither
was ever an authority problem: the behavioral signal itself was never the thing that broke.

## `authoritative-system` states (48)

The majority group; no state in it opens on anything short of an authoritative fact already
recorded by a system of record — a payment failure, an executed cancellation, a role change with
an effective time, a confirmed reservation. Every one of the 48 states' `insufficientAlone` lists
excludes at least one proxy that could plausibly be mistaken for the authoritative fact (a
reminder being scheduled is not evidence anything is owed — FIN-131; a provider reporting success
is not the same as verifying it — TRM-107; a payment erroring in transit is "unknown," not
"failed" — SUB-165). No exceptions found: this audit did not identify any `authoritative-system`
state whose trigger evidence could actually be satisfied by a non-authoritative proxy as written.

## `deterministic-rule` / `human-decision` / `derived-from-authoritative-inputs` inside graphs

These three appear routinely as the authority behind individual *conditions* once a state is
already open — a deterministic routing rule (e.g. ACQ-05's `c.state`/`c.why`, most of the corpus's
`c.*` condition nodes), a human review point (ACC-78's `c.review`, RET-23's diagnostic escalation),
or a value read from another already-authoritative system (ACQ-01's `c.eligible`, reading a
candidate lifecycle's own eligibility rules). None of the 64 states' own *entry* trigger uses any
of these three, which is expected — a state cannot exist yet for a rule to route inside it. These
are documented per-state in each `TRANSITIONS` line in `LIFECYCLE-STATES-AUDIT.md` rather than
repeated here.

## Cross-reference

`lifecycle-state-contracts.json`'s `stateAuthority` array carries this same classification
per state, machine-readable, with `validatedBy` populated for every `behavioral-inference` entry.
