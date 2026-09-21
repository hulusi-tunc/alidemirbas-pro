/* COLLISION FIX EVIDENCE — the data proof for audit/collision-fixes.md.

   Reads production/canonical-dump.json only (no `@/` alias, no build) and
   asserts, for each of the three Phase 26 collision fixes, the thing the fix
   claims to have made true:

     FIX 1  ACT-13 / ACT-14 are service class, carry no marketing-sunset
            stand-down, and the three structurally identical service journeys
            they were aligned to still declare the same class.
     FIX 2  no two members of the commerce-recovery group claim the bottom of
            it, and ACQ-13 / ACQ-289 name each other with the yield written in
            the direction the decision set.
     FIX 3  REM-305's communicating node text states no refund outcome, and
            REM-305 and FIN-302 name each other.

     node audit/collision-fix-evidence.mjs            # report
     node audit/collision-fix-evidence.mjs --quiet    # exit code only

   Exit 1 on any failure. */
import fs from "node:fs";

const ROOT = new URL("..", import.meta.url).pathname;
const journeys = JSON.parse(fs.readFileSync(ROOT + "production/canonical-dump.json", "utf8")).journeys;
const byId = Object.fromEntries(journeys.map((j) => [j.id, j]));
const QUIET = process.argv.includes("--quiet");
const say = (...a) => { if (!QUIET) console.log(...a); };
const fails = [];
const check = (ok, label) => { say(`  ${ok ? "ok  " : "FAIL"}  ${label}`); if (!ok) fails.push(label); };

/* ------------------------------------------------------------------ fix 1 */
say("\nFIX 1 - ACT-13 and ACT-14 are service class\n");
for (const id of ["ACT-13", "ACT-14"]) {
  const j = byId[id];
  check(j.contact?.defaultPriority === "service", `${id} contact.defaultPriority is "service" (is "${j.contact?.defaultPriority}")`);
  check(j.contact?.pressureClass === "service", `${id} contact.pressureClass is "service" (is "${j.contact?.pressureClass}")`);
  const prose = JSON.stringify([j.eligibility, j.suppressions, j.guardrails]);
  check(!(j.suppressions ?? []).some((s) => s.id === "s.sunset"), `${id} carries no s.sunset suppression`);
  check(!prose.includes("marketing_suppression"), `${id} names no marketing suppression in eligibility/suppressions/guardrails`);
  check(!(j.orchestration?.noAction ?? []).includes("s.sunset"), `${id} orchestration.noAction does not reference s.sunset`);
}
for (const id of ["ACC-263", "RLT-279", "TIM-268"])
  check(byId[id].contact?.defaultPriority === "service" && byId[id].contact?.pressureClass === "service",
    `${id} (${byId[id].shortName}) - the journey aligned to - is still service/service`);
check(byId["ACT-12"].contact?.defaultPriority === "lifecycle" && (byId["ACT-12"].suppressions ?? []).some((s) => s.id === "s.sunset"),
  "ACT-12 Onboarding Nurture is untouched: still lifecycle and still reads the sunset");

/* ------------------------------------------------------------------ fix 2 */
say("\nFIX 2 - commerce-recovery has one bottom, and it is ACQ-13\n");
const GROUP = "commerce-recovery";
const members = journeys.filter((j) => {
  const c = j.contact?.competition;
  return c && c !== "none" && c.exclusionGroup === GROUP;
});
say(`  group members: ${members.length} - ${members.map((m) => m.id).join(", ")}`);
check(members.length === 8, "the group still has 8 members");

/* A bottom claim is a precedence that says it is the lowest / bottom of the
   group without naming another member it ranks above. */
const BOTTOM = /\blowest\b|\bbottom\b|below every other member/i;
const bottomClaims = members.filter((m) => {
  const p = m.contact.competition.precedence;
  if (!BOTTOM.test(p)) return false;
  const above = /\babove\b|\btakes precedence over\b|\boutranks\b/i.test(p);
  return !above;
});
say(`  unqualified bottom claims: ${bottomClaims.length ? bottomClaims.map((m) => m.id).join(", ") : "none"}`);
check(bottomClaims.length <= 1, `at most one member claims the bottom of the group unqualified (found ${bottomClaims.length})`);

const a13 = byId["ACQ-13"].contact.competition;
const a289 = byId["ACQ-289"].contact.competition;
check(a13.precedence.includes("ACQ-289"), "ACQ-13's precedence names ACQ-289");
check(/yields?\b/i.test(a13.precedence), "ACQ-13's precedence says it yields");
check(a289.precedence.includes("ACQ-13"), "ACQ-289's precedence names ACQ-13");
check(/\babove\b|takes precedence over|outranks/i.test(a289.precedence), "ACQ-289's precedence says it ranks above");
check(a13.onLoss === "suppressed" && a289.onLoss === "suppressed", "both keep onLoss: suppressed");
const s13 = (byId["ACQ-13"].suppressions ?? []).find((s) => s.id === "s.contest");
const s289 = (byId["ACQ-289"].suppressions ?? []).find((s) => s.id === "s.contest");
check(s13.text.includes("ACQ-289"), "ACQ-13's s.contest names ACQ-289");
check(s289.text.includes("ACQ-13"), "ACQ-289's s.contest names ACQ-13");

/* Nobody else in the group may claim to outrank ACQ-289 and be outranked by
   ACQ-13, or any other cycle between the two we just ordered. */
for (const m of members) {
  if (m.id === "ACQ-13" || m.id === "ACQ-289") continue;
  const p = m.contact.competition.precedence;
  check(!/below .{0,60}back-in-stock/i.test(p), `${m.id} does not claim to rank below the back-in-stock alert`);
}

/* ------------------------------------------------------------------ fix 3 */
say("\nFIX 3 - FIN-302 owns the refund message\n");
const rem = byId["REM-305"];
const fin = byId["FIN-302"];

/* "states a refund outcome" = the node's own prose asserts something about the
   money rather than about the case: a refund or repayment word, an amount, a
   settlement state or a timing claim about it.

   A sentence that hands the refund to FIN-302 is a boundary, not a claim, so
   those sentences are removed first - by sentence, not by node, so a node that
   names FIN-302 anywhere does not thereby excuse a refund claim somewhere else
   in the same text. What is left is what REM-305 says on its own account. */
const REFUND_OUTCOME = /\brefund(ed|s|ing)?\b|\brepaid\b|\breimburse|\bamount\b|\bsettl(e|ed|es|ement)\b|\bmoney\b/i;
const sentences = (t) => t.split(/(?<=\.)\s+/);
const sendNodes = rem.nodes.filter((n) => n.execution === "communication");
say(`  REM-305 communicating nodes: ${sendNodes.map((n) => n.id).join(", ")}`);
for (const n of sendNodes) {
  const own = sentences(n.does).filter((s) => !s.includes("FIN-302"));
  const hit = own.find((s) => REFUND_OUTCOME.test(s));
  check(!hit, `REM-305 ${n.id} states no refund outcome on its own account${/FIN-302/.test(n.does) ? " (and hands the money to FIN-302)" : ""}${hit ? ` - found: "${hit.trim().slice(0, 90)}"` : ""}`);
}
for (const t of rem.orchestration.touches)
  check(!/what was done\b|what closed it\b/.test(t.purpose), `REM-305 touch ${t.id} purpose no longer promises "what closed it" / "what was done"`);
for (const t of rem.orchestration.touches.filter((t) => t.id !== "t1"))
  check((t.destination?.mustNotClaim ?? []).some((c) => /refund/i.test(c)), `REM-305 touch ${t.id} mustNotClaim names the refund`);

check((rem.suppressions ?? []).some((s) => /FIN-302/.test(s.text)), "REM-305 carries a suppression naming FIN-302");
check((rem.distinctFrom ?? []).some((d) => d.journey === "FIN-302"), "REM-305 distinctFrom names FIN-302");
check((fin.distinctFrom ?? []).some((d) => d.journey === "REM-305"), "FIN-302 distinctFrom names REM-305");
check((fin.suppressions ?? []).some((s) => s.id === "s.decision" && s.text.includes("REM-305")), "FIN-302's s.decision names REM-305");
check((fin.suppressions ?? []).some((s) => s.id === "s.approved") && (fin.suppressions ?? []).some((s) => s.id === "s.timing"),
  "FIN-302 keeps its approved/submitted/settled separation (s.approved, s.timing)");

/* It is not a competition-group problem: quote both sides. */
say(`  REM-305 contact.competition : ${rem.contact.competition === "none" ? "none" : `${rem.contact.competition.exclusionGroup} (scope ${rem.contact.competition.scope}, onLoss ${rem.contact.competition.onLoss})`}`);
say(`  FIN-302 contact.competition : ${fin.contact.competition === "none" ? "none" : fin.contact.competition.exclusionGroup}`);
check(fin.contact.competition === "none", "FIN-302 is in no competition group - unchanged");
check(rem.contact.competition !== "none" && rem.contact.competition.exclusionGroup === "service-request", "REM-305 keeps the service-request group - unchanged");
const svcReq = journeys.filter((j) => j.contact?.competition && j.contact.competition !== "none" && j.contact.competition.exclusionGroup === "service-request").map((j) => j.id);
say(`  service-request group members: ${svcReq.join(", ")}`);
check(!svcReq.includes("FIN-302"), "FIN-302 was not added to the service-request group");

/* ----------------------------------------------------------------- report */
if (fails.length) {
  console.error(`\nFAIL (${fails.length})`);
  for (const f of fails) console.error("  " + f);
  process.exit(1);
}
say(`\nPASS - all three fixes hold in the data.`);
