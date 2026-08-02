import type { Metadata } from "next";
import LabPage from "@/components/LabPage";

export const metadata: Metadata = {
  title: "Lab - Ali Demirbaş",
  description: "CRM Journey Archive: 70 lifecycle journey teardowns, filterable by sector and channel.",
};

export default function Lab() {
  return <LabPage lang="en" />;
}
