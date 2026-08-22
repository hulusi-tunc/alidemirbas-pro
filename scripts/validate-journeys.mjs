/* Archive integrity check.  `npm run validate:journeys`

   The journey data is two big literals in TypeScript files, so nothing type-
   checks the parts that matter most: that a handoff points at a journey that
   exists, that a step does not send on a channel the journey never declared,
   that EN and TR did not drift apart. This script does. It is the thing that
   would have caught the bugs already found by hand - a step whose body was a
   bare timestamp, an English array missing the wait steps Turkish had, a
   transactional confirmation sitting inside a marketing flow.

   Errors block; warnings are things worth looking at that may be deliberate.
   Note the deliberate asymmetry on channels: a channel declared on the journey
   but absent from the example sequence is fine and is only counted, because
   the badge means "can run here", not "does run here". A channel used in a
   step but NOT declared is an error. */

import { readFile } from "node:fs/promises";

const FLOWS = "src/lib/flows.ts";
const JOURNEYS = "src/lib/journeys.ts";
const FLOWS_MARKER = "export const flows: Record<string, { en: FlowStep[]; tr: FlowStep[] }> = ";
const JOURNEYS_MARKER = "export const journeys: Journey[] = ";

const CHANNELS = ["email", "push", "sms", "inapp", "whatsapp", "sales"];
const PRIORITIES = [
  "transactional", "risk-service", "checkout-abandonment", "cart-intent", "triggered-info",
  "activation", "retention", "winback", "expansion", "browse-discovery", "promotional",
];
const FAMILIES = [
  "commerce-intent", "post-purchase", "lifecycle-start", "revenue-growth",
  "retention-risk", "win-back", "engagement",
];
const EXCLUSION_GROUPS = [
  "purchase-intent-ladder", "retention-ladder", "conversion-window",
  "post-purchase-followup", "soft-engagement", "support-resolution",
];
const EXCLUSION_SCOPES = ["user", "product", "cart", "order", "route", "subscription", "course", "account", "topic"];
const COMM_CLASSES = ["marketing", "operational"];
const FREQ_CLASSES = ["high-intent-triggered", "lifecycle-activation", "standard-promotional", "support-follow-up", "service-critical"];
const GLOBAL_HARD_EXITS = ["marketing_consent_revoked", "account_closed", "user_ineligible"];
const ACTION_TYPES = ["email", "push", "sms", "inapp", "sales"];
const STEP_TYPES = ["entry", "exit", "wait", "condition", ...ACTION_TYPES];
// Loose signal, not a parser: a journey whose own entry text promises a
// split should actually branch. Matches the phrasing the archive itself
// uses when it means it ("branches based on...", "splits based on...").
const BRANCH_CLAIM_RE = /\bbranch(es|ing)?\b|\bsplit(s)?\b|different path|dallan/i;
// Copy that reads as a specific, potentially sensitive health detail rather
// than a generic milestone - a loose heuristic to catch an unflagged
// journey drifting toward this, not a compliance check. Deliberately not
// "condition" or "therapy" alone - both are common non-health CRM words
// ("conditional offer", "in-app...") and would just be noise here.
const HEALTH_SENSITIVE_RE = /\bdiagnos(is|ed|es|ing)\b|medical condition|therapy session|medication|depression|anxiety disorder|\billness\b|patient\b/i;
/* Copy in this archive often states a rule by naming what it does NOT do
   ("no satisfaction question", "not by an email open", "with no number or
   program name"). Every content heuristic below reads the text with negated
   clauses removed, or the sentence describing the rule trips the check meant
   to enforce it. */
const stripNegated = (text) => text.replace(/\b(?:no|without|never|not|zero)\b[^.]*/gi, " ");

/** The data is a single JSON literal after a fixed marker. Fail loudly rather
    than silently validating nothing if that ever stops being true. */
async function readLiteral(file, marker) {
  const src = await readFile(file, "utf8");
  const at = src.indexOf(marker);
  if (at === -1) throw new Error(`${file}: marker not found - "${marker.slice(0, 40)}..."`);
  const body = src.slice(at + marker.length).trimEnd().replace(/;$/, "");
  return JSON.parse(body);
}

const findings = [];
const err = (code, journey, detail) => findings.push({ level: "error", code, journey, detail });
const warn = (code, journey, detail) => findings.push({ level: "warning", code, journey, detail });

const flows = await readLiteral(FLOWS, FLOWS_MARKER);
const journeys = await readLiteral(JOURNEYS, JOURNEYS_MARKER);
const bySlug = new Map(journeys.map((j) => [j.slug, j]));

/* ------------------------------------------- archive-wide / cross-file checks */

/* The archive size used to be typed into copy strings by hand and drifted -
   they said 72 after the archive had grown past it. They now carry a {count}
   token filled from the data at render (src/lib/archive.ts). This catches
   anyone re-hardcoding it. */
{
  const content = await readFile("src/lib/content.ts", "utf8");
  const NUMBERED_COPY = /\b(\d{2,})\s+(?:lifecycle journey|teardown|inceleme)/gi;
  for (const m of content.matchAll(NUMBERED_COPY)) {
    const stated = Number(m[1]);
    if (stated !== journeys.length) {
      err("archive_count_mismatch", "content.ts", `copy says "${m[0]}" but the archive holds ${journeys.length} journeys - use the {count} token instead of a literal`);
    } else {
      warn("archive_count_hardcoded", "content.ts", `"${m[0]}" is a literal count; it happens to be right today but will drift - use the {count} token`);
    }
  }
}

/* Scoped exclusion is only real if the engine resolves the scope into the key
   it compares. If any journey declares a non-user scope while resolveJourney
   still compares bare group names, the metadata is decoration and every
   product-scoped journey silently suppresses the others. */
{
  const scoped = journeys.filter((j) => j.exclusionScope && j.exclusionScope !== "user");
  if (scoped.length > 0) {
    const orch = await readFile("src/lib/orchestration.ts", "utf8");
    const hasKeyFn = /export function exclusionKey\s*\(/.test(orch);
    const conflictsUsesKey = /export function conflicts[\s\S]{0,400}exclusionKey\(/.test(orch);
    const resolveUsesConflicts = /export function resolveJourney[\s\S]{0,1600}conflicts\(/.test(orch);
    if (!hasKeyFn || !conflictsUsesKey || !resolveUsesConflicts) {
      err(
        "exclusion_scope_ignored_by_runtime",
        "orchestration.ts",
        `${scoped.length} journeys declare a non-user exclusionScope but the engine does not resolve it ` +
          `(exclusionKey:${hasKeyFn} conflicts-uses-key:${conflictsUsesKey} resolveJourney-uses-conflicts:${resolveUsesConflicts})`,
      );
    }
  }
}

/* An exclusion group must not mix person-wide and entity-scoped members. A
   user-scoped journey resolves to `group:user` while an entity-scoped one with
   a real id resolves to `group:<id>`, so the two could never suppress each
   other - and the person-wide one is exactly the journey that should be able
   to. Harmless while no entity ids exist (everything falls back to
   `group:user`), a silent hole the moment they are wired in. */
{
  const byGroup = new Map();
  for (const j of journeys) {
    if (!j.exclusionGroup) continue;
    if (!byGroup.has(j.exclusionGroup)) byGroup.set(j.exclusionGroup, new Set());
    byGroup.get(j.exclusionGroup).add(j.exclusionScope ?? "user");
  }
  for (const [group, scopes] of byGroup) {
    if (scopes.has("user") && scopes.size > 1) {
      warn("exclusion_group_mixes_scopes", group, `mixes person-wide and entity-scoped members (${[...scopes].join(", ")}) - they can never suppress each other once entity ids are supplied`);
    }
  }
}

/* Same idea for the per-step communication class: the export renders a
   [marketing]/[operational] tag from the data, so the tag can only ever be as
   real as the engine's use of it. */
{
  const anyOverride = Object.values(flows).some((f) => f.en.some((s) => s.commClass));
  if (anyOverride) {
    const orch = await readFile("src/lib/orchestration.ts", "utf8");
    const hasResolver = /export function effectiveCommunicationClass\s*\(/.test(orch);
    const canSendUses = /export function canSend[\s\S]{0,700}effectiveCommunicationClass\(/.test(orch);
    if (!hasResolver || !canSendUses) {
      err(
        "step_comm_class_ignored_by_runtime",
        "orchestration.ts",
        `steps declare commClass overrides but the send path does not resolve them ` +
          `(effectiveCommunicationClass:${hasResolver} canSend-uses-it:${canSendUses})`,
      );
    }
  }
}

/* -------------------------------------------------------------- identity */

const seenSlug = new Set();
const seenIdx = new Set();
for (const j of journeys) {
  if (seenSlug.has(j.slug)) err("duplicate_slug", j.slug, `slug used more than once`);
  if (seenIdx.has(j.idx)) err("duplicate_idx", j.slug, `index ${j.idx} used more than once`);
  seenSlug.add(j.slug);
  seenIdx.add(j.idx);
}
for (const slug of Object.keys(flows)) {
  if (!bySlug.has(slug)) err("orphan_flow", slug, "flow has no entry in journeys.ts");
}
for (const j of journeys) {
  if (!flows[j.slug]) err("missing_flow", j.slug, "journey has no flow in flows.ts");
}

/* --------------------------------------------------------- orchestration */

let unusedDeclaredChannels = 0;
for (const j of journeys) {
  if (!PRIORITIES.includes(j.priority)) err("invalid_priority", j.slug, `${j.priority}`);
  if (!FAMILIES.includes(j.family)) err("invalid_family", j.slug, `${j.family}`);
  if (j.exclusionGroup !== null && !EXCLUSION_GROUPS.includes(j.exclusionGroup)) {
    err("invalid_exclusion_group", j.slug, `${j.exclusionGroup}`);
  }
  if (!COMM_CLASSES.includes(j.communicationClass)) err("invalid_comm_class", j.slug, `${j.communicationClass}`);
  if (!FREQ_CLASSES.includes(j.frequencyClass)) err("invalid_freq_class", j.slug, `${j.frequencyClass}`);
  if (j.exclusionScope != null) {
    if (!EXCLUSION_SCOPES.includes(j.exclusionScope)) err("invalid_exclusion_scope", j.slug, `${j.exclusionScope}`);
    if (!j.exclusionGroup) err("exclusion_scope_without_group", j.slug, `scope "${j.exclusionScope}" set but exclusionGroup is null - scope only means something inside a group`);
  }

  for (const c of j.channels) {
    if (!CHANNELS.includes(c)) err("unknown_channel", j.slug, `declares "${c}"`);
  }

  /* A P5 activation-tier journey that is really product setup - onboarding,
     account activation, feature adoption - is not on a promotional cadence.
     Trial conversion and lead nurture legitimately are: they sell. */
  const SETUP_TYPES = ["Welcome Onboarding", "Account Onboarding", "Activation", "Account Activation", "Feature Adoption", "Progressive Profiling", "Channel Opt In"];
  if (j.priority === "activation" && SETUP_TYPES.includes(j.journey?.en) && j.frequencyClass === "standard-promotional") {
    warn("activation_on_promotional_cadence", j.slug, `${j.journey.en} at P5 uses standard-promotional - confirm it really carries a sales ask rather than being setup`);
  }

  /* An NPS/feedback journey's job is measuring an experience and routing the
     response. Classing the whole thing P10 because its promoter arm asks for
     a referral lets a cross-sell outrank the mechanism that finds an at-risk
     customer. */
  if (j.journey?.en === "Feedback Nps" && j.priority === "promotional") {
    const entry = flows[j.slug]?.en?.[0];
    const triggeredBySurvey = /survey response|nps|satisfaction score/i.test(`${entry?.a ?? ""}`);
    if (triggeredBySurvey) {
      warn("feedback_journey_as_promotional", j.slug, "triggers on a survey response (measurement + routing) but is classified P10 promotional - priority should follow the trigger, with the referral arm carrying a step-level class instead");
    }
  }

  const endsOnlyViaHandoff = (!j.exitEvents || j.exitEvents.length === 0) && Object.keys(j.handoffEvents ?? {}).length > 0;
  if (!Array.isArray(j.exitEvents) || j.exitEvents.length === 0) {
    warn(
      "no_exit_events",
      j.slug,
      endsOnlyViaHandoff
        ? "has no standalone exitEvents - it only ends by handing off to another journey; confirm that's intentional"
        : "declares no exit event and no handoff - nothing ends this journey but the global hard exits",
    );
  }
  for (const e of j.exitEvents ?? []) {
    if (!/^[a-z][a-z0-9_]*$/.test(e)) err("malformed_event", j.slug, `exit event "${e}" is not snake_case`);
    if (GLOBAL_HARD_EXITS.includes(e)) {
      err("global_exit_repeated", j.slug, `"${e}" is a global hard exit and must not be declared per journey`);
    }
  }
  for (const [event, target] of Object.entries(j.handoffEvents ?? {})) {
    if (!/^[a-z][a-z0-9_]*$/.test(event)) err("malformed_event", j.slug, `handoff event "${event}" is not snake_case`);
    if (!bySlug.has(target)) err("handoff_target_missing", j.slug, `${event} -> "${target}" does not exist`);
    if (target === j.slug) err("handoff_self", j.slug, `${event} points at its own journey`);
    // A handoff already implies an exit (see orchestration.ts `exitsOn`) - an
    // event listed in both places is two sources of truth for one fact, and
    // the two can drift (this caught 30 real instances across 24 journeys).
    if ((j.exitEvents ?? []).includes(event)) {
      err("exit_handoff_duplicate", j.slug, `"${event}" is declared as both an exitEvent and a handoffEvent - remove it from exitEvents`);
    }
  }
}

/* ----------------------------------------------------------------- steps */

/** "Wait 3 days" / "3 gün bekle" -> hours. Returns null for anything anchored
    to a date rather than a duration ("Wait until 7 days before departure"). */
function waitHours(text) {
  if (/until|kadar/i.test(text)) return null;
  const m = text.match(/(-?\d+(?:\.\d+)?)\s*(minute|min|hour|saat|day|gün|dakika|week|hafta)/i);
  if (!m) return null;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  if (/min|dakika/.test(unit)) return n / 60;
  if (/hour|saat/.test(unit)) return n;
  if (/day|gün/.test(unit)) return n * 24;
  return n * 168;
}

for (const j of journeys) {
  const flow = flows[j.slug];
  if (!flow) continue;
  const { en, tr } = flow;

  if (en.length !== tr.length) {
    err("en_tr_length_mismatch", j.slug, `EN has ${en.length} steps, TR has ${tr.length}`);
  } else {
    for (let i = 0; i < en.length; i++) {
      if (en[i].t !== tr[i].t) err("en_tr_type_mismatch", j.slug, `step ${i}: EN "${en[i].t}" vs TR "${tr[i].t}"`);
    }
  }

  if (en[0]?.t !== "entry") err("no_entry_step", j.slug, "first step is not an entry");
  if (en.slice(1).some((s) => s.t === "entry")) err("entry_not_first", j.slug, "more than one entry step");
  if (en.at(-1)?.t !== "exit") {
    warn("no_exit_node", j.slug, "journey does not end in an explicit exit node");
  }

  // Branch claim vs. reality - this caught the exact bug fixed this pass:
  // four journeys' entry text promised a split by activation depth while
  // the sequence was fully linear.
  /* An observation buffer is a real span of silence, not a label. A condition
     that says the journey is now "observing" must have an actual wait in
     front of it, or the engine transitions through the buffer in zero time
     and the retention ladder collapses into an instant winback. */
  const OBS_RE = /observation|gözlem|buffer|tampon/i;
  en.forEach((s, i) => {
    if (s.t !== "condition" || !OBS_RE.test(s.a)) return;
    const precededByWait = en.slice(0, i).reverse().find((p) => p.t === "wait" || p.t === "entry");
    if (!precededByWait || precededByWait.t !== "wait" || !OBS_RE.test(precededByWait.a)) {
      err("observation_buffer_without_wait", j.slug, `step ${i} declares an observation state ("${s.a}") with no observation wait in front of it`);
    }
  });

  /* A push or SMS renders on a locked screen that anyone holding the phone can
     read. A journey flagged as touching sensitive personal data must keep the
     concrete detail off those surfaces and behind authentication. */
  if (j.requiresSensitiveDataPolicy) {
    const CONCRETE_RE = /\bkg\b|\bkilogram|\bweight\b|\bkilometers?\b|-day streak|\bstreak\b|\bdiagnos|\bblood\b|\bBMI\b/i;
    en.forEach((s, i) => {
      if (s.t !== "push" && s.t !== "sms") return;
      if (CONCRETE_RE.test(stripNegated(`${s.title ?? ""} ${s.b}`))) {
        err("sensitive_detail_on_public_surface", j.slug, `step ${i} (${s.t}) puts a concrete personal-health detail on a lock-screen-visible surface - keep it generic and move the specifics behind authentication`);
      }
    });
  }

  /* EVENT-OR-TIMEOUT. A wait that is really waiting for something that may
     never happen must name the timeout too. "Wait until 7 days before
     departure" is fine - departure is a date. "Wait until the demo is
     scheduled" is not: nothing says when we give up. The archive's convention
     for the real thing is "Wait N days, or until X - whichever comes first". */
  const EVENTISH = /\b(scheduled|assigned|closed|resolved|reorder|repurchas|purchas|booked|confirmed|submitted|answered|given|engag|activat|converted|opened|replied)/i;
  en.forEach((s, i) => {
    if (s.t !== "wait") return;
    if (!/\buntil\b/i.test(s.a)) return;
    if (/\bor until\b/i.test(s.a)) return;           // explicitly two-armed
    if (!EVENTISH.test(s.a)) return;                  // date-anchored, not event-anchored
    // "until the scheduled demo time" / "until the resolution deadline" name a
    // timestamp that exists once the branch is entered - a deadline, not a
    // wait on something that may never happen.
    if (/\b(time|date|deadline|departure|launch)\b/i.test(s.a)) return;
    err("event_wait_without_timeout", j.slug, `step ${i} waits on an event with no timeout arm ("${s.a}") - use "Wait N …, or until X - whichever comes first"`);
  });

  /* RESOLUTION BEFORE SURVEY. Asking how it went while the case is still open
     measures our own latency and reads as indifference. */
  const ASKS_SATISFACTION = /\bcsat\b|satisfaction|\brating\b|how (it |the )?(went|was)|score of|1-5|1 to 5/i;
  const MEANS_RESOLVED = /resolv|closed|completed|complete\b|çözül|kapan|tamamlan/i;
  en.forEach((s, i) => {
    if (!ACTION_TYPES.includes(s.t)) return;
    if (!ASKS_SATISFACTION.test(stripNegated(`${s.title ?? ""} ${s.b}`))) return;
    const earlier = en.slice(0, i);
    const gated = earlier.some((p) => (p.t === "condition" || p.t === "entry") && MEANS_RESOLVED.test(p.a));
    if (!gated) err("survey_before_resolution", j.slug, `step ${i} asks for satisfaction with nothing earlier establishing the case is resolved or closed`);
  });

  /* A journey scoped to a thing must not treat a person-level event as its
     own success - an unrelated later purchase is not recovery of the
     cancelled order. Handoffs are exempt: those are ladder progression. */
  const PERSON_LEVEL = ["purchase_completed", "booking_completed", "subscription_activated", "reorder_completed"];
  if (j.exclusionScope && j.exclusionScope !== "user") {
    for (const e of j.exitEvents ?? []) {
      if (PERSON_LEVEL.includes(e)) {
        err("entity_journey_person_level_success", j.slug, `is scoped to "${j.exclusionScope}" but exits on the person-level event "${e}" - an unrelated ${j.exclusionScope} would count as success`);
      }
    }
  }

  /* Open is not intent (mail privacy fires opens nobody made). A gate may use
     it as a fallback alongside something stronger, never on its own. */
  const OPEN_ONLY = /\bopen(ed|s)?\b|\baçıl|\baçtı\b/i;
  const STRONGER = /click|tıkla|visit|ziyaret|purchas|satın|return|dönüş|activ|aktif|resolv|çözül|watch|izle|log|kaydet|book|rezerv|complete|tamamla|ticket|talep|app\b|uygulama|\bcase\b|\bissue\b|conversation/i;
  en.forEach((s, i) => {
    const gate = stripNegated(s.a);
    if (s.t !== "condition" || !OPEN_ONLY.test(gate)) return;
    if (STRONGER.test(gate)) return;
    warn("open_only_gate", j.slug, `condition ${i} ("${s.a}") decides on an open alone - pair it with a click, visit or behavioural signal`);
  });

  const branchNums = new Set(en.filter((s) => s.branch != null).map((s) => s.branch));
  const entryText = `${en[0]?.a ?? ""} ${en[0]?.b ?? ""}`;
  if (BRANCH_CLAIM_RE.test(entryText) && branchNums.size < 2) {
    warn("branch_claim_without_branch", j.slug, "entry text claims a split/branch but the step data has fewer than 2 branch columns");
  }
  if (branchNums.size === 1) {
    err("branch_no_divergence", j.slug, "exactly one branch number used - a branch run needs at least 2 columns to mean anything");
  }

  const usedChannels = new Set();
  for (const [lang, steps] of [["en", en], ["tr", tr]]) {
    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      if (!STEP_TYPES.includes(s.t)) err("unknown_step_type", j.slug, `${lang} step ${i}: "${s.t}"`);
      if (!s.a || !s.a.trim()) err("empty_text", j.slug, `${lang} step ${i} (${s.t}) has an empty label`);
      if (s.commClass != null && !COMM_CLASSES.includes(s.commClass)) {
        err("invalid_step_comm_class", j.slug, `${lang} step ${i}: commClass "${s.commClass}"`);
      }
      if (ACTION_TYPES.includes(s.t)) {
        if (!s.b || !s.b.trim()) err("empty_text", j.slug, `${lang} step ${i} (${s.t}) has an empty description`);
        if (!s.title || !s.title.trim()) warn("missing_title", j.slug, `${lang} step ${i} (${s.t}) has no scan-mode title`);
        if (lang === "en") {
          usedChannels.add(s.t);
          if (/whatsapp/i.test(s.a)) usedChannels.add("whatsapp");
          if (!j.requiresSensitiveDataPolicy && HEALTH_SENSITIVE_RE.test(`${s.title ?? ""} ${s.b}`)) {
            warn("possible_sensitive_health_content", j.slug, `step ${i} ("${s.title ?? s.b.slice(0, 40)}") reads as health-specific and requiresSensitiveDataPolicy isn't set`);
          }
        }
      }
      if (s.t === "wait") {
        const h = waitHours(s.a);
        if (h !== null && h <= 0) err("impossible_timing", j.slug, `${lang} step ${i}: "${s.a}"`);
      }
      // A transactional receipt is the other layer's job. This is the exact
      // regression that put a fabricated "booking confirmation" send at the
      // end of four travel journeys.
      if (lang === "en" && ACTION_TYPES.includes(s.t) && j.communicationClass === "marketing") {
        if (/\b(booking|order|purchase|payment) confirmation\b|a short confirmation|confirmation is sent/i.test(`${s.title ?? ""} ${s.b}`)) {
          warn("transactional_in_marketing", j.slug, `step ${i} reads as a transactional confirmation inside a marketing journey`);
        }
      }
    }
  }

  for (const c of usedChannels) {
    if (!j.channels.includes(c)) {
      err("undeclared_channel_in_step", j.slug, `a step sends on "${c}" but the journey does not declare it`);
    }
  }
  unusedDeclaredChannels += j.channels.filter((c) => c !== "sales" && !usedChannels.has(c)).length;

  // A condition that gates nothing is either a leftover or a missing step.
  for (let i = 0; i < en.length; i++) {
    if (en[i].t !== "condition") continue;
    const next = en.slice(i + 1).find((s) => s.t !== "wait");
    if (!next || next.t === "condition") {
      warn("condition_gates_nothing", j.slug, `step ${i} "${en[i].a}" is followed by no action`);
    }
  }

  // Departure-anchored journeys must not fall back to plain relative delays
  // for anything long enough to overshoot the trip.
  if (/timed against departure|capped by the departure date/i.test(en[0]?.b ?? "")) {
    for (let i = 0; i < en.length; i++) {
      if (en[i].t !== "wait") continue;
      const h = waitHours(en[i].a);
      if (h !== null && h >= 24) {
        warn("booking_relative_in_departure_journey", j.slug, `step ${i} "${en[i].a}" is anchored to entry, not to departure`);
      }
    }
  }

  // A stated window the steps then overrun - the saas-trial-01 shape of bug.
  const window = en[0]?.a?.match(/last (\d+) days/i);
  if (window) {
    const total = en.reduce((sum, s) => sum + (s.t === "wait" ? (waitHours(s.a) ?? 0) : 0), 0);
    if (total > Number(window[1]) * 24) {
      warn("timing_overruns_window", j.slug, `entry says a ${window[1]}-day window, waits total ${(total / 24).toFixed(1)} days`);
    }
  }
}

/* ---------------------------------------------------------------- report */

const errors = findings.filter((f) => f.level === "error");
const warnings = findings.filter((f) => f.level === "warning");

for (const level of ["error", "warning"]) {
  const list = findings.filter((f) => f.level === level);
  if (list.length === 0) continue;
  console.log(`\n${level.toUpperCase()}S (${list.length})`);
  for (const f of list) console.log(`  [${f.code}] ${f.journey}: ${f.detail}`);
}

console.log(
  `\n${journeys.length} journeys · ${Object.values(flows).reduce((n, f) => n + f.en.length, 0)} steps · ` +
  `${errors.length} errors · ${warnings.length} warnings`,
);
console.log(
  `${unusedDeclaredChannels} declared-but-unused channel slots (expected - badges mean "can run here")`,
);

process.exit(errors.length > 0 ? 1 : 0);
