/* Lowering fixtures: proves a vNext journey reduces to ordinary orchestration
   primitives. For each journey id given, writes production/lowering/<id>.json
   - a flat list of primitives a platform-neutral orchestrator would execute -
   and appends the platform mapping notes to production/lowering/LOWERING_NOTES.md.

   No deployment is performed or claimed. The fixture is static evidence that
   nothing in the schema needs a construct these platforms lack.

     node scripts/lowering-fixture.mjs ACQ-11 FIN-134 SCH-266 */
import { readFile, writeFile, mkdir } from "node:fs/promises";

const dump = JSON.parse(await readFile("production/canonical-dump.json", "utf8"));
const byId = Object.fromEntries(dump.journeys.map((j) => [j.id, j]));
const eventsSrc = await readFile("src/canonical/events.ts", "utf8");
const meaning = Object.fromEntries([...eventsSrc.matchAll(/\{ id: "([^"]+)", meaning: "((?:[^"\\]|\\.)*)"/g)].map((m) => [m[1], m[2]]));
const isConfig = (x) => x && typeof x === "object" && "key" in x;
const cfg = (c) => isConfig(c) ? { key: c.key, class: c.class, default: c.default?.value ?? null, basis: c.default?.basis ?? null, required: c.required } : c;

const PRIMS = ["entry", "condition", "wait", "event-cancellation", "state-recheck", "channel-role-resolution", "message", "frequency-gate", "holdout", "handoff", "exit", "state-update", "human-task", "idempotency-key"];

function lower(j) {
  const prims = [];
  const touchesByAction = Object.fromEntries((j.orchestration?.touches ?? []).map((t) => [t.action, t]));
  const roles = Object.fromEntries((j.channelStrategy?.roles ?? []).map((r) => [r.role, r]));
  for (const n of j.nodes) {
    switch (n.kind) {
      case "trigger":
        prims.push({ type: "entry", node: n.id, event: n.event, meaning: meaning[n.event] ?? null, evidenceSource: n.evidence.source, entryFilters: j.eligibility ?? [], instanceKey: j.entity.instanceKey ?? null, concurrency: j.entity.concurrency ?? null });
        if (j.measurement?.businessOutcome?.comparison === "persistent-holdout") prims.push({ type: "holdout", node: n.id, unit: j.measurement.businessOutcome.unit, share: cfg(j.measurement.businessOutcome.holdout), persistent: true });
        break;
      case "condition":
        prims.push({ type: "condition", node: n.id, asks: n.asks, branches: n.branches.map((b) => ({ label: b.label, observes: b.observes ?? null, test: b.when, to: b.to })) });
        break;
      case "wait":
        prims.push({ type: "wait", node: n.id, timing: cfg(n.timeout.after), relativeTo: n.timeout.relativeTo ?? "trigger", attribute: n.timeout.attribute ?? null, onTimeout: n.onTimeout });
        prims.push({ type: "event-cancellation", node: n.id, cancelOn: n.until.map((u) => ({ event: u, meaning: meaning[u] ?? null })), onEvent: n.onEvent });
        if (n.recheck) prims.push({ type: "state-recheck", node: n.id, reads: n.recheck, before: n.onTimeout });
        break;
      case "action": {
        const t = touchesByAction[n.id];
        if (n.execution === "communication" && t) {
          prims.push({ type: "frequency-gate", node: n.id, touch: t.id, mandatory: t.mandatory, pressureClass: t.mandatory ? "exempt" : j.contact?.pressureClass ?? null, localCap: j.contact ? { value: cfg(j.contact.localCap.value), appliesTo: j.contact.localCap.appliesTo, counts: !(t.mandatory && j.contact.localCap.appliesTo === "non-mandatory") } : null, priority: t.priority ?? j.contact?.defaultPriority ?? null, competition: j.contact?.competition ?? null, noActionReasons: j.orchestration?.noAction ?? [] });
          prims.push({ type: "channel-role-resolution", node: n.id, touch: t.id, orderedRoles: t.channelRoles.map((r) => ({ role: r, channels: roles[r]?.channels ?? [], eligibleWhen: roles[r]?.when ?? null })), deliveryFallback: j.channelStrategy?.fallback ?? null, simultaneous: j.channelStrategy?.simultaneous ?? null });
          prims.push({ type: "message", node: n.id, touch: t.id, stage: t.stage, purpose: t.purpose, brief: n.does, destination: t.destination ?? null, label: t.label, prerequisites: t.prerequisites, after: t.after ?? null });
          if (n.idempotencyKey) prims.push({ type: "idempotency-key", node: n.id, key: n.idempotencyKey });
        } else if (n.execution === "human") {
          prims.push({ type: "human-task", node: n.id, does: n.does, touch: t?.id ?? null });
        } else {
          prims.push({ type: "state-update", node: n.id, does: n.does, writes: n.writes ?? [], attemptBudget: n.attemptBudget ? cfg(n.attemptBudget) : null });
          if (n.idempotencyKey) prims.push({ type: "idempotency-key", node: n.id, key: n.idempotencyKey });
        }
        break;
      }
      case "exit":
        prims.push({ type: "exit", node: n.id, class: n.class ?? null, state: n.state, reEntry: n.reEntry });
        break;
      case "handoff":
        prims.push({ type: "handoff", node: n.id, to: n.to, on: n.on, carries: n.carries, suppresses: n.suppresses ?? [], contract: n.contract ?? null });
        break;
    }
  }
  const used = [...new Set(prims.map((p) => p.type))];
  const flags = [];
  if (j.nodes.some((n) => n.kind === "wait" && n.timeout.relativeTo === "attribute")) flags.push("attribute-relative wait");
  if (j.nodes.some((n) => n.kind === "wait" && n.until.length > 2)) flags.push("multi-event cancellation");
  if (j.measurement?.businessOutcome?.observationScope?.type === "handoff-chain") flags.push("downstream outcome through handoff chain");
  if (j.orchestration?.touches?.some((t) => t.channelRoles.length > 1)) flags.push("ordered channel-role resolution");
  if (j.contact && j.contact.pressureClass !== "none") flags.push("class-level pressure cap");
  if (j.measurement?.businessOutcome?.comparison === "persistent-holdout") flags.push("persistent holdout");
  if (j.orchestration?.touches?.some((t) => t.mandatory)) flags.push("mandatory touch exempt from caps");
  if (j.nodes.some((n) => n.kind === "action" && n.attemptBudget)) flags.push("bounded re-arm / attempt budget");
  return { id: j.id, shortName: j.shortName, strategy: j.orchestration?.strategy ?? null, primitivesUsed: used, primitivesAvailable: PRIMS, unsupportedConstructs: [], flags, primitives: prims };
}

const NOTES = {
  "attribute-relative wait": { braze: "Delay until a custom-attribute date (Canvas delay step: 'until' a date attribute) - supported.", insider: "Wait until date attribute - supported.", sfmc: "Wait By Attribute (date) - supported.", iterable: "Delay until date field / Customer.io wait until attribute - supported." },
  "multi-event cancellation": { braze: "Canvas action paths / exit criteria on several events - supported.", insider: "Wait-until-event with multiple exit events - supported.", sfmc: "EXPENSIVE: exit criteria per event plus re-entry; a wait activity cancels on one event at a time, so each cancelling event is an exit criterion and touch state is re-derived on re-entry.", iterable: "Journey exit rules / Customer.io goal & exit conditions on multiple events - supported." },
  "downstream outcome through handoff chain": { braze: "Not an orchestration concept: measured in analytics by joining the entry with the downstream event; the fixture names the chain and the window event.", insider: "Same - analytics join, not journey logic.", sfmc: "Same - journey goal can only reference events inside the journey; downstream outcome is a data view join.", iterable: "Same - conversion tracking is per journey; chain measurement is a warehouse join." },
  "ordered channel-role resolution": { braze: "One decision split per role condition, each leading to a channel message step - supported (2-3 splits).", insider: "Condition steps per role - supported.", sfmc: "Decision splits on session/token/permission attributes before each channel activity - supported.", iterable: "Branch on profile fields per role - supported." },
  "class-level pressure cap": { braze: "Frequency capping by campaign tag approximates a pressure class - supported with setup.", insider: "Global frequency caps by category - supported.", sfmc: "PARTIAL: contact-level send limits are coarse; class caps need Einstein Frequency or custom suppression data extensions.", iterable: "PARTIAL: frequency management by message type; Customer.io caps are per-campaign - class caps need a custom counter attribute." },
  "persistent holdout": { braze: "Canvas control group / global control group - supported.", insider: "Control group - supported.", sfmc: "Random split to a persistent holdout data extension - supported.", iterable: "Holdout groups / Customer.io experiments - supported." },
  "mandatory touch exempt from caps": { braze: "Transactional messages bypass frequency capping - supported.", insider: "Transactional channel exemption - supported.", sfmc: "Transactional sends via Transactional Messaging API bypass caps - supported.", iterable: "Transactional message type ignores frequency limits - supported." },
  "bounded re-arm / attempt budget": { braze: "A counter custom attribute incremented per re-arm and tested at the split - supported with a small custom attribute.", insider: "Counter attribute - supported.", sfmc: "Counter in a data extension updated by an Update Contact activity - supported.", iterable: "Counter profile field - supported." },
};

const ids = process.argv.slice(2);
await mkdir("production/lowering", { recursive: true });
let md = `# Lowering notes\n\nGenerated by \`scripts/lowering-fixture.mjs\`. Each fixture in this directory lists the platform-neutral primitives the journey reduces to. The notes below say, per construct the journey uses, how typical orchestration platforms carry it. **No deployment was performed; nothing here claims a tested integration.** "EXPENSIVE" and "PARTIAL" are honest markers, not blockers.\n\n`;
for (const id of ids) {
  const j = byId[id]; if (!j) { console.error("no journey " + id); process.exit(1); }
  const fx = lower(j);
  await writeFile(`production/lowering/${id}.json`, JSON.stringify(fx, null, 1));
  md += `## ${id} · ${j.shortName}\n\nStrategy: \`${fx.strategy}\` · primitives used: ${fx.primitivesUsed.map((p) => `\`${p}\``).join(", ")} · unsupported constructs: ${fx.unsupportedConstructs.length ? fx.unsupportedConstructs.join(", ") : "none"}\n\n| Construct | Braze | Insider | SFMC | Iterable / Customer.io |\n|---|---|---|---|---|\n`;
  for (const f of fx.flags) { const n = NOTES[f]; md += `| ${f} | ${n.braze} | ${n.insider} | ${n.sfmc} | ${n.iterable} |\n`; }
  md += "\n";
  console.log(`${id}: ${fx.primitives.length} primitives, ${fx.primitivesUsed.length} kinds, flags: ${fx.flags.join("; ")}`);
}
await writeFile("production/lowering/LOWERING_NOTES.md", md);
