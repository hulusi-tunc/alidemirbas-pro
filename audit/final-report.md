# The journey library — closing report

Phases 0–33. This is the document to read first if you have come back to this
repository after a long time and want to know what the journey library *is*,
what was done to it, and which of its numbers you are allowed to trust.

Every figure below is either read out of a named file, read out of a named
commit, or printed by a validator run whose output is quoted. Where a
before-figure could not be established honestly, it says so instead of
offering one.

---

## 1. The story in one line

The public library ends at **69** journeys having started at **73**. That is
not a net trim of four. **Twenty-one legacy journeys were removed from the
public library, and seventeen new ones were designed and added.** Almost
nothing about the library that a visitor sees today is the library that
existed at the start; the two counts happening to sit four apart is a
coincidence of arithmetic, and reading it as "we tidied up a bit" is the one
wrong conclusion this report exists to prevent.

| | start | end |
|---|---:|---:|
| public library | 73 | **69** |
| excluded legacy journeys | 0 | **21** |
| source corpus (library surface) | 73 | **90** |
| canonical journeys / nodes | 286 / 3732 | **303 / 3959** |
| routed public journeys | 162 | **158** |
| library categories | 21 | **18** |

**Where the start column comes from, precisely.** The library/category/routed
figures are the corpus at `c436029` (the last commit before the scoping PR),
read from that commit's `production/canonical-dump.json` and
`production/surface-assignment.json`: 73 library journeys, 21 categories, 162
routed non-operational journeys, and a canonical corpus of **286 / 3728**. The
`3732` in the table is the same 286 journeys four nodes later — PR #23 (the
commerce ownership decisions) added four canonical nodes — measured at
`41d07bb`, which is the commit immediately before the first of the seventeen
lands. Both are true; they are different moments, and the table mixes them
because the scoping work and the additions were two different projects against
two different baselines. The honest reading is:

| moment | commit | canonical | library surface | public library | routed public | categories |
|---|---|---:|---:|---:|---:|---:|
| before scoping | `c436029` | 286 / 3728 | 73 | 73 | 162 | 21 |
| after scoping, before the additions | `41d07bb` | 286 / 3732 | 73 | 52 | 141 | 18 |
| now | working tree | **303 / 3959** | **90** | **69** | **158** | **18** |

The end column is not asserted from a document. `npm run validate:canonical`
prints it:

> `303 canonical journeys · 3959 nodes · 423 orchestration rules · 31 global
> rules · 16 competition groups · 11 send-path stages · 8 merged redirects (not
> counted) · surfaces customer 154 (87 communicating / 67 silent) · mechanism 25
> · operational 124 · 154 vNext · 0 errors · 2475 warnings (0 unreviewed on
> vNext journeys)`

and `node scripts/validate-public-scope.mjs` prints the public partition:

> `public 69 · excluded 21 · source corpus 90` — `15 checks · 0 failures · 3
> warnings` — `RESULT: PASS`

Both were run against the working tree for this report. The render-based gates
were not: they need a build and a server, and this report does not claim a
result it did not see. Their last recorded runs are in §7.

---

## 2. The scope decision, and how it is enforced

The public site projects three of the canonical library's four surfaces. Two
separate gates decide what is published, and **they are gates of different
kinds**. That distinction is the single most important thing in this section,
because it decides where a future change has to be made.

### 2.1 The Operational Workflows archive — a rule

`isPublicJourney` in `src/lib/public-corpus.ts` is, at heart, one predicate:

```
surfaceOf(j).surface !== "operational"
```

The 124 operational journeys are not published. That is a **rule**, because it
follows from facts each journey already states about itself — its category, its
entity, its channels. Correct a journey's data and it moves across this line
automatically; there is no override field and nothing to keep in sync.

The canonical graph is untouched by it. The 124 stay in `src/canonical/`
because 54 customer and mechanism journeys hand off into them, three
orchestration rules name them, three retired ids redirect into them, and
`validate:canonical` requires every handoff target to exist. Deleting them
would corrupt the journeys that stayed. `archive/operational-workflows/` holds
a verbatim export and the removed route shells; nothing in the build imports
it.

### 2.2 The 21 exclusions — an explicit id list

`EXCLUDED_FROM_PUBLIC`, in the same file, is a hand-written set of 21 ids:

> ACQ-04 · ACT-11 · CON-264 · CON-283 · FBK-46 · FBK-47 · IDN-81 · IDN-85 ·
> IDN-270 · TRM-106 · TRM-275 · INT-269 · INT-278 · FIN-137 · FUL-276 ·
> REM-152 · SCH-180 · DEC-184 · DEC-267 · DOC-220 · DOC-286

These are excluded because of **what the product is for**, not because of
anything their data says. There is no honest predicate over `channels`,
`entity` or `category` that separates "Refund Request" from "Payment Failure
Recovery": both are real, both communicate, and only a product call puts one on
the site and not the other. Writing that call as a list keeps it reviewable.
Inventing a predicate to reproduce it would make the next reader believe it was
derived, and they would then "fix" the predicate.

### 2.3 Why the list is asserted, not trusted

The list alone would rot. `public-corpus.ts` therefore also carries
`PUBLIC_LIBRARY_IDS` — the 69, written out in full — and asserts at module
load, in the server-only module every public projection already imports, that
the decided list and the list the surface rule derives are the same 69 ids:

```
public library scope drift (audit/public-journey-scope.md says 69):
  N derived · decided-but-not-derived: … · derived-but-not-decided: …
```

A canonical edit that adds a communication action to a silent lifecycle state,
or removes the last one from a library journey, therefore **fails the build
with the offending ids named** instead of quietly publishing 68 or 70. It is
the same discipline `journey-marketing.ts` already used for its five
hard-referenced showcase ids.

`scripts/validate-public-scope.mjs` is the second, out-of-process copy of the
same assertion, plus fourteen more checks (§7).

### 2.4 What "removed" means

Excluding at the publishing boundary is what makes the removal total. Every
public projection reads `PUBLIC_JOURNEYS` / `isPublicJourneyId`, so one edit
drops a journey from the rows, the counts, the detail routes, the sitemap, the
search index, the cross-journey links and both locale trees at once. Its URL
stops resolving through each tree's own `not-found`. Nothing is hidden with
CSS.

A cross-reference **from** a journey that stayed **to** one that did not
renders as the target's name in text, never as a link — the same treatment an
archived operational target already had, no new mechanism.

---

## 3. The seventeen

Ids 289–305, allocated from the corpus's single global counter (the highest id
was 288) with the prefix chosen for subject. No existing id was reused,
renumbered or changed, and no new prefix was created. The allocation and its
reasoning are `audit/new-journey-id-map.md`.

| batch | journeys |
|---|---|
| A | ACQ-289 back-in-stock · RET-290 first-purchase bounceback · FUL-291 post-purchase follow-up · RET-292 first-purchase anniversary · RET-293 personalised recommendations · RET-294 complementary next offer |
| B | RET-295 milestone recognition · SUB-296 loyalty welcome · SUB-297 loyalty nurture · SUB-298 reward confirmation · SUB-299 loyalty tier change |
| C | CON-300 unengaged sunset · FUL-301 order confirmation · FIN-302 refund notification |
| D | SCH-303 reservation payment reminder · SCH-304 pre-arrival preparation · REM-305 support request acknowledgement |

Read from `production/canonical-dump.json`:

| id | slug | category | nodes | comm. actions | customer channels |
|---|---|---|---:|---:|---|
| ACQ-289 | `back-in-stock-alert` | acquisition | 13 | 1 | push · email · in-app |
| RET-290 | `first-purchase-welcome` | retention | 14 | 2 | email · in-app · push |
| FUL-291 | `post-purchase-follow-up` | fulfillment | 10 | 1 | email · in-app · push |
| RET-292 | `first-purchase-anniversary` | retention | 7 | 1 | email · push · in-app |
| RET-293 | `personalized-recommendations` | retention | 11 | 1 | email · in-app · push |
| RET-294 | `complementary-next-offer` | retention | 15 | 2 | email · push · in-app |
| RET-295 | `milestone-recognition` | retention | 8 | 1 | email · push · in-app |
| SUB-296 | `loyalty-welcome` | subscription | 13 | 2 | email · in-app · push |
| SUB-297 | `loyalty-nurture` | subscription | 13 | 2 | email · in-app · push |
| SUB-298 | `reward-confirmation` | subscription | 7 | 1 | email · in-app · push |
| SUB-299 | `loyalty-tier-change` | subscription | 11 | 1 | email · in-app · push |
| CON-300 | `unengaged-sunset` | consent | 21 | 3 | email · in-app |
| FUL-301 | `order-confirmation` | fulfillment | 11 | 1 | email · sms · in-app |
| FIN-302 | `refund-notification` | financial | 15 | 4 | email · in-app |
| SCH-303 | `reservation-payment-reminder` | scheduling | 18 | 3 | email · sms · in-app |
| SCH-304 | `pre-arrival-preparation` | scheduling | 20 | 3 | email · sms · in-app |
| REM-305 | `support-request-acknowledgement` | remedy | 20 | 3 | email · in-app |
| | | | **227** | **32** | |

227 new nodes is exactly 3959 − 3732, and no existing journey's node count
changed anywhere in the seventeen — verified by diffing `41d07bb`'s dump
against the current one. Every edit to an existing journey was
`contact.competition`, a suppression or a `distinctFrom` row.

Four of the counts above deserve their footnote, because a declared
communication action is not the same as a message any one person receives:

- **FIN-302 declares four, sends two per instance.** `a.issued`, then exactly
  one of `a.settled` / `a.partial` / `a.unresolved` — the three exclusive arms
  of `c.outcome`. Four are declared because every communication action must be
  referenced by a touch; the validator's `simultaneous_review` warning on the
  three is recorded in `production/vnext-warning-reviews.json`.
- **REM-305 declares three, sends at most two.** Either the resolved-on-receipt
  message alone, or the acknowledgement followed — only if the request's own
  state changes — by one resolution notice. A request still open when the
  window closes is handed to REM-151 and gets nothing: the anti-drip rule,
  written as suppression `s.no-drip`.
- **SCH-304's three are each conditional**, and an occurrence with nothing new
  to say reaches `x.ready` having spent nothing.
- **CON-300's third is not discretionary.** Two messages run against a budget;
  the third is the ending itself, `mandatory: true`, because it is a notice
  about the business's own sending.

---

## 4. The library, measured

Everything in this section is derived from `production/canonical-dump.json`
over the 69 ids the scope validator prints, with
`production/surface-assignment.json` used only to select them. Where a
pre-refactor figure is quoted it is the same computation run against the dump
at `c436029` (73 journeys) or `41d07bb` (52 journeys).

### 4.1 Orchestration models

**Read this caveat before the table.** The seven model names — Single,
Sequential, Conditional, Parallel, Fallback, Segment-based, Event-or-timeout —
are a *reading*, assigned per stage in `audit/channel-orchestration-map.md` and
per journey in `audit/51-journey-design-matrix.md`. They are not a field in the
dump. The counts below come from a mechanical rule over the graph, published
here so it can be checked and re-run, and **they will not match the matrix's
per-journey column**, because the matrix reads stages and this reads whole
journeys. The matrix is the authority on any individual journey; this is the
authority on nothing except its own stated rule.

Let a *communication action* be a node with `kind: "action"` and
`execution: "communication"`. Then, over the 69:

| model | the rule, over `canonical-dump.json` | journeys |
|---|---|---:|
| Single | exactly one communication action | **22** |
| Sequential | two of them with a `wait` node on a path between them | **36** |
| Conditional | two of them on mutually exclusive branches of one condition | **19** |
| Parallel | two of them on one chain with no wait and no condition between | **6** |
| Fallback | `channelStrategy.fallback === "same-role-other-channel"` | **55** |
| Segment-based | two touches declared at the same `orchestration.touches[].stage`, on mutually exclusive paths | **2** |
| Event-or-timeout | a wait with a non-empty `until[]` *and* a `timeout` | **61** |

The labels are not exclusive and are not meant to be; Event-or-timeout is
combinable with every other one, which is why it is on 61 of 69. Of the 46
journeys with more than one communication action, every one matches at least
one of Sequential, Conditional and Parallel — there is no journey whose
multiple messages relate to each other in some fourth way. The one journey
matching none of the first four is **RET-24**, which has zero communication
actions at all; see §5.2.

Two of these rules are proxies and should be read as such. **Fallback** here is
the *declared* channel-fallback policy, not the orchestration shape of a stage:
55 journeys declare that a role's second channel carries the same message, 14
declare `next-eligible-role`, and RET-24 declares no `channelStrategy` at all.
The orchestration map reserves its own Model E for a first channel that has
actually failed and counted three journeys; these are different questions with
the same word on them. **Segment-based** here catches only the case where two
touches are filed under one stage, which is the narrowest structural signature
of "the segment changed the treatment"; the map's reading found five.

A cross-check that *is* a real authored field, `orchestration.strategy`:

| strategy | 52 (at `41d07bb`) | 69 (now) |
|---|---:|---:|
| `single-notice` | 23 → | **25** |
| `offer-decide-remind` | 25 → | **23** |
| `notice-then-confirm` | 14 → | **9** |
| `progressive-recovery` | 3 → | **6** |
| `deadline-countdown` | 4 → | **6** |
| declared nothing | 2 → | **0** |

(The 52-column figures are that commit's own 52; the 73-journey corpus also
carried one `two-party-confirmation` and one `human-escalation-ladder`, both on
journeys that are now excluded.) The two journeys declaring no strategy at all
were ACQ-287 and ACQ-288 — decision A1, the root cause of two further P0s, and
the first thing the ownership run fixed.

### 4.2 Customer-facing touch counts

Counting communication actions per journey:

| communication actions | 73 (`c436029`) | 52 (`41d07bb`) | **69 (now)** |
|---:|---:|---:|---:|
| 0 | 3 | 1 | **1** |
| 1 | 20 | 14 | **22** |
| 2 | 17 | 15 | **19** |
| 3 | 18 | 13 | **17** |
| 4 | 7 | 5 | **6** |
| 5 | 8 | 4 | **4** |
| total actions | 176 | 123 | **155** |
| mean per journey | 2.41 | 2.37 | **2.25** |

The library got **larger and quieter**. Seventeen journeys were added and the
average number of messages a journey can send went down, because ten of the
seventeen carry one or two and none carries more than four. The heaviest tier
is unchanged in absolute terms — the same four journeys at five (TIM-274,
TIM-281, SCH-277, RSK-273) — so the additions did not import a new class of
noisy journey.

The zero row is **RET-24** and only RET-24: see §5.2.

`orchestration.touches[]` counts 160 rather than 155, because four journeys
declare a touch that is not a customer message: ACT-13 and FBK-49 each declare
an internal work item alongside their one message, FBK-43 declares two, and
RET-24's single declared touch *is* the work item. That gap is decision B5,
still open (§8).

### 4.3 Channel usage

Canonical `channels`, intersected with the five customer-facing channels the
public site recognises — Email, SMS, Push, WhatsApp, In-app. `sales` and `task`
are operational handoff behaviour and are filtered out at the one projection
(`publicChannels()` in `canonical-view.ts`), which check 8 of the scope
validator enforces.

| channel | 73 (`c436029`) | **69 (now)** | share of the 69 |
|---|---:|---:|---:|
| Email | 70 | **68** | 99% |
| In-app | 38 | **48** | 70% |
| Push | 19 | **29** | 42% |
| SMS | 22 | **20** | 29% |
| WhatsApp | 3 | **3** | 4% |

Channels per journey now: 4 journeys declare one, 35 declare two, 22 declare
three, 7 declare four, and one declares none. Reading `channelStrategy.roles`
instead of `channels` gives the identical five totals, which is the bidirectional
channel rule (§7) doing its job — a declared channel and a role that uses it
cannot drift apart.

Two movements are worth naming. **In-app and Push rose** (38→48 and 19→29)
while the library grew by a net four: all seventeen additions declare In-app and
eleven declare Push, because commerce, loyalty and post-purchase moments are
mostly reachable where the person already is. **SMS fell** (22→20) although
three of the seventeen declare it, because several of the 21 excluded journeys —
identity and account-recovery work — were the corpus's heaviest SMS users. No
journey in the library declares SMS as its only channel; the only four
single-channel journeys in the 69 are ACQ-285, REM-151, DOC-214 and DOC-215, all
of them Email.

### 4.4 Ownership: `contact.competition`

This is where the refactor did most of its real work, and the movement is the
largest in the report.

| | 73 (`c436029`) | 52 (`41d07bb`) | **69 (now)** |
|---|---:|---:|---:|
| journeys carrying a `competition` block | 17 | 22 | **43** |
| journeys declaring `"none"` | 54 | 30 | **26** |
| journeys with no `contact` block at all | 2 | 0 | **0** |
| exclusion groups with a member in the library | 6 | 7 | **14** |

The 14 groups, with every library member:

| group | scope | members |
|---|---|---|
| `commerce-recovery` | person | ACQ-11 · ACQ-12 · ACQ-13 · ACQ-287 · ACQ-288 · ACQ-289 · RET-31 · SCH-282 |
| `retention-outreach` | account | ACT-18 · RET-24 · RET-28 · RET-30 · RET-32 |
| `booking-lifecycle` | reservation | SCH-266 · SCH-277 · SCH-303 · SCH-304 |
| `membership-standing` | subscription | SUB-296 · SUB-297 · SUB-298 · SUB-299 |
| `post-purchase-welcome` | person | RET-290 · FUL-291 · FUL-301 |
| `service-request` | topic | REM-151 · REM-157 · REM-305 |
| `access-consequence-narration` | account | TIM-274 · ACC-261 |
| `contactability-question` | person | CON-272 · CON-300 |
| `date-recognition` | person | RET-292 · RET-295 |
| `lifecycle-stage` | person | ACT-12 · ACT-20 |
| `obligation-reminder` | communication-purpose | TIM-61 · TIM-268 |
| `outbound-ask` | communication-purpose | FBK-41 · FBK-42 |
| `recommendation-offer` | person | RET-293 · RET-294 |
| `relationship-continuity` | subscription | TIM-63 · SUB-163 |

Three groups have members outside the 69 and so do not show their full
membership here: `contactability-question` also holds CON-283 (excluded),
`retention-outreach` also holds FBK-46 (excluded), and `purchase-intent` holds
only ACQ-04 (excluded) and therefore has no library member at all. The
validator's corpus-wide count of 16 includes that one and
`account-restriction-authority`, which is declared in an orchestration rule
rather than in any journey's `contact` block.

**Seven of the fourteen groups did not exist before the seventeen.** Four of
those seven were created by writing a boundary that the existing side had
previously declared absent — and in every one of the four, the existing journey
carried `"competition": "none"`, which had been *true* until the new journey
existed and was *false* the moment it did:

| new group | created by | the journeys that had to stop saying `"none"` |
|---|---|---|
| `date-recognition` | RET-295 (batch B) | RET-292 |
| `contactability-question` | CON-300 (batch C) | CON-272 · CON-283 |
| `booking-lifecycle` | SCH-303, SCH-304 (batch D) | SCH-266 · SCH-277 |
| `service-request` | REM-305 (batch D) | REM-151 · REM-157 |

Diffing `41d07bb` against the working tree confirms exactly six pre-existing
journeys moved from `"none"` to a block — CON-272, CON-283, REM-151, REM-157,
SCH-266, SCH-277 — plus RET-292, which the diff cannot show because Batch A
created it. The other three new groups (`membership-standing`,
`post-purchase-welcome`, `recommendation-offer`) were formed entirely among new
journeys; `commerce-recovery` simply gained ACQ-289 as its eighth member.

Ten existing journeys also gained a `distinctFrom` row for one of the
seventeen: ACT-12, RET-32, CON-38, CON-272, CON-283, FIN-137, FIN-138, FUL-146,
FUL-265, REM-157. FIN-138 and FUL-146 had never carried one at all.

### 4.5 Handoffs out of the public corpus

A handoff whose target is not a public route renders as the target's name in
text. Over the 69:

| | count |
|---|---:|
| library journeys with at least one handoff to a non-public journey | **13** |
| such handoff edges | **21** |
| distinct non-public targets | **14** — 8 archived operational, 6 excluded legacy |
| library journeys with an `external:` handoff | **13** (14 edges) |
| library journeys with a `distinctFrom` row pointing at a non-public journey | **14** (18 rows) |

The thirteen are ACT-13, RET-26, CON-300, FBK-43, TIM-61, TIM-63, IDN-84,
FUL-146, REM-157, SUB-163, SCH-280, DOC-215, RLT-279. The archived targets are
DEC-181, DOC-216, OWN-55, REM-155, REM-159, RLT-242, SUB-164, TIM-64; the
excluded ones are ACT-11, CON-283, FBK-46, FIN-137, REM-152, SCH-180.

For comparison, the 73-journey library had 20 such journeys over 30 edges to 15
targets — all of them archived operational, since nothing was excluded yet.

**This figure contradicts one the scope validator prints, and the validator is
the one that is loose.** Its check-11 warning reads *"handoffs into non-public
journeys render as text, not links — 54"*, because it compares handoff targets
against `PUBLIC_LIBRARY_IDS` (the 69) while the renderer compares against
`PUBLIC_JOURNEYS` (the 158 routed). Thirty-three of its 54 point at silent
lifecycle states and runtime mechanisms — ACQ-03, ACT-16, SUB-167, CON-38,
TIM-62 and so on — which are public routes and do render as links. It is a
warning, not a check, so nothing fails and nothing on the site is wrong; the
text is simply over-broad. Listed in §8.

---

## 5. The principles this work established

These are the four rules that survived contact with the corpus. Each was paid
for by something that went wrong.

### 5.1 Reciprocity

**Every sound ownership boundary is stated from both sides. A one-sided or
silent boundary is a bug.**

`contact.competition` is what decides who may speak. A journey that does not
declare the group is not in the contest, whatever the other journey's prose
says about it — so a precedence written on one side only is not an agreement,
it is one journey's opinion. Batches B, C and D each opened by editing the
*existing* side before authoring the new one, which is why eleven pre-existing
journeys appear in the seventeen's diff without a single node changing.

The sharpest form of the rule is this: **`"competition": "none"` is a claim
about the world, and the world moves.** Every one of the four new groups in
§4.4 was created against a journey that had honestly declared `"none"` — true
when it was written, false the moment something arrived to contest it. A
journey that says it competes with nothing is not finished; it is
*currently* uncontested, and the next journey in its neighbourhood inherits the
obligation to say so.

Reciprocity does not mean a group for every pair. Batch C considered a
`money-returned` group for FIN-302 / FIN-137 / REM-157 and rejected it: those
three are sequential, not contending — REM-157 hands to FIN-137, FIN-137 hands
to FIN-138, FIN-302 opens on FIN-138's submission — and a handoff is precisely
the mechanism that moves ownership. Declaring a group would have claimed a
standing contest the graph already resolves. The boundary was written where it
belonged instead, as suppressions and `distinctFrom` rows from all four sides.
Batch D did the same for SCH-303 → FIN-134. **A contest and a sequence are
different things, and only the contest gets a group.**

### 5.2 Quote both sides before claiming a collision

**A claim that two journeys collide must quote the `contact.competition` block
of both, before proposing that either be removed, suppressed or given a
message.**

This rule has a name and a cost. RET-24 Churn Risk Escalation has zero
customer-facing communication actions: it assembles risk evidence and routes to
RET-28, RET-23 or RET-30, or raises an account-owner task, or exits at
`x.monitor`. Its only declared channel is `task`. That put two rules of the
brief in direct contradiction — the scope list says RET-24 is public, the
channel rule says a public journey with no customer-facing communication must
fail the build.

It was removed on that basis, taking the library to 51, and then restored. The
case against it rested on the claim that giving it a message would duplicate
RET-30's ownership of the same retention episode. **Two independent reviews
made that claim by reading its handoff nodes. Neither read its `contact`
block**, which already arbitrates exactly that: RET-24 is ranked *above generic
retention intervention* on the same account, with `onLoss: suppressed`. The
hazard that drove the removal was already solved in the journey's own authored
data.

So RET-24 is public, and the channel rule carries **one recorded exception**,
in `scripts/validate-public-scope.mjs` — a map from id to a written reason,
printed on every run:

> `WARN channel rule exception: RET-24 — routing/escalation journey - its
> customer messaging is owned by RET-28 / RET-23 / RET-30 under RET-24's own
> retention-outreach precedence`

Deliberately a list with a reason beside each entry rather than a boolean: a
second journey cannot join it without an edit and a written justification, the
run prints it every time, and the check still fails for anything not on the
list. Same discipline as `production/vnext-warning-reviews.json`. The rule
stays enforced; the one known-correct counterexample is named.

Handoff nodes describe where work goes. `contact.competition` is what decides
who is allowed to talk. They are not interchangeable evidence.

### 5.3 Canonical is implementation truth; the display graph is a reading of it

**`buildDisplayGraph()` in `src/lib/journey-canvas-layout.ts` is the only
sanctioned transform from canonical nodes to drawn cards, `representedSteps()`
is the traceability contract, and canonical semantics are never damaged to make
a prettier diagram.**

Every card that stands for more than one canonical node lists all of them in
the detail panel, in canonical order — *Represented canonical steps / Temsil
edilen kanonik adımlar*. That is what makes a collapse a change of **drawing**
rather than a change of **meaning**, and it is why the display work needed no
canonical mutation: all 73 journey audits recorded `mutation_required: false`.

The cost of forgetting this is on record. PR #9's gate collapse keyed on
`exitClass === "no-action"` alone and **erased authored business logic in five
journeys** — RET-24, TIM-63, RET-30, RET-32, ACQ-13 — found independently by
three audit slices. PR #10 replaced the signal: the short arm must pass through
a node that *records why nothing was sent*. That took the rule from 24
collapsed gates to nine, all nine literally asking "May the touch go out?", and
the fifteen it stopped collapsing are all real business questions.
`audit/guard-display.mjs` exists so that the next over-eager display rule fails
mechanically instead of being caught by reading.

The corollary held throughout: **no rule branches on a journey id, no
coordinate is hand-placed, and the ELK layout engine is unchanged.** Check 13
of the scope validator fails if a journey-specific renderer hack appears in the
canvas or card layer.

### 5.4 Never type a corpus number into copy

Pages read derived counts. `LIBRARY_COUNT`, `LIBRARY_CATEGORY_COUNT` and
`LIBRARY_ROWS` come from `LIBRARY_JOURNEYS`; `withLibraryCount()` is the only
filler for `{count}` and `{categories}` and **throws** on a `{rules}` token,
because no public page states a rule count. The supporting surfaces state their
own sizes on their own pages.

The failure mode this prevents is not hypothetical, and it is the one place the
discipline had to be extended twice. `search/build-search-index.mjs` is plain
Node — it cannot resolve the `@/` alias, so it re-derives the library from
`production/surface-assignment.json`. Its own comment claimed it applied the
same definition as `public-corpus.ts`, and it did not: it filtered on surface
and `sends || routesToHuman` but never on `excludedFromPublic`, so the library
card in the search index counted the library **surface**. It said "79 journeys,
21 categories" on `main` and would have said "82, 21" after batch D. It is
fixed — the index now carries `69 journeys` / `18 categories` — and the
surface-assignment rows now carry `excludedFromPublic` precisely so that every
plain-Node script drops the same 21.

The general form: **a number that is derived in two places will disagree in
one of them.** Either derive it once and export it, or make the second
derivation read an artifact that encodes the decision.

---

## 6. What the display work did to the canvas

Summarised here because the closing report should carry it; the full account is
`audit/REPORT.md` and `audit/patterns.md`.

Six audit slices read all 73 public journeys and proposed **46 distinct pattern
ids**, reconciled into six families. Five generic display transforms shipped —
implementation-gate collapse (#9/#10), bookkeeping absorption (#11), represented
canonical steps (#11), card text budgets (#12) and the Family B wait-into-its-
exclusive-condition fold (#14) — plus the removal of implementation vocabulary
from cards (#16).

The measured effect on the corpus as it stands, from `audit/display-after.json`
(69 journeys, both locales, 0 render errors, 0 locale leaks):

| | 73 journeys, before (`display-before.json`) | 69 journeys, now |
|---|---:|---:|
| EN display nodes, whole corpus | 1065 | **852** |
| per journey | min 8 / median 14 / max 34 | **min 6 / median 12 / max 29** |
| journeys over 16 nodes | 15 | **6** |
| journeys over 12 nodes | 57 | **32** |
| journeys still showing a plain Internal card | 52 | **0** |
| render errors · locale leaks | 0 · 0 | **0 · 0** |

The largest journey is still FBK-43 at 29 drawn nodes. The before column is a
73-journey corpus and the now column is a 69-journey one, so the totals are not
a like-for-like delta; the per-journey and share figures are.

One row from `audit/REPORT.md` is **not** reproducible against the current
artifact and should not be quoted from it: long cards. REPORT.md records "56 →
25" and a longest card of 133 characters. `display-after.json` today records
268 card texts over 110 characters and a longest of 257 (SCH-304 `w.checkin`,
EN). This is a measurement change, not a regression:
`audit/measure-display.mjs` was changed to dedupe the canvas's two mounts on
`layoutId` alone and **keep the longer of the two texts**, which is the
unclamped one from the hidden tab. The gate is now measuring the card's full
body rather than what the visible card clamps to. It needs a re-baseline before
anyone treats the number as a target. Listed in §8.

---

## 7. The gates, and what each one exists because of

Eight gates stand between the canonical data and the site. They overlap
deliberately, but each catches something none of the others can.

| gate | what only it catches |
|---|---|
| `npm run validate:canonical` | The graph's own ~25 invariants, parsed from the `.ts` files **as text**: exactly one trigger and it must equal `entry`, every node reachable, at least one reachable exit-or-handoff, every condition ≥ 2 branches, every wait with a timeout and explicit `windowExtendsOnEngagement`, every exit with `reEntry`, every handoff target existing. It is the only gate that sees the canonical graph as a graph. |
| `scripts/validate-public-scope.mjs` | The publishing boundary — 15 checks. The 69/21/90 partition and that both lists resolve; that every public journey declares a customer channel **and** has an action that sends on it; that no unknown channel value reaches a page and every projection goes through `publicChannels()`; that `surface-assignment.json` and the six search-index files carry the same 21; that no public journey hands off to an id that resolves to nothing; that every public journey is categorised, has a terminal state and bounds every wait; and that no journey-specific renderer hack exists in the canvas layer. It is the only gate that reads the *generated artifacts* back against the decision. |
| `audit/guard-display.mjs` (G1–G6) | That the drawing did not lose the meaning, against a **real render** in both locales. G1/G2: every canonical exit and handoff that a still-drawn node leads to is drawn. G3: a drawn condition keeps an out-edge per canonical branch. G4: the per-journey canonical semantic hash is unchanged. |
| — G5 and G6 specifically | These exist because of G1's own relaxation. G1 originally demanded that *every* canonical ending be drawn, which is wrong once a gate legitimately collapses: the gate takes its "record why nothing was sent" hop with it, and an exit reached only through that hop has nothing left pointing at it (RET-290 and FUL-291 are exactly this). Relaxing G1 to "drawn *if* a drawn node still leads to it" re-opened the hole G1 was written for — a wrongly collapsed business decision hides, its exits become unreachable, and no drawn parent is left to flag it. **G5** requires every journey to draw at least one ending. **G6** allows a condition to be missing only if it matches the one sanctioned gate shape: exactly two branches, exactly one of them an unexecuted hop into a `no-action` exit. G6 is not vacuous — 25 conditions were hidden when it was written and all 25 matched that shape. |
| `audit/canvas-hygiene.mjs` (H1–H4) | Implementation vocabulary reaching a card, on every card in both locales: H1 a canonical config key (`bounded_education.window`), H2 a sequence number (`Internal · 03`), H3 a namespaced external id (`external:sales-assignment`), H4 a message card that says nothing about the message. The guard proves the graph is intact; only this proves the card is readable. |
| `audit/measure-display.mjs` | Display node counts, long cards and **locale leaks on canvas cards** — the only gate that reads the text of every card on a detail page in both locales. |
| `audit/locale-sweep.mjs` | Whole-page Turkish leaks on every public TR route. It exists because `measure-display` inspects canvas cards on detail pages *only*, and therefore could not see **140 English text nodes on the TR routes** — 55 on `/tr/lab/customer-journeys`, 52 on lifecycle-states, 23 on runtime-mechanisms, 9 on `/tr/lab/journeys` and one on a detail route. 139 of the 140 were on listing pages, and no gate had ever looked at a listing page. The sweep fetches every public TR route (172 today, derived from the running server's own `sitemap.xml`), reads every text node, and flags any containing two or more distinct English function words. |
| `npm run validate:journey-production` | The frozen node-count baseline: the `production/` model asserted against numbers that must be moved deliberately, in the same commit as the corpus change. |
| `audit/assert-build.mjs` | That the server being measured is the build you just made. Every render gate calls it first. It exists because a stale server produced **two separate phantom defects**: a post-manifest guard run reporting `G5_NO_VISIBLE_ENDING` and `G6_DECISION_HIDDEN` on five brand-new journeys, because a server from an earlier build was serving cached 404s for slugs that did not exist when it started; and, worse, `next start -p 4511` **failing to bind** because another worktree held the port — it exits, the port still answers 200, every page renders from the old build, and the result was a TR locale leak that did not exist and was chased into the data before the server was suspected. |

### Run order matters, and it has cost time

`audit/build-manifest.mjs` rewrites `audit/canonical-baseline.json`, which is
exactly what G4 compares against. Run the manifest first and G4 compares the new
corpus to a baseline generated from the new corpus: it reports "no drift"
whatever changed. That happened once, on the A1 step, and had to be caught by
hand. **Run `guard-display.mjs` before `build-manifest.mjs`.** The full ordered
loop, and an order-independent cross-check that diffs the committed baseline,
are in `audit/checkpoint.md`.

### What is recorded as green

The last full run, recorded in `audit/checkpoint.md`, reports all of the above
passing at 69/303/3959, with route parity of 69 × 200 in EN and TR and 21 × 404
in EN and TR. The two artifacts on disk agree: `audit/guard-report.json` has
`canonical_drift: []` and `findings: []`; `audit/canvas-hygiene-report.json` has
1699 cards, 310 message cards, `findings: []`; `audit/locale-sweep-report.json`
has 172 routes and 0 leaks; `audit/display-after.json` has 69 journeys, 0 render
errors and 0 locale leaks.

The two gates that need no server were re-run for this report and their output
is quoted in §1: `validate:canonical` 0 errors, `validate-public-scope` 15
checks / 0 failures / 3 warnings / PASS. **The render gates were not re-run
here**, and this report does not claim a result it did not see.

---

## 8. What is still open

Nothing in this list blocks what has shipped. All of it is real.

### Turkish

1. **The preset chips have no Turkish anywhere**, and `locale-sweep` cannot
   catch them. `PRESET_ROWS[].name` and `.applicableWhen` come from
   `discovery.presets` in canonical data; `journey-tr-overrides.ts` is keyed by
   journey and node id and has nowhere to put them. The sweep's threshold is
   two distinct English function words, and a two-word title like *Quote
   Abandonment* never reaches it. Twenty-odd preset names need translating —
   a content decision, not a wiring fix. **This is the one open item the gate
   is structurally blind to.**
2. **The Info-tab and practitioner-view backlog.** The latest sweep reports
   **3,640 English text nodes across 166 of the 172 swept TR routes, 2,963 of
   them distinct** — 2,506 in the practitioner disclosure and 1,134 in the Info
   tab's deeper canonical fields (`eligibility`, `suppressions`, `guardrails`,
   `reusableRule`, `distinctFrom`, `measurement`, …). The gate **reports** this
   and does not fail on it: the Info tiles are excluded by string, read out of
   `canonical-dump.json` so the bucket shrinks on its own as they are
   translated, and the practitioner disclosure is excluded by region. The count
   is printed on every run so it cannot grow in silence. Translating it is a
   content project.

### Canvas

3. **`SIZE.exit` is 68** (`src/lib/journey-canvas-layout.ts:171`) and the worst
   Turkish exit wants about 103 in a 200px slot. Decision D1, approved fix:
   widen to ~240 and validate visually.
4. **The long-card measurement needs a re-baseline.** See §6:
   `measure-display.mjs` now keeps the unclamped of a node's two mounted texts,
   so its long-card figure is not comparable with `audit/REPORT.md`'s and
   currently reads 268 cards over 110 characters against a recorded 25. Either
   re-baseline the number or measure the visible card; do not treat the delta
   as a regression until one of those is done.
5. **D2–D7 remain open** in `audit/DECISIONS-PENDING.md`: the card text budget
   is in characters while the card is in pixels; two files disagree on branch
   label width; branch labels sit mid-connector rather than near the split
   (`elk.edgeLabels.placement` is unset); figure captions state the canonical
   node count rather than the drawn one; the trigger card does not read "When
   someone X"; and an archived handoff is a link that is not one, with no
   reason on the card.

### Data and decisions still pending

6. **B1, B2, B5** — touch counts where graph, cap and prose disagree. B5 is the
   one that shows up in this report's own numbers: ACT-13 and FBK-49 carry a
   cap of 2 that counts an internal work item, so their customer-touch cap is
   really 1 (§4.2). B1 (ACT-17) and B2 (ACT-12) are cap-versus-map
   disagreements.
7. **C2–C5** — verified still open against the current dump. C2: FUL-146 and
   FUL-148 have **zero exit nodes**; every ending is a handoff, so a reader sees
   no ending. C3: FUL-265's `x.unresolved` is `kind: "handoff"` — a handoff
   wearing an exit's id. C4: RSK-273's `a.reset` recipient is unstated on the
   held-elsewhere path. C5: INC-254 has **no wait node** at all, so the
   orchestration map's placing it under Event-or-timeout is wrong; the
   derivation in §4.1 does not count it, which confirms the map is the thing to
   correct.
8. **Phase 21 — the batch-by-batch canonical redesign over the library** was
   never started. `audit/DECISIONS-PENDING.md` is its input.

### Deliberately out of scope, per the batch notes

Each batch recorded what it refused to do, and each of these is a real gap in
the library rather than an oversight:

- **Loyalty downgrade has no journey.** SUB-299 handles upgrade
  only, and the refusal is in the graph, not in a comment: `loyalty_tier_changed`
  fires downward too, `c.direction` reads the programme's own ordering, and a
  downward movement exits at `x.out-of-scope` with no message. A loss of
  standing carries obligations an upgrade announcement does not have, and no
  journey in the corpus owns that message today — which is also why SUB-299
  hands off nowhere: a handoff to a target that does not exist is what
  `validate:canonical` forbids.
- **REM-305's transactional claim is not reciprocated.** It states that a
  marketing or lifecycle journey holding the person never delays or replaces an
  acknowledgement. That is a claim about the send path and the pressure rules,
  not a two-sided contest with any particular journey, and there is no single
  neighbour to edit. The stronger claim — *while any support request is open,
  unrelated promotional sends are suppressed* — is a product decision batch D
  was not given and could not state honestly.
- **SCH-304 does not hand off to SCH-177**, because SCH-266 already owns that
  seam and a second route into pre-service revalidation would mean two journeys
  claiming the same attendance question.
- **CON-300 and FUL-301 carry no `businessOutcome`.** Inventing a downstream
  business event for a journey whose success can be "we stopped sending" would
  have been a fabricated metric.
- **`CompetitionScope` was not extended.** `service-request` uses `topic`
  because `issue` is not in the closed union and extending the union for one
  group was not worth a schema change.

### Inherited, unrelated, unfixed

9. **`node seo/seo-validator.mjs` check 14** expects 43 calculator content files
   and there are 19, matching the 19 live slugs. Pre-existing; unrelated to this
   work. Check 18 — which hardcodes the journey count on purpose, as a tripwire
   — now reads `303` and is correct; it was left stale for a whole batch after
   Batch A, and because CLAUDE.md lists only check 14 as known-failing for that
   validator, the failure read as inherited drift. **Bump it in the same commit
   as the corpus change.**
10. **`npm run lint` has one pre-existing error**, `react-hooks/set-state-in-effect`
    at `src/components/ui/MobileNav.tsx:78`. A file none of this work touched,
    already on `main` before it started, not build-failing. Left alone
    deliberately rather than folded into an unrelated change.
11. **`search-validator` checks 30/31 and 9 query fixtures** fail for the same
    calculator-catalogue reason as check 14.

### Documentation drift found while writing this

12. **`audit/public-journey-scope.md` still states 52 / 21 / 73** and lists the
    52 by name. It is labelled the fixed product decision and code points at it
    (`public-corpus.ts`'s throw message names it), but the code now enforces 69
    / 21 / 90. `audit/public-scope-validation.md` likewise reconciles to 52.
    Both predate the seventeen and neither was updated. **The scope itself is
    not in doubt** — `public-corpus.ts` and `validate-public-scope.mjs` agree at
    69/21/90 and the render gates were run against it — but the document a
    reader is told is authoritative disagrees with the code. It should be
    extended to 69 rather than rewritten, so the 52 stays legible as the state
    the additions started from.
13. **`CLAUDE.md` states the library as 52 / 18** and the canonical corpus as
    286 / 3732 in several places. Same cause.
14. **Check 11's warning text in `scripts/validate-public-scope.mjs` is
    over-broad** — see §4.5. It says 54 handoffs render as text; 21 do. Nothing
    fails and nothing on the site is wrong; the warning compares against the 69
    where the renderer compares against the 158.
15. **`audit/new-journey-id-map.md`'s batch table still shows C and D as
    pending**, and batches B, C and D each state counts computed as if they were
    the only batch to land (B: 63, C: 61, D: 61). They were authored in parallel
    against the same base and reconciled afterwards. `audit/checkpoint.md` and
    `public-corpus.ts` carry the reconciled figures; the per-batch counts in the
    notes are correct for what each batch did in isolation and should be read
    that way.

---

## 9. Where to look next

| file | what it is |
|---|---|
| `src/lib/public-corpus.ts` | the scope, in code: both gates, both lists, the module-load assertion |
| `scripts/validate-public-scope.mjs` | the same decision enforced out of process, 15 checks |
| `audit/checkpoint.md` | execution status, the ordered gate loop, and the traps that have already cost time |
| `audit/public-journey-scope.md` · `audit/public-scope-validation.md` | the product decision and the RET-24 reconciliation (both still stating 52 — see §8.12) |
| `audit/new-journey-id-map.md` · `audit/batch-{b,c,d}-notes.md` | the seventeen: id allocation, ownership boundaries quoted from both sides, touch counts, and what each batch deliberately left out |
| `audit/new-journey-collision-review.md` | Phase 26 — the collision review over the seventeen |
| `audit/51-journey-design-matrix.md` | Phase 27 — one row per public journey, extended to 69; the authority on any individual journey's model, channels and timing |
| `audit/REPORT.md` · `audit/patterns.md` · `audit/glossary.md` | the display audit: what was found, the six families, and the shipped EN/TR pairs |
| `audit/DECISIONS-PENDING.md` | everything still blocked on a product call |
| `audit/locale-sweep-notes.md` | what was leaking on the TR routes, the one-layer fix, and the two backlogs the gate reports rather than fails |
| `production/canonical-dump.json` | the corpus itself, and the source of every derived number in §4 |
