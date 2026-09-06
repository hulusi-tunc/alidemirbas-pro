import { JOURNEYS, byId } from "@/canonical";
import { surfaceOf } from "@/canonical/surface";
import type { CanonicalJourney } from "@/canonical/types";

/* THE PUBLIC CORPUS GATE (2026-09-05).

   The Operational Workflows surface was removed from the public website and
   archived - see archive/operational-workflows/README.md. This module is the
   ONE place that decision is encoded, and every public projection of the
   canonical library reads it: the journey rows and counts (canonical-view.ts),
   the detail routes' static params, the sitemap, the search index (via
   production/surface-assignment.json, which encodes the same rule), and every
   cross-journey link the detail pages render.

   WHY A GATE AND NOT A MOVE. The 124 operational journeys are not a
   detachable corpus: 54 customer and mechanism journeys hand off INTO them
   (78 handoff edges to 23 targets; 67 reference them once `distinctFrom` rows
   are counted), 3 orchestration rules name them, and 3 retired ids
   redirect into them. `validate:canonical` requires every handoff target to
   exist, and the records are interleaved across 18 of the 26 hand-authored
   domain files. Moving them out of src/canonical/ would corrupt the customer
   journeys that depend on them. So the canonical graph stays whole as the
   engineering source of truth, and the WEBSITE stops projecting one surface
   of it. The archive directory holds a complete verbatim export for reuse.

   The predicate is the surface rule itself (src/canonical/surface.ts), not a
   hand-kept id list: a journey is public unless its derived surface is
   `operational`. Correcting a journey's facts moves it across this line
   exactly as it moves it across the site's surfaces - there is no override
   field and nothing to keep in sync.

   Restoring the surface to the public site is: delete this module's filter
   (make `isPublicJourney` return true), re-add the "operational-workflows"
   SurfaceKey in canonical-view.ts and its copy in content.ts, and restore the
   two route shells from archive/operational-workflows/routes/. Nothing else
   knows the surface ever left. */

export const ARCHIVED_SURFACE = "operational" as const;

export function isPublicJourney(j: Pick<CanonicalJourney, "id" | "category" | "channels" | "entity">): boolean {
  return surfaceOf(j).surface !== ARCHIVED_SURFACE;
}

/** Every journey the public site is allowed to route to, list, count, or
    link. Order is the canonical library's own. */
export const PUBLIC_JOURNEYS: readonly CanonicalJourney[] = JOURNEYS.filter(isPublicJourney);

const PUBLIC_IDS: ReadonlySet<string> = new Set(PUBLIC_JOURNEYS.map((j) => j.id));

/** Whether a journey id - after following merged-id redirects, exactly as
    `byId` does - lands on a public journey. False for an archived journey,
    for a retired id whose survivor is archived, for `external:` targets and
    for anything unknown. Used wherever a detail page would otherwise build a
    link to another journey: an archived target renders as text, never as a
    link to a route that no longer exists. */
export function isPublicJourneyId(id: string): boolean {
  const target = byId(id);
  return target !== undefined && PUBLIC_IDS.has(target.id);
}

/** THE LIBRARY, as the public site states it (2026-09-05, product decision):
    the Customer Journeys surface - a public journey whose own work reaches a
    person, by message or by routing the work to someone. This is the exact
    listing rule canonical-view.ts's `surfaceKeyOf` applies for the
    "customer-journeys" key; canonical-view asserts the two agree at module
    load. The 64 silent lifecycle states and 25 runtime mechanisms are still
    public, still routed and still counted on their OWN surface pages - they
    are just not what "the library" means in a headline, a project card or a
    metadata description. Every public count derives from this list. */
export function isLibraryJourney(j: Pick<CanonicalJourney, "id" | "category" | "channels" | "entity">): boolean {
  const sf = surfaceOf(j);
  return sf.surface === "customer" && (sf.sends || sf.routesToHuman);
}

export const LIBRARY_JOURNEYS: readonly CanonicalJourney[] = PUBLIC_JOURNEYS.filter(isLibraryJourney);

/** The size of the archived remainder - kept as a real number the archive
    README and the validators can be checked against, never rendered on a
    public page. */
export const ARCHIVED_JOURNEY_COUNT = JOURNEYS.length - PUBLIC_JOURNEYS.length;
