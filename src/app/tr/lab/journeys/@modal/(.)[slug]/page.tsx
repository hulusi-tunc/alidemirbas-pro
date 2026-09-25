import { JourneyModalPage } from "@/components/JourneyRoutes";
import { ALL_DETAIL_SLUGS, journeyDetail } from "@/lib/canonical-view";
import { journeyIdForLocalizedSlug, TR_LOCALIZED_JOURNEY_SLUGS } from "@/lib/journey-localized-slugs";

export const dynamicParams = false;

export function generateStaticParams() {
  return [...ALL_DETAIL_SLUGS, ...TR_LOCALIZED_JOURNEY_SLUGS].map((slug) => ({ slug }));
}

export default async function InterceptedJourney({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const id = journeyIdForLocalizedSlug(slug, "tr");
  const resolvedSlug = id ? journeyDetail(id)?.slug ?? slug : slug;
  return <JourneyModalPage lang="tr" slug={resolvedSlug} />;
}
