/* vNext readiness scorers - three standards, one per product surface kind.
   Reads production/canonical-dump.json and production/surface-assignment.json.

     node scripts/vnext-readiness.mjs                     -> production/vnext-readiness-baseline.json
     node scripts/vnext-readiness.mjs VNEXT_CUSTOMER_READINESS.json   (customer rows only, migration deliverable)

   Every dimension is 0-5 and scored from fields, never from prose length.
   The customer-communicating standard is the ADR §C list; the silent standard
   drops orchestration/channel/collision; the operational standard is §D and
   never rewards communication metadata. */
import { readFile, writeFile } from "node:fs/promises";

const dump = JSON.parse(await readFile("production/canonical-dump.json", "utf8"));
const surfaces = JSON.parse(await readFile("production/surface-assignment.json", "utf8"));
const S = Object.fromEntries(surfaces.journeys.map((r) => [r.id, r]));
const eventsSrc = await readFile("src/canonical/events.ts", "utf8");
const registered = new Set([...eventsSrc.matchAll(/\{ id: "([^"]+)"/g)].map((m) => m[1]));
const isConfig = (x) => x && typeof x === "object" && "key" in x && "rule" in x;
const clamp = (x) => Math.max(0, Math.min(5, Math.round(x)));
const CTA = /\b(open|resume|update|confirm|choose|select|complete|sign|pay|book|reschedule|verify|accept|decline|review|correct|provide|upload|claim)\b/i;
const SIDE_EFFECT = /\b(refund(s|ed)?|charge(s|d)?|debit|credit (the|a)|create (a|the) (task|ticket|case|request)|raise (the|a|it|this)|open (a|the) (ticket|case)|delete|deactivat|revoke|provision|issue (a|the))\b/i;

function score(j) {
  const s = S[j.id];
  const kind = s.surface === "customer" ? (s.silent ? "customer-silent" : "customer-communicating") : s.surface;
  const byId = Object.fromEntries(j.nodes.map((n) => [n.id, n]));
  const trig = byId[j.entry];
  const waits = j.nodes.filter((n) => n.kind === "wait");
  const exits = j.nodes.filter((n) => n.kind === "exit");
  const hands = j.nodes.filter((n) => n.kind === "handoff");
  const conds = j.nodes.filter((n) => n.kind === "condition");
  const acts = j.nodes.filter((n) => n.kind === "action");
  const sends = acts.filter((a) => a.execution === "communication");
  const vnext = !!j.measurement;
  const d = {};

  // shared
  d.trigger = clamp(({ authoritative: 4, declared: 4, behavioral: 3, inferred: 2 }[trig.evidence.source] ?? 2) + (trig.evidence.insufficientAlone?.length ? 1 : 0) + (registered.has(trig.event) ? 0 : -1));
  d.entity = clamp(2 + (j.entity.instanceKey?.length ? 2 : 0) + (j.entity.concurrency ? 1 : 0));
  d.eligibility = clamp(1 + (j.eligibility?.length ? 2 : 0) + (j.eligibility?.some((e) => /GLB-|gate|permission|consent|contactab/i.test(e)) ? 1 : 0) + (conds.length && byId[trig.next]?.kind === "condition" ? 1 : 0));
  d.suppression = clamp(1 + (j.suppressions?.length ? 2 : 0) + ((j.suppressions ?? []).every((x) => x.label) && j.suppressions?.length ? 1 : 0) + ((j.suppressions ?? []).length >= 3 ? 1 : 0));
  const untilOk = waits.length ? waits.every((w) => w.until.every((u) => registered.has(u))) : true;
  d.observability = clamp(3 + (untilOk ? 1 : 0) + (conds.some((c) => c.branches.some((b) => b.observes)) ? 1 : 0) - (conds.flatMap((c) => c.branches).filter((b) => /\b(worth|genuinely|meaningful|appropriate)\b/i.test(b.when)).length ? 1 : 0));
  const tconf = waits.map((w) => w.timeout.after);
  d.timing = !waits.length ? 4 : clamp(tconf.reduce((a, c) => a + (isConfig(c) ? (c.class ? (c.default ? 5 : c.required ? 4 : 2) : 1) : 1), 0) / tconf.length);
  d.exits = clamp(2 + (exits.every((x) => x.class) && exits.length ? 2 : 0) + (exits.some((x) => x.class === "success") || hands.length ? 1 : 0));
  d.reentry = clamp(3 + (exits.every((x) => x.reEntry?.length > 40) ? 1 : 0) + (j.entity.instanceKey?.length ? 1 : 0));
  d.implementation = clamp(1 + (j.implementation?.attributes?.required?.length ? 3 : 0) + (hands.every((h) => !h.to.startsWith("external:") || h.contract?.requiredFields?.length) ? 1 : 0));
  d.failure = clamp(2 + (hands.some((h) => /CMS-208|CON-36|OPS-124|OPS-127/.test(h.to)) ? 1 : 0) + (conds.some((c) => /fail|cannot|unknown|unreachable|invalid/i.test(c.asks + c.branches.map((b) => b.when).join(" "))) ? 1 : 0) + (acts.filter((a) => SIDE_EFFECT.test(a.does)).every((a) => a.idempotencyKey) ? 1 : 0));
  d.measurement = clamp(1 + (j.measurement?.journeyOutcome?.refs?.length ? 2 : 0) + (j.measurement?.businessOutcome ? 1 : 0) + (j.measurement?.guardrails?.length ? 1 : 0));
  d.discoverability = clamp(2 + (j.discovery?.aliases?.length ? 2 : 0) + (j.discovery?.useCases?.length ? 1 : 0));

  if (kind === "customer-communicating") {
    const o = j.orchestration;
    d.orchestration = clamp(!o ? 0 : 1 + (o.touches.length ? 1 : 0) + (o.touches.every((t) => t.purpose && t.label) ? 1 : 0) + (o.touches.every((t) => !t.gatedBy || byId[t.gatedBy]?.recheck || t.prerequisites?.some((p) => byId[p]?.kind === "condition")) ? 1 : 0) + (o.noAction?.length ? 1 : 0));
    const cs = j.channelStrategy;
    d.channelStrategy = clamp(!cs ? 0 : 1 + (cs.roles?.length ? 2 : 0) + (o?.touches?.every((t) => t.channelRoles?.length) ? 1 : 0) + (cs.fallback ? 1 : 0));
    d.behavioural = clamp(2 + Math.min(2, waits.filter((w) => byId[w.onEvent]?.kind === "condition").length) + (o?.touches?.some((t) => t.destination) ? 1 : 0));
    const c = j.contact;
    d.collision = clamp(!c ? 0 : 1 + (c.defaultPriority ? 1 : 0) + (c.competition !== undefined ? 1 : 0) + (isConfig(c.localCap?.value) ? 1 : 0) + (isConfig(c.cooldown) ? 1 : 0));
    d.destination = clamp(!o ? 0 : 5 * (o.touches.filter((t) => !CTA.test(byId[t.action]?.does ?? "") || t.destination).length / Math.max(1, o.touches.length)));
  }
  const keys = Object.keys(d);
  const total = keys.reduce((a, k) => a + d[k], 0);
  const pct = Math.round((total / (keys.length * 5)) * 100);
  return { id: j.id, shortName: j.shortName, category: j.category, surface: s.surface, kind, communicating: s.communicating, vnext, dims: d, total, max: keys.length * 5, pct, orchestration_strategy: j.orchestration?.strategy ?? null, touch_count: j.orchestration?.touches?.length ?? 0, measurement_scope: j.measurement?.businessOutcome?.observationScope?.type ?? (j.measurement ? "journey-only" : null), aliases: j.discovery?.aliases ?? [], presets: (j.discovery?.presets ?? []).map((p) => p.id) };
}

const rows = dump.journeys.map(score);
const out = process.argv[2] ?? "production/vnext-readiness-baseline.json";
const customerOnly = out !== "production/vnext-readiness-baseline.json";
const sel = customerOnly ? rows.filter((r) => r.surface === "customer") : rows;
const summary = {};
for (const k of ["customer-communicating", "customer-silent", "mechanism", "operational"]) { const v = rows.filter((r) => r.kind === k); if (v.length) summary[k] = { n: v.length, avgPct: +(v.reduce((a, r) => a + r.pct, 0) / v.length).toFixed(1), min: Math.min(...v.map((r) => r.pct)), ge80: v.filter((r) => r.pct >= 80).length, vnext: v.filter((r) => r.vnext).length }; }
await writeFile(out, JSON.stringify({ generatedFrom: ["production/canonical-dump.json", "production/surface-assignment.json", "src/canonical/events.ts"], summary, journeys: sel }, null, 1));
console.log(JSON.stringify(summary));
