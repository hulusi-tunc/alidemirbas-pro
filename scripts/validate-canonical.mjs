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
const seenShortNames = new Set();

for (const j of all) {
  const w = j.id;

  if (seenIds.has(j.id)) err("duplicate_id", w, "two journeys share this id");
  seenIds.add(j.id);
  if (seenSlugs.has(j.slug)) err("duplicate_slug", w, `slug "${j.slug}" is used twice`);
  seenSlugs.add(j.slug);

  /* shortName is optional - only the 87 communication journeys carry one so
     far - but where it exists it is what a card and a page title show, so
     two journeys answering to the same label is a real collision, not a
     cosmetic one. Caught once already: "Delivery Status Tracking" (CMS-206,
     a message send attempt) against "Delivery Tracking" (FUL-265, an actual
     parcel) - the exact two facts CMS-206's own reusable rule exists to keep
     apart. */
  if (!j.shortName || !String(j.shortName).trim()) {
    err("shortname_missing", w, "no shortName - every journey needs a plain-language label, it is what cards and page titles show");
  } else {
    if (seenShortNames.has(j.shortName))
      err("duplicate_shortname", w, `shortName "${j.shortName}" is already used by another journey`);
    else seenShortNames.add(j.shortName);
  }

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
        {
          const a = n.timeout?.after;
          const has = typeof a === "string" ? a.trim().length > 0 : !!(a && typeof a === "object" && a.key && a.rule);
          if (!has) err("wait_no_timeout", w, `wait "${n.id}" has no timeout - it can strand people forever`);
        }
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
  // vNext journeys carry their contest inside `contact`; the group check is the same
  const comp = j.contact && j.contact.competition && j.contact.competition !== "none" ? j.contact.competition : j.competition;
  if (!comp) continue;
  const { scope, exclusionGroup, precedence, onLoss } = comp;
  if (!scope || !exclusionGroup || !precedence || !onLoss)
    err("competition_incomplete", j.id, "competition needs scope, exclusionGroup, precedence and onLoss");
  if (!["suppressed", "paused", "superseded", "exit"].includes(onLoss))
    err("competition_onloss", j.id, `onLoss "${onLoss}" is not a defined losing state`);
  (groups[exclusionGroup] ??= []).push({ id: j.id, scope, precedence });
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

/* channels must be USED, not merely plausible.

   `channels` names the execution channels a journey actually runs on, which
   is only true if some Action node in it does the corresponding work: a
   message surface needs an action marked `execution: "communication"`, a
   human route needs one marked `execution: "human"`. Without this check the
   field quietly drifts back into "channels that would suit this journey",
   which is a different claim and an unfalsifiable one.

   A handoff is deliberately not enough. Handing off to another journey - or
   to `external:human-in-the-loop-lifecycle` - is this journey saying the
   work belongs elsewhere, so the channel belongs to whatever picks it up. */
const MESSAGE_CHANNELS = new Set(["email", "push", "sms", "in-app", "whatsapp"]);
const HUMAN_CHANNELS = new Set(["sales", "task"]);
for (const j of all) {
  const declared = j.channels ?? [];
  const actions = j.nodes.filter((n) => n.kind === "action");
  const hasComm = actions.some((n) => n.execution === "communication");
  const hasHuman = actions.some((n) => n.execution === "human");

  const orphanMessage = declared.filter((c) => MESSAGE_CHANNELS.has(c));
  if (orphanMessage.length && !hasComm)
    err(
      "channel_without_communication",
      j.id,
      `declares ${orphanMessage.join(", ")} but no action is marked execution: "communication" - the journey does not itself send`,
    );

  const orphanHuman = declared.filter((c) => HUMAN_CHANNELS.has(c));
  if (orphanHuman.length && !hasHuman)
    err(
      "channel_without_human_action",
      j.id,
      `declares ${orphanHuman.join(", ")} but no action is marked execution: "human" - a handoff is not the journey doing the work`,
    );

  if (hasComm && !orphanMessage.length)
    err(
      "communication_without_channel",
      j.id,
      `has a communication action but declares no message channel - what does it send on?`,
    );

  if (hasHuman && !orphanHuman.length)
    err(
      "human_action_without_channel",
      j.id,
      `has a human action but declares neither sales nor task - who picks it up?`,
    );
}

/* vNext rules (scripts/vnext-rules.mjs). Errors for journeys that declare
   `measurement`, warnings for the un-migrated rest, so the migration backlog
   is visible without blocking the build. */
import { checkVnext } from "./vnext-rules.mjs";
const eventsSrc = await readFile("src/canonical/events.ts", "utf8");
const registry = [...eventsSrc.matchAll(/\{ id: "([^"]+)", meaning: "((?:[^"\\]|\\.)*)", source: "([^"]+)"/g)].map((m) => ({ id: m[1], meaning: m[2], source: m[3] }));
const surfaceSrc = await readFile("src/canonical/surface.ts", "utf8");
const pickList = (name) => new Set([...surfaceSrc.match(new RegExp(`export const ${name}[^=]*=\\s*\\[([\\s\\S]*?)\\];`))[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]));
const customerEntity = new RegExp(surfaceSrc.match(/CUSTOMER_ENTITY = \/(.*)\/i;/)[1], "i");
let surfaceFile = null;
try { surfaceFile = JSON.parse(await readFile("production/surface-assignment.json", "utf8")); } catch { warn("surface_file_missing", "corpus", "production/surface-assignment.json not found - run scripts/surface-assignment.mjs"); }
const mechanismIds = pickList("MECHANISM_IDS");
const vnextStats = checkVnext({ all, registry, surfaceFile, mechanismIds, customerCategories: pickList("CUSTOMER_CATEGORIES"), customerEntity, err, warn });

/* A precedence string exists to separate two contenders. If the exact same
   precedence text appears twice within one live group, the ordering does not
   actually distinguish them - most likely a copy-paste, not a genuine
   declared tie (compare FBK-41/FBK-42, whose real tie is resolved by each
   naming the OTHER by id, in different text, not by sharing one string).
   Warn rather than error: a near-identical precedence pair is architecture
   judgment about whether it's actually ambiguous, not a mechanical proof. */
for (const [g, members] of Object.entries(groups)) {
  const byPrecedence = {};
  for (const m of members) (byPrecedence[m.precedence] ??= []).push(m.id);
  for (const mids of Object.values(byPrecedence)) {
    if (mids.length > 1)
      warn("competition_duplicate_precedence", g, `${mids.join(", ")} declare the exact same precedence text - an ordering that does not actually distinguish them`);
  }
}

/* Every exclusion group with a real contest (2+ members) needs a runtime
   component that actually reads competition/exclusionGroup/precedence and
   establishes one owner - GLB-01..GLB-10 declared as policy is not the same
   as GLB-01..GLB-10 enforced. OPS-131 (surface.ts's own
   COMPETITION_ARBITRATION_MECHANISM_ID) is that component, added in the
   competition-arbitration repair round; this check exists so a future edit
   that removes it without a replacement is caught immediately rather than
   silently reopening the architectural P0 this round closed. */
if (Object.keys(groups).length > 0) {
  const arbiterId = surfaceSrc.match(/COMPETITION_ARBITRATION_MECHANISM_ID = "([^"]+)"/)?.[1];
  if (!arbiterId) err("competition_runtime_unenforced", "corpus", "structured competition groups exist but no COMPETITION_ARBITRATION_MECHANISM_ID is declared in surface.ts");
  else if (!mechanismIds.has(arbiterId)) err("competition_runtime_unenforced", "corpus", `COMPETITION_ARBITRATION_MECHANISM_ID "${arbiterId}" is declared but is not itself in MECHANISM_IDS`);
  else if (!ids.has(arbiterId)) err("competition_runtime_unenforced", "corpus", `COMPETITION_ARBITRATION_MECHANISM_ID "${arbiterId}" does not correspond to any canonical journey`);
}

/* Operational Workflow gap-closure round: which journeys are on the
   operational surface, computed the same way surface.ts's own surfaceOf()
   derives it (mechanism, then sends, then customer-category+customer-entity,
   then operational by elimination) - inlined here rather than imported
   because this whole script parses src/canonical/*.ts as text and evals it,
   never importing TypeScript directly. */
const customerCategoriesSet = pickList("CUSTOMER_CATEGORIES");
function operationalSurfaceOf(j) {
  if (mechanismIds.has(j.id)) return false;
  const sends = (j.channels ?? []).some((c) => MESSAGE_CHANNELS.has(c));
  if (sends) return false;
  if (customerCategoriesSet.has(j.category) && customerEntity.test(j.entity?.scope ?? "")) return false;
  return true;
}
const operationalIds = new Set(all.filter(operationalSurfaceOf).map((j) => j.id));

/* durable_work_without_idempotency: an Operational Workflow action that
   durably records consequential state (writes append) and can plausibly be
   replayed (reached from a trigger, an authoritative event, or a handoff -
   all of which a company's own infrastructure can redeliver) declares no
   idempotencyKey. Mirrors the customer-facing/mechanism rounds' own
   state_write_without_idempotency check, scoped to the operational surface
   instead. Warn, not error: unlike the 25 Runtime Mechanisms (closed, every
   instance fixed before the check was widened to error there), the 124
   Operational Workflows predate the entity.instanceKey/idempotencyKey
   convention almost entirely - this round fixed the 11 P0-adjacent
   instances, not all ~40 the audit found. Widening to error is future work
   once the corpus is actually ready for it, the same phased approach the
   Runtime Mechanism round itself used. */
for (const j of all) {
  if (!operationalIds.has(j.id)) continue;
  for (const n of j.nodes) {
    if (n.kind !== "action") continue;
    const appends = (n.writes ?? []).filter((w) => w.mode === "append");
    if (appends.length && !n.idempotencyKey) {
      warn("durable_work_without_idempotency", j.id, `action "${n.id}" appends to ${appends.map((w) => w.field).join(", ")} and declares no idempotencyKey - a replayed trigger, event or handoff can duplicate the write`);
    }
  }
}

/* workflow_result_unconsumed: an Operational Workflow with zero corpus-wide
   handoff consumers AND zero outbound handoffs of its own is fully isolated
   - the exact shape this round's audit confirmed for its two genuine
   orphan-candidates (REL-99, INT-120), as distinct from the ~35 correctly
   event-driven workflows (zero inbound consumers but at least one real
   outbound handoff, so the work they do reaches somewhere). Deliberately
   narrow to avoid false-positiving on event-driven entry points, per the
   round's own "zero consumers does not automatically mean orphaned"
   instruction - this is a warning/review signal, not a claim of deletion. */
const handoffTargets = new Map(); // targetId -> [senderIds]
for (const j of all) for (const n of j.nodes) if (n.kind === "handoff" && ids.has(n.to)) (handoffTargets.get(n.to) ?? handoffTargets.set(n.to, []).get(n.to)).push(j.id);
for (const j of all) {
  if (!operationalIds.has(j.id)) continue;
  const hasInbound = handoffTargets.has(j.id) && handoffTargets.get(j.id).length > 0;
  const hasOutbound = j.nodes.some((n) => n.kind === "handoff");
  if (!hasInbound && !hasOutbound) {
    warn("workflow_result_unconsumed", j.id, "zero corpus-wide handoff consumers and zero outbound handoffs of its own - fully isolated; confirm this is a legitimate event-driven entry point with no downstream result to propagate, or a genuine orphan candidate (see CONSUMER-COVERAGE.md)");
  }
}

/* Cross-Library Integration repair round: byId, for the two checks below and
   for anything else that needs to look up a journey by its own id rather
   than scan `all` repeatedly. */
const byId = new Map(all.map((j) => [j.id, j]));

/* competition_member_unenforced (+ the competing_member_no_live_state_check
   candidate from VALIDATOR-OPPORTUNITIES.md, merged into this one rather
   than built as a second validator detecting the same root issue, per that
   document's own instruction): a declared competition member's consequential
   `execution: "human"` action - the shape not generically covered by
   CMS-205's own send-path revalidation, added this round for every
   `execution: "communication"` action corpus-wide - has no node anywhere in
   its own graph whose text shows a live re-check of current competition/
   ownership state before that action fires. `execution: "communication"`
   actions are deliberately not flagged here: re-litigating CMS-205's own
   architectural fix one journey at a time would be exactly the caller-side
   duplication the repair round's own brief said not to do.

   WARN, not ERROR: recognising a real structural check from a node's own
   `does`/`asks`/branch `when` text is judgment, not mechanical certainty -
   several genuinely protected members phrase their check differently from
   each other (`ACC-78`'s "currently open", `ACQ-04`'s "already reached the
   destination"), and a future member may phrase it differently again without
   being unprotected. The two confirmed-unsafe instances this round found
   (`account-restriction-authority`, `retention-outreach`) were repaired
   directly in source, not left for this validator to catch after the fact -
   this validator exists to catch regressions and new competition members
   that skip the pattern going forward. */
const ENFORCEMENT_MARKERS = [
  /\b(current(ly)?|live|still)\b[^.]{0,80}\b(own|claim|contend|precedence|open|holds?)\b/i,
  /\balready (reached|resolved|won|claimed|decided)\b/i,
  /\bre-?(read|check)\b[^.]{0,80}\b(current|live)\b/i,
  /\bnow\b[^.]{0,60}\b(in motion|open|active|claims?)\b/i,
  /\bOPS-131\b/,
];
// Opening the tracked instance or recording a bare no-action/decline outcome is
// bookkeeping, not itself the consequential external effect a stale-loser race
// could fire - excluded by id so the check targets the actual send/release/apply
// action, not every write-bearing node on the path to it.
const NON_CONSEQUENTIAL_ACTION_ID = /^a\.(record|open)\b/i;
for (const [g, members] of Object.entries(groups)) {
  for (const m of members) {
    const j = byId.get(m.id);
    if (!j) continue;
    if (!j.nodes.some((n) => n.kind === "wait")) continue; // no async gap for ownership to go stale across
    // Consequential = writes durable state and is not itself an execution:"communication"
    // action (those are covered generically by CMS-205's own re-check, added this round).
    const consequential = j.nodes.filter(
      (n) => n.kind === "action" && n.execution !== "communication" && (n.writes ?? []).length > 0 && !NON_CONSEQUENTIAL_ACTION_ID.test(n.id),
    );
    if (!consequential.length) continue;
    const hasMarker = j.nodes.some((n) => {
      const text = [n.does, n.asks, ...(n.branches ?? []).map((b) => b.when)].filter(Boolean).join(" ");
      return ENFORCEMENT_MARKERS.some((re) => re.test(text));
    });
    if (!hasMarker) {
      warn("competition_member_unenforced", m.id, `declares competition group "${g}" and has a consequential action reachable after a wait (${consequential.map((n) => n.id).join(", ")}), but no node re-checks current competition/ownership state before it fires`);
    }
  }
}

/* runtime_arbiter_result_unconsumed: a Runtime Mechanism exit whose own
   `reEntry` text explicitly states a propagation intent (the outcome is
   supposed to be visible to, or acted on by, something else) has zero
   outbound handoffs anywhere in the same journey. This is a narrower,
   intent-scoped sibling of `workflow_result_unconsumed` (Operational
   Workflow round): that one flags a fully isolated workflow; this one
   flags a specific declared-important outcome with no consumer even when
   the mechanism as a whole has other traffic (in-degree, other exits) -
   exactly the shape `OPS-130`'s pre-repair `RECONCILIATION_REQUIRED` had
   (in-degree 2, zero outbound handoffs anywhere in the journey).

   ERROR: unlike the WARN-tier checks above, a Runtime Mechanism whose own
   text says an outcome must reach something else and structurally cannot
   is the exact "business result lost across layers" shape the governing
   brief rates P0 - this is not a judgment call the way recognising an
   enforcement check's phrasing is. Deliberately narrow to avoid flagging a
   legitimate synchronous return value: only exits whose own text uses an
   explicit propagation-intent phrase are considered, and only where the
   whole journey has no outbound handoff at all (a journey with any
   outbound handoff is presumed to have a real route for its results, even
   if not from this exact exit - refining that distinction further is a
   possible future tightening, not required to make this check safe today). */
const PROPAGATION_INTENT = /\bso (that|it)\b[^.]{0,120}\b(visible|acted on|resolved|reaches|notice)\b/i;
for (const j of all) {
  if (!mechanismIds.has(j.id)) continue;
  const hasOutboundHandoff = j.nodes.some((n) => n.kind === "handoff");
  if (hasOutboundHandoff) continue;
  for (const n of j.nodes) {
    if (n.kind !== "exit" || !n.reEntry) continue;
    if (PROPAGATION_INTENT.test(n.reEntry)) {
      err("runtime_arbiter_result_unconsumed", j.id, `exit "${n.id}" states a propagation intent in its own reEntry text ("${n.reEntry.slice(0, 100)}...") but this journey has zero outbound handoffs anywhere - the outcome cannot structurally reach whatever it says needs to see it`);
    }
  }
}

/* Warnings on a vNext journey are not free: each one is either fixed or
   reviewed by a person and recorded in production/vnext-warning-reviews.json
   with a note. The summary counts the unreviewed ones; the migration is not
   complete while that number is above zero. */
let reviews = [];
try { reviews = JSON.parse(await readFile("production/vnext-warning-reviews.json", "utf8")).reviews ?? []; } catch { /* none yet */ }
const vnextIds = new Set(all.filter((j) => j.measurement).map((j) => j.id));
const isReviewed = (w) => { const m = w.match(/^\[([^\]]+)\] ([A-Z]{3}-\d+): (.*)$/); if (!m) return true; return reviews.some((r) => r.id === m[2] && r.code === m[1] && (!r.match || m[3].includes(r.match))); };
const vnextWarnings = warnings.filter((w) => { const m = w.match(/^\[[^\]]+\] ([A-Z]{3}-\d+):/); return m && vnextIds.has(m[1]); });
const unreviewed = vnextWarnings.filter((w) => !isReviewed(w));

const line = (s) => console.log("  " + s);
if (errors.length) {
  console.log(`\nERRORS (${errors.length})`);
  errors.forEach(line);
}
if (warnings.length) {
  const byCode = {};
  for (const w of warnings) { const c = w.match(/^\[([^\]]+)\]/)[1]; byCode[c] = (byCode[c] || 0) + 1; }
  console.log(`\nWARNINGS (${warnings.length}) by code`);
  Object.entries(byCode).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => line(`${String(n).padStart(5)}  ${c}`));
  if (process.env.SHOW_WARNINGS) warnings.forEach(line);
}
if (unreviewed.length) {
  console.log(`\nUNREVIEWED WARNINGS ON vNEXT JOURNEYS (${unreviewed.length})`);
  unreviewed.forEach(line);
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
    `${Object.keys(merged).length} merged redirects (not counted) · surfaces customer ${vnextStats.counts.customer} (${vnextStats.counts["customer-communicating"]} communicating / ${vnextStats.counts["customer-silent"]} silent) · mechanism ${vnextStats.counts.mechanism} · operational ${vnextStats.counts.operational} · ${vnextStats.vnext} vNext · ${errors.length} errors · ${warnings.length} warnings (${unreviewed.length} unreviewed on vNext journeys)`,
);
process.exit(errors.length ? 1 : 0);
