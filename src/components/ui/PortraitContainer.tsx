import type { ReactNode } from "react";

/**
 * The 1280px content measure locked in during the Contact pilot
 * (PORTRAIT-DESIGN-SOURCE-AUDIT.md §7 — portrait.so's own real
 * `max-w-(--breakpoint-xl)` container, confirmed directly from its
 * production DOM, 10 occurrences on its homepage). Extracted here now
 * that Stack and Blog need the same measure too — one shared definition
 * instead of the literal className string drifting across four call
 * sites. NOT `.altor-container` (1248px) or the hero's `Container`
 * (1400px) — see DESIGN-MIGRATION-PLAN.md R1 on why those two coexist;
 * this is deliberately a third, Portrait-pilot-scoped value, not yet a
 * decision to unify the whole site's container system.
 */
export function PortraitContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1280px] px-5 sm:px-8 lg:px-12 ${className}`}>
      {children}
    </div>
  );
}
