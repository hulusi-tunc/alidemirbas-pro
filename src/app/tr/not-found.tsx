import type { Metadata } from "next";
import NotFoundPage from "@/components/NotFoundPage";
import { copy } from "@/lib/content";

// TR counterpart of (en)/not-found.tsx - see that file's comment for why
// this is a scoped not-found.tsx per root layout rather than one global
// file.
export const metadata: Metadata = { title: copy.tr.notFound.metaTitle };

export default function NotFoundTr() {
  return <NotFoundPage lang="tr" />;
}
