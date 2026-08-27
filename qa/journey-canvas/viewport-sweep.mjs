import pkg from "/opt/node22/lib/node_modules/playwright/index.js";
import { readFile, writeFile } from "node:fs/promises";
const { chromium } = pkg;

// Phase C: responsive automated run at the two intermediate breakpoints the
// main full-sweep-255.mjs doesn't cover (it already tests 1440 desktop and
// 375 mobile). 1024 and 768 both exceed MOBILE_BREAKPOINT (640px) so they
// take the SAME desktop code path as 1440 - same isMobile() branch, same
// node/edge world-coordinates - but initialZoom()'s fit-to-contain
// computation and centerInitial()'s entry-visibility clamp both depend on
// el.clientWidth, so the RENDERED pixel geometry (and therefore collision
// detection, which operates on getBoundingClientRect output) can genuinely
// differ at a narrower viewport. Hence testing it for real rather than
// assuming invariance.

const BASE = "http://localhost:4022";
const dump = JSON.parse(await readFile("/home/user/alidemirbas-pro/production/canonical-dump.json", "utf8"));

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

const VIEWPORTS = [
  { label: "1024", width: 1024, height: 900 },
  { label: "768", width: 768, height: 900 },
];

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const results = [];
let i = 0;
for (const j of dump.journeys) {
  i++;
  for (const vp of VIEWPORTS) {
    const row = { id: j.id, viewport: vp.label, checks: {} };
    try {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      const consoleErrors = [];
      page.on("pageerror", (e) => consoleErrors.push(e.message));
      page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
      await page.goto(`${BASE}/qa-canvas-sweep/${encodeURIComponent(j.id)}`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(300);

      const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      row.checks.pageOverflow = { pass: pageOverflow === 0, pageOverflow };

      const nodeRects = await page.evaluate(() =>
        Array.from(document.querySelectorAll("[data-canvas-node-id]")).map((el) => {
          const r = el.getBoundingClientRect();
          return { id: el.getAttribute("data-canvas-node-id"), x: r.x, y: r.y, width: r.width, height: r.height };
        }),
      );
      const overlaps = [];
      for (let a = 0; a < nodeRects.length; a++)
        for (let b = a + 1; b < nodeRects.length; b++)
          if (rectsOverlap(nodeRects[a], nodeRects[b])) overlaps.push([nodeRects[a].id, nodeRects[b].id]);
      row.checks.nodeOverlap = { overlaps, pass: overlaps.length === 0 };

      const labelRects = await page.evaluate(() =>
        Array.from(document.querySelectorAll("[data-canvas-edge-label]"))
          .filter((el) => el.getAttribute("data-canvas-edge-label"))
          .map((el) => {
            const span = el.querySelector("span");
            if (!span) return null;
            const r = span.getBoundingClientRect();
            return { label: el.getAttribute("data-canvas-edge-label"), x: r.x, y: r.y, width: r.width, height: r.height };
          })
          .filter(Boolean),
      );
      const labelVsLabel = [];
      for (let a = 0; a < labelRects.length; a++)
        for (let b = a + 1; b < labelRects.length; b++)
          if (rectsOverlap(labelRects[a], labelRects[b])) labelVsLabel.push([labelRects[a].label, labelRects[b].label]);
      const labelVsNode = [];
      for (const lr of labelRects) for (const nr of nodeRects) if (rectsOverlap(lr, nr)) labelVsNode.push([lr.label, nr.id]);
      row.checks.labelCollision = { labelVsLabel, labelVsNode, pass: labelVsLabel.length === 0 && labelVsNode.length === 0 };

      const canvasBounds = await page.evaluate(() => {
        const container = document.querySelector(".altor-dot-grid");
        const world = container?.querySelector(":scope > div");
        if (!world) return null;
        return { scrollWidth: container.scrollWidth, scrollHeight: container.scrollHeight };
      });
      row.checks.canvasBounds = { pass: !!canvasBounds };

      const entryVisibility = await page.evaluate(() => {
        const container = document.querySelector(".altor-dot-grid");
        const trigger = document.querySelector('[data-canvas-node-kind="trigger"]');
        if (!container || !trigger) return null;
        const cRect = container.getBoundingClientRect();
        const tRect = trigger.getBoundingClientRect();
        const visible = tRect.right > cRect.left && tRect.left < cRect.right && tRect.bottom > cRect.top && tRect.top < cRect.bottom;
        return { visible };
      });
      row.checks.entryVisibleOnLoad = { pass: !!entryVisibility?.visible };

      row.checks.consoleErrors = { errors: consoleErrors, pass: consoleErrors.length === 0 };

      await page.close();
    } catch (e) {
      row.error = e.message;
    }
    results.push(row);
  }
  if (i % 40 === 0) console.log(`...${i}/${dump.journeys.length}`);
}
await browser.close();
await writeFile("/tmp/viewport-sweep-report.json", JSON.stringify(results, null, 2));

const fails = results.filter((r) => !r.error && Object.values(r.checks).some((c) => c.pass === false));
const errors = results.filter((r) => r.error);
console.log(`Done. ${results.length} rows (${dump.journeys.length} journeys x ${VIEWPORTS.length} viewports).`);
console.log(`${fails.length} rows with a failing check:`, JSON.stringify(fails.map((f) => ({ id: f.id, viewport: f.viewport, checks: Object.fromEntries(Object.entries(f.checks).filter(([, c]) => c.pass === false)) }))));
console.log(`${errors.length} rows with an error:`, JSON.stringify(errors.map((e) => ({ id: e.id, viewport: e.viewport, error: e.error }))));
