/**
 * Design-independent production model for one canonical journey. Mirrors
 * journey-view-model.schema.json and src/canonical/types.ts's CanonicalJourney
 * field-for-field for identity/entry/graph/relationships/governance; `derived`
 * is deterministically computed, never authored. A design adapter consumes
 * this shape — no color, spacing, typography, or component name belongs here.
 */

export type NodeKind = "trigger" | "action" | "condition" | "wait" | "outcome" | "exit" | "handoff";

export type EdgeFamily =
  | "forward" | "branch" | "wait-event" | "wait-timeout"
  | "backward" | "cross-journey-handoff" | "external";

export type EvidenceSource = "authoritative" | "declared" | "behavioral" | "inferred";

export type PrimaryStructure = "router" | "self-contained" | "mixed-termination";

export type JourneyBehavior =
  | "backward-edge" | "wait-timeout" | "cross-journey-handoff" | "external-handoff"
  | "multi-exit" | "preemption" | "competition" | "no-re-entry";

export type ComplexityTier = "simple" | "medium" | "complex" | "extreme";

export interface GraphNode {
  id: string;
  kind: NodeKind;
  headline: string;
  detail: string | null;
  isEntry: boolean;
  /** True only for the rare exit whose state itself forbids re-entry (5/433 exits). */
  terminal: boolean;
}

export interface GraphEdge {
  from: string;
  to: string;
  family: EdgeFamily;
  label: string | null;
  when: string | null;
}

export interface JourneyIdentity {
  id: string; // "XXX-##"
  slug: string;
  category: string;
  categoryTitle: string;
  title: string; // = CanonicalJourney.name
  purpose: string;
}

export interface JourneyEntry {
  trigger: string; // humanized event label
  triggerEvidenceClass: EvidenceSource;
  requires: string[];
  insufficientAlone: string[];
}

export interface JourneyGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  startNode: string;
  /** Every node with no outgoing edge within this journey — exit and handoff nodes. */
  terminalNodes: string[];
  backwardEdgeIds: number[];
  branchEdgeIds: number[];
  handoffEdgeIds: number[];
  externalEdgeIds: number[];
}

export interface DistinctFrom {
  journey: string;
  because: string;
}

export interface Competition {
  scope: string;
  exclusionGroup: string;
  precedence: string;
  onLoss: "suppressed" | "paused" | "superseded" | "exit";
}

export interface Preemption {
  event: string;
  then: string;
}

export interface JourneyRelationships {
  handoffs: { to: string; isExternal: boolean }[];
  distinctFrom: DistinctFrom[];
  competition: Competition | null;
  preemptedBy: Preemption[];
}

export interface JourneyGovernance {
  guardrails: string[];
  reusableRule: string;
  entityScope: string;
  entityNote: string;
}

export interface JourneyDerived {
  hasBranches: boolean;
  hasBackwardEdges: boolean;
  /** Stricter than hasBackwardEdges — a real DFS-detected cycle. */
  hasTrueCycle: boolean;
  hasExternalHandoff: boolean;
  hasCrossJourneyHandoff: boolean;
  hasWait: boolean;
  /** True only if >=1 exit is terminal:true (5/255 journeys). */
  hasReEntryException: boolean;
  hasTerminalExit: boolean;
  hasMultipleExits: boolean;
  hasPreemption: boolean;
  hasCompetition: boolean;
  nodeCount: number;
  edgeCount: number;
  branchNodeCount: number;
  backwardEdgeCount: number;
  handoffCount: number;
  exitCount: number;
  maxDepth: number;
  maxFanIn: number;
  maxFanOut: number;
  /** Mutually exclusive — derived from termination pattern only. */
  primaryStructure: PrimaryStructure;
  /** 0..N independent tags — deliberately a separate axis from primaryStructure. */
  behaviors: JourneyBehavior[];
  /** Thresholds derived from the real p33/p66/p90 of complexityScore across all 255 journeys. */
  complexityTier: ComplexityTier;
  complexityScore: number;
}

export interface JourneyViewModel {
  identity: JourneyIdentity;
  entry: JourneyEntry;
  graph: JourneyGraph;
  relationships: JourneyRelationships;
  governance: JourneyGovernance;
  derived: JourneyDerived;
}

/** One row of journey-manifest.json — production readiness, kept as
 * independent booleans rather than a single collapsed enum. */
export interface JourneyManifestEntry {
  id: string;
  slug: string;
  category: string;
  primaryStructure: PrimaryStructure;
  behaviors: JourneyBehavior[];
  complexityTier: ComplexityTier;
  complexityScore: number;
  nodeCount: number;
  edgeCount: number;
  hasTrueCycle: boolean;
  semanticReady: boolean;
  graphValid: boolean;
  renderContractSupported: boolean;
  contentComplete: boolean;
  productionReady: boolean;
}

/** One row of journey-list-projection.json — the lightweight search/filter
 * payload. No graph, no governance text — see build_manifest_projection.py's
 * size comparison against the full canonical dump. */
export interface JourneyListProjectionEntry {
  id: string;
  slug: string;
  title: string;
  category: string;
  categoryTitle: string;
  triggerLabel: string | null;
  searchableAliases: string[];
  /** Present only on the 5 merged-redirect rows. */
  mergedInto?: string;
}
