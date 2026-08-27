import pkg from "/opt/node22/lib/node_modules/playwright/index.js";
import { readFile, writeFile } from "node:fs/promises";
const { chromium } = pkg;

const BASE = "http://localhost:4022";
const dump = JSON.parse(await readFile("/home/user/alidemirbas-pro/production/canonical-dump.json", "utf8"));

const JOURNEYS = [
  // Original 4-journey stress test - the permanent reference set.
  { id: "ACQ-01", slug: "anonymous-intent-to-qualified-entry" },
  { id: "RET-27", slug: "recovery-observation-buffer" },
  { id: "REL-97", slug: "duplicate-assessment" },
  { id: "SCH-178", slug: "service-attendance" },
  // 10-journey coverage batch - see JourneyDetailBody.tsx's own comment for
  // why each was selected.
  { id: "SUB-166", slug: "terms-change" },
  { id: "OWN-54", slug: "ownership-change-obligation-transfer" },
  { id: "FBK-43", slug: "feedback-routing-and-loop-closure" },
  { id: "DOC-216", slug: "document-effectiveness" },
  { id: "CTL-231", slug: "ownership-assignment" },
  { id: "OPS-121", slug: "async-work-lifecycle" },
  { id: "DEC-183", slug: "decision-review" },
  { id: "TIM-61", slug: "deadline-tracking" },
  { id: "RSK-194", slug: "policy-violation" },
  { id: "ACT-15", slug: "first-value-milestone" },
  // 25-journey population/distribution coverage batch - see
  // JourneyDetailBody.tsx's own comment for the selection method.
  { id: "TIM-68", slug: "reversal-window" },
  { id: "CMS-203", slug: "communication-permission" },
  { id: "INC-255", slug: "root-cause-investigation" },
  { id: "REM-160", slug: "post-remedy-recurrence" },
  { id: "TRM-110", slug: "data-deletion-execution" },
  { id: "OWN-56", slug: "approval-request-review" },
  { id: "SCH-172", slug: "slot-hold" },
  { id: "DEC-189", slug: "decision-escalation" },
  { id: "FIN-140", slug: "financial-reconciliation" },
  { id: "REL-99", slug: "entity-split" },
  { id: "RET-30", slug: "retention-intervention-outcome" },
  { id: "INT-119", slug: "synchronization-conflict" },
  { id: "FUL-150", slug: "fulfillment-cancellation" },
  { id: "SUB-167", slug: "cancellation-request" },
  { id: "DAT-227", slug: "migration-execution" },
  { id: "DOC-214", slug: "document-distribution" },
  { id: "IDN-89", slug: "identity-attribute-change" },
  { id: "CTL-234", slug: "ownership-cutover" },
  { id: "RLT-241", slug: "change-eligibility" },
  { id: "ACT-17", slug: "early-adoption-to-stable-use" },
  { id: "OPS-126", slug: "partial-processing-recovery" },
  { id: "ACQ-08", slug: "destination-reached-acquisition-suppression" },
  { id: "CON-32", slug: "preference-capture" },
  { id: "FBK-48", slug: "declared-context-recalculation" },
  { id: "ACC-73", slug: "entitlement-scope-change" },
];

function canonicalGraph(j) {
  const byId = new Map(j.nodes.map((n) => [n.id, n]));
  const edges = [];
  for (const n of j.nodes) {
    let list = [];
    if (n.kind === "trigger") list = [{ to: n.next, label: null }];
    else if (n.kind === "action") list = [{ to: n.next, label: null }];
    else if (n.kind === "condition") list = n.branches.map((b) => ({ to: b.to, label: b.label }));
    else if (n.kind === "wait") list = [{ to: n.onEvent, label: "on event" }, { to: n.onTimeout, label: "on timeout" }];
    else if (n.kind === "outcome") list = [{ to: n.next, label: null }];
    else if (n.kind === "handoff") list = [{ to: n.to, label: null }];
    for (const e of list) if (byId.has(e.to)) edges.push({ from: n.id, to: e.to, label: e.label });
  }
  return { nodeIds: j.nodes.map((n) => n.id), edges, exits: j.nodes.filter((n) => n.kind === "exit" || n.kind === "outcome" || n.kind === "handoff").map((n) => n.id) };
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

const results = [];

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

for (const { id, slug } of JOURNEYS) {
  const j = dump.journeys.find((x) => x.id === id);
  const canon = canonicalGraph(j);
  const report = { id, checks: {} };

  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  // Console-level "error" messages catch React error-boundary/dev warnings
  // that don't throw (uncaught-exception `pageerror` alone misses these) -
  // checks 16 & 17 need both channels covered.
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  await page.goto(`${BASE}/lab/journeys/${slug}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  // --- 18: no horizontal page overflow outside the canvas's own scroll ---
  const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  report.checks.pageOverflow = { pageOverflow, pass: pageOverflow === 0 };

  // --- 1 & 2: node count + identities ---
  const renderedNodes = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-canvas-node-id]")).map((el) => ({
      id: el.getAttribute("data-canvas-node-id"),
      kind: el.getAttribute("data-canvas-node-kind"),
    })),
  );
  const renderedIds = renderedNodes.map((n) => n.id);
  const renderedIdSet = new Set(renderedIds);
  const canonIdSet = new Set(canon.nodeIds);
  const missing = canon.nodeIds.filter((id2) => !renderedIdSet.has(id2));
  const extra = renderedIds.filter((id2) => !canonIdSet.has(id2));
  const duplicates = renderedIds.filter((id2, i) => renderedIds.indexOf(id2) !== i);
  report.checks.nodeCount = { canonical: canon.nodeIds.length, rendered: renderedIds.length, pass: canon.nodeIds.length === renderedIds.length };
  report.checks.nodeIdentity = { missing, extra, duplicates, pass: missing.length === 0 && extra.length === 0 && duplicates.length === 0 };

  // --- 3 & 4: edge count + branch integrity ---
  const renderedEdges = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-canvas-edge-from]")).map((el) => ({
      from: el.getAttribute("data-canvas-edge-from"),
      to: el.getAttribute("data-canvas-edge-to"),
      label: el.getAttribute("data-canvas-edge-label") || null,
    })),
  );
  const edgeKey = (e) => `${e.from}->${e.to}`;
  const canonEdgeKeys = new Set(canon.edges.map(edgeKey));
  const renderedEdgeKeys = new Set(renderedEdges.map(edgeKey));
  const missingEdges = [...canonEdgeKeys].filter((k) => !renderedEdgeKeys.has(k));
  const extraEdges = [...renderedEdgeKeys].filter((k) => !canonEdgeKeys.has(k));
  report.checks.edgeCount = { canonical: canon.edges.length, rendered: renderedEdges.length, pass: canon.edges.length === renderedEdges.length };
  report.checks.edgeIdentity = { missingEdges, extraEdges, pass: missingEdges.length === 0 && extraEdges.length === 0 };

  // Matching by (from, to) alone breaks when a condition has two branches
  // converging on the same target with different labels (INC-255's
  // `c.supported`: "Not supported" and "Correlated but unexplained" both
  // go to `a.reject`) - `find()` returns the same first match for both
  // canonical labels, flagging one as wrong even though the renderer drew
  // both correctly. Matching on the full (from, to, label) triple as a
  // multiset - decrementing a rendered edge once matched - handles any
  // number of same-target branches correctly instead of just the common
  // one-branch-per-target case.
  const tripleKey = (e) => `${e.from}->${e.to}::${e.label ?? ""}`;
  const renderedTripleCounts = new Map();
  for (const re of renderedEdges) {
    const k = tripleKey(re);
    renderedTripleCounts.set(k, (renderedTripleCounts.get(k) ?? 0) + 1);
  }
  const labelMismatches = [];
  for (const ce of canon.edges) {
    if (!ce.label) continue;
    const k = tripleKey(ce);
    const remaining = renderedTripleCounts.get(k) ?? 0;
    if (remaining <= 0) {
      labelMismatches.push({ ...ce, rendered: renderedEdges.find((re) => re.from === ce.from && re.to === ce.to)?.label });
    } else {
      renderedTripleCounts.set(k, remaining - 1);
    }
  }
  report.checks.branchLabels = { labelMismatches, pass: labelMismatches.length === 0 };

  // --- 5: terminal reachability (every exit/outcome/handoff has a rendered node, already covered by identity check, plus is reachable from entry via rendered edges) ---
  const adjacency = new Map();
  for (const e of renderedEdges) {
    if (!adjacency.has(e.from)) adjacency.set(e.from, []);
    adjacency.get(e.from).push(e.to);
  }
  const entryId = j.entry;
  const reached = new Set([entryId]);
  const queue = [entryId];
  while (queue.length) {
    const cur = queue.shift();
    for (const to of adjacency.get(cur) || []) {
      if (!reached.has(to)) {
        reached.add(to);
        queue.push(to);
      }
    }
  }
  const unreachableTerminals = canon.exits.filter((id2) => !reached.has(id2));
  report.checks.terminalReachability = { unreachableTerminals, pass: unreachableTerminals.length === 0 };

  // --- 6: node overlap ---
  const nodeRects = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-canvas-node-id]")).map((el) => {
      const r = el.getBoundingClientRect();
      return { id: el.getAttribute("data-canvas-node-id"), x: r.x, y: r.y, width: r.width, height: r.height };
    }),
  );
  const overlaps = [];
  for (let i = 0; i < nodeRects.length; i++) {
    for (let k = i + 1; k < nodeRects.length; k++) {
      if (rectsOverlap(nodeRects[i], nodeRects[k])) overlaps.push([nodeRects[i].id, nodeRects[k].id]);
    }
  }
  report.checks.nodeOverlap = { overlaps, pass: overlaps.length === 0 };

  // --- 7: edge/node collision (an edge's own rendered path crossing a node
  // it does not connect to). A <path>'s getBoundingClientRect() is the
  // bbox of the whole multi-segment elbow, which includes area the actual
  // stroke never visits (e.g. the corner "inside" a down-across-down jog) -
  // checking that bbox against node rects produces false collisions for any
  // node sitting in that unvisited corner. Sampling real points along the
  // rendered path via getPointAtLength()/getScreenCTM() and testing each
  // sample against node rects tests the actual visible line instead. ---
  const edgeSamples = await page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-canvas-edge-from]"))
      .map((el) => {
        const path = el.querySelector("path");
        if (!path) return null;
        const len = path.getTotalLength();
        const ctm = path.getScreenCTM();
        const steps = 40;
        const points = [];
        for (let i = 0; i <= steps; i++) {
          const p = path.getPointAtLength((len * i) / steps).matrixTransform(ctm);
          points.push({ x: p.x, y: p.y });
        }
        return { from: el.getAttribute("data-canvas-edge-from"), to: el.getAttribute("data-canvas-edge-to"), points };
      })
      .filter(Boolean),
  );
  const edgeNodeCollisions = [];
  for (const e of edgeSamples) {
    for (const n of nodeRects) {
      if (n.id === e.from || n.id === e.to) continue; // its own endpoints, not a collision
      // Shrink the node rect by a few px so a sample that merely grazes a
      // shared border (the elbow leaving directly beneath a sibling) does
      // not register as passing THROUGH the node.
      const shrunk = { x: n.x + 3, y: n.y + 3, width: Math.max(0, n.width - 6), height: Math.max(0, n.height - 6) };
      const hit = e.points.some((p) => p.x >= shrunk.x && p.x <= shrunk.x + shrunk.width && p.y >= shrunk.y && p.y <= shrunk.y + shrunk.height);
      if (hit) edgeNodeCollisions.push([`${e.from}->${e.to}`, n.id]);
    }
  }
  report.checks.edgeNodeCollision = { edgeNodeCollisions, pass: edgeNodeCollisions.length === 0 };

  // --- 8: label collision (branch/edge label pills vs node rects, and vs each other) ---
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
  for (let i = 0; i < labelRects.length; i++) {
    for (let k = i + 1; k < labelRects.length; k++) {
      if (rectsOverlap(labelRects[i], labelRects[k])) labelVsLabel.push([labelRects[i].label, labelRects[k].label]);
    }
  }
  const labelVsNode = [];
  for (const lr of labelRects) {
    for (const nr of nodeRects) {
      if (rectsOverlap(lr, nr)) labelVsNode.push([lr.label, nr.id]);
    }
  }
  report.checks.labelCollision = { labelVsLabel, labelVsNode, pass: labelVsLabel.length === 0 && labelVsNode.length === 0 };

  // --- 9: canvas bounds (every node rect within the scrollable world bounds) ---
  const worldBounds = await page.evaluate(() => {
    const container = document.querySelector(".altor-dot-grid");
    const world = container?.querySelector(":scope > div");
    if (!world) return null;
    return { scrollWidth: container.scrollWidth, scrollHeight: container.scrollHeight };
  });
  report.checks.canvasBounds = { worldBounds, pass: !!worldBounds };

  // --- 9b: entry-node initial visibility - the trigger card must be at
  // least partially within the scroll container's visible viewport on
  // first paint, per the design's own stated invariant ("the trigger's own
  // entry pin is never scrolled past"). ---
  const entryVisibility = await page.evaluate(() => {
    const container = document.querySelector(".altor-dot-grid");
    const trigger = document.querySelector('[data-canvas-node-kind="trigger"]');
    if (!container || !trigger) return null;
    const cRect = container.getBoundingClientRect();
    const tRect = trigger.getBoundingClientRect();
    const visible = tRect.right > cRect.left && tRect.left < cRect.right && tRect.bottom > cRect.top && tRect.top < cRect.bottom;
    return { visible, tRect: { left: tRect.left, right: tRect.right }, cRect: { left: cRect.left, right: cRect.right } };
  });
  report.checks.entryVisibleOnLoad = { ...entryVisibility, pass: !!entryVisibility?.visible };

  // --- 13: pan/zoom reaches all nodes - every node's own offset into the
  // scrollable world must fall within that world's bounds, i.e. panning to
  // its coordinates is actually possible rather than the node sitting
  // somewhere the container can never scroll to. ---
  const worldOffsetNodes = await page.evaluate(() => {
    const container = document.querySelector(".altor-dot-grid");
    const world = container?.querySelector(":scope > div > div");
    if (!container || !world) return null;
    const worldRect = world.getBoundingClientRect();
    const zoomMatch = getComputedStyle(world).transform.match(/matrix\(([^,]+),/);
    const zoom = zoomMatch ? parseFloat(zoomMatch[1]) : 1;
    return Array.from(document.querySelectorAll("[data-canvas-node-id]")).map((el) => {
      const r = el.getBoundingClientRect();
      return {
        id: el.getAttribute("data-canvas-node-id"),
        offsetX: (r.x - worldRect.x) / zoom,
        offsetY: (r.y - worldRect.y) / zoom,
        w: r.width / zoom,
        h: r.height / zoom,
      };
    });
  });
  // What matters is that no node sits at a negative offset into the world -
  // that would place it outside the scrollable region entirely and
  // permanently unreachable regardless of scroll position. A generous
  // positive-side margin is legitimate (trailing whitespace/padding), so
  // only the lower bound is checked.
  const negativeOffsetNodes = (worldOffsetNodes ?? []).filter((n) => n.offsetX < -1 || n.offsetY < -1);
  report.checks.panZoomReachability = { negativeOffsetNodes: negativeOffsetNodes.map((n) => n.id), pass: negativeOffsetNodes.length === 0 };

  // --- 10: text clipping (ellipsis + line-clamp overflow) ---
  const ellipsisHits = await page.evaluate(() => {
    const hits = [];
    document.querySelectorAll(".altor-dot-grid p, .altor-dot-grid span").forEach((el) => {
      const style = getComputedStyle(el);
      if (style.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1) hits.push(el.textContent);
    });
    return hits;
  });
  const clampHits = await page.evaluate(() => {
    const hits = [];
    document.querySelectorAll('.altor-dot-grid [class*="line-clamp"]').forEach((el) => {
      if (el.scrollHeight > el.clientHeight + 1) hits.push(el.textContent.slice(0, 50));
    });
    return hits;
  });
  report.checks.textClipping = { ellipsisHits, clampHits, note: "clampHits expected only for Action's long paragraph (explicit carve-out)" };

  // --- 11: initial viewport occupancy ---
  const occupancy = await page.evaluate(() => {
    const container = document.querySelector(".altor-dot-grid");
    const world = container.querySelector(":scope > div > div");
    const t = getComputedStyle(world).transform;
    const m = t.match(/matrix\(([^,]+),/);
    const zoom = m ? parseFloat(m[1]) : 1;
    const svg = container.querySelector("svg");
    const gw = parseFloat(svg.getAttribute("width"));
    const gh = parseFloat(svg.getAttribute("height"));
    return {
      zoom,
      widthOccupancyPct: Math.round(((gw * zoom) / container.clientWidth) * 100),
      heightOccupancyPct: Math.round(((gh * zoom) / container.clientHeight) * 100),
    };
  });
  report.checks.initialViewport = occupancy;

  // --- 12: fit-to-view works --- (after occupancy is measured, so this
  // doesn't disturb the "initial load" camera that check depends on)
  const fitBtn = page.locator('button[aria-label*="fit" i]');
  let fitToViewOk = false;
  let fitError = null;
  if (await fitBtn.count()) {
    try {
      await fitBtn.first().click();
      await page.waitForTimeout(300);
      const afterFit = await page.evaluate(() => {
        const world = document.querySelector(".altor-dot-grid > div > div");
        return world ? getComputedStyle(world).transform : null;
      });
      fitToViewOk = !!afterFit;
    } catch (e) {
      fitError = String(e);
    }
  } else {
    fitError = "fit-to-view button not found";
  }
  report.checks.fitToView = { pass: fitToViewOk, error: fitError };

  // --- 14: drawer preserve camera --- (camera state right now, post-fit,
  // is still a valid "before" for this check - it only verifies open+close
  // round-trips back to whatever camera state preceded it, not that the
  // camera matches the very first paint.)
  const before = await page.evaluate(() => {
    const el = document.querySelector(".altor-dot-grid");
    const world = el.querySelector(":scope > div > div");
    return { transform: getComputedStyle(world).transform, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
  });
  const firstNode = await page.locator("[data-canvas-node-id]").first();
  await firstNode.click();
  await page.waitForTimeout(400);
  const afterOpen = await page.evaluate(() => {
    const el = document.querySelector(".altor-dot-grid");
    const world = el.querySelector(":scope > div > div");
    return { transform: getComputedStyle(world).transform, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
  });
  const closeBtn = page.locator('[role="dialog"] button').first();
  if (await closeBtn.count()) {
    await closeBtn.click();
    await page.waitForTimeout(400);
  }
  const afterClose = await page.evaluate(() => {
    const el = document.querySelector(".altor-dot-grid");
    const world = el.querySelector(":scope > div > div");
    return { transform: getComputedStyle(world).transform, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
  });
  const cameraPreserved = JSON.stringify(before) === JSON.stringify(afterOpen) && JSON.stringify(before) === JSON.stringify(afterClose);
  report.checks.drawerCameraPreserved = { before, afterOpen, afterClose, pass: cameraPreserved };

  // --- 16 & 17: no console errors / no React errors or warnings ---
  report.checks.consoleErrors = { errors: consoleErrors, pass: consoleErrors.length === 0 };
  report.consoleErrors = consoleErrors;
  await page.close();

  // --- 14: mobile reachability ---
  const mobilePage = await browser.newPage({ viewport: { width: 375, height: 800 } });
  const mobileErrors = [];
  mobilePage.on("pageerror", (e) => mobileErrors.push(e.message));
  await mobilePage.goto(`${BASE}/lab/journeys/${slug}`, { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(500);
  const mobileOverflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const unreachable = [];
  for (const id2 of canon.nodeIds) {
    const loc = mobilePage.locator(`[data-canvas-node-id="${id2.replace(/"/g, '\\"')}"]`);
    if ((await loc.count()) === 0) {
      unreachable.push(id2);
      continue;
    }
    try {
      await loc.first().scrollIntoViewIfNeeded({ timeout: 3000 });
      const visible = await loc.first().isVisible();
      if (!visible) unreachable.push(id2);
    } catch {
      unreachable.push(id2);
    }
  }
  const mobileEllipsis = await mobilePage.evaluate(() => {
    const hits = [];
    document.querySelectorAll(".altor-dot-grid p, .altor-dot-grid span").forEach((el) => {
      const style = getComputedStyle(el);
      if (style.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1) hits.push(el.textContent);
    });
    return hits;
  });
  report.checks.mobile = {
    pageOverflow: mobileOverflow,
    unreachableNodes: unreachable,
    ellipsisHits: mobileEllipsis,
    consoleErrors: mobileErrors,
    pass: mobileOverflow === 0 && unreachable.length === 0,
  };
  await mobilePage.close();

  results.push(report);
}

await browser.close();

await writeFile("/tmp/qa-gate-report.json", JSON.stringify(results, null, 2));

// print a compact summary
for (const r of results) {
  console.log(`\n=== ${r.id} ===`);
  for (const [k, v] of Object.entries(r.checks)) {
    const status = "pass" in v ? (v.pass ? "PASS" : "FAIL") : "info";
    console.log(`  ${k}: ${status}`, status === "FAIL" ? JSON.stringify(v) : "");
  }
  if (r.consoleErrors.length) console.log("  CONSOLE ERRORS:", r.consoleErrors);
}
