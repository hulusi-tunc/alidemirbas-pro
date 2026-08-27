import pkg from "/opt/node22/lib/node_modules/playwright/index.js";
import { readFile, writeFile } from "node:fs/promises";
const { chromium } = pkg;

const BASE = "http://localhost:4022";
const dump = JSON.parse(await readFile("/home/user/alidemirbas-pro/production/canonical-dump.json", "utf8"));
const topology = JSON.parse(await readFile("/tmp/topology-inventory.json", "utf8"));
const topoById = new Map(topology.map((t) => [t.id, t]));

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

// ---- Part 1: batch page-load timing across all 255 (a practical proxy for
// SSR + hydration + layoutJourneyCanvas cost together, since the pure
// layout function has no isolated production entry point worth adding
// debug instrumentation for) ----
const loadTimes = [];
for (const j of dump.journeys) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const start = Date.now();
  await page.goto(`${BASE}/qa-canvas-sweep/${encodeURIComponent(j.id)}`, { waitUntil: "networkidle", timeout: 30000 });
  const navTiming = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    return nav ? { domContentLoaded: nav.domContentLoadedEventEnd, loadEvent: nav.loadEventEnd, responseEnd: nav.responseEnd } : null;
  });
  const elapsed = Date.now() - start;
  loadTimes.push({ id: j.id, nodeCount: topoById.get(j.id)?.nodeCount, elapsedMs: elapsed, navTiming });
  await page.close();
}

function percentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.floor((p / 100) * (sorted.length - 1));
  return sorted[idx];
}
const elapsedValues = loadTimes.map((l) => l.elapsedMs);
console.log("=== Batch page-load timing (all 255, includes SSR+hydration+layout+paint) ===");
console.log(JSON.stringify({
  min: Math.min(...elapsedValues),
  median: percentile(elapsedValues, 50),
  p95: percentile(elapsedValues, 95),
  max: Math.max(...elapsedValues),
  total: elapsedValues.reduce((a, b) => a + b, 0),
}));
const slowest = [...loadTimes].sort((a, b) => b.elapsedMs - a.elapsedMs).slice(0, 5);
console.log("slowest 5:", JSON.stringify(slowest.map((s) => ({ id: s.id, nodeCount: s.nodeCount, elapsedMs: s.elapsedMs }))));

// ---- Part 2: interaction responsiveness for 5 representative journeys ----
const analyzed = topology;
const bySize = [...analyzed].sort((a, b) => a.nodeCount - b.nodeCount);
const REPS = [
  { label: "small", id: bySize[Math.floor(bySize.length * 0.1)].id },
  { label: "median", id: bySize[Math.floor(bySize.length * 0.5)].id },
  { label: "large", id: bySize[Math.floor(bySize.length * 0.9)].id },
  { label: "largest", id: [...analyzed].sort((a, b) => b.nodeCount - a.nodeCount)[0].id },
  { label: "most complex (nodes+edges+conditions+merges)", id: [...analyzed].sort((a, b) => (b.nodeCount + b.edgeCount + b.conditionCount * 3 + b.mergeCount * 3) - (a.nodeCount + a.edgeCount + a.conditionCount * 3 + a.mergeCount * 3))[0].id },
];
console.log("\n=== Interaction responsiveness (5 representative journeys) ===");
const interactionResults = [];
for (const { label, id } of REPS) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await page.goto(`${BASE}/qa-canvas-sweep/${encodeURIComponent(id)}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);

  const zoomBtn = page.locator('button[aria-label*="zoom in" i]');
  const t0 = Date.now();
  await zoomBtn.first().click();
  await page.waitForFunction(() => true); // yields a frame
  const zoomMs = Date.now() - t0;

  const fitBtn = page.locator('button[aria-label*="fit" i]');
  const t1 = Date.now();
  await fitBtn.first().click();
  await page.waitForFunction(() => true);
  const fitMs = Date.now() - t1;

  const node = page.locator("[data-canvas-node-id]").first();
  const t2 = Date.now();
  await node.click();
  await page.waitForSelector('[role="dialog"]', { timeout: 3000 }).catch(() => {});
  const drawerOpenMs = Date.now() - t2;

  const closeBtn = page.locator('[role="dialog"] button').first();
  const t3 = Date.now();
  if (await closeBtn.count()) await closeBtn.click();
  await page.waitForFunction(() => true);
  const drawerCloseMs = Date.now() - t3;

  const result = { label, id, zoomMs, fitMs, drawerOpenMs, drawerCloseMs };
  interactionResults.push(result);
  console.log(JSON.stringify(result));
  await page.close();
}

await browser.close();
await writeFile("/tmp/perf-test-report.json", JSON.stringify({ loadTimes, interactionResults }, null, 2));
console.log("\nDone.");
