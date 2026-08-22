import { JourneyModalPage } from "@/components/JourneyRoutes";
import { ALL_DETAIL_SLUGS } from "@/lib/canonical-view";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_DETAIL_SLUGS.map((slug) => ({ slug }));
}

export default async function InterceptedJourney({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <JourneyModalPage lang="en" slug={slug} />;
}
