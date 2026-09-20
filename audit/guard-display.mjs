/* P0 guard: proves, against a REAL render, that the display graph never
   silently drops business logic, and that canonical semantics are unchanged.

   Written after the shipped `collapsibleGates` rule was found erasing
   authored decisions in five journeys (RET-24, TIM-63, RET-30, RET-32,
   ACQ-13). Those were caught by human-style reading; this catches the same
   class mechanically, so the next over-eager display rule fails here instead
   of on the site.

     node audit/guard-display.mjs [port]

   Checks, per journey, in both locales:
     G1  every canonical exit is drawn, or is unreachable once collapses
         are applied (an exit that still has a live parent must be visible)
     G2  every canonical handoff is drawn (ownership transfer is never
         allowed to vanish - there is no "unreachable handoff" exception
         that would be legitimate here)
     G3  a DRAWN condition keeps an out-edge per canonical branch, allowing
         for two sanctioned merges: twin arms to one target, and arms that
         retarget to the same collapsed destination
     G4  the canonical baseline hash is unchanged
*/
import { createHash } from "node:crypto";
import fs from "node:fs";
import puppeteer from "puppeteer-core";

const ROOT = new URL("..", import.meta.url).pathname;
const PORT = process.argv[2] ?? "4511";
const dump = JSON.parse(fs.readFileSync(ROOT + "production/canonical-dump.json", "utf8"));
const manifest = JSON.parse(fs.readFileSync(ROOT + "audit/manifest.json", "utf8"));
const baseline = JSON.parse(fs.readFileSync(ROOT + "audit/canonical-baseline.json", "utf8"));
const byJourney = new Map((dump.journeys ?? dump).map((j) => [j.id, j]));

/* --- G4: canonical guard (same projection as build-manifest.mjs) --- */
const stable = (v) => Array.isArray(v) ? v.map(stable)
  : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, stable(v[k])]))
  : v;
function semanticProjection(j) {
  const node = (n) => {
    const base = { id: n.id, kind: n.kind };
    switch (n.kind) {
      case "trigger": return { ...base, event: n.event, evidence: n.evidence, next: n.next };
      case "action": return { ...base, does: n.does, execution: n.execution ?? null, writes: n.writes ?? null, idempotencyKey: n.idempotencyKey ?? null, attemptBudget: n.attemptBudget ?? null, next: n.next };
      case "condition": return { ...base, asks: n.asks, branches: n.branches.map((b) => ({ label: b.label, when: b.when, observes: b.observes ?? null, to: b.to })) };
      case "wait": return { ...base, until: n.until, onEvent: n.onEvent, onTimeout: n.onTimeout, timeout: n.timeout, recheck: n.recheck ?? null, windowExtendsOnEngagement: n.windowExtendsOnEngagement };
      case "outcome": return { ...base, state: n.state, means: n.means ?? null, next: n.next };
      case "exit": return { ...base, state: n.state, class: n.class ?? null, terminal: n.terminal ?? false, reEntry: n.reEntry ?? null };
      case "handoff": return { ...base, to: n.to, on: n.on, carries: n.carries ?? null, suppresses: n.suppresses ?? null, contract: n.contract ?? null };
      default: return { ...base, unknown: true, raw: n };
    }
  };
  return { id: j.id, slug: j.slug, goal: j.goal, channels: j.channels, entry: j.entry, nodes: j.nodes.map(node),
    entity: j.entity ?? null, eligibility: j.eligibility ?? null, suppressions: j.suppressions ?? null, contact: j.contact ?? null,
    channelStrategy: j.channelStrategy ?? null, orchestration: j.orchestration ?? null, implementation: j.implementation ?? null,
    measurement: j.measurement ?? null, guardrails: j.guardrails ?? null, reusableRule: j.reusableRule ?? null, distinctFrom: j.distinctFrom ?? null };
}
const hashOf = (j) => "sha256:" + createHash("sha256").update(JSON.stringify(stable(semanticProjection(j)))).digest("hex");

const canonicalDrift = [];
for (const [id, b] of Object.entries(baseline)) {
  const j = byJourney.get(id);
  if (!j) { canonicalDrift.push({ id, reason: "journey missing from corpus" }); continue; }
  const now = hashOf(j);
  if (now !== b.hash) canonicalDrift.push({ id, before: b.hash.slice(0, 22), after: now.slice(0, 22) });
}

/* --- G1..G3: against the render --- */
const browser = await puppeteer.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox", "--disable-gpu"] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1200 });

const findings = [];
let i = 0;
for (const m of manifest.journeys) {
  i++;
  const j = byJourney.get(m.journey_id);
  for (const lang of ["en", "tr"]) {
    const url = `http://localhost:${PORT}${lang === "en" ? "" : "/tr"}/lab/journeys/${m.slug}#canvas`;
    let drawn;
    try {
      await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
      await new Promise((r) => setTimeout(r, 200));
      drawn = await page.evaluate(() => {
        const nodes = new Map();
        for (const el of document.querySelectorAll("[data-canvas-node-id]")) {
          nodes.set(el.getAttribute("data-canvas-node-id"), el.getAttribute("data-canvas-node-kind"));
        }
        const edges = [];
        const seen = new Set();
        for (const el of document.querySelectorAll("[data-canvas-edge-from]")) {
          const from = el.getAttribute("data-canvas-edge-from");
          const to = el.getAttribute("data-canvas-edge-to");
          const label = el.getAttribute("data-canvas-edge-label") || "";
          const k = `${from}>${to}|${label}`;
          if (seen.has(k)) continue;
          seen.add(k);
          edges.push({ from, to, label });
        }
        return { nodes: [...nodes.entries()], edges };
      });
    } catch (e) {
      findings.push({ severity: "P0", check: "RENDER", journey: m.journey_id, lang, detail: String(e).slice(0, 120) });
      continue;
    }
    const drawnCanonical = new Set([...drawn.nodes.keys ? [] : []]);
    for (const [layoutId] of drawn.nodes) drawnCanonical.add(layoutId.split("@")[0]);

    // G1 / G2 - endings and handoffs
    for (const n of j.nodes) {
      if (n.kind !== "exit" && n.kind !== "handoff") continue;
      if (drawnCanonical.has(n.id)) continue;
      findings.push({
        severity: "P0",
        check: n.kind === "handoff" ? "G2_HANDOFF_MISSING" : "G1_EXIT_MISSING",
        journey: m.journey_id, lang, node: n.id,
        detail: n.kind === "exit" ? `exit class=${n.class ?? "-"} not drawn` : `handoff to ${n.to} not drawn`,
      });
    }

    // G3 - a drawn condition keeps its branches
    const outByFrom = new Map();
    for (const e of drawn.edges) outByFrom.set(e.from, (outByFrom.get(e.from) ?? 0) + 1);
    for (const n of j.nodes) {
      if (n.kind !== "condition" || !drawnCanonical.has(n.id)) continue;
      const distinctTargets = new Set(n.branches.map((b) => b.to)).size;
      const got = outByFrom.get(n.id) ?? 0;
      if (got < distinctTargets) {
        findings.push({
          severity: "P0", check: "G3_BRANCH_LOST", journey: m.journey_id, lang, node: n.id,
          detail: `canonical ${n.branches.length} branches (${distinctTargets} distinct targets), drawn ${got} out-edges`,
        });
      }
    }
  }
  if (i % 15 === 0) console.log(`... ${i}/${manifest.journeys.length}`);
}
await browser.close();

const p0 = findings.filter((f) => f.severity === "P0");
const report = { generated: new Date().toISOString(), canonical_drift: canonicalDrift, findings };
fs.writeFileSync(ROOT + "audit/guard-report.json", JSON.stringify(report, null, 2) + "\n");

console.log(`\n=== DISPLAY GUARD ===`);
console.log(`G4 canonical drift: ${canonicalDrift.length === 0 ? "NONE (all hashes match)" : JSON.stringify(canonicalDrift)}`);
console.log(`G1/G2/G3 findings: ${p0.length}`);
for (const f of p0.slice(0, 25)) console.log(`  ${f.check} ${f.journey} [${f.lang}] ${f.node ?? ""} - ${f.detail}`);
if (p0.length > 25) console.log(`  ... and ${p0.length - 25} more`);
console.log(canonicalDrift.length === 0 && p0.length === 0 ? "\nRESULT: PASS" : "\nRESULT: FAIL");
process.exit(canonicalDrift.length === 0 && p0.length === 0 ? 0 : 1);
