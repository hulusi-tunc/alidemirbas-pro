import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "Insights - Ali Demirbaş",
  description:
    "Insights, frameworks, and practical lessons on growth, CRO, and analytics, shared on LinkedIn - with case studies to download.",
};

export default function Content() {
  return <ContentPage lang="en" />;
}
