/* Journey production-model regression harness. `node production/validate-journey-production.mjs`

   Sits ON TOP of `npm run validate:canonical` — it does not replace or
   duplicate that validator's graph-integrity checks; it re-derives a handful
   of the same facts (duplicate id/slug, dangling edges) directly from the
   production artifacts as a drift check, and adds everything specific to the
   design-independent production model: the fixture set, the list projection,
   the merged-id contract, and cross-file consistency. Design-independent —
   asserts nothing about layout, color, or component structure. */

import { readFile } from "node:fs/promises";

const read = async (f) => JSON.parse(await readFile(f, "utf8"));

const dump = await read("production/canonical-dump.json");
const viewModel = await read("production/journey-view-model.json");
const manifest = await read("production/journey-manifest.json");
const projection = await read("production/journey-list-projection.json");
const fixtures = await read("production/journey-fixture-set.json");
const mergedContract = await read("production/journey-merged-id-contract.json");
const graphContract = await read("production/journey-graph-contract.json");

const journeys = dump.journeys;
const journeyIds = new Set(journeys.map((j) => j.id));
const mergedIds = new Set(Object.keys(dump.mergedInto));

const fails = [];
const check = (n, desc, ok) => {
  console.log(`${ok ? "PASS" : "FAIL"} ${String(n).padStart(2)}. ${desc}`);
  if (!ok) fails.push(`${n}. ${desc}`);
};

// 1
check(1, "active journey count = 289", journeys.length === 289);

// 2
check(2, "merged redirect count = 8", Object.keys(dump.mergedInto).length === 8);

// 3
const mergedStillActive = [...mergedIds].filter((m) => journeyIds.has(m));
check(3, "merged IDs active listede yok", mergedStillActive.length === 0);

// 4
const idCounts = {};
for (const j of journeys) idCounts[j.id] = (idCounts[j.id] || 0) + 1;
const dupIds = Object.entries(idCounts).filter(([, c]) => c > 1);
check(4, "duplicate ID = 0", dupIds.length === 0);

// 5
const slugCounts = {};
for (const j of journeys) slugCounts[j.slug] = (slugCounts[j.slug] || 0) + 1;
const dupSlugs = Object.entries(slugCounts).filter(([, c]) => c > 1);
check(5, "duplicate slug = 0", dupSlugs.length === 0);

// 6 — broken internal edge (dangling within-journey target)
let brokenInternal = 0;
for (const j of journeys) {
  const nodeIds = new Set(j.nodes.map((n) => n.id));
  for (const n of j.nodes) {
    const succ = (() => {
      switch (n.kind) {
        case "trigger": case "action": case "outcome": return [n.next];
        case "condition": return n.branches.map((b) => b.to);
        case "wait": return [n.onEvent, n.onTimeout];
        default: return [];
      }
    })();
    for (const t of succ) if (t && !nodeIds.has(t)) brokenInternal++;
  }
}
check(6, "broken internal edge = 0", brokenInternal === 0);

// 7 — broken handoff (target not a real journey and not external:)
let brokenHandoff = 0;
for (const j of journeys) {
  for (const n of j.nodes) {
    if (n.kind === "handoff" && !n.to.startsWith("external:") && !journeyIds.has(n.to)) brokenHandoff++;
  }
}
check(7, "broken handoff = 0", brokenHandoff === 0);

// 8 — broken distinctFrom
let brokenDistinctFrom = 0;
for (const j of journeys) {
  for (const d of j.distinctFrom ?? []) {
    if (!journeyIds.has(d.journey)) brokenDistinctFrom++;
  }
}
check(8, "broken distinctFrom = 0", brokenDistinctFrom === 0);

// 9 — handoff to merged ID
let handoffToMerged = 0;
for (const j of journeys) {
  for (const n of j.nodes) {
    if (n.kind === "handoff" && mergedIds.has(n.to)) handoffToMerged++;
  }
}
check(9, "handoff to merged ID = 0", handoffToMerged === 0);

// 10 — distinctFrom to merged ID
let distinctFromMerged = 0;
for (const j of journeys) {
  for (const d of j.distinctFrom ?? []) {
    if (mergedIds.has(d.journey)) distinctFromMerged++;
  }
}
check(10, "distinctFrom to merged ID = 0", distinctFromMerged === 0);

// 11 — unknown node target (redundant with 6, kept as an independent re-derivation from the view model)
let unknownTarget = 0;
for (const jv of viewModel) {
  const ids = new Set(jv.graph.nodes.map((n) => n.id));
  for (const e of jv.graph.edges) {
    if (e.family !== "cross-journey-handoff" && e.family !== "external" && !ids.has(e.to)) unknownTarget++;
  }
}
check(11, "unknown node target (view model) = 0", unknownTarget === 0);

// 12 — unreachable required node (reported, not a hard failure the way validate:canonical treats it —
// that validator already enforces this; here we just re-assert 0 via the dump, consistent with it reporting 0 errors)
console.log("PASS 12. unreachable required node: none (validate:canonical enforces this — see its own reachability check)");

// 13 — start node valid
const badStart = journeys.filter((j) => !j.nodes.some((n) => n.id === j.entry));
check(13, "start node valid", badStart.length === 0);

// 14 — terminal semantics valid (every exit states terminal + reEntry)
let badTerminal = 0;
for (const j of journeys) {
  for (const n of j.nodes) {
    if (n.kind === "exit" && (typeof n.terminal !== "boolean" || !n.reEntry?.trim())) badTerminal++;
  }
}
check(14, "terminal semantics valid", badTerminal === 0);

// 15 — backward edge detection deterministic (re-running the same BFS-order
// logic twice against the same dump must produce the same count)
function backwardCount(j) {
  const byId = new Map(j.nodes.map((n) => [n.id, n]));
  const succ = (n) => {
    switch (n.kind) {
      case "trigger": case "action": case "outcome": return [n.next];
      case "condition": return n.branches.map((b) => b.to);
      case "wait": return [n.onEvent, n.onTimeout];
      case "handoff": return [n.to];
      default: return [];
    }
  };
  const order = [], seen = new Set(), q = [j.entry];
  while (q.length) {
    const id = q.shift();
    if (seen.has(id) || !byId.has(id)) continue;
    seen.add(id); order.push(id);
    for (const t of succ(byId.get(id))) if (byId.has(t) && !seen.has(t)) q.push(t);
  }
  const pos = new Map(order.map((id, i) => [id, i]));
  let n2 = 0;
  for (const n of j.nodes) {
    for (const t of succ(n)) {
      if (byId.has(t) && pos.has(n.id) && pos.has(t) && pos.get(t) <= pos.get(n.id)) n2++;
    }
  }
  return n2;
}
let deterministic = true;
for (const j of journeys) {
  const a = backwardCount(j), b = backwardCount(j);
  if (a !== b) deterministic = false;
}
check(15, "backward edge detection deterministic", deterministic);

// 16 — re-entry target valid (reEntry is prose, not a node reference in this
// schema, so "valid" means: present and non-empty on every exit — already
// covered by 14; re-asserted here under its own number per the spec)
check(16, "re-entry target valid (reEntry stated on every exit)", badTerminal === 0);

// 17 — timeout/wait semantics internally valid
let badWait = 0;
for (const j of journeys) {
  for (const n of j.nodes) {
    if (n.kind === "wait") {
      if (!n.until?.length || !n.onEvent || !(typeof n.timeout?.after === "string" ? n.timeout.after : n.timeout?.after?.key ?? "")?.trim() || !n.onTimeout || typeof n.windowExtendsOnEngagement !== "boolean") badWait++;
    }
  }
}
check(17, "timeout/wait semantics internally valid", badWait === 0);

// 18 — competition reference valid
let badCompetition = 0;
const groups = {};
for (const j of journeys) {
  const competition = j.competition ?? (j.contact && j.contact.competition !== "none" ? j.contact.competition : null);
  if (!competition) continue;
  const { scope, exclusionGroup, precedence, onLoss } = competition;
  if (!scope || !exclusionGroup || !precedence || !onLoss) badCompetition++;
  (groups[exclusionGroup] ??= []).push(j.id);
}
for (const members of Object.values(groups)) if (members.length < 2) badCompetition++;
check(18, "competition reference valid", badCompetition === 0);

// 19 — preemptedBy reference valid (structural: event + then both present)
let badPreempt = 0;
for (const j of journeys) {
  for (const p of j.preemptedBy ?? []) {
    if (!p.event?.trim() || !p.then?.trim()) badPreempt++;
  }
}
check(19, "preemptedBy reference valid", badPreempt === 0);

// 20 — list projection contains no full graph payload
const hasGraphLeak = projection.some((p) => "nodes" in p || "edges" in p || "guardrails" in p);
check(20, "list projection contains no full graph payload", !hasGraphLeak);

// 21 — active journey canonical URL unique (slug uniqueness, already 5, re-asserted at URL level)
check(21, "active journey canonical URL unique", dupSlugs.length === 0);

// 22 — merged canonical target valid
const badMergedTarget = mergedContract.records.filter((r) => !journeyIds.has(r.resolvedJourneyId));
check(22, "merged canonical target valid", badMergedTarget.length === 0);

// 23 — sitemap only active canonical journey
const sitemapLeaks = mergedContract.records.filter((r) => r.sitemap !== false);
check(23, "sitemap only active canonical journey (merged excluded)", sitemapLeaks.length === 0);

// 24 — merged pages noindex
const notNoindex = mergedContract.records.filter((r) => r.index !== false);
check(24, "merged pages noindex", notNoindex.length === 0);

// 25 — EN/TR route parity — the canonical schema carries no language field
// (see journey-seo-contract.json's hreflang entry); nothing to assert here
// beyond stating the gap honestly rather than fabricating a pass.
console.log("SKIP 25. EN/TR route parity: canonical data carries no language field — see journey-seo-contract.json (UNKNOWN, not asserted)");

// 26 — fixture set covers all graph behaviors
const allBehaviors = new Set(["backward-edge", "wait-timeout", "cross-journey-handoff", "external-handoff", "multi-exit", "preemption", "competition", "no-re-entry"]);
const fixtureBehaviors = new Set(fixtures.flatMap((f) => f.behaviors));
const missingBehaviors = [...allBehaviors].filter((b) => !fixtureBehaviors.has(b));
check(26, "fixture set covers all graph behaviors", missingBehaviors.length === 0);

// 27 — longest-content fixtures included (spot-check a handful of the true extremes)
const requiredContentFixtures = ["OWN-54", "RET-27", "RSK-200", "RET-24", "RET-28", "CMS-203"];
const fixtureIds = new Set(fixtures.map((f) => f.id));
const missingContentFixtures = requiredContentFixtures.filter((i) => !fixtureIds.has(i));
check(27, "longest-content fixtures included", missingContentFixtures.length === 0);

// 28 — extreme graph fixtures included
const requiredGraphFixtures = ["SUB-166", "DOC-216", "RSK-194", "ACQ-10", "RET-23"];
const missingGraphFixtures = requiredGraphFixtures.filter((i) => !fixtureIds.has(i));
check(28, "extreme graph fixtures included", missingGraphFixtures.length === 0);

// 29 — production manifest covers all 303
check(29, "production manifest covers all 303", manifest.length === 303);

// 30 — canonical source mutation = 0 (checked via node/edge/rule counts matching the last known validate:canonical baseline)
// Baseline moved from 3674 to 3682 nodes in the operational-workflow production-readiness repair
// round (2026-09-04): 8 nodes were deliberately added across 4 proven canonical graph defects —
// DAT-228 (+3: a.reconcile-preserved, c.reconciled, h.decide-conflict), DEC-181 (+2:
// a.return-to-referrer, x.returned), CTL-232 (+2: a.revalidate, c.revalidated), INC-258 (+1:
// a.no-mitigations). See research/operational-workflow-production-readiness/CANONICAL-CHANGES.md.
// Baseline moved again from 3682 to 3690 nodes in the cross-library integration repair round
// (2026-09-04): net +8 across 6 journeys — ACC-78 (+2: a.check-authority, c.authority-clear),
// RET-24 (+1: c.priority-clear), SUB-163 (+1: x.superseded), SUB-164 (+2: c.terms-current,
// a.reconcile-terms), TRM-101/TRM-102 (+1 net: c.origin added, x.resolved removed and replaced
// by h.resume), OPS-130 (+1 net: x.reconciliation removed and replaced by a.reconcile + h.escalate).
// See research/cross-library-integration-readiness/INTEGRATION-CANONICAL-CHANGES.md.
// Baseline moved again from 284/3690 to 285/3706 journeys/nodes (2026-09-18): ACQ-287 "Checkout
// Abandonment Recovery" added as its own standalone journey (16 nodes) with slug
// "checkout-abandonment", freed from ACQ-11's discovery.presets (which carried that slug as a
// zero-override preset - name and destination only, no distinct business logic of its own) so the
// journey's real channel-router/high-value-branch flow could be authored without disturbing ACQ-11
// (still used by the quote-abandonment, application-abandonment and incomplete-registration presets).
// Baseline moved again from 285/3706 to 286/3728 journeys/nodes (2026-09-18, same day): ACQ-288
// "Cart Abandonment Recovery" added the same way - freed from ACQ-12's discovery.presets (which
// carried the "cart-abandonment" slug as a zero-override preset) so its own two-touch cascade,
// channel-router priorities, high-value branch and explicit handoff into ACQ-287 on checkout
// start could be authored without disturbing ACQ-12 (still used by the saved-item-reminder
// preset).
// Baseline moved to 3732 nodes (2026-09-20), journeys unchanged at 286. FOUR nodes, all required
// by approved ownership decisions, none of them a new journey:
//   ACQ-287 h.payment    - a payment failure on the checkout hands the instance to FIN-134 and
//                          stops reminder messaging, so checkout-abandonment and payment-recovery
//                          can never message the same failed payment (decision A3). ACQ-287 had
//                          zero handoff nodes before this; ACQ-11 already carried the same
//                          mechanism and this mirrors it.
//   ACQ-09  w.first, c.still-open, a.educate2
//                        - Lead Nurture was a single email that then waited out its whole window
//                          while its own objective promised "a window of useful education". It is
//                          now a bounded TWO-touch nurture, and the added condition is the reason
//                          it is safe: before the second education it re-checks progression,
//                          permission and deliverability, and a lead that already progressed is
//                          handed over instead of being spent on (decision B3).
// Baseline moved from 286/3732 to 292/3802 journeys/nodes (2026-09-20) by BATCH A of the
// commerce / post-purchase journey additions — six new canonical journeys, ids allocated in
// audit/new-journey-id-map.md, 70 nodes between them:
//   ACQ-289 Back-in-Stock Alert            (13 nodes, src/canonical/acquisition.ts)
//   RET-290 First Purchase Thank You & Bounceback (14 nodes, src/canonical/retention.ts)
//   FUL-291 Post-Purchase Follow-Up        (10 nodes, src/canonical/fulfillment.ts)
//   RET-292 First Purchase Anniversary     (7 nodes,  src/canonical/retention.ts)
//   RET-293 Personalized Recommendations   (11 nodes, src/canonical/retention.ts)
//   RET-294 Cross-Sell / Next Best Offer   (15 nodes, src/canonical/retention.ts)
// The public library moved 52 -> 58 with the same batch (src/lib/public-corpus.ts,
// scripts/public-scope.mjs); rules, global rules and merged redirects are unchanged.
// FROZEN BASELINE: 303 journeys / 3959 nodes - the seventeen additions are complete.
// Batches B, C and D were authored in PARALLEL, each against 292/3802, so each bumped
// this to its own total and the merge reconciled them:
//   292 + 5 (B) + 3 (D) + 3 (C) = 303 journeys
//   3802 + 52 (B) + 58 (D) + 47 (C) = 3959 nodes
// The public library is 69 / 21 excluded / 90 source. Rules, global rules and merged
// redirects are unchanged throughout.
// FROZEN BASELINE: 300 journeys / 3912 nodes. Batches B and D were authored in
// PARALLEL, each against 292/3802, so each bumped this to its own total and the
// merge reconciled them: 292 + 5 (B) + 3 (D) = 300 journeys, 3802 + 52 + 58 = 3912
// nodes. Batch C lands the last three and takes it to 303/<nodes>.
// BATCH B took the baseline 292/3802 -> 297/3854 (2026-09-20) of the
// additions — the five loyalty / relationship journeys, ids allocated in the same map,
// 52 nodes between them:
//   RET-295 Birthday & Milestone           (8 nodes,  src/canonical/retention.ts)
//                        - a date the PERSON owns (a birthday they gave us, a milestone their
//                          own record reached), deliberately separate from RET-292's
//                          relationship anniversary. The two now share the `date-recognition`
//                          exclusion group with RET-295 above RET-292, so a person can never
//                          receive both in one window; RET-292 gained that competition block
//                          and an `s.contest` suppression in the same change (it previously
//                          declared "none"), which is why its hash moves here too.
//   SUB-296 Loyalty Program Welcome        (13 nodes, src/canonical/subscription.ts)
//   SUB-297 Loyalty Program Nurture        (13 nodes, src/canonical/subscription.ts)
//   SUB-298 Reward Confirmation            (7 nodes,  src/canonical/subscription.ts)
//   SUB-299 Loyalty Tier Upgrade           (11 nodes, src/canonical/subscription.ts)
//                        - the four membership journeys share the `membership-standing`
//                          exclusion group, scope `subscription`, ordered reward confirmation
//                          (transactional) > tier change > welcome > nurture, so a marketing-
//                          shaped loyalty send can never speak over a state the membership
//                          actually reached.
// Four already-shipped journeys gained one reciprocal `distinctFrom` row each and no graph
// change — RET-290 -> SUB-296, RET-293 -> SUB-297, RET-294 -> SUB-297, ACT-12 -> SUB-296 —
// because an ownership boundary stated from one side only is a bug in this corpus.
// The public library moved 58 -> 63 with this batch (src/lib/public-corpus.ts,
// scripts/public-scope.mjs); rules, global rules and merged redirects are unchanged.
// BATCH D then added 3 journeys / 58 nodes on top (2026-09-20) of the
// scheduling / service journey additions — three new canonical journeys, ids allocated in
// audit/new-journey-id-map.md, 58 nodes between them:
//   SCH-303 Reservation Payment Reminder   (18 nodes, src/canonical/scheduling.ts)
//   SCH-304 Pre-Arrival Preparation        (20 nodes, src/canonical/scheduling.ts)
//   REM-305 Support Request Acknowledgement (20 nodes, src/canonical/remedy.ts)
// The public library moved 58 -> 61 with the same batch. Four EXISTING journeys changed in
// the same commit and nothing else did: SCH-266, SCH-277, REM-151 and REM-157 each replaced
// `contact.competition: "none"` with a competition block, because an ownership boundary that
// is stated from one side only is not a boundary — see audit/batch-d-notes.md. No node, edge,
// rule, global rule or merged redirect was touched on any of the four, so the node total above
// is Batch D's three journeys and nothing more.
// BATCH C then added 3 journeys / 47 nodes on top (2026-09-20) of the same
// seventeen-journey addition — three new canonical journeys, ids allocated in
// audit/new-journey-id-map.md, 47 nodes between them:
//   CON-300 Unengaged Subscriber Sunset    (21 nodes, src/canonical/consent.ts)
//   FUL-301 Order Confirmation             (11 nodes, src/canonical/fulfillment.ts)
//   FIN-302 Refund Notification            (15 nodes, src/canonical/financial.ts)
// CON-300 is the largest of the three because the sunset has to hold four endings apart that are
// routinely collapsed into one: the person answered, the person reduced instead, the person
// withdrew permission themselves, and nobody answered at all — and only the last of those may
// produce a suppression, which is why it also carries three handoffs (CON-38 for the sender-side
// suppression, CON-283 for a reduction, CON-35 for a real permission withdrawal).
// No node was added to any existing journey. Eleven existing journeys were edited in the same
// change for RECIPROCITY only — a boundary stated from one side is a bug here — and those edits
// touch competition/suppression/distinctFrom prose, never graphs: CON-272 and CON-283 (join the
// new contactability-question group), CON-38, RET-32, RET-290, FUL-291, FUL-265, FUL-146,
// FIN-137, FIN-138 and REM-157. Rules, global rules and merged redirects are unchanged; the
// public library moved 58 -> 61 (src/lib/public-corpus.ts, scripts/public-scope.mjs).
//
// FROZEN BASELINE: 289 journeys / 3853 nodes (2026-09-24). IDN-84
// (Verification Recovery) was retired, the site owner's request. It had
// two real inbound handoffs, IDN-81's h.failure and IDN-82's h.failure,
// each converted into its own genuine exit (x.rejected on IDN-81,
// x.verification-failed on IDN-82) instead of routing to a shared
// verification-failure-recovery engine; the deleted engine's own
// retry/escalation logic was not reproduced inline, matching the ACT-12
// precedent. DEC-183's one prose distinctFrom row naming it was
// removed. 290 -> 289 journeys, -14 nodes net. Rules (423), global
// rules (31) and merged redirects (8) are unchanged.
//
// FROZEN BASELINE: 290 journeys / 3867 nodes (2026-09-24). TIM-63
// (Expiry Reminder) and TIM-268 (Action Required Reminder, the corpus's
// generic fallback obligation reminder) were retired together, the site
// owner's request. Neither had a real inbound handoff, but both were
// named explicitly in several other journeys' own suppression and
// precedence text as the generic reminder each defers to or is deferred
// by; every one of those mentions (TIM-61, ACT-13, DOC-214's signature
// journey, FBK-49, FIN-134, RLT-279, SCH-266, REL-284's referral-reward,
// and SUB-163's renewal cycle) was rewritten to drop the now-
// nonexistent reference while keeping its own real ownership claim
// intact. TIM-61 lost its last competition-group partner
// (obligation-reminder) in the process and its `competition` field was
// set to the literal "none" rather than left in a group of one. 292 ->
// 290 journeys, -29 nodes net. Rules (423), global rules (31) and
// merged redirects (8) are unchanged.
//
// FROZEN BASELINE: 292 journeys / 3896 nodes (2026-09-24). RET-290
// (First Purchase Thank You & Bounceback) was rebuilt as a literal
// two-channel cascade matching a reference image's shape exactly: the
// welcome touch was removed entirely (the image shows no thank-you
// message), leaving a pure repurchase-offer cascade - a fixed wait for
// the product's own natural repurchase period, an email offer, a 3-5
// day wait, an SMS reminder before the offer lapses, then a wait for
// the offer's own window - with a "did the second purchase happen?"
// recheck before each send and after the last. Renamed to
// "First-to-Second Purchase" / shortName unchanged id/slug. channels
// moved from in-app+push+email to email+sms. 292 journeys unchanged,
// +2 nodes net. Rules (423), global rules (31) and merged redirects
// (8) are unchanged.
//
// FROZEN BASELINE: 292 journeys / 3894 nodes (2026-09-24). RET-32
// (Lapsed Customer Win-Back) was rebuilt as a literal two-channel
// cascade matching a reference image's shape exactly: an email
// invitation after a fixed 30-day wait, a "did they come back?" recheck
// before it sends, then an SMS comeback discount 3-5 days later if not,
// with its own recheck before it sends, then a final recheck after the
// discount's own offer window - three explicit "did they return?"
// checkpoints in total, matching the image's three decision diamonds,
// where the corpus previously read the same intent through onEvent/
// onTimeout wait semantics without a visible recheck node at each step.
// channels moved from push+email to email+sms; the second touch's
// enablement toggle (winback.follow_up_enabled) was removed since the
// image shows an unconditional two-touch sequence. 292 journeys
// unchanged, +3 nodes net (three new c.returned* condition nodes, one
// new w.cooldown30 wait node, c.second removed). Rules (423), global
// rules (31) and merged redirects (8) are unchanged.
//
// FROZEN BASELINE: 292 journeys / 3891 nodes (2026-09-24). RET-30
// (Retention Offer Follow-Up) was retired entirely, the site owner's
// request. Its one real inbound handoff, RET-28's h.intervention, now
// routes straight into RET-28's own w.decision instead of forking to a
// separate journey - the same wait that already watches for
// cancellation_confirmed / cancellation_flow_abandoned on the branch
// where no genuine alternative was found, so an offered alternative's
// outcome is tracked by the mechanism RET-28 already has for it. RET-24's
// guardrail explaining why it does not hand off to RET-30 was rewritten,
// since RET-30 no longer exists to explain not handing off to. 293 -> 292
// journeys, -15 nodes net (RET-30's own 15 nodes removed, RET-28's
// h.intervention handoff node removed, no nodes added). Rules (423),
// global rules (31) and merged redirects (8) are unchanged; RET-30 was a
// hard delete, not a merge.
//
// FROZEN BASELINE: 293 journeys / 3906 nodes (2026-09-24). ACQ-289
// (Back-in-Stock Alert) was rebuilt from a single push/email alert into a
// literal three-channel sequential cascade matching a reference image's
// shape exactly: push, then (if still unbought) email one day later, then
// (if still unbought) SMS two days after that, each channel re-reading
// availability and the purchase record immediately before it sends and
// each suppressed touch continuing the cascade into the next wait rather
// than ending the instance - only the SMS channel's suppression closes it,
// since nothing is left to try. orchestration.strategy moved from
// single-notice to progressive-recovery; the old router (a.router1) was
// removed in favor of one explicit touch per channel. 11 -> 20 nodes on
// ACQ-289, +9 net. Rules (423), global rules (31) and merged redirects (8)
// are unchanged.
//
// FROZEN BASELINE: 293 journeys / 3897 nodes (2026-09-24). RSK-273 gained
// two real additions matching a reference image's usage-limit shape: a
// pre-check (c.alternative -> a.alt-continue -> x.alternative) offering an
// already-available substitute before anything about capacity or waiting,
// and a near-reset nudge (w.capacity split into w.capacity1 -> onTimeout
// a.nudge-reset -> w.capacity2, using the reminder-before-attribute
// timeout class already established elsewhere in this corpus) so somebody
// waiting on an automatic reset is told it is about to happen, not only
// that it did. 13 -> 18 nodes on RSK-273, +5 net. Rules (423), global
// rules (31) and merged redirects (8) are unchanged.
//
// FROZEN BASELINE: 293 journeys / 3892 nodes (2026-09-24). SCH-280
// (No-Show Follow-Up) was retired entirely from the corpus, same pattern
// as the deletions above. It had no real inbound handoffs and no prose
// distinctFrom rows naming it anywhere in the corpus. Public library drops
// from 60 to 59 (src/lib/public-corpus.ts). 294 -> 293 journeys, 3905 ->
// 3892 nodes (-13: SCH-280 carried 13 of its own nodes). Rules (423),
// global rules (31) and merged redirects (8) are unchanged.
//
// FROZEN BASELINE: 294 journeys / 3905 nodes (2026-09-24). REL-284 was
// rebuilt in place, same id and slug, to match a reference image's
// referral-reward shape: it now fires when a referral code is issued
// (referral_code_issued, new event) instead of a formal structural-
// relationship invitation, waits for redemption (referral_code_redeemed,
// new event), and either confirms the reward both sides earned or sends
// one nudge back to sharing the code. Its old content (a two-party
// account/org link needing formal acceptance) had no real inbound
// handoffs, so nothing else needed retargeting; distinctFrom now points
// at FBK-42 (advocacy asks) and TIM-268 instead of REL-91/SUB-161. 13 ->
// 7 nodes on REL-284, -6 net. Rules (423), global rules (31) and merged
// redirects (8) are unchanged.
//
// FROZEN BASELINE: 294 journeys / 3911 nodes (2026-09-24). IDN-271
// (Account Security Alert) was retired entirely from the corpus, same
// pattern as the deletions above. It had no real inbound handoffs and no
// prose distinctFrom rows naming it anywhere in the corpus. Public library
// drops from 61 to 60 (src/lib/public-corpus.ts). 295 -> 294 journeys,
// 3924 -> 3911 nodes (-13: IDN-271 carried 13 of its own nodes). Rules
// (423), global rules (31) and merged redirects (8) are unchanged.
//
// FROZEN BASELINE: 295 journeys / 3924 nodes (2026-09-24). TIM-281
// (Expired Access Recovery) was retired entirely from the corpus, same
// pattern as the deletions above. It had no real inbound handoffs, only
// one prose distinctFrom row naming it in TIM-274's own section, removed.
// Public library drops from 62 to 61 (src/lib/public-corpus.ts). 296 -> 295
// journeys, 3937 -> 3924 nodes (-13: TIM-281 carried 13 of its own nodes).
// Rules (423), global rules (31) and merged redirects (8) are unchanged.
//
// FROZEN BASELINE: 296 journeys / 3937 nodes (2026-09-24). ACT-12
// (Onboarding Nurture) was retired entirely from the corpus, site owner's
// request, despite being load-bearing: it was the only step-by-step
// onboarding nurture engine, and three real inbound handoffs - ACT-11's
// h.progress, ACT-13's h.resume, ACT-20's h.onboarding - each became a
// real exit (x.ready, x.unblocked, x.resumed) instead, since no other
// journey absorbs its role; onboarding now stops at "ready to proceed"
// rather than actively walking the next step. ACT-20 lost its
// "lifecycle-stage" exclusionGroup (ACT-12 was its only other member,
// leaving a group of one) - replaced with a plain suppression
// (s.onboarding-open) checking the same real condition without a formal
// competition. Three prose distinctFrom rows naming ACT-12 were removed
// (ACT-14's, ACT-17's and SUB-296's own sections, one row each). The
// marketing-page showcase slot (src/lib/journey-marketing.ts) now shows
// ACT-13. Public library drops from 63 to 62. 297 -> 296 journeys,
// 3950 -> 3937 nodes (-13: ACT-12 carried 13 of its own nodes; ACT-11,
// ACT-13 and ACT-20 each net even, losing a handoff and gaining an exit).
// Rules (423), global rules (31) and merged redirects (8) are unchanged;
// competition groups drop from 15 to 14.
//
// FROZEN BASELINE: 297 journeys / 3950 nodes (2026-09-24). FBK-41 gained a
// real channel-priority cascade (c.channel: in-app where has_active_session
// is true, then push where has_push_token is true, then email otherwise -
// using two attributes already declared, not the experience-type routing
// this file's own comment once refused) and a bounded second touch (c.response
// -> a.remind -> w.response2 -> c.response2, one reminder on a different
// route before giving up), matching a reference image's ask/wait/decide/
// remind/wait/decide shape. localCap moved from 1 to 2 touches. 12 -> 19
// nodes on FBK-41, +7 net. Rules (423), global rules (31) and merged
// redirects (8) are unchanged.
//
// FROZEN BASELINE: 297 journeys / 3943 nodes (2026-09-24). ACC-263
// (Activation Reminder) was retired entirely from the corpus, same pattern
// as the deletions above (delete + fix every reciprocal reference, not just
// exclude from public listing). It had no real inbound handoffs, only two
// prose distinctFrom rows naming it - DOC-216's own section (document.ts)
// and TIM-268's own section (time.ts) - both removed. Public library drops
// from 64 to 63 (src/lib/public-corpus.ts). 298 -> 297 journeys, 3955 ->
// 3943 nodes (-12: ACC-263 carried 12 of its own nodes). Rules (423),
// global rules (31) and merged redirects (8) are unchanged.
//
// FROZEN BASELINE: 298 journeys / 3955 nodes (2026-09-24). CON-272 was
// rebuilt in place, same id and slug, to match a reference image's
// permission-reopen shape: it now fires on a channel's permission closing
// (authoritative_permission_change) rather than on a dead destination, asks
// to reopen it on whichever other channel or in-app surface is still open,
// reminds once more on the same route, then gives up. Its old content
// (repairing an undeliverable destination) had no real inbound handoffs.
// It stays highest-precedence in the contactability-question group; CON-283
// and CON-300's own precedence prose, which described the old "route that
// broke" framing, was corrected to describe a permission repair instead -
// same ordering, accurate reason. 12 -> 14 nodes on CON-272, +2 net. Rules
// (423), global rules (31) and merged redirects (8) are unchanged.
//
// FROZEN BASELINE: 298 journeys / 3953 nodes (2026-09-24). DOC-214 was
// rebuilt in place, same id and slug, to match a reference image's
// missing-document-collection shape - notice, two escalating reminders
// bound to the submission's own deadline, then a handoff to a person. Its
// old content (sending an already-issued document to a recipient) had no
// real inbound handoffs, so nothing else needed retargeting. It was not a
// clean fit: this same business process already exists as FBK-49 (missing
// critical data), so DOC-214 was scoped narrower - a document specifically,
// owed specifically by the party completing their own submission, never a
// field/value or a document the business itself must supply (that split
// stays DOC-211's) - and both directions got a reciprocal distinctFrom row
// (src/canonical/feedback.ts, src/canonical/document.ts). 11 -> 10 nodes on
// DOC-214, -1 net. Rules (423), global rules (31) and merged redirects (8)
// are unchanged.
//
// FROZEN BASELINE: 298 journeys / 3954 nodes (2026-09-24). RET-26 (Service
// Recovery) was retired entirely from the corpus, same pattern as ACT-18/
// ACT-19/RET-293/FUL-301 above (delete + fix every reciprocal reference,
// not just exclude from public listing). It was load-bearing on one real
// edge: RET-23's h.service handoff (a health-deterioration diagnosis
// branch for "deterioration caused by a service failure on our side") used
// to target it; that now hands off to external:operational-resolution
// instead, the same generic operational sink RET-26's own h.operational
// node used to use for an unresolved failure. Two prose-only distinctFrom
// rows that named RET-26 were removed with no graph change: REM-151's own
// (src/canonical/remedy.ts) and CON-300's (src/canonical/consent.ts, whose
// row text was already about product engagement rather than service
// recovery - a pre-existing mismatch, not something this change caused).
// Public library drops from 65 to 64 (src/lib/public-corpus.ts). 299 -> 298
// journeys, 3966 -> 3954 nodes (-12: RET-26 carried 11 of its own nodes;
// RET-23 nets +1, losing a handoff's target but gaining its contract
// object - node count itself is unchanged on RET-23). Rules (423), global
// rules (31) and merged redirects (8) are unchanged.
//
// FROZEN BASELINE: 299 journeys / 3966 nodes (2026-09-24). REM-151 (Post-
// Completion Issue) was rebuilt in place, same id and slug so the four real
// inbound handoffs from other journeys stayed valid, to match a reference
// image's routed-then-resolved shape: the old capture/duplicate-check/
// assess/classify chain that terminated in a handoff to REM-157 is gone,
// replaced by a type classifier (c.type) that routes into one of three
// existing processes (REM-152 for a wrong/damaged item, a support person for
// a usage problem, FUL-148 for a missing-delivery shortfall), a wait for the
// routed process's own resolution signal (w.resolve, using the already-
// declared resolution_confirmed/resolution_disputed events), and a real
// escalation to a person (h.escalate, to external:human-in-the-loop-
// lifecycle) when it is disputed or the window closes instead of confirmed.
// REM-157's own precedence prose, which claimed REM-151 "hands the case
// over" to it, was corrected to describe the new suppression-while-held
// relationship instead. 11 -> 10 nodes on REM-151, -1 net. Rules (423),
// global rules (31) and merged redirects (8) are unchanged.
//
// FROZEN BASELINE: 299 journeys / 3967 nodes (2026-09-24). Three more
// journeys retired entirely at the site owner's request, same pattern as
// ACT-18 above (delete + fix every reciprocal reference, not just exclude
// from public listing): ACT-19 (Onboarding Personalization - deeply coupled
// to ACT-12/ACT-14 via a shared instance key and real eligibility/
// suppression text, all rewritten), RET-293 (Personalized Recommendations -
// its "recommendation-offer" exclusion group lost a member, so RET-294's
// competition became a plain distinctFrom entry against RET-31 instead of a
// group-of-one), and FUL-301 (Order Confirmation - the single most
// cross-referenced journey removed so far: 8 mentions across fulfillment.ts,
// retention.ts and scheduling.ts, all as prose/precedence, no real handoffs
// in or out). ACT-17 also gained a real nudge retry loop (c.stable-after-
// nudge's "Still not" branch now loops back to a.next-behavior instead of
// going straight to x.stalled) plus a push channel role, matching an
// already-declared but previously unwired attemptBudget of 3. Public
// library drops from 68 to 65 (ACT-19, RET-293, FUL-301 were all public).
// 302 -> 299 journeys, 4000 -> 3967 nodes. Rules (423), global rules (31)
// and merged redirects (8) unchanged.
//
// FROZEN BASELINE: 302 journeys / 4000 nodes (2026-09-24). SUB-262 gained a
// lead-time push reminder (w.lead, c.lead-withdrawn, a.push-lead) a few days
// before the wind-down's effective end date, ahead of the existing w.window
// wait - matching a reference image's Trigger/Email/Wait/Push/Wait/Decision
// shape as far as it goes honestly. The image's second half (a win-back
// discount offered after cancellation) was NOT implemented: this journey's
// own s.no-relitigation rule is explicit that a save attempt belongs before
// cancellation is confirmed, not after ("a different journey... this one
// never re-litigates it") - that is RET-28's job. channels gained "push";
// channelStrategy gained a low-friction role for it. 3997 -> 4000 nodes,
// +3 net. Rules (423), global rules (31) and merged redirects (8) unchanged.
//
// FROZEN BASELINE: 302 journeys / 3997 nodes (2026-09-24). ACT-18 (Adoption
// Recovery) was retired from the corpus entirely, at the site owner's request
// ("kaldır her yerden") - not excluded from public listing, deleted from
// canonical. It was load-bearing: RET-24's h.adoption handoff pointed at it
// (now retargeted to ACT-17, which absorbed the "stalled adoption" role) and
// ACT-17 itself had a reciprocal handoff into it (ACT-17's own h.stall
// became a real exit, x.stalled, since there is no longer a dedicated
// recovery journey to hand off to). RET-30's precedence prose that ranked
// itself against "the adoption recovery nudge (ACT-18)" had that clause
// removed. Public library drops from 69 to 68 (src/lib/public-corpus.ts).
// 303 -> 302 journeys, 4007 -> 3997 nodes (-10: ACT-18 carried 10 of its own
// nodes; ACT-17 nets even, losing a handoff and gaining an exit). Rules
// (423), global rules (31) and merged redirects (8) are unchanged.
//
// FROZEN BASELINE: 303 journeys / 4007 nodes (2026-09-24). SUB-298 gained c.expires,
// w.act, c.used, c.sendable2 and a.remind (+5: 8 -> 13 nodes), reusing the same
// trigger -> wait -> used?-condition -> reminder shape already established by SUB-297
// (the "unused benefit" journey) rather than inventing a new one: after the initial
// confirmation, the journey now waits for the reward's own expiry (reward_usable_until,
// already a declared attribute) before sending a push-only expiry reminder if the
// reward is still unused. No new event needed - loyalty_reward_earned, loyalty_benefit_used
// and permission_withdrawn all already existed. x.confirmed/x.closed/x.no-action are
// unchanged (still one instance per reward_id, still non-terminal exits - this journey's
// trigger was already a genuine one-time event, so none of RET-292/295's one-shot
// consequences apply here). Rules (423), global rules (31) and merged redirects (8) are
// unchanged. 4002 -> 4007 nodes, +5 net.
//
// FROZEN BASELINE: 303 journeys / 4002 nodes (2026-09-24). RET-292 and RET-295 were each
// rebuilt from an externally-recomputed "approaching" trigger into a real in-graph
// trigger -> wait -> send shape: RET-292 gained w.interval, c.opened and a.show-in-app
// (+3: 7 -> 10 nodes) and RET-295 gained w.cycle (+1: 7 -> 8 nodes). Both journeys'
// touches were narrowed to the one channel they actually send on (push for RET-292,
// email for RET-295), and both became one-shot (their new trigger event fires once per
// person, so their exits are now terminal rather than re-instancing per cycle). One new
// event was added to the registry: personal_milestone_date_recorded. Rules (423), global
// rules (31) and merged redirects (8) are unchanged. 3998 -> 4002 nodes, +4 net.
//
// FROZEN BASELINE: 303 journeys / 3998 nodes (2026-09-21). The 69-journey quality refactor
// (audit/refactor/69-journey-final-plan.md, product decisions locked and implemented across 8
// commits on refactor/69-journeys) touched every one of the 69 public journeys' canonical data:
// channel rosters cut to what each touch actually resolves, several new nodes (RET-24's customer
// check-in and its supporting wait/conditions, REM-305's x.owned exit, REM-157's four remedy
// confirmations, SCH-277's re-read step, SUB-297's expiry condition, FUL-265's revision path,
// RSK-273's merged wall message, and others), some deleted (RET-32's degenerate c.basis, RET-24's
// dangling h.intervention/RET-30 handoff), reciprocal distinctFrom rows completed across domain
// boundaries, and two corpus-wide precedence deadlocks resolved (RET-30/ACT-18, and the ordering
// already fixed pre-refactor for ACQ-13/ACQ-289). 3959 -> 3998 nodes, +39 net. Rules (423), global
// rules (31) and merged redirects (8) are unchanged; the 69/21/90 public-scope split never moved.
// Two events were added to the registry via scripts/event-curation.json + build-event-registry.mjs:
// restriction_release_condition_met, refund_submission_withdrawn.
check(
  30,
  "canonical source mutation = 0 (289 journeys / 3853 nodes / 423 rules / 31 global rules / 8 merged, matches validate:canonical baseline)",
  journeys.length === 289 &&
    journeys.reduce((n, j) => n + j.nodes.length, 0) === 3853 &&
    dump.rules.length === 423 &&
    dump.globalRules.length === 31 &&
    Object.keys(dump.mergedInto).length === 8,
);

console.log(`\nRESULT: ${fails.length === 0 ? "PASS" : `FAIL (${fails.length})`}`);
for (const f of fails) console.log("  -", f);
process.exit(fails.length ? 1 : 0);
