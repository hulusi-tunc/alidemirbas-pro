import type { Metadata } from "next";
import LabIndexPage from "@/components/LabIndexPage";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Lab - Ali Demirbaş",
  description:
    "Open-source projects from real marketing, growth and lifecycle work: a lifecycle journey generator, a CRM journey archive, an A/B test playbook and marketing dashboard tools.",
  alternates: pageAlternates("/lab", "en"),
};

export default function Lab() {
  return <LabIndexPage lang="en" />;
}
