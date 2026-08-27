import { readFile, writeFile } from "node:fs/promises";

const topology = JSON.parse(await readFile("/tmp/topology-inventory.json", "utf8"));
const sweep = JSON.parse(await readFile("/tmp/full-sweep-255-report.json", "utf8"));
const sweepById = new Map(sweep.map((r) => [r.id, r]));

const rows = topology.map((t) => {
  const r = sweepById.get(t.id);
  const checks = r?.checks ?? {};
  const rendered = r?.rendered ?? {};
  return {
    journeyId: t.id,
    category: t.category,
    nodeCount: t.nodeCount,
    edgeCount: t.edgeCount,
    depth: t.depth,
    conditionCount: t.conditionCount,
    waitCount: t.waitCount,
    handoffCount: t.handoffCount,
    mergeCount: t.mergeCount,
    cycleCount: t.cycleCount,
    terminalCount: t.terminalPathCount,
    maxFanOut: t.maxOutBranch,

    graphWidth: rendered.graphWidth ?? null,
    graphHeight: rendered.graphHeight ?? null,
    initialZoom: rendered.zoom ?? null,
    theoreticalFitZoom: rendered.theoreticalFitZoom ?? null,
    widthOccupancy: rendered.widthOccupancyPct ?? null,
    heightOccupancy: rendered.heightOccupancyPct ?? null,
    requiresHorizontalPan: rendered.requiresHorizontalPan ?? null,
    requiresVerticalPan: rendered.requiresVerticalPan ?? null,
    detourEdgeCount: rendered.detourEdgeCount ?? null,
    backEdgeCount: rendered.backEdgeCount ?? null,
    maxDetourDistance: rendered.maxDetourDistance ?? null,
    longestRenderedNodeHeight: rendered.longestRenderedNodeHeightPx ?? null,
    longestRenderedLabelWidth: rendered.longestRenderedLabelWidthPx ?? null,

    canonicalIntegrity: !!(checks.nodeCount?.pass && checks.nodeIdentity?.pass && checks.edgeCount?.pass && checks.edgeIdentity?.pass && checks.branchLabels?.pass && checks.terminalReachability?.pass),
    nodeOverlap: checks.nodeOverlap?.pass ?? null,
    edgeNodeCollision: checks.edgeNodeCollision?.pass ?? null,
    labelNodeCollision: checks.labelCollision ? checks.labelCollision.labelVsNode.length === 0 : null,
    labelLabelCollision: checks.labelCollision ? checks.labelCollision.labelVsLabel.length === 0 : null,
    boundsValid: checks.canvasBounds?.pass ?? null,
    textReadable: checks.textClipping ? checks.textClipping.ellipsisHits.length === 0 : null,
    mobileReachable: checks.mobile?.pass ?? null,
    drawerCameraStable: checks.drawerCameraPreserved?.pass ?? null,
    consoleClean: checks.consoleErrors?.pass ?? null,

    hadError: !!r?.error,
    error: r?.error ?? null,
  };
});

await writeFile("/home/user/alidemirbas-pro/production/journey-canvas-validation/rendered-metrics-255.json", JSON.stringify(rows, null, 2));
console.log(`Wrote ${rows.length} rows.`);
const errors = rows.filter((r) => r.hadError);
console.log(`${errors.length} rows had an error:`, JSON.stringify(errors.map((e) => e.journeyId)));
const anyFail = rows.filter((r) => !r.hadError && [r.canonicalIntegrity, r.nodeOverlap, r.edgeNodeCollision, r.labelNodeCollision, r.labelLabelCollision, r.boundsValid, r.textReadable, r.mobileReachable, r.drawerCameraStable, r.consoleClean].some((v) => v === false));
console.log(`${anyFail.length} rows have at least one QA failure:`, JSON.stringify(anyFail.map((e) => e.journeyId)));
