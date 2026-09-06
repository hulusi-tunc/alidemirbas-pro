# Runtime Mechanisms — validator opportunities

Candidate mechanical validators this audit's findings suggest. **None implemented this round** —
this is audit only, per the brief; a repair round decides which of these to build and in what
order. Mirrors the format of the communication round's own `VALIDATOR-COVERAGE.md` "considered and
not built" section, since these are proposals, not shipped code.

## POST-REPAIR UPDATE

**Two of the eight candidates below are now implemented; the prerequisite is now satisfied.**
`scripts/vnext-rules.mjs` now defines `isMechanism = surf.surface === "mechanism"` directly against
`MECHANISM_IDS` (exactly the prerequisite this document names — not inferred from `vnext`, which
stays `false` for all 24 since they remain pre-vNext by design) and uses it in three places:

- **Validator C (`state_write_without_idempotency`)**, pre-existing, had its severity widened from
  warn-only to error-on-mechanisms (`isMechanism` now included in its `stateSev` error condition),
  confirmed safe only after every one of the corpus-wide instances across the 24 was closed by this
  round's repair — this is effectively candidate **1** (side-effect-without-idempotency) from the
  table below, implemented by extending an existing validator rather than writing a new one, since
  the existing rule's shape (write action lacking `idempotencyKey`) already matched what candidate 1
  proposed.
- **New Validator H (`attempt_identity_unprovenanced`)**, mechanism-scoped, warn-only — implements
  candidate **8** (attempt identity provenance): flags an attempt-shaped `idempotencyKey` (matching
  `/\b(attempt|lease|replay)\b/i` on its component tokens) whose `entity.note` says nothing about
  where the identity comes from or when it is established relative to the side effect. A regex bug
  in the first draft (unparenthesized alternation let "release" false-match "lease") was caught and
  fixed before this validator's result was trusted.
- **New Validator I (`freshness_before_execution`)**, mechanism-scoped, warn-only — implements
  candidate **4** (freshness before consequential action), but *not* by literal reuse of the
  silent-state round's Validator E, exactly per this document's own caution: it additionally accepts
  a nearby revalidation-shaped node/action (matched by name or `does` text) as satisfying the rule,
  not only a literal `recheck` field, avoiding the "24/24 false positive" risk this document warned
  about. Surfaced 7 legitimate, low-risk findings on escalation-shaped handoffs, left for human
  review rather than mechanically resolved.

Candidates **2, 3, 5, 6, 7** were deliberately left unimplemented this round, consistent with this
document's own framing of them as regression guards for behavior already correct rather than open
gaps, and per the repair brief's explicit instruction not to implement all eight just because
listed — implementing five validators with zero current findings would add maintenance surface
without closing any gap this round confirmed. Full detail (severity, scope, false-positive
reasoning, production command) for the two implemented validators plus the widened one is in
`VALIDATOR-COVERAGE.md`. **The rest of this document is the original audit-round text, kept for
reference — it was written as "none implemented this round" during the audit; two are now built.**

## Prerequisite, stated before any of the eight below: these 24 are not vNext-migrated (audit-round record)

None of the existing corpus-wide validators in `scripts/vnext-rules.mjs` meaningfully gate the 24
today — every one of them reads `j.measurement` to decide error-vs-warning severity, and none of
the 24 declares `measurement`. Before any validator below can move past warn-only, the 24 need the
same kind of severity-scoping decision the silent-state round made for its own 64 (`isCustomer &&
!orchestrated`, in that case) — here, something like `MECHANISM_IDS.includes(j.id)`, checked
directly rather than inferred from `vnext`. This is itself worth naming as the first prerequisite
of any repair round in this domain, not a validator in its own right.

## 1. Side-effect-without-idempotency (structural, not prose-heuristic)

**Rule:** every action whose `writes` includes a `mode: "append"` entry, or whose `sideEffectBoundary`
class includes `submits-to-provider`/`transfers-ownership`, must declare an `idempotencyKey`.

**Defect caught:** exactly `SIDE-EFFECT-AND-IDEMPOTENCY-AUDIT.md`'s central finding — the 8
mechanisms naming an attempt/idempotency concept in prose without a declared field, plus any of
the remaining 16 whose own append-writes have no key at all.

**Mechanisms affected:** all 24 today (0 currently declare `idempotencyKey`), heaviest on OPS-121,
OPS-124, CMS-206 (the three where the concept is most explicitly named and most load-bearing).

**Estimated false-positive risk:** low for the mechanisms explicitly naming the concept already
(8 of 24 — a real gap, not a false positive); moderate for the pure-decision mechanisms with no
durable side effect (`CMS-202`, `CMS-203`, `OPS-122`) where a key genuinely may not be needed —
this validator would need to exempt `reads-only`/`decides-only`-classed actions the way the
customer-facing corpus's Validator C already exempts `mode: "set"` writes.

**Recommended severity:** warn everywhere at first (the corpus-wide precedent from both earlier
rounds — introduce as warn, individually review, then promote once reviewed). Not error-ready
until the 24 adopt `measurement` or an equivalent scoping mechanism exists.

**Recommended surface scope:** `MECHANISM_IDS`, checked directly rather than via `vnext`.

## 2. Unknown-outcome safety

**Rule:** every mechanism whose `sideEffectBoundary` includes `submits-to-provider` and whose
graph has a `wait` node with an `onTimeout` must show that timeout does not lead directly to a
retry/resend action without an intervening explicit unknown-outcome classification.

**Defect caught:** a blind retry after a side effect whose result is unknown — the exact scenario
Part 11 names. Zero instances of this defect were actually found in this audit (all 8 relevant
mechanisms handle it correctly already), so this validator's value is regression prevention, not
closing an open gap.

**Mechanisms affected:** none currently violate it; would guard CMS-206, CMS-207, OPS-121,
OPS-123, OPS-124, OPS-127, OPS-128, OPS-130 against regression.

**Estimated false-positive risk:** low — the check is structural (does a timeout edge lead to a
provider-submission action without an intervening classification node), not a prose heuristic.

**Recommended severity:** error, once scoped correctly — this is exactly the kind of invariant
worth holding at error level immediately, since the corpus already meets it and the validator's
job is to keep it met.

**Recommended surface scope:** `MECHANISM_IDS` only; the customer-facing corpus's own send-path
already has an analogous, differently-shaped guardrail (CMS-206 itself).

## 3. Retry-classification completeness

**Rule:** every mechanism with a retry-adjacent `condition` node (asking "is this retryable") must
have at least three distinguishable branches: retryable, terminal, and unknown/unclassifiable.

**Defect caught:** a retry mechanism that only distinguishes retryable-vs-terminal and silently
folds "unknown" into one of the two — none found this round (`OPS-124`'s `c.safe` has all three;
`CMS-208`'s `c.class` has four, including an explicit unclassifiable-treated-cautiously branch),
so again a regression guard rather than an open gap.

**Mechanisms affected:** would guard CMS-208, OPS-121, OPS-124, OPS-126.

**Estimated false-positive risk:** moderate — "at least three branches" is a coarse structural
proxy for "handles unknown correctly," and a mechanism could satisfy the letter of this rule while
still routing its unknown branch somewhere unsafe. Best paired with validator 2 rather than relied
on alone.

**Recommended severity:** warn — the structural proxy is imperfect enough that a human review pass
should confirm each finding before promotion.

**Recommended surface scope:** `MECHANISM_IDS`.

## 4. Freshness before consequential action

**Rule:** every `wait` node whose `onTimeout` or `onEvent` leads to a `writes`-bearing action or a
`handoff` must have a `recheck` field (the same field the silent-state round's Validator E already
checks for the customer-facing corpus) — or, since none of the 24 currently use `recheck` at all,
an equivalent prose statement identifying what gets re-read.

**Defect caught:** a queued/scheduled mechanism executing against a stale snapshot — the house
rule both earlier rounds formalized, tested here against the OPS/CMS domain specifically.

**Mechanisms affected:** none currently violate it in substance (12 of 24 already revalidate
before consequential action, several as dedicated pipeline stages rather than a `recheck` field —
`CMS-205`, `OPS-124`, `OPS-129`); this validator's honest first finding would be "12 of 24 pass by
substance but 0 of 24 pass by the `recheck` field's literal presence," which is a documentation
gap, not a behavior gap.

**Estimated false-positive risk:** high if implemented as a literal `recheck`-field-presence check
reused unmodified from the silent-state round's Validator E — that validator was built for a
domain where `recheck` is the corpus's existing convention; here it is not used at all, so a naive
reuse would flag 24/24 for something the mechanisms already do correctly by different means.
**Do not implement by literal reuse; adapt the check to also accept the mechanism's own dedicated
revalidation node/action as satisfying the rule.**

**Recommended severity:** warn, and specifically framed as "document which node does this" rather
than "add a missing behavior," to avoid mischaracterizing 12 already-correct mechanisms as broken.

**Recommended surface scope:** `MECHANISM_IDS`.

## 5. Provider-state normalization

**Rule:** any mechanism whose `sideEffectBoundary` includes `submits-to-provider` must have at
least two distinguishable exit/handoff states for "provider accepted" and "recipient/business
outcome confirmed" — never one state serving both.

**Defect caught:** provider-acceptance-treated-as-delivery, the specific failure mode Part 6/CMS-R9
name by name. Zero instances found — `CMS-206`'s `x.pending` ("SENT and DELIVERY_PENDING...
delivery not established") and `CMS-207`'s `a.delivered` are already cleanly separated, with the
distinction stated as an explicit guardrail in both.

**Mechanisms affected:** none violate it; guards CMS-206, CMS-207, CMS-208 against regression.

**Estimated false-positive risk:** low — the two states are already named distinctly enough
(`SENT`/`DELIVERY_PENDING` vs. `DELIVERED`) that a structural check on distinct exit ids is
reliable.

**Recommended severity:** error — this corpus already meets the bar and the distinction is
foundational enough to hold at error level immediately.

**Recommended surface scope:** `MECHANISM_IDS`, specifically the CMS domain.

## 6. Runtime ownership uniqueness

**Rule:** any mechanism whose `sideEffectBoundary` includes `transfers-ownership` must show an
explicit check (a condition node) confirming the previous owner has genuinely released ownership
before transferring it to a new one.

**Defect caught:** two owners existing simultaneously for the same job — zero instances found;
`OPS-128`'s `c.lease` is exactly this check, done well; `OPS-123`'s equivalent is present as a
guardrail but not as concretely modeled (see `CONCURRENCY-AND-ORDERING-AUDIT.md`).

**Mechanisms affected:** OPS-123, OPS-128 (the only two `transfers-ownership`-classed mechanisms).

**Estimated false-positive risk:** low for a 2-mechanism surface; would need re-scoping if the
corpus grows more ownership-transfer mechanisms with genuinely different shapes.

**Recommended severity:** warn initially, given the very small sample (2 mechanisms) makes a
one-size rule's fit uncertain until a third example exists to test it against.

**Recommended surface scope:** `MECHANISM_IDS`.

## 7. Output completeness

**Rule:** every mechanism must have at least one exit/handoff for each of: success, no-op/suppressed,
and (where any wait node exists) timeout/deferred — a structural check against the `outcomes`
shape both earlier rounds' schemas already use.

**Defect caught:** a caller-visible branch that only exists as prose, with no distinct node to
branch on mechanically — `outputContract.proseOnlyOutcome` in this round's own schema names
exactly this. Zero instances found among the 24 (every mechanism audited had `proseOnlyOutcome:
false`).

**Mechanisms affected:** none violate it currently; a clean regression guard.

**Estimated false-positive risk:** low.

**Recommended severity:** warn — a coarse completeness check like this is a reasonable early
warning even at low confidence, since a real gap here is a real caller-integration defect.

**Recommended surface scope:** `MECHANISM_IDS`.

## 8. Attempt identity provenance

**Rule:** wherever a mechanism's `inputContract` lists a field needed for deduplication or retry
correlation (an idempotency/attempt/correlation key), that field's provenance (caller-supplied vs.
self-minted vs. correlated) must be stated, not merely referenced by name.

**Defect caught:** the exact "attempt key fields must exist before the attempted side effect"
requirement Part 27 names directly — currently unmet on all 8 mechanisms naming the concept.

**Mechanisms affected:** OPS-121, OPS-124, OPS-125, CMS-206, CON-35, CON-40, OPS-127, OPS-128.

**Estimated false-positive risk:** low — this is the same finding as validator 1, checked from the
provenance angle rather than the presence angle; the two should probably ship together as one
validator with two sub-checks rather than two separate rules.

**Recommended severity:** warn, paired with validator 1.

**Recommended surface scope:** `MECHANISM_IDS`.

## Summary table

| # | Rule | Mechanisms affected | FP risk | Severity | Scope |
|---|---|---|---|---|---|
| 1 | Side-effect without idempotency | 24 (structural gap) | low-moderate | warn | MECHANISM_IDS |
| 2 | Unknown-outcome safety | 0 violate; 8 guarded | low | error | MECHANISM_IDS |
| 3 | Retry-classification completeness | 0 violate; 4 guarded | moderate | warn | MECHANISM_IDS |
| 4 | Freshness before consequential action | 0 violate in substance | high if naively reused | warn | MECHANISM_IDS |
| 5 | Provider-state normalization | 0 violate; 3 guarded | low | error | MECHANISM_IDS (CMS) |
| 6 | Runtime ownership uniqueness | 0 violate; 2 guarded | low (small sample) | warn | MECHANISM_IDS |
| 7 | Output completeness | 0 violate | low | warn | MECHANISM_IDS |
| 8 | Attempt identity provenance | 8 (pairs with #1) | low | warn | MECHANISM_IDS |

Read together: five of the eight (`2`, `3`, `5`, `6`, `7`) are regression guards for behavior this
audit already found correct — worth building specifically *because* the corpus currently passes
them, to keep it that way. Only `1`/`8` (effectively one rule) and `4` (with its reuse caveat)
would surface genuinely new findings if built today, and both point at the same root cause
(`SIDE-EFFECT-AND-IDEMPOTENCY-AUDIT.md`'s central finding) rather than four independent problems.
