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
   that used to target it now targets ACT-17. ACT-19, RET-293 and FUL-301
   were then retired the same way, dropping the library to 65. RET-26
   (Service Recovery) was retired next - its one real inbound handoff
   (RET-23's h.service) now targets external:operational-resolution - taking
   the library to 64. ACC-263 (Activation Reminder) was retired next - it had
   no real inbound handoffs, only prose distinctFrom rows in DOC-216's and
   TIM-268's own sections, both removed - taking the library to 63. ACT-12
   (Onboarding Nurture) was retired next, the site owner's request despite
   being load-bearing: it was the corpus's only step-by-step onboarding
   nurture engine, and three real inbound handoffs (ACT-11's h.progress,
   ACT-13's h.resume, ACT-20's h.onboarding) each became a real exit
   (x.ready, x.unblocked, x.resumed) instead, since no other journey absorbs
   its role - onboarding now stops at "ready to proceed" rather than
   actively walking the next step. Its marketing-page showcase slot
   (src/lib/journey-marketing.ts) now shows ACT-13. Taking the library to
   62. TIM-281 (Expired Access Recovery) was retired next - it had no real
   inbound handoffs, only one prose distinctFrom row in TIM-274's own
   section, removed - taking the library to 61. IDN-271 (Account Security
   Alert) was retired next - it had no real inbound handoffs and no prose
   distinctFrom rows naming it anywhere in the corpus - taking the library
   to 60. SCH-280 (No-Show Follow-Up) was retired next - it had no real
   inbound handoffs and no prose distinctFrom rows naming it anywhere in
   the corpus - taking the library to 59. RET-30 (Retention Offer
   Follow-Up) was retired next - its one real inbound handoff, RET-28's
   h.intervention, now routes straight into RET-28's own w.decision (the
   same wait that already tracks cancellation_confirmed /
   cancellation_flow_abandoned on the branch where no alternative was
   offered), and no prose distinctFrom row named it elsewhere - taking the
   library to 58. TIM-63 (Expiry Reminder) and TIM-268 (Action Required
   Reminder) were retired together next, the site owner's request -
   neither had a real inbound handoff, but both were named by name in
   several other journeys' own suppression and precedence text as the
   generic reminder each defers to or is deferred by; every one of those
   mentions (TIM-61, ACT-13, DOC-214's signature journey, FBK-49, FIN-134,
   RLT-279, SCH-266, REL-284's referral-reward, and SUB-163's renewal
   cycle) was rewritten to drop the now-nonexistent reference while
   keeping its own real ownership claim intact. TIM-61 lost its last
   competition-group partner in the process and its `competition` field
   was set to the literal `"none"` rather than left in a group of one -
   taking the library to 56. IDN-84 (Verification Recovery) was retired
   next, the site owner's request - it had two real inbound handoffs
   (IDN-81's h.failure and IDN-82's h.failure), each converted into its
   own genuine exit (x.rejected and x.verification-failed) instead of
   routing to a shared recovery engine, and DEC-183's one prose
   distinctFrom row naming it was removed - taking the library to 55.
   INC-254 (Incident Update) was retired next, the site owner's
   request - it had one real inbound handoff, INC-253's h.communicate;
   since INC-253 is itself a silent (channels: []) operational journey
   that cannot perform the communication directly, the guidance-change
   branch was removed rather than reinvented, and INC-253's mitigation
   path now goes straight to its own sufficiency check on every path -
   taking the library to 54. TIM-61 (Deadline Tracking) was retired
   next, the site owner's request - it had no real inbound handoffs and
   no prose distinctFrom rows naming it anywhere in the corpus, both
   already cleaned up when TIM-268 was retired earlier; two remaining
   illustrative prose mentions (ACQ's application-abandonment preset
   text, EN and TR) were reworded to drop the reference - taking the
   library to 53. SCH-277 (Booking Confirmation) was retired next, the
   site owner's request - it had no real inbound handoffs, only prose
   distinctFrom rows and precedence text in SCH-266, SCH-303 and
   SCH-304 naming it as the highest-precedence member of the
   booking-lifecycle group; SCH-303 now holds that highest precedence
   in its place, and every reworded precedence text keeps the same
   real ordering among the three remaining members - taking the
   library to 52. FBK-42 (Advocacy Request) was retired next, the site
   owner's request - it had one real inbound handoff, FBK-43's
   h.advocacy, converted into a genuine exit (x.advocacy-eligible)
   rather than reinventing the ask inline, since asking for advocacy is
   a distinct concern from feedback routing and does not belong inside
   FBK-43. FBK-41 lost its last competition-group partner
   (outbound-ask) in the process and its `competition` field was set to
   the literal "none". REL-284's one prose distinctFrom row naming
   FBK-42 was also removed - taking the library to 51. FBK-49 (Missing
   Critical Data) was retired next, the site owner's request - it had
   no real inbound handoffs, only three prose distinctFrom rows
   (DEC-184, DOC-214, IDN-81) naming it, all removed - taking the
   library to 50. RET-28 (Cancellation Intent Decision Point) was retired
   next, the site owner's request - it had no real inbound handoffs;
   RET-24's h.cancellation, its only real caller, became a genuine exit
   (x.cancellation-in-motion) instead. RET-32's own suppression and
   eligibility text, which named RET-28 as the owner of the still-inside-
   its-save-window case, now states that exclusion in its own terms rather
   than by naming a journey that no longer exists, and SUB's cancellation-
   confirmation journey's one prose distinctFrom row naming RET-28 was
   removed - taking the library to 49. ACQ-285 (New Lead Welcome) was
   retired next, the site owner's request - it had no real inbound
   handoffs, only prose distinctFrom/eligibility/suppression text in
   ACQ-09 (which owned the "no ACQ-285 instance is open" precedence gate)
   and one distinctFrom row in RET-290, both removed - taking the
   library to 48. ACT-13 (Onboarding Blocker Reminder) was retired next,
   the site owner's request - it had two real inbound handoffs: ACT-11's
   h.requirement, converted into a genuine exit (x.blocked) instead of a
   handoff, and RET-23's h.setup, merged into RET-23's own h.technical
   branch (both journeys are silent routers with no mechanism of their
   own to absorb the work). ACT-14's one prose distinctFrom row and its
   c.duplicate condition's one branch naming ACT-13 were both reworded,
   and its s.named-blocker suppression (which deferred to ACT-13 as the
   owner) was removed since no journey now owns that state. The
   marketing-page showcase slot (src/lib/journey-marketing.ts) now shows
   ACT-17 in ACT-13's place - taking the library to 47. TIM-274 (Grace
   Period Recovery) was retired next, the site owner's request - it had
   no real inbound handoffs, only two prose distinctFrom rows: ACC-261's
   (which lost its last competition-group partner in the process and had
   its `competition` field set to the literal "none") and FIN-134's
   (which had misnamed its own real handoff target as TIM-274 rather
   than TIM-65, the journey its h.grace actually points to - corrected
   in the same edit) - taking the library to 46. REM-157 (Remedy
   Confirmation) was retired next, the site owner's request - it had 13
   real inbound handoffs across data.ts, decision.ts, document.ts,
   incident.ts, remedy.ts (x7), scheduling.ts (x2) and time.ts, each
   converted into a genuine exit since no sibling journey has its own
   remedy-selection machinery to merge into. Three prose distinctFrom
   rows (financial.ts, remedy.ts, subscription.ts) naming it were
   removed, along with a fourth prose mention in a financial.ts
   suppression's own text and the "remedy selection (REM-157)" clause in
   REM-305's own suppression/precedence prose - taking the library to 45.
   FUL-265 (Delivery Tracking) was retired next, the site owner's
   request - it had no real inbound handoffs, only two prose distinctFrom
   rows (FUL-146, REM-151) and one suppression clause in FUL-146's own
   s.g5 naming it as the owner of in-transit delay tracking, all removed
   or reworded - taking the library to 44. SCH-304 (Pre-Arrival Preparation)
   was retired next, the site owner's request - it had no real inbound
   handoffs, only prose distinctFrom rows and precedence text in SCH-266
   and SCH-303 naming it as the lowest-precedence member of the
   booking-lifecycle group; SCH-266 now holds that lowest precedence in
   its place, and every reworded precedence text keeps the same real
   ordering among the two remaining members - taking the library to 43.
   Everything below that
   still says "69" is describing
   how the count got there, not the current total - see PUBLIC_LIBRARY_IDS
   itself for the live list.

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
   reference from a journey that stayed (FBK-43 → FBK-46,
   SCH-280 → SCH-180, CON-272's `distinctFrom`)
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
  // Acquisition, intent & qualification - 7
  "ACQ-09", "ACQ-11", "ACQ-12", "ACQ-13", "ACQ-287", "ACQ-288",
  "ACQ-289",
  // Activation, onboarding & early value - 4
  "ACT-14", "ACT-17", "ACT-20",
  // Engagement, retention & contactability - 9
  "RET-24", "RET-31", "RET-32", "CON-272",
  "RET-290", "RET-292", "RET-294", "RET-295", "CON-300",
  // Feedback, advocacy & relationship signals - 2
  "FBK-41", "FBK-43",
  // Access, identity & relationship - 2
  "ACC-261", "REL-284",
  // Transactions, fulfillment & remedies - 7
  "FIN-134", "FIN-302", "FUL-146", "FUL-148", "FUL-291",
  "REM-151", "REM-305",
  // Subscriptions & scheduling - 9
  "SCH-266", "SCH-282", "SCH-303", "SUB-163",
  "SUB-262", "SUB-296", "SUB-297", "SUB-298", "SUB-299",
  // Risk, documents, rollout & incidents - 4
  "DOC-214", "DOC-215", "RLT-279", "RSK-273",
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
