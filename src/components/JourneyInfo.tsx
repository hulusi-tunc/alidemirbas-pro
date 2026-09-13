import { ArrowRight, ArrowRightLeft, BellRing, ClipboardList, GitFork, LogOut, Mail, MessageCircle, MessageSquare, Smartphone, Tag, Target, UserRound, Workflow } from "lucide-react";
import type { ReactNode } from "react";

import JourneyDetailBody from "@/components/JourneyDetailBody";
import JourneyVisualBody from "@/components/JourneyVisualBody";
import JourneyTopologyPreview from "@/components/ui/JourneyTopologyPreview";
import { ButtonLink } from "@/components/ui/Button";
import { InfoTile } from "@/components/ui/InfoTile";
import type { JourneyDetail, MergedRedirect } from "@/lib/canonical-view";
import { CHANNEL_LABEL, sortChannels } from "@/lib/journey-channels";
import { buildJourneyPreview } from "@/lib/journey-preview";
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

type Channel = keyof typeof CHANNEL_LABEL;

const CHANNEL_ICON: Record<Channel, ReactNode> = {
  email: <Mail aria-hidden />,
  push: <BellRing aria-hidden />,
  sms: <MessageSquare aria-hidden />,
  "in-app": <Smartphone aria-hidden />,
  whatsapp: <MessageCircle aria-hidden />,
  sales: <UserRound aria-hidden />,
  task: <ClipboardList aria-hidden />,
};

function Chip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2 rounded-full bg-paper px-3 py-1.5 text-sm font-medium text-ink-950 ring-1 ring-ink-950/[0.06] [&>svg]:size-4 [&>svg]:text-ink-500">
      {icon}
      {children}
    </li>
  );
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
  visual,
}: {
  detail: JourneyDetail;
  merged: MergedRedirect | null;
  basePath: string;
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
  /** Whether the journey qualifies for the visual body (see JourneyRoutes). */
  visual: boolean;
}) {
  const count = (kind: JourneyDetail["nodes"][number]["kind"]) => detail.nodes.filter((n) => n.kind === kind).length;
  const plural = (n: number, forms: readonly [string, string]) => `${n} ${forms[n === 1 ? 0 : 1]}`;
  const shape: { icon: ReactNode; label: string }[] = [{ icon: <Workflow aria-hidden />, label: `${detail.nodes.length} ${t.nodesLabel}` }];
  if (count("condition")) shape.push({ icon: <GitFork aria-hidden />, label: plural(count("condition"), t.decisionsLabel) });
  if (count("exit")) shape.push({ icon: <LogOut aria-hidden />, label: plural(count("exit"), t.exitsLabel) });
  if (count("handoff")) shape.push({ icon: <ArrowRightLeft aria-hidden />, label: plural(count("handoff"), t.handoffsLabel) });
  const preview = buildJourneyPreview(detail.nodes);

  return (
    <div className="bg-paper-soft px-4 py-10 md:px-8 md:py-14">
      <div className={`mx-auto ${PAGE_MEASURE}`}>
        <header>
          <p className="flex items-center gap-2 text-sm font-medium text-ink-600">
            <span aria-hidden className="grid size-7 place-items-center rounded-lg bg-paper ring-1 ring-ink-950/[0.06]">
              <Tag className="size-3.5 text-ink-500" />
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
          <ul className="mt-6 flex list-none flex-wrap gap-2 p-0">
            <Chip icon={<Target aria-hidden />}>{GOAL_LABEL[detail.goal][lang]}</Chip>
            {sortChannels(detail.channels).map((c) => (
              <Chip key={c} icon={CHANNEL_ICON[c]}>
                {CHANNEL_LABEL[c][lang]}
              </Chip>
            ))}
          </ul>
        </header>

        {/* The graph, small, and the shape in numbers. */}
        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <section className="relative overflow-hidden rounded-[28px] bg-paper ring-1 ring-ink-950/[0.06]">
            <div className="altor-dot-grid h-56 w-full p-6 sm:h-64">
              <JourneyTopologyPreview preview={preview} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft px-6 py-4">
              <p className="text-sm text-ink-muted">{shape.map((s) => s.label).join(" · ")}</p>
              <ButtonLink href="#canvas" variant="primary" size="sm">
                {t.openCanvas}
                <ArrowRight aria-hidden className="size-4" />
              </ButtonLink>
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
          {visual ? (
            <JourneyVisualBody detail={detail} basePath={basePath} lang={lang} t={t} showCanvas={false} />
          ) : (
            <JourneyDetailBody detail={detail} merged={merged} basePath={basePath} lang={lang} t={t} showCanvas={false} />
          )}
        </div>
      </div>
    </div>
  );
}
