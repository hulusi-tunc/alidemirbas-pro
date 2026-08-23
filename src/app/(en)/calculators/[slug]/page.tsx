import type { Metadata } from "next";
import { CalculatorDetailPage, calculatorDetailMetadata } from "@/components/CalculatorRoutes";
import { ALL_TOOL_SLUGS } from "@/lib/calculators";

export const dynamicParams = false;

export function generateStaticParams() {
  return ALL_TOOL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return calculatorDetailMetadata("en", slug);
}

export default async function CalculatorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CalculatorDetailPage lang="en" slug={slug} />;
}
