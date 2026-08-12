import type { Metadata } from "next";
import StackPage from "@/components/StackPage";
import { copy } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: copy.en.stack.metaTitle,
  description: copy.en.stack.metaDesc,
  alternates: pageAlternates("/stack", "en"),
};

export default function Stack() {
  return <StackPage lang="en" />;
}
