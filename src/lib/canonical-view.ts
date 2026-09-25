import {
  CATEGORIES,
  MERGED_INTO,
  byId,
  resolveJourneyId,
} from "@/canonical";
import { configText } from "@/canonical/config-text";
import { eventText } from "@/canonical/events";
import { CHANNEL_LABEL } from "@/lib/journey-channels";
import { surfaceOf } from "@/canonical/surface";
import { LIBRARY_JOURNEYS, PUBLIC_JOURNEYS, isPublicJourneyId } from "@/lib/public-corpus";
import type { Preset } from "@/canonical/types";
import type { CanonicalJourney, CanonicalNode, CategoryId, ChannelId, ChannelStrategy, ExitClass, GoalId, SignalSource } from "@/canonical/types";
import { layoutJourneyCanvas } from "@/lib/journey-canvas-layout";
import { buildJourneyPreview, type JourneyPreview } from "@/lib/journey-preview";
import { publicJourneyFlowChannels, publicJourneyFlowNodes } from "@/lib/journey-flow-overrides";
import { publicJourneyCopy } from "@/lib/journey-public-copy";

/* The read model the archive renders from.

   The canonical library is written for correctness, not for a list view: a
   journey is a node graph with an entity scope, guardrails and a reusable
   rule, and nothing in it knows what a facet is. This module is the only
   place that turns that into rows and counts, so the shape the UI wants can
   change without anything in src/canonical moving.

   It reads canonical and never writes to it. Where the two disagree about
   what a journey is, canonical is right and this file is the thing that
   adapts.

   This module is imported by server components only. The client components
   take what they need as props and import nothing from here but types, which
   is what keeps 284 journeys and 3690 nodes out of the browser bundle. */

/* THE TWO NUMBERS THE PUBLIC SITE STATES ABOUT THE LIBRARY (2026-09-05).

   Rows and routes read PUBLIC_JOURNEYS - the canonical library minus the
   archived Operational surface (src/lib/public-corpus.ts). Headlines,
   project cards, metadata descriptions and UI counters read LIBRARY_JOURNEYS
   - the Customer Journeys surface, which is what "the library" means when a
   page states its size. Both are verified, derived counts; neither is typed
   anywhere. The whole graph is still reached, deliberately, through
   `byId`/`resolveJourneyId` alone: a customer journey's handoff node still
   names an archived journey it hands to (as text, not a link), and a
   retired id still resolves to its survivor before the public check runs.

   Orchestration-rule counts are NOT exported from here any more: no public
   page states a rule count. `withLibraryCount` refuses a string that still
   carries `{rules}`, so stale copy fails the build instead of rendering a
   number nothing on the site can stand behind. */
export const LIBRARY_COUNT = LIBRARY_JOURNEYS.length;
/** Categories with at least one library (Customer Journeys) journey. */
export const LIBRARY_CATEGORY_COUNT = new Set(LIBRARY_JOURNEYS.map((j) => j.category)).size;

/** Categories with at least one PUBLIC journey, for gallery section
    headers and filters (which are per-surface anyway). */
const PUBLIC_CATEGORIES = CATEGORIES.filter((c) => c.journeys.some((j) => PUBLIC_JOURNEYS.includes(j)));

/** Fills `{count}`/`{categories}` in a copy string with the library's real,
    derived size. Throws on `{rules}`: see the note above. */
export function withLibraryCount(text: string): string {
  if (text.includes("{rules}")) throw new Error(`withLibraryCount: copy still carries a {rules} token - no public page states a rule count: "${text.slice(0, 60)}…"`);
  return text.replaceAll("{count}", String(LIBRARY_COUNT)).replaceAll("{categories}", String(LIBRARY_CATEGORY_COUNT));
}

const CATEGORY_TITLE = new Map<CategoryId, string>(CATEGORIES.map((c) => [c.id, c.title]));

/** Category identity for the gallery's section headers - the title and the
    category's OWN `purpose` from src/canonical/index.ts, not a sentence
    written for the UI. Ordered as the canonical library orders them.
    `titleTr`/`descriptionTr` are that same file's TR name and one-sentence
    description for the category (not a translation of `title`/`purpose`) -
    what the TR routes render instead of the English fields. */
export type CategoryMeta = { id: CategoryId; title: string; purpose: string; titleTr: string; descriptionTr: string };
export const CATEGORY_META: readonly CategoryMeta[] = PUBLIC_CATEGORIES.map((c) => ({
  id: c.id,
  title: c.title,
  purpose: c.purpose,
  titleTr: c.titleTr,
  descriptionTr: c.descriptionTr,
}));
/* Public slugs only: an archived journey's slug resolves to nothing, so its
   route 404s through the tree's own not-found page (dynamicParams is false on
   both [slug] routes). */
const BY_SLUG = new Map<string, CanonicalJourney>(PUBLIC_JOURNEYS.map((j) => [j.slug, j]));

/** Where a journey's trigger evidence comes from - the one property that
    changes what a journey is allowed to conclude. Canonical metadata, read
    by the detail view from the trigger node itself; kept here as the shared
    vocabulary for it. Not a library filter and not on JourneyRow - see the
    note there. */
export type EvidenceSource = "authoritative" | "declared" | "behavioral" | "inferred";

export const EVIDENCE_SOURCES: readonly EvidenceSource[] = [
  "authoritative",
  "declared",
  "behavioral",
  "inferred",
];

export type SurfaceName = "customer" | "mechanism" | "operational";

export type JourneyRow = {
  id: string;
  slug: string;
  name: string;
  /** The plain-language label - see CanonicalJourney.shortName. Undefined on
      journeys not named yet; every caller falls back to `name`. */
  shortName?: string;
  purpose: string;
  category: CategoryId;
  categoryTitle: string;
  nodeCount: number;
  /* Trigger evidence and the competition exclusion group are deliberately
     NOT on this row. Both are real canonical metadata and both stay exactly
     where they live - on the journey's own trigger node and `competition`
     field, still read by the detail view - but neither is rendered on a
     library card or searched from one, and every field here is serialized
     160 times into the page. Re-add either the day something on this screen
     actually reads it. */
  /** The single primary discovery filter - explicit canonical metadata, not
      derived here. See src/canonical/types.ts and lib/journey-taxonomy.ts. */
  goal: GoalId;
  /** The execution channels this journey's communication may use. Explicit
      canonical metadata; empty where the journey is entirely internal. */
  channels: readonly ChannelId[];
  /** Product surface, read from the journey by src/canonical/surface.ts -
      the one rule the site and the validator share. `communicating` is
      true only where the journey sends a message on a customer channel. */
  surface: SurfaceName;
  communicating: boolean;
  /** Whether the journey routes work to a person via `sales` or `task`,
      independent of `communicating` - src/canonical/surface.ts's own
      `routesToHuman`. A journey can have this true and `communicating`
      false (ACQ-04, ACT-11, RET-24: they route to a person but send no
      message) and it is still a Customer Journey on the site's listing -
      see `surfaceKeyOf` below. Not a lifecycle state: a silent lifecycle
      state does neither. */
  routesToHuman: boolean;
  /** Practitioner names the journey answers to (discovery.aliases). */
  aliases: readonly string[];
  presetCount: number;
  /** The card's topology thumbnail, laid out here (server, once, at build
      time) rather than in the browser - see lib/journey-preview.ts. */
  preview: JourneyPreview;
};

/* ------------------------------------------------------------ merged ids */

/** A journey id that was merged into another one. It is not a journey, it is
    not counted, and it must never render as if it were still active - but a
    reader who has the old id in a note or a link still deserves to land
    somewhere true. */
export type MergedRedirect = {
  from: string;
  to: string;
  toSlug: string;
  toName: string;
};

const mergedEntry = (from: string): MergedRedirect | null => {
  const to = resolveJourneyId(from);
  const target = byId(to);
  // A retired id whose survivor is archived (CTL-239, CTL-240, RET-25) has
  // nowhere public to land, so it is not a public redirect either.
  if (!target || !isPublicJourneyId(target.id)) return null;
  return { from, to: target.id, toSlug: target.slug, toName: target.name };
};

export const MERGED_REDIRECTS: readonly MergedRedirect[] = Object.keys(MERGED_INTO)
  .map(mergedEntry)
  .filter((x): x is MergedRedirect => x !== null);

/** Merged ids get their own addressable slug so an old link resolves rather
    than 404s. `con-37` is the id lowercased; it is not a journey slug. */
const MERGED_BY_SLUG = new Map<string, MergedRedirect>(
  MERGED_REDIRECTS.map((m) => [m.from.toLowerCase(), m]),
);

/** Every slug the detail route builds: 158 public journeys, 5 public merged
    redirects and 8 preset URLs. Derived, never hardcoded - these numbers are
    here to be read, and were 160/10 until the preset localization pass counted
    them. */
export const ALL_DETAIL_SLUGS: readonly string[] = [
  ...PUBLIC_JOURNEYS.map((j) => j.slug),
  ...MERGED_REDIRECTS.map((m) => m.from.toLowerCase()),
  // Presets are real URLs: each opens its parent with the preset applied.
  // (All ten belong to customer journeys; none is on the archived surface.)
  ...PUBLIC_JOURNEYS.flatMap((j) => (j.discovery?.presets ?? []).map((p) => p.id)),
];

/** Resolves a search term to a merged redirect, so typing an old id in the
    list finds the journey that absorbed it. */
export function mergedFor(term: string): MergedRedirect | null {
  return MERGED_BY_SLUG.get(term.trim().toLowerCase()) ?? null;
}

/* ------------------------------------------------------------- detail view */

/** One outgoing edge. `kind` says what the target is, because the three are
    not the same promise: a node in this journey can be jumped to, another
    journey can be opened, and an `external:` name is a destination this
    library does not own. `back` marks an edge whose target is above it on
    screen, which is the one case where following the arrow means scrolling
    the wrong way. */
export type FlowEdge = {
  /** The short label. On a condition this is the branch name, not the test. */
  label: string | null;
  /** The condition text behind the label, kept separate so a branch reads as
      a label with a reason rather than one long inline sentence. */
  detail: string | null;
  to: string;
  href: string | null;
  kind: "node" | "journey" | "external";
  back: boolean;
};

export type FlowNode = {
  id: string;
  kind: CanonicalNode["kind"];
  /** The line that says what this node is, in words. */
  headline: string;
  /** The raw canonical event id, on triggers only. Kept as metadata rather
      than as the headline: it is the engine's name for the event, and the
      engine's name is not the sentence a reader needs first. */
  eventId: string | null;
  /** The supporting detail, where the node carries any. */
  detail: string | null;
  /** Evidence, timeout reason, writes - whatever this node kind adds.
      Free-text display prose, localized on the TR route (see
      `journey-tr-overrides.ts`'s `localizeStructural`) - never read back
      structurally by anything downstream. `writesFields` below is the
      structural fact `meta`'s "writes ..." lines are built from, kept
      raw and unlocalized for exactly that purpose. */
  meta: readonly string[];
  /** Action nodes only. The authored `writes[].field` names, verbatim and
      unlocalized (canonical identifiers, the same treatment node and
      event ids already get) - the structural source `meta`'s "writes
      <field> (<mode>)" lines are rendered from. Absent means the action
      writes nothing. Exists so a layout decision that depends on WHAT a
      node writes (`absorbableBookkeeping`, journey-canvas-layout.ts) can
      read the fact directly instead of pattern-matching `meta`'s display
      prose, which is Turkish on the TR route and does not start with the
      English word "writes" there - the cause of five journeys drawing a
      different set of nodes on `/tr` than on `/en` (2026-09-21 fix). */
  writesFields?: readonly string[];
  edges: readonly FlowEdge[];
  /** Action nodes only. What this action's effect is outside the system -
      see ActionNode.execution. Absent means an internal operation, which is
      the ordinary case. */
  execution?: "communication" | "human";
  isEntry: boolean;
  /** Exit nodes only, and only where the state itself forbids re-entry. The
      ordinary case is not flagged: 431 of 436 exits allow re-entry, so a
      badge saying so on all of them is not information. */
  terminal: boolean;
  /** Trigger nodes only - how this trigger's evidence was established
      (TriggerNode.evidence.source). Real schema field, surfaced on the card
      itself rather than left inside `meta`'s free-text detail list, per the
      Journey Node System design exploration's "secondary states are badges,
      not new shapes" mechanism. */
  evidenceSource?: SignalSource;
  /** Condition nodes only - branch count (n.branches.length). A condition's
      branch count is real layout-relevant information (79% of the library's
      conditions are binary, 21% fan wider) - not invented for display. */
  branchCount?: number;
  /** Condition nodes only - the raw, unlocalized `ConditionNode.asks` text
      (same treatment as `writesFields`: kept in English regardless of route
      so a structural read never depends on which locale's prose it lands
      on). Never rendered directly - `journey-canvas-layout.ts`'s
      `repeatedChecks()` groups conditions within one journey that share
      this string verbatim, which is how a re-asked question (the same
      eligibility or status check repeated at a later stage) is told apart
      from an unrelated one that merely reads similarly once translated. */
  asks?: string;
  /** Handoff nodes only - whether the destination lies outside the canonical
      library (`to` starts with `external:`) rather than resolving to a real
      journey. Already computed once for the headline text below; exposed
      here too so the card can badge it without re-deriving it. */
  external?: boolean;
  /** Exit nodes only - `ExitNode.class` (vNext, optional), already-authored
      data never previously surfaced past its own validator check. Lets the
      card tell a successful ending from every other kind of ending without
      guessing anything from the (already short) headline text; absent on a
      non-vNext exit, which keeps its prior, undifferentiated styling. */
  exitClass?: ExitClass;
  /** Action nodes only. Channel ids literally named in this action's own
      canonical prose, in the order they appear, when two or more distinct
      channels are mentioned - or, for a communication/human action with
      none of its own, inherited from the channel-selecting action that
      leads directly into it. Mechanical, not authored: `ActionNode`'s own
      doc says which channel a communication action takes is deliberately
      NOT recorded on the node, so this is read off the words already
      there rather than a new per-action field asserting one. Absent means
      no such mention was found - the card falls back to the journey's
      full channel roster, exactly as before this field existed. */
  channelPriority?: readonly ChannelId[];
  /** Communication/human action nodes only, on a vNext journey with an
      orchestration touch plan. `Touch.stage` ("initial-recovery",
      "follow-up", "final-notice", ...) is the practitioner's own name for
      this step in the send cascade, authored data, found by the
      `Touch.action` reference back to this node's own id - not derived
      from prose, so it works corpus-wide regardless of how a journey's
      `does` sentences happen to be phrased. Absent on a non-vNext journey
      or an action no touch references; the card falls back further, to
      the generic kind label, in that case. */
  touchStage?: string;
  /** Communication/human action nodes only, on a vNext journey whose touch
      plan declares channel roles. The channels this touch reaches for, in
      the order it reaches for them - the first entry is what it tries, the
      rest are what it falls back to. Joined from `Touch.channelRoles` and
      `channelStrategy.roles` (see `touchChannelPlans`), both authored; a
      role can carry more than one channel ("low-friction" is push AND
      in-app), which is why this is a list of groups rather than a flat
      channel order. Preferred over `channelPriority` where both exist:
      that one is read off an adjacent router's prose, this one is the
      plan the journey actually declares. */
  channelPlan?: readonly { role: string; channels: readonly ChannelId[] }[];
  /** Action nodes only, on a vNext journey. The journey's own
      `contact.channelStrategy.fallback` ("next-eligible-role" |
      "same-role-other-channel" | "none"), passed through so the card can
      tell a genuine cross-role fallback cascade from a set of declared
      roles nothing resolves between. Only `"next-eligible-role"` means
      `channelPlan`'s entries are actually tried in order with each falling
      back to the next; `"same-role-other-channel"` describes delivery
      recovery WITHIN one role, never between the roles `channelPlan` lists,
      and `"none"` or absent means no fallback claim can be made at all.
      See `ChannelPriorityRow` (JourneyCanvasNodes.tsx) for the renderer
      rule this backs. */
  channelStrategyFallback?: ChannelStrategy["fallback"];
  /** True only when the canonical strategy explicitly says the roles are
      simultaneous surfaces for the same communication, not alternatives. */
  channelStrategySimultaneous?: boolean;
};

const humanEvent = (event: string): string => {
  const words = event.replace(/[_.]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/* A handoff to something outside the canonical library names it with a
   namespaced id - `external:sales-assignment`,
   `external:human-in-the-loop-lifecycle`. That id was going onto the card
   verbatim, on 14 of the library's 80 handoff cards: a colon-prefixed,
   hyphen-joined identifier is engine vocabulary, and a handoff card's whole
   job is to say where ownership goes. Same treatment `humanEvent` already
   gives an event id, extended to the `external:` prefix and to hyphens.

   Deliberately NOT translated per locale: these name systems and teams
   outside this corpus, which have no TR names to look up - the same "don't
   translate canonical identifiers" rule the site already applies to node and
   event ids, rather than inventing Turkish for a system that may not have
   one. The raw id stays in the detail panel via the edge's own `to`. */
export const externalTargetName = (target: string): string =>
  capitalize(target.replace(/^external:/, "").replace(/[-_.]+/g, " ").trim());

/** An exit's `state` is written corpus-wide as "<short clause>; <what that
    implies>" (occasionally "<short clause> - <...>", or, for a minority
    with neither, one comma-joined run-on - "risk recorded, nothing
    proportionate to do, or a higher-precedence contender already owns
    this account"). Splitting on the EARLIEST of these separators (not a
    fixed semicolon-then-dash-then-comma priority) matters on the TR route:
    several TR states use " - " early for the lead clause and only reach
    "; " much later in the sentence, so a fixed tier order would find the
    late semicolon first and return the whole overlong lead-plus-elaboration
    span instead of the short lead clause (confirmed against the corpus:
    exits like RET-24's x.monitor). The comma tier stays capped at 60 chars
    so a comma deep in an otherwise short-lead sentence (rare, not observed,
    but not provably impossible) does not get mistaken for one near the
    start. The remainder is not surfaced elsewhere: `meta` is one of the
    few fields journey-tr-overrides.ts's structural layer does not
    translate (only fixed prefixes like "evidence: " are), so parking free
    prose there would leak English onto the TR canvas for most exits; the
    remainder was never independently useful on its own outside that one
    run-on sentence, and `reEntry` (kept as `detail`, already covered by the
    TR overrides table) is the field that carries the operationally load-
    bearing half of an exit's meaning. A state with no separator (already
    one short clause) returns itself unchanged. */
export function splitExitState(state: string): string {
  const cuts: number[] = [];
  const semi = state.indexOf("; ");
  if (semi !== -1) cuts.push(semi);
  const dash = state.indexOf(" - ");
  if (dash !== -1) cuts.push(dash);
  if (cuts.length) return state.slice(0, Math.min(...cuts));
  /* Comma is the LAST resort, not a third equal tier: a state that already
     carries a real "; "/" - " boundary has its lead clause there, and a
     comma inside that lead clause is punctuation, not a boundary. Splitting
     on the earliest of all three cut ACQ-11's TR x.lapsed ("kurtarma
     süresi, süreç hâlâ açıkken doldu; başka hiçbir şey gönderilmez") down
     to "kurtarma süresi" - a noun phrase, not a statement of what ended.
     Reached only where neither separator exists at all (RET-24's x.monitor
     and the handful like it), where the first comma IS the clause end. */
  const comma = state.indexOf(", ");
  return comma !== -1 && comma <= 60 ? state.slice(0, comma) : state;
}

const capitalize = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/* THE PUBLIC CHANNEL TAXONOMY (2026-09-20, product decision - see
   audit/public-journey-scope.md).

   The customer-facing channels are Email, SMS, Push, WhatsApp and In-app, and
   nothing else. `sales` and `task` are real canonical values and stay in the
   canonical `channels` field: validate:canonical requires a declared channel
   to be BACKED by an action doing the work, in both directions, so a journey
   that raises an account-owner task genuinely must declare `task` - removing
   it from src/canonical would make the corpus lie about itself and fail the
   canonical validator.

   What they are NOT is a channel the product advertises. "This journey
   reaches you on Task" is not a sentence about a customer experience, and a
   badge saying so puts internal routing on the same footing as an email. So
   the split happens HERE, at the one projection from canonical to page:
   canonical keeps the operational truth, every public surface reads the
   filtered list. Four of the 52 are affected (ACT-13, RET-24, FBK-43,
   FBK-49); three of them also send email and in-app, so only the badge
   changes.

   A journey left with NO public channel by this filter is a real product
   problem, not a display one, and scripts/validate-public-scope.mjs fails on
   it rather than letting this function quietly hide it. */
const PUBLIC_CHANNELS: ReadonlySet<ChannelId> = new Set<ChannelId>(["email", "sms", "push", "whatsapp", "in-app"]);

export function publicChannels(channels: readonly ChannelId[]): readonly ChannelId[] {
  return channels.filter((c) => PUBLIC_CHANNELS.has(c));
}

/** Customer-facing channels the authored touch plan actually uses.
    Canonical `journey.channels` is intentionally broader in parts of the
    corpus (legacy availability / potential surfaces). The public library,
    however, must describe the journey that is actually drawn and sent.
    Prefer the channels reached through orchestration.touch.channelRoles;
    fall back to the declared roster only for legacy journeys with no touch
    plan. */
export function actualPublicChannels(j: CanonicalJourney): readonly ChannelId[] {
  const byRole = new Map((j.channelStrategy?.roles ?? []).map((r) => [r.role, r.channels] as const));
  const used = new Set<ChannelId>();
  for (const touch of j.orchestration?.touches ?? []) {
    for (const role of touch.channelRoles ?? []) {
      for (const channel of byRole.get(role) ?? []) {
        if (PUBLIC_CHANNELS.has(channel)) used.add(channel);
      }
    }
  }
  if (!used.size) return publicChannels(j.channels);

  // Preserve the journey's authored channel order where possible; append any
  // role-resolved channel omitted from the legacy roster defensively.
  const ordered = publicChannels(j.channels).filter((c) => used.has(c));
  for (const channel of used) if (!ordered.includes(channel)) ordered.push(channel);
  return ordered;
}

const edge = (
  to: string,
  label: string | null = null,
  detail: string | null = null,
): FlowEdge => {
  if (to.startsWith("external:")) {
    return { label, detail, to, href: null, kind: "external", back: false };
  }
  const target = byId(to);
  if (target && target.id === to) {
    // An archived target keeps its kind - it IS a journey, and the node
    // panel still names it - but carries no href, so it renders as text
    // rather than as a link to a route that no longer exists.
    return { label, detail, to, href: isPublicJourneyId(to) ? target.slug : null, kind: "journey", back: false };
  }
  return { label, detail, to, href: null, kind: "node", back: false };
};

const nodeView = (n: CanonicalNode, entry: string): FlowNode => {
  const base = { id: n.id, kind: n.kind, isEntry: n.id === entry, eventId: null, terminal: false } as const;

  switch (n.kind) {
    case "trigger":
      return {
        ...base,
        headline: humanEvent(n.event),
        eventId: n.event,
        detail: n.detail ?? null,
        meta: [
          `evidence: ${n.evidence.source}`,
          ...n.evidence.requires.map((r) => `requires: ${r}`),
          ...(n.evidence.insufficientAlone ?? []).map((r) => `not enough on its own: ${r}`),
        ],
        edges: [edge(n.next)],
        evidenceSource: n.evidence.source,
      };
    case "action":
      return {
        ...base,
        headline: n.does,
        detail: null,
        meta: (n.writes ?? []).map((w) => `writes ${w.field} (${w.mode})`),
        ...(n.writes?.length ? { writesFields: n.writes.map((w) => w.field) } : {}),
        edges: [edge(n.next)],
        ...(n.execution ? { execution: n.execution } : {}),
      };
    case "condition":
      return {
        ...base,
        headline: n.asks,
        detail: null,
        meta: [],
        edges: n.branches.map((b) => edge(b.to, b.label, b.when)),
        branchCount: n.branches.length,
        asks: n.asks,
      };
    case "wait": {
      // A wait whose event arm and timeout arm land on the SAME next node
      // recheck the same thing either way - the "on event"/"on timeout"
      // distinction is real in the data but tells a canvas reader nothing
      // ("both paths lead to the same next check"), so the edges carry no
      // label in that case. Still two edges - the connector routing an
      // edge label sits on is unchanged - just unlabeled, generic to any
      // journey with this shape, not specific to one.
      const sameArm = n.onEvent === n.onTimeout;
      return {
        ...base,
        headline: `until ${n.until.map(eventText).join(", or ")}`,
        detail: `timeout after ${configText(n.timeout.after)}`,
        meta: [
          n.timeout.reason,
          n.windowExtendsOnEngagement
            ? "the window extends on engagement"
            : "engagement does not extend the window",
        ],
        edges: sameArm
          ? [edge(n.onEvent), edge(n.onTimeout)]
          : [edge(n.onEvent, "on event"), edge(n.onTimeout, "on timeout")],
      };
    }
    case "outcome":
      return {
        ...base,
        headline: n.state,
        detail: n.means,
        meta: [],
        edges: [edge(n.next)],
      };
    case "exit":
      return {
        ...base,
        headline: capitalize(splitExitState(n.state)),
        detail: n.reEntry,
        meta: [],
        edges: [],
        terminal: n.terminal,
        exitClass: n.class,
      };
    case "handoff":
      return {
        ...base,
        /* The target's PLAIN-LANGUAGE name, the same one the library cards,
           the lists and every cross-journey link already use - not its
           state-machine `name` ("Payment failure → classify → recover,
           alternate or exit"), which is a three-clause sentence on a card
           whose whole job is to say where this hands off to. The long form
           is still one click away in the detail panel, and an external
           handoff (no journey to look up) keeps its own `external:` id. */
        headline: n.to.startsWith("external:") ? externalTargetName(n.to) : (byId(n.to)?.shortName ?? byId(n.to)?.name ?? n.to),
        detail: n.on,
        meta: [
          ...n.carries.map((c) => `carries: ${c}`),
          ...(n.suppresses ?? []).map((s) => `suppresses: ${s}`),
        ],
        edges: [edge(n.to)],
        external: n.to.startsWith("external:"),
      };
  }
};

export type JourneyDetail = {
  id: string;
  slug: string;
  name: string;
  /** See CanonicalJourney.shortName. The detail page leads with this and
      keeps `name` beneath it, so the state-machine form is still stated. */
  shortName?: string;
  purpose: string;
  categoryTitle: string;
  /** The audited discovery goal. The detail page states it under the purpose
      as the journey's own one-line answer to "what is this for"; the library
      list filters on the same field. */
  goal: GoalId;
  /** The journey's declared execution channels, so the canvas can name what
      a communication action may actually run on. */
  channels: readonly ChannelId[];
  entityScope: string;
  entityNote: string;
  reusableRule: string;
  guardrails: readonly string[];
  distinctFrom: readonly { journey: string; slug: string | null; name: string | null; because: string }[];
  competition: CanonicalJourney["competition"] | null;
  /** Only ever set on the two journeys that carry it. A journey with no
      pre-emption ships no empty array to the browser. */
  preemptedBy: readonly { event: string; then: string }[];
  nodes: readonly FlowNode[];
  surface: SurfaceName;
  communicating: boolean;
  /** Set when the URL belongs to one of the journey's presets. */
  preset: PresetRow | null;
  presets: readonly { id: string; name: string }[];
};

/** Breadth-first from the entry, so the order on screen follows the order the
    journey actually runs in rather than the order the file happens to list. */
function orderedNodes(j: CanonicalJourney): CanonicalNode[] {
  const byNodeId = new Map(j.nodes.map((n) => [n.id, n]));
  const seen = new Set<string>();
  const out: CanonicalNode[] = [];
  const queue = [j.entry];
  while (queue.length) {
    const id = queue.shift()!;
    if (seen.has(id)) continue;
    seen.add(id);
    const n = byNodeId.get(id);
    if (!n) continue;
    out.push(n);
    for (const e of nodeView(n, j.entry).edges) if (e.kind === "node") queue.push(e.to);
  }
  // Anything the walk did not reach still renders - the validator forbids it,
  // and a silent omission here would hide the thing it forbids.
  for (const n of j.nodes) if (!seen.has(n.id)) out.push(n);
  return out;
}

/* Message channels only (excludes `sales`/`task`, the human routes) - a
   closed, small set worth naming explicitly here rather than importing
   journey-channels.ts's private split: "sales" and "task" are ordinary
   English words an unrelated action's prose could easily contain ("queue
   the task", "assign to sales"), where a channel name like "WhatsApp" or
   "push token" essentially cannot occur by accident. Scanning is
   deliberately restricted to the channels where a false hit is implausible. */
const SCANNED_CHANNELS: readonly ChannelId[] = (Object.keys(CHANNEL_LABEL) as ChannelId[]).filter(
  (id) => id !== "sales" && id !== "task",
);

/** Channel ids literally named in `text` (the action's own canonical `does`
    prose), in the order they first appear. Word-boundary, case-insensitive,
    against each channel's own EN display label - the canonical text is
    always English regardless of the reading locale, so this runs once
    against the source rather than per-language. See `FlowNode.channelPriority`. */
function channelsMentionedIn(text: string): ChannelId[] {
  const hits: { id: ChannelId; at: number }[] = [];
  for (const id of SCANNED_CHANNELS) {
    const label = CHANNEL_LABEL[id].en.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const m = new RegExp(`\\b${label}\\b`, "i").exec(text);
    if (m) hits.push({ id, at: m.index });
  }
  return hits.sort((a, b) => a.at - b.at).map((h) => h.id);
}

/** One journey's action nodes, keyed to the channels their own prose names
    (two or more distinct hits) - the channel-selecting action itself - or,
    failing that, inherited from the channel-selecting action that leads
    directly into them. Covers the corpus's own idiom: one internal action
    picks a channel and writes it to state, the action right after it sends
    "on the channel just selected" without naming one itself. A node absent
    from the returned map had no channel mention to find, self or inherited -
    the card falls back to the journey's full channel roster, unchanged from
    before this existed. */
function actionChannelHints(j: CanonicalJourney): ReadonlyMap<string, readonly ChannelId[]> {
  const hints = new Map<string, readonly ChannelId[]>();
  for (const n of j.nodes) {
    if (n.kind !== "action") continue;
    const found = channelsMentionedIn(n.does);
    if (found.length >= 2) hints.set(n.id, found);
  }
  const nodeById = new Map(j.nodes.map((n) => [n.id, n]));
  for (const n of j.nodes) {
    if (n.kind !== "action" || !hints.has(n.id)) continue;
    const next = nodeById.get(n.next);
    if (next?.kind === "action" && next.execution && !hints.has(next.id)) {
      hints.set(next.id, hints.get(n.id)!);
    }
  }
  return hints;
}

/** Action node id -> its own touch's `stage` (see `FlowNode.touchStage`).
    Absent on a journey with no orchestration touch plan (every non-vNext
    journey, and any vNext one whose actions the plan doesn't reference). */
function touchStages(j: CanonicalJourney): ReadonlyMap<string, string> {
  const stages = new Map<string, string>();
  for (const t of j.orchestration?.touches ?? []) stages.set(t.action, t.stage);
  return stages;
}

/** Action node id -> the channels this touch actually reaches for, in the
    order it reaches for them (see `FlowNode.channelPlan`). Joined from two
    authored vNext fields and nothing else: the touch's own ordered
    `channelRoles` ("low-friction" then "persistent") and the journey's
    `channelStrategy.roles`, which is where a role's channels are declared
    (low-friction: push, in-app). That join is what a per-touch priority
    IS in this schema - a communication action deliberately does not name
    its channel (the send path picks one at runtime from the permitted
    set), so the roles are the only place the ORDER is stated. Absent
    where either half is missing, and the card falls back to the journey's
    whole roster exactly as before. */
function touchChannelPlans(j: CanonicalJourney): ReadonlyMap<string, readonly { role: string; channels: readonly ChannelId[] }[]> {
  const byRole = new Map((j.channelStrategy?.roles ?? []).map((r) => [r.role, r.channels]));
  const plans = new Map<string, readonly { role: string; channels: readonly ChannelId[] }[]>();
  for (const t of j.orchestration?.touches ?? []) {
    const plan = (t.channelRoles ?? [])
      .map((role) => ({ role, channels: byRole.get(role) ?? [] }))
      .filter((r) => r.channels.length > 0);
    if (plan.length) plans.set(t.action, plan);
  }
  return plans;
}

/** The FlowNode projection of one journey - the exact input both the detail
    page's Canvas and the library card's topology thumbnail lay out, so the
    two can never drift into being different graphs. */
function flowNodesOf(j: CanonicalJourney): FlowNode[] {
  const reviewed = publicJourneyFlowNodes(j.id, "en");
  if (reviewed) return [...reviewed];

  const nodes = orderedNodes(j).map((n) => nodeView(n, j.entry));
  // Reading order is settled now, so an edge can finally say whether its
  // target is above it. Done here rather than in nodeView because a node on
  // its own has no idea where it sits.
  const position = new Map(nodes.map((n, i) => [n.id, i]));
  const channelHints = actionChannelHints(j);
  const stages = touchStages(j);
  const plans = touchChannelPlans(j);
  return nodes.map((n, i) => ({
    ...n,
    edges: n.edges.map((e) =>
      e.kind === "node" && (position.get(e.to) ?? i) < i ? { ...e, back: true } : e,
    ),
    ...(n.kind === "action" && channelHints.has(n.id) ? { channelPriority: channelHints.get(n.id) } : {}),
    ...(n.kind === "action" && stages.has(n.id) ? { touchStage: stages.get(n.id) } : {}),
    ...(n.kind === "action" && plans.has(n.id) ? { channelPlan: plans.get(n.id) } : {}),
    ...(n.kind === "action" && plans.has(n.id) && j.channelStrategy?.fallback
      ? { channelStrategyFallback: j.channelStrategy.fallback }
      : {}),
    ...(n.kind === "action" && plans.has(n.id) && j.channelStrategy?.simultaneous?.allowed
      ? { channelStrategySimultaneous: true }
      : {}),
  }));
}

/* Declared here rather than beside the JourneyRow type because building each
   row's topology thumbnail needs `flowNodesOf` above - and `nodeView`, which
   it calls, is a const rather than a hoisted declaration, so evaluating this
   any earlier in the module would hit its temporal dead zone.

   Awaited at module load: the layout engine behind each thumbnail (ELK, see
   journey-canvas-layout.ts) is asynchronous, and the rows are consumed
   synchronously everywhere else - so the module's own evaluation waits for
   every public journey's layout once, and nothing downstream changes. */
export const JOURNEY_ROWS: readonly JourneyRow[] = await Promise.all(PUBLIC_JOURNEYS.map(async (j) => ({
  id: j.id,
  ...(() => { const sf = surfaceOf(j); return { surface: sf.surface as SurfaceName, communicating: sf.sends, routesToHuman: sf.routesToHuman }; })(),
  aliases: j.discovery?.aliases ?? [],
  presetCount: j.discovery?.presets?.length ?? 0,
  slug: j.slug,
  name: publicJourneyCopy(j.id, "en")?.name ?? j.name,
  ...((publicJourneyCopy(j.id, "en")?.shortName ?? j.shortName) ? { shortName: publicJourneyCopy(j.id, "en")?.shortName ?? j.shortName } : {}),
  purpose: publicJourneyCopy(j.id, "en")?.purpose ?? j.purpose,
  category: j.category,
  categoryTitle: CATEGORY_TITLE.get(j.category) ?? j.category,
  nodeCount: flowNodesOf(j).length,
  goal: j.goal,
  channels: publicJourneyFlowChannels(j.id) ?? actualPublicChannels(j),
  preview: buildJourneyPreview(await layoutJourneyCanvas(flowNodesOf(j))),
})));

/* The website exposes one Journey Library surface. Silent lifecycle states,
   runtime mechanisms and operational workflows remain canonical dependencies
   but are deliberately absent from the public corpus. */
export type SurfaceKey = "customer-journeys";

export const SURFACE_KEYS: readonly SurfaceKey[] = ["customer-journeys"];

export const SURFACE_PATH: Readonly<Record<SurfaceKey, string>> = {
  "customer-journeys": "/lab/customer-journeys",
};

export const surfaceKeyOf = (row: Pick<JourneyRow, "id" | "surface" | "communicating" | "routesToHuman">): SurfaceKey => {
  if (row.surface === "customer" && (row.communicating || row.routesToHuman)) return "customer-journeys";
  throw new Error(`${row.id} is not part of the public Customer Journey library - see src/lib/public-corpus.ts`);
};

/** Within Customer Journeys only: the practitioner-facing distinction
    between a journey that reaches a customer by message and the 3 that
    reach one only by putting a person on it (see surfaceKeyOf above).
    Not a canonical concept and not a new filter - it is what the card's
    own channel badges (Sales/Task vs Email/SMS/...) already say, named for
    when a caller needs the boolean rather than the channel list. */
export const isHumanRoutingRow = (row: Pick<JourneyRow, "communicating" | "routesToHuman">): boolean =>
  !row.communicating && row.routesToHuman;

export const SURFACE_ROWS: Readonly<Record<SurfaceKey, readonly JourneyRow[]>> = {
  "customer-journeys": JOURNEY_ROWS.filter((j) => surfaceKeyOf(j) === "customer-journeys"),
};

/** The library's rows - the Customer Journeys surface, by the same rule
    `LIBRARY_COUNT` is derived from. The two derivations (surfaceOf-based in
    public-corpus.ts, row-based here) must agree, and this is where a drift
    would fail the build rather than ship two different numbers. */
export const LIBRARY_ROWS: readonly JourneyRow[] = SURFACE_ROWS["customer-journeys"];
if (LIBRARY_ROWS.length !== LIBRARY_COUNT) {
  throw new Error(`library count drift: surfaceOf says ${LIBRARY_COUNT} library journeys, surfaceKeyOf lists ${LIBRARY_ROWS.length}`);
}

/** A preset is a named specialisation of a communicating customer journey
    whose only differences are config values, a destination and vocabulary.
    It renders as its own card and its own URL - it is never a journey. */
export type PresetRow = {
  id: string;
  slug: string;
  name: string;
  parentId: string;
  parentSlug: string;
  parentName: string;
  categoryTitle: string;
  applicableWhen: string;
  aliases: readonly string[];
  overrideKeys: readonly string[];
  destination: string | null;
  preset: Preset;
};

export const PRESET_ROWS: readonly PresetRow[] = PUBLIC_JOURNEYS.flatMap((j) =>
  (j.discovery?.presets ?? []).map((p) => ({
    id: p.id,
    slug: p.id,
    name: p.name,
    parentId: j.id,
    parentSlug: j.slug,
    parentName: j.shortName ?? j.name,
    categoryTitle: CATEGORY_TITLE.get(j.category) ?? j.category,
    applicableWhen: p.applicableWhen.text,
    aliases: p.aliases ?? [],
    overrideKeys: Object.keys(p.overrides ?? {}),
    destination: p.destination ?? null,
    preset: p,
  })),
);
const PRESET_BY_SLUG = new Map(PRESET_ROWS.map((p) => [p.slug, p]));
for (const p of PRESET_ROWS) if (BY_SLUG.has(p.slug) || MERGED_BY_SLUG.has(p.slug)) throw new Error(`preset slug collides with a journey slug: ${p.slug}`);

function detailOf(j: CanonicalJourney, preset: PresetRow | null = null): JourneyDetail {
  const withDirection = flowNodesOf(j);
  const sf = surfaceOf(j);
  const publicCopy = publicJourneyCopy(j.id, "en");

  return {
    id: j.id,
    slug: j.slug,
    name: publicCopy?.name ?? j.name,
    ...((publicCopy?.shortName ?? j.shortName) ? { shortName: publicCopy?.shortName ?? j.shortName } : {}),
    purpose: publicCopy?.purpose ?? j.purpose,
    categoryTitle: CATEGORY_TITLE.get(j.category) ?? j.category,
    goal: j.goal,
    channels: publicJourneyFlowChannels(j.id) ?? actualPublicChannels(j),
    entityScope: publicCopy?.entityScope ?? j.entity.scope,
    entityNote: publicCopy?.entityNote ?? j.entity.note,
    reusableRule: publicCopy?.reusableRule ?? j.reusableRule,
    guardrails: publicCopy?.guardrails ?? j.guardrails,
    distinctFrom: (j.distinctFrom ?? []).map((d) => {
      const target = byId(d.journey);
      return {
        journey: d.journey,
        // Name always (it is a real, stated distinction); a link only when
        // the other journey is itself public.
        slug: target && isPublicJourneyId(target.id) ? target.slug : null,
        name: target?.name ?? null,
        because: d.because,
      };
    }),
    competition: j.competition ?? null,
    preemptedBy: j.preemptedBy ?? [],
    nodes: withDirection,
    surface: sf.surface as SurfaceName,
    communicating: sf.sends,
    preset,
    presets: (j.discovery?.presets ?? []).map((p) => ({ id: p.id, name: p.name })),
  };
}

export function journeyDetail(id: string): JourneyDetail | null {
  const j = byId(resolveJourneyId(id));
  return j ? detailOf(j) : null;
}

/** What the detail route resolves a URL segment to. A merged id resolves to
    the journey that absorbed it and says so; anything unknown resolves to
    nothing and the route 404s. */
export type ResolvedDetail = { detail: JourneyDetail; merged: MergedRedirect | null; preset: PresetRow | null };

export function resolveDetailSlug(slug: string): ResolvedDetail | null {
  const j = BY_SLUG.get(slug);
  if (j) return { detail: detailOf(j), merged: null, preset: null };

  const preset = PRESET_BY_SLUG.get(slug);
  if (preset) {
    const parent = byId(preset.parentId);
    if (parent) return { detail: detailOf(parent, preset), merged: null, preset };
  }

  const merged = MERGED_BY_SLUG.get(slug);
  if (merged) {
    const target = byId(merged.to);
    if (target) return { detail: detailOf(target), merged, preset: null };
  }
  return null;
}
