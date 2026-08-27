import type { CanonicalJourney, OrchestrationRule } from "./types";

/* CATEGORY 14 - TRANSACTIONS, PAYMENTS, BILLING & FINANCIAL OUTCOMES

   Money, where the cost of guessing is denominated.

   Everywhere else in this library an unknown resolved wrongly produces a
   message nobody wanted or an access someone has to request again. Here it
   produces a duplicate charge, a refund paid twice, or an obligation quietly
   written off. The uncertainty is the same shape as Category 12's; the
   asymmetry is much sharper.

   The category is domain-neutral. A SaaS subscription, an insurance premium,
   a marketplace payout, a telecom bill and a tuition instalment share these
   states exactly, because the states are properties of money moving rather
   than of what it was moving for.

   Six separations carry most of the weight:

     obligation     what is owed, which outlives every attempt to pay it
     attempt        one try at paying it, which may or may not have worked
     authorized     funds reserved
     captured       movement requested and accepted
     settled        movement completed
     satisfied      the obligation is discharged

   An attempt failing does not touch the obligation. An authorization is not
   money. A capture is not settlement. And the one state that has no
   equivalent anywhere else in the library is UNKNOWN - because in this
   category the safe response to not knowing is not to try again, it is to go
   and find out, and FIN-135 exists entirely for that.

   Payment failure never ends a commercial relationship here. It hands to
   grace, to due-state tracking or to a scoped restriction, and the
   relationship's own lifecycle decides what happens to it. */

export const FINANCIAL_RULES: readonly OrchestrationRule[] = [
  {
    id: "FIN-R1",
    scope: "financial",
    rule: "A financial obligation and a payment attempt are separate entities.",
    because:
      "The obligation outlives every attempt against it. Deleting or closing it because an attempt failed loses what is owed, and treating a successful attempt as the obligation loses the balance it left behind.",
  },
  {
    id: "FIN-R2",
    scope: "financial",
    rule: "Initiated, authorized, captured, settled and obligation-satisfied are distinct states.",
    because:
      "Each is a different commitment about funds, and collapsing them into a generic success grants irreversible outcomes against money that has been reserved rather than taken.",
  },
  {
    id: "FIN-R3",
    scope: "financial",
    rule: "Payment failure and payment unknown remain separate states.",
    because:
      "Failure means we know nothing moved. Unknown means we do not know, and the correct response to the second is to find out rather than to try again.",
  },
  {
    id: "FIN-R4",
    scope: "financial",
    rule: "An unknown financial outcome is reconciled before any replacement attempt.",
    because:
      "The original may have succeeded where we could not see it, and a replacement submitted into that uncertainty is a duplicate charge the customer will find before we do.",
  },
  {
    id: "FIN-R6",
    scope: "financial",
    rule: "A payment failure does not terminate the commercial relationship.",
    because:
      "A declined card is a payment event. Cancelling the relationship on it removes something the customer was paying for because of a problem they were about to fix.",
  },
  {
    id: "FIN-R7",
    scope: "financial",
    rule: "Financial recovery and entitlement or access consequences are separate, and hand off to each other rather than merging.",
    because:
      "Whether money is owed and whether access continues are governed by different policies with different timelines, and merging them makes each decision on the other's evidence.",
  },
  {
    id: "FIN-R8",
    scope: "financial",
    rule: "A partial payment or partial refund preserves the remaining balance explicitly.",
    because:
      "Partial is not paid. A balance that is rounded away or implied is one nobody can collect and nobody can dispute.",
  },
  {
    id: "FIN-R9",
    scope: "financial",
    rule: "Refund requested, refund approved and refund completed are three separate states.",
    because:
      "The first is an ask, the second is a decision, and the third is money that has actually arrived. Telling a customer any of the first two happened when they wanted the third is how a refund becomes a dispute.",
  },
  {
    id: "FIN-R10",
    scope: "financial",
    rule: "A financial dispute and a generic decision appeal are separate mechanisms.",
    because:
      "A dispute is adjudicated by an external authority with its own deadline, its own evidence rules and its own power to move funds. An internal appeal has none of those.",
  },
  {
    id: "FIN-R11",
    scope: "financial",
    rule: "Opening a dispute is not proof of fraud or wrongdoing by anyone.",
    because:
      "Most disputes are confusion, a forgotten subscription or an unrecognised descriptor. Treating the claim as a finding penalises customers for a process that exists to protect them.",
  },
  {
    id: "FIN-R12",
    scope: "financial",
    rule: "Financial reconciliation preserves transaction history.",
    because:
      "The history is what any correction has to be explained against. A mismatch fixed by deleting the inconvenient record has removed the evidence of what it fixed.",
  },
  {
    id: "FIN-R13",
    scope: "financial",
    rule: "Corrections are explicit adjustments, never silent historical rewrites.",
    because:
      "An adjustment can be audited, reversed and explained. An edited record cannot be distinguished from one that was always that way.",
  },
  {
    id: "FIN-R14",
    scope: "financial",
    rule: "An external provider accepting a request does not prove funds moved.",
    because:
      "The acknowledgement describes their queue. Whether money reached the other side is a separate fact established separately, and it is the only one the customer experiences.",
  },
  {
    id: "FIN-R15",
    scope: "financial",
    rule: "A late financial outcome is reconciled against the obligation's current state before it mutates anything.",
    because:
      "The balance moved while the outcome was in flight, and applying it against the balance it was written for creates a discrepancy rather than resolving one.",
  },
  {
    id: "FIN-R16",
    scope: "financial",
    rule: "Duplicate payment or refund execution is prevented through idempotency and reconciliation, not through hoping.",
    because:
      "Every layer here retries, and a duplicate in this category is money that has to be found, returned and explained rather than a log line that has to be ignored.",
  },
  {
    id: "FIN-R17",
    scope: "financial",
    rule: "Financial state is authoritative enough that communication activity cannot redefine it.",
    because:
      "A reminder being sent is not a debt existing, and a receipt being emailed is not a payment succeeding. Where the messaging layer can move financial truth, the truth follows the schedule of whatever sends.",
  },
  {
    id: "FIN-R18",
    scope: "financial",
    rule: "Currency and amount semantics stay explicit. Monetary values are never reconciled across incompatible currency or context.",
    because:
      "An amount without its currency is a number, and netting two of them produces a balance that is confidently wrong in a way no later check can detect.",
  },
];

export const FINANCIAL_JOURNEYS: readonly CanonicalJourney[] = [
  /* ------------------------------------------------------------ FIN-131 */
  {
    id: "FIN-131",
    slug: "financial-obligation-lifecycle",
    category: "financial",
    goal: "reconciliation-correction",
    channels: [],
    name: "Financial obligation created → due → satisfied or outstanding",
    purpose:
      "Hold what is owed as its own state, independent of any attempt to pay it and of anything sent about it.",
    entity: {
      scope: "the obligation itself - its amount, its currency, its payer and the business entity it arose from",
      note: "The obligation outlives every payment attempt against it. Attempts come and go; what is owed changes only when an authoritative financial event satisfies, adjusts or cancels it.",
    },
    distinctFrom: [
      {
        journey: "FIN-132",
        because:
          "An attempt is one try at discharging an obligation. It can fail without the obligation changing at all, which is exactly why they are two entities.",
      },
    ],
    entry: "t.created",
    nodes: [
      {
        id: "t.created",
        kind: "trigger",
        event: "financial_obligation_created",
        evidence: {
          requires: [
            "an authoritative record that an amount is owed, by whom, to whom, and arising from what",
          ],
          insufficientAlone: [
            "an invoice being emailed, which is a communication about an obligation rather than the obligation",
            "a reminder being scheduled",
          ],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the obligation id, the amount, the currency, the payer, the payee, the due date where one applies, the source, the related business entity and the settlement requirement. Currency is part of the amount - a monetary value without it cannot be reconciled against anything later",
        writes: [{ field: "obligation_log", mode: "append" }],
        next: "c.already",
      },
      {
        id: "c.already",
        kind: "condition",
        asks: "Does an existing payment or credit already satisfy this?",
        branches: [
          {
            label: "Already covered",
            when: "an existing authoritative financial event discharges it, in whole or in part",
            to: "h.satisfy",
          },
          {
            label: "Nothing against it",
            when: "no financial event has been applied to it",
            to: "a.outstanding",
          },
        ],
      },
      {
        id: "a.outstanding",
        kind: "action",
        does: "Record OUTSTANDING. This is the normal state of a new obligation and not a failure - nothing has gone wrong and nothing has been paid, and the two are different facts",
        writes: [{ field: "obligation_log", mode: "append" }],
        next: "w.obligation",
      },
      {
        id: "w.obligation",
        kind: "wait",
        until: [
          "an authoritative financial event satisfies or partly satisfies it",
          "an adjustment or cancellation is recorded against it",
          "it becomes due or overdue",
        ],
        onEvent: "c.event",
        timeout: {
          after: "the obligation's own horizon - its limitation period, its write-off point, or the end of the relationship it belongs to",
          reason:
            "an obligation outstanding indefinitely is a balance nobody is collecting and nobody has decided to stop collecting, and which of those it is should be stated",
        },
        onTimeout: "x.aged",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.event",
        kind: "condition",
        asks: "What happened to the obligation?",
        branches: [
          {
            label: "A financial event discharged some or all of it",
            when: "a payment, credit or settlement was applied",
            to: "h.satisfy",
          },
          {
            label: "It was adjusted or cancelled",
            when: "the amount, the terms or the obligation's existence changed authoritatively",
            to: "a.version",
          },
          {
            label: "Its due state moved",
            when: "it became due, or passed its due date unsatisfied",
            to: "h.due",
          },
        ],
      },
      {
        id: "a.version",
        kind: "action",
        does: "Version the obligation and reconcile the financial state. An adjustment does not overwrite the original amount - the obligation's history is what any later dispute or reconciliation reads, and a silently edited balance cannot be explained to anyone",
        writes: [{ field: "obligation_log", mode: "append" }],
        next: "x.adjusted",
      },
      {
        id: "x.adjusted",
        kind: "exit",
        state: "obligation adjusted; prior versions preserved",
        terminal: false,
        reEntry: "the adjusted obligation continues its own lifecycle from its new amount",
      },
      {
        id: "h.satisfy",
        kind: "handoff",
        to: "FIN-136",
        on: "an authoritative financial event applying to this obligation",
        carries: [
          "the obligation, its current balance and its currency",
          "the financial event and its identifiers, so it can be applied exactly once",
        ],
      },
      {
        id: "h.due",
        kind: "handoff",
        to: "TIM-62",
        on: "the obligation becoming due or overdue",
        carries: [
          "the obligation and its due date",
          "the explicit fact that being outstanding is not a payment failure - nothing has been attempted and refused",
        ],
      },
      {
        id: "x.aged",
        kind: "exit",
        state: "outstanding past its horizon",
        terminal: false,
        reEntry:
          "what happens to an aged obligation is an accounting decision - writing it off is a policy act with its own authority, and this journey does not make it",
      },
    ],
    guardrails: [
      "An invoice issued is not a payment received.",
      "An outstanding obligation is not a payment failure.",
      "Reminder activity does not define financial truth. What is owed is established by financial events, not by what was sent about it.",
    ],
    reusableRule:
      "A financial obligation remains outstanding until authoritative financial events satisfy, adjust or cancel it.",
  },

  /* ------------------------------------------------------------ FIN-132 */
  {
    id: "FIN-132",
    slug: "payment-attempt-outcome",
    category: "financial",
    goal: "delivery-confirmation",
    channels: [],
    name: "Payment initiated → pending → success, failure or unknown",
    purpose:
      "Keep initiating a payment and knowing what happened to it as separate states, with a third state for not knowing.",
    entity: {
      scope: "the individual payment attempt, keyed by its own idempotency key and provider reference",
      note: "One attempt, one key, recorded before submission. Without it a later reconciliation cannot ask the provider about anything in particular.",
    },
    distinctFrom: [
      {
        journey: "INT-114",
        because:
          "INT-114 is the generic shape of an external operation. This carries financial semantics the generic version has no room for: an obligation behind it, an authorization that is not money, and an unknown state whose safe response is to investigate rather than retry.",
      },
    ],
    entry: "t.initiated",
    nodes: [
      {
        id: "t.initiated",
        kind: "trigger",
        event: "payment_attempt_initiated",
        evidence: {
          requires: [
            "an authoritative payment system accepting an attempt against a specific obligation",
          ],
          insufficientAlone: [
            "a payment button clicked, which is an intent until an authoritative system has accepted the attempt",
            "an HTTP success from a payment form, which describes the form rather than the money",
          ],
          source: "authoritative",
        },
        next: "a.persist",
      },
      {
        id: "a.persist",
        kind: "action",
        does: "Persist the attempt id, the amount, the currency, the payment method reference, the obligation it targets, the provider reference, the idempotency key and the initiation time, and record PAYMENT_PENDING. The idempotency key exists before submission because it is the only thing that makes a later retry or reconciliation safe",
        writes: [{ field: "payment_log", mode: "append" }],
        next: "w.outcome",
      },
      {
        id: "w.outcome",
        kind: "wait",
        until: ["an authoritative success", "an authoritative failure"],
        onEvent: "c.outcome",
        timeout: {
          after: "the payment outcome window",
          reason:
            "the window ending means we stopped hearing, which is a fact about our visibility rather than about the money - and in this category the difference between those two is a duplicate charge",
        },
        onTimeout: "h.unknown",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What did the authoritative system establish?",
        branches: [
          {
            label: "Funds committed",
            when: "the payment succeeded outright, with no separate capture or settlement step to follow",
            to: "h.satisfy",
          },
          {
            label: "Authorized, capture still required",
            when: "funds are reserved and the movement has not been requested",
            to: "h.capture",
          },
          {
            label: "Authoritative failure",
            when: "the payment system states that nothing moved and why",
            to: "h.failure",
          },
        ],
      },
      {
        id: "h.satisfy",
        kind: "handoff",
        to: "FIN-136",
        on: "a payment succeeding against an obligation",
        carries: [
          "the attempt, its amount and its currency",
          "the idempotency key, so the obligation records it exactly once",
        ],
      },
      {
        id: "h.capture",
        kind: "handoff",
        to: "FIN-133",
        on: "an authorization that still requires capture",
        carries: [
          "the authorization, its expiry and the obligation behind it",
          "the explicit fact that funds are reserved rather than taken",
        ],
      },
      {
        id: "h.failure",
        kind: "handoff",
        to: "FIN-134",
        on: "an authoritative payment failure",
        carries: [
          "the failure as the provider actually reported it, unclassified",
          "the obligation, which the failure does not change",
        ],
      },
      {
        id: "h.unknown",
        kind: "handoff",
        to: "FIN-135",
        on: "a payment whose outcome window closed without an authoritative result",
        carries: [
          "the provider reference and the idempotency key needed to ask what actually happened",
          "the explicit fact that this is unknown rather than failed",
        ],
        suppresses: ["any replacement payment attempt until the true state is established"],
      },
    ],
    guardrails: [
      "A payment button click is not a payment initiated unless an authoritative system accepted the attempt.",
      "An HTTP success is not a payment success.",
      "A timeout is not a failed payment.",
      "An unknown outcome is never blindly retried.",
    ],
    reusableRule:
      "A payment attempt remains pending until an authoritative outcome establishes success, failure or an explicitly unresolved state.",
  },

  /* ------------------------------------------------------------ FIN-133 */
  {
    id: "FIN-133",
    slug: "authorization-capture-settlement",
    category: "financial",
    goal: "progression-milestone",
    channels: [],
    name: "Payment authorization → capture → settle or release",
    purpose:
      "Model the actual commitment of funds, where reserving, taking and receiving are three different things.",
    entity: {
      scope: "the payment transaction across its authorization, capture and settlement states",
      note: "Each state is a different commitment. An outcome that depends on money having moved is not granted against an authorization, which is money that has only been promised.",
    },
    entry: "t.authorized",
    nodes: [
      {
        id: "t.authorized",
        kind: "trigger",
        event: "payment_authorization_succeeded",
        evidence: {
          requires: ["an authorization confirmed by the payment system, with its own validity window"],
          source: "authoritative",
        },
        next: "a.authorized",
      },
      {
        id: "a.authorized",
        kind: "action",
        does: "Record AUTHORIZED. Authorized means funds are reserved, not moved - granting an irreversible outcome here grants it against money that has not been taken and may never be",
        writes: [{ field: "payment_log", mode: "append" }],
        next: "c.capture",
      },
      {
        id: "c.capture",
        kind: "condition",
        asks: "Is a separate capture required?",
        branches: [
          {
            label: "Capture required",
            when: "the authorization reserves funds and a separate act moves them",
            to: "w.capture",
          },
          {
            label: "Captured at authorization",
            when: "the payment model takes the funds as it authorises them",
            to: "a.captured",
          },
        ],
      },
      {
        id: "w.capture",
        kind: "wait",
        until: ["capture is executed", "the authorization is cancelled"],
        onEvent: "c.capture-result",
        timeout: {
          after: "the authorization's validity window",
          reason:
            "an authorization that expires uncaptured releases the reservation on its own, and the customer's available balance returns without anyone deciding it should",
        },
        onTimeout: "a.expired",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.capture-result",
        kind: "condition",
        asks: "What happened to the authorization?",
        branches: [
          { label: "Captured", when: "the movement was requested and accepted", to: "a.captured" },
          { label: "Cancelled", when: "the authorization was released deliberately", to: "a.released" },
        ],
      },
      {
        id: "a.released",
        kind: "action",
        does: "Record RELEASED - the reservation returned and no funds moved. The obligation behind it is untouched and still outstanding",
        writes: [{ field: "payment_log", mode: "append" }],
        next: "x.released",
      },
      {
        id: "x.released",
        kind: "exit",
        state: "RELEASED; reservation returned, obligation unchanged",
        terminal: false,
        reEntry: "a further attempt against the same obligation is a new attempt with its own key",
      },
      {
        id: "a.expired",
        kind: "action",
        does: "Record EXPIRED - the authorization lapsed before capture and the reservation is gone. Nothing was taken, and the obligation stands exactly as it did",
        writes: [{ field: "payment_log", mode: "append" }],
        next: "x.expired",
      },
      {
        id: "x.expired",
        kind: "exit",
        state: "EXPIRED; authorization lapsed uncaptured",
        terminal: false,
        reEntry: "a new authorization is required; this one cannot be captured after expiry",
      },
      {
        id: "a.captured",
        kind: "action",
        does: "Record CAPTURED. Captured means the movement was requested and accepted, which is still not the same as the funds having arrived on the other side",
        writes: [{ field: "payment_log", mode: "append" }],
        next: "c.settlement",
      },
      {
        id: "c.settlement",
        kind: "condition",
        asks: "Is settlement tracked separately in this system?",
        branches: [
          {
            label: "Tracked separately",
            when: "capture and settlement are distinct events with distinct timing",
            to: "a.pending",
          },
          {
            label: "Capture is authoritative",
            when: "this payment model treats capture as the completed movement",
            to: "h.satisfy",
          },
        ],
      },
      {
        id: "a.pending",
        kind: "action",
        does: "Record SETTLEMENT_PENDING. Captured and settled are different, and an outcome that depends on funds having actually arrived waits for the second",
        writes: [{ field: "payment_log", mode: "append" }],
        next: "w.settle",
      },
      {
        id: "w.settle",
        kind: "wait",
        until: ["settlement completes", "settlement fails"],
        onEvent: "c.settle-result",
        timeout: {
          after: "the settlement window",
          reason:
            "a settlement that never arrived is a mismatch between our state and the provider's, which is a reconciliation problem rather than a payment one",
        },
        onTimeout: "h.reconcile",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.settle-result",
        kind: "condition",
        asks: "Did settlement complete?",
        branches: [
          { label: "Settled", when: "the funds completed their movement", to: "h.satisfy" },
          { label: "Settlement failed", when: "the movement did not complete", to: "h.reconcile" },
        ],
      },
      {
        id: "h.satisfy",
        kind: "handoff",
        to: "FIN-136",
        on: "funds having completed the movement this system treats as authoritative",
        carries: ["the transaction, its amount and its currency", "the obligation it applies to"],
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "FIN-140",
        on: "a settlement that failed or never arrived",
        carries: [
          "the capture record and what settlement was expected",
          "the obligation, which has not been satisfied by a capture that did not settle",
        ],
      },
    ],
    guardrails: [
      "Authorized is not money captured.",
      "Captured is not necessarily settled.",
      "An irreversible outcome that depends on funds is not granted from an authorization where the business requires capture or settlement.",
    ],
    reusableRule:
      "Financial transaction states should reflect the actual movement commitment of funds rather than collapse authorization, capture and settlement into a generic success.",
  },

  /* ------------------------------------------------------------ FIN-134 */
  {
    id: "FIN-134",
    slug: "payment-failure-recovery",
    category: "financial",
    goal: "recovery-retry",
    channels: ["email", "in-app", "push", "sms", "whatsapp"],
    name: "Payment failure → classify → recover, alternate or exit",
    purpose:
      "Respond to the reason a payment actually failed, and keep the obligation alive while doing it.",
    entity: {
      scope: "the failed attempt, the obligation behind it and the customer relationship it belongs to",
      note: "Three things, and the failure touches only the first. The obligation stands and the relationship continues while recovery runs.",
    },
    distinctFrom: [
      {
        journey: "OPS-124",
        because:
          "OPS-124 is a generic technical retry against a transient fault. This makes a business recovery decision: what to ask the customer for, whether an alternative route exists, and what happens to the obligation if none of it works.",
      },
    ],
    entry: "t.failure",
    nodes: [
      {
        id: "t.failure",
        kind: "trigger",
        event: "authoritative_payment_failure",
        evidence: {
          requires: ["a payment system stating that the attempt failed, with whatever reason it gave"],
          insufficientAlone: [
            "a timeout, which establishes nothing about whether money moved",
          ],
          source: "authoritative",
        },
        next: "a.classify",
      },
      {
        id: "a.classify",
        kind: "action",
        does: "Classify the failure into the class the provider actually reported: temporary, insufficient funds, invalid method, expired method, authentication required, provider failure, policy decline, or unknown reason. A decline reason is never invented - telling someone their card had insufficient funds when the provider said only 'do not honour' is a checkable falsehood that sends them to fix the wrong thing",
        writes: [{ field: "payment_log", mode: "append" }],
        next: "c.class",
      },
      {
        id: "c.class",
        kind: "condition",
        asks: "What kind of failure was it?",
        branches: [
          {
            label: "Transient, safe to retry",
            when: "a temporary condition or a provider-side failure, with the same idempotency key still valid",
            to: "a.retry",
          },
          {
            label: "The customer can fix it",
            when: "insufficient funds, an invalid or expired method, or an authentication that was not completed",
            to: "a.corrective",
          },
          {
            label: "Declined, or no usable reason given",
            when: "a policy decline, or a decline whose reason cannot be turned into an instruction",
            to: "c.alternate",
          },
        ],
      },
      {
        id: "a.retry",
        kind: "action",
        does: "Retry within the bounded policy, using the same idempotency key so that a first attempt which did land can be absorbed rather than repeated",
        writes: [{ field: "payment_log", mode: "append" }],
        next: "w.recovery",
      },
      {
        id: "a.corrective",
        kind: "action",
        does: "Request the exact corrective action - update the method, complete the authentication, choose another method. Naming what to fix is the whole value of the classification, and a generic notice that payment failed makes the person guess. Provider risk detail and internal decline codes are not exposed",
        writes: [{ field: "payment_log", mode: "append" }],
        next: "w.recovery",
        execution: "communication",
      },
      {
        id: "c.alternate",
        kind: "condition",
        asks: "Is an alternative valid payment route available and permitted?",
        branches: [
          {
            label: "Alternative available",
            when: "another method or route exists and the customer and business rules allow it",
            to: "a.alternate",
          },
          {
            label: "Nothing further to offer",
            when: "no alternative route is available or permitted",
            to: "w.recovery",
          },
        ],
      },
      {
        id: "a.alternate",
        kind: "action",
        does: "Offer or use the alternative route according to the customer and business rules, as a new attempt with its own identifiers",
        writes: [{ field: "payment_log", mode: "append" }],
        next: "w.recovery",
      },
      {
        id: "w.recovery",
        kind: "wait",
        until: ["the obligation is satisfied", "the customer abandons the attempt"],
        onEvent: "c.recovered",
        timeout: {
          after: "the recovery window for this obligation",
          reason:
            "the window bounds how long recovery runs before the obligation's own consequences apply - it does not end the obligation, which continues regardless",
        },
        onTimeout: "c.next",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.recovered",
        kind: "condition",
        asks: "How did recovery end?",
        branches: [
          { label: "Satisfied", when: "a subsequent attempt discharged the obligation", to: "x.recovered" },
          { label: "Abandoned", when: "the customer stopped trying", to: "c.next" },
        ],
      },
      {
        id: "x.recovered",
        kind: "exit",
        state: "obligation satisfied through recovery",
        terminal: false,
        reEntry: "a future failure against a future obligation is its own instance",
      },
      {
        id: "c.next",
        kind: "condition",
        asks: "The obligation is unpaid after the recovery window - what does policy apply?",
        branches: [
          {
            label: "Grace period",
            when: "policy continues limited service while the obligation remains unresolved",
            to: "h.grace",
          },
          {
            label: "Overdue tracking",
            when: "the obligation moves to an overdue operational state without immediate consequence",
            to: "h.overdue",
          },
          {
            label: "Access restriction",
            when: "policy restricts capability while the obligation is unpaid",
            to: "h.restrict",
          },
        ],
      },
      {
        id: "h.grace",
        kind: "handoff",
        to: "TIM-65",
        on: "an unpaid obligation entering a grace period",
        carries: [
          "the obligation and the recovery already attempted",
          "the explicit fact that the commercial relationship has not ended - this is a payment problem",
        ],
      },
      {
        id: "h.overdue",
        kind: "handoff",
        to: "TIM-62",
        on: "an unpaid obligation becoming overdue",
        carries: ["the obligation, its due date and the failure history against it"],
      },
      {
        id: "h.restrict",
        kind: "handoff",
        to: "ACC-78",
        on: "policy restricting capability while an obligation is unpaid",
        carries: [
          "the obligation, so restoring access has something to check against",
          "the explicit instruction that the restriction is scoped to what the unpaid obligation covers",
        ],
      },
    ],
    guardrails: [
      "A payment failure is not a subscription cancellation.",
      "A decline reason is never invented. What the provider said is what the customer is told, or nothing specific is claimed.",
      "Retries are bounded.",
      "Sensitive provider and internal risk detail is not exposed.",
    ],
    reusableRule:
      "Payment recovery should respond to the actual failure class while preserving the underlying financial obligation until it is resolved.",
  },

  /* ------------------------------------------------------------ FIN-135 */
  {
    id: "FIN-135",
    slug: "unknown-payment-reconciliation",
    category: "financial",
    goal: "reconciliation-correction",
    channels: [],
    name: "Payment unknown → reconcile → confirm success or failure",
    purpose:
      "Find out what actually happened to a payment whose outcome we lost sight of, before anything is charged again.",
    entity: {
      scope: "the single payment attempt whose outcome could not be established",
      note: "One attempt. This is not a mismatch between records - it is one operation whose result we do not know, and the answer exists at the provider.",
    },
    distinctFrom: [
      {
        journey: "FIN-140",
        because:
          "Here one attempt's outcome is unknown and the provider can answer it. FIN-140 is where several records exist and disagree, which needs comparison and correction rather than a question.",
      },
    ],
    entry: "t.unknown",
    nodes: [
      {
        id: "t.unknown",
        kind: "trigger",
        event: "payment_outcome_undeterminable",
        evidence: {
          requires: [
            "a payment attempt whose outcome could not be authoritatively established - a timeout, an interrupted connection, an incomplete callback",
          ],
          source: "authoritative",
        },
        next: "a.preserve",
      },
      {
        id: "a.preserve",
        kind: "action",
        does: "Preserve the provider reference, the idempotency key, the amount, the target obligation and the last known state, and record PAYMENT_UNKNOWN. Unknown is not failed, and nothing downstream may treat it as such",
        writes: [{ field: "payment_log", mode: "append" }],
        next: "a.suppress",
      },
      {
        id: "a.suppress",
        kind: "action",
        does: "Suppress any automatic replacement payment. While the original may still have succeeded, initiating another is the single action that converts uncertainty into a duplicate charge - and the customer finds it before we do",
        writes: [{ field: "suppressed_sends", mode: "append" }],
        next: "a.query",
      },
      {
        id: "a.query",
        kind: "action",
        does: "Query the authoritative financial source for the operation's true state, using the provider reference and the idempotency key",
        writes: [{ field: "payment_log", mode: "append" }],
        next: "w.reconcile",
      },
      {
        id: "w.reconcile",
        kind: "wait",
        until: [
          "the provider confirms the payment succeeded",
          "the provider confirms the payment failed",
          "the customer initiates another payment attempt",
        ],
        onEvent: "c.found",
        timeout: {
          after: "the reconciliation round window",
          reason:
            "each round is bounded so an unresolved payment escalates to someone rather than being retried into by a process that has lost patience",
        },
        onTimeout: "c.bounded",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.found",
        kind: "condition",
        asks: "What was established?",
        branches: [
          {
            label: "It succeeded",
            when: "the provider confirms the funds moved",
            to: "a.apply-once",
          },
          {
            label: "It failed",
            when: "the provider confirms nothing moved",
            to: "h.failure",
          },
          {
            label: "The customer tried again",
            when: "another attempt arrived while this one was unresolved",
            to: "h.dedupe",
          },
        ],
      },
      {
        id: "a.apply-once",
        kind: "action",
        does: "Record PAYMENT_SUCCEEDED and apply it exactly once, reconciled against the obligation's current balance. A late success is applied against what the obligation is now rather than what it was when the attempt started - the balance moved while this was in flight",
        writes: [{ field: "payment_log", mode: "append" }],
        next: "h.satisfy",
      },
      {
        id: "h.satisfy",
        kind: "handoff",
        to: "FIN-136",
        on: "a late-confirmed payment success",
        carries: [
          "the attempt and its idempotency key",
          "the fact that this arrived late, so the current balance is what it applies against",
        ],
      },
      {
        id: "h.failure",
        kind: "handoff",
        to: "FIN-134",
        on: "a reconciliation establishing that the payment failed",
        carries: ["the confirmed failure and its reason", "the obligation, still outstanding"],
      },
      {
        id: "h.dedupe",
        kind: "handoff",
        to: "OPS-125",
        on: "a second attempt arriving while the first is unresolved",
        carries: [
          "both attempts, their identifiers and the unresolved state of the first",
          "the duplicate-charge risk, which is what makes correlation mandatory here rather than optimisation",
        ],
      },
      {
        id: "c.bounded",
        kind: "condition",
        asks: "Is another reconciliation round available within the bounded policy?",
        branches: [
          {
            label: "Round available",
            when: "the policy allows another query and the provider may yet answer",
            to: "a.query",
          },
          {
            label: "Rounds exhausted",
            when: "the attempt remains unresolved after the policy's rounds",
            to: "h.manual",
          },
        ],
      },
      {
        id: "h.manual",
        kind: "handoff",
        to: "external:finance-ownership",
        on: "a payment that remains unknown after bounded reconciliation",
        carries: [
          "everything known about the attempt and every query made",
          "the obligation and the customer, both of whom are waiting on an answer nobody has",
        ],
        suppresses: ["any replacement payment while the original remains unresolved"],
      },
    ],
    guardrails: [
      "Unknown is not failed.",
      "No replacement payment is initiated automatically while the original may still have succeeded.",
      "A customer retry during an unknown state is correlated and deduplicated rather than charged.",
      "A late success is reconciled against the obligation's current balance.",
    ],
    reusableRule:
      "Unknown payment outcomes require reconciliation before replacement attempts because uncertainty itself creates duplicate financial risk.",
  },

  /* ------------------------------------------------------------ FIN-136 */
  {
    id: "FIN-136",
    slug: "obligation-satisfaction",
    category: "financial",
    goal: "reconciliation-correction",
    channels: [],
    name: "Financial obligation satisfied → reconcile balance → release dependent state",
    purpose:
      "Apply a financial event to an obligation exactly once, and release only what actually depended on that obligation.",
    entity: {
      scope: "the obligation and the financial event being applied to it",
      note: "Applying is idempotent by key. The same event arriving twice moves the balance once, which is the difference between a balance and a running total of deliveries.",
    },
    entry: "t.satisfying",
    nodes: [
      {
        id: "t.satisfying",
        kind: "trigger",
        event: "authoritative_financial_event_against_obligation",
        evidence: {
          requires: [
            "an authoritative payment, credit or settlement that discharges some or all of an obligation",
          ],
          source: "authoritative",
        },
        next: "a.apply",
      },
      {
        id: "a.apply",
        kind: "action",
        does: "Apply the amount idempotently against the obligation, keyed so the same financial event arriving twice moves the balance once. Currency compatibility is checked before anything is netted - amounts in different currencies are not offset against each other",
        writes: [{ field: "obligation_log", mode: "append" }],
        next: "a.recalculate",
      },
      {
        id: "a.recalculate",
        kind: "action",
        does: "Recalculate the remaining balance, the obligation's status, any overpayment, and which dependent restrictions or holds rested on this obligation specifically",
        writes: [{ field: "obligation_log", mode: "append" }],
        next: "c.status",
      },
      {
        id: "c.status",
        kind: "condition",
        asks: "What does the recalculated balance show?",
        branches: [
          {
            label: "Fully satisfied",
            when: "the balance reaches zero",
            to: "a.satisfied",
          },
          {
            label: "Partially satisfied",
            when: "an amount remains outstanding",
            to: "a.partial",
          },
          {
            label: "Overpaid",
            when: "the amount applied exceeds what was owed",
            to: "h.overpayment",
          },
        ],
      },
      {
        id: "a.partial",
        kind: "action",
        does: "Record PARTIALLY_SATISFIED with the remaining balance stated explicitly. Partial is not paid, and a remainder that is implied rather than carried is one nobody can collect and nobody can dispute",
        writes: [{ field: "obligation_log", mode: "append" }],
        next: "x.partial",
      },
      {
        id: "x.partial",
        kind: "exit",
        state: "PARTIALLY_SATISFIED; the remaining balance is explicit and still outstanding",
        terminal: false,
        reEntry:
          "further financial events apply against the remaining balance. Restrictions that depended on this obligation stay in force, because it is not discharged",
      },
      {
        id: "h.overpayment",
        kind: "handoff",
        to: "external:overpayment-or-credit",
        on: "an amount applied exceeding what was owed",
        carries: [
          "the obligation, the amount applied and the excess, with its currency",
          "the fact that the obligation is satisfied and the excess is a separate financial position",
        ],
      },
      {
        id: "a.satisfied",
        kind: "action",
        does: "Record SATISFIED against the obligation",
        writes: [{ field: "obligation_log", mode: "append" }],
        next: "c.restriction",
      },
      {
        id: "c.restriction",
        kind: "condition",
        asks: "Does an existing restriction depend solely on this obligation?",
        branches: [
          {
            label: "Restriction rested on this",
            when: "a capability was restricted specifically because this obligation was unpaid",
            to: "h.restore",
          },
          {
            label: "No restriction depended on it",
            when: "nothing was withheld on account of this obligation",
            to: "x.satisfied",
          },
        ],
      },
      {
        id: "h.restore",
        kind: "handoff",
        to: "ACC-79",
        on: "an obligation whose payment removes the reason a capability was restricted",
        carries: [
          "the obligation and the restriction it caused",
          "the instruction to revalidate rather than replay - paying this does not restore capabilities that were suspended for their own separate reasons",
        ],
      },
      {
        id: "x.satisfied",
        kind: "exit",
        state: "SATISFIED; nothing else depended on it",
        terminal: false,
        reEntry:
          "a later adjustment or reversal against this obligation is its own financial event, applied to a discharged balance rather than an outstanding one",
      },
    ],
    guardrails: [
      "A payment success is never applied twice.",
      "Financial satisfaction does not automatically restore unrelated suspended capabilities.",
      "Partial payment is not full payment, and the remainder is carried explicitly.",
      "Amounts are not netted across incompatible currencies.",
    ],
    reusableRule:
      "Successful financial events should update the obligation balance exactly once and release only the states that actually depended on that obligation.",
  },

  /* ------------------------------------------------------------ FIN-137 */
  {
    id: "FIN-137",
    slug: "refund-request-decision",
    category: "financial",
    goal: "eligibility-qualification",
    channels: ["email", "task"],
    name: "Refund request → eligibility → approve, reject or review",
    purpose:
      "Turn a refund request into an authorised decision, without money moving on the request itself.",
    entity: {
      scope: "the refund request and the original transaction it is made against",
      note: "The request does not modify the original payment history. It creates a decision process alongside it.",
    },
    distinctFrom: [
      {
        journey: "FIN-138",
        because:
          "Approving a refund authorises the movement. FIN-138 performs it and confirms the money arrived, which fails independently and more often than the decision does.",
      },
    ],
    entry: "t.requested",
    nodes: [
      {
        id: "t.requested",
        kind: "trigger",
        event: "refund_requested",
        evidence: {
          requires: ["a refund requested against an identified original transaction"],
          insufficientAlone: [
            "dissatisfaction expressed about a purchase, which is feedback until it is made as a request",
          ],
          source: "declared",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the request id, the original transaction, the requested amount, the reason, the requester and the submission time. The original payment history is not modified by a request made against it",
        writes: [{ field: "refund_log", mode: "append" }],
        next: "c.scope",
      },
      {
        id: "c.scope",
        kind: "condition",
        asks: "Is the request valid and within the process scope?",
        branches: [
          {
            label: "Valid",
            when: "it identifies a real transaction, from someone entitled to ask, within any applicable window",
            to: "c.policy",
          },
          {
            label: "Out of scope",
            when: "it names no valid transaction, comes from someone with no standing, or falls outside the process entirely",
            to: "a.reject-scope",
          },
        ],
      },
      {
        id: "a.reject-scope",
        kind: "action",
        does: "Reject with the actual reason and whatever process does apply. A rejection that does not say why produces the next request rather than closing this one",
        writes: [{ field: "refund_log", mode: "append" }],
        next: "x.rejected",
        execution: "communication",
      },
      {
        id: "c.policy",
        kind: "condition",
        asks: "Is a refund eligibility policy defined for this transaction type?",
        branches: [
          {
            label: "Defined",
            when: "policy states what qualifies for a refund and on what terms",
            to: "c.eligible",
          },
          {
            label: "Not defined",
            when: "no policy covers this kind of refund",
            to: "h.undefined",
          },
        ],
      },
      {
        id: "h.undefined",
        kind: "handoff",
        to: "DEC-181",
        on: "a refund request with no governing eligibility policy",
        carries: [
          "the request and the original transaction",
          "the explicit fact that no eligibility rule was invented in order to decide it",
        ],
      },
      {
        id: "c.eligible",
        kind: "condition",
        asks: "What does the policy determine?",
        branches: [
          {
            label: "Eligible",
            when: "the policy's conditions are met deterministically",
            to: "a.approve",
          },
          {
            label: "Ineligible",
            when: "the policy rules it out deterministically",
            to: "a.reject",
          },
          {
            label: "Requires judgement",
            when: "the policy leaves this case to a decision rather than a rule",
            to: "a.review",
          },
        ],
      },
      {
        id: "a.reject",
        kind: "action",
        does: "Record REJECTED with the reason drawn from the policy that ruled it out",
        writes: [{ field: "refund_log", mode: "append" }],
        next: "x.rejected",
      },
      {
        id: "x.rejected",
        kind: "exit",
        state: "REJECTED; no money moves and the original transaction stands",
        terminal: false,
        reEntry:
          "a differently grounded request, or new evidence, is assessed on its own. A refund requested is not a refund owed",
      },
      {
        id: "a.review",
        kind: "action",
        does: "Record UNDER_REVIEW and gather whatever the decision requires. Nothing moves while it is under review",
        writes: [{ field: "refund_log", mode: "append" }],
        next: "w.decision",
        execution: "human",
      },
      {
        id: "w.decision",
        kind: "wait",
        until: ["a decision is recorded"],
        onEvent: "c.decision",
        timeout: {
          after: "the decision SLA",
          reason:
            "a refund request left undecided is a customer waiting on money with no answer, which produces a dispute that costs more than the refund",
        },
        onTimeout: "h.escalate",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.decision",
        kind: "condition",
        asks: "What was decided?",
        branches: [
          { label: "Approved", when: "the reviewer authorised the refund", to: "a.approve" },
          { label: "Rejected", when: "the reviewer declined it", to: "a.reject" },
        ],
      },
      {
        id: "h.escalate",
        kind: "handoff",
        to: "OWN-55",
        on: "a refund decision outliving its SLA",
        carries: ["the request, its age and what is holding the decision"],
      },
      {
        id: "a.approve",
        kind: "action",
        does: "Record APPROVED with the authorised amount and the authority that approved it. Approved authorises the movement and performs none of it",
        writes: [{ field: "refund_log", mode: "append" }],
        next: "h.execute",
        execution: "human",
      },
      {
        id: "h.execute",
        kind: "handoff",
        to: "FIN-138",
        on: "a refund authorised for execution",
        carries: [
          "the approved amount, its currency and the original transaction",
          "the explicit fact that nothing has moved yet",
        ],
      },
    ],
    guardrails: [
      "A refund requested is not a refund owed.",
      "A refund request does not modify the original payment history.",
      "Eligibility policy is never invented. Where none exists the decision goes to a person.",
    ],
    reusableRule:
      "A refund request creates a financial decision process; money should move only after the request reaches an authorized outcome.",
  },

  /* ------------------------------------------------------------ FIN-138 */
  {
    id: "FIN-138",
    slug: "refund-execution",
    category: "financial",
    goal: "delivery-confirmation",
    channels: [],
    name: "Refund approved → execute → confirm or reconcile",
    purpose:
      "Move the money and confirm it arrived, keeping that separate from having decided it should.",
    entity: {
      scope: "the approved refund and the original transaction it is issued against",
      note: "A refund is a new financial event rather than an edit to the original transaction, which stays historical throughout.",
    },
    entry: "t.approved",
    nodes: [
      {
        id: "t.approved",
        kind: "trigger",
        event: "refund_authorized_for_execution",
        evidence: {
          requires: ["a refund approved for a stated amount against a stated transaction"],
          source: "authoritative",
        },
        next: "a.submit",
      },
      {
        id: "a.submit",
        kind: "action",
        does: "Submit the refund under a stable operation identity and record REFUND_PENDING. The stable identity is what stops a retry or a redelivered response producing a second refund - and a duplicate refund is money that has to be asked for back",
        writes: [{ field: "refund_log", mode: "append" }],
        next: "w.outcome",
      },
      {
        id: "w.outcome",
        kind: "wait",
        until: ["the refund completes", "the refund fails"],
        onEvent: "c.outcome",
        timeout: {
          after: "the refund outcome window",
          reason:
            "a provider accepting the request is not the customer's funds having returned, and the gap between those two is where a replayed refund is created",
        },
        onTimeout: "a.unknown",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What did the refund do?",
        branches: [
          {
            label: "Completed in full",
            when: "the full approved amount returned to the customer",
            to: "a.reconcile",
          },
          {
            label: "Completed partially",
            when: "part of the approved amount returned",
            to: "a.partial",
          },
          {
            label: "Failed",
            when: "the provider reports the refund did not go through",
            to: "c.retry",
          },
        ],
      },
      {
        id: "a.reconcile",
        kind: "action",
        does: "Record REFUNDED and reconcile against the original transaction and the obligation balance. The original transaction stays historical - a refund is a new financial event and not an edit to the old one, and rewriting the original would remove the evidence that either happened",
        writes: [{ field: "refund_log", mode: "append" }],
        next: "x.refunded",
      },
      {
        id: "x.refunded",
        kind: "exit",
        state: "REFUNDED; funds confirmed returned and balances reconciled",
        terminal: false,
        reEntry: "a further refund against the same transaction is a new request with its own approval",
      },
      {
        id: "a.partial",
        kind: "action",
        does: "Record the partial refund and update the remaining refundable amount explicitly, so what is still owed back is carried rather than implied",
        writes: [{ field: "refund_log", mode: "append" }],
        next: "x.partial",
      },
      {
        id: "x.partial",
        kind: "exit",
        state: "partially refunded; the remaining refundable amount is explicit",
        terminal: false,
        reEntry: "the remainder is executed as its own operation against the recorded balance",
      },
      {
        id: "a.unknown",
        kind: "action",
        does: "Record the refund outcome as unknown and suppress any replay. Submitting again while this one may have completed produces a duplicate refund, which is the same failure as a duplicate charge pointing the other way",
        writes: [
          { field: "refund_log", mode: "append" },
          { field: "suppressed_sends", mode: "append" },
        ],
        next: "h.reconcile",
      },
      {
        id: "c.retry",
        kind: "condition",
        asks: "Is a retry safe within the bounded policy?",
        branches: [
          {
            label: "Safe and available",
            when: "the failure is transient and the operation identity guarantees no duplicate",
            to: "a.submit",
          },
          {
            label: "Not safe or exhausted",
            when: "the failure is not transient, or the retry budget is spent",
            to: "h.reconcile",
          },
        ],
      },
      {
        id: "h.reconcile",
        kind: "handoff",
        to: "FIN-140",
        on: "a refund that failed, could not be retried, or whose outcome is unknown",
        carries: [
          "the approved refund, the original transaction and every attempt made",
          "the customer's position, which is that a refund was approved and they have not received it",
        ],
      },
    ],
    guardrails: [
      "Approved is not refunded.",
      "A provider accepting the refund request is not the customer's funds having returned.",
      "A retry never creates a duplicate refund.",
      "The original transaction remains historical.",
    ],
    reusableRule:
      "Refund execution requires independent confirmation because approval authorizes the refund but does not prove funds were returned.",
  },

  /* ------------------------------------------------------------ FIN-139 */
  {
    id: "FIN-139",
    slug: "financial-dispute",
    category: "financial",
    goal: "risk-compliance",
    channels: [],
    name: "Financial dispute or chargeback → evidence → decision → reconcile",
    purpose:
      "Run a transaction-level dispute through the authority that decides it, without treating the claim as a finding.",
    entity: {
      scope: "the dispute and the specific transaction it contests",
      note: "The dispute is adjudicated by an external authority with its own deadline and its own evidence rules. Our part is representation, not decision.",
    },
    distinctFrom: [
      {
        journey: "FBK-47",
        because:
          "FBK-47 reviews a decision we made, under our own process. A chargeback is adjudicated by a card scheme or a regulator with power to move funds regardless of what we conclude, and missing its deadline decides it against us whatever the evidence says.",
      },
    ],
    entry: "t.opened",
    nodes: [
      {
        id: "t.opened",
        kind: "trigger",
        event: "financial_dispute_opened",
        evidence: {
          requires: [
            "a dispute or chargeback formally opened with the authority or provider that adjudicates it",
          ],
          insufficientAlone: [
            "a customer complaining about a charge, which is feedback until it is raised with the body that can reverse it",
          ],
          source: "authoritative",
        },
        next: "a.record",
      },
      {
        id: "a.record",
        kind: "action",
        does: "Record the dispute id, the transaction, the amount, the reason category, when it opened, the response deadline and the external authority handling it. A dispute being opened is not fraud confirmed and not a loss - it is a claim with a deadline, and most of them are confusion, a forgotten subscription or an unrecognised descriptor",
        writes: [{ field: "dispute_log", mode: "append" }],
        next: "a.evidence",
      },
      {
        id: "a.evidence",
        kind: "action",
        does: "Collect the evidence this dispute category actually requires, which the authority defines rather than we do",
        writes: [{ field: "dispute_log", mode: "append" }],
        next: "c.response",
      },
      {
        id: "c.response",
        kind: "condition",
        asks: "Is a response or representation allowed?",
        branches: [
          {
            label: "Allowed",
            when: "the process permits us to submit evidence before the deadline",
            to: "a.submit",
          },
          {
            label: "Not allowed",
            when: "the category or stage admits no representation",
            to: "w.decision",
          },
        ],
      },
      {
        id: "a.submit",
        kind: "action",
        does: "Submit before the deadline. A deadline missed is usually decided against us regardless of what the evidence would have shown, which makes the date more important than the argument",
        writes: [{ field: "dispute_log", mode: "append" }],
        next: "w.decision",
      },
      {
        id: "w.decision",
        kind: "wait",
        until: ["the authority returns a decision"],
        onEvent: "c.outcome",
        timeout: {
          after: "the authority's own decision horizon",
          reason:
            "the decision is not ours to make or to hurry, and an undecided dispute stays an unresolved financial state rather than defaulting either way",
        },
        onTimeout: "x.pending",
        windowExtendsOnEngagement: false,
      },
      {
        id: "x.pending",
        kind: "exit",
        state: "UNKNOWN / PENDING; the authority has not decided",
        terminal: false,
        reEntry:
          "the decision arriving later reconciles normally. Nothing is written off in either direction while the claim is live",
      },
      {
        id: "c.outcome",
        kind: "condition",
        asks: "What did the authority decide?",
        branches: [
          { label: "WON", when: "the original transaction stands", to: "a.reconcile" },
          { label: "LOST", when: "the funds are reversed against us", to: "a.reconcile" },
          { label: "PARTIAL", when: "part of the amount is reversed", to: "a.reconcile" },
          { label: "WITHDRAWN", when: "the claimant withdrew it", to: "a.reconcile" },
        ],
      },
      {
        id: "a.reconcile",
        kind: "action",
        does: "Reconcile the financial balance and the related obligation according to the outcome - won leaves the original transaction standing, lost reverses the funds and reopens what they had discharged, partial does both in proportion, withdrawn leaves everything as it was. In every case the dispute's own history is preserved: the final outcome does not overwrite the record of what was claimed, what was submitted and when",
        writes: [{ field: "dispute_log", mode: "append" }],
        next: "c.relationship",
      },
      {
        id: "c.relationship",
        kind: "condition",
        asks: "Does the outcome warrant action on the business relationship?",
        branches: [
          {
            label: "Warrants assessment",
            when: "a pattern or the outcome itself raises a question about the relationship",
            to: "h.risk",
          },
          {
            label: "Financial only",
            when: "the dispute is settled and says nothing about the relationship",
            to: "x.reconciled",
          },
        ],
      },
      {
        id: "h.risk",
        kind: "handoff",
        to: "RSK-192",
        on: "a dispute outcome raising a risk question that has not been answered",
        carries: [
          "the dispute and its outcome",
          "the explicit fact that a dispute is not a finding of wrongdoing - it is a signal to be evaluated, and most of them are not what they look like",
        ],
      },
      {
        id: "x.reconciled",
        kind: "exit",
        state: "dispute decided and reconciled; history preserved",
        terminal: false,
        reEntry: "a further dispute on the same transaction is its own instance with its own deadline",
      },
    ],
    guardrails: [
      "A dispute opened is not fraud confirmed.",
      "A dispute opened is not a dispute lost.",
      "The dispute history is not overwritten by the final outcome.",
      "A generic decision appeal is not a substitute for transaction-level dispute mechanics.",
    ],
    reusableRule:
      "Financial disputes remain unresolved financial states until the governing authority returns an outcome that can be reconciled against the original transaction.",
  },

  /* ------------------------------------------------------------ FIN-140 */
  {
    id: "FIN-140",
    slug: "financial-reconciliation",
    category: "financial",
    goal: "reconciliation-correction",
    channels: [],
    name: "Financial reconciliation → detect mismatch → correct or escalate",
    purpose:
      "Restore financial consistency by explaining the difference and adjusting it, never by editing the record that is inconvenient.",
    entity: {
      scope: "the set of financial records that disagree - transactions, obligations, refunds and settlement state together",
      note: "Several records, several systems. What makes this different from an unknown outcome is that everyone has an answer and the answers do not match.",
    },
    distinctFrom: [
      {
        journey: "FIN-135",
        because:
          "FIN-135 has one attempt and no answer, and the provider can supply one. Here every system has an answer and they disagree, which needs comparison, an authority rule and an explicit adjustment.",
      },
    ],
    entry: "t.mismatch",
    nodes: [
      {
        id: "t.mismatch",
        kind: "trigger",
        event: "material_financial_mismatch_detected",
        evidence: {
          requires: [
            "a material inconsistency across financial records: a payment succeeded with the obligation still open, a refund completed with the balance unchanged, a provider settlement differing from local state, a duplicate charge, a missing transaction, or an incorrect partial balance",
          ],
          source: "authoritative",
        },
        next: "a.collect",
      },
      {
        id: "a.collect",
        kind: "action",
        does: "Collect the authoritative records from every relevant system rather than reasoning from the one that raised the alarm",
        writes: [{ field: "reconciliation_log", mode: "append" }],
        next: "a.compare",
      },
      {
        id: "a.compare",
        kind: "action",
        does: "Compare transaction identifiers, amounts, currency, statuses, timestamps, obligation allocations, refunds and credits, and settlement state. Amounts in different currencies are not compared or netted - a mismatch across currencies is a context error rather than a discrepancy, and resolving it as one produces a balance that is confidently wrong",
        writes: [{ field: "reconciliation_log", mode: "append" }],
        next: "c.correction",
      },
      {
        id: "c.correction",
        kind: "condition",
        asks: "What can be established from the records?",
        branches: [
          {
            label: "A deterministic correction",
            when: "the authoritative records identify what the true state is and what the difference was",
            to: "c.policy",
          },
          {
            label: "External confirmation needed",
            when: "the provider holds the answer and has not supplied it",
            to: "w.provider",
          },
          {
            label: "Cannot be safely resolved",
            when: "the records disagree in a way the evidence does not settle - and a newer record is not automatically the correct one",
            to: "a.unresolved",
          },
        ],
      },
      {
        id: "w.provider",
        kind: "wait",
        until: ["the provider confirms the authoritative state"],
        onEvent: "c.policy",
        timeout: {
          after: "the reconciliation window",
          reason:
            "an unreconciled financial position is a balance nobody can rely on, and waiting past the window turns it into a permanent one",
        },
        onTimeout: "a.unresolved",
        windowExtendsOnEngagement: false,
      },
      {
        id: "c.policy",
        kind: "condition",
        asks: "Does an accounting policy cover this correction?",
        branches: [
          {
            label: "Covered",
            when: "policy states how this kind of difference is adjusted and against what",
            to: "a.correct",
          },
          {
            label: "Not covered",
            when: "no accounting policy addresses it",
            to: "a.unresolved",
          },
        ],
      },
      {
        id: "a.correct",
        kind: "action",
        does: "Apply the correction idempotently as an explicit adjustment, preserving the adjustment history. A mismatch is never fixed by deleting the inconvenient transaction - the correction is a new record that explains the difference, and the original stays so the explanation has something to refer to",
        writes: [{ field: "reconciliation_log", mode: "append" }],
        next: "a.verify",
      },
      {
        id: "a.verify",
        kind: "action",
        does: "Verify the final financial state balances according to the defined accounting and business invariants",
        writes: [{ field: "reconciliation_log", mode: "append" }],
        next: "c.balanced",
      },
      {
        id: "c.balanced",
        kind: "condition",
        asks: "Does the corrected state balance?",
        branches: [
          { label: "Balanced", when: "every invariant holds after the adjustment", to: "x.reconciled" },
          {
            label: "Still not balanced",
            when: "the correction did not close the difference, or opened another",
            to: "a.unresolved",
          },
        ],
      },
      {
        id: "x.reconciled",
        kind: "exit",
        state: "reconciled through an explicit, auditable adjustment",
        terminal: false,
        reEntry: "a further mismatch on the same records is its own reconciliation, with this adjustment in the history",
      },
      {
        id: "a.unresolved",
        kind: "action",
        does: "Record FINANCIAL_RECONCILIATION_REQUIRED, naming exactly which records disagree and by how much. Accounting policy is not invented to close it - an unexplained difference stated plainly is worth more than a resolved one nobody can justify",
        writes: [{ field: "reconciliation_log", mode: "append" }],
        next: "h.finance",
      },
      {
        id: "h.finance",
        kind: "handoff",
        to: "external:finance-ownership",
        on: "a financial difference that cannot be safely resolved",
        carries: [
          "every record collected, with its source, amount, currency and timestamp",
          "the difference itself, and the invariant it breaks",
        ],
      },
    ],
    guardrails: [
      "A financial mismatch is never fixed by deleting inconvenient transaction history.",
      "The newest record is not automatically the correct one.",
      "Corrections are explicit adjustments rather than silent rewrites.",
      "Accounting policy is never invented.",
    ],
    reusableRule:
      "Financial reconciliation restores consistency by explaining and correcting mismatches through authoritative transaction history rather than rewriting financial history.",
  },
];
