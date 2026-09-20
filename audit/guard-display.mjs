/* P0 guard: proves, against a REAL render, that the display graph never
   silently drops business logic, and that canonical semantics are unchanged.

   Written after the shipped `collapsibleGates` rule was found erasing
   authored decisions in five journeys (RET-24, TIM-63, RET-30, RET-32,
   ACQ-13). Those were caught by human-style reading; this catches the same
   class mechanically, so the next over-eager display rule fails here instead
   of on the site.

     node audit/guard-display.mjs [port]

   Checks, per journey, in both locales:
     G1  every canonical exit that a DRAWN node still leads to is drawn
     G2  the same for handoffs - ownership transfer never vanishes from
         under a branch that is still on screen
     G5  every journey draws at least one ending, which is what makes the
         unreachability exception in G1/G2 safe rather than a loophole
     G6  a condition may only be missing from the canvas if it matches the
         one sanctioned gate shape - this is what still catches a business
         decision being collapsed, now that G1 no longer can
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

    /* G1 / G2 - endings and handoffs.

       An ending may legitimately be absent when the collapses made it
       UNREACHABLE: a gate that draws no box takes its "record why nothing
       was sent" hop with it, and an exit reached only through that hop has
       nothing left pointing at it. ACQ-11 keeps its `x.no-action` because
       `c.eligible` also points there and does not collapse; RET-290 and
       FUL-291 do not, because the collapsed gates are the only way in. Both
       are correct.

       What is never correct is an ending that vanishes while something
       STILL DRAWN points at it - that is a branch running off the edge of
       the canvas, and it is the failure this guard was written for (the
       PR #9 gate collapse erased endings in five journeys). So the test is
       not "is it drawn" but "is it drawn IF a drawn node still leads to
       it". G5 below then catches the degenerate case this exception could
       otherwise permit: a journey with no visible ending at all. */
    const canonicalParents = new Map();
    for (const n of j.nodes) {
      const targets =
        n.kind === "condition" ? n.branches.map((b) => b.to)
        : n.kind === "wait" ? [n.onEvent, n.onTimeout]
        : n.next ? [n.next] : [];
      for (const t of targets) {
        if (!t) continue;
        if (!canonicalParents.has(t)) canonicalParents.set(t, new Set());
        canonicalParents.get(t).add(n.id);
      }
    }
    for (const n of j.nodes) {
      if (n.kind !== "exit" && n.kind !== "handoff") continue;
      if (drawnCanonical.has(n.id)) continue;
      const liveParents = [...(canonicalParents.get(n.id) ?? [])].filter((p) => drawnCanonical.has(p));
      if (liveParents.length === 0) continue; // unreachable after the collapses - correct
      findings.push({
        severity: "P0",
        check: n.kind === "handoff" ? "G2_HANDOFF_MISSING" : "G1_EXIT_MISSING",
        journey: m.journey_id, lang, node: n.id,
        detail: `${n.kind === "exit" ? `exit class=${n.class ?? "-"}` : `handoff to ${n.to}`} not drawn, but ${liveParents.join(", ")} still is`,
      });
    }

    // G5 - a journey must show SOMEWHERE to end. The G1/G2 exception above
    // is safe only while this holds.
    if (!j.nodes.some((n) => (n.kind === "exit" || n.kind === "handoff") && drawnCanonical.has(n.id))) {
      findings.push({
        severity: "P0", check: "G5_NO_VISIBLE_ENDING", journey: m.journey_id, lang,
        detail: "no exit or handoff is drawn at all - the canvas shows a journey that never ends",
      });
    }

    /* G6 - WHICH decisions were allowed to disappear.

       Relaxing G1/G2 to "only if a drawn node still leads there" is correct,
       but on its own it re-opens the exact hole this guard exists to close.
       The PR #9 failure was a business decision being COLLAPSED; its exits
       then vanished as a consequence, and with the decision itself hidden
       there is no drawn parent left to flag. RET-24 would still be caught by
       G5 (x.monitor was its only ending) - TIM-63, RET-30, RET-32 and ACQ-13
       would not have been.

       So this checks the collapse's own output directly: a condition may be
       missing from the canvas ONLY if it matches the one sanctioned shape -
       exactly two branches, one arm reaching a `no-action` exit THROUGH a
       bookkeeping hop (the "record why nothing was sent" step). That is the
       signature `collapsibleGates` requires, and stating it here as an
       assertion about the RESULT means a future widening of the rule fails
       this check until somebody changes it on purpose. Any other hidden
       condition is a decision the reader lost. */
    for (const n of j.nodes) {
      if (n.kind !== "condition" || drawnCanonical.has(n.id)) continue;
      const byId = new Map(j.nodes.map((x) => [x.id, x]));
      const arms = n.branches.map((b) => byId.get(b.to));
      const viaHop = arms.filter((t) => {
        if (!t || t.kind !== "action" || t.execution) return false;
        const end = byId.get(t.next);
        return end && end.kind === "exit" && end.class === "no-action";
      });
      const sanctioned = n.branches.length === 2 && viaHop.length === 1;
      if (!sanctioned) {
        findings.push({
          severity: "P0", check: "G6_DECISION_HIDDEN", journey: m.journey_id, lang, node: n.id,
          detail: `"${(n.asks ?? "").slice(0, 60)}" is not drawn and does not match the sanctioned gate shape (${n.branches.length} branches, ${viaHop.length} recording arm)`,
        });
      }
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
console.log(`G1/G2/G3/G5/G6 findings: ${p0.length}`);
for (const f of p0.slice(0, 25)) console.log(`  ${f.check} ${f.journey} [${f.lang}] ${f.node ?? ""} - ${f.detail}`);
if (p0.length > 25) console.log(`  ... and ${p0.length - 25} more`);
console.log(canonicalDrift.length === 0 && p0.length === 0 ? "\nRESULT: PASS" : "\nRESULT: FAIL");
process.exit(canonicalDrift.length === 0 && p0.length === 0 ? 0 : 1);
