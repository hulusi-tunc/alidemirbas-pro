/* Applies a vNext migration spec to one journey inside its TypeScript file.

   The canonical files are hand-authored TypeScript literals and the
   validator evaluates them as text, so migration edits are made as text too
   - located by node id inside the journey block, never by line number.

   Spec (JSON):
   {
     "id": "FIN-134",
     "file": "src/canonical/financial.ts",
     "journey": { objective, eligibility, suppressions, contact, channelStrategy, orchestration, implementation, measurement, discovery },   // inserted before `entry:`
     "entity": { instanceKey, concurrency, supersession },                                                                               // merged into entity
     "waits": { "w.x": { until: [...], timeout: { after: Config, reason?, relativeTo, attribute? }, recheck } },                          // replaces those fields
     "exits": { "x.y": "success" },                                                                                                       // sets class
     "actions": { "a.z": { idempotencyKey, attemptBudget } },
     "handoffs": { "h.q": { contract: {...} } },
     "trigger": { insufficientAlone: [...] },                                                                                            // only if absent
     "removeCompetition": true,                                                                                                          // journey-level `competition` moves into contact
     "insertNodesAfter": { "a.z": [ {node}, ... ] },                                                                                     // new nodes
     "replaceNodes": { "x.old": {node} },                                                                                                // whole-node replacement
     "branchTo": { "c.x": { "Label": "new.target" } },                                                                                   // re-point a branch
     "nextTo": { "a.x": "new.next" }                                                                                                     // re-point next/onEvent/onTimeout
   }

     node scripts/vnext-splice.mjs spec.json [spec2.json ...] */
import { readFile, writeFile } from "node:fs/promises";

const IND = "      "; // node indentation inside `nodes: [`
function tsLiteral(v, indent) {
  // JSON is valid TS; re-indent for readability, keep strings escaped by JSON
  const raw = JSON.stringify(v, null, 2);
  return raw.split("\n").map((l, i) => (i === 0 ? l : indent + l)).join("\n");
}
function journeySpan(src, id) {
  const start = src.indexOf(`\n  {\n    id: "${id}",`);
  if (start < 0) throw new Error(`journey ${id} not found`);
  const re = /\n  \{\n    id: "[A-Z]{3}-\d+",/g; re.lastIndex = start + 1;
  const m = re.exec(src);
  return [start, m ? m.index : src.indexOf("\n];", start)];
}
function nodeSpan(block, nid) {
  const start = block.indexOf(`\n${IND}{\n${IND}  id: "${nid}",`);
  if (start < 0) throw new Error(`node ${nid} not found`);
  const end = block.indexOf(`\n${IND}},`, start) + `\n${IND}},`.length;
  return [start, end];
}
function setField(nodeText, field, valueLiteral) {
  // replace `field: ...` up to the next top-level field or the node end; insert if absent
  const re = new RegExp(`\\n${IND}  ${field}:\\s`);
  const m = re.exec(nodeText);
  if (m) {
    // find the end of this field's value: next line that starts with IND+2 spaces and an identifier followed by ':' at depth 0, or the closing
    const rest = nodeText.slice(m.index + 1);
    const lines = rest.split("\n");
    let depth = 0, endLine = lines.length;
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (i > 0 && depth === 0 && (new RegExp(`^${IND}  \\w+:`).test(l) || l === `${IND}},`)) { endLine = i; break; }
      for (const ch of l) { if (ch === "{" || ch === "[") depth++; else if (ch === "}" || ch === "]") depth--; }
    }
    const before = nodeText.slice(0, m.index + 1);
    const after = lines.slice(endLine).join("\n");
    return `${before}${IND}  ${field}: ${valueLiteral},\n${after}`;
  }
  // insert before the closing of the node
  const close = nodeText.lastIndexOf(`\n${IND}},`);
  return `${nodeText.slice(0, close)}\n${IND}  ${field}: ${valueLiteral},${nodeText.slice(close)}`;
}

for (const specPath of process.argv.slice(2)) {
  const spec = JSON.parse(await readFile(specPath, "utf8"));
  let src = await readFile(spec.file, "utf8");
  if (spec.newJourney) {
    // append a whole journey before the closing `];` of the *_JOURNEYS array
    const arr = src.indexOf("_JOURNEYS: readonly CanonicalJourney[] = [");
    const close = src.indexOf("\n];", arr);
    src = src.slice(0, close) + `\n  ${tsLiteral(spec.newJourney, "  ")},` + src.slice(close);
    await writeFile(spec.file, src);
    console.log(`added ${spec.newJourney.id} (${specPath})`);
    continue;
  }
  let [a, b] = journeySpan(src, spec.id);
  let block = src.slice(a, b);

  const nodeEdit = (nid, fn) => { const [s, e] = nodeSpan(block, nid); block = block.slice(0, s) + fn(block.slice(s, e)) + block.slice(e); };

  for (const [nid, node] of Object.entries(spec.replaceNodes ?? {})) nodeEdit(nid, () => `\n${IND}${tsLiteral(node, IND)},`);
  for (const [nid, nodes] of Object.entries(spec.insertNodesAfter ?? {})) { const [, e] = nodeSpan(block, nid); const text = nodes.map((n) => `\n${IND}${tsLiteral(n, IND)},`).join(""); block = block.slice(0, e) + text + block.slice(e); }
  for (const [nid, map] of Object.entries(spec.branchTo ?? {})) nodeEdit(nid, (t) => { for (const [label, to] of Object.entries(map)) { const re = new RegExp(`(label: ${JSON.stringify(label)},[\\s\\S]*?to: )"[^"]+"`); if (!re.test(t)) throw new Error(`${spec.id} ${nid}: branch ${label} not found`); t = t.replace(re, `$1"${to}"`); } return t; });
  for (const [nid, to] of Object.entries(spec.nextTo ?? {})) nodeEdit(nid, (t) => t.replace(/(\n\s+(?:next|onEvent|onTimeout): )"[^"]+"/, `$1"${to}"`));
  for (const [nid, w] of Object.entries(spec.waits ?? {})) nodeEdit(nid, (t) => {
    if (w.until) t = setField(t, "until", tsLiteral(w.until, IND + "  "));
    if (w.timeout) { const cur = t.match(/\n\s+timeout: \{([\s\S]*?)\n\s+\},/); const reason = w.timeout.reason ?? (cur ? cur[1].match(/reason:\s*("(?:[^"\\]|\\.)*")/s)?.[1] : null); const obj = { after: w.timeout.after, reason: reason ? JSON.parse(reason) : "", relativeTo: w.timeout.relativeTo, ...(w.timeout.attribute ? { attribute: w.timeout.attribute } : {}) }; t = setField(t, "timeout", tsLiteral(obj, IND + "  ")); }
    if (w.recheck) t = setField(t, "recheck", JSON.stringify(w.recheck));
    if (w.onEvent) t = setField(t, "onEvent", JSON.stringify(w.onEvent));
    if (w.onTimeout) t = setField(t, "onTimeout", JSON.stringify(w.onTimeout));
    return t;
  });
  for (const [nid, cls] of Object.entries(spec.exits ?? {})) nodeEdit(nid, (t) => setField(t, "class", JSON.stringify(cls)));
  for (const [nid, f] of Object.entries(spec.actions ?? {})) nodeEdit(nid, (t) => { for (const [k, v] of Object.entries(f)) t = setField(t, k, tsLiteral(v, IND + "  ")); return t; });
  for (const [nid, f] of Object.entries(spec.handoffs ?? {})) nodeEdit(nid, (t) => { for (const [k, v] of Object.entries(f)) t = setField(t, k, tsLiteral(v, IND + "  ")); return t; });
  if (spec.trigger?.insufficientAlone) { const tid = block.match(/entry: "([^"]+)"/)[1]; nodeEdit(tid, (t) => t.includes("insufficientAlone") ? t : t.replace(/(\n\s+)source: /, `$1insufficientAlone: ${tsLiteral(spec.trigger.insufficientAlone, IND + "    ")},$1source: `)); }

  if (spec.entity) block = block.replace(/(\n    entity: \{[\s\S]*?)(\n    \},)/, (m0, head, tail) => `${head},\n      ${Object.entries(spec.entity).map(([k, v]) => `${k}: ${tsLiteral(v, "      ")}`).join(",\n      ")}${tail}`.replace(/,,/g, ","));
  if (spec.removeCompetition) block = block.replace(/\n    competition: \{[\s\S]*?\n    \},/, "");
  if (spec.journey) { const fields = Object.entries(spec.journey).map(([k, v]) => `    ${k}: ${tsLiteral(v, "    ")},`).join("\n"); block = block.replace(/\n    entry: /, `\n${fields}\n    entry: `); }

  src = src.slice(0, a) + block + src.slice(b);
  await writeFile(spec.file, src);
  console.log(`spliced ${spec.id} (${specPath})`);
}
