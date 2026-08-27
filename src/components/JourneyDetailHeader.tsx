import { CHANNEL_LABEL, sortChannels } from "@/lib/journey-channels";
import { GOAL_LABEL } from "@/lib/journey-taxonomy";
import type { JourneyDetail } from "@/lib/canonical-view";
import type { copy, Lang } from "@/lib/content";

/* The head of one journey, shared by the full page and the modal that
   intercepts it, so the two never drift.

   Order is the page's argument, not decoration: a quiet spec line (what this
   record is and how big it is), then the title, then the purpose, then the
   goal. Everything above the canvas is identification; the canvas below is
   the subject. The spec line is deliberately mono and small - it is a
   catalogue number, not a headline - and the title is the loudest thing on
   the page until the graph itself takes over.

   The right-hand side of the spec line carries the node count, and channels
   only where the journey actually has them. A journey with `channels: []`
   renders nothing there rather than "no channels" or "internal": the empty
   array is a statement about execution, not a missing field, and labelling
   it would turn 194 journeys into a page-wide apology. */

export default function JourneyDetailHeader({
  detail,
  lang,
  t,
  as: Heading = "h1",
  titleId,
  compact = false,
}: {
  detail: JourneyDetail;
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
  /** h1 on the journey's own page; h2 inside the modal, where the page
      behind it already owns the h1. */
  as?: "h1" | "h2";
  titleId?: string;
  /** The modal has a close button in the top-right corner and less vertical
      room than a full page, so it takes the same hierarchy one step down
      rather than a different one. */
  compact?: boolean;
}) {
  const channelLabels = sortChannels(detail.channels).map((c) => CHANNEL_LABEL[c][lang]);

  return (
    <header>
      <div
        data-journey-spec
        className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1.5 border-b border-line pb-3"
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {/* data-journey-id is a test hook, not styling: the QA harnesses
              used to read the id by splitting this line's text on " - ",
              which coupled them to a separator that only ever existed
              because the id and the category shared one paragraph. */}
          <span
            data-journey-id={detail.id}
            className="font-mono text-[13px] font-medium tracking-[0.04em] text-ink-900 tabular-nums"
          >
            {detail.id}
          </span>
          <span className="font-mono text-xs text-ink-500">{detail.categoryTitle}</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2 font-mono text-xs text-ink-500 tabular-nums">
          <span className="whitespace-nowrap">
            {detail.nodes.length} {t.nodesLabel}
          </span>
          {channelLabels.map((label) => (
            <span key={label} className="whitespace-nowrap">
              <span aria-hidden className="mr-2 text-ink-300">
                ·
              </span>
              {label}
            </span>
          ))}
        </div>
      </div>

      <Heading
        id={titleId}
        className={`${
          compact
            ? "mt-5 text-[clamp(1.375rem,1.05rem+1.4vw,1.875rem)]"
            : "mt-7 text-[clamp(1.625rem,1.1rem+2.1vw,2.5rem)]"
        } max-w-4xl leading-[1.14] font-semibold tracking-[-0.02em] text-balance text-ink-950`}
      >
        {detail.name}
      </Heading>

      {/* Narrower than the title and much narrower than the canvas below it:
          the purpose is the one genuinely long-form sentence on the page and
          reads at a normal measure, not at graph width. */}
      <p
        className={`${compact ? "mt-3 text-[15px]" : "mt-4 text-base"} max-w-3xl leading-relaxed text-pretty text-ink-600`}
      >
        {detail.purpose}
      </p>

      {/* Stated, not badged. The goal is the journey's own answer to "what is
          this for", so it gets a labelled line of its own - a chip would file
          it with decoration instead. */}
      <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-[11px] tracking-[0.1em] text-ink-400 uppercase">
          {t.goalLabel}
        </span>
        <span className="text-[15px] leading-snug text-ink-800">
          {GOAL_LABEL[detail.goal][lang]}
        </span>
      </p>
    </header>
  );
}
