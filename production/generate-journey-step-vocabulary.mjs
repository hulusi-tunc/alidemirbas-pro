#!/usr/bin/env node
// Journey Step Vocabulary & Design Component Inventory generator.
// Runnable directly: `node production/generate-journey-step-vocabulary.mjs`.
// Same self-contained execution pattern as
// generate-journey-filter-taxonomy.mjs (temp-copy src/canonical/ with
// import extensions patched, execute, delete the copy) - src/canonical/
// itself is read-only throughout, never written to.
import { readdirSync, readFileSync, writeFileSync, mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const repoRoot = new URL("../", import.meta.url).pathname;
const canonicalDir = join(repoRoot, "src/canonical");
const tmp = mkdtempSync(join(tmpdir(), "canonical-run-"));
for (const f of readdirSync(canonicalDir).filter((f) => f.endsWith(".ts"))) {
  const src = readFileSync(join(canonicalDir, f), "utf8");
  writeFileSync(join(tmp, f), src.replace(/from "(\.\/[A-Za-z0-9_-]+)"/g, 'from "$1.ts"'));
}
let mod;
try {
  mod = await import(join(tmp, "index.ts"));
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

const journeys = mod.CATEGORIES.flatMap((c) => c.journeys.map((j) => ({ ...j, categoryId: c.id })));

// load the prior audit's goal classification to cross-reference (read-only)
let goalBySlug = new Map();
try {
  const filterClassification = JSON.parse(readFileSync(join(repoRoot, "production/journey-filter-classification.json"), "utf8"));
  goalBySlug = new Map(filterClassification.journeys.map((j) => [j.id, j.goal]));
} catch { /* optional cross-reference */ }

// ---------------------------------------------------------------------
// LEVEL 1: structural node types - counted directly from the schema-typed
// `kind` discriminant actually used in the data, not hardcoded.
const allNodes = [];
for (const j of journeys) {
  for (const n of j.nodes) allNodes.push({ ...n, journeyId: j.id, category: j.categoryId, goal: goalBySlug.get(j.id) || null });
}
const kindCounts = {};
const kindJourneys = {};
for (const n of allNodes) {
  kindCounts[n.kind] = (kindCounts[n.kind] || 0) + 1;
  kindJourneys[n.kind] = kindJourneys[n.kind] || new Set();
  kindJourneys[n.kind].add(n.journeyId);
}
const totalEdges =
  allNodes.filter((n) => n.kind === "trigger" || n.kind === "action" || n.kind === "outcome").length +
  allNodes.filter((n) => n.kind === "condition").reduce((s, n) => s + n.branches.length, 0) +
  allNodes.filter((n) => n.kind === "wait").length * 2 +
  allNodes.filter((n) => n.kind === "handoff").length;

// ---------------------------------------------------------------------
// LEVEL 2 families per structural type. Each rule set was derived from a
// full-corpus frequency pass (see journey-step-taxonomy-audit doc /
// chat report for the methodology), not invented up front.

// ACTION: leading imperative verb, since every `does` sentence in this
// corpus is written that way by convention.
const ACTION_FAMILIES = [
  ["record-create", /^(record|create|mark|update|persist|capture|log|inventory|raise)\b/i],
  ["determine-classify", /^(determine|identify|classify|evaluate|compare|diagnose)\b/i],
  ["verify-validate", /^(verify|validate|revalidate|confirm)\b/i],
  ["apply-establish", /^(apply|establish|define)\b/i],
  ["preserve-hold", /^(preserve|hold|retain|leave)\b/i],
  ["suppress-block", /^(suppress|block|reject|invalidate)\b/i],
  ["stop-close-release", /^(stop|close|release)\b/i],
  ["reconcile-resolve", /^(recalculate|reconcile|resolve|re-?evaluate|re-?open)\b/i],
  ["collect-request", /^(collect|request|read)\b/i],
  ["retry-execute", /^(retry|execute)\b/i],
  ["send-external", /^send\b/i],
];
function classifyAction(does) {
  const matches = ACTION_FAMILIES.filter(([, re]) => re.test(does));
  if (matches.length === 0) return { family: "generic-uncovered", confidence: "n/a-generic-fallback", matchCount: 0 };
  if (matches.length === 1) return { family: matches[0][0], confidence: "high", matchCount: 1 };
  return { family: matches[0][0], confidence: "medium-multi-match", matchCount: matches.length, allMatches: matches.map((m) => m[0]) };
}

// CONDITION: primary subtype is branch cardinality (structural, not
// keyword-based - a 2-branch decision and a 5-branch one are different
// visual shapes regardless of topic). Secondary/optional topic tag is
// informational only, coverage is deliberately reported as partial.
const CONDITION_TOPIC_TAGS = [
  ["identity-verification", /identit|verif|authenticat/i],
  ["eligibility-authorization", /eligib|qualif|entitled|permitted|authoris|authoriz|allowed/i],
  ["existence-duplicate", /duplicate|conflict|already|existing|outstanding|is there|does .* exist/i],
  ["state-status", /\b(state|status|active|valid|current|open|closed|complete)\b/i],
  ["timing-deadline", /expir|deadline|window|overdue|elapsed/i],
  ["comparison-threshold", /threshold|exceed|below|above|greater|fewer|within|limit|cap\b/i],
  ["ownership-authority", /\bown|authority|responsib/i],
];
function classifyCondition(n) {
  const cardinality = n.branches.length === 2 ? "binary" : "multi-way";
  const tagMatch = CONDITION_TOPIC_TAGS.find(([, re]) => re.test(n.asks));
  return { cardinality, branchCount: n.branches.length, topicTag: tagMatch ? tagMatch[0] : null };
}

// TRIGGER: the evidence.source field is the design-relevant subtype -
// not the event name, which is Level 3 instance vocabulary (255 mostly
// unique names, no clean clustering, and it's literally what the
// business event is called, not a design-relevant grouping).
function classifyTrigger(n) {
  return { subtype: n.evidence.source };
}

// WAIT: tested windowExtendsOnEngagement and the until/timeout text for
// a real subtype split - windowExtendsOnEngagement is false on all 164
// (zero variance), and until/timeout text is bespoke prose with no
// clean pattern. No subtype is recommended; every wait is one component.
function classifyWait() {
  return { subtype: "single-component-no-subtype-evidenced" };
}

// HANDOFF: internal (resolves to a real canonical journey) vs external
// (an `external:` destination not yet modeled) - a clean, structural,
// schema-derivable split already partially reflected in the current
// renderer's edge.kind distinction.
function classifyHandoff(n) {
  return { subtype: n.to.startsWith("external:") ? "external" : "internal" };
}

// EXIT: terminal:true is real but rare (1.2%) - kept as a badge, not a
// subtype system. Reason-text clustering was tested and covers only
// ~33% of exits cleanly; reported as low-confidence/optional, not a
// required subtype (see the audit doc for the coverage test).
const EXIT_REASON_TAGS = [
  ["completed-satisfied", /completed?|satisfied|fulfilled|delivered|resolved|closed successfully|\bsuccess/i],
  ["ineligible-declined", /ineligible|not eligible|declined|denied|disqualified/i],
  ["failed-unresolved", /failed|failure|unresolved|could not|unable/i],
  ["expired-stale", /expired|stale|lapsed|timed? out/i],
  ["cancelled-withdrawn", /cancell?ed|withdrawn|revoked|terminated/i],
  ["suppressed-blocked", /suppress|blocked|held|on hold/i],
  ["folded-merged", /folded|merged|already (outstanding|handled)|absorbed/i],
  ["no-action", /no (action|communication|change)|not (applicable|required|needed)|stands on its own/i],
];
function classifyExit(n) {
  const tagMatch = EXIT_REASON_TAGS.find(([, re]) => re.test(n.state));
  return { terminal: n.terminal, reasonTag: tagMatch ? tagMatch[0] : null };
}

// ---------------------------------------------------------------------
// Build per-node classification + aggregate frequency tables
const classification = [];
const actionFamilyCounts = {}, actionFamilyCats = {}, actionFamilyGoals = {};
const conditionCardinality = { binary: 0, "multi-way": 0 };
const conditionTagCounts = {};
const triggerSourceCounts = {};
const handoffSubtypeCounts = {};
const exitReasonCounts = {}; let exitTerminalCount = 0;

for (const n of allNodes) {
  const rec = { journeyId: n.journeyId, nodeId: n.id, category: n.category, goal: n.goal, structuralType: n.kind };
  if (n.kind === "action") {
    const c = classifyAction(n.does);
    rec.subtype = c.family; rec.confidence = c.confidence;
    actionFamilyCounts[c.family] = (actionFamilyCounts[c.family] || 0) + 1;
    actionFamilyCats[c.family] = actionFamilyCats[c.family] || new Set(); actionFamilyCats[c.family].add(n.category);
    if (n.goal) { actionFamilyGoals[c.family] = actionFamilyGoals[c.family] || new Set(); actionFamilyGoals[c.family].add(n.goal); }
  } else if (n.kind === "condition") {
    const c = classifyCondition(n);
    rec.subtype = c.cardinality; rec.branchCount = c.branchCount; rec.topicTag = c.topicTag; rec.confidence = "high-cardinality/optional-topic";
    conditionCardinality[c.cardinality]++;
    if (c.topicTag) conditionTagCounts[c.topicTag] = (conditionTagCounts[c.topicTag] || 0) + 1;
  } else if (n.kind === "trigger") {
    const c = classifyTrigger(n);
    rec.subtype = c.subtype; rec.confidence = "high";
    triggerSourceCounts[c.subtype] = (triggerSourceCounts[c.subtype] || 0) + 1;
  } else if (n.kind === "wait") {
    rec.subtype = "single-component"; rec.confidence = "high-no-subtype";
  } else if (n.kind === "handoff") {
    const c = classifyHandoff(n);
    rec.subtype = c.subtype; rec.confidence = "high";
    handoffSubtypeCounts[c.subtype] = (handoffSubtypeCounts[c.subtype] || 0) + 1;
  } else if (n.kind === "exit") {
    const c = classifyExit(n);
    rec.subtype = c.terminal ? "terminal" : "non-terminal"; rec.reasonTag = c.reasonTag; rec.confidence = "high-terminal-flag/low-reason-tag";
    if (c.terminal) exitTerminalCount++;
    if (c.reasonTag) exitReasonCounts[c.reasonTag] = (exitReasonCounts[c.reasonTag] || 0) + 1;
  } else if (n.kind === "outcome") {
    rec.subtype = "single-instance-rare"; rec.confidence = "n/a-1-occurrence";
  }
  classification.push(rec);
}

// review-required: action nodes with 0 family match (generic-uncovered)
// and multi-match overlaps - reported honestly as "no strong secondary
// signal" (a confident answer: use the generic Action treatment), kept
// separate from genuine multi-family overlaps (a real judgment call).
const reviewRequired = classification.filter((r) => r.confidence === "medium-multi-match")
  .map((r) => ({ ...r, reason: "action label matches more than one verb family" }));

// ---------------------------------------------------------------------
// Write artifacts
const vocabulary = {
  _description: "Journey Step Vocabulary - Level 1 (structural) and Level 2 (semantic/design subtype) inventory, derived from the full 255-journey / 3186-node canonical corpus. src/canonical/ was never modified. Regenerate: node production/generate-journey-step-vocabulary.mjs",
  corpus: { journeys: journeys.length, nodes: allNodes.length, edges: totalEdges },
  structuralTypes: Object.entries(kindCounts).map(([kind, count]) => ({
    kind, occurrences: count, journeys: kindJourneys[kind].size,
    corpusCoveragePct: Math.round(1000 * kindJourneys[kind].size / journeys.length) / 10,
  })),
  levelTwoSubtypes: {
    action: {
      designSignal: "leading imperative verb, clustered into 11 families",
      coveragePct: Math.round(1000 * (kindCounts.action - (actionFamilyCounts["generic-uncovered"] || 0)) / kindCounts.action) / 10,
      families: Object.entries(actionFamilyCounts).sort((a, b) => b[1] - a[1]).map(([id, count]) => ({
        id, occurrences: count,
        categorySpread: [...(actionFamilyCats[id] || [])].length,
        goalSpread: [...(actionFamilyGoals[id] || [])].length,
      })),
    },
    condition: {
      designSignal: "PRIMARY: branch cardinality (structural). SECONDARY/optional: business-topic tag (partial coverage, informational only).",
      cardinality: conditionCardinality,
      topicTags: Object.entries(conditionTagCounts).sort((a, b) => b[1] - a[1]).map(([id, count]) => ({ id, count })),
      topicTagCoveragePct: Math.round(1000 * Object.values(conditionTagCounts).reduce((a, b) => a + b, 0) / kindCounts.condition) / 10,
    },
    trigger: {
      designSignal: "evidence.source (existing schema field) - not the event name, which is Level 3",
      sources: triggerSourceCounts,
    },
    wait: { designSignal: "none evidenced - windowExtendsOnEngagement is false on all 164, until/timeout text is bespoke prose. Single component." },
    handoff: {
      designSignal: "internal (resolves to a real canonical journey) vs external (`external:` prefix)",
      subtypes: handoffSubtypeCounts,
    },
    exit: {
      designSignal: "terminal flag (rare, badge-level) is high-confidence. Reason-text families are LOW confidence (partial coverage, see reasonTagCoveragePct) - not recommended as a required subtype system.",
      terminalCount: exitTerminalCount, terminalPct: Math.round(1000 * exitTerminalCount / kindCounts.exit) / 10,
      reasonTags: Object.entries(exitReasonCounts).sort((a, b) => b[1] - a[1]).map(([id, count]) => ({ id, count })),
      reasonTagCoveragePct: Math.round(1000 * Object.values(exitReasonCounts).reduce((a, b) => a + b, 0) / kindCounts.exit) / 10,
    },
    outcome: { designSignal: "1 occurrence in the entire corpus (0.03% of nodes) - too rare for a dedicated component; recommend generic fallback treatment." },
  },
};
writeFileSync(join(repoRoot, "production/journey-step-vocabulary.json"), JSON.stringify(vocabulary, null, 2) + "\n");

writeFileSync(join(repoRoot, "production/journey-step-frequency.json"), JSON.stringify({
  _description: "Occurrence / journey / category / goal distributions per structural type and Level 2 subtype.",
  structuralTypes: vocabulary.structuralTypes,
  actionFamilies: vocabulary.levelTwoSubtypes.action.families,
  conditionCardinality: vocabulary.levelTwoSubtypes.condition.cardinality,
  conditionTopicTags: vocabulary.levelTwoSubtypes.condition.topicTags,
  triggerSources: vocabulary.levelTwoSubtypes.trigger.sources,
  handoffSubtypes: vocabulary.levelTwoSubtypes.handoff.subtypes,
  exitReasonTags: vocabulary.levelTwoSubtypes.exit.reasonTags,
}, null, 2) + "\n");

// aliases: raw-pattern -> normalized subtype, for the families that were
// keyword-derived (action, condition topic, exit reason)
const aliases = {
  _description: "Raw pattern -> normalized design subtype, for keyword-derived families. Canonical labels were never rewritten - this is an audit-layer mapping only.",
  action: ACTION_FAMILIES.map(([id, re]) => ({ canonicalDesignSubtype: id, pattern: re.source, representativeLabels: classification.filter((r) => r.structuralType === "action" && r.subtype === id).slice(0, 3).map((r) => r.nodeId) })),
  conditionTopicTags: CONDITION_TOPIC_TAGS.map(([id, re]) => ({ canonicalDesignSubtype: id, pattern: re.source })),
  exitReasonTags: EXIT_REASON_TAGS.map(([id, re]) => ({ canonicalDesignSubtype: id, pattern: re.source })),
};
writeFileSync(join(repoRoot, "production/journey-step-aliases.json"), JSON.stringify(aliases, null, 2) + "\n");

writeFileSync(join(repoRoot, "production/journey-step-review-required.json"), JSON.stringify({
  _description: "Nodes where automated classification found genuine ambiguity (matched more than one Level 2 family) - a real judgment call, not just an uncovered/generic case. classificationReviewRequired: true on every record.",
  count: reviewRequired.length,
  nodes: reviewRequired.map((r) => ({ ...r, classificationReviewRequired: true })),
}, null, 2) + "\n");

// ---------------------------------------------------------------------
// Validation
const errors = [], warnings = [];
if (journeys.length !== 255) errors.push(`Expected 255 journeys, found ${journeys.length}`);
if (allNodes.length !== classification.length) errors.push(`Node count (${allNodes.length}) doesn't match classified count (${classification.length})`);
const knownKinds = new Set(["trigger", "action", "condition", "wait", "outcome", "exit", "handoff"]);
for (const n of allNodes) if (!knownKinds.has(n.kind)) errors.push(`Unknown structural type "${n.kind}" on ${n.journeyId}/${n.id}`);
const sumStructural = Object.values(kindCounts).reduce((a, b) => a + b, 0);
if (sumStructural !== allNodes.length) errors.push("Structural type counts don't sum to total node count");
if (reviewRequired.length / allNodes.length > 0.1) warnings.push(`${reviewRequired.length} review-required nodes (${Math.round(100 * reviewRequired.length / allNodes.length)}%) - re-check the action family ruleset`);
const uncovered = actionFamilyCounts["generic-uncovered"] || 0;
if (uncovered > 0) warnings.push(`${uncovered} action nodes (${Math.round(1000 * uncovered / kindCounts.action) / 10}%) matched no verb family - generic Action treatment applies, not an error`);

const validationReport = {
  counts: {
    totalJourneys: journeys.length, totalNodes: allNodes.length, totalEdges,
    structuralTypesFound: Object.keys(kindCounts).length,
    actionFamilies: vocabulary.levelTwoSubtypes.action.families.length,
    reviewRequired: reviewRequired.length,
  },
  errors, warnings,
  status: errors.length === 0 ? "PASS" : "FAIL",
};
writeFileSync(join(repoRoot, "production/journey-step-validation-report.json"), JSON.stringify(validationReport, null, 2) + "\n");

console.log(JSON.stringify(validationReport.counts, null, 2));
console.log(`Errors: ${errors.length} | Warnings: ${warnings.length}`);
if (errors.length) { console.log("ERRORS:"); errors.forEach((e) => console.log("  - " + e)); }
if (warnings.length) { console.log("WARNINGS:"); warnings.forEach((w) => console.log("  - " + w)); }
process.exit(errors.length ? 1 : 0);
