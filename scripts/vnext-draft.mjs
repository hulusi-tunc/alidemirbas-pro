/* Drafts a vNext migration spec for an existing customer journey from its
   own content - the input to a per-journey human review, never the output.

   Everything the draft writes is derived from what the journey already says:
   eligibility from the trigger's evidence, suppressions from the guardrails
   and the journeys that pre-empt it, touches from its communication actions
   and the conditions on their path, wait events from the curated registry,
   timing as CONFIG_REQUIRED carrying the original prose as its rule. The
   draft never invents a number: no timing default, no cap beyond the plan's
   own length, no holdout share. What a reviewer changes is recorded in
   production/vnext-migration-reviews.json by the reviewer, not here.

     node scripts/vnext-draft.mjs <out-dir> ID [ID...]   */
import { readFile, writeFile, mkdir } from "node:fs/promises";

const dump = JSON.parse(await readFile("production/canonical-dump.json", "utf8"));
const curation = JSON.parse(await readFile("scripts/event-curation.json", "utf8"));
const surfaces = JSON.parse(await readFile("production/surface-assignment.json", "utf8"));
const surfaceOf = Object.fromEntries(surfaces.journeys.map((r) => [r.id, r]));
const registryIds = new Set([...Object.values(curation.waitPhrases).map((c) => c.id), ...curation.measurementEvents.map((m) => m.id), ...dump.journeys.map((j) => j.nodes.find((n) => n.kind === "trigger").event)]);
const phraseId = (u) => registryIds.has(u) ? u : curation.waitPhrases[u]?.id ?? null;

const FILE_BY_CAT = { acquisition: "acquisition", activation: "activation", retention: "retention", consent: "consent", feedback: "feedback", subscription: "subscription", scheduling: "scheduling", fulfillment: "fulfillment", financial: "financial", access: "access", identity: "identity", terminal: "terminal", remedy: "remedy", time: "time", structure: "structure", integration: "integration", decision: "decision", risk: "risk", document: "document", rollout: "rollout", incident: "incident" };
const PRIORITY_BY_CAT = { financial: ["transactional", "none"], identity: ["security", "none"], consent: ["security", "none"], access: ["service", "service"], scheduling: ["service", "service"], fulfillment: ["service", "service"], remedy: ["service", "service"], terminal: ["transactional", "none"], subscription: ["service", "service"], document: ["transactional", "none"], time: ["service", "service"], structure: ["service", "service"], integration: ["service", "service"], decision: ["service", "service"], risk: ["security", "none"], rollout: ["service", "service"], incident: ["service", "service"], activation: ["lifecycle", "lifecycle"], retention: ["lifecycle", "lifecycle"], feedback: ["lifecycle", "lifecycle"], acquisition: ["promotional", "promotional"] };
const ROLE_BY_CHANNEL = { email: "persistent", "in-app": "in-session", push: "low-friction", sms: "urgent", whatsapp: "urgent", call: "human", task: "human", letter: "persistent", chat: "in-session" };
const ROLE_WHEN = {
  persistent: "the message has to be kept and survive until the person can act on it",
  "in-session": "the person is active in the product and the action is taken there",
  "low-friction": "a valid token or app session exists and the message is a single step from the notification",
  urgent: "an asserted time bound lies inside the urgent horizon and permission for messages on this channel is recorded",
  human: "the step is carried out by a person - a call, a task, a visit - and recorded as done by them",
};
const ENTITY_KEY = [[/booking|reservation|appointment/i, "booking_id"], [/order|shipment|delivery|fulfil/i, "order_id"], [/subscription|renewal|term\b/i, "subscription_id"], [/obligation|invoice|payment|charge|refund/i, "obligation_id"], [/document|signature|version/i, "document_version_id"], [/contact point|destination|address/i, "contact_point_id"], [/issue|complaint|case|claim|dispute/i, "issue_id"], [/incident/i, "incident_id"], [/consent|permission/i, "consent_record_id"], [/session|credential|login|identity|verification/i, "identity_id"], [/account/i, "account_id"], [/lead|prospect|enquiry|inquiry/i, "lead_id"], [/relationship|member/i, "relationship_id"], [/person|customer|user|recipient|holder/i, "person_id"]];
const keyFor = (scope) => { const ks = ENTITY_KEY.filter(([re]) => re.test(scope)).map(([, k]) => k); return ks.length ? [...new Set(ks.slice(0, 2))] : ["person_id"]; };

const CLASS_RULES = [[/sla|service level|escalat/i, "decision-sla"], [/before|ahead of|lead|prior to|reminder/i, "reminder-before-attribute"], [/deadline|expir|due|cut-?off|policy defines|policy records|terms define|scheduled time|the moment|at the point/i, "attribute-bound"], [/respon|reply|answer|confirm|decid|choice/i, "response-window"], [/provider|carrier|external|bank|third party|partner/i, "external-window"], [/recover|retry|resume/i, "recovery-window"], [/observ|window|rhythm|interval|horizon|pattern/i, "observation-window"]];
const ATTR_RULES = [[/scheduled|start time|appointment|booking/i, "scheduled_at"], [/expir/i, "expires_at"], [/deadline|due/i, "due_at"], [/cut-?off/i, "cutoff_at"], [/grace/i, "grace_deadline_at"], [/term end|end of the term|renewal/i, "term_end_at"]];
const classify = (text) => { for (const [re, c] of CLASS_RULES) if (re.test(text)) return c; return "observation-window"; };
const attrFor = (text) => { for (const [re, a] of ATTR_RULES) if (re.test(text)) return a; return null; };
const EXIT_CLASS = [[/suppress|nothing (is )?sent|withheld|deferred|duplicate|silent|no message|not sent|left alone/i, "suppression"], [/no action|nothing to do|no intervention|nothing further|not needed|not applicable|not asked|not worth|no (credible |real )?reason|not in scope|not eligible|declined/i, "no-action"], [/out of scope|belongs to|not (an? |the )?(activation|blocker|match)|proxy|engagement only|nothing reactivated/i, "invalid-state"], [/expir|lapsed|timed? out|window closed|no response|unanswered|passed without|not carried through/i, "timeout"], [/fail|unresolved|not closed|outstanding|blocked|abandoned|denied|rejected/i, "failure"], [/stale|superseded|invalid|cancelled|withdrawn|void|not (an?|the) |never/i, "invalid-state"]];
const exitClass = (state) => { for (const [re, c] of EXIT_CLASS) if (re.test(state)) return c; return "success"; };
const firstSentence = (s) => (s.match(/^[^.]*[.]/)?.[0] ?? s).trim();
const CHANNEL_WORD = /\b(e-?mail|sms|push|in-app|whatsapp|letter|call(s|ed|ing)?|phone|text message)\b/gi;
const cleanPurpose = (s) => firstSentence(s).replace(CHANNEL_WORD, "the channel").replace(/\b\d+(\.\d+)?\s*(minutes?|hours?|days?|weeks?|months?|%)/gi, "the configured value");
const slugKey = (j) => j.slug.split("-").slice(0, 2).join("_");

function draft(j) {
  const s = surfaceOf[j.id];
  const comm = !!s.communicating;
  const byId = Object.fromEntries(j.nodes.map((n) => [n.id, n]));
  const trig = byId[j.entry];
  const instanceKey = j.entity.instanceKey?.length ? [...j.entity.instanceKey] : keyFor(j.entity.scope);
  const entityNoun = j.entity.scope.split(/[,;-]/)[0].trim();

  // ---- graph helpers
  const succ = (n) => n.kind === "action" ? [n.next] : n.kind === "condition" ? n.branches.map((b) => b.to) : n.kind === "wait" ? [n.onEvent, n.onTimeout] : n.kind === "trigger" ? [n.next] : [];
  const pathTo = (target, from = j.entry) => { // shortest path node ids from -> target
    const prev = { [from]: null }; const q = [from];
    while (q.length) { const cur = q.shift(); if (cur === target) break; for (const nx of succ(byId[cur]) ?? []) if (nx && byId[nx] && !(nx in prev)) { prev[nx] = cur; q.push(nx); } }
    if (!(target in prev)) return null;
    const p = []; for (let c = target; c; c = prev[c]) p.unshift(c); return p;
  };

  // ---- eligibility / suppressions
  const eligibility = [...(trig.evidence.requires ?? []).map((r) => r.replace(/^./, (c) => c.toLowerCase())), `no instance of this journey is already open for the ${entityNoun}`, "hard gates (GLB-31) allow communication for this purpose"];
  const suppressions = [];
  (j.guardrails ?? []).forEach((g, i) => suppressions.push({ id: `s.g${i + 1}`, label: "CANONICAL_RULE", text: g }));
  (j.preemptedBy ?? []).forEach((p, i) => suppressions.push({ id: `s.p${i + 1}`, label: "CANONICAL_RULE", text: `${p.event.replace(/^./, (c) => c.toUpperCase())}: ${p.then}` }));
  if (!suppressions.length) suppressions.push({ id: "s.stale", label: "CANONICAL_RULE", text: `A ${entityNoun} whose state no longer matches the trigger when re-read sends nothing and exits.` });

  // ---- waits
  const waits = {}; const configKeys = new Set();
  for (const w of j.nodes.filter((n) => n.kind === "wait")) {
    const until = w.until.map((u) => phraseId(u) ?? u);
    const prose = typeof w.timeout.after === "string" ? w.timeout.after : null;
    if (!prose) continue; // already migrated
    const cls = classify(prose + " " + (w.timeout.reason ?? ""));
    const attr = ["attribute-bound", "reminder-before-attribute"].includes(cls) ? attrFor(prose + " " + w.id) : null;
    const key = `${slugKey(j)}.${w.id.replace(/^w\./, "").replace(/-/g, "_")}`;
    configKeys.add(key);
    waits[w.id] = {
      until,
      timeout: { after: { key, rule: prose.replace(/^./, (c) => c.toUpperCase()).replace(/\.?$/, "."), class: cls, required: true }, reason: w.timeout.reason ?? prose, relativeTo: attr ? "attribute" : j.nodes.some((n) => n.kind === "action" && n.execution === "communication" && n.next === w.id) ? "previous-touch" : "trigger", ...(attr ? { attribute: attr } : {}) },
      recheck: `the ${entityNoun} re-read from the system of record before acting on the timeout`,
    };
  }

  // ---- exits / handoffs / actions
  const exits = {}; for (const x of j.nodes.filter((n) => n.kind === "exit")) if (!x.class) exits[x.id] = exitClass(x.state);
  const handoffs = {}; for (const h of j.nodes.filter((n) => n.kind === "handoff" && n.to.startsWith("external:") && !n.contract)) handoffs[h.id] = { contract: { requiredFields: [...instanceKey, "handed_at", "reason"] } };
  const actions = {};
  const commActions = j.nodes.filter((n) => n.kind === "action" && n.execution === "communication");
  const humanActions = j.nodes.filter((n) => n.kind === "action" && n.execution === "human");
  for (const a of j.nodes.filter((n) => n.kind === "action")) if (!a.idempotencyKey && (a.execution || a.writes?.length || /\b(send|issue|create|open|record|apply|charge|refund|grant|revoke|restrict|release|schedule|assign|escalate|notify|dispatch|update)\b/i.test(a.does))) actions[a.id] = { idempotencyKey: `${instanceKey.join(" + ")} + ${a.id}` };
  // loops through waits: attemptBudget on the first action in the cycle
  const seen = new Set();
  const dfs = (id, stack) => { if (stack.includes(id)) { const cyc = stack.slice(stack.indexOf(id)); if (cyc.some((c) => byId[c].kind === "wait") && !cyc.some((c) => byId[c].kind === "action" && byId[c].attemptBudget)) { const act = cyc.find((c) => byId[c].kind === "action"); if (act) actions[act] = { ...(actions[act] ?? {}), attemptBudget: { key: `${slugKey(j)}.${act.replace(/^a\./, "").replace(/-/g, "_")}_budget`, rule: "This loop runs against a budget fixed when the instance opened; when it is spent the instance takes its timeout path (GLB-24).", required: true } }; } return; } if (seen.has(id)) return; seen.add(id); for (const nx of succ(byId[id]) ?? []) if (nx && byId[nx]) dfs(nx, [...stack, id]); seen.delete(id); };
  dfs(j.entry, []);

  // ---- orchestration (communicating only)
  let contact, channelStrategy, orchestration;
  if (comm) {
    const [prio, pressure] = PRIORITY_BY_CAT[j.category] ?? ["service", "service"];
    const roles = []; const roleSeen = new Set();
    for (const c of j.channels) { const r = ROLE_BY_CHANNEL[c] ?? "persistent"; if (roleSeen.has(r)) { roles.find((x) => x.role === r).channels.push(c); continue; } roleSeen.add(r); roles.push({ role: r, channels: [c], when: ROLE_WHEN[r] }); }
    channelStrategy = { roles, fallback: "same-role-other-channel", label: "RECOMMENDED_DEFAULT" };
    const touchActs = [...commActions, ...humanActions.filter((a) => j.channels.some((c) => ROLE_BY_CHANNEL[c] === "human"))];
    const touches = []; let prevTouchId = null;
    for (const a of touchActs) {
      const path = pathTo(a.id) ?? [];
      const gate = [...path].reverse().find((id) => byId[id].kind === "wait") ?? null;
      const from = gate ?? j.entry;
      const sub = pathTo(a.id, from) ?? path;
      const prereq = sub.filter((id) => byId[id].kind === "condition");
      const isHuman = a.execution === "human";
      const t = { id: `t${touches.length + 1}`, stage: a.id.replace(/^a\./, ""), action: a.id, ...(prevTouchId && path.some((id) => byId[id].id === touches.at(-1).action) ? { after: prevTouchId } : {}), ...(gate ? { gatedBy: gate } : {}), prerequisites: prereq, purpose: cleanPurpose(a.does), channelRoles: isHuman ? ["human"] : roles.filter((r) => r.role !== "human").map((r) => r.role), mandatory: ["transactional", "security"].includes(prio), label: "CANONICAL_RULE" };
      touches.push(t); prevTouchId = t.id;
    }
    const strategy = humanActions.length && /escalat/i.test(humanActions.map((a) => a.does).join(" ")) ? "human-escalation-ladder" : touches.length <= 1 ? "single-notice" : touches.some((t) => t.gatedBy) ? "offer-decide-remind" : "notice-then-confirm";
    orchestration = { strategy, touches, noAction: suppressions.map((s) => s.id) };
    const mandatoryAny = touches.some((t) => t.mandatory);
    contact = {
      defaultPriority: prio, pressureClass: pressure,
      localCap: { value: { key: `${slugKey(j)}.touches`, rule: "Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.", default: { value: Math.max(1, touches.filter((t) => !t.mandatory).length), confidence: "high", basis: "corpus-rule", applicableWhen: "GLB-24; the graph's own touch count" }, required: false }, appliesTo: mandatoryAny ? "non-mandatory" : "all" },
      cooldown: ["acquisition", "activation", "retention", "feedback"].includes(j.category)
        ? { key: `${slugKey(j)}.cooldown`, rule: `The cooldown between instances of this journey for the same ${entityNoun}, so that a re-qualifying ${entityNoun} is tracked but not messaged again inside it.`, class: "cooldown", required: true }
        : { key: `${slugKey(j)}.cooldown`, rule: `This journey is per ${entityNoun}; a later instance concerns a different ${entityNoun} and no cooldown applies between them.`, default: { value: "none", confidence: "high", basis: "corpus-rule", applicableWhen: "the entity note: one instance per entity" }, required: false },
      competition: j.competition ? { exclusionGroup: j.competition.exclusionGroup, scope: j.competition.scope, precedence: j.competition.precedence, onLoss: j.competition.onLoss } : "none",
    };
  }

  // ---- measurement / discovery / implementation
  const exitIds = j.nodes.filter((n) => n.kind === "exit").map((n) => n.id); const handIds = j.nodes.filter((n) => n.kind === "handoff").map((n) => n.id);
  const outcomeType = exitIds.length && handIds.length ? "exit-or-handoff" : exitIds.length ? "exit" : "handoff";
  const firstTouchAct = commActions[0]?.id; let boEvent = null;
  if (firstTouchAct) { const w = j.nodes.find((n) => n.kind === "wait" && (pathTo(n.id, firstTouchAct) ?? []).length > 1); if (w) boEvent = (waits[w.id]?.until ?? w.until.map((u) => phraseId(u) ?? u))[0]; }
  const measurement = {
    journeyOutcome: { type: outcomeType, refs: [...exitIds, ...handIds] },
    ...(comm && boEvent && registryIds.has(boEvent) ? { businessOutcome: { event: boEvent, unit: "instance", observationScope: { type: "self" }, window: { type: "until-exit" }, attribution: "touched-before-event", comparison: "not-applicable" } } : {}),
    secondary: [], guardrails: comm ? ["complaint", "message_after_success", "unsubscribe"] : ["state_written_on_stale_entity"], operational: ["entry_volume", "exit_distribution", "no_action_rate_by_reason", "time_to_exit"],
  };
  const aliases = [...new Set([j.shortName.toLowerCase(), ...(j.name.split("→").map((s) => s.trim().toLowerCase()).filter((s) => s.length > 4 && s.length < 40).slice(0, 2))])];
  const discovery = { aliases, useCases: [firstSentence(j.purpose).replace(/\.$/, "").replace(/^./, (c) => c.toLowerCase())] };
  const attrs = new Set([...instanceKey]); for (const n of j.nodes) if (n.kind === "action") (n.writes ?? []).forEach((w) => attrs.add(w.field)); for (const w of Object.values(waits)) if (w.timeout.attribute) attrs.add(w.timeout.attribute);
  const implementation = { attributes: { required: [...attrs], optional: [] } };

  const journey = { objective: firstSentence(j.purpose), eligibility, suppressions, ...(comm ? { contact, channelStrategy, orchestration } : {}), implementation, measurement, discovery };
  const spec = { id: j.id, file: `src/canonical/${FILE_BY_CAT[j.category] ?? j.category}.ts`, _draft: { surface: comm ? "customer-communicating" : "customer-silent", instanceKeyDerived: !j.entity.instanceKey?.length, commActions: commActions.map((a) => a.id), humanActions: humanActions.map((a) => a.id) }, entity: { instanceKey, concurrency: j.entity.concurrency ?? "one-active-per-key" }, ...(j.competition && comm ? { removeCompetition: true } : {}), journey, ...(trig.evidence.insufficientAlone?.length ? {} : { trigger: { insufficientAlone: ["a proxy for the trigger condition that is not the recorded fact itself - REVIEW: name the specific proxies this journey must not start on"] } }), waits, exits, actions, handoffs };
  return spec;
}

const [outDir, ...ids] = process.argv.slice(2);
await mkdir(outDir, { recursive: true });
for (const id of ids) {
  const j = dump.journeys.find((x) => x.id === id); if (!j) { console.error("no journey " + id); process.exit(1); }
  if (j.measurement) { console.log(`${id}: already vNext, skipped`); continue; }
  const spec = draft(j);
  await writeFile(`${outDir}/${id}.json`, JSON.stringify(spec, null, 1));
  console.log(`${id}: ${spec._draft.surface} · ${Object.keys(spec.waits).length} waits · ${spec.journey.orchestration?.touches.length ?? 0} touches · ${Object.keys(spec.exits).length} exits classed · ${Object.keys(spec.actions).length} actions keyed`);
}
