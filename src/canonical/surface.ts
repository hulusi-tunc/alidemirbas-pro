import type { CanonicalJourney, CategoryId, ChannelId, Surface } from "./types";

/* Product surface - DERIVED, never authored (ARCHITECTURE_PATCH_0_5.md, 0.5G).

   Three surfaces, one rule, evaluated in this order:

     mechanism   <= the journey is in MECHANISM_IDS: the send path, the
                    contactability/frequency/cooldown machinery and the
                    retry/reconciliation machinery every customer journey
                    depends on and nobody "launches".
     customer    <= the journey sends (a message channel is declared), OR it is
                    in a customer-lifecycle category AND its entity is a
                    person, account, relationship, obligation, booking or
                    order - a silent lifecycle state.
     operational <= everything else: work items, decisions, documents,
                    change sets, integrations, rollouts, incidents, risk cases.

   A journey that lands on the wrong surface is fixed by correcting the facts
   the rule reads (category, entity scope, channels, this list) - there is no
   override field. `scripts/surface-assignment.mjs` writes the same result to
   production/surface-assignment.json with the reason per journey, and the
   validator's surface_count_drift rule compares the two. */

export const MECHANISM_IDS: readonly string[] = [
  "CMS-201", "CMS-202", "CMS-203", "CMS-204", "CMS-205", "CMS-206", "CMS-207", "CMS-208", "CMS-210",
  "CON-34", "CON-35", "CON-36", "CON-39", "CON-40",
  "OPS-121", "OPS-122", "OPS-123", "OPS-124", "OPS-125", "OPS-126", "OPS-127", "OPS-128", "OPS-129", "OPS-130",
];

export const CUSTOMER_CATEGORIES: readonly CategoryId[] = [
  "acquisition", "activation", "retention", "consent", "feedback", "subscription", "scheduling",
  "fulfillment", "financial", "access", "identity", "terminal", "remedy", "time", "structure",
];

const MESSAGE_CHANNELS: readonly ChannelId[] = ["email", "sms", "push", "in-app", "whatsapp"];

/** The entity vocabulary that marks a silent lifecycle state as customer-facing. */
export const CUSTOMER_ENTITY = /\b(person|customer|account|lead|relationship|subscription|member|user|holder|recipient|requester|booking|reservation|order|checkout|cart|obligation|contact|identity|claim|appointment)\b/i;

export type SurfaceAssignment = {
  surface: Surface;
  /** Whether the journey itself sends or routes to a human. */
  communicating: boolean;
  /** Whether the journey sends a message on a customer channel. A journey
      that only routes work to a person (sales, task) is not silent for the
      validator but is a lifecycle state on the product surface. */
  sends: boolean;
  reason: string;
};

export function surfaceOf(j: Pick<CanonicalJourney, "id" | "category" | "channels" | "entity">): SurfaceAssignment {
  const sends = j.channels.some((c) => MESSAGE_CHANNELS.includes(c));
  const routesToHuman = j.channels.some((c) => c === "sales" || c === "task");
  const communicating = sends || routesToHuman;
  if (MECHANISM_IDS.includes(j.id)) {
    return { surface: "mechanism", communicating, sends, reason: "listed in MECHANISM_IDS - runtime machinery customer journeys depend on" };
  }
  if (sends) {
    return { surface: "customer", communicating: true, sends, reason: `declares a message channel (${j.channels.join(", ")})` };
  }
  if (CUSTOMER_CATEGORIES.includes(j.category) && CUSTOMER_ENTITY.test(j.entity.scope)) {
    return {
      surface: "customer",
      communicating,
      sends,
      reason: `silent lifecycle state: category "${j.category}" and a customer-worded entity ("${j.entity.scope.slice(0, 60)}")`,
    };
  }
  return { surface: "operational", communicating, sends, reason: "no message channel and a system-side entity or category" };
}
