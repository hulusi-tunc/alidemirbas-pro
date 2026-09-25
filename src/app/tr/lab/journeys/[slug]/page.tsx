import type { Metadata } from "next";

import { JourneyFullPage, journeyMetadata } from "@/components/JourneyRoutes";
import { ALL_DETAIL_SLUGS, journeyDetail } from "@/lib/canonical-view";
import { journeyIdForLocalizedSlug, TR_LOCALIZED_JOURNEY_SLUGS } from "@/lib/journey-localized-slugs";

/* Every journey plus every retired id that resolves into one, prerendered.
   Nothing else is a journey, so nothing else gets a page. */
export const dynamicParams = false;

export function generateStaticParams() {
  return [...ALL_DETAIL_SLUGS, ...TR_LOCALIZED_JOURNEY_SLUGS].map((slug) => ({ slug }));
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
