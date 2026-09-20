import { JourneyMiniMap } from "@/components/ui/JourneyMiniMap";
import { journeyCanvasProps } from "@/components/JourneyDetailBody";
import { journeyDetail } from "@/lib/canonical-view";
import { clsx } from "@/lib/clsx";
import { copy, type Lang } from "@/lib/content";
import { localizedJourneyDetail } from "@/lib/journey-tr-overrides";

/* THE REAL CANVAS, SMALL (2026-09-20, Hulusi: "update the Journey Library
   parts of /lab too - the hero tab and its section - after the detail
   pages", then "look at home as well, the whole site"): every place the
   site used to draw a journey as a wire thumbnail now shows the journey's
   own canvas - the same cards, lines and dot sheet the detail page draws,
   scaled into the frame (ui/JourneyMiniMap). One layout per journey,
   computed here on the server; the Lab index, the homepage hero tile and
   the homepage Work band all read it from this one module. */
export type MiniCanvas = Awaited<ReturnType<typeof journeyCanvasProps>>;

export async function miniCanvas(id: string, lang: Lang): Promise<MiniCanvas | null> {
  const raw = journeyDetail(id);
  if (!raw) return null;
  return journeyCanvasProps(localizedJourneyDetail(raw, lang), lang, copy[lang].lab.page);
}

export function MiniCanvasView({ canvas, className = "" }: { canvas: MiniCanvas; className?: string }) {
  return (
    <div className={clsx("h-full w-full", className)}>
      <JourneyMiniMap layout={canvas.layout} labels={canvas.labels} messageLabels={canvas.messageLabels} humanLabels={canvas.humanLabels} />
    </div>
  );
}
