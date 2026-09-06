# Journey Library — item discovery audit (Customer Journeys + Operations)

Scope: `/lab/customer-journeys` and `/lab/operational-workflows` only, both locales. The top-level
taxonomy (2 primary + 2 reference surfaces) is approved and not touched here. Nothing under
`src/canonical/` changes structurally — the two canonical edits below are single-field text edits
(a `shortName`, one alias string), not graph/trigger/action/exit/handoff/competition/contract
changes. `npm run validate:canonical` reports the same 284/3690/423/31/8 baseline before and after.

## Method

Read the actual implementation first (`JourneyGallery.tsx`, `useJourneyFilters.ts`, `LabPage.tsx`,
`JourneyIdeaCard.tsx`, `journey-taxonomy.ts`, `journey-channels.ts`), then computed real
distributions from `production/canonical-dump.json` joined with `production/surface-assignment.json`
(the same `sends`/`routesToHuman` fields `surfaceKeyOf` reads) for exactly the 71 Customer Journeys
and 124 Operations rows the live site shows - not a re-derivation, a read of what's already there.
Every count and search result below was produced by a script against that data or by driving the
live rendered page with Puppeteer, not estimated.

---

## Customer Journeys (71)

### Count confirmation

71 = 68 `communicating` (sends a message) + 3 `routesToHuman`-only (ACQ-04, ACT-11, RET-24), per the
prior round's correction. Confirmed live: `/lab/customer-journeys` renders "71 journeys".

### Category distribution (the section-grouping and filter values)

| category | count | | category | count |
|---|---|---|---|---|
| activation | 8 | | consent | 3 |
| acquisition | 6 | | remedy | 3 |
| retention | 6 | | access | 2 |
| feedback | 6 | | terminal | 2 |
| time | 5 | | integration | 2 |
| identity | 5 | | financial | 2 |
| scheduling | 5 | | subscription | 2 |
| fulfillment | 4 | | decision | 2 |
| document | 4 | | structure, risk, rollout, incident | 1 each |

21 categories present, real Pareto shape (8→1, not flat), each with genuine section-header `purpose`
text. The 4 singleton categories are not a filter-UX defect: `REL-284` (Invitation Reminder),
`RSK-273` (Usage Limit Alert), `RLT-279` (Upgrade Blocker Reminder) and `INC-254` (Incident Update)
are each the one customer-facing notice orbiting an otherwise-Operations domain (an invitation, a
usage limit, a rollout, an incident) - there is exactly one because only one journey in that domain
is customer-communicating; the rest of that domain correctly lives on Operations. Verdict: **keep
Category as-is.** Inventing a coarser presentation grouping here (the way Operations' Type groups 18
categories into 4) was evaluated and rejected - Category already has a workable shape and Goal
already does the "coarse browsing" job as the audited primary filter; adding a second coarse layer
on top would be the "dozens of taxonomy layers" failure mode, not a fix.

### Goal distribution (existing primary filter - re-verified, not re-audited)

19 of 26 Goal values present, 11 (`recovery-retry`) down to 1 (`relationship-hierarchy-structure`,
`access-entitlement-change`), real shape. Still the right primary filter; no change.

### Channel distribution

email 68, in-app 38, sms 20, push 17, task 10, sales 1, whatsapp 1. Email is on 96% of rows, so
filtering *to* Email barely narrows anything - but filtering to Push/SMS/WhatsApp/Task/Sales is a
real, meaningful narrowing, and Channel is a shared control across all 4 surfaces. Kept as-is.

### Filters, final

**Category + Channel + Goal + Search - unchanged.** This set was already the product of a dedicated
prior audit (Goal is documented in code as "this library's audited primary discovery filter"); this
round re-verified the distributions support it and found no case for removing, replacing, or adding
a filter.

### Human Routing (ACQ-04, ACT-11, RET-24)

Re-evaluated per this round's explicit instruction: is a dedicated Type filter worth it for 3 items?
No - a 2-value filter where one value returns 3 of 71 rows is exactly the filter-for-its-own-sake
case the brief warns against, and the existing Channel filter (`Sales`/`Task`) already isolates them
for a reader who wants that. **Kept as a badge only**, as shipped last round - no filter added.

### Naming, distinction, discoverability (all 71 read against purpose + aliases)

One real problem found: **`ACC-261`'s `shortName` was "Access Recovery"**, but its `purpose` is a
*notice* ("Tell the person holding the account what access is going away... a restriction is a
decision they can act on"), and its own 5 aliases already said so 4-to-1
(`restriction notice`, `account restricted notice`, `access ending notice`, `suspension notice`, vs.
one `access recovery`). A practitioner reading "Access Recovery" would expect a self-service restore
flow; the journey is the opposite - the outbound notice that a restriction is coming. **Fixed**:
`shortName` → **"Access Restriction Notice"** (`src/canonical/access.ts`, one field; canonical `id`,
`slug`, `name`, `purpose`, aliases all untouched - the old alias `access recovery` still finds it).

Everything else held up under the same scrutiny. Specific clusters checked for confusability and
found adequately distinct (title + category section + purpose sentence together, not title alone):

- **"Recovery" cluster** - `ACC-261` (now Access Restriction Notice), `IDN-270` Account Recovery
  (locked-out/forgot-password), `IDN-84` Verification Recovery (a failed verification, retry),
  `TIM-281` Expired Access Recovery (came back after full expiry), `TIM-274` Grace Period Recovery
  (still in a reduced-function window). Five different account states, five different aliases sets,
  no overlap once ACC-261 was fixed.
- **"Fix a problem" cluster** - `REM-151` Post-Purchase Issue Recovery (triage: is anything
  unresolved), `REM-157` Remedy Confirmation (choose refund/replace/repair), `RET-26` Service
  Recovery (retention-side: was it fixed, is a remedy owed), `FBK-46` Complaint Resolution (an open
  case to a named owner). None cross-reference each other via `distinctFrom` on the detail page, and
  `FBK-46`'s own alias list already anticipates the overlap (`"service recovery (case)"`, deliberately
  parenthesized against `RET-26`'s literal name). Titles alone are close; title + category section +
  purpose sentence, which is what the card actually shows, are not. Left unchanged - not "genuinely
  unclear," and forcing a rename here would be exactly the "rewrite for stylistic consistency" the
  brief prohibits.
- **Onboarding/Adoption cluster** (7 `activation` items) and **Time cluster** (5 `time` items) -
  reviewed, each title names a distinct verb (Route Assignment / Nurture / Blocker Reminder / Help /
  Personalization; Deadline Tracking / Expiry Reminder / Action Required / Grace Period / Expired
  Access). No change.

### Card info hierarchy

Already matches the target set: display name (`shortName`), one-sentence `purpose` as body, category
as a footer label, channel badges (accent), Human Routing badge (muted) where relevant. No implementation
metadata (instance keys, idempotency, contracts) leaks onto the card - confirmed by reading
`JourneyIdeaCard.tsx`; that discipline was already established in a prior round's own history comment.
No changes.

---

## Operations (124)

### Count confirmation

124, unchanged. Confirmed live: `/lab/operational-workflows` renders "124 journeys".

### Type distribution (existing filter, re-verified)

| Type | Count | Categories inside |
|---|---|---|
| Reviews & Decisions | 37 | ownership 10, decision 9, risk 10, control 8 |
| Account & Access | 21 | access 7, identity 3, structure 5, terminal 6 |
| Service & Fulfillment | 21 | financial 6, remedy 6, document 7, subscription 1, scheduling 1 |
| Systems & Reliability | 45 | time 6, integration 10, data 10, rollout 10, incident 9 |

**Systems & Reliability, the largest bucket, is not a catch-all.** It splits into 5 sub-categories at
6-10 items each - a genuinely even spread, not one thing swallowing four. Its label ("systems and
reliability") accurately covers what's inside: time-driven system state, integrations, data
operations, deployments, incidents. Verdict: **keep the 4 Types, keep the label, no fifth group, no
route split.** This matches the brief's own instruction not to explode Operations into more routes
absent real evidence, and the evidence here says the grouping holds.

### Secondary filters

Current state is already **Search + Type + Category** - exactly the brief's own suggested ideal
("Search / Type / Domain", where Category is the Domain facet). No filter added or removed.

### Naming

Read all 124 `shortName`s against their `purpose` (full list in the working dump, grouped by
category). Flagged 3 as "reads technical" on a first pass - `IDN-82` Verification Dependency
Resolution, `DAT-226` Migration Readiness Validation, `CTL-235` Delegation Authorization - and 5 more
- `REL-95..99` (Parent State Propagation/Aggregation, Duplicate Entity Assessment, Entity
Linking/Split). On closer read, none clear the bar this round set ("genuinely unclear," not "sounds
technical"): all 8 are precise, standard vocabulary for the audience Operations is actually for
(ops/support/data engineering, not marketing/growth), and the `REL-9x` cluster in particular sits
under the **"Account structure, identity relationships & entity reconciliation"** category header,
which already says "account" - the word the bare title omits. **No renames made.** This reaffirms
last round's own conclusion (the Type filter, not a rename, is the right tool for this cluster) with
a full re-read rather than deferring to it.

### Search

Tested the brief's 19 sample terms against the live `/lab/operational-workflows` search box
(interactive, via Puppeteer - not a code read):

| Query | Hits | Query | Hits |
|---|---|---|---|
| refund | 1 | document | 8 |
| approval | 20 | payment | 6 |
| review | 17 | reconciliation | 19 |
| identity | 9 | escalation | 5 |
| access | 11 | fraud | **0** |
| account | 15 | verification | 10 |
| complaint | **0** | recovery | 27 |
| delivery | 5 | restore | 9 |
| fulfillment | 1 | close account | **0** |
| incident | 9 | | |

16 of 19 return sensible, on-topic results already, from the existing `name` + `purpose` + `category`
+ `categoryTitle` + `goal` text - Operations items carry **zero `discovery.aliases`** (0/124, vs.
71/71 on Customer Journeys), so this is entirely the base text doing the work. The 3 zero-hit terms
were checked individually against all 124 purposes, not assumed:

- **complaint** - the only real match for "something went wrong, a party disputes it" on this
  surface is `FIN-139` Financial Dispute Reconciliation, and a dispute is not the same thing as a
  complaint. General complaint-handling is `FBK-46` on the *Customer Journeys* surface - correctly,
  since complaint intake is customer-facing. Zero here is accurate, not a bug.
- **fraud** - no item in `risk` (`RSK-19x`) is fraud-specific; the category covers policy/compliance/
  limit enforcement generally. Nothing to alias without inventing a claim the data doesn't support.
- **close account** - account termination is `TRM-106` Account Closure, a *Customer Journeys* item
  (its own internal graph carries the operational steps). Operations has no separate closure
  execution item to find. Zero here is accurate.

Also spot-checked 8 further realistic terms not in the brief's list (`deployment`, `outage`,
`chargeback`, `dispute`, `rollback`, `duplicate`, `merge`, `expiry`) - all returned sensible matches
already, `chargeback` and `dispute` both correctly finding `FIN-139` via its own canonical `name`
("Financial dispute or chargeback → evidence → decision → reconcile").

**Conclusion: Operations search does not need a curated-alias project.** Building one now, with real
gaps this narrow (0 of 19 sample terms, 0 of 8 follow-up terms, needed a genuine fix), would be
exactly the keyword-stuffing the brief warns against. No `discovery.aliases` added to any Operations
journey this round.

### Card info hierarchy

Already matches the target set: display name, one-sentence `purpose`, category footer label, channel
badge (mostly `Internal`/`Task`, since Operations channels are almost entirely `task`). Type is not
repeated on the card - it's the filter a reader chose to get here, and the finer category label is
already shown; a third redundant "Type: Reviews & Decisions" line was evaluated and rejected as
clutter for information the section/filter already carries. No changes.

---

## The search bug (the one real code fix, affects both surfaces)

`src/lib/useJourneyFilters.ts` - the hook both `/lab/customer-journeys` and `/lab/operational-
workflows` (and every other gallery/flat listing page) actually search against - built its haystack
from `[id, shortName, name, purpose, category, categoryTitle, goalLabel]` and **never included
`aliases`**, even though every `JourneyRow` already carries a real `aliases` array
(`discovery.aliases` on the canonical journey). On Customer Journeys, where all 71 items have
curated aliases, this meant terms like `cart abandonment`, `checkout abandonment`, `OTP`, `KYC`, and
`dunning` - real practitioner vocabulary already sitting in the data - **silently found nothing**,
because none of those exact words happen to appear in the canonical `shortName`/`name`/`purpose`
text. Confirmed live before the fix: `"cart abandonment"` → 0/71.

**Fix**: one line, add `...j.aliases` to the haystack. Verified live after the fix:

| Query | Before | After | Found |
|---|---|---|---|
| cart abandonment | 0 | 1/71 | Abandoned Selection Recovery (`ACQ-12`) |
| checkout abandonment | 0 | 1/71 | Abandoned Process Recovery (`ACQ-11`) |
| OTP | 0 | 1/71 | Login Verification (`IDN-85`) |
| KYC | 0 | 1/71 | Identity Verification (`IDN-81`) |
| dunning | 0 | 1/71 | Payment Failure Recovery (`FIN-134`) |
| win back | 0 | 0 → **1/71** after a 2nd fix below | Lapsed Customer Win-Back (`RET-32`) |

This is the single highest-value change in this round: it activates data that was already fully
curated (100% CJ alias coverage) and simply never reached the search box. It is a no-op for
Operations today (0 aliases there) but correct, forward-compatible architecture the moment any get
added.

**Second, smaller find from testing the brief's own sample list against the fixed search**: `"win
back"` (two words, space) still returned 0, because `RET-32`'s aliases had `win-back` (hyphen) and
`winback campaign` (no space) but not the plain-space form most people actually type. Added `"win
back"` to `RET-32`'s existing alias list (`src/canonical/retention.ts`, one array entry) - a genuine
punctuation variant of an alias already there, not a new claim.

---

## Empty / filtered states, mobile, sorting - checked, no changes needed

- **Empty state**: rendered live (`complaint` search on Operations, mobile viewport) - `0 / 124`,
  "Nothing matches those filters.", a `Clear all` button both above the grid and in the empty-state
  body. Clear, already correct.
- **Mobile (375px)**: both pages render single-column cards, filters stack full-width, no overflow,
  no clipped badges. Verified by screenshot on both surfaces.
- **Tablet (768px)**: 2-column card grid, filters wrap to 2 rows, unchanged spacing. Verified by
  screenshot on Operations.
- **Sorting**: unchanged. Section order follows canonical category declaration order (intentional,
  matches the domain files); within a section, canonical declaration order. No sort dropdown added -
  nothing in the audit supported adding one.
- **Detail-page entry**: verified live - clicking through to `ACC-261`'s new slug shows "Access
  Restriction Notice" as the leading title, the full canonical chain-name beneath it, same as every
  other journey. No mismatch.

## Files changed

1. `src/lib/useJourneyFilters.ts` - search haystack now includes `j.aliases` (1 line).
2. `src/canonical/access.ts` - `ACC-261.shortName`: "Access Recovery" → "Access Restriction Notice".
3. `src/canonical/retention.ts` - `RET-32.discovery.aliases`: added `"win back"`.

No `content.ts` changes - no filter, label, or copy changed this round, so there was nothing to
translate; EN and TR both pick up the search fix and the two data edits automatically since
`shortName`/`aliases`/the filter hook are locale-independent. No `production/`, `search/`, or other
generated artifact touched. No canonical structural field (graph, triggers, actions, exits, handoffs,
competition, contracts) touched - `validate:canonical` reports the same 284/3690/423/31/8 baseline
before and after.
