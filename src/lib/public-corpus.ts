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

   The public website now exposes only the curated Customer Journey library.
   Silent lifecycle states, runtime mechanisms and operational workflows stay
   in the canonical graph because published journeys depend on them, but they
   are not routes, search results, sitemap entries or navigation surfaces. */

export const ARCHIVED_SURFACE = "operational" as const;

/* THE 69-JOURNEY PUBLIC LIBRARY (2026-09-20, product decision).

   UPDATE (2026-09-24): ACT-18 (Adoption Recovery) was retired from the
   canonical corpus entirely - see activation.ts's own history. The library
   is now 68; ACT-17 absorbed its stall-handling role, and RET-24's handoff
   that used to target it now targets ACT-17. Everything below that still
   says "69" is describing how the count got there, not the current total -
   see PUBLIC_LIBRARY_IDS itself for the live list.

   Batch A of the commerce / post-purchase additions - ACQ-289, RET-290,
   FUL-291, RET-292, RET-293 and RET-294 - raised this from 52/73 to 58/79.
   Batch B of the loyalty / relationship additions - RET-295, SUB-296,
   SUB-297, SUB-298 and SUB-299 - took it to 63/84. Batch D of the
   scheduling / service additions - SCH-303, SCH-304 and REM-305 - took it to
   66/87, and Batch C of the hygiene / transaction additions - CON-300,
   FUL-301 and FIN-302 - completes the seventeen at 69/90.

   The id allocation and its reasoning are audit/new-journey-id-map.md; each
   batch's ownership boundaries and touch counts are audit/batch-<x>-notes.md.

   A second, later scope decision sits on top of the Operational Workflows
   archive above: of the 90 journeys in the library surface, 69 are the public
   product and 21 are not. The decision and its reasoning are written down in
   audit/public-journey-scope.md; this is where code reads it. It was taken as
   It briefly ran at 51/22 - see audit/public-scope-validation.md for why, and
   for the finding that reversed it.

   WHY AN ID LIST AND NOT A DERIVED RULE. The archive above is a rule
   (`surface !== operational`) because it follows from facts the journey
   already states about itself. This one does not: the 21 are excluded because
   of what the product is for, not because of anything their data says. There
   is no honest predicate over `channels`/`entity`/`category` that separates
   "Refund Request" from "Payment Failure Recovery" - both are real, both
   communicate, and only a product call puts one on the site and not the
   other. Writing that call as a list keeps it reviewable; inventing a
   predicate to reproduce it would make the next reader think it was derived.

   The two lists are asserted to partition the library exactly (below), so a
   canonical edit that moves a journey across the surface line fails the build
   here instead of silently changing what the site publishes.

   Excluding them at THIS boundary is what makes the removal total: every
   public projection reads `PUBLIC_JOURNEYS`/`isPublicJourneyId`, so the rows,
   counts, detail routes, sitemap, search index, cross-journey links and both
   locale trees all drop them from one edit. An excluded journey's cross-
   reference from a journey that stayed (ACT-13 → ACT-11, FBK-43 → FBK-46,
   REM-157 → REM-152/FIN-137, SCH-280 → SCH-180, CON-272's `distinctFrom`)
   renders as the target's NAME IN TEXT, never as a link - exactly what an
   archived operational target already does, no new mechanism. */
export const EXCLUDED_FROM_PUBLIC: ReadonlySet<string> = new Set([
  "ACQ-04", "ACT-11", "CON-264", "CON-283", "FBK-46", "FBK-47", "IDN-81",
  "IDN-85", "IDN-270", "TRM-106", "TRM-275", "INT-269", "INT-278", "FIN-137",
  "FUL-276", "REM-152", "SCH-180", "DEC-184", "DEC-267", "DOC-220", "DOC-286",
]);

/** The 69, listed in full so the decision is readable at its own definition
    rather than only as "90 minus 21". Asserted against the derived library
    below - the two can never drift apart without failing the build. */
export const PUBLIC_LIBRARY_IDS: ReadonlySet<string> = new Set([
  // Acquisition, intent & qualification - 8
  "ACQ-09", "ACQ-11", "ACQ-12", "ACQ-13", "ACQ-285", "ACQ-287", "ACQ-288",
  "ACQ-289",
  // Activation, onboarding & early value - 6
  "ACT-12", "ACT-13", "ACT-14", "ACT-17", "ACT-20",
  // Engagement, retention & contactability - 13
  "RET-24", "RET-26", "RET-28", "RET-30", "RET-31", "RET-32", "CON-272",
  "RET-290", "RET-292", "RET-294", "RET-295", "CON-300",
  // Feedback, advocacy & relationship signals - 4
  "FBK-41", "FBK-42", "FBK-43", "FBK-49",
  // Time, deadlines, expiry & temporary states - 5
  "TIM-61", "TIM-63", "TIM-268", "TIM-274", "TIM-281",
  // Access, identity & relationship - 5
  "ACC-261", "ACC-263", "IDN-84", "IDN-271", "REL-284",
  // Transactions, fulfillment & remedies - 10
  "FIN-134", "FIN-302", "FUL-146", "FUL-148", "FUL-265", "FUL-291",
  "REM-151", "REM-157", "REM-305",
  // Subscriptions & scheduling - 12
  "SCH-266", "SCH-277", "SCH-280", "SCH-282", "SCH-303", "SCH-304", "SUB-163",
  "SUB-262", "SUB-296", "SUB-297", "SUB-298", "SUB-299",
  // Risk, documents, rollout & incidents - 5
  "DOC-214", "DOC-215", "INC-254", "RLT-279", "RSK-273",
]);

export function isPublicJourney(j: Pick<CanonicalJourney, "id" | "category" | "channels" | "entity">): boolean {
  return PUBLIC_LIBRARY_IDS.has(j.id);
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

/** THE LIBRARY, as the public site states it: the curated Customer Journeys
    whose own work reaches a person, by message or by routing the work to
    someone. Every public count and route derives from this list. */
export function isLibraryJourney(j: Pick<CanonicalJourney, "id" | "category" | "channels" | "entity">): boolean {
  const sf = surfaceOf(j);
  return sf.surface === "customer" && (sf.sends || sf.routesToHuman);
}

export const LIBRARY_JOURNEYS: readonly CanonicalJourney[] = PUBLIC_JOURNEYS.filter(isLibraryJourney);

/* THE SCOPE ASSERTION. `PUBLIC_LIBRARY_IDS` is the product decision;
   `LIBRARY_JOURNEYS` is what the surface rule plus the exclusion list actually
   produce. They must be the same 69 ids. Checked at module load, in the
   server-only module every public projection already imports, so a canonical
   edit that changes a journey's surface - adding a communication action to a
   silent lifecycle state, say, or removing the last one from a library
   journey - fails the build with the offending ids named, instead of quietly
   publishing 70 journeys or 68. Same discipline as journey-marketing.ts's own
   throw on a missing showcase id. */
{
  const derived = new Set(LIBRARY_JOURNEYS.map((j) => j.id));
  const missing = [...PUBLIC_LIBRARY_IDS].filter((id) => !derived.has(id));
  const unexpected = [...derived].filter((id) => !PUBLIC_LIBRARY_IDS.has(id));
  if (missing.length || unexpected.length) {
    throw new Error(
      `public library scope drift (audit/public-journey-scope.md says 69): ` +
        `${derived.size} derived` +
        (missing.length ? ` · decided-but-not-derived: ${missing.join(", ")}` : "") +
        (unexpected.length ? ` · derived-but-not-decided: ${unexpected.join(", ")}` : ""),
    );
  }
}

/** The size of the archived remainder - kept as a real number the archive
    README and the validators can be checked against, never rendered on a
    public page. */
export const ARCHIVED_JOURNEY_COUNT = JOURNEYS.length - PUBLIC_JOURNEYS.length;
