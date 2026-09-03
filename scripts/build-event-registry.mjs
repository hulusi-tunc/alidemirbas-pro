/* Builds the semantic-event registry (src/canonical/events.ts) and its audit
   report (SEMANTIC_EVENT_REGISTRY_REPORT.md).

   Sources, in order of authority:
     1. every trigger event in the corpus - registered as-is; its meaning is
        the trigger's own required evidence, its source class the trigger's,
        its entity the journey's entity scope;
     2. scripts/event-curation.json - a person's mapping of every customer-
        surface wait phrase to a registry id, a source class and a meaning,
        with equivalents declared explicitly (never by string similarity);
     3. the curation file's measurementEvents - events that exist only to
        name business outcomes or the new journeys' triggers.

   Operational-surface wait phrases are NOT registered: they stay as prose in
   their files until Gate 5 and are listed by the report as unresolved so no
   phrase can silently map to the wrong event. A customer-surface phrase
   missing from the curation file is an error, not a guess.

     node scripts/build-event-registry.mjs   # after npm run dump:canonical and node scripts/surface-assignment.mjs */
import { readFile, writeFile } from "node:fs/promises";

const dump = JSON.parse(await readFile("production/canonical-dump.json", "utf8"));
const curation = JSON.parse(await readFile("scripts/event-curation.json", "utf8"));
const surfaces = JSON.parse(await readFile("production/surface-assignment.json", "utf8"));
const surfaceOf = Object.fromEntries(surfaces.journeys.map((r) => [r.id, r.surface]));

const entries = new Map(); // id -> entry
const report = { triggerRaw: 0, triggerDistinct: 0, triggerSharedIds: [], waitPhrasesCustomer: 0, waitPhrasesOperational: 0, aliasesMerged: [], ambiguous: [], unresolvedCustomer: [], unresolvedOperational: [], measurement: 0, collisions: [] };

// ---- 1. triggers
const bySrc = {};
for (const j of dump.journeys) {
  const t = j.nodes.find((n) => n.kind === "trigger");
  report.triggerRaw++;
  (bySrc[t.event] ??= []).push({ j: j.id, source: t.evidence.source, requires: t.evidence.requires, entity: j.entity.scope });
}
for (const [id, uses] of Object.entries(bySrc)) {
  report.triggerDistinct++;
  if (uses.length > 1) report.triggerSharedIds.push(`${id} (${uses.map((u) => u.j).join(", ")})`);
  const sources = [...new Set(uses.map((u) => u.source))];
  if (sources.length > 1) report.ambiguous.push(`${id}: trigger source differs across journeys (${sources.join(" vs ")}) - kept as one entry with the first; review`);
  entries.set(id, { id, meaning: uses[0].requires.join("; "), source: uses[0].source, entity: uses[0].entity, origin: "trigger", usedBy: uses.map((u) => u.j) });
}

// ---- 2. curated wait events - authoritative whether or not a phrase still uses them
const cur = curation.waitPhrases;
const curatedIds = new Set();
for (const [phrase, c] of Object.entries(cur)) {
  curatedIds.add(c.id);
  if (!c.meaning) continue;
  if (entries.has(c.id)) {
    const e = entries.get(c.id);
    if (e.origin === "trigger") report.collisions.push(`${c.id}: curated wait event reuses a trigger event id - treated as the same event (a journey waits on what another journey starts on); the trigger's evidence stays its meaning`);
    continue;
  }
  entries.set(c.id, { id: c.id, meaning: c.meaning, source: c.source, entity: c.entity, commonMappings: c.commonMappings, origin: "wait", usedBy: [], definedBy: phrase });
}
for (const [phrase, c] of Object.entries(cur)) if (!c.meaning && !entries.has(c.id) && !curatedIds.has(c.id)) report.unresolvedCustomer.push(`${phrase}: alias to ${c.id}, which nothing defines`);
// ---- 3. measurement / new-journey events
for (const m of curation.measurementEvents) {
  if (entries.has(m.id)) {
    // a new journey now starts on an event the curation had defined for measurement: the curated meaning and mappings are the authored ones
    const e = entries.get(m.id);
    if (e.origin === "trigger") { Object.assign(e, { meaning: m.meaning, source: m.source, entity: m.entity, commonMappings: m.commonMappings }); report.aliasesMerged.push(`trigger ${m.id} takes its curated meaning`); }
    else report.collisions.push(`${m.id}: measurement event collides with a wait-derived entry - review`);
    continue;
  }
  entries.set(m.id, { ...m, origin: "measurement", usedBy: [] });
  report.measurement++;
}

// ---- 2b. usage: every until string is a registry id, a curated phrase, or (operational) prose
const phraseUse = new Map();
for (const j of dump.journeys) for (const n of j.nodes) if (n.kind === "wait") for (const u of n.until) {
  const rec = phraseUse.get(u) ?? { journeys: new Set(), customer: false };
  rec.journeys.add(j.id);
  if (surfaceOf[j.id] === "customer") rec.customer = true;
  phraseUse.set(u, rec);
}
for (const [u, rec] of phraseUse) {
  const asId = entries.get(u) ?? (curatedIds.has(u) ? null : undefined);
  if (asId) { asId.usedBy = [...new Set([...asId.usedBy, ...rec.journeys])]; if (rec.customer) report.waitPhrasesCustomer++; else report.waitPhrasesOperational++; continue; }
  const c = cur[u];
  if (c) { const e = entries.get(c.id); if (e) e.usedBy = [...new Set([...e.usedBy, ...rec.journeys])]; if (!c.meaning) report.aliasesMerged.push(`"${u}" → ${c.id}`); if (rec.customer) report.waitPhrasesCustomer++; else report.waitPhrasesOperational++; continue; }
  if (rec.customer) report.unresolvedCustomer.push(`${u} [${[...rec.journeys].join(",")}]`);
  else { report.waitPhrasesOperational++; report.unresolvedOperational.push(u); }
}

// ---- duplicate-meaning check (exact meaning text twice under different ids)
const byMeaning = {};
for (const e of entries.values()) (byMeaning[e.meaning.toLowerCase()] ??= []).push(e.id);
const dupMeanings = Object.entries(byMeaning).filter(([, ids]) => ids.length > 1);

// ---- write events.ts
const sorted = [...entries.values()].sort((a, b) => a.id.localeCompare(b.id));
const lit = (v) => JSON.stringify(v);
let ts = `import type { SemanticEvent } from "./types";

/* THE SEMANTIC-EVENT REGISTRY - GENERATED by scripts/build-event-registry.mjs.
   Do not edit by hand: trigger entries come from the journeys themselves and
   wait/measurement entries from scripts/event-curation.json, which is where a
   person decides that two phrases mean one event. ${sorted.length} events. */

export const SEMANTIC_EVENTS: readonly SemanticEvent[] = [
`;
for (const e of sorted) {
  ts += `  { id: ${lit(e.id)}, meaning: ${lit(e.meaning)}, source: ${lit(e.source)}, entity: ${lit(e.entity)}${e.commonMappings?.length ? `, commonMappings: ${lit(e.commonMappings)}` : ""} },\n`;
}
ts += `];

const BY_ID = new Map(SEMANTIC_EVENTS.map((e) => [e.id, e]));
export const semanticEvent = (id: string): SemanticEvent | undefined => BY_ID.get(id);
/** The sentence a reader sees for an event reference: the registry meaning
    where the id is registered, the text itself where a wait still carries
    prose (un-migrated journeys). */
export const eventText = (ref: string): string => BY_ID.get(ref)?.meaning ?? ref;
export const isRegisteredEvent = (ref: string): boolean => BY_ID.has(ref);
`;
await writeFile("src/canonical/events.ts", ts);

// ---- report
const md = `# Semantic Event Registry — build report

Generated by \`scripts/build-event-registry.mjs\` from \`production/canonical-dump.json\`, \`production/surface-assignment.json\` and \`scripts/event-curation.json\`. Registry written to \`src/canonical/events.ts\`.

| Measure | Count |
|---|--:|
| Raw trigger events (one per journey) | ${report.triggerRaw} |
| Distinct trigger event ids registered | ${report.triggerDistinct} |
| Trigger ids shared by more than one journey (legitimate: one event, several journeys) | ${report.triggerSharedIds.length} |
| Distinct wait phrases on the customer surface | ${report.waitPhrasesCustomer} |
| …of which registered as their own event | ${sorted.filter((e) => e.origin === "wait").length} |
| …of which merged into an existing id as a declared equivalent | ${report.aliasesMerged.length} |
| …unresolved (must be 0 for the customer surface) | ${report.unresolvedCustomer.length} |
| Distinct wait phrases on operational/mechanism surfaces (retained as prose until Gate 5) | ${report.waitPhrasesOperational} |
| Measurement / new-journey events from curation | ${report.measurement} |
| **Canonical events in the registry** | **${sorted.length}** |
| Ambiguous entries kept as one with a review note | ${report.ambiguous.length} |
| Id collisions between origins | ${report.collisions.length} |
| Identical meaning text under two ids (must be 0) | ${dupMeanings.length} |

## Trigger ids shared by several journeys
${report.triggerSharedIds.map((s) => `- ${s}`).join("\n") || "- none"}

## Aliases merged (a person declared these phrases equivalent)
${report.aliasesMerged.map((s) => `- ${s}`).join("\n") || "- none"}

## Ambiguous, kept separate or flagged for review
${report.ambiguous.map((s) => `- ${s}`).join("\n") || "- none"}

## Collisions
${report.collisions.map((s) => `- ${s}`).join("\n") || "- none"}

## Identical meanings under different ids
${dupMeanings.map(([m, ids]) => `- ${ids.join(", ")}: "${m}"`).join("\n") || "- none"}

## Unresolved — customer surface (blocking)
${report.unresolvedCustomer.map((s) => `- ${s}`).join("\n") || "- none"}

## Unresolved — operational and mechanism surfaces (retained as prose; Gate 5)
${report.unresolvedOperational.length} phrases, e.g.:
${report.unresolvedOperational.slice(0, 25).map((s) => `- ${s}`).join("\n")}
${report.unresolvedOperational.length > 25 ? `- … and ${report.unresolvedOperational.length - 25} more` : ""}

## Source-class distribution of the registry
${Object.entries(sorted.reduce((m, e) => (m[e.source] = (m[e.source] || 0) + 1, m), {})).map(([k, v]) => `- ${k}: ${v}`).join("\n")}
`;
await writeFile("SEMANTIC_EVENT_REGISTRY_REPORT.md", md);
console.log(`registry: ${sorted.length} events · unresolved customer: ${report.unresolvedCustomer.length} · operational prose: ${report.unresolvedOperational.length} · dup meanings: ${dupMeanings.length} · collisions: ${report.collisions.length}`);
if (report.unresolvedCustomer.length) { console.log(report.unresolvedCustomer.join("\n")); process.exit(1); }
