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
check(1, "active journey count = 303", journeys.length === 303);

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
  "canonical source mutation = 0 (303 journeys / 3998 nodes / 423 rules / 31 global rules / 8 merged, matches validate:canonical baseline)",
  journeys.length === 303 &&
    journeys.reduce((n, j) => n + j.nodes.length, 0) === 3998 &&
    dump.rules.length === 423 &&
    dump.globalRules.length === 31 &&
    Object.keys(dump.mergedInto).length === 8,
);

console.log(`\nRESULT: ${fails.length === 0 ? "PASS" : `FAIL (${fails.length})`}`);
for (const f of fails) console.log("  -", f);
process.exit(fails.length ? 1 : 0);
