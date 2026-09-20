/* Family B detector: scans the canonical corpus for wait->condition pairs
   that are safe to draw as one combined card (see `collapsibleWaitFollowers`
   in src/lib/journey-canvas-layout.ts, which this script mirrors exactly -
   both read the same two conditions off the same edge data, so a candidate
   this script reports "safe" is exactly a candidate the shipped display
   graph collapses, and the render-based `guard-display.mjs` /
   `measure-display.mjs` are what prove that agreement, not a claim this
   script makes about itself).

     node audit/family-b-detector.mjs

   Writes audit/family-b-candidates.json: one record per wait node in the
   public corpus, `safe_to_collapse` and a `reason`, then the corpus-wide
   summary the audit brief asked for. */
import fs from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname;
const dump = JSON.parse(fs.readFileSync(ROOT + "production/canonical-dump.json", "utf8"));
const manifest = JSON.parse(fs.readFileSync(ROOT + "audit/manifest.json", "utf8"));
const publicIds = new Set(manifest.journeys.map((j) => j.journey_id));
const journeys = (dump.journeys ?? dump).filter((j) => publicIds.has(j.id));

/* Canonical edge targets per node kind - same shape journey-canvas-layout.ts
   reads off FlowNode.edges, computed straight from the canonical node here
   instead (this script has no FlowNode projection). */
function outEdges(n) {
  switch (n.kind) {
    case "trigger":
    case "action":
    case "outcome":
      return n.next ? [n.next] : [];
    case "condition":
      return n.branches.map((b) => b.to);
    case "wait":
      return [n.onEvent, n.onTimeout];
    case "handoff":
      return n.to.startsWith("external:") ? [] : [n.to];
    default:
      return [];
  }
}

const records = [];
let totalWaits = 0;
let sameTarget = 0;
let safe = 0;
const rejectionReasons = {};
const affectedJourneys = new Set();

for (const j of journeys) {
  const by = new Map(j.nodes.map((n) => [n.id, n]));

  // Distinct sources pointing at each node - a wait's own two same-target
  // arms count as ONE source, matching collapsibleWaitFollowers exactly.
  const sources = new Map();
  for (const n of j.nodes) {
    for (const to of outEdges(n)) {
      if (!to) continue;
      const set = sources.get(to) ?? new Set();
      set.add(n.id);
      sources.set(to, set);
    }
  }

  for (const n of j.nodes) {
    if (n.kind !== "wait") continue;
    totalWaits++;
    const onEventTarget = n.onEvent;
    const onTimeoutTarget = n.onTimeout;
    const rec = {
      journey_id: j.id,
      wait_node_id: n.id,
      on_event_target: onEventTarget,
      on_timeout_target: onTimeoutTarget,
    };

    if (onEventTarget !== onTimeoutTarget) {
      rec.condition_node_id = null;
      rec.other_incoming_sources = null;
      rec.safe_to_collapse = false;
      rec.reason = "onEvent and onTimeout target different nodes - different business meaning, collapse forbidden";
      records.push(rec);
      rejectionReasons[rec.reason] = (rejectionReasons[rec.reason] ?? 0) + 1;
      continue;
    }
    sameTarget++;

    const target = by.get(onEventTarget);
    rec.condition_node_id = onEventTarget;
    if (!target || target.kind !== "condition") {
      rec.other_incoming_sources = null;
      rec.safe_to_collapse = false;
      rec.reason = `target is kind "${target?.kind ?? "unknown"}", not a condition`;
      records.push(rec);
      rejectionReasons[rec.reason] = (rejectionReasons[rec.reason] ?? 0) + 1;
      continue;
    }

    const srcSet = sources.get(target.id) ?? new Set();
    const others = [...srcSet].filter((s) => s !== n.id);
    rec.other_incoming_sources = others;

    if (others.length > 0) {
      rec.safe_to_collapse = false;
      rec.reason = `condition has other incoming sources: ${others.join(", ")}`;
      records.push(rec);
      rejectionReasons[rec.reason] = (rejectionReasons[rec.reason] ?? 0) + 1;
      continue;
    }

    rec.safe_to_collapse = true;
    rec.reason = "both wait outcomes converge to one exclusive condition";
    records.push(rec);
    safe++;
    affectedJourneys.add(j.id);
  }
}

const out = {
  generated: new Date().toISOString(),
  summary: {
    total_wait_nodes_scanned: totalWaits,
    same_target_event_timeout_candidates: sameTarget,
    safe_collapses: safe,
    rejected_candidates: totalWaits - safe,
    rejection_reason_breakdown: rejectionReasons,
    affected_journey_count: affectedJourneys.size,
    affected_journeys: [...affectedJourneys].sort(),
  },
  candidates: records,
};
fs.writeFileSync(ROOT + "audit/family-b-candidates.json", JSON.stringify(out, null, 2) + "\n");

console.log("=== FAMILY B DETECTOR ===");
console.log(`total wait nodes scanned: ${totalWaits}`);
console.log(`same-target event/timeout candidates: ${sameTarget}`);
console.log(`safe collapses: ${safe}`);
console.log(`rejected candidates: ${totalWaits - safe}`);
console.log("rejection reason breakdown:");
for (const [reason, count] of Object.entries(rejectionReasons)) console.log(`  ${count}  ${reason}`);
console.log(`affected journeys: ${affectedJourneys.size} - ${[...affectedJourneys].sort().join(", ")}`);
