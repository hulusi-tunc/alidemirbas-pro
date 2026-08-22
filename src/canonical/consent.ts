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
    name: "Permission capture → validate scope → activate or reject",
    purpose:
      "Turn a permission decision into an auditable record of what exactly was authorised, rather than a flag that says yes.",
    entity: {
      scope: "person plus the permission record, keyed by purpose, channel and scope",
      note: "One record per purpose x channel x scope. Consent to product notices by email is a different record from consent to marketing by email, and neither is a record about SMS.",
    },
    distinctFrom: [
      {
        journey: "CON-32",
        because:
          "This creates authorisation. CON-32 records how someone would like authorised communication done, which is a different fact and must never be able to create this one.",
      },
    ],
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
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "not recorded as permission",
        terminal: false,
        reEntry:
          "a genuine permission decision later creates one normally; nothing partial is stored that a later process could mistake for consent",
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
      },
      {
        id: "a.activate",
        kind: "action",
        does: "Activate the permission for exactly the purpose, channel and scope captured, and nothing adjacent to them",
        writes: [{ field: "permission_log", mode: "append" }],
        next: "x.active",
      },
      {
        id: "x.active",
        kind: "exit",
        state: "permission active for the captured purpose, channel and scope",
        terminal: false,
        reEntry:
          "any later decision on the same combination opens a new instance; changes to an active permission are CON-35's, not this journey's",
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
    name: "Preference capture → persist → personalise eligible communication",
    purpose:
      "Record how someone would like permitted communication done, in a store that structurally cannot become permission.",
    entity: {
      scope: "person plus the declared-preference profile",
      note: "Declared preferences live in their own store. Inferred interests live in another, and the two are never written to the same field.",
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
      },
      {
        id: "a.apply",
        kind: "action",
        does: "Apply the preference to communication that is already permitted - which is the only thing a preference can do",
        next: "h.recalculate",
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
    name: "Preference change → recalculate active journeys → suppress or adapt",
    purpose:
      "Make a preference change reach the messages already sitting in a queue, not just the profile field.",
    entity: {
      scope: "person plus the preference plus every active journey instance and queued action it touches",
      note: "The scope is deliberately wide on the forward side and closed on the backward one: everything not yet executed, nothing already delivered.",
    },
    entry: "t.changed",
    nodes: [
      {
        id: "t.changed",
        kind: "trigger",
        event: "authoritative_preference_changed",
        evidence: {
          requires: ["a recorded preference change with its previous value"],
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
      },
      {
        id: "a.adapt",
        kind: "action",
        does: "Adapt the pending actions to the new preference before execution rather than after - adapting afterwards is called an apology",
        next: "x.recalculated",
      },
      {
        id: "x.recalculated",
        kind: "exit",
        state: "future orchestration aligned to the new preference; permission unchanged",
        terminal: false,
        reEntry: "the next preference change re-opens this",
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
    name: "Communication frequency change → recalculate cadence → apply prospectively",
    purpose:
      "Recalculate how often optional communication may go out, without letting that quietly reach the messages someone has to receive.",
    entity: {
      scope: "person plus the communication classes the frequency preference actually governs",
      note: "The governed set is the whole question. A frequency preference that silently covers required communication is an opt-out nobody chose.",
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
    name: "Consent or permission change → immediate enforcement → propagate",
    purpose:
      "Stop affected communication the moment permission changes, and let the distributed systems catch up afterwards.",
    entity: {
      scope: "person plus the permission record that changed, at its purpose, channel and scope",
      note: "Enforcement is scoped to what actually changed. A withdrawal of marketing email consent does not suspend service notices, and treating it as though it did is its own failure.",
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
        does: "Record the old state, the new state, the source, the time, and the scope, purpose and channel it applies to - appended, because the question later is always what we were authorised to do at a particular moment",
        writes: [{ field: "permission_log", mode: "append" }],
        next: "c.direction",
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
      },
      {
        id: "a.propagate",
        kind: "action",
        does: "Propagate the new state to the dependent systems, carrying origin and version so that an out-of-order echo cannot revert it and a redelivery cannot restart the exchange",
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
          "the intended state with its version and origin",
          "which systems disagree and what each of them holds",
          "the fact that local enforcement is already applied, so the conflict is about consistency rather than about whether to send",
        ],
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
    name: "Channel contactability change → recalculate reachability → route or suppress",
    purpose:
      "Track whether a channel can reach someone, as a state entirely separate from whether it may, and keep each destination's route health separately so future sending routes around what is broken.",
    entity: {
      scope: "person plus the specific contact point - this address, this number, this device token",
      note: "Contactability belongs to the contact point, not the person and not the channel class. One dead device token does not make push unreachable, and there is deliberately no person-level reachable flag - one would erase every route the failing one is not.",
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
      },
      {
        id: "a.resume",
        kind: "action",
        does: "Allow future eligible communication on this contact point again, recorded from the current evidence rather than by clearing the history of why it was suppressed. The prior failures stay readable, because a route that keeps breaking and being restored is worth being able to see. What was missed while it was unreachable is not replayed - the queue described a state that has since moved",
        writes: [{ field: "contactability_log", mode: "append" }],
        next: "c.pending",
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
          "the affected obligations and the destination whose state changed",
          "the explicit instruction to re-resolve destinations rather than to resend - nothing was delivered to the failing route",
        ],
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
    name: "Communication suppression → reason → release or persist",
    purpose:
      "Make every reason something is not being sent an explicit, scoped, releasable state rather than an absence.",
    entity: {
      scope: "the person, message or journey instance the suppression applies to, at the scope recorded with it",
      note: "The scope is part of the record. A cooldown on one channel and a legal restriction across all of them are both suppressions and share nothing else.",
    },
    distinctFrom: [
      {
        journey: "CON-39",
        because:
          "A cooldown is one reason among the nine this journey holds. It has its own journey because its release is time-based and its scope is deliberately partial, which the general mechanism does not assume.",
      },
    ],
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
      },
      {
        id: "w.release",
        kind: "wait",
        until: ["the recorded release condition is met"],
        onEvent: "a.reevaluate",
        timeout: {
          after: "a review horizon appropriate to the reason",
          reason:
            "a temporary suppression whose release condition never arrives has quietly become permanent, and the review is what forces that to be said out loud",
        },
        onTimeout: "c.still",
        windowExtendsOnEngagement: false,
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
      },
      {
        id: "x.released",
        kind: "exit",
        state: "suppression released; current state re-evaluated, backlog discarded",
        terminal: false,
        reEntry: "any new suppression condition opens its own instance with its own reason and scope",
      },
    ],
    guardrails: [
      "Suppression is not deletion. Nothing is removed; sending is stopped.",
      "Release is not replay. What was held is discarded and current eligibility is recalculated.",
      "Different reasons carry different scopes, and a suppression without its scope cannot be released correctly.",
      "Suppression we impose on ourselves is a separate state from permission the person gave us. A sender-side hold is not an unsubscribe, it is recorded against our own sending rather than against their consent, and nobody may read it as a decision they made.",
      "Releasing a sender-side suppression asks for permission again rather than switching sending back on. Silence long enough to suppress for is not consent that survived it."
    ],
    reusableRule:
      "Suppression should be explicit, scoped and reversible only when its underlying reason is no longer valid.",
  },

  /* ------------------------------------------------------------ CON-39 */
  {
    id: "CON-39",
    slug: "communication-cooldown",
    category: "consent",
    name: "Communication cooldown → hold optional messaging → re-evaluate",
    purpose:
      "Reduce optional communication pressure for a while, without touching permission and without covering more than it needs to.",
    entity: {
      scope: "person or account plus the communication context the cooldown was created for",
      note: "A cooldown covers what its reason justifies. One that reaches every channel by default is an opt-out that nobody chose and nobody can find.",
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
        does: "Create the cooldown scoped to what its reason actually justifies, recording the reason, the scope, the start, and either an expiry or the condition that would end it early",
        writes: [{ field: "cooldown_log", mode: "append" }],
        next: "c.scope",
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
          "the cooldown's reason and scope, and what changed",
          "the fact that this needs a stated reason and release condition rather than an expiry",
        ],
      },
      {
        id: "a.reevaluate",
        kind: "action",
        does: "Re-evaluate what is eligible now and act on that. Anything queued when the cooldown began is discarded rather than released - a cooldown that ends by flushing a backlog has achieved nothing except a delay",
        writes: [{ field: "cooldown_log", mode: "append" }],
        next: "x.released",
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
    name: "Permission conflict → fail-safe state → reconcile → restore",
    purpose:
      "Hold optional communication closed while two systems disagree about permission, and reconcile on evidence rather than on whichever value allows more.",
    entity: {
      scope: "person plus the specific permission type, channel and purpose that disagrees",
      note: "Only the disputed combination is suppressed. A conflict about marketing email does not close service notices, and widening it would make the fail-safe worse than the failure.",
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
      },
      {
        id: "a.collect",
        kind: "action",
        does: "Collect from each participating system its state, source, timestamp, version and the provenance of the change. A timestamp alone is not authority - clocks disagree, and write order is not the order things were decided",
        writes: [{ field: "permission_conflict_log", mode: "append" }],
        next: "a.scope",
      },
      {
        id: "a.scope",
        kind: "action",
        does: "Determine exactly which purpose, channel and scope combination is in dispute. Everything outside it is not in conflict and is not suppressed",
        writes: [{ field: "permission_conflict_log", mode: "append" }],
        next: "c.resolvable",
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
        does: "Apply the established state and propagate the correction with origin and version, so a redelivered or out-of-order echo is discarded rather than treated as a new change - which is what turns a reconciliation into a synchronisation loop",
        writes: [{ field: "permission_log", mode: "append" }],
        next: "a.verify",
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify convergence across the systems that are required to agree, using idempotent versioned writes so verification cannot itself become another round of the exchange",
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
];
