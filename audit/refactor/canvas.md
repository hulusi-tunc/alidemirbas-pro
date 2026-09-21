# Phase 1 audit — canvas / display graph

Scope: the display graph of all 69 public library journeys, in **both locales**.
Audit only — no source file in this tree was modified.

## Method and provenance

Every number below is measured, not estimated.

- **Live render, build-asserted.** `assertServerBuild("4571")` threw on the first attempt
  (`nothing answering on port 4571`). Rather than work around it, a server was started from
  this checkout (`npx next start -p 4571`) and the assertion re-run: **PASS,
  `BUILD_ID = P0oUOg5KFhHcUmzvrIWCE`**, which matches `.next/BUILD_ID` on disk, and no file
  under `src/` is newer than that build. Every rendered figure here comes from that server.
- All 69 `/lab/journeys/<slug>` and `/tr/lab/journeys/<slug>` pages were fetched and parsed
  for `[data-canvas-node-id]` cards and `[data-canvas-edge-from]` edges. The drawn node count
  reconciles **69/69** against `audit/public-journeys-current-state-index.md`, so the scrape is
  the same graph the export recorded.
- Canonical facts are read from `production/canonical-dump.json` and
  `audit/public-journeys-current-state.json` (queried per journey, never read whole).
- Transform read in full: `src/lib/journey-canvas-layout.ts`, `src/components/ui/JourneyCanvasNodes.tsx`,
  `src/lib/canonical-view.ts` (`actionChannelHints`, `touchStages`, `touchChannelPlans`),
  `audit/guard-display.mjs`, `audit/canvas-hygiene.mjs`.

### Corpus shape as drawn

| Measure | Value |
| --- | --- |
| Journeys with at least one undrawn canonical node | **51 / 69** |
| Undrawn canonical nodes, total | **161** |
| — internal actions absorbed: `collapsibleRouters` 6, `absorbableBookkeeping` 85 (66 journal-only, 19 writing nothing) | 91 |
| — send-path gate conditions hidden (`collapsibleGates`) | 33 |
| — waits merged into a condition card (`collapsibleWaitFollowers`, Family B) | 28 |
| — `no-action` exits pruned as unreachable after collapse | 9 |
| Shared terminals drawn once per parent (duplicated exit/handoff instances) | **165**, on 38 journeys |
| Communication/human cards drawn | 160, on 68 journeys (RET-24 draws none) |
| Cards rendering a `Primary` / `Fallback` channel block | **160 — every communication and human card in the library** |
| Drawn decisions | 230 |
| Drawn internal (non-communication) action cards | 30, on 24 journeys |

---

# Findings, by severity

## P0-1 — The EN and TR canvases are structurally different graphs (5 journeys)

**Journeys:** ACT-13 (`a.identify`), ACT-19 (`a.persist`), RET-24 (`a.evidence`),
RET-26 (`a.assess`), FBK-43 (`a.persist-positive`).

Confirmed against the build-asserted render, not only against the export: each of those five
internal action cards is present exactly once on the EN route and **zero times** on the TR
route. Node and edge counts differ accordingly (RET-24: EN 14 nodes / 13 edges, TR 13 / 12;
FBK-43: EN 32 / 33, TR 31 / 32).

### Mechanism

`JourneyRoutes.tsx` (`JourneyFullPage`, line 81; the modal path, line 138) calls
`localizedJourneyDetail(rawDetail, lang)` and passes the **already-localised** `detail` to
`journeyCanvasProps`, which calls `layoutJourneyCanvas(detail.nodes)`
(`JourneyDetailBody.tsx:24`). So the display graph is built from localised nodes.

`absorbableBookkeeping` in `journey-canvas-layout.ts` decides whether an internal action is
bookkeeping by reading its `meta` strings:

```ts
const writes = n.meta.filter((m) => m.startsWith("writes "));
const journalOnly = writes.every((m) => { /* JOURNAL_WRITE.test(field) */ });
```

`canonical-view.ts:429` builds those strings as `` `writes ${w.field} (${w.mode})` ``.
`localizeMeta` in `journey-tr-overrides.ts` rewrites them to
`` `${field} alanına yazar (${mode})` `` — the prefix is gone, `writes` is `[]`,
`[].every(...)` is vacuously `true`, and the node is absorbed on TR only.

These five are precisely the nodes the absorption rule's own comment says must keep their
card: the 14 pass-through internals that write real state (`blocking_requirement`,
`risk_evidence`, the declared-value field, the feedback evidence record). The rule is
correct on EN and inverted on TR.

### Why this is the real bug, not the five journeys

Structure is being decided from **localised prose**. `absorbableBookkeeping` is a structural
rule that has no business reading display text at all, in either language. Three separate
sites in this module already read post-localisation strings and are only accidentally safe:
`waitLabel`'s `WAIT_VALUE_RE` and `ACTION_TITLE_EN_RE` / `ACTION_TITLE_TR_RE` in
`JourneyCanvasNodes.tsx` do it for *presentation* (harmless — they change text, not topology),
but `absorbableBookkeeping` does it for *topology*.

### Fix, stated where it belongs

1. **Locale-independence belongs in the transform's input contract, not in the localiser.**
   `FlowNode` should carry the structural facts the display graph needs as *data*, not as
   English sentences: add a machine field to `FlowNode` — `writes?: readonly { field: string; mode: string }[]`
   — populated in `canonical-view.ts` beside the existing `meta` projection (same place,
   `nodeView`, line ~429), from the same `n.writes`. `absorbableBookkeeping` then tests
   `n.writes` and never `n.meta`. `journey-tr-overrides.ts` localises `meta` as it does today
   and leaves the new field untouched, exactly as it already leaves `kind`, `edges[].to` and
   `exitClass` untouched. This is the convention the module already uses for every other
   structural decision: `collapsibleRouters` reads `execution` and `channelPriority`,
   `collapsibleGates` reads `exitClass`, `collapsibleWaitFollowers` reads edge targets — all
   authored enums, none of them prose.
2. **Belt and braces: lay out once, in one language.** `layoutJourneyCanvas` should be called
   on the *unlocalised* `rawDetail.nodes` and the resulting `CanvasLayout` reused for both
   routes, with localisation applied to the node objects the cards render. The layout is
   cached per structural signature already, so this also halves the layout work. Either fix
   alone closes the hole; both together make it impossible to reopen.
3. **A gate that can see it.** G1–G6 in `audit/guard-display.mjs` run per locale and never
   compare the two. They also only guard exits, handoffs and conditions — absorbing an
   *action* is invisible to all six. Add **G7: for every journey, the set of drawn
   `data-canvas-node-id` values and the set of drawn edges must be identical on `/lab/...`
   and `/tr/lab/...`.** That is a two-set comparison over data the guard already collects,
   and it fails today on exactly these five.

---

## P0-2 — "Primary / Fallback" is rendered on every communication card in the library, and is not what the canonical data says

**All 160 communication and human cards, on all 69 journeys, render a channel hierarchy.**
There is no journey in the public library whose canvas does not make this claim.

### Mechanism

`CommunicationCard` builds `groups` from `node.channelPlan` (the join of `Touch.channelRoles`
with `channelStrategy.roles`, `canonical-view.ts::touchChannelPlans`) and hands it to
`ChannelPriorityRow`, which labels **row 0 `Primary` and every later row `Fallback`**,
unconditionally:

```tsx
<span className="w-[62px] ...">{i === 0 ? w.primary : w.fallback}</span>
```

There is no branch on whether a fallback exists, and none on what kind of ordering the
journey declared.

### Defect A — a single-channel action rendering "Primary" (18 cards, 14 journeys)

`groups.length === 1` still renders one row labelled `Primary`, over nothing.

| Journey | Node | Card renders |
| --- | --- | --- |
| ACQ-285 | `a.first-touch`, `a.deliver`, `a.nurture` | Primary: Email |
| ACQ-287 | `a.reminder2-hv` | Primary: WhatsApp + SMS |
| ACQ-288 | `a.reminder2-hv` | Primary: WhatsApp + SMS |
| ACT-13 | `a.route-dependency` | Primary: Task |
| RET-24 | `a.owner-task` | Primary: Task |
| CON-272 | `a.prompt-in-app` | Primary: In-app |
| CON-300 | `a.confirm-end` | Primary: Email |
| FBK-43 | `a.obligation`, `a.escalate` | Primary: Task |
| FBK-49 | `a.request-internal` | Primary: Task |
| TIM-63 | `a.inform` | Primary: Email |
| REM-151 | `a.acknowledge` | Primary: Email |
| SCH-280 | `a.acknowledge` | Primary: Email |
| DOC-214 | `a.distribute` | Primary: Email |
| DOC-215 | `a.request`, `a.remind` | Primary: Email |

Sixteen of the eighteen are genuinely one channel. Two (ACQ-287/288 `a.reminder2-hv`) are one
*role* carrying two channels, which is a different statement again and is also not "Primary".

**Five of the eighteen are `execution: "human"` actions rendering `Primary: Task`** —
ACT-13 `a.route-dependency`, RET-24 `a.owner-task`, FBK-43 `a.obligation` and `a.escalate`,
FBK-49 `a.request-internal`. `task` is an internal work queue, not a customer channel, and it
is being drawn in the identical pill-and-hierarchy idiom as Email and SMS.

### Defect B — 121 cards labelled "Fallback" on journeys whose own data says fallback works differently

`ChannelStrategy.fallback` (`src/canonical/types.ts:352`) is the authored field that states
delivery recovery, and its doc comment is explicit: *"DELIVERY recovery for the same touch
after a delivery failure — not the next touch."* `Touch.channelRoles` carries its own comment,
equally explicit: *"ORDERED: the first role whose strategy `when` holds is used — channel
selection inside one touch, which is **neither touch progression nor delivery fallback**."*

The canvas labels `channelRoles` order as Primary/Fallback. Across the 69:

| `channelStrategy.fallback` | journeys | multi-row cards drawn | single-row cards |
| --- | --- | --- | --- |
| `same-role-other-channel` | 55 | **121** | 15 |
| `next-eligible-role` | 14 | 21 | 3 |
| `none` | 0 | — | — |

On the **50 journeys** that declare `same-role-other-channel` *and* draw a multi-row card, the
word "Fallback" on the canvas contradicts the journey's own declaration: recovery after a
delivery failure happens **inside** the role, and moving to the next role is not fallback at
all — it is role selection driven by each role's `when` clause.

Three worked examples, from the canonical data:

- **TIM-274** (`persistent > urgent`, card reads `Primary: Email / Fallback: SMS`).
  The `urgent` role's `when` is *"grace_deadline_at falls inside the urgent_horizon attribute
  and permission for messages on this channel is recorded."* SMS is used **when the deadline
  is close**, not when email fails. This is conditional routing on time, drawn as failure
  fallback.
- **IDN-271** (`persistent > urgent`, same card shape). `urgent`'s `when` is *"a verified
  number the signal does not implicate exists; the shortest route to the confirmation
  question."* Eligibility plus urgency — and IDN-271 is the one journey in the library that
  declares `channelStrategy.simultaneous`, i.e. genuinely **parallel**, which the canvas has
  no way to say at all.
- **ACQ-288** (`fallback: next-eligible-role`, `low-friction > persistent`, card reads
  `Primary: Push / Fallback: Email`). This is the one shape where "Primary/Fallback" is close
  to true — and even here the role `when` is *"a current device registration exists for this
  person and the permission covering it still stands"*, i.e. reachability, not send failure.

**Only 21 of 160 cards sit on a journey whose declared fallback is `next-eligible-role`, and
even those conflate "the next eligible role" with "what we do when the first one fails".**

The full 160-row inventory is in **Appendix A**.

### Regression check this feeds

A check that must **fail** on any of:
- a card rendering the `Primary` label when it renders exactly one channel group;
- a card rendering the `Fallback` label on a journey whose `channelStrategy.fallback` is not
  a role-advancing value;
- any card with `execution: "human"` rendering the customer-channel pill idiom.

All three are computable from the rendered DOM plus `canonical-dump.json`, in the same shape
`audit/canvas-hygiene.mjs` already uses (per-card, both locales). It belongs in that file as
**H5_FAKE_PRIMARY**, **H6_FALSE_FALLBACK**, **H7_HUMAN_AS_CHANNEL**.

---

## P1-3 — Generic permission and sendability drawn as a decision

See the full inventory in **§2** below. Summary: `collapsibleGates` already hides 33 of the 35
`"May the <touch> go out?"` gates, which is right. What remains:

- **2 send-path gates escape the rule and are drawn** — CON-300 `c.sendable2` ("May the final
  notice go out?") and SCH-282 `c.permitted` ("May an unprompted offer be sent to this person
  at all?"). Both escape because their short arm does not pass through a bookkeeping hop into
  a `no-action` exit (CON-300's goes to `a.suppress`; SCH-282's goes straight to
  `x.no-route`), which is the single structural signature the rule requires.
- **8 journeys draw a whole decision card whose question is answered by permission or
  eligibility and whose arms are "continue" vs "stop"** — no visible route change.
- **6 more draw a genuine business decision that carries an extra sendability arm**, so the
  canvas shows a three-way fork where the business question is two-way.
- **2 journeys draw a permission split that genuinely changes the visible route** and must be
  kept (ACC-261, CON-272).

**14 journeys draw a permission gate that does not change the visible route.**

---

## P1-4 — Measurement plumbing drawn as cards (11 cards, 10 journeys)

Cards whose entire content is "record that nothing was sent, so no-action is a measured
outcome rather than a silent absence":

| Journey | Node | Writes |
| --- | --- | --- |
| ACQ-13 | `a.record-no-action` | `suppressed_sends` |
| RET-31 | `a.record-no-action` | `suppressed_sends` |
| RET-32 | `a.record-no-action` | `suppressed_sends` |
| RET-293 | `a.record-no-action` | `suppressed_sends` |
| RET-295 | `a.record-no-action` | `suppressed_sends` |
| CON-300 | `a.record-no-action` | `suppressed_sends` |
| CON-300 | `a.suppress` | `marketing_suppression` |
| SUB-296 | `a.record-no-action` | `suppressed_sends` |
| SUB-297 | `a.record-no-action` | `suppressed_sends` |
| SUB-299 | `a.record-no-action` | `suppressed_sends` |
| RET-28 | `a.record-reason` | `cancellation_reason_history` |

These survive `absorbableBookkeeping` **only because of its in-degree test**: the node is
shared between two or more gates, so `inDegree !== 1` and the pass-through rule declines it.
The `hideable()` guard in `collapsibleGates` then correctly refuses to hide a node that a
still-drawn parent points at. Both rules are individually right; the outcome is that the
*more* a journey reuses its "record why nothing was sent" step, the *more likely* that step is
to be drawn — exactly backwards.

CON-300 `a.suppress` is a partial exception: writing the marketing suppression *is* this
journey's declared end state (`audit/refactor/_AUDIT-BRIEF.md`: "CON-300 Sunset … its end state
is marketing suppression"), so it deserves a card — but as an **outcome**, not as an
`Internal` cog card sitting mid-graph.

---

## P1-5 — Five "Decision" cards that decide nothing visible

A drawn condition whose branches all resolve to the same display node: the twin-edge merge in
`buildDisplayGraph` folds them into one line with a compound label, so the canvas shows a
violet Decision card with **exactly one outgoing edge**.

| Journey | Node | Question | Single drawn edge |
| --- | --- | --- | --- |
| RET-32 | `c.basis` | What can the invitation honestly say? | → `a.touch1` · "Something changed that speaks to why they left · Nothing specific" |
| FUL-146 | `c.estimate` | Is there a reliable new completion estimate? | → `c.recipient-impact` · "A reliable estimate · No reliable estimate" |
| DOC-215 | `c.window` | Is a signature validity window defined? | → `a.request` · "Defined · Not defined" |
| INC-254 | `c.cohort` | Can the affected cohort be identified with reasonable precision? | → `c.verified` · "It can · It cannot yet" |
| INC-254 | `c.verified` | Is what would be said actually confirmed? | → `c.material` · "Confirmed · Not confirmed" |

Each of these is a real decision in canonical — it selects *message content* — but on the
canvas it is a fork drawn as a straight line, with both answers stacked in one 65-character
edge chip. It reads as a bug. Either the content difference becomes visible (two message
cards), or the decision stops being drawn as a Decision.

A further four draw a partial version of the same thing (two of N branches merged into one
compound edge): FIN-302 `c.scope`, FUL-301 `c.stands`, INC-254 `c.material`, FUL-148 `c.class`.

---

## P1-6 — Engine identifiers reaching the canvas (14 sites)

`audit/canvas-hygiene.mjs` H1 catches only a **dotted** lowercase identifier
(`/\b[a-z][a-z0-9_]*\.[a-z][a-z0-9_]+\b/`) and runs only over **cards**. Two shapes slip
through, and edge labels are not inspected at all.

**In card text (9):**

| Journey | Node | Leaked token | Rendered text |
| --- | --- | --- | --- |
| ACQ-11 | `w.close` | `expires_at` | "expires_at as asserted by the platform" |
| TIM-63 | `w.resolution` | `expires_at` | "expires_at as the system of record asserts it" |
| SUB-163 | `w.review`, `w.decision` | `term_end_at` | "term_end_at minus the notice period the terms require" |
| DOC-215 | `w.expiry` | `validity_ends_at` | "validity_ends_at where defined, otherwise …" |
| RET-28 | `a.record-reason` | `PRICE, LOW_USAGE, MISSING_VALUE, TECHNICAL_PROBLEM, SERVICE_ISSUE` | an enum list on a card |
| SUB-163 | `a.review` | `RENEWAL_REVIEW` | "Record RENEWAL_REVIEW with what has to be settled" |
| DOC-215 | `a.request` | `AWAITING_SIGNATURE` | "Record AWAITING_SIGNATURE and issue the request …" |
| DOC-215 | `x.expired` | `SIGNATURE_EXPIRED` | the whole exit capsule is the constant |

**In edge labels (5) — a class the hygiene gate cannot see at all:**

| Journey | Edge | Label |
| --- | --- | --- |
| FBK-43 | `c.route → c.existing` | `SERVICE_ISSUE or COMPLAINT` |
| FBK-43 | `c.route → a.obligation` | `SUPPORT_NEED` |
| FBK-43 | `c.route → c.promise` | `PRODUCT_FEEDBACK` |
| FBK-43 | `c.route → c.acknowledge` | `GENERAL_COMMENT` |
| TIM-61 | `c.consequence → x.still-valid` | `STILL_VALID` |

The tokens are authored in canonical prose and branch labels, so the durable fix is canonical
(another agent's domain); the **display** fix is that H1 must also match a bare snake_case or
SCREAMING_SNAKE token and must run over `data-canvas-edge-label` as well as card text.

---

## P2-7 — Branch highways and duplicated exits

165 shared-terminal instances are drawn across 38 journeys. The per-parent instancing rule is
sound in principle (a shared ending drawn once per parent keeps terminal branches next to
their decision instead of running connectors the height of the canvas), but it is unbounded,
and on the biggest journeys the instances outnumber the real nodes:

| Journey | Distinct canonical nodes drawn | Terminal instances | Total display nodes |
| --- | --- | --- | --- |
| ACQ-11 | 19 | **17** | 31 |
| ACQ-12 | 14 | 11 | 21 |
| SCH-303 | 14 | 10 | 21 |
| RET-30 | 12 | 8 | 16 |
| SCH-304 | 15 | 7 | 19 |
| RET-31 | 13 | 7 | 18 |
| ACQ-288 | 16 | 7 | 20 |

Feeding it: **18 drawn decisions have 4 or more outgoing edges**, and ACQ-11 alone has three
state decisions of 5, 6 and 5 branches (`c.state`, `c.state2`, `c.state3` — "What is the
process now?"). Each of those branches that ends draws its own exit capsule. FBK-43's
`c.route` has 6. The canvas is drawing a state machine's transition table, not a journey.

This is a **canonical** simplification problem more than a renderer one, and it is the
strongest argument for the re-authoring this refactor exists to do. What the renderer can do
is stop compounding it (see §4).

## P2-8 — Oversized cards

- **SCH-304 `w.checkin` renders a 257-character label inside a wait capsule whose reserved
  slot is 240 × 56.** `waitLabel` → `firstClause` only cuts at a clause separator found at
  index ≤ 90; when none is, it returns the whole string. 11 wait labels exceed 70 characters.
  Wait is the one card kind that never gets `cardSummary`'s budget treatment.
- 1 non-wait card body still exceeds the 120-character budget after `cardSummary`
  (`FUL-265 a.no-arrival`, at exactly the boundary); the budget is otherwise holding.

## P2-9 — The trigger card carries provenance vocabulary (69/69)

Every trigger renders as `Trigger` / `<humanised event>` / `<SignalSource>`:
`Authoritative` ×52, `Behavioral` ×9, `Declared` ×6, `Inferred` ×2. `SignalSource` is
evidence-provenance for the measurement contract; on a customer-journey canvas it is engine
vocabulary in the position where a reader is looking for "what happened". The brief's own
example — `Checkout Started`, not `Trigger checkout_started Declared` — describes this card.

A handful of humanised event ids also do not read as events: "Valid lead not destination
ready" (ACQ-09), "Engaged non customer became dormant" (ACT-20), "Customer owed obligation
outstanding" (TIM-268), "Target held on named prerequisite" (RLT-279), "Incident reaches
communication relevant state" (INC-254).

## P2-10 — Message-variant forks repeat an identical channel block on both arms

Ten drawn decisions fork into two message cards that reconverge one hop later. Five of them
genuinely change the route — different channels or a different recipient — and must stay:

| Journey | Decision | Arm A | Arm B |
| --- | --- | --- | --- |
| ACQ-287 / ACQ-288 | `c.highvalue` | WhatsApp + SMS | Push → Email |
| ACT-13 | `c.self-resolvable` | Email → In-app (customer) | Task (internal owner) |
| CON-272 | `c.route` | In-app | SMS → Email |
| FBK-49 | `c.provider` | Email → In-app (customer) | Task (internal party) |

The other five fork into two cards with an **identical** channel block, so the canvas repeats
`Primary: Email / Fallback: SMS` twice and the only real difference — what the message says —
is buried in a line-clamped preview: TIM-274 (`a.notify-restricted` / `a.notify-quiet`),
IDN-271 (`a.alert-contained` / `a.alert-watch`), ACC-263 (`a.ready` / `a.brief`),
REL-284 (`a.invite-known` / `a.invite-new`), FBK-42 (`a.ask-light` / `a.ask-heavy`).

These forks are legitimate — the customer receives a materially different message — but the
card is spending its most prominent real estate on the thing that is the same and clamping the
thing that differs.

---

# §1 — The Primary / Fallback inventory

**Size: 160 cards, on 69 of 69 journeys.** Every communication and human action card in the
public library renders a channel hierarchy. Breakdown:

| Class | Cards | Journeys | Is the orchestration genuinely fallback? |
| --- | --- | --- | --- |
| Single row labelled `Primary`, one channel | 16 | 12 | **No — there is nothing to be primary over.** |
| Single row labelled `Primary`, one role carrying two channels | 2 | 2 | **No** — ACQ-287/288 `a.reminder2-hv`; this is one role, two permitted surfaces. |
| — of the 18 above, `execution: "human"` rendering `Primary: Task` | 5 | 4 | **No** — `task` is not a customer channel. |
| Multi-row, journey declares `same-role-other-channel` | 121 | 50 | **No** — the journey's own field says recovery is inside the role; the next role is eligibility-driven selection. |
| Multi-row, journey declares `next-eligible-role` | 21 | 14 | **Partly** — role advance is real, but its trigger is the next role's `when` (reachability/urgency), not a delivery failure. |
| Journeys declaring `fallback: "none"` | 0 | 0 | — |
| Journeys declaring `simultaneous` (genuine parallel) | 1 (IDN-271) | 1 | The canvas cannot express it; it draws Primary/Fallback instead. |

The full per-card table — journey, node, execution, authored `Touch.stage`, authored
`channelRoles`, what the card renders, the journey's `channelStrategy.fallback`, and a verdict
— is **Appendix A** at the end of this document. It is the regression fixture: a check that
walks it must fail on any `Primary` label over a single group, and on any `Fallback` label on
a journey whose declared fallback is not role-advancing.

---

# §2 — The permission-gate inventory

## 2.1 Already hidden, and correctly (33 gates, 22 journeys)

`collapsibleGates` hides every `"May the <touch> go out?"` condition whose short arm reaches a
`no-action` exit through one bookkeeping hop. That is the right rule and the right shape: a
send-path gate is a delivery prerequisite, and it belongs in canonical and in the detail panel.

ACQ-11 ×2, ACQ-12 ×2, ACQ-13, ACQ-289, RET-31 ×2, RET-32 ×2, RET-290 ×2, RET-293, RET-294 ×2,
RET-295, CON-300, FIN-302, FUL-291, FUL-301, REM-305 ×3, SCH-303 ×2, SCH-304 ×3, SUB-296 ×2,
SUB-297 ×2, SUB-299.

## 2.2 Drawn, and does NOT change the visible route — 14 journeys

**Tier A — the whole card is a permission/eligibility gate (8 journeys):**

| Journey | Node | Question | Arms |
| --- | --- | --- | --- |
| ACQ-09 | `c.basis` | Is there explicit permission and a lawful basis for this kind of communication? | message / `no-action` exit |
| ACQ-11 | `c.eligible` | Can this process be recovered for this person at all? | continue / `no-action` exit |
| ACQ-12 | `c.eligible` | Can this selection be recovered for this person at all? | continue / `no-action` exit |
| ACT-14 | `c.hard-entry` | Are the hard entry conditions met? | continue / `no-action` exit |
| ACT-20 | `c.worth-it` | Is there a credible reason, and is this person still eligible and contactable? | message / `no-action` exit |
| RET-32 | `c.eligible` | Is this relationship one we may write to about coming back? | continue / record-and-stop |
| SCH-282 | `c.permitted` | May an unprompted offer be sent to this person at all? | wait / `no-action` exit |
| CON-300 | `c.sendable2` | May the final notice go out? | message / `a.suppress` |

The last two are the send-path gate itself, escaping `collapsibleGates` on a technicality of
where the short arm goes first.

**Tier B — a real business decision carrying an extra sendability arm (6 journeys):** the
question is genuine and must stay; the third branch is plumbing and should not be drawn.

| Journey | Node | Business question (keep) | Plumbing arm (drop) |
| --- | --- | --- | --- |
| RET-31 | `c.eligible` | Is there a need to prompt? | "Not eligible" → `a.record-no-action` |
| RET-292 | `c.eligible` | Is this anniversary still ours to recognise? | "Not sendable" → `a.record-no-action` |
| RET-295 | `c.date` | Is this date still ours to recognise? | "Cycle already spent" → `a.record-no-action` |
| SUB-296 | `c.state` | Is this membership ours to welcome? | "Already welcomed" → `a.record-no-action` |
| SUB-297 | `c.valid` | Is there still something real to say? | "Nothing left to say" → `a.record-no-action` |
| SUB-298 | `c.state` | Is this reward a state the membership actually reached? | "Nothing to send" → `a.record-no-action` |

## 2.3 Drawn, and genuinely changes the visible route — keep (2 journeys)

| Journey | Node | Why it earns a card |
| --- | --- | --- |
| ACC-261 | `c.reachable` — "Is there a permitted route to them?" | Reachable → a message; unreachable → a **handoff** to another journey. Ownership moves; this is a route change. |
| CON-272 | `c.route` — "What can carry the repair request without using the broken destination?" | In-app / SMS→Email / nothing left. This is the sanctioned `Can receive SMS? → SMS / Email` shape, and the journey's entire subject is a broken contact point. |

ACQ-285 `c.permission` ("Is there permission to continue past fulfilment?" → nurture vs
`x.delivered`) sits between the two tiers: it is a consent check, but the answer decides
whether this journey exists past its transactional obligation at all. Judged **keep**, and
worth re-reading when ACQ-285 is re-authored.

---

# §3 — Collapse correctness

51 journeys have at least one undrawn canonical node; 161 nodes in total.

## 3.1 Right — the reader loses nothing (157 of the 161)

| Rule | Nodes | Verdict |
| --- | --- | --- |
| `collapsibleRouters` — a channel-selecting action folded into the send it selects for | 6 (ACQ-287/288 `a.router1`, `a.router2-hv`, `a.router2-std`) | **Right.** "Pick a channel" and "send on it" are one step to a reader, and the router's prose stays in the panel under "Routing logic". |
| `collapsibleGates` — send-path gates | 33 | **Right.** §2.1. Permission is a delivery prerequisite. |
| Pruned `no-action` exits left unreachable by those gates | 9 | **Right.** The ending "nothing was sent" is not a step a reader follows, and G5 still requires some ending to be drawn on each journey. |
| `collapsibleWaitFollowers` (Family B) | 28 | **Right, and the best of the five rules.** Verified on the render: all 28 merged cards show a clean duration strip (`30 minutes–60 minutes`, `45 minutes`, `24 hours`) above the question. The exact-equality test on the wait's two arms is the correct guard — 86 of the library's waits send the arms to different nodes and are untouched. |
| `absorbableBookkeeping`, journal-only writes (`*_log`, `*_history`, `suppressed_sends`) | 62 of 66 | **Right.** These are "record that this happened" steps whose meaning survives in the card that absorbed them — ACQ-09 `a.sunset` → the `x.sunset` exit, DOC-215 `a.declined` → the `h.declined` handoff, INC-254 `a.no-send` → the `x.no-send` exit. |
| `absorbableBookkeeping`, writes nothing | 19 | **Right.** Analysis steps — `a.diagnose`, `a.assess`, `a.classify`, `a.evaluate` — whose output is the question the very next Decision card asks. |

## 3.2 Wrong — 9 collapses, on 8 journeys

Four of the nine are inside the 161 nodes undrawn on the EN route; the other five are the
locale bug and are undrawn on the TR route only, which is why they do not appear in that
count at all.

**Five are the P0-1 locale bug** and are wrong in the strongest sense: the same node is drawn
on one route and absorbed on the other, so one of the two canvases is wrong by the rule's own
definition — ACT-13 `a.identify`, ACT-19 `a.persist`, RET-24 `a.evidence`, RET-26 `a.assess`,
FBK-43 `a.persist-positive`. Each writes real, non-journal state
(`blocking_requirement`, the declared-value field, `risk_evidence`, the service-failure
assessment, the positive-evidence record), which is exactly the set the rule's own comment
says must keep its card.

**Four more hide something the reader needs, in both locales:**

| Journey | Node | What is absorbed | What the reader is left with | Why it is wrong |
| --- | --- | --- | --- | --- |
| ACT-13 | `a.stop-reminders` | "Stop every reminder about this requirement immediately, including any already queued" | the condition card "With this requirement met, is activation now reachable?" | The single most important stop-condition in the journey is invisible. It qualifies as journal-only solely because `suppressed_sends` is in `JOURNAL_WRITE` — but writing `suppressed_sends` here is not bookkeeping, it is **the action**. |
| FIN-134 | `a.retry` | "Retry within the bounded policy, using the same idempotency key" | a wait capsule showing a duration | The retry is the journey's actual recovery mechanism, and the capsule says only how long. It writes `payment_log`, so the journal test absorbs it. |
| ACQ-11 | `a.note-return` | "Record the return and **re-arm one further wait from the new last activity**" | the `w.resumed` wait | The canvas shows a wait; it does not show that the journey loops back into it, nor that the loop is bounded. |
| ACQ-12 | `a.rearm` | "Record the change and re-arm the first wait **a bounded number of times**" | the `w.settle` wait, itself absorbed into `c.state` | Same: a bounded re-entry loop, drawn as a plain step. |

**The pattern in all four:** `JOURNAL_WRITE` decides bookkeeping from the *field name*, and a
step that suppresses queued sends, re-arms a wait or retries a send writes to a journal field
while doing something structurally significant. The field name is the wrong signal for those.

## 3.3 The reverse failure — checked, and clean

The hole G6 exists to guard (a decision that materially changes the customer's path collapsed
away) is **not** open today. Every one of the 33 hidden conditions matches the sanctioned gate
shape: exactly two branches, one arm reaching a `no-action` exit through a bookkeeping hop.
The two extra guards the rule grew after the PR #9 regression both earn their place:

- requiring the bookkeeping hop takes the rule from 24 gates to 9 corpus-wide, and it is what
  keeps RET-24's "is a proportionate automated recovery available?" and TIM-63's
  "is telling anyone useful even though nothing can be done?" on the canvas;
- the `hideable()` parent test is what keeps RET-32's third, non-collapsing condition from
  losing its "Excluded" arm.

The residual risk is not in `collapsibleGates` but in `absorbableBookkeeping`, which has no
equivalent of G6: **no gate anywhere asserts which actions were allowed to disappear.** That
is why the locale bug shipped green. See §4.5.

---

# §4 — Renderer / transform changes needed

Every change below is a rule over authored data. None reads a journey id, none hardcodes a
coordinate, none branches per journey.

## 4.1 `ChannelPriorityRow` must render the pattern the data declares, not a fixed hierarchy

Replace the positional `i === 0 ? primary : fallback` with a label derived from the touch's
own orchestration data (§5 defines the field). Until that field exists, the minimum correct
behaviour, derivable today:

- **one group → no label at all.** Render the channel pill(s) and nothing else. A single-channel
  action states its channel; it does not rank it.
- **one group, several channels** → one row, no rank label; the group is a role, and a role's
  channels are alternatives within one step.
- **several groups, `channelStrategy.fallback === "next-eligible-role"`** → the order is real,
  but the label must say what advances it. "If unreachable" reads true; "Fallback" does not.
- **several groups, `channelStrategy.fallback === "same-role-other-channel"`** → the order is
  *selection*, not recovery. Render it as a choice ("whichever applies", conditional chevrons),
  never as a hierarchy.
- **`channelStrategy.simultaneous`** → render the channels on one row as a parallel send.

## 4.2 A human action must not borrow the customer-channel idiom

`CommunicationCard` already splits `messageLabels` / `humanLabels` but renders both through the
same pill. An action whose `execution === "human"` should render its route as a work-assignment
affordance (the amber `KIND.human` tile it already has, plus a plain "assigned to" line), never
a `CHANNEL_HUE` pill in a `Primary` row. Rule: `HUMAN_ROUTES` (`journey-channels.ts`) never
enters `ChannelPriorityRow`.

## 4.3 `absorbableBookkeeping` must read structure, not prose

1. Test an authored `writes` array on `FlowNode` (§P0-1 fix 1), never `meta` strings.
2. Narrow `JOURNAL_WRITE`: `suppressed_sends` must **not** count as a journal write when the
   node is the *only* writer of it on a branch that ends the sending, because that is the
   suppression itself and not a record of one. A structural expression of the same rule, with
   no new data needed: **an internal action whose successor is a wait it re-enters, or whose
   own write is the journey's declared suppression, is never absorbable.**
3. Add the symmetric guard to the one `collapsibleGates` already has: **an internal action may
   only be absorbed if the card that absorbs it can still carry its meaning** — i.e. the host
   is an action, exit or handoff, never a `wait` capsule (which has room for a duration and
   nothing else) and never a `condition` card whose question is unrelated. FIN-134 `a.retry`
   and ACT-13 `a.stop-reminders` both fail this test.

## 4.4 Decisions

- **A drawn condition that resolves to one display target must not be drawn as a Decision.**
  Either the twin-edge merge should not apply to a `condition`'s branches (it was written for a
  wait's two arms, where the two labels genuinely say the same thing), or the condition should
  be absorbed like a gate. Today it is drawn as a fork with one line out, which is the worst of
  both. Rule: after `buildDisplayGraph`, any `condition` DisplayNode with `outDegree < 2` is
  either absorbed into its target or re-kinded.
- **A branch arm whose target is a pure no-action record should not be drawn** — the same
  treatment `collapsibleGates` gives a two-branch gate, applied to one arm of an N-branch
  condition. That removes the Tier-B third branches in §2.2 (6 journeys) and the 11 plumbing
  cards in P1-4, without touching the business question the condition asks. It needs the
  `hideable()` parent test unchanged, so a record step something else still points at survives.

## 4.5 Gates to add

| Check | Where | Fails today on |
| --- | --- | --- |
| **G7_LOCALE_STRUCTURE** — the drawn node set and edge set must be identical for `/lab/...` and `/tr/lab/...` | `audit/guard-display.mjs` | ACT-13, ACT-19, RET-24, RET-26, FBK-43 |
| **G8_ACTION_HIDDEN** — an `action` may be missing from the canvas only if it matches the sanctioned absorption shape (in-degree 1, out-degree 1, no `execution`, writes only journal fields) — the G6 assertion, applied to actions | `audit/guard-display.mjs` | nothing today on EN; everything in P0-1 on TR |
| **G9_DEGENERATE_DECISION** — a drawn `condition` must have ≥ 2 outgoing display edges | `audit/guard-display.mjs` | RET-32, FUL-146, DOC-215, INC-254 ×2 |
| **H5_FAKE_PRIMARY / H6_FALSE_FALLBACK / H7_HUMAN_AS_CHANNEL** | `audit/canvas-hygiene.mjs` | 18 / 121 / 5 cards |
| **H1 widened** — bare snake_case and SCREAMING_SNAKE tokens, and run over `data-canvas-edge-label` too | `audit/canvas-hygiene.mjs` | 9 cards + 5 edges |
| **H8_CARD_OVERFLOW** — a wait label must pass the same `cardSummary` budget every other card body passes | `audit/canvas-hygiene.mjs` | SCH-304 `w.checkin` (257 chars) + 10 more |

## 4.6 What must NOT be done

Stated explicitly because two of the findings above are single-journey and will tempt it:
no `if (journey.id === ...)`, no per-journey layout, no hardcoded coordinates, no
journey-specific renderer branch. SCH-304's overflowing wait is a `firstClause` bug; ACQ-11's
31-node canvas is a canonical authoring problem, not a layout one; CON-300's escaping send
gate is a shape the collapse rule should recognise, not an exception list. Every rule above is
expressed over `execution`, `exitClass`, `writes`, `channelRoles`, `channelStrategy.fallback`,
in-degree and out-degree — fields the whole corpus carries.

---

# §5 — Display metadata the orchestration refactor will need

## 5.1 Why a channel array with roles cannot express the patterns

The brief's seven patterns — single, sequential, conditional routing, parallel, fallback,
segment-based, event-or-timeout — are **statements about a stage**, and today's schema encodes
a stage as an ordered `Touch.channelRoles` plus a journey-wide `ChannelStrategy.fallback`. That
shape is structurally incapable of the distinction, for three reasons the data itself shows:

1. **`fallback` is journey-wide, the patterns are per stage.** ACQ-288's first touch is
   genuinely "push if reachable, else email"; its high-value second touch is "WhatsApp or SMS,
   whichever is permitted". One journey, two patterns, one field.
2. **Role order is overloaded.** It currently means *preference*, *eligibility* and *recovery*
   at once, which is why the renderer cannot label it — and why it silently labels all three
   "Primary / Fallback".
3. **Parallel has nowhere to live except a boolean.** `simultaneous: { allowed: true }` exists
   on exactly one journey (IDN-271) and is journey-wide, so a journey with one parallel stage
   and three sequential ones cannot say so.

## 5.2 Proposed shape

An explicit, closed `pattern` discriminant on `Touch`, alongside the roles it already carries.
Existing conventions kept: a closed string union in `src/canonical/types.ts` (like
`OrchestrationStrategy`, `ChannelRole`, `ExitClass`), a `when` sentence wherever a condition is
asserted (like `ChannelStrategy.roles[].when`), a `Config` wherever a duration is (like
`WaitNode.timeout`), and `Label` on anything authored as a recommendation.

```ts
/** How ONE touch reaches the person. Per touch, because a journey's first
    touch and its final notice are frequently different patterns.
    `channelRoles` stays what it is - which roles this touch may use - and
    this field says what the ORDER of those roles means. */
export type TouchPattern =
  /** One channel, no alternative. The card renders a channel and nothing else. */
  | { kind: "single" }
  /** Every listed role is used, in order, as separate sends. Needs a gap. */
  | { kind: "sequential"; gap: Config<string> }
  /** All listed roles are used at once, deliberately. */
  | { kind: "parallel"; reason: string }
  /** The role is chosen by a condition read at send time. One `when` per
      role, so the renderer can draw a real split where the split is real. */
  | { kind: "conditional"; on: readonly { role: ChannelRole; when: string }[] }
  /** The desired role genuinely cannot be used and another substitutes.
      `after` is what makes it a fallback rather than a preference. */
  | { kind: "fallback"; after: "delivery-failure" | "not-permitted" | "not-reachable" }
  /** The role is chosen by a property of the person or the instance, named
      and resolvable - never invented. */
  | { kind: "segment"; segmentedBy: string; on: readonly { role: ChannelRole; when: string }[] }
  /** Sent when an event lands, or when a bound expires, whichever first. */
  | { kind: "event-or-timeout"; until: readonly SemanticEventRef[]; bound: Config<string> };

export interface Touch {
  // ... unchanged ...
  channelRoles: readonly ChannelRole[];
  /** Absent on a non-migrated journey; the canvas then falls back to the
      role list with NO rank label, which is the honest default. */
  pattern?: TouchPattern;
  patternReason?: string;   // same role as `priorityReason`
}
```

`ChannelStrategy.fallback` stays exactly as it is — it is a real and separate statement
(*delivery* recovery within the send path) and the type's own comment already says so. What
changes is that the canvas stops reading it as the touch's pattern.

## 5.3 What the transform does with it

`canonical-view.ts::touchChannelPlans` already joins `Touch` to `channelStrategy.roles`; it
gains one field. `FlowNode.channelPlan` becomes:

```ts
channelPlan?: {
  pattern: TouchPattern["kind"];
  groups: readonly { role: string; channels: readonly ChannelId[]; when?: string }[];
};
```

and `ChannelPriorityRow` becomes one switch on `pattern`, with no positional labelling anywhere:

| `pattern` | Card | Graph |
| --- | --- | --- |
| `single` | channel pill, no label | one node |
| `sequential` | numbered rows + the gap | the transform may split it into N message nodes with a wait between — the honest drawing of "two sends" |
| `parallel` | one row, channels side by side, "at the same time" | one node |
| `conditional` | rows labelled with their own `when`, short form | **a real Decision node** where `when` names a customer-visible difference (`Can receive SMS?`), otherwise one node with labelled rows |
| `fallback` | "then, if <after>" between rows | one node; the alternative is a property of the send, not a branch |
| `segment` | rows labelled by segment | a Decision node, because the segment is a real population split |
| `event-or-timeout` | the event(s) and the bound | reuses the Family B merge that already works |

Two consequences worth stating, because they are what makes this worth doing:

- **The renderer stops guessing.** Every string on a message card becomes a statement the
  journey authored about itself, which is the same contract `exitClass`, `evidenceSource` and
  `touchStage` already satisfy — and the same contract `absorbableBookkeeping` is currently
  violating.
- **`pattern` is the regression fixture.** "A single-channel action must never render Primary"
  becomes `pattern === "single"` renders no rank label, which is checkable without the DOM, in
  `validate:canonical`, before a build exists.

---

# Appendix A — the full Primary / Fallback inventory

160 rows: every card in the library that renders a channel hierarchy, as rendered by the
build-asserted server on port 4571. `channelRoles` is the authored `Touch.channelRoles`;
`journey fallback` is the journey's own `channelStrategy.fallback`.

| Journey | Node | Exec | Touch stage | channelRoles (authored) | Card renders | journey fallback | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ACQ-09 | a.educate | communication | educate | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACQ-09 | a.educate2 | communication | educate-again | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACQ-11 | a.touch1 | communication | initial-recovery | low-friction > persistent | Primary: Push + In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACQ-11 | a.touch2 | communication | follow-up | persistent > low-friction | Primary: Email / Fallback: Push + In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACQ-11 | a.touch3 | communication | final-notice | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACQ-12 | a.touch1 | communication | initial-recovery | low-friction > persistent | Primary: Push + In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACQ-12 | a.touch2 | communication | follow-up | persistent > low-friction | Primary: Email / Fallback: Push + In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACQ-13 | a.touch1 | communication | recovery | low-friction > persistent | Primary: Push + In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACQ-285 | a.first-touch | communication | first-touch | persistent | Primary: Email | same-role-other-channel | FAKE - single row labelled Primary |
| ACQ-285 | a.deliver | communication | deliver | persistent | Primary: Email | same-role-other-channel | FAKE - single row labelled Primary |
| ACQ-285 | a.nurture | communication | nurture | persistent | Primary: Email | same-role-other-channel | FAKE - single row labelled Primary |
| ACQ-287 | a.reminder1 | communication | initial-reminder | low-friction > persistent | Primary: Push / Fallback: Email | next-eligible-role | role order + next-eligible-role (partly real) |
| ACQ-287 | a.reminder2-hv | communication | second-reminder-high-value | urgent | Primary: WhatsApp + SMS | next-eligible-role | FAKE - single row labelled Primary |
| ACQ-287 | a.reminder2-std | communication | second-reminder | low-friction > persistent | Primary: Push / Fallback: Email | next-eligible-role | role order + next-eligible-role (partly real) |
| ACQ-288 | a.reminder1 | communication | initial-reminder | low-friction > persistent | Primary: Push / Fallback: Email | next-eligible-role | role order + next-eligible-role (partly real) |
| ACQ-288 | a.reminder2-hv | communication | second-reminder-high-value | urgent | Primary: WhatsApp + SMS | next-eligible-role | FAKE - single row labelled Primary |
| ACQ-288 | a.reminder2-std | communication | second-reminder | low-friction > persistent | Primary: Push / Fallback: Email | next-eligible-role | role order + next-eligible-role (partly real) |
| ACQ-289 | a.alert | communication | availability-alert | low-friction > in-session > persistent | Primary: Push / Fallback: In-app / Fallback: Email | next-eligible-role | role order + next-eligible-role (partly real) |
| ACT-12 | a.surface | communication | next-step | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACT-13 | a.specific-action | communication | specific-action | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACT-13 | a.route-dependency | human | route-dependency | human | Primary: Task | same-role-other-channel | FAKE - single row labelled Primary |
| ACT-14 | a.offer | communication | offer | in-session > low-friction > persistent | Primary: In-app / Fallback: Push / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACT-14 | a.confirm | communication | confirm | in-session > low-friction > persistent | Primary: In-app / Fallback: Push / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACT-14 | a.final | communication | final | in-session > low-friction > persistent | Primary: In-app / Fallback: Push / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACT-14 | a.followup | communication | followup | in-session > low-friction > persistent | Primary: In-app / Fallback: Push / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACT-17 | a.recognize | communication | recognition | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACT-17 | a.surface | communication | next-action | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACT-17 | a.next-behavior | communication | behaviour-nudge | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACT-18 | a.recover | communication | recovery | persistent > low-friction | Primary: Email / Fallback: Push | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACT-19 | a.ask | communication | ask | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACT-20 | a.attempt | communication | attempt | persistent > low-friction | Primary: Email / Fallback: Push | same-role-other-channel | NOT fallback - same-role-other-channel |
| RET-24 | a.owner-task | human | owner-task | human | Primary: Task | same-role-other-channel | FAKE - single row labelled Primary |
| RET-26 | a.acknowledge | communication | acknowledgement | persistent > low-friction | Primary: Email / Fallback: Push | same-role-other-channel | NOT fallback - same-role-other-channel |
| RET-28 | a.ask | communication | reason-ask | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| RET-28 | a.offer | communication | alternative-offer | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| RET-30 | a.followup | communication | followup | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| RET-31 | a.touch1 | communication | lead-prompt | persistent > low-friction | Primary: Email / Fallback: Push + In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| RET-31 | a.touch2 | communication | follow-up | persistent > low-friction | Primary: Email / Fallback: Push + In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| RET-32 | a.touch1 | communication | invitation | persistent > low-friction | Primary: Email / Fallback: Push | same-role-other-channel | NOT fallback - same-role-other-channel |
| RET-32 | a.touch2 | communication | follow-up | persistent > low-friction | Primary: Email / Fallback: Push | same-role-other-channel | NOT fallback - same-role-other-channel |
| CON-272 | a.prompt-in-app | communication | prompt-in-app | in-session | Primary: In-app | same-role-other-channel | FAKE - single row labelled Primary |
| CON-272 | a.prompt-alt | communication | prompt-alt | urgent > persistent | Primary: SMS / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| CON-272 | a.confirm | communication | confirm | in-session > persistent > urgent | Primary: In-app / Fallback: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| RET-290 | a.welcome | communication | welcome | persistent > in-session | Primary: Email / Fallback: In-app | next-eligible-role | role order + next-eligible-role (partly real) |
| RET-290 | a.bounceback | communication | bounceback | persistent > in-session > low-friction | Primary: Email / Fallback: In-app / Fallback: Push | next-eligible-role | role order + next-eligible-role (partly real) |
| RET-292 | a.recognise | communication | recognition | persistent > low-friction > in-session | Primary: Email / Fallback: Push / Fallback: In-app | next-eligible-role | role order + next-eligible-role (partly real) |
| RET-293 | a.recommend | communication | recommendation | persistent > in-session > low-friction | Primary: Email / Fallback: In-app / Fallback: Push | next-eligible-role | role order + next-eligible-role (partly real) |
| RET-294 | a.offer | communication | offer | persistent > low-friction > in-session | Primary: Email / Fallback: Push / Fallback: In-app | next-eligible-role | role order + next-eligible-role (partly real) |
| RET-294 | a.remind | communication | reminder | persistent > in-session | Primary: Email / Fallback: In-app | next-eligible-role | role order + next-eligible-role (partly real) |
| RET-295 | a.recognise | communication | recognition | persistent > low-friction > in-session | Primary: Email / Fallback: Push / Fallback: In-app | next-eligible-role | role order + next-eligible-role (partly real) |
| CON-300 | a.ask | communication | the-question | persistent > in-session | Primary: Email / Fallback: In-app | next-eligible-role | role order + next-eligible-role (partly real) |
| CON-300 | a.final | communication | final-notice | persistent > in-session | Primary: Email / Fallback: In-app | next-eligible-role | role order + next-eligible-role (partly real) |
| CON-300 | a.confirm-end | communication | ended | persistent | Primary: Email | next-eligible-role | FAKE - single row labelled Primary |
| FBK-41 | a.request | communication | request | in-session > persistent > low-friction | Primary: In-app / Fallback: Email / Fallback: Push | same-role-other-channel | NOT fallback - same-role-other-channel |
| FBK-42 | a.ask-light | communication | ask-light | persistent > in-session > low-friction | Primary: Email / Fallback: In-app / Fallback: Push | same-role-other-channel | NOT fallback - same-role-other-channel |
| FBK-42 | a.ask-heavy | communication | ask-heavy | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| FBK-43 | a.obligation | human | routing | human | Primary: Task | same-role-other-channel | FAKE - single row labelled Primary |
| FBK-43 | a.acknowledge | communication | acknowledgement | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| FBK-43 | a.acknowledge-positive | communication | recognition | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| FBK-43 | a.acknowledge-negative | communication | acknowledgement | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| FBK-43 | a.escalate | human | routing | human | Primary: Task | same-role-other-channel | FAKE - single row labelled Primary |
| FBK-49 | a.request | communication | request | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| FBK-49 | a.request-internal | human | request-internal | human | Primary: Task | same-role-other-channel | FAKE - single row labelled Primary |
| TIM-61 | a.remind | communication | remind | persistent > low-friction > urgent | Primary: Email / Fallback: Push / Fallback: SMS + WhatsApp | same-role-other-channel | NOT fallback - same-role-other-channel |
| TIM-63 | a.prompt-action | communication | action-prompt | persistent > in-session > urgent | Primary: Email / Fallback: In-app / Fallback: SMS + Push | same-role-other-channel | NOT fallback - same-role-other-channel |
| TIM-63 | a.inform | communication | informational-notice | persistent | Primary: Email | same-role-other-channel | FAKE - single row labelled Primary |
| TIM-268 | a.remind | communication | remind | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| TIM-268 | a.overdue | communication | overdue | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| TIM-268 | a.confirm | communication | confirm | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| TIM-274 | a.notify-restricted | communication | notify-restricted | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| TIM-274 | a.notify-quiet | communication | notify-quiet | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| TIM-274 | a.last-call | communication | last-call | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| TIM-274 | a.confirm | communication | confirm | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| TIM-274 | a.lost | communication | lost | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| TIM-281 | a.renew | communication | renew | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| TIM-281 | a.requalify | communication | requalify | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| TIM-281 | a.replace | communication | replace | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| TIM-281 | a.no-route | communication | no-route | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| TIM-281 | a.confirm | communication | confirm | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACC-261 | a.inform-only | communication | inform-only | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACC-261 | a.notify | communication | notify | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACC-261 | a.confirm | communication | confirm | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACC-263 | a.ready | communication | ready | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACC-263 | a.brief | communication | brief | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| ACC-263 | a.remind | communication | remind | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| IDN-84 | a.explain-terminal | communication | explain-terminal | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| IDN-84 | a.explain | communication | explain | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| IDN-271 | a.alert-contained | communication | alert | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| IDN-271 | a.alert-watch | communication | alert | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| IDN-271 | a.standing | communication | resolution | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| IDN-271 | a.cleared | communication | resolution | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| REL-284 | a.invite-known | communication | invite-known | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| REL-284 | a.invite-new | communication | invite-new | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| REL-284 | a.confirm | communication | confirm | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| REL-284 | a.remind | communication | remind | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| FIN-134 | a.corrective | communication | corrective-request | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| FIN-134 | a.offer-alternate | communication | offer-alternate | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| FIN-134 | a.confirmed | communication | confirmation | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| FIN-134 | a.remind | communication | reminder | persistent > urgent | Primary: Email / Fallback: SMS + Push | same-role-other-channel | NOT fallback - same-role-other-channel |
| FIN-302 | a.issued | communication | in-motion | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| FIN-302 | a.settled | communication | returned | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| FIN-302 | a.partial | communication | returned-in-part | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| FIN-302 | a.unresolved | communication | not-arrived | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| FUL-146 | a.delay-update | communication | delay-update | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| FUL-146 | a.offer | communication | offer | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| FUL-146 | a.no-choice-update | communication | no-choice-update | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| FUL-148 | a.correct | communication | correct | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| FUL-148 | a.offer-route | communication | offer-route | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| FUL-265 | a.dispatch | communication | dispatch | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| FUL-265 | a.no-arrival | communication | no-arrival | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| FUL-265 | a.arrived | communication | arrived | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| FUL-265 | a.accept-request | communication | accept-request | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| FUL-291 | a.followup | communication | useful-next-step | persistent > in-session > low-friction | Primary: Email / Fallback: In-app / Fallback: Push | next-eligible-role | role order + next-eligible-role (partly real) |
| FUL-301 | a.confirm | communication | confirmation | persistent > urgent > in-session | Primary: Email / Fallback: SMS / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| REM-151 | a.acknowledge | communication | acknowledge | persistent | Primary: Email | same-role-other-channel | FAKE - single row labelled Primary |
| REM-157 | a.present | communication | present | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| REM-157 | a.no-remedy | communication | no-remedy | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| REM-305 | a.resolved-now | communication | resolved-on-receipt | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| REM-305 | a.acknowledge | communication | acknowledge | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| REM-305 | a.resolution | communication | resolution-notice | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| SCH-266 | a.prompt | communication | prerequisite-prompt | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| SCH-266 | a.at-risk | communication | at-risk-notice | urgent > persistent | Primary: SMS / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| SCH-266 | a.remind | communication | reminder | urgent > persistent > in-session | Primary: SMS / Fallback: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| SCH-277 | a.received | communication | received | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| SCH-277 | a.lapse | communication | lapse | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| SCH-277 | a.confirm | communication | confirm | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| SCH-277 | a.reoffer | communication | reoffer | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| SCH-277 | a.decline | communication | decline | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| SCH-280 | a.offer | communication | rebooking-offer | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| SCH-280 | a.acknowledge | communication | acknowledgement | persistent | Primary: Email | same-role-other-channel | FAKE - single row labelled Primary |
| SCH-282 | a.offer | communication | offer | persistent > low-friction | Primary: Email / Fallback: Push | same-role-other-channel | NOT fallback - same-role-other-channel |
| SCH-282 | a.waitlist | communication | waitlist | persistent > low-friction | Primary: Email / Fallback: Push | same-role-other-channel | NOT fallback - same-role-other-channel |
| SCH-303 | a.remind | communication | outstanding-notice | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| SCH-303 | a.final | communication | final-notice | urgent > persistent > in-session | Primary: SMS / Fallback: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| SCH-303 | a.lapse | communication | release-notice | persistent > urgent | Primary: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| SCH-304 | a.details | communication | arrival-details | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| SCH-304 | a.checkin | communication | check-in-prompt | in-session > persistent > urgent | Primary: In-app / Fallback: Email / Fallback: SMS | same-role-other-channel | NOT fallback - same-role-other-channel |
| SCH-304 | a.late-detail | communication | late-detail | urgent > in-session > persistent | Primary: SMS / Fallback: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| SUB-163 | a.notice | communication | required-notice | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| SUB-163 | a.request | communication | decision-request | persistent > in-session > urgent | Primary: Email / Fallback: In-app / Fallback: SMS + Push | same-role-other-channel | NOT fallback - same-role-other-channel |
| SUB-262 | a.confirm | communication | confirm | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| SUB-262 | a.ending | communication | ending | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| SUB-296 | a.welcome | communication | welcome | persistent > in-session | Primary: Email / Fallback: In-app | next-eligible-role | role order + next-eligible-role (partly real) |
| SUB-296 | a.orient | communication | orientation | persistent > in-session > low-friction | Primary: Email / Fallback: In-app / Fallback: Push | next-eligible-role | role order + next-eligible-role (partly real) |
| SUB-297 | a.explain | communication | explanation | persistent > in-session > low-friction | Primary: Email / Fallback: In-app / Fallback: Push | next-eligible-role | role order + next-eligible-role (partly real) |
| SUB-297 | a.remind | communication | reminder | persistent > in-session > low-friction | Primary: Email / Fallback: In-app / Fallback: Push | next-eligible-role | role order + next-eligible-role (partly real) |
| SUB-298 | a.confirm | communication | confirmation | persistent > in-session > low-friction | Primary: Email / Fallback: In-app / Fallback: Push | next-eligible-role | role order + next-eligible-role (partly real) |
| SUB-299 | a.announce | communication | announcement | persistent > in-session > low-friction | Primary: Email / Fallback: In-app / Fallback: Push | next-eligible-role | role order + next-eligible-role (partly real) |
| DOC-214 | a.distribute | communication | distribute | persistent | Primary: Email | same-role-other-channel | FAKE - single row labelled Primary |
| DOC-215 | a.request | communication | signature-request | persistent | Primary: Email | same-role-other-channel | FAKE - single row labelled Primary |
| DOC-215 | a.remind | communication | reminder | persistent | Primary: Email | same-role-other-channel | FAKE - single row labelled Primary |
| INC-254 | a.communicate | communication | communicate | persistent > in-session | Primary: Email / Fallback: In-app | same-role-other-channel | NOT fallback - same-role-other-channel |
| RLT-279 | a.name-blocker | communication | name-blocker | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| RLT-279 | a.inform-hold | communication | inform-hold | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| RLT-279 | a.last-call | communication | last-call | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| RSK-273 | a.at-the-wall | communication | at-the-wall | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| RSK-273 | a.offer-self | communication | offer-self | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| RSK-273 | a.offer-holder | communication | offer-holder | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| RSK-273 | a.notify-blocked-party | communication | notify-blocked-party | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
| RSK-273 | a.reset | communication | reset | in-session > persistent | Primary: In-app / Fallback: Email | same-role-other-channel | NOT fallback - same-role-other-channel |
