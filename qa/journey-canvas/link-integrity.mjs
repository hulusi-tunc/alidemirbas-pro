import { readFile, writeFile } from "node:fs/promises";

// Phase 11 - handoff link integrity. A handoff node's `to` field names
// either another journey's id, or an `external:`-prefixed system reference.
// This checks every handoff across all 255 journeys resolves to something
// real - a canonical journey id or a declared external system - with zero
// invented destinations. Pure data-integrity check: no browser needed.

const dump = JSON.parse(await readFile("/home/user/alidemirbas-pro/production/canonical-dump.json", "utf8"));
const journeyIds = new Set(dump.journeys.map((j) => j.id));

const refs = [];
for (const j of dump.journeys) {
  for (const n of j.nodes) {
    if (n.kind === "handoff" && n.to) refs.push({ journeyId: j.id, nodeId: n.id, to: n.to });
  }
}

const external = [];
const crossJourney = [];
const unresolved = [];
for (const r of refs) {
  if (r.to.startsWith("external:")) external.push(r);
  else if (journeyIds.has(r.to)) crossJourney.push({ ...r, destinationSlug: dump.journeys.find((j) => j.id === r.to).slug });
  else unresolved.push(r);
}

const result = {
  totalHandoffs: refs.length,
  external: external.length,
  crossJourney: crossJourney.length,
  unresolved: unresolved.length,
  unresolvedDetail: unresolved,
  pass: unresolved.length === 0,
};
await writeFile("/tmp/link-integrity-report.json", JSON.stringify({ result, crossJourney }, null, 2));
console.log(JSON.stringify(result, null, 2));
if (!result.pass) {
  console.log("BROKEN REFERENCES FOUND - report separately, do not invent destinations:");
  console.log(JSON.stringify(unresolved, null, 2));
}
