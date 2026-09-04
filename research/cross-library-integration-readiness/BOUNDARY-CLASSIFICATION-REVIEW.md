# Boundary classification review

Governing brief Part 26. Reassessment only — **nothing reclassified this round**, per the brief's
explicit instruction and consistent with the discipline the prior Operational Workflow round
itself applied. For each of the 7 previously-flagged candidates: current surface, suspected
surface, this round's new integration evidence (cited edges from the complete 548-edge graph),
confidence before (from `research/operational-workflow-production-readiness/
BOUNDARY-CLASSIFICATION-AUDIT.md`), confidence after, and a recommendation only.

## Method

The prior round could only ask whether each candidate's own ownership/assignment/evidence/SLA
shape read as mechanism-like or human-work-like in isolation. This round adds what that round could
not see: every inbound and outbound edge each candidate actually has, corpus-wide, and which
surface sits on the other end of each one. The test applied: does the candidate's real integration
traffic run with the Runtime Mechanisms (the 25 `MECHANISM_IDS` — the `CMS-2xx`, `CON-3x`,
`OPS-12x` send-path/retry/reconciliation machinery), with Customer Journeys, or exclusively with
other Operational Workflows (which would weaken the boundary suspicion, since integrating only with
other operational work is itself evidence of belonging there)?

## Candidates suspected Runtime Mechanism

### REL-95 (Parent State Propagation)

- **Current surface:** operational (category `structure`; entity scope "the parent whose state
  changed, and each child evaluated individually against the dependency model" — no
  `CUSTOMER_ENTITY` match, so `surfaceOf()` would keep it operational even if reclassified in
  isolation).
- **Suspected surface:** Runtime Mechanism.
- **New integration evidence:** zero inbound edges anywhere in the 548-edge graph. Exactly two
  outbound: `h.undefined→DEC-181` (operational escalation hub, on "a parent state change with no
  defined dependency model") and `h.reconcile→external:commitment-reconciliation` (a named external
  target, not another canonical item). **No edge to or from any of the 25 Mechanism-surface items**
  (no `CMS-*`, `CON-3x`, `OPS-12x` interaction in either direction) and no edge to or from any
  Customer Journey.
- **Confidence before:** medium.
- **Confidence after:** medium, essentially unchanged — the complete graph is inconclusive rather
  than corroborating. Handing off to `DEC-181` on an undefined-policy branch is not
  mechanism-distinguishing: Runtime Mechanisms do exactly the same thing elsewhere in the corpus
  (e.g. `CMS-203:h.review→DEC-181`, `CON-40:h.manual→DEC-181`, `OPS-126:h.undefined→DEC-181`), so
  this edge shape is common to both surfaces and does not discriminate between them. What the new
  evidence *does* add is confirmation of total isolation from the rest of the graph in every other
  direction, which is consistent with either reading.
- **Recommendation:** unchanged from the prior round — report only, no reclassification. If a
  dedicated round is opened, it should look past the DEC-181 edge (uninformative) to the same
  design-shape questions the prior round already asked (ownership/queue/SLA all N/A).

### REL-96 (Parent State Aggregation)

- **Current surface:** operational (category `structure`; entity scope "the parent and the full
  collection of children the policy reads" — no `CUSTOMER_ENTITY` match).
- **Suspected surface:** Runtime Mechanism.
- **New integration evidence:** zero inbound edges. One outbound: `h.undefined→DEC-181` ("a child
  change with no aggregation policy to combine it"). Same shape as `REL-95`, same non-discriminating
  DEC-181 edge, no Mechanism-surface or Customer-Journey traffic in either direction.
- **Confidence before:** medium.
- **Confidence after:** medium, unchanged, for the identical reason as `REL-95`.
- **Recommendation:** unchanged — report only.

### RSK-191 (Policy Evaluation)

- **Current surface:** operational (category `risk`, which is not in `CUSTOMER_CATEGORIES` at
  all — `RSK-191` could not become `customer-silent` even with a customer-worded entity; the only
  surfaces reachable for it are `operational` or `mechanism`).
- **Suspected surface:** Runtime Mechanism.
- **New integration evidence:** zero inbound edges. One outbound: `h.review→DEC-181` ("an action
  policy cannot determine, or whose governing version cannot be established"). Same
  non-discriminating shape as `REL-95`/`REL-96` — no traffic with any of the 25 Mechanism-surface
  items.
- **Confidence before:** medium.
- **Confidence after:** medium, unchanged.
- **Recommendation:** unchanged — report only.

## Candidate suspected Runtime Mechanism (with new inbound evidence)

### RSK-198 (Policy Exception Lifecycle)

- **Current surface:** operational (category `risk`, same category restriction as `RSK-191`).
- **Suspected surface:** Runtime Mechanism.
- **New integration evidence:** **one confirmed inbound edge**, not zero as the prior round's
  narrower view suggested it might resolve to: `RSK-197:h.apply→RSK-198:t.authorized` ("an
  authorized exception ready to be applied"). `RSK-197` is itself squarely Operational-Workflow
  classified (category `risk`, entity scope "the exception request and the specific policy, action
  or entity it concerns"). Zero outbound edges — `RSK-198` is a pure terminal sink in the handoff
  graph (matches the 11-item terminal-sink cohort in `ORPHAN-AND-COVERAGE-AUDIT.md`).
- **Confidence before:** medium.
- **Confidence after:** **slightly weakened, still medium-low.** The one piece of real integration
  traffic this item has anywhere in the 284-item corpus is with another Operational Workflow
  (`RSK-197`), not with any of the 25 Mechanism-surface items — if `RSK-198` were genuinely
  infrastructure the send-path/retry layer depends on the way `CON-34`/`OPS-126` are, its one real
  caller would more plausibly be a Mechanism than another Operational Workflow's own exception
  process. This is new evidence and it points mildly against the mechanism reading, though it does
  not resolve it (a token/lease-consumption shape can legitimately be called by ordinary workflow
  code either way).
- **Recommendation:** unchanged — report only. The prior round's own P0 concurrency fix (applied as
  an operational workflow, closing the `exception_id` check-then-act race) remains valid regardless
  of which surface eventually owns this item, per that round's own reasoning.

## Candidates suspected Runtime Mechanism — cycle membership is new, load-bearing evidence

### IDN-86 (Step-Up Authentication)

- **Current surface:** operational (category `identity`; entity scope "the actor, the specific
  protected action and the authentication context around it" — "actor" does not match
  `CUSTOMER_ENTITY`'s vocabulary, which is why an `identity`-category item still lands operational).
- **Suspected surface:** Runtime Mechanism.
- **New integration evidence:** confirmed member of SCC 8, a **tight, mutual, synchronous 2-node
  cycle with `ACC-75`**: `ACC-75:h.stepup→IDN-86:t.stepup` / `IDN-86:h.resume→ACC-75:t.attempt` (see
  `CYCLE-AND-DEAD-END-AUDIT.md` §SCC 8). Additionally, `IDN-86` receives a **direct inbound handoff
  from a Customer Journey** — `IDN-85:h.stepup→IDN-86:t.stepup` (`IDN-85` is
  `customer-communicating`) — meaning this item sits directly in a live customer-facing control
  path, serving a Customer Journey's own need the way the send-path Mechanisms (`CMS-2xx`) serve
  every communicating journey's `channels` declaration without being customer journeys themselves.
  Its own action set writes only to `authentication_log` (no business-domain audit log of the kind
  Operational Workflows elsewhere write to, e.g. `decision_log`, `remedy_log`) and every re-entry is
  a **fresh, independently-decided** check (`ACC-75`'s own guardrail: *"the next attempt is decided
  again... allowing one action never authorises the following one"*) rather than case-owned work
  that persists and accumulates state, which is the shape every one of the 25 confirmed Mechanisms
  shares and every confirmed Operational Workflow with a queue/SLA/ownership dimension does not.
- **Confidence before:** medium.
- **Confidence after:** **strengthened, medium-high.** Two new, independent, corroborating signals
  this round: (1) the tight mutual cycle with `ACC-75` is exactly the synchronous
  challenge/resume control-flow shape the confirmed Mechanisms show internally (compare SCC 6's
  CMS/CON retry chain), not the case-with-ownership shape Operational Workflows show; (2) direct,
  single-hop service to a Customer Journey (`IDN-85`) without itself being one is the same
  relationship every Mechanism has to the Customer Journeys layer.
- **Recommendation:** report only, but flag as the strongest of the 7 candidates for a follow-up
  dedicated round — the new cycle and direct customer-journey-service evidence meaningfully moves
  this one, where the DEC-181-only candidates above do not.

### ACC-75 (Access Authorization)

- **Current surface:** operational (category `access`; entity scope "the individual access
  request - one actor, one action, one resource" — no `CUSTOMER_ENTITY` match).
- **Suspected surface:** Runtime Mechanism.
- **New integration evidence:** the mirror side of the same SCC 8 cycle with `IDN-86` above. `ACC-75`
  has no other inbound or outbound edges anywhere in the graph — this 2-node cycle is its *entire*
  integration footprint in the 284-item corpus. Its own guardrail language ("no persisting work
  instance... a single stateless attempt re-evaluated fresh each time," already cited by the prior
  round) is corroborated rather than contradicted by having its complete edge set visible now: there
  is no case-tracking, no queue, and its only relationship in the whole system is the same
  synchronous mechanical loop that strengthens `IDN-86`'s case above.
- **Confidence before:** medium.
- **Confidence after:** **strengthened, medium-high**, for the same two reasons as `IDN-86` (they
  are the two halves of one cycle, so the evidence is shared).
- **Recommendation:** report only, paired with `IDN-86` for the same follow-up round — the two
  should not be assessed separately, since any reclassification of one without the other would
  split a single mutual control loop across two canonical surfaces.

## Candidate suspected Silent Lifecycle State

### ACC-76 (Credential Lifecycle)

- **Current surface:** operational (category `access`; entity scope "the individual credential -
  its id, owner, scope and validity" — "owner" is not in `CUSTOMER_ENTITY`'s vocabulary, so even a
  literal reclassification attempt would need the entity text reworded before `surfaceOf()` would
  ever place this on the customer surface).
- **Suspected surface:** Silent Lifecycle State (customer-silent).
- **New integration evidence:** confirmed member of SCC 9, a 2-node cycle **entirely internal to the
  access/credential Operational-Workflow domain**: `ACC-76:h.revoke→ACC-77:t.revocation` /
  `ACC-77:h.new→ACC-76:t.issued`. `ACC-77` is itself operational-classified (category `access`,
  entity scope "the specific credentials affected, and their owner" — same non-customer wording).
  `ACC-76` has zero inbound edges from outside this pair and exactly one outbound edge leaving the
  cycle at all: `ACC-77:h.verify→IDN-85:t.required` (`IDN-85`, customer-communicating) — one single
  hop, and it originates from `ACC-77`, not from `ACC-76` itself.
- **Confidence before:** low.
- **Confidence after:** **weakened further, very low.** If `ACC-76` genuinely belonged on the
  customer surface as a silent lifecycle state, the expectation (matching every one of the 64
  confirmed customer-silent journeys elsewhere in the corpus) would be direct participation in
  customer-surface traffic — an inbound handoff from a Customer Journey, or an entity scope that
  reads in person/account/holder terms. Neither is present: this item's *entire* corpus-wide
  relationship is with one other Operational Workflow (`ACC-77`), and the one edge that reaches the
  customer-communicating layer at all belongs to its cycle-partner, not to it. The complete graph
  makes the "operational, not silent-lifecycle" reading more plausible than the prior round's own
  already-low confidence suggested, not less.
- **Recommendation:** report only; on the evidence gathered this round, this is now the *weakest*
  of the 7 candidates, not merely the lowest-confidence one at the start.

---

## Findings summary

| Candidate | Current | Suspected | Confidence before | Confidence after | Direction |
|---|---|---|---|---|---|
| `REL-95` | operational | Runtime Mechanism | medium | medium | unchanged (new evidence inconclusive) |
| `REL-96` | operational | Runtime Mechanism | medium | medium | unchanged (new evidence inconclusive) |
| `RSK-191` | operational | Runtime Mechanism | medium | medium | unchanged (new evidence inconclusive) |
| `RSK-198` | operational | Runtime Mechanism | medium | medium-low | weakened (sole real caller is an Operational Workflow, not a Mechanism) |
| `IDN-86` | operational | Runtime Mechanism | medium | medium-high | **strengthened** (confirmed synchronous cycle with `ACC-75`; direct customer-journey service) |
| `ACC-75` | operational | Runtime Mechanism | medium | medium-high | **strengthened** (same cycle, shared evidence) |
| `ACC-76` | operational | Silent Lifecycle State | low | very low | **weakened further** (integration is entirely internal to Operational Workflows) |

**No reclassifications made.** The single most consequential new fact this round contributes is
that `IDN-86` and `ACC-75`'s cycle membership is genuine corroborating evidence (not just
suggestive design shape) for a boundary move, while `ACC-76`'s cycle membership cuts the opposite
way from what the prior round's low-confidence flag anticipated. `REL-95`/`REL-96`/`RSK-191`'s
DEC-181-only edges turn out to be uninformative, since Runtime Mechanisms and Operational Workflows
both use that same escalation shape elsewhere in the corpus. A dedicated boundary-classification
round, if opened, gets the most value starting with the `IDN-86`/`ACC-75` pair.
