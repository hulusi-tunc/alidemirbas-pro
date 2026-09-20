import type { ReactNode } from "react";
import { ArrowRightLeft, CheckCircle2, Clock, Cog, Flag, LogOut, Mail, Route, Split, UserRound, Zap } from "lucide-react";

import type { FlowNode } from "@/lib/canonical-view";
import type { Lang } from "@/lib/content";
import type { ChannelId, SignalSource } from "@/canonical/types";
import { CHANNEL_HUE, CHANNEL_LABEL } from "@/lib/journey-channels";

/* THE CANVAS NODE KIT, on the site's own system (Hulusi, 2026-09-14: "each
   canvas element needs to be redesigned and restructured; we need a design
   system for that - we already started it on the Lab page"). The cards
   now speak the Lab's drawn idiom: paper cards with a hairline ring and a
   soft shadow, a tinted icon tile per kind carrying a Lucide icon (the
   site's one icon set), plain-case labels on the 12px step, secondary
   states as quiet pills. Hierarchy stays as the grammar sets it: Action
   is the widest card, its own sentence clamped to a glance rather than a
   read (the full sentence is one click away, in the detail panel), Trigger
   is the one filled card - brand blue, with the Entry pin standing on its
   top edge so the start of a journey is the first thing the eye finds
   ("Entry is so hard to see") - Condition and Wait are compact, Exit sits
   at rest on a dashed edge. Every word on a card is canonical prose,
   mechanically derived from it (a short title, a short duration), or one
   of the kind names below; nothing is invented.

   Sizes are reserved by journey-canvas-layout.ts's SIZE table; keep the
   two in step when changing padding, type or clamps here. */

export function humanize(text: string): string {
  const words = text.replace(/[_.]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/* A wait's `detail` (`timeout after ...`) already carries the timeout's own
   value inside a parenthetical - "(example: 45 minutes; configure ...)" on
   the EN route, "(örnek: 45 dakika; ayarla: ...)" on the TR route, both
   composed by config-text.ts and journey-tr-overrides.ts before this
   component ever sees the string (see canonical-view.ts / journey-tr-
   overrides.ts - this file receives `node.detail` already localized, in
   whichever language the page is). Pulling the value back out of that
   wrapper - rather than adding a second, raw-English field bypassing that
   localization - is what keeps a Turkish reader from ever seeing an English
   duration on the one route where this card's main text has to be short.

   A REQUIRED wait with no configured default (vNext, `Config.required:
   true`) has no value to pull out - config-text.ts's own wrapper is
   "<rule sentence> (configure <key>)", mechanically translated by
   journey-tr-overrides.ts's regex layer to "(<key> ayarlanmalı)" wherever
   no hand-authored override exists for that node. Where an override DOES
   exist (most nodes, corpus-wide - the free-prose TR translation effort),
   the translator re-wrote the whole sentence by hand and the trailing
   wrapper varies in wording per node ("... ayarlanmalı", "... üzerinden
   yapılandırılır", and a few left as the untranslated English "(configure
   ...)" - confirmed by sampling journey-tr-overrides.ts directly, not
   assumed). Matching each wording is a losing game against future
   variants; instead this pulls the dotted key out of whichever trailing
   parenthetical is present, ignoring the wrapper words around it - which
   also quietly fixes the untranslated-English-leftover case, since only
   the key (already language-neutral) ever reaches the card. Falling all
   the way back to the full "until <event meaning>, or <event meaning>,
   ..." headline in the no-parenthetical case is what left multi-clause
   corpus sentences (confirmed corpus-wide, not a guess) sitting on a wait
   pill meant to say "45 minutes"; past a length worth worrying about, the
   headline's own first clause (up to its first comma/"or"/"veya"/"ya da")
   stands in for the whole thing - the full multi-condition sentence stays
   reachable in the detail panel, this card is a summary. The config key
   alone is shorter and, left unhumanized rather than turned into a
   natural-looking phrase, reads honestly as the technical reference it
   is - the same "don't translate canonical keys" rule this corpus already
   applies to node ids and event ids, not a new exception. */
const WAIT_VALUE_RE = /\((?:example|recommended|örnek|önerilen): ([^;)]+)[;)]/i;
const TRAILING_PAREN_RE = /\(([^()]*)\)\s*$/;
const DOTTED_KEY_RE = /\b([a-z][\w]*(?:\.[a-z][\w]*)+)\b/i;
const CLAUSE_SEP_RE = /, | veya | ya da | or |; /;

function firstClause(text: string): string {
  if (text.length <= 70) return text;
  const m = CLAUSE_SEP_RE.exec(text);
  return m && m.index <= 90 ? text.slice(0, m.index) : text;
}

/* Card body budget - the same idea as the wait pill's `firstClause` above,
   applied to every card that renders a canonical sentence.

   Every body below is already `line-clamp-2`: two lines, then an ellipsis.
   That stops a long sentence overflowing its slot, but it cuts wherever the
   second line happens to run out - mid-word, mid-clause - so the corpus's
   longest action sentences (412 characters on FBK-47's `a.apply`, 391 on
   FBK-46's `a.close-unconfirmed`, measured, not estimated) reach the canvas
   as a fragment. A reader glancing at the graph gets half a subordinate
   clause and no way to tell there was more.

   Cutting at the sentence's OWN first boundary instead gives them a whole
   clause. Order of preference: the end of the first sentence, then a
   semicolon or a dash, then - only if none of those exists - the softer
   comma/"or"/"veya" break `firstClause` already uses. Nothing is
   paraphrased and nothing is lost: the detail panel renders `node.headline`
   in full, unchanged, which is the same contract the wait pill and the
   clamp itself have always had. A sentence that already fits the budget is
   passed through exactly as authored, so short cards - the majority - are
   untouched.

   Every boundary in the sentence is collected, not just the first, and the
   LONGEST one that still fits the budget wins - the most the card can say
   inside its two lines, rather than the least. The 24-character floor drops
   a cut so early that the card would say nothing ("Establish what failed");
   the next boundary is taken instead. A sentence with no boundary at all
   inside the budget keeps its full text and the clamp handles it, which is
   exactly the behaviour before this function existed. */
const CARD_BODY_BUDGET = 120;
const MIN_CARD_BODY = 24;
/* `keep: 1` keeps the full stop itself; the others cut before the mark. The
   sentence rule wants a capital after the stop so that an abbreviation
   mid-sentence ("e.g. the ...") is not read as the end of one. */
const HARD_CUTS: readonly { re: RegExp; keep: number }[] = [
  { re: /\.\s+[A-ZÇĞİÖŞÜ]/g, keep: 1 },
  { re: /: /g, keep: 0 },
  { re: /; /g, keep: 0 },
  { re: / - | — /g, keep: 0 },
];
const SOFT_CUTS = /, | veya | ya da | or /g;

function cutPoints(text: string, re: RegExp, keep: number): number[] {
  const out: number[] = [];
  re.lastIndex = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    const at = m.index + keep;
    if (at >= MIN_CARD_BODY) out.push(at);
  }
  return out;
}

export function cardSummary(text: string): string {
  if (text.length <= CARD_BODY_BUDGET) return text;
  const hard: number[] = [];
  for (const { re, keep } of HARD_CUTS) hard.push(...cutPoints(text, re, keep));
  const fits = (points: number[]) => points.filter((p) => p <= CARD_BODY_BUDGET).sort((a, b) => b - a)[0];
  const hardFit = fits(hard);
  if (hardFit !== undefined) return text.slice(0, hardFit);
  const softFit = fits(cutPoints(text, SOFT_CUTS, 0));
  if (softFit !== undefined) return text.slice(0, softFit);
  const anyHard = hard.sort((a, b) => a - b)[0];
  return anyHard === undefined ? text : text.slice(0, anyHard);
}

function waitLabel(node: FlowNode): string {
  const detail = node.detail;
  const value = detail ? WAIT_VALUE_RE.exec(detail) : null;
  if (value) return value[1].trim();
  const paren = detail ? TRAILING_PAREN_RE.exec(detail) : null;
  const key = paren ? DOTTED_KEY_RE.exec(paren[1]) : null;
  if (key) return key[1];
  return humanize(firstClause(node.headline));
}

/* A communication action's own real name, when its prose follows the
   corpus's own "Send the first/second <noun> reminder on the channel just
   selected, ..." idiom (EN) or "... ilk/ikinci <noun> hatırlatmasını
   gönder, ..." (TR, already-localized text - see WAIT_VALUE_RE's own
   comment on why this reads `node.headline` post-localization rather than
   adding a second raw field). Pattern-matched against the sentence
   structure, not any one journey's node id, so it applies to every future
   action authored the same way and falls back to the generic kind label +
   sequence, unchanged, wherever the pattern does not match. */
const ACTION_TITLE_EN_RE = /^Send (?:the )?(?:first|second|third|fourth|next)?\s*(.+?)\s+on the channel\b/i;
const ACTION_TITLE_TR_RE = /(?:ilk|ikinci|üçüncü|dördüncü)\s+(\S+)\s+hatırlatmasını\s+gönder/i;

/* Fallback tier 2: most of the corpus does not phrase a send action as
   "Send the X reminder..." (that idiom is this session's own, used only on
   the two journeys it authored) - it describes what the message SAYS or
   SHOWS in free prose with no consistent extractable noun. `Touch.stage`
   (orchestration.touches, vNext) is authored, structured data instead:
   the practitioner's own short name for this step in the send cascade
   ("initial-recovery", "follow-up", "final-notice"), found by the touch's
   own `action` reference back to this node - not a guess from sentence
   shape. EN humanizes the key directly (a hyphenated English identifier
   reads fine split into words); TR needs real translation, since the key
   itself is always English - this table is that translation, covering
   every stage value the customer-library surface actually uses (closed,
   generated by inspecting the corpus, not invented). A stage outside this
   table (only possible on a non-library public journey) falls through to
   the generic kind label, same as a journey with no orchestration at all. */
const TOUCH_STAGE_TR: Readonly<Record<string, string>> = {
  "accept-request": "Talebi kabul et", "acknowledge": "Bilgilendirme", "acknowledge-review": "İnceleme bildirimi",
  "acknowledgement": "Onay bildirimi", "action-prompt": "Aksiyon hatırlatması", "active": "Aktif bildirim",
  "alert": "Uyarı", "alternative-offer": "Alternatif teklif", "approve": "Onay",
  "arrived": "Varış bildirimi", "ask": "Soru", "ask-heavy": "Detaylı soru",
  "ask-light": "Kısa soru", "assign": "Atama bildirimi", "assisted": "Destekli yönlendirme",
  "at-risk-notice": "Risk bildirimi", "at-the-wall": "Son aşama bildirimi", "attempt": "Deneme bildirimi",
  "behaviour-nudge": "Davranış hatırlatması", "brief": "Özet bilgilendirme", "challenge": "Doğrulama isteği",
  "cleared": "Temizlendi bildirimi", "closed-full": "Tam kapanış bildirimi", "closed-partial": "Kısmi kapanış bildirimi",
  "communicate": "Bilgilendirme", "communicate-outcome": "Sonuç bildirimi", "confirm": "Onay",
  "confirm-accept": "Kabul onayı", "confirm-closure": "Kapanış onayı", "confirm-decline": "Red onayı",
  "confirmation": "Onay", "confirmation-ask": "Onay isteği", "confirmation-request": "Onay talebi",
  "correct": "Düzeltme", "correct-distribution": "Dağıtım düzeltmesi", "correctable": "Düzeltilebilir bildirim",
  "corrective-request": "Düzeltme talebi", "decision-request": "Karar talebi", "decline": "Red bildirimi",
  "delay-update": "Gecikme güncellemesi", "deliver": "Teslimat bildirimi", "dispatch": "Sevkiyat bildirimi",
  "distribute": "Dağıtım bildirimi", "educate": "Bilgilendirme", "ending": "Sonlanma bildirimi",
  "expired": "Süresi doldu bildirimi", "explain": "Açıklama", "explain-terminal": "Sonlanma açıklaması",
  "final": "Son bildirim", "final-notice": "Son uyarı", "first-touch": "İlk temas",
  "fix-auth": "Yetkilendirme düzeltmesi", "fix-capability": "Yetenek düzeltmesi", "fix-scope": "Kapsam düzeltmesi",
  "follow-up": "Takip bildirimi", "followup": "Takip bildirimi", "generic": "Bildirim",
  "in-force-actionable": "Yürürlükte, aksiyon gerekli", "in-force-standing": "Yürürlükte bildirim", "inform": "Bilgilendirme",
  "inform-hold": "Bekletme bilgilendirmesi", "inform-only": "Yalnızca bilgilendirme", "informational-notice": "Bilgilendirme notu",
  "initial-recovery": "İlk kurtarma hatırlatması", "invitation": "Davet", "invite-known": "Bilinen kişiye davet",
  "invite-new": "Yeni davet", "issue": "Sorun bildirimi", "lapse": "Sona erme bildirimi",
  "last-call": "Son çağrı", "lead-prompt": "Potansiyel müşteri hatırlatması", "lost": "Kayıp bildirimi",
  "name-blocker": "Engel bildirimi", "next-action": "Sıradaki aksiyon", "next-step": "Sıradaki adım",
  "no-arrival": "Varış olmadı bildirimi", "no-choice-update": "Seçim yapılmadı güncellemesi", "no-remedy": "Çözüm yok bildirimi",
  "no-route": "Yönlendirme yok bildirimi", "notify": "Bildirim", "notify-authorization": "Yetkilendirme bildirimi",
  "notify-blocked-party": "Engellenen taraf bildirimi", "notify-cannot-close": "Kapatılamıyor bildirimi", "notify-provider-cancel": "Sağlayıcı iptali bildirimi",
  "notify-quiet": "Sessiz bildirim", "notify-rejection": "Red bildirimi", "notify-restricted": "Kısıtlama bildirimi",
  "notify-unauthorized": "Yetkisiz erişim bildirimi", "nurture": "Besleme mesajı", "offer": "Teklif",
  "offer-alternate": "Alternatif teklif", "offer-holder": "Hak sahibine teklif", "offer-route": "Yönlendirme teklifi",
  "offer-self": "Kendi kendine teklif", "overdue": "Gecikme bildirimi", "owner-task": "Sahip görevi",
  "partial": "Kısmi bildirim", "prerequisite-prompt": "Ön koşul hatırlatması", "present": "Sunum",
  "prompt-alt": "Alternatif hatırlatma", "prompt-in-app": "Uygulama içi hatırlatma", "ready": "Hazır bildirimi",
  "reapply": "Yeniden başvuru", "reason-ask": "Neden sorgusu", "rebooking-offer": "Yeniden rezervasyon teklifi",
  "received": "Alındı bildirimi", "recognition": "Takdir bildirimi", "recovery": "Kurtarma hatırlatması",
  "reject": "Red", "reject-scope": "Kapsam reddi", "remind": "Hatırlatma",
  "reminder": "Hatırlatma", "renew": "Yenileme", "reoffer": "Yeniden teklif",
  "replace": "Değiştirme", "replacement-notice": "Değişiklik bildirimi", "requalify": "Yeniden yeterlilik",
  "request": "Talep", "request-internal": "İç talep", "request-more": "Ek bilgi talebi",
  "request-more-info": "Ek bilgi talebi", "required-notice": "Zorunlu bildirim", "reset": "Sıfırlama bildirimi",
  "resolution": "Çözüm bildirimi", "restored": "Geri yüklendi bildirimi", "review": "İnceleme",
  "route-dependency": "Yönlendirme bağımlılığı", "routing": "Yönlendirme", "signature-request": "İmza talebi",
  "specific-action": "Özel aksiyon", "surface": "Görünür kılma", "total": "Toplam bildirim",
  "unverified": "Doğrulanmadı bildirimi", "verify": "Doğrulama", "waitlist": "Bekleme listesi",
};

function stageTitle(stage: string, lang: Lang): string | null {
  if (lang === "tr") return TOUCH_STAGE_TR[stage] ?? null;
  return humanize(stage.replace(/-/g, " "));
}

function actionTitle(node: FlowNode, lang: Lang): string | null {
  if (lang === "tr") {
    const m = ACTION_TITLE_TR_RE.exec(node.headline);
    if (m) return `${humanize(m[1])} hatırlatması`;
  } else {
    const m = ACTION_TITLE_EN_RE.exec(node.headline);
    if (m) return humanize(m[1]);
  }
  return node.touchStage ? stageTitle(node.touchStage, lang) : null;
}

/** The channel-priority rows: a labelled "Primary"/"Fallback" pair (or
    longer chain), never a bare arrow - "Push → Email" alone read as two
    channels a message goes out on in sequence, not as "try Push, and only
    if it fails, Email" (2026-09-19 feedback: the arrow-only chip was
    genuinely ambiguous). Shared by a channel-selecting action and, when it
    inherited that action's own priority, the message/human action right
    after it (see `FlowNode.channelPriority`) - one presentation for every
    router+message pairing on the canvas, not a per-journey choice. */
function ChannelPriorityRow({ groups, lang }: { groups: readonly (readonly ChannelId[])[]; lang: Lang }) {
  const w = CARD_TEXT[lang];
  return (
    <div className="mt-2.5 flex flex-col gap-1 [[data-lod=far]_&]:hidden">
      {groups.map((ids, i) => (
        <span key={ids.join("+")} className="flex items-center gap-2">
          <span className="w-[62px] shrink-0 text-[11px] text-ink-400">{i === 0 ? w.primary : w.fallback}</span>
          {/* A role can carry more than one channel (low-friction is push
              AND in-app): both pills sit on the one row, because they are
              one step of the priority, not two. */}
          <span className="flex flex-wrap gap-1">
            {ids.map((id) => (
              <span key={id} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CHANNEL_HUE[id].pill}`}>
                {CHANNEL_LABEL[id][lang]}
              </span>
            ))}
          </span>
        </span>
      ))}
    </div>
  );
}

const KIND = {
  message: { tile: "bg-primary-50 text-primary-700", ink: "text-primary-700" },
  human: { tile: "bg-amber-50 text-amber-700", ink: "text-amber-700" },
  internal: { tile: "bg-paper-soft text-ink-600", ink: "text-ink-600" },
  router: { tile: "bg-cyan-50 text-cyan-700", ink: "text-cyan-700" },
  condition: { tile: "bg-violet-50 text-violet-700", ink: "text-violet-700" },
  wait: { tile: "bg-teal-50 text-teal-700", ink: "text-teal-700" },
  handoff: { tile: "bg-indigo-50 text-indigo-700", ink: "text-indigo-700" },
  outcome: { tile: "bg-emerald-50 text-emerald-700", ink: "text-emerald-700" },
  exit: { tile: "bg-paper-soft text-ink-500", ink: "text-ink-500" },
} as const;

type Kind = (typeof KIND)[keyof typeof KIND];

/** The trigger's evidence-source pill (SignalSource is a closed 4-value
    enum, not canonical free prose) - a small bilingual lookup, same shape
    as CARD_TEXT below, not per-journey content. */
const SIGNAL_SOURCE_LABEL: Record<Lang, Record<SignalSource, string>> = {
  en: { authoritative: "Authoritative", declared: "Declared", behavioral: "Behavioral", inferred: "Inferred" },
  tr: { authoritative: "Yetkili kaynak", declared: "Beyan edilen", behavioral: "Davranışsal", inferred: "Çıkarımsal" },
};

const CARD_TEXT = {
  en: {
    trigger: "Trigger",
    decision: "Decision",
    wait: "Wait",
    handoff: "Handoff",
    outcome: "Outcome",
    exit: "Exit",
    external: "External",
    internal: "Internal",
    message: "Message",
    human: "Human",
    internalAction: "Internal",
    channelSelection: "Channel selection",
    primary: "Primary",
    fallback: "Fallback",
  },
  tr: {
    trigger: "Tetikleyici",
    decision: "Karar",
    wait: "Bekleme",
    handoff: "Devir",
    outcome: "Sonuç",
    exit: "Çıkış",
    external: "Dış",
    internal: "İç",
    message: "Mesaj",
    human: "İnsan",
    internalAction: "İç işlem",
    channelSelection: "Kanal seçimi",
    primary: "Öncelikli",
    fallback: "Yedek",
  },
} as const;

function Shell({
  children,
  className = "",
  onClick,
  ariaLabel,
  fit = false,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel: string;
  /** Wait is the one capsule: it shrinks to its own content. */
  fit?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={`block h-full cursor-pointer text-left transition-[box-shadow,transform] duration-[var(--duration-fast)] hover:-translate-y-px hover:shadow-[0_10px_24px_-12px_rgb(10_16_32/0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
        fit ? "mx-auto w-fit" : "w-full"
      } ${className}`}
    >
      {children}
    </button>
  );
}

const CARD = "rounded-2xl bg-paper px-3.5 py-3 ring-1 ring-ink-950/[0.08] shadow-[0_1px_2px_rgb(10_16_32/0.04)]";
const FAR = {
  message: "[[data-lod=far]_&]:bg-primary-200 [[data-lod=far]_&]:ring-primary-300",
  human: "[[data-lod=far]_&]:bg-amber-200 [[data-lod=far]_&]:ring-amber-300",
  internal: "[[data-lod=far]_&]:bg-neutral-200 [[data-lod=far]_&]:ring-neutral-300",
  router: "[[data-lod=far]_&]:bg-cyan-200 [[data-lod=far]_&]:ring-cyan-300",
  condition: "[[data-lod=far]_&]:bg-violet-200 [[data-lod=far]_&]:ring-violet-300",
  handoff: "[[data-lod=far]_&]:bg-indigo-200 [[data-lod=far]_&]:ring-indigo-300",
  outcome: "[[data-lod=far]_&]:bg-emerald-200 [[data-lod=far]_&]:ring-emerald-300",
} as const;

/* At a far zoom (the world's `data-lod="far"`, under 45%) a card gives up
   its words and becomes its icon: the tile grows to fill the card's top
   and the sentence, the pills and the kind label hide, so a zoomed-out
   journey reads as a diagram of coloured glyphs instead of specks. */
function Tile({ kind, children, className = "" }: { kind: Kind | { tile: string; ink: string }; children: ReactNode; className?: string }) {
  return (
    <span aria-hidden className={`grid size-6 shrink-0 place-items-center rounded-lg ${kind.tile} [&>svg]:size-3.5 [[data-lod=far]_&]:size-20 [[data-lod=far]_&]:rounded-3xl [[data-lod=far]_&]:bg-white/70 [[data-lod=far]_&]:[&>svg]:size-10 ${className}`}>
      {children}
    </span>
  );
}

function KindRow({ kind, icon, children }: { kind: Kind; icon: ReactNode; children: ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <Tile kind={kind}>{icon}</Tile>
      <span className={`text-xs font-medium ${kind.ink} [[data-lod=far]_&]:hidden`}>{children}</span>
    </span>
  );
}

function Pill({ children, onDark = false }: { children: ReactNode; onDark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
        onDark ? "bg-white/15 text-white/85" : "bg-paper-soft text-ink-600"
      }`}
    >
      {children}
    </span>
  );
}

/* Trigger: the one filled card, brand blue. The Entry pin stands on its
   top edge in ink, so the start reads before anything else. */
export function TriggerCard({ node, onOpen, entryLabel, lang = "en" }: { node: FlowNode; onOpen: () => void; entryLabel: string; lang?: Lang }) {
  const w = CARD_TEXT[lang];
  return (
    <div className="relative h-full w-full">
      {node.isEntry ? (
        <span className="absolute -top-3.5 left-3 z-10 flex origin-bottom-left items-center gap-1 rounded-full bg-ink-950 px-2.5 py-1 text-xs font-semibold text-white shadow-[0_6px_16px_-8px_rgb(10_16_32/0.6)] ring-2 ring-paper [[data-lod=far]_&]:scale-[2.4]">
          <Zap aria-hidden className="size-3" />
          {entryLabel}
        </span>
      ) : null}
      <Shell onClick={onOpen} ariaLabel={node.headline} className="rounded-2xl bg-primary-600 px-3.5 py-3 text-white ring-1 ring-primary-700/40 shadow-[0_10px_24px_-14px_rgb(46_92_255/0.6)]">
        <span className="flex items-center gap-2">
          <Tile kind={{ tile: "bg-white/15 text-white", ink: "" }}>
            <Zap aria-hidden />
          </Tile>
          <span className="text-xs font-medium text-white/85 [[data-lod=far]_&]:hidden">{w.trigger}</span>
        </span>
        <p className="mt-2 line-clamp-2 text-[13.5px] leading-snug font-medium [[data-lod=far]_&]:hidden">{humanize(cardSummary(node.headline))}</p>
        {node.evidenceSource ? (
          <span className="mt-2 flex [[data-lod=far]_&]:hidden">
            <Pill onDark>{SIGNAL_SOURCE_LABEL[lang][node.evidenceSource]}</Pill>
          </span>
        ) : null}
      </Shell>
    </div>
  );
}

export function HandoffCard({ node, onOpen, lang = "en" }: { node: FlowNode; onOpen: () => void; lang?: Lang }) {
  const w = CARD_TEXT[lang];
  return (
    <Shell onClick={onOpen} ariaLabel={node.headline} className={`${CARD} ${FAR.handoff}`}>
      <KindRow kind={KIND.handoff} icon={<ArrowRightLeft aria-hidden />}>
        {w.handoff}
      </KindRow>
      <p className="mt-2 line-clamp-2 text-[13.5px] leading-snug text-ink-950 [[data-lod=far]_&]:hidden">{cardSummary(node.headline)}</p>
      <span className="mt-2 flex [[data-lod=far]_&]:hidden">
        <Pill>{node.external ? w.external : w.internal}</Pill>
      </span>
    </Shell>
  );
}

export function OutcomeCard({ node, onOpen, lang = "en" }: { node: FlowNode; onOpen: () => void; lang?: Lang }) {
  const w = CARD_TEXT[lang];
  return (
    <Shell onClick={onOpen} ariaLabel={node.headline} className={`${CARD} ${FAR.outcome}`}>
      <KindRow kind={KIND.outcome} icon={<Flag aria-hidden />}>
        {w.outcome}
      </KindRow>
      <p className="mt-2 line-clamp-2 text-[13.5px] leading-snug text-ink-950 [[data-lod=far]_&]:hidden">{cardSummary(node.headline)}</p>
    </Shell>
  );
}

/* Exit: a small terminal capsule, the same "fit" sizing Wait already uses
   (Shell's `fit` prop) rather than a card sized like an action - a journey
   ends in a word, not a paragraph, and `splitExitState` (canonical-view.ts)
   already keeps that word short. Dashed, at rest, for every ending except
   a successful one, which reads instead of just stops: a filled check tile
   in the same emerald the Outcome card already uses elsewhere in this file
   (no new color introduced). Driven by the exit's own authored `class`
   (see FlowNode.exitClass) - never a guess from its headline text - and
   every other class (timeout, invalid-state, no-action, ...) keeps
   exactly the prior, undifferentiated capsule. */
export function ExitCard({ node, onOpen, terminalLabel }: { node: FlowNode; onOpen: () => void; terminalLabel: string; lang?: Lang }) {
  const success = node.exitClass === "success";
  return (
    <Shell
      onClick={onOpen}
      ariaLabel={node.headline}
      fit
      className={`flex max-w-[220px] items-center gap-1.5 rounded-full border border-dashed py-1.5 pr-3 pl-1.5 ${
        success ? "border-emerald-200 bg-emerald-50/40 [[data-lod=far]_&]:bg-emerald-100" : "border-ink-300 bg-paper/70 [[data-lod=far]_&]:bg-neutral-100"
      }`}
    >
      <Tile kind={success ? KIND.outcome : KIND.exit} className="size-5">
        {success ? <CheckCircle2 aria-hidden /> : <LogOut aria-hidden />}
      </Tile>
      {/* No line-clamp here on purpose: `line-clamp` establishes a
          `-webkit-box` that does not size predictably inside a `w-fit`
          flex shell (verified - it truncated a longer TR exit headline to
          "Checkout..." well before the pill's own max-width). Exit
          headlines are already short by construction (`splitExitState`,
          canonical-view.ts), so plain wrapping inside `max-w-[220px]`
          costs at most one extra line on the rare longer one, never a
          silently broken truncation. */}
      <span className={`text-[13px] leading-snug font-medium [[data-lod=far]_&]:hidden ${success ? "text-emerald-700" : "text-ink-600"}`}>
        {node.headline}
      </span>
      {node.terminal ? <Pill>{terminalLabel}</Pill> : null}
    </Shell>
  );
}

/* A channel-selecting action with no matching successor to collapse into
   (journey-canvas-layout.ts's display graph absorbs the ordinary case -
   see its own comment - so this is the rare/defensive path: some other
   corpus shape where a router isn't immediately followed by the send it
   selects for). Reads as a routing step, not a paragraph of permission
   rules - the priority-with-fallback IS the card; the full prose stays
   one click away in the detail panel, unchanged there. */
function RouterCard({ node, onOpen, priority, lang }: { node: FlowNode; onOpen: () => void; priority: readonly ChannelId[]; lang: Lang }) {
  const w = CARD_TEXT[lang];
  return (
    <Shell onClick={onOpen} ariaLabel={node.headline} className={`${CARD} ${FAR.router} py-2.5`}>
      <KindRow kind={KIND.router} icon={<Route aria-hidden />}>
        {w.channelSelection}
      </KindRow>
      <ChannelPriorityRow groups={priority.map((id) => [id])} lang={lang} />
    </Shell>
  );
}

/* Communication and human actions - a journey builder's own action card:
   an icon, the action's real name, the channel(s) it goes out on. No
   paragraph, ever (the full canonical sentence is one click away, in the
   detail panel - never lost, never paraphrased there) and no sequence
   number (nothing left on the card that needs one to stay distinct; the
   node's own id already does that job in the detail panel). `priority`
   is usually inherited from a channel-selecting action the display graph
   collapsed into this same card (journey-canvas-layout.ts) - the router's
   own full logic is still one click away too, surfaced in the panel under
   its own "Routing logic" section (NodeDetailPanel's `collapsedRouter`). */
export function CommunicationCard({ node, onOpen, messageLabels, humanLabels, lang = "en" }: {
  node: FlowNode;
  onOpen: () => void;
  lang?: Lang;
  /** The journey's message-delivery surfaces, localised and ordered - the
      fallback shown only when nothing more specific (`channelPriority`)
      is known for this exact action. */
  messageLabels: readonly { id: ChannelId; label: string }[];
  /** The journey's human routes (sales, task), same fallback role. */
  humanLabels: readonly { id: ChannelId; label: string }[];
}) {
  const w = CARD_TEXT[lang];
  const isHuman = node.execution === "human";
  const kind = isHuman ? KIND.human : KIND.message;
  const far = isHuman ? FAR.human : FAR.message;
  const routes = isHuman ? humanLabels : messageLabels;
  /* The journey's own declared plan for THIS touch first (channelPlan -
     ordered roles, each with its channels), then a priority inherited from
     an adjacent router's prose, then the journey's whole roster. Each step
     down is a step further from "what this touch actually does". */
  const plan = node.channelPlan;
  const priority = node.channelPriority;
  const groups: readonly (readonly ChannelId[])[] = plan?.length
    ? plan.map((r) => r.channels)
    : (priority?.length ?? 0) >= 2
      ? priority!.map((id) => [id])
      : [];
  const title = actionTitle(node, lang) ?? (isHuman ? w.human : w.message);
  return (
    <Shell onClick={onOpen} ariaLabel={node.headline} className={`${CARD} ${far} py-2.5`}>
      <span className="flex items-center gap-2">
        <Tile kind={kind}>{isHuman ? <UserRound aria-hidden /> : <Mail aria-hidden />}</Tile>
        <span className="text-[13.5px] leading-snug font-medium text-ink-950 [[data-lod=far]_&]:hidden">{title}</span>
      </span>
      {groups.length ? (
        <ChannelPriorityRow groups={groups} lang={lang} />
      ) : routes.length > 0 ? (
        <span className="mt-2.5 flex flex-wrap gap-1 [[data-lod=far]_&]:hidden">
          {routes.map((r) => (
            <span key={r.id} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${CHANNEL_HUE[r.id].pill}`}>
              {r.label}
            </span>
          ))}
        </span>
      ) : null}
    </Shell>
  );
}

/* A plain internal action - state or data work with no outward effect
   (`ActionNode.execution` unset) that isn't a channel-selecting router
   either. Unchanged in shape from before this round: a kind label plus
   sequence (still the only same-kind cards on a canvas without a name of
   their own) and its own sentence clamped short. */
export function ActionCard({ node, sequence, onOpen, messageLabels, humanLabels, lang = "en" }: {
  node: FlowNode;
  sequence: number;
  onOpen: () => void;
  lang?: Lang;
  messageLabels: readonly { id: ChannelId; label: string }[];
  humanLabels: readonly { id: ChannelId; label: string }[];
}) {
  const w = CARD_TEXT[lang];
  // Execution decides the card FIRST: a communication/human action also
  // carries `channelPriority` once it inherits one from a collapsed router
  // (canonical-view.ts), so checking priority before execution would catch
  // the message too and mislabel it a router. Only a plain action (no
  // execution) with a self-detected priority is an actual, undrawn router -
  // the rare case journey-canvas-layout.ts's collapse did not absorb.
  if (node.execution === "communication" || node.execution === "human") {
    return <CommunicationCard node={node} onOpen={onOpen} messageLabels={messageLabels} humanLabels={humanLabels} lang={lang} />;
  }
  const priority = node.channelPriority;
  if (priority && priority.length >= 2) return <RouterCard node={node} onOpen={onOpen} priority={priority} lang={lang} />;
  return (
    <Shell onClick={onOpen} ariaLabel={node.headline} className={`${CARD} ${FAR.internal}`}>
      <KindRow kind={KIND.internal} icon={<Cog aria-hidden />}>
        {w.internalAction} · {String(sequence).padStart(2, "0")}
      </KindRow>
      {/* The canonical sentence itself, clamped short - a glance, not a read;
          the full text is in the detail panel, never a paraphrase. */}
      <p className="mt-2 line-clamp-2 text-[13.5px] leading-snug text-ink-950 [[data-lod=far]_&]:hidden">{cardSummary(node.headline)}</p>
    </Shell>
  );
}

export function ConditionCard({
  node,
  waitNode,
  onOpen,
  lang = "en",
}: {
  node: FlowNode;
  /** Family B (`collapsibleWaitFollowers`, journey-canvas-layout.ts): the
      wait this condition is the sole, exclusive successor of - both its
      "on event" and "on timeout" arms land here and nothing else points at
      it, so "wait, then read what happened" is one reading unit and gets
      one card rather than two. The wait's own canonical node is absorbed
      exactly like a permission gate or a bookkeeping step (full prose kept,
      reachable from the detail panel's "Represented canonical steps") - this
      component only draws its duration as a compact strip above the
      question. Undefined for every ordinary condition. */
  waitNode?: FlowNode;
  onOpen: () => void;
  lang?: Lang;
}) {
  const w = CARD_TEXT[lang];
  return (
    <Shell onClick={onOpen} ariaLabel={node.headline} className={`${CARD} ${FAR.condition} py-2.5`}>
      {waitNode ? (
        <span className="mb-2 flex items-center gap-1.5 border-b border-line-soft pb-2 text-[11px] font-medium text-teal-700 [[data-lod=far]_&]:hidden">
          <Clock aria-hidden className="size-3 shrink-0" />
          <span className="line-clamp-1">{waitLabel(waitNode)}</span>
        </span>
      ) : null}
      <KindRow kind={KIND.condition} icon={<Split aria-hidden />}>
        {w.decision}
      </KindRow>
      {/* Branch count used to show here too - dropped: the branches
          themselves, labelled, are drawn right below on the canvas, so a
          count added nothing a reader couldn't already see. Still on
          FlowNode (`branchCount`) for anything else that wants it. */}
      <p className="mt-2 line-clamp-2 text-[13.5px] leading-snug font-medium text-ink-950 [[data-lod=far]_&]:hidden">{cardSummary(node.headline)}</p>
    </Shell>
  );
}

/* Wait: the capsule, compact, its own width. */
export function WaitCard({ node, onOpen }: { node: FlowNode; onOpen: () => void }) {
  return (
    <Shell
      onClick={onOpen}
      ariaLabel={node.headline}
      fit
      className="flex max-w-[240px] items-center gap-2 rounded-full bg-paper py-1.5 pr-3.5 pl-1.5 ring-1 ring-teal-200 shadow-[0_1px_2px_rgb(10_16_32/0.04)] [[data-lod=far]_&]:bg-teal-200 [[data-lod=far]_&]:p-0"
    >
      <Tile kind={KIND.wait}>
        <Clock aria-hidden />
      </Tile>
      <span className="line-clamp-2 text-[13px] leading-snug font-medium text-ink-800 [[data-lod=far]_&]:hidden">{waitLabel(node)}</span>
    </Shell>
  );
}
