import type { FaqItem } from "@/components/ui/FaqAccordion";
import type { InstallStep } from "@/components/ui/InstallationStepper";
import type { RelatedItem } from "@/components/ui/RelatedGrid";

export type SkillProductContent = {
  slug: string;
  eyebrow: string;
  title: string;
  sub: string;
  primaryLinks: { label: string; href: string }[];
  whatItDoes: { title: string; body: string; bullets?: string[] };
  howItWorks?: { title: string; body?: string; bullets?: string[] };
  installTitle: string;
  installSteps: InstallStep[];
  faqTitle?: string;
  faq?: FaqItem[];
  relatedTitle: string;
  related: RelatedItem[];
  appSchema?: {
    type: "WebApplication" | "SoftwareApplication";
    applicationCategory: string;
    operatingSystem?: string;
  };
};
