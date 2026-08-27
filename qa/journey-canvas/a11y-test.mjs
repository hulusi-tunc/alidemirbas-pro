import pkg from "/opt/node22/lib/node_modules/playwright/index.js";
const { chromium } = pkg;

const BASE = "http://localhost:4022";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
await page.goto(`${BASE}/lab/journeys/anonymous-intent-to-qualified-entry`, { waitUntil: "networkidle" });
await page.waitForTimeout(300);

const results = {};

// 1. Keyboard reachability of inspectable nodes - Tab should reach a node button
const firstNodeId = await page.evaluate(() => document.querySelector("[data-canvas-node-id]")?.getAttribute("data-canvas-node-id"));
await page.locator(`[data-canvas-node-id="${firstNodeId}"] button`).first().focus();
const focusedIsNodeButton = await page.evaluate((id) => {
  const el = document.activeElement;
  const wrapper = el?.closest(`[data-canvas-node-id="${id}"]`);
  return !!wrapper;
}, firstNodeId);
results.nodeKeyboardFocusable = focusedIsNodeButton;

// 2. Enter/Space opens the drawer
await page.keyboard.press("Enter");
await page.waitForTimeout(300);
results.enterOpensDrawer = (await page.locator('[role="dialog"]').count()) > 0;

// 3. Focus moved into the drawer (close button) on open
const focusInDialog = await page.evaluate(() => {
  const dialog = document.querySelector('[role="dialog"]');
  return dialog ? dialog.contains(document.activeElement) : false;
});
results.focusMovesIntoDrawerOnOpen = focusInDialog;

// 4. Escape closes the drawer (poll rather than a fixed wait - the drawer's
// exit is a spring animation, not a fixed-duration transition, and AnimatePresence
// keeps it mounted until the animation actually finishes)
await page.keyboard.press("Escape");
results.escapeClosesDrawer = await page
  .locator('[role="dialog"]')
  .waitFor({ state: "detached", timeout: 2000 })
  .then(() => true)
  .catch(() => false);

// 5. Focus returns to the trigering node's button after close
const focusReturnedToTrigger = await page.evaluate((id) => {
  const el = document.activeElement;
  const wrapper = el?.closest(`[data-canvas-node-id="${id}"]`);
  return !!wrapper;
}, firstNodeId);
results.focusReturnsToTriggerOnClose = focusReturnedToTrigger;

// 6. Zoom/fit/reset controls keyboard-focusable with accessible names
const controlNames = await page.evaluate(() =>
  Array.from(document.querySelectorAll('.absolute.bottom-3.right-3 button')).map((b) => b.getAttribute("aria-label")),
);
results.controlAccessibleNames = controlNames;
results.allControlsHaveNames = controlNames.every((n) => !!n && n.length > 0);

// 7. Visible focus state on a node card (focus-visible outline present in CSS)
await page.locator(`[data-canvas-node-id="${firstNodeId}"] button`).first().focus();
const outlineStyle = await page.evaluate((id) => {
  const btn = document.querySelector(`[data-canvas-node-id="${id}"] button`);
  const cls = btn?.className ?? "";
  return { hasFocusVisibleClass: /focus-visible:outline/.test(cls) };
}, firstNodeId);
results.nodeFocusStyle = outlineStyle;

// 8. Click-to-open then close via mouse also returns focus correctly (defensive check)
await page.locator(`[data-canvas-node-id="${firstNodeId}"]`).click();
await page.waitForTimeout(300);
const closeBtn = page.locator('[role="dialog"] button').first();
await closeBtn.click();
await page.locator('[role="dialog"]').waitFor({ state: "detached", timeout: 2000 }).catch(() => {});
const mouseCloseFocusReturn = await page.evaluate((id) => {
  const el = document.activeElement;
  return el?.closest(`[data-canvas-node-id="${id}"]`) != null || el === document.body;
}, firstNodeId);
results.mouseCloseFocusBehavior = mouseCloseFocusReturn ? "returned-or-body" : "lost-elsewhere";

console.log(JSON.stringify(results, null, 2));
await browser.close();
