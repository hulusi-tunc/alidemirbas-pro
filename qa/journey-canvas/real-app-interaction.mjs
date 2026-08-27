import pkg from "/opt/node22/lib/node_modules/playwright/index.js";
const { chromium } = pkg;
import { readFile, writeFile } from "node:fs/promises";

// Phase 3 + Phase 8: drive the REAL user entry points (library search ->
// intercepted modal, node drawer, Escape, browser back/forward, direct URL
// full page, refresh, another journey, TR locale, mobile) across a
// representative sample, not just synthetic direct-URL loads.

const BASE = "http://localhost:4022";
const dump = JSON.parse(await readFile("/home/user/alidemirbas-pro/production/canonical-dump.json", "utf8"));
const byId = (id) => dump.journeys.find((j) => j.id === id);

const REPS = ["ACT-15", "RSK-191", "SUB-166", "OWN-54", "ACQ-10", "DOC-216", "ACT-12", "RET-23", "CMS-203"];

const results = {};
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

// --- 1. Library -> search -> click -> intercepted modal opens ---
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const j = byId(REPS[0]);
  await page.goto(`${BASE}/lab/journeys`, { waitUntil: "networkidle" });
  await page.locator('input[placeholder]').first().fill(j.id);
  await page.waitForTimeout(300);
  await page.locator(`a[href*="${j.slug}"]`).first().click();
  await page.waitForTimeout(500);
  const modalPresent = await page.evaluate(() => !!document.querySelector('[role="dialog"][aria-labelledby="journey-modal-title"]'));
  const urlChanged = page.url().includes(j.slug);
  const canvasInModal = await page.evaluate(() => !!document.querySelector('[role="dialog"] .altor-dot-grid'));
  results.libraryToModal = { journey: j.id, modalPresent, urlChanged, canvasInModal, pass: modalPresent && urlChanged && canvasInModal };

  // --- 2. Node click -> drawer opens with content ---
  await page.locator('[data-canvas-node-id]').first().click();
  await page.waitForTimeout(300);
  const drawerOpen = await page.evaluate(() => !!document.querySelector('[role="dialog"]:not([aria-labelledby="journey-modal-title"])'));
  results.nodeDrawer = { pass: drawerOpen };

  // --- 3. Escape closes drawer (not the modal) ---
  await page.keyboard.press("Escape");
  await page.locator('[role="dialog"]:not([aria-labelledby="journey-modal-title"])').waitFor({ state: "detached", timeout: 2000 }).catch(() => {});
  const drawerGoneModalStays = await page.evaluate(() => {
    const drawer = document.querySelector('[role="dialog"]:not([aria-labelledby="journey-modal-title"])');
    const modal = document.querySelector('[role="dialog"][aria-labelledby="journey-modal-title"]');
    return { drawerGone: !drawer, modalStill: !!modal };
  });
  results.escapeClosesDrawerOnly = { ...drawerGoneModalStays, pass: drawerGoneModalStays.drawerGone && drawerGoneModalStays.modalStill };

  // --- 4. Escape again closes the modal itself, back to library ---
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  const backAtLibrary = page.url().endsWith("/lab/journeys");
  const modalGone = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
  results.escapeClosesModal = { backAtLibrary, modalGone, pass: backAtLibrary && modalGone };

  await page.close();
}

// --- 5. Direct URL load renders the FULL PAGE, not the modal ---
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const j = byId(REPS[1]);
  await page.goto(`${BASE}/lab/journeys/${j.slug}`, { waitUntil: "networkidle" });
  const isFullPage = await page.evaluate(() => !document.querySelector('[role="dialog"][aria-labelledby="journey-modal-title"]'));
  const hasBackLink = await page.evaluate(() => !!Array.from(document.querySelectorAll("a")).find((a) => a.textContent?.includes("journeys") || a.getAttribute("href") === "/lab/journeys"));
  const canvasPresent = await page.evaluate(() => !!document.querySelector(".altor-dot-grid"));
  results.directUrlFullPage = { isFullPage, hasBackLink, canvasPresent, pass: isFullPage && canvasPresent };

  // --- 6. Refresh on the same URL still works ---
  await page.reload({ waitUntil: "networkidle" });
  const stillWorks = await page.evaluate(() => !!document.querySelector(".altor-dot-grid"));
  results.refreshOnDetailUrl = { pass: stillWorks };
  await page.close();
}

// --- 7. Browser back/forward across a modal open/close cycle ---
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const j = byId(REPS[2]);
  await page.goto(`${BASE}/lab/journeys`, { waitUntil: "networkidle" });
  await page.locator('input[placeholder]').first().fill(j.id);
  await page.waitForTimeout(300);
  await page.locator(`a[href*="${j.slug}"]`).first().click();
  await page.waitForTimeout(500);
  const modalOpenedViaClick = await page.evaluate(() => !!document.querySelector('[role="dialog"][aria-labelledby="journey-modal-title"]'));

  await page.goBack({ waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const backClosesModal = await page.evaluate(() => !document.querySelector('[role="dialog"]'));

  await page.goForward({ waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const forwardReopensModal = await page.evaluate(() => !!document.querySelector('[role="dialog"][aria-labelledby="journey-modal-title"]'));

  results.browserBackForward = { modalOpenedViaClick, backClosesModal, forwardReopensModal, pass: modalOpenedViaClick && backClosesModal && forwardReopensModal };
  await page.close();
}

// --- 8. Opening one journey then another (no bleed-through of stale state) ---
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const j1 = byId(REPS[3]);
  const j2 = byId(REPS[4]);
  await page.goto(`${BASE}/lab/journeys/${j1.slug}`, { waitUntil: "networkidle" });
  const firstHeader = await page.evaluate(() => document.querySelector("[data-journey-id]")?.getAttribute("data-journey-id"));
  await page.goto(`${BASE}/lab/journeys/${j2.slug}`, { waitUntil: "networkidle" });
  const secondHeader = await page.evaluate(() => document.querySelector("[data-journey-id]")?.getAttribute("data-journey-id"));
  const secondNodeCount = await page.evaluate(() => document.querySelectorAll("[data-canvas-node-id]").length);
  results.switchBetweenJourneys = {
    firstHeader,
    secondHeader,
    firstMatches: firstHeader === j1.id,
    secondMatches: secondHeader === j2.id,
    secondNodeCountMatches: secondNodeCount === j2.nodes.length,
    pass: firstHeader === j1.id && secondHeader === j2.id && secondNodeCount === j2.nodes.length,
  };
  await page.close();
}

// --- 9. TR locale ---
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const j = byId(REPS[5]);
  const resp = await page.goto(`${BASE}/tr/lab/journeys/${j.slug}`, { waitUntil: "networkidle" });
  const canvasPresent = await page.evaluate(() => !!document.querySelector(".altor-dot-grid"));
  const headerMatches = await page.evaluate((id) => document.querySelector("[data-journey-id]")?.getAttribute("data-journey-id") === id, j.id);
  results.trLocale = { httpOk: resp?.status() === 200, canvasPresent, headerMatches, pass: resp?.status() === 200 && canvasPresent && headerMatches };
  await page.close();
}

// --- 10. Mobile: library -> detail ---
{
  const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
  const j = byId(REPS[6]);
  await page.goto(`${BASE}/lab/journeys`, { waitUntil: "networkidle" });
  await page.locator('input[placeholder]').first().fill(j.id);
  await page.waitForTimeout(300);
  await page.locator(`a[href*="${j.slug}"]`).first().click();
  await page.waitForTimeout(500);
  const canvasPresent = await page.evaluate(() => !!document.querySelector(".altor-dot-grid"));
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  results.mobileLibraryToDetail = { canvasPresent, pageOverflow, pass: canvasPresent && pageOverflow === 0 };
  await page.close();
}

// --- 11. Node drawer close via mouse (X button), then zoom/fit/reset controls ---
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const j = byId(REPS[7]);
  await page.goto(`${BASE}/lab/journeys/${j.slug}`, { waitUntil: "networkidle" });
  await page.locator('[data-canvas-node-id]').first().click();
  await page.waitForTimeout(300);
  const drawerOpen = await page.evaluate(() => !!document.querySelector('[role="dialog"]'));
  await page.locator('[role="dialog"] button').first().click();
  await page.locator('[role="dialog"]').waitFor({ state: "detached", timeout: 2000 }).catch(() => {});
  const drawerClosedViaMouse = await page.evaluate(() => !document.querySelector('[role="dialog"]'));

  const zoomBtn = page.locator('button[aria-label*="zoom in" i]');
  await zoomBtn.first().click();
  const fitBtn = page.locator('button[aria-label*="fit" i]');
  await fitBtn.first().click();
  const resetBtn = page.locator('button[aria-label*="reset" i]');
  await resetBtn.first().click();
  await page.waitForTimeout(200);
  const stillHealthy = await page.evaluate(() => !!document.querySelector(".altor-dot-grid"));

  results.drawerMouseCloseAndControls = { drawerOpen, drawerClosedViaMouse, stillHealthy, pass: drawerOpen && drawerClosedViaMouse && stillHealthy };
  await page.close();
}

await browser.close();
await writeFile("/tmp/real-app-interaction-report.json", JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
const allPass = Object.values(results).every((r) => r.pass);
console.log(`\nDone. ${Object.values(results).filter((r) => r.pass).length}/${Object.keys(results).length} interaction checks pass.`);
console.log(allPass ? "ALL PASS" : "SOME FAILED");
