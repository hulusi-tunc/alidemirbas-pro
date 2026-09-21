# Three fixes from the Phase 26 collision review

2026-09-21. Companion to `audit/collision-fix-evidence.mjs`, which is the data proof for
everything asserted here and runs off `production/canonical-dump.json` alone.

Six journeys changed: **ACT-13, ACT-14, ACQ-13, ACQ-289, REM-305, FIN-302**. No journey added,
removed, or moved across the public scope line; corpus stays **303 journeys / 3959 nodes**, public
scope stays **69 / 21 / 90**. No node was added or removed, so the frozen baseline in
`production/validate-journey-production.mjs` is untouched.

```
node audit/collision-fix-evidence.mjs
```

---

## Fix 1 — ACT-13 and ACT-14 are `service`

### What changed

`src/canonical/activation.ts`:

| journey | before | after |
| --- | --- | --- |
| ACT-13 Onboarding Blocker Reminder | `defaultPriority: "lifecycle"` / `pressureClass: "lifecycle"` | `"service"` / `"service"` |
| ACT-14 Onboarding Help | `defaultPriority: "lifecycle"` / `pressureClass: "lifecycle"` | `"service"` / `"service"` |

and the `s.sunset` suppression was **removed from both**. It said "A standing sender-side marketing
suppression stops this journey … it covers promotional and lifecycle communication alike". On a
service-class journey that is a false statement about the gate, not a conservative one: GLB-31 says
in its own words that the sunset "suppresses promotional and lifecycle communication to that person
and **leaves service, transactional, security and mandatory communication to their own rules**". A
service journey carrying a marketing stand-down would be claiming a gate that does not apply to it.

ACT-12 Onboarding Nurture is untouched, as instructed: still `lifecycle`, still reads the sunset.

### Why the class is the right lever

The three journeys named in the review are structurally identical and already declare `service`:

```
ACC-263 Activation Reminder        service/service   trigger entitlement_provisioned_and_reachable
RLT-279 Upgrade Blocker Reminder   service/service   trigger target_held_on_named_prerequisite
TIM-268 Action Required Reminder   service/service   trigger customer_owed_obligation_outstanding
ACT-13 Onboarding Blocker Reminder →service/service  trigger activation_blocked_by_named_requirement
ACT-14 Onboarding Help             →service/service  trigger help_seeking_without_activation_progress
```

RLT-279 and ACT-13 are the same shape stated twice — a named prerequisite holding a target — and one
of them was answering blocked people while the other was not. ACT-14's trigger is a person asking
for help. The sunset suppresses by class, so while these two were `lifecycle` somebody who stopped
answering marketing and is blocked in onboarding got nothing at all.

The three reference journeys also carry **only** `s.g*` suppressions — none of them states the
sunset. Removing `s.sunset` therefore makes ACT-13/ACT-14 match the journeys they were aligned to
exactly, rather than adding a new "this gate does not reach me" statement that no other service
journey in the corpus makes.

### The other consumers of these two fields — checked, not assumed

Everything that reads `contact.defaultPriority` / `contact.pressureClass`:

| reader | effect of lifecycle → service |
| --- | --- |
| `scripts/sunset-suppression-evidence.mjs` | the intended one: both move from "must read" to "must NOT read" |
| `scripts/vnext-rules.mjs:469` `pressure_class_conflict` | errors only for `transactional`/`security` with a pressure class. `service` is unaffected; `PRIORITIES` lists `service` as valid |
| `scripts/vnext-rules.mjs:450` `mandatory_promotional_conflict` | fires on a mandatory or transactional touch inside a `promotional`/`lifecycle` journey with no `priorityReason`. Both journeys' touches are `mandatory: false` with no `priority` override, so this rule was not firing before and cannot fire now |
| `scripts/vnext-rules.mjs:444-448` touch priority resolution | both journeys' touches resolve to the journey default and override nothing |
| `src/lib/practitioner-view.ts` → `PractitionerView.tsx` | renders the two strings verbatim under "priority" / "pressure class". Display only; both labels are already localized |
| `scripts/lowering-fixture.mjs` | carries the class into a frequency-gate primitive. Its `pressureClass !== "none"` branch still holds, so ACT-13/ACT-14 still declare a class-level pressure cap — nothing became exempt |
| `scripts/vnext-recipes.mjs`, `vnext-changelog.mjs`, `vnext-review-print.mjs`, `vnext-readiness.mjs` | printers; `readiness` scores presence of `defaultPriority`, not its value |
| `src/canonical/surface.ts`, `src/lib/public-corpus.ts`, `search/build-search-index.mjs`, `scripts/surface-assignment.mjs` | **do not read priority at all**. Surface is derived from channels and `execution`, so neither journey moved surface; `surface-assignment.mjs` still reports `customer 154 / mechanism 25 / operational 124` |

Local caps and cooldowns are per-journey keys (`activation_blocker.*`, `struggling_user.*`) and are
unchanged — nothing about the budget or its `appliesTo` depends on the class.

### Did anything in these two journeys only make sense under `lifecycle`?

Checked line by line. No. Both journeys' `eligibility` gates on `"hard gates (GLB-31) allow
communication **for this purpose**"` — purpose-scoped, and correct under either class. Neither
mentions marketing permission, a promotional budget, or an optional-contact cap. ACT-13's
`s.g1`–`s.g3` are about naming the requirement; ACT-14's `s.g1`–`s.g4` are about not interrupting
someone productive, respecting an open support case, respecting a decline, and capping the offer at
two. All of those are service-class rules already. `s.sunset` was the only statement that depended
on the class, and it is gone.

### Evidence

```
$ node scripts/sunset-suppression-evidence.mjs
SUPPRESSED CLASSES (promotional, lifecycle) - must read: 27
  … ACT-13 and ACT-14 no longer listed; ACT-12 still listed and still reading
EVERY OTHER CLASS - must NOT read: 61
  service                 41  0 reading (must be 0)     (was 39)
PASS - 1 writer, 27/27 suppressed-class journeys read it, 0 of 61 others do.
```

27, not 29, and the two are in the must-NOT-read set. Before the change the same script printed
`29/29` and `service 39`.

---

## Fix 2 — `commerce-recovery`: ACQ-289 ranks above ACQ-13

### The deadlock as it stood

Both claimed the bottom of an 8-member group and both are `onLoss: "suppressed"`, so on a contest
each deferred to the other and neither sent. GLB-02 forbids inventing a tie-break at runtime.

```
ACQ-13  "lowest in the group - a process in motion, a held selection and a predicted need all outrank …"
ACQ-289 "lowest in the commerce-recovery group - a checkout in motion, a held cart and a held selection all outrank …"
```

### What changed

`src/canonical/acquisition.ts`, four strings — the precedence and the `s.contest` suppression on
each side, so the ordering is stated in both the collision block and the prose a reader sees first:

- **ACQ-289** now reads *"below the rest of the commerce-recovery group and above unresolved
  interest recovery (ACQ-13) … this alert takes precedence over inferred-interest recovery, because
  a named item the person asked for and could not buy because it was unavailable is a specific thing
  they chose and its return is a state change they can act on now, where an inferred interest is
  neither — the same reason an availability enquiry for a stated window (SCH-282) outranks that
  journey"*. Its `s.contest` gains the reciprocal sentence.
- **ACQ-13** now reads *"below every other member of the group, the back-in-stock alert (ACQ-289)
  included … Where ACQ-289 holds the person, this journey **yields** and is suppressed for them
  rather than queued behind it"*. Its `s.contest` gains ACQ-289 to the list of journeys that
  suppress it.

Neither uses a bare "lowest in the group" any more. ACQ-13 is now genuinely the unique bottom, and
it says so by naming everything above it rather than by claiming a rank nothing else contests.

### The "specific beats general" premise — checked, and it is written differently

The brief asked me to verify that ACQ-287/288's precedence over ACQ-11/ACQ-12 is written as
specific-beats-general. **It is not, quite.** What those two actually say is a *specialisation*
relation — one journey is the concrete implementation of another journey's generic pattern:

> ACQ-287: "the concrete checkout implementation owns a checkout in motion, and outranks **the
> generic process-recovery pattern (ACQ-11) it specialises**"
> ACQ-288: "above **the generic held-selection pattern (ACQ-12) it specialises**, which is suppressed
> for the same selection while this journey holds it"

ACQ-289 is not a specialisation of ACQ-13 — a back-in-stock alert is not an implementation of
unresolved-interest recovery — so copying that wording would have made a claim the graph does not
support. There is, however, a real specific-beats-general precedent in the same group, and it is
about the *strength of the signal* rather than about one journey specialising another:

> SCH-282: "alongside interest recovery - **an availability enquiry that asked for a specific window
> outranks inferred interest** for the same person"

plus the group's running rationale, "a process in motion outranks a held selection", "a held
selection outranks inferred interest". That is the pattern ACQ-289's new text mirrors, and it names
SCH-282 as the precedent rather than ACQ-287/288. The decision itself is unchanged; only the
sentence it leans on is.

### The rest of the group

Checked all six others. None becomes false. ACQ-287 claims the top, ACQ-11/ACQ-12/ACQ-288/RET-31
state relations among themselves and with "inferred interest" (ACQ-13), and SCH-282 states its
relation to ACQ-13. ACQ-289 stays below all of them, exactly where "lowest in the group" had it, so
every existing statement about them remains true; the only edge that moved is ACQ-289 → ACQ-13. The
evidence script asserts that no other member claims to rank *below* the back-in-stock alert, which
is the only way one of them could have become wrong.

### Evidence

```
group members: 8 - ACQ-11, ACQ-12, ACQ-13, ACQ-287, ACQ-288, ACQ-289, RET-31, SCH-282
ok    the group still has 8 members
unqualified bottom claims: ACQ-13          (a bottom claim that names nothing it ranks above)
ok    at most one member claims the bottom of the group unqualified (found 1)
ok    ACQ-13's precedence names ACQ-289          ok  ACQ-13's precedence says it yields
ok    ACQ-289's precedence names ACQ-13          ok  ACQ-289's precedence says it ranks above
ok    both keep onLoss: suppressed
ok    ACQ-13's s.contest names ACQ-289           ok  ACQ-289's s.contest names ACQ-13
ok    ACQ-11/ACQ-12/ACQ-287/ACQ-288/RET-31/SCH-282 do not claim to rank below the back-in-stock alert
```

---

## Fix 3 — FIN-302 owns the refund message

### It is not a competition-group problem

Quoted from both sides before asserting anything:

```
REM-305 contact.competition : service-request (scope topic, onLoss suppressed)
FIN-302 contact.competition : none
service-request group members: REM-151, REM-157, REM-305
```

REM-305's group is scoped to the **topic** — the request — and holds the three journeys that would
otherwise all speak to a requester about the same unanswered problem, with REM-305 highest "while
the request is still only a request". FIN-302 is not one of those: its subject is a payment record,
it opens only once money is actually moving, and it speaks *after*, not before, the first answer.

Adding FIN-302 to `service-request` would have been actively wrong twice over. GLB-01 says
membership is declared rather than inferred and that "adding a group to make a suppression convenient
is how unrelated lifecycles start blocking each other". And mechanically, under REM-305's own
precedence the acknowledgement outranks the rest of that group, so a grouped FIN-302 would be
**suppressed** by a support acknowledgement — the refund notice silenced by the case notice, which is
the opposite of the decision. So the fix is **suppressions plus reciprocal `distinctFrom`**, and no
group changed on either side.

### What changed

`src/canonical/remedy.ts` (REM-305):

| node | before | after |
| --- | --- | --- |
| `a.resolution` | "Say that the request is closed and **what closed it**." | "Say that the request is closed and **that a resolution was reached, named in the terms the requester raised it in rather than in the terms of any money that moved — that belongs to FIN-302**." |
| `a.resolved-now` | "Say that the thing they raised is already done, and **what was done**." | "…and **which resolution closed it, described as what happened to the request**. Where that resolution was money going back, the money itself is not named here — the amount, the timing and whether it has settled are the financial record's to announce (FIN-302)." |

Both nodes keep their id, kind, `execution`, `idempotencyKey`, `writes` and successor, so no node
was added, removed or renamed.

The two touches that carry them were tightened to match — `t2`/`t3` `purpose` no longer promise
"what was done" / "what closed it", and both gained a `destination.mustNotClaim` entry: *"a refund:
not the amount, not when it will appear, not whether it has settled"*. `mustNotClaim` is the
corpus's existing mechanism for "this message must not say X", and it is the one a copy reviewer
actually reads.

A new suppression **`s.money`** states the boundary as a rule, and is listed in
`orchestration.noAction` beside `s.no-outcome`, the sibling content rule:

> No message from this journey states a refund. That a refund was decided is the deciding journey's
> to say (FIN-137), and that money has moved and whether it arrived is the refund notification's
> (FIN-302), which reads it from the financial record. This journey says that the case is closed and
> that a resolution was reached, and never the amount, never when it will appear and never whether it
> has settled. Two senders describing the same money leave the person holding the earlier and less
> reliable one.

A `distinctFrom` row naming FIN-302 says what REM-305 does not say, and states explicitly that the
two are not in contest and share no group.

`src/canonical/financial.ts` (FIN-302), stating the boundary back:

- **`s.decision`** — which already named FIN-137 and REM-157 — now also names REM-305 and asserts
  ownership: *"it is the only journey that announces that movement: the case-closure message from the
  support request acknowledgement (REM-305) says that the request is closed and that a resolution was
  reached, and states no amount, no timing and no settlement state, so the two complement each other
  rather than compete."*
- a **`distinctFrom`** row naming REM-305, matching the row REM-305 now carries.

`s.approved` ("Approved is not refunded and submitted is not settled"), `s.timing`, `s.partial` and
`s.unknown` are untouched — the approved/submitted/settled separation is not weakened anywhere.

### Evidence

```
REM-305 communicating nodes: a.resolved-now, a.acknowledge, a.resolution
ok    REM-305 a.resolved-now states no refund outcome on its own account (and hands the money to FIN-302)
ok    REM-305 a.acknowledge  states no refund outcome on its own account
ok    REM-305 a.resolution   states no refund outcome on its own account (and hands the money to FIN-302)
ok    REM-305 touches t1/t2/t3 purpose no longer promises "what closed it" / "what was done"
ok    REM-305 touch t2 mustNotClaim names the refund   ok  touch t3 mustNotClaim names the refund
ok    REM-305 carries a suppression naming FIN-302
ok    REM-305 distinctFrom names FIN-302               ok  FIN-302 distinctFrom names REM-305
ok    FIN-302's s.decision names REM-305
ok    FIN-302 keeps its approved/submitted/settled separation (s.approved, s.timing)
ok    FIN-302 is in no competition group - unchanged   ok  REM-305 keeps the service-request group
ok    FIN-302 was not added to the service-request group
```

The "states no refund outcome" test strips the sentences that hand the money to FIN-302 **by
sentence, not by node** — so naming FIN-302 somewhere does not excuse a refund claim elsewhere in the
same text — and then looks for `refund`, `repaid`, `reimburse`, `amount`, `settle*` or `money` in
what is left.

---

## Turkish

`src/lib/journey-tr-overrides.ts` carries the two rewritten node headlines under `REM-305`, in the
existing register. No node id is new, and no other changed field is on a canvas card: precedence,
suppression and `distinctFrom` prose lives in the Info tiles, which
`audit/locale-sweep-notes.md` documents as the pre-existing translation backlog, reported and not
failed.

| node | TR |
| --- | --- |
| `a.resolution` | "Talebin kapandığını ve bir çözüme ulaşıldığını, talep sahibinin sorunu anlattığı terimlerle söyle - hareket eden paranın terimleriyle değil; o FIN-302'ye aittir. …" |
| `a.resolved-now` | "Bildirdikleri şeyin çoktan yapılmış olduğunu ve talebi hangi çözümün kapattığını, talebin başına ne geldiği olarak söyle. O çözüm paranın geri dönmesiyse, paranın kendisi burada anılmaz - tutar, zamanlama ve paranın hesaba geçip geçmediği finansal kaydın duyuracağı şeylerdir (FIN-302). …" |

`audit/locale-sweep.mjs` reports **0 leaks** across 172 TR routes and
`audit/measure-display.mjs` **0 locale leaks** across 69 journeys.

---

## Decisions taken inside the three fixes

1. **ACT-13/ACT-14 got no replacement statement for `s.sunset`.** A "the marketing stand-down does
   not reach me" suppression would have been true but unprecedented — none of ACC-263, RLT-279 or
   TIM-268 carries one. Matching the journeys they were aligned to beat documenting a gate in the
   one place it does not apply.
2. **ACQ-289's new precedence cites SCH-282, not ACQ-287/288**, because ACQ-287/288 state a
   specialisation relation rather than specific-beats-general. See fix 2 above.
3. **ACQ-289 stays below the whole rest of the group.** The settled decision is only ACQ-289 above
   ACQ-13; moving it relative to RET-31 or SCH-282 as well would have been a second decision nobody
   made, and would have falsified two other members' texts.
4. **Fix 3 is suppressions plus reciprocal `distinctFrom`, not a group.** Reasoning quoted above from
   both sides' `contact.competition`.
5. **`s.money` is listed in `orchestration.noAction`.** REM-305 already lists every one of its
   suppressions there, including the content rule `s.no-outcome`; leaving the new one out would have
   been the inconsistency.
6. **`mustNotClaim` carries the rule onto the touches**, not only the suppression, because that is
   the field the corpus uses for "this message must not say X".

## Two pre-existing stale artifacts, deliberately not regenerated

Both predate this change and both would have buried it under unrelated drift. Reported rather than
fixed here:

- **`production/journey-seo-metadata.json`** is at 286 journey records; the corpus has 303. Running
  `production/build_seo_metadata.py` adds the 17 Phase 25–33 journeys plus CON-300, which then fails
  `npm run validate:seo` checks 1 and 2 against their frozen counts (and surfaces an unrelated
  `unsupported_superlative` on RET-294 "Next Best Offer"). `audit/checkpoint.md`'s documented Python
  loop deliberately omits `build_seo_metadata.py` for this reason. The file is reverted; `npm run
  validate:seo` passes.
- **`VNEXT_CUSTOMER_READINESS.json`, `VNEXT_MIGRATION_CHANGELOG.md` and
  `production/vnext-recipes.md`** are at 68 communicating customer journeys; the corpus has 87.
  Regenerating them is a ~2,900-line diff of Phase 25–33 content. Reverted; they are not part of any
  gate.
