import type { Metadata } from "next";
import ContactPage from "@/components/ContactPage";
import { copy } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: copy.en.contact.metaTitle,
  description: copy.en.contact.metaDesc,
  alternates: pageAlternates("/contact", "en"),
};

export default function Contact() {
  return <ContactPage lang="en" />;
}
