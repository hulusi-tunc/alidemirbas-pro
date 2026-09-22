/** Display labels for the real blog category ids. The underlying ids stay
    stable for filtering; only the reader-facing label changes by locale. */
export const CATEGORY_TAB_LABEL: Record<string, { en: string; tr: string }> = {
  "Growth Metrics": { en: "Growth Metrics", tr: "Büyüme Metrikleri" },
  "Lifecycle & CRM": { en: "CRM & Lifecycle", tr: "CRM ve Lifecycle" },
  Experimentation: { en: "Experimentation", tr: "Deneyler" },
};
