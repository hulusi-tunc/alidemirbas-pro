# Batch D — three scheduling / service journeys

Phase 25, batch D of the 17 planned public additions (`audit/new-journey-id-map.md`).

| Id | Journey | Category | Slug | Nodes | Customer-facing touches |
|---|---|---|---|---|---:|
| SCH-303 | Reservation Payment Reminder | scheduling | `reservation-payment-reminder` | 18 | 3 |
| SCH-304 | Pre-Arrival Preparation | scheduling | `pre-arrival-preparation` | 20 | 3 (each conditional) |
| REM-305 | Support Request Acknowledgement | remedy | `support-request-acknowledgement` | 20 | 3 actions, at most 2 per instance |

Counts this batch produces, authored against the corpus as it stood after batch A
and with no account taken of batches B and C: public library **58 → 61**,
excluded **21** (untouched), library surface **79 → 82**, canonical corpus
**292/3802 → 295/3860**.

## The ownership boundaries, and which side each is stated from

Both boundaries below are stated from **every** side. A one-sided boundary is a
bug: `contact.competition` is what decides who may speak, and a journey that does
not declare the group is not in the contest, whatever the other journey's prose
says about it. Seven journeys carry these two groups — the three new ones and
**SCH-266, SCH-277, REM-151 and REM-157**, each of which replaced
`contact.competition: "none"` with a block. Those four are the only existing
journeys this batch changed at all, and on each of them `contact.competition`
is the only field that moved: no node, edge, rule, suppression or count.

### 1. `booking-lifecycle` (scope `reservation`) — four members

SCH-303 and SCH-304 act on the same booking entity SCH-266 and SCH-277 already
hold, at different points in it. Without a shared group, four journeys would each
be entitled to message the same holder about the same booking inside the same
window. The ordering is: **whether the commitment exists** outranks **whether it
survives**, which outranks **whether the holder's side will be ready**, which
outranks **how to turn up**.

**SCH-277 Booking Confirmation** (was `"none"`):

> "highest in the booking-lifecycle group: while the requested time has not yet
> become a commitment, nothing else may speak to the requester about this booking
> - the reservation payment reminder (SCH-303), the readiness reminder (SCH-266)
> and the pre-arrival notice (SCH-304) are all suppressed for it, because each of
> them presumes a commitment this journey has not yet established"

**SCH-303 Reservation Payment Reminder** (new):

> "second in the booking-lifecycle group: below the booking outcome notice
> (SCH-277), which decides whether there is a reservation at all, and above the
> readiness reminder (SCH-266) and the pre-arrival notice (SCH-304) - a
> reservation that may be released outranks anything about preparing for it or
> turning up to it"

**SCH-266 Appointment Reminder** (was `"none"`):

> "third in the booking-lifecycle group: below the booking outcome notice
> (SCH-277), which decides whether the commitment exists, and below the
> reservation payment reminder (SCH-303), because a reservation that may be
> released outranks getting its holder ready for it - and above the pre-arrival
> notice (SCH-304), which is suppressed while a prerequisite that could stop the
> service is still outstanding, since the at-risk notice restates the time and
> the place itself"

**SCH-304 Pre-Arrival Preparation** (new):

> "lowest in the booking-lifecycle group: the booking outcome notice (SCH-277),
> the reservation payment reminder (SCH-303) and the readiness reminder (SCH-266)
> all outrank it, because whether the commitment exists, whether it survives and
> whether the holder's side will be ready are each prior to how to turn up - and
> each of those journeys restates the time and the place itself, so a suppressed
> arrival message loses nothing the holder needed"

All four declare `onLoss: "suppressed"` — not `paused`. A booking message held
and released later is a message about a state that has moved, which is the exact
failure GLB-06 and GLB-07 exist to stop.

### 2. `service-request` (scope `topic`) — three members

REM-305 is intake, upstream of REM-151 and REM-157. The hazard is a requester
hearing from two places before the first answer.

**REM-305 Support Request Acknowledgement** (new):

> "highest in the service-request group while the request is still only a
> request: until ownership moves at the handoff, neither the issue assessment
> (REM-151) nor remedy selection (REM-157) speaks to the requester about the same
> problem, because the first thing somebody hears after raising a problem has to
> be that it arrived and who has it"

**REM-151 Post-Purchase Issue Recovery** (was `"none"`):

> "second in the service-request group: below the support request acknowledgement
> (REM-305), which owns what the requester hears first and hands the case over
> only once the acknowledgement window has closed with the request still open;
> above remedy selection (REM-157), which speaks only after this journey has
> established that an obligation exists"

**REM-157 Remedy Confirmation** (was `"none"`):

> "lowest in the service-request group: it speaks only once the issue assessment
> (REM-151) has established the unresolved obligation and handed the case over,
> and while either the support request acknowledgement (REM-305) or that
> assessment holds the case this journey is suppressed for it - a remedy offered
> before anybody has said the problem is real is an admission nobody made"

### 3. SCH-303 → FIN-134, stated from both sides

SCH-303's subject is the reservation and its recoverability; the payment is a
condition on it. When a payment attempt actually fails, that is FIN-134's job.

- SCH-303 states it as suppression `s.failure-not-ours`: *"An attempted payment
  that actually failed is not a reminder problem. Ownership of the money moves to
  payment recovery (FIN-134), and this journey stops talking about the payment
  rather than running alongside it."* It is also a real edge — `h.payment-failure`
  handoff to FIN-134, carrying the obligation, the release point the booking terms
  assert, and what the holder has already been told — and a `suppresses` clause
  on that handoff.
- SCH-303's `distinctFrom` names FIN-134 first: *"FIN-134 starts from a payment
  that failed and works on the obligation until it is discharged. This starts
  from a reservation that is still standing and works on whether it survives."*
- FIN-134 was **not** edited. Its side of this boundary was already stated, in
  its own entity note (*"Three things, and the failure touches only the first"*)
  and in its `distinctFrom` against TIM-274, which states the same doctrine in the
  same shape: FIN-134 owns what is said about an unpaid obligation, and hands off
  rather than running beside whoever owns the consequence. Adding a competition
  block to FIN-134 would have put it in the `booking-lifecycle` group, which is
  false — FIN-134 is not a booking journey and most of its instances have no
  reservation behind them at all. Writing that boundary as a handoff contract plus
  a suppression on the side that defers is the honest shape, and it is the shape
  the corpus already uses for FIN-134 → TIM-274.

## Scope vocabulary

`CompetitionScope` is a closed union in `src/canonical/types.ts`. The booking
group uses `reservation`, which fits exactly and had no members before this
batch. The service-request group uses `topic`: the contest is over one subject of
conversation with the requester — the problem they raised — which survives the
request becoming an issue and keeps the same instance across all three members.
`issue` would have been the more literal word and is not in the union; extending
the union for one group was not worth a schema change this batch cannot justify.

## Customer-facing touch counts

- **SCH-303 — 3.** The outstanding notice, the final notice at the due point, and
  the statement that the reservation was released. The third is owed rather than
  discretionary (`localCap.appliesTo: "non-mandatory"`, both later touches
  `mandatory: true`): a place that disappears in silence is discovered by the
  holder on the day.
- **SCH-304 — 3, every one of them conditional.** Arrival details when the window
  opens; a check-in prompt only where a check-in step exists, is open and is not
  already done; a late detail only where the booking now holds an arrival fact
  this journey has not already sent. An occurrence with nothing new to say reaches
  `x.ready` having spent nothing. The direction for this refactor was a maximum of
  three, and the reason each one earns its place is stated as a guardrail: *"A
  message whose content is how long remains is a countdown, and this journey does
  not send one."*
- **REM-305 — 3 communication actions, at most 2 on any instance.** Either the
  resolved-on-receipt message alone, or the acknowledgement followed (only if the
  request's own state changes) by one resolution notice. A request still open when
  the acknowledgement window closes is handed to REM-151 and gets **nothing** —
  the anti-drip rule, written as suppression `s.no-drip`.

Each journey's `contact.localCap` counts only what it may choose *not* to send.
SCH-303's final notice and release notice are both `mandatory: true` and sit
outside the cap, so its discretionary budget is **1**, not 3. REM-305's
acknowledgement is `mandatory: true` and its two state-change messages are
alternative paths, so its discretionary budget is **1** as well. SCH-304's three
touches are all discretionary and its cap is **3** with `appliesTo: "all"`. The
validator cannot check a cap against its own prose, so the figures were reconciled
by hand against each graph's `mandatory` flags.

## The acknowledgement outranking marketing

REM-305 carries `defaultPriority: "transactional"` and `pressureClass: "none"`,
and states the rule as suppression `s.transactional`: *"An acknowledgement is
transactional. It is deduplicated against other messages about the same request
rather than rationed against a promotional budget, and a marketing or lifecycle
journey holding the person never delays it or takes its place. Hard gates
(GLB-31) still apply, and nothing else does."*

This one is deliberately **not** reciprocated on a named marketing journey. The
claim it makes is about the send path and the pressure rules — GLB-24 and GLB-31
— not about a two-sided contest with any particular journey, and there is no
single neighbour to edit. The stronger claim that would need a second side (*"while
any support request is open for this person, unrelated promotional sends are
suppressed"*) is a product decision this batch was not given and could not state
honestly: an open request about one subject says nothing about whether a message
about a different subject is welcome. It is recorded here as a thing deliberately
left out of scope rather than assumed.

## Also deliberately out of scope

- **SCH-304 does not hand off to SCH-177.** SCH-266 already owns that seam
  (`h.prestart`), and a second route into pre-service revalidation would mean two
  journeys claiming the same attendance question. SCH-304 ends in exits and lets
  attendance be observed where it already is.
- **SCH-303 is not a dunning journey.** It never retries, never classifies a
  decline, never names an amount overdue as a debt, and never sends a second
  message about the money after the handoff. Every one of those belongs to
  FIN-134.
- **No new external handoff target** was introduced, so `EXTERNAL_TARGET_TR`
  is unchanged.
- **`search/build-search-index.mjs`'s `libraryRows` was NOT corrected**, though
  it is wrong. Its own comment says the library card's number is "a PUBLIC
  journey that sends or routes to a person … same definition as
  src/lib/public-corpus.ts's LIBRARY_JOURNEYS", but the filter reads
  `r.surface === "customer" && (r.sends || r.routesToHuman)` and never checks
  `r.excludedFromPublic` — so the `lab-product:lifecycle-card-archive` document
  counts the library SURFACE, not the public library. It said `79 journeys, 21
  categories` on `main` before this batch and says `82 journeys, 21 categories`
  after it; the correct figures are 61 and 18. This is pre-existing drift, not
  something batch D introduced, and it is a public-facing number in the one file
  all four batches regenerate — so it is left for whoever reconciles the counts
  centrally rather than fixed here, where three parallel branches would each
  carry a different version of the same one-line change.
- **Two new curated wait events**, both in `scripts/event-curation.json`:
  `check_in_completed` (distinguished in its own meaning from
  `attendance_recorded`: it records readiness, not attendance) and
  `support_request_resolved`. The three new trigger events register themselves
  from the corpus.
