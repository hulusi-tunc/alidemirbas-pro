import type { Metadata } from "next";
import ContactPage from "@/components/ContactPage";
import { copy } from "@/lib/content";

export const metadata: Metadata = {
  title: copy.en.contact.metaTitle,
  description: copy.en.contact.metaDesc,
};

export default function Contact() {
  return <ContactPage lang="en" />;
}
