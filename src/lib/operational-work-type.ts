import type { CategoryId } from "@/canonical/types";

/* The Operations surface's own secondary discovery filter.

   Goal (journey-taxonomy.ts) is the library's audited primary filter for
   communicating customer journeys - it does not fit here. Read against the
   124 Operations items, Goal fragments into 23 near-flat values (several
   with a single-digit count); Goal was tuned for "what problem does this
   solve for a customer", and internal operational work does not carry that
   shape. Category (18 real values on this surface) is more usable but still
   too granular for a first filter - four groups a practitioner already
   thinks in ("who decides this," "whose account/access," "what gets
   resolved," "what keeps the system correct") group the same 18 categories
   without inventing anything: each Type below is a plain reading of what
   its member categories' own titles already say they are about (see
   src/canonical/index.ts's CATEGORIES). Category stays available as its own,
   more granular filter alongside this one - this does not replace it.

   Journey-library-user-taxonomy-audit round (2026-09). Not a canonical
   concept: this file reads CategoryId, canonical source reads nothing from
   here, and no journey's own category/goal/name changes because of it. */

export type OperationalWorkType = "reviews-decisions" | "account-access" | "service-fulfillment" | "systems-reliability";

export const OPERATIONAL_WORK_TYPES: readonly OperationalWorkType[] = [
  "reviews-decisions",
  "account-access",
  "service-fulfillment",
  "systems-reliability",
];

/** Every category actually present on the Operations surface maps to
    exactly one Type. A category not listed here (i.e. one that never
    appears on an operational-workflows-surface journey) has no Type and is
    not expected to - see canonical-view.ts's SURFACE_ROWS for what is
    actually present. */
export const OPERATIONAL_WORK_TYPE_OF: Readonly<Partial<Record<CategoryId, OperationalWorkType>>> = {
  ownership: "reviews-decisions",
  decision: "reviews-decisions",
  risk: "reviews-decisions",
  control: "reviews-decisions",

  access: "account-access",
  identity: "account-access",
  structure: "account-access",
  terminal: "account-access",

  financial: "service-fulfillment",
  remedy: "service-fulfillment",
  document: "service-fulfillment",
  subscription: "service-fulfillment",
  scheduling: "service-fulfillment",

  integration: "systems-reliability",
  data: "systems-reliability",
  rollout: "systems-reliability",
  incident: "systems-reliability",
  time: "systems-reliability",
};
