import pkg from "/opt/node22/lib/node_modules/playwright/index.js";
import { readFile } from "node:fs/promises";
const { chromium } = pkg;

const dump = JSON.parse(await readFile("/home/user/alidemirbas-pro/production/canonical-dump.json", "utf8"));
const slugById = new Map(dump.journeys.map((j) => [j.id, j.slug]));
const BASE = "http://localhost:4022";

// Pick 5 of each kind from different journeys
const samples = { trigger: [], action: [], condition: [], wait: [], handoff: [], exit: [], outcome: [] };
for (const j of dump.journeys) {
  for (const n of j.nodes) {
    if (samples[n.kind] && samples[n.kind].length < 5 && !samples[n.kind].some((s) => s.journeyId === j.id)) {
      samples[n.kind].push({ journeyId: j.id, nodeId: n.id, raw: n });
    }
  }
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const findings = [];

for (const kind of Object.keys(samples)) {
  for (const s of samples[kind]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    await page.goto(`${BASE}/lab/journeys/${slugById.get(s.journeyId)}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    await page.locator(`[data-canvas-node-id="${s.nodeId.replace(/"/g, '\\"')}"]`).click();
    await page.waitForTimeout(300);
    const drawerText = await page.evaluate(() => document.querySelector('[role="dialog"]')?.innerText ?? null);
    const hasUndefinedOrNull = drawerText && /\b(undefined|null|NaN)\b/.test(drawerText);
    findings.push({ kind, journeyId: s.journeyId, nodeId: s.nodeId, drawerTextLength: drawerText?.length ?? 0, hasUndefinedOrNull, drawerPresent: !!drawerText });
    await page.close();
  }
}

console.log(JSON.stringify(findings, null, 2));
const bad = findings.filter((f) => !f.drawerPresent || f.hasUndefinedOrNull);
console.log(`\n${findings.length} sampled, ${bad.length} with issues.`);
await browser.close();
