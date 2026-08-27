import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 12 - INTEGRATIONS, SYNCHRONIZATION, EXTERNAL SYSTEMS & DATA CONSISTENCY

   Everything that happens on the other side of a network boundary, where the
   thing that distinguishes this category from the rest of the library is that
   we routinely do not know what happened.

   Elsewhere a state is unknown because nobody has decided it yet. Here it is
   unknown because the decision was made by a system we cannot currently see,
   and the ordinary failure is to resolve that uncertainty in whichever
   direction is easiest to code:

     the request returned 200        so the operation completed
     the connection timed out        so the operation failed
     the token refreshed             so the integration is healthy
     the connection came back        so we are up to date
     this value is newer             so this value is right

   Every one of those is a guess wearing the clothes of a result, and each has
   a specific cost. The first double-charges. The second retries something
   that already happened. The third sends into a scope we no longer hold. The
   fourth replays a week of held messages in one burst. The fifth lets
   whichever system wrote last win an argument it may have had no authority in.

   So the category's spine is INT-114 and INT-115: submission and completion
   are separate states, an unknown outcome stays unknown, and reconciliation
   happens before any retry. Everything else is built on that refusal to
   convert silence into a finding. */

export const INTEGRATION_RULES: readonly OrchestrationRule[] = [
  {
    id: "INT-R1",
    scope: "integration",
    rule: "Connection, authentication, authorization scope, synchronization and health are five separate states.",
    because:
      "An integration can be connected and unauthorised, authorised and unsynchronised, synchronised and unhealthy. One status field reports the first of those and hides the rest.",
  },
  {
    id: "INT-R2",
    scope: "integration",
    rule: "Submitting an external request and completing an external business operation are separate states.",
    because:
      "The provider's acknowledgement describes their queue, not their outcome, and the gap between the two is where every duplicate side effect is created.",
  },
  {
    id: "INT-R3",
    scope: "integration",
    rule: "A timeout or a lost connection is not proof that an external operation failed.",
    because:
      "It proves our side of the conversation ended. The provider may have completed the operation, and treating our silence as their failure is what turns one payment into two.",
  },
  {
    id: "INT-R4",
    scope: "integration",
    rule: "An ambiguous external outcome is reconciled before any retry.",
    because:
      "Retrying an unknown is how a single unknown becomes two operations, one of which nobody is looking for.",
  },
  {
    id: "INT-R6",
    scope: "integration",
    rule: "Processing a duplicate webhook or event is harmless.",
    because:
      "Providers redeliver by design. An integration that is not safe against redelivery is not broken occasionally - it is broken on a schedule set by someone else.",
  },
  {
    id: "INT-R7",
    scope: "integration",
    rule: "A late external event is checked against current state before it mutates anything.",
    because:
      "It can be a valid record of what happened without being a valid instruction about what is true now, and applying it blindly overwrites a newer decision with an older one.",
  },
  {
    id: "INT-R8",
    scope: "integration",
    rule: "Integration failure and integration lag are separate problems.",
    because:
      "One means operations cannot proceed; the other means they proceed late. Queueing work against a slow integration adds to the queue that is already the problem.",
  },
  {
    id: "INT-R9",
    scope: "integration",
    rule: "Reconnecting does not mean synchronization or backfill is complete.",
    because:
      "The connection recovering is the moment the gap becomes measurable, not the moment it closes. Marking the integration healthy there hides the missing window entirely.",
  },
  {
    id: "INT-R10",
    scope: "integration",
    rule: "Backfill repairs state and history without blindly replaying historical customer-facing actions.",
    because:
      "A week of held events replayed on reconnection delivers a week of messages at once, most of them describing states that have since moved.",
  },
  {
    id: "INT-R11",
    scope: "integration",
    rule: "Synchronization conflicts are resolved through explicit authority rules.",
    because:
      "Without one, the resolution is decided by whichever system happened to write last, which is a property of scheduling rather than of correctness.",
  },
  {
    id: "INT-R12",
    scope: "integration",
    rule: "Last-write-wins is never used as a universal reconciliation strategy.",
    because:
      "Different fields have different sources of truth. A single rule across all of them is right for the fields it was designed against and silently wrong everywhere else.",
  },
  {
    id: "INT-R13",
    scope: "integration",
    rule: "Integration failure affects the smallest valid capability scope.",
    because:
      "Disabling a whole integration because one endpoint failed converts a provider's partial outage into a total one on our side.",
  },
  {
    id: "INT-R14",
    scope: "integration",
    rule: "Work queued during a failure is revalidated after recovery, not simply sent.",
    because:
      "The world moved while the integration was down, and a queued instruction written against the old world is not automatically still correct.",
  },
  {
    id: "INT-R15",
    scope: "integration",
    rule: "A recovery backlog is drained in a controlled manner.",
    because:
      "An integration that has just come back, met with everything it missed at once, goes down again - and the second outage looks like a new fault rather than our own doing.",
  },
  {
    id: "INT-R16",
    scope: "integration",
    rule: "A provider outage does not convert an UNKNOWN outcome into a FAILED one without evidence.",
    because:
      "Marking a user's action failed because we lost sight of it is a statement about us presented as a statement about them, and it is acted on downstream as though it were confirmed.",
  },
  {
    id: "INT-R17",
    scope: "integration",
    rule: "Integration state changes and external side effects are auditable and idempotent.",
    because:
      "These operations are retried by design at every layer, and the audit is the only way to reconstruct what actually reached the provider when the two sides disagree.",
  },
];

export const INTEGRATION_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ INT-111 */
  {
    id: "INT-111",
    slug: "integration-connection-activation",
    category: "integration",
    goal: "progression-milestone",
    name: "Integration connection → authenticate → validate → activate",
    purpose:
      "Make an integration active only once it has been proven to do the thing it exists for, rather than once a credential has been saved.",
    entity: {
      scope: "the individual integration connection, with its own credentials, scopes and validated capabilities",
      note: "One connection per configured integration. A second connection to the same provider is a separate one with its own scopes, and neither inherits the other's validation.",
    },
    distinctFrom: [
      {
        journey: "INT-113",
        because:
          "This establishes that an integration works at all. INT-113 handles one that worked and has started to stop, which is a question about evidence over a window rather than about setup.",
      },
    ],
    entry: "t.requested",
    nodes: [
      {
        id: "t.requested",
        kind: "trigger",
        event: "integration_connection_requested",
        evidence: {
          requires: ["a request to establish an integration connection with an identified provider"],
          insufficientAlone: [
            "a credential saved in a settings screen, which stores a secret and connects nothing",
            "a provider selected from a list",
          ],
          source: "authoritative",
        },
        next: "a.configure",
      },
      {
        id: "a.configure",
        kind: "action",
        does: "Collect and configure the connection parameters this provider requires",
        writes: [{ field: "integration_log", mode: "append" }],
        next: "c.auth",
      },
      {
        id: "c.auth",
        kind: "condition",
        asks: "Does authentication succeed?",
        branches: [
          {
            label: "Authenticated",
            when: "the provider accepts the credentials",
            to: "a.scopes",
          },
          {
            label: "Failed",
            when: "the provider rejects them",
            to: "x.auth-failed",
          },
        ],
      },
      {
        id: "x.auth-failed",
        kind: "exit",
        state: "AUTH_FAILED; not connected",
        terminal: false,
        reEntry:
          "corrected credentials re-enter from the start. Nothing partial is left active, because a half-configured integration is one that fails on its first real operation rather than during setup",
      },
      {
        id: "a.scopes",
        kind: "action",
        does: "Validate the minimum capabilities and scopes this integration actually needs. Authentication proves the provider will talk to us; it says nothing about whether we are permitted to do the things we intend to do",
        writes: [{ field: "integration_log", mode: "append" }],
        next: "c.scope",
      },
      {
        id: "c.scope",
        kind: "condition",
        asks: "Is the required access available?",
        branches: [
          {
            label: "Sufficient",
            when: "every capability the integration needs is within the granted scope",
            to: "a.validate",
          },
          {
            label: "Insufficient",
            when: "a required capability is outside what was granted",
            to: "x.insufficient",
          },
        ],
      },
      {
        id: "x.insufficient",
        kind: "exit",
        state: "INSUFFICIENT_SCOPE; configuration required",
        terminal: false,
        reEntry:
          "the missing scope is named rather than reported as a generic connection failure - the two produce entirely different remediation and only one of them is actionable",
      },
      {
        id: "a.validate",
        kind: "action",
        does: "Perform a safe connectivity and capability validation - a read, a dry run, a no-op probe. Validation must not have destructive side effects: proving we can delete something by deleting it is not a test",
        writes: [{ field: "integration_log", mode: "append" }],
        next: "c.validated",
      },
      {
        id: "c.validated",
        kind: "condition",
        asks: "Did validation succeed?",
        branches: [
          { label: "Validated", when: "the probe confirmed the capability works", to: "a.activate" },
          { label: "Failed", when: "the probe did not confirm it", to: "x.failed" },
        ],
      },
      {
        id: "x.failed",
        kind: "exit",
        state: "FAILED; authenticated and scoped, not operational",
        terminal: false,
        reEntry:
          "remediation re-enters at validation. This state exists because authenticated and working are different, and reporting the first as the second is the failure this journey is built around",
      },
      {
        id: "a.activate",
        kind: "action",
        does: "Record the connection as ACTIVE, with the capabilities that were actually validated rather than the ones that were configured",
        writes: [{ field: "integration_log", mode: "append" }],
        next: "x.active",
      },
      {
        id: "x.active",
        kind: "exit",
        state: "ACTIVE; authenticated, scoped and validated",
        terminal: false,
        reEntry: "authorization changes go to INT-112 and health changes to INT-113",
      },
    ],
    guardrails: [
      "A saved credential is not a connection.",
      "Authentication success is not sufficient authorization scope.",
      "Connection validation avoids destructive side effects.",
      "A missing scope is named specifically rather than reported as a generic failure.",
    ],
    reusableRule:
      "An integration becomes active only after authentication, required scope and minimum operational capability have been validated.",
  },

  /* ------------------------------------------------------------ INT-112 */
  {
    id: "INT-112",
    slug: "integration-authorization-change",
    category: "integration",
    goal: "access-entitlement-change",
    name: "Integration credential or authorization change → revalidate → continue or degrade",
    purpose:
      "Recheck what an integration can still do whenever its authorization changes, rather than assuming valid credentials mean unchanged access.",
    entity: {
      scope: "the integration connection and the authorization that changed",
      note: "Scope reduction affects the capabilities that depended on the removed scope. Everything else keeps working, and treating the whole connection as broken is its own outage.",
    },
    entry: "t.auth-change",
    nodes: [
      {
        id: "t.auth-change",
        kind: "trigger",
        event: "integration_authorization_changed",
        evidence: {
          requires: [
            "a material change to the connection's authorization: a token refreshed, a credential rotated, a scope reduced, an authorization revoked, or a service account changed",
          ],
          source: "authoritative",
        },
        next: "a.invalidate-cache",
      },
      {
        id: "a.invalidate-cache",
        kind: "action",
        does: "Invalidate the cached authorization. A queued retry holding a credential that has since been rotated away must not succeed on it - an old credential coming back through a retry is the specific failure this step exists to prevent",
        writes: [{ field: "integration_log", mode: "append" }],
        next: "a.revalidate",
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Revalidate the required capabilities against the new authorization. A token refreshing successfully means the provider will talk to us; it says nothing about whether the scope we had is the scope we still have",
        writes: [{ field: "integration_log", mode: "append" }],
        next: "c.functional",
      },
      {
        id: "c.functional",
        kind: "condition",
        asks: "What does revalidation show?",
        branches: [
          {
            label: "Fully functional",
            when: "every capability the integration uses is still available",
            to: "x.active",
          },
          {
            label: "Partially functional",
            when: "some capabilities are no longer within the granted scope and others are",
            to: "a.degrade",
          },
          {
            label: "No longer usable",
            when: "authorization was revoked, or nothing the integration needs remains available",
            to: "h.failure",
          },
        ],
      },
      {
        id: "x.active",
        kind: "exit",
        state: "ACTIVE; authorization changed and capability unchanged",
        terminal: false,
        reEntry: "the next authorization change revalidates again",
      },
      {
        id: "a.degrade",
        kind: "action",
        does: "Mark the affected capabilities DEGRADED and name exactly which. A reduced scope disables what depended on it, not the integration",
        writes: [{ field: "integration_log", mode: "append" }],
        next: "a.suppress",
      },
      {
        id: "a.suppress",
        kind: "action",
        does: "Suppress the operations incompatible with the reduced authorization, leaving everything else running",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "x.degraded",
      },
      {
        id: "x.degraded",
        kind: "exit",
        state: "DEGRADED; affected capabilities named, the rest operating",
        terminal: false,
        reEntry: "restored scope revalidates and lifts the degradation for the capabilities it covers",
      },
      {
        id: "h.failure",
        kind: "handoff",
        to: "INT-116",
        on: "authorization leaving the integration unusable",
        carries: [
          "what was revoked and when",
          "any external operations already submitted and still unresolved, which the authorization change does not resolve",
        ],
      },
    ],
    guardrails: [
      "A successful token refresh does not mean the integration is fully healthy.",
      "A reduced scope affects only the capabilities that depended on it.",
      "Old credentials do not become active again through a stale retry.",
    ],
    reusableRule:
      "Integration authorization changes require capability revalidation because valid credentials do not guarantee unchanged operational access.",
  },

  /* ------------------------------------------------------------ INT-113 */
  {
    id: "INT-113",
    slug: "integration-health-degradation",
    category: "integration",
    goal: "recovery-retry",
    name: "Integration health degradation → diagnose → recover, degrade or escalate",
    purpose:
      "Scope a deteriorating integration to what is actually failing, and let recovery be established by evidence rather than by a metric returning to normal.",
    entity: {
      scope: "the integration connection, assessed per capability rather than as a whole",
      note: "Health is measured over a window. A single error is an event; a pattern across a window is evidence, and only the second one means anything.",
    },
    entry: "t.threshold",
    nodes: [
      {
        id: "t.threshold",
        kind: "trigger",
        event: "integration_health_threshold_crossed",
        evidence: {
          requires: [
            "a meaningful health threshold crossed over a defined window: an elevated error rate, repeated timeouts, a partial endpoint failure, unexpected latency, authentication instability, or a declared provider degradation",
          ],
          insufficientAlone: [
            "one transient error",
            "a single timeout",
            "one slow response",
          ],
          source: "behavioral",
        },
        next: "a.classify",
      },
      {
        id: "a.classify",
        kind: "action",
        does: "Classify the affected scope - which endpoints, which capabilities, which operations. One endpoint failing does not make the integration unhealthy, and disabling everything because of it is a self-inflicted outage larger than the provider's",
        writes: [{ field: "integration_health_log", mode: "append" }],
        next: "c.nature",
      },
      {
        id: "c.nature",
        kind: "condition",
        asks: "What is the nature of the degradation?",
        branches: [
          {
            label: "Transient",
            when: "the pattern is expected to clear and the affected operations are safe to retry",
            to: "a.backoff",
          },
          {
            label: "Capability-specific",
            when: "particular capabilities are failing while others are unaffected",
            to: "a.degrade",
          },
          {
            label: "Whole integration unusable",
            when: "the degradation reaches everything the integration does",
            to: "h.failure",
          },
        ],
      },
      {
        id: "a.backoff",
        kind: "action",
        does: "Retry with backoff, only for operations where retrying is safe. Operations with external side effects are not retried on a health signal - their safety depends on an idempotency key and a known outcome, neither of which a health metric provides",
        writes: [{ field: "integration_health_log", mode: "append" }],
        next: "w.health",
      },
      {
        id: "a.degrade",
        kind: "action",
        does: "Mark only the affected capabilities DEGRADED, preserving everything unaffected",
        writes: [{ field: "integration_health_log", mode: "append" }],
        next: "w.health",
      },
      {
        id: "w.health",
        kind: "wait",
        until: ["health recovers", "the degradation worsens past the failure threshold"],
        onEvent: "c.direction",
        timeout: {
          after: "the operational SLA for this integration",
          reason:
            "a degradation that neither clears nor worsens within its SLA is a steady state nobody chose, and it is worth escalating rather than watching indefinitely",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.direction",
        kind: "condition",
        asks: "Which way did it move?",
        branches: [
          { label: "Recovered", when: "the health evidence returned to normal across the window", to: "a.restore" },
          { label: "Worsened", when: "the degradation crossed the failure threshold", to: "h.failure" },
        ],
      },
      {
        id: "a.restore",
        kind: "action",
        does: "Revalidate the degraded capabilities before restoring them. A metric returning to normal is evidence to check rather than a conclusion to act on - the underlying cause may have been a scope change or a provider deprecation that a health graph cannot see",
        writes: [{ field: "integration_health_log", mode: "append" }],
        next: "x.recovered",
      },
      {
        id: "x.recovered",
        kind: "exit",
        state: "health restored; capabilities revalidated before being re-enabled",
        terminal: false,
        reEntry: "a further threshold crossing is assessed against its own window",
      },
      {
        id: "h.failure",
        kind: "handoff",
        to: "INT-116",
        on: "degradation reaching the failure threshold",
        carries: [
          "the affected scope and the evidence that established it",
          "which capabilities were still working, so the failure stays scoped to what actually failed",
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a degradation persisting past its operational SLA",
        carries: ["the affected capabilities and how long they have been degraded"],
      },
    ],
    guardrails: [
      "One transient error is not a degraded integration.",
      "Health is judged on evidence across a defined window.",
      "Healthy capabilities are not disabled because an unrelated endpoint failed.",
      "Operations with external side effects are not retried on a health signal alone.",
    ],
    reusableRule:
      "Integration degradation should be scoped to the capabilities actually affected while recovery remains evidence-driven.",
  },

  /* ------------------------------------------------------------ INT-114 */
  {
    id: "INT-114",
    slug: "external-operation-outcome",
    category: "integration",
    goal: "delivery-confirmation",
    name: "External request → pending outcome → confirm, fail or unknown",
    purpose:
      "Keep submitting an external operation and completing one as separate states, and let an unknown outcome stay unknown.",
    entity: {
      scope: "the individual external operation, keyed by its own correlation and idempotency identifiers",
      note: "The identifiers are recorded before submission, because they are what makes any later retry safe or any later outcome attributable - generating them after a failure is too late to help with that failure.",
    },
    distinctFrom: [
      {
        journey: "INT-115",
        because:
          "This owns the operation from submission until an outcome exists. INT-115 owns what happens to local state once one does, and most operations pass through both.",
      },
    ],
    entry: "t.submitted",
    nodes: [
      {
        id: "t.submitted",
        kind: "trigger",
        event: "external_operation_submitted",
        evidence: {
          requires: ["an operation submitted to an external provider on behalf of a business action"],
          source: "authoritative",
        },
        next: "a.persist",
      },
      {
        id: "a.persist",
        kind: "action",
        does: "Persist the operation id, the provider's request id, the action requested, the target entity, the submission time and the idempotency key, and record the state as PENDING_EXTERNAL_OUTCOME. Submitted is not completed, and nothing downstream may report the business action as done on the strength of this",
        writes: [{ field: "external_operation_log", mode: "append" }],
        next: "c.immediate",
      },
      {
        id: "c.immediate",
        kind: "condition",
        asks: "What did the provider actually return?",
        branches: [
          {
            label: "An authoritative final outcome",
            when: "the response states the business operation's result, not merely that the request arrived",
            to: "h.reconcile",
          },
          {
            label: "Accepted, not completed",
            when: "the response acknowledges receipt - a 200 that means the request is queued is not the operation completing, and treating it as one is the most common error in this journey",
            to: "w.outcome",
          },
        ],
      },
      {
        id: "w.outcome",
        kind: "wait",
        until: [
          "a callback or webhook delivers the outcome",
          "a poll returns a final result",
          "the provider confirms out of band",
        ],
        onEvent: "h.reconcile",
        timeout: {
          after: "the operation's outcome window",
          reason:
            "the window ending means we stopped hearing, which is a fact about our visibility rather than about the provider's work",
        },
        onTimeout: "a.unknown",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.unknown",
        kind: "action",
        does: "Record the outcome as UNKNOWN, not as failed. A timeout says our side of the conversation ended; it says nothing about whether the provider completed the operation, and the distance between those two statements is a duplicate charge",
        writes: [{ field: "external_operation_log", mode: "append" }],
        next: "h.status-check",
      },
      {
        id: "h.status-check",
        kind: "handoff",
        to: "external:external-status-reconciliation",
        on: "an operation whose outcome window closed without an authoritative result",
        carries: [
          "the operation and provider request identifiers needed to ask the provider what actually happened",
          "the idempotency key, so that whatever is established can be acted on without re-submitting",
          "the explicit fact that the outcome is unknown rather than failed",
        ],
        suppresses: ["any retry of this operation until its true state is established"],
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "INT-115",
        on: "an authoritative outcome existing for this operation",
        carries: [
          "the outcome and the correlation identifiers it arrived with",
          "what local state expected, so the reconciliation can tell agreement from conflict",
        ],
      },
    ],
    guardrails: [
      "An HTTP 200 may mean the request was accepted, not that the business operation completed.",
      "A timeout is not a failure.",
      "A blind retry may duplicate an external side effect, so nothing is retried while the outcome is unknown.",
      "Correlation and idempotency identifiers are recorded before submission.",
    ],
    reusableRule:
      "External submission and external business completion are separate states; ambiguous outcomes require reconciliation before retry.",
  },

  /* ------------------------------------------------------------ INT-115 */
  {
    id: "INT-115",
    slug: "external-outcome-reconciliation",
    category: "integration",
    goal: "reconciliation-correction",
    name: "External outcome → local state reconciliation → apply or investigate",
    purpose:
      "Apply an external outcome to local state only after establishing that it belongs here, has not already been applied, and still describes what is true.",
    entity: {
      scope: "the external operation the outcome refers to, and the local entity it would change",
      note: "Correlation comes first. An outcome applied to the wrong entity is a worse failure than one that arrives late, and it is much harder to find afterwards.",
    },
    entry: "t.outcome",
    nodes: [
      {
        id: "t.outcome",
        kind: "trigger",
        event: "authoritative_external_outcome",
        evidence: {
          requires: ["an authoritative outcome received from or discovered at a provider"],
          insufficientAlone: [
            "an acknowledgement of receipt",
            "a status that the provider describes as intermediate",
          ],
          source: "authoritative",
        },
        next: "a.correlate",
      },
      {
        id: "a.correlate",
        kind: "action",
        does: "Match the outcome to the operation and entity it belongs to, using the identifiers recorded at submission",
        writes: [{ field: "external_operation_log", mode: "append" }],
        next: "c.correlated",
      },
      {
        id: "c.correlated",
        kind: "condition",
        asks: "Could the outcome be correlated to a known operation?",
        branches: [
          {
            label: "Correlated",
            when: "it matches a recorded operation and entity",
            to: "c.local",
          },
          {
            label: "Uncorrelated",
            when: "no recorded operation matches it",
            to: "h.review",
          },
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a provider event that cannot be matched to a known operation",
        carries: [
          "the event as received, unmodified",
          "the explicit fact that it has not been applied to a best-guess entity",
        ],
      },
      {
        id: "c.local",
        kind: "condition",
        asks: "What does local state say about this outcome?",
        branches: [
          {
            label: "Expected",
            when: "local state is waiting for exactly this outcome on this operation",
            to: "a.apply",
          },
          {
            label: "Already applied",
            when: "local state already reflects this same outcome",
            to: "x.duplicate",
          },
          {
            label: "Conflicts",
            when: "local state holds something incompatible with the outcome",
            to: "h.conflict",
          },
          {
            label: "Belongs to a superseded operation or version",
            when: "the outcome refers to something local state has since moved past",
            to: "c.relevant",
          },
        ],
      },
      {
        id: "x.duplicate",
        kind: "exit",
        state: "already applied; no duplicate side effect",
        terminal: false,
        reEntry:
          "a redelivered webhook resolves here and does nothing, which is the property that makes provider redelivery survivable rather than dangerous",
      },
      {
        id: "h.conflict",
        kind: "handoff",
        to: "INT-119",
        on: "an external outcome incompatible with local state",
        carries: [
          "both values, their timestamps, their versions and their provenance",
          "the fact that neither has been chosen, because the provider being external does not automatically make it authoritative for this field",
        ],
      },
      {
        id: "c.relevant",
        kind: "condition",
        asks: "Does the outcome still describe the current business state?",
        branches: [
          {
            label: "Still current",
            when: "nothing has superseded what the outcome reports",
            to: "a.apply",
          },
          {
            label: "Superseded",
            when: "local state has moved past it - a later operation, a newer version, a subsequent decision",
            to: "a.history",
          },
        ],
      },
      {
        id: "a.history",
        kind: "action",
        does: "Record the outcome as history without mutating current state. A late response can be a valid record of what happened without being a valid instruction about what is true now, and applying it would overwrite a newer decision with an older one",
        writes: [{ field: "external_operation_log", mode: "append" }],
        next: "x.historical",
      },
      {
        id: "x.historical",
        kind: "exit",
        state: "recorded as history; current state unchanged",
        terminal: false,
        reEntry: "the operation's own history is now complete even though it changed nothing",
      },
      {
        id: "a.apply",
        kind: "action",
        does: "Apply the outcome idempotently, so that the same outcome arriving again produces no second effect",
        writes: [{ field: "external_operation_log", mode: "append" }],
        next: "x.applied",
      },
      {
        id: "x.applied",
        kind: "exit",
        state: "outcome applied to local state",
        terminal: false,
        reEntry: "a further outcome on the same operation is correlated and assessed on its own",
      },
    ],
    guardrails: [
      "A late external response can be valid history without being a valid current-state mutation.",
      "A provider event is correlated to the correct entity and operation before anything is applied.",
      "A duplicate webhook is harmless.",
      "An uncorrelated event is never applied to a best-guess entity.",
    ],
    reusableRule:
      "External outcomes should update local state only after correlation, idempotency and current-state validity are established.",
  },

  /* ------------------------------------------------------------ INT-116 */
  {
    id: "INT-116",
    slug: "integration-failure",
    category: "integration",
    goal: "suspension-restoration",
    name: "Integration failure → stop unsafe operations → diagnose → restore",
    purpose:
      "Stop sending into an integration that cannot work, while keeping enough state to recover without repeating anything the provider may already have done.",
    entity: {
      scope: "the failed integration or capability, and the operations that depend on it",
      note: "Failure is scoped. Unrelated integrations, and unrelated capabilities within this one, are untouched.",
    },
    distinctFrom: [
      {
        journey: "INT-113",
        because:
          "Degradation is an integration working badly and still working. This is one that cannot be relied on to work at all, which changes what is safe to send rather than how much.",
      },
    ],
    entry: "t.failure",
    nodes: [
      {
        id: "t.failure",
        kind: "trigger",
        event: "integration_failure_condition",
        evidence: {
          requires: [
            "a defined failure condition: authentication permanently failed, the provider unavailable beyond tolerance, a required capability unavailable, the connection invalid, or persistent operational failure",
          ],
          source: "authoritative",
        },
        next: "a.mark",
      },
      {
        id: "a.mark",
        kind: "action",
        does: "Mark the affected integration or capability FAILED or DISCONNECTED, scoped to what actually failed. Unrelated integrations, and unrelated capabilities within this one, stay as they were",
        writes: [{ field: "integration_log", mode: "append" }],
        next: "a.stop",
      },
      {
        id: "a.stop",
        kind: "action",
        does: "Stop the operations whose safe execution depends on this integration. Continuing to send into a known-failed integration produces a second population of failures that then has to be told apart from the first",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "c.pending",
      },
      {
        id: "c.pending",
        kind: "condition",
        asks: "Are there external operations already submitted and still unresolved?",
        branches: [
          {
            label: "Unresolved operations exist",
            when: "operations were submitted before the failure and never reached an authoritative outcome",
            to: "a.preserve",
          },
          {
            label: "Nothing outstanding",
            when: "every submitted operation reached an outcome",
            to: "a.diagnose",
          },
        ],
      },
      {
        id: "a.preserve",
        kind: "action",
        does: "Preserve those operations as unresolved, with their correlation and idempotency context intact. They are neither retried nor marked failed - we do not know what the provider did with them, and a connection failing is not evidence about an operation it already received",
        writes: [{ field: "external_operation_log", mode: "append" }],
        next: "a.diagnose",
      },
      {
        id: "a.diagnose",
        kind: "action",
        does: "Determine the failure cause, since what recovery looks like depends entirely on it",
        writes: [{ field: "integration_log", mode: "append" }],
        next: "c.recoverable",
      },
      {
        id: "c.recoverable",
        kind: "condition",
        asks: "Is the failure recoverable?",
        branches: [
          {
            label: "Recoverable",
            when: "reconnection, re-authorisation or provider recovery would restore it",
            to: "w.restore",
          },
          {
            label: "Not recoverable",
            when: "the capability is gone, the provider is ending it, or the configuration cannot be made valid",
            to: "h.terminal",
          },
        ],
      },
      {
        id: "w.restore",
        kind: "wait",
        until: ["the connection is restored", "a manual resolution is recorded"],
        onEvent: "h.reconnect",
        timeout: {
          after: "the failure tolerance window",
          reason:
            "an integration that has been failed for longer than the business can tolerate is an operational decision rather than a technical one, and it stops being something to wait out",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.reconnect",
        kind: "handoff",
        to: "INT-118",
        on: "a failed integration becoming operational again",
        carries: [
          "the outage window, which is what the backfill needs to size the gap",
          "the operations preserved as unresolved, which reconnection does not resolve",
        ],
      },
      {
        id: "h.terminal",
        kind: "handoff",
        to: "DEC-181",
        on: "a failure that reconnection cannot fix",
        carries: [
          "the cause and the capabilities now permanently unavailable",
          "the unresolved operations, which still need an answer regardless of the integration's future",
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a failure outliving the business's tolerance for it",
        carries: ["how long the integration has been failed and what depends on it"],
      },
    ],
    guardrails: [
      "Failure does not erase queued or pending operation history.",
      "Nothing is sent into a known unsafe failure state.",
      "Healthy unrelated integrations are unaffected.",
      "Submitted operations with unknown outcomes are preserved rather than retried or marked failed.",
    ],
    reusableRule:
      "Integration failure should stop unsafe dependent operations while preserving enough state to recover without duplicating external effects.",
  },

  /* ------------------------------------------------------------ INT-117 */
  {
    id: "INT-117",
    slug: "failure-blocked-work-queue",
    category: "integration",
    goal: "recovery-retry",
    name: "Integration failure → queue or hold work → recover → controlled resume",
    purpose:
      "Keep work that a failed integration blocked, but only where it can later be revalidated and safely resumed.",
    entity: {
      scope: "the failed integration and the individual work items blocked on it",
      note: "Each item is classified separately. A queue that treats every blocked item the same either holds something that needed an alternative or discards something that could have waited.",
    },
    distinctFrom: [
      {
        journey: "INT-113",
        because:
          "This applies only where the integration has genuinely failed. An integration that is merely slow or backlogged is still working, and queueing more against it adds to the backlog that is already the problem - that case is a separate canonical problem and is deliberately not handled here.",
      },
    ],
    entry: "t.blocked",
    nodes: [
      {
        id: "t.blocked",
        kind: "trigger",
        event: "work_blocked_by_failed_integration",
        evidence: {
          requires: [
            "an integration in a FAILED or DISCONNECTED state, and valid dependent work that cannot proceed without it",
          ],
          insufficientAlone: [
            "an integration that is slow, lagging or backlogged while still working - a different problem, where queueing more work makes the backlog worse rather than protecting anything",
            "an elevated error rate that has not crossed a failure condition",
          ],
          source: "authoritative",
        },
        next: "a.classify",
      },
      {
        id: "a.classify",
        kind: "action",
        does: "Classify each blocked item as SAFE_TO_QUEUE, TIME_SENSITIVE, REQUIRES_REVALIDATION or CANNOT_DELAY. Treating the whole queue as one class either holds something that needed an alternative route, or discards something that could safely have waited",
        writes: [{ field: "blocked_work_log", mode: "append" }],
        next: "c.class",
      },
      {
        id: "c.class",
        kind: "condition",
        asks: "How does each class resolve?",
        branches: [
          {
            label: "Safe to queue",
            when: "the work keeps its meaning after a delay and can be revalidated before it is sent",
            to: "a.hold",
          },
          {
            label: "Cannot delay",
            when: "the work loses its meaning or breaks a commitment if it waits",
            to: "h.alternate",
          },
        ],
      },
      {
        id: "h.alternate",
        kind: "handoff",
        to: "DEC-181",
        on: "blocked work that cannot safely wait for the integration",
        carries: [
          "the work, its deadline and what it was blocked on",
          "the fact that it has not been queued, so nobody assumes it will go out on recovery",
        ],
      },
      {
        id: "a.hold",
        kind: "action",
        does: "Hold the work with its original context, entity version and idempotency key, and its original deadline. The deadline does not restart because we could not send it - the commitment was made to someone who is not waiting on our integration",
        writes: [{ field: "blocked_work_log", mode: "append" }],
        next: "w.restore",
      },
      {
        id: "w.restore",
        kind: "wait",
        until: ["the integration is restored", "the held work expires or becomes obsolete"],
        onEvent: "c.what",
        timeout: {
          after: "the hold horizon",
          reason:
            "a queue with no horizon is an infinite retry loop with a friendlier name, and the work in it grows stale silently",
        },
        onTimeout: "a.stale",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.what",
        kind: "condition",
        asks: "Which happened first?",
        branches: [
          { label: "Integration restored", when: "the connection is operational again", to: "a.revalidate" },
          {
            label: "Work became obsolete",
            when: "the held work no longer describes anything current",
            to: "a.stale",
          },
        ],
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Revalidate each held item against current state before anything is sent. The world moved while the integration was down, and a queued instruction written against the old world is not automatically still correct",
        writes: [{ field: "blocked_work_log", mode: "append" }],
        next: "c.valid",
      },
      {
        id: "c.valid",
        kind: "condition",
        asks: "Is the held work still valid?",
        branches: [
          { label: "Still valid", when: "it still describes something that should happen", to: "a.drain" },
          {
            label: "No longer valid",
            when: "the state it was written against has moved",
            to: "a.stale",
          },
        ],
      },
      {
        id: "a.drain",
        kind: "action",
        does: "Drain in a controlled manner rather than releasing the whole backlog at once. An integration that has just come back, met with everything it missed in one burst, goes down again - and the second outage looks like a new fault rather than our own doing",
        writes: [{ field: "blocked_work_log", mode: "append" }],
        next: "x.resumed",
      },
      {
        id: "x.resumed",
        kind: "exit",
        state: "held work revalidated and drained",
        terminal: false,
        reEntry: "a further failure holds its own work with its own classification",
      },
      {
        id: "a.stale",
        kind: "action",
        does: "Discard or cancel the work as stale, recording the reason. Silently dropping it and silently sending it are both worse than saying which happened and why",
        writes: [{ field: "blocked_work_log", mode: "append" }],
        next: "x.discarded",
      },
      {
        id: "x.discarded",
        kind: "exit",
        state: "held work discarded as stale, with an audited reason",
        terminal: false,
        reEntry:
          "whatever the work was for may be requested again on current state, which is a new item rather than this one revived",
      },
    ],
    guardrails: [
      "A queue is not an infinite retry loop. It has a horizon and the items in it expire.",
      "Queued work preserves its entity, version and idempotency context.",
      "Recovery does not release the entire backlog simultaneously.",
      "This applies to real integration failure only. Slowness and backlog are a different problem and are not handled by queueing against them.",
    ],
    reusableRule:
      "Work blocked by integration failure should be preserved only when it can later be safely revalidated and resumed.",
  },

  /* ------------------------------------------------------------ INT-118 */
  {
    id: "INT-118",
    slug: "reconnect-backfill",
    category: "integration",
    goal: "reconciliation-correction",
    name: "Integration reconnect → backfill → deduplicate → reconcile",
    purpose:
      "Close the gap an outage left in what we know, without recreating everything that would have happened if the events had arrived on time.",
    entity: {
      scope: "the integration connection and the specific synchronization window the outage created",
      note: "The window is the unit of work. Without a measured gap the backfill either misses events or refetches everything, and neither can be verified.",
    },
    entry: "t.reconnected",
    nodes: [
      {
        id: "t.reconnected",
        kind: "trigger",
        event: "integration_operational_again",
        evidence: {
          requires: ["a previously unavailable integration becoming operational"],
          insufficientAlone: [
            "the connection being restored, which is not the same as being synchronized - reconnected and up to date are different states, and marking the integration healthy at reconnection hides the missing window entirely",
          ],
          source: "authoritative",
        },
        next: "a.window",
      },
      {
        id: "a.window",
        kind: "action",
        does: "Determine the outage window - from when to when we were not receiving. Without it the backfill either misses events or refetches everything, and neither outcome can be verified afterwards",
        writes: [{ field: "backfill_log", mode: "append" }],
        next: "a.fetch",
      },
      {
        id: "a.fetch",
        kind: "action",
        does: "Fetch the state and events covering the gap",
        writes: [{ field: "backfill_log", mode: "append" }],
        next: "a.dedupe",
      },
      {
        id: "a.dedupe",
        kind: "action",
        does: "Deduplicate against what was already processed, using the correlation identifiers. A duplicate arriving through backfill has to be exactly as harmless as one arriving through a webhook",
        writes: [{ field: "backfill_log", mode: "append" }],
        next: "c.actionable",
      },
      {
        id: "c.actionable",
        kind: "condition",
        asks: "Does each historical event still represent a currently actionable state?",
        branches: [
          {
            label: "Still actionable",
            when: "the state the event describes is still the state now",
            to: "a.process",
          },
          {
            label: "Superseded",
            when: "current state has moved past what the event describes",
            to: "a.history",
          },
        ],
      },
      {
        id: "a.process",
        kind: "action",
        does: "Process it according to current-state rules rather than the rules that applied when it was emitted",
        writes: [{ field: "backfill_log", mode: "append" }],
        next: "a.reconcile",
      },
      {
        id: "a.history",
        kind: "action",
        does: "Record it as history without acting on it. Backfill repairs what we know; it does not recreate every action that would have fired had the events arrived on time - a week of held onboarding messages delivered at once is exactly the failure this branch prevents, and current state takes priority over a stale historical action",
        writes: [{ field: "backfill_log", mode: "append" }],
        next: "a.reconcile",
      },
      {
        id: "a.reconcile",
        kind: "action",
        does: "Reconcile the final state against the authoritative source, rather than assuming the backfilled events add up to it. Events can be missed in ways the event stream itself cannot reveal",
        writes: [{ field: "backfill_log", mode: "append" }],
        next: "a.verify",
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify that no known synchronization gap remains",
        writes: [{ field: "backfill_log", mode: "append" }],
        next: "c.gap",
      },
      {
        id: "c.gap",
        kind: "condition",
        asks: "What does verification show?",
        branches: [
          {
            label: "No gap",
            when: "the window is closed and local state matches the authoritative source",
            to: "x.synchronized",
          },
          {
            label: "Values disagree",
            when: "the gap is closed and the two systems hold different values",
            to: "h.conflict",
          },
          {
            label: "Gap cannot be closed",
            when: "part of the window is unrecoverable from the provider",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "x.synchronized",
        kind: "exit",
        state: "backfilled, deduplicated and reconciled; no known gap",
        terminal: false,
        reEntry: "a further outage opens its own window",
      },
      {
        id: "h.conflict",
        kind: "handoff",
        to: "INT-119",
        on: "backfill completing with the two systems disagreeing",
        carries: [
          "both values with their timestamps, versions and provenance",
          "the outage window, which is context for which side is more likely to be stale",
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a synchronization gap that cannot be closed from the provider",
        carries: [
          "the window that remains unrecoverable and what it may contain",
          "the explicit fact that the integration is operational but not synchronized",
        ],
      },
    ],
    guardrails: [
      "Backfill is not a replay of every historical journey trigger.",
      "A historical event does not trigger obsolete customer communication.",
      "Duplicate events are idempotent.",
      "Current state takes priority over a stale historical action.",
    ],
    reusableRule:
      "Backfill repairs missing history and state; it must not recreate every action that would have occurred if events had arrived in real time.",
  },

  /* ------------------------------------------------------------ INT-119 */
  {
    id: "INT-119",
    slug: "synchronization-conflict",
    category: "integration",
    goal: "reconciliation-correction",
    name: "Synchronization conflict → determine authority → reconcile or hold",
    purpose:
      "Settle a cross-system disagreement using an explicit authority rule, and hold rather than guess where none exists.",
    entity: {
      scope: "the synchronized entity and the specific fields in disagreement",
      note: "Authority can be per field. The billing system may own the plan while the identity system owns the email, and neither is authoritative for the other.",
    },
    distinctFrom: [
      {
        journey: "CON-40",
        because:
          "CON-40 is a permission conflict and fails closed by suppressing communication. This is a general data conflict, where the safe state is holding the mutation rather than stopping outbound messaging.",
      },
    ],
    entry: "t.inconsistency",
    nodes: [
      {
        id: "t.inconsistency",
        kind: "trigger",
        event: "cross_system_inconsistency_detected",
        evidence: {
          requires: [
            "two or more systems holding materially different values for the same business field or state",
          ],
          insufficientAlone: [
            "a system that has not yet received a change still propagating within its expected window",
          ],
          source: "authoritative",
        },
        next: "a.collect",
      },
      {
        id: "a.collect",
        kind: "action",
        does: "Collect each system's value, its timestamp, its version, the provenance of the change and the authority rules that apply. A timestamp alone is not authority - clocks disagree, and write order is not the order decisions were made",
        writes: [{ field: "sync_conflict_log", mode: "append" }],
        next: "c.authority",
      },
      {
        id: "c.authority",
        kind: "condition",
        asks: "What determines authority here?",
        branches: [
          {
            label: "A single authoritative system",
            when: "one system is defined as the source of truth for this entity",
            to: "a.reconcile-to-source",
          },
          {
            label: "Authority is per field",
            when: "different fields on this entity have different sources of truth",
            to: "a.per-field",
          },
          {
            label: "Cannot be determined safely",
            when: "no rule states which value is right, and the evidence does not settle it",
            to: "a.conflict-state",
          },
        ],
      },
      {
        id: "a.reconcile-to-source",
        kind: "action",
        does: "Reconcile toward the authoritative system's value, recording that the rule rather than the recency decided it",
        writes: [{ field: "sync_conflict_log", mode: "append" }],
        next: "a.propagate",
      },
      {
        id: "a.per-field",
        kind: "action",
        does: "Apply the domain-specific authority rule for each field separately. Different fields have different sources of truth - the billing system owns the plan, the identity system owns the email, and applying one rule across both is right for one of them by accident",
        writes: [{ field: "sync_conflict_log", mode: "append" }],
        next: "a.propagate",
      },
      {
        id: "a.conflict-state",
        kind: "action",
        does: "Record SYNC_CONFLICT and hold the affected mutations. Choosing a value to make the sync succeed is choosing whichever system wrote last, which is the rule this journey exists instead of",
        writes: [{ field: "sync_conflict_log", mode: "append" }],
        next: "w.resolution",
      },
      {
        id: "w.resolution",
        kind: "wait",
        until: ["an authoritative resolution is recorded", "a manual resolution is recorded"],
        onEvent: "a.propagate",
        timeout: {
          after: "the conflict resolution SLA",
          reason:
            "held mutations mean a business process is stopped somewhere, so an unresolved conflict is escalated rather than left to sit",
        },
        onTimeout: "h.review",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a conflict no authority rule could settle within its SLA",
        carries: [
          "every value with its source, version and provenance",
          "which mutations are being held, and what that is blocking",
        ],
      },
      {
        id: "a.propagate",
        kind: "action",
        does: "Propagate the resolved state idempotently, carrying origin and version so the correction is not read as a new change by the system receiving it. Without that, two systems correct each other indefinitely and the conflict becomes traffic",
        writes: [{ field: "sync_conflict_log", mode: "append" }],
        next: "x.reconciled",
      },
      {
        id: "x.reconciled",
        kind: "exit",
        state: "conflict resolved by rule and propagated idempotently",
        terminal: false,
        reEntry:
          "a fresh divergence on the same entity is assessed on its own, with this resolution in the record",
      },
    ],
    guardrails: [
      "The newest timestamp is not automatically correct.",
      "Propagation carries origin and version so reconciliation cannot become ping-pong between two systems.",
      "Different fields may have different sources of truth.",
      "Where authority cannot be determined, the mutation is held rather than guessed.",
    ],
    reusableRule:
      "Synchronization conflicts should be resolved through explicit authority rules rather than generic last-write-wins behavior.",
  },

  /* ------------------------------------------------------------ INT-120 */
  {
    id: "INT-120",
    slug: "external-dependency-degradation",
    category: "integration",
    goal: "suspension-restoration",
    name: "External dependency unavailable → degrade capability → alternate or recover",
    purpose:
      "Lose only the capability that actually depends on an unavailable provider, and keep every uncertain outcome uncertain.",
    entity: {
      scope: "the external dependency and each capability that depends on it",
      note: "Scope is the whole decision. Failing the product because one provider is down is a self-inflicted outage larger than the one being responded to.",
    },
    distinctFrom: [
      {
        journey: "INT-116",
        because:
          "INT-116 is about our integration to a provider failing. This is about the provider itself being unavailable, where an alternate path may exist and the question is what our product can still do.",
      },
    ],
    entry: "t.unavailable",
    nodes: [
      {
        id: "t.unavailable",
        kind: "trigger",
        event: "critical_external_dependency_unavailable",
        evidence: {
          requires: ["a critical external dependency confirmed unavailable"],
          insufficientAlone: [
            "a single failed call, which is an error rather than an outage",
          ],
          source: "authoritative",
        },
        next: "a.scope",
      },
      {
        id: "a.scope",
        kind: "action",
        does: "Determine which capabilities actually depend on this provider. Failing the whole product because one dependency is down is a self-inflicted outage larger than the one we are responding to",
        writes: [{ field: "dependency_log", mode: "append" }],
        next: "c.mode",
      },
      {
        id: "c.mode",
        kind: "condition",
        asks: "What can continue?",
        branches: [
          {
            label: "Degraded mode possible",
            when: "the capability has a reduced form that does not need this dependency",
            to: "a.degrade",
          },
          {
            label: "A safe alternate exists",
            when: "another provider or path can perform the operation under a defined policy",
            to: "c.submitted",
          },
          {
            label: "Cannot continue safely",
            when: "neither degradation nor an alternate is available",
            to: "a.block",
          },
        ],
      },
      {
        id: "a.degrade",
        kind: "action",
        does: "Disable only the unavailable function and leave everything else working, so the outage the user sees is the size of the outage that happened",
        writes: [{ field: "dependency_log", mode: "append" }],
        next: "w.recovery",
      },
      {
        id: "c.submitted",
        kind: "condition",
        asks: "Has the operation already been submitted to the primary provider?",
        branches: [
          {
            label: "Not submitted",
            when: "nothing has reached the primary provider for this operation",
            to: "a.alternate",
          },
          {
            label: "Already submitted, outcome unknown",
            when: "the operation reached the primary provider and no authoritative outcome exists",
            to: "x.no-alternate",
          },
        ],
      },
      {
        id: "x.no-alternate",
        kind: "exit",
        state: "alternate not used; the primary operation's outcome is still unknown",
        terminal: false,
        reEntry:
          "the operation's true state is established through reconciliation first. Submitting it again elsewhere while the first outcome is unknown is how one payment becomes two",
      },
      {
        id: "a.alternate",
        kind: "action",
        does: "Use the alternate path according to the defined policy, with its own correlation and idempotency identifiers",
        writes: [{ field: "dependency_log", mode: "append" }],
        next: "w.recovery",
      },
      {
        id: "a.block",
        kind: "action",
        does: "Block the affected operation and preserve the user's and the business's state, so nothing is lost and nothing is claimed. Where an outcome is unknown it stays unknown - a provider outage is not evidence that the user's action failed, and recording it as failed converts our blindness into their result",
        writes: [{ field: "dependency_log", mode: "append" }],
        next: "w.recovery",
      },
      {
        id: "w.recovery",
        kind: "wait",
        until: ["the dependency is restored", "the alternate path completes"],
        onEvent: "a.revalidate",
        timeout: {
          after: "the operational escalation point",
          reason:
            "a degraded capability that has not recovered within its window is an operational decision about whether to keep waiting, and that decision belongs to a person",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.revalidate",
        kind: "action",
        does: "Revalidate the affected pending actions before resuming any of them. Several may have completed at the provider while we could not see them, and resuming without checking is how a retry becomes a duplicate",
        writes: [{ field: "dependency_log", mode: "append" }],
        next: "x.restored",
      },
      {
        id: "x.restored",
        kind: "exit",
        state: "capability restored after pending actions were revalidated",
        terminal: false,
        reEntry: "a further outage is scoped on its own terms",
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a dependency outage outliving its operational window",
        carries: [
          "which capabilities are degraded or blocked and for how long",
          "the operations held with unknown outcomes, which nobody has resolved either way",
        ],
      },
    ],
    guardrails: [
      "A provider outage does not mark a user action as failed while its outcome is unknown.",
      "An alternate provider never repeats an operation already submitted to the primary one.",
      "Success is not claimed until an authoritative outcome exists.",
      "Only the capability that depends on the dependency is degraded.",
    ],
    reusableRule:
      "External dependency failure should degrade only the capability that actually depends on it while preserving safe recovery and outcome reconciliation.",
  },
];
