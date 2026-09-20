/* Builds one self-contained input file per audit subagent, so each one reads a
   small JSON instead of grepping 225KB TS domain files. Read-only. */
import fs from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname;
const dump = JSON.parse(fs.readFileSync(ROOT + "production/canonical-dump.json", "utf8"));
const manifest = JSON.parse(fs.readFileSync(ROOT + "audit/manifest.json", "utf8"));
const display = JSON.parse(fs.readFileSync(ROOT + "audit/display-before.json", "utf8"));
const journeys = new Map((dump.journeys ?? dump).map((j) => [j.id, j]));
const displayById = new Map(display.map((d) => [d.journey_id, d]));

const SLICES = Number(process.argv[2] ?? 6);
fs.mkdirSync(ROOT + "audit/slices", { recursive: true });

const buckets = Array.from({ length: SLICES }, () => []);
manifest.journeys.forEach((m, i) => buckets[i % SLICES].push(m));

buckets.forEach((bucket, n) => {
  const payload = bucket.map((m) => {
    const j = journeys.get(m.journey_id);
    const d = displayById.get(m.journey_id);
    return {
      journey_id: m.journey_id,
      slug: m.slug,
      shortName: j.shortName ?? j.name,
      name: j.name,
      purpose: j.purpose,
      objective: j.objective ?? null,
      goal: j.goal,
      channels: j.channels,
      journey_types: m.journey_types,
      entity: j.entity ?? null,
      eligibility: j.eligibility ?? null,
      suppressions: (j.suppressions ?? []).map((s) => ({ id: s.id, label: s.label, text: s.text })),
      channelStrategy: j.channelStrategy ?? null,
      orchestration: j.orchestration
        ? { strategy: j.orchestration.strategy, touches: j.orchestration.touches.map((t) => ({ id: t.id, stage: t.stage, action: t.action, after: t.after ?? null, gatedBy: t.gatedBy ?? null, prerequisites: t.prerequisites ?? [], purpose: t.purpose, channelRoles: t.channelRoles ?? [] })) }
        : null,
      entry: j.entry,
      canonical_nodes: j.nodes.map((n) => ({
        id: n.id,
        kind: n.kind,
        ...(n.kind === "trigger" ? { event: n.event, evidence_source: n.evidence?.source, next: n.next } : {}),
        ...(n.kind === "action" ? { does: n.does, execution: n.execution ?? null, writes: (n.writes ?? []).map((w) => w.field), next: n.next } : {}),
        ...(n.kind === "condition" ? { asks: n.asks, branches: n.branches.map((b) => ({ label: b.label, when: b.when, to: b.to })) } : {}),
        ...(n.kind === "wait" ? { until: n.until, onEvent: n.onEvent, onTimeout: n.onTimeout, timeout_key: n.timeout?.after?.key ?? null, timeout_default: n.timeout?.after?.default?.value ?? null, relativeTo: n.timeout?.relativeTo ?? null } : {}),
        ...(n.kind === "exit" ? { state: n.state, class: n.class ?? null, terminal: n.terminal ?? false } : {}),
        ...(n.kind === "handoff" ? { to: n.to, on: n.on } : {}),
        ...(n.kind === "outcome" ? { state: n.state, next: n.next } : {}),
      })),
      measured_display: {
        en: d?.locales?.en ? { display_nodes: d.locales.en.display_nodes, distinct_canonical: d.locales.en.distinct_canonical_nodes, terminal_instances: d.locales.en.terminal_instances, internal_cards: d.locales.en.internal_cards, long_cards: d.locales.en.long_cards, long_branch_labels: d.locales.en.long_branch_labels } : null,
        tr: d?.locales?.tr ? { display_nodes: d.locales.tr.display_nodes, internal_cards: d.locales.tr.internal_cards, long_cards: d.locales.tr.long_cards, locale_leaks: d.locales.tr.locale_leaks } : null,
      },
    };
  });
  fs.writeFileSync(`${ROOT}audit/slices/slice-${n + 1}.json`, JSON.stringify(payload, null, 2) + "\n");
  console.log(`slice-${n + 1}.json: ${payload.length} journeys (${payload.map((p) => p.slug).join(", ")})`);
});
