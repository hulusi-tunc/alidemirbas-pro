import type { Metadata } from "next";
import ContactPage from "@/components/ContactPage";
import { copy } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: copy.tr.contact.metaTitle,
  description: copy.tr.contact.metaDesc,
  alternates: pageAlternates("/contact", "tr"),
};

export default function ContactTr() {
  return <ContactPage lang="tr" />;
}
