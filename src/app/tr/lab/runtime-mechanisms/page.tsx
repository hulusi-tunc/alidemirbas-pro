import type { Metadata } from "next";
import LabPage from "@/components/LabPage";
import { PRESET_ROWS, SURFACE_ROWS } from "@/lib/canonical-view";
import { copy } from "@/lib/content";
import { pageAlternates } from "@/lib/seo";

/* One of the three public journey surfaces - see canonical-view.ts's SURFACE_ROWS.
   The list is read from the journeys themselves; nothing here decides what
   belongs on this surface. */
const KEY = "runtime-mechanisms" as const;
const t = copy.tr.lab.journeysSplit.surfaces[KEY];
const intro = t.intro.replace("{count}", String(SURFACE_ROWS[KEY].length)).replace("{presets}", String(PRESET_ROWS.length));

export const metadata: Metadata = {
  title: `${t.title} - Canonical Journey Kütüphanesi`,
  description: intro,
  alternates: pageAlternates("/lab/runtime-mechanisms", "tr"),
};

export default function LabRuntimeMechanismsTR() {
  return (
    <LabPage
      lang="tr"
      rows={SURFACE_ROWS[KEY]}
      title={t.title}
      intro={intro}
      extraCrumb={{ name: t.title, url: "/tr/lab/runtime-mechanisms" }}
      browser="gallery"
      surface={KEY}
    />
  );
}
