import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 4 - CONSENT, PREFERENCES, COMMUNICATION & CONTACTABILITY

   Whether a message may be sent, and whether it can be.

   Five things are routinely stored in one boolean and mean five different
   things:

     IDENTITY       we know who this is
     PERMISSION     we are authorised to contact them, for a purpose,
                    on a channel, within a scope
     PREFERENCE     how they would like it done, if it is done
     CONTACTABILITY the channel can technically reach them
     DELIVERY       the message actually arrived

   The failures each collapse produces are asymmetric, and that asymmetry
   shapes every journey here. Mistaking preference for permission sends
   something nobody agreed to. Mistaking undeliverability for opting out
   silently ends a relationship the person never left. Mistaking delivery for
   outcome inflates every number downstream. One of those is a legal problem,
   one is an invisible loss, one is a measurement error - and they cannot be
   handled by the same mechanism.

   Permission is modelled throughout as purpose x channel x scope rather than
   as a flag, because every real question in this category - can this campaign
   run, does this withdrawal cover that message, which of two systems is right
   - is unanswerable against a boolean.

   CON-35 and CON-40 carry the load the others rest on: enforcement happens
   before propagation, and disagreement fails closed. 
   Consolidated during review: delivery-failure classification and recovery is
   owned by CMS-208 in the communication category, which raises permanent
   destination evidence back to CON-36 here. CON-36 remains the authoritative
   per-destination contactability lifecycle for the whole library. */

export const CONSENT_RULES: readonly OrchestrationRule[] = [
  {
    id: "CON-R1",
    scope: "consent",
    rule: "Identity, permission, preference, contactability and engagement are five separate states and none of them implies another.",
    because:
      "They arrive together at signup and get written to one record, which is why an email address so often becomes a subscription nobody asked for.",
  },
  {
    id: "CON-R2",
    scope: "consent",
    rule: "Permission is modelled as purpose x channel x scope, not as a flag.",
    because:
      "Every question that actually gets asked - may this campaign run, does this withdrawal cover that message, which system is right - has no answer against a boolean, so the answer gets guessed, and the guess is always the permissive one.",
  },
  {
    id: "CON-R3",
    scope: "consent",
    rule: "Permission withdrawal is enforced immediately on affected communication, before any downstream system has confirmed anything.",
    because:
      "Enforcement that waits for distributed convergence is enforcement that runs at the speed of the slowest integration, and the message goes out in the meantime.",
  },
  {
    id: "CON-R4",
    scope: "consent",
    rule: "Preference changes shape future eligible communication. They never create permission.",
    because:
      "Saying how you would prefer to be contacted is not saying you want to be, and the two are captured in the same forms often enough that the distinction has to be enforced rather than assumed.",
  },
  {
    id: "CON-R5",
    scope: "consent",
    rule: "A contactability failure does not change permission state, and a permission change does not mark a channel undeliverable.",
    because:
      "Collapsing them loses a reachable customer to a mailbox that was full for a week, or keeps sending to someone who opted out through a channel that still technically works.",
  },
  {
    id: "CON-R6",
    scope: "consent",
    rule: "An alternative channel may be used only where it is both permitted and appropriate to the journey.",
    because:
      "Availability is the easiest of the three to check and the least meaningful. Falling back to SMS because email bounced is a permission decision dressed as a routing one.",
  },
  {
    id: "CON-R7",
    scope: "consent",
    rule: "Every suppression carries an explicit reason and an explicit scope.",
    because:
      "Without them nothing can tell a cooldown from a legal restriction, so either everything is released too early or nothing is ever released at all.",
  },
  {
    id: "CON-R8",
    scope: "consent",
    rule: "When a temporary suppression or cooldown ends, current eligibility is re-evaluated. What was held is not replayed.",
    because:
      "The queue describes a state that has since moved. Releasing it delivers a week of messages at once, most of them about things that are no longer true.",
  },
  {
    id: "CON-R9",
    scope: "consent",
    rule: "Delivery retries are bounded by a budget fixed when the first failure occurs.",
    because:
      "An unbounded retry is indistinguishable from a working integration until it is examined, and by then it has been hammering a dead address for months.",
  },
  {
    id: "CON-R10",
    scope: "consent",
    rule: "A distributed permission conflict fails safe. The more permissive state is never chosen because it is more permissive.",
    because:
      "Defaulting to permissive resolves every disagreement in favour of sending, which converts an integration bug into a compliance incident.",
  },
  {
    id: "CON-R11",
    scope: "consent",
    rule: "Communication engagement is not a business outcome. Delivered is not read, read is not agreed.",
    because:
      "It is the same substitution ACQ-R4 and ACT-R10 forbid, arriving here from the other direction: the delivery pipeline emits engagement events by default and outcome events only if someone builds them.",
  },
  {
    id: "CON-R12",
    scope: "consent",
    rule: "Permission, preference and contactability history is preserved and auditable. Nothing is overwritten in place.",
    because:
      "The current value cannot answer the only questions that matter under challenge - what were we authorised to do, when, and on what evidence.",
  },
  {
    id: "CON-R13",
    scope: "consent",
    rule: "A queued action re-validates permission and suppression state at execution, not at scheduling.",
    because:
      "The gap between the two is where every late-arriving message lives, and it is the one moment at which the system can still avoid sending it.",
  },
  {
    id: "CON-R14",
    scope: "consent",
    rule: "Enforcement precedes propagation. Withdrawal stops outbound communication locally even while downstream systems are still catching up.",
    because:
      "Propagation can be retried; a message that has already been sent cannot. The ordering is chosen so the recoverable failure is the one that happens.",
  },
];

export const CONSENT_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ CON-31 */
  {
    id: "CON-31",
    slug: "permission-capture-and-scope",
    category: "consent",
    goal: "consent-permission",
    channels: [],
    name: "Permission capture → validate scope → activate or reject",
    shortName: "Permission Validation",
    purpose:
      "Turn a permission decision into an auditable record of what exactly was authorised, rather than a flag that says yes.",
    entity: {
      scope: "person plus the permission record, keyed by purpose, channel and scope",
      note: "One record per purpose x channel x scope. Consent to product notices by email is a different record from consent to marketing by email, and neither is a record about SMS.",
      instanceKey: [
        "person_id",
        "purpose_channel_scope_key"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "CON-32",
        because:
          "This creates authorisation. CON-32 records how someone would like authorised communication done, which is a different fact and must never be able to create this one.",
      },
    ],
    objective: "Turn a permission decision into an auditable record of what exactly was authorised, rather than a flag that says yes.",
    eligibility: [
      "a deliberate act of granting or refusing permission, identifying what is being permitted",
      "no instance of this journey is already open for the person plus the permission record",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Creating an account is not consent. Nor is providing contact details, which is how someone reaches a service rather than an invitation to be marketed to."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Permission on one channel never transfers to another. Email consent is not SMS consent."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "An ambiguous scope is read narrowly. The broad reading is the one that has to be asked for."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "A refusal is recorded as a decision, not as an absence - so that nothing later reads the silence as room to assume."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "person_id",
          "purpose_channel_scope_key",
          "decision",
          "scope_statement",
          "captured_at",
          "permission_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit",
        "refs": [
          "x.rejected",
          "x.active"
        ]
      },
      "secondary": [],
      "guardrails": [
        "state_written_on_stale_entity"
      ],
      "operational": [
        "entry_volume",
        "exit_distribution",
        "no_action_rate_by_reason",
        "time_to_exit"
      ]
    },
    discovery: {
      "aliases": [
        "permission validation",
        "consent capture",
        "consent record",
        "opt-in validation",
        "consent scope"
      ],
      "useCases": [
        "a deliberate opt-in recorded with exactly what it authorised",
        "an ambiguous scope read narrowly and recorded as such"
      ]
    },
    entry: "t.decision",
    nodes: [
      {
        id: "t.decision",
        kind: "trigger",
        event: "explicit_permission_decision_received",
        evidence: {
          requires: [
            "a deliberate act of granting or refusing permission, identifying what is being permitted",
          ],
          insufficientAlone: [
            "creating an account",
            "providing an email address or phone number",
            "accepting terms of service where consent was not separately given",
            "a pre-ticked box",
          ],
          source: "declared",
        },
        next: "a.capture",
      },
      {
        id: "a.capture",
        kind: "action",
        does: "Capture the permission type, the purpose, the channel, the scope, the source, the time, and the evidence or consent-text version where one is required - the version matters, because what someone agreed to is the wording in front of them at the time",
        writes: [{ field: "permission_log", mode: "append" }],
        next: "c.valid",
        idempotencyKey: "person_id + purpose_channel_scope_key + a.capture",
      },
      {
        id: "c.valid",
        kind: "condition",
        asks: "Is this a valid permission, and is its scope unambiguous?",
        branches: [
          {
            label: "Valid and clear",
            when: "the act was deliberate, the purpose and channel are identified, and the scope is unambiguous",
            to: "c.existing",
          },
          {
            label: "Valid but ambiguous scope",
            when: "permission was clearly given, but what it covers can be read more than one way",
            to: "a.narrow",
          },
          {
            label: "Not a permission",
            when: "the act does not constitute authorisation - an implied opt-in, a pre-ticked box, or a signup mistaken for consent",
            to: "x.rejected",
          },
        ],
      },
      {
        id: "a.narrow",
        kind: "action",
        does: "Record only the narrowest defensible reading, and flag the ambiguity so it can be resolved by asking rather than by assuming. Reading an unclear scope broadly is how one newsletter signup becomes a permission to send anything",
        writes: [{ field: "permission_log", mode: "append" }],
        next: "c.existing",
        idempotencyKey: "person_id + purpose_channel_scope_key + a.narrow",
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "not recorded as permission",
        terminal: false,
        reEntry:
          "a genuine permission decision later creates one normally; nothing partial is stored that a later process could mistake for consent",
        class: "invalid-state",
      },
      {
        id: "c.existing",
        kind: "condition",
        asks: "Does a permission already exist for this purpose, channel and scope?",
        branches: [
          {
            label: "Exists",
            when: "a prior record covers the same combination",
            to: "a.reconcile",
          },
          {
            label: "New",
            when: "no prior record covers it",
            to: "a.activate",
          },
        ],
      },
      {
        id: "a.reconcile",
        kind: "action",
        does: "Reconcile against the prior record using the authoritative rules for this permission type, appending rather than replacing - the previous grant, its source and its version stay readable, because a permission history is the only defence of what was sent under it",
        writes: [{ field: "permission_log", mode: "append" }],
        next: "x.active",
        idempotencyKey: "person_id + purpose_channel_scope_key + a.reconcile",
      },
      {
        id: "a.activate",
        kind: "action",
        does: "Activate the permission for exactly the purpose, channel and scope captured, and nothing adjacent to them",
        writes: [{ field: "permission_log", mode: "append" }],
        next: "x.active",
        idempotencyKey: "person_id + purpose_channel_scope_key + a.activate",
      },
      {
        id: "x.active",
        kind: "exit",
        state: "permission active for the captured purpose, channel and scope",
        terminal: false,
        reEntry:
          "any later decision on the same combination opens a new instance; changes to an active permission are CON-35's, not this journey's",
        class: "success",
      },
    ],
    guardrails: [
      "Creating an account is not consent. Nor is providing contact details, which is how someone reaches a service rather than an invitation to be marketed to.",
      "Permission on one channel never transfers to another. Email consent is not SMS consent.",
      "An ambiguous scope is read narrowly. The broad reading is the one that has to be asked for.",
      "A refusal is recorded as a decision, not as an absence - so that nothing later reads the silence as room to assume.",
    ],
    reusableRule:
      "Permission must represent an explicit, auditable authorization for a defined purpose and scope.",
  },

  /* ------------------------------------------------------------ CON-32 */
  {
    id: "CON-32",
    slug: "preference-capture",
    category: "consent",
    goal: "consent-permission",
    channels: [],
    name: "Preference capture → persist → personalise eligible communication",
    shortName: "Preference Capture",
    purpose:
      "Record how someone would like permitted communication done, in a store that structurally cannot become permission.",
    entity: {
      scope: "person plus the declared-preference profile",
      note: "Declared preferences live in their own store. Inferred interests live in another, and the two are never written to the same field.",
      instanceKey: [
        "person_id"
      ],
      concurrency: "one-active-per-key"
    },
    objective: "Record how someone would like permitted communication done, in a store that structurally cannot become permission.",
    eligibility: [
      "the person deliberately setting or changing a preference: frequency, topic, category, language, preferred channel, content type",
      "no instance of this journey is already open for the person plus the declared",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "A preference is not consent. Preferring email says nothing about wanting marketing."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Inferred behaviour and declared preference stay in separate stores. The confidence attached to them is different and the merge cannot be undone."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "A preference set where no permission exists is stored and applied to nothing."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "person_id",
          "declared_preferences"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.stored-only",
          "h.recalculate"
        ]
      },
      "secondary": [],
      "guardrails": [
        "state_written_on_stale_entity"
      ],
      "operational": [
        "entry_volume",
        "exit_distribution",
        "no_action_rate_by_reason",
        "time_to_exit"
      ]
    },
    discovery: {
      "aliases": [
        "preference capture",
        "preference centre",
        "communication preferences",
        "channel preference"
      ],
      "useCases": [
        "a declared frequency or channel preference stored where it cannot become permission",
        "a preference that changes running journeys, handed to recalculation"
      ]
    },
    entry: "t.set",
    nodes: [
      {
        id: "t.set",
        kind: "trigger",
        event: "preference_explicitly_set_or_changed",
        evidence: {
          requires: [
            "the person deliberately setting or changing a preference: frequency, topic, category, language, preferred channel, content type",
          ],
          insufficientAlone: [
            "behaviour that suggests a preference",
            "the channel someone happened to reply on",
            "a topic they clicked once",
          ],
          source: "declared",
        },
        next: "a.persist",
      },
      {
        id: "a.persist",
        kind: "action",
        does: "Persist the value with its source and the time it changed, into the store that holds declared answers only. Inference is written elsewhere - once the two share a field, nothing can tell what the person actually said",
        writes: [{ field: "declared_preferences", mode: "append" }],
        next: "c.permitted",
        idempotencyKey: "person_id + a.persist",
      },
      {
        id: "c.permitted",
        kind: "condition",
        asks: "Is the communication this preference would shape actually permitted?",
        branches: [
          {
            label: "Permitted",
            when: "an active permission covers the purpose and channel the preference applies to",
            to: "a.apply",
          },
          {
            label: "Not permitted",
            when: "no permission covers it - including the common case where someone states a channel preference without ever authorising that channel",
            to: "x.stored-only",
          },
        ],
      },
      {
        id: "x.stored-only",
        kind: "exit",
        state: "preference stored, shaping nothing",
        terminal: false,
        reEntry:
          "if permission is granted later the stored preference applies from that moment; the preference waited rather than authorised anything",
        class: "success",
      },
      {
        id: "a.apply",
        kind: "action",
        does: "Apply the preference to communication that is already permitted - which is the only thing a preference can do",
        next: "h.recalculate",
        idempotencyKey: "person_id + a.apply",
      },
      {
        id: "h.recalculate",
        kind: "handoff",
        to: "CON-33",
        on: "a preference that will change what already-running journeys should do",
        carries: [
          "the new value and what it replaced",
          "the explicit fact that permission has not changed, so nothing downstream reads this as a consent event",
        ],
      },
    ],
    guardrails: [
      "A preference is not consent. Preferring email says nothing about wanting marketing.",
      "Inferred behaviour and declared preference stay in separate stores. The confidence attached to them is different and the merge cannot be undone.",
      "A preference set where no permission exists is stored and applied to nothing.",
    ],
    reusableRule:
      "Preferences shape permitted experiences; they do not create permission to communicate.",
  },

  /* ------------------------------------------------------------ CON-33 */
  {
    id: "CON-33",
    slug: "preference-change-recalculation",
    category: "consent",
    goal: "consent-permission",
    channels: [],
    name: "Preference change → recalculate active journeys → suppress or adapt",
    shortName: "Preference Recalculation",
    purpose:
      "Make a preference change reach the messages already sitting in a queue, not just the profile field.",
    entity: {
      scope: "person plus the preference plus every active journey instance and queued action it touches",
      note: "The scope is deliberately wide on the forward side and closed on the backward one: everything not yet executed, nothing already delivered.",
      instanceKey: [
        "person_id"
      ],
      concurrency: "one-active-per-key"
    },
    objective: "Make a preference change reach the messages already sitting in a queue, not just the profile field.",
    eligibility: [
      "a recorded preference change with its previous value",
      "no instance of this journey is already open for the person plus the preference plus every active journey instance and queued action it touches",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "A preference change does not rewrite what has already been sent."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "A stale queued action never overrides a newer preference. Execution re-validates; scheduling is not a decision."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "A preference change is not a permission change, however much it reduces what gets sent."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "person_id",
          "declared_preferences",
          "suppressed_sends"
        ],
        "optional": [
          "adapted_sends"
        ]
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit",
        "refs": [
          "x.recalculated"
        ]
      },
      "secondary": [],
      "guardrails": [
        "state_written_on_stale_entity"
      ],
      "operational": [
        "entry_volume",
        "exit_distribution",
        "no_action_rate_by_reason",
        "time_to_exit"
      ]
    },
    discovery: {
      "aliases": [
        "preference recalculation",
        "preference change propagation",
        "queued message recalculation",
        "apply preference to running journeys"
      ],
      "useCases": [
        "a preference change that must reach messages already queued",
        "adapting rather than suppressing a send the new preference reshapes"
      ]
    },
    entry: "t.changed",
    nodes: [
      {
        id: "t.changed",
        kind: "trigger",
        event: "authoritative_preference_changed",
        evidence: {
          requires: ["a recorded preference change with its previous value"],
          insufficientAlone: [
            "a preference inferred from behaviour rather than declared",
            "a permission change, which is a different fact and reaches queued sends through suppression, not here"
          ],
          source: "authoritative",
        },
        next: "a.history",
      },
      {
        id: "a.history",
        kind: "action",
        does: "Persist the new value keeping the change history - what it was, what it became, and when. Messages already delivered under the old preference are not rewritten and not apologised for; they were correct when they went",
        writes: [{ field: "declared_preferences", mode: "append" }],
        next: "a.identify",
        idempotencyKey: "person_id + a.history",
      },
      {
        id: "a.identify",
        kind: "action",
        does: "Identify the active journey instances and queued actions this preference touches. The queue is the point: a preference that only affects what has not been scheduled yet changes nothing anyone notices",
        next: "c.conflict",
      },
      {
        id: "c.conflict",
        kind: "condition",
        asks: "How does each pending action stand against the new preference?",
        branches: [
          {
            label: "Now unwanted",
            when: "the new preference means this action should not happen at all - a topic removed, a category switched off",
            to: "a.suppress",
          },
          {
            label: "Reshaped, not forbidden",
            when: "the action still happens but differently - a changed language, a changed format, a changed level of detail",
            to: "a.adapt",
          },
          {
            label: "Unaffected",
            when: "nothing pending conflicts",
            to: "x.recalculated",
          },
        ],
      },
      {
        id: "a.suppress",
        kind: "action",
        does: "Suppress the conflicting actions before they execute. A queued action written under the old preference must not be allowed to overwrite the new one simply by arriving first",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "x.recalculated",
        idempotencyKey: "person_id + a.suppress",
      },
      {
        id: "a.adapt",
        kind: "action",
        does: "Adapt the pending actions to the new preference before execution rather than after - adapting afterwards is called an apology",
        writes: [{ field: "adapted_sends", mode: "append" }],
        next: "x.recalculated",
        idempotencyKey: "person_id + a.adapt",
      },
      {
        id: "x.recalculated",
        kind: "exit",
        state: "future orchestration aligned to the new preference; permission unchanged",
        terminal: false,
        reEntry: "the next preference change re-opens this",
        class: "success",
      },
    ],
    guardrails: [
      "A preference change does not rewrite what has already been sent.",
      "A stale queued action never overrides a newer preference. Execution re-validates; scheduling is not a decision.",
      "A preference change is not a permission change, however much it reduces what gets sent.",
    ],
    reusableRule:
      "Preference changes should affect future eligible orchestration, including actions already queued but not yet executed.",
  },

  /* ------------------------------------------------------------ CON-34 */
  {
    id: "CON-34",
    slug: "frequency-preference-recalculation",
    category: "consent",
    goal: "consent-permission",
    channels: [],
    name: "Communication frequency change → recalculate cadence → apply prospectively",
    shortName: "Frequency Recalculation",
    purpose:
      "Recalculate how often optional communication may go out, without letting that quietly reach the messages someone has to receive.",
    entity: {
      scope: "person plus the communication classes the frequency preference actually governs",
      note: "The governed set is the whole question. A frequency preference that silently covers required communication is an opt-out nobody chose. This mechanism is a pure event-driven entry point - it is reached whenever frequency_preference_changed fires from wherever a person declares a cadence change (a preference center, a support-assisted change, an API), the same shallow entry-point shape as CMS-201/CON-35/OPS-121, not something another canonical journey hands off into.",
      instanceKey: ["person_id"],
      concurrency: "one-active-per-key",
    },
    distinctFrom: [
      {
        journey: "CON-33",
        because:
          "A frequency preference changes how much rather than what, which means recalculating a cadence across classes rather than adapting individual queued actions.",
      },
    ],
    entry: "t.frequency",
    nodes: [
      {
        id: "t.frequency",
        kind: "trigger",
        event: "frequency_preference_changed",
        evidence: {
          requires: [
            "a deliberate change to how often communication should arrive - weekly to monthly, everything to important only, a reduction to a stated minimum",
          ],
          insufficientAlone: ["a decline in engagement, which is a signal rather than an instruction"],
          source: "declared",
        },
        next: "a.classes",
      },
      {
        id: "a.classes",
        kind: "action",
        does: "Determine which communication classes this preference governs. By default that is optional communication only, and the default is the one that holds unless a policy explicitly says otherwise",
        next: "c.required",
      },
      {
        id: "c.required",
        kind: "condition",
        asks: "Does the governing policy extend this preference to required or transactional communication?",
        branches: [
          {
            label: "Policy extends it",
            when: "a specific policy says this preference covers required communication too, naming which",
            to: "a.include",
          },
          {
            label: "Optional only",
            when: "no such policy - the ordinary case",
            to: "a.exclude",
          },
        ],
      },
      {
        id: "a.include",
        kind: "action",
        does: "Include the required classes the policy names, and only those, recording which policy authorised it",
        writes: [{ field: "cadence_policy_applied", mode: "append" }],
        next: "a.recalculate",
        idempotencyKey: "person_id + a.include",
      },
      {
        id: "a.exclude",
        kind: "action",
        does: "Leave required and transactional communication governed by its own rules. Someone asking for fewer marketing emails has not asked to stop hearing that their service is being suspended",
        next: "a.recalculate",
      },
      {
        id: "a.recalculate",
        kind: "action",
        does: "Recalculate the future cadence for the governed classes. Messages already delivered are untouched - a cadence change is prospective by definition",
        writes: [{ field: "cadence_state", mode: "set" }],
        next: "c.queued",
      },
      {
        id: "c.queued",
        kind: "condition",
        asks: "Does what is already queued exceed the new cadence?",
        branches: [
          {
            label: "Exceeds",
            when: "more optional communication is scheduled than the new preference allows",
            to: "a.trim",
          },
          {
            label: "Within it",
            when: "the queue already fits",
            to: "x.applied",
          },
        ],
      },
      {
        id: "a.trim",
        kind: "action",
        does: "Suppress or reschedule the optional communication that now exceeds the cadence, choosing between the two by whether the message keeps its meaning later",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "x.applied",
        idempotencyKey: "person_id + a.trim",
      },
      {
        id: "x.applied",
        kind: "exit",
        state: "cadence recalculated prospectively; permission untouched",
        terminal: false,
        reEntry: "the next frequency change re-opens this",
      },
    ],
    guardrails: [
      "A frequency reduction is not a global opt-out. Fewer is not none, and treating it as none loses the relationship the person was trying to keep.",
      "A marketing frequency preference does not close critical transactional communication.",
      "A cadence change never retroactively alters messages already delivered.",
    ],
    reusableRule:
      "Frequency preferences modify future optional communication cadence without silently changing unrelated permission states.",
  },

  /* ------------------------------------------------------------ CON-35 */
  {
    id: "CON-35",
    slug: "permission-change-enforcement",
    category: "consent",
    goal: "consent-permission",
    channels: [],
    name: "Consent or permission change → immediate enforcement → propagate",
    shortName: "Permission Change Enforcement",
    purpose:
      "Stop affected communication the moment permission changes, and let the distributed systems catch up afterwards.",
    entity: {
      scope: "person plus the permission record that changed, at its purpose, channel and scope",
      note: "Enforcement is scoped to what actually changed. A withdrawal of marketing email consent does not suspend service notices, and treating it as though it did is its own failure. change_version is a counter maintained per (person, purpose, channel, scope) combination, so it disambiguates successive changes on the same permission without colliding across different ones; change_origin names the system the change came from. Both are what a.propagate's own guardrail means by \"origin and version\" - carried explicitly, not left as an unnamed concept.",
      instanceKey: ["person_id", "change_version"],
      concurrency: "one-active-per-key",
    },
    distinctFrom: [
      {
        journey: "CON-31",
        because:
          "CON-31 creates a permission. This changes one that exists, and the difference that matters is that a change can be a withdrawal, which has to be enforced before it has been agreed anywhere else.",
      },
    ],
    entry: "t.change",
    nodes: [
      {
        id: "t.change",
        kind: "trigger",
        event: "authoritative_permission_change",
        evidence: {
          requires: [
            "a recorded transition on an existing permission: opted in to opted out, allowed to restricted, or a scope reduced or widened",
          ],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the old state, the new state, the source, the time, and the scope, purpose and channel it applies to - appended, because the question later is always what we were authorised to do at a particular moment. Assigns change_version for this transition and records change_origin, the system it came from",
        writes: [{ field: "permission_log", mode: "append" }],
        next: "c.direction",
        idempotencyKey: "person_id + change_version + a.record",
      },
      {
        id: "c.direction",
        kind: "condition",
        asks: "Does this reduce permission or extend it?",
        branches: [
          {
            label: "Withdrawal or restriction",
            when: "permission is removed, narrowed or restricted",
            to: "a.enforce",
          },
          {
            label: "Grant or extension",
            when: "permission is given or widened",
            to: "a.propagate",
          },
        ],
      },
      {
        id: "a.enforce",
        kind: "action",
        does: "Suppress the affected outbound communication now, including everything queued, without waiting for any downstream system to acknowledge anything. The asymmetry is deliberate: a grant applied late costs a message that could have been sent, a withdrawal applied late costs one that should not have been",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "a.propagate",
        idempotencyKey: "person_id + change_version + a.enforce",
      },
      {
        id: "a.propagate",
        kind: "action",
        does: "Propagate the new state to the dependent systems, carrying change_origin and change_version so that an out-of-order echo cannot revert it and a redelivery cannot restart the exchange - a dependent system applies a propagation only if its incoming change_version is newer than what it already holds for this (person_id, purpose, channel, scope), which is what makes redelivery and reordering both safe",
        next: "w.converge",
      },
      {
        id: "w.converge",
        kind: "wait",
        until: ["the required propagation confirmations arrive"],
        onEvent: "c.consistent",
        timeout: {
          after: "the synchronisation SLA for this permission type",
          reason:
            "convergence that has not happened by its deadline is a conflict, and calling it one is what gets it looked at - enforcement is already in force either way",
        },
        onTimeout: "h.conflict",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.consistent",
        kind: "condition",
        asks: "Do the dependent systems now agree?",
        branches: [
          {
            label: "Consistent",
            when: "every required system confirms the new state at the expected version",
            to: "x.consistent",
          },
          {
            label: "Divergent",
            when: "at least one system reports a different state",
            to: "h.conflict",
          },
        ],
      },
      {
        id: "h.conflict",
        kind: "handoff",
        to: "CON-40",
        on: "systems failing to converge on the new permission state",
        carries: [
          "the intended state with change_version and change_origin",
          "disputed_permission_ref, derived from this change's own (purpose, channel, scope), which CON-40's own conflict instance is keyed on",
          "which systems disagree and what each of them holds",
          "the fact that local enforcement is already applied, so the conflict is about consistency rather than about whether to send",
        ],
        contract: { requiredFields: ["person_id", "disputed_permission_ref"] },
      },
      {
        id: "x.consistent",
        kind: "exit",
        state: "permission change enforced and consistent across dependent systems",
        terminal: false,
        reEntry: "the next change on this permission opens a new instance",
      },
    ],
    guardrails: [
      "Withdrawal never waits for a campaign schedule, a batch window, or a downstream acknowledgement.",
      "Communication already queued is invalidated wherever that is technically possible, and where it is not, that limitation is recorded rather than assumed away.",
      "Permission history is preserved. The current value alone cannot answer what we were allowed to do last month.",
      "Enforcement is scoped to the purpose, channel and scope that changed - a withdrawal is not an excuse to stop everything.",
    ],
    reusableRule:
      "Permission withdrawal should be enforced immediately and propagated asynchronously rather than waiting for distributed systems to converge.",
  },

  /* ------------------------------------------------------------ CON-36 */
  {
    id: "CON-36",
    slug: "channel-contactability-state",
    category: "consent",
    goal: "delivery-confirmation",
    channels: [],
    name: "Channel contactability change → recalculate reachability → route or suppress",
    shortName: "Contactability Recalculation",
    purpose:
      "Track whether a channel can reach someone, as a state entirely separate from whether it may, and keep each destination's route health separately so future sending routes around what is broken.",
    entity: {
      scope: "person plus the specific contact point - this address, this number, this device token",
      note: "Contactability belongs to the contact point, not the person and not the channel class. One dead device token does not make push unreachable, and there is deliberately no person-level reachable flag - one would erase every route the failing one is not.",
      instanceKey: ["contact_point_id"],
      concurrency: "one-active-per-key",
    },
    distinctFrom: [
      {
        journey: "CON-35",
        because:
          "One is about capability and the other about authorisation. They are stored separately precisely so that a bounce can never look like an opt-out.",
      },
    ],
    entry: "t.contactability",
    nodes: [
      {
        id: "t.contactability",
        kind: "trigger",
        event: "channel_contactability_materially_changed",
        evidence: {
          requires: [
            "a change in whether a contact point can technically be reached: an address becoming undeliverable, a number found invalid, a push token expired or refreshed, an address corrected, a channel restored, or a new destination verified and added",
          ],
          insufficientAlone: [
            "a single soft failure that resolved on retry",
            "silence from the recipient, which says nothing about deliverability",
          ],
          source: "authoritative",
        },
        next: "a.state",
      },
      {
        id: "a.state",
        kind: "action",
        does: "Update the contactability state to CONTACTABLE, TEMPORARILY_UNAVAILABLE, UNDELIVERABLE, INVALID or RESTORED, leaving permission untouched - a channel that cannot reach someone has expressed no opinion about whether it may",
        writes: [{ field: "contactability_log", mode: "append" }],
        next: "c.state",
        idempotencyKey: "contact_point_id + a.state",
      },
      {
        id: "c.state",
        kind: "condition",
        asks: "What does the evidence establish about this contact point?",
        branches: [
          {
            label: "Restored or contactable",
            when: "the contact point works again",
            to: "a.resume",
          },
          {
            label: "A newly added or verified destination",
            when: "a route has been added or verified for the first time",
            to: "a.add",
          },
          {
            label: "Unavailable",
            when: "temporarily unavailable, undeliverable or invalid",
            to: "a.suppress",
          },
        ],
      },
      {
        id: "a.add",
        kind: "action",
        does: "Make the new destination available for future eligible communication. Available is not consented - a verified address is a route, and whether it may carry a given purpose is a separate question decided separately",
        writes: [{ field: "contactability_log", mode: "append" }],
        next: "c.pending",
        idempotencyKey: "contact_point_id + a.add",
      },
      {
        id: "a.resume",
        kind: "action",
        does: "Allow future eligible communication on this contact point again, recorded from the current evidence rather than by clearing the history of why it was suppressed. The prior failures stay readable, because a route that keeps breaking and being restored is worth being able to see. What was missed while it was unreachable is not replayed - the queue described a state that has since moved",
        writes: [{ field: "contactability_log", mode: "append" }],
        next: "c.pending",
        idempotencyKey: "contact_point_id + a.resume",
      },
      {
        id: "c.pending",
        kind: "condition",
        asks: "Is any pending communication waiting on this contact point?",
        branches: [
          {
            label: "Some is waiting",
            when: "obligations were held for this destination, or were routed away from it while it was unusable",
            to: "h.reroute",
          },
          {
            label: "None",
            when: "nothing outstanding depends on this contact point",
            to: "x.resumed",
          },
        ],
      },
      {
        id: "h.reroute",
        kind: "handoff",
        to: "CMS-202",
        on: "pending communication affected by a change in this destination's health",
        carries: [
          "each affected obligation's own obligation_id - this fans out to CMS-202 once per obligation, not once for the batch",
          "the affected obligations and the destination whose state changed",
          "the explicit instruction to re-resolve destinations rather than to resend - nothing was delivered to the failing route",
        ],
        contract: { requiredFields: ["obligation_id"] },
      },
      {
        id: "x.resumed",
        kind: "exit",
        state: "contact point reachable again; nothing replayed",
        terminal: false,
        reEntry: "the next contactability change re-opens this",
      },
      {
        id: "a.suppress",
        kind: "action",
        does: "Suppress future attempts on this contact point according to the failure class - a temporary failure and a permanently invalid destination are not held the same way and must not be recorded as though they were. Historical delivery records are untouched: a message delivered to this address last year was delivered, and rewriting that to match today's state destroys the record of what the person was actually told",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "c.pending-blocked",
        idempotencyKey: "contact_point_id + a.suppress",
      },
      {
        id: "c.pending-blocked",
        kind: "condition",
        asks: "Is any pending communication aimed at this contact point?",
        branches: [
          {
            label: "Some is aimed at it",
            when: "obligations are queued against a destination that has just become unusable",
            to: "h.reroute",
          },
          {
            label: "None",
            when: "nothing outstanding is routed here",
            to: "c.alternative",
          },
        ],
      },
      {
        id: "c.alternative",
        kind: "condition",
        asks: "What can reach this person instead?",
        branches: [
          {
            label: "A permitted, appropriate alternative",
            when: "another channel is both covered by permission for this purpose and appropriate to what the journey is doing",
            to: "x.alternative",
          },
          {
            label: "Nothing yet, but the failure is temporary",
            when: "the contact point may come back and the communication can wait for it",
            to: "w.restore",
          },
          {
            label: "Nothing, and it matters",
            when: "no permitted alternative exists and the communication is important enough that a person should know",
            to: "h.human",
          },
          {
            label: "Nothing, and it can wait",
            when: "no permitted alternative exists and nothing needs escalating",
            to: "x.unreachable",
          },
        ],
      },
      {
        id: "x.alternative",
        kind: "exit",
        state: "unreachable here, reachable elsewhere with permission",
        terminal: false,
        reEntry:
          "the sending journey decides whether to use the alternative; this journey establishes that it is allowed to, which is not the same as recommending it",
      },
      {
        id: "w.restore",
        kind: "wait",
        until: ["the contact point becomes reachable again"],
        onEvent: "a.resume",
        timeout: {
          after: "the horizon for this failure class",
          reason:
            "a temporary failure that lasts long enough stops being temporary, and holding it in that state indefinitely hides a contact point that needs correcting",
        },
        onTimeout: "x.unreachable",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.human",
        kind: "handoff",
        to: "external:human-in-the-loop-lifecycle",
        on: "an important communication with no permitted way to deliver it",
        carries: [
          "which contact points failed and how",
          "what needed to reach them, so a person can decide whether another route is worth it",
        ],
      },
      {
        id: "x.unreachable",
        kind: "exit",
        state: "no permitted, working channel; permission unchanged",
        terminal: false,
        reEntry:
          "a corrected contact point or a new permission re-opens this - the person has not opted out, and nothing here may be recorded as though they had",
      },
    ],
    guardrails: [
      "Undeliverable is not opted out. A full mailbox is not a decision.",
      "Opted out is not undeliverable. The channel still works; we are simply not allowed to use it.",
      "An available alternative channel is not permission to use it. Availability is the easiest thing to check and the least meaningful.",
      "Consent is never inferred from contactability. A newly verified destination is a route, not a permission.",
      "One destination failing does not make the person globally unreachable; state is held per destination.",
      "Historical delivery records remain unchanged when a destination's health changes.",
      "A request to repair a broken contact point goes out on a different verified channel, or it does not go out at all. Asking somebody to fix an address by sending to that address is the failure repeating itself.",
      "Repair attempts are bounded per cycle. A contact point that fails re-verification stays suppressed rather than being retried blind, and a corrected value is verified before the destination is treated as usable."
    ],
    reusableRule:
      "Contactability describes whether a channel can technically reach the user; permission determines whether it may be used.",
  },

  /* ------------------------------------------------------------ CON-38 */
  {
    id: "CON-38",
    slug: "communication-suppression-state",
    category: "consent",
    goal: "suspension-restoration",
    channels: [],
    name: "Communication suppression → reason → release or persist",
    shortName: "Communication Suppression",
    purpose:
      "Make every reason something is not being sent an explicit, scoped, releasable state rather than an absence.",
    entity: {
      scope: "the person, message or journey instance the suppression applies to, at the scope recorded with it",
      note: "The scope is part of the record. A cooldown on one channel and a legal restriction across all of them are both suppressions and share nothing else.",
      instanceKey: [
        "person_id",
        "suppression_scope"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "CON-39",
        because:
          "A cooldown is one reason among the nine this journey holds. It has its own journey because its release is time-based and its scope is deliberately partial, which the general mechanism does not assume.",
      },
      {
        journey: "CON-300",
        because:
          "CON-300 decides that continued marketing contact is no longer warranted and hands the result here. What it produces is the sender-side kind of suppression this journey keeps apart from a permission the person withdrew: it is recorded against our own sending, it is scoped to every promotional and lifecycle send addressed to that person and to nothing they hold, owe or are owed, and this journey releases it by asking for permission again rather than by switching sending back on.",
      },
    ],
    objective: "Make every reason something is not being sent an explicit, scoped, releasable state rather than an absence.",
    eligibility: [
      "a condition that stops communication: permission withdrawn, a frequency policy, a contactability failure, a higher-priority journey taking ownership, a legal or policy restriction, a cooldown, a duplicate, an existing human resolution, or a temporary incident",
      "no instance of this journey is already open for the the person",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Suppression is not deletion. Nothing is removed; sending is stopped."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Release is not replay. What was held is discarded and current eligibility is recalculated."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "Different reasons carry different scopes, and a suppression without its scope cannot be released correctly."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "Suppression we impose on ourselves is a separate state from permission the person gave us. A sender-side hold is not an unsubscribe, it is recorded against our own sending rather than against their consent, and nobody may read it as a decision they made."
      },
      {
        "id": "s.g5",
        "label": "CANONICAL_RULE",
        "text": "Releasing a sender-side suppression asks for permission again rather than switching sending back on. Silence long enough to suppress for is not consent that survived it."
      },
      {
        "id": "s.g6",
        "label": "CANONICAL_RULE",
        "text": "A suppression is held here and read out there. The scope recorded at a.record is what the journeys it binds gate on, so a scope nothing reads is not a suppression at all - it is a log line. The sunset scope CON-300 hands over covers every promotional and lifecycle send addressed to the person, and each of those journeys names that state from its own side; what they hold, owe or are owed is outside it and keeps running."
      }
    ],
    implementation: {
      "attributes": {
        "required": [
          "person_id",
          "suppression_scope",
          "reason",
          "release_condition",
          "suppression_log"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit",
        "refs": [
          "x.persistent",
          "x.released"
        ]
      },
      "secondary": [],
      "guardrails": [
        "state_written_on_stale_entity"
      ],
      "operational": [
        "entry_volume",
        "exit_distribution",
        "no_action_rate_by_reason",
        "time_to_exit"
      ]
    },
    discovery: {
      "aliases": [
        "communication suppression",
        "do-not-contact",
        "suppression list",
        "send hold",
        "global suppression"
      ],
      "useCases": [
        "permission withdrawn, a frequency cap hit, or a legal hold recorded as a scoped suppression",
        "releasing a suppression by re-evaluating current state rather than replaying a backlog"
      ]
    },
    entry: "t.suppression",
    nodes: [
      {
        id: "t.suppression",
        kind: "trigger",
        event: "suppression_condition_became_active",
        evidence: {
          requires: [
            "a condition that stops communication: permission withdrawn, a frequency policy, a contactability failure, a higher-priority journey taking ownership, a legal or policy restriction, a cooldown, a duplicate, an existing human resolution, or a temporary incident",
          ],
          insufficientAlone: [
            "a soft delivery failure, which is a transient route fact",
            "a preference reduction, which reshapes communication rather than stopping it",
            "an internal hold with no recorded reason"
          ],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the reason, the scope, the source, the start time, and the release condition where one exists. Scope carries as much weight as reason: without it nothing downstream can tell what is still allowed",
        writes: [{ field: "suppression_log", mode: "append" }],
        next: "c.kind",
        idempotencyKey: "person_id + a.record",
      },
      {
        id: "c.kind",
        kind: "condition",
        asks: "Does this suppression have a definable release condition?",
        branches: [
          {
            label: "Temporary",
            when: "a condition or a time will end it - a cooldown, an incident, a frequency window, a case being closed",
            to: "w.release",
          },
          {
            label: "Persistent",
            when: "it stands until an authoritative state changes - a withdrawal, a legal restriction, an invalid contact point",
            to: "x.persistent",
          },
        ],
      },
      {
        id: "x.persistent",
        kind: "exit",
        state: "suppressed until the underlying state changes",
        terminal: false,
        reEntry:
          "a change to the state that caused it opens a new evaluation. Nothing was deleted here - the person, their history and their record are intact, and only sending is stopped",
        class: "suppression",
      },
      {
        id: "w.release",
        kind: "wait",
        until: [
          "release_condition_met"
        ],
        onEvent: "a.reevaluate",
        timeout: {
          "after": {
            "key": "communication_suppression.release",
            "rule": "A review horizon appropriate to the reason.",
            "class": "observation-window",
            "required": true
          },
          "reason": "a temporary suppression whose release condition never arrives has quietly become permanent, and the review is what forces that to be said out loud",
          "relativeTo": "trigger"
        },
        onTimeout: "c.still",
        windowExtendsOnEngagement: false,
        recheck: "the the person re-read from the system of record before acting on the timeout",
      },
      {
        id: "c.still",
        kind: "condition",
        asks: "At review, does the reason still hold?",
        branches: [
          {
            label: "Still valid",
            when: "the condition that caused it has not gone away",
            to: "x.persistent",
          },
          {
            label: "No longer valid",
            when: "the reason has lapsed even though no release event fired",
            to: "a.reevaluate",
          },
        ],
      },
      {
        id: "a.reevaluate",
        kind: "action",
        does: "Re-evaluate what the affected journeys should do now, and act on that. What was held during the suppression is not replayed - those messages described a state that has since moved, and delivering a week of them at once is how a release becomes worse than the suppression",
        writes: [{ field: "suppression_log", mode: "append" }],
        next: "x.released",
        idempotencyKey: "person_id + a.reevaluate",
      },
      {
        id: "x.released",
        kind: "exit",
        state: "suppression released; current state re-evaluated, backlog discarded",
        terminal: false,
        reEntry: "any new suppression condition opens its own instance with its own reason and scope",
        class: "success",
      },
    ],
    guardrails: [
      "Suppression is not deletion. Nothing is removed; sending is stopped.",
      "Release is not replay. What was held is discarded and current eligibility is recalculated.",
      "Different reasons carry different scopes, and a suppression without its scope cannot be released correctly.",
      "Suppression we impose on ourselves is a separate state from permission the person gave us. A sender-side hold is not an unsubscribe, it is recorded against our own sending rather than against their consent, and nobody may read it as a decision they made.",
      "Releasing a sender-side suppression asks for permission again rather than switching sending back on. Silence long enough to suppress for is not consent that survived it.",
      "A scope nothing downstream reads is a log line, not a suppression. The journeys a scope binds name that state themselves."
    ],
    reusableRule:
      "Suppression should be explicit, scoped and reversible only when its underlying reason is no longer valid.",
  },

  /* ------------------------------------------------------------ CON-39 */
  {
    id: "CON-39",
    slug: "communication-cooldown",
    category: "consent",
    goal: "suspension-restoration",
    channels: [],
    name: "Communication cooldown → hold optional messaging → re-evaluate",
    shortName: "Communication Cooldown",
    purpose:
      "Reduce optional communication pressure for a while, without touching permission and without covering more than it needs to.",
    entity: {
      scope: "person or account plus the communication context the cooldown was created for",
      note: "A cooldown covers what its reason justifies. One that reaches every channel by default is an opt-out that nobody chose and nobody can find. cooldown_context is established at a.create itself, so a.create's own idempotency is scoped coarser (person_id alone) than the actions that follow it.",
      instanceKey: ["person_id", "cooldown_context"],
      concurrency: "one-active-per-key",
    },
    entry: "t.cooldown",
    nodes: [
      {
        id: "t.cooldown",
        kind: "trigger",
        event: "cooldown_triggering_event",
        evidence: {
          requires: [
            "an event that justifies a quiet period: a recent service recovery, a critical external alert, an explicit decline, unusually dense recent communication, a sensitive interaction, or a recent retention attempt",
          ],
          source: "authoritative",
        },
        next: "a.create",
      },
      {
        id: "a.create",
        kind: "action",
        does: "Create the cooldown scoped to what its reason actually justifies, recording the reason, the scope, the start, and either an expiry or the condition that would end it early. Establishes cooldown_context itself",
        writes: [{ field: "cooldown_log", mode: "append" }],
        next: "c.scope",
        idempotencyKey: "person_id + a.create",
      },
      {
        id: "c.scope",
        kind: "condition",
        asks: "Does this reason justify holding required or safety communication as well?",
        branches: [
          {
            label: "Optional only",
            when: "the ordinary case - the reason concerns pressure, not safety",
            to: "w.cooldown",
          },
          {
            label: "Policy extends it",
            when: "a specific policy names required communication that should also be held, and says why",
            to: "a.policy-scope",
          },
        ],
      },
      {
        id: "a.policy-scope",
        kind: "action",
        does: "Extend the cooldown only to the required communication the policy names, recording which policy did it - so the extension is attributable rather than inherited",
        writes: [{ field: "cooldown_log", mode: "append" }],
        next: "w.cooldown",
        idempotencyKey: "person_id + cooldown_context + a.policy-scope",
      },
      {
        id: "w.cooldown",
        kind: "wait",
        until: ["an authoritative change to the condition that created the cooldown"],
        onEvent: "c.basis",
        timeout: {
          after: "the cooldown period",
          reason:
            "the ordinary end of a cooldown is that it expires, so the timeout is the normal path rather than the exception",
        },
        onTimeout: "a.reevaluate",
        windowExtendsOnEngagement: false,
        recheck: "current eligibility for the governed classes, re-read from authoritative state before re-evaluating - not the state as it stood when the cooldown began",
      },
      {
        id: "c.basis",
        kind: "condition",
        asks: "How did the underlying condition change?",
        branches: [
          {
            label: "Reason has gone",
            when: "what justified the quiet period has been resolved earlier than expected",
            to: "a.reevaluate",
          },
          {
            label: "Reason has hardened",
            when: "the situation has become one that warrants an explicit, reasoned suppression rather than a timed hold",
            to: "h.suppression",
          },
        ],
      },
      {
        id: "h.suppression",
        kind: "handoff",
        to: "CON-38",
        on: "a cooldown outgrown by its own cause",
        carries: [
          "person_id and suppression_scope (the cooldown's own communication context, carried forward as CON-38's own scope), which CON-38's own instance is keyed on",
          "the cooldown's reason and scope, and what changed",
          "the fact that this needs a stated reason and release condition rather than an expiry",
        ],
        contract: { requiredFields: ["person_id", "suppression_scope"] },
      },
      {
        id: "a.reevaluate",
        kind: "action",
        does: "Re-evaluate what is eligible now and act on that. Anything queued when the cooldown began is discarded rather than released - a cooldown that ends by flushing a backlog has achieved nothing except a delay",
        writes: [{ field: "cooldown_log", mode: "append" }],
        next: "x.released",
        idempotencyKey: "person_id + cooldown_context + a.reevaluate",
      },
      {
        id: "x.released",
        kind: "exit",
        state: "cooldown ended; current eligibility recalculated, backlog discarded",
        terminal: false,
        reEntry: "a new cooldown-triggering event creates a new one with its own reason and scope",
      },
    ],
    guardrails: [
      "A cooldown is not a global opt-out. Permission is untouched throughout.",
      "A cooldown need not cover every channel, and covering all of them by default is how a quiet period becomes an unsearchable opt-out.",
      "Expiry does not restart a stale campaign queue. What was held is discarded and eligibility is recalculated from the current state.",
      "Required and safety communication is evaluated separately and is only held where a named policy says so.",
    ],
    reusableRule:
      "Cooldown temporarily reduces optional communication pressure without changing the underlying permission relationship.",
  },

  /* ------------------------------------------------------------ CON-40 */
  {
    id: "CON-40",
    slug: "permission-conflict-failsafe",
    category: "consent",
    goal: "reconciliation-correction",
    channels: [],
    name: "Permission conflict → fail-safe state → reconcile → restore",
    shortName: "Permission Conflict Resolution",
    purpose:
      "Hold optional communication closed while two systems disagree about permission, and reconcile on evidence rather than on whichever value allows more.",
    entity: {
      scope: "person plus the specific permission type, channel and purpose that disagrees",
      note: "Only the disputed combination is suppressed. A conflict about marketing email does not close service notices, and widening it would make the fail-safe worse than the failure. disputed_permission_ref stands for the (permission_type, channel, purpose) combination a.scope resolves - one conflict instance per disputed combination, distinct from CON-35's own change_version (a conflict is about which value is right, not about a single ordered change).",
      instanceKey: ["person_id", "disputed_permission_ref"],
      concurrency: "one-active-per-key",
    },
    distinctFrom: [
      {
        journey: "CON-35",
        because:
          "CON-35 propagates a state it knows to be right. This one runs when nobody knows which state is right, which is why it starts by closing rather than by deciding.",
      },
    ],
    entry: "t.conflict",
    nodes: [
      {
        id: "t.conflict",
        kind: "trigger",
        event: "conflicting_permission_states_detected",
        evidence: {
          requires: [
            "two or more systems reporting different states for the same person, permission type, channel and purpose",
          ],
          insufficientAlone: [
            "a system that has not yet received a change that is still propagating within its SLA",
          ],
          source: "authoritative",
        },
        next: "a.failsafe",
      },
      {
        id: "a.failsafe",
        kind: "action",
        does: "Suppress the affected optional outbound communication immediately, before anything is collected or decided. This runs first on purpose: investigating while still sending resolves the uncertainty in favour of sending, which is the one outcome the journey exists to prevent",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "a.collect",
        idempotencyKey: "person_id + disputed_permission_ref + a.failsafe",
      },
      {
        id: "a.collect",
        kind: "action",
        does: "Collect from each participating system its state, source, timestamp, version and the provenance of the change. A timestamp alone is not authority - clocks disagree, and write order is not the order things were decided",
        writes: [{ field: "permission_conflict_log", mode: "append" }],
        next: "a.scope",
        idempotencyKey: "person_id + disputed_permission_ref + a.collect",
      },
      {
        id: "a.scope",
        kind: "action",
        does: "Determine exactly which purpose, channel and scope combination is in dispute. Everything outside it is not in conflict and is not suppressed",
        writes: [{ field: "permission_conflict_log", mode: "append" }],
        next: "c.resolvable",
        idempotencyKey: "person_id + disputed_permission_ref + a.scope",
      },
      {
        id: "c.resolvable",
        kind: "condition",
        asks: "Is a safe authoritative state immediately determinable from the evidence?",
        branches: [
          {
            label: "Determinable",
            when: "provenance and version identify which record reflects the person's actual decision",
            to: "a.apply",
          },
          {
            label: "Not determinable",
            when: "the evidence does not establish which state is right - including the case where the more permissive one is newer, which is not the same as being correct",
            to: "a.enter",
          },
        ],
      },
      {
        id: "a.enter",
        kind: "action",
        does: "Record PERMISSION_CONFLICT and leave the fail-safe suppression in force. Being unresolved is a state worth naming rather than a gap between two states",
        writes: [{ field: "permission_conflict_log", mode: "append" }],
        next: "w.reconcile",
        idempotencyKey: "person_id + disputed_permission_ref + a.enter",
      },
      {
        id: "w.reconcile",
        kind: "wait",
        until: ["authoritative reconciliation completes", "a manual resolution is recorded"],
        onEvent: "a.apply",
        timeout: {
          after: "the reconciliation horizon for this permission type",
          reason:
            "an unresolved conflict is safe but not free - it silently withholds communication someone may have wanted, so it is escalated rather than left to sit",
        },
        onTimeout: "h.manual",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.manual",
        kind: "handoff",
        to: "DEC-181",
        on: "a conflict that automated reconciliation could not settle",
        carries: [
          "every reported state with its source, version and provenance",
          "the disputed scope, and the fact that communication has been closed on it throughout",
        ],
      },
      {
        id: "a.apply",
        kind: "action",
        does: "Apply the established state and propagate the correction with change_origin and a fresh change_version for the resolution, so a redelivered or out-of-order echo is discarded rather than treated as a new change - which is what turns a reconciliation into a synchronisation loop",
        writes: [{ field: "permission_log", mode: "append" }],
        next: "a.verify",
        idempotencyKey: "person_id + disputed_permission_ref + a.apply",
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify convergence across the systems that are required to agree, using change_version-checked writes so verification cannot itself become another round of the exchange - a system's own report is only accepted at the resolution's change_version, never inferred from a bare acknowledgement",
        next: "c.converged",
      },
      {
        id: "c.converged",
        kind: "condition",
        asks: "Do all required systems now hold the resolved state?",
        branches: [
          {
            label: "Converged",
            when: "every required system reports the resolved state at the resolved version",
            to: "a.release",
          },
          {
            label: "Still divergent",
            when: "at least one system has not converged after the correction",
            to: "h.manual",
          },
        ],
      },
      {
        id: "a.release",
        kind: "action",
        does: "Release the conflict state and re-evaluate what is eligible now. Communication withheld during the conflict is not replayed, whichever way the conflict resolved",
        writes: [{ field: "permission_conflict_log", mode: "append" }],
        next: "x.resolved",
        idempotencyKey: "person_id + disputed_permission_ref + a.release",
      },
      {
        id: "x.resolved",
        kind: "exit",
        state: "conflict resolved, state converged, eligibility recalculated",
        terminal: false,
        reEntry:
          "a fresh divergence on the same combination opens a new instance, and the log of this one is part of what the next is judged against",
      },
    ],
    guardrails: [
      "The more permissive state is never chosen because it is more permissive. Permissiveness is not evidence.",
      "A system timestamp alone is not authority. Provenance and version are what identify the record that reflects a real decision.",
      "The correction is propagated with origin and version and applied idempotently, so reconciliation cannot become a loop between two systems each correcting the other.",
      "The fail-safe is scoped to the disputed combination. A conflict about one permission does not close everything.",
    ],
    reusableRule:
      "Distributed permission conflicts should fail safe until an authoritative state is established and verified across dependent systems.",
  },
  {
    id: "CON-264",
    slug: "contact-point-confirmation",
    category: "consent",
    goal: "consent-permission",
    channels: ["email", "sms"],
    name: "Contact point added or changed → confirm → permitted or lapsed",
    shortName: "Contact Verification",
    purpose:
      "Establish that the person who owns a new destination actually asked for it, before anything is ever sent there - and tell the destination it replaces, because a change nobody made is only visible from the address it is being taken away from.",
    entity: {
      scope: "the specific contact point being added or changed, plus the identity it is claimed for",
      note: "One destination, one confirmation. A second contact point on the same identity is its own instance and confirms on its own terms.",
      instanceKey: [
        "contact_point_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "CON-31",
        because:
          "CON-31 records what was authorised, for which purpose and scope. This runs earlier and answers a different question - whether the destination belongs to the person the permission would be recorded against.",
      },
      {
        journey: "IDN-89",
        because:
          "IDN-89 changes the attribute and reconciles what depended on it. This is the exchange with the two destinations that decides whether the new one is usable at all.",
      },
    ],
    objective: "Make a new or changed contact point usable only when the destination itself confirms it - telling the destination being replaced that it is being replaced - and leave it unusable if it never does.",
    eligibility: [
      "a contact point is added or changed for an identity",
      "the new destination is well-formed and deliverable in principle",
      "no verification instance is already open for this contact point",
      "change_source is not CON-272's own repair flow - a destination CON-272 already confirmed at its own a.confirm is not asked to confirm itself a second time for the same change"
    ],
    suppressions: [
      {
        "id": "s.nowhere-else",
        "label": "CANONICAL_RULE",
        "text": "The confirmation request goes to the new destination itself and nowhere else; a confirmation answered from inside an authenticated session proves control of the session, not of the destination."
      },
      {
        "id": "s.old-told",
        "label": "CANONICAL_RULE",
        "text": "A destination being replaced is told it is being replaced, with what it is being replaced by and how to stop it; a silent replacement is how an account is taken over."
      },
      {
        "id": "s.one-reminder",
        "label": "CANONICAL_RULE",
        "text": "One reminder at the same destination, naming the point after which nothing will be sent there; then nothing more."
      },
      {
        "id": "s.unconfirmed-unusable",
        "label": "CANONICAL_RULE",
        "text": "Permission is held by the destination that confirmed and by that destination only; an unconfirmed destination stays unusable for anything."
      },
      {
        "id": "s.hard-gates",
        "label": "CANONICAL_RULE",
        "text": "Verification messages are exempt from pressure caps and marketing permission; only hard gates (GLB-31) apply."
      }
    ],
    contact: {
      "defaultPriority": "security",
      "pressureClass": "none",
      "localCap": {
        "value": {
          "key": "contact_verification.reminders",
          "rule": "Only the reminder is discretionary; the confirmation request and the notice to the replaced destination are the verification itself.",
          "default": {
            "value": 1,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "the graph sends one reminder"
          },
          "required": false
        },
        "appliesTo": "non-mandatory"
      },
      "cooldown": {
        "key": "contact_verification.cooldown",
        "rule": "Verification is per contact point change; a further change is a new instance and supersedes the open one.",
        "default": {
          "value": "none",
          "confidence": "high",
          "basis": "corpus-rule"
        },
        "required": false
      },
      "competition": "none"
    },
    channelStrategy: {
      "roles": [
        {
          "role": "persistent",
          "channels": [
            "email"
          ],
          "when": "the destination being confirmed or replaced is an address - the message goes to that destination itself"
        },
        {
          "role": "urgent",
          "channels": [
            "sms"
          ],
          "when": "the destination being confirmed or replaced is a number - the message goes to that destination itself"
        }
      ],
      "fallback": "same-role-other-channel",
      "label": "CANONICAL_RULE"
    },
    orchestration: {
      "strategy": "two-party-confirmation",
      "touches": [
        {
          "id": "t-old",
          "stage": "replacement-notice",
          "action": "a.alert-old",
          "prerequisites": [
            "c.replacement"
          ],
          "purpose": "Tell the destination being replaced that it is being replaced, what it is being replaced with, and how to stop it.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "destination": {
            "target": "dispute-this-change",
            "boundTo": "contact_point_id"
          },
          "mandatory": true,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t-new",
          "stage": "confirmation-request",
          "action": "a.confirm-new",
          "prerequisites": [
            "c.replacement"
          ],
          "purpose": "Ask the new destination itself to confirm, and send that request nowhere else.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "destination": {
            "target": "confirm-this-destination",
            "boundTo": "contact_point_id"
          },
          "mandatory": true,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t-remind",
          "stage": "reminder",
          "action": "a.remind",
          "after": "t-new",
          "gatedBy": "w.confirm",
          "prerequisites": [],
          "purpose": "Ask once more, at the same destination, naming the point after which nothing will be sent there at all.",
          "channelRoles": [
            "persistent",
            "urgent"
          ],
          "destination": {
            "target": "confirm-this-destination",
            "boundTo": "contact_point_id"
          },
          "mandatory": false,
          "label": "RECOMMENDED_DEFAULT"
        }
      ],
      "noAction": [
        "s.nowhere-else",
        "s.old-told",
        "s.one-reminder",
        "s.unconfirmed-unusable",
        "s.hard-gates"
      ]
    },
    implementation: {
      "attributes": {
        "required": [
          "contact_point_id",
          "identity_id",
          "destination_kind",
          "new_destination",
          "replaced_destination",
          "confirmation_window_ends_at"
        ],
        "optional": [
          "change_source",
          "session_ref"
        ]
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.permitted",
          "x.lapsed",
          "x.superseded",
          "h.disputed"
        ]
      },
      "businessOutcome": {
        "event": "destination_confirmed",
        "unit": "instance",
        "observationScope": {
          "type": "self"
        },
        "window": {
          "type": "until-exit"
        },
        "attribution": "entered-before-event",
        "comparison": "not-applicable"
      },
      "secondary": [
        "destination_change_disputed"
      ],
      "guardrails": [
        "confirmation_sent_elsewhere",
        "replaced_destination_not_told",
        "unconfirmed_destination_used",
        "complaint"
      ],
      "operational": [
        "change_volume",
        "confirmation_rate",
        "dispute_rate",
        "reminder_rate",
        "lapse_rate",
        "time_to_confirmation"
      ]
    },
    discovery: {
      "aliases": [
        "contact verification",
        "email verification",
        "phone verification",
        "double opt-in",
        "contact change confirmation",
        "verify new address"
      ],
      "useCases": [
        "a new address or number added to an account and confirmed at the destination itself",
        "a replaced contact point whose previous destination is warned and can dispute"
      ]
    },
    entry: "t.contact-point",
    nodes: [
      {
        id: "t.contact-point",
        kind: "trigger",
        event: "contact_point_added_or_changed",
        evidence: {
          requires: [
            "a new or changed contact point recorded against a known identity",
            "a destination in a form that can actually be sent to",
          ],
          insufficientAlone: [
            "a destination typed into a form and not yet submitted",
            "a live session on the account, which proves control of the account rather than of the destination",
          ],
          source: "authoritative",
        },
        next: "c.replacement",
      },
      {
        id: "c.replacement",
        kind: "condition",
        asks: "Is this replacing a destination that already exists?",
        branches: [
          {
            label: "Replaces an existing one",
            when: "a contact point of this kind is already recorded and reachable for this identity",
            to: "a.alert-old",
          },
          {
            label: "First of its kind",
            when: "no prior contact point of this kind exists, so there is nowhere else to warn",
            to: "a.confirm-new",
          },
        ],
      },
      {
        id: "a.alert-old",
        kind: "action",
        does: "Tell the destination being replaced that it is being replaced, what it is being replaced with, and how to stop it - sent to the old destination itself. A takeover is invisible from the address taking over and obvious from the one losing access",
        next: "a.confirm-new",
        execution: "communication",
        idempotencyKey: "contact_point_id + touch id",
      },
      {
        id: "a.confirm-new",
        kind: "action",
        does: "Ask the new destination itself to confirm, and send that request nowhere else. A confirmation answered from inside the account proves control of the account, which was never the thing in doubt",
        next: "w.confirm",
        execution: "communication",
        idempotencyKey: "contact_point_id + touch id",
      },
      {
        id: "w.confirm",
        kind: "wait",
        until: [
          "destination_confirmed",
          "destination_change_disputed",
          "contact_point_changed_again"
        ],
        onEvent: "c.resolution",
        timeout: {
          "after": {
            "key": "contact_verification.confirmation_window",
            "rule": "The confirmation window is the one defined for this kind of destination; the reminder is placed when it passes unanswered, and the remainder of the window bounds the reminder.",
            "class": "response-window",
            "required": true
          },
          "reason": "an unconfirmed destination that stays pending indefinitely gets read as usable by whatever looks at it next",
          "relativeTo": "previous-touch"
        },
        onTimeout: "a.remind",
        windowExtendsOnEngagement: false,
        recheck: "the contact point re-read: confirmed, disputed, changed again, or still pending",
      },
      {
        id: "c.resolution",
        kind: "condition",
        asks: "What ended the wait?",
        branches: [
          {
            label: "Confirmed",
            when: "the owner of the new destination confirmed from that destination",
            to: "a.activate",
          },
          {
            label: "Disputed",
            when: "the destination being replaced says the change was not theirs",
            to: "h.disputed",
          },
          {
            label: "Superseded",
            when: "the contact point was withdrawn or changed again before any confirmation",
            to: "x.superseded",
          },
        ],
      },
      {
        id: "h.disputed",
        kind: "handoff",
        to: "IDN-89",
        on: "a contact point change the previous destination says it did not make",
        carries: [
          "the old and the new destination and when the change was recorded",
          "the dispute and the route it arrived on",
        ],
      },
      {
        id: "a.activate",
        kind: "action",
        does: "Record the confirmation against this destination and this destination only. Permission held by the address it replaced is not lent forward - consent does not travel with a change of address, and treating it as though it does is how a confirmed opt-in becomes an unconfirmed one",
        next: "x.permitted",
        idempotencyKey: "contact_point_id + a.activate",
      },
      {
        id: "x.permitted",
        kind: "exit",
        state: "confirmed and permitted for this destination",
        terminal: false,
        reEntry: "a later change to the same contact point is a new instance with its own confirmation",
        class: "success",
      },
      {
        id: "a.remind",
        kind: "action",
        does: "Ask once more, at the same destination, naming the point after which nothing will be sent there at all. One repeat and no more - a destination that does not answer twice is more likely wrong than busy",
        next: "w.last",
        execution: "communication",
        idempotencyKey: "contact_point_id + touch id",
      },
      {
        id: "w.last",
        kind: "wait",
        until: [
          "destination_confirmed"
        ],
        onEvent: "a.activate",
        timeout: {
          "after": {
            "key": "contact_verification.window_remainder",
            "rule": "After the reminder, only the remainder of the original confirmation window is waited; the window is never extended by the reminder.",
            "class": "attribute-bound",
            "default": {
              "value": "the remainder of the confirmation window, counted from the first request",
              "confidence": "high",
              "basis": "attribute-bound"
            },
            "required": false
          },
          "reason": "the window is what keeps an unanswered destination out of every send, rather than merely late",
          "relativeTo": "attribute",
          "attribute": "confirmation_window_ends_at"
        },
        onTimeout: "x.lapsed",
        windowExtendsOnEngagement: false,
        recheck: "the contact point re-read at the end of the window",
      },
      {
        id: "x.lapsed",
        kind: "exit",
        state: "unconfirmed; the destination stays unusable",
        terminal: false,
        reEntry: "the same destination submitted again starts a fresh confirmation, not a continuation of this one",
        class: "timeout",
      },
      {
        id: "x.superseded",
        kind: "exit",
        state: "superseded before confirmation",
        terminal: false,
        reEntry: "the destination that replaced it runs its own confirmation",
        class: "invalid-state",
      },
    ],
    guardrails: [
      "Nothing is sent to an unconfirmed destination except the request to confirm it.",
      "The confirmation goes to the destination in question; the change alert goes to the one it replaces. Neither substitutes for the other.",
      "Permission never transfers from a replaced destination to its replacement.",
      "Unconfirmed and refused are recorded as different facts - one is silence, the other is a decision.",
    ],
    reusableRule:
      "A destination is not yours to send to until the person on the other end of it has said so from that end.",
  },
  {
    id: "CON-272",
    slug: "contactability-repair",
    category: "consent",
    goal: "consent-permission",
    channels: ["in-app", "sms", "email"],
    name: "Channel permission closed → ask on an open route → reopened or left closed",
    shortName: "Permission Reopen",
    purpose:
      "Win a closed channel's permission back by asking through a route that is still open, without ever contacting the closed channel itself or mistaking a technical fix for a fresh grant.",
    entity: {
      scope: "the person plus the one channel whose permission is closed",
      note: "The closure belongs to the channel, not to the person's whole contactability. A second channel closing is its own instance and gets its own repair cycle.",
      instanceKey: [
        "person_id",
        "channel"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "CON-35",
        because:
          "CON-35 enforces a permission change the moment it is recorded, in either direction, and propagates it to the dependent systems. This journey only ever runs after a narrowing CON-35 has already enforced - it is the one attempt to win the channel back, never the enforcement itself.",
      },
      {
        journey: "CON-36",
        because:
          "CON-36 holds reachability per destination - whether a route works at all. This journey runs only on routes CON-36 has already found healthy; what it repairs is permission, not deliverability.",
      },
      {
        journey: "CON-38",
        because:
          "CON-38 governs suppression by reason and holds it once decided. This journey is the single request that could reverse a permission-based suppression, and it asks once before standing down rather than deciding anything itself.",
      },
      {
        journey: "CON-300",
        because:
          "CON-300 reads sustained silence across channels as a reason to end marketing contact. This journey runs the moment one channel's permission closes, before any conclusion is drawn from the silence on it - which is why it outranks CON-300 in the contactability-question group and CON-300 stands down while a repair is open.",
      },
    ],
    objective:
      "Win a closed channel's permission back by asking through a route that is still open, without ever contacting the closed channel itself or mistaking a technical fix for a fresh grant.",
    eligibility: [
      "a recorded permission closure on one specific channel, while at least one other channel remains open or the person is expected to sign in",
      "no instance of this journey is already open for the person plus the one channel whose permission is closed",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "A closed permission is not a dead route, and nothing here is sent to the channel being repaired."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "An available open channel is not itself permission to use it for anything beyond this one request."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "One repair cycle per closed channel. A permission asked twice over the same closure is asked once too often."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "No open channel and no expected session leaves nothing to ask through; the closure stands until a channel opens."
      }
    ],
    contact: {
      "defaultPriority": "service",
      "pressureClass": "none",
      "localCap": {
        "value": {
          "key": "contactability_repair.discretionary_touches",
          "rule": "Every touch in the plan is the repair itself and is mandatory; nothing discretionary exists to cap.",
          "default": {
            "value": 0,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "every touch is marked mandatory"
          },
          "required": false
        },
        "appliesTo": "non-mandatory"
      },
      "cooldown": {
        "key": "contactability_repair.cooldown",
        "rule": "This journey is per the person plus the one channel whose permission is closed; a later closure on a different channel is its own instance and no cooldown applies between them.",
        "default": {
          "value": "none",
          "confidence": "high",
          "basis": "corpus-rule",
          "applicableWhen": "the entity note: one instance per entity"
        },
        "required": false
      },
      "competition": {
        "exclusionGroup": "contactability-question",
        "scope": "person",
        "precedence": "highest in the contactability-question group - a channel that just closed has to be given the one chance to reopen before any conclusion is drawn from the silence on it, so while this repair currently holds the person the unengaged sunset stands down rather than reading a closed permission as disinterest",
        "onLoss": "paused"
      }
    },
    channelStrategy: {
      "roles": [
        {
          "role": "in-session",
          "channels": [
            "in-app"
          ],
          "when": "the person is active in the product, which can carry the request regardless of which channel closed"
        },
        {
          "role": "urgent",
          "channels": [
            "sms"
          ],
          "when": "no session is expected soon, email permission is closed, and SMS permission is open"
        },
        {
          "role": "persistent",
          "channels": [
            "email"
          ],
          "when": "no session is expected soon, SMS permission is closed, and email permission is open"
        }
      ],
      "fallback": "same-role-other-channel",
      "label": "RECOMMENDED_DEFAULT"
    },
    orchestration: {
      "strategy": "offer-decide-remind",
      "touches": [
        {
          "id": "t1",
          "stage": "prompt-in-app",
          "action": "a.ask-inapp",
          "prerequisites": [
            "c.route"
          ],
          "purpose": "Ask where the person already is to reopen the closed channel, naming what is being missed and linking to the preference centre.",
          "channelRoles": [
            "in-session"
          ],
          "mandatory": true,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "preference-centre",
            "boundTo": "person_id"
          }
        },
        {
          "id": "t2a",
          "stage": "prompt-email",
          "action": "a.ask-email",
          "prerequisites": [
            "c.route"
          ],
          "purpose": "Ask on the surviving address to reopen the closed channel, naming what is being missed and linking to the preference centre.",
          "channelRoles": [
            "persistent"
          ],
          "mandatory": true,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "preference-centre",
            "boundTo": "person_id"
          }
        },
        {
          "id": "t2b",
          "stage": "prompt-sms",
          "action": "a.ask-sms",
          "prerequisites": [
            "c.route"
          ],
          "purpose": "Ask on the surviving number to reopen the closed channel, naming what is being missed and linking to the preference centre.",
          "channelRoles": [
            "urgent"
          ],
          "mandatory": true,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "preference-centre",
            "boundTo": "person_id"
          }
        },
        {
          "id": "t3",
          "stage": "remind",
          "action": "a.remind",
          "gatedBy": "w.reopen",
          "prerequisites": [
            "c.outcome"
          ],
          "purpose": "Send one last reminder on the same route that carried the original ask, that the channel's permission is still closed.",
          "channelRoles": [
            "in-session",
            "persistent",
            "urgent"
          ],
          "mandatory": true,
          "label": "CANONICAL_RULE"
        }
      ],
      "noAction": [
        "s.g1",
        "s.g2",
        "s.g3",
        "s.g4"
      ]
    },
    implementation: {
      "attributes": {
        "required": [
          "person_id",
          "channel",
          "closed_at",
          "permission_log"
        ],
        "optional": [
          "open_channels",
          "has_active_app_session"
        ]
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit",
        "refs": [
          "x.reopened",
          "x.stayed-closed",
          "x.already-open",
          "x.unreachable"
        ]
      },
      "businessOutcome": {
        "event": "explicit_permission_decision_received",
        "unit": "instance",
        "observationScope": {
          "type": "self"
        },
        "window": {
          "type": "until-exit"
        },
        "attribution": "touched-before-event",
        "comparison": "not-applicable"
      },
      "secondary": [],
      "guardrails": [
        "complaint",
        "message_after_success",
        "unsubscribe"
      ],
      "operational": [
        "entry_volume",
        "exit_distribution",
        "no_action_rate_by_reason",
        "time_to_exit"
      ]
    },
    discovery: {
      "aliases": [
        "permission reopen",
        "channel opt back in",
        "closed channel recovery",
        "re-permission request",
        "win-back permission"
      ],
      "useCases": [
        "email permission closed while SMS is still open, asked back via SMS",
        "both marketing channels closed while the app is still used, asked back in-app"
      ]
    },
    entry: "t.closed",
    nodes: [
      {
        id: "t.closed",
        kind: "trigger",
        event: "authoritative_permission_change",
        evidence: {
          requires: ["a recorded transition narrowing one channel's permission to closed"],
          insufficientAlone: [
            "a technical delivery failure on a channel whose permission is still open, which is a reachability question (CON-36's job)",
            "a permission change that leaves no channel newly closed",
          ],
          source: "authoritative",
        },
        next: "c.route",
      },
      {
        id: "c.route",
        kind: "condition",
        asks: "Which channels are open, and is the app active?",
        branches: [
          {
            label: "Signed in",
            when: "the person is active in the product, which can carry the request regardless of which channel closed",
            to: "a.ask-inapp",
          },
          {
            label: "Email survives",
            when: "no session is expected soon, SMS permission is closed, and email permission is open",
            to: "a.ask-email",
          },
          {
            label: "Phone survives",
            when: "no session is expected soon, email permission is closed, and SMS permission is open",
            to: "a.ask-sms",
          },
          {
            label: "Already open elsewhere",
            when: "a fresh read shows another channel besides the one that just closed is already open, and the person is not expected to sign in soon",
            to: "x.already-open",
          },
          {
            label: "Nothing open",
            when: "no channel is open and no session is expected soon",
            to: "x.unreachable",
          },
        ],
      },
      {
        id: "a.ask-inapp",
        kind: "action",
        does: "Show the in-app permission screen for the closed channel, naming what is being missed and linking to the preference centre. Seeing the request somewhere other than the closed channel is what makes it answerable",
        next: "w.reopen",
        execution: "communication",
        idempotencyKey: "person_id + channel + a.ask-inapp",
      },
      {
        id: "a.ask-email",
        kind: "action",
        does: "Ask on the surviving email address to reopen SMS permission, naming what is being missed and linking to the preference centre. Nothing is sent to the closed channel to ask it to reopen itself",
        next: "w.reopen",
        execution: "communication",
        idempotencyKey: "person_id + channel + a.ask-email",
      },
      {
        id: "a.ask-sms",
        kind: "action",
        does: "Ask on the surviving phone number to reopen email permission, naming what is being missed and linking to the preference centre. Nothing is sent to the closed channel to ask it to reopen itself",
        next: "w.reopen",
        execution: "communication",
        idempotencyKey: "person_id + channel + a.ask-sms",
      },
      {
        id: "x.already-open",
        kind: "exit",
        state: "another channel was already open; nothing needed repairing",
        terminal: false,
        reEntry: "a later closure on any channel opens its own instance",
        class: "no-action",
      },
      {
        id: "x.unreachable",
        kind: "exit",
        state: "no open channel and no session to carry the request; the closure stands",
        terminal: false,
        reEntry: "if any channel becomes open, or a session starts, the repair request runs from there",
        class: "suppression",
      },
      {
        id: "w.reopen",
        kind: "wait",
        until: [
          "explicit_permission_decision_received"
        ],
        onEvent: "c.outcome",
        timeout: {
          "after": {
            "key": "contactability_repair.reopen_window",
            "rule": "The first bounded window for a decision on the surviving route; where the ask ran in-app rather than by email or SMS, this window instead runs to the person's next expected session.",
            "class": "response-window",
            "default": {
              "value": "2-3 days",
              "confidence": "low",
              "basis": "example-only",
              "applicableWhen": "the ask went out by email or SMS",
              "avoidWhen": "the ask went out in-app, where the window is the person's own next session rather than a fixed clock"
            },
            "required": false
          },
          "reason": "a closed channel asked about once and never checked on again is a request that was never really made",
          "relativeTo": "previous-touch"
        },
        onTimeout: "c.outcome",
        windowExtendsOnEngagement: false,
        recheck: "the person's permission state for the closed channel re-read from the system of record before acting on the timeout",
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "Did permission for the closed channel reopen?",
        branches: [
          {
            label: "Reopened",
            when: "the closed channel's permission is now open",
            to: "x.reopened",
          },
          {
            label: "Still closed",
            when: "the closed channel's permission is still closed",
            to: "a.remind",
          },
        ],
      },
      {
        id: "a.remind",
        kind: "action",
        does: "Send one last reminder on the same route that carried the original ask - never a second route - that the channel's permission is still closed, linking to the preference centre",
        next: "w.reopen2",
        execution: "communication",
        idempotencyKey: "person_id + channel + a.remind",
      },
      {
        id: "w.reopen2",
        kind: "wait",
        until: [
          "explicit_permission_decision_received"
        ],
        onEvent: "c.outcome2",
        timeout: {
          "after": {
            "key": "contactability_repair.reminder_window",
            "rule": "The single reminder window allowed for this closure, shorter than the first because the ask has already been made once.",
            "class": "response-window",
            "default": {
              "value": "1-2 days",
              "confidence": "low",
              "basis": "example-only",
              "applicableWhen": "the reminder went out on the same route as the original ask",
              "avoidWhen": "no route survives to carry a reminder"
            },
            "required": false
          },
          "reason": "the repair cycle is bounded - a closure not reversed inside it stays closed rather than being asked about indefinitely",
          "relativeTo": "previous-touch"
        },
        onTimeout: "c.outcome2",
        windowExtendsOnEngagement: false,
        recheck: "the person's permission state for the closed channel re-read from the system of record before acting on the timeout",
      },
      {
        id: "c.outcome2",
        kind: "condition",
        asks: "Did permission for the closed channel reopen?",
        branches: [
          {
            label: "Reopened",
            when: "the closed channel's permission is now open",
            to: "x.reopened",
          },
          {
            label: "Still closed",
            when: "the closed channel's permission is still closed",
            to: "x.stayed-closed",
          },
        ],
      },
      {
        id: "x.reopened",
        kind: "exit",
        state: "permission for the closed channel is reopened; normal contact on it resumes",
        terminal: false,
        reEntry: "a later closure on any channel is its own instance",
        class: "success",
      },
      {
        id: "x.stayed-closed",
        kind: "exit",
        state: "the channel's permission stays closed after one repair cycle",
        terminal: false,
        reEntry: "the person reopening it themselves later is a fresh grant, not a re-entry into this instance",
        class: "suppression",
      },
    ],
    guardrails: [
      "A closed permission is not a dead route, and nothing is sent to the channel being repaired.",
      "An available open channel is not permission to use it for anything beyond this one request.",
      "One repair cycle per closed channel. A permission asked twice over the same closure is asked once too often.",
      "Reopening a channel changes where the closed permission stands, not what the person has agreed to receive elsewhere.",
    ],
    reusableRule:
      "A closed channel's permission should be asked back once, through a route that is still open, and never re-asked once that one attempt has run its course.",
  },
  {
    id: "CON-283",
    slug: "frequency-reduction-confirmation",
    category: "consent",
    goal: "consent-permission",
    channels: ["email"],
    name: "Frequency reduced → cadence recalculated → kept rather than lost",
    shortName: "Frequency Preference Update",
    purpose:
      "Confirm to somebody who asked for less that less is what they will get, so that asking for fewer messages stays a real alternative to asking for none.",
    entity: {
      scope: "the person and the optional communication classes the reduced frequency actually governs",
      note: "The governed set is the whole question. A frequency preference that quietly reaches required communication is an opt-out nobody chose.",
      instanceKey: [
        "person_id"
      ],
      concurrency: "one-active-per-key"
    },
    distinctFrom: [
      {
        journey: "CON-34",
        because:
          "CON-34 works out which classes the preference governs and recalculates the cadence. This journey is the single confirmation the person receives, and it states nothing the recalculation has not already applied.",
      },
      {
        journey: "CON-38",
        because:
          "CON-38 records a stop and decides when it releases. A reduction is not a stop, and recording the two as the same state loses exactly the relationship the person was trying to keep.",
      },
      {
        journey: "CON-300",
        because:
          "CON-300 puts the choice in front of somebody who has chosen nothing, and hands the reduction here the moment they take it. This journey never asks - it confirms a cadence the person set themselves, which is why it outranks CON-300 in the contactability-question group: somebody who has just answered is not asked again.",
      },
    ],
    objective: "Confirm to somebody who asked for less that less is what they will get, so that asking for fewer messages stays a real alternative to asking for none.",
    eligibility: [
      "an authoritative frequency preference recorded against the person",
      "the new cadence expressed as something that can actually be applied",
      "the classes it governs",
      "no instance of this journey is already open for the the person and the optional communication classes the reduced frequency actually governs",
      "hard gates (GLB-31) allow communication for this purpose"
    ],
    suppressions: [
      {
        "id": "s.g1",
        "label": "CANONICAL_RULE",
        "text": "Fewer is not none. A reduction that is enforced as a stop loses the relationship the person was trying to keep."
      },
      {
        "id": "s.g2",
        "label": "CANONICAL_RULE",
        "text": "Required and transactional communication stays governed by its own rules, whatever the preference says."
      },
      {
        "id": "s.g3",
        "label": "CANONICAL_RULE",
        "text": "One confirmation, and it is the last message at the old cadence rather than the first at the new one."
      },
      {
        "id": "s.g4",
        "label": "CANONICAL_RULE",
        "text": "A cadence change is prospective. What was already delivered is not revisited."
      }
    ],
    contact: {
      "defaultPriority": "service",
      "pressureClass": "none",
      "localCap": {
        "value": {
          "key": "frequency_reduction.touches",
          "rule": "Every touch runs against a budget fixed when the instance opened; the budget is the plan's own length, and no touch is repeated because nothing could tell whether it arrived.",
          "default": {
            "value": 1,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the graph's own touch count"
          },
          "required": false
        },
        "appliesTo": "non-mandatory"
      },
      "cooldown": {
        "key": "frequency_reduction.cooldown",
        "rule": "This journey is per the person and the optional communication classes the reduced frequency actually governs; a later instance concerns a different the person and the optional communication classes the reduced frequency actually governs and no cooldown applies between them.",
        "default": {
          "value": "none",
          "confidence": "high",
          "basis": "corpus-rule",
          "applicableWhen": "the entity note: one instance per entity"
        },
        "required": false
      },
      "competition": {
        "exclusionGroup": "contactability-question",
        "scope": "person",
        "precedence": "above the unengaged sunset in the contactability-question group - somebody who has just chosen a cadence has answered the question the sunset would otherwise ask, so while this confirmation currently holds the person the sunset is suppressed for them; below a permission repair, which is trying to reopen the very channel this confirmation would travel on",
        "onLoss": "paused"
      }
    },
    channelStrategy: {
      "roles": [
        {
          "role": "persistent",
          "channels": [
            "email"
          ],
          "when": "the message has to be kept and survive until the person can act on it"
        }
      ],
      "fallback": "same-role-other-channel",
      "label": "RECOMMENDED_DEFAULT"
    },
    orchestration: {
      "strategy": "single-notice",
      "touches": [
        {
          "id": "t1",
          "stage": "confirm",
          "action": "a.confirm",
          "prerequisites": [
            "c.less-or-none",
            "c.queued"
          ],
          "purpose": "Confirm once what changed: how often optional communication will now arrive, what is unaffected because it was never optional, and the route to stopping it altogether.",
          "channelRoles": [
            "persistent"
          ],
          "mandatory": true,
          "label": "CANONICAL_RULE",
          "destination": {
            "target": "preference-centre",
            "boundTo": "person_id",
            "mustNotClaim": [
              "that required or transactional communication changes"
            ]
          }
        }
      ],
      "noAction": [
        "s.g1",
        "s.g2",
        "s.g3",
        "s.g4"
      ]
    },
    implementation: {
      "attributes": {
        "required": [
          "person_id",
          "new_cadence",
          "governed_classes",
          "queued_optional_sends"
        ],
        "optional": []
      }
    },
    measurement: {
      "journeyOutcome": {
        "type": "exit",
        "refs": [
          "x.opted-out",
          "x.reduced-again",
          "x.holding"
        ]
      },
      "businessOutcome": {
        "event": "frequency_preference_changed",
        "unit": "instance",
        "observationScope": {
          "type": "self"
        },
        "window": {
          "type": "until-exit"
        },
        "attribution": "touched-before-event",
        "comparison": "not-applicable"
      },
      "secondary": [],
      "guardrails": [
        "complaint",
        "message_after_success",
        "unsubscribe"
      ],
      "operational": [
        "entry_volume",
        "exit_distribution",
        "no_action_rate_by_reason",
        "time_to_exit"
      ]
    },
    discovery: {
      "aliases": [
        "frequency preference update",
        "send-less confirmation",
        "frequency reduction",
        "reduce emails confirmation"
      ],
      "useCases": [
        "someone who asked for fewer messages told exactly what changes",
        "trimming what is already scheduled to the new cadence before confirming"
      ]
    },
    entry: "t.reduced",
    nodes: [
      {
        id: "t.reduced",
        kind: "trigger",
        event: "frequency_preference_reduced",
        evidence: {
          requires: [
            "an authoritative frequency preference recorded against the person",
            "the new cadence expressed as something that can actually be applied",
            "the classes it governs",
          ],
          insufficientAlone: [
            "a complaint about volume with no preference recorded",
            "a period of no engagement",
          ],
          source: "declared",
        },
        next: "c.less-or-none",
      },
      {
        id: "c.less-or-none",
        kind: "condition",
        asks: "Did they ask for less, or for none?",
        branches: [
          {
            label: "Fewer",
            when: "the preference sets a reduced cadence for optional communication rather than ending it",
            to: "a.recalculate",
          },
          {
            label: "None at all",
            when: "the preference is a full withdrawal from optional communication",
            to: "x.opted-out",
          },
        ],
      },
      {
        id: "x.opted-out",
        kind: "exit",
        state: "full opt-out; this journey sends nothing",
        terminal: false,
        reEntry: "if a reduced cadence is later chosen instead of none, that qualifies here again",
        class: "no-action",
      },
      {
        id: "a.recalculate",
        kind: "action",
        does: "Recalculate the forward cadence for the optional classes only, leaving required and transactional communication under its own rules. Somebody asking to hear from us less often has not asked to stop being told about their own obligations",
        next: "c.queued",
      },
      {
        id: "c.queued",
        kind: "condition",
        asks: "Does what is already scheduled exceed the new cadence?",
        branches: [
          {
            label: "Exceeds it",
            when: "optional communication is already queued at a rate the new cadence does not allow",
            to: "a.trim",
          },
          {
            label: "Within it",
            when: "what is scheduled already fits the new cadence",
            to: "a.confirm",
          },
        ],
      },
      {
        id: "a.trim",
        kind: "action",
        does: "Suppress or reschedule the optional communication that now exceeds the cadence, choosing between the two by whether the message still means anything later. The first thing somebody receives after asking for less must not be the backlog",
        next: "a.confirm",
      },
      {
        id: "a.confirm",
        kind: "action",
        does: "Confirm once what changed: how often optional communication will now arrive, what is unaffected because it was never optional, and the route to stopping it altogether. Naming what is unaffected is what stops the person concluding that nothing was applied when a required notice arrives next week",
        next: "w.cycle",
        execution: "communication",
        idempotencyKey: "person_id + a.confirm",
      },
      {
        id: "w.cycle",
        kind: "wait",
        until: [
          "frequency_preference_changed",
          "optional_communication_withdrawn"
        ],
        onEvent: "c.settled",
        timeout: {
          "after": {
            "key": "frequency_reduction.cycle",
            "rule": "One full cycle at the new cadence.",
            "class": "observation-window",
            "required": true
          },
          "reason": "a preference that has survived a cycle is the settled state, and holding the journey open past that invents an interest in the preference that nobody has",
          "relativeTo": "previous-touch"
        },
        onTimeout: "x.holding",
        windowExtendsOnEngagement: false,
        recheck: "the the person and the optional communication classes the reduced frequency actually governs re-read from the system of record before acting on the timeout",
      },
      {
        id: "c.settled",
        kind: "condition",
        asks: "What changed during the first cycle?",
        branches: [
          {
            label: "Reduced again",
            when: "a further reduction was recorded before the cycle completed",
            to: "x.reduced-again",
          },
          {
            label: "Stopped altogether",
            when: "a full withdrawal was recorded before the cycle completed",
            to: "x.opted-out",
          },
        ],
      },
      {
        id: "x.reduced-again",
        kind: "exit",
        state: "reduced a second time before the first cadence settled",
        terminal: false,
        reEntry: "each recorded reduction is its own instance and gets its own single confirmation",
        class: "success",
      },
      {
        id: "x.holding",
        kind: "exit",
        state: "reduced cadence in effect and holding",
        terminal: false,
        reEntry: "a later change to the same preference starts a new instance",
        class: "success",
      },
    ],
    guardrails: [
      "Fewer is not none. A reduction that is enforced as a stop loses the relationship the person was trying to keep.",
      "Required and transactional communication stays governed by its own rules, whatever the preference says.",
      "One confirmation, and it is the last message at the old cadence rather than the first at the new one.",
      "A cadence change is prospective. What was already delivered is not revisited.",
    ],
    reusableRule:
      "Somebody asking for less is staying, and the only way to lose them is to hear it as leaving.",
  },
  {
    "id": "CON-300",
    "slug": "unengaged-sunset",
    "category": "consent",
    "goal": "consent-permission",
    "channels": ["email", "push"],
    "name": "Marketing contact unanswered → active-user bypass, then asked, reminded and offered once → kept, reduced or ended",
    "shortName": "Unengaged Subscriber Sunset",
    "purpose": "Decide whether continued marketing contact is still warranted for somebody who has answered none of it - by bypassing anyone whose other activity says they are not dormant, then asking once, reminding once, and putting a real final offer beside ending contact before any instance actually closes it.",
    "objective": "End marketing contact that nothing in the record supports any more, without ending the relationship, without touching what the person is owed, and without recording a decision on their consent that they never made - while giving a genuinely active person a lighter cadence instead of a full cascade, and giving the otherwise-unresponsive person one real, honestly-labeled offer before contact ends.",
    "entity": {
      "scope": "one person's marketing contactability - the permission it runs on, the sends made against it, and the unengaged window being decided",
      "note": "The entity is the standing to keep sending, not the customer. Nothing here changes what the person has bought, owes or is owed, and nothing here changes what they may be told about those things. One instance per person and unengaged window; a window that closes is decided rather than extended.",
      "instanceKey": [
        "person_id",
        "unengaged_window"
      ],
      "concurrency": "one-active-per-key",
      "supersession": {
        "id": "s.supersession",
        "label": "CANONICAL_RULE",
        "text": "A recorded engagement with marketing communication, or a preference or permission decision the person makes themselves, supersedes the instance: the question has been answered and this journey stops asking it."
      }
    },
    "eligibility": [
      "an authoritative record of the marketing sends actually made to this person across the company's unengaged window",
      "those sends were made on a route whose engagement the company can observe, so that silence is evidence rather than a gap in instrumentation",
      "no recorded engagement with any of them inside that window",
      "purpose-level permission for commercial communication is still recorded - somebody who has already opted out is not a sunset case",
      "no instance is already open for this person and this window, and hard gates (GLB-31) allow communication for this purpose"
    ],
    "suppressions": [
      {
        "id": "s.unmeasurable",
        "label": "CANONICAL_RULE",
        "text": "Silence is evidence only where engagement could have been seen. A route that does not report engagement, a window in which nothing was actually sent, or a person whose sends were held back for some other reason produce no evidence of disinterest and no sunset."
      },
      {
        "id": "s.transactional",
        "label": "CANONICAL_RULE",
        "text": "A sunset ends marketing contact and nothing else. What the person holds, owes or is owed stays governed by its own rules, and an implementation that stops those messages too has made an opt-out out of something nobody chose."
      },
      {
        "id": "s.lessbeforenone",
        "label": "CANONICAL_RULE",
        "text": "Fewer is offered before none, and offered more than one way: the question itself puts a reduced cadence and an important-only tier beside stopping altogether, so a person who wants less has a real, graduated answer to give short of ending contact. Taking any of those reduced tiers is the frequency preference journey's (CON-283) work, not this one's."
      },
      {
        "id": "s.notconsent",
        "label": "CANONICAL_RULE",
        "text": "Silence is not an opt-out. What this journey reaches is a sender-side suppression recorded against our own sending, never a withdrawal recorded against the person's consent, and it is released by asking for permission again rather than by switching sending back on (CON-38)."
      },
      {
        "id": "s.scope",
        "label": "CANONICAL_RULE",
        "text": "Marketing contact means every promotional and lifecycle send addressed to this person, not promotions alone. The narrow reading - stop the offers, keep the birthday, the anniversary, the membership welcome and the tier announcement - defeats the journey and is worse than not having it, because the business believes it has stopped while the same person keeps hearing from us on the same evidence of disinterest. The line is drawn at the send's declared purpose class, which is the only thing a gate can read: promotional and lifecycle stop, service, transactional, security and mandatory do not."
      },
      {
        "id": "s.enforced",
        "label": "CANONICAL_RULE",
        "text": "The suppression has to be read by the journeys it binds, or it has ended nothing. Every journey in the library whose sends are promotional or lifecycle class stands down while it stands - the recoveries, the nurtures, the offers, the recognitions and the membership announcements - and each says so from its own side. It is carried as a hard gate under GLB-31 and evaluated at the send path's purpose stage (CMS-203) rather than declared in this journey's contactability-question group, because it is a standing state and not a contest: it decides who may be sent to afterwards, where a competition group decides only who asks the question now, and it outlives every send window either of them could share."
      },
      {
        "id": "s.contest",
        "label": "CANONICAL_RULE",
        "text": "A permission repair or a frequency change already running for this person outranks this journey in the contactability-question group; while either holds the person, this journey is suppressed for them rather than queued behind it (GLB-06). A channel whose permission just closed is why nothing was engaged with there, not evidence that nothing was wanted."
      },
      {
        "id": "s.bounded",
        "label": "RECOMMENDED_DEFAULT",
        "text": "The question, a short reminder, one final campaign carrying a real offer, and the resolution that follows - and nothing else. A further message to somebody who has answered nothing is the volume this journey exists to end."
      }
    ],
    "contact": {
      "defaultPriority": "service",
      "pressureClass": "service",
      "localCap": {
        "value": {
          "key": "unengaged_sunset.discretionary_touches",
          "rule": "The question, the reminder and the final campaign are the discretionary touches and run against a budget fixed when the instance opened; the confirmation that contact has ended is a notice about our own sending and is mandatory, so it is not rationed against them.",
          "default": {
            "value": 3,
            "confidence": "high",
            "basis": "corpus-rule",
            "applicableWhen": "GLB-24; the journey's own shape - the question, one reminder and one final campaign before the ending"
          },
          "required": false
        },
        "appliesTo": "non-mandatory"
      },
      "cooldown": {
        "key": "unengaged_sunset.cooldown",
        "rule": "Somebody whose marketing contact has ended is not asked again until permission has been given afresh; somebody who answered is left alone for a cooldown before another unengaged window is opened against them.",
        "class": "cooldown",
        "required": true
      },
      "competition": {
        "exclusionGroup": "contactability-question",
        "scope": "person",
        "precedence": "lowest in the contactability-question group - a permission repair is trying to reopen a channel that just closed and a frequency confirmation is answering a cadence the person themselves chose, and both are already answering the question this journey would otherwise ask over the top of; when either currently holds the person this journey is suppressed for them rather than queued behind it",
        "onLoss": "suppressed"
      }
    },
    "channelStrategy": {
      "roles": [
        {
          "role": "persistent",
          "channels": [
            "email"
          ],
          "when": "the question has to reach somebody who is not in the product and survive until they answer it - the default route, the one the unengaged window was measured on, and the route the final campaign and the ending notice both stay on"
        },
        {
          "role": "low-friction",
          "channels": [
            "push"
          ],
          "when": "a short reminder that only needs to be seen once, not kept, for someone who has not answered the first question yet"
        }
      ],
      "fallback": "none",
      "label": "RECOMMENDED_DEFAULT"
    },
    "orchestration": {
      "strategy": "offer-decide-remind",
      "touches": [
        {
          "id": "t1",
          "stage": "the-question",
          "action": "a.ask",
          "prerequisites": [
            "c.evidence",
            "c.active",
            "c.sendable"
          ],
          "purpose": "Ask once whether marketing contact should continue, with a reduced cadence and an important-only tier set beside stopping altogether so that fewer is an answer the person can actually give.",
          "channelRoles": [
            "persistent"
          ],
          "destination": {
            "target": "preference-centre",
            "boundTo": "person_id",
            "mustNotClaim": [
              "that messages about what they hold, owe or are owed will stop",
              "that the account will be closed",
              "that anything has already been decided"
            ]
          },
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t2",
          "stage": "reminder",
          "action": "a.remind",
          "after": "t1",
          "gatedBy": "w.answer",
          "prerequisites": [
            "c.answered",
            "c.sendable2"
          ],
          "purpose": "A short reminder that setting a contact preference takes only a moment, to whoever has not yet answered the first question.",
          "channelRoles": [
            "low-friction"
          ],
          "destination": {
            "target": "preference-centre",
            "boundTo": "person_id",
            "mustNotClaim": [
              "that messages about what they hold, owe or are owed will stop",
              "that the account will be closed",
              "that anything has already been decided"
            ]
          },
          "mandatory": false,
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t3",
          "stage": "final-campaign",
          "action": "a.campaign",
          "after": "t2",
          "gatedBy": "w.remind",
          "prerequisites": [
            "c.answered2",
            "c.sendable3"
          ],
          "purpose": "One last, honestly-labeled campaign for the still-unresponsive person: a genuine, time-boxed incentive, named as an offer rather than folded into the contact-preference question.",
          "channelRoles": [
            "persistent"
          ],
          "destination": {
            "target": "offer-route",
            "boundTo": "person_id",
            "mustNotClaim": [
              "a discount or incentive the business has not issued",
              "that ignoring it ends the relationship rather than marketing contact",
              "that anything has already been decided"
            ]
          },
          "mandatory": false,
          "priority": "promotional",
          "priorityReason": "the only touch in this journey that carries a real, time-boxed incentive rather than a contact-preference question; the journey's own pressure class stays service because the question, the reminder and the resolution are not offers",
          "label": "CANONICAL_RULE"
        },
        {
          "id": "t4",
          "stage": "resolution",
          "action": "a.confirm-end",
          "after": "t3",
          "gatedBy": "w.campaign",
          "prerequisites": [
            "c.campaign-result",
            "c.notify"
          ],
          "purpose": "Confirm that marketing contact has ended, name what continues because it was never marketing, and leave the route back for whenever they want it.",
          "channelRoles": [
            "persistent"
          ],
          "destination": {
            "target": "preference-centre",
            "boundTo": "person_id",
            "mustNotClaim": [
              "that the person opted out",
              "that anything they hold or are owed has changed"
            ]
          },
          "mandatory": true,
          "label": "CANONICAL_RULE"
        }
      ],
      "noAction": [
        "s.unmeasurable",
        "s.transactional",
        "s.lessbeforenone",
        "s.notconsent",
        "s.contest",
        "s.bounded"
      ]
    },
    "entry": "t.unengaged",
    "nodes": [
      {
        "id": "t.unengaged",
        "kind": "trigger",
        "event": "marketing_contact_unanswered_across_window",
        "evidence": {
          "requires": [
            "an authoritative record of the marketing sends actually made to this person across the company's unengaged window",
            "confirmation that those sends ran on a route whose engagement the company can observe",
            "no recorded engagement with any of them inside that window, and a purpose-level permission for commercial communication that still stands"
          ],
          "insufficientAlone": [
            "a period without a purchase - that is a lapse, and the lapsed-customer win-back owns it",
            "a single message that went unanswered",
            "silence on a route that cannot report engagement at all, which is an absence of measurement rather than an absence of interest",
            "a window in which nothing was actually sent to this person",
            "an opt-out already recorded, which is an answer rather than a question"
          ],
          "source": "behavioral"
        },
        "next": "c.evidence"
      },
      {
        "id": "c.evidence",
        "kind": "condition",
        "asks": "Does the record actually support the conclusion that marketing contact is unwanted?",
        "branches": [
          {
            "label": "Supported",
            "when": "sends were made inside the window on a route that reports engagement, none of them was engaged with, and permission for commercial communication still stands",
            "observes": "send log, engagement record, permission record",
            "to": "c.active"
          },
          {
            "label": "Nothing to read",
            "when": "nothing was sent inside the window, or the route it was sent on cannot report engagement; there is no silence here to draw a conclusion from",
            "observes": "send log, engagement reporting availability",
            "to": "a.record-no-action"
          },
          {
            "label": "Already answered",
            "when": "the person set a preference or made a permission decision of their own inside the window",
            "observes": "frequency_preference_changed",
            "to": "x.answered"
          }
        ]
      },
      {
        "id": "c.active",
        "kind": "condition",
        "asks": "Does anything outside marketing say this person is still around, even though marketing contact itself has gone unanswered?",
        "branches": [
          {
            "label": "Active elsewhere",
            "when": "a purchase, a use of the product or a visit recorded inside the company's own recent-activity window says the relationship is not dormant",
            "observes": "meaningful_return",
            "to": "a.reduce-bypass"
          },
          {
            "label": "Not active",
            "when": "nothing outside marketing contact says the person is still around; the silence extends past marketing itself",
            "observes": "meaningful_return",
            "to": "c.sendable"
          }
        ]
      },
      {
        "id": "a.reduce-bypass",
        "kind": "action",
        "does": "Lower the marketing send frequency directly and hold back everything but what matters, since activity outside marketing says the relationship is not dormant even though marketing contact itself went unanswered. This is a cadence change, not an answer to the contact question, and it does not ask one.",
        "idempotencyKey": "person_id + unengaged_window + a.reduce-bypass",
        "writes": [
          {
            "field": "sunset_log",
            "mode": "append"
          }
        ],
        "next": "x.active-reduced"
      },
      {
        "id": "c.sendable",
        "kind": "condition",
        "asks": "May the question go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "the send path passes: permission for this purpose, a deliverable destination, the service pressure cap, no cooldown in force, and no higher-precedence contactability journey currently holds this person",
            "observes": "send path stages 1-8",
            "to": "a.ask"
          },
          {
            "label": "Suppressed",
            "when": "a gate stops it; the gate is recorded as the reason and nothing is forced onto another route",
            "observes": "send path stages 1-8",
            "to": "a.record-no-action"
          }
        ]
      },
      {
        "id": "a.ask",
        "kind": "action",
        "does": "Ask once whether marketing contact should continue, and set a reduced cadence and an important-only tier beside stopping altogether so that fewer is an answer the person can actually give. Carry no offer, no incentive and no argument for the relationship.",
        "execution": "communication",
        "idempotencyKey": "person_id + unengaged_window + a.ask",
        "writes": [
          {
            "field": "sunset_log",
            "mode": "append"
          }
        ],
        "next": "w.answer"
      },
      {
        "id": "w.answer",
        "kind": "wait",
        "until": [
          "marketing_engagement_recorded",
          "frequency_preference_changed",
          "permission_withdrawn"
        ],
        "onEvent": "c.answered",
        "timeout": {
          "after": {
            "key": "unengaged_sunset.answer_window",
            "rule": "The fixed span the question is given to be answered before a reminder is due.",
            "class": "response-window",
            "default": {
              "value": {
                "min": "3 days",
                "max": "5 days"
              },
              "confidence": "low",
              "basis": "example-only",
              "applicableWhen": "an email-first ask with no other contactability journey already holding the person"
            },
            "required": false
          },
          "reason": "a question left open indefinitely is a person kept on a list by inertia, which is the state this journey exists to end",
          "relativeTo": "previous-touch"
        },
        "onTimeout": "c.answered",
        "recheck": "the engagement record, the preference record and the permission record re-read from the systems that own them",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.answered",
        "kind": "condition",
        "asks": "Did the question get an answer?",
        "branches": [
          {
            "label": "Keep it",
            "when": "a recorded engagement with marketing communication is on file for this person inside the window, or they asked to keep hearing from us",
            "observes": "marketing_engagement_recorded",
            "to": "x.kept"
          },
          {
            "label": "Fewer instead",
            "when": "the person set a reduced cadence rather than an ending",
            "observes": "frequency_preference_changed",
            "to": "h.frequency"
          },
          {
            "label": "Stop it",
            "when": "the person withdrew permission for commercial communication themselves",
            "observes": "permission_withdrawn",
            "to": "h.permission"
          },
          {
            "label": "No answer",
            "when": "the window closed with nothing recorded against it",
            "observes": "engagement record, preference record, permission record",
            "to": "c.sendable2"
          }
        ]
      },
      {
        "id": "c.sendable2",
        "kind": "condition",
        "asks": "May the reminder go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "the send path passes and no higher-precedence contactability journey currently holds this person",
            "observes": "send path stages 1-8",
            "to": "a.remind"
          },
          {
            "label": "No route left",
            "when": "no permitted, deliverable destination remains for this purpose; there is nobody left to remind and the reason is recorded",
            "observes": "send path stages 1-8",
            "to": "a.suppress"
          }
        ]
      },
      {
        "id": "a.remind",
        "kind": "action",
        "does": "Send a short reminder that setting a contact preference takes only a moment, to whoever has not yet answered the first question. Carry no offer, no incentive and no argument for the relationship.",
        "execution": "communication",
        "idempotencyKey": "person_id + unengaged_window + a.remind",
        "writes": [
          {
            "field": "sunset_log",
            "mode": "append"
          }
        ],
        "next": "w.remind"
      },
      {
        "id": "w.remind",
        "kind": "wait",
        "until": [
          "marketing_engagement_recorded",
          "frequency_preference_changed",
          "permission_withdrawn"
        ],
        "onEvent": "c.answered2",
        "timeout": {
          "after": {
            "key": "unengaged_sunset.reminder_window",
            "rule": "The fixed span the reminder is given to be answered before the final campaign is due.",
            "class": "response-window",
            "default": {
              "value": {
                "min": "2 days",
                "max": "3 days"
              },
              "confidence": "low",
              "basis": "example-only",
              "applicableWhen": "a push reminder following an unanswered email ask"
            },
            "required": false
          },
          "reason": "a reminder left open indefinitely is a person kept on a list by inertia, which is the state this journey exists to end",
          "relativeTo": "previous-touch"
        },
        "onTimeout": "c.answered2",
        "recheck": "the engagement record, the preference record and the permission record re-read from the systems that own them",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.answered2",
        "kind": "condition",
        "asks": "Did the reminder get an answer?",
        "branches": [
          {
            "label": "Keep it",
            "when": "a recorded engagement with marketing communication is on file for this person inside the reminder window, or they asked to keep hearing from us",
            "observes": "marketing_engagement_recorded",
            "to": "x.kept"
          },
          {
            "label": "Fewer instead",
            "when": "the person set a reduced cadence rather than an ending",
            "observes": "frequency_preference_changed",
            "to": "h.frequency"
          },
          {
            "label": "Stop it",
            "when": "the person withdrew permission for commercial communication themselves",
            "observes": "permission_withdrawn",
            "to": "h.permission"
          },
          {
            "label": "No answer",
            "when": "the reminder window closed with nothing recorded against it",
            "observes": "engagement record, preference record, permission record",
            "to": "c.sendable3"
          }
        ]
      },
      {
        "id": "c.sendable3",
        "kind": "condition",
        "asks": "May the final campaign go out?",
        "branches": [
          {
            "label": "Sendable",
            "when": "the send path passes and no higher-precedence contactability journey currently holds this person",
            "observes": "send path stages 1-8",
            "to": "a.campaign"
          },
          {
            "label": "No route left",
            "when": "no permitted, deliverable destination remains for this purpose; there is nobody left to offer the campaign to and the reason is recorded",
            "observes": "send path stages 1-8",
            "to": "a.suppress"
          }
        ]
      },
      {
        "id": "a.campaign",
        "kind": "action",
        "does": "Send one final, value-focused offer to the person who still has not answered - a genuine, time-boxed incentive named honestly as an offer, with a direct route to it - and nothing claimed about what happens if it goes unanswered beyond what the resolution notice will say.",
        "execution": "communication",
        "idempotencyKey": "person_id + unengaged_window + a.campaign",
        "writes": [
          {
            "field": "sunset_log",
            "mode": "append"
          }
        ],
        "next": "w.campaign"
      },
      {
        "id": "w.campaign",
        "kind": "wait",
        "until": [
          "marketing_engagement_recorded",
          "purchase_completed",
          "frequency_preference_changed",
          "permission_withdrawn"
        ],
        "onEvent": "c.campaign-result",
        "timeout": {
          "after": {
            "key": "unengaged_sunset.campaign_window",
            "rule": "A fixed observation window for the final campaign's own stated duration to run before its outcome is read.",
            "class": "observation-window",
            "default": {
              "value": "7 days",
              "confidence": "low",
              "basis": "example-only",
              "applicableWhen": "a time-boxed final offer with its own stated campaign length"
            },
            "required": false
          },
          "reason": "a campaign whose own window never closes is not a campaign; the outcome has to be read at the point the offer itself said it would end",
          "relativeTo": "previous-touch"
        },
        "onTimeout": "c.campaign-result",
        "recheck": "the engagement record, the purchase record, the preference record and the permission record re-read from the systems that own them",
        "windowExtendsOnEngagement": false
      },
      {
        "id": "c.campaign-result",
        "kind": "condition",
        "asks": "Did the final campaign produce engagement or a purchase?",
        "branches": [
          {
            "label": "Won back",
            "when": "a campaign click, a site visit tied to the offer, or a purchase is on file for this person inside the campaign window",
            "observes": "marketing_engagement_recorded, purchase_completed",
            "to": "a.return-normal"
          },
          {
            "label": "Fewer instead",
            "when": "the person set a reduced cadence rather than an ending",
            "observes": "frequency_preference_changed",
            "to": "h.frequency"
          },
          {
            "label": "Stop it",
            "when": "the person withdrew permission for commercial communication themselves",
            "observes": "permission_withdrawn",
            "to": "h.permission"
          },
          {
            "label": "No response",
            "when": "the campaign window closed with nothing recorded against it",
            "observes": "engagement record, purchase record, preference record, permission record",
            "to": "a.suppress"
          }
        ]
      },
      {
        "id": "a.return-normal",
        "kind": "action",
        "does": "Return the person to marketing contact at a reduced frequency, since the final campaign reached them. Keep them on the list rather than reading one response as a reason to resume full volume.",
        "idempotencyKey": "person_id + unengaged_window + a.return-normal",
        "writes": [
          {
            "field": "sunset_log",
            "mode": "append"
          }
        ],
        "next": "x.campaign-retained"
      },
      {
        "id": "a.suppress",
        "kind": "action",
        "does": "Record a sender-side suppression of marketing contact for this person - every promotional and lifecycle send addressed to them, and nothing beyond that - with the reason, the window it was read from and the condition that would release it. The person's own permission record is left exactly as it was: silence is not an opt-out, and writing one here would put a decision on their record that they never made.",
        "idempotencyKey": "person_id + unengaged_window",
        "writes": [
          {
            "field": "marketing_suppression",
            "mode": "append"
          }
        ],
        "next": "c.notify"
      },
      {
        "id": "c.notify",
        "kind": "condition",
        "asks": "Can the ending be confirmed to the person?",
        "branches": [
          {
            "label": "Confirm it",
            "when": "a permitted, deliverable destination remains for a service notice of this kind",
            "observes": "send path stages 1-8",
            "to": "a.confirm-end"
          },
          {
            "label": "Nothing to confirm on",
            "when": "no route to this person remains; the suppression stands and is recorded without a notice",
            "observes": "send path stages 1-8",
            "to": "x.ended"
          }
        ]
      },
      {
        "id": "a.confirm-end",
        "kind": "action",
        "does": "Confirm that marketing contact has ended, name what continues because it was never marketing - anything the person holds, owes or is owed - and leave the route back for whenever they want it. This is a notice about our own sending and says so, rather than thanking them or asking again.",
        "execution": "communication",
        "idempotencyKey": "person_id + unengaged_window + a.confirm-end",
        "writes": [
          {
            "field": "sunset_log",
            "mode": "append"
          }
        ],
        "next": "h.enforce"
      },
      {
        "id": "h.enforce",
        "kind": "handoff",
        "to": "CON-38",
        "on": "marketing contact ended for this person, with the suppression now needing to be held, scoped and released by the mechanism that owns suppression states",
        "carries": [
          "person_id",
          "the suppression scope - every promotional and lifecycle send addressed to this person, and nothing they hold, owe or are owed",
          "the reason and the unengaged window it was read from",
          "the release condition: permission given afresh, never the passing of time"
        ],
        "suppresses": [
          "every promotional and lifecycle journey addressed to this person",
          "their queued and in-flight commercial sends",
          "re-entry into this journey while the suppression stands"
        ],
        "contract": {
          "requiredFields": [
            "person_id",
            "suppression_scope",
            "suppression_reason",
            "release_condition"
          ]
        }
      },
      {
        "id": "h.frequency",
        "kind": "handoff",
        "to": "CON-283",
        "on": "a reduced cadence chosen instead of an ending",
        "carries": [
          "person_id",
          "the cadence the person chose and the classes it governs",
          "that this came from a contactability question rather than from the preference centre unprompted"
        ],
        "suppresses": [
          "every further touch in this journey",
          "the suppression this journey would otherwise have recorded"
        ],
        "contract": {
          "requiredFields": [
            "person_id",
            "new_cadence",
            "governed_classes"
          ]
        }
      },
      {
        "id": "h.permission",
        "kind": "handoff",
        "to": "CON-35",
        "on": "the person withdrawing permission for commercial communication themselves",
        "carries": [
          "person_id",
          "the permission record that changed, at its purpose, channel and scope",
          "the time and origin of the change, so an out-of-order update cannot undo it"
        ],
        "suppresses": [
          "every further touch in this journey",
          "every queued commercial send for this person"
        ],
        "contract": {
          "requiredFields": [
            "person_id",
            "change_version",
            "permission_purpose",
            "change_origin"
          ]
        }
      },
      {
        "id": "a.record-no-action",
        "kind": "action",
        "does": "Record why the question was not asked and against which window, so no-action is a measured outcome rather than a silent absence",
        "writes": [
          {
            "field": "suppressed_sends",
            "mode": "append"
          }
        ],
        "idempotencyKey": "person_id + unengaged_window",
        "next": "x.no-action"
      },
      {
        "id": "x.active-reduced",
        "kind": "exit",
        "state": "reduced marketing frequency applied without asking; recorded activity outside marketing says the relationship is not dormant even though marketing contact itself went unanswered",
        "class": "success",
        "terminal": false,
        "reEntry": "a later unengaged window is read on its own evidence, after the cooldown"
      },
      {
        "id": "x.campaign-retained",
        "kind": "exit",
        "state": "kept at a reduced frequency; the final campaign reached them with a real offer",
        "class": "success",
        "terminal": false,
        "reEntry": "a later unengaged window is read on its own evidence, after the cooldown"
      },
      {
        "id": "x.kept",
        "kind": "exit",
        "state": "kept; the person answered and marketing contact continues unchanged",
        "class": "success",
        "terminal": false,
        "reEntry": "a later unengaged window is read on its own evidence, after the cooldown"
      },
      {
        "id": "x.answered",
        "kind": "exit",
        "state": "closed without asking; the person had already answered the question themselves",
        "class": "suppression",
        "terminal": false,
        "reEntry": "a later unengaged window opens its own instance, read from the sends made after the answer"
      },
      {
        "id": "x.ended",
        "kind": "exit",
        "state": "marketing contact ended; the suppression is recorded and no route remained to confirm it on",
        "class": "success",
        "terminal": false,
        "reEntry": "permission given afresh releases the suppression; nothing inside this journey reopens it"
      },
      {
        "id": "x.no-action",
        "kind": "exit",
        "state": "no question asked; the reason is recorded",
        "class": "no-action",
        "terminal": false,
        "reEntry": "the next unengaged window is evaluated on its own gates"
      }
    ],
    "implementation": {
      "attributes": {
        "required": [
          "person_id",
          "unengaged_window",
          "marketing_sends_in_window",
          "engagement_reporting_available",
          "permission_state"
        ],
        "optional": [
          "last_engagement_at",
          "preference_destination",
          "email_address",
          "has_active_app_session",
          "recent_activity_at",
          "push_token"
        ]
      }
    },
    "measurement": {
      "journeyOutcome": {
        "type": "exit-or-handoff",
        "refs": [
          "x.active-reduced",
          "x.campaign-retained",
          "x.kept",
          "x.answered",
          "x.ended",
          "x.no-action",
          "h.enforce",
          "h.frequency",
          "h.permission"
        ]
      },
      "secondary": [
        "frequency_preference_changed",
        "permission_withdrawn",
        "purchase_completed"
      ],
      "guardrails": [
        "unsubscribe",
        "complaint",
        "marketing_send_after_sunset",
        "service_message_suppressed_by_sunset",
        "sunset_without_observable_window",
        "consent_record_written_from_silence"
      ],
      "operational": [
        "entry_volume",
        "active_bypass_rate",
        "answer_rate_by_kind",
        "reduction_instead_of_ending_rate",
        "campaign_recovery_rate",
        "sunset_rate",
        "no_action_rate_by_reason"
      ]
    },
    "discovery": {
      "aliases": [
        "unengaged subscriber sunset",
        "sunset policy",
        "list hygiene",
        "inactive subscriber removal",
        "re-permission",
        "are you still interested"
      ],
      "useCases": [
        "somebody who has answered none of the marketing sent to them, asked once whether it should continue",
        "ending marketing contact that no evidence supports any more, without recording an opt-out the person never gave",
        "somebody active on the product elsewhere getting a lighter cadence instead of the full cascade"
      ]
    },
    "distinctFrom": [
      {
        "journey": "RET-32",
        "because": "RET-32 is trying to get a lapsed paid relationship back and speaks to that relationship. This journey is deciding whether we may keep speaking at all to somebody who has answered nothing, regardless of whether they have ever paid, are still buying, or long ago lapsed - and it reaches for its own final offer only because nothing else answered the question, not because it is arguing to keep them."
      },
      {
        "journey": "CON-272",
        "because": "CON-272 asks to reopen a channel whose permission just closed, which is a fresh, specific request. This decides whether a route that is already open should keep being used at all, which is a standing-silence question - and a channel CON-272 is still trying to reopen is exactly why nothing was engaged with there, so this journey stands down while that one holds the person."
      },
      {
        "journey": "CON-283",
        "because": "CON-283 confirms a reduced cadence somebody chose for themselves. This journey is what puts that choice in front of somebody who has chosen nothing, and it hands the reduction to CON-283 the moment they take it."
      },
      {
        "journey": "CON-38",
        "because": "CON-38 holds, scopes and releases a suppression once it exists. This journey is the decision that one is warranted, and the suppression it produces is the sender-side kind CON-38 keeps apart from a permission the person withdrew."
      }
    ],
    "guardrails": [
      "Silence is read only where engagement could have been observed; an unreportable route produces no conclusion.",
      "Somebody active elsewhere is moved to a lighter cadence without ever being asked; that bypass is a cadence change, not an answer standing in for a permission decision.",
      "A reduced cadence is offered before contact is ended, and taking it hands the person to the journey that owns the reduction.",
      "What the person holds, owes or is owed is never affected - a sunset ends marketing contact and nothing else.",
      "The ending is recorded as a sender-side suppression, never as an opt-out on the person's own consent record.",
      "Ending marketing contact ends the promotional and the lifecycle sends alike; keeping the birthday, the anniversary or the tier announcement running is the narrow reading, and it makes the ending untrue.",
      "The suppression is read by every promotional and lifecycle journey in the library and by nothing transactional, service, security or mandatory; one that only this journey knows about has stopped nothing.",
      "The one real incentive in this journey appears exactly once, on the final campaign, named honestly as an offer rather than folded into the contact-preference question; nothing earlier in the cascade carries one."
    ],
    "reusableRule": "Deciding whether to keep contacting somebody is a separate question from whether to keep them, and it is answered by bypassing anyone still active elsewhere, asking once, reminding once, offering once more, and recording the ending against our own sending rather than against their consent."
  },
];
