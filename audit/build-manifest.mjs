/* Phase 0.1 + 0.2 - manifest and canonical baseline, generated from the
   corpus rather than typed by hand. Read-only against src/: it reads the
   generated dump and the surface assignment, and writes only under audit/. */
import { createHash } from "node:crypto";
import fs from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname;
const dump = JSON.parse(fs.readFileSync(ROOT + "production/canonical-dump.json", "utf8"));
const sa = JSON.parse(fs.readFileSync(ROOT + "production/surface-assignment.json", "utf8"));
const journeys = dump.journeys ?? dump;
const surface = new Map((sa.journeys ?? sa).map((j) => [j.id, j]));

/* The library corpus: public (not archived/operational) AND on the customer
   surface AND its work actually reaches a person. Same predicate as
   src/lib/public-corpus.ts's isLibraryJourney - expressed here against the
   surface-assignment artifact because this script runs in plain node. */
const library = journeys.filter((j) => {
  const s = surface.get(j.id);
  return s && s.surface === "customer" && (s.sends || s.routesToHuman);
});

const outOf = (n) =>
  n.kind === "condition" ? n.branches.map((b) => b.to)
  : n.kind === "wait" ? [n.onEvent, n.onTimeout]
  : n.next ? [n.next] : [];

/* ---------------------------------------------------------- journey types */

function classify(j) {
  const types = new Set();
  const nodes = j.nodes;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const conditions = nodes.filter((n) => n.kind === "condition");
  const waits = nodes.filter((n) => n.kind === "wait");
  const exits = nodes.filter((n) => n.kind === "exit");
  const handoffs = nodes.filter((n) => n.kind === "handoff");
  const comms = nodes.filter((n) => n.kind === "action" && n.execution === "communication");
  const humans = nodes.filter((n) => n.kind === "action" && n.execution === "human");
  const internals = nodes.filter((n) => n.kind === "action" && !n.execution);

  // shape
  if (conditions.length === 0) types.add("linear");
  if (conditions.length >= 1) types.add("multi-branch");
  if (conditions.some((c) => c.branches.some((b) => byId.get(b.to)?.kind === "condition"))) types.add("nested-decision");
  if (conditions.some((c) => c.branches.length >= 4)) types.add("parallel-fan-out");
  if (nodes.length >= 20) types.add("large-graph");
  if (nodes.length <= 8) types.add("short");

  // terminals
  const parents = new Map();
  for (const n of nodes) for (const t of outOf(n)) parents.set(t, (parents.get(t) ?? 0) + 1);
  if (exits.some((x) => (parents.get(x.id) ?? 0) >= 2)) types.add("shared-exit");
  if (handoffs.some((h) => (parents.get(h.id) ?? 0) >= 2)) types.add("shared-handoff");
  if (handoffs.length) types.add("handoff");

  // timing
  if (waits.length) types.add("wait-event-timeout");
  if (waits.some((w) => w.timeout?.relativeTo === "attribute")) types.add("deadline-driven");
  if (waits.length && !waits.some((w) => w.timeout?.relativeTo === "attribute")) types.add("no-deadline");

  // cycles / retries: an edge back to an earlier node in declaration order
  const pos = new Map(nodes.map((n, i) => [n.id, i]));
  if (nodes.some((n) => outOf(n).some((t) => (pos.get(t) ?? Infinity) < (pos.get(n.id) ?? 0)))) types.add("back-edge-retry");

  // execution mix
  if (comms.length >= 3) types.add("communication-heavy");
  if (comms.length) types.add("communication");
  if (humans.length) types.add("human-vs-automated");
  if (internals.length >= Math.max(3, nodes.length * 0.25)) types.add("routing-heavy");

  // business family, from the audited goal rather than guessed from prose
  const goal = j.goal ?? "";
  if (goal === "recovery-retry") types.add("recovery");
  if (goal === "progression-milestone") types.add("nurture");
  if (goal.includes("education")) types.add("education");
  if (goal.includes("routing") || goal.includes("assignment")) types.add("routing");

  // external destinations
  if (handoffs.some((h) => String(h.to).startsWith("external:"))) types.add("external-handoff");

  return [...types].sort();
}

/* ------------------------------------------------- canonical baseline hash */

/* The semantic projection the guard hashes. Deliberately excludes anything
   display-only (nothing in canonical is display-only today, but the shape
   below is the contract: if a display overlay is ever added it must NOT be
   reachable from here) and excludes key order by sorting every object. */
function semanticProjection(j) {
  const node = (n) => {
    const base = { id: n.id, kind: n.kind };
    switch (n.kind) {
      case "trigger":
        return { ...base, event: n.event, evidence: n.evidence, next: n.next };
      case "action":
        return { ...base, does: n.does, execution: n.execution ?? null, writes: n.writes ?? null,
                 idempotencyKey: n.idempotencyKey ?? null, attemptBudget: n.attemptBudget ?? null, next: n.next };
      case "condition":
        return { ...base, asks: n.asks, branches: n.branches.map((b) => ({ label: b.label, when: b.when, observes: b.observes ?? null, to: b.to })) };
      case "wait":
        return { ...base, until: n.until, onEvent: n.onEvent, onTimeout: n.onTimeout, timeout: n.timeout,
                 recheck: n.recheck ?? null, windowExtendsOnEngagement: n.windowExtendsOnEngagement };
      case "outcome":
        return { ...base, state: n.state, means: n.means ?? null, next: n.next };
      case "exit":
        return { ...base, state: n.state, class: n.class ?? null, terminal: n.terminal ?? false, reEntry: n.reEntry ?? null };
      case "handoff":
        return { ...base, to: n.to, on: n.on, carries: n.carries ?? null, suppresses: n.suppresses ?? null, contract: n.contract ?? null };
      default:
        return { ...base, unknown: true, raw: n };
    }
  };
  return {
    id: j.id, slug: j.slug, goal: j.goal, channels: j.channels,
    entry: j.entry,
    nodes: j.nodes.map(node),
    entity: j.entity ?? null,
    eligibility: j.eligibility ?? null,
    suppressions: j.suppressions ?? null,
    contact: j.contact ?? null,
    channelStrategy: j.channelStrategy ?? null,
    orchestration: j.orchestration ?? null,
    implementation: j.implementation ?? null,
    measurement: j.measurement ?? null,
    guardrails: j.guardrails ?? null,
    reusableRule: j.reusableRule ?? null,
    distinctFrom: j.distinctFrom ?? null,
  };
}

const stable = (v) => {
  if (Array.isArray(v)) return v.map(stable);
  if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).sort().map((k) => [k, stable(v[k])]));
  return v;
};
const hashOf = (j) => "sha256:" + createHash("sha256").update(JSON.stringify(stable(semanticProjection(j)))).digest("hex");

/* -------------------------------------------------------------- knowns */

const KNOWN_KINDS = new Set(["trigger", "action", "condition", "wait", "outcome", "exit", "handoff"]);

/* ---------------------------------------------------------------- emit */

const manifest = { generated: new Date().toISOString(), expected_count: 73, found_count: library.length, issues: [], journeys: [] };
if (library.length !== 73) {
  manifest.issues.push({ severity: "P0", kind: "COUNT_MISMATCH", detail: `expected 73 library journeys, found ${library.length}` });
}

const baseline = {};
for (const j of library.sort((a, b) => a.slug.localeCompare(b.slug))) {
  const unknown = [...new Set(j.nodes.map((n) => n.kind).filter((k) => !KNOWN_KINDS.has(k)))];
  if (unknown.length) {
    manifest.issues.push({ severity: "P0", kind: "UNKNOWN_NODE_TYPE", journey: j.id, detail: unknown.join(",") });
  }
  baseline[j.id] = { hash: hashOf(j), source: `src/canonical/${j.category}.ts`, schema_version: "vNext-2026-09" };
  manifest.journeys.push({
    journey_id: j.id,
    slug: j.slug,
    locales: ["tr", "en"],
    canonical_node_count: j.nodes.length,
    display_node_count_before: null,
    display_node_count_after: null,
    condition_count: j.nodes.filter((n) => n.kind === "condition").length,
    exit_count: j.nodes.filter((n) => n.kind === "exit").length,
    handoff_count: j.nodes.filter((n) => n.kind === "handoff").length,
    journey_types: classify(j),
    severity: null,
    patterns_detected: [],
    patterns_applied: [],
    status: "pending",
    change_required: null,
    validation_status: "not-run",
    blocked_reason: unknown.length ? "UNKNOWN_NODE_TYPE" : null,
    notes: [],
  });
}

fs.writeFileSync(ROOT + "audit/manifest.json", JSON.stringify(manifest, null, 2) + "\n");
fs.writeFileSync(ROOT + "audit/canonical-baseline.json", JSON.stringify(baseline, null, 2) + "\n");

const typeCounts = {};
for (const j of manifest.journeys) for (const t of j.journey_types) typeCounts[t] = (typeCounts[t] ?? 0) + 1;
console.log(`manifest: ${manifest.found_count} journeys (expected ${manifest.expected_count})`);
console.log(`issues: ${manifest.issues.length ? JSON.stringify(manifest.issues) : "none"}`);
console.log("journey types:", Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([t, c]) => `${t}:${c}`).join(" "));
