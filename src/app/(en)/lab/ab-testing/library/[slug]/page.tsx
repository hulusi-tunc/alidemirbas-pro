import type { Metadata } from "next";
import { AbLibraryDetailPage, abLibraryDetailMetadata } from "@/components/AbTestRoutes";
import { ALL_AB_TEST_SLUGS } from "@/lib/ab-test-view";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_AB_TEST_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return abLibraryDetailMetadata("en", slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AbLibraryDetailPage lang="en" slug={slug} />;
}
