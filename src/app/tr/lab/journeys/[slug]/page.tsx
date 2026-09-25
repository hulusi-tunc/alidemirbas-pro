import type { Metadata } from "next";

import { JourneyFullPage, journeyMetadata } from "@/components/JourneyRoutes";
import { ALL_DETAIL_SLUGS, journeyDetail } from "@/lib/canonical-view";
import { journeyIdForLocalizedSlug, TR_LOCALIZED_JOURNEY_SLUGS, TR_REPLACED_CANONICAL_SLUGS } from "@/lib/journey-localized-slugs";

/* Every journey plus every retired id that resolves into one, prerendered.
   Canonical English slugs replaced by localized Turkish slugs are intentionally
   excluded so the old Turkish URLs no longer resolve. */
export const dynamicParams = false;

export function generateStaticParams() {
  return [
    ...ALL_DETAIL_SLUGS.filter((slug) => !TR_REPLACED_CANONICAL_SLUGS.includes(slug)),
    ...TR_LOCALIZED_JOURNEY_SLUGS,
  ].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const id = journeyIdForLocalizedSlug(slug, "tr");
  const resolvedSlug = id ? journeyDetail(id)?.slug ?? slug : slug;
  return journeyMetadata("tr", resolvedSlug);
}

export default async function JourneyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = journeyIdForLocalizedSlug(slug, "tr");
  const resolvedSlug = id ? journeyDetail(id)?.slug ?? slug : slug;
  return <JourneyFullPage lang="tr" slug={resolvedSlug} />;
}
