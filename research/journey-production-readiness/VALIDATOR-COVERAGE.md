# Validator Coverage

Two new mechanical validators, added to `scripts/vnext-rules.mjs` (called from
`scripts/validate-canonical.mjs` — `npm run validate:canonical`) this round, plus notes on the
validators the brief asked about that already existed and did not need to be added.

## Validator A — idempotency key field provenance

**Failure class caught:** an `idempotencyKey` string references a field the journey does not
declare in `implementation.attributes` and does not derive via any node's own `writes` step —
almost always evidence of copy-paste from a different journey's template, and a real defect: the
key cannot be correctly wired for exactly-once side-effect handling as written.

**How it works:** for every `action` node with an `idempotencyKey`, the string is split on `+`.
Each token is classified:

- a bare action/node-id reference (`a.remind`, `w.completion`) — skipped, this is a legitimate
  self-scoping token, not a field claim;
- a multi-word phrase (`touch id`, `fully signed`) — skipped, same reasoning; these read as prose
  self-references, not attempts to name a data field;
- anything else that looks like a plausible `snake_case` field name — checked against the
  journey's own `implementation.attributes.required ∪ optional`, plus every field any node in the
  journey's own graph `writes`. A token found in neither is flagged.

**Severity:** error for `orchestrated` journeys (the 71 — `sends || routesToHuman`) that are also
vNext-migrated (all 135 customer journeys are, so this is effectively "error for the 71"); warning
everywhere else (silent lifecycle states, mechanisms, operational workflows) — deliberately, so
this round's corpus-wide re-check (which found the same defect class in 28 journeys outside the 71)
surfaces as visible debt without breaking the build on work explicitly out of this round's scope.
Every warning it produces on a vNext journey is either fixed or recorded with a reason in
`production/vnext-warning-reviews.json` — none are silently unreviewed.

**Test fixture:** none added as a separate file — the validator runs against the live corpus on
every `npm run validate:canonical` invocation, which is itself the regression fixture (283
journeys, re-checked on every run). Before this round: 36 in-scope violations (7 named by the prior
audit round, 29 more found by extending the same check to the full corpus). After: 0 in-scope, 28
out-of-scope (reviewed, not fixed — see `FIXES-APPLIED.md`).

**Production command:** `npm run validate:canonical` (no separate invocation — it's one rule among
many in the same pass).

**Known limitation, stated plainly:** a multi-word phrase is never checked, on the theory that it's
a self-reference rather than a field claim. This is true in every case reviewed this round (`touch
id`, `fully signed`, `superseded`, `expired`) but is a heuristic, not a proof — a future author
could write a multi-word phrase that *is* trying to name a real field sloppily (e.g. `signer id`
instead of `signer_id`). The check would miss that. Recommend a periodic manual skim of
multi-word idempotencyKey tokens as a cheap supplementary check, not a mechanical one.

## Validator B — handoff identifier provenance

**Failure class caught:** a handoff to an internal (non-`external:`) journey where a field the
target's own `entity.instanceKey` requires is neither present in the source journey's own
declared/derived vocabulary nor named in the handoff's own `contract.requiredFields` — the class of
defect this round found and fixed four instances of by hand (SCH-180, FUL-148, REM-152, DOC-220 all
handing into the `issue_id`-keyed remedy chain with no `issue_id` anywhere in their own data).

**How it works:** for every `handoff` node whose `to` does not start with `external:`, resolve the
target journey and read its `entity.instanceKey`. For each field in that key, check it against the
source journey's own `implementation.attributes.required ∪ optional ∪ entity.instanceKey ∪
every node's writes`, and against the handoff's own `contract.requiredFields`. A field found in
neither is flagged.

**Severity: always a warning, corpus-wide, by design — never promoted to an error, even for the
71.** This is a deliberate, stated decision, not an oversight: re-running the raw check found 44
flagged handoffs in the 71 alone, and manual review of a sample showed the overwhelming majority are
the *ordinary* case of a target journey minting its own instance key on entry from a real-world
record its own trigger event creates (a booking, an onboarding instance, a requirement) — data the
canonical graph's text does not literally `write` because that convention is reserved for state
fields (logs, statuses), not identity keys, anywhere in this corpus. Distinguishing "target mints
its own key, this is fine" from "identifier genuinely has no source, this is the real defect"
requires the kind of domain judgment this round applied by hand to the four fixed instances — a
purely structural check cannot make that call reliably, and promoting it to an error would have
produced a build broken by dozens of false positives rather than a small number of high-confidence
findings.

**Test fixture:** same as Validator A — the live corpus is the fixture, re-checked on every
`validate:canonical` run. Before this round: 44 flagged in the 71 (raw), a subset of which were the
four real defects, now fixed. After: SCH-180's `h.remedy`/`h.financial`, FUL-148's `h.return`,
REM-152's `h.alternative`, and DOC-220's `h.remedy` no longer flag (their `contract.requiredFields`
now covers the target's instance key); the remaining ~40 in-scope flags and ~46 corpus-wide flags
are reviewed in `production/vnext-warning-reviews.json` with an honest per-journey note explaining
why each is (or is presumed to be) the ordinary self-minting case, not a defect.

**Production command:** `npm run validate:canonical` (same pass as Validator A).

**Known limitation, stated plainly:** this validator surfaces a prompt to check, not a verdict —
treat every finding as worth a human look, not as a confirmed defect. A future round wanting to
tighten this into an error-level gate would need either (a) a schema addition letting a journey
declare which of its own fields are genuinely self-minted on entry (closing the false-positive
class structurally), or (b) a full manual review of the remaining ~86 corpus-wide findings to
separate the real gaps from the ordinary case, journey by journey — deliberately out of this
round's scope.

## Validators considered and not built, with reasons

The brief's Part 14 also named two further mechanical checks to "evaluate":

- **Channel role completeness** ("every declared channel/human role maps to at least one action;
  every action's channel role resolves to a declared role") — **already exists.** `scripts/
  vnext-rules.mjs`'s `role_no_eligible_channel` (a `channelStrategy` role must map to channels
  inside `journey.channels`) and `channel_role_undeclared` (a touch's `channelRoles` must
  reference a role `channelStrategy` actually declares) together already cover both directions of
  this check. No new validator needed; this round's FBK-43 fix (declaring the `human` role and its
  two touches) is exactly what made that journey pass both existing checks.
- **Multi-role ambiguity** ("where one action has multiple eligible channel roles, selection must
  be deterministic") — **partially exists, and the remainder is not reliably mechanizable.**
  `touch_channel_role_ambiguous` already catches a touch listing no roles, or repeating one, or two
  channelStrategy roles sharing an identical `when` string. What it cannot catch is two roles whose
  free-text `when` conditions are *logically* non-exclusive without being textually identical (the
  real defect in this round's ACQ-09/ACT-14 findings: `"the message has to be kept and survive"` is
  a near-tautology that overlaps with every other role's condition without ever repeating its
  text). Reliably detecting that requires parsing and comparing arbitrary prose conditions for
  logical overlap — not a mechanical string check, and not attempted this round. The two concrete
  instances found (ACQ-09, ACT-14) were fixed by hand at the corpus level (see `FIXES-APPLIED.md`);
  a future validator idea worth recording: flag any `channelStrategy` role whose `when` text
  contains no negation, exclusion, or reference to another role's condition, on the theory that a
  role meant to be checked only after others have failed usually says so.

## Regression test scenarios (Part 15)

Not implemented as an automated test suite — this repository has no test framework
(`CLAUDE.md`: "There is no test framework. Correctness is enforced by validator scripts"). The
scenarios the brief asked for are instead captured as `testScenarios` entries in
`implementation-contracts.json` (kind: `idempotency`, `duplicate-trigger`, `human-ownership`, etc.)
for every one of the 71 journeys, which is the form regression coverage takes in this codebase:
human/company-readable expected behavior per scenario, verified structurally by the validators
above rather than executed. Where the brief's named scenarios map onto a specific journey's fix:

- **Idempotency** (two legitimate captures from the same person don't collapse) — ACQ-11/12/13's
  own `testScenarios` already cover this (their instance keys are per-capture, not per-person); no
  change needed, confirmed by inspection.
- **Handoff identifier** (a remedy handoff can't occur unless the receiving instance key can
  actually be built) — this is Validator B's own subject; SCH-180/FUL-148/REM-152/DOC-220's
  `testScenarios` now include an idempotency/handoff-provenance case each, reflecting the fix.
- **Conflict** (a delay journey and a delivery-tracking journey can't simultaneously own the same
  failure state) — FUL-146/FUL-265's new suppression clauses are the fix; no existing
  `testScenarios` entry claimed otherwise, so none needed correcting.
- **Ask pressure** (FBK-41/FBK-42 simultaneous eligibility produces one deterministic owner) — now
  true by construction (the precedence rule), reflected in both journeys' `contact.competition`.
- **Assisted onboarding** (ACT-14 suppresses ACT-12) — ACT-12's new `s.assisted` suppression is the
  fix.
- **Channel routing** (deterministic selection when multiple channels are available) — ACQ-09 and
  ACT-14's reordered `channelRoles` are the fix.
