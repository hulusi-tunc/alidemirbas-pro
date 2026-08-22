/* Canonical library integrity check.  `npm run validate:canonical`

   The journeys are graphs written by hand, so the failures worth catching are
   graph failures: an edge pointing at a node that does not exist, a node
   nothing reaches, a path that runs out without ever exiting or handing off.
   None of those are visible by reading the file, and all of them are silent.

   It also enforces the parts of the schema that carry doctrine rather than
   structure - a condition with one branch, a wait missing an arm, a handoff
   into a journey that is not there - because those are exactly the shortcuts
   that look reasonable at the moment they are written.

   Errors block. Warnings are worth reading and may be deliberate. */

import { readFile } from "node:fs/promises";

const FILES = [
  "src/canonical/acquisition.ts",
  "src/canonical/activation.ts",
  "src/canonical/retention.ts",
  "src/canonical/consent.ts",
  "src/canonical/feedback.ts",
  "src/canonical/ownership.ts",
  "src/canonical/time.ts",
  "src/canonical/access.ts",
  "src/canonical/identity.ts",
  "src/canonical/structure.ts",
  "src/canonical/terminal.ts",
  "src/canonical/integration.ts",
  "src/canonical/processing.ts",
  "src/canonical/financial.ts",
  "src/canonical/fulfillment.ts",
  "src/canonical/remedy.ts",
  "src/canonical/subscription.ts",
  "src/canonical/scheduling.ts",
  "src/canonical/decision.ts",
  "src/canonical/risk.ts",
  "src/canonical/communication.ts",
  "src/canonical/document.ts",
  "src/canonical/data.ts",
  "src/canonical/control.ts",
  "src/canonical/rollout.ts",
  "src/canonical/incident.ts",
];
const errors = [];
const warnings = [];
const err = (code, where, msg) => errors.push(`[${code}] ${where}: ${msg}`);
const warn = (code, where, msg) => warnings.push(`[${code}] ${where}: ${msg}`);

/* The library is TypeScript, not JSON, so it is read the same way the archive
   validator reads its data: pull the literal out and evaluate it in isolation,
   with the type-only import stripped. No dependencies, no build step. */
async function loadJourneys() {
  const out = [];
  for (const file of FILES) {
    const src = await readFile(file, "utf8");
    const body = src
      .replace(/^import type .*?;$/gms, "")
      .replace(/:\s*readonly\s+\w+\[\]/g, "")
      .replace(/export const/g, "const");
    // Names are discovered rather than hardcoded, so a new category needs one
    // line in FILES and nothing else here.
    const names = [...body.matchAll(/^const (\w+) =/gm)].map((m) => m[1]);
    const mod = new Function(`${body}\nreturn { ${names.join(", ")} };`)();
    const journeys = names.filter((n) => n.endsWith("_JOURNEYS")).flatMap((n) => mod[n]);
    const rules = names.filter((n) => n.endsWith("_RULES")).flatMap((n) => mod[n]);
    if (!journeys.length) err("empty_file", file, "no *_JOURNEYS export found");
    out.push({ file, journeys, rules });
  }
  return out;
}

const successors = (n) => {
  switch (n.kind) {
    case "trigger":
    case "action":
    case "outcome":
      return [n.next];
    case "condition":
      return n.branches.map((b) => b.to);
    case "wait":
      return [n.onEvent, n.onTimeout];
    default:
      return []; // exit and handoff are terminal within this journey
  }
};

const loaded = await loadJourneys();
const all = loaded.flatMap((l) => l.journeys);
const ids = new Set(all.map((j) => j.id));
const seenIds = new Set();
const seenSlugs = new Set();

for (const j of all) {
  const w = j.id;

  if (seenIds.has(j.id)) err("duplicate_id", w, "two journeys share this id");
  seenIds.add(j.id);
  if (seenSlugs.has(j.slug)) err("duplicate_slug", w, `slug "${j.slug}" is used twice`);
  seenSlugs.add(j.slug);

  const nodeIds = new Set();
  for (const n of j.nodes) {
    if (nodeIds.has(n.id)) err("duplicate_node", w, `node id "${n.id}" appears twice`);
    nodeIds.add(n.id);
  }

  // every edge lands somewhere real
  for (const n of j.nodes) {
    for (const t of successors(n)) {
      if (!t) err("missing_edge", w, `node "${n.id}" (${n.kind}) has an unset successor`);
      else if (!nodeIds.has(t)) err("dangling_edge", w, `node "${n.id}" points at "${t}", which does not exist`);
    }
  }

  // exactly one trigger, and it is the entry
  const triggers = j.nodes.filter((n) => n.kind === "trigger");
  if (triggers.length !== 1) err("trigger_count", w, `expected exactly one trigger, found ${triggers.length}`);
  if (!nodeIds.has(j.entry)) err("bad_entry", w, `entry "${j.entry}" is not a node in this journey`);
  else if (triggers[0] && j.entry !== triggers[0].id)
    err("entry_not_trigger", w, `entry is "${j.entry}" but the trigger is "${triggers[0].id}"`);

  // reachability from the entry
  const reached = new Set();
  const queue = [j.entry];
  while (queue.length) {
    const id = queue.pop();
    if (!id || reached.has(id)) continue;
    reached.add(id);
    const node = j.nodes.find((n) => n.id === id);
    if (node) queue.push(...successors(node));
  }
  for (const n of j.nodes) {
    if (!reached.has(n.id)) err("unreachable", w, `node "${n.id}" cannot be reached from the entry`);
  }

  // every journey must be able to end
  const terminals = j.nodes.filter((n) => n.kind === "exit" || n.kind === "handoff");
  if (terminals.length === 0) err("no_terminal", w, "no exit and no handoff - the journey cannot end");
  if (!terminals.some((n) => reached.has(n.id)))
    err("unreachable_terminal", w, "no exit or handoff is reachable from the entry");

  for (const n of j.nodes) {
    switch (n.kind) {
      case "condition":
        if (!n.branches || n.branches.length < 2)
          err("single_branch", w, `condition "${n.id}" has fewer than two branches - a one-armed condition hides what happens to everyone who fails it`);
        for (const b of n.branches ?? []) {
          if (!b.when?.trim()) err("branch_no_test", w, `branch "${b.label}" on "${n.id}" states no condition`);
        }
        break;
      case "wait":
        if (!n.until?.length) err("wait_no_event", w, `wait "${n.id}" names no awaited event`);
        if (!n.timeout?.after?.trim()) err("wait_no_timeout", w, `wait "${n.id}" has no timeout - it can strand people forever`);
        if (!n.timeout?.reason?.trim()) warn("wait_timeout_unexplained", w, `wait "${n.id}" has a timeout with no stated reason`);
        if (n.windowExtendsOnEngagement === undefined)
          err("wait_window_policy", w, `wait "${n.id}" does not say whether engagement extends the window`);
        if (n.windowExtendsOnEngagement === true)
          warn("wait_window_extends", w, `wait "${n.id}" lets engagement extend the window - confirm the window is still bounded`);
        break;
      case "handoff":
        if (!n.to?.trim()) err("handoff_no_target", w, `handoff "${n.id}" names no target`);
        else if (!n.to.startsWith("external:") && !ids.has(n.to))
          err("handoff_unresolved", w, `handoff "${n.id}" points at "${n.to}", which is not a canonical journey`);
        else if (n.to === j.id) err("handoff_self", w, `handoff "${n.id}" points at its own journey`);
        if (!n.carries?.length) warn("handoff_no_context", w, `handoff "${n.id}" carries no context across the boundary`);
        break;
      case "trigger":
        if (!n.evidence?.requires?.length) err("trigger_no_evidence", w, `trigger "${n.id}" states no required evidence`);
        /* Inference may prioritise work; it may not conclude anything. The
           first version of this rule banned inferred triggers outright, which
           was too blunt - a risk or anomaly detector is legitimately a model,
           and opening an evaluation state is exactly the "prioritise" half of
           the doctrine. What actually has to hold is that inference never
           reaches a conclusion unexamined: from an inferred trigger, no
           handoff and no recorded outcome may be reachable without passing
           through a condition that tests the signal first. */
        if (n.evidence?.source === "inferred") {
          const seen = new Set();
          const stack = [[n.id, false]];
          while (stack.length) {
            const [id, tested] = stack.pop();
            const key = `${id}:${tested}`;
            if (seen.has(key)) continue;
            seen.add(key);
            const node = j.nodes.find((x) => x.id === id);
            if (!node) continue;
            if (!tested && (node.kind === "handoff" || node.kind === "outcome")) {
              err("inferred_unchecked", w, `inferred trigger "${n.id}" reaches ${node.kind} "${node.id}" without passing a condition - inference may prioritise work, not conclude it`);
              continue;
            }
            const nowTested = tested || node.kind === "condition";
            for (const t of successors(node)) stack.push([t, nowTested]);
          }
        }
        break;
      case "exit":
        if (!n.reEntry?.trim()) err("exit_no_reentry", w, `exit "${n.id}" does not say whether or how someone re-enters`);
        break;
    }
  }

  // doctrine that lives on the journey rather than a node
  if (!j.guardrails?.length) err("no_guardrails", w, "no guardrails recorded");
  if (!j.reusableRule?.trim()) err("no_rule", w, "no reusable rule recorded");
  if (!j.entity?.scope?.trim()) err("no_entity", w, "no entity scope recorded");
  /* Two different shapes look alike here and mean opposite things. A journey
     with no exits at all is a router: every path hands ownership somewhere
     else, which is a legitimate and deliberately narrow kind of journey. A
     journey whose exits all say terminal is claiming nobody can ever return,
     which is a much stronger statement and usually a mistake. */
  const exits = j.nodes.filter((n) => n.kind === "exit");
  if (exits.length === 0)
    warn("router_journey", w, "ends only in handoffs, never in an exit - confirm this is a pure router");
  else if (exits.every((n) => n.terminal))
    warn("all_exits_terminal", w, "every exit is terminal - confirm nobody should ever be able to return");
}

// cross-journey: what is promised to a category that does not exist yet
const externals = new Set();
for (const j of all) {
  for (const n of j.nodes) {
    if (n.kind === "handoff" && n.to.startsWith("external:")) externals.add(n.to);
  }
}

/* Consolidation redirects live in index.ts and are deliberately not journeys.
   They are read from there rather than restated, so the two cannot drift, and
   any reference still pointing at a merged id is an error rather than a
   silently resolved alias. */
const indexSrc = await readFile("src/canonical/index.ts", "utf8");
const mergedBlock = indexSrc.slice(indexSrc.indexOf("export const MERGED_INTO"));
const merged = Object.fromEntries(
  [...mergedBlock.slice(0, mergedBlock.indexOf("};")).matchAll(/"([A-Z]{3}-\d+)":\s*"([A-Z]{3}-\d+)"/g)].map(
    (m) => [m[1], m[2]],
  ),
);
for (const [dead, survivor] of Object.entries(merged)) {
  if (ids.has(dead)) err("merged_still_present", dead, `merged into ${survivor} but still defined as a journey`);
  if (!ids.has(survivor)) err("merged_target_missing", dead, `redirects to ${survivor}, which does not exist`);
}
for (const j of all) {
  for (const n of j.nodes) {
    if (n.kind === "handoff" && merged[n.to])
      err("handoff_to_merged", j.id, `node "${n.id}" hands off to merged id "${n.to}" - use ${merged[n.to]}`);
  }
  for (const d of j.distinctFrom ?? []) {
    if (merged[d.journey])
      err("distinctfrom_merged", j.id, `distinctFrom names merged id "${d.journey}" - use ${merged[d.journey]}`);
    else if (!ids.has(d.journey))
      err("distinctfrom_unknown", j.id, `distinctFrom names "${d.journey}", which is not a canonical journey`);
  }
}

/* Global rules are not journeys and are checked separately: they must not
   collide with a category rule id, and promotion is only defensible where the
   rule genuinely spans more than one category, so appliesTo is enforced. */
const globalSrc = await readFile("src/canonical/global.ts", "utf8");
const globalMod = new Function(
  `${globalSrc.replace(/^import type .*?;$/gms, "").replace(/:\s*readonly\s+[\w<>,\s{}[\]]+?\[\]/g, "").replace(/export const/g, "const")}\nreturn { GLOBAL_RULES, SEND_PATH_ORDER };`,
)();
const globalRules = globalMod.GLOBAL_RULES;
const sendPath = globalMod.SEND_PATH_ORDER;
const categoryIds = new Set(loaded.flatMap((l) => l.journeys.map((j) => j.category)));
const categoryRuleIds = new Set(loaded.flatMap((l) => l.rules.map((r) => r.id)));
const seenGlobal = new Set();
for (const g of globalRules) {
  const w = g.id;
  if (seenGlobal.has(g.id)) err("duplicate_global_rule", w, "two global rules share this id");
  seenGlobal.add(g.id);
  if (categoryRuleIds.has(g.id)) err("global_rule_id_collision", w, "a category rule already uses this id");
  if (g.scope !== "global") err("global_rule_scope", w, `scope is "${g.scope}", must be "global"`);
  if (!g.name || !g.problem || !g.rule) err("global_rule_incomplete", w, "name, problem and rule are all required");
  if (!Array.isArray(g.appliesTo) || g.appliesTo.length < 2)
    err("global_rule_scope_too_narrow", w, "appliesTo needs at least two categories - one category is a category rule");
  for (const c of g.appliesTo ?? [])
    if (!categoryIds.has(c)) err("global_rule_unknown_category", w, `appliesTo names "${c}", which is not a category`);
}

/* GLB-29 fixes an order, and an order that references a mechanism which has
   since been merged away is worse than no order at all - it reads as complete
   and silently skips a stage. Every owner has to still resolve. */
const seenStage = new Set();
sendPath.forEach((s2, i) => {
  const w = `SEND_PATH_ORDER[${i}]`;
  if (s2.step !== i + 1) err("send_path_step_gap", w, `step is ${s2.step}, expected ${i + 1}`);
  if (seenStage.has(s2.stage)) err("send_path_duplicate_stage", w, `stage "${s2.stage}" appears twice`);
  seenStage.add(s2.stage);
  if (!s2.owner?.length) err("send_path_unowned", w, `stage "${s2.stage}" names no owning rule or journey`);
  for (const o of s2.owner ?? []) {
    if (!ids.has(o) && !seenGlobal.has(o))
      err("send_path_unknown_owner", w, `stage "${s2.stage}" names "${o}", which is neither a journey nor a global rule`);
  }
});

/* A contest needs at least two sides, and the two sides have to be competing
   on the same thing. A group whose members declare different scopes never
   actually meets, which is the failure the competition rules exist to stop. */
const groups = {};
for (const j of all) {
  if (!j.competition) continue;
  const { scope, exclusionGroup, precedence, onLoss } = j.competition;
  if (!scope || !exclusionGroup || !precedence || !onLoss)
    err("competition_incomplete", j.id, "competition needs scope, exclusionGroup, precedence and onLoss");
  if (!["suppressed", "paused", "superseded", "exit"].includes(onLoss))
    err("competition_onloss", j.id, `onLoss "${onLoss}" is not a defined losing state`);
  (groups[exclusionGroup] ??= []).push({ id: j.id, scope });
}
for (const [g, members] of Object.entries(groups)) {
  if (members.length < 2)
    err("competition_group_of_one", g, `only ${members[0].id} declares this group - a contest needs another side`);
  const scopes = [...new Set(members.map((m) => m.scope))];
  if (scopes.length > 1)
    err(
      "competition_scope_split",
      g,
      `members declare different scopes (${scopes.join(", ")}) and so never actually compete`,
    );
}

const line = (s) => console.log("  " + s);
if (errors.length) {
  console.log(`\nERRORS (${errors.length})`);
  errors.forEach(line);
}
if (warnings.length) {
  console.log(`\nWARNINGS (${warnings.length})`);
  warnings.forEach(line);
}
if (externals.size) {
  console.log(`\nPENDING EXTERNAL TARGETS (${externals.size}) - a later category has to define these`);
  [...externals].sort().forEach(line);
}

const nodeCount = all.reduce((n, j) => n + j.nodes.length, 0);
const ruleCount = loaded.reduce((n, l) => n + l.rules.length, 0);
console.log(
  `\n${all.length} canonical journeys · ${nodeCount} nodes · ${ruleCount} orchestration rules · ` +
    `${globalRules.length} global rules · ${Object.keys(groups).length} competition groups · ${sendPath.length} send-path stages · ` +
    `${Object.keys(merged).length} merged redirects (not counted) · ${errors.length} errors · ${warnings.length} warnings`,
);
process.exit(errors.length ? 1 : 0);
