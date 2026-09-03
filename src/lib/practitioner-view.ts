import type {
  CanonicalJourney, Config, Label, Measurement, OrchestrationStrategy, PriorityClass, RuleStatement, SignalSource, ChannelRole, ChannelStrategy, Preset,
} from "@/canonical/types";
import { byId } from "@/canonical";
import { semanticEvent, eventText } from "@/canonical/events";
import { configShort, configText, configValueText } from "@/canonical/config-text";

/* The practitioner's view of one Customer Journey, projected from canonical
   data alone - no hand-maintained explanatory copy. Server-only, like
   canonical-view.ts: the page receives this small shape, never the graph.

   Every field is a projection of a vNext field: the timeline walks
   `orchestration.touches` through their `after` links and reads each
   touch's timing from the wait it is gated by; Configure lists every Config
   the journey carries, once per key; Required data lists the events derived
   from the graph and the attributes the journey names. Nothing here is a
   second source of truth, and a journey without vNext fields gets no view. */

export type TimelineStep = {
  id: string;
  stage: string;
  purpose: string;
  /** The wait this touch follows, if any: its timing, what cancels it, what is re-read. */
  gate: { waitId: string; timing: string; timingFull: string; relativeTo: string; attribute?: string; cancelOn: string[]; recheck?: string } | null;
  /** The conditions that must pass before the send, as the graph asks them. */
  checks: string[];
  channelRoles: ChannelRole[];
  destination?: { target: string; boundTo: string; mustNotClaim?: readonly string[] };
  mandatory: boolean;
  priority: PriorityClass;
  priorityReason?: string;
  label: Label;
  /** Touch ids that follow this one (branches of the plan). */
  next: string[];
  after?: string;
};

export type ConfigRow = { key: string; rule: string; class?: string; short: string; full: string; required: boolean; label: Label; usedBy: string[]; /** The value an applied preset sets for this key. */ override?: string };

export type PractitionerView = {
  strategy: OrchestrationStrategy | null;
  objective: string;
  trigger: { event: string; meaning: string; source: SignalSource; requires: readonly string[]; insufficient: readonly string[] };
  entity: { scope: string; instanceKey: readonly string[]; concurrency?: string; supersession?: RuleStatement };
  whoEnters: readonly string[];
  suppressedWhen: readonly RuleStatement[];
  timeline: TimelineStep[];
  channelStrategy: ChannelStrategy | null;
  stopsWhen: { exits: { id: string; state: string; class: string; reEntry: string }[]; handoffs: { id: string; to: string; toName: string | null; on: string; href: string | null }[] };
  configure: ConfigRow[];
  requiredData: { events: { id: string; meaning: string; source: string }[]; attributes: { required: readonly string[]; optional: readonly string[] } };
  collision: { defaultPriority: PriorityClass; pressureClass: string; localCap: string; localCapAppliesTo: string; cooldown: string; competition: string; mandatoryTouches: string[]; noAction: RuleStatement[] } | null;
  measurement: Measurement & { businessMeaning?: string; journeyLabel: string };
  presets: readonly { id: string; name: string; applicableWhen: RuleStatement; overrides: Readonly<Record<string, unknown>>; destination?: string }[];
  /** The preset this view was projected under, if the URL was a preset's. */
  preset: { id: string; name: string; applicableWhen: RuleStatement; destination: string | null; overrides: readonly { key: string; value: string }[] } | null;
};

const labelOf = (c: Config<unknown>): Label => (c.required ? "CONFIG_REQUIRED" : c.default ? "RECOMMENDED_DEFAULT" : "CANONICAL_RULE");

export function practitionerView(j: CanonicalJourney, preset: Preset | null = null): PractitionerView | null {
  if (!j.measurement) return null; // not migrated: no view is better than a half view
  const nodeById = new Map(j.nodes.map((n) => [n.id, n]));
  const trig = nodeById.get(j.entry);
  if (!trig || trig.kind !== "trigger") return null;

  // ---- configure: every Config, once per key
  const configs = new Map<string, ConfigRow>();
  const addConfig = (c: Config<unknown> | undefined, usedBy: string) => {
    if (!c) return;
    const row = configs.get(c.key) ?? { key: c.key, rule: c.rule, class: c.class, short: configShort(c), full: configText(c), required: c.required, label: labelOf(c), usedBy: [] };
    row.usedBy.push(usedBy);
    configs.set(c.key, row);
  };
  for (const n of j.nodes) {
    if (n.kind === "wait" && typeof n.timeout.after !== "string") addConfig(n.timeout.after, `wait ${n.id}`);
    if (n.kind === "action" && n.attemptBudget) addConfig(n.attemptBudget, `action ${n.id}`);
  }
  if (j.contact) { addConfig(j.contact.localCap?.value, "local cap"); addConfig(j.contact.cooldown, "cooldown"); }
  if (j.measurement.businessOutcome?.holdout) addConfig(j.measurement.businessOutcome.holdout, "holdout");
  if (j.measurement.businessOutcome && typeof j.measurement.businessOutcome.window === "object" && "key" in j.measurement.businessOutcome.window) addConfig(j.measurement.businessOutcome.window as Config, "measurement window");

  // ---- an applied preset overrides config values by key and nothing else
  if (preset) for (const [k, v] of Object.entries(preset.overrides ?? {})) { const row = configs.get(k); if (row) row.override = configValueText(v as never); }

  // ---- timeline
  const touches = j.orchestration?.touches ?? [];
  const timeline: TimelineStep[] = touches.map((t) => {
    const w = t.gatedBy ? nodeById.get(t.gatedBy) : undefined;
    const gate = w && w.kind === "wait" ? {
      waitId: w.id,
      timing: configShort(w.timeout.after),
      timingFull: configText(w.timeout.after),
      relativeTo: w.timeout.relativeTo ?? "trigger",
      attribute: w.timeout.attribute,
      cancelOn: w.until.map(eventText),
      recheck: w.recheck,
    } : null;
    const checks = t.prerequisites.map((p) => { const n = nodeById.get(p); return n?.kind === "condition" ? n.asks : n?.kind === "action" ? n.does : p; });
    return {
      id: t.id, stage: t.stage, purpose: t.purpose, gate, checks, channelRoles: [...t.channelRoles], destination: t.destination, mandatory: t.mandatory,
      priority: t.priority ?? j.contact?.defaultPriority ?? "lifecycle", priorityReason: t.priorityReason, label: t.label,
      next: touches.filter((x) => x.after === t.id).map((x) => x.id), after: t.after,
    };
  });

  // ---- events derived from the graph (never authored)
  const eventIds = new Set<string>([trig.event]);
  for (const n of j.nodes) if (n.kind === "wait") n.until.forEach((u) => eventIds.add(u));
  if (j.measurement.businessOutcome) { eventIds.add(j.measurement.businessOutcome.event); const w = j.measurement.businessOutcome.window; if (typeof w === "object" && "until" in w) eventIds.add(w.until); }
  (j.measurement.secondary ?? []).forEach((e) => eventIds.add(e));
  const events = [...eventIds].map((id) => { const e = semanticEvent(id); return { id, meaning: e?.meaning ?? id, source: e?.source ?? "authoritative" }; });

  const exits = j.nodes.filter((n) => n.kind === "exit").map((x) => ({ id: x.id, state: x.state, class: x.class ?? "unclassified", reEntry: x.reEntry }));
  const handoffs = j.nodes.filter((n) => n.kind === "handoff").map((h) => { const t = h.to.startsWith("external:") ? null : byId(h.to); return { id: h.id, to: h.to, toName: t?.shortName ?? null, on: h.on, href: t ? t.slug : null }; });

  const supById = new Map((j.suppressions ?? []).map((s) => [s.id, s]));
  const collision = j.contact ? {
    defaultPriority: j.contact.defaultPriority,
    pressureClass: j.contact.pressureClass,
    localCap: configShort(j.contact.localCap.value),
    localCapAppliesTo: j.contact.localCap.appliesTo,
    cooldown: configShort(j.contact.cooldown),
    competition: j.contact.competition === "none" ? "none" : `${j.contact.competition.exclusionGroup} (${j.contact.competition.scope}) - ${j.contact.competition.precedence}`,
    mandatoryTouches: touches.filter((t) => t.mandatory).map((t) => t.id),
    noAction: (j.orchestration?.noAction ?? []).map((id) => supById.get(id)).filter((s): s is RuleStatement => !!s),
  } : null;

  const bo = j.measurement.businessOutcome;
  return {
    strategy: j.orchestration?.strategy ?? null,
    objective: j.objective ?? j.purpose,
    trigger: { event: trig.event, meaning: eventText(trig.event), source: trig.evidence.source, requires: trig.evidence.requires, insufficient: trig.evidence.insufficientAlone ?? [] },
    entity: { scope: j.entity.scope, instanceKey: j.entity.instanceKey ?? [], concurrency: j.entity.concurrency, supersession: j.entity.supersession },
    whoEnters: j.eligibility ?? [],
    suppressedWhen: j.suppressions ?? [],
    timeline,
    channelStrategy: j.channelStrategy ?? null,
    stopsWhen: { exits, handoffs },
    configure: [...configs.values()],
    requiredData: { events, attributes: { required: j.implementation?.attributes.required ?? [], optional: j.implementation?.attributes.optional ?? [] } },
    collision,
    measurement: { ...j.measurement, businessMeaning: bo ? eventText(bo.event) : undefined, journeyLabel: j.measurement.journeyOutcome.refs.join(", ") },
    presets: j.discovery?.presets ?? [],
    preset: preset ? { id: preset.id, name: preset.name, applicableWhen: preset.applicableWhen, destination: preset.destination ?? null, overrides: Object.entries(preset.overrides ?? {}).map(([key, value]) => ({ key, value: configValueText(value as never) })) } : null,
  };
}
