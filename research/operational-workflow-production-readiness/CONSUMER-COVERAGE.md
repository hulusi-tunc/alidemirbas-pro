# Operational Workflows — consumer coverage

For each of the 124: consumer classification, representative caller/receiver ids, and note.
Method matches the two closed rounds' own: a structural handoff (real, traceable) vs. a
prose-only reference (`distinctFrom`, usually a boundary statement) vs. a plausible external/
authoritative trigger with no traceable sender at all (event-driven, not orphaned by default —
investigated per workflow, not assumed). Nothing here was changed — audit only.

## Distribution

| Classification | Count |
|---|---|
| active | 83 |
| event-driven | 35 |
| unconsumed-but-valid | 4 |
| orphan-candidate | 2 |

## Per-workflow table

| Workflow | Classification | Callers/consumers (handoff) | Prose-only refs | Note |
|---|---|---|---|---|
| ACC-72 | active | ACC-71 | ACC-263 | consumers[] lists ACC-71 with a real viaHandoff (h.provision) carrying the entitlement's scope and validity, plus the explicit fact nothing  |
| ACC-73 | active | REL-92, REL-94, SUB-164, SUB-166 | — | consumers[] shows four real handoff consumers (REL-92, REL-94, SUB-164, SUB-166) all constructing their own entry from this workflow's h.ent |
| ACC-74 | active | ACC-73, ACC-78 | ACC-80, ACC-261, CTL-237 | consumers[] shows two real handoff sources: ACC-73 (h.loss, a scope reduction with dependent commitments) and ACC-78 (h.terminate, carrying  |
| ACC-75 | active | IDN-86 | IDN-85 | consumers[] lists IDN-86 with a real, reciprocal viaHandoff (h.resume) — the step-up round trip is a genuine two-way handoff relationship, n |
| ACC-76 | active | ACC-77 | ACC-263 | consumers[] lists ACC-77 with a real viaHandoff (h.new) — the new credential and the one it replaces, plus the revocation reason as part of  |
| ACC-77 | active | ACC-76 | — | consumers[] lists ACC-76 with a real viaHandoff (h.revoke) carrying the credential, its scope/owner, and the revocation reason — this workfl |
| ACC-80 | active | ACC-74 | — | consumers[] lists ACC-74 with a real viaHandoff (h.deprovision) carrying the resource and effective loss time, matching this workflow's own  |
| CTL-231 | event-driven | — | — | No workflow hands off into CTL-231 (consumers: []); the trigger is a direct, authoritative external request (an admin/API action), matching  |
| CTL-232 | active | CTL-238 | CTL-235 | CTL-235 references this workflow only via distinctFrom prose; CTL-238 (h.transfer) is a real handoff sender whose payload fits well because  |
| CTL-233 | event-driven | — | CTL-232 | No workflow hands off into CTL-233 (CTL-232 references it only via distinctFrom prose); the trigger is the proposed owner's own accept actio |
| CTL-234 | active | CTL-232, CTL-233 | — | CTL-232 (h.execute, unrevalidated on the no-acceptance path — see CTL-232 for the root-cause finding) and CTL-233 (h.execute, fully revalida |
| CTL-235 | event-driven | — | — | No workflow hands off into CTL-235 (consumers: []); the trigger is the delegator's own direct request, a legitimate external initiator, not  |
| CTL-236 | active | CTL-235 | — | CTL-235 (h.temporary) is the sole real, well-matched handoff sender. |
| CTL-237 | active | OWN-54, CTL-236 | — | CTL-236 (h.reconcile, h.revoke) and OWN-54 (h.delegations) are both real, well-matched handoff senders. |
| CTL-238 | event-driven | — | — | No workflow hands off into CTL-238 (consumers: []); the trigger is a direct authoritative signal (departure/invalidity/incapacity/governance |
| DAT-221 | event-driven | — | — | consumers: [] in the dump — DAT-221 is the corpus's data-intake entry point, triggered by an external submission event rather than by anothe |
| DAT-222 | active | DAT-221, DAT-225 | — | Two real handoff consumers: DAT-221 (h.validate) and DAT-225 (h.revalidate, corrected records only, explicitly excluding the successful scop |
| DAT-223 | active | DAT-222 | — | DAT-222 is the sole, well-formed handoff consumer via h.preview, matching DAT-223's own trigger requirement exactly. |
| DAT-224 | active | DAT-223 | — | DAT-223 is the sole, well-formed handoff consumer via h.execute, matching DAT-224's own entry exactly. |
| DAT-225 | active | DAT-224 | — | DAT-224 is the sole, well-formed handoff consumer via h.recover, matching DAT-225's own entry exactly. |
| DAT-226 | event-driven | — | — | consumers: [] — DAT-226 is triggered by an external migration-planning event, not by another canonical workflow's handoff; a reasonable entr |
| DAT-227 | active | DAT-226 | — | DAT-226 is the sole, well-formed handoff consumer via h.execute, and is also named reciprocally in DAT-227's own distinctFrom prose. |
| DAT-228 | active | DAT-227 | — | DAT-227 is the sole, well-formed handoff consumer via h.cutover, and is also named reciprocally in DAT-228's own distinctFrom-style relation |
| DAT-229 | event-driven | — | — | consumers: [] — DAT-229 is triggered by an identified-gap event, presumably from an internal audit/detection process rather than a canonical |
| DAT-230 | active | DAT-227, DAT-228, DAT-229 | — | Three real handoff consumers — DAT-227 (h.reconcile), DAT-228 (h.correct), DAT-229 (h.reconcile) — all carrying evidence that satisfies DAT- |
| DEC-181 | active | ACQ-10, CON-40, FBK-43, FBK-47, OWN-55, OWN-57, OWN-58, OWN-60 (+58 more) | — | Extremely heavy caller list (~30 real senders) confirms this is the corpus's genuine general escalation sink, matching its load-bearing role |
| DEC-182 | active | DEC-181, DEC-183, DEC-189 | — | DEC-181 (h.assign), DEC-183 (h.reassign on mid-review conflict), DEC-189 (h.return with direction) are all real handoff senders whose carrie |
| DEC-183 | active | DEC-182, DEC-184, DEC-189, DEC-190 | DOC-215 | DEC-182 (h.review), DEC-184 (h.resume), DEC-189 (h.decide), DEC-190 (h.review) are real handoff senders; DOC-215 references this workflow on |
| DEC-185 | active | OWN-56, OWN-57, DEC-183 | DEC-187 | OWN-56, OWN-57 (h.execute) and DEC-183 (sender, h.approved) are real, well-matched consumers; DEC-187 is referenced only via distinctFrom pr |
| DEC-186 | active | DEC-183 | DEC-267, RSK-194 | DEC-183 is the sole real handoff sender; RSK-194 and DEC-267 reference this workflow only via distinctFrom prose. |
| DEC-187 | active | DEC-183 | DEC-185 | DEC-183 (h.partial) is the sole real handoff sender; DEC-185 references this workflow only via distinctFrom prose. |
| DEC-188 | active | DEC-185 | — | DEC-185 (h.validity) is the sole real handoff sender, with a well-matched payload. |
| DEC-189 | active | DEC-182, DEC-183, DEC-184, DEC-187 | — | DEC-182 (h.escalate), DEC-183 (h.escalate), DEC-184 (h.escalate, outside this batch), and DEC-187 (h.undefined, with the deadline gap above) |
| DEC-190 | active | DEC-185, DEC-188 | — | DEC-185 (h.re-review) and DEC-188 (h.re-review) are both real, well-matched handoff senders. |
| DOC-211 | active | DOC-218, DOC-219 | — | DOC-218 (h.new, expired document) and DOC-219 (h.new, revoked document) both send real handoffs into this workflow with carries that match i |
| DOC-212 | active | DOC-211 | — | DOC-211's h.draft is the confirmed real sender, and its carries match this workflow's entry contract exactly. |
| DOC-213 | active | DOC-212 | — | DOC-212's h.issue is the confirmed real sender; its carries satisfy the 'validated draft' half of the entry requirement but not the 'authori |
| DOC-216 | active | DOC-213, DOC-215 | DOC-286 | DOC-213 (operational) and DOC-215 (customer) both send real handoffs matching this workflow's entry; DOC-286 references it only via distinct |
| DOC-217 | event-driven | — | DOC-219 | Zero confirmed handoff senders in this batch (DOC-219 references it only in prose via distinctFrom); the trigger event (an authorized change |
| DOC-218 | event-driven | — | — | No confirmed handoff senders in this batch; the trigger (a document reaching a defined expiry) is plausibly raised by an automated expiry-mo |
| DOC-219 | event-driven | — | DOC-218 | No confirmed handoff senders in this batch (DOC-218 references it only via distinctFrom prose); the trigger is plausibly raised by a legal/c |
| FIN-132 | event-driven | — | FIN-131 | No confirmed handoff sender in this batch (FIN-131 references it only via distinctFrom prose); payment initiation is plausibly triggered dir |
| FIN-133 | active | FIN-132 | — | FIN-132's h.capture is the confirmed real sender, carrying the authorization, expiry, and obligation exactly as this workflow's entry requir |
| FIN-135 | active | FIN-132 | FIN-140 | FIN-132's h.unknown is the confirmed real sender. Verified per task instructions: the h.dedupe handoff to OPS-125 correctly declares logical |
| FIN-138 | active | FIN-137 | — | FIN-137's h.execute is the confirmed real sender, carrying the approved amount, currency and original transaction plus the explicit 'nothing |
| FIN-139 | event-driven | — | — | No confirmed handoff senders; a dispute/chargeback is opened by an external card scheme or regulator, which is the expected external trigger |
| FIN-140 | active | FIN-133, FIN-138 | FIN-135 | FIN-133 and FIN-138 both send real h.reconcile handoffs matching this workflow's entry needs; FIN-135 references it only via distinctFrom pr |
| IDN-82 | active | REL-91, TRM-109 | RSK-195 | REL-91 and TRM-109 are real, carries-verified inbound handoff consumers; RSK-195 references it only via unbacked prose. |
| IDN-83 | unconsumed-but-valid | — | — | Empty consumers array (no real handoff, no prose reference) despite sound internal design — the OPS-126 precedent applies: design is sound,  |
| IDN-86 | active | ACC-75, IDN-85 | — | ACC-75 and IDN-85 are both confirmed real inbound handoff senders per the dump, but only ACC-75 has a matching outbound resume path in IDN-8 |
| INC-251 | event-driven | — | INC-260 | consumers[] lists only INC-260 via prose distinctFrom (no viaHandoff) — nothing hands off *into* INC-251. Its own trigger is an inferred, mo |
| INC-252 | active | INC-251 | — | consumers[] lists INC-251 with a real viaHandoff (h.severity) carrying exactly what this workflow's trigger requires. |
| INC-253 | active | INC-252, INC-257 | — | consumers[] shows two real handoff consumers: INC-252 (h.mitigate, feeding this workflow) and INC-257 (h.active, returning a relapsed incide |
| INC-255 | active | INC-252 | — | consumers[] lists INC-252 with a real viaHandoff (h.investigate), carrying the correlating evidence, timeline and cohort this workflow's tri |
| INC-256 | active | INC-253, INC-255 | — | consumers[] lists INC-253 (h.recovery, containment insufficient) and INC-255 (h.recovery, confirmed cause with corrective action) as real ha |
| INC-257 | active | INC-256 | — | consumers[] lists INC-256 with a real viaHandoff (h.observe) carrying the verified-restoration evidence this workflow's trigger requires. |
| INC-258 | active | INC-257 | — | consumers[] lists INC-257 with a real viaHandoff (h.resolve) carrying the stable-recovery evidence and outstanding-mitigation state this wor |
| INC-259 | active | INC-258 | — | consumers[] lists INC-258 with a real viaHandoff (h.review) carrying the full timeline, decisions, and detached-cases/obligations this workf |
| INC-260 | event-driven | — | — | consumers[] is empty. The trigger (materially_similar_incidents_recur, source 'inferred') is the same shape as an automated pattern-detectio |
| INT-111 | active | INT-278 | — | INT-278 (customer surface) is the sole consumer and it is a real inbound handoff: INT-278 has a handoff node (h.diagnose) whose target is IN |
| INT-112 | event-driven | — | INT-269 | Two consumers in the dump, neither via a real inbound handoff (viaHandoff empty for both): INT-111 (viaDistinctFrom: false — a plain prose m |
| INT-113 | event-driven | — | INT-111, INT-116, INT-117 | All three listed relationships (INT-111, INT-116, INT-117) are distinctFrom-prose-only in INT-113's own consumers array (viaHandoff empty fo |
| INT-114 | event-driven | — | FIN-132, FUL-147 | INT-114's own consumers array lists only FIN-132 and FUL-147, both distinctFrom-prose-only (viaHandoff empty). INT-115 does not appear there |
| INT-115 | active | INT-114 | — | INT-114 is the confirmed real handoff sender into this workflow (h.reconcile) — listed correctly in the dump as a consumer-direction entry w |
| INT-116 | active | INT-112, INT-113 | INT-120, INT-269 | INT-112 and INT-113 are confirmed real handoff senders (h.failure) matching this workflow's own trigger. INT-120 references via distinctFrom |
| INT-117 | unconsumed-but-valid | — | OPS-122 | Only consumer entry is OPS-122 (mechanism surface, distinctFrom prose only, no handoff) — no structured downstream consumer holds this workf |
| INT-118 | active | INT-116 | OPS-129, DOC-220, DAT-229 | INT-116 is the confirmed real sender into this workflow (h.reconnect), matching this workflow's own trigger and required inputs (outage wind |
| INT-119 | active | INT-115, INT-118 | — | INT-115 and INT-118 are both confirmed real handoff senders (h.conflict) whose carried payloads match this workflow's a.collect input needs  |
| INT-120 | orphan-candidate | — | — | `consumers` is an empty array — no other workflow in the corpus references INT-120 via handoff or distinctFrom prose. Per the brief's own di |
| OWN-51 | active | FBK-46, OWN-52, TIM-62 | REL-100, DEC-182 | Real handoff consumer OWN-52 (h.assign, carries what OWN-52's entry needs). Prose-only references from REL-100 and DEC-182. Two workflows (F |
| OWN-52 | active | OWN-51 | OWN-53 | Real consumers OWN-51 (via OWN-51's own h.assign feeding this workflow) and OWN-53 (via this workflow's own h.context, also prose-referenced |
| OWN-53 | active | OWN-52, OWN-54 | — | Consumed by OWN-52 (via OWN-52's own h.context node) and OWN-54 (via OWN-54's own h.context node) -- both real handoff senders, confirming O |
| OWN-54 | active | OWN-55, REL-92, CTL-234, CTL-237 | OWN-60, TRM-105 | Real handoff consumers: OWN-55 (h.transfer), REL-92 (h.ownership, customer surface), CTL-234 (h.reconcile), CTL-237 (h.work). Plus prose-onl |
| OWN-55 | active | OWN-52, OWN-53, OWN-54, OWN-56, OWN-57, OWN-58, TIM-61, TIM-62 (+33 more) | — | By far the highest-fan-in workflow in the batch -- real handoff consumers from OWN-52/53/54/56/57/58 plus roughly two dozen customer- and me |
| OWN-56 | active | OWN-59, OWN-60, TIM-66 | ACC-75 | Real handoff consumers OWN-59 (h.resubmit, a genuine revision re-entering) and OWN-60 (h.reapprove, an authority-change-driven re-approval)  |
| OWN-57 | event-driven | — | OWN-56 | consumers lists only OWN-56 (prose-only, viaDistinctFrom, no real handoff). No workflow in this batch shows a real handoff into OWN-57, but  |
| OWN-58 | event-driven | — | DEC-190 | consumers lists only DEC-190 (prose-only, viaDistinctFrom, no real handoff). No workflow in this batch is shown sending a real handoff into  |
| OWN-59 | active | OWN-56, OWN-58 | DEC-186 | Real handoff consumers OWN-56 (via its own h.rejected) and OWN-58 (via its own h.rejected) both feed into OWN-59 as the shared rejection-han |
| OWN-60 | active | REL-94 | — | Real handoff consumer OWN-56 (via this workflow's own h.reapprove) and prose-referenced by OWN-54. Also a real handoff SENDER TO OWN-60 show |
| REL-95 | event-driven | — | — | consumers: [] -- no workflow in this batch shows a handoff or prose reference into REL-95, but the trigger (organisation suspended, master a |
| REL-96 | active | — | REL-95 | Real consumer REL-95 (prose-only distinctFrom, explicitly cross-referencing the "opposite direction" relationship -- "REL-96 derives upward. |
| REL-97 | unconsumed-but-valid | — | — | consumers: [] -- no workflow in this batch shows a handoff into REL-97, though its trigger (potential_duplicate_detected, explicitly inferre |
| REL-98 | active | REL-97 | REL-91, REL-99 | Real handoff consumer REL-97 (via REL-97's own h.link node, "both records and the evidence of the relationship... not the same entity"), mat |
| REL-99 | orphan-candidate | — | — | consumers: [] -- no workflow in the corpus hands off into REL-99 or references it in prose, and unlike REL-95 (whose trigger is plausibly em |
| REM-153 | active | REM-152 | TIM-268 | REM-152 (customer surface) sends a real h.transit handoff carrying the authorized scope/method/validity; TIM-268 references it only via dist |
| REM-154 | active | REM-153 | — | REM-153's h.inspect is the confirmed real sender, carrying exactly what this workflow's entry needs. |
| REM-155 | active | REM-157 | REM-156 | REM-157 (customer surface) sends a real h.replacement handoff carrying the original fulfillment, defect, and required scope; REM-156 referen |
| REM-158 | active | REM-155, REM-156, REM-160 | — | REM-155 (h.verify), REM-156 (h.verify, customer surface) and REM-160 (h.resume) all send real handoffs matching this workflow's entry, confi |
| REM-159 | active | RET-26 | — | RET-26 (customer surface) sends a real h.compensation handoff matching this workflow's entry. |
| REM-160 | event-driven | — | — | No confirmed handoff senders; the trigger is a declared customer/agent report, which is the expected external entry shape for this kind of p |
| RLT-241 | event-driven | — | RLT-279 | Zero real handoff consumers into RLT-241 exist in the dump (RLT-279 only references it in prose). The trigger `change_available_for_controll |
| RLT-242 | active | RLT-241, RLT-279 | — | Two confirmed real handoff senders: RLT-241 (h.prepare, eligible target arriving) and RLT-279 (h.resume, a customer-side blocker clearing re |
| RLT-243 | active | RLT-242 | RLT-244 | RLT-242 is the confirmed real sender via h.schedule; RLT-244 references this journey only in prose (distinctFrom) as the receiving side of h |
| RLT-244 | active | RLT-243 | — | RLT-243 is the confirmed real sender via h.execute. |
| RLT-245 | active | RLT-246 | RLT-249 | RLT-246 is a confirmed real sender (h.resume, pause resolved healthy) as well as a confirmed real receiver (h.pause). Initial cold-start ent |
| RLT-246 | active | RLT-245, RLT-249, RLT-250 | — | Three confirmed real senders: RLT-245 (h.pause), RLT-249 (h.rollout), RLT-250 (h.reopen) — the last of which is the source of the flagged se |
| RLT-247 | active | RLT-246 | — | RLT-246 is the confirmed real sender via h.rollback. |
| RLT-248 | active | RLT-247 | — | RLT-247 is the confirmed real sender via h.rollback. |
| RLT-249 | active | RLT-244 | RLT-245 | RLT-244 is the confirmed real sender via h.target-failure. |
| RLT-250 | active | RLT-245 | — | RLT-245 is the confirmed real sender via h.complete. |
| RSK-191 | event-driven | — | RSK-200 | Zero real handoff consumers in the dump (RSK-200 references it only via prose distinctFrom). The trigger event (protected_action_reaches_pol |
| RSK-192 | active | FIN-139 | RSK-194, RSK-199, INC-251 | FIN-139 is a real, verified inbound handoff consumer (dispute outcomes routed in as risk signals, matching RSK-192's own trigger evidence re |
| RSK-193 | active | RSK-192, RSK-194, RSK-200 | RSK-196, RSK-273 | RSK-192, RSK-194, and RSK-200 are all real, carries-verified inbound handoff senders; RSK-196 and RSK-273 reference it only via prose distin |
| RSK-194 | event-driven | — | DEC-267, RSK-192 | No real handoff consumers in the dump; DEC-267 and RSK-192 reference it only via prose. The trigger (potential_policy_violation_detected) is |
| RSK-195 | event-driven | — | DOC-211 | DOC-211 references it only via prose. The trigger (compliance_requirement_becomes_necessary) is plausibly emitted broadly by many onboarding |
| RSK-196 | event-driven | — | — | Zero real or prose consumers found anywhere in the corpus dump for this id. The trigger (policy_or_compliance_hold_applied, source: authorit |
| RSK-197 | event-driven | — | RSK-198 | No real inbound handoff consumer — entry is requester-declared, consistent with an external/declared trigger. RSK-198 is the real downstream |
| RSK-198 | active | RSK-197 | — | RSK-197 is the sole, verified real consumer via its own h.apply handoff with matching carries. |
| RSK-199 | event-driven | — | RSK-273 | RSK-273 references it only via prose. The trigger is plausibly emitted at any proposed action reaching a limit gate across the system, consi |
| RSK-200 | event-driven | — | — | No real or prose consumers anywhere in the dump. The trigger is plausibly emitted internally by many other risk/policy workflows in this sam |
| SCH-171 | active | SCH-173, SCH-179 | SCH-282 | SCH-173, SCH-179 and SCH-282 all list SCH-171 as a source. SCH-173 and SCH-179 each have a real inbound handoff node targeting SCH-171 (h.al |
| SUB-164 | active | SUB-163, SUB-165 | — | SUB-163 is the confirmed authoritative sender (h.execute) and SUB-165 is both a receiver (h.payment-failure) and a confirmed return-sender ( |
| TIM-64 | active | TIM-61, TIM-63, TIM-65 | TIM-70 | Real handoff consumers named in the dump: TIM-61, TIM-63, TIM-65 (all customer-surface, outside this batch); TIM-70 is named reciprocally vi |
| TIM-66 | event-driven | — | — | consumers: [] — TIM-66 is triggered by an external exception-granting event/authority, not by another canonical workflow's handoff; a reason |
| TIM-67 | event-driven | — | TIM-65, TIM-66 | Only prose-only (viaDistinctFrom) references appear in the dump — TIM-65 and TIM-66 both name this workflow in their own distinctFrom entrie |
| TIM-68 | event-driven | — | ACC-79 | ACC-79 (customer surface, access category) names this workflow only via viaDistinctFrom, with no real handoff traffic recorded — consistent  |
| TIM-69 | active | TIM-64 | TIM-281 | TIM-64 is a real, well-formed handoff consumer via h.post, matching this workflow's own entry contract; TIM-281 (outside this batch) referen |
| TIM-70 | unconsumed-but-valid | — | — | consumers: [] despite this workflow's own distinctFrom explicitly claiming broad reuse ('every other scheduled change... runs through it').  |
| TRM-101 | active | REL-97 | TRM-104 | REL-97 is the confirmed real sender via h.merge; TRM-104 references this journey only in prose (distinctFrom). |
| TRM-102 | active | TRM-101 | — | TRM-101 is the confirmed real (and only) sender via h.conflict. |
| TRM-103 | event-driven | — | TRM-101 | No real handoff sender exists in the dump (TRM-101 only references this in prose). `account_consolidation_authorized` is plausibly emitted b |
| TRM-104 | event-driven | — | CTL-234 | No real handoff sender exists in the dump (CTL-234 only references this in prose). `primary_relationship_transfer_authorized` is plausibly e |
| TRM-109 | event-driven | — | TRM-275 | No real handoff sender exists in the dump (TRM-275 only references this in prose). `data_deletion_requested` is plausibly emitted by an exte |
| TRM-110 | active | TRM-109 | — | TRM-109 is the confirmed real sender via h.execute. |

## Orphan-candidates, individually assessed

- **INT-120 (Dependency Degradation Recovery)**: `consumers` is an empty array — no other workflow in the corpus references INT-120 via handoff or distinctFrom prose. Per the brief's own distinction, this could be event-driven (the trigger event is plausibly emitted by external dependency monitoring, an authoritative/external source) rather than a true orphan, but reporting it as orphan-candidate is the more honest default absent any corroborating consumer text — flagging for coordinator judgment rather than asserting either way with confidence.
- **REL-99 (Entity Split)**: consumers: [] -- no workflow in the corpus hands off into REL-99 or references it in prose, and unlike REL-95 (whose trigger is plausibly emitted by well-known account/contract lifecycle events), entity_split_required's authoritative source is not named or evidenced anywhere in this batch's data, making it harder to independently confirm this is genuinely event-driven versus simply unreferenced -- worth flagging directly, though the workflow's own design is sound.

## Unconsumed-but-valid, individually assessed

- **IDN-83 (Document Verification)**: Empty consumers array (no real handoff, no prose reference) despite sound internal design — the OPS-126 precedent applies: design is sound, no confirmed real consumer in this corpus slice, plausibly wired to real callers outside this dump's visibility.
- **INT-117 (Integration Work Hold)**: Only consumer entry is OPS-122 (mechanism surface, distinctFrom prose only, no handoff) — no structured downstream consumer holds this workflow's resumed/discarded outcome. Design is sound (this is the OPS-126-style precedent per the brief) — the trigger is authoritative and system-detected, so it's not orphaned, just not yet consumed by a named receiver in this corpus slice.
- **REL-97 (Duplicate Entity Assessment)**: consumers: [] -- no workflow in this batch shows a handoff into REL-97, though its trigger (potential_duplicate_detected, explicitly inferred-source) is plausibly raised by a matching/detection mechanism outside this batch's visibility. REL-98's own consumer entry confirms REL-97 as a real sender (REL-98 lists REL-97 as a consumer via REL-97's own h.link node), so this reads as unconsumed-but-valid rather than orphan -- the design stands ready for whatever detection mechanism raises the trigger.
- **TIM-70 (Scheduled Transition Validation)**: consumers: [] despite this workflow's own distinctFrom explicitly claiming broad reuse ('every other scheduled change... runs through it'). No canonical workflow shows a formal handoff edge into TIM-70, which most plausibly means other workflows (e.g. TIM-64) independently reimplement the same pattern for their specific case rather than literally invoking this one — sound design, matching the OPS-126 precedent for a mechanism with no confirmed real handoff consumer.
