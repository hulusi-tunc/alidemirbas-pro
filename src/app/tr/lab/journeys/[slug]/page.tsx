import type { Metadata } from "next";

import { JourneyFullPage, journeyMetadata } from "@/components/JourneyRoutes";
import { ALL_DETAIL_SLUGS } from "@/lib/canonical-view";

/* Every journey plus every retired id that resolves into one, prerendered.
   Nothing else is a journey, so nothing else gets a page. */
export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_DETAIL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return journeyMetadata("tr", slug);
}

export default async function JourneyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <JourneyFullPage lang="tr" slug={slug} />;
}
