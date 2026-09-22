import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AbLibraryDetailPage, abLibraryDetailMetadata } from "@/components/AbTestRoutes";
import { ALL_AB_TEST_ROUTE_SLUGS, canonicalAbTestSlug } from "@/lib/ab-test-view";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_AB_TEST_ROUTE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return abLibraryDetailMetadata("tr", slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const canonical = canonicalAbTestSlug(slug);
  if (canonical !== slug) redirect(`/tr/lab/ab-testing/library/${canonical}`);
  return <AbLibraryDetailPage lang="tr" slug={canonical} />;
}
