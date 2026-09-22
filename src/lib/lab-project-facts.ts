import { AB_TEST_COUNT } from "@/lib/ab-test-view";
import { withJourneyCount } from "@/lib/archive";
import { DASHBOARD_REAL } from "@/lib/lab-material";
import { NUMERSPACE_CATALOG } from "@/lib/numerspace-catalog";

/** Live counts used by Lab copy. Keep numeric claims attached to their data source. */
export const LAB_PROJECT_METRICS = {
  abTestCount: AB_TEST_COUNT,
  dashboardTemplateCount: DASHBOARD_REAL.templates.length,
  numerspaceCount: NUMERSPACE_CATALOG.en.reduce((sum, category) => sum + category.items.length, 0),
  numerspaceCategories: NUMERSPACE_CATALOG.en.length,
} as const;

export function withLabProjectFacts(value: string): string {
  return withJourneyCount(value)
    .replaceAll("{abTestCount}", String(LAB_PROJECT_METRICS.abTestCount))
    .replaceAll("{dashboardTemplateCount}", String(LAB_PROJECT_METRICS.dashboardTemplateCount))
    .replaceAll("{numerspaceCount}", String(LAB_PROJECT_METRICS.numerspaceCount))
    .replaceAll("{numerspaceCategories}", String(LAB_PROJECT_METRICS.numerspaceCategories));
}

/** Resolve placeholders in nested page-copy objects while preserving their TypeScript shape. */
export function resolveLabCopy<T>(value: T): T {
  if (typeof value === "string") return withLabProjectFacts(value) as T;
  if (Array.isArray(value)) return value.map((item) => resolveLabCopy(item)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, resolveLabCopy(item)]),
    ) as T;
  }
  return value;
}
