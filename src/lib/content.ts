export type Lang = "en" | "tr";

export const copy = {
  en: {
    nav: { about: "About", aboutHref: "/about", lab: "Lab", labHref: "/lab", calculators: "Calculators", calculatorsHref: "/calculators", blog: "Blog", blogHref: "/blog", stack: "Stack", stackHref: "/stack", contact: "Contact", contactHref: "/contact", cta: "Get in touch", lang: "TR", langHref: "/tr" },
    hero: {
      line1: "Growth you can measure.",
      line2: "Products that keep users.",
      lead: "I'm Ali Demirbaş, a growth marketer for mobile products. I build acquisition, CRM and lifecycle programs on data - not guesswork.",
      sub: "Currently leading mobile app growth at Aksigorta in Istanbul, after growth roles at Vodafone, Getir and Wingie Enuygun Group.",
      ctaPrimary: "Get in touch",
      ctaSecondary: "LinkedIn",
    },
    /* Home page only: the spec plate beside the hero, the ranked "what I do"
       block, and the calculators band. The hero's own headline and lead stay
       in `hero` above; nothing here restates them. */
    home: {
      spec: [
        { label: "Now", value: "Mobile App Growth Lead, Aksigorta" },
        { label: "Before", value: "Vodafone, Getir, Wingie Enuygun Group" },
        { label: "Years", value: "7+ in digital marketing and growth" },
        { label: "Works on", value: "Acquisition, CRM, lifecycle, measurement, CRO" },
        { label: "Based in", value: "Istanbul, works in English and Turkish" },
      ],
      work: {
        eyebrow: "What I do",
        title: "Most growth problems are measurement problems wearing a costume.",
        primaryLabel: "Primary",
        primary: {
          title: "Measurement that survives an audit",
          body:
            "GA4 and GTM event design, Adjust MMP configuration, and the reconciliation work that starts when two platforms report two different numbers for the same week. What you get is a taxonomy your team can query, definitions everyone agrees on, and dashboards that answer the question that was asked.",
        },
        rest: [
          {
            title: "Lifecycle and CRM programs",
            body: "Onboarding, retention and winback programs across email, SMS, push and in-app, written as state machines: what starts a journey, where it branches, how long it waits, and which lifecycle owns the person next.",
          },
          {
            title: "Paid acquisition",
            body: "Mobile user acquisition read through the same measurement setup as everything else: Adjust MMP attribution, GA4 and GTM, so a channel's reported number and the number you can reconcile are the same number.",
          },
          {
            title: "Experimentation and CRO",
            body: "One variable per test, a stated stopping rule, and a written note on what would invalidate the result.",
          },
        ],
      },
      calc: {
        eyebrow: "Calculators",
        title: "Marketing math, answered in one screen.",
        intro:
          "Free calculators for the numbers growth teams argue about: CAC payback, LTV, ROAS, retention, sample size and test duration. No account, no export gate.",
        countSuffix: "tools live right now.",
        more: "Open all calculators",
      },
      labMore: "Open the full archive",
    },
    lab: {
      label: "Lab",
      title: "Things I've been building",
      // REDESIGN ROUND (LabIndexPage.tsx): rewritten for the new title ->
      // tags -> proof -> description -> CTA hierarchy. `tags` is now PURE
      // semantic taxonomy (no numbers mixed in) and `proof` is a single,
      // separately-rendered quantitative highlight - `null` where a
      // project genuinely has none (Google Ads Explorer). Every number
      // still traces to something already established real elsewhere in
      // this codebase: 26/9 from claude-lifecycle's own README, 211 from
      // the real ab-tests.json count, 11 from dashboard-builder's own
      // templates, 75+ from numerspace.com's real tool count - none of
      // that changed, only which of it surfaces on this page did. The
      // Journey Library's proof still uses the {count}/{categories}
      // template tokens (withLibraryCount fills them at render), not a
      // hardcoded "255" - same live-derivation discipline as its desc.
      // Link labels are standardized site-wide per the new CTA system:
      // "Open the project page" for the one internal route each project has (a
      // project with no internal page just skips it), "GitHub"/"Live
      // demo" for external secondaries, "Visit Numerspace" for the one
      // external-only product. `tags` is consumed ONLY by
      // LabIndexPage.tsx (verified - not by SiteFooter or the header's
      // LabNavDropdown, which only read name/desc/links), so this
      // reshape doesn't touch either of those.
      intro: "Open-source tools and experiments built around problems I kept running into. Mostly growth, lifecycle and analytics. Occasionally something else.",
      projects: [
        {
          name: "Lifecycle Marketing Journey Builder",
          slug: "claude-lifecycle",
          desc: "Turns the customer signals you already track into lifecycle journeys you can actually trigger, measure and improve.",
          tags: ["Lifecycle", "CRM", "Claude Code"],
          proof: "26 journey patterns",
          links: [
            { label: "Open the project page", href: "/lab/claude-lifecycle" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/claude-lifecycle" },
            { label: "Live demo", href: "https://ali-demirbas.github.io/claude-lifecycle/demo/journey-canvas.html" },
          ],
        },
        {
          name: "Canonical Journey Library",
          slug: "lifecycle-card-archive",
          desc: "A library of {count} reusable lifecycle journeys covering activation, retention, risk, consent, incidents and subscriptions.",
          tags: ["Lifecycle", "Orchestration"],
          proof: "{count} journeys · {categories} categories",
          links: [{ label: "Open the project page", href: "/lab/journeys" }],
        },
        {
          name: "A/B Test Playbook",
          slug: "ab-test-playbook",
          desc: "211 real-world A/B test scenarios with the hypothesis, primary metric, guardrails and statistical checks needed to run them properly.",
          tags: ["Experimentation", "CRO", "Claude Code"],
          proof: "211 scenarios",
          links: [
            { label: "Open the project page", href: "/lab/ab-testing" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/ab-test-playbook" },
          ],
        },
        {
          name: "Marketing Dashboard Builder",
          slug: "dashboard-builder",
          desc: "Turns messy marketing exports into validated, comparable metrics and the dashboards built on them.",
          tags: ["Analytics", "Data Quality", "Claude Code"],
          proof: "11 dashboard templates",
          links: [
            { label: "Open the project page", href: "/lab/dashboard-builder" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/dashboard-builder" },
          ],
        },
        {
          name: "Google Ads Change History Explorer",
          slug: "google-ads-change-history-dashboard",
          desc: "Turns Google Ads change history into a searchable dashboard - the exact campaign, category, old value, new value and timestamp behind every change.",
          tags: ["Google Ads", "Analytics", "Python"],
          proof: "Zero dependencies · 57 self-tests",
          links: [
            { label: "Open the project page", href: "/lab/google-ads-change-history-dashboard" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/google-ads-change-history-dashboard" },
          ],
        },
        {
          name: "Numerspace",
          slug: "numerspace",
          desc: "Free calculators for marketing, finance, health, career and everyday decisions. No account, no paywall.",
          tags: ["Web App", "Calculators"],
          // Was "75+ tools" - stale. numerspace.com's own sitemap lists 97
          // calculator pages per language across 13 tool-bearing categories
          // (blog posts excluded); counted, not taken from the site's own
          // "140+" marketing line.
          proof: "97 calculators · 13 categories",
          links: [
            { label: "Open the project page", href: "/lab/numerspace" },
            { label: "Visit Numerspace", href: "https://www.numerspace.com" },
          ],
        },
      ],
      shell: {
        backToSite: "Back to site",
      },
      page: {
        title: "Canonical Journey Library",
        intro:
          "{count} domain-neutral lifecycle state machines across {categories} categories. Search, or filter by goal - each entry is a graph, not a sequence.",
        searchPlaceholder: "Search journeys...",
        goalLabel: "Goal",
        allGoals: "All goals",
        removeFilterLabel: "Remove {label} filter",
        clearAll: "Clear all",
        results: "journeys",
        empty: "Nothing matches those filters.",
        nodesLabel: "nodes",
        /* vNext practitioner view labels - the section names of the touch
           plan a migrated Customer Journey renders above its graph. */
        practitioner: {
          trigger: "Trigger",
          notEnough: "Not enough on its own",
          entity: "Entity",
          instanceKey: "instance",
          whoEnters: "Who enters",
          suppressedWhen: "Suppressed when",
          orchestration: "Recommended orchestration",
          onClassification: "sent on classification - no wait before it",
          cancelOn: "cancelled by",
          recheck: "re-read before sending",
          checks: "checks",
          mandatory: "mandatory",
          priority: "priority",
          priorityReason: "why this priority",
          destination: "destination",
          boundTo: "bound to",
          mustNotClaim: "must not claim",
          after: "after",
          channelRoles: "Channel roles",
          fallback: "delivery fallback",
          stopsWhen: "Stops when",
          handoff: "handoff",
          configure: "Configure",
          requiredData: "Required data",
          events: "Semantic events to map",
          attributes: "Attributes",
          optional: "optional",
          collision: "Collision & priority",
          pressureClass: "pressure class",
          localCap: "local cap",
          cooldown: "cooldown",
          competition: "competition",
          mandatoryTouches: "mandatory touches",
          noAction: "No action when",
          noActionNote: "the suppressions above are recorded outcomes, never a fallback to another channel",
          measurement: "Measurement",
          journeyOutcome: "journey outcome",
          businessOutcome: "business outcome",
          scope: "observed",
          self: "in this journey",
          through: "through",
          until: "until",
          attribution: "attribution",
          holdout: "holdout",
          guardrails: "guardrails",
          presets: "Presets",
          technical: "Technical logic",
          preset: "Preset",
          presetOf: "preset of",
          presetOverrides: "sets",
          presetNoOverrides: "keeps every default of its parent; only the destination and the vocabulary differ",
          relative: { trigger: "after the trigger", "previous-touch": "after the previous touch", attribute: "relative to" },
          roles: { "in-session": "in-session", "low-friction": "low-friction", persistent: "persistent", urgent: "urgent", human: "human" },
          labels: { CANONICAL_RULE: "canonical rule", RECOMMENDED_DEFAULT: "recommended default", CONFIG_REQUIRED: "config required", OPTIONAL_STRATEGY: "optional strategy" },
        },
        /* The canvas caption's own count words. Singular/plural pairs rather
           than one invariant form, because a journey really can carry exactly
           one handoff or one exit - `nodesLabel` above gets away with a single
           form only because no journey has one node. Turkish takes no plural
           after a numeral, so both entries there are deliberately identical. */
        decisionsLabel: ["decision", "decisions"],
        exitsLabel: ["exit", "exits"],
        handoffsLabel: ["handoff", "handoffs"],
        entityLabel: "Entity",
        competesLabel: "Competes",
        distinctLabel: "Distinct from",
        preemptedLabel: "Pre-empted by",
        guardrailsLabel: "Guardrails",
        ruleLabel: "Reusable rule",
        terminalLabel: "terminal",
        close: "Close",
        backToLibrary: "All journeys",
        mergedNote:
          "{from} was merged into {to}. That id is no longer a journey of its own; what it covered lives here.",
        canvas: {
          entry: "Entry",
          zoomIn: "Zoom in",
          zoomOut: "Zoom out",
          fitToView: "Fit to view",
          reset: "Reset zoom",
        },
      },
      /* Two dedicated child list pages under /lab/journeys, splitting the
         same JOURNEY_ROWS by whether a journey's own work ever reaches a
         person (canonical-view.ts's COMMUNICATION_JOURNEY_ROWS /
         INTERNAL_JOURNEY_ROWS) - added alongside the full unified list
         above, not replacing it. All other list microcopy (search
         placeholder, goal filter, empty state, card labels) is shared from
         `page` above; only title/intro/crumb differ per split. */
      /* The /lab/journeys HUB, rebuilt (2026-09) in the shape of the
         /lab/claude-lifecycle product page: a claim, one real artifact as
         its witness, the two halves, three schema stories, the library
         spread, one dark plate. Every {count}/{categories} is filled by
         withLibraryCount from the live library (the Customer Journeys
         surface - src/lib/public-corpus.ts) - nothing here is a typed
         number, and no public copy states a rule count (2026-09-05). */
      journeysHub: {
        eyebrow: "Lab / Canonical Journey Library",
        title: "{count} lifecycle state machines. Every one a graph you can read.",
        sub: "Domain-neutral journeys across {categories} categories. Each one makes explicit what starts it, where it branches, how long it waits, what stops it, and which lifecycle owns the person next.",
        ctaCommunication: "Customer journeys",
        proof: ["Domain-neutral", "Graphs, not sequences", "No message copy"],
        split: {
          eyebrow: "Where to start",
          title: "One way in, two supporting surfaces underneath.",
          body: "Customer journeys reach a person - a touch plan, channel roles, a contact model. Every journey also reads two supporting surfaces, the silent lifecycle states and the runtime mechanisms underneath - open from the journey itself, or browse them on their own below.",
        },
        stories: {
          eyebrow: "What the schema enforces",
          title: "Three things every journey has to say.",
        },
        final: {
          eyebrow: "Start reading",
          title: "Pick a surface and open a journey.",
          body: "Customer journeys open on their practitioner view; the two supporting surfaces open on the graph. Every surface searches and filters by category and goal.",
        },
      },
      journeysSplit: {
        /* The three PUBLIC product surfaces. Labels are the practitioner's
           words; the classification itself is read from each journey by
           src/canonical/surface.ts, never kept here. A fourth surface,
           "operational-workflows", was archived 2026-09-05 - see
           src/lib/public-corpus.ts and archive/operational-workflows/. */
        surfaceLabels: {
          "customer-journeys": "Customer journeys",
          "lifecycle-states": "Lifecycle states",
          "runtime-mechanisms": "Runtime mechanisms",
        },
        surfaceBlurbs: {
          "customer-journeys": "Journeys whose own actions reach a customer - each with a touch plan, channel roles, a contact model and a measurement decision a practitioner can implement without inventing the cadence.",
          "lifecycle-states": "Silent customer lifecycle states: the state models the communicating journeys depend on. Nothing here sends anything; these are dependencies, not campaigns.",
          "runtime-mechanisms": "The machinery every journey runs on - send eligibility, contactability, delivery recovery, retry, cooldown. Contracts, not customer journeys.",
        },
        surfaces: {
          "customer-journeys": {
            title: "Customer journeys",
            intro: "{count} customer journeys and {presets} practitioner presets - each one reaches a customer, by message or by routing the work to a person. Every journey opens on its practitioner view - trigger, who enters, the touch plan with its timing and channel roles, what stops it, what to configure, what to measure - with the graph underneath as the technical logic. Search by the names you already use.",
          },
          "lifecycle-states": {
            title: "Lifecycle states",
            intro: "{count} silent customer lifecycle states. They send nothing: they hold the state a communicating journey reads, re-reads and hands to. Browse them as dependencies and linked supporting logic, not as campaigns to launch.",
          },
          "runtime-mechanisms": {
            title: "Runtime mechanisms",
            intro: "{count} runtime mechanisms - the contracts customer journeys rely on for send eligibility, contactability, delivery failure, retry and cooldown. Listed as supporting architecture, not as journeys.",
          },
        },
        presetsTitle: "Presets",
        presetsIntro: "Named specialisations of a canonical journey: the same graph, the same touches and exits, with config values, a destination and vocabulary set for a recognisable use case. A preset opens its parent with those values applied.",
        presetBadge: "Preset",
        presetOf: "preset of",
        /* The hub's Split() section - heading over the two secondary
           surfaces, presented smaller than Customer Journeys because
           neither is a thing a practitioner browses to on its own (see
           journeysSplit.surfaceBlurbs). Both stay fully live, linked and
           searchable at their existing routes. (The fourth surface,
           Operations, was archived 2026-09-05 - archive/operational-
           workflows/site-copy.json holds its strings verbatim.) */
        referenceStrip: "Also part of the library - opened from a journey, not usually browsed on their own",
        silentBadge: "Silent state",
        mechanismBadge: "Mechanism",
        browseAll: "Browse all {count} journeys",
        showMore: "Show more ({count})",
        showLess: "Show less",
        /* Singular/plural pair, same convention (and same reason) as
           `page.decisionsLabel` above: grouping by Goal produces real
           groups of exactly one - 5 of the 22 communication groups - and
           "1 journeys" is wrong where "281 journeys" never was. */
        journeysLabel: ["journey", "journeys"],
        /* Gallery controls. `internalBadge` is the card marker for a journey
           with no channels - it has to read as a statement ("this one
           reaches nobody"), not as a missing value. */
        internalBadge: "Internal",
        /* Customer Journeys only - the 3 journeys that reach a customer by
           routing the work to a person (sales, task) rather than by
           message. Prepended to the card's own Sales/Task channel badge,
           not a replacement for it - see isHumanRoutingRow in
           canonical-view.ts. */
        humanRoutingBadge: "Human routing",
        categoryFilterLabel: "Category",
        allCategories: "All categories",
        channelFilterLabel: "Channel",
        allChannels: "All channels",
      },
    },
    about: {
      metaTitle: "About - Ali Demirbaş",
      metaDesc: "Ali Demirbaş, Mobile App Growth Lead at Aksigorta; before that Vodafone, Getir and Wingie Enuygun Group. Acquisition, CRM, lifecycle and measurement for mobile products.",
      eyebrow: "About",
      moreLink: "More about me",
      // Home page teaser only - kept separate from `lead` below (the
      // /about page's own opening line) so editing one doesn't change
      // the other; the two pages make different first impressions on
      // purpose.
      teaserLead:
        "I have worked on acquisition, CRM and measurement for an insurer, a telco, a rapid-commerce app and a travel group: products with very different business models and the same need for numbers that hold up. I treat marketing as iterative work on accurate data, one test at a time.",
    },
    stack: {
      metaTitle: "Stack - Ali Demirbaş",
      metaDesc: "The tools Ali Demirbaş instruments, queries and optimizes growth with every day.",
      eyebrow: "Stack",
      title: "Stack",
      sub: "Tools I use to design, build, measure and grow.",
      // Home page teaser only - the /stack page keeps its own title/sub above.
      homeTitle: "Tools I use",
      homeIntro: "The tools behind the experiments, the tracking, the analysis and the reporting.",
      homeMore: "See the full stack",
    },
    contact: {
      metaTitle: "Contact - Ali Demirbaş",
      metaDesc: "Reach Ali Demirbaş by email or connect on LinkedIn.",
      eyebrow: "Contact",
      title: "Let's get in touch.",
      sub: "Happy to talk about growth, products, or anything on this site.",
      linkedinLabel: "Connect on LinkedIn",
      emailPill: "E-Mail",
      reasonsTitle: "What brings you here",
      reasons: [
        { title: "Just saying hello", desc: "Want to connect or introduce yourself." },
        { title: "An idea or conversation", desc: "Growth, lifecycle, experimentation, measurement, or something else worth a conversation." },
        { title: "A question", desc: "About a calculator, journey pattern, open-source project, or anything else on this site." },
      ],
      scheduleTitle: "Schedule a call",
      scheduleSub: "Book a 30 minute intro call.",
      formTitle: "Send a message",
      formName: "Name",
      formEmail: "Email",
      formCompany: "Company website (optional)",
      formSubject: "Subject",
      formMessage: "Your message",
      formSubmit: "Open in email",
      formNote: "Opens a pre-filled draft in your email app - this site doesn't send your message directly.",
    },
    /* Journey Builder PRODUCT PAGE (/lab/claude-lifecycle). New page this
       round - the project previously existed only as a Lab index card
       pointing at GitHub. Every number this copy refers to is derived from
       the canonical library at build time (journey-marketing.ts), never
       typed in here, and every quoted field (trigger events, branch
       labels, timeout reasons, handoff payloads) is read straight off the
       real journey record rather than paraphrased. */
    journeyBuilder: {
      metaTitle: "Lifecycle Marketing Journey Builder - Ali Demirbaş",
      metaDesc: "A canonical library of lifecycle journeys as state machines: triggers, branches, waits, handoffs and exits - not campaign templates.",
      eyebrow: "Lab / Journey Builder",
      title: "Lifecycle journeys as state machines, not campaign templates.",
      sub: "Every journey here is a graph: what starts it and what deliberately doesn't, where it forks and what each arm means, how long it waits and what happens when that runs out, and which lifecycle owns the person next.",
      proof: ["Open source", "Claude Code plugin", "Nothing to sign up for"],
      canvas: {
        nodes: "nodes",
        rejoins: "rejoins at Reconcile",
      },
      scale: {
        journeys: "canonical journeys",
        categories: "categories",
        nodes: "nodes",
        kinds: "node types",
      },
      story1: {
        eyebrow: "Triggers",
        title: "It starts on evidence, or it doesn't start.",
        body: "Most bad lifecycle automation is a journey that fired on one weak signal. Every trigger here names what it needs and, separately, the lookalike signals that are not enough on their own.",
        caption: "Trigger evidence",
        requires: "Requires",
        insufficient: "Insufficient alone",
      },
      story2: {
        eyebrow: "Branching",
        title: "Every fork has both arms named.",
        body: "A condition with one arm is a filter wearing a decision's clothes: it hides what happens to everyone who fails it. So a condition here carries at least two branches, each with the real rule that routes into it.",
        caption: "A real fork",
        conditionsLabel: "conditions in the library",
        note: "Neither arm is a dead end: both route to a named node.",
      },
      story3: {
        eyebrow: "Time",
        title: "Waiting is a decision with a deadline.",
        body: "A wait with no timeout strands people on an event that may never arrive. A timeout with nowhere to go is an exit pretending to be patience. Every wait here names both arms and says whether activity pushes the deadline back.",
        caption: "One wait, both arms",
        waitsLabel: "waits in the library",
        opens: "Wait opens",
        onEvent: "On event",
        onTimeout: "On timeout",
        note: "A bounded window that any engagement extends is not bounded.",
      },
      library: {
        eyebrow: "The library",
        title: "{count} journeys. Built to be read.",
        body: "Filed by category, each one a graph you can open and follow node by node. They are domain-neutral state machines, not sector templates; the distinction is what keeps two journeys from being the same journey twice.",
        cta: "Browse the journey library",
        nodes: "nodes",
        moreCategories: "more",
      },
      whyDifferent: {
        eyebrow: "Why claude-lifecycle",
        title: "Three decisions the engine makes before it writes a journey",
        feature1: {
          title: "Data quality is scored, not assumed",
          body: "A 0-100 Data Quality Score decides journey depth before a single journey is written: under 40 buys simple 3-5 step flows, 40-69 standard 4-7 step flows with one branch, 70+ unlocks branched 7-12 step behavioral journeys. The same portfolio never ships to a three-event startup and a mature e-commerce store.",
        },
        feature2: {
          title: "A portfolio, not a listicle",
          body: "Eligibility is computed per pattern from required-event signatures across the engine's documented pattern library - abandoned cart, trial conversion, winback and more - each scaling its own depth and channels to what your data actually supports. What your data can't support yet becomes a tracking plan naming exactly which event unlocks it, not a locked feature.",
        },
        feature3: {
          title: "Copy is an engineered artifact",
          body: "Every channel carries hard limits, not house style guesses: email subject 20-50 characters, SMS 160 GSM-7 characters, push title 40 / body 120. A reviewer agent checks each message against its channel's rules before you see it.",
        },
      },
      carousel: {
        eyebrow: "The pattern engine",
        title: "One engine, a different portfolio for every business",
        body: "26 documented blueprints are the knowledge base, not a fixed catalog - each one scales its own depth (3 to 12 steps), branches and channels to what your data actually supports, so no two businesses get the same output. Three are worked out below exactly as the engine's own knowledge base defines them.",
      },
      faq: {
        eyebrow: "FAQ",
        title: "Frequently asked",
        items: [
          {
            q: "What is claude-lifecycle?",
            a: "An open-source library that structures customer journeys as explicit states, branches, waits, handoffs and exits, so lifecycle planning does not start from a blank canvas.",
          },
          {
            q: "Is claude-lifecycle a journey builder or a journey library?",
            a: "Primarily a library. The journeys define lifecycle logic and reusable patterns that you adapt to your own tools, channels and data model.",
          },
          {
            q: "What does a journey contain?",
            a: "Triggers, conditions, actions, waits, handoffs and exits. Together they make entry logic, branching, timing, transitions and terminal outcomes explicit.",
          },
          {
            q: "How many journeys are included?",
            a: "The current library contains {count} lifecycle journeys organized across {categories} categories.",
          },
          {
            q: "Can I adapt the journeys to my own product?",
            a: "They are starting points, not fixed implementations. Adapt triggers, conditions, timing and downstream actions; keep the lifecycle logic.",
          },
          {
            q: "What is a handoff?",
            a: "A handoff transfers lifecycle state from one journey to another and names what is carried forward, so the relationship between journeys is visible instead of implied.",
          },
          {
            q: "How does validation work?",
            a: "Validation checks the structural rules: entry states, condition branches, bounded waits, handoffs and explicit exits. It catches incomplete lifecycle logic before implementation.",
          },
          {
            q: "How do I use claude-lifecycle?",
            a: "Open the GitHub repository, read the journeys, and use the project with Claude Code to adapt and implement the patterns for your own product.",
          },
        ],
      },
      pageCta: {
        eyebrow: "OPEN SOURCE · GITHUB",
        title: "Build lifecycle logic from a stronger starting point.",
        primary: "View on GitHub",
        secondary: "Open the live demo",
      },
    },
    abTesting: {
      metaTitle: "A/B Test Playbook - Ali Demirbaş",
      metaDesc: "{count} real growth-test scenarios for Claude Code: what to test, which KPI to track, what not to do.",
      eyebrow: "Lab / A/B Testing",
      title: "An A/B test engine that won't let you skip the guardrail.",
      sub: "ab-test-playbook is an open-source Claude Code plugin built from 211 real e-commerce, mobile app and SaaS growth-test scenarios. It helps you pick a scenario that fits where a user is in their journey, keeps new ones disciplined to one variable at a time, and runs the real statistics instead of eyeballing significance.",
      install: {
        title: "Install",
        options: [
          {
            label: "Plugin marketplace",
            code: "/plugin marketplace add ali-demirbas/ab-test-playbook\n/plugin install ab-test-playbook@ab-test-playbook",
          },
          {
            label: "Local clone",
            code: "git clone https://github.com/ali-demirbas/ab-test-playbook.git\nclaude --plugin-dir ./ab-test-playbook",
          },
          {
            label: "skills.sh",
            code: "npx skills add ali-demirbas/ab-test-playbook --all",
          },
        ],
      },
      framework: {
        title: "Every scenario follows the same three-box discipline",
        boxes: [
          { title: "What to test", desc: "The specific questions the experiment has to answer - not \"test the button\", but every hypothesis the result needs to settle." },
          { title: "KPIs to track", desc: "One primary metric that decides the winner, plus at least one guardrail that must not get worse while it improves." },
          { title: "What not to do", desc: "The mistakes that quietly invalidate the test - the ones a rushed setup makes without anyone noticing until the results are unreadable." },
        ],
      },
      principlesTitle: "Five rules the plugin won't bend on",
      principles: [
        { title: "One variable, always", desc: "Every variant pair changes exactly one thing. Ask for a multivariate test and it gets split into separate ones - insist, and the output says plainly that no one will know which change produced the result." },
        { title: "One primary metric", desc: "The first KPI in the list decides the winner. Presenting five metrics as equally important is exactly how a losing test gets called a win." },
        { title: "No guardrail, no scenario", desc: "Every scenario ships with at least one metric that must not degrade - margin, refund rate, speed, support tickets. If a change could affect accessibility, that's a guardrail candidate too." },
        { title: "Protection isn't a growth lever", desc: "CAPTCHA, identity or age verification, two-factor login, legal consent steps - never proposed as friction to remove, even if asked. Those exist for protection, not conversion; the plugin says so and generates nothing." },
        { title: "Confidence is stated, not implied", desc: "Every suggestion says how strong the evidence behind it is - the user's own data, an archive precedent, an industry pattern, or a hunch. A weak-evidence idea can still be offered, but never dressed up as certain." },
      ],
      example: {
        idx: "ECOM-CART",
        title: "Does a visible coupon-code field increase cart abandonment?",
        intro: "A visible coupon box can send a user with no code off-site to \"go find a discount.\" Moving the code behind a link can close that leak - but it can also reduce campaign usage.",
        testBox: {
          label: "What to test",
          items: [
            "Leak: does moving the coupon field behind a link reduce abandonment?",
            "Segment: do new and returning users search for coupons differently?",
            "Copy: does \"I have a discount code\" perform differently from \"Apply coupon\"?",
            "Campaign: does the effect reverse during active campaign periods?",
            "Error: what's the abandonment rate for users whose code fails?",
          ],
        },
        kpiBox: {
          label: "KPIs to track",
          items: [
            "Revenue Per Visitor (RPV) - the primary metric",
            "Order Completion Rate",
            "Coupon Usage Rate (guardrail)",
            "Checkout Step Abandonment",
            "Campaign Participation (guardrail)",
          ],
        },
        dontBox: {
          label: "What not to do",
          items: [
            "Don't remove the coupon field entirely - users with a code will be frustrated.",
            "Don't leave an invalid-code error ambiguous.",
            "Don't launch or end an active campaign during the test.",
            "Don't hide the coupon field so far it becomes unfindable.",
            "Don't change both the position and the copy in the same test.",
          ],
        },
      },
      faqTitle: "FAQ",
      faqIntro: "Answers drawn from the plugin's own methodology docs, not external citations.",
      faq: [
        {
          q: "What should I A/B test first?",
          a: "Rank candidates with ICE (Impact x Confidence x Ease), not gut feeling. A low-effort test on a high-traffic page beats an ambitious test on a low-traffic one.",
        },
        {
          q: "How many visitors do I need for an A/B test?",
          a: "Not a rule-of-thumb number - it's computed from your actual baseline conversion rate and the minimum effect size you care about detecting. Without real traffic data, no duration or sample-size promise is made.",
        },
        {
          q: "Can I peek at results early and stop when they look significant?",
          a: "No - repeatedly checking a test and stopping the moment it looks significant inflates the false-positive rate well above 5%, even with no real difference. Decide sample size or duration up front, look once. The one exception: a guardrail metric visibly breaking mid-test.",
        },
        {
          q: "Why run a test for at least two full weeks?",
          a: "Not a statistical-power requirement - a coverage requirement. Weekday/weekend behavior and payday effects need to be represented in the data, even if the sample-size target is hit in three days.",
        },
        {
          q: "What are common A/B testing mistakes that invalidate a result?",
          a: "Changing more than one variable at once; declaring a winner from the first days of data; reading conversion rate alone on a price test (revenue per visitor can drop even as CR rises); redesigning \"Variant A\" instead of testing the real page as-is; running overlapping tests on the same page.",
        },
        {
          q: "Is this playbook the right tool for every product?",
          a: "No, and it says so. It fits B2C e-commerce, consumer mobile apps and self-serve SaaS with real weekly traffic. It fits poorly for low-traffic enterprise sales pages, long sales cycles, or heavily regulated flows - for those, it points to qualitative methods instead of forcing a split test where it doesn't belong.",
        },
      ],
      repoLink: "View on GitHub",
      demoLink: "Live demo",
      /* PRODUCT-PAGE STORYTELLING COPY (this round). The keys above are
         untouched - metaTitle/metaDesc/title/sub/install/framework/
         principles/example/faq are the same verified strings the page
         already shipped, still sourced from the plugin's own README/
         methodology docs. Everything below is new copy written for the
         redesigned composition, and every number in it is derived from
         the real dataset at build time (see ab-test-marketing.ts), not
         typed in here. */
      product: {
        heroCtaLibrary: "Browse the library",
        brief: {
          label: "Scenario brief",
          control: "Control",
          variant: "Variant",
          testedSlot: "Tested element",
          testedSlotValue: "Coupon code field",
          sideA: "Coupon field open in the cart, a directly visible box",
          sideB: "Coupon field hidden behind an “I have a discount code” link",
          primaryKpi: "Primary KPI",
          primaryKpiValue: "Revenue Per Visitor (RPV)",
          guardrail: "Guardrail",
          guardrailValue: "Coupon Usage Rate must not collapse",
        },
        scale: {
          scenarios: "scenarios",
          surfaces: "product surfaces",
          categories: "categories",
          guardrails: "guardrail rules",
        },
        story1: {
          eyebrow: "Coverage",
          title: "Start from the surface you're actually on.",
          body: "The library isn't a flat list of tips. Every scenario is filed against the product surface it belongs to (a product page test and a checkout test fail in different ways), so you narrow by where the problem is before anyone argues about what to change.",
          caption: "Scenarios by surface",
        },
        story2: {
          eyebrow: "Discipline",
          title: "One variable, or it isn't a test.",
          body: "Every scenario names the single slot that changes and holds the rest of the page identical. Most of the library ships with the control and the variant already written out, so there's no room to quietly change two things and call the result a finding.",
          caption: "Control vs variant",
          diffNote: "Everything else on the page stays identical.",
          sidesNote: "scenarios ship with the two sides already written",
        },
        story3: {
          eyebrow: "Guardrails",
          title: "Every scenario ships with what must not break.",
          body: "A guardrail is the metric that has to hold while the primary one improves: margin, refund rate, coupon usage, accessibility. They aren't optional here: no scenario in the library carries fewer than five.",
          caption: "What not to do",
          ledgerNote: "guardrail rules across the library",
        },
        library: {
          eyebrow: "The library",
          title: "{count} experiments. One place to find the next one.",
          body: "Filed by category and surface, searchable, and readable without installing anything. Each entry carries the variable under test, the primary KPI and the guardrails.",
          cta: "Browse all tests",
          filterLabel: "Browse by category",
        },
        how: {
          eyebrow: "How it works",
          title: "Find it, build it, read it.",
          body: "Three steps. The third is the one most tests get wrong.",
          steps: [
            { title: "Find the opportunity", body: "Narrow by the surface you're working on, then pick from the scenarios already filed against it." },
            { title: "Design the experiment", body: "The scenario hands you the hypothesis, one primary KPI and the guardrails. Exactly one variable moves." },
            { title: "Read the result", body: "Decide with the statistics, not the chart. A double-digit lift can still be noise." },
          ],
          step1: { label: "Surface", matches: "scenarios on this surface" },
          step2: { hypothesis: "Hypothesis", kpi: "Primary KPI", guardrail: "Guardrail" },
          step3: {
            control: "Control",
            variant: "Variant",
            uplift: "Relative uplift",
            pValue: "p-value",
            verdict: "Significant at 95%?",
            verdictValue: "No, keep running",
            note: "A worked example from this site's own Significance calculator: a +16% lift that doesn't clear the bar.",
            calculators: "Run it on your own numbers",
            test: "two-proportion z-test",
          },
        },
        rulesEyebrow: "The rules",
        installEyebrow: "Install",
        faqEyebrow: "Questions",
      },
    },
    finalCta: {
      title: "Let's talk growth.",
      body: "A role, a project or a question about lifecycle marketing: my inbox is open.",
      button: "mehmetalidemirbas@gmail.com",
      linkedin: "Connect on LinkedIn",
    },
    notFound: {
      metaTitle: "Page not found - Ali Demirbaş",
      eyebrow: "404",
      title: "This page doesn't exist.",
      body: "The link may be outdated, or the page may have moved.",
      cta: "Back to home",
      labLink: "Open the Lab",
    },
    footer: {
      left: "Ali Demirbaş, 2026",
      right: "Istanbul",
      quickLinks: "Quick links",
      projects: "Lab projects",
      connect: "Connect",
      home: "Home",
    },
  },
  tr: {
    nav: { about: "Hakkımda", aboutHref: "/tr/about", lab: "Lab", labHref: "/tr/lab", calculators: "Hesaplayıcılar", calculatorsHref: "/tr/calculators", blog: "Blog", blogHref: "/tr/blog", stack: "Stack", stackHref: "/tr/stack", contact: "İletişim", contactHref: "/tr/contact", cta: "İletişime geç", lang: "EN", langHref: "/" },
    hero: {
      line1: "Ölçülebilir büyüme.",
      line2: "Kullanıcıyı tutan ürünler.",
      lead: "Ben Ali Demirbaş, mobil ürünler için growth marketer. Edinim, CRM ve lifecycle programlarını tahminle değil veriyle kuruyorum.",
      sub: "Şu an İstanbul'da Aksigorta'da mobil uygulama büyümesini yönetiyorum; öncesinde Vodafone, Getir ve Wingie Enuygun Group'ta growth rollerindeydim.",
      ctaPrimary: "İletişime geç",
      ctaSecondary: "LinkedIn",
    },
    home: {
      spec: [
        { label: "Şu an", value: "Mobile App Growth Lead, Aksigorta" },
        { label: "Öncesinde", value: "Vodafone, Getir, Wingie Enuygun Group" },
        { label: "Deneyim", value: "Dijital pazarlama ve growth'ta 7+ yıl" },
        { label: "Çalışma alanı", value: "Edinim, CRM, lifecycle, ölçümleme, CRO" },
        { label: "Konum", value: "İstanbul, İngilizce ve Türkçe çalışır" },
      ],
      work: {
        eyebrow: "Ne yapıyorum",
        title: "Büyüme problemlerinin çoğu, kılık değiştirmiş ölçüm problemidir.",
        primaryLabel: "Ana iş",
        primary: {
          title: "Denetimden geçen ölçümleme",
          body:
            "GA4 ve GTM event tasarımı, Adjust MMP yapılandırması ve iki platform aynı hafta için iki farklı sayı söylediğinde başlayan mutabakat işi. Çıktı: ekibin sorgulayabildiği bir taksonomi, herkesin üzerinde anlaştığı tanımlar ve sorulan soruya cevap veren dashboard'lar.",
        },
        rest: [
          {
            title: "Lifecycle ve CRM programları",
            body: "E-posta, SMS, push ve in-app kanallarında onboarding, elde tutma ve geri kazanım programları; state machine olarak yazılır: journey'i ne başlatır, nerede dallanır, ne kadar bekler, kişi sonra hangi lifecycle'a geçer.",
          },
          {
            title: "Ücretli edinim",
            body: "Mobil kullanıcı edinimi, her şeyle aynı ölçümleme kurulumundan okunur: Adjust MMP attribution, GA4 ve GTM. Böylece kanalın raporladığı sayı ile mutabakatını yapabildiğin sayı aynı sayıdır.",
          },
          {
            title: "Deney ve CRO",
            body: "Test başına tek değişken, önceden yazılmış durma kuralı ve sonucu geçersiz kılacak şeyin baştan not edilmesi.",
          },
        ],
      },
      calc: {
        eyebrow: "Hesaplayıcılar",
        title: "Pazarlama matematiği, tek ekranda.",
        intro:
          "Growth ekiplerinin tartıştığı sayılar için ücretsiz hesaplayıcılar: CAC geri dönüş süresi, LTV, ROAS, retention, örneklem büyüklüğü ve test süresi. Hesap yok, indirme duvarı yok.",
        countSuffix: "araç şu anda yayında.",
        more: "Tüm hesaplayıcıları aç",
      },
      labMore: "Arşivin tamamını aç",
    },
    lab: {
      label: "Lab",
      title: "Yaptığım şeyler",
      intro: "Sürekli karşılaştığım problemler etrafında kurulmuş açık kaynak araçlar ve deneyler. Çoğunlukla growth, lifecycle ve analitik. Bazen başka bir şey.",
      projects: [
        {
          name: "Lifecycle Pazarlama Journey Üretici",
          slug: "claude-lifecycle",
          desc: "Zaten takip ettiğin müşteri sinyallerini, tetikleyebileceğin, ölçebileceğin ve geliştirebileceğin lifecycle journey'lere dönüştürür.",
          tags: ["Lifecycle", "CRM", "Claude Code"],
          proof: "26 journey deseni",
          links: [
            { label: "Proje sayfasını aç", href: "/tr/lab/claude-lifecycle" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/claude-lifecycle" },
            { label: "Canlı demo", href: "https://ali-demirbas.github.io/claude-lifecycle/demo/journey-canvas.html" },
          ],
        },
        {
          name: "Canonical Journey Kütüphanesi",
          slug: "lifecycle-card-archive",
          desc: "Aktivasyon ve elde tutmadan risk, onay, event ve aboneliğe kadar {count} yeniden kullanılabilir lifecycle journey.",
          tags: ["Lifecycle", "Orkestrasyon"],
          proof: "{count} journey · {categories} kategori",
          links: [{ label: "Proje sayfasını aç", href: "/tr/lab/journeys" }],
        },
        {
          name: "A/B Test Playbook",
          slug: "ab-test-playbook",
          desc: "211 gerçek A/B test senaryosu. Her birinde hipotez, birincil metrik, guardrail'ler ve testi doğru çalıştırmak için gereken istatistiksel kontroller var.",
          tags: ["Deneysel Test", "CRO", "Claude Code"],
          proof: "211 senaryo",
          links: [
            { label: "Proje sayfasını aç", href: "/tr/lab/ab-testing" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/ab-test-playbook" },
          ],
        },
        {
          name: "Pazarlama Dashboard Üretici",
          slug: "dashboard-builder",
          desc: "Dağınık pazarlama export'larını doğrulanmış, karşılaştırılabilir metriklere ve doğrudan karar için okunabilen dashboard'lara çevirir.",
          tags: ["Analitik", "Veri Kalitesi", "Claude Code"],
          proof: "11 dashboard şablonu",
          links: [
            { label: "Proje sayfasını aç", href: "/tr/lab/dashboard-builder" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/dashboard-builder" },
          ],
        },
        {
          name: "Google Ads Değişiklik Geçmişi Gezgini",
          slug: "google-ads-change-history-dashboard",
          desc: "Google Ads değişiklik geçmişini aranabilir bir dashboard'a çevirir. Her değişikliğin kampanyası, kategorisi, eski değeri, yeni değeri ve zaman damgası görünür.",
          tags: ["Google Ads", "Analitik", "Python"],
          proof: "Sıfır bağımlılık · 57 self-test",
          links: [
            { label: "Proje sayfasını aç", href: "/tr/lab/google-ads-change-history-dashboard" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/google-ads-change-history-dashboard" },
          ],
        },
        {
          name: "Numerspace",
          slug: "numerspace",
          desc: "Pazarlama, finans, sağlık, kariyer ve günlük kararlar için ücretsiz hesaplayıcılar. Hesap açmadan, ücret ödemeden.",
          tags: ["Web Uygulaması", "Hesaplayıcılar"],
          proof: "97 hesaplayıcı · 13 kategori",
          links: [
            { label: "Proje sayfasını aç", href: "/tr/lab/numerspace" },
            { label: "Numerspace'i ziyaret et", href: "https://www.numerspace.com" },
          ],
        },
      ],
      shell: {
        backToSite: "Siteye dön",
      },
      page: {
        title: "Canonical Journey Kütüphanesi",
        intro:
          "{categories} kategoriye yayılmış, sektörden bağımsız {count} lifecycle state machine. Ara ya da goal'e göre filtrele; her kayıt bir sıra değil, bir graf. Kütüphane içeriği İngilizce.",
        searchPlaceholder: "Journey ara...",
        goalLabel: "Goal",
        allGoals: "Tüm goal'ler",
        removeFilterLabel: "{label} filtresini kaldır",
        clearAll: "Temizle",
        results: "journey",
        empty: "Bu filtrelerle eşleşen kayıt yok.",
        nodesLabel: "düğüm",
        practitioner: {
          trigger: "Tetikleyici",
          notEnough: "Tek başına yeterli değil",
          entity: "Varlık",
          instanceKey: "örnek anahtarı",
          whoEnters: "Kim girer",
          suppressedWhen: "Ne zaman bastırılır",
          orchestration: "Önerilen orkestrasyon",
          onClassification: "sınıflandırma anında gönderilir, öncesinde bekleme yok",
          cancelOn: "iptal eden olaylar",
          recheck: "göndermeden önce yeniden okunur",
          checks: "kontroller",
          mandatory: "zorunlu",
          priority: "öncelik",
          priorityReason: "bu önceliğin nedeni",
          destination: "hedef",
          boundTo: "bağlı olduğu",
          mustNotClaim: "iddia edemez",
          after: "sonrası",
          channelRoles: "Kanal rolleri",
          fallback: "teslimat yedeği",
          stopsWhen: "Ne zaman durur",
          handoff: "devir",
          configure: "Yapılandır",
          requiredData: "Gerekli veri",
          events: "Eşlenecek semantik olaylar",
          attributes: "Öznitelikler",
          optional: "opsiyonel",
          collision: "Çakışma & öncelik",
          pressureClass: "baskı sınıfı",
          localCap: "yerel sınır",
          cooldown: "soğuma",
          competition: "rekabet",
          mandatoryTouches: "zorunlu temaslar",
          noAction: "Eylemsizlik durumları",
          noActionNote: "yukarıdaki bastırmalar kayıtlı sonuçlardır, asla başka bir kanala yedekleme değildir",
          measurement: "Ölçüm",
          journeyOutcome: "journey sonucu",
          businessOutcome: "iş sonucu",
          scope: "gözlem",
          self: "bu journey içinde",
          through: "şu zincir üzerinden",
          until: "şuna kadar",
          attribution: "atıf",
          holdout: "holdout",
          guardrails: "korkuluklar",
          presets: "Ön ayarlar",
          technical: "Teknik mantık",
          preset: "Ön ayar",
          presetOf: "ön ayarı:",
          presetOverrides: "ayarlar",
          presetNoOverrides: "ebeveyninin her varsayılanını korur; yalnızca hedef ve sözcük dağarcığı farklıdır",
          relative: { trigger: "tetikleyiciden sonra", "previous-touch": "önceki temastan sonra", attribute: "şuna göre" },
          roles: { "in-session": "oturum içi", "low-friction": "düşük sürtünme", persistent: "kalıcı", urgent: "acil", human: "insan" },
          labels: { CANONICAL_RULE: "kanonik kural", RECOMMENDED_DEFAULT: "önerilen varsayılan", CONFIG_REQUIRED: "yapılandırma gerekli", OPTIONAL_STRATEGY: "opsiyonel strateji" },
        },
        decisionsLabel: ["koşul", "koşul"],
        exitsLabel: ["çıkış", "çıkış"],
        handoffsLabel: ["devir", "devir"],
        entityLabel: "Varlık",
        competesLabel: "Rekabet",
        distinctLabel: "Şundan farklı",
        preemptedLabel: "Şu olursa biter",
        guardrailsLabel: "Guardrail",
        ruleLabel: "Yeniden kullanılabilir kural",
        terminalLabel: "Terminal",
        close: "Kapat",
        backToLibrary: "Tüm journey'ler",
        mergedNote:
          "{from}, {to} içine alındı. Bu ID artık ayrı bir journey değil; kapsadığı her şey burada.",
        canvas: {
          entry: "Giriş",
          zoomIn: "Yakınlaştır",
          zoomOut: "Uzaklaştır",
          fitToView: "Sığdır",
          reset: "Yakınlaştırmayı sıfırla",
        },
      },
      journeysHub: {
        eyebrow: "Lab / Canonical Journey Kütüphanesi",
        title: "{count} lifecycle state machine. Her biri okunabilir bir graf.",
        sub: "{categories} kategoriye yayılmış, sektörden bağımsız journey'ler. Her biri neyin başlattığını, nerede çatallandığını, ne kadar beklediğini, neyin durdurduğunu ve kişinin sonra hangi lifecycle'a geçtiğini söyler. Hiçbirinde mesaj metni yok. Kütüphane içeriği İngilizce.",
        ctaCommunication: "Müşteri journey'leri",
        proof: ["Sektörden bağımsız", "Dizi değil, graf", "Mesaj metni yok"],
        split: {
          eyebrow: "Nereden başlamalı",
          title: "Tek giriş yolu, altında iki destekleyici yüzey.",
          body: "Müşteri journey'leri bir kişiye ulaşır: temas planı, kanal rolleri, temas modeli. Her journey ayrıca iki destekleyici yüzeyi okur. Dayandığı sessiz yaşam döngüsü durumları ve üzerinde çalıştığı çalışma zamanı mekanizmaları journey'nin içinden açılır, aşağıda kendi başlarına da gezilebilir.",
        },
        stories: {
          eyebrow: "Şemanın zorunlu kıldığı",
          title: "Her journey'in söylemek zorunda olduğu üç şey.",
        },
        final: {
          eyebrow: "Okumaya başla",
          title: "Bir yüzey seç, bir journey aç.",
          body: "Müşteri journey'leri uygulayıcı görünümüyle, iki destekleyici yüzey grafla açılır. Her yüzeyde kategori ve goal'e göre arama ve filtre var.",
        },
      },
      journeysSplit: {
        surfaceLabels: {
          "customer-journeys": "Müşteri journey'leri",
          "lifecycle-states": "Yaşam döngüsü durumları",
          "runtime-mechanisms": "Çalışma zamanı mekanizmaları",
        },
        surfaceBlurbs: {
          "customer-journeys": "Eylemleri doğrudan müşteriye ulaşan journey'ler. Her birinde temas planı, kanal rolleri, temas modeli ve ölçüm kararı yazılı; uygulayıcı kadansı kendisi uydurmak zorunda kalmaz.",
          "lifecycle-states": "Sessiz müşteri yaşam döngüsü durumları: iletişim kuran journey'lerin dayandığı durum modelleri. Burada hiçbir şey gönderilmez; bunlar kampanya değil bağımlılıktır.",
          "runtime-mechanisms": "Her journey'nin üzerinde çalıştığı makine: gönderim uygunluğu, ulaşılabilirlik, teslimat kurtarma, yeniden deneme, soğuma. Müşteri journey'si değil, sözleşme.",
        },
        surfaces: {
          "customer-journeys": {
            title: "Müşteri journey'leri",
            intro: "{count} müşteri journey'si ve {presets} uygulayıcı ön ayarı. Her biri bir müşteriye ulaşır, mesajla ya da işi bir kişiye yönlendirerek. Journey uygulayıcı görünümüyle açılır: tetikleyici, kim girer, zamanlaması ve kanal rolleriyle temas planı, neyin durdurduğu, neyin yapılandırılacağı, neyin ölçüleceği. Graf altta teknik mantık olarak durur. Zaten kullandığın adlarla ara.",
          },
          "lifecycle-states": {
            title: "Yaşam döngüsü durumları",
            intro: "{count} sessiz müşteri yaşam döngüsü durumu. Hiçbir şey göndermezler: iletişim kuran bir journey'nin okuduğu, yeniden okuduğu ve devrettiği durumu tutarlar. Bunları başlatılacak kampanya olarak değil, diğer journey'lerin dayandığı bağımlılıklar olarak oku.",
          },
          "runtime-mechanisms": {
            title: "Çalışma zamanı mekanizmaları",
            intro: "{count} çalışma zamanı mekanizması: müşteri journey'lerinin gönderim uygunluğu, ulaşılabilirlik, teslimat hatası, yeniden deneme ve soğuma için dayandığı sözleşmeler. Journey olarak değil, destekleyici mimari olarak listelenir.",
          },
        },
        presetsTitle: "Ön ayarlar",
        presetsIntro: "Kanonik bir journey'nin adlandırılmış özelleşmeleri: aynı graf, aynı temaslar ve çıkışlar; yapılandırma değerleri, hedef ve sözcük dağarcığı tanınabilir bir kullanım durumu için ayarlanmış. Bir ön ayar, ebeveynini bu değerler uygulanmış olarak açar.",
        presetBadge: "Ön ayar",
        presetOf: "ön ayarı:",
        referenceStrip: "Kütüphanenin bir parçası. Bir journey'den açılır, genelde kendi başına gezilmez",
        silentBadge: "Sessiz durum",
        mechanismBadge: "Mekanizma",
        browseAll: "{count} journey'in tamamına bak",
        showMore: "Daha fazla göster ({count})",
        showLess: "Daha az göster",
        // Turkish takes no plural after a numeral, so both entries are
        // deliberately identical - same as page.decisionsLabel above.
        journeysLabel: ["journey", "journey"],
        internalBadge: "Internal",
        humanRoutingBadge: "İnsana yönlendirme",
        categoryFilterLabel: "Kategori",
        allCategories: "Tüm kategoriler",
        channelFilterLabel: "Kanal",
        allChannels: "Tüm kanallar",
      },
    },
    about: {
      metaTitle: "Hakkımda - Ali Demirbaş",
      metaDesc: "Ali Demirbaş, Aksigorta'da Mobile App Growth Lead; öncesinde Vodafone, Getir ve Wingie Enuygun Group. Mobil ürünler için edinim, CRM, lifecycle ve ölçümleme.",
      eyebrow: "Hakkımda",
      moreLink: "Hakkımda daha fazlası",
      teaserLead:
        "Bir sigorta şirketi, bir telekom operatörü, bir hızlı ticaret uygulaması ve bir seyahat grubu için edinim, CRM ve ölçümleme üzerinde çalıştım: iş modelleri çok farklı, sağlam sayıya ihtiyacı aynı ürünler. Pazarlamayı doğru veri üzerinde, her seferinde tek test ile ilerleyen bir iş olarak görüyorum.",
    },
    stack: {
      metaTitle: "Stack - Ali Demirbaş",
      metaDesc: "Ölçümleme, analiz ve deney için her gün kullandığım araçlar.",
      eyebrow: "Stack",
      title: "Stack",
      sub: "Tasarlamak, üretmek ve ölçmek için kullandığım araçlar.",
      homeTitle: "Kullandığım araçlar",
      homeIntro: "Deney tasarlarken, ölçümleme kurarken ve kullanıcı davranışını analiz ederken kullandığım araçlar.",
      homeMore: "Tüm araçları gör",
    },
    contact: {
      metaTitle: "İletişim - Ali Demirbaş",
      metaDesc: "Ali Demirbaş'a e-posta ile veya LinkedIn üzerinden ulaşın.",
      eyebrow: "İletişim",
      title: "Tanışalım.",
      sub: "Growth, ürün ya da buradaki çalışmalar üzerine konuşmak istersen yaz. Yeni insanlarla tanışmaktan keyif alıyorum.",
      linkedinLabel: "LinkedIn'de bağlantı kur",
      emailPill: "E-posta",
      reasonsTitle: "Buraya gelme sebebin",
      reasons: [
        { title: "Tanışmak için", desc: "Bağlantı kurmak, kendini tanıtmak ya da sadece merhaba demek için." },
        { title: "Bir fikir veya sohbet", desc: "Growth, lifecycle, deneyler, ölçümleme ya da konuşmaya değer başka bir konu." },
        { title: "Bir soru", desc: "Bir hesaplama aracı, journey, açık kaynak proje veya bu sitedeki herhangi bir şey hakkında." },
      ],
      scheduleTitle: "Görüşme planla",
      scheduleSub: "30 dakikalık bir tanışma görüşmesi ayarla.",
      formTitle: "Mesaj gönder",
      formName: "Ad Soyad",
      formEmail: "E-posta",
      formCompany: "Şirket web sitesi (opsiyonel)",
      formSubject: "Konu",
      formMessage: "Mesajın",
      formSubmit: "E-postada aç",
      formNote: "Mesajını e-posta uygulamanda hazır bir taslak olarak açar; bu site üzerinden doğrudan gönderim yapılmaz.",
    },
    /* Bkz. EN tarafındaki not. */
    journeyBuilder: {
      metaTitle: "Lifecycle Marketing Journey Builder - Ali Demirbaş",
      metaDesc: "Lifecycle journey'lerin state machine olarak kanonik kütüphanesi: tetikleyiciler, dallanmalar, beklemeler, devirler ve çıkışlar. Kampanya şablonu değil.",
      eyebrow: "Lab / Journey Builder",
      title: "Kampanya şablonu değil, state machine olarak lifecycle journey'ler.",
      sub: "Buradaki her journey bir graf: onu ne başlatır ve bilinçli olarak ne başlatmaz, nerede çatallanır ve her kolun anlamı nedir, ne kadar bekler ve o süre dolduğunda ne olur, kişinin sahipliği sonra hangi lifecycle'a geçer.",
      proof: ["Açık kaynak", "Claude Code eklentisi", "Kayıt gerekmiyor"],
      canvas: {
        nodes: "düğüm",
        rejoins: "Reconcile'da birleşir",
      },
      scale: {
        journeys: "kanonik journey",
        categories: "kategori",
        nodes: "düğüm",
        kinds: "düğüm tipi",
      },
      story1: {
        eyebrow: "Tetikleyiciler",
        title: "Kanıtla başlar, yoksa başlamaz.",
        body: "Kötü lifecycle otomasyonunun çoğu, tek bir zayıf sinyalle ateşlenmiş bir journey'dir. Buradaki her tetikleyici neye ihtiyaç duyduğunu adlandırır. Tek başına yeterli olmayan benzer sinyalleri de.",
        caption: "Tetikleyici kanıtı",
        requires: "Gerekenler",
        insufficient: "Tek başına yetersiz",
      },
      story2: {
        eyebrow: "Dallanma",
        title: "Her çatalın iki kolu da adlandırılmış.",
        body: "Tek kollu bir koşul, karar kılığına girmiş bir filtredir. O koşulu geçemeyenlere ne olduğunu gizler. Bu yüzden buradaki her koşul en az iki dal taşır, her biri kendisine yönlendiren gerçek kuralla birlikte.",
        caption: "Gerçek bir çatal",
        conditionsLabel: "koşul kütüphanede",
        note: "Hiçbir kol çıkmaz sokak değil: ikisi de adlandırılmış bir düğüme gider.",
      },
      story3: {
        eyebrow: "Zaman",
        title: "Beklemek, son tarihi olan bir karardır.",
        body: "Zaman aşımı olmayan bir bekleme, insanları hiç gelmeyebilecek bir olayda mahsur bırakır. Gidecek yeri olmayan bir zaman aşımı ise sabır taklidi yapan bir çıkıştır. Buradaki her bekleme iki kolunu da adlandırır ve etkileşimin süreyi uzatıp uzatmadığını söyler.",
        caption: "Bir bekleme, iki kol",
        waitsLabel: "bekleme kütüphanede",
        opens: "Bekleme başlar",
        onEvent: "Olay gerçekleşirse",
        onTimeout: "Süre dolarsa",
        note: "Her etkileşimin uzattığı sınırlı bir pencere, sınırlı değildir.",
      },
      library: {
        eyebrow: "Kütüphane",
        title: "{count} journey. Okunmak için kurulmuş.",
        body: "Kategoriye göre dosyalanmış, her biri açıp düğüm düğüm takip edebileceğin bir graf. Sektör şablonu değil, alandan bağımsız state machine'ler. İki journey'in aynı journey olmasını engelleyen şey bu ayrım.",
        cta: "Journey kütüphanesini aç",
        nodes: "düğüm",
        moreCategories: "kategori daha",
      },
      whyDifferent: {
        eyebrow: "Neden claude-lifecycle",
        title: "claude-lifecycle neden farklı",
        feature1: {
          title: "Veri kalitesi ölçülür, varsayılmaz",
          body: "0-100 arası bir Data Quality Score, tek bir journey yazılmadan önce derinliği belirler: 40'ın altı basit 3-5 adımlık akış, 40-69 arası tek dallanmalı standart 4-7 adım, 70 ve üzeri davranışsal dallanmalı 7-12 adımlık journey'lerin kapısını açar. Aynı portföy üç event'i olan bir startup'a da olgun bir e-ticaret sitesine de gitmez.",
        },
        feature2: {
          title: "Liste değil, portföy",
          body: "Uygunluk, motorun dokümante edilmiş pattern kütüphanesindeki her pattern (terk edilmiş sepet, deneme dönüşümü, winback ve diğerleri) için gerekli event imzasından hesaplanır. Her pattern derinliğini ve kanallarını verinin gerçekten desteklediği kadar açar. Verinin henüz desteklemediği şey kilitli bir özellik değil, hangi event'in onu açacağını söyleyen bir tracking plan olur.",
        },
        feature3: {
          title: "Copy, mühendislik ürünüdür",
          body: "Her kanalın kendi kesin kuralı vardır, tahmine dayalı üslup değil: e-posta konu başlığı 20-50 karakter, SMS 160 GSM-7 karakter, push başlık 40 / gövde 120 karakter. Bir reviewer agent, her mesajı sen görmeden önce kendi kanalının kurallarına göre denetler.",
        },
      },
      carousel: {
        eyebrow: "Pattern motoru",
        title: "Tek motor, her işletme için farklı bir portföy",
        body: "26 dokümante edilmiş blueprint sabit bir katalog değil, bilgi tabanı. Her biri derinliğini (3 ila 12 adım), dallanmasını ve kanallarını verinin desteklediği kadar açar; bu yüzden iki işletme aynı çıktıyı almaz. Üç örnek, motorun kendi bilgi tabanında tanımlandığı haliyle.",
      },
      faq: {
        eyebrow: "SSS",
        title: "Sık sorulanlar",
        items: [
          {
            q: "claude-lifecycle nedir?",
            a: "claude-lifecycle, müşteri journey'lerini açık durumlar, dallar, beklemeler, devirler ve çıkışlar olarak yapılandıran açık kaynaklı bir lifecycle mimarisi kütüphanesi. Her otomasyona boş sayfadan başlamak yerine hazır bir yapıdan başlarsın.",
          },
          {
            q: "claude-lifecycle bir journey builder mı, yoksa bir journey kütüphanesi mi?",
            a: "Öncelikle yapılandırılmış bir journey kütüphanesi. Journey'ler, bir ürünün araçlarına, kanallarına ve veri modeline uyarlanabilecek lifecycle mantığını tanımlar.",
          },
          {
            q: "Bir journey neler içerir?",
            a: "Tetikleyiciler, koşullar, aksiyonlar, beklemeler, devirler ve çıkışlar. Giriş mantığı, dallanma, zamanlama, geçişler ve son durumlar belirsiz bırakılmaz, yazılır.",
          },
          {
            q: "Kaç journey dahil?",
            a: "Kütüphane şu anda {categories} kategoriye yayılmış {count} lifecycle journey içeriyor.",
          },
          {
            q: "Journey'leri kendi ürünüme uyarlayabilir miyim?",
            a: "Journey'ler katı reçete değil, başlangıç noktası. Lifecycle mantığını koruyarak tetikleyicileri, koşulları, zamanlamayı ve sonraki aksiyonları değiştirebilirsin.",
          },
          {
            q: "Devir (handoff) nedir?",
            a: "Bir devir, lifecycle durumunu bir journey'den diğerine açıkça aktarır. Journey'ler arasındaki ilişki ve taşınan durum böylece görünür olur; workflow'lar izole otomasyon gibi ele alınmaz.",
          },
          {
            q: "Doğrulama (validation) nasıl çalışır?",
            a: "Doğrulama, giriş durumları, koşul dalları, sınırlı beklemeler, devirler ve açık çıkışlar gibi yapısal kuralların tamamlanıp tamamlanmadığını kontrol eder. Eksik lifecycle mantığı uygulamadan önce ortaya çıkar.",
          },
          {
            q: "claude-lifecycle'ı nasıl kullanırım?",
            a: "GitHub deposunu aç, mevcut journey'leri incele ve Claude Code ile proje yapısını kullanarak kalıpları kendi ürününe uyarla.",
          },
        ],
      },
      pageCta: {
        eyebrow: "AÇIK KAYNAK · GITHUB",
        title: "Lifecycle mantığını boş sayfadan değil, hazır bir yapıdan kur.",
        primary: "GitHub'da görüntüle",
        secondary: "Canlı demoyu aç",
      },
    },
    abTesting: {
      metaTitle: "A/B Test Playbook - Ali Demirbaş",
      metaDesc: "Claude Code için {count} gerçek büyüme testi senaryosu: ne test edilir, hangi KPI izlenir, ne yapılmamalı.",
      eyebrow: "Lab / A/B Test",
      title: "Guardrail'i atlamana izin vermeyen bir A/B test motoru.",
      sub: "ab-test-playbook, 211 gerçek e-ticaret, mobil uygulama ve SaaS büyüme testi senaryosundan kurulu, açık kaynak bir Claude Code eklentisi. Kullanıcının journey'deki yerine göre kanıtlanmış bir test seçmene yardım eder, yenilerini tek değişken disipliniyle tasarlar ve göz kararı yerine gerçek istatistiği çalıştırır.",
      install: {
        title: "Kurulum",
        options: [
          {
            label: "Plugin marketplace",
            code: "/plugin marketplace add ali-demirbas/ab-test-playbook\n/plugin install ab-test-playbook@ab-test-playbook",
          },
          {
            label: "Yerel klon",
            code: "git clone https://github.com/ali-demirbas/ab-test-playbook.git\nclaude --plugin-dir ./ab-test-playbook",
          },
          {
            label: "skills.sh",
            code: "npx skills add ali-demirbas/ab-test-playbook --all",
          },
        ],
      },
      framework: {
        title: "Her senaryo aynı üç kutu disiplinini izler",
        boxes: [
          { title: "Test edilmesi gerekenler", desc: "Deneyin cevaplaması gereken somut sorular. \"Butonu test et\" değil, sonucun çözmesi gereken her hipotez." },
          { title: "Takip edilecek KPI'lar", desc: "Kazananı belirleyen tek bir birincil metrik, artı iyileşirken bozulmaması gereken en az bir guardrail." },
          { title: "Yapılmaması gerekenler", desc: "Testi sessizce geçersiz kılan hatalar. Sonuçlar okunamaz hâle gelene kadar kimsenin fark etmediği türden." },
        ],
      },
      principlesTitle: "Eklentinin eğmediği beş kural",
      principles: [
        { title: "Her zaman tek değişken", desc: "Her varyant çifti tam olarak bir şeyi değiştirir. Çok değişkenli bir test istenirse ayrı testlere bölünür. Israr edilirse çıktı açıkça 'sonuç hangi değişiklikten geldi bilinemeyecek' der." },
        { title: "Tek birincil metrik", desc: "Listedeki ilk KPI kazananı belirler. Beş metriği eşit önemde sunmak, tam olarak kaybeden bir testin kazanan ilan edilme yoludur." },
        { title: "Guardrail'siz senaryo yok", desc: "Her senaryo, bozulmaması gereken en az bir metrikle gelir: marj, iade oranı, hız, destek talebi. Bir değişiklik erişilebilirliği etkileyebilecekse, o da bir guardrail adayıdır." },
        { title: "Koruma bir büyüme kolu değildir", desc: "CAPTCHA, kimlik veya yaş doğrulama, iki adımlı giriş, yasal onay adımları: istense bile hiçbir zaman kaldırılacak sürtünme olarak önerilmez. Bunlar koruma içindir, dönüşüm için değil; eklenti bunu söyler ve senaryo üretmez." },
        { title: "Güven söylenir, ima edilmez", desc: "Her öneri, arkasındaki kanıtın ne kadar güçlü olduğunu söyler: kullanıcının kendi verisi, arşiv emsali, sektör örüntüsü ya da sezgi. Zayıf kanıtlı bir fikir yine sunulabilir ama asla kesinmiş gibi giydirilmez." },
      ],
      example: {
        idx: "ECOM-CART",
        title: "Açık kupon kodu alanı sepet terkini artırır mı?",
        intro: "Görünür bir kupon kutusu, kodu olmayan kullanıcıyı 'indirim arayayım' diye siteden çıkarabilir. Kodu bağlantı arkasına almak bu kaçağı kapatabilir ama kampanya kullanımını düşürebilir.",
        testBox: {
          label: "Test edilmesi gerekenler",
          items: [
            "Kaçak: Kupon alanını bağlantı arkasına almak terk oranını düşürüyor mu?",
            "Segment: Yeni ve dönen kullanıcıda kupon arama davranışı farklı mı?",
            "Metin: 'İndirim kodum var' ile 'Kupon kullan' farklı sonuç veriyor mu?",
            "Kampanya: Kampanya dönemlerinde etki tersine dönüyor mu?",
            "Hata: Kod girip başarısız olan kullanıcının terk oranı ne kadar?",
          ],
        },
        kpiBox: {
          label: "Takip edilecek KPI'lar",
          items: [
            "Ziyaretçi Başına Gelir (RPV, birincil metrik)",
            "Sipariş Tamamlama Oranı",
            "Kupon Kullanım Oranı (guardrail)",
            "Ödeme Adımı Terk Oranı",
            "Kampanya Katılımı (guardrail)",
          ],
        },
        dontBox: {
          label: "Yapılmaması gerekenler",
          items: [
            "Kupon alanını tamamen kaldırma; kodu olan kullanıcı öfkelenir.",
            "Geçersiz kod hatasını belirsiz bırakma.",
            "Test sırasında aktif kampanya kurma ya da kaldırma.",
            "Kupon alanını fark edilmez hâle getirecek kadar gizleme.",
            "Aynı testte hem konumu hem metni değiştirme.",
          ],
        },
      },
      faqTitle: "SSS",
      faqIntro: "Cevaplar eklentinin kendi metodoloji dokümanlarından, dış kaynaklardan değil.",
      faq: [
        {
          q: "İlk olarak neyi A/B test etmeliyim?",
          a: "Adayları içgüdüyle değil ICE (Etki × Güven × Kolaylık) ile sırala. Yüksek trafikli bir sayfada düşük efor gerektiren bir test, düşük trafikli bir sayfadaki iddialı bir testten daha iyidir.",
        },
        {
          q: "Bir A/B test için kaç ziyaretçiye ihtiyacım var?",
          a: "Kestirme bir kural yok. Gerçek baz dönüşüm oranından ve önemsediğin minimum etki büyüklüğünden hesaplanır. Trafik verisi olmadan süre veya örneklem vaadi verilmez.",
        },
        {
          q: "Sonuçlara erken bakıp anlamlı göründüğünde durabilir miyim?",
          a: "Bir testi tekrar tekrar kontrol edip anlamlı göründüğü an durmak, gerçek bir fark olmasa bile yanlış pozitif oranını %5'in çok üzerine çıkarır. Örneklem büyüklüğünü veya süreyi baştan belirle, bir kez bak. Tek istisna: bir guardrail metriğinin test ortasında gözle görülür şekilde bozulması.",
        },
        {
          q: "Neden en az iki tam hafta test çalıştırmalıyım?",
          a: "İstatistiksel güç için değil, kapsama için. Hafta içi ve hafta sonu davranışı ve maaş günü etkilerinin veride temsil edilmesi gerekir, örneklem hedefine üç günde ulaşılsa bile.",
        },
        {
          q: "Bir sonucu geçersiz kılan yaygın A/B test hataları nelerdir?",
          a: "Aynı testte birden fazla değişkeni değiştirmek; ilk günlerin verisinden kazanan ilan etmek; bir fiyat testinde yalnızca dönüşüm oranına bakmak (CR artarken ziyaretçi başına gelir düşebilir); gerçek sayfa test edilirken 'Variant A'yı yeniden tasarlamak; aynı sayfaya çakışan trafikte iki test çalıştırmak.",
        },
        {
          q: "Bu playbook her ürün için doğru araç mı?",
          a: "Playbook'un kendisi de öyle demiyor. B2C e-ticaret, tüketici mobil uygulamaları ve gerçek haftalık trafiği olan self-serve SaaS için uyar. Düşük trafikli kurumsal satış sayfaları, uzun satış döngüleri veya ağır regüle akışlar için daha az uyar; onlar için niteliksel yöntemlere işaret eder.",
        },
      ],
      repoLink: "GitHub'da görüntüle",
      demoLink: "Canlı demo",
      /* Bkz. EN tarafındaki not: yukarıdaki anahtarlar değişmedi, aşağıdaki
         blok bu turun yeni ürün sayfası kurgusu için yazıldı. İçindeki her
         sayı gerçek veri setinden derleme anında türetiliyor. */
      product: {
        heroCtaLibrary: "Senaryo kütüphanesini aç",
        brief: {
          label: "Senaryo brifi",
          control: "Kontrol",
          variant: "Varyant",
          testedSlot: "Test edilen öğe",
          testedSlotValue: "Kupon kodu alanı",
          sideA: "Kupon kodu alanı sepette açık, doğrudan görünür bir kutu",
          sideB: "Kupon alanı “İndirim kodum var” bağlantısı arkasında gizli",
          primaryKpi: "Birincil KPI",
          primaryKpiValue: "Ziyaretçi Başına Gelir (RPV)",
          guardrail: "Guardrail",
          guardrailValue: "Kupon Kullanım Oranı çökmemeli",
        },
        scale: {
          scenarios: "senaryo",
          surfaces: "ürün yüzeyi",
          categories: "kategori",
          guardrails: "guardrail kuralı",
        },
        story1: {
          eyebrow: "Kapsam",
          title: "Gerçekten üzerinde olduğun yüzeyden başla.",
          body: "Kütüphane düz bir ipucu listesi değil. Her senaryo ait olduğu ürün yüzeyine göre dosyalanmış; bir ürün sayfası testiyle bir ödeme testi farklı biçimlerde bozulur. Böylece neyin değişeceği tartışılmadan önce sorunun nerede olduğuna göre daraltırsın.",
          caption: "Yüzeye göre senaryolar",
        },
        story2: {
          eyebrow: "Disiplin",
          title: "Tek değişken, yoksa o bir test değil.",
          body: "Her senaryo değişen tek alanı adlandırır ve sayfanın geri kalanını aynı tutar. Kütüphanenin büyük bölümü kontrol ve varyant yazılmış hâlde gelir; böylece sessizce iki şeyi değiştirip sonuca “bulgu” demenin yeri kalmaz.",
          caption: "Kontrol / varyant",
          diffNote: "Sayfadaki diğer her şey aynı kalır.",
          sidesNote: "senaryo iki tarafı yazılmış hâlde geliyor",
        },
        story3: {
          eyebrow: "Guardrail'ler",
          title: "Her senaryo, bozulmaması gerekenle birlikte gelir.",
          body: "Guardrail, birincil metrik iyileşirken yerinde kalması gereken metriktir: marj, iade oranı, kupon kullanımı, erişilebilirlik. Burada opsiyonel değil; kütüphanedeki hiçbir senaryo beşten azıyla gelmiyor.",
          caption: "Yapılmaması gerekenler",
          ledgerNote: "kütüphane genelinde guardrail kuralı",
        },
        library: {
          eyebrow: "Kütüphane",
          title: "{count} deney. Bir sonrakini buradan seç.",
          body: "Kategoriye ve yüzeye göre dosyalanmış, aranabilir ve hiçbir şey kurmadan okunabilir. Her kayıt test edilen değişkeni, birincil KPI'ı ve guardrail'leri taşır.",
          cta: "Tüm senaryoları aç",
          filterLabel: "Kategoriye göre gez",
        },
        how: {
          eyebrow: "Nasıl çalışır",
          title: "Bul, kur, oku.",
          body: "Üç adım. Çoğu test üçüncüsünde bozulur.",
          steps: [
            { title: "Fırsatı bul", body: "Üzerinde çalıştığın yüzeye göre daralt, sonra o yüzeye dosyalanmış senaryolardan seç." },
            { title: "Deneyi tasarla", body: "Senaryo sana hipotezi, tek bir birincil KPI'ı ve guardrail'leri verir. Tam olarak tek değişken hareket eder." },
            { title: "Sonucu oku", body: "Grafikle değil istatistikle karar ver. Çift haneli bir artış hâlâ gürültü olabilir." },
          ],
          step1: { label: "Yüzey", matches: "senaryo bu yüzeyde" },
          step2: { hypothesis: "Hipotez", kpi: "Birincil KPI", guardrail: "Guardrail" },
          step3: {
            control: "Kontrol",
            variant: "Varyant",
            uplift: "Göreli artış",
            pValue: "p-değeri",
            verdict: "%95'te anlamlı mı?",
            verdictValue: "Hayır, devam et",
            note: "Bu sitenin kendi Anlamlılık hesaplayıcısından işlenmiş bir örnek: eşiği geçemeyen %16'lık bir artış.",
            calculators: "Kendi sayılarınla çalıştır",
            test: "iki oranlı z-testi",
          },
        },
        rulesEyebrow: "Kurallar",
        installEyebrow: "Kurulum",
        faqEyebrow: "Sorular",
      },
    },
    finalCta: {
      title: "Büyümeyi konuşalım.",
      body: "Bir rol, bir proje ya da lifecycle marketing üzerine bir soru. Kutum açık.",
      button: "mehmetalidemirbas@gmail.com",
      linkedin: "LinkedIn'de bağlan",
    },
    notFound: {
      metaTitle: "Sayfa bulunamadı - Ali Demirbaş",
      eyebrow: "404",
      title: "Bu sayfa bulunamadı.",
      body: "Bağlantı eski olabilir veya sayfa taşınmış olabilir.",
      cta: "Ana sayfaya dön",
      labLink: "Lab'e git",
    },
    footer: {
      left: "Ali Demirbaş, 2026",
      right: "İstanbul",
      quickLinks: "Hızlı bağlantılar",
      projects: "Lab projeleri",
      connect: "Bağlan",
      home: "Ana sayfa",
    },
  },
} as const;

export const LINKEDIN = "https://www.linkedin.com/in/ali-demirbas/";
export const EMAIL = "mehmetalidemirbas@gmail.com";
