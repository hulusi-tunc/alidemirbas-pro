# Fixes Applied

Production-readiness gap-closure round. Every fix below is a canonical-corpus edit
(`src/canonical/*.ts`) unless stated otherwise, verified with `npm run validate:canonical`
(0 errors throughout) after each batch, and with a final full-suite pass (`validate:canonical`,
`validate:journey-production`, `validate:seo`, `npx tsc --noEmit`, `npm run lint`, `npm run build`)
at the end — see `VALIDATOR-COVERAGE.md` for what each validator actually checks and
`COMMUNICATING-CUSTOMER-JOURNEYS-AUDIT.md` for the re-derived readiness numbers.

## Taxonomy

`src/canonical/surface.ts`'s `SurfaceAssignment` returned a field called `communicating` meaning
`sends || routesToHuman`, while `src/lib/canonical-view.ts` read `sf.sends` alone and called *its
own* field `communicating` too — the same word meaning two different things at two different
layers, which is exactly why the first audit round had to explain a 71-vs-68 count discrepancy at
length instead of it being self-evident from the code.

Fixed by removing the combined field at its source:

- `src/canonical/surface.ts`: `SurfaceAssignment` now returns only `sends` and `routesToHuman`
  (independent booleans), with an extensive comment explaining why there is no third combined
  field and where a caller reads the union instead.
- `scripts/surface-assignment.mjs`: writes `sends`/`routesToHuman` to
  `production/surface-assignment.json` instead of the old `communicating` field.
- `scripts/vnext-draft.mjs`, `scripts/vnext-readiness.mjs`: read/emit the new field names.
- `scripts/vnext-rules.mjs`: its own local `surfaceOf()` reimplementation (plain Node can't import
  the `@/` alias, so this corpus already accepts a hand-kept duplicate per `CLAUDE.md`) now matches
  `surface.ts` field-for-field. The validator's internal check for "does this journey need a full
  orchestration contract" was renamed from `communicating` (which incorrectly shadowed the broader
  meaning with `isCustomer && surf.sends` — sends-only) to `orchestrated` (`isCustomer && (surf.sends
  || surf.routesToHuman)`) — a genuine behavior change, not just a rename: the validator now
  formally *requires* `orchestration`/`contact`/`channelStrategy` for a `routesToHuman`-only
  journey, not just a `sends` one. Verified safe: ACQ-04, ACT-11 and RET-24 are the only three
  `routesToHuman`-only customer journeys in the corpus, and all three already carry full
  orchestration voluntarily — so this closes a real validation gap (a future `routesToHuman`-only
  journey without orchestration would now be caught) with zero new findings on the existing corpus.

The site's own `JourneyRow.communicating` field (`src/lib/canonical-view.ts`) is deliberately left
alone — it correctly means `sends`, the "Customer journeys" tab is built on it, and renaming it is
a site change out of this round's scope — but `surface.ts`'s comment now documents exactly what it
means and why it differs, closing the documentation half of the ambiguity even where the site code
itself wasn't touched.

Recommended semantic grouping from the brief (`customerMessageContracts: 68`,
`humanRoutingContracts: 3`) is not hand-maintained anywhere — it is fully derivable today from
`surfaceOf(j).sends` (68 true) vs. `surfaceOf(j).routesToHuman && !surfaceOf(j).sends` (3 true:
ACQ-04, ACT-11, RET-24), which is the point: no second list to drift.

**Regression coverage:** `npm run validate:canonical`'s existing `surface_count_drift` rule already
asserts the corpus's derived counts (`customer`, `customer-silent`, `customer-communicating`,
`mechanism`, `operational`) match `production/surface-assignment.json` byte-for-byte; it now also
transitively covers `sends`/`routesToHuman` since both files were changed together and regenerated.
Ran `npm run dump:canonical && node scripts/surface-assignment.mjs` and confirmed the drift check
passes (0 errors) and the printed totals (`customer: 135, customer-silent: 67,
customer-communicating: 68, mechanism: 24, operational: 124`) are unchanged from before this round
— the taxonomy fix changed names, not counts.

## P0 fixes

### Idempotency key defects (7 named journeys + 29 more found on re-check, 36 in-scope total)

**Before:** Every `idempotencyKey` in the corpus follows the convention
`<instance-scoping field(s)> + <node id>`. In 36 journeys among the 71 (starting from the 7 the
first round named: FBK-47, IDN-81, IDN-84, ACC-263, FBK-49, ACC-261, IDN-270), at least one
referenced field was copy-pasted from a different journey's template and did not exist in that
journey's own `implementation.attributes` or anywhere derived by its own graph — e.g. FBK-47's six
idempotencyKeys all used `issue_id`, a field that does not exist anywhere in that journey's data;
its actual instance key is `appeal_id`.

**After:** Every flagged field reference corrected to the journey's own real instance-scoping
field(s), verified against `entity.instanceKey` and `implementation.attributes`. One genuine
missing-attribute case (not just a wrong reference): DOC-215's `a.request`/`a.remind` used
`signer_id`, which the journey's own `implementation.attributes` never declared even though
multiple actions genuinely operate per-signer — `signer_id` is now a declared required attribute
rather than the key text being silently changed to something that doesn't exist either. RET-28's
`a.record-reason` used the string `reason`; corrected to `declared_reason`, a field the journey
already had (its `writes` step just hadn't been reflected in the key). Two additional real defects
found in this family: DOC-215's `a.decided`/`a.non-renew` (SUB-163) shared an *identical*
idempotencyKey string across two different actions, which would have made the mechanism dedupe two
different decisions against each other — both now include their own action id.

**Validator/regression:** new `idempotency_field_undeclared` check in `scripts/vnext-rules.mjs`
(see "Validators added" below) — error for the 71, warning (tracked, reviewed) for the corpus-wide
backlog outside this round's scope.

### FUL-146 / FUL-265 delay-vs-tracking overlap, and FUL-265 → FUL-148 missing handoff

**Before:** FUL-146 (any obligation's timing slips) and FUL-265 (post-dispatch tracking) could both
be open on the same obligation with nothing preventing it; FUL-265's `w.delivery` treated a genuine
in-transit delay report the same as a confirmed failure, funnelling it into `a.no-arrival`'s
failure framing while FUL-146 might independently be sending a proper "delayed, new ETA" message
about the same slip. Separately, FUL-265's `x.unresolved` (confirmed non-arrival) was a bare exit
with no wiring into FUL-148 (Failed Delivery Recovery) — an implementer had no guaranteed recovery
path for "we don't know where it is."

**After:** FUL-146 gained a new suppression (`s.g5`) explicitly deferring to FUL-265 once dispatch
occurs; FUL-265 gained a matching suppression (`s.g6`) explicitly deferring pre-dispatch slips to
FUL-146. `x.unresolved` is now a `handoff` node (kind changed from `exit` to `handoff`, same node
id, so every existing reference — including `measurement.journeyOutcome.refs` — stays valid) to
FUL-148, with an explicit `contract.requiredFields` naming the failure classification and a freshly
minted `delivery_attempt_id`.

**Validator/regression:** structural validation (`npm run validate:canonical`) confirms the
converted `x.unresolved` node still satisfies every exit/handoff structural rule (0 errors); the
new `handoff_identifier_unprovenanced` check confirms the handoff's `contract.requiredFields`
covers FUL-148's own `entity.instanceKey`.

### `issue_id` minting gap — SCH-180, FUL-148, REM-152 into REM-157/REM-151 (recurred 4×, one more found on re-check: DOC-220)

**Before:** Four handoffs fed into the `issue_id`-keyed remedy chain (REM-151, REM-157) from
journeys with no `issue_id` concept in their own data model (SCH-180: `booking_id`/
`provider_failure_id`; FUL-148: `delivery_attempt_id`/`obligation_id`; REM-152:
`return_request_id`; DOC-220: `document_lineage_id`/`conflict_id`, found when re-checking the
pattern corpus-wide) — not a company-mapping question, a whether-the-identifier-exists-at-all
question.

**After:** Each of the four handoffs (`SCH-180 h.remedy`, `FUL-148 h.return`, `REM-152
h.alternative`, `DOC-220 h.remedy`) now documents, in its own `carries` list, that a fresh
`issue_id` is minted at the handoff, deterministically derived from the source journey's own
instance-scoping field — and declares `contract.requiredFields: ["issue_id", "obligation_id"]` (or
`"order_id"` for FUL-148, matching REM-151's own required field name) so the requirement is
machine-checkable, not just prose. SCH-180's `h.financial` (→ FIN-137, `refund_request_id`) got the
same treatment on re-check, since it shares the identical pattern.

**Validator/regression:** new `handoff_identifier_unprovenanced` check (see below) — these four
handoffs no longer flag, since `contract.requiredFields` now covers the target's instance key.

### FBK-41 vs. FBK-42 outbound-ask tie-break

**Before:** Both journeys declared `contact.competition.exclusionGroup: "outbound-ask"` with
`precedence: "policy orders satisfaction and advocacy asks against each other; neither is assumed
to outrank the other"` — no default existed anywhere in the corpus, so two eligible instances for
the same person would race non-deterministically for the one ask slot.

**After:** Both journeys' `precedence` text now states a deterministic rule, derived from the two
journeys' own stated purpose and evidence model (not invented from nothing): FBK-42 (advocacy)
wins when both are eligible for the same person at the same moment, because advocacy already
presupposes satisfaction and is built on accumulated relationship evidence rather than one
experience — asking both back-to-back for the same goodwill moment reads as farming it twice. The
loser is recorded not-now (`onLoss: "suppressed"`, unchanged) and remains free to re-open
independently at its own next moment.

**Validator/regression:** none new — this is a policy-text fix within an existing, already-checked
field (`contact.competition`). Re-ran `validate:canonical`'s `competition_undeclared` and
`suppression_unlabelled` checks; both still pass.

### FBK-43's declared `task` channel unmapped

**Before:** `channels: ["email", "in-app", "task"]`, but `channelStrategy.roles` covered only email
and in-app; `a.obligation` and `a.escalate` (both `execution: "human"`) had no destination, role,
or `orchestration.touches` entry at all.

**After:** `channelStrategy.roles` gained a `human` role bound to `task`. Two new
`orchestration.touches` entries (`t-obligation`, `t-escalate`) model both actions with an
`owning-process-queue` destination bound to `feedback_id`. (Also fixed in passing: `a.obligation`'s
idempotencyKey was the prose string `"feedback_id + work item"`, not a real field reference;
corrected to `"feedback_id + a.obligation"`.)

**Validator/regression:** `npm run validate:canonical`'s existing `role_no_eligible_channel`,
`orch_touch_not_in_graph` and `orch_path_broken` checks all pass on the new touches (0 errors) —
these are exactly the checks that would have caught a touch pointing at an unreachable node, which
is what happened on the first attempt (`t-escalate` initially declared `after: "t-obligation"`,
which is unreachable since the two actions are on mutually exclusive branches of `c.route`; the
validator caught it immediately and the `after` was removed).

### DOC-220's authority for "which version is authoritative"

**Before:** `c.identifiable`'s criteria (lineage, issuance authority, effective semantics) were
named; no system, role, or algorithm was assigned to apply them — a company could not safely
automate `a.authoritative` without first deciding who or what makes the call.

**After:** `a.authoritative`'s own `does` text now names the resolving authority explicitly: a
deterministic resolver applying `c.identifiable`'s own criteria, never a human judgment call at
that step — the resolver having already singled out one version is what makes the action
reachable at all, which is why an inability to do so routes to `h.review`'s human decision (DEC-181)
instead. No new criteria invented; the existing criteria were only ever missing an owner.

**Validator/regression:** none new — a prose-only fix to an existing action's `does` field, still
subject to every existing `does`-text check (`NUM_UNIT`, `CHANNEL_WORD`, etc. — none triggered).

### RET-24 idempotency key + operational-cause double-ownership with FIN-134

**Before:** `a.evidence`/`a.owner-task` idempotencyKeys referenced `subscription_id`, a field
absent from the journey's required attributes (`account_id + risk_episode_id` is the real key).
Separately, `c.operational`'s "known problem" branch routed any recognized operational cause to
RET-23 without checking whether that cause was already an open FIN-134 (payment recovery)
instance — a real double-ownership risk at the ops level.

**After:** idempotencyKeys corrected to `risk_episode_id + account_id`. `c.operational`'s branch
text now explicitly excludes "a payment failure with an open payment recovery instance on this
relationship" from the "known problem" branch, routing it to `c.human`/`c.automated` instead (which
already correctly assumes no ownership conflict, since nothing routes onward from there to a
competing owner).

**Validator/regression:** `idempotency_field_undeclared` (new). The branch-text fix is prose-only,
verified by `npm run validate:canonical` continuing to pass (a stray edit here briefly triggered
`fallback_as_touch` on a *different* journey, REM-157, via an unrelated edit's accidental use of the
word "bounce" — caught and fixed; see the REM-157/REM-152 entry below).

## Additional P1 fixes

- **SUB-163 vs. FIN-134** — added the payment-recovery exclusion its sibling group (RET-24, RET-32)
  already had: new eligibility bullet, new suppression (`s.payment-recovery`, in `noAction`), and
  `contact.competition.precedence` updated to name it explicitly.
- **CON-264 vs. CON-272** — CON-264 gained an eligibility bullet excluding changes whose
  `change_source` is CON-272's own repair flow (already confirmed by CON-272's own `a.confirm`);
  CON-272 gained a reciprocal `distinctFrom` entry documenting the relationship and that its
  `change_source` output is exactly what lets CON-264 tell the two apart.
- **DOC-215 / DOC-220 / DOC-286 cross-instance suppression** — DOC-215 and DOC-286 each gained an
  eligibility bullet checking for an open DOC-220 conflict review on the same document lineage
  before proceeding (signature collection, or announcing an entitlement active) — the most
  generalizable structural fix from this round; any `*_lineage_id`/`*_version_id` family in the
  corpus should get this pattern.
- **REM-157 ↔ REM-152 ping-pong** — REM-157's `c.route` "Return, before anything else" branch
  condition now explicitly excludes "a return was not already rejected for this issue," closing the
  cycle risk without adding a node.
- **TIM-61 / TIM-63 / TIM-268 / TIM-274 "urgent horizon"** — each gained a named `urgent_horizon`
  optional attribute, and the `urgent` channel role's `when` text now cites both that attribute and
  the journey's own due/expiry/deadline attribute by name (`due_at`, `expires_at`,
  `grace_deadline_at`) instead of unbound prose.
- **ACQ-09 / ACT-14 channel-role precedence** — both journeys' `channelStrategy.roles` and their
  touches' `channelRoles` arrays were reordered so `in-session` is checked before `persistent`
  (ACQ-09) and before `low-friction`/`persistent` (ACT-14), matching the convention already correct
  elsewhere in the corpus (e.g. ACT-12) — previously `persistent`'s near-tautological `when` text
  was listed first, making the session-aware roles effectively dead code regardless of session
  state.
- **FBK-42's push-channel contradiction** — `a.ask-heavy`'s `channelRoles` had `push` removed; the
  action's own text explicitly argues against an interruptive channel for a high-commitment ask
  ("not an interruption to be tapped past; it needs somewhere they can read it twice").
- **ACT-12 / ACT-14 suppression edge** — previously stated only in ACT-12's own prose documentation
  with no enforceable signal anywhere. ACT-12 gained a new optional attribute
  (`assisted_session_open`), a new eligibility bullet, and a new suppression (`s.assisted`, in
  `noAction`) checking for an open ACT-14 session before sending a generic next-step prompt. (A
  `contact.competition` block was tried on ACT-14 first, matching the shape used for FBK-41/FBK-42;
  the validator's own `competition_group_of_one` check caught it immediately — ACT-12 already
  occupies its single `competition` slot with the unrelated `lifecycle-stage` group, and this
  corpus's own precedent for a one-directional ownership relationship, ACT-12/ACT-13's identical
  `s.blocker` pattern, uses prose suppression rather than `contact.competition` for exactly this
  reason. Reverted to match that precedent.)

## Remaining known gaps

45 P1s and 27 P2s remain across the 71 journeys — real, itemized, company-mapping-shaped work, not
implementation blockers. See each journey's own `GAPS` section in
`COMMUNICATING-CUSTOMER-JOURNEYS-AUDIT.md` and the round-over-round table in
`READINESS-MATRIX.md`. Two specific items named in this round's brief were investigated and found
to already be adequately modelled or intentionally out of scope, not silently dropped:

- **FUL-148's REM-151 trigger-evidence mismatch** — downgraded from P0 (`handoff`) to P1 (`events`).
  The identifier and required-data provenance that made this a hard implementation blocker is now
  resolved (`h.return`'s explicit contract). What remains is a genuine, narrower product question -
  whether REM-151's trigger needs a system-initiated variant of its `sourceType: "declared"` entry
  criteria, or whether a handoff-synthesized record simply satisfies "declared" by convention -
  which this round did not decide unilaterally, per the brief's own instruction to document rather
  than force a canonical product decision that "cannot safely be inferred from the existing
  corpus."
- **IDN-81/IDN-85 vs. IDN-271 reciprocal suppression, and FBK-47's cluster boundary** — named in the
  Conflict & Preemption audit but not in this round's explicit P1 batch (`SUB-163 vs FIN-134,
  CON-264 vs CON-272, DOC-215 vs DOC-220 vs DOC-286, RET-24 vs FIN-134, REM-157 ↔ REM-152 cycle
  risk`, and the timing group) — left open for a future round rather than fixed opportunistically
  outside the named scope.
- **The corpus-wide idempotency and handoff-identifier debt outside the 71** (28 journeys for
  idempotency, up to 58 for handoff-identifier warnings) — all in silent lifecycle states, which
  this round's DO-NOT list explicitly excludes ("do NOT work on the 67 silent lifecycle states
  yet"). Tracked via `production/vnext-warning-reviews.json` review entries with an honest note
  rather than fixed opportunistically or silently ignored.

## Build/validator status

- `npm run validate:canonical` — 0 errors, 0 unreviewed warnings on vNext journeys (1114 total
  warnings, up from 890 before this round — entirely the two new corpus-wide validators surfacing
  pre-existing debt outside this round's scope, all reviewed).
- `npm run validate:journey-production` — PASS, all 30 checks.
- `npm run validate:seo` — PASS, 0 errors.
- `npx tsc --noEmit` — clean.
- `npm run lint` — 1 pre-existing error in `src/components/ui/MobileNav.tsx` (a React
  `set-state-in-effect` rule), confirmed present on a clean stash of this round's changes and
  therefore not introduced by this round; not touched.
- `npm run build` — succeeds, exit 0, all routes prerender.
