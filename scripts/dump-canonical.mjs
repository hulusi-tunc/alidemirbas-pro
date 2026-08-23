/* Dumps the full canonical library to JSON for offline analysis. Read-only:
   reuses validate-canonical.mjs's own load mechanism (evaluate the literal in
   isolation, no build step) so the dump can never drift from what the
   validator itself sees. Not a deliverable on its own — production/*.json
   files are built from this dump by separate scripts. */
import { readFile, writeFile } from "node:fs/promises";

const FILES = [
  "src/canonical/acquisition.ts","src/canonical/activation.ts","src/canonical/retention.ts",
  "src/canonical/consent.ts","src/canonical/feedback.ts","src/canonical/ownership.ts",
  "src/canonical/time.ts","src/canonical/access.ts","src/canonical/identity.ts",
  "src/canonical/structure.ts","src/canonical/terminal.ts","src/canonical/integration.ts",
  "src/canonical/processing.ts","src/canonical/financial.ts","src/canonical/fulfillment.ts",
  "src/canonical/remedy.ts","src/canonical/subscription.ts","src/canonical/scheduling.ts",
  "src/canonical/decision.ts","src/canonical/risk.ts","src/canonical/communication.ts",
  "src/canonical/document.ts","src/canonical/data.ts","src/canonical/control.ts",
  "src/canonical/rollout.ts","src/canonical/incident.ts",
];

async function loadJourneys() {
  const out = [];
  for (const file of FILES) {
    const src = await readFile(file, "utf8");
    const body = src
      .replace(/^import type .*?;$/gms, "")
      .replace(/:\s*readonly\s+\w+\[\]/g, "")
      .replace(/export const/g, "const");
    const names = [...body.matchAll(/^const (\w+) =/gm)].map((m) => m[1]);
    const mod = new Function(`${body}\nreturn { ${names.join(", ")} };`)();
    const journeys = names.filter((n) => n.endsWith("_JOURNEYS")).flatMap((n) => mod[n]);
    const rules = names.filter((n) => n.endsWith("_RULES")).flatMap((n) => mod[n]);
    out.push({ file, journeys, rules });
  }
  return out;
}

const loaded = await loadJourneys();
const all = loaded.flatMap((l) => l.journeys);
const rules = loaded.flatMap((l) => l.rules);

const indexSrc = await readFile("src/canonical/index.ts", "utf8");
const mergedBlock = indexSrc.slice(indexSrc.indexOf("export const MERGED_INTO"));
const merged = Object.fromEntries(
  [...mergedBlock.slice(0, mergedBlock.indexOf("};")).matchAll(/"([A-Z]{3}-\d+)":\s*"([A-Z]{3}-\d+)"/g)]
    .map((m) => [m[1], m[2]]),
);

const globalSrc = await readFile("src/canonical/global.ts", "utf8");
const globalMod = new Function(
  `${globalSrc.replace(/^import type .*?;$/gms, "").replace(/:\s*readonly\s+[\w<>,\s{}[\]]+?\[\]/g, "").replace(/export const/g, "const")}\nreturn { GLOBAL_RULES, SEND_PATH_ORDER };`,
)();

const categoryTitles = {};
{
  const src = await readFile("src/canonical/index.ts", "utf8");
  for (const m of src.matchAll(/id:\s*"(\w[\w-]*)",\s*\n\s*title:\s*"([^"]+)"/g)) {
    categoryTitles[m[1]] = m[2];
  }
}

await writeFile(
  "production/canonical-dump.json",
  JSON.stringify(
    {
      journeys: all,
      rules,
      globalRules: globalMod.GLOBAL_RULES,
      sendPathOrder: globalMod.SEND_PATH_ORDER,
      mergedInto: merged,
      categoryTitles,
    },
    null,
    2,
  ),
);
console.log(`dumped ${all.length} journeys, ${rules.length} rules, ${globalMod.GLOBAL_RULES.length} global rules, ${Object.keys(merged).length} merged redirects`);
