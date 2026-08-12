import type { Metadata } from "next";
import StackPage from "@/components/StackPage";
import { copy } from "@/lib/content";

export const metadata: Metadata = {
  title: copy.tr.stack.metaTitle,
  description: copy.tr.stack.metaDesc,
};

export default function StackTr() {
  return <StackPage lang="tr" />;
}
