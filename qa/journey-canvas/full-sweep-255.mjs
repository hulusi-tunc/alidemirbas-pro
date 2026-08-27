import pkg from "/opt/node22/lib/node_modules/playwright/index.js";
import { readFile, writeFile } from "node:fs/promises";
const { chromium } = pkg;

const BASE = "http://localhost:4022";
const dump = JSON.parse(await readFile("/home/user/alidemirbas-pro/production/canonical-dump.json", "utf8"));
const topology = JSON.parse(await readFile("/tmp/topology-inventory.json", "utf8"));
const topoById = new Map(topology.map((t) => [t.id, t]));

// Optional CLI args: start/end index (1-based, inclusive) for chunked runs,
// and an id filter list, so a failure-driven re-run can target just the
// journeys that need it.
const args = process.argv.slice(2);
const startIdx = args.includes("--start") ? parseInt(args[args.indexOf("--start") + 1], 10) : 1;
const endIdx = args.includes("--end") ? parseInt(args[args.indexOf("--end") + 1], 10) : dump.journeys.length;
const onlyIds = args.includes("--ids") ? args[args.indexOf("--ids") + 1].split(",") : null;

function canonicalGraph(j) {
  const byId = new Map(j.nodes.map((n) => [n.id, n]));
  const edges = [];
  for (const n of j.nodes) {
    let list = [];
    if (n.kind === "trigger") list = n.next ? [{ to: n.next, label: null }] : [];
    else if (n.kind === "action") list = n.next ? [{ to: n.next, label: null }] : [];
    else if (n.kind === "condition") list = (n.branches || []).map((b) => ({ to: b.to, label: b.label }));
    else if (n.kind === "wait") list = [{ to: n.onEvent, label: "on event" }, { to: n.onTimeout, label: "on timeout" }].filter((e) => e.to);
    else if (n.kind === "outcome") list = n.next ? [{ to: n.next, label: null }] : [];
    else if (n.kind === "handoff") list = n.to ? [{ to: n.to, label: null }] : [];
    for (const e of list) if (byId.has(e.to)) edges.push({ from: n.id, to: e.to, label: e.label });
  }
  return {
    nodeIds: j.nodes.map((n) => n.id),
    edges,
    exits: j.nodes.filter((n) => n.kind === "exit" || n.kind === "outcome" || n.kind === "handoff").map((n) => n.id),
  };
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

const journeys = dump.journeys
  .slice(startIdx - 1, endIdx)
  .filter((j) => !onlyIds || onlyIds.includes(j.id));

console.log(`Sweeping ${journeys.length} journeys (index ${startIdx}-${endIdx})...`);

const results = [];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

let i = 0;
for (const j of journeys) {
  i++;
  const canon = canonicalGraph(j);
  const topo = topoById.get(j.id) ?? {};
  const report = { id: j.id, category: j.category, checks: {}, rendered: {} };

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
    const consoleErrors = [];
    page.on("pageerror", (e) => consoleErrors.push(e.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    await page.goto(`${BASE}/qa-canvas-sweep/${encodeURIComponent(j.id)}`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(350);

    const pageOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    report.checks.pageOverflow = { pass: pageOverflow === 0, pageOverflow };

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
    const duplicates = renderedIds.filter((id2, idx) => renderedIds.indexOf(id2) !== idx);
    report.checks.nodeCount = { canonical: canon.nodeIds.length, rendered: renderedIds.length, pass: canon.nodeIds.length === renderedIds.length };
    report.checks.nodeIdentity = { missing, extra, duplicates, pass: missing.length === 0 && extra.length === 0 && duplicates.length === 0 };

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

    const tripleKey = (e) => `${e.from}->${e.to}::${e.label ?? ""}`;
    const renderedTripleCounts = new Map();
    for (const re of renderedEdges) renderedTripleCounts.set(tripleKey(re), (renderedTripleCounts.get(tripleKey(re)) ?? 0) + 1);
    const labelMismatches = [];
    for (const ce of canon.edges) {
      if (!ce.label) continue;
      const k = tripleKey(ce);
      const remaining = renderedTripleCounts.get(k) ?? 0;
      if (remaining <= 0) labelMismatches.push({ ...ce, rendered: renderedEdges.find((re) => re.from === ce.from && re.to === ce.to)?.label });
      else renderedTripleCounts.set(k, remaining - 1);
    }
    report.checks.branchLabels = { labelMismatches, pass: labelMismatches.length === 0 };

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

    const nodeRects = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-canvas-node-id]")).map((el) => {
        const r = el.getBoundingClientRect();
        return { id: el.getAttribute("data-canvas-node-id"), x: r.x, y: r.y, width: r.width, height: r.height };
      }),
    );
    const overlaps = [];
    for (let a = 0; a < nodeRects.length; a++) {
      for (let b = a + 1; b < nodeRects.length; b++) {
        if (rectsOverlap(nodeRects[a], nodeRects[b])) overlaps.push([nodeRects[a].id, nodeRects[b].id]);
      }
    }
    report.checks.nodeOverlap = { overlaps, pass: overlaps.length === 0 };

    // edge/node collision via point-sampling the real rendered path
    const edgeSamples = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-canvas-edge-from]"))
        .map((el) => {
          const path = el.querySelector("path");
          if (!path) return null;
          const len = path.getTotalLength();
          const ctm = path.getScreenCTM();
          const steps = 40;
          const points = [];
          for (let k = 0; k <= steps; k++) {
            const p = path.getPointAtLength((len * k) / steps).matrixTransform(ctm);
            points.push({ x: p.x, y: p.y });
          }
          return { from: el.getAttribute("data-canvas-edge-from"), to: el.getAttribute("data-canvas-edge-to"), points, d: path.getAttribute("d") };
        })
        .filter(Boolean),
    );
    const edgeNodeCollisions = [];
    for (const e of edgeSamples) {
      for (const n of nodeRects) {
        if (n.id === e.from || n.id === e.to) continue;
        const shrunk = { x: n.x + 3, y: n.y + 3, width: Math.max(0, n.width - 6), height: Math.max(0, n.height - 6) };
        const hit = e.points.some((p) => p.x >= shrunk.x && p.x <= shrunk.x + shrunk.width && p.y >= shrunk.y && p.y <= shrunk.y + shrunk.height);
        if (hit) edgeNodeCollisions.push([`${e.from}->${e.to}`, n.id]);
      }
    }
    report.checks.edgeNodeCollision = { edgeNodeCollisions, pass: edgeNodeCollisions.length === 0 };

    // Phase F: detour analysis - path with 4 "L" commands is a detour (vs 1
    // for a straight line, 3 for a plain elbow)
    const detourEdges = edgeSamples.filter((e) => (e.d.match(/L/g) || []).length === 4);
    report.rendered.detourEdgeCount = detourEdges.length;
    report.rendered.backEdgeCount = topo.cycleCount ?? 0;

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
    for (let a = 0; a < labelRects.length; a++) {
      for (let b = a + 1; b < labelRects.length; b++) {
        if (rectsOverlap(labelRects[a], labelRects[b])) labelVsLabel.push([labelRects[a].label, labelRects[b].label]);
      }
    }
    const labelVsNode = [];
    for (const lr of labelRects) {
      for (const nr of nodeRects) {
        if (rectsOverlap(lr, nr)) labelVsNode.push([lr.label, nr.id]);
      }
    }
    report.checks.labelCollision = { labelVsLabel, labelVsNode, pass: labelVsLabel.length === 0 && labelVsNode.length === 0 };

    const worldBounds = await page.evaluate(() => {
      const container = document.querySelector(".altor-dot-grid");
      const world = container?.querySelector(":scope > div");
      if (!world) return null;
      return { scrollWidth: container.scrollWidth, scrollHeight: container.scrollHeight };
    });
    report.checks.canvasBounds = { worldBounds, pass: !!worldBounds };

    // Entry-node initial visibility: the trigger card must be at least
    // partially within the scroll container's visible viewport on first
    // paint, per the design's own stated invariant ("the trigger's own
    // entry pin is never scrolled past").
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

    const worldOffsetNodes = await page.evaluate(() => {
      const container = document.querySelector(".altor-dot-grid");
      const world = container?.querySelector(":scope > div > div");
      if (!container || !world) return null;
      const worldRect = world.getBoundingClientRect();
      const zoomMatch = getComputedStyle(world).transform.match(/matrix\(([^,]+),/);
      const zoom = zoomMatch ? parseFloat(zoomMatch[1]) : 1;
      return Array.from(document.querySelectorAll("[data-canvas-node-id]")).map((el) => {
        const r = el.getBoundingClientRect();
        return { id: el.getAttribute("data-canvas-node-id"), offsetX: (r.x - worldRect.x) / zoom, offsetY: (r.y - worldRect.y) / zoom };
      });
    });
    const negativeOffsetNodes = (worldOffsetNodes ?? []).filter((n) => n.offsetX < -1 || n.offsetY < -1);
    report.checks.panZoomReachability = { negativeOffsetNodes: negativeOffsetNodes.map((n) => n.id), pass: negativeOffsetNodes.length === 0 };

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
    report.checks.textClipping = { ellipsisHits, clampHits };

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
        graphWidth: gw,
        graphHeight: gh,
        widthOccupancyPct: Math.round(((gw * zoom) / container.clientWidth) * 100),
        heightOccupancyPct: Math.round(((gh * zoom) / container.clientHeight) * 100),
        theoreticalFitZoom: Math.min(container.clientWidth / gw, container.clientHeight / gh),
        requiresHorizontalPan: gw * zoom > container.clientWidth + 1,
        requiresVerticalPan: gh * zoom > container.clientHeight + 1,
      };
    });
    report.rendered = { ...report.rendered, ...occupancy };
    report.checks.initialViewport = occupancy;

    // Phase F: how much of the canvas's total width is detour lane rather
    // than node content - layout-space width beyond the rightmost node's
    // own right edge. Positive only when a detour genuinely extends past
    // every node (a detour lane that stays within the nodes' own span
    // contributes nothing extra and correctly reports 0 here).
    const worldRectX = await page.evaluate(() => {
      const world = document.querySelector(".altor-dot-grid > div > div");
      return world ? world.getBoundingClientRect().x : 0;
    });
    const nodesOnlyMaxRightLayout = Math.max(0, ...nodeRects.map((n) => (n.x + n.width - worldRectX) / occupancy.zoom));
    report.rendered.maxDetourDistance = Math.max(0, Math.round(occupancy.graphWidth - nodesOnlyMaxRightLayout));

    report.rendered.longestRenderedNodeHeightPx = Math.round(Math.max(0, ...nodeRects.map((n) => n.height / occupancy.zoom)));
    report.rendered.longestRenderedLabelWidthPx = Math.round(Math.max(0, ...labelRects.map((n) => n.width / occupancy.zoom)));

    const fitBtn = page.locator('button[aria-label*="fit" i]');
    let fitToViewOk = false;
    if (await fitBtn.count()) {
      try {
        await fitBtn.first().click();
        await page.waitForTimeout(250);
        const afterFit = await page.evaluate(() => {
          const world = document.querySelector(".altor-dot-grid > div > div");
          return world ? getComputedStyle(world).transform : null;
        });
        fitToViewOk = !!afterFit;
      } catch {
        fitToViewOk = false;
      }
    }
    report.checks.fitToView = { pass: fitToViewOk };

    const before = await page.evaluate(() => {
      const el = document.querySelector(".altor-dot-grid");
      const world = el.querySelector(":scope > div > div");
      return { transform: getComputedStyle(world).transform, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
    });
    const firstNode = page.locator("[data-canvas-node-id]").first();
    await firstNode.click();
    await page.waitForTimeout(300);
    const afterOpen = await page.evaluate(() => {
      const el = document.querySelector(".altor-dot-grid");
      const world = el.querySelector(":scope > div > div");
      return { transform: getComputedStyle(world).transform, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
    });
    const closeBtn = page.locator('[role="dialog"] button').first();
    if (await closeBtn.count()) {
      await closeBtn.click();
      await page.waitForTimeout(300);
    }
    const afterClose = await page.evaluate(() => {
      const el = document.querySelector(".altor-dot-grid");
      const world = el.querySelector(":scope > div > div");
      return { transform: getComputedStyle(world).transform, scrollLeft: el.scrollLeft, scrollTop: el.scrollTop };
    });
    const cameraPreserved = JSON.stringify(before) === JSON.stringify(afterOpen) && JSON.stringify(before) === JSON.stringify(afterClose);
    report.checks.drawerCameraPreserved = { pass: cameraPreserved };

    report.checks.consoleErrors = { errors: consoleErrors, pass: consoleErrors.length === 0 };
    await page.close();

    // mobile
    const mobilePage = await browser.newPage({ viewport: { width: 375, height: 800 } });
    const mobileErrors = [];
    mobilePage.on("pageerror", (e) => mobileErrors.push(e.message));
    await mobilePage.goto(`${BASE}/qa-canvas-sweep/${encodeURIComponent(j.id)}`, { waitUntil: "networkidle", timeout: 30000 });
    await mobilePage.waitForTimeout(300);
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
    report.checks.mobile = { pageOverflow: mobileOverflow, unreachableNodes: unreachable, consoleErrors: mobileErrors, pass: mobileOverflow === 0 && unreachable.length === 0 && mobileErrors.length === 0 };
    await mobilePage.close();
  } catch (e) {
    report.error = String(e);
  }

  results.push(report);
  if (i % 20 === 0 || i === journeys.length) console.log(`  ...${i}/${journeys.length} (${report.id})`);
}

await browser.close();
await writeFile("/tmp/full-sweep-255-report.json", JSON.stringify(results, null, 2));

const failures = results.filter((r) => r.error || Object.values(r.checks).some((v) => "pass" in v && !v.pass));
console.log(`\nDone. ${results.length} journeys processed, ${failures.length} with at least one failure.`);
for (const f of failures) {
  console.log(`FAIL ${f.id}:`, f.error ?? Object.entries(f.checks).filter(([, v]) => "pass" in v && !v.pass).map(([k]) => k).join(", "));
}
