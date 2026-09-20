import { ArrowRight, ArrowRightLeft, GitFork, LogOut, Workflow } from "lucide-react";
import type { ReactNode } from "react";

import JourneyDetailBody, { type journeyCanvasProps } from "@/components/JourneyDetailBody";
import { JourneyMiniMap } from "@/components/ui/JourneyMiniMap";
import { CategoryIcon, ChannelIcon, GoalIcon, categoryAccent } from "@/components/ui/LibraryChrome";
import { buttonStyles } from "@/components/ui/Button";
import { InfoTile } from "@/components/ui/InfoTile";
import { CATEGORY_META, type JourneyDetail, type MergedRedirect } from "@/lib/canonical-view";
import { CHANNEL_HUE, CHANNEL_LABEL, sortChannels } from "@/lib/journey-channels";
import { GOAL_LABEL } from "@/lib/journey-taxonomy";
import type { copy, Lang } from "@/lib/content";

/* THE INFO TAB (Hulusi, 2026-09-14: "the info page is so text-heavy; we
   need icons and more cards - look at the Lab homepage"). The opening is
   the journey as a person meets it: the category as an eyebrow with its
   icon, the title, the purpose, and one row of chips with icons that say
   what it is for, where it runs and what shape it has - the goal, the
   channels, the counts. Then two tiles - the graph as a thumbnail with the
   way to the canvas, and the shape in numbers - and the notes as tiles
   below. The raw id and the "PRESET" badge left the top: a first-time
   reader has no use for them (the id stays on the h1 as a data attribute
   for the QA harnesses). */

/** A chip with its own tinted icon tile - the goal on the brand tint, each
    channel on the tint the whole site gives it (CHANNEL_HUE). */
function Chip({ icon, tint, children }: { icon: ReactNode; tint: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2 rounded-full bg-paper py-1 pr-3.5 pl-1 text-sm font-medium text-ink-950 ring-1 ring-ink-950/[0.06]">
      <span aria-hidden className={`grid size-7 place-items-center rounded-full ${tint} [&>svg]:size-3.5`}>{icon}</span>
      {children}
    </li>
  );
}

/** The journey's goal and channels as chips - the Info header and the
    canvas's title popover show the same row. */
export function JourneyChips({ detail, lang, className = "" }: { detail: JourneyDetail; lang: Lang; className?: string }) {
  return (
    <ul className={`flex list-none flex-wrap gap-2 p-0 ${className}`}>
      <Chip icon={<GoalIcon id={detail.goal} className="size-3.5" />} tint="bg-primary-50 text-primary-700">
        {GOAL_LABEL[detail.goal][lang]}
      </Chip>
      {sortChannels(detail.channels).map((c) => (
        <Chip key={c} icon={<ChannelIcon id={c} className="size-3.5" />} tint={CHANNEL_HUE[c].tile}>
          {CHANNEL_LABEL[c][lang]}
        </Chip>
      ))}
    </ul>
  );
}

/** The category's id (for its icon and tint) from the detail's title. */
export function journeyCategoryId(detail: JourneyDetail): string {
  return CATEGORY_META.find((c) => c.title === detail.categoryTitle)?.id ?? "";
}

export const PAGE_MEASURE = "max-w-[1180px]";

export function journeyTitle(detail: JourneyDetail): string {
  return detail.preset ? detail.preset.name : (detail.shortName ?? detail.name);
}

export default function JourneyInfo({
  detail,
  merged,
  basePath,
  lang,
  t,
  canvas,
}: {
  detail: JourneyDetail;
  merged: MergedRedirect | null;
  basePath: string;
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
  /** The laid-out canvas, as the Canvas tab receives it - the preview
      renders the same thing. */
  canvas: Awaited<ReturnType<typeof journeyCanvasProps>>;
}) {
  const count = (kind: JourneyDetail["nodes"][number]["kind"]) => detail.nodes.filter((n) => n.kind === kind).length;
  const plural = (n: number, forms: readonly [string, string]) => `${n} ${forms[n === 1 ? 0 : 1]}`;
  const shape: { icon: ReactNode; label: string }[] = [{ icon: <Workflow aria-hidden />, label: `${detail.nodes.length} ${t.nodesLabel}` }];
  if (count("condition")) shape.push({ icon: <GitFork aria-hidden />, label: plural(count("condition"), t.decisionsLabel) });
  if (count("exit")) shape.push({ icon: <LogOut aria-hidden />, label: plural(count("exit"), t.exitsLabel) });
  if (count("handoff")) shape.push({ icon: <ArrowRightLeft aria-hidden />, label: plural(count("handoff"), t.handoffsLabel) });
  const categoryId = journeyCategoryId(detail);
  const category = categoryAccent(categoryId);

  return (
    <div className="bg-paper-soft px-4 py-10 md:px-8 md:py-14">
      <div className={`mx-auto ${PAGE_MEASURE}`}>
        <header>
          <p className={`flex items-center gap-2 text-sm font-medium ${category.ink}`}>
            <span aria-hidden className={`grid size-7 place-items-center rounded-lg ${category.tile}`}>
              <CategoryIcon id={categoryId} className="size-3.5" />
            </span>
            {detail.categoryTitle}
          </p>
          <h1 data-journey-id={detail.id} className="mt-5 max-w-4xl text-h1 text-balance text-ink-950">
            {journeyTitle(detail)}
          </h1>
          {detail.preset ? (
            <p className="mt-3 max-w-3xl text-base text-ink-subtle">
              {t.practitioner.presetOf} {detail.shortName ?? detail.name}
            </p>
          ) : detail.shortName ? (
            <p className="mt-3 max-w-3xl text-base text-ink-subtle">{detail.name}</p>
          ) : null}
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-pretty text-ink-muted">{detail.purpose}</p>
          <JourneyChips detail={detail} lang={lang} className="mt-6" />
        </header>

        {/* The graph, small, and the shape in numbers. */}
        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="relative overflow-hidden rounded-[28px] bg-paper ring-1 ring-ink-950/[0.06]">
            {/* The picture is the canvas; clicking it opens the Canvas tab
                (a plain anchor, so the shell's hashchange listener fires). */}
            <a href="#canvas" aria-label={t.openCanvas} className="block h-64 w-full bg-paper-soft sm:h-80 [mask-image:linear-gradient(to_bottom,black_72%,transparent)]">
              <JourneyMiniMap nodes={canvas.nodes} layout={canvas.layout} labels={canvas.labels} messageLabels={canvas.messageLabels} humanLabels={canvas.humanLabels} />
            </a>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft px-6 py-4">
              <p className="text-sm text-ink-muted">{shape.map((s) => s.label).join(" · ")}</p>
              {/* Plain anchor, not ButtonLink/next/link: this is a same-page
                  hash jump to the Canvas tab, whose switch (JourneyDetailShell)
                  listens for the browser's native "hashchange" event. Next's
                  <Link> always calls preventDefault() and routes through its
                  own client-router history API instead of the browser's, so
                  it never fires that event - the button would update the URL
                  but the tab would never actually switch. */}
              <a href="#canvas" className={buttonStyles({ variant: "primary", size: "sm" })}>
                {t.openCanvas}
                <ArrowRight aria-hidden className="size-4" />
              </a>
            </div>
          </section>
          <InfoTile icon={<Workflow />} title={t.shapeLabel}>
            <ul className="flex list-none flex-col gap-2.5 p-0">
              {shape.map((s) => (
                <li key={s.label} className="flex items-center gap-2.5 text-sm text-ink-700 [&>svg]:size-4 [&>svg]:text-ink-500">
                  {s.icon}
                  {s.label}
                </li>
              ))}
            </ul>
          </InfoTile>
        </div>

        <div className="mt-4">
          <JourneyDetailBody detail={detail} merged={merged} basePath={basePath} lang={lang} t={t} showCanvas={false} />
        </div>
      </div>
    </div>
  );
}
