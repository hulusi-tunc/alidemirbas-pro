import type { AbVariableKind } from "@/lib/ab-test-playbook";
import type { Lang } from "@/lib/content";

/* The diagram of what an experiment varies.

   This replaces a surface schematic, which answered the wrong question. A
   surface tells you WHERE a test runs; every timing, quantity and ordering
   test on a listing page drew the same picture, and a reader could not tell
   from it what was actually being changed. Worse, marking one element as
   "the tested element" narrowed broad experiments into a single arbitrary
   implementation: a record that tests a CTA's colour, copy, size and
   position is not a test of its text.

   So the drawing is keyed on the variable (see abVariableKind), and each one
   is built to answer one question on sight: what is being varied here.

   Two honesty rules run through all of them.

   First, nothing is captioned with invented values. A threshold diagram
   shows a scale with a movable marker, not "150 TL vs 250 TL" - the record
   states that a threshold is under test, never which thresholds.

   Second, only `presence` draws a real A/B difference. `differenceBehavior`
   is the one field that fixes both sides: on an `add` record the control has
   the element absent and the variant has it present, and on `remove` the
   reverse. Every other kind draws the dimension identically on both sides
   and lets each side's own caption carry the difference, because the data
   describes A and B in prose and drawing two different pictures would be
   inventing the treatment.

   Every word inside a diagram is localised. The drawing carries the meaning
   and the caption names it, so leaving the caption in English on the Turkish
   route would hand half the library's readers a picture with no key. */

const BAR = "rounded-[3px] bg-ink-100";
const BLOCK = "rounded-md bg-ink-100";
const MARK = "rounded-md bg-ink-900";
const GHOST = "rounded-md border border-dashed border-ink-200";
const CAP = "text-[11.5px] leading-snug text-ink-400";
const RAIL = "font-mono text-[9px] tracking-[0.06em] text-ink-400 uppercase";

/** The one line under each drawing that names the variable. */
const CAPTION: Record<AbVariableKind, Record<Lang, string>> = {
  timing: {
    en: "The moment is the variable, not what appears.",
    tr: "Değişken olan an; ne göründüğü değil.",
  },
  threshold: {
    en: "Where the line sits is the variable.",
    tr: "Çizginin nereye konduğu değişken.",
  },
  quantity: {
    en: "How many are shown is the variable, not what they look like.",
    tr: "Değişken kaç tane gösterildiği; nasıl göründükleri değil.",
  },
  ordering: { en: "The sequence is the variable.", tr: "Değişken olan sıranın kendisi." },
  "ordering-nav": {
    en: "Position in the menu is the variable.",
    tr: "Menü içindeki sıra değişken.",
  },
  hierarchy: {
    en: "Which information leads is the variable.",
    tr: "Hangi bilginin başa geçtiği değişken.",
  },
  emphasis: {
    en: "How hard the same message is pushed is the variable.",
    tr: "Aynı mesajın ne kadar öne çıkarıldığı değişken.",
  },
  anatomy: {
    en: "Several properties are in scope, not one.",
    tr: "Kapsamda tek bir özellik değil, birkaçı var.",
  },
  microcopy: {
    en: "Any of the dashed slots is a candidate.",
    tr: "Kesikli çerçevelerin her biri aday.",
  },
  placement: {
    en: "Where it sits is the variable; the element itself does not change.",
    tr: "Değişken nerede durduğu; öğenin kendisi değişmiyor.",
  },
  presence: { en: "absent / present", tr: "yok / var" },
  behavior: {
    en: "What the interface does on its own is the variable.",
    tr: "Arayüzün kendiliğinden ne yaptığı değişken.",
  },
  personalization: {
    en: "Who the visitor is decides what fills the slot.",
    tr: "Alanı neyin dolduracağına ziyaretçinin kim olduğu karar veriyor.",
  },
  default: {
    en: "Which option arrives already chosen is the variable.",
    tr: "Hangi seçeneğin hazır seçili geldiği değişken.",
  },
  size: { en: "The same element, larger or smaller.", tr: "Aynı öğe, daha büyük ya da daha küçük." },
  style: {
    en: "The visual treatment is the variable, not the words or the position.",
    tr: "Değişken görsel biçim; sözler ya da konum değil.",
  },
  format: { en: "The same value, presented two ways.", tr: "Aynı değer, iki farklı sunumla." },
  options: {
    en: "Two alternatives; neither is the incumbent.",
    tr: "İki alternatif; hiçbiri mevcut hâl değil.",
  },
  media: { en: "The asset itself is the variable.", tr: "Değişken görselin kendisi." },
  layout: {
    en: "How the blocks are arranged is the variable.",
    tr: "Blokların nasıl dizildiği değişken.",
  },
  wording: { en: "Same slot, different words.", tr: "Aynı alan, farklı sözler." },
};

/** Short labels drawn inside a diagram rather than under it. */
const L = {
  load: { en: "load", tr: "açılış" },
  wait: { en: "delay / scroll", tr: "bekleme · kaydırma" },
  fires: { en: "fires", tr: "tetiklenir" },
  lower: { en: "lower", tr: "düşük" },
  thresholdValue: { en: "threshold value", tr: "eşik değeri" },
  higher: { en: "higher", tr: "yüksek" },
  absent: { en: "absent", tr: "yok" },
  present: { en: "present", tr: "var" },
  auto: { en: "on its own", tr: "kendiliğinden" },
  source: { en: "source", tr: "kaynak" },
  segment: { en: "segment", tr: "segment" },
  state: { en: "state", tr: "durum" },
  preselected: { en: "pre-selected", tr: "hazır seçili" },
  none: { en: "nothing chosen", tr: "seçili değil" },
  colour: { en: "colour", tr: "renk" },
  copy: { en: "copy", tr: "metin" },
  sizeProp: { en: "size", tr: "boyut" },
  position: { en: "position", tr: "konum" },
} as const;

export function VariableDiagram({
  kind,
  testedSlot,
  label,
  lang,
  /** "absent" / "present" on a presence test, null everywhere else. */
  presence,
}: {
  kind: AbVariableKind;
  testedSlot: string | null;
  /** "Tested element" / "Test edilen öğe", localised by the caller. */
  label: string;
  lang: Lang;
  presence?: "absent" | "present" | null;
}) {
  return (
    <div className="rounded-xl border border-line bg-paper p-5 sm:p-6">
      <p className="font-mono text-[9px] tracking-[0.12em] text-ink-400 uppercase">{label}</p>
      <p className="mt-1.5 text-[13.5px] leading-snug font-medium text-ink-950">{testedSlot ?? "—"}</p>
      <div className="mt-4 border-t border-line-soft pt-4">
        <Body kind={kind} lang={lang} presence={presence ?? null} />
      </div>
    </div>
  );
}

function Caption({ kind, lang }: { kind: AbVariableKind; lang: Lang }) {
  return <p className={`mt-1 ${CAP}`}>{CAPTION[kind][lang]}</p>;
}

function Body({
  kind,
  lang,
  presence,
}: {
  kind: AbVariableKind;
  lang: Lang;
  presence: "absent" | "present" | null;
}) {
  switch (kind) {
    case "timing": return <Timing lang={lang} />;
    case "threshold": return <Threshold lang={lang} />;
    case "quantity": return <Quantity lang={lang} />;
    case "ordering": return <Ordering lang={lang} />;
    case "ordering-nav": return <OrderingNav lang={lang} />;
    case "hierarchy": return <Hierarchy lang={lang} />;
    case "emphasis": return <Emphasis lang={lang} />;
    case "anatomy": return <Anatomy lang={lang} />;
    case "microcopy": return <Microcopy lang={lang} />;
    case "placement": return <Placement lang={lang} />;
    case "presence": return <Presence lang={lang} state={presence} />;
    case "behavior": return <Behavior lang={lang} />;
    case "personalization": return <Personalization lang={lang} />;
    case "default": return <DefaultState lang={lang} />;
    case "size": return <Size lang={lang} />;
    case "style": return <Style lang={lang} />;
    case "media": return <Media lang={lang} />;
    case "layout": return <Layout lang={lang} />;
    case "options": return <Options lang={lang} />;
    case "wording": return <Wording lang={lang} />;
    default: return <Format lang={lang} />;
  }
}

/** load → delay / scroll → the thing fires. A timeline, not a component. */
function Timing({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <span aria-hidden className="size-2 rounded-full bg-ink-300" />
        <span className="h-px flex-1 bg-ink-200" />
        <span aria-hidden className="size-2 rounded-full bg-ink-300" />
        <span className="h-px flex-1 bg-ink-200" />
        <span aria-hidden className="size-2.5 rounded-full bg-ink-900" />
      </div>
      <div className={`grid grid-cols-3 ${RAIL}`}>
        <span>{L.load[lang]}</span>
        <span className="text-center">{L.wait[lang]}</span>
        <span className="text-right text-ink-700">{L.fires[lang]}</span>
      </div>
      <Caption kind="timing" lang={lang} />
    </div>
  );
}

/** A scale with a movable marker: the value is what moves. */
function Threshold({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative h-1.5 w-full rounded-full bg-ink-100">
        <span aria-hidden className="absolute top-1/2 left-[38%] size-3.5 -translate-y-1/2 rounded-full border-2 border-ink-900 bg-paper" />
        <span aria-hidden className="absolute top-1/2 left-[68%] size-3.5 -translate-y-1/2 rounded-full border-2 border-dashed border-ink-300 bg-paper" />
      </div>
      <div className={`flex justify-between ${RAIL}`}>
        <span>{L.lower[lang]}</span>
        <span className="text-ink-700">{L.thresholdValue[lang]}</span>
        <span>{L.higher[lang]}</span>
      </div>
      <Caption kind="threshold" lang={lang} />
    </div>
  );
}

/** Same tile, different counts. Density is the point. */
function Quantity({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-1.5" aria-hidden>
        {Array.from({ length: 3 }, (_, i) => <span key={i} className={`h-7 ${BLOCK}`} />)}
      </div>
      <div className="grid grid-cols-6 gap-1" aria-hidden>
        {Array.from({ length: 12 }, (_, i) => <span key={i} className={`h-4 ${BLOCK}`} />)}
      </div>
      <Caption kind="quantity" lang={lang} />
    </div>
  );
}

/** A ranked list. The numerals are the point - the rows are interchangeable. */
function Ordering({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2.5">
          <span className="w-3 font-mono text-[10px] text-ink-700 tabular-nums">{i + 1}</span>
          <span aria-hidden className={`h-1.5 flex-1 ${BAR}`} style={{ maxWidth: `${88 - i * 9}%` }} />
        </div>
      ))}
      <Caption kind="ordering" lang={lang} />
    </div>
  );
}

/** The same idea in a nav bar rather than a page list - so an ordering test
    on the menu never reuses the listing drawing. */
function OrderingNav({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-md border border-line-soft px-2.5 py-2" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-1">
            <span className="font-mono text-[9px] text-ink-400 tabular-nums">{i + 1}</span>
            <span className={`h-1.5 ${BAR}`} style={{ width: 26 - i * 3 }} />
          </div>
        ))}
      </div>
      <Caption kind="ordering-nav" lang={lang} />
    </div>
  );
}

/** Which information sits at the top of one component. */
function Hierarchy({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5 rounded-md border border-line-soft p-2.5" aria-hidden>
          <span className={`h-2.5 w-[80%] ${MARK}`} />
          <span className={`h-1.5 w-[60%] ${BAR}`} />
          <span className={`h-1.5 w-[45%] ${BAR}`} />
        </div>
        <div className="flex flex-1 flex-col gap-1.5 rounded-md border border-line-soft p-2.5" aria-hidden>
          <span className={`h-1.5 w-[60%] ${BAR}`} />
          <span className={`h-2.5 w-[80%] ${MARK}`} />
          <span className={`h-1.5 w-[45%] ${BAR}`} />
        </div>
      </div>
      <Caption kind="hierarchy" lang={lang} />
    </div>
  );
}

/** One message, quiet or loud. Emphasis, not placement or wording. */
function Emphasis({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2 rounded-md border border-line-soft px-2.5 py-2" aria-hidden>
        <span className={`h-1.5 w-[46%] ${BAR}`} />
      </div>
      <div className="flex items-center gap-2 rounded-md bg-ink-900 px-2.5 py-2" aria-hidden>
        <span className="h-1.5 w-[46%] rounded-[3px] bg-paper/80" />
      </div>
      <Caption kind="emphasis" lang={lang} />
    </div>
  );
}

/** One component, several testable properties named at once - so a broad
    optimisation is never drawn as a change to one of them. */
function Anatomy({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative rounded-md bg-ink-900 px-4 py-3" aria-hidden>
        <span className="mx-auto block h-1.5 w-[42%] rounded-[3px] bg-paper/70" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {[L.colour, L.copy, L.sizeProp, L.position].map((p) => (
          <span
            key={p.en}
            className="rounded border border-line px-1.5 py-0.5 font-mono text-[9px] tracking-[0.06em] text-ink-500 uppercase"
          >
            {p[lang]}
          </span>
        ))}
      </div>
      <Caption kind="anatomy" lang={lang} />
    </div>
  );
}

/** Copy can sit in more than one place; none is picked. */
function Microcopy({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-2">
      <span aria-hidden className={`h-3 w-[30%] ${GHOST}`} />
      <span aria-hidden className={`h-7 w-full ${BLOCK}`} />
      <span aria-hidden className={`h-3 w-[52%] ${GHOST}`} />
      <span aria-hidden className={`h-7 w-full ${BLOCK}`} />
      <span aria-hidden className={`h-3 w-[40%] ${GHOST}`} />
      <Caption kind="microcopy" lang={lang} />
    </div>
  );
}

/** The same element in more than one possible position. */
function Placement({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative h-[86px] rounded-md border border-line-soft p-2" aria-hidden>
        <span className={`absolute top-2 left-2 h-4 w-[36%] ${MARK}`} />
        <span className={`absolute top-2 right-2 h-4 w-[36%] ${GHOST}`} />
        <span className={`absolute bottom-2 left-2 h-4 w-[36%] ${GHOST}`} />
        <span className={`absolute right-2 bottom-2 h-4 w-[36%] ${GHOST}`} />
      </div>
      <Caption kind="placement" lang={lang} />
    </div>
  );
}

/** The one kind whose two sides the data actually fixes. */
function Presence({ lang, state }: { lang: Lang; state: "absent" | "present" | null }) {
  const on = state === "present";
  const both = state === null;
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-2 rounded-md border border-line-soft p-2.5" aria-hidden>
        <span className={`h-1.5 w-[70%] ${BAR}`} />
        {both || on ? <span className={`h-6 w-full ${MARK}`} /> : <span className={`h-6 w-full ${GHOST}`} />}
        <span className={`h-1.5 w-[50%] ${BAR}`} />
      </div>
      <p className="font-mono text-[9px] tracking-[0.1em] text-ink-400 uppercase">
        {both ? CAPTION.presence[lang] : on ? L.present[lang] : L.absent[lang]}
      </p>
    </div>
  );
}

/** The element is not what changes - what it does unprompted is. A viewport
    whose bar stays put while the content under it moves, marked as something
    the interface does by itself. */
function Behavior({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative h-[86px] overflow-hidden rounded-md border border-line-soft" aria-hidden>
        <div className="absolute inset-x-0 top-0 flex items-center gap-1.5 border-b border-line-soft bg-ink-900 px-2 py-1.5">
          <span className="h-1.5 w-[28%] rounded-[3px] bg-paper/70" />
          <span className="h-1.5 w-[16%] rounded-[3px] bg-paper/40" />
        </div>
        <div className="flex flex-col gap-1.5 px-2 pt-9">
          <span className={`h-1.5 w-[86%] ${BAR}`} />
          <span className={`h-1.5 w-[64%] ${BAR}`} />
          <span className={`h-1.5 w-[74%] ${BAR}`} />
        </div>
        <span className="absolute right-1.5 bottom-1.5 rounded border border-line px-1.5 py-0.5 font-mono text-[8px] tracking-[0.06em] text-ink-500 uppercase">
          {L.auto[lang]}
        </span>
      </div>
      <Caption kind="behavior" lang={lang} />
    </div>
  );
}

/** One slot, filled from who the visitor is. The inputs are named; what they
    resolve to is not, because the record never says. */
function Personalization({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap gap-1.5">
        {[L.source, L.segment, L.state].map((c, i) => (
          <span
            key={c.en}
            className={`rounded border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.06em] uppercase ${
              i === 0 ? "border-ink-900 text-ink-800" : "border-line text-ink-400"
            }`}
          >
            {c[lang]}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2" aria-hidden>
        <span className="h-px w-4 bg-ink-200" />
        <div className="flex flex-1 flex-col gap-1.5 rounded-md border border-dashed border-ink-300 p-2.5">
          <span className={`h-1.5 w-[70%] ${MARK}`} />
          <span className={`h-1.5 w-[45%] ${BAR}`} />
        </div>
      </div>
      <Caption kind="personalization" lang={lang} />
    </div>
  );
}

/** Which option is already chosen when the page arrives. The option set is
    identical on both rows; only the pre-selection differs. */
function DefaultState({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-2.5">
      {[true, false].map((preset) => (
        <div key={String(preset)} className="flex items-center gap-2.5">
          <div className="flex flex-1 flex-col gap-1.5" aria-hidden>
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span
                  className={`size-2.5 rounded-full border ${
                    preset && i === 0 ? "border-ink-900 bg-ink-900" : "border-ink-300"
                  }`}
                />
                <span className={`h-1.5 ${BAR}`} style={{ width: i === 0 ? "52%" : "38%" }} />
              </div>
            ))}
          </div>
          <span className={`w-[38%] shrink-0 text-right ${RAIL}`}>
            {preset ? L.preselected[lang] : L.none[lang]}
          </span>
        </div>
      ))}
      <Caption kind="default" lang={lang} />
    </div>
  );
}

/** The same element at two scales. Nothing else about it moves. */
function Size({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-end gap-3" aria-hidden>
        <div className="flex flex-1 items-center justify-center rounded-md border border-line-soft py-2">
          <span className={`h-3 w-[60%] ${MARK}`} />
        </div>
        <div className="flex flex-1 items-center justify-center rounded-md border border-line-soft py-4">
          <span className={`h-6 w-[60%] ${MARK}`} />
        </div>
      </div>
      <Caption kind="size" lang={lang} />
    </div>
  );
}

/** One element, two visual treatments - identical geometry, identical copy
    width, different fill. The swatch row says the treatment is the variable
    without naming a colour the record never chose. */
function Style({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-3" aria-hidden>
        <div className="flex flex-1 items-center justify-center rounded-md bg-ink-900 py-2.5">
          <span className="h-1.5 w-[46%] rounded-[3px] bg-paper/70" />
        </div>
        <div className="flex flex-1 items-center justify-center rounded-md border border-ink-900 py-2.5">
          <span className={`h-1.5 w-[46%] ${BAR}`} />
        </div>
      </div>
      <div className="flex gap-1" aria-hidden>
        {["bg-ink-900", "bg-ink-500", "bg-ink-300", "bg-ink-100"].map((c) => (
          <span key={c} className={`size-3 rounded-[3px] ${c}`} />
        ))}
      </div>
      <Caption kind="style" lang={lang} />
    </div>
  );
}

/** Same value, different rendering. */
function Format({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex gap-2" aria-hidden>
        <span className={`h-8 flex-1 ${BLOCK}`} />
        <span className={`h-8 flex-1 ${GHOST}`} />
      </div>
      <Caption kind="format" lang={lang} />
    </div>
  );
}

/** Two named alternatives, neither one a baseline. */
function Options({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-2 gap-2" aria-hidden>
        <div className="flex flex-col gap-1.5 rounded-md border border-line-soft p-2.5">
          <span className={`h-1.5 w-[70%] ${BAR}`} />
          <span className={`h-5 w-full ${BLOCK}`} />
        </div>
        <div className="flex flex-col gap-1.5 rounded-md border border-line-soft p-2.5">
          <span className={`h-1.5 w-[55%] ${BAR}`} />
          <span className={`h-5 w-full ${BLOCK}`} />
        </div>
      </div>
      <Caption kind="options" lang={lang} />
    </div>
  );
}

/** An image or video slot. */
function Media({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative h-[74px] rounded-md bg-ink-100" aria-hidden>
        <span className="absolute inset-0 m-auto size-6 rounded-full border-2 border-ink-300" />
      </div>
      <Caption kind="media" lang={lang} />
    </div>
  );
}

/** Blocks rearranged - the structure moves, the content does not. */
function Layout({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-3 gap-1.5" aria-hidden>
        <span className={`h-10 ${BLOCK}`} />
        <span className={`col-span-2 h-10 ${BLOCK}`} />
        <span className={`col-span-2 h-6 ${BLOCK}`} />
        <span className={`h-6 ${BLOCK}`} />
      </div>
      <Caption kind="layout" lang={lang} />
    </div>
  );
}

/** One string, two wordings. */
function Wording({ lang }: { lang: Lang }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="rounded-md border border-line-soft px-2.5 py-2" aria-hidden>
        <span className={`block h-1.5 w-[58%] ${BAR}`} />
      </div>
      <div className="rounded-md border border-line-soft px-2.5 py-2" aria-hidden>
        <span className={`block h-1.5 w-[76%] ${BAR}`} />
      </div>
      <Caption kind="wording" lang={lang} />
    </div>
  );
}
