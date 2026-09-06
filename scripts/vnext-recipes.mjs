/* Implementation recipes - GENERATED from the canonical dump, never edited.

   One recipe per Customer Journey, in the practitioner's reading order:
   trigger, who enters, suppressed when, the touch plan with timing and
   channel roles, stops when, configure, required data, collision,
   measurement, presets. Everything is a projection of the journey's own
   vNext fields; the practitioner view on the site is the same projection
   rendered as a page. Deterministic: two builds from the same dump are
   byte-identical.

     npm run dump:canonical && node scripts/surface-assignment.mjs && node scripts/vnext-recipes.mjs */
import { readFile, writeFile } from "node:fs/promises";

const dump = JSON.parse(await readFile("production/canonical-dump.json", "utf8"));
const surfaces = JSON.parse(await readFile("production/surface-assignment.json", "utf8"));
const surfaceOf = Object.fromEntries(surfaces.journeys.map((r) => [r.id, r]));
const eventsSrc = await readFile("src/canonical/events.ts", "utf8");
const meaning = Object.fromEntries([...eventsSrc.matchAll(/\{ id: "([^"]+)", meaning: "((?:[^"\\]|\\.)*)"/g)].map((m) => [m[1], JSON.parse(`"${m[2]}"`)]));
const byId = Object.fromEntries(dump.journeys.map((j) => [j.id, j]));

const isConfig = (x) => x && typeof x === "object" && "key" in x;
const valueText = (v) => v && typeof v === "object" && "min" in v ? `${v.min}–${v.max}` : String(v);
const configShort = (c) => !isConfig(c) ? String(c) : c.required ? `configure ${c.key}` : c.default ? `${valueText(c.default.value)} (${c.default.basis === "example-only" ? "example" : "recommended"})` : c.key;
const configLine = (c) => `- \`${c.key}\`${c.class ? ` · ${c.class}` : ""} — ${c.required ? "**CONFIG_REQUIRED**" : c.default ? `**${c.default.basis === "example-only" ? "example" : "recommended"}: ${valueText(c.default.value)}** (confidence ${c.default.confidence}${c.default.applicableWhen ? `; when ${c.default.applicableWhen}` : ""}${c.default.avoidWhen ? `; avoid when ${c.default.avoidWhen}` : ""})` : "canonical"} — ${c.rule}`;
const ev = (id) => meaning[id] ? `\`${id}\` (${meaning[id]})` : `\`${id}\``;

function recipe(j) {
  const nodeById = Object.fromEntries(j.nodes.map((n) => [n.id, n]));
  const trig = nodeById[j.entry];
  const s = surfaceOf[j.id];
  const out = [];
  out.push(`## ${j.id} · ${j.shortName ?? j.name}`);
  out.push(`\n${s.silent ? "Silent lifecycle state" : "Customer journey"} · category ${j.category} · slug \`${j.slug}\`\n`);
  out.push(`**Objective.** ${j.objective}\n`);
  out.push(`**Trigger.** ${ev(trig.event)} [${trig.evidence.source}]. Requires: ${trig.evidence.requires.join("; ")}. Not enough on its own: ${(trig.evidence.insufficientAlone ?? []).join("; ")}.\n`);
  out.push(`**Entity.** ${j.entity.scope} — instance \`${(j.entity.instanceKey ?? []).join(" + ")}\`, ${j.entity.concurrency ?? ""}${j.entity.supersession ? ` — supersession [${j.entity.supersession.label}]: ${j.entity.supersession.text}` : ""}\n`);
  out.push(`**Who enters.**\n${(j.eligibility ?? []).map((e) => `- ${e}`).join("\n")}\n`);
  out.push(`**Suppressed when.**\n${(j.suppressions ?? []).map((x) => `- [${x.label}] ${x.text}`).join("\n")}\n`);
  if (j.orchestration) {
    const roles = Object.fromEntries((j.channelStrategy?.roles ?? []).map((r) => [r.role, r]));
    out.push(`**Recommended orchestration** · strategy \`${j.orchestration.strategy}\`\n`);
    j.orchestration.touches.forEach((t, i) => {
      const w = t.gatedBy ? nodeById[t.gatedBy] : null;
      const timing = w ? `${configShort(w.timeout.after)} ${w.timeout.relativeTo === "attribute" ? `relative to \`${w.timeout.attribute}\`` : w.timeout.relativeTo === "previous-touch" ? "after the previous touch" : "after the trigger"}; cancelled by ${w.until.map(ev).join(", ")}${w.recheck ? `; re-read before sending: ${w.recheck}` : ""}` : "on classification, no wait";
      const checks = t.prerequisites.map((p) => nodeById[p]?.kind === "condition" ? nodeById[p].asks : p).join(" · ");
      out.push(`${i + 1}. **${t.stage}** (\`${t.action}\`${t.after ? `, after ${t.after}` : ""}) — ${timing}${checks ? `\n   - checks: ${checks}` : ""}\n   - channel roles, in order: ${t.channelRoles.map((r) => `${r}${roles[r] ? ` (${roles[r].channels.join("/")}: ${roles[r].when})` : ""}`).join(" → ")}\n   - ${t.mandatory ? "mandatory" : "discretionary"} · priority ${t.priority ?? j.contact?.defaultPriority}${t.priorityReason ? ` (${t.priorityReason})` : ""} · [${t.label}]\n   - purpose: ${t.purpose}${t.destination ? `\n   - destination: ${t.destination.target} bound to \`${t.destination.boundTo}\`${t.destination.mustNotClaim?.length ? `; must not claim: ${t.destination.mustNotClaim.join(", ")}` : ""}` : ""}`);
    });
    out.push(`\nDelivery fallback: ${j.channelStrategy?.fallback}${j.channelStrategy?.simultaneous ? ` · simultaneous: ${j.channelStrategy.simultaneous.reason}` : ""}. No action when: ${j.orchestration.noAction.join(", ")} (see Suppressed when).\n`);
  }
  const exits = j.nodes.filter((n) => n.kind === "exit"); const hands = j.nodes.filter((n) => n.kind === "handoff");
  out.push(`**Stops when.**\n${exits.map((x) => `- \`${x.id}\` [${x.class}] ${x.state} — re-entry: ${x.reEntry}`).join("\n")}\n${hands.map((h) => `- handoff \`${h.id}\` → ${h.to}${byId[h.to] ? ` (${byId[h.to].shortName ?? byId[h.to].name})` : ""} — ${h.on}${h.contract ? ` · contract: ${h.contract.requiredFields.join(", ")}` : ""}`).join("\n")}\n`);
  const configs = new Map();
  for (const n of j.nodes) { if (n.kind === "wait" && isConfig(n.timeout.after)) configs.set(n.timeout.after.key, n.timeout.after); if (n.kind === "action" && n.attemptBudget) configs.set(n.attemptBudget.key, n.attemptBudget); }
  if (j.contact) { configs.set(j.contact.localCap.value.key, j.contact.localCap.value); configs.set(j.contact.cooldown.key, j.contact.cooldown); }
  if (j.measurement?.businessOutcome?.holdout) configs.set(j.measurement.businessOutcome.holdout.key, j.measurement.businessOutcome.holdout);
  if (configs.size) out.push(`**Configure.**\n${[...configs.values()].map(configLine).join("\n")}\n`);
  const events = new Set([trig.event]); for (const n of j.nodes) if (n.kind === "wait") n.until.forEach((u) => events.add(u)); if (j.measurement?.businessOutcome) events.add(j.measurement.businessOutcome.event);
  out.push(`**Required data.** Events: ${[...events].map(ev).join("; ")}. Attributes: \`${(j.implementation?.attributes.required ?? []).join("`, `")}\`${j.implementation?.attributes.optional?.length ? ` (optional: \`${j.implementation.attributes.optional.join("`, `")}\`)` : ""}.\n`);
  if (j.contact) out.push(`**Collision & priority.** default ${j.contact.defaultPriority} · pressure class ${j.contact.pressureClass} · local cap ${configShort(j.contact.localCap.value)} (${j.contact.localCap.appliesTo}) · cooldown ${configShort(j.contact.cooldown)} · competition ${j.contact.competition === "none" ? "none" : `${j.contact.competition.exclusionGroup} (${j.contact.competition.scope}; ${j.contact.competition.precedence}; on loss: ${j.contact.competition.onLoss})`}\n`);
  const m = j.measurement; const b = m.businessOutcome;
  out.push(`**Measurement.** journey outcome: ${m.journeyOutcome.type} ${m.journeyOutcome.refs.join(", ")}${b ? ` · business outcome: ${ev(b.event)} per ${b.unit}, observed ${b.observationScope.type === "self" ? "in this journey" : `through ${b.observationScope.journeys.join(" → ")}`}${typeof b.window === "object" && "until" in b.window ? ` until ${ev(b.window.until)}` : ""}, attribution ${b.attribution}, comparison ${b.comparison}${b.holdout ? ` (holdout ${configShort(b.holdout)})` : ""}` : " · no business outcome (see the review note)"} · guardrails: ${m.guardrails.join(", ")}\n`);
  if (j.discovery?.presets?.length) out.push(`**Presets.**\n${j.discovery.presets.map((p) => `- **${p.name}** (\`${p.id}\`) — [${p.applicableWhen.label}] ${p.applicableWhen.text}${Object.keys(p.overrides ?? {}).length ? ` · sets ${Object.entries(p.overrides).map(([k, v]) => `\`${k}\` = ${valueText(v)}`).join(", ")}` : " · keeps every default"}${p.destination ? ` · destination: ${p.destination}` : ""} · aliases: ${p.aliases.join(", ")}`).join("\n")}\n`);
  out.push(`**Aliases.** ${(j.discovery?.aliases ?? []).join(" · ")}\n`);
  return out.join("\n");
}

const customer = dump.journeys.filter((j) => surfaceOf[j.id]?.surface === "customer" && j.measurement);
const comm = customer.filter((j) => !surfaceOf[j.id].silent); const silent = customer.filter((j) => surfaceOf[j.id].silent);
let md = `# Implementation recipes — Customer Journeys\n\nGenerated by \`scripts/vnext-recipes.mjs\` from \`production/canonical-dump.json\`; do not edit. ${customer.length} customer journeys: ${comm.length} communicating, ${silent.length} silent lifecycle states. Recommended values are recommendations; a CONFIG_REQUIRED key is the company's to set; an example is illustrative and labelled so.\n\n# Communicating journeys\n\n${comm.map(recipe).join("\n\n---\n\n")}\n\n# Silent lifecycle states\n\n${silent.map(recipe).join("\n\n---\n\n")}\n`;
await writeFile("production/vnext-recipes.md", md);
console.log(`recipes: ${comm.length} communicating + ${silent.length} silent · ${md.length} bytes`);
