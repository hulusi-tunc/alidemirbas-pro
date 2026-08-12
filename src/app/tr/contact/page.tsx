import type { Metadata } from "next";
import ContactPage from "@/components/ContactPage";
import { copy } from "@/lib/content";

export const metadata: Metadata = {
  title: copy.tr.contact.metaTitle,
  description: copy.tr.contact.metaDesc,
};

export default function ContactTr() {
  return <ContactPage lang="tr" />;
}
