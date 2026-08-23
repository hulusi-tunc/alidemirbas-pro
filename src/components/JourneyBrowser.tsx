"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";

import { FacetCheckbox, FacetGroup, FacetRadio } from "@/components/ui/Facets";
import type {
  CategoryFacet,
  EvidenceSource,
  JourneyRow,
  MergedRedirect,
} from "@/lib/canonical-view";
import type { Goal, LifecycleStage } from "@/lib/journey-taxonomy";
import { GOALS, LIFECYCLE_STAGES } from "@/lib/journey-taxonomy";
import type { copy, Lang } from "@/lib/content";

/* The list. It takes rows as props and imports nothing from the canonical
   library, so the browser downloads one-line rows rather than node graphs;
   a journey's graph arrives on that journey's own route.

   Four facets, in the order the filter taxonomy audit recommended
   (production/journey-filter-taxonomy-audit.md): Category first (26
   balanced values, the strongest single differentiator), Goal/Use Case
   second (20 values, genuinely cross-cutting - checkbox, since asking
   for two goals at once is a real question), Lifecycle Stage third
   (real but secondary - only 4 of 26 categories are lifecycle-anchored,
   the other 85% of the library is "cross-lifecycle" by design, so this
   is a checkbox too rather than a prominent radio), and Trigger evidence
   last - the pre-existing facet from before the audit, for what the
   trigger is allowed to conclude. */

const EVIDENCE_SOURCES: readonly EvidenceSource[] = [
  "authoritative",
  "declared",
  "behavioral",
  "inferred",
];

const EVIDENCE_DOT: Record<EvidenceSource, string> = {
  authoritative: "bg-blue-600",
  declared: "bg-emerald-600",
  behavioral: "bg-amber-500",
  inferred: "bg-violet-500",
};

const STAGE_LABEL: Record<LifecycleStage, { en: string; tr: string }> = {
  "acquisition-qualification": { en: "Acquisition & qualification", tr: "Edinme ve nitelendirme" },
  "activation-onboarding": { en: "Activation & onboarding", tr: "Aktivasyon ve katılım" },
  "engagement-retention": { en: "Engagement & retention", tr: "Etkileşim ve elde tutma" },
  "ending-closure": { en: "Ending & closure", tr: "Sonlanma ve kapanış" },
  "cross-lifecycle": { en: "Cross-lifecycle", tr: "Yaşam döngüsünden bağımsız" },
};

const GOAL_LABEL: Record<Goal, { en: string; tr: string }> = {
  "eligibility-qualification": { en: "Eligibility & qualification", tr: "Uygunluk ve nitelendirme" },
  "consent-permission": { en: "Consent & permission", tr: "Onay ve izin" },
  "identity-verification": { en: "Identity verification", tr: "Kimlik doğrulama" },
  "expiry-renewal": { en: "Expiry & renewal", tr: "Süre dolumu ve yenileme" },
  "cancellation-termination": { en: "Cancellation & termination", tr: "İptal ve sonlandırma" },
  "suspension-restoration": { en: "Suspension & restoration", tr: "Askıya alma ve geri yükleme" },
  "revocation-access-change": { en: "Revocation & access change", tr: "Yetki iptali ve erişim değişikliği" },
  "ownership-transfer": { en: "Ownership transfer", tr: "Sahiplik devri" },
  "merge-consolidation": { en: "Merge & consolidation", tr: "Birleştirme ve konsolidasyon" },
  "reconciliation-correction": { en: "Reconciliation & correction", tr: "Mutabakat ve düzeltme" },
  "recovery-retry": { en: "Recovery & retry", tr: "Kurtarma ve yeniden deneme" },
  "escalation-exception": { en: "Escalation & exception", tr: "Eskalasyon ve istisna" },
  "delivery-confirmation": { en: "Delivery & confirmation", tr: "Teslimat ve onay" },
  "compensation-remedy": { en: "Compensation & remedy", tr: "Tazminat ve telafi" },
  "change-versioning": { en: "Change & versioning", tr: "Değişiklik ve sürümleme" },
  "scheduling-commitment": { en: "Scheduling & commitment", tr: "Zamanlama ve taahhüt" },
  "decision-approval": { en: "Decision & approval", tr: "Karar ve onay" },
  "risk-compliance": { en: "Risk & compliance", tr: "Risk ve uyum" },
  "data-integrity": { en: "Data integrity", tr: "Veri bütünlüğü" },
  "progression-milestone": { en: "Progression & milestone", tr: "İlerleme ve kilometre taşı" },
  "review-required": { en: "Not yet categorized", tr: "Henüz kategorize edilmedi" },
};

export default function JourneyBrowser({
  lang,
  t,
  rows: allRows,
  categories,
  merged,
  basePath,
}: {
  lang: Lang;
  t: (typeof copy)[Lang]["lab"]["page"];
  rows: readonly JourneyRow[];
  categories: readonly CategoryFacet[];
  merged: readonly MergedRedirect[];
  basePath: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [goal, setGoal] = useState<Goal[]>([]);
  const [stage, setStage] = useState<LifecycleStage[]>([]);
  const [evidence, setEvidence] = useState<EvidenceSource[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  /* Each facet is a separate predicate so the counts can leave its own one
     out. A category's count is "how many would I get if I picked this",
     which is only true if the category filter is not already applied to it. */
  const { rows, categoryCounts, goalCounts, stageCounts, evidenceCounts, mergedHit } = useMemo(() => {
    const q = query.trim().toLocaleLowerCase(lang);
    const byQuery = (j: JourneyRow) =>
      !q ||
      [j.id, j.name, j.purpose, j.categoryTitle]
        .join(" ")
        .toLocaleLowerCase(lang)
        .includes(q);
    const byCategory = (j: JourneyRow) => !category || j.category === category;
    // Goal, Stage and Evidence read as "any of these", not "all of them" -
    // one journey has exactly one value for each, so "all" would always
    // return nothing once two or more are selected.
    const byGoal = (j: JourneyRow) => goal.length === 0 || goal.includes(j.goal);
    const byStage = (j: JourneyRow) => stage.length === 0 || stage.includes(j.lifecycleStage);
    const byEvidence = (j: JourneyRow) => evidence.length === 0 || evidence.includes(j.evidence);

    const forCategoryFacet = allRows.filter((j) => byQuery(j) && byGoal(j) && byStage(j) && byEvidence(j));
    const forGoalFacet = allRows.filter((j) => byQuery(j) && byCategory(j) && byStage(j) && byEvidence(j));
    const forStageFacet = allRows.filter((j) => byQuery(j) && byCategory(j) && byGoal(j) && byEvidence(j));
    const forEvidenceFacet = allRows.filter((j) => byQuery(j) && byCategory(j) && byGoal(j) && byStage(j));
    const matched = allRows.filter(
      (j) => byQuery(j) && byCategory(j) && byGoal(j) && byStage(j) && byEvidence(j),
    );

    /* A merged id is not a journey and matches nothing, which would leave
       someone holding an old reference at a dead end. Answer with the journey
       that absorbed it instead, and say which id they typed. */
    const hit = merged.find((m) => m.from.toLocaleLowerCase(lang) === q) ?? null;
    const survivor = hit ? allRows.filter((j) => j.id === hit.to) : null;

    return {
      rows: survivor ?? matched,
      mergedHit: hit,
      categoryCounts: Object.fromEntries(
        categories.map((c) => [c.id, forCategoryFacet.filter((j) => j.category === c.id).length]),
      ) as Record<string, number>,
      goalCounts: Object.fromEntries(
        GOALS.map((g) => [g, forGoalFacet.filter((j) => j.goal === g).length]),
      ) as Record<Goal, number>,
      stageCounts: Object.fromEntries(
        LIFECYCLE_STAGES.map((s) => [s, forStageFacet.filter((j) => j.lifecycleStage === s).length]),
      ) as Record<LifecycleStage, number>,
      evidenceCounts: Object.fromEntries(
        EVIDENCE_SOURCES.map((s) => [s, forEvidenceFacet.filter((j) => j.evidence === s).length]),
      ) as Record<string, number>,
    };
  }, [query, category, goal, stage, evidence, lang, allRows, categories, merged]);

  const activeCount =
    (category ? 1 : 0) + goal.length + stage.length + evidence.length + (query.trim() ? 1 : 0);
  const clearAll = () => {
    setQuery("");
    setCategory("");
    setGoal([]);
    setStage([]);
    setEvidence([]);
  };
  const toggle = <T,>(cur: T[], setFn: (v: T[]) => void, value: T) =>
    setFn(cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value]);

  const facetPanel = (
    <div className="space-y-8">
      <FacetGroup
        title={t.categoryLabel}
        moreLabel={t.showMore}
        lessLabel={t.showLess}
        initialVisible={8}
      >
        {[
          <FacetRadio
            key="__all"
            label={t.allCategories}
            count={allRows.length}
            selected={category === ""}
            onSelect={() => setCategory("")}
          />,
          ...categories.map((c) => (
            <FacetRadio
              key={c.id}
              label={c.title}
              count={categoryCounts[c.id] ?? 0}
              selected={category === c.id}
              onSelect={() => setCategory(category === c.id ? "" : c.id)}
            />
          )),
        ]}
      </FacetGroup>

      <FacetGroup title={t.goalLabel} moreLabel={t.showMore} lessLabel={t.showLess} initialVisible={8}>
        {GOALS.map((g) => (
          <FacetCheckbox
            key={g}
            label={GOAL_LABEL[g][lang]}
            count={goalCounts[g] ?? 0}
            selected={goal.includes(g)}
            onSelect={() => toggle(goal, setGoal, g)}
          />
        ))}
      </FacetGroup>

      <div>
        <FacetGroup title={t.lifecycleStageLabel} moreLabel={t.showMore} lessLabel={t.showLess}>
          {LIFECYCLE_STAGES.map((s) => (
            <FacetCheckbox
              key={s}
              label={STAGE_LABEL[s][lang]}
              count={stageCounts[s] ?? 0}
              selected={stage.includes(s)}
              onSelect={() => toggle(stage, setStage, s)}
            />
          ))}
        </FacetGroup>
        <p className="mt-2 text-xs leading-relaxed text-neutral-500">{t.lifecycleStageHint}</p>
      </div>

      <FacetGroup title={t.evidenceLabel} moreLabel={t.showMore} lessLabel={t.showLess}>
        {EVIDENCE_SOURCES.map((s) => (
          <FacetCheckbox
            key={s}
            label={t.evidence[s]}
            count={evidenceCounts[s] ?? 0}
            dot={EVIDENCE_DOT[s]}
            selected={evidence.includes(s)}
            onSelect={() => toggle(evidence, setEvidence, s)}
          />
        ))}
      </FacetGroup>
    </div>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-12">
      {/* facets - a sidebar from lg up, a disclosure below it, where a
          twenty-row filter list above the results would bury them */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <button
          type="button"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
          className="flex w-full items-center justify-between border border-line bg-paper px-4 py-2.5 text-sm font-medium text-ink-900 transition-colors hover:border-neutral-400 lg:hidden"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal aria-hidden className="size-4 text-neutral-500" />
            {t.filtersLabel}
            {activeCount > 0 ? <span className="text-blue-600">({activeCount})</span> : null}
          </span>
          <ChevronDown
            aria-hidden
            className={`size-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
          />
        </button>
        <div className={`${filtersOpen ? "mt-6 block" : "hidden"} lg:mt-0 lg:block`}>{facetPanel}</div>
      </aside>

      <div className="min-w-0">
        <div className="flex items-center gap-3 border border-line bg-paper px-4 py-2.5 focus-within:border-blue-600">
          <Search aria-hidden className="size-4 shrink-0 text-neutral-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-neutral-500"
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-ink-500 tabular-nums">
            {rows.length} / {allRows.length} {t.results}
          </p>
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              <X aria-hidden className="size-3.5" />
              {t.clearAll}
            </button>
          ) : null}
        </div>

        {mergedHit ? (
          <p className="mt-4 border border-line bg-paper-soft px-4 py-3 text-[13px] leading-snug text-ink-600">
            {t.mergedNote.replace("{from}", mergedHit.from).replace("{to}", mergedHit.to)}
          </p>
        ) : null}

        {rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-neutral-500">{t.empty}</p>
        ) : (
          <div className="mt-4">
            {rows.map((j) => (
              <Link
                key={j.id}
                href={`${basePath}/${j.slug}`}
                className="group grid w-full grid-cols-1 items-start gap-3 border-t border-line py-6 text-left transition-colors last:border-b hover:bg-paper-soft sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:gap-6"
              >
                <span className="font-mono text-xs text-neutral-500 tabular-nums">{j.id}</span>
                <div className="min-w-0">
                  <p className="text-[15px] leading-snug font-medium tracking-tight text-ink-950">
                    {j.name}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-500">
                    {j.categoryTitle}
                    {j.competesIn ? ` · ${j.competesIn}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
                  <span
                    className="flex items-center gap-1.5 border border-line px-2 py-1 text-xs text-ink-600"
                    title={t.evidenceHint}
                  >
                    <span aria-hidden className={`size-1.5 rounded-full ${EVIDENCE_DOT[j.evidence]}`} />
                    {t.evidence[j.evidence]}
                  </span>
                  <span className="border border-line px-2 py-1 text-xs text-ink-500 tabular-nums">
                    {j.nodeCount} {t.nodesLabel}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
