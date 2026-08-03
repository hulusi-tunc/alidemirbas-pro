import type { Metadata } from "next";
import ContentPage from "@/components/ContentPage";

export const metadata: Metadata = {
  title: "İçgörüler - Ali Demirbaş",
  description:
    "LinkedIn'de paylaştığım büyüme, CRO ve analitik üzerine içgörüler, çerçeveler ve pratik dersler - indirilebilir vaka çalışmalarıyla.",
};

export default function Content() {
  return <ContentPage lang="tr" />;
}
