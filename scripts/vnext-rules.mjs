/* vNext validation rules - called from validate-canonical.mjs after the graph
   checks. See JOURNEY_VNEXT_ARCHITECTURE.md §T and ARCHITECTURE_PATCH_0_5.md.

   Severity policy: a journey that declares `measurement` has opted into
   vNext and every rule below is an ERROR for it; an un-migrated journey gets
   the same findings as WARNINGS so the migration backlog is visible without
   blocking the build. Schema-invalid data (a Config with no key, a touch
   naming a node that does not exist) is an error either way.

   Nothing here reads production/*.json except surface-assignment.json, and
   only to detect drift between the corpus and that file. */

const MESSAGE = new Set(["email", "sms", "push", "in-app", "whatsapp"]);
const HUMAN = new Set(["sales", "task"]);
const NUM_UNIT = /\b\d+(\.\d+)?\s*(-|–|to)?\s*\d*\s*(min|mins|minute|minutes|hour|hours|day|days|week|weeks|month|months|h|d|%|percent|usd|eur|gbp|try|tl|₺|\$|€|£)\b/i;
const ENGAGEMENT = /\b(open(ed|s|ing)? (the |an? )?(message|email|e-mail|notification|push|sms)|(message|email|e-mail|notification|push|sms) (was )?(open|opened|read|clicked|seen)|click(ed|s|ing)?( |-)?(through|the link|a link)|clicked|open rate|read receipt|impression|engaged with the message)\b/i;
const CTA = /\b(open|resume|update|confirm|choose|select|complete|sign|pay|book|reschedule|verify|accept|decline|review|correct|provide|upload|claim)\b/i;
const CHANNEL_WORD = /\b(email|e-mail|sms|push|whatsapp|in-app)\b/i;
const SIDE_EFFECT = /\b(refund(s|ed)?|charge(s|d)?|debit|credit (the|a)|create (a|the) (task|ticket|case|request)|raise (the|a|it|this)|open (a|the) (ticket|case)|delete|deactivat|revoke|provision|issue (a|the))\b/i;
const DELIVERY_FAIL = /\b(bounce|undeliver|invalid token|delivery fail|not delivered|could not be delivered)\b/i;
const PRIORITIES = ["security", "transactional", "service-critical", "service", "retention", "lifecycle", "promotional"];
const ROLES = ["in-session", "low-friction", "persistent", "urgent", "human"];
const LABELS = ["CANONICAL_RULE", "RECOMMENDED_DEFAULT", "CONFIG_REQUIRED", "OPTIONAL_STRATEGY"];
const TIMING_CLASSES = ["attribute-bound", "reminder-before-attribute", "response-window", "recovery-window", "decision-sla", "observation-window", "cooldown", "backoff", "external-window"];
const EXIT_CLASSES = ["success", "invalid-state", "suppression", "timeout", "failure", "no-action"];

// Mirrors src/canonical/surface.ts's SurfaceAssignment - see that file's comment for why
// there is no combined `communicating` field. `sends` and `routesToHuman` are independent;
// a caller wanting the union reads `sends || routesToHuman` at the call site (line ~73 below).
export function surfaceOf(j, mechanismIds, customerCategories, customerEntity) {
  const sends = j.channels.some((c) => MESSAGE.has(c));
  const routesToHuman = j.channels.some((c) => HUMAN.has(c));
  if (mechanismIds.has(j.id)) return { surface: "mechanism", sends, routesToHuman };
  if (sends) return { surface: "customer", sends, routesToHuman };
  if (customerCategories.has(j.category) && customerEntity.test(j.entity?.scope ?? "")) return { surface: "customer", sends, routesToHuman };
  return { surface: "operational", sends, routesToHuman };
}

const successors = (n) => n.kind === "condition" ? n.branches.map((b) => b.to) : n.kind === "wait" ? [n.onEvent, n.onTimeout] : ["trigger", "action", "outcome"].includes(n.kind) ? [n.next] : [];

function reachable(byId, from, to, via) {
  // is `to` reachable from `from`; if `via` is set, the path must pass through it
  const walk = (start, goal) => {
    const seen = new Set(); const st = [start];
    while (st.length) { const id = st.pop(); if (seen.has(id)) continue; seen.add(id); if (id === goal) return true; const n = byId[id]; if (n) st.push(...successors(n)); }
    return false;
  };
  if (via) return walk(from, via) && walk(via, to);
  return walk(from, to);
}

function isConfig(x) { return x && typeof x === "object" && "key" in x && "rule" in x && "required" in x; }

export function checkVnext({ all, registry, surfaceFile, mechanismIds, customerCategories, customerEntity, err, warn }) {
  const ids = new Set(all.map((j) => j.id));
  const byJourney = Object.fromEntries(all.map((j) => [j.id, j]));
  const registered = new Set(registry.map((e) => e.id));
  const counts = { customer: 0, "customer-silent": 0, "customer-communicating": 0, mechanism: 0, operational: 0 };
  const stats = { vnext: 0, warningsByJourney: {} };

  for (const j of all) {
    const surf = surfaceOf(j, mechanismIds, customerCategories, customerEntity);
    counts[surf.surface]++;
    if (surf.surface === "customer") counts[surf.sends ? "customer-communicating" : "customer-silent"]++;
    const vnext = !!j.measurement;
    if (vnext) stats.vnext++;
    const sev = (code, msg) => (vnext ? err : warn)(code, j.id, msg);
    const byId = Object.fromEntries(j.nodes.map((n) => [n.id, n]));
    const waits = j.nodes.filter((n) => n.kind === "wait");
    const commActs = j.nodes.filter((n) => n.kind === "action" && (n.execution === "communication" || n.execution === "human"));
    const sendActs = j.nodes.filter((n) => n.kind === "action" && n.execution === "communication");
    const exits = j.nodes.filter((n) => n.kind === "exit");
    const hands = j.nodes.filter((n) => n.kind === "handoff");
    const conds = j.nodes.filter((n) => n.kind === "condition");
    const isCustomer = surf.surface === "customer";
    // Orchestrated = carries a full vNext orchestration contract, whether it sends a customer
    // message or only routes work to a person (task/sales) - ACQ-04, ACT-11 and RET-24 are the
    // latter and are held to the same orchestration/contact/channelStrategy requirements below.
    // See src/canonical/surface.ts's SurfaceAssignment comment for why this is not called
    // `communicating` - that name meant two different things in two different places.
    const orchestrated = isCustomer && (surf.sends || surf.routesToHuman);

    // ---- triggers and registry
    const trig = byId[j.entry];
    if (trig && !registered.has(trig.event)) err("trigger_event_not_registered", j.id, `trigger event "${trig.event}" is not in the semantic-event registry`);
    if (trig && !(trig.evidence?.insufficientAlone?.length)) sev("trigger_no_negative_evidence", `trigger "${trig.id}" names nothing that looks like the event and is not`);
    for (const w of waits) for (const u of w.until) if (!registered.has(u)) sev("until_not_registry", `wait "${w.id}" waits on "${u}", which is not a registered semantic event`);

    // ---- timing
    for (const w of waits) {
      const a = w.timeout?.after;
      if (typeof a === "string") sev("timing_unclassified", `wait "${w.id}" carries prose timing ("${a.slice(0, 60)}") instead of a classified Config`);
      else if (isConfig(a)) {
        if (!a.class || !TIMING_CLASSES.includes(a.class)) err("timing_unclassified", j.id, `wait "${w.id}" timeout Config "${a.key}" has no valid timing class`);
        if (!a.default && !a.required) err("timing_unclassified", j.id, `wait "${w.id}" Config "${a.key}" has neither a default nor required: true`);
        if (a.default) {
          if (!a.default.confidence || !a.default.basis) err("default_without_basis", j.id, `wait "${w.id}" Config "${a.key}" default lacks confidence or basis`);
          if (a.default.basis === "published-benchmark" && !a.default.citation) err("default_without_basis", j.id, `Config "${a.key}" claims a published benchmark with no citation`);
          if (a.default.basis === "corpus-rule" && !/GLB-\d+|[A-Z]{3}-R\d+/.test(a.default.applicableWhen ?? "" + a.rule)) warn("default_basis_unlinked", j.id, `Config "${a.key}" cites corpus-rule as basis but names no rule id in rule/applicableWhen`);
        }
        if (NUM_UNIT.test(a.rule)) err("canonical_rule_contains_number", j.id, `wait "${w.id}" Config rule contains a number: "${a.rule.slice(0, 80)}"`);
        if (!w.timeout.relativeTo) sev("timing_unclassified", `wait "${w.id}" does not say what its timeout is relative to`);
        if (w.timeout.relativeTo === "attribute" && !w.timeout.attribute) err("timing_unclassified", j.id, `wait "${w.id}" is attribute-relative but names no attribute`);
      } else err("wait_no_timeout", j.id, `wait "${w.id}" has an unreadable timeout`);
      if (w.windowExtendsOnEngagement === true) sev("engagement_extends_window", `wait "${w.id}" lets engagement extend a bounded window`);
    }

    // ---- exits, instance, contracts
    for (const x of exits) if (!x.class || !EXIT_CLASSES.includes(x.class)) sev("exit_unclassed", `exit "${x.id}" has no exit class`);
    if (exits.length && !exits.some((x) => x.class === "success") && !hands.length) sev("no_success_or_handoff", "no success exit and no handoff - nothing says the journey did its job");
    if (!j.entity?.instanceKey?.length) sev("instance_key_missing", "entity.instanceKey is empty");
    if (j.entity?.instanceKey?.length && !j.entity.concurrency) sev("instance_key_missing", "entity.concurrency not stated");
    for (const h of hands) if (h.to.startsWith("external:") && !h.contract?.requiredFields?.length) sev("external_target_uncontracted", `handoff "${h.id}" to ${h.to} carries no contract`);
    for (const n of j.nodes) if (n.kind === "action" && SIDE_EFFECT.test(n.does) && !n.idempotencyKey) sev("tx_no_idempotency", `action "${n.id}" has an external side effect and no idempotencyKey`);

    // ---- Validator A: idempotency key field provenance (production-readiness gap-closure round)
    // Every field-shaped token in an idempotencyKey must be declared in implementation.attributes
    // or derived (written by some action in this journey's own graph) - not copy-pasted from a
    // different journey's template, which was the root cause behind FBK-47/FBK-49/IDN-81/IDN-84/
    // ACC-261/ACC-263/IDN-270 and 29 others found by re-running this check corpus-wide. A bare
    // action/node-id reference (`a.remind`) or a multi-word phrase (`touch id`, `fully signed`) is
    // a self-scoping token, not a field claim, and is not checked. Severity follows `orchestrated`
    // (the 68 message-sending + 3 human-routing journeys), not generic vnext status, so the
    // remaining corpus-wide backlog in silent lifecycle states stays a warning until that round
    // is explicitly scoped - see VALIDATOR-COVERAGE.md in research/journey-production-readiness/.
    {
      const declared = new Set([...(j.implementation?.attributes?.required ?? []), ...(j.implementation?.attributes?.optional ?? [])]);
      const derived = new Set(j.nodes.flatMap((n) => (n.writes ?? []).map((w) => w.field)));
      const vocab = new Set([...declared, ...derived]);
      const idemSev = (code, msg) => (orchestrated && vnext ? err : warn)(code, j.id, msg);
      for (const n of j.nodes) {
        if (n.kind !== "action" || !n.idempotencyKey) continue;
        for (const part of n.idempotencyKey.split("+").map((s) => s.trim())) {
          if (part.includes(" ")) continue;
          if (/^[a-z]\.[a-z0-9-]+$/.test(part)) continue;
          if (!/^[a-z][a-z0-9_]*$/.test(part)) continue;
          if (!vocab.has(part)) idemSev("idempotency_field_undeclared", `action "${n.id}" idempotencyKey references "${part}", which this journey neither declares in implementation.attributes nor derives via a writes step - "${n.idempotencyKey}"`);
        }
      }
    }

    // ---- Validator B: handoff identifier provenance (production-readiness gap-closure round)
    // For every internal handoff, each field in the TARGET journey's own entity.instanceKey must
    // be resolvable from this journey's own declared/derived vocabulary, or be explicitly named in
    // the handoff's own contract.requiredFields - which is also where a fresh identifier minted at
    // the handoff itself (documented in `carries`) is declared, exactly as FUL-148/SCH-180/REM-152/
    // DOC-220's handoffs into the issue_id-keyed remedy chain now do. This is corpus-wide and
    // WARN-only everywhere, deliberately never an error: many targets legitimately mint their own
    // instance key on entry from data the graph text does not literally `write` (a database row's
    // own id, assigned the moment the real-world record is created), and this check cannot tell
    // that case apart from a genuine gap without the kind of domain judgment this round applied by
    // hand to the four handoffs above. Treat every finding as a prompt to check, not a verdict.
    for (const h of hands) {
      if (h.to.startsWith("external:")) continue;
      const target = byJourney[h.to];
      if (!target) continue; // an unresolvable target is a different, pre-existing failure mode
      const targetKey = target.entity?.instanceKey ?? [];
      if (!targetKey.length) continue;
      const contractFields = new Set(h.contract?.requiredFields ?? []);
      const srcVocab = new Set([
        ...(j.implementation?.attributes?.required ?? []),
        ...(j.implementation?.attributes?.optional ?? []),
        ...(j.entity?.instanceKey ?? []),
        ...j.nodes.flatMap((n) => (n.writes ?? []).map((w) => w.field)),
      ]);
      const missing = targetKey.filter((f) => !srcVocab.has(f) && !contractFields.has(f));
      if (missing.length) warn("handoff_identifier_unprovenanced", j.id, `handoff "${h.id}" to ${h.to} does not carry [${missing.join(", ")}], which ${h.to}'s own entity.instanceKey requires, and does not declare it in contract.requiredFields`);
    }
    if (vnext && !j.objective) err("objective_missing", j.id, "no objective");
    if (vnext && !j.eligibility?.length) err("eligibility_missing", j.id, "no eligibility");
    if (vnext && !j.suppressions?.length) err("suppressions_missing", j.id, "no suppressions");
    for (const s of j.suppressions ?? []) {
      if (!s.id || !s.label || !s.text || !LABELS.includes(s.label)) err("suppression_unlabelled", j.id, `suppression ${s.id ?? "?"} lacks id/label/text`);
      else if (s.label === "CANONICAL_RULE" && NUM_UNIT.test(s.text)) err("canonical_rule_contains_number", j.id, `suppression "${s.id}" is a CANONICAL_RULE with a number: "${s.text.slice(0, 80)}"`);
    }
    if (j.entity?.supersession && (!j.entity.supersession.label || !LABELS.includes(j.entity.supersession.label))) err("suppression_unlabelled", j.id, "entity.supersession has no label");
    for (const e of j.eligibility ?? []) if (NUM_UNIT.test(e)) err("canonical_rule_contains_number", j.id, `eligibility contains a number: "${e.slice(0, 80)}"`);
    if (vnext && j.implementation && j.implementation.events) err("duplicate_source_of_truth", j.id, "implementation.events is authored - it is derived from the graph");
    if (vnext && !(j.implementation?.attributes?.required?.length)) err("implementation_missing", j.id, "implementation.attributes.required is empty");

    // ---- loops
    {
      const color = {}; const path = []; let cyc = null;
      const dfs = (id) => { if (cyc) return; color[id] = 1; path.push(id); for (const s of successors(byId[id] ?? { kind: "x" })) { if (color[s] === 1) { cyc = path.slice(path.indexOf(s)); return; } if (!color[s]) dfs(s); } path.pop(); color[id] = 2; };
      dfs(j.entry);
      if (cyc) {
        const nodes = cyc.map((id) => byId[id]);
        const capped = nodes.some((n) => n.kind === "action" && n.attemptBudget) || nodes.some((n) => n.kind === "wait" && isConfig(n.timeout?.after) && n.timeout.after.class === "attribute-bound");
        if (nodes.some((n) => n.kind === "wait") && !capped) sev("loop_uncapped", `cycle ${cyc.join(" > ")} contains a wait and no attemptBudget or attribute-bound timeout`);
      }
    }

    // ---- measurement
    const journeyEvents = new Set([trig?.event, ...waits.flatMap((w) => w.until), ...conds.flatMap((c) => c.branches.map((b) => b.observes).filter(Boolean))].filter(Boolean));
    if (vnext) {
      const m = j.measurement;
      if (!m.journeyOutcome?.refs?.length) err("measurement_journey_outcome_missing", j.id, "journeyOutcome.refs is empty");
      for (const r of m.journeyOutcome?.refs ?? []) {
        const ok = m.journeyOutcome.type === "exit" ? exits.some((x) => x.id === r || x.class === r) : m.journeyOutcome.type === "handoff" ? hands.some((h) => h.id === r) : m.journeyOutcome.type === "exit-or-handoff" ? exits.some((x) => x.id === r || x.class === r) || hands.some((h) => h.id === r) : journeyEvents.has(r);
        if (!ok) err("measurement_journey_outcome_missing", j.id, `journeyOutcome ref "${r}" is not a ${m.journeyOutcome.type} of this journey`);
      }
      if (m.businessOutcome) {
        const b = m.businessOutcome;
        if (!registered.has(b.event)) err("measurement_event_not_registered", j.id, `businessOutcome event "${b.event}" is not registered`);
        const chain = b.observationScope?.type === "handoff-chain" ? b.observationScope.journeys : [];
        let prev = j; let chainOk = true;
        for (const cj of chain) {
          const target = byJourney[cj];
          if (!target) { err("downstream_measurement_unreachable", j.id, `handoff-chain names "${cj}", which is not a journey`); chainOk = false; break; }
          const links = prev.nodes.some((n) => n.kind === "handoff" && n.to === cj);
          if (!links) { err("downstream_measurement_unreachable", j.id, `"${prev.id}" declares no handoff to "${cj}"`); chainOk = false; break; }
          prev = target;
        }
        const scopeEvents = new Set([...journeyEvents]);
        for (const cj of chain) { const t = byJourney[cj]; if (t) { const tt = t.nodes.find((n) => n.kind === "trigger"); [tt?.event, ...t.nodes.filter((n) => n.kind === "wait").flatMap((w) => w.until), ...t.nodes.filter((n) => n.kind === "condition").flatMap((c) => c.branches.map((x) => x.observes).filter(Boolean))].filter(Boolean).forEach((e) => scopeEvents.add(e)); } }
        if (chainOk && !scopeEvents.has(b.event)) err(b.observationScope?.type === "self" ? "measurement_self_event_missing" : "downstream_measurement_unreachable", j.id, `businessOutcome event "${b.event}" appears in neither this journey's graph nor the declared chain`);
        if (b.window?.type === "through-handoff" && !registered.has(b.window.until)) err("measurement_event_not_registered", j.id, `window.until "${b.window.until}" is not registered`);
        if (b.comparison === "persistent-holdout" && !b.holdout) err("measurement_holdout_missing", j.id, "persistent-holdout without a holdout Config");
        if (!["entered-before-event", "touched-before-event"].includes(b.attribution)) err("measurement_attribution_missing", j.id, "attribution not set");
        // message after success: a wait that ends on the outcome event must not go straight to a send
        for (const w of waits) if (w.until.includes(b.event)) { const nx = byId[w.onEvent]; if (nx && nx.kind === "action" && nx.execution === "communication") err("message_after_success", j.id, `wait "${w.id}" ends on the business outcome and goes straight to send "${nx.id}"`); }
      }
      if (!m.guardrails?.length) err("measurement_guardrails_missing", j.id, "no guardrails");
    }

    // ---- engagement as progression (all journeys)
    for (const w of waits) for (const u of w.until) if (ENGAGEMENT.test(registry.find((e) => e.id === u)?.meaning ?? u)) warn("engagement_as_progression", j.id, `wait "${w.id}" advances on an engagement signal: "${u}"`);
    for (const c of conds) for (const b of c.branches) if (ENGAGEMENT.test(b.when) && !/is not|not (recorded|counted|a return|returning)/i.test(b.when)) warn("engagement_as_progression", j.id, `condition "${c.id}" branch "${b.label}" tests an engagement signal`);

    // ---- discovery
    if (isCustomer) {
      if (!j.discovery?.aliases?.length) sev("alias_missing", "customer journey with no discovery.aliases");
      for (const p of j.discovery?.presets ?? []) {
        if (!p.aliases?.length) err("alias_missing", j.id, `preset "${p.id}" has no aliases`);
        if (!p.applicableWhen?.label) err("suppression_unlabelled", j.id, `preset "${p.id}" applicableWhen has no label`);
        const configKeys = new Set([...waits.map((w) => isConfig(w.timeout?.after) ? w.timeout.after.key : null), j.contact?.localCap?.value?.key, j.contact?.cooldown?.key, j.measurement?.businessOutcome?.holdout?.key, ...j.nodes.filter((n) => n.kind === "action" && n.attemptBudget).map((n) => n.attemptBudget.key)].filter(Boolean));
        for (const k of Object.keys(p.overrides ?? {})) if (k !== "channelStrategy.roles" && !configKeys.has(k)) err("preset_changes_graph", j.id, `preset "${p.id}" overrides "${k}", which is not a Config key of this journey`);
      }
    }

    // ---- orchestration (orchestrated customer journeys - sends a message, routes to a human, or both)
    if (orchestrated || j.orchestration) {
      const o = j.orchestration;
      if (!o) { if (orchestrated) sev("orch_missing", "orchestrated customer journey has no orchestration"); }
      else {
        if (!o.touches?.length) err("orch_missing", j.id, "orchestration has no touches");
        const touched = new Set();
        let prevTouch = null;
        const cs = j.channelStrategy;
        if (!cs) err("channel_strategy_missing", j.id, "orchestration without channelStrategy");
        else {
          if (!cs.label || !LABELS.includes(cs.label)) err("suppression_unlabelled", j.id, "channelStrategy has no label");
          const roleWhen = {};
          for (const r of cs.roles ?? []) {
            if (!ROLES.includes(r.role)) err("channel_role_undeclared", j.id, `channelStrategy role "${r.role}" is not a role`);
            if (!r.channels?.length || r.channels.some((c) => !j.channels.includes(c))) err("role_no_eligible_channel", j.id, `role "${r.role}" maps to channels outside journey.channels or to none`);
            if (roleWhen[r.when]) err("touch_channel_role_ambiguous", j.id, `roles "${roleWhen[r.when]}" and "${r.role}" share the same when condition`);
            roleWhen[r.when] = r.role;
            if (NUM_UNIT.test(r.when)) err("orch_timing_duplicate", j.id, `channelStrategy role "${r.role}" when-condition contains a number`);
          }
          if (cs.simultaneous && !cs.simultaneous.reason) err("simultaneous_without_reason", j.id, "simultaneous sends allowed with no reason");
        }
        const declaredRoles = new Set((cs?.roles ?? []).map((r) => r.role));
        const gateGroups = {};
        for (const t of o.touches ?? []) {
          const act = byId[t.action];
          if (!act || act.kind !== "action" || !act.execution) err("orch_touch_not_in_graph", j.id, `touch "${t.id}" action "${t.action}" is not a communication/human action`);
          else touched.add(t.action);
          if (t.gatedBy && (!byId[t.gatedBy] || byId[t.gatedBy].kind !== "wait")) err("orch_touch_not_in_graph", j.id, `touch "${t.id}" gatedBy "${t.gatedBy}" is not a wait`);
          for (const p of t.prerequisites ?? []) if (!byId[p]) err("orch_touch_not_in_graph", j.id, `touch "${t.id}" prerequisite "${p}" does not exist`);
          // path: entry -> t1 ; t_prev.action -> (gatedBy) -> t.action
          if (act) {
            const prev = t.after ? (o.touches ?? []).find((x) => x.id === t.after) : null;
            if (t.after && !prev) err("orch_touch_not_in_graph", j.id, `touch "${t.id}" follows "${t.after}", which is not a touch`);
            const from = prev ? prev.action : j.entry;
            if (!reachable(byId, from, t.action, t.gatedBy)) err("orch_path_broken", j.id, `touch "${t.id}" is not reachable from ${prev ? `touch "${prev.id}"` : "the entry"}${t.gatedBy ? ` through wait "${t.gatedBy}"` : ""} - orchestration and graph have drifted`);
          }
          if (t.gatedBy && byId[t.gatedBy]?.kind === "wait") {
            const w = byId[t.gatedBy];
            const hasCondPrereq = (t.prerequisites ?? []).some((p) => byId[p]?.kind === "condition");
            if (!w.recheck && !hasCondPrereq) err("touch_no_recheck", j.id, `touch "${t.id}" follows wait "${t.gatedBy}" with no recheck and no condition prerequisite - it can send stale communication`);
          }
          if (act && CTA.test(act.does) && act.execution === "communication" && !t.destination) warn("touch_no_destination", j.id, `touch "${t.id}" has a call to action and no destination`);
          if (t.destination && (!t.destination.target || !t.destination.boundTo)) err("touch_no_destination", j.id, `touch "${t.id}" destination lacks target or boundTo`);
          if (!t.label || !LABELS.includes(t.label)) err("suppression_unlabelled", j.id, `touch "${t.id}" has no label`);
          if (t.label === "CANONICAL_RULE" && t.after) {
            // a canonical touch may not DEPEND on an optional one: walking `after` links must not pass an OPTIONAL_STRATEGY touch
            let p = (o.touches ?? []).find((x) => x.id === t.after);
            while (p) { if (p.label === "OPTIONAL_STRATEGY") { err("touch_optional_as_canonical", j.id, `touch "${t.id}" is CANONICAL_RULE but depends on optional touch "${p.id}"`); break; } p = p.after ? (o.touches ?? []).find((x) => x.id === p.after) : null; }
          }
          if (NUM_UNIT.test(t.purpose ?? "")) err("orch_timing_duplicate", j.id, `touch "${t.id}" purpose states a number - timing lives on the wait`);
          if (CHANNEL_WORD.test(t.purpose ?? "") || CHANNEL_WORD.test(t.destination?.target ?? "")) err("duplicate_source_of_truth", j.id, `touch "${t.id}" names a channel in purpose/destination - channels live in channelStrategy`);
          if (act && CHANNEL_WORD.test(act.does) && !/nowhere else|the destination (itself|being replaced)|every verified destination/i.test(act.does)) warn("duplicate_source_of_truth", j.id, `action "${act.id}" names a channel in its text while the touch owns channel roles`);
          if (!t.channelRoles?.length) err("touch_channel_role_ambiguous", j.id, `touch "${t.id}" lists no channel roles`);
          else {
            if (new Set(t.channelRoles).size !== t.channelRoles.length) err("touch_channel_role_ambiguous", j.id, `touch "${t.id}" repeats a channel role`);
            for (const r of t.channelRoles) if (!declaredRoles.has(r)) err("channel_role_undeclared", j.id, `touch "${t.id}" uses role "${r}", which channelStrategy does not declare`);
          }
          const pr = t.priority ?? j.contact?.defaultPriority;
          if (!pr || !PRIORITIES.includes(pr)) err("touch_priority_unresolved", j.id, `touch "${t.id}" resolves to no priority`);
          if (t.priority) {
            if (!t.priorityReason) err("invalid_priority_override", j.id, `touch "${t.id}" overrides priority without a priorityReason`);
            if (t.priority === j.contact?.defaultPriority) err("invalid_priority_override", j.id, `touch "${t.id}" overrides priority to the journey default`);
          }
          const dp = j.contact?.defaultPriority;
          if ((t.mandatory || ["transactional", "security"].includes(t.priority ?? "")) && ["promotional", "lifecycle"].includes(dp ?? "") && !t.priorityReason) err("mandatory_promotional_conflict", j.id, `touch "${t.id}" is mandatory/transactional inside a ${dp} journey with no documented reason`);
          if (t.mandatory && j.contact?.localCap?.appliesTo === "all") err("mandatory_cap_conflict", j.id, `touch "${t.id}" is mandatory but localCap applies to all touches`);
          const gk = `${t.gatedBy ?? "-"}|${(t.prerequisites ?? []).join(",")}`;
          (gateGroups[gk] ??= []).push(t.id);
          for (const p of t.prerequisites ?? []) { const pn = byId[p]; if (pn?.kind === "condition" && DELIVERY_FAIL.test(pn.asks + " " + pn.branches.map((b) => b.when).join(" "))) err("fallback_as_touch", j.id, `touch "${t.id}" is gated on a delivery-failure condition "${p}" - delivery fallback is channelStrategy.fallback, not a touch`); }
          prevTouch = t;
        }
        for (const [gk, ts] of Object.entries(gateGroups)) if (ts.length > 1 && gk !== "-|" && !cs?.simultaneous) warn("simultaneous_review", j.id, `touches ${ts.join(", ")} share the same gate and prerequisites - confirm they are exclusive branches, or declare channelStrategy.simultaneous`);
        for (const a of sendActs) if (!touched.has(a.id)) err("orch_action_untouched", j.id, `communication action "${a.id}" is referenced by no touch`);
        if (!o.noAction?.length) err("no_action_missing", j.id, "orchestration.noAction is empty - a communication journey must be able to send nothing");
        const supIds = new Set((j.suppressions ?? []).map((s) => s.id));
        for (const r of o.noAction ?? []) if (!supIds.has(r)) err("no_action_missing", j.id, `noAction reason "${r}" is not a suppression id`);
        if (!exits.some((x) => x.class === "no-action") && !(j.suppressions ?? []).length) err("no_action_missing", j.id, "no no-action exit and no suppressions");
        // contact
        const c = j.contact;
        if (!c) err("contact_missing", j.id, "orchestrated journey without contact block");
        else {
          if (!PRIORITIES.includes(c.defaultPriority)) err("touch_priority_unresolved", j.id, "contact.defaultPriority invalid");
          if (["transactional", "security"].includes(c.defaultPriority) && c.pressureClass !== "none") err("pressure_class_conflict", j.id, "transactional/security journey with a pressure class");
          if (!c.localCap || !isConfig(c.localCap.value) || !["non-mandatory", "all"].includes(c.localCap.appliesTo)) err("local_cap_semantics_missing", j.id, "localCap needs a Config value and appliesTo");
          if (!isConfig(c.cooldown)) err("cooldown_missing", j.id, "contact.cooldown is not a Config");
          if (c.competition === undefined) err("competition_undeclared", j.id, "contact.competition must be a competition or \"none\"");
          if (NUM_UNIT.test(c.cooldown?.rule ?? "")) err("canonical_rule_contains_number", j.id, "cooldown rule contains a number");
        }
      }
    } else if (!orchestrated && (j.orchestration || j.channelStrategy || j.contact)) {
      err("silent_with_communication_metadata", j.id, "a silent or non-customer journey carries orchestration/channelStrategy/contact");
    }

    // ---- numbers inside canonical prose on vNext journeys
    if (vnext) {
      if (NUM_UNIT.test(j.reusableRule ?? "")) warn("canonical_rule_contains_number", j.id, "reusableRule contains a number with a unit - review");
      for (const g of j.guardrails ?? []) if (NUM_UNIT.test(g)) warn("canonical_rule_contains_number", j.id, `guardrail contains a number: "${g.slice(0, 60)}"`);
    }
  }

  // ---- surface drift
  if (surfaceFile) {
    const t = surfaceFile.totals;
    const mism = ["customer", "customer-silent", "customer-communicating", "mechanism", "operational"].filter((k) => t[k] !== counts[k]);
    if (mism.length) err("surface_count_drift", "corpus", `surface-assignment.json says ${mism.map((k) => `${k}=${t[k]}`).join(", ")} but the corpus derives ${mism.map((k) => `${k}=${counts[k]}`).join(", ")} - rerun scripts/surface-assignment.mjs`);
  }
  return { counts, vnext: stats.vnext };
}
