import type { FlowEdge, FlowNode } from "@/lib/canonical-view";

/* Layered graph layout for the journey canvas.

   This is a small, deliberately general graph-drawing engine, not a set of
   coordinates hand-placed for ACQ-01. It reads the same FlowNode[]/FlowEdge[]
   shape canonical-view.ts already projects for every canonical
   journey - the same shape CanonicalFlow.tsx used to render as a vertical
   list, before this renderer replaced it as the single journey-detail
   experience.

   Two passes:

   1. ROW: each node's row is the length of the longest path from the entry
      to it, computed by DFS with back-edge detection over "node" edges only
      (edges to another journey or an external system end the graph here
      rather than continuing it; a real cycle - SCH-178's `a.resume` looping
      back to `w.service` - is drawn but excluded from row/column dependency,
      see the pass's own comment below). A node reached two different ways -
      the real shape of ACQ-01's merge into `a.reconcile` - lands on the row
      one below its LATEST parent, which is what makes the merge draw as two
      lines joining before continuing rather than one arrow overwriting the
      other.

   2. COLUMN: each node's column is the average of its parents' columns,
      where a parent with several children (a condition's branches) fans
      them out around its own column by branch order - the order already
      declared in the canonical data, not inferred, and spaced by each
      branch's own label width rather than a flat constant (see
      estimatedLabelWidth's and branchOffset's own comments). A single
      child of a single parent inherits the parent's column exactly, which
      is what keeps a linear run of the graph in one straight vertical line
      instead of drifting sideways for no reason. Same-row collisions are
      resolved left to right afterward, preserving each pair's own intended
      gap rather than collapsing it to a flat minimum (see that pass's own
      comment). */

export type CanvasNodeKind = FlowNode["kind"];

export type LaidOutNode = {
  node: FlowNode;
  row: number;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CanvasEdgeKind = "linear" | "branch" | "wait-event" | "wait-timeout";

export type LaidOutEdge = {
  id: string;
  from: string;
  to: string;
  kind: CanvasEdgeKind;
  label: string | null;
  /** True when the source has more than one outgoing edge to a node in this
      journey - a real fork, drawn with a jog even when the two branches
      happen to land in the same column. */
  isFork: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** Where the label chip sits - see EDGE_LABEL_OFFSET. */
  labelX: number;
  labelY: number;
  /** Set only for an edge whose target is 2+ rows from its source - the x
      of a detour lane clear of every row the edge's vertical span would
      otherwise cross. See the edge-building loop's own comment. */
  detourX?: number;
};

export type CanvasLayout = {
  nodes: LaidOutNode[];
  edges: LaidOutEdge[];
  width: number;
  height: number;
};

/* Card footprint per kind - fixed rather than measured, which is the normal
   trade-off for a first-pass graph layout with no live DOM to measure
   against. Action is widest and tallest (Level A, the strongest node);
   condition/wait are deliberately smaller (Level C, the grammar's own
   hierarchy rule). */
/* Sizes bumped ~18% over the first pass (presentation-only pass, not a
   grammar change - see the file's own top comment) for on-canvas
   readability, while preserving each kind's relative footprint (Action
   still clearly the largest, Exit/Wait still clearly the smallest). */
/* trigger/condition/handoff bumped again (2026-09 pass) to reserve room for
   a real schema-backed secondary pill each now always carries: every
   trigger has an `evidence.source`, every condition has ≥2 `branches`, every
   handoff resolves to internal-or-external - none of these are the rare
   case like Exit's `terminal` (5/436), so unlike Exit, the extra row has to
   be in every card's reserved footprint, not just the occasional one. */
/* These are the SLOTS the layout reserves. The cards overflow VISIBLY, so a
   slot shorter than its card does not clip - it lets the badge row and the
   state pill draw outside the card's own border, which reads as a rendering
   fault rather than as a missing line. That also means `scrollHeight` will
   not find it: the only measurement that does is the card's height with the
   slot released (`height: auto`), compared against the slot.

   Every number below is the worst case measured that way across all 281
   journeys, not an estimate. The tallest node in a row sets that row's
   height, so a kind's slot only costs vertical space in rows that actually
   contain it. `action` is the outlier - the widest channel-badge row in the
   library (delivery-recovery#a.retry) wraps to a second line and needs the
   full 183. Re-measure after changing anything inside
   JourneyCanvasNodes.tsx; the padding, the badges and the line-clamps all
   feed these. */
const SIZE: Record<CanvasNodeKind, { width: number; height: number }> = {
  trigger: { width: 245, height: 129 },
  action: { width: 288, height: 183 },
  condition: { width: 264, height: 139 },
  wait: { width: 260, height: 57 },
  handoff: { width: 245, height: 131 },
  outcome: { width: 245, height: 104 },
  exit: { width: 208, height: 89 },
};

/* Column spacing must clear the widest card (288px) with real room either
   side for the edge that runs between two adjacent columns - otherwise two
   branches of a fork sit close enough to visually collide, which is the
   opposite of what a fork is supposed to communicate. */
const COL_UNIT = 312;
const ROW_GAP = 104;
const PAD_X = 70;
const PAD_Y = 48;
/** How far below its source an edge's label sits - a fixed offset rather
    than the edge's true geometric midpoint, so a long edge (the merge into
    `a.reconcile` skips a whole row) still labels itself right at the fork
    instead of drifting down into whatever row happens to sit at its
    numeric midpoint. */
export const EDGE_LABEL_OFFSET = 34;
/** Estimated pixel width of a branch-label pill from its text alone (no
    live DOM to measure against at layout time), expressed in the SAME
    layout-space units as COL_UNIT/SIZE/etc - not on-screen CSS pixels.
    Everything the canvas draws lives inside the one element the initial
    zoom transform scales, so a pill measured on screen has to be divided
    back by whatever zoom was in effect before it can be compared against
    a layout constant; skipping that step was a real bug here (this
    formula's first version was fit directly against on-screen
    measurements taken at zoom ~0.7-0.76, which is why it kept
    under-shooting by roughly that same ratio on every journey rendered at
    a different zoom).

    RE-FIT 2026-09-05 for the single-Inter-family move, and WIDENED FROM
    CHARACTER COUNT TO A WEIGHTED COUNT in the same pass, because plain
    length was the thing actually failing. The previous `5.3 * length + 30`
    was fit against Manrope over two journeys' labels (8-37 characters);
    re-measured against 260 distinct labels from 48 journeys (4-57
    characters, zoom-corrected as above) it UNDER-SHOOTS 71 of them - i.e.
    the collision this function exists to prevent was already reachable
    before the font changed, on a class of label the original fit never
    saw: short all-caps ones. "UNKNOWN" is 7 characters and measures
    82.4px; the old formula returns 70. Uppercase carries far more width
    per character than lowercase, and a fit linear in raw length cannot
    cover both without wasting a third of the canvas on ordinary labels.

    So the count is weighted before the fit is applied: uppercase letters
    1.2, spaces and narrow punctuation 0.55, everything else 1.0. Over the
    same 260 labels `6.0 * weighted + 33` clears every real measurement
    with zero under-shoots; the +36 shipped here adds ~3px of headroom on
    top, because the tightest margins at +33 were inside measurement noise
    (0.6px on "An amendment"). The bias direction is unchanged and
    deliberate: overestimating wastes a little canvas width, underestimating
    produces a collision. */
const LABEL_CHAR_WEIGHT = (char: string): number => {
  if (/[A-Z]/.test(char)) return 1.2;
  if (/[ ,.'\-/]/.test(char)) return 0.55;
  return 1;
};

function estimatedLabelWidth(label: string | null): number {
  if (!label) return 70;
  let weighted = 0;
  for (const char of label) weighted += LABEL_CHAR_WEIGHT(char);
  return Math.min(360, Math.max(70, 6 * weighted + 36));
}

/** How far apart two sibling branches need to sit so their labels never
    touch - derived from what the labels actually say, not a flat spacing
    constant. A flat multiplier tuned for ACQ-01's two-branch conditions
    (its longest label needed 2.8 column-units of separation) turns
    disproportionate the moment a condition has three or four branches:
    REL-97's four branches would fan out to 3 x 2.8 = 8.4 column-units of
    total width even though its labels ("Not the same entity", "Related
    but distinct", ...) don't all need ACQ-01's worst case. Computing the
    gap from each pair's own estimated width is the general fix - it scales
    with what is actually on screen instead of the single longest label
    the constant was tuned against. */
const LABEL_GAP_MARGIN = 22;

function edgeKindFor(node: FlowNode, edge: FlowEdge): CanvasEdgeKind {
  if (node.kind === "wait") return edge.label === "on timeout" ? "wait-timeout" : "wait-event";
  if (node.kind === "condition") return "branch";
  return "linear";
}

export function layoutJourneyCanvas(nodes: readonly FlowNode[]): CanvasLayout {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const entry = nodes.find((n) => n.isEntry) ?? nodes[0];

  /* Internal edges only - an edge to another journey or an external system
     is where this journey's own graph ends, not a row to lay out. */
  type InternalEdge = { from: string; edge: FlowEdge; branchIndex: number; branchCount: number };
  const outgoing = new Map<string, InternalEdge[]>();
  const incoming = new Map<string, InternalEdge[]>();
  for (const n of nodes) {
    const internal = n.edges.filter((e) => e.kind === "node" && byId.has(e.to));
    outgoing.set(
      n.id,
      internal.map((e, i) => ({ from: n.id, edge: e, branchIndex: i, branchCount: internal.length })),
    );
    for (const rec of outgoing.get(n.id)!) {
      const list = incoming.get(rec.edge.to) ?? [];
      list.push(rec);
      incoming.set(rec.edge.to, list);
    }
  }

  /* Per-parent branch offsets, in column units, derived from each branch's
     own label width rather than a flat spacing constant (see
     estimatedLabelWidth's comment). Computed once here, keyed by
     "parentId:branchIndex", so the column pass below stays a lookup.

     DILUTION: a branch that lands on a merge target (ACQ-01's own
     `a.reconcile`, reached both directly from `c.identity` and via
     `w.identity`'s own branch) does not get its full offset - the column
     pass below AVERAGES every parent's contribution, so a merge target
     only keeps roughly 1/(incoming count) of whatever offset is requested
     here. Requesting the plain undiluted gap for a branch that will be
     averaged away produces exactly the collision this was built to
     prevent (measured directly: ACQ-01's two top branch labels landed
     ~30% short of clearing each other once `a.reconcile`'s second parent
     was accounted for). `incoming` already exists at this point, so each
     branch's own dilution is knowable up front rather than guessed - the
     gap this branch needs is scaled up by how many parents will end up
     splitting its pull. */
  const branchOffset = new Map<string, number>();
  for (const [parentId, children] of outgoing) {
    if (children.length <= 1) continue;
    const dilution = children.map((c) => Math.max(1, incoming.get(c.edge.to)?.length ?? 1));
    const widths = children.map((c) => estimatedLabelWidth(c.edge.label));
    const raw = [0];
    for (let i = 1; i < widths.length; i++) {
      // A label sits at the edge's midpoint (source column to child column),
      // so the on-screen gap between two sibling labels is only HALF of the
      // gap between their node offsets - the offsets have to be twice the
      // pixel gap the labels actually need, or two adjacent branch pills
      // end up touching even though the columns "look" separated enough.
      const gapPx = widths[i - 1] / 2 + widths[i] / 2 + LABEL_GAP_MARGIN;
      const compensated = gapPx * Math.max(dilution[i - 1], dilution[i]);
      raw.push(raw[i - 1] + (compensated * 2) / COL_UNIT);
    }
    const mean = raw.reduce((a, b) => a + b, 0) / raw.length;
    children.forEach((_, i) => branchOffset.set(`${parentId}:${i}`, raw[i] - mean));
  }

  /* ---- rows: longest path from entry, via DFS with back-edge detection --
     Kahn's algorithm (the first pass's approach) never terminates cleanly
     on a real cycle: a node inside the loop never reaches indegree 0, so
     it and everything downstream of it fall through to a meaningless
     fallback row. SCH-178 has exactly this - `a.resume` genuinely loops
     back to `w.service` (interrupted service resumes, then waits again) -
     so the row pass has to tolerate a cycle rather than assume ACQ-01's
     shape (a DAG) is the general case.

     Standard DFS colouring finds the fix: an edge to a node already GRAY
     (an ancestor on the current path) is a back edge - using it to push a
     row forward would be depending on your own descendant, so it is
     skipped for row purposes only. It is not dropped from the graph: the
     edge is still built and rendered below, and simply draws upward, which
     is the honest picture of a loop. An edge to a BLACK node (finished, but
     reached again on a longer path) re-opens and re-propagates that node,
     which is what makes this a true longest-path rather than DFS's usual
     first-path - the same guarantee Kahn's gave for a plain DAG. */
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map(nodes.map((n) => [n.id, WHITE]));
  const row = new Map<string, number>();
  const backEdges = new Set<string>();
  let visits = 0;
  const VISIT_BUDGET = nodes.length * nodes.length + 50;

  function visit(id: string, depth: number) {
    if (++visits > VISIT_BUDGET) return; // defensive only - see file's own guard elsewhere
    color.set(id, GRAY);
    row.set(id, Math.max(row.get(id) ?? 0, depth));
    for (const { edge } of outgoing.get(id) ?? []) {
      const to = edge.to;
      if (color.get(to) === GRAY) {
        backEdges.add(`${id}->${to}`); // the loop itself, not a row or column dependency
        continue;
      }
      if (color.get(to) === BLACK && (row.get(to) ?? 0) >= depth + 1) continue; // already deep enough
      visit(to, depth + 1);
    }
    color.set(id, BLACK);
  }
  visit(entry.id, 0);
  // Unreached only if the journey graph is disconnected from its own entry,
  // which the canonical validator forbids - kept as a last-resort fallback
  // rather than a silent omission, same as the first pass's own comment.
  nodes.forEach((n, i) => {
    if (!row.has(n.id)) row.set(n.id, i);
  });

  // A back edge still renders (built into `edges` below, unfiltered) - it
  // just does not get a vote on where its target SITS. w.service's column
  // is decided by `a.track` (the forward edge that actually reaches it
  // first); letting `a.resume` (reached later, further down the graph)
  // also average into that would be asking a node's position to depend on
  // a column that is not even computed yet when this row is processed.
  for (const key of backEdges) {
    const [, to] = key.split("->");
    const list = incoming.get(to);
    if (!list) continue;
    incoming.set(
      to,
      list.filter((rec) => `${rec.from}->${rec.edge.to}` !== key),
    );
  }

  /* ---- columns: fan out from parents, centered on branch order -------- */
  const col = new Map<string, number>();
  col.set(entry.id, 0);
  const rows = new Map<number, string[]>();
  for (const n of nodes) {
    const r = row.get(n.id)!;
    rows.set(r, [...(rows.get(r) ?? []), n.id]);
  }
  const maxRow = Math.max(...rows.keys());

  for (let r = 1; r <= maxRow; r++) {
    const ids = rows.get(r) ?? [];
    const preferred = ids.map((id) => {
      const parents = incoming.get(id) ?? [];
      if (parents.length === 0) return { id, value: 0 };
      const contributions = parents.map(({ from, branchIndex, branchCount }) => {
        const parentCol = col.get(from) ?? 0;
        const offset = branchCount > 1 ? (branchOffset.get(`${from}:${branchIndex}`) ?? 0) : 0;
        return parentCol + offset;
      });
      const value = contributions.reduce((a, b) => a + b, 0) / contributions.length;
      return { id, value };
    });
    /* Collision resolution has to PRESERVE each pair's own intended gap, not
       just enforce a flat 1-unit minimum - a flat minimum is exactly what
       broke SCH-178: two unrelated conditions (`c.interruption`'s three
       children and `c.cause`'s two) land in the same row, and `c.cause`'s
       own branchOffset math had already worked out that its two long
       labels need ~1.455 columns of separation to clear each other. A flat
       `last + 1` only remembers "one unit clear of whatever came before in
       sort order" - once an earlier collision (between two `c.interruption`
       siblings) pushes the sequence rightward, `c.cause`'s pair gets
       measured against that pushed position instead of against each other,
       and its carefully-computed 1.455-unit gap silently collapses to 1.
       Carrying forward the gap BETWEEN EACH PAIR'S OWN preferred values
       (floored at 1, so genuinely overlapping preferences still separate)
       keeps every pair's own required spacing intact regardless of what
       else shares the row - this is the general fix, not a SCH-178 special
       case: it runs for every row of every journey. */
    preferred.sort((a, b) => a.value - b.value);
    let last: number | null = null;
    let lastPreferredValue = 0;
    for (const p of preferred) {
      const v: number = last === null ? p.value : last + Math.max(1, p.value - lastPreferredValue);
      col.set(p.id, v);
      last = v;
      lastPreferredValue = p.value;
    }
  }

  /* ---- pixel coordinates ------------------------------------------------ */
  const rowTop = new Map<number, number>();
  const rowMaxHeight = new Map<number, number>();
  let y = PAD_Y;
  for (let r = 0; r <= maxRow; r++) {
    rowTop.set(r, y);
    const tallest = Math.max(...(rows.get(r) ?? [entry.id]).map((id) => SIZE[byId.get(id)!.kind].height));
    rowMaxHeight.set(r, tallest);
    y += tallest + ROW_GAP;
  }
  // Extra clearance below the last row - not graph content, just enough
  // scroll room that the floating zoom controls (fixed to the canvas's own
  // bottom-right corner) never sit directly over the bottom-most node when
  // the view is scrolled all the way down.
  const CONTROLS_CLEARANCE = 64;
  const totalHeight = y - ROW_GAP + PAD_Y + CONTROLS_CLEARANCE;

  const minCol = Math.min(...Array.from(col.values()));
  const laidOut: LaidOutNode[] = nodes.map((n) => {
    const size = SIZE[n.kind];
    const r = row.get(n.id)!;
    const c = (col.get(n.id) ?? 0) - minCol;
    return {
      node: n,
      row: r,
      col: c,
      x: PAD_X + c * COL_UNIT,
      y: rowTop.get(r)!,
      width: size.width,
      height: size.height,
    };
  });
  const nodeById = new Map(laidOut.map((l) => [l.node.id, l]));
  const maxX = Math.max(...laidOut.map((l) => l.x + l.width / 2));
  const minX = Math.min(...laidOut.map((l) => l.x - l.width / 2));
  let totalWidth = maxX - minX + PAD_X * 2;
  // Shift everything so the leftmost node's card clears the left padding.
  const shiftX = PAD_X - minX;
  for (const l of laidOut) l.x += shiftX;

  // Rows indexed for the detour-routing check below - which rows a long
  // edge would visually pass through, and what those rows actually occupy.
  const nodesByRow = new Map<number, LaidOutNode[]>();
  for (const l of laidOut) {
    if (!nodesByRow.has(l.row)) nodesByRow.set(l.row, []);
    nodesByRow.get(l.row)!.push(l);
  }
  const DETOUR_MARGIN = 56;
  let maxDetourX = 0;

  const edges: LaidOutEdge[] = [];
  for (const n of nodes) {
    const from = nodeById.get(n.id)!;
    for (const { edge, branchIndex, branchCount } of outgoing.get(n.id) ?? []) {
      const to = nodeById.get(edge.to);
      if (!to) continue;
      const x1 = from.x;
      const y1 = from.y + from.height;
      const x2 = to.x;
      const y2 = to.y;
      // Near the source rather than the true midpoint: a merge edge (the
      // journey's own into `a.reconcile`) can skip an entire row, and a
      // label at that edge's numeric midpoint would land on top of
      // whatever node happens to occupy the row in between.
      //
      // The jog is measured from the SOURCE ROW'S tallest node, not from
      // this particular source node's own bottom edge - a Condition (122
      // tall) and an Action (152 tall) can share a row (SCH-178's
      // `c.outcome`/`a.unknown`, top-aligned like every row here), and a
      // label jogged only clear of the shorter node still lands inside the
      // taller sibling's box for as long as the two overlap horizontally.
      // Clearing the row's own tallest content first, then jogging down
      // from there, is what a top-aligned row actually requires - this
      // runs for every row of every journey, not just the one that first
      // exposed it.
      const rowBottom = rowTop.get(row.get(n.id)!)! + rowMaxHeight.get(row.get(n.id)!)!;

      /* An edge whose target sits two or more rows away from its source -
         a merge or wide fork that skips a row, or a genuine back-edge
         (SCH-178's `a.resume->w.service`, TIM-61's two converging
         back-edges) - cannot be drawn as a single straight vertical run:
         that run passes directly through whatever rows sit between the two,
         cutting through any node unlucky enough to share that x-coordinate
         (confirmed on 6 of the 14 fixture journeys once the QA gate started
         checking for it). This is not a case-by-case fix - detouring the
         long vertical run out to a lane clear of every row it would
         otherwise cross is what any such edge needs, forward or backward,
         merge or cycle alike. The lane sits to the right of the widest
         node across every row the edge's own vertical span touches
         (inclusive of its own source/target rows, for safety), so nothing
         in between is ever crossed. */
      const rowFrom = row.get(n.id)!;
      const rowTo = row.get(edge.to)!;
      let detourX: number | undefined;
      if (Math.abs(rowTo - rowFrom) >= 2) {
        const lo = Math.min(rowFrom, rowTo);
        const hi = Math.max(rowFrom, rowTo);
        let corridorRight = Math.max(x1, x2);
        for (let r = lo; r <= hi; r++) {
          for (const l of nodesByRow.get(r) ?? []) {
            corridorRight = Math.max(corridorRight, l.x + l.width / 2);
          }
        }
        detourX = corridorRight + DETOUR_MARGIN;
        maxDetourX = Math.max(maxDetourX, detourX);
      }
      // The jog clears the source's own row - direction decides which SIDE
      // of that row is clear. A forward edge's target is always at least a
      // full row below (the row pass guarantees rowTo > rowFrom for every
      // edge it did not itself classify as a back-edge), so jogging just
      // BELOW the source row is always in the gap before the target, never
      // inside it - that's the `rowBottom` branch below, and it is what
      // the earlier detour fix already relied on. A back-edge's target is
      // above the source, so the equivalent safe point is just ABOVE the
      // source row instead: using `rowBottom` there (this file's own
      // previous version) put the jog near the row's own MIDPOINT toward
      // a target that could be one row up or ten - for a one-row-back edge
      // (RLT-250's `c.regression->w.observe`, too short to trigger the
      // detour lane above) that midpoint landed close enough to the
      // source's own top edge to collide with it. `rowTop`, mirrored the
      // same way `rowBottom` already was, is correct regardless of how far
      // back the edge's target actually is - short back-edge or long
      // detoured one alike.
      const rowTopOfSource = rowTop.get(rowFrom)!;
      const jogY = rowTo <= rowFrom ? rowTopOfSource - EDGE_LABEL_OFFSET : rowBottom + EDGE_LABEL_OFFSET;

      edges.push({
        // Branch index breaks the tie when two branches from the same
        // source share a target (a real canonical pattern - INC-255's
        // `c.supported` has two different reasons that both lead to
        // `a.reject`) - without it, both edges get the identical
        // `${from}->${to}` id, which React sees as a duplicate key among
        // siblings. Production React silently drops the dev-only warning
        // for this, so it went unnoticed by console-error checks; the
        // risk is real regardless (unstable reconciliation identity
        // between two elements that happen to share a key).
        id: `${n.id}->${edge.to}#${branchIndex}`,
        from: n.id,
        to: edge.to,
        kind: edgeKindFor(n, edge),
        label: edge.label,
        isFork: branchCount > 1,
        x1,
        y1,
        x2,
        y2,
        labelX: detourX !== undefined ? (x1 + detourX) / 2 : x1 === x2 ? x1 : (x1 + x2) / 2,
        labelY: jogY,
        detourX,
      });
    }
  }
  if (maxDetourX + PAD_X > totalWidth) totalWidth = maxDetourX + PAD_X;

  /* ---- sibling label separation, computed on REAL final positions -------
     branchOffset (above) plans each branch's column assuming its child
     lands at parentCol+offset - true for a child with one parent, but a
     MERGE child's real column is the AVERAGE of every parent that reaches
     it, which can land far from what any single parent planned, even on
     the opposite side of it (OWN-54: `c.acceptance`'s "Transfer is
     effective directly" branch plans +1.2 columns, but its target
     `a.dependent` also merges in from `c.result` - itself dragged several
     columns left by its own deep upstream fork - so the average pulls
     `a.dependent` to -0.59, past zero, onto the SAME side as its sibling
     branch's own target; DOC-216's `w.effective` has both children
     independently merge-pulled to nearly the same column). No amount of
     up-front dilution compensation can predict this in general, because it
     depends on where OTHER parents - not yet positioned when branchOffset
     runs - end up.

     Rather than predicting it, this fixes it on the real numbers: group
     edges by their rendered jogY - every child of one fork shares its
     parent's jogY exactly, so this already covers plain siblings, but it
     also covers the OTHER way two labels collide (DOC-216's `w.effective`
     and `w.condition` are unrelated waits whose forks happen to land in
     the same row, same as the cross-parent column collision the very
     first stress-test round found and fixed for node positions - here it
     is again, one level up, for label text). For each such group, look at
     where the labels actually ended up (still at the honest x1/x2
     midpoint, so still on the correct side of each one's real line), sort
     them, and apply the same "preserve each pair's own gap, only grow it
     to the minimum this pair's label widths need, never shrink it" pass
     already used for row-level column collisions. This only moves the
     label chip, never the line or the node beneath it, so a merge-dragged
     child still visually connects to its real column - only the text
     labels sharing a rendered row are guaranteed not to overlap, whether
     they share a parent or not. */
  const byLabelRow = new Map<number, LaidOutEdge[]>();
  for (const e of edges) {
    if (!e.label) continue; // nothing rendered - no slot to reserve
    const key = Math.round(e.labelY);
    if (!byLabelRow.has(key)) byLabelRow.set(key, []);
    byLabelRow.get(key)!.push(e);
  }
  for (const siblings of byLabelRow.values()) {
    if (siblings.length <= 1) continue;
    const ordered = [...siblings].sort((a, b) => a.labelX - b.labelX);
    let last: number | null = null;
    let lastOriginal = 0;
    let prevWidth = 0;
    for (const e of ordered) {
      const width = estimatedLabelWidth(e.label);
      const minGap = prevWidth / 2 + width / 2 + LABEL_GAP_MARGIN;
      const v: number = last === null ? e.labelX : last + Math.max(minGap, e.labelX - lastOriginal);
      lastOriginal = e.labelX;
      prevWidth = width;
      e.labelX = v;
      last = v;
    }
  }

  return { nodes: laidOut, edges, width: totalWidth, height: totalHeight };
}

/** One orthogonal (elbow) path between two anchor points - straight down,
    across, straight down - which draws a clean line when the two nodes
    share a column and a legible fork/merge jog when they do not, with no
    special-casing needed between the two. `jogY` is the edge's own
    `labelY` (see EDGE_LABEL_OFFSET) so the line's own jog always lines up
    with where its label sits, rather than the two being computed two
    different ways. */
export function elbowPath(x1: number, y1: number, x2: number, y2: number, jogY?: number, detourX?: number): string {
  if (detourX !== undefined) {
    // Down/up clear of the source row, across to the detour lane, the full
    // remaining run in that lane (clear of every row it passes), then
    // across into the target - see the layout function's own comment on
    // why a long edge needs this instead of a single straight run.
    const midY = jogY ?? y1 + (y2 - y1) / 2;
    return `M ${x1} ${y1} L ${x1} ${midY} L ${detourX} ${midY} L ${detourX} ${y2} L ${x2} ${y2}`;
  }
  if (Math.abs(x1 - x2) < 1) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const midY = jogY ?? y1 + (y2 - y1) / 2;
  return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
}
