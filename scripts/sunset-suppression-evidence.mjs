/* SUNSET SUPPRESSION EVIDENCE — one-off proof for audit/sunset-suppression-fix.md.

   The defect this checks for: CON-300 wrote `marketing_suppression` and nothing
   in the corpus read it, so the sunset suppressed nothing. This script reads
   production/canonical-dump.json only — no `@/` alias, no build — and prints:

     1. the WRITE side  : every node in the corpus that writes marketing_suppression
     2. the READ side   : every journey whose own data names that state
     3. the PARTITION   : every journey with a communication action, grouped by
                          the declared purpose class the gate is scoped to, with
                          the read side marked - so a promotional or lifecycle
                          journey that does not read it shows up as a FAIL, and a
                          transactional/service/security one that does reads as a
                          FAIL in the other direction.

     node scripts/sunset-suppression-evidence.mjs            # human report
     node scripts/sunset-suppression-evidence.mjs --quiet    # exit code only

   Exit 1 on any failure in either direction. */
import fs from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname;
const dump = JSON.parse(fs.readFileSync(ROOT + "production/canonical-dump.json", "utf8"));
const journeys = dump.journeys;
const QUIET = process.argv.includes("--quiet");
const say = (...a) => { if (!QUIET) console.log(...a); };

const FIELD = "marketing_suppression";
/* The purposes the sunset scope closes (CON-300 s.scope), and the ones it
   deliberately leaves open (CON-300 s.transactional, GLB-30, GLB-31). */
const SUPPRESSED_CLASSES = new Set(["promotional", "lifecycle"]);

/* ------------------------------------------------------------- write side */
const writers = [];
for (const j of journeys)
  for (const n of j.nodes ?? [])
    for (const w of n.writes ?? [])
      if (w.field === FIELD) writers.push({ id: j.id, node: n.id, mode: w.mode });

/* -------------------------------------------------------------- read side
   A journey READS the suppression when its own declared data names the state:
   the `s.sunset` suppression id, the field, or the journey that records it. */
const readsIt = (j) => {
  const prose = JSON.stringify([j.eligibility ?? null, j.suppressions ?? null, j.guardrails ?? null]);
  return (j.suppressions ?? []).some((s) => s.id === "s.sunset") || prose.includes(FIELD);
};
const readers = journeys.filter(readsIt).map((j) => j.id);

/* ------------------------------------------------------------- partition */
const communicating = journeys.filter((j) => (j.nodes ?? []).some((n) => n.execution === "communication"));
const rows = communicating.map((j) => ({
  id: j.id,
  name: j.shortName ?? j.name,
  cls: j.contact?.defaultPriority ?? "(no contact block)",
  reads: readsIt(j),
}));

const shouldRead = rows.filter((r) => SUPPRESSED_CLASSES.has(r.cls));
const shouldNot = rows.filter((r) => !SUPPRESSED_CLASSES.has(r.cls));
const missing = shouldRead.filter((r) => !r.reads);
const spurious = shouldNot.filter((r) => r.reads);

/* ----------------------------------------------------------------- report */
say(`corpus: ${journeys.length} journeys · ${communicating.length} with a communication action\n`);

say(`WRITE SIDE - nodes writing "${FIELD}": ${writers.length}`);
for (const w of writers) say(`  ${w.id}  ${w.node}  (${w.mode})`);

say(`\nREAD SIDE - journeys naming that state in their own data: ${readers.length}`);
for (const r of readers) say(`  ${r}`);

say(`\nSUPPRESSED CLASSES (${[...SUPPRESSED_CLASSES].join(", ")}) - must read: ${shouldRead.length}`);
for (const r of shouldRead.sort((a, b) => a.cls.localeCompare(b.cls) || a.id.localeCompare(b.id)))
  say(`  ${r.reads ? "reads " : "MISS  "} ${r.id.padEnd(8)} ${r.cls.padEnd(12)} ${r.name}`);

say(`\nEVERY OTHER CLASS - must NOT read: ${shouldNot.length}`);
const byClass = {};
for (const r of shouldNot) (byClass[r.cls] ??= []).push(r);
for (const [cls, list] of Object.entries(byClass).sort())
  say(`  ${cls.padEnd(22)} ${list.length.toString().padStart(3)}  ${list.filter((r) => r.reads).length} reading (must be 0)`);

const fails = [];
if (writers.length === 0) fails.push(`nothing writes ${FIELD}`);
for (const r of missing) fails.push(`${r.id} (${r.cls}) does not read the suppression`);
for (const r of spurious) fails.push(`${r.id} (${r.cls}) reads a suppression scoped to promotional and lifecycle sends`);

if (fails.length) {
  console.error(`\nFAIL (${fails.length})`);
  for (const f of fails) console.error("  " + f);
  process.exit(1);
}
say(`\nPASS - ${writers.length} writer, ${shouldRead.length}/${shouldRead.length} suppressed-class journeys read it, 0 of ${shouldNot.length} others do.`);
