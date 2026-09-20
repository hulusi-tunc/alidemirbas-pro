# Public journey scope — FIXED

**This file is the product decision. It is not a proposal and not a derivation.**
Nothing in this repository may re-open it: not a subagent, not a validator, not a
later refactor. Code reads this list; it does not recompute it.

| | |
|---|---|
| source corpus (the journey library) | **73** |
| public journeys | **52** |
| excluded from the public product | **21** |

Verified as an exact partition of the existing library: 52 + 21 = 73, no
duplicate ids, no id in both lists, and every id resolves to a real journey in
`src/canonical/`. Enforced by `scripts/validate-public-scope.mjs` (15 checks)
and asserted again at module load in `src/lib/public-corpus.ts`, so the lists
and the derived library can never drift apart silently.

**52/21, after a brief excursion to 51/22 that was reversed.** RET-24 is the
single journey on which this brief's own two rules contradict each other; it
was removed, then restored when the field that resolves the conflict was found.
The full reconciliation is `audit/public-scope-validation.md`.

The wider canonical corpus (286 journeys, of which 124 are the archived
Operational Workflows surface and the rest are silent lifecycle states and
runtime mechanisms) is untouched by this decision. "73" here means the journey
**library** — the Customer Journeys surface the site states a size for.

---

## The 52 public journeys

### Acquisition, intent & qualification — 7
| id | name |
|---|---|
| ACQ-11 | Abandoned Process Recovery |
| ACQ-12 | Abandoned Selection Recovery |
| ACQ-288 | Cart Abandonment Recovery |
| ACQ-287 | Checkout Abandonment Recovery |
| ACQ-09 | Lead Nurture |
| ACQ-285 | New Lead Welcome |
| ACQ-13 | Unresolved Interest Recovery |

### Activation, onboarding & early value — 7
| id | name |
|---|---|
| ACT-17 | Adoption Nurture |
| ACT-18 | Adoption Recovery |
| ACT-20 | Dormant Lead Reactivation |
| ACT-13 | Onboarding Blocker Reminder |
| ACT-14 | Onboarding Help |
| ACT-12 | Onboarding Nurture |
| ACT-19 | Onboarding Personalization |

### Engagement, retention & contactability — 7
| id | name |
|---|---|
| RET-28 | Cancellation Save |
| RET-24 | Churn Risk Escalation |
| RET-32 | Lapsed Customer Win-Back |
| RET-31 | Predicted Need Replenishment |
| RET-30 | Retention Offer Follow-Up |
| RET-26 | Service Recovery |
| CON-272 | Contact Recovery |

### Feedback, advocacy & relationship signals — 4
| id | name |
|---|---|
| FBK-42 | Advocacy Request |
| FBK-43 | Feedback Follow-Up |
| FBK-41 | Feedback Request |
| FBK-49 | Missing Information Reminder |

### Time, deadlines, expiry & temporary states — 5
| id | name |
|---|---|
| TIM-268 | Action Required Reminder |
| TIM-61 | Deadline Tracking |
| TIM-281 | Expired Access Recovery |
| TIM-63 | Expiry Reminder |
| TIM-274 | Grace Period Recovery |

### Access, identity & relationship — 5
| id | name |
|---|---|
| ACC-261 | Access Restriction Notice |
| ACC-263 | Activation Reminder |
| IDN-271 | Account Security Alert |
| IDN-84 | Verification Recovery |
| REL-284 | Invitation Reminder |

### Transactions, fulfillment & remedies — 6
| id | name |
|---|---|
| FIN-134 | Payment Failure Recovery |
| FUL-146 | Delivery Delay Alert |
| FUL-265 | Delivery Tracking |
| FUL-148 | Failed Delivery Recovery |
| REM-151 | Post-Purchase Issue Recovery |
| REM-157 | Remedy Confirmation |

### Subscriptions & scheduling — 6
| id | name |
|---|---|
| SUB-262 | Cancellation Confirmation |
| SUB-163 | Renewal Reminder |
| SCH-266 | Appointment Reminder |
| SCH-282 | Availability Search Abandonment |
| SCH-277 | Booking Confirmation |
| SCH-280 | No-Show Follow-Up |

### Risk, documents, rollout & incidents — 5
| id | name |
|---|---|
| RSK-273 | Usage Limit Alert |
| DOC-214 | Document Delivery |
| DOC-215 | Signature Reminder |
| RLT-279 | Upgrade Blocker Reminder |
| INC-254 | Incident Update |

---

## The 21 excluded from the public product

ACQ-04 · ACT-11 · CON-264 · CON-283 · FBK-46 · FBK-47 · IDN-81 · IDN-85 ·
IDN-270 · TRM-106 · TRM-275 · INT-269 · INT-278 · FIN-137 · FUL-276 · REM-152 ·
SCH-180 · DEC-184 · DEC-267 · DOC-220 · DOC-286

| id | name |
|---|---|
| ACQ-04 | High-Intent Lead Routing |
| ACT-11 | Onboarding Route Assignment |
| CON-264 | Contact Verification |
| CON-283 | Frequency Preference Update |
| FBK-46 | Complaint Resolution |
| FBK-47 | Appeal Review |
| IDN-81 | Identity Verification |
| IDN-85 | Login Verification |
| IDN-270 | Account Recovery |
| TRM-106 | Account Closure |
| TRM-275 | Data Deletion Confirmation |
| INT-269 | Integration Recovery |
| INT-278 | Integration Setup |
| FIN-137 | Refund Request |
| FUL-276 | Substitution Approval |
| REM-152 | Return Request |
| SCH-180 | Booking Reschedule |
| DEC-184 | More Information Request |
| DEC-267 | Adverse Decision Recovery |
| DOC-220 | Document Conflict Review |
| DOC-286 | Document Activation |

These stay in `src/canonical/` — deleting them would break the handoff targets
and `distinctFrom` references the canonical validator requires, exactly as the
Operational Workflows archive did. They are removed at the **publishing
boundary**, so they disappear from: the journey index, category listings and
counts, search and its index data, filters, related/cross-journey links,
featured journeys, navigation, the sitemap, public route generation, and both
the EN and TR trees. Their detail URLs stop resolving through the tree's own
`not-found` behaviour. Nothing is hidden with CSS.

---

## Channel taxonomy

The only customer-facing channels are **Email, SMS, Push, WhatsApp, In-app**
(`email`, `sms`, `push`, `whatsapp`, `in-app`).

`sales` and `task` exist in the canonical schema as operational handoff
behaviour. They are **not channels**: they never count toward a journey's
channel set, never render as a channel badge, and can never be the sole reason a
journey is public.

### `task` on three public journeys — resolved at the display layer

**ACT-13, FBK-43 and FBK-49** declare `task` in their canonical `channels`,
each alongside `email` and `in-app`. That declaration is *correct* and cannot be
deleted: `validate:canonical` requires a declared channel to be backed by an
action that does the work, in both directions, and all three genuinely raise an
internal work item (`execution: "human"`).

So the split happens where it belongs — at the one projection from canonical to
page. `publicChannels()` in `src/lib/canonical-view.ts` filters every public
row and detail to the five customer channels, so canonical keeps the
operational truth and no page ever shows "Task" beside "Email" as if internal
routing were a customer channel. Check 8 of the scope validator fails if any
raw `channels: j.channels` projection ever reaches a public surface again.

### RET-24 — the one real conflict, and where it is recorded

RET-24 Churn Risk Escalation has **zero** customer-facing communication nodes:
it assembles risk evidence and routes to RET-28, RET-23, RET-30 or an
account-owner task. Its only declared channel is `task`.

That puts two rules of this brief in direct contradiction — the scope list says
RET-24 is public, the channel rule says a public journey with no customer-facing
communication must fail. It was removed on that basis and then **restored**,
because its own `contact.competition` block already ranks it *above generic
retention intervention* with `onLoss: suppressed` — so the duplicate-ownership
hazard that argued against keeping it was already solved in its authored data.

It stays public with **one recorded exception** to the channel rule, named and
reasoned in `scripts/validate-public-scope.mjs` and printed on every run.
The full account is `audit/public-scope-validation.md`.
