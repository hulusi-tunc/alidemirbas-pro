/* Prints the review sheet for journeys: everything a reviewer has to read to
   accept or correct a drafted migration, in the order the review procedure
   asks the questions. Reads the current dump (after a splice) so the sheet
   shows what is actually in the source.

     node scripts/vnext-review-print.mjs ID [ID...]   */
import { readFile } from "node:fs/promises";
const dump = JSON.parse(await readFile("production/canonical-dump.json", "utf8"));
const cut = (s, n) => (s ?? "").length > n ? s.slice(0, n - 1) + "…" : s ?? "";
const cfg = (c) => typeof c === "string" ? `"${cut(c, 50)}"` : c ? `${c.key} [${c.class ?? "-"}${c.required ? " REQUIRED" : c.default ? ` ${JSON.stringify(c.default.value)} ${c.default.basis}` : ""}]` : "-";
for (const id of process.argv.slice(2)) {
  const j = dump.journeys.find((x) => x.id === id); if (!j) { console.log(`${id}: missing`); continue; }
  const byId = Object.fromEntries(j.nodes.map((n) => [n.id, n]));
  const t = byId[j.entry];
  console.log(`\n████ ${j.id} ${j.shortName} [${j.channels.join(",")}] ${j.category} · ${j.nodes.length}n`);
  console.log(`  purpose: ${cut(j.purpose, 160)}`);
  console.log(`  objective: ${cut(j.objective, 160)}`);
  console.log(`  entity: ${cut(j.entity.scope, 110)} | key=${(j.entity.instanceKey ?? []).join("+")} ${j.entity.concurrency ?? ""}`);
  console.log(`  trigger: ${t.event} [${t.evidence.source}] requires: ${t.evidence.requires.map((r) => cut(r, 60)).join(" / ")}`);
  console.log(`    insufficient: ${(t.evidence.insufficientAlone ?? []).map((r) => cut(r, 70)).join(" / ")}`);
  console.log(`  eligibility: ${(j.eligibility ?? []).map((e) => cut(e, 70)).join(" | ")}`);
  console.log(`  suppressions: ${(j.suppressions ?? []).map((s) => `${s.id}[${s.label[0]}] ${cut(s.text, 60)}`).join(" | ")}`);
  if (j.contact) console.log(`  contact: ${j.contact.defaultPriority}/${j.contact.pressureClass} cap=${cfg(j.contact.localCap.value)} (${j.contact.localCap.appliesTo}) cooldown=${cfg(j.contact.cooldown)} comp=${j.contact.competition === "none" ? "none" : j.contact.competition.exclusionGroup + "/" + j.contact.competition.onLoss}`);
  if (j.channelStrategy) console.log(`  roles: ${j.channelStrategy.roles.map((r) => `${r.role}(${r.channels.join("/")})`).join(" ")} fb=${j.channelStrategy.fallback}${j.channelStrategy.simultaneous ? " SIMUL" : ""}`);
  if (j.orchestration) { console.log(`  orchestration: ${j.orchestration.strategy} noAction=${j.orchestration.noAction.length}`); for (const x of j.orchestration.touches) console.log(`    ${x.id} ${x.action}${x.after ? " after " + x.after : ""}${x.gatedBy ? " gate " + x.gatedBy : ""} pre=[${x.prerequisites.join(",")}] roles=[${x.channelRoles.join(">")}]${x.mandatory ? " MAND" : ""}${x.priority ? " prio=" + x.priority : ""} ${x.label[0]}${x.destination ? " dest=" + x.destination.target : ""}\n       ${cut(x.purpose, 150)}`); }
  for (const n of j.nodes) {
    if (n.kind === "wait") console.log(`  W ${n.id} until=[${n.until.join(",")}] ${cfg(n.timeout.after)} rel=${n.timeout.relativeTo ?? "-"}${n.timeout.attribute ? "@" + n.timeout.attribute : ""} ev>${n.onEvent} to>${n.onTimeout}${n.recheck ? "" : " NO-RECHECK"}`);
    if (n.kind === "action" && n.attemptBudget) console.log(`  A ${n.id} budget=${cfg(n.attemptBudget)}`);
    if (n.kind === "action" && (n.execution === "communication" || n.execution === "human")) console.log(`  A[${n.execution[0]}] ${n.id}: ${cut(n.does, 120)}`);
    if (n.kind === "condition") console.log(`  C ${n.id}: ${cut(n.asks, 60)} → ${n.branches.map((b) => `${cut(b.label, 28)}>${b.to}`).join(" | ")}`);
    if (n.kind === "exit") console.log(`  X ${n.id} [${n.class ?? "?"}] ${cut(n.state, 80)}`);
    if (n.kind === "handoff") console.log(`  H ${n.id} → ${n.to} | ${cut(n.on, 60)}${n.contract ? " C" : n.to.startsWith("external:") ? " NO-CONTRACT" : ""}`);
  }
  if (j.measurement) { const b = j.measurement.businessOutcome; console.log(`  measurement: ${j.measurement.journeyOutcome.type}[${j.measurement.journeyOutcome.refs.length}] bo=${b ? `${b.event} ${b.observationScope.type} ${b.attribution} ${b.comparison}${b.holdout ? " holdout" : ""}` : "none"}`); }
  if (j.discovery) console.log(`  discovery: ${j.discovery.aliases.join(" · ")} || ${(j.discovery.useCases ?? []).map((u) => cut(u, 60)).join(" | ")}${j.discovery.presets?.length ? ` presets=${j.discovery.presets.map((p) => p.id).join(",")}` : ""}`);
  if (j.implementation) console.log(`  attributes: ${j.implementation.attributes.required.join(" ")} | opt: ${j.implementation.attributes.optional.join(" ")}`);
}
