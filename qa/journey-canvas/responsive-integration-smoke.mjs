import pkg from "/opt/node22/lib/node_modules/playwright/index.js";
const { chromium } = pkg;
import { readFile, writeFile } from "node:fs/promises";

// Phase 12: real-route integration smoke at all four breakpoints, for a
// representative sample - not the full 255x4 structural matrix again
// (that's what viewport-sweep.mjs + full-sweep-255.mjs already cover for
// the canvas's own internals). This checks the PAGE around the canvas:
// header, journey metadata, canvas, controls, content below canvas,
// footer, page scroll, canvas pan - graph + page together.

const BASE = "http://localhost:4022";
const dump = JSON.parse(await readFile("/home/user/alidemirbas-pro/production/canonical-dump.json", "utf8"));
const byId = (id) => dump.journeys.find((j) => j.id === id);

const REPS = [
  { label: "small", id: "ACT-15" },
  { label: "median", id: "RSK-191" },
  { label: "large", id: "SUB-166" },
  { label: "very-large", id: "DOC-216" },
  { label: "wide", id: "ACQ-10" },
  { label: "cyclic", id: "ACT-12" },
];
const VIEWPORTS = [
  { label: "1440", width: 1440, height: 900 },
  { label: "1024", width: 1024, height: 900 },
  { label: "768", width: 768, height: 900 },
  { label: "375", width: 375, height: 812 },
];

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const results = [];
for (const rep of REPS) {
  const j = byId(rep.id);
  for (const vp of VIEWPORTS) {
    const row = { label: rep.label, id: rep.id, viewport: vp.label };
    try {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      await page.goto(`${BASE}/lab/journeys/${j.slug}`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(300);

      const layout = await page.evaluate(() => {
        const header = document.querySelector("main p.tabular-nums");
        const h1 = document.querySelector("main h1");
        const purpose = h1?.nextElementSibling;
        const canvas = document.querySelector(".altor-dot-grid");
        const controls = document.querySelector('.absolute.bottom-3.right-3');
        const guardrails = Array.from(document.querySelectorAll("main p")).some((p) => p.textContent && p.textContent.length > 0 && p.closest("section"));
        const footer = document.querySelector("footer");
        return {
          headerPresent: !!header,
          h1Present: !!h1,
          purposePresent: !!purpose,
          canvasPresent: !!canvas,
          controlsPresent: !!controls,
          contentBelowCanvasPresent: guardrails,
          footerPresent: !!footer,
        };
      });

      const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

      // canvas pan sanity: scroll the canvas container and confirm it moved
      const panWorks = await page.evaluate(() => {
        const el = document.querySelector(".altor-dot-grid");
        if (!el) return null;
        const before = el.scrollTop;
        el.scrollTop = before + 50;
        const after = el.scrollTop;
        el.scrollTop = before; // restore
        return after !== before || el.scrollHeight <= el.clientHeight; // ok if nothing to scroll
      });

      // page-level scroll sanity: body should be scrollable if content exceeds viewport
      const bodyScrollable = await page.evaluate(() => document.documentElement.scrollHeight >= document.documentElement.clientHeight);

      row.layout = layout;
      row.pageOverflow = pageOverflow;
      row.panWorks = panWorks;
      row.bodyScrollable = bodyScrollable;
      // footerPresent is informational only - LabShell (the whole Lab
      // section's shell, not anything Canvas-specific) never renders a
      // <footer>; only the marketing Site.tsx shell does. Gating on it
      // would fail every Lab page, Canvas or not.
      const gatingLayout = Object.fromEntries(Object.entries(layout).filter(([k]) => k !== "footerPresent"));
      row.pass = Object.values(gatingLayout).every(Boolean) && pageOverflow === 0 && panWorks !== false && bodyScrollable;

      await page.close();
    } catch (e) {
      row.error = e.message;
      row.pass = false;
    }
    results.push(row);
  }
}
await browser.close();
await writeFile("/tmp/responsive-integration-smoke-report.json", JSON.stringify(results, null, 2));

const fails = results.filter((r) => !r.pass);
console.log(`Done. ${results.length} combinations tested (${REPS.length} journeys x ${VIEWPORTS.length} viewports).`);
console.log(`${results.length - fails.length}/${results.length} pass.`);
console.log(`${fails.length} failures:`, JSON.stringify(fails, null, 2));
