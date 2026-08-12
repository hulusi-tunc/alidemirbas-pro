import type { Metadata } from "next";
import StackPage from "@/components/StackPage";
import { copy } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  title: copy.tr.stack.metaTitle,
  description: copy.tr.stack.metaDesc,
  alternates: pageAlternates("/stack", "tr"),
};

export default function StackTr() {
  return <StackPage lang="tr" />;
}
