# Cycle and dead-end audit

Governing brief Parts 21–22. Audit only — nothing under `src/`, `production/`, `scripts/`,
`seo/`, `search/` or site UI was touched.

## Method

`relationship-graph.json`'s 522 handoff edges (of 548 total, the rest being 22 competition and 4
preemption edges) were computed mechanically via Tarjan's SCC algorithm; this document takes that
as a starting point and traces every one of the 16 real cycles (SCC size > 1) node-by-node against
`production/canonical-dump.json` — the mechanical dump of `src/canonical/*.ts` — reading each
member's trigger, waits (with their `timeout`/`onTimeout`), actions (with their `writes`), exits
(with `terminal` and `reEntry`), and `guardrails`/`reusableRule` text. Every claim below cites the
specific node id(s) and, where the corpus states it explicitly, the guardrail sentence that
establishes the bound. Section 2 covers dead-end detection.

Corpus-wide structural facts used throughout: zero dangling handoffs (every `targetId` resolves to
a real node, confirmed by `targetExists`/`isMergedTarget` both false-count = 0 across all 522
handoffs), and the canonical validator's own invariants (every wait has an explicit timeout and
`windowExtendsOnEngagement`, every exit carries a `reEntry`, every trigger is reachable) hold for
every member journey inspected below.

---

## 1. The 16 strongly connected components

### SCC 1 — DEC/OWN/REM/FIN hub cluster (23 members) — **SAFE, bounded escalation network; one P2**

`FBK-47, DEC-186, DEC-187, FIN-137, REM-154, REM-153, REM-152, REM-155, REM-158, REM-156, REM-157,
DEC-190, DEC-188, DEC-185, OWN-53, CTL-237, OWN-54, OWN-55, DEC-184, DEC-189, DEC-183, DEC-182,
DEC-181`

This is the corpus's shared decision/approval/escalation/remedy hub. It has 53 internal edges but
**125 inbound edges from outside the SCC** (from all five surfaces — customer-silent,
customer-communicating, operational, mechanism) and only **7 edges leaving it** (`FIN-137→FIN-138`,
two `→external:external-status-reconciliation`, and four `→external:*` from `DEC-181`/`DEC-185`/
`DEC-187`). Its fan-in/fan-out ratio (125:7) confirms this is a genuine shared utility, not a
runaway loop pretending to be one — almost every "needs a human judgment / needs money to move /
needs a return-remedy-fulfilled" moment in the entire corpus routes here, and the SCC's internal
structure exists because those needs (decision → remedy → decision, decision → approval →
reconsideration → decision) are inherently recursive by business nature, not by accident.

**Entry points.** Two shapes: (a) any of the 125 external handoffs, most landing on `DEC-181:t.required`
(the general decision-request entry) or `OWN-55:t.escalation` (the general escalation entry); (b)
domain-specific entries — `FIN-137:t.requested` (refund requested), `REM-152:t.requested` (return
requested), `REM-157:t.decision` (remedy decision required), `OWN-53/54:t.effective/t.change`
(ownership transfer), `FBK-47:t.appeal` (appeal filed).

**Internal sub-loops traced:**
- **Decision assignment loop**: `DEC-181 →(h.assign) DEC-182 →(h.review) DEC-183 →(h.reassign) DEC-182`
  and `DEC-183 →(h.escalate) DEC-189 →(h.return) DEC-182`. Bounded by two independent mechanisms:
  `DEC-182`'s own guardrail — *"Reassignment is bounded rather than repeated until someone happens
  to accept"* — and `DEC-189`'s wait `w.decision` timing out (`onTimeout=h.governance`) into
  `OWN-55`, which exits the assign/review/escalate/return loop into the escalation ladder. `DEC-189`'s
  own guardrail: *"Escalation is bounded by defined levels rather than repeated indefinitely."*
- **Approval revalidation loop**: `DEC-185 →(h.validity) DEC-188 →(h.re-review) DEC-190 →(h.review) DEC-183`
  and `DEC-190 →(h.new) DEC-181`. Each pass writes only to `decision_log` (append). `DEC-190`'s
  guardrail: *"Reopened is not the original decision deleted"* / *"the historical decision record is
  never mutated in place"* — so a re-review never re-executes the original approved action, it opens
  a fresh decision case.
- **Appeal loop**: `DEC-186 →(h.appeal) FBK-47 →(h.deadline) DEC-181`. Single-pass per appeal;
  `FBK-47`'s own two waits (`w.review`, `w.more-info`) are both bound to `appeal_deadline_at`, an
  attribute that does not move, so a second appeal is a new `t.appeal` instance rather than a
  re-entry into the same wait.
- **Ownership transfer/escalation loop**: `OWN-54 →(h.escalate) OWN-55 →(h.transfer) OWN-54` and
  `OWN-55 →(h.no-path / h.exhausted) DEC-181`. `OWN-55`'s guardrail is the load-bearing one for the
  *entire* SCC's escalation traffic: *"Repeated escalation is bounded by the ladder rather than by
  patience"* and *"An exhausted ladder closes as an operational exception with no customer-facing
  message."* Also load-bearing: *"Escalation is an internal operational state throughout... a
  message goes out only where a separate communication obligation exists for it"* — i.e. looping
  inside this SCC never itself re-triggers customer-facing sends, which is the mechanism that keeps
  the 125 inbound customer-surface handoffs (`ACC-78`, `IDN-84`, `TRM-105`, `SUB-167`, `SCH-177`,
  etc.) from turning escalation churn into message spam.
- **Remedy selection loop**: `REM-157 →(h.correction) REM-156 →(h.verify) REM-158 →(h.continue /
  h.alternative) REM-157`, and the parallel `REM-157 →(h.replacement) REM-155 →(h.verify) REM-158
  →(...) REM-157`, and `REM-157 →(h.return) REM-152 →(h.transit) REM-153 →(h.inspect) REM-154
  →(h.remedy) REM-157`. This is the one sub-loop in the SCC where **each iteration has a real
  external side effect** (a replacement is shipped, a correction is reperformed, a further return
  is authorised) rather than only an audit-log append. It is bounded in *time* the same way as the
  rest of the SCC (every wait — `REM-155:w.availability`, `REM-155:w.replacement`, `REM-156:w.correction`,
  `REM-158:w.remedy`, `REM-152:w.decision` — carries a mandatory timeout that routes to an
  `h.alternative`/`h.escalate` exit rather than re-waiting), and `REM-157`'s own concurrency guard
  (`entity.concurrency: one-active-per-key` plus its eligibility clause *"no instance of this journey
  is already open for the confirmed issue and the unresolved obligation behind it"*) prevents
  parallel duplicate remedy attempts on the same obligation. What the corpus does **not** state
  explicitly, unlike `OWN-55`'s escalation ladder or `CMS-208`'s retry budget (SCC 6 below), is a
  numeric *attempt ceiling* on how many times remedy selection may re-cycle for one obligation
  before it is forced to a human decision — each re-entry is gated by a genuine new failure event
  (`h.alternative`: "a remedy that failed to complete"), not by blind repetition, so this is not an
  unbounded side-effecting cycle in the P0 sense, but it is the one place in this SCC where a
  stated ceiling would add real defense in depth. **P2.**

**Bounding condition (SCC-wide):** every wait in every one of the 23 members carries a mandatory
`timeout` (validator-enforced) whose `onTimeout` always routes either to another SCC member, to
`OWN-55`'s bounded escalation ladder, or out of the SCC entirely — there is no wait whose timeout
loops back to itself. The 33 internal actions across the 23 members write exclusively to per-domain
audit logs (`decision_log`, `escalation_log`, `ownership_chain`, `obligation_transfer_log`,
`remedy_log`, `refund_log`, `return_log`, `delegation_log`) — append-only, non-customer-facing —
except the remedy-selection sub-loop noted above, whose side effects are real but gated by genuine
new-failure evidence each time, and the ordinary case (`DEC-185`/`DEC-187`'s `h.execute`) which
exits the SCC before anything executes.

**Verdict: SAFE — bounded escalation/decision/remedy hub.** One P2 (no explicit numeric attempt
ceiling on the remedy-selection sub-loop; recommend one mirroring `OWN-55`'s ladder pattern).

### SCC 6 — CMS/CON send-path retry chain (7 members) — **SAFE, explicitly bounded — already audited by the Runtime Mechanism round**

`CMS-208, CMS-206, CMS-205, CMS-204, CMS-203, CMS-202, CON-36`

Entry: `CMS-201:h.recipient → CMS-202:t.created` (a communication obligation created — this is the
mechanism layer every customer journey's `channels` declaration ultimately routes through).
Internal path: `CMS-202 →(h.permission) CMS-203 →(h.route) CMS-204 →(h.send-ready) CMS-205
→(h.attempt) CMS-206 →(h.recover) CMS-208`, which either exits (`x.abandoned`, `x.retrying`) or
re-enters via `CMS-208 →(h.fallback) CMS-203` (an alternate destination) or `CMS-208
→(h.contactability) CON-36 →(h.reroute) CMS-202` (a destination-health change).

**This is the one SCC the corpus states its bound in the plainest possible language.**
`CMS-208`'s guardrails: *"Retry is bounded rather than infinite"* and, decisively, *"The retry
budget is fixed at the first failure and does not renew."* Its own exit `x.retrying`'s `reEntry`
text confirms the mechanics: *"each retry is a new send attempt with its own outcome, and a failure
on it returns here with the budget one lower"* — a strictly decreasing counter, not a resettable
one. `CON-36`'s guardrail adds the second half of the bound for the reroute leg: *"Repair attempts
are bounded per cycle. A contact point that fails re-verification stays suppressed rather than
being retried blind."*

**Exit points:** `CMS-206:h.reconcile→external` (unknown outcome needing reconciliation), `CMS-203:
h.escalate→CMS-210` (mandatory communication, no permitted route — mechanism-internal, not this
SCC), `CMS-203:h.review→DEC-181` (undefined permission policy — into SCC 1), `CMS-208:h.obligation
→CMS-210` (budget exhausted, no channel left), `CON-36:h.human→external:human-in-the-loop-lifecycle`
(no permitted way to deliver at all).

**Side effects per iteration:** every action writes to `delivery_log`/`communication_log`/
`contactability_log` (audit) plus, on suppression, `suppressed_sends` — the corpus-wide
send-suppression ledger. No node in this SCC ever re-sends without the decremented budget check;
`CMS-206`'s own guardrail — *"A blind resend may create duplicate communication"* — is the explicit
statement of the failure mode this SCC's design prevents.

**Verdict: SAFE.** This matches the grounding data's own note that this cluster was already audited
by the Runtime Mechanism round (`RETRY-AND-FAILURE-AUDIT.md`); this pass corroborates that
conclusion from the complete cross-library graph and finds nothing to add.

### SCC 2 — OWN-51 ↔ OWN-52 (assignment/reroute) — **SAFE**

Entry via `FBK-46`/`TIM-62` → `OWN-51:t.created` (orphaned work needing an owner). `OWN-51
→(h.assign) OWN-52 →(h.reroute) OWN-51` on an assignment nobody took. Bounded by `OWN-52`'s wait
`w.acceptance`, timeout → `c.sla` → (outside this SCC) `OWN-52:h.escalate→OWN-55`. Side effects are
`assignment_log`/`routing_log` appends only. Exits to `OWN-55` (SLA breach) or `OWN-53` (accepted,
work starts) after at most one reroute cycle per SLA window.

### SCC 3 — ACT-17 ↔ ACT-18 (adoption stall/recover) — **SAFE, explicit anti-repeat guardrail**

`ACT-17 →(h.stall) ACT-18 →(h.adoption) ACT-17` on value produced again after recovery. `ACT-18`'s
wait `w.recover` timeout routes to `h.monitor→external:health-monitoring`, exiting the loop
entirely rather than re-nudging: the reason text is explicit — *"a recovery attempt that has not
worked does not work better repeated."* This is a deliberately single-shot recovery attempt, not a
retry loop; the 2-cycle exists only because a second stall after a real recovery is a legitimately
new instance of the same pattern, not recursion.

### SCC 4 — ACT-11 ↔ ACT-12 ↔ ACT-13 (onboarding route/blocker) — **SAFE**

`ACT-11:t.entry →(h.progress) ACT-12 →(h.blocker) ACT-13 →(h.resume) ACT-12`, with `ACT-13
→(h.reroute) ACT-11` for an alternate path around a blocker. Each hop is gated by a real state
change (a milestone completed, a blocker cleared or replaced) and every wait (`ACT-12:w.progress`,
`ACT-13:w.resolve`) times out to a named terminal-ish exit (`x.window-closed`, `x.blocked`) or an
external escalation (`ACT-13:h.escalate→external:human-in-the-loop-lifecycle`), not back into the
same wait.

### SCC 5 — RET-23 ↔ RET-27 (deterioration/recovery) — **SAFE**

`RET-23 →(h.recovery) RET-27 →(h.rediagnose) RET-23` on relapse inside the stability window.
`RET-27`'s wait `w.stability` is explicitly framed as success-on-timeout (*"surviving the window
without relapse is the evidence"*), and a relapse is a real regression event, not a scheduled
re-check — so recurrence is bounded by how many times health can actually decline and recover, not
by the machinery itself. `RET-23`'s own diagnostic wait times out to `x.unexplained` (lower-
frequency monitoring), a genuine exit.

### SCC 7 — OWN-56 ↔ OWN-59 (approval reject/resubmit) — **SAFE, explicit anti-rubber-stamp guardrail**

`OWN-56 →(h.rejected) OWN-59 →(h.resubmit) OWN-56` only "on a genuine revision of a rejected
subject." `OWN-59`'s guardrail is the load-bearing one: *"Sending the same thing back is not a
revision, and letting it through is how approval becomes a queue people learn to clear rather than
read"* — the loop structurally cannot be triggered by a non-substantive resubmission. `OWN-59`'s
own wait `w.revision` times out to `x.expired` (a real exit), and `OWN-59` additionally has a
`terminal: true` exit (`x.terminal`, "rejected, no revision path") that is unreachable from within
the cycle at all — it is reached only from outside, closing the loop permanently for a given case.

### SCC 8 — IDN-86 ↔ ACC-75 (step-up authentication) — **SAFE — see also `BOUNDARY-CLASSIFICATION-REVIEW.md`**

`ACC-75 →(h.stepup) IDN-86 →(h.resume) ACC-75` is a **tight, synchronous, two-node
challenge/response cycle**: an access attempt needing higher assurance triggers a step-up, and a
completed step-up re-attempts the *same* access decision from scratch (`ACC-75`'s own guardrail:
*"the next attempt is decided again... allowing one action never authorises the following one"*).
`IDN-86`'s wait `w.stepup` times out to `x.blocked` (deny by default — the safe outcome, per its
own reason text). There is no scenario in which this 2-cycle re-enters itself more than once per
actual attempt, since each pass is a fresh, independently-decided access check rather than a
retried one. This is the SCC whose membership matters most for the boundary review below: the
mutual, synchronous, side-effect-free (only `authentication_log`/`authorization_log` appends) shape
of this cycle is itself evidence that `IDN-86`/`ACC-75` behave like Runtime-Mechanism-shaped
control flow rather than Operational-Workflow-shaped human work — see that document for the full
reassessment.

### SCC 9 — ACC-76 ↔ ACC-77 (credential issue/revoke) — **SAFE**

`ACC-76 →(h.revoke) ACC-77 →(h.new) ACC-76` — a credential being revoked and (optionally) replaced
by a new one, which is itself a new artifact with its own id and its own lifecycle (`ACC-76`'s
`x.replaced` exit reEntry: *"the replacement runs its own lifecycle. This one is never reactivated,
whatever happens to the replacement"*). This does not "loop" in the runaway sense at all: each pass
mints a genuinely new instance rather than re-entering the same one, and `ACC-77`'s own exit
(`x.no-access`, "revoked; no replacement issued") is the ordinary path that ends the chain with no
further cycle.

### SCC 10 — FUL-144/145/146/147/148 (fulfillment execution/delay/exception/dispatch/failed) — **SAFE, no explicit numeric cap — P2**

The largest fulfillment sub-graph: `FUL-144 →(h.dispatch) FUL-147 →(h.delay) FUL-146 →(h.resume)
FUL-144`, `FUL-144 →(h.exception) FUL-145 →(h.delay) FUL-146 →(h.exception) FUL-145`, `FUL-147
→(h.failed) FUL-148 →(h.retry) FUL-147`. Every hop is gated by a mandatory, independently-timed
wait (`FUL-144:w.execution`, `FUL-146:w.decision`/`w.resume`, `FUL-147:w.delivery`, `FUL-148:
w.correction`/`w.route-choice`, `FUL-145:w.approval`), so the cycle is bounded in elapsed time even
though — unlike `CMS-208`'s explicit "budget" — no member states a numeric retry ceiling. Eventual
exits: `FUL-149` (delivered), `FUL-150` (obligation ends, cancellation/remedy), `OWN-55` (delay
outliving its revised horizon), `REM-151` (returned/reported, out of attempts language appears only
in the *inbound* edge from `FUL-265`, not as a field on these five). **P2: recommend an explicit
attempt counter on `FUL-148:h.retry`, mirroring `CMS-208`'s "budget" pattern**, since a chain of
transient delivery failures could otherwise cycle `FUL-147→FUL-148→FUL-147` for as many windows as
the courier keeps failing before a human ever sees it (today the only forcing function is
`FUL-146`'s delay-horizon timeout, one hop removed from the retry itself).

### SCC 11 — FUL-142 ↔ FUL-143 (resource allocation) — **SAFE**

`FUL-142 →(h.allocate) FUL-143 →(h.recheck) FUL-142` only on losing a race for a resource that had
appeared available. `FUL-143`'s wait `w.allocation` is attribute-bound to `reservation_expires_at`
(a real, non-renewing deadline); `FUL-142`'s wait `w.capacity` times out to `a.unavailable` and out
of the SCC to `FUL-150`. No unbounded retry — each recheck is one race-loss event, and reservations
expire rather than extend.

### SCC 12 — SUB-164 ↔ SUB-165 (renewal execution/payment failure) — **SAFE**

`SUB-164 →(h.payment-failure) SUB-165 →(h.complete) SUB-164` — bounded by `SUB-165`'s
attribute-bound grace deadline (*"the grace state lasts exactly as long as the grace policy for
this subscription class defines; its end is the consequence, never an extension invented here"*),
timing out to `a.lapse`. One grace cycle per renewal; a second payment failure after a completed
recovery is a new renewal window's own instance.

### SCC 13 — DOC-215 ↔ DOC-216 ↔ DOC-220 (signature/effectiveness/reconciliation) — **SAFE**

`DOC-215:h.effective→DOC-216`, `DOC-216:h.reconcile→DOC-220` (signatures bound to the wrong
version), `DOC-220:h.resign→DOC-215` (re-request signatures against the authoritative version).
Each leg fires only on a genuine new inconsistency (`DOC-220`'s trigger:
`document_version_inconsistency_detected`) rather than repeating the same one — `DOC-220`'s own
exit `x.reconciled` closes the specific conflict, and its `reEntry` text is explicit that a further
inconsistency is a new, separately-evidenced event. `DOC-215`'s two waits are both bound to
`validity_ends_at`, a fixed attribute.

### SCC 14 — DAT-222 → DAT-223 → DAT-224 → DAT-225 → DAT-222 (import validate/preview/execute/recover) — **SAFE, explicit budget language**

`DAT-222 →(h.preview) DAT-223 →(h.execute) DAT-224 →(h.recover) DAT-225 →(h.revalidate) DAT-222`
(corrected records only). Like `CMS-208`, `DAT-225`'s own exit `x.retrying`'s `reEntry` states the
bound directly: *"each retry reports its own per-record outcomes and returns here with the
unresolved set smaller and the budget one lower."* The loop also narrows monotonically by
construction — `DAT-222:h.preview` explicitly excludes the already-successful scope each pass, so
the working set shrinks even independent of the budget counter.

### SCC 15 — RLT-245 ↔ RLT-246 ↔ RLT-250 (staged rollout pilot/pause/complete/reopen) — **SAFE**

`RLT-245 →(h.pause) RLT-246 →(h.resume) RLT-245`, `RLT-245 →(h.complete) RLT-250 →(h.reopen)
RLT-246`. Bounded by `RLT-245`'s maximum-observation-window wait and `RLT-250`'s
post-change-observation-window wait, both of which time out to real conclusions (`c.sufficient`,
`a.stable`) rather than re-waiting. A reopen requires "a late material regression in a completed
change" — real evidence, not a scheduled retry — and `RLT-246` has its own escape hatch out of the
SCC entirely via `h.rollback→RLT-247`.

### SCC 16 — INC-253 ↔ INC-256 ↔ INC-257 (incident mitigate/recover/observe) — **SAFE, but the one SCC where relapse has no stated ceiling — P2**

`INC-253 →(h.recovery) INC-256 →(h.observe) INC-257 →(h.active) INC-253` on "a recovery that did
not hold." Every wait times out appropriately (`INC-256:w.outcome→a.unknown`, `INC-257:w.observe
→a.stable`), and a relapse is by definition evidence-gated (the same failure actually returning),
not blind repetition — this is intentional flap-handling for an incident that keeps recurring, not
a defect. Unlike SCC 1's `OWN-55` or SCC 6's `CMS-208`, however, no member states a ceiling on how
many mitigate→recover→observe passes are tolerated before the incident is forced into a different
track (e.g. a mandatory `OWN-55` escalation regardless of whether any individual wait has timed
out). **P2: recommend a stated relapse-count-triggers-escalation rule**, consistent with how
`OWN-55` already treats "work outliving the whole escalation ladder" elsewhere in the corpus.

---

## 2. Dead-end detection (Part 22)

**Structural layer — none found.** Every one of the 522 handoff edges resolves to a real node
(`targetExists: true` or `isExternal: true`); zero point at a merged/retired id (`isMergedTarget`
count = 0 across the whole graph) and zero are dangling. The 8 merged ids (`CON-37→CMS-208`,
`CMS-209→CON-36`, `CTL-239→OWN-57`, `CTL-240→OWN-54`, `RET-25→RSK-192`, `FBK-44`/`FBK-45→FBK-43`,
`ACT-15→ACT-17`) do not appear as either a `sourceId` or `targetId` anywhere in the 548-edge graph
— confirming they were fully retired from the handoff layer, not merely hidden from the sitemap.

**Semantic layer — spot-checked corpus-wide, one soft call-out.** The canonical validator already
enforces "every exit carries a `reEntry`", so a literal empty dead end is structurally impossible;
the real question is whether any `reEntry` text is dishonest about there being a path back. Checked
every non-terminal (`terminal: false`) exit's `reEntry` for an admission of "none"/emptiness (found
exactly one: `ACQ-11:x.superseded`, *"none for this process; the newer process owns recovery"* —
not a dead end, this is `ACQ-11` correctly yielding ownership to the `commerce-recovery` competition
group's higher-precedence journey, confirmed by its own `competition` edge), and every `terminal:
true` exit's `reEntry` for one that implies a live path back into the *same* instance (found 9,
listed below — all of them correctly describe only a **new instance** starting fresh, which is the
intended and consistent shape for a terminal exit, not a contradiction):

`ACQ-285:x.stopped`, `TIM-268:x.satisfied`, `TIM-281:x.terminal`, `REL-284:x.closed`,
`TRM-275:x.closed`, `INT-269:x.removed`, `FUL-265:x.delivered`, `FUL-265:x.accepted`,
`DEC-267:x.final` — each terminal exit's own reEntry text names a specific different starting point
("a new instance," "a new connection... enters through activation, not through this journey") for a
future case, rather than claiming continuity with the closed one. No contradiction found.

**The one genuine soft call-out** is `DEC-189:x.no-authority` (SCC 1, non-terminal): *"no authority
exists to decide this; the case is stopped and named rather than circulating"*, with `reEntry`:
*"an authority being defined for this decision type reopens it. Until then it is visibly
unresolvable rather than invisibly unassigned."* This is a deliberately named terminal-in-practice
state pending a governance action (assigning an authority) that lives entirely outside the
canonical graph — it is not a bug (the corpus is explicit that this is the honest alternative to
inventing an authority), but it is worth flagging as the one place in the audited cycles where
"the path back" is not itself part of any journey's graph. **Informational, not a defect.**

**Escalation-into-a-dead-target check.** Every `h.escalate`/`h.governance` edge in SCC 1 and every
other SCC's escalation edges resolve to `OWN-55` (SCC 1 member, itself fully bounded — see above) or
to a named `external:*` target; none resolve to a merged id or to a node with no further path. No
dead-end escalations found.

**Result-nothing-consumes check.** Out of scope for a fully exhaustive pass (would require a
full-text search of every `writes.field` against every node's read/condition text across 284
journeys, not just the handoff graph); spot-checked the shared audit-log fields
(`suppressed_sends`, `decision_log`, `delivery_log`) used across the SCCs above and found them to be
the corpus's known, intentionally-shared ledgers rather than orphaned outputs. No further claim made
here without a dedicated pass.

---

## Findings summary

| # | SCC / finding | Members | Verdict | Severity | Basis |
|---|---|---|---|---|---|
| 1 | DEC/OWN/REM/FIN hub | 23 | SAFE (bounded) | P2 (remedy sub-loop, no numeric cap) | `OWN-55`/`DEC-182`/`DEC-189` guardrails explicit; remedy sub-loop gated by real failure events but uncapped |
| 2 | OWN-51/OWN-52 | 2 | SAFE | — | SLA-bound wait, audit-only writes |
| 3 | ACT-17/ACT-18 | 2 | SAFE | — | Explicit "does not work better repeated" guardrail |
| 4 | ACT-11/12/13 | 3 | SAFE | — | Every hop gated by real state change |
| 5 | RET-23/RET-27 | 2 | SAFE | — | Timeout-as-success design; relapse is real evidence |
| 6 | CMS/CON send-path | 7 | SAFE | — | Explicit fixed, non-renewing retry budget |
| 7 | OWN-56/OWN-59 | 2 | SAFE | — | Explicit anti-rubber-stamp guardrail |
| 8 | IDN-86/ACC-75 | 2 | SAFE | — | Synchronous, side-effect-free re-decision each pass |
| 9 | ACC-76/ACC-77 | 2 | SAFE | — | Each replacement is a new artifact/instance |
| 10 | FUL execution cluster | 5 | SAFE | P2 (no numeric retry cap) | Time-bounded by waits; no stated attempt ceiling |
| 11 | FUL-142/FUL-143 | 2 | SAFE | — | Attribute-bound reservation expiry |
| 12 | SUB-164/SUB-165 | 2 | SAFE | — | Attribute-bound grace deadline |
| 13 | DOC-215/216/220 | 3 | SAFE | — | Each leg gated by a genuinely new inconsistency |
| 14 | DAT-222/223/224/225 | 4 | SAFE | — | Explicit shrinking-budget retry language |
| 15 | RLT-245/246/250 | 3 | SAFE | — | Observation-window timeouts; reopen requires real regression |
| 16 | INC-253/256/257 | 3 | SAFE | P2 (no relapse ceiling) | Evidence-gated relapse; no stated escalation-after-N-relapses rule |
| 17 | Dead-end: structural | — | None found | — | 0 dangling / 0 merged-target handoffs across 522 edges |
| 18 | Dead-end: `DEC-189:x.no-authority` | — | Soft call-out | Informational | Path back lives outside the canonical graph, by design |

**No P0 (unbounded, side-effecting cycle) found anywhere in the 16 SCCs.** Every cycle in the
corpus is either explicitly, textually bounded (SCCs 1, 6, 7, 14 state their bound in guardrail
prose) or structurally bounded by mandatory, non-renewing wait timeouts combined with a
real-evidence gate on re-entry (all others). The three P2s (SCC 1's remedy sub-loop, SCC 10's
fulfillment retry chain, SCC 16's incident relapse) share one recommendation: add an explicit
numeric ceiling alongside the existing time-bound, matching the pattern the corpus already uses for
`OWN-55` and `CMS-208`/`DAT-225`, for defense in depth rather than because a runaway has been found.
