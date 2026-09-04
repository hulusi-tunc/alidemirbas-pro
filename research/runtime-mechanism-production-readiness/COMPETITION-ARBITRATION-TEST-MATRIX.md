# Competition Arbitration — test matrix

`OPS-131`'s own `testScenarios` (`runtime-mechanism-contracts.json`), consolidated into one table
against the round's own required coverage (Part 11) and the corpus's real 7 competition groups
(re-derived in `COMPETITION-ARBITRATION-ARCHITECTURE.md`), since the repo has no test framework —
the established corpus-wide pattern of the entire three-round program is that a `testScenarios`
entry in the mechanism's own contract is the regression coverage.

| Required coverage | Real group exercised | Given | Expected |
|---|---|---|---|
| Simultaneous eligibility | `account-restriction-authority` | `ACC-78` and `IDN-90` both become eligible on the same account | `c.precedence` resolves deterministically to `IDN-90` (declared highest) without escalation; `ACC-78` suppressed via its own declared `onLoss` (`paused`) |
| Concurrent workers | `account-restriction-authority` | Two workers evaluate the same `(exclusion_group, scope_instance_id)` at the same instant, proposing different winners | `a.claim`'s atomicity resolves both to the same single owner (`IDN-90`); the losing worker's own claim attempt returns the already-established owner, not a second record |
| Duplicate arbitration | `account-restriction-authority` | The same already-resolved contender set is re-submitted for arbitration | `a.claim`'s `idempotencyKey` resolves it to the same existing owner and outcome, not a re-decision |
| Stronger contender later (preemption) | `purchase-intent` | `ACQ-07` (lowest precedence) already owns a product scope instance when `ACQ-08` (highest — reached commercial destination) becomes eligible on the same instance | A fresh trigger re-arbitrates the same `scope_instance_id`; `c.precedence` now resolves to `ACQ-08`; `a.suppress-losers` applies `ACQ-07`'s own declared `onLoss` (`exit`) and invalidates whatever `ACQ-07` still had queued |
| Winner resolves (re-entry) | `relationship-continuity` | `SUB-167` (cancellation) wins over `SUB-163` (renewal), then `SUB-167` itself resolves | `w.ownership`'s `onEvent` fires `a.reevaluate`, which re-runs arbitration from `SUB-163`'s **current** eligibility (`GLB-06`) rather than resuming it from the standing it had when it lost (`GLB-10`) — if `SUB-163` is no longer eligible for an unrelated reason, it does not silently resume |
| Stale queued action | `retention-outreach` | `RET-24` already has a retention message queued when `RET-28` (declared cancellation intent, higher precedence) becomes eligible and wins the same account scope instance | `a.suppress-losers` invalidates `RET-24`'s queued message before it executes (`GLB-07`) — it does not send merely because it was queued before `RET-24` lost |
| Different scope (isolation) | `commerce-recovery` | `ACQ-11`/`ACQ-12` compete on person P1's scope while the identical pair also runs on unrelated person P2 | `GLB-01`/`GLB-08`: P1's and P2's contests are evaluated independently on their own `scope_instance_id` — winning ownership on P1 has no effect on P2's own arbitration |
| Equal precedence | `outbound-ask` | `FBK-41` (satisfaction) and `FBK-42` (advocacy) both become eligible for the same person at the same moment | Not a genuine tie: each journey's own declared precedence text names the other by id and states the outcome directly (`FBK-42` wins, `FBK-41` suppressed and free to re-open at its next moment) — `c.precedence` resolves without escalation |
| Genuine tie escalation | *(hypothetical — no current group has an unresolved tie)* | A future exclusion group whose declared precedence leaves two contenders at literally equal standing with neither `GLB-02` discriminator applicable | `h.escalate` hands off to `DEC-181` rather than inventing a local tie-break — the round's own DO-NOT instruction against using worker/arrival order as precedence |

## Coverage against the corpus's real 7 groups

| Group | Exercised by | Not separately exercised because |
|---|---|---|
| `account-restriction-authority` | simultaneous eligibility, concurrent workers, duplicate arbitration | — |
| `purchase-intent` | stronger contender later (preemption) | its own internal ordering (`ACQ-08` > `ACQ-04` > `ACQ-07`) is the same `c.precedence` mechanism the preemption scenario already walks through twice |
| `commerce-recovery` | different-scope isolation | its own 5-member total order (`ACQ-11` > `ACQ-12`/`RET-31` > `ACQ-13`/`SCH-282`) is the same precedence-resolution path the account-restriction-authority scenario already covers with a simpler 2-member group |
| `lifecycle-stage` | *(not separately exercised)* | 2-member total order, structurally identical in shape to `account-restriction-authority`'s own scenario — `ACT-12` is additionally reachable via `preemptedBy` (a specific-event preemption, a different corpus mechanism entirely, not `OPS-131`'s own concern) |
| `retention-outreach` | stale queued action | its own 6-member total order is the same `c.precedence` path exercised elsewhere; the group was chosen specifically because it is the corpus's largest, most realistic case for a genuinely queued consequential message |
| `outbound-ask` | equal precedence | — |
| `relationship-continuity` | winner resolves / re-entry | — |

Every one of the 7 real groups touches at least one scenario. The two structurally-redundant groups
(`purchase-intent`'s and `commerce-recovery`'s own internal ordering, `lifecycle-stage`) are not
given their own dedicated scenario because they would exercise the identical `c.precedence` code
path a already-covered scenario exercises — adding them would be volume, not coverage, matching the
round's own "do not force P1/P2 to zero, do not pad findings" discipline applied here to test count
instead.

## What this matrix intentionally does not claim

No test here proves a specific database, lock, or lease implementation is correct — per the
schema's own layering (Canonical Mechanism → Implementation Contract → Company Mapping → Platform
Implementation), `OPS-131`'s contract states the atomicity *requirement*
(`conflictArbitration.contract.atomicityPrimitive: "compare-and-set"`) and each scenario's
*expected* outcome; a company's own mapping is what a company-specific test suite would exercise
against its actual primitive. This matrix is the canonical-layer regression coverage the rest of
the three-round program already established as sufficient for a repository with no test framework,
not a substitute for a company's own integration tests once it builds against this contract.
