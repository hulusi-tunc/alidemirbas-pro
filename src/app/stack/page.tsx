import type { Metadata } from "next";
import StackPage from "@/components/StackPage";
import { copy } from "@/lib/content";

export const metadata: Metadata = {
  title: copy.en.stack.metaTitle,
  description: copy.en.stack.metaDesc,
};

export default function Stack() {
  return <StackPage lang="en" />;
}
