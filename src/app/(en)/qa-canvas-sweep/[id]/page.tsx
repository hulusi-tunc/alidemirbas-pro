import { notFound } from "next/navigation";

import JourneyCanvas from "@/components/JourneyCanvas";
import { journeyDetail } from "@/lib/canonical-view";

/* TEST-ONLY route, kept for `qa/journey-canvas/full-sweep-255.mjs` (see the
   validation reports in production/journey-canvas-validation/ and that
   script's own rationale in qa/journey-canvas/README.md): every journey now
   renders through JourneyCanvas via the real /lab/journeys/[slug] route too
   (there is no more per-journey gate to bypass), but this route stays
   useful for isolating RENDERER correctness from the surrounding
   application - no slug resolution, no metadata, no locale, just the same
   FlowNode[] data straight into the same component the real route uses.

   Not linked from anywhere in the site, and gated behind an explicit opt-in
   env var rather than NODE_ENV - `next start` for local QA testing already
   sets NODE_ENV=production, so gating on that would break the very
   workflow this route exists for. ENABLE_QA_CANVAS_SWEEP has to be set
   on purpose (see qa/journey-canvas/README.md) for this route to resolve
   to anything but a 404, which is what keeps it from ever becoming a
   reachable page by accident if this ships without that variable set.
   Takes the canonical journey ID directly (not the slug) since
   journeyDetail() already resolves merged-redirect IDs on its own. */
export default async function QaCanvasSweepPage({ params }: { params: Promise<{ id: string }> }) {
  if (process.env.ENABLE_QA_CANVAS_SWEEP !== "1") notFound();
  const { id } = await params;
  const detail = journeyDetail(decodeURIComponent(id));
  if (!detail) notFound();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6">
      <JourneyCanvas
        nodes={detail.nodes}
        basePath="/qa-canvas-sweep"
        labels={{
          entry: "Entry",
          zoomIn: "Zoom in",
          zoomOut: "Zoom out",
          fitToView: "Fit to view",
          reset: "Reset zoom",
          close: "Close",
          terminal: "Terminal",
        }}
      />
    </div>
  );
}
