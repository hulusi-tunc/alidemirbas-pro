/* Writes production/surface-assignment.json - the derived product surface of
   every canonical journey, with the reason - by re-implementing surface.ts's
   rule over the dump. Deterministic: two runs on the same corpus produce the
   same file. The validator's surface_count_drift rule reads this file and
   fails when the corpus and the assignment disagree.

     node scripts/surface-assignment.mjs            # after npm run dump:canonical */
import { readFile, writeFile } from "node:fs/promises";

const dump = JSON.parse(await readFile("production/canonical-dump.json", "utf8"));
const surfaceSrc = await readFile("src/canonical/surface.ts", "utf8");
const pick = (name) => {
  const m = surfaceSrc.match(new RegExp(`export const ${name}[^=]*=\\s*\\[([\\s\\S]*?)\\];`));
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
};
const MECHANISM_IDS = new Set(pick("MECHANISM_IDS"));
const CUSTOMER_CATEGORIES = new Set(pick("CUSTOMER_CATEGORIES"));
const CUSTOMER_ENTITY = new RegExp(surfaceSrc.match(/CUSTOMER_ENTITY = \/(.*)\/i;/)[1], "i");
const MESSAGE = new Set(["email", "sms", "push", "in-app", "whatsapp"]);

const rows = dump.journeys.map((j) => {
  const sends = j.channels.some((c) => MESSAGE.has(c));
  const routesToHuman = j.channels.some((c) => c === "sales" || c === "task");
  const communicating = sends || routesToHuman;
  let surface, reason;
  if (MECHANISM_IDS.has(j.id)) { surface = "mechanism"; reason = "listed in MECHANISM_IDS - runtime machinery customer journeys depend on"; }
  else if (sends) { surface = "customer"; reason = `declares a message channel (${j.channels.join(", ")})`; }
  else if (CUSTOMER_CATEGORIES.has(j.category) && CUSTOMER_ENTITY.test(j.entity.scope)) { surface = "customer"; reason = `silent lifecycle state: category "${j.category}" and a customer-worded entity`; }
  else { surface = "operational"; reason = "no message channel and a system-side entity or category"; }
  return { id: j.id, shortName: j.shortName, category: j.category, surface, communicating, silent: surface === "customer" && !sends, reason };
});

const counts = rows.reduce((m, r) => { const k = r.surface === "customer" ? (r.silent ? "customer-silent" : "customer-communicating") : r.surface; m[k] = (m[k] || 0) + 1; return m; }, {});
const totals = { journeys: rows.length, customer: rows.filter((r) => r.surface === "customer").length, ...counts };
await writeFile("production/surface-assignment.json", JSON.stringify({ generatedFrom: "production/canonical-dump.json", rule: "src/canonical/surface.ts", totals, journeys: rows }, null, 2));
console.log(JSON.stringify(totals));
