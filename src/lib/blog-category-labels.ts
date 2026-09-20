/** Short editorial label per real blog category - the tab row's own text,
    not a rename of the underlying filter value. "Experimentation" already
    reads fine as a tab in English; Turkish reuses the CRO calculator
    category's own established translation for the same real concept
    (CalculatorRoutes.tsx's CATEGORY_LABEL, "Deneysel Test") rather than
    inventing a second one here.

    Lives in its own dependency-free module (not exported from
    BlogLibrary.tsx, a "use client" file) so both a server component
    (BlogPostPage.tsx) and a client component (BlogLibrary.tsx) can import
    the same plain data without crossing a client/server module boundary
    for a non-component value. */
export const CATEGORY_TAB_LABEL: Record<string, { en: string; tr: string }> = {
  "Growth Metrics": { en: "Growth", tr: "Growth" },
  "Lifecycle & CRM": { en: "Lifecycle", tr: "Lifecycle" },
  Experimentation: { en: "Experimentation", tr: "Deneysel Test" },
};
