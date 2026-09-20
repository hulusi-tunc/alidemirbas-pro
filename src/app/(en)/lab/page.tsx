import type { Metadata } from "next";
import LabIndexPage from "@/components/LabIndexPage";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Lab - Ali Demirbaş",
  description:
    "Open-source projects from real marketing, growth and lifecycle work: Journey Builder, Journey Library, A/B Test Playbook, Dashboard Builder, Google Ads Change History and Numerspace.",
  alternates: pageAlternates("/lab", "en"),
};

export default function Lab() {
  return <LabIndexPage lang="en" />;
}
