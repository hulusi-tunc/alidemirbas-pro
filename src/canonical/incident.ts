import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 26 - INCIDENTS, SERVICE DISRUPTION, OPERATIONS & RECOVERY

   Every other category in this library models one entity's lifecycle. This one
   models a failure that several entities share, which changes what the hard
   problems are.

   The first is at the front. Several failures at once are often several
   failures at once. Declaring an incident merges them, and everything merged
   loses its own owner - forty customers each with a problem become one status
   page and nobody's case. So correlation has to be evidence that they share a
   cause, and the link back to each affected entity has to survive it.

   The second is in the middle, and it is a chain of three substitutions that
   each shorten the incident by pretending a weaker state is a stronger one:

     mitigated      impact is smaller; the cause is untouched
     recovered      the corrective action ran
     restored       the affected population actually works again
     stable         it still worked an hour later
     resolved       the systemic failure is closed

   Reporting any of those as the next one closes an incident that is still
   happening, in front of the people it is still happening to.

   The third is at the end. An incident closing is a statement about the shared
   cause. The customer whose order failed still has a failed order, the refund
   still has to happen, and the prevention work still has to be done and
   verified - a published document is not a control. */

export const INCIDENT_RULES: readonly OrchestrationRule[] = [
  {
    id: "INC-R1",
    scope: "incident",
    rule: "Anomaly, incident candidate and confirmed incident are three separate states.",
    because:
      "Declaring an incident changes how everything downstream behaves. Doing it on a count of alerts rather than on evidence of a shared cause makes the declaration meaningless.",
  },
  {
    id: "INC-R2",
    scope: "incident",
    rule: "Incident correlation preserves the link to each individual affected entity.",
    because:
      "A correlation that absorbs its members leaves every affected customer without a case of their own, and when the incident closes they have nothing left to point at.",
  },
  {
    id: "INC-R3",
    scope: "incident",
    rule: "Severity and blast radius reflect actual operational impact.",
    because:
      "A retry storm produces a hundred thousand events and affects nobody. A single failing payment path produces twelve and affects everything.",
  },
  {
    id: "INC-R4",
    scope: "incident",
    rule: "Incident ownership and individual case ownership coexist.",
    because:
      "One runs the systemic response and the other owes a specific customer an answer. Collapsing them means whichever survives stops doing the other job.",
  },
  {
    id: "INC-R5",
    scope: "incident",
    rule: "Mitigation and resolution are separate states.",
    because:
      "Mitigation reduces impact and leaves the cause in place. Reporting it as resolution stops the investigation that would have found the cause.",
  },
  {
    id: "INC-R6",
    scope: "incident",
    rule: "A workaround remains explicitly temporary unless deliberately formalized.",
    because:
      "A control left in place because removing it is frightening becomes permanent by nobody's decision, and is found years later by somebody asking why a feature is disabled.",
  },
  {
    id: "INC-R7",
    scope: "incident",
    rule: "Incident communication targets the affected cohort.",
    because:
      "Telling everybody about an incident affecting one region trains the whole base to ignore incident notices, and the next one will matter.",
  },
  {
    id: "INC-R8",
    scope: "incident",
    rule: "Incident communication uses verified information and avoids promotional content.",
    because:
      "A root cause announced and retracted costs more credibility than a slow update, and marketing language inside an outage notice reads as contempt.",
  },
  {
    id: "INC-R9",
    scope: "incident",
    rule: "Root cause investigation and service restoration proceed independently.",
    because:
      "Service is often restored before the cause is understood, and holding restoration until the investigation finishes extends the outage for the sake of tidiness.",
  },
  {
    id: "INC-R10",
    scope: "incident",
    rule: "Root cause is evidence-based rather than the first correlated condition.",
    because:
      "The change that shipped just before an incident is the most available explanation and is frequently not the cause - often it is what made a latent problem visible.",
  },
  {
    id: "INC-R11",
    scope: "incident",
    rule: "Recovery action and verified service restoration are separate states.",
    because:
      "A recovery command succeeding says the command ran. One successful synthetic check says one path works for one caller.",
  },
  {
    id: "INC-R12",
    scope: "incident",
    rule: "Restored service enters observation before stable resolution where appropriate.",
    because:
      "Recoveries that hold for ten minutes and fail again are common, and closing on the first good signal means reopening in front of the same customers.",
  },
  {
    id: "INC-R13",
    scope: "incident",
    rule: "Incident resolution does not automatically resolve every linked case.",
    because:
      "The systemic cause is fixed and the customer whose order failed still has a failed order. Closing their case tells them a problem is solved when it is not.",
  },
  {
    id: "INC-R14",
    scope: "incident",
    rule: "Financial and remedy obligations survive incident closure where unresolved.",
    because:
      "A refund owed because of an outage is owed after the outage ends, and it runs on its own lifecycle rather than on the incident's.",
  },
  {
    id: "INC-R15",
    scope: "incident",
    rule: "Temporary incident controls are removed or formally transitioned.",
    because:
      "The set of quietly permanent emergency controls is the least-understood part of most systems, and each one was meant to last an afternoon.",
  },
  {
    id: "INC-R16",
    scope: "incident",
    rule: "Post-incident review produces owned corrective work where needed.",
    because:
      "An action item with no owner is a sentence in a document, and a document is not a control.",
  },
  {
    id: "INC-R17",
    scope: "incident",
    rule: "Corrective work completion may require verification.",
    because:
      "An action item created is not a risk reduced, and the question is whether the condition that produced the incident can still produce it.",
  },
  {
    id: "INC-R18",
    scope: "incident",
    rule: "Recurring incidents trigger pattern-level prevention analysis rather than a count-based conclusion.",
    because:
      "A repeated alert name is a repeated alert name. Two incidents that both showed up as elevated latency can have nothing else in common.",
  },
  {
    id: "INC-R19",
    scope: "incident",
    rule: "Incident state history, mitigations, decisions and timeline stay auditable.",
    because:
      "The review works from them, and every later recurrence is compared against them. An incident that only records its outcome teaches nothing.",
  },
  {
    id: "INC-R20",
    scope: "incident",
    rule: "Existing communication, async, rollout, external dependency, remedy and ownership primitives are reused rather than duplicated.",
    because:
      "Incident tooling built in a hurry diverges from everything else, and the divergence is discovered during the next incident.",
  },
];

export const INCIDENT_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ INC-251 */
  {
    id: "INC-251",
    slug: "incident-correlation",
    category: "incident",
    goal: "root-cause-diagnostic-correlation",
    channels: [],
    name: "Correlated failure detection → incident candidate → confirm or reject",
    purpose:
      "Establish whether several failures actually share a cause, before treating them as one thing.",
    entity: {
      scope: "the incident candidate and every individual failure correlated into it",
      note: "Each affected entity keeps its own case and its own link. The incident is a layer above them rather than a replacement for them.",
    },
    distinctFrom: [
      {
        journey: "RSK-192",
        because:
          "RSK-192 assesses risk evidence about one actor or transaction. This asks whether failures across many unrelated entities plausibly share an operational cause - a question about the system rather than about anybody using it.",
      },
    ],
    entry: "t.correlated",
    nodes: [
      {
        id: "t.correlated",
        kind: "trigger",
        event: "correlated_failures_exceed_incident_threshold",
        evidence: {
          requires: [
            "multiple failures or anomalies across entities, exceeding a meaningful correlation threshold",
          ],
          insufficientAlone: [
            "a spike in alert volume, which is a count rather than a correlation",
            "several failures happening at once, which is often several failures happening at once",
          ],
          source: "inferred",
        },
        next: "a.correlate",
      },
      {
        id: "a.correlate",
        kind: "action",
        does: "Correlate by time, service or dependency, region, version, provider, resource cohort, failure signature and shared infrastructure. What is being tested is whether these failures plausibly share a cause, rather than whether there are a lot of them",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "a.preserve-links",
      },
      {
        id: "a.preserve-links",
        kind: "action",
        does: "Preserve the link from the candidate to each individual affected entity, and keep each entity's own case open. A correlation that absorbs its members leaves every affected customer without a case of their own, and when the incident closes they have nothing left to point at",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.evidence",
      },
      {
        id: "c.evidence",
        kind: "condition",
        asks: "What does the correlating evidence support?",
        branches: [
          {
            label: "A shared cause",
            when: "the failures share a dependency, cohort, signature or infrastructure in a way that explains them together",
            to: "a.confirm",
          },
          {
            label: "Independent failures",
            when: "the correlation is coincidental and each failure has its own explanation",
            to: "a.reject",
          },
          {
            label: "Insufficient evidence",
            when: "a shared cause is plausible and unestablished",
            to: "a.candidate",
          },
        ],
      },
      {
        id: "a.reject",
        kind: "action",
        does: "Retain the individual cases as independent, and record why they were not merged. Several failures at once is often several failures at once - merging them for operational convenience gives each customer a generic status page instead of an answer to their specific problem",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "x.independent",
      },
      {
        id: "x.independent",
        kind: "exit",
        state: "no incident; the individual cases continue independently",
        terminal: false,
        reEntry:
          "further correlated evidence reopens the question. Not merging now does not prevent an incident being confirmed later on better evidence",
      },
      {
        id: "a.candidate",
        kind: "action",
        does: "Record INCIDENT_CANDIDATE and investigate. Candidate is a real state - it starts a look without asserting a shared cause to anybody, and it is what stops a hunch from becoming a status-page announcement",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "w.investigate",
      },
      {
        id: "w.investigate",
        kind: "wait",
        until: [
          "evidence establishes a shared cause",
          "evidence rules a shared cause out",
        ],
        onEvent: "c.evidence",
        timeout: {
          after: "the candidate investigation window",
          reason:
            "a candidate held open indefinitely is neither an incident anybody is responding to nor a set of cases anybody is working, and both populations wait",
        },
        onTimeout: "a.reject",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.confirm",
        kind: "action",
        does: "Record INCIDENT_CONFIRMED with the correlating evidence that supports it. What is asserted is a shared cause - not that it is known, but that these failures belong together",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "h.severity",
      },
      {
        id: "h.severity",
        kind: "handoff",
        to: "INC-252",
        on: "an incident confirmed on correlating evidence",
        carries: [
          "the correlating evidence and every individual affected entity, still linked and still holding its own case",
          "the explicit fact that a shared cause is asserted and not yet known",
        ],
      },
    ],
    guardrails: [
      "Multiple failures are not automatically one incident.",
      "Unrelated customer cases are never merged for operational convenience.",
      "Correlation preserves the linkage to each individual affected entity.",
    ],
    reusableRule:
      "An incident should be created only when evidence shows multiple failures plausibly share a common operational cause.",
  },

  /* ------------------------------------------------------------ INC-252 */
  {
    id: "INC-252",
    slug: "incident-scope",
    category: "incident",
    goal: "escalation-exception",
    channels: ["task"],
    name: "Incident confirmed → determine severity and blast radius → assign command",
    purpose:
      "Establish what is actually affected, how badly, and who is running the response.",
    entity: {
      scope: "the confirmed incident, its blast radius and its operational ownership",
      note: "The incident owner runs the systemic response. The owners of the individual cases keep owing their customers an answer, and neither absorbs the other.",
    },
    entry: "t.confirmed",
    nodes: [
      {
        id: "t.confirmed",
        kind: "trigger",
        event: "incident_confirmed",
        evidence: {
          requires: ["a confirmed incident with its correlating evidence and affected entities"],
          source: "authoritative",
        },
        next: "a.scope",
      },
      {
        id: "a.scope",
        kind: "action",
        does: "Determine the affected systems, capabilities, regions, customers and accounts, dependencies, the start time, the current impact and the business criticality",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "a.severity",
      },
      {
        id: "a.severity",
        kind: "action",
        does: "Set the severity from the actual operational impact. A high event count is not a severity - a retry storm generates a hundred thousand events and affects nobody, and a single failing payment path generates twelve and affects everything downstream of it",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "a.command",
      },
      {
        id: "a.command",
        kind: "action",
        does: "Assign incident ownership and command according to the operating model, and record it separately from the owners of the individual cases. The incident owner runs the systemic response; the case owners still owe their customers an answer, and one absorbing the other means whichever survives stops doing the other job",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "a.state",
        execution: "human",
      },
      {
        id: "a.state",
        kind: "action",
        does: "Record ACTIVE_INCIDENT with the scope, the severity and the command as established",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.expansion",
      },
      {
        id: "c.expansion",
        kind: "condition",
        asks: "Has the affected scope grown since the incident was confirmed?",
        branches: [
          {
            label: "It has",
            when: "a new cohort, region, dependency or capability is found affected",
            to: "a.expand",
          },
          {
            label: "It has not",
            when: "the blast radius as established still holds",
            to: "c.route",
          },
        ],
      },
      {
        id: "a.expand",
        kind: "action",
        does: "Expand the blast radius and re-derive the severity from it. A blast radius fixed at confirmation time understates every incident that spreads, which is most of them - and the response level set against the original scope is then wrong for the whole rest of the incident",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.route",
      },
      {
        id: "c.route",
        kind: "condition",
        asks: "What does the response need first?",
        branches: [
          {
            label: "Immediate containment",
            when: "the impact is ongoing and reducing it does not have to wait for a cause",
            to: "h.mitigate",
          },
          {
            label: "Investigation first",
            when: "the impact is bounded or already stopped, and acting without understanding risks making it worse",
            to: "h.investigate",
          },
          {
            label: "The impact resolved before the response began",
            when: "the condition passed on its own before anything was done",
            to: "a.resolved-early",
          },
        ],
      },
      {
        id: "h.mitigate",
        kind: "handoff",
        to: "INC-253",
        on: "an active incident needing immediate impact reduction",
        carries: [
          "the blast radius, the severity and the capabilities currently affected",
          "the incident ownership, and the separate case ownerships that continue alongside it",
        ],
      },
      {
        id: "h.investigate",
        kind: "handoff",
        to: "INC-255",
        on: "an active incident where understanding comes before acting",
        carries: [
          "the correlating evidence, the timeline and the affected cohort",
          "the explicit fact that no mitigation has been applied, so the system is in its failed state rather than a modified one",
        ],
      },
      {
        id: "a.resolved-early",
        kind: "action",
        does: "Record that the impact ended before the response engaged, preserving the incident and its evidence. A self-resolving incident is still an incident that happened, and it is usually the first occurrence of something that will recur",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "x.resolved-early",
      },
      {
        id: "x.resolved-early",
        kind: "exit",
        state: "impact ended before response; the incident and its evidence are preserved",
        terminal: false,
        reEntry:
          "recurrence is assessed against this record. An incident that resolved itself once and returns is a pattern rather than two coincidences",
      },
    ],
    guardrails: [
      "Severity reflects actual impact rather than event volume.",
      "A high event count is not a severity.",
      "The incident owner and the individual case owners remain separate.",
      "Blast radius is re-derived as scope grows rather than fixed at confirmation.",
    ],
    reusableRule:
      "Incident response begins by establishing the affected scope, severity and accountable operational ownership.",
  },

  /* ------------------------------------------------------------ INC-253 */
  {
    id: "INC-253",
    slug: "incident-mitigation",
    category: "incident",
    goal: "recovery-retry",
    channels: [],
    name: "Incident → contain and mitigate → preserve critical operations",
    purpose:
      "Reduce the damage now, without pretending the cause has been dealt with.",
    entity: {
      scope: "the incident and the mitigations applied against its impact",
      note: "Each mitigation is recorded as temporary with the condition that would remove it. Nothing here touches the cause.",
    },
    distinctFrom: [
      {
        journey: "INC-256",
        because:
          "Mitigation reduces impact while the cause remains. INC-256 acts on the cause and asks whether the service actually came back. A system can be fully mitigated and entirely unfixed, and reporting the first as the second stops the second happening.",
      },
    ],
    entry: "t.needs",
    nodes: [
      {
        id: "t.needs",
        kind: "trigger",
        event: "active_incident_requires_impact_reduction",
        evidence: {
          requires: ["an active incident with ongoing impact that could be reduced"],
          source: "authoritative",
        },
        next: "a.identify",
      },
      {
        id: "a.identify",
        kind: "action",
        does: "Identify the mitigations actually available - disabling a failing feature, shifting traffic, increasing capacity, moving to an alternate provider, rate limiting, a manual fallback, a degraded mode, pausing unsafe operations. Each rejected option is struck from the list, so the search through them terminates",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.safe",
      },
      {
        id: "c.safe",
        kind: "condition",
        asks: "Is the candidate mitigation safe to apply?",
        branches: [
          {
            label: "Safe",
            when: "its secondary effects are understood and acceptable",
            to: "a.apply",
          },
          {
            label: "Unacceptable secondary risk",
            when: "applying it could produce a larger failure than the one it addresses",
            to: "a.reject-mitigation",
          },
          {
            label: "No safe option remains",
            when: "every candidate has been considered and rejected",
            to: "a.no-mitigation",
          },
        ],
      },
      {
        id: "a.reject-mitigation",
        kind: "action",
        does: "Reject this option, strike it from the list and consider the next. A workaround that creates a larger failure than the one it addresses is the most expensive kind of response, and it is usually applied under pressure with nobody checking what else it touches",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "a.identify",
      },
      {
        id: "a.no-mitigation",
        kind: "action",
        does: "Record that no safe mitigation is available, and say so rather than applying an unsafe one. An incident with no safe containment goes straight to recovery with its full impact visible, which is honest and is what the response should be working from",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "h.recovery",
      },
      {
        id: "a.apply",
        kind: "action",
        does: "Apply the mitigation, scoped to what it actually needs to touch, and record it as temporary with the condition that would remove it. A workaround with no stated end becomes permanent by nobody's decision, and is found years later by somebody wondering why a feature is disabled",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "a.mitigated",
      },
      {
        id: "a.mitigated",
        kind: "action",
        does: "Record MITIGATED and explicitly not RESOLVED. The impact is smaller and the cause is untouched - reporting mitigation as resolution stops the investigation that would have found the cause, and the incident returns",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.communicate",
      },
      {
        id: "c.communicate",
        kind: "condition",
        asks: "Does the mitigation materially change what affected users should do?",
        branches: [
          {
            label: "It does",
            when: "a workaround is now available, or a capability is now degraded rather than absent",
            to: "h.communicate",
          },
          {
            label: "It does not",
            when: "the user-visible position is unchanged",
            to: "c.sufficient",
          },
        ],
      },
      {
        id: "h.communicate",
        kind: "handoff",
        to: "INC-254",
        on: "a mitigation that changes user guidance",
        carries: [
          "what is now available, what is still affected, and any safe workaround",
          "the explicit fact that the state is mitigated rather than resolved, so the message does not claim a fix",
        ],
      },
      {
        id: "c.sufficient",
        kind: "condition",
        asks: "Does the mitigation reduce impact enough to stand down the emergency?",
        branches: [
          {
            label: "It does",
            when: "the remaining impact is tolerable while the cause is investigated on a normal footing",
            to: "x.mitigated",
          },
          {
            label: "It does not",
            when: "impact remains severe and the cause has to be acted on now",
            to: "h.recovery",
          },
        ],
      },
      {
        id: "x.mitigated",
        kind: "exit",
        state: "MITIGATED; impact contained, cause untouched, incident still open",
        terminal: false,
        reEntry:
          "the mitigation failing, or the impact growing past it, brings the incident back here. The mitigation stays recorded as temporary and its removal condition stays stated",
      },
      {
        id: "h.recovery",
        kind: "handoff",
        to: "INC-256",
        on: "an incident whose impact cannot be adequately contained",
        carries: [
          "the mitigations attempted, what each achieved and what remains affected",
          "the explicit fact that containment is insufficient, so the corrective action is now the only path to reducing impact",
        ],
      },
    ],
    guardrails: [
      "Mitigated is not resolved.",
      "A workaround never creates a larger failure than the one it addresses.",
      "A temporary workaround remains explicitly temporary, with the condition that would remove it.",
    ],
    reusableRule:
      "Incident mitigation reduces current impact while preserving the distinction between temporary containment and permanent resolution.",
  },

  /* ------------------------------------------------------------ INC-254 */
  {
    id: "INC-254",
    slug: "incident-communication",
    category: "incident",
    goal: "delivery-confirmation",
    channels: ["email", "in-app"],
    name: "Incident communication → identify affected cohort → inform, update or close",
    purpose:
      "Tell the people actually affected something true and useful, through the mechanism that already owns delivery.",
    entity: {
      scope: "the incident, the affected recipient cohort and the communication obligation it creates",
      note: "This decides what should be said and to whom. Channels, permissions, delivery and retries belong to the communication lifecycle.",
    },
    entry: "t.relevant",
    nodes: [
      {
        id: "t.relevant",
        kind: "trigger",
        event: "incident_reaches_communication_relevant_state",
        evidence: {
          requires: ["an incident state change that could change what an affected party should do or expect"],
          insufficientAlone: [
            "time having passed since the last update, which is not itself information",
          ],
          source: "authoritative",
        },
        next: "a.determine",
      },
      {
        id: "a.determine",
        kind: "action",
        does: "Determine who is materially affected, what is known, what is not known, what action the user needs to take, any safe workaround, and the condition under which the next meaningful update would happen. Saying what is not yet known is information; leaving it out and stating the rest as certainty is not",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.cohort",
        execution: "communication",
      },
      {
        id: "c.cohort",
        kind: "condition",
        asks: "Can the affected cohort be identified with reasonable precision?",
        branches: [
          {
            label: "It can",
            when: "the affected population is identifiable by account, region, capability or cohort",
            to: "a.scoped",
          },
          {
            label: "It cannot yet",
            when: "the boundary of the impact is genuinely unclear",
            to: "a.broad",
          },
        ],
      },
      {
        id: "a.scoped",
        kind: "action",
        does: "Scope the communication to the affected population. Telling everybody about an incident affecting one region trains the whole base to ignore incident notices, and the next one will be one that matters to them",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.verified",
        execution: "communication",
      },
      {
        id: "a.broad",
        kind: "action",
        does: "Broaden only as far as necessary, and say explicitly that the scope is still being established. Uncertainty stated is information; uncertainty implied as precision is a claim that will have to be corrected",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.verified",
        execution: "communication",
      },
      {
        id: "c.verified",
        kind: "condition",
        asks: "Is what would be said actually confirmed?",
        branches: [
          {
            label: "Confirmed",
            when: "every claim in it is established rather than believed",
            to: "c.material",
          },
          {
            label: "Not confirmed",
            when: "the cause, the fix or the timing is still a hypothesis",
            to: "a.hold-claim",
          },
        ],
      },
      {
        id: "a.hold-claim",
        kind: "action",
        does: "Say what is known and what is not, and claim nothing about cause or resolution that has not been established. A root cause announced and then retracted costs more credibility than a slow update, and technical detail stated as fact while still uncertain is the most common source of that retraction",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.material",
        execution: "communication",
      },
      {
        id: "c.material",
        kind: "condition",
        asks: "Does this materially change the guidance the recipient already has?",
        branches: [
          {
            label: "It does",
            when: "what they should do, expect or avoid has changed",
            to: "a.communicate",
          },
          {
            label: "It does not, and no commitment requires an update",
            when: "nothing has changed for them since the last message",
            to: "a.no-send",
          },
          {
            label: "It does not, but a commitment requires an update",
            when: "a status-page cadence, a contract or a regulatory obligation requires one regardless",
            to: "a.communicate",
          },
        ],
      },
      {
        id: "a.no-send",
        kind: "action",
        does: "Send nothing, and record why. Sending because time has passed produces noise, and noise is what makes the eventual resolution notice go unread by the people who were waiting for it",
        writes: [
          { field: "incident_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "x.no-send",
      },
      {
        id: "x.no-send",
        kind: "exit",
        state: "no update sent; nothing material had changed",
        terminal: false,
        reEntry:
          "the next material change, or the next point a commitment requires an update, brings this back",
      },
      {
        id: "a.communicate",
        kind: "action",
        does: "Raise the communication through the canonical communication mechanism, which owns the obligation, the recipient resolution, the channels, the permissions and the delivery evidence. Incident communication does not build its own delivery path, and the message carries no promotional content",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.final",
        execution: "communication",
      },
      {
        id: "c.final",
        kind: "condition",
        asks: "Is this the resolution notice for this recipient scope?",
        branches: [
          {
            label: "It is",
            when: "the incident is resolved for the population this message goes to",
            to: "x.closed-comms",
          },
          {
            label: "It is not",
            when: "the incident continues for them",
            to: "x.updated",
          },
        ],
      },
      {
        id: "x.updated",
        kind: "exit",
        state: "update issued; the next update is bound to a stated condition rather than to a clock",
        terminal: false,
        reEntry:
          "the stated condition occurring, or a material change, produces the next update",
      },
      {
        id: "x.closed-comms",
        kind: "exit",
        state: "resolution communicated to this recipient scope",
        terminal: false,
        reEntry:
          "a relapse is communicated as a relapse rather than as a new incident, because the recipients were told it was over",
      },
    ],
    guardrails: [
      "No root cause or resolution is claimed before it is confirmed.",
      "No promotional content appears in incident communication.",
      "Uncertain technical detail is never communicated as fact.",
      "The affected cohort is identified as precisely as the evidence allows.",
    ],
    reusableRule:
      "Incident communication should provide verified, actionable information to the population actually affected by the incident.",
  },

  /* ------------------------------------------------------------ INC-255 */
  {
    id: "INC-255",
    slug: "root-cause-investigation",
    category: "incident",
    goal: "root-cause-diagnostic-correlation",
    channels: [],
    name: "Root cause investigation → hypothesis → confirm or reject → corrective action",
    purpose:
      "Find the thing that actually explains the incident, rather than the thing that was nearest to it.",
    entity: {
      scope: "the incident and the investigation into what caused it",
      note: "Hypotheses are a finite list, tested one at a time. Rejections are recorded so the next investigator does not retest them.",
    },
    entry: "t.requires",
    nodes: [
      {
        id: "t.requires",
        kind: "trigger",
        event: "incident_requires_causal_investigation",
        evidence: {
          requires: ["a confirmed incident whose cause is not established"],
          insufficientAlone: [
            "the incident having a trigger, which is what set it off rather than what made it possible",
          ],
          source: "authoritative",
        },
        next: "a.collect",
      },
      {
        id: "a.collect",
        kind: "action",
        does: "Collect the timeline, the logs and evidence, the change history, the dependency state, the affected cohort, the failure signatures and the effects the mitigations had. What a mitigation did or did not fix is itself evidence about the cause",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "a.hypothesise",
      },
      {
        id: "a.hypothesise",
        kind: "action",
        does: "Form hypotheses that would explain the whole incident rather than its first symptom. The change that shipped just before an incident is the most available explanation and is frequently not the cause - often it is what made a latent problem visible, and fixing it leaves the problem in place",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "a.test",
      },
      {
        id: "a.test",
        kind: "action",
        does: "Test the current hypothesis against the evidence, including the parts of the evidence it does not explain. A hypothesis that accounts for most of an incident and not its timing, or not its cohort, has not been confirmed",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.supported",
      },
      {
        id: "c.supported",
        kind: "condition",
        asks: "Does the evidence support this hypothesis?",
        branches: [
          {
            label: "Supported and it explains the incident",
            when: "it accounts for the failure, its timing, its cohort and its behaviour under mitigation",
            to: "a.confirmed",
          },
          {
            label: "Not supported",
            when: "the evidence contradicts it or leaves it unexplained",
            to: "a.reject",
          },
          {
            label: "Correlated but unexplained",
            when: "the condition was present and nothing connects it to the failure",
            to: "a.reject",
          },
        ],
      },
      {
        id: "a.reject",
        kind: "action",
        does: "Reject the hypothesis and record why, so the next investigator does not retest it. Correlation is not causation, and a condition present during an incident that nothing connects to the failure is a coincidence that will be treated as an answer unless it is rejected explicitly",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.remaining",
      },
      {
        id: "c.remaining",
        kind: "condition",
        asks: "Are hypotheses left to test?",
        branches: [
          {
            label: "Some remain",
            when: "the list has untested candidates",
            to: "a.hypothesise",
          },
          {
            label: "None explains it",
            when: "every candidate within the investigation's bounds has been tested and rejected",
            to: "a.unexplained",
          },
        ],
      },
      {
        id: "a.unexplained",
        kind: "action",
        does: "Record the incident as unexplained rather than attributing it to the most plausible remaining candidate. An unexplained incident is a known gap somebody can work on; a wrongly attributed one is a closed question that will reopen as the same incident with everybody convinced it was fixed",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "h.review",
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "an incident no available hypothesis explains",
        carries: [
          "every hypothesis tested and why each was rejected",
          "the explicit fact that no cause was assigned - the incident is recorded as unexplained rather than closed against a guess",
        ],
      },
      {
        id: "a.confirmed",
        kind: "action",
        does: "Record ROOT_CAUSE_CONFIRMED with the evidence supporting it and exactly what it explains. Service may already have been restored - restoration and understanding proceed independently, and holding one for the other extends an outage for the sake of tidiness",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "a.corrective",
      },
      {
        id: "a.corrective",
        kind: "action",
        does: "Define the corrective action the confirmed cause implies, separately from whatever mitigation is currently holding the impact down. The mitigation is a workaround; this is the thing that makes the workaround unnecessary",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "h.recovery",
      },
      {
        id: "h.recovery",
        kind: "handoff",
        to: "INC-256",
        on: "a confirmed cause with a defined corrective action",
        carries: [
          "the confirmed cause, the evidence for it and the corrective action it implies",
          "the mitigations currently in place, which the corrective action may make removable",
        ],
      },
    ],
    guardrails: [
      "The first plausible explanation is not the root cause.",
      "Correlation is not causation.",
      "The root cause remains evidence-based rather than assigned by elimination.",
      "Service may be restored before the root cause is known.",
    ],
    reusableRule:
      "Root cause is established through evidence that explains the incident, not merely through the first condition correlated with failure.",
  },

  /* ------------------------------------------------------------ INC-256 */
  {
    id: "INC-256",
    slug: "incident-recovery",
    category: "incident",
    goal: "recovery-retry",
    channels: [],
    name: "Recovery action → restore service → verify or continue",
    purpose:
      "Act on the cause and then check the affected population, not the command's return code.",
    entity: {
      scope: "the incident, the recovery action and the capability it is meant to restore",
      note: "The recovery actions available are a finite list defined by the response. Attempts progress through it rather than repeating indefinitely.",
    },
    entry: "t.authorized",
    nodes: [
      {
        id: "t.authorized",
        kind: "trigger",
        event: "recovery_action_authorized",
        evidence: {
          requires: ["an authorized corrective or recovery action against an active incident"],
          source: "authoritative",
        },
        next: "a.execute",
      },
      {
        id: "a.execute",
        kind: "action",
        does: "Execute the corrective action against the affected scope, through the canonical execution and reliability primitives rather than a bespoke path built during the incident",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "w.outcome",
      },
      {
        id: "w.outcome",
        kind: "wait",
        until: [
          "the action reports applied",
          "the action reports a failure",
        ],
        onEvent: "c.applied",
        timeout: {
          after: "the action's execution window",
          reason:
            "an action whose outcome is unknown may or may not have changed the system, and the next decision depends entirely on which",
        },
        onTimeout: "a.unknown",
        windowExtendsOnEngagement: false,
      },
      {
        id: "a.unknown",
        kind: "action",
        does: "Record the action's outcome as unknown and hold further attempts. Applying a second recovery action on top of one that may have landed is how an incident gets a second cause",
        writes: [
          { field: "incident_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "h.reconcile",
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "external:external-status-reconciliation",
        on: "a recovery action whose outcome could not be established",
        carries: [
          "the action, the scope it targeted and everything last known about its effect",
          "the explicit instruction that no further recovery action is applied until this one's effect is known",
        ],
        suppresses: ["any further recovery action while this one's outcome is unknown"],
      },
      {
        id: "c.applied",
        kind: "condition",
        asks: "Did the action apply?",
        branches: [
          {
            label: "Applied",
            when: "the corrective action completed against the affected scope",
            to: "a.verify",
          },
          {
            label: "Failed",
            when: "the action itself did not complete",
            to: "c.alternate",
          },
        ],
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify from the affected population rather than from the action's own success - service availability, error rates, critical transactions, business functions, dependency health, and the recovery of the cohort that was actually affected. A recovery command succeeding says the command ran, and one successful synthetic check says one path works for one caller",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.restored",
      },
      {
        id: "c.restored",
        kind: "condition",
        asks: "Is service restored across the affected population?",
        branches: [
          {
            label: "Restored",
            when: "the affected cohort's real traffic succeeds and the critical functions work",
            to: "a.observed",
          },
          {
            label: "Partially restored",
            when: "some of the affected population works and some does not",
            to: "a.partial",
          },
          {
            label: "Not restored",
            when: "the action applied and the impact continues",
            to: "c.alternate",
          },
        ],
      },
      {
        id: "a.partial",
        kind: "action",
        does: "Keep the incident active and name the unresolved scope explicitly. A partial restoration reported as recovery leaves the remaining population inside an incident everybody has stopped watching, which is how a long tail of affected customers goes unnoticed for days",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.alternate",
      },
      {
        id: "c.alternate",
        kind: "condition",
        asks: "Is another recovery action available?",
        branches: [
          {
            label: "One remains",
            when: "the response defines a further corrective action that has not been attempted",
            to: "a.next",
          },
          {
            label: "None",
            when: "the defined actions are exhausted",
            to: "h.escalate",
          },
        ],
      },
      {
        id: "a.next",
        kind: "action",
        does: "Take the next action from the response's defined list. The list is finite, so attempts progress through it and terminate rather than cycling on the same action with different hopes",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "a.execute",
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "external:human-in-the-loop-lifecycle",
        on: "an incident whose defined recovery actions are exhausted",
        carries: [
          "every action attempted, what each achieved and the scope still affected",
          "the explicit fact that the incident remains active and any partial restoration is named rather than counted as recovery",
        ],
      },
      {
        id: "a.observed",
        kind: "action",
        does: "Record RECOVERY_OBSERVED. What has been established is that the affected population works now - not that it will still be working in an hour, which is the next question and a different one",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "h.observe",
      },
      {
        id: "h.observe",
        kind: "handoff",
        to: "INC-257",
        on: "service observed restored across the affected population",
        carries: [
          "what was verified, across which cohort and against which functions",
          "the explicit fact that this is a first good signal rather than a stable recovery",
        ],
      },
    ],
    guardrails: [
      "A recovery command succeeding is not service restored.",
      "One successful synthetic check does not prove population recovery.",
      "Partial restoration stays explicit and keeps the incident active.",
    ],
    reusableRule:
      "Incident recovery becomes meaningful only when the affected service and user population demonstrate restored operation.",
  },

  /* ------------------------------------------------------------ INC-257 */
  {
    id: "INC-257",
    slug: "recovery-observation",
    category: "incident",
    goal: "suspension-restoration",
    channels: [],
    name: "Service restored → observation window → stable or relapse",
    purpose:
      "Hold the incident open long enough to know the recovery held.",
    entity: {
      scope: "the incident and the recovered service under observation",
      note: "The window is set from the incident's own character rather than from a standard duration.",
    },
    distinctFrom: [
      {
        journey: "RET-27",
        because:
          "RET-27 buffers one relationship's recovery signal before concluding the relationship is healthy. This applies the same principle to a shared operational failure - same discipline, different entity, and here a relapse returns a population to an incident rather than a person to a risk state.",
      },
    ],
    entry: "t.observed",
    nodes: [
      {
        id: "t.observed",
        kind: "trigger",
        event: "material_recovery_observed",
        evidence: {
          requires: ["verified restoration across the affected population"],
          insufficientAlone: [
            "a recovery action completing, which is what produced the signal rather than the signal itself",
          ],
          source: "authoritative",
        },
        next: "a.state",
      },
      {
        id: "a.state",
        kind: "action",
        does: "Record RECOVERY_OBSERVATION. The incident is not resolved - recoveries that hold for ten minutes and fail again are common, and closing on the first good signal means reopening in front of the same customers who were just told it was over",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "a.window",
      },
      {
        id: "a.window",
        kind: "action",
        does: "Set the observation window from the incident's own character - how long the failure took to manifest, how often the affected path runs, and whether the fix addressed a cause or a symptom. A fixed window applied to every incident is either too long for a trivial one or far too short for one on a rare path",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "w.observe",
      },
      {
        id: "w.observe",
        kind: "wait",
        until: [
          "the same failure returns",
          "new affected cases appear",
        ],
        onEvent: "c.relapse",
        timeout: {
          after: "the observation window set for this incident",
          reason:
            "reaching the window without recurrence is what makes the recovery stable. Holding it open longer without need keeps a response engaged on something that has finished",
        },
        onTimeout: "a.stable",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.relapse",
        kind: "condition",
        asks: "What appeared during observation?",
        branches: [
          {
            label: "The same failure returned",
            when: "the incident's own signature recurs in the affected population",
            to: "a.relapse",
          },
          {
            label: "New cases, a different failure",
            when: "something else is failing during the window",
            to: "a.separate",
          },
        ],
      },
      {
        id: "a.relapse",
        kind: "action",
        does: "Return the incident to ACTIVE. What resumes is this incident rather than a new one - the recurrence is evidence about the recovery, and opening a fresh incident hides that the fix did not hold and makes the pattern invisible",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "h.active",
      },
      {
        id: "h.active",
        kind: "handoff",
        to: "INC-253",
        on: "a recovery that did not hold",
        carries: [
          "the recovery that was applied, how long it held and the signature of the relapse",
          "the explicit fact that this is the same incident recurring, which is evidence the confirmed cause was incomplete",
        ],
      },
      {
        id: "a.separate",
        kind: "action",
        does: "Assess it separately rather than absorbing it into this incident. Attaching every failure that occurs during an observation window to the incident makes the incident unfalsifiable - it can never be shown to have ended",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "x.separate",
      },
      {
        id: "x.separate",
        kind: "exit",
        state: "an unrelated failure raised separately; this observation continues on its own terms",
        terminal: false,
        reEntry:
          "if the separate assessment shows the two do share a cause, they are correlated on that evidence rather than on having overlapped in time",
      },
      {
        id: "a.stable",
        kind: "action",
        does: "Record STABLE_RECOVERY with what was observed and for how long. The observation is part of the record, because the next similar incident's window is set against it",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "h.resolve",
      },
      {
        id: "h.resolve",
        kind: "handoff",
        to: "INC-258",
        on: "a recovery that held through its observation window",
        carries: [
          "what was observed, over what window and across which cohort",
          "the mitigations still in place, which the resolution has to remove or formalize rather than leave running",
        ],
      },
    ],
    guardrails: [
      "Service restored once is not the incident resolved.",
      "The observation duration and evidence reflect the incident's type rather than a standard.",
      "Observation is not kept artificially long without need.",
    ],
    reusableRule:
      "Initial restoration should enter an observation state until sufficient evidence shows the recovery is stable.",
  },

  /* ------------------------------------------------------------ INC-258 */
  {
    id: "INC-258",
    slug: "incident-resolution",
    category: "incident",
    goal: "cancellation-termination",
    channels: [],
    name: "Incident resolution → close operational response → preserve residual cases",
    purpose:
      "Close the shared failure without closing the individual problems it caused.",
    entity: {
      scope: "the incident and the individual cases and obligations linked to it",
      note: "The incident's resolution is a statement about the shared cause. Every linked case reaches its own resolution on its own terms.",
    },
    entry: "t.criteria",
    nodes: [
      {
        id: "t.criteria",
        kind: "trigger",
        event: "incident_resolution_criteria_satisfied",
        evidence: {
          requires: ["a stable recovery and the incident's own resolution criteria met"],
          insufficientAlone: [
            "service being restored, which is one of the criteria rather than all of them",
          ],
          source: "authoritative",
        },
        next: "a.resolve",
      },
      {
        id: "a.resolve",
        kind: "action",
        does: "Mark the systemic incident RESOLVED, preserving its timeline, its mitigations and every decision taken during it. The record is what the review works from and what any later recurrence is compared against - an incident that keeps only its outcome teaches nothing",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "a.stop-emergency",
      },
      {
        id: "a.stop-emergency",
        kind: "action",
        does: "Stop the incident-specific emergency operations - the elevated monitoring, the standing bridge, the suspended changes. These have their own cost and they end with the incident rather than drifting on",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.mitigations",
      },
      {
        id: "c.mitigations",
        kind: "condition",
        asks: "What happens to the temporary mitigations?",
        branches: [
          {
            label: "Safe to remove",
            when: "the corrective action makes them unnecessary",
            to: "a.remove",
          },
          {
            label: "They should become permanent",
            when: "the mitigation turned out to be the right long-term behaviour",
            to: "a.formalize",
          },
        ],
      },
      {
        id: "a.remove",
        kind: "action",
        does: "Remove them and verify the service holds without them. A mitigation left in place because removing it is frightening becomes permanent by nobody's decision, and it joins the set of quietly permanent emergency controls that is the least-understood part of most systems",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.cases",
      },
      {
        id: "a.formalize",
        kind: "action",
        does: "Formalize it explicitly as a change with an owner and a rationale, rather than leaving a temporary control quietly running forever. Every one of those was meant to last an afternoon",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.cases",
      },
      {
        id: "c.cases",
        kind: "condition",
        asks: "Do individual affected cases remain unresolved?",
        branches: [
          {
            label: "Some remain",
            when: "linked entity-level problems are still outstanding",
            to: "a.detach",
          },
          {
            label: "None",
            when: "every linked case has independently reached resolution",
            to: "c.obligations",
          },
        ],
      },
      {
        id: "a.detach",
        kind: "action",
        does: "Detach them and let each continue on its own recovery. The systemic cause is fixed and the customer whose order failed still has a failed order - closing their case because the incident closed tells them the problem is solved at exactly the moment they discover it is not",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.obligations",
      },
      {
        id: "c.obligations",
        kind: "condition",
        asks: "Do financial or remedy obligations remain from the incident?",
        branches: [
          {
            label: "Some remain",
            when: "refunds, credits, compensation or unmet service obligations were created by the incident",
            to: "h.remedy",
          },
          {
            label: "None",
            when: "nothing is owed as a result of it",
            to: "c.review",
          },
        ],
      },
      {
        id: "h.remedy",
        kind: "handoff",
        to: "REM-157",
        on: "obligations surviving an incident's closure",
        carries: [
          "the obligations, their affected scope and what created them",
          "the explicit fact that the incident is resolved and these are not - they run on their own lifecycle at their own pace",
        ],
      },
      {
        id: "c.review",
        kind: "condition",
        asks: "Does this incident qualify for a post-incident review?",
        branches: [
          {
            label: "It does",
            when: "its severity, novelty or recurrence meets the threshold for review",
            to: "h.review",
          },
          {
            label: "It does not",
            when: "it falls below the review threshold and nothing about it was novel",
            to: "x.resolved",
          },
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "INC-259",
        on: "a resolved incident qualifying for review",
        carries: [
          "the timeline, the mitigations, the decisions and the root cause where one was confirmed",
          "the detached cases and surviving obligations, which are part of the incident's real cost",
        ],
      },
      {
        id: "x.resolved",
        kind: "exit",
        state: "RESOLVED; the shared failure closed and its record preserved",
        terminal: false,
        reEntry:
          "a recurrence is correlated against this record rather than assessed from nothing, which is what makes a pattern visible across incidents",
      },
    ],
    guardrails: [
      "An incident resolved is not every individual case resolved.",
      "Temporary mitigations do not silently become permanent.",
      "Incident closure preserves the timeline and the decisions taken.",
    ],
    reusableRule:
      "Incident resolution closes the shared systemic failure while leaving entity-specific obligations open until they independently reach resolution.",
  },

  /* ------------------------------------------------------------ INC-259 */
  {
    id: "INC-259",
    slug: "post-incident-review",
    category: "incident",
    goal: "root-cause-diagnostic-correlation",
    channels: ["task"],
    name: "Post-incident review → learn → corrective work → verify",
    purpose:
      "Turn what the incident showed into work somebody owns and somebody checks.",
    entity: {
      scope: "the resolved incident and the corrective work its review produces",
      note: "The review's output is owned work with deadlines. A published document is not a control and is not the deliverable.",
    },
    entry: "t.qualifies",
    nodes: [
      {
        id: "t.qualifies",
        kind: "trigger",
        event: "incident_qualifies_for_review",
        evidence: {
          requires: ["a resolved incident meeting the threshold for post-incident review"],
          source: "authoritative",
        },
        next: "a.review",
      },
      {
        id: "a.review",
        kind: "action",
        does: "Review the timeline, the detection, the response, the root cause, the blast radius, the mitigations, the communication, the recovery, the control failures and the near misses. What is examined is the system and the response rather than the people - a review that finds a person found the wrong thing, because the person will move on and the condition will not",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "a.identify",
        execution: "human",
      },
      {
        id: "a.identify",
        kind: "action",
        does: "Identify the corrective and preventive actions the evidence actually supports. An action nobody can trace to something the incident revealed is a good idea rather than a finding, and mixing the two makes the real findings harder to prioritise",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.actions",
      },
      {
        id: "c.actions",
        kind: "condition",
        asks: "Does the review produce corrective work?",
        branches: [
          {
            label: "It does",
            when: "the evidence supports specific preventive or corrective actions",
            to: "a.assign",
          },
          {
            label: "It does not",
            when: "the response worked, the controls held, and nothing the incident revealed needs changing",
            to: "a.no-action",
          },
        ],
      },
      {
        id: "a.no-action",
        kind: "action",
        does: "Record explicitly that the review found no corrective work required, with the reasoning. That is a legitimate outcome and it needs to be a stated one rather than an empty section that reads as an unfinished review",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "x.reviewed",
      },
      {
        id: "x.reviewed",
        kind: "exit",
        state: "reviewed; no outstanding corrective work",
        terminal: false,
        reEntry:
          "a recurrence reopens the question of whether the conclusion that nothing needed changing was right",
      },
      {
        id: "a.assign",
        kind: "action",
        does: "Assign owners and deadlines to each corrective action. An action item with no owner is a sentence in a document, and a document is not a control - the whole value of the review is what somebody is now accountable for delivering",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "w.corrective",
        execution: "human",
      },
      {
        id: "w.corrective",
        kind: "wait",
        until: [
          "the required corrective actions are claimed complete",
          "corrective actions are abandoned or superseded",
        ],
        onEvent: "c.claimed",
        timeout: {
          after: "the deadlines assigned to the corrective actions",
          reason:
            "prevention work that slips past its deadline unremarked is how the same incident recurs, and by then nobody remembers the action existed",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "corrective work outliving its assigned deadline",
        carries: [
          "the outstanding actions, their owners and the incident they came from",
          "the explicit fact that the risk the incident revealed is still present",
        ],
      },
      {
        id: "c.claimed",
        kind: "condition",
        asks: "What happened to the corrective work?",
        branches: [
          {
            label: "Claimed complete",
            when: "the owners report the actions done",
            to: "a.verify",
          },
          {
            label: "Abandoned or superseded",
            when: "the actions were dropped or replaced",
            to: "a.abandoned",
          },
        ],
      },
      {
        id: "a.abandoned",
        kind: "action",
        does: "Record which actions were dropped and on whose authority. Silently abandoned prevention work is the reason the same incident recurs, and without this record nobody can point to the moment it was dropped or ask why",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "x.reviewed",
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify the corrective work where verification is required. An action item created is not a risk reduced, and a document published is not a prevention - what is checked is whether the condition that produced the incident can still produce it",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.verified",
      },
      {
        id: "c.verified",
        kind: "condition",
        asks: "Did the corrective work actually reduce the risk?",
        branches: [
          {
            label: "Verified",
            when: "the condition the incident exposed can no longer produce it",
            to: "a.closed",
          },
          {
            label: "Not effective",
            when: "the work completed and the condition remains reachable",
            to: "a.reopen-action",
          },
        ],
      },
      {
        id: "a.reopen-action",
        kind: "action",
        does: "Return the action to its owner with what the verification found. Work completed that did not reduce the risk means the action was aimed at the wrong thing, and repeating it produces the same result",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "w.corrective",
        execution: "human",
      },
      {
        id: "a.closed",
        kind: "action",
        does: "Record the corrective work as complete and verified, with what the verification established",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "x.closed",
      },
      {
        id: "x.closed",
        kind: "exit",
        state: "review closed with verified corrective work",
        terminal: false,
        reEntry:
          "a recurrence despite verified prevention is strong evidence the diagnosis was wrong, and is assessed at pattern level rather than as a fresh incident",
      },
    ],
    guardrails: [
      "A postmortem is not a blame exercise.",
      "An action item created is not a risk reduced.",
      "Prevention is never marked complete solely because a document was published.",
    ],
    reusableRule:
      "Post-incident review converts incident evidence into owned, verifiable improvements rather than treating documentation itself as remediation.",
  },

  /* ------------------------------------------------------------ INC-260 */
  {
    id: "INC-260",
    slug: "incident-recurrence",
    category: "incident",
    goal: "root-cause-diagnostic-correlation",
    channels: [],
    name: "Incident pattern recurrence → detect systemic weakness → escalate prevention",
    purpose:
      "Notice when the same weakness keeps producing incidents, and stop treating each one as new.",
    entity: {
      scope: "the family of materially similar incidents and the weakness they may share",
      note: "Similarity is established by comparing causes rather than by counting occurrences or matching alert names.",
    },
    distinctFrom: [
      {
        journey: "INC-251",
        because:
          "INC-251 correlates failures happening now into one incident. This compares incidents across time to ask whether the same systemic weakness keeps producing them - a question about the prevention strategy rather than about any one response.",
      },
    ],
    entry: "t.similar",
    nodes: [
      {
        id: "t.similar",
        kind: "trigger",
        event: "materially_similar_incidents_recur",
        evidence: {
          requires: [
            "multiple incidents across a defined window or context that appear materially similar",
          ],
          insufficientAlone: [
            "the same alert firing repeatedly, which is a repeated alert name and nothing more",
            "a raised incident count, which measures how often something was declared rather than why",
          ],
          source: "inferred",
        },
        next: "a.compare",
      },
      {
        id: "a.compare",
        kind: "action",
        does: "Compare the root causes, the affected systems, the failure modes, the mitigations, the recovery actions, the corrective actions and any prevention work that was never finished. What is compared is the causes rather than the symptoms - two incidents that both presented as elevated latency can have nothing else in common",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.same",
      },
      {
        id: "c.same",
        kind: "condition",
        asks: "Do these incidents share a systemic weakness?",
        branches: [
          {
            label: "The same weakness recurring",
            when: "the confirmed causes point to one underlying condition that keeps producing failures",
            to: "a.elevate",
          },
          {
            label: "Superficially similar, different causes",
            when: "they looked alike and their causes are unrelated",
            to: "a.separate",
          },
          {
            label: "Not determinable from the evidence",
            when: "the incidents lack confirmed causes, or the comparison is inconclusive",
            to: "h.review",
          },
        ],
      },
      {
        id: "h.review",
        kind: "handoff",
        to: "DEC-181",
        on: "a recurrence pattern the evidence cannot establish",
        carries: [
          "the incidents compared, their causes where confirmed and where they were not",
          "the explicit fact that no shared root cause was inferred from the count - inferring one from repetition is exactly the mistake this journey exists to prevent",
        ],
      },
      {
        id: "a.separate",
        kind: "action",
        does: "Keep them separate and record why the apparent similarity does not hold. Grouping incidents by how they looked produces a pattern that is an artifact of the monitoring rather than of the system, and prevention work aimed at it fixes nothing",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "x.separate",
      },
      {
        id: "x.separate",
        kind: "exit",
        state: "incidents kept separate; the apparent pattern was superficial",
        terminal: false,
        reEntry:
          "further incidents with confirmed causes may still establish a genuine pattern. This comparison is recorded so it is not repeated identically",
      },
      {
        id: "a.elevate",
        kind: "action",
        does: "Elevate the prevention priority and create or strengthen the long-term corrective programme. Repeated recovery without prevention is an operational risk, and it should be visible as a risk rather than as a series of incidents that were each handled well",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "c.previous",
      },
      {
        id: "c.previous",
        kind: "condition",
        asks: "Was remediation previously attempted for this weakness?",
        branches: [
          {
            label: "It was",
            when: "corrective work from an earlier incident targeted this same condition",
            to: "a.reassess",
          },
          {
            label: "It was not",
            when: "this weakness has not previously been worked on",
            to: "x.elevated",
          },
        ],
      },
      {
        id: "a.reassess",
        kind: "action",
        does: "Reopen the previous remediation's assumptions. A fix that was applied and did not hold means the diagnosis was wrong rather than the execution, and repeating the same remediation produces the same incident at greater cost and with less credibility",
        writes: [{ field: "incident_log", mode: "append" }],
        next: "h.reassess",
      },
      {
        id: "h.reassess",
        kind: "handoff",
        to: "DEC-181",
        on: "remediation that was applied and did not prevent recurrence",
        carries: [
          "the previous corrective work, what it assumed and what the recurrence shows about that assumption",
          "the explicit fact that increasing customer messaging is not the response to recurrence - the prevention strategy is what has to change",
        ],
      },
      {
        id: "x.elevated",
        kind: "exit",
        state: "systemic weakness identified; prevention elevated as a standing risk",
        terminal: false,
        reEntry:
          "further recurrence is measured against the elevated programme rather than raising the priority again, so the escalation means something the first time",
      },
    ],
    guardrails: [
      "A repeated alert name is not the same root cause.",
      "Customer messaging is not increased simply because incidents recur.",
      "Repeated recovery without prevention stays visible as operational risk.",
      "A shared root cause is never inferred from a count of occurrences.",
    ],
    reusableRule:
      "Recurring incidents should change the prevention strategy when evidence shows the same systemic weakness continues to produce failures.",
  },
];
