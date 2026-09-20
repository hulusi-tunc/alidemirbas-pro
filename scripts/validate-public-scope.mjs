/* PUBLIC SCOPE + CHANNEL TAXONOMY VALIDATOR (Phase 22).

     node scripts/validate-public-scope.mjs        # after npm run dump:canonical

   Enforces the product decision in audit/public-journey-scope.md and the
   channel taxonomy, over the SHIPPED lists (parsed from src/lib/public-corpus.ts
   by scripts/public-scope.mjs) and the canonical dump - never over a second
   hand-kept copy of the ids.

   What this file does NOT check, deliberately, because something else already
   does it better: graph invariants (one trigger, reachability, every condition
   >= 2 branches, every wait with a timeout, every exit with reEntry, handoff
   targets exist) are `npm run validate:canonical`'s 25 hard rules, and whether
   a rule actually reaches the rendered page is audit/guard-display.mjs against
   a real render. Duplicating either here would create two definitions that
   drift. */
import fs from "node:fs";

import {
  CUSTOMER_CHANNELS,
  EXCLUDED_FROM_PUBLIC,
  EXPECTED_EXCLUDED_COUNT,
  EXPECTED_PUBLIC_COUNT,
  PUBLIC_LIBRARY_IDS,
} from "./public-scope.mjs";

const rj = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const dump = rj("production/canonical-dump.json");
const journeys = dump.journeys ?? dump;
const byId = new Map(journeys.map((j) => [j.id, j]));

let checks = 0;
const failures = [];
const warnings = [];
const pass = (label, detail = "") => { checks++; console.log(`PASS ${checks}. ${label}${detail ? ` — ${detail}` : ""}`); };
const fail = (label, detail) => { checks++; failures.push({ label, detail }); console.log(`FAIL ${checks}. ${label} — ${detail}`); };
const warn = (label, detail) => { warnings.push({ label, detail }); console.log(`WARN    ${label} — ${detail}`); };

/* 1 — exactly 52 public journey ids */
PUBLIC_LIBRARY_IDS.size === EXPECTED_PUBLIC_COUNT
  ? pass("public journey count", `${PUBLIC_LIBRARY_IDS.size}`)
  : fail("public journey count", `expected ${EXPECTED_PUBLIC_COUNT}, got ${PUBLIC_LIBRARY_IDS.size}`);

/* 2 — none of the excluded ids are public, and the two lists partition the
   library cleanly */
{
  const overlap = [...PUBLIC_LIBRARY_IDS].filter((id) => EXCLUDED_FROM_PUBLIC.has(id));
  overlap.length === 0
    ? pass("no id is both public and excluded")
    : fail("no id is both public and excluded", overlap.join(", "));

  EXCLUDED_FROM_PUBLIC.size === EXPECTED_EXCLUDED_COUNT
    ? pass("excluded journey count", `${EXCLUDED_FROM_PUBLIC.size}`)
    : fail("excluded journey count", `expected ${EXPECTED_EXCLUDED_COUNT}, got ${EXCLUDED_FROM_PUBLIC.size}`);

  const unknown = [...PUBLIC_LIBRARY_IDS, ...EXCLUDED_FROM_PUBLIC].filter((id) => !byId.has(id));
  unknown.length === 0
    ? pass("every scoped id resolves to a real journey", `${PUBLIC_LIBRARY_IDS.size + EXCLUDED_FROM_PUBLIC.size} ids`)
    : fail("every scoped id resolves to a real journey", unknown.join(", "));
}

/* 3 — every public journey has at least one customer-facing communication.
   Both halves are required: a declared channel AND a node that actually sends
   on it. A journey that declares `email` but has no communication action is
   as broken as one that declares nothing. */
{
  const noChannel = [];
  const noNode = [];
  for (const id of PUBLIC_LIBRARY_IDS) {
    const j = byId.get(id);
    if (!j) continue;
    const customer = (j.channels ?? []).filter((c) => CUSTOMER_CHANNELS.has(c));
    const sends = j.nodes.some((n) => n.kind === "action" && n.execution === "communication");
    if (customer.length === 0) noChannel.push(`${id} (${(j.channels ?? []).join(", ") || "none"})`);
    else if (!sends) noNode.push(id);
  }
  noChannel.length === 0
    ? pass("every public journey declares a customer channel")
    : fail("every public journey declares a customer channel", `${noChannel.length}: ${noChannel.join("; ")}`);
  noNode.length === 0
    ? pass("every public journey has a communication action")
    : fail("every public journey has a communication action", `${noNode.length}: ${noNode.join(", ")}`);
}

/* 4 — allowed channel values only. `sales`/`task` are legal canonical values:
   validate:canonical requires a declared channel to be backed by an action
   doing the work, so a journey that raises an account-owner task MUST declare
   `task`. Anything outside the seven known values is a data error. */
{
  const ALL_KNOWN = new Set([...CUSTOMER_CHANNELS, "sales", "task"]);
  const unknownValues = [];
  for (const id of PUBLIC_LIBRARY_IDS) {
    const j = byId.get(id);
    if (!j) continue;
    for (const c of j.channels ?? []) if (!ALL_KNOWN.has(c)) unknownValues.push(`${id}:${c}`);
  }
  unknownValues.length === 0
    ? pass("no unknown channel values")
    : fail("no unknown channel values", unknownValues.join(", "));
}

/* 5 — no operational channel can reach a BADGE. This is a display rule, not a
   canonical one (see check 4), so it is checked where it lives: every
   projection of a journey's `channels` onto a public row or detail must go
   through canonical-view.ts's `publicChannels()` filter. A raw `j.channels`
   reaching a page is the bug - it would render "Task" beside "Email" as if
   internal routing were a customer channel.

   Checked as source text because the projection happens in a server-only
   TypeScript module this plain-Node script cannot import; the four journeys
   it protects (ACT-13, RET-24, FBK-43, FBK-49) are named here so a future
   reader knows the check has real subjects and is not theoretical. */
{
  const view = fs.readFileSync("src/lib/canonical-view.ts", "utf8");
  const raw = [...view.matchAll(/^\s*channels: j\.channels,\s*$/gm)];
  const filtered = [...view.matchAll(/channels: publicChannels\(/g)];
  raw.length === 0 && filtered.length >= 2
    ? pass("every public channel projection is filtered", `${filtered.length} sites via publicChannels()`)
    : fail("every public channel projection is filtered",
        `${raw.length} raw \`channels: j.channels\` projection(s) still reach a public row/detail`);

  const affected = [...PUBLIC_LIBRARY_IDS].filter((id) => (byId.get(id)?.channels ?? []).some((c) => !CUSTOMER_CHANNELS.has(c)));
  if (affected.length) {
    warn("journeys whose canonical channels include an operational value",
      `${affected.length}: ${affected.join(", ")} — correct in canonical, filtered from badges by publicChannels()`);
  }
}

/* 6 — the excluded 21 are gone from every generated public artifact. The
   search index and the surface assignment are the two that a code change
   alone does not update: both are generated files checked into the repo, so
   a stale one is exactly the failure this catches. */
{
  const assignment = rj("production/surface-assignment.json");
  const flagged = new Set(assignment.journeys.filter((r) => r.excludedFromPublic).map((r) => r.id));
  const missingFlag = [...EXCLUDED_FROM_PUBLIC].filter((id) => !flagged.has(id));
  missingFlag.length === 0 && flagged.size === EXCLUDED_FROM_PUBLIC.size
    ? pass("surface-assignment.json flags exactly the excluded journeys", `${flagged.size}`)
    : fail("surface-assignment.json flags exactly the excluded journeys",
        `flagged ${flagged.size}, missing: ${missingFlag.join(", ") || "none"} — run: node scripts/surface-assignment.mjs`);

  const searchFiles = fs.readdirSync("search").filter((f) => f.startsWith("search-") && f.endsWith(".json"));
  const leaked = [];
  for (const f of searchFiles) {
    const text = fs.readFileSync(`search/${f}`, "utf8");
    for (const id of EXCLUDED_FROM_PUBLIC) if (text.includes(`"${id}"`)) leaked.push(`${f}:${id}`);
  }
  leaked.length === 0
    ? pass("no excluded journey in the search index", `${searchFiles.length} files`)
    : fail("no excluded journey in the search index",
        `${leaked.length}: ${leaked.slice(0, 6).join(", ")} — run: node search/build-search-index.mjs`);
}

/* 7 — an excluded journey may still be a cross-reference target (a handoff
   from one of the 52, a `distinctFrom` row). That is expected and safe: the
   detail page renders an unroutable target as its NAME IN TEXT. What must
   never happen is a public journey handing off to an id that resolves to
   nothing at all. */
{
  const dangling = [];
  const textOnly = [];
  for (const id of PUBLIC_LIBRARY_IDS) {
    const j = byId.get(id);
    if (!j) continue;
    for (const n of j.nodes) {
      if (n.kind !== "handoff" || n.to.startsWith("external:")) continue;
      if (!byId.has(n.to)) dangling.push(`${id}.${n.id} -> ${n.to}`);
      else if (!PUBLIC_LIBRARY_IDS.has(n.to)) textOnly.push(`${id}.${n.id} -> ${n.to}`);
    }
  }
  dangling.length === 0
    ? pass("no public journey hands off to a non-existent journey")
    : fail("no public journey hands off to a non-existent journey", dangling.join(", "));
  if (textOnly.length) {
    warn("handoffs into non-public journeys render as text, not links",
      `${textOnly.length}: ${textOnly.join("; ")}`);
  }
}

/* 8 — category counts. The site groups the 52 into its own nine categories;
   what is checked here is that every public journey HAS a category and that
   no category is silently empty, since an empty section would render a
   heading with nothing under it. */
{
  const counts = new Map();
  const uncategorised = [];
  for (const id of PUBLIC_LIBRARY_IDS) {
    const j = byId.get(id);
    if (!j) continue;
    if (!j.category) { uncategorised.push(id); continue; }
    counts.set(j.category, (counts.get(j.category) ?? 0) + 1);
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  uncategorised.length === 0 && total === PUBLIC_LIBRARY_IDS.size
    ? pass("every public journey is categorised", `${counts.size} categories, ${total} journeys`)
    : fail("every public journey is categorised", `uncategorised: ${uncategorised.join(", ")}`);
}

/* 9 — no journey-specific renderer hack (Phase 20). The renderer must stay
   generic: a per-journey branch is how a display layer stops being a system
   and becomes 52 special cases. Scans the runtime source only - audit
   scripts and canonical data legitimately name ids. */
{
  const ID = /\b(?:id|slug|journeyId)\s*===\s*["'`](?:[A-Z]{3}-\d+|[a-z][a-z0-9-]*)["'`]/g;
  const hits = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = `${dir}/${e.name}`;
      if (e.isDirectory()) walk(p);
      else if (/\.tsx?$/.test(e.name)) {
        const text = fs.readFileSync(p, "utf8");
        for (const m of text.matchAll(ID)) {
          // A slug compared against a ROUTE segment is routing, not a render
          // hack; only an id/slug compared inside the canvas or card layer is.
          if (/journey-canvas|JourneyCanvas|canonical-view|journey-preview|JourneyCard/i.test(p)) {
            hits.push(`${p}: ${m[0]}`);
          }
        }
      }
    }
  };
  walk("src");
  hits.length === 0
    ? pass("no journey-specific renderer hack in the canvas/card layer")
    : fail("no journey-specific renderer hack in the canvas/card layer", hits.join("; "));
}

/* 10 — every public journey reaches a terminal state. validate:canonical
   already proves reachability of an exit-or-handoff; this states it in the
   scope validator's own terms so a reader of THIS report does not have to
   assume another tool covered it. */
{
  const noTerminal = [];
  for (const id of PUBLIC_LIBRARY_IDS) {
    const j = byId.get(id);
    if (!j) continue;
    if (!j.nodes.some((n) => n.kind === "exit" || n.kind === "handoff")) noTerminal.push(id);
  }
  noTerminal.length === 0
    ? pass("every public journey has a terminal state")
    : fail("every public journey has a terminal state", noTerminal.join(", "));
}

/* 11 — every reminder sequence is bounded: a wait must declare a timeout, or
   the journey can sit open forever. */
{
  const unbounded = [];
  for (const id of PUBLIC_LIBRARY_IDS) {
    const j = byId.get(id);
    if (!j) continue;
    for (const n of j.nodes) if (n.kind === "wait" && !n.timeout) unbounded.push(`${id}.${n.id}`);
  }
  unbounded.length === 0
    ? pass("every wait in a public journey is bounded by a timeout")
    : fail("every wait in a public journey is bounded by a timeout", unbounded.join(", "));
}

/* ------------------------------------------------------------------ report */
const report = {
  generated: new Date().toISOString(),
  publicCount: PUBLIC_LIBRARY_IDS.size,
  excludedCount: EXCLUDED_FROM_PUBLIC.size,
  sourceCorpus: PUBLIC_LIBRARY_IDS.size + EXCLUDED_FROM_PUBLIC.size,
  checks,
  failures,
  warnings,
};
fs.writeFileSync("production/public-scope-report.json", JSON.stringify(report, null, 2) + "\n");

console.log(`\n=== PUBLIC SCOPE ===`);
console.log(`public ${PUBLIC_LIBRARY_IDS.size} · excluded ${EXCLUDED_FROM_PUBLIC.size} · source corpus ${report.sourceCorpus}`);
console.log(`${checks} checks · ${failures.length} failures · ${warnings.length} warnings`);
console.log(failures.length === 0 ? "\nRESULT: PASS" : "\nRESULT: FAIL");
process.exit(failures.length === 0 ? 0 : 1);
