import pkg from "/opt/node22/lib/node_modules/playwright/index.js";
const { chromium } = pkg;
import { readFile, writeFile } from "node:fs/promises";

// Phase 4 + Phase 7 combined: for every one of the 255 canonical journeys,
// hit the REAL production route directly (/lab/journeys/[slug], not the
// shadow /qa-canvas-sweep/[id] bypass) and confirm it resolves to Journey
// Canvas, mounts the right journey, and shows no legacy renderer. Lighter
// than the full 18-check structural gate on purpose - renderer correctness
// is already proven; this is integration validation (does the real app
// wire it up correctly for every id).

const BASE = "http://localhost:4022";
const dump = JSON.parse(await readFile("/home/user/alidemirbas-pro/production/canonical-dump.json", "utf8"));

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const results = [];
let i = 0;
for (const j of dump.journeys) {
  i++;
  const row = { id: j.id, slug: j.slug };
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    const consoleErrors = [];
    const reactErrors = [];
    page.on("pageerror", (e) => reactErrors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    const resp = await page.goto(`${BASE}/lab/journeys/${j.slug}`, { waitUntil: "networkidle", timeout: 30000 });
    row.httpStatus = resp?.status() ?? null;
    row.httpOk = row.httpStatus === 200;

    await page.waitForTimeout(300);

    // Two things ruled out a generic regex scan over textContent here: (1)
    // "main, body" as a selector list resolves in DOCUMENT ORDER, and body
    // (which holds the page's own JSON-LD structured-data script, itself
    // full of other journeys' ids in an unrelated schema block) precedes
    // main in the DOM, so it silently picked up an unrelated id from that
    // JSON blob; (2) even scoped to `main`, \b doesn't fire between two
    // word characters, and the back-link text butts directly against the
    // id with no separating whitespace in textContent ("...journeysACQ-01
    // - Acquisition..."), so the id itself never matched and the regex
    // fell through to the next candidate elsewhere on the page. Selecting
    // the exact header paragraph directly sidesteps both problems.
    const headerText = await page.evaluate(() => document.querySelector("main p.tabular-nums")?.textContent ?? null);
    const idOnPage = headerText ? headerText.split(" - ")[0] : null;
    row.idMatches = idOnPage === j.id;
    row.idOnPage = idOnPage;

    const titleText = await page.evaluate(() => document.querySelector("h1")?.textContent ?? null);
    row.titleOnPage = titleText;
    row.titleMatches = !!titleText && titleText.includes(j.name.split(" → ")[0].slice(0, 10)) || !!titleText; // loose: h1 present and non-empty

    const canvasMounted = await page.evaluate(() => !!document.querySelector(".altor-dot-grid"));
    row.canvasMounted = canvasMounted;

    const triggerPresent = await page.evaluate(() => !!document.querySelector('[data-canvas-node-kind="trigger"]'));
    row.triggerPresent = triggerPresent;

    const nodeCount = await page.evaluate(() => document.querySelectorAll("[data-canvas-node-id]").length);
    row.renderedNodeCount = nodeCount;
    row.expectedNodeCount = j.nodes.length;
    row.nodeCountMatches = nodeCount === j.nodes.length;

    // No legacy renderer markup should ever appear now that CanonicalFlow is gone
    const legacyMarkup = await page.evaluate(() => !!document.querySelector('[data-canonical-flow], .canonical-flow'));
    row.legacyRendererVisible = legacyMarkup;

    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    row.pageOverflow = pageOverflow;
    row.noOverflow = pageOverflow === 0;

    row.consoleErrors = consoleErrors;
    row.reactErrors = reactErrors;
    row.consoleClean = consoleErrors.length === 0 && reactErrors.length === 0;

    row.pass =
      row.httpOk &&
      row.idMatches &&
      row.canvasMounted &&
      row.triggerPresent &&
      row.nodeCountMatches &&
      !row.legacyRendererVisible &&
      row.noOverflow &&
      row.consoleClean;

    await page.close();
  } catch (e) {
    row.error = e.message;
    row.pass = false;
  }
  results.push(row);
  if (i % 40 === 0) console.log(`...${i}/${dump.journeys.length}`);
}
await browser.close();
await writeFile("/tmp/real-route-smoke-255-report.json", JSON.stringify(results, null, 2));

const fails = results.filter((r) => !r.pass);
console.log(`Done. ${results.length}/${dump.journeys.length} journeys tested via real route.`);
console.log(`${results.length - fails.length}/${results.length} pass.`);
console.log(`${fails.length} failures:`, JSON.stringify(fails.map((f) => ({ id: f.id, slug: f.slug, error: f.error, httpOk: f.httpOk, idMatches: f.idMatches, canvasMounted: f.canvasMounted, triggerPresent: f.triggerPresent, nodeCountMatches: f.nodeCountMatches, legacyRendererVisible: f.legacyRendererVisible, noOverflow: f.noOverflow, consoleClean: f.consoleClean })), null, 2));
