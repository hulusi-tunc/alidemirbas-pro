export type Lang = "en" | "tr";

export const copy = {
  en: {
    nav: { about: "About", aboutHref: "/about", lab: "Lab", labHref: "/lab", calculators: "Calculators", calculatorsHref: "/calculators", blog: "Blog", blogHref: "/blog", stack: "Tools", stackHref: "/stack", contact: "Contact", contactHref: "/contact", cta: "Get in touch", lang: "TR", langHref: "/tr" },
    hero: {
      line1: "I work on the data",
      line2: "and CRM side of growth.",
      lead: "I'm Ali Demirbaş. I work on user acquisition, CRM programs and measurement for mobile products.",
      sub: "Right now I'm responsible for mobile app growth at Aksigorta. Before that, growth teams at Vodafone, Getir and Wingie Enuygun Group.",
      ctaPrimary: "Get in touch",
      ctaSecondary: "LinkedIn",
      portraitPill: "Istanbul",
      tiles: {
        "lifecycle-card-archive": "{count} journeys across {categories} categories. Each one is a flow that shows what starts it, where it branches and when it ends.",
        "ab-test-playbook": "Test, learn, improve.",
        numerspace: "Free calculators for marketing, finance, health, career and everyday decisions. No account needed.",
      },
      statement: "Growth and CRM work at Aksigorta, Vodafone, Getir and Wingie Enuygun Group.",
      statementLink: "More about me",
    },
    /* Home page only: the ranked "what I do" block and the calculators band. The hero's own headline and lead stay
       in `hero` above; nothing here restates them. */
    home: {
      work: {
        eyebrow: "What I do",
        title: "I approach growth through data, testing, and user behavior.",
        lede: "I work across measurement, lifecycle, performance analysis, and experimentation, connecting what users do with what the numbers say.",
        builtFor: "Built for this",
        services: [
          {
            tool: "dashboard-builder",
            title: "Measurement setup",
            body: "I set up the events, attribution, and reporting needed to understand what is actually happening. When two platforms disagree, I trace the gap back to the definition or the data rather than averaging it away.",
          },
          {
            tool: "lifecycle-card-archive",
            title: "Lifecycle and CRM programs",
            body: "I design the journeys a user goes through from first step to win-back, including what should trigger a message, when it should stop, and what should happen next.",
          },
          {
            tool: "google-ads-change-history-dashboard",
            title: "Performance analysis",
            body: "I read performance together with the changes made around it. That makes it easier to separate what actually changed from what simply moved at the same time.",
          },
          {
            tool: "ab-test-playbook",
            title: "Experimentation",
            body: "I turn questions into testable hypotheses, isolate the variable, choose the primary metric, and define the guardrails before reading the result.",
          },
        ],
      },
      calc: {
        eyebrow: "Calculators",
        title: "Marketing metric calculators.",
        intro:
          "Tools I built for the metrics that come up most: ROAS, CAC, LTV, CPC, CPM, AOV and gross margin.",
        countSuffix: "tools live.",
        more: "Open all calculators",
      },
      labMore: "Open all projects",
      bio: { title: "How I work" },
    },
    lab: {
      label: "Lab",
      title: "Things I'm working on",
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
      intro: "Open-source tools and experiments built for problems I kept running into. Mostly growth, CRM and analytics. Occasionally something else.",
      viewAll: "Explore the archive",
      // `short` is the project's compact name - the hero's tab rail, the
      // header dropdown and the section eyebrows all use it, because the
      // full names run to five words and a tab cannot. `tagline` is the
      // one-line claim under the name in the dropdown and the hero rail;
      // every number in one traces to the same `proof` already here, and
      // the {count}/{categories} tokens are filled by withJourneyCount at
      // render exactly like `desc`.
      projects: [
        {
          name: "Journey Builder",
          slug: "claude-lifecycle",
          short: "Journey Builder",
          tagline: "From event data to usable journeys",
          desc: "Reads the events you already track, tells you which journeys your data can support, then builds each one step by step.",
          tags: ["Lifecycle", "CRM", "Claude Code"],
          proof: "26 journey patterns",
          links: [
            { label: "Open the project page", href: "/lab/claude-lifecycle" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/claude-lifecycle" },
            { label: "Live demo", href: "https://ali-demirbas.github.io/claude-lifecycle/demo/journey-canvas.html" },
          ],
        },
        {
          name: "Journey Library",
          slug: "lifecycle-card-archive",
          short: "Journey Library",
          tagline: "{count} journeys, {categories} categories",
          desc: "{count} journeys across {categories} categories. Each one is a flow that shows what starts it, where it branches and when it ends.",
          tags: ["Lifecycle", "Library"],
          proof: "{count} journeys · {categories} categories",
          links: [{ label: "Open the project page", href: "/lab/journeys" }],
        },
        {
          name: "A/B Test Playbook",
          slug: "ab-test-playbook",
          short: "A/B Test Playbook",
          tagline: "Test, learn, improve",
          desc: "211 A/B test scenarios. Each comes with a hypothesis, one primary metric, guardrails and the checks that keep the test valid.",
          tags: ["A/B testing", "CRO", "Claude Code"],
          proof: "211 scenarios",
          links: [
            { label: "Open the project page", href: "/lab/ab-testing" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/ab-test-playbook" },
          ],
        },
        {
          name: "Dashboard Builder",
          slug: "dashboard-builder",
          short: "Dashboard Builder",
          tagline: "Compare metrics across platforms",
          desc: "Checks reports exported from different platforms, identifies which metrics can be compared safely, and turns the result into a dashboard.",
          tags: ["Analytics", "Data quality", "Claude Code"],
          proof: "11 dashboard templates",
          links: [
            { label: "Open the project page", href: "/lab/dashboard-builder" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/dashboard-builder" },
          ],
        },
        {
          name: "Google Ads Change History",
          slug: "google-ads-change-history-dashboard",
          short: "Google Ads Change History",
          tagline: "Search Google Ads changes in one place",
          desc: "Turns your Google Ads change history into a searchable dashboard, so when a result moves you can see what changed first.",
          tags: ["Google Ads", "Analytics", "Python"],
          proof: "No dependencies · 57 built-in tests",
          links: [
            { label: "Open the project page", href: "/lab/google-ads-change-history-dashboard" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/google-ads-change-history-dashboard" },
          ],
        },
        {
          name: "Numerspace",
          slug: "numerspace",
          short: "Numerspace",
          tagline: "97 free calculators, no account",
          desc: "Free calculators for marketing, finance, health, career and everyday decisions. No account needed.",
          tags: ["Web app", "Calculators"],
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
        title: "Journey Library",
        intro:
          "{count} domain-neutral journeys across {categories} categories. Search, or filter by goal. Each entry is a branching flow, not a fixed sequence.",
        searchPlaceholder: "Search journeys...",
        goalLabel: "Goal",
        allGoals: "All goals",
        removeFilterLabel: "Remove {label} filter",
        clearAll: "Clear all",
        results: "journeys",
        empty: "Nothing matches those filters.",
        nodesLabel: "nodes",
        /* vNext practitioner view labels - the section names of the touch
           plan a migrated Customer Journey renders inside its collapsed
           "Technical details" disclosure (JourneyDetailBody.tsx). */
        practitioner: {
          trigger: "Trigger",
          notEnough: "Not enough on its own",
          entity: "Entity",
          instanceKey: "instance",
          whoEnters: "Who enters",
          suppressedWhen: "Suppressed when",
          orchestration: "Recommended flow",
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
          technical: "Technical details",
          preset: "Preset",
          presetOf: "preset of",
          presetOverrides: "sets",
          presetNoOverrides: "keeps every default of its parent; only the destination and the vocabulary differ",
          relative: { trigger: "after the trigger", "previous-touch": "after the previous touch", attribute: "relative to" },
          roles: { "in-session": "in-session", "low-friction": "low-friction", persistent: "persistent", urgent: "urgent", human: "human" },
          labels: { CANONICAL_RULE: "base rule", RECOMMENDED_DEFAULT: "recommended default", CONFIG_REQUIRED: "config required", OPTIONAL_STRATEGY: "optional strategy" },
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
        tabs: { info: "Info", canvas: "Canvas" },
        openCanvas: "Open the canvas",
        shapeLabel: "Shape",
        card: { minimize: "Minimize", expand: "Expand" },
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
        eyebrow: "Lab / Journey Library",
        title: "{count} journeys. Each one a flow you can read step by step.",
        sub: "Domain-neutral journeys across {categories} categories. Each one states what starts it, where it branches, how long it waits, what stops it and where the person goes next. No message copy.",
        ctaCommunication: "Customer journeys",
        proof: ["Domain-neutral", "Branching flows", "No message copy"],
        split: {
          eyebrow: "Where to start",
          title: "Start with customer journeys.",
          body: "The other two sections are usually opened from inside a customer journey.",
          lines: {
            "customer-journeys": "Flows that message a person or hand work to a team.",
            "lifecycle-states": "Silent records of where a person is. Journeys read them before acting.",
            "runtime-mechanisms": "The rules every send runs on: who can be contacted, delivery, retries.",
          },
          largest: "Largest journeys",
        },
        stories: {
          eyebrow: "Required in every journey",
          title: "Three things every journey has to say.",
        },
        final: {
          eyebrow: "Start reading",
          title: "Pick a library, open a journey.",
          body: "Customer journeys open on the setup view; the other two open on the flow diagram. All three search and filter by category and goal.",
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
          "customer-journeys": "Journeys that reach the customer directly. Each one states how many touches there are, what each channel does and what gets measured, so the person building it doesn't have to invent the timing.",
          "lifecycle-states": "Records that send nothing and only hold where a person currently is. The journeys that do send read these before they act.",
          "runtime-mechanisms": "The rules every journey runs on. Who can be contacted, whether the channel reaches them, what happens when delivery fails, when to retry, when to go quiet. They look at the system, not the customer.",
        },
        surfaces: {
          "customer-journeys": {
            title: "Customer journeys",
            intro: "{count} customer journeys and {presets} ready-made presets. Each one either messages a person or hands the work to a team. A journey opens on its setup view: trigger, who enters, which channel when, what stops it, what to configure, what to measure. The flow diagram sits underneath. Search by the names you already use.",
          },
          "lifecycle-states": {
            title: "Lifecycle states",
            intro: "{count} silent states. They send nothing. Each holds where a person currently is, and the journeys that do send read it before acting. Treat them as records other journeys depend on, not as campaigns.",
          },
          "runtime-mechanisms": {
            title: "Runtime mechanisms",
            intro: "{count} mechanisms. The base rules customer journeys depend on: who can be contacted, whether the channel reaches them, what happens when delivery fails, when to retry, when to go quiet. Not journeys, but the layer journeys run on.",
          },
        },
        railTitle: "Categories",
        surfaceNavLabel: "Library sections",
        presetsTitle: "Presets",
        presetsIntro: "A preset is a journey tuned for one specific use. The flow, the touches and the exits stay the same; only the values, the destination and the vocabulary change. Opening a preset opens its parent with those values applied.",
        presetBadge: "Preset",
        presetOf: "preset of",
        /* The hub's Split() section - heading over the two secondary
           surfaces, presented smaller than Customer Journeys because
           neither is a thing a practitioner browses to on its own (see
           journeysSplit.surfaceBlurbs). Both stay fully live, linked and
           searchable at their existing routes. (The fourth surface,
           Operations, was archived 2026-09-05 - archive/operational-
           workflows/site-copy.json holds its strings verbatim.) */
        referenceStrip: "Part of the library. Usually opened from inside a journey rather than browsed on its own.",
        silentBadge: "Silent state",
        mechanismBadge: "Mechanism",
        browseAll: "Browse all {count}",
        showMore: "Show more ({count})",
        showLess: "Show less",
        /* Per-surface singular/plural pair, same convention (and same
           reason) as `page.decisionsLabel` above: grouping by Goal produces
           real groups of exactly one - 5 of the 22 communication groups -
           and "1 journeys" is wrong where "281 journeys" never was. Keyed
           by SurfaceKey (canonical-view.ts) because the three surfaces
           aren't all "journeys": lifecycle states and runtime mechanisms
           need their own noun. */
        journeysLabel: {
          "customer-journeys": ["journey", "journeys"],
          "lifecycle-states": ["state", "states"],
          "runtime-mechanisms": ["mechanism", "mechanisms"],
        },
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
      metaDesc: "Ali Demirbaş, Mobile App Growth Lead at Aksigorta. Before that Vodafone, Getir and Wingie Enuygun Group. User acquisition, CRM and measurement.",
      eyebrow: "About",
      moreLink: "More about me",
      // Home page teaser only - kept separate from `lead` below (the
      // /about page's own opening line) so editing one doesn't change
      // the other; the two pages make different first impressions on
      // purpose.
      teaserLead:
        "I work across a few areas, from measurement setup and ad channels to CRM and A/B testing. The job is the same in all of them: read what works from the data, then carry it back into the product and the marketing.",
      lead:
        "I've worked on growth for different products since 2019. Measurement comes first. If the number isn't reliable, everything built on it is wasted.",
      body:
        "Then I test what works before it goes anywhere near a bigger budget. Setting up campaigns, measuring them and optimizing them is the day-to-day part.",
      experience: "Experience",
      timeline: [
        {
          kind: "single",
          year: "2026",
          co: "Aksigorta",
          logo: "/logos/aksigorta.svg",
          role: "Mobile App Growth Lead",
          period: "Apr 2026 – Present",
          desc: "Responsible for the mobile app's growth strategy. I run the user acquisition and engagement side.",
        },
        {
          kind: "single",
          year: "2024",
          co: "Vodafone",
          logo: "/logos/vodafone.svg",
          role: "Growth Marketing Lead",
          period: "Aug 2024 – Apr 2026",
          desc: "Led growth marketing across digital channels, running user acquisition and lifecycle programs together.",
        },
        {
          kind: "single",
          year: "2023",
          co: "Getir",
          logo: "/logos/getir.svg",
          role: "Growth, CRM Analytics Executive",
          period: "Sep 2023 – Aug 2024",
          desc: "Managed CRM analytics and growth projects, focused on retention and customer lifetime value.",
        },
        // One entry for the two Enuygun titles (Hulusi, 2026-09-14: "merge
        // these two experiences into one" on the homepage timeline), under
        // the later, senior title and the full span.
        {
          kind: "single",
          year: "2021",
          co: "Wingie Enuygun Group",
          logo: "/logos/enuygun.png",
          role: "Experienced Lifecycle Marketing Specialist (Growth)",
          period: "Sep 2021 – Aug 2023",
          desc: "Built and ran lifecycle marketing and CRM programs across the group's travel brands.",
        },
        {
          kind: "single",
          year: "2020",
          co: "Albayrak Grubu",
          logo: "/logos/albayrak.svg",
          role: "Digital Marketing Specialist",
          period: "Oct 2020 – Aug 2021",
          desc: "Managed digital marketing campaigns for the group's companies.",
        },
        {
          kind: "single",
          year: "2019",
          co: "Doğuş Oto",
          logo: "/logos/dogus-oto.svg",
          role: "Jr. Digital Marketing Specialist",
          period: "Sep 2019 – Aug 2020",
          desc: "Ran digital marketing campaigns.",
        },
      ],
    },
    stack: {
      metaTitle: "Tools I use - Ali Demirbaş",
      metaDesc: "The tools I use for measurement, analysis and testing.",
      eyebrow: "Tools",
      title: "Tools I use day to day.",
      sub: "The tools I use across analytics, CRM, measurement, SEO, reporting, and productivity.",
      // Home page teaser only - the /stack page keeps its own title/sub above.
      homeTitle: "Tools I use",
      homeIntro: "Tools I use to collect data, analyze it, run tests, and turn findings into action.",
      homeMore: "See the full stack",
    },
    contact: {
      metaTitle: "Contact - Ali Demirbaş",
      metaDesc: "Get in touch by email or on LinkedIn.",
      eyebrow: "Contact",
      title: "Let's keep in touch.",
      sub: "If you have a question, want to share an idea, or want to talk about something on this site, feel free to get in touch.",
      linkedinLabel: "Connect on LinkedIn",
      emailPill: "Email",
      reasonsTitle: "A few reasons to reach out",
      reasons: [
        { title: "Say hello", desc: "Introduce yourself, make a connection, or just say hi." },
        { title: "Talk through an idea", desc: "Growth, CRM, A/B testing, measurement, or anything else worth exploring." },
        { title: "Ask a question", desc: "About a calculator, a journey, an open-source project, or anything else on the site." },
      ],
      scheduleTitle: "Schedule a call",
      scheduleSub: "Book a 30 minute intro call.",
      formTitle: "Send a message",
      formName: "Name",
      formEmail: "Email",
      formMessage: "Your message",
      formSubmit: "Send",
      formNote: "Opens a pre-filled draft in your email app. This site doesn't send the message itself.",
    },
    /* Journey Builder PRODUCT PAGE (/lab/claude-lifecycle). New page this
       round - the project previously existed only as a Lab index card
       pointing at GitHub. Every number this copy refers to is derived from
       the canonical library at build time (journey-marketing.ts), never
       typed in here, and every quoted field (trigger events, branch
       labels, timeout reasons, handoff payloads) is read straight off the
       real journey record rather than paraphrased. */
    journeyBuilder: {
      metaTitle: "Journey Builder - Ali Demirbaş",
      metaDesc: "Reads the events you already track, tells you which journeys your data can support, then builds each one step by step.",
      eyebrow: "Lab / Journey Builder",
      title: "From event data to journey design.",
      sub: "Reads the events you already track, identifies which journey patterns your data can support, and builds each flow with triggers, conditions, waits, and channel steps.",
      proof: ["Open source", "GA4 or CSV", "Claude Code plugin"],
      /* The Install section - the repository README's own Quickstart, verbatim:
         three ways in, then the three commands the plugin answers to. */
      install: {
        title: "Install",
        stepAdd: "Add the plugin to Claude Code",
        tabPlugin: "Plugin",
        tabLocal: "Local clone",
        tabSkills: "skills.sh",
        stepUse: "Then, inside Claude Code",
        useNote: "Score your data, generate the journey portfolio, then write the channel copy.",
        stepLinks: "Read the repository, or try the demo",
      },
      canvas: {
        nodes: "nodes",
        rejoins: "rejoins at Reconcile",
      },
      scale: {
        journeys: "journeys",
        categories: "categories",
        nodes: "nodes",
        kinds: "node types",
      },
      story1: {
        eyebrow: "Triggers",
        title: "Start only when the signal is strong enough.",
        body: "Each trigger lists the evidence it needs and the lookalike signals that are too weak on their own. That keeps a journey from starting on a single ambiguous event.",
        caption: "Trigger evidence",
        requires: "Requires",
        insufficient: "Insufficient alone",
      },
      story2: {
        eyebrow: "Branching",
        title: "Write both sides of every condition.",
        body: "Every condition includes the path for people who match it and the path for people who don't. Both branches carry the rule that sends someone there, so no outcome is left implicit.",
        caption: "A real branch",
        conditionsLabel: "conditions in the library",
        note: "Both branches lead to a next step. No dead ends.",
      },
      story3: {
        eyebrow: "Time",
        title: "Give every wait a clear end.",
        body: "Every wait states what event can end it, when it times out, what happens after either outcome, and whether new activity extends the window.",
        caption: "One wait, two ends",
        waitsLabel: "waits in the library",
        opens: "Wait opens",
        onEvent: "On event",
        onTimeout: "On timeout",
        note: "A bounded window that any engagement extends is not bounded.",
      },
      library: {
        eyebrow: "The library",
        title: "{count} journeys, filed by category.",
        body: "Open any of them and follow it step by step. They're built around the process itself, not a sector, which is why no two journeys end up being copies of each other.",
        cta: "Open the Journey Library",
        nodes: "nodes",
        moreCategories: "more",
      },
      whyDifferent: {
        eyebrow: "Approach",
        title: "Journey structure follows the data.",
        body: "The scope of a journey is set by the events, parameters and channels you actually have. With enough data the flow gets more detailed. Without it, the system builds a simpler structure instead of assuming data exists.",
        feature1: {
          title: "Data quality is scored first.",
          body: "Lower-quality data produces a simpler flow. Richer data unlocks more steps and branching. The builder doesn't assume signals you don't have.",
        },
        feature2: {
          title: "Which patterns unlock depends on your data.",
          body: "Each pattern has a defined set of required events. If your data supports them, the pattern is available; if not, the builder shows what's missing.",
        },
        feature3: {
          title: "Each channel has its own rules.",
          body: "Email, SMS, push, and in-app messages have different fields and limits. Generated copy is validated against the rules of the channel it will run on.",
        },
      },
      carousel: {
        eyebrow: "Patterns",
        title: "Different patterns, different flows.",
        body: "Examples from the pattern library. Each card shows its trigger, timing, channel, branching, and exit.",
      },
      faq: {
        eyebrow: "FAQ",
        title: "Frequently asked questions",
        items: [
          {
            q: "What does Journey Builder do?",
            a: "It reads your existing event data, tells you which journeys it can support, and builds each one with its triggers, conditions, waits and exits. An open-source plugin that runs inside Claude Code.",
          },
          {
            q: "What data does it work with?",
            a: "A GA4 connection or a CSV export. A data quality score is calculated first; journey depth follows that score.",
          },
          {
            q: "How many patterns are there?",
            a: "26. Abandoned cart, trial conversion and win-back are three of them. Which ones can be built depends on the events in your data.",
          },
          {
            q: "Does it write the message copy too?",
            a: "Yes, against channel rules. Email subject 20-50 characters, SMS 160 characters, push title 40 and body 120. Every message is checked against its channel's rules before it goes out.",
          },
          {
            q: "Can I adapt the output to my own product?",
            a: "Journeys are starting points, not fixed recipes. Change the triggers, conditions, timing and next steps as you need.",
          },
          {
            q: "What's the difference between Journey Builder and Journey Library?",
            a: "Journey Builder reads your own event data, determines which patterns it can support, and generates the flows. Journey Library is a separate reference library of ready-made, domain-neutral journey structures.",
          },
        ],
      },
    },
    abTesting: {
      metaTitle: "A/B Test Playbook - Ali Demirbaş",
      metaDesc: "{count} A/B test scenarios. What to test, which KPI to track, what not to do.",
      eyebrow: "Lab / A/B Test Playbook",
      title: "Test, learn, improve",
      sub: "{count} A/B test scenarios covering every stage from acquisition to retention. Each one states what is being tested and how it should be measured.",
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
        title: "Every scenario comes with the same three boxes",
        boxes: [
          { title: "What to test", desc: "The specific questions the experiment has to answer. Every hypothesis the result needs to settle, one by one." },
          { title: "KPIs to track", desc: "One primary metric that decides the winner, plus at least one guardrail that must not get worse while it improves." },
          { title: "What not to do", desc: "The mistakes that quietly invalidate the test - the ones a rushed setup makes without anyone noticing until the results are unreadable." },
        ],
      },
      principlesTitle: "Five rules for a valid test",
      principles: [
        { title: "Change one variable", desc: "Every variant pair changes exactly one thing. Ask for a multivariate test and it gets split into separate ones - insist, and the output says plainly that no one will know which change produced the result." },
        { title: "One primary metric", desc: "The first KPI in the list decides the winner. Presenting five metrics as equally important is the easiest way to call a losing test a win." },
        { title: "Always define a guardrail", desc: "Every scenario ships with at least one metric that must not degrade - margin, refund rate, speed, support tickets. If a change could affect accessibility, that's a guardrail candidate too." },
        { title: "Don't test away security steps", desc: "CAPTCHA, identity or age verification, two-factor login, legal consent steps - never proposed as friction to remove, even if asked. Those exist for protection, not conversion; the plugin says so and generates nothing." },
        { title: "State how strong the evidence is", desc: "Every suggestion says how strong the evidence behind it is - the user's own data, an archive precedent, an industry pattern, or a hunch. A weak-evidence idea can still be offered, but never dressed up as certain." },
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
      faqTitle: "Frequently asked questions",
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
          surfaces: "pages",
          categories: "categories",
          guardrails: "guardrail rules",
        },
        story1: {
          eyebrow: "Coverage",
          title: "Start from the page where the problem is.",
          body: "Every scenario is filed against the page it belongs to. A product page test and a checkout test fail in different ways. So you narrow by where the problem is before anyone argues about what to change.",
          caption: "Scenarios by page",
        },
        story2: {
          eyebrow: "Discipline",
          title: "Change one variable at a time.",
          body: "Every scenario names the single slot that changes and holds the rest of the page identical. Most of the library ships with the control and the variant already written out, so there's no room to quietly change two things and call the result a finding.",
          caption: "Control vs variant",
          diffNote: "Everything else on the page stays identical.",
          sidesNote: "scenarios ship with the two sides already written",
        },
        story3: {
          eyebrow: "Guardrails",
          title: "Every scenario ships with what must not break.",
          body: "A guardrail is the metric that has to hold while the primary one improves: margin, refund rate, coupon usage, accessibility. The rule asks for at least one; every scenario in the library carries five.",
          caption: "What not to do",
          ledgerNote: "guardrail rules across the library",
        },
        library: {
          eyebrow: "The library",
          title: "{count} scenarios. Pick the next one here.",
          body: "Filed by category and page, searchable, and readable without installing anything. Each entry carries the variable under test, the primary KPI and the guardrails.",
          cta: "Browse all tests",
          decidedBy: "Decided by",
          filterLabel: "Browse by category",
        },
        how: {
          eyebrow: "How it works",
          title: "Find a scenario, set up the test, read the result.",
          body: "Three steps from choosing a scenario to interpreting the result.",
          steps: [
            { title: "Find the opportunity", body: "Narrow by the page you're working on, then pick from the scenarios filed against it." },
            { title: "Design the experiment", body: "The scenario hands you the hypothesis, one primary KPI and the guardrails. Exactly one variable moves." },
            { title: "Read the result", body: "Decide with the statistics, not the chart. A double-digit lift can still be noise." },
          ],
          step1: { label: "Page", matches: "scenarios on this page" },
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
      title: "If you'd like to talk, I'm here.",
      body: "If you have a question or want to share an idea, feel free to reach out.",
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
      quickLinks: "Pages",
      projects: "Lab projects",
      connect: "Contact",
      home: "Home",
    },
  },
  tr: {
    nav: { about: "Hakkımda", aboutHref: "/tr/about", lab: "Lab", labHref: "/tr/lab", calculators: "Hesaplayıcılar", calculatorsHref: "/tr/calculators", blog: "Blog", blogHref: "/tr/blog", stack: "Araçlar", stackHref: "/tr/stack", contact: "İletişim", contactHref: "/tr/contact", cta: "İletişime geç", lang: "EN", langHref: "/" },
    hero: {
      line1: "Büyüme işinin",
      line2: "veri ve CRM tarafındayım.",
      lead: "Ben Ali Demirbaş. Mobil ürünlerde kullanıcı kazanımı, CRM programları ve ölçüm altyapısı üzerine çalışıyorum.",
      sub: "Şu an Aksigorta'da mobil uygulamanın büyümesinden sorumluyum. Öncesinde Vodafone, Getir ve Wingie Enuygun Group'ta büyüme ekiplerindeydim.",
      ctaPrimary: "İletişime geç",
      ctaSecondary: "LinkedIn",
      portraitPill: "İstanbul",
      tiles: {
        "lifecycle-card-archive": "{categories} kategoride {count} journey. Her biri neyin başlattığını, nerede dallandığını ve ne zaman bittiğini gösteren bir akış şeması.",
        "ab-test-playbook": "Test et, öğren, geliştir.",
        numerspace: "Pazarlama, finans, sağlık, kariyer ve günlük kararlar için ücretsiz hesaplayıcılar. Üyelik gerekmiyor.",
      },
      statement: "Aksigorta, Vodafone, Getir ve Wingie Enuygun Group'ta büyüme ve CRM üzerine çalıştım.",
      statementLink: "Hakkımda daha fazlası",
    },
    home: {
      work: {
        eyebrow: "Ne yapıyorum",
        title: "Büyümeyi veri, test ve kullanıcı davranışı üzerinden ele alıyorum.",
        lede: "Ölçüm, lifecycle, performans analizi ve deneyler tarafında çalışıyorum; kullanıcının ne yaptığını veride ne gördüğümüzle birlikte ele alıyorum.",
        builtFor: "Bunun için yaptım",
        services: [
          {
            tool: "dashboard-builder",
            title: "Ölçüm altyapısı",
            body: "Ne olduğunu anlayabilmek için gereken event, attribution ve raporlama yapısını kuruyorum. İki platform farklı sayı verdiğinde ortalamak yerine farkın tanımdan mı, veriden mi geldiğini bulmaya çalışıyorum.",
          },
          {
            tool: "lifecycle-card-archive",
            title: "Lifecycle ve CRM programları",
            body: "Kullanıcının ilk adımdan geri kazanıma kadar geçtiği journey'leri tasarlıyorum; mesajın ne zaman tetikleneceğini, ne zaman duracağını ve sonrasında ne olacağını birlikte kurguluyorum.",
          },
          {
            tool: "google-ads-change-history-dashboard",
            title: "Performans analizi",
            body: "Performansı, o dönemde yapılan değişikliklerle birlikte okuyorum. Böylece gerçekten neyin değiştiğini, sadece aynı anda hareket eden metriklerden ayırmak daha kolay oluyor.",
          },
          {
            tool: "ab-test-playbook",
            title: "Deneyler",
            body: "Soruyu test edilebilir bir hipoteze çeviriyor, değişkeni izole ediyor, birincil metriği ve guardrail'leri sonucu görmeden önce belirliyorum.",
          },
        ],
      },
      calc: {
        eyebrow: "Hesaplayıcılar",
        title: "Pazarlama metrikleri için hesaplayıcılar.",
        intro:
          "ROAS, CAC, LTV, CPC, CPM, AOV ve brüt kâr marjı gibi sık kullanılan metrikler için hazırladığım araçlar.",
        countSuffix: "araç yayında.",
        more: "Tüm hesaplayıcıları aç",
      },
      labMore: "Tüm projeleri aç",
      bio: { title: "Nasıl çalışıyorum" },
    },
    lab: {
      label: "Lab",
      title: "Üzerinde çalıştıklarım",
      intro: "Sürekli karşılaştığım problemler için yaptığım açık kaynak araçlar ve deneyler. Çoğunlukla büyüme, CRM ve analitik. Bazen başka bir şey.",
      projects: [
        {
          name: "Journey Oluşturucu",
          slug: "claude-lifecycle",
          short: "Journey Oluşturucu",
          tagline: "Event verisinden journey kurgusuna",
          desc: "Mevcut event verisine bakıp hangi journey'lerin kurulabileceğini söyler, sonra her birini adımlarıyla birlikte kurar.",
          tags: ["Yaşam döngüsü", "CRM", "Claude Code"],
          proof: "26 journey deseni",
          links: [
            { label: "Proje sayfasını aç", href: "/tr/lab/claude-lifecycle" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/claude-lifecycle" },
            { label: "Canlı demo", href: "https://ali-demirbas.github.io/claude-lifecycle/demo/journey-canvas.html" },
          ],
        },
        {
          name: "Journey Kütüphanesi",
          slug: "lifecycle-card-archive",
          short: "Journey Kütüphanesi",
          tagline: "{count} journey, {categories} kategori",
          desc: "{categories} kategoride {count} journey. Her biri neyin başlattığını, nerede dallandığını ve ne zaman bittiğini gösteren bir akış şeması.",
          tags: ["Yaşam döngüsü", "Kütüphane"],
          proof: "{count} journey · {categories} kategori",
          links: [{ label: "Proje sayfasını aç", href: "/tr/lab/journeys" }],
        },
        {
          name: "A/B Test Playbook",
          slug: "ab-test-playbook",
          short: "A/B Test Playbook",
          tagline: "Test et, öğren, geliştir",
          desc: "211 A/B test senaryosu. Her birinde hipotez, birincil metrik, guardrail'ler ve testi doğru kurmak için gereken kontroller var.",
          tags: ["A/B test", "CRO", "Claude Code"],
          proof: "211 senaryo",
          links: [
            { label: "Proje sayfasını aç", href: "/tr/lab/ab-testing" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/ab-test-playbook" },
          ],
        },
        {
          name: "Dashboard Oluşturucu",
          slug: "dashboard-builder",
          short: "Dashboard Oluşturucu",
          tagline: "Farklı platformların metriklerini karşılaştır",
          desc: "Farklı platformlardan aldığın raporları kontrol eder, hangi metriklerin güvenle karşılaştırılabildiğini belirler ve sonucu dashboard'a çevirir.",
          tags: ["Analitik", "Veri kalitesi", "Claude Code"],
          proof: "11 dashboard şablonu",
          links: [
            { label: "Proje sayfasını aç", href: "/tr/lab/dashboard-builder" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/dashboard-builder" },
          ],
        },
        {
          name: "Google Ads Değişiklik Geçmişi",
          slug: "google-ads-change-history-dashboard",
          short: "Google Ads Değişiklik Geçmişi",
          tagline: "Google Ads değişikliklerini tek yerde ara",
          desc: "Google Ads değişiklik geçmişini aranabilir bir dashboard'a çevirir. Sonuç değiştiğinde önce neyin değiştiğini gösterir.",
          tags: ["Google Ads", "Analitik", "Python"],
          proof: "Bağımlılık yok · 57 yerleşik test",
          links: [
            { label: "Proje sayfasını aç", href: "/tr/lab/google-ads-change-history-dashboard" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/google-ads-change-history-dashboard" },
          ],
        },
        {
          name: "Numerspace",
          slug: "numerspace",
          short: "Numerspace",
          tagline: "97 ücretsiz hesaplayıcı, üyelik gerekmiyor",
          desc: "Pazarlama, finans, sağlık, kariyer ve günlük kararlar için ücretsiz hesaplayıcılar. Üyelik gerekmiyor.",
          tags: ["Web uygulaması", "Hesaplayıcılar"],
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
        title: "Journey Kütüphanesi",
        intro:
          "{categories} kategoride, sektörden bağımsız {count} journey. Ara ya da hedefe göre filtrele. Her kayıt düz bir sıra değil, dallanan bir akış.",
        searchPlaceholder: "Journey ara...",
        goalLabel: "Hedef",
        allGoals: "Tüm hedefler",
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
          orchestration: "Önerilen akış",
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
          attribution: "attribution",
          holdout: "holdout",
          guardrails: "guardrail'ler",
          presets: "Ön ayarlar",
          technical: "Teknik detaylar",
          preset: "Ön ayar",
          presetOf: "ön ayarı:",
          presetOverrides: "ayarlar",
          presetNoOverrides: "ebeveyninin bütün varsayılanlarını korur; yalnızca hedef ve kullanılan isimler farklı",
          relative: { trigger: "tetikleyiciden sonra", "previous-touch": "önceki temastan sonra", attribute: "şuna göre" },
          roles: { "in-session": "oturum içi", "low-friction": "düşük sürtünme", persistent: "kalıcı", urgent: "acil", human: "insan" },
          labels: { CANONICAL_RULE: "temel kural", RECOMMENDED_DEFAULT: "önerilen varsayılan", CONFIG_REQUIRED: "yapılandırma gerekli", OPTIONAL_STRATEGY: "opsiyonel strateji" },
        },
        decisionsLabel: ["koşul", "koşul"],
        exitsLabel: ["çıkış", "çıkış"],
        handoffsLabel: ["devir", "devir"],
        entityLabel: "Varlık",
        competesLabel: "Rekabet",
        distinctLabel: "Şundan farklı",
        preemptedLabel: "Şu olursa biter",
        guardrailsLabel: "Koruma kuralları",
        ruleLabel: "Yeniden kullanılabilir kural",
        terminalLabel: "Terminal",
        close: "Kapat",
        backToLibrary: "Tüm journey'ler",
        mergedNote:
          "{from}, {to} içine alındı. Bu kimlik artık ayrı bir journey değil; kapsadığı her şey burada.",
        canvas: {
          entry: "Giriş",
          zoomIn: "Yakınlaştır",
          zoomOut: "Uzaklaştır",
          fitToView: "Sığdır",
          reset: "Yakınlaştırmayı sıfırla",
        },
        tabs: { info: "Bilgi", canvas: "Kanvas" },
        openCanvas: "Kanvası aç",
        shapeLabel: "Yapı",
        card: { minimize: "Küçült", expand: "Genişlet" },
      },
      journeysHub: {
        eyebrow: "Lab / Journey Kütüphanesi",
        title: "{count} journey. Her biri adım adım okunabilen bir akış.",
        sub: "{categories} kategoride, sektörden bağımsız journey'ler. Her biri neyin başlattığını, nerede dallandığını, ne kadar beklediğini, neyin durdurduğunu ve kişinin sonra nereye geçtiğini söyler. Mesaj metni içermez.",
        ctaCommunication: "Müşteri journey'leri",
        proof: ["Sektörden bağımsız", "Dallanan akış", "Mesaj metni yok"],
        split: {
          eyebrow: "Nereden başlamalı",
          title: "Müşteri journey'lerinden başla.",
          body: "Diğer iki bölüm genellikle bir müşteri journey'sinin içinden açılır.",
          lines: {
            "customer-journeys": "Bir kişiye mesaj gönderen ya da işi bir ekibe devreden akışlar.",
            "lifecycle-states": "Kişinin nerede olduğunu tutan sessiz kayıtlar; journey'ler göndermeden önce bunları okur.",
            "runtime-mechanisms": "Her gönderimin dayandığı kurallar: ulaşılabilirlik, teslimat, yeniden deneme.",
          },
          largest: "En büyük journey'ler",
        },
        stories: {
          eyebrow: "Her journey'de zorunlu olanlar",
          title: "Her journey'nin söylemek zorunda olduğu üç şey.",
        },
        final: {
          eyebrow: "Okumaya başla",
          title: "Bir kütüphane seç, bir journey aç.",
          body: "Müşteri journey'leri kurulum görünümüyle, diğer ikisi akış şemasıyla açılır. Hepsinde kategori ve hedefe göre arama var.",
        },
      },
      journeysSplit: {
        surfaceLabels: {
          "customer-journeys": "Müşteri journey'leri",
          "lifecycle-states": "Yaşam döngüsü durumları",
          "runtime-mechanisms": "Altyapı mekanizmaları",
        },
        surfaceBlurbs: {
          "customer-journeys": "Doğrudan müşteriye ulaşan journey'ler. Her birinde kaç temas olacağı, hangi kanalın ne iş göreceği ve neyin ölçüleceği yazılı. Kuran kişi zamanlamayı kendisi uydurmak zorunda kalmaz.",
          "lifecycle-states": "Hiçbir şey göndermeyen, yalnızca kişinin hangi durumda olduğunu tutan kayıtlar. Mesaj gönderen journey'ler bunlara bakarak karar verir.",
          "runtime-mechanisms": "Her journey'nin arkasında çalışan kurallar. Kime gönderilebilir, kanal ulaşıyor mu, teslim olmazsa ne olur, ne zaman yeniden denenir, ne zaman susulur. Müşteriye değil, sisteme bakar.",
        },
        surfaces: {
          "customer-journeys": {
            title: "Müşteri journey'leri",
            intro: "{count} müşteri journey'si ve {presets} hazır ön ayar. Her biri ya kişiye mesaj gönderir ya da işi bir ekibe düşürür. Journey önce kurulum görünümüyle açılır. Tetikleyici, kim girer, hangi kanal ne zaman, neyin durdurduğu, neyin ayarlanacağı, neyin ölçüleceği. Akış şeması altta durur. Zaten kullandığın adlarla arayabilirsin.",
          },
          "lifecycle-states": {
            title: "Yaşam döngüsü durumları",
            intro: "{count} sessiz durum. Hiçbir şey göndermezler. Kişinin hangi durumda olduğunu tutar, mesaj gönderen journey'ler bu duruma bakarak karar verir. Kampanya gibi değil, diğer journey'lerin dayandığı kayıtlar gibi oku.",
          },
          "runtime-mechanisms": {
            title: "Altyapı mekanizmaları",
            intro: "{count} mekanizma. Müşteri journey'lerinin dayandığı temel kurallar. Kime gönderilebilir, kanal ulaşıyor mu, teslim olmazsa ne olur, ne zaman yeniden denenir, ne zaman susulur. Bunlar journey değil, journey'lerin üzerinde çalıştığı altyapı.",
          },
        },
        railTitle: "Kategoriler",
        surfaceNavLabel: "Kütüphane bölümleri",
        presetsTitle: "Ön ayarlar",
        presetsIntro: "Ön ayar, bir journey'nin belli bir kullanım için ayarlanmış hâli. Akış, temaslar ve çıkışlar aynı kalır; değişen yalnızca değerler, hedef ve kullanılan isimler. Bir ön ayar, ebeveynini bu değerler uygulanmış olarak açar.",
        presetBadge: "Ön ayar",
        presetOf: "ön ayarı:",
        referenceStrip: "Kütüphanenin parçası. Genellikle bir journey'nin içinden açılır; ayrı bir bölüm olarak gezmek gerekmez.",
        silentBadge: "Sessiz durum",
        mechanismBadge: "Mekanizma",
        browseAll: "{count} kaydın tamamına bak",
        showMore: "Daha fazla göster ({count})",
        showLess: "Daha az göster",
        // Turkish takes no plural after a numeral, so both entries in each
        // pair are deliberately identical - same as page.decisionsLabel
        // above. Keyed by SurfaceKey - see the EN block's comment.
        journeysLabel: {
          "customer-journeys": ["journey", "journey"],
          "lifecycle-states": ["durum", "durum"],
          "runtime-mechanisms": ["mekanizma", "mekanizma"],
        },
        internalBadge: "İç işlem",
        humanRoutingBadge: "İnsana yönlendirme",
        categoryFilterLabel: "Kategori",
        allCategories: "Tüm kategoriler",
        channelFilterLabel: "Kanal",
        allChannels: "Tüm kanallar",
      },
    },
    about: {
      metaTitle: "Hakkımda - Ali Demirbaş",
      metaDesc: "Ali Demirbaş, Aksigorta'da Mobil Uygulama Büyüme Lideri. Öncesinde Vodafone, Getir ve Wingie Enuygun Group. Kullanıcı kazanımı, CRM ve ölçümleme.",
      eyebrow: "Hakkımda",
      moreLink: "Hakkımda daha fazlası",
      teaserLead:
        "Ölçüm altyapısından reklam kanallarına, CRM'den A/B testlerine kadar birkaç alanda çalışıyorum. Hepsinde yaptığım iş aynı. Neyin işe yaradığını veriden okuyup ürüne ve pazarlamaya geri taşıyorum.",
      lead:
        "2019'dan beri farklı ürünlerde büyüme üzerine çalışıyorum. Önce ölçüme bakıyorum. Sayı güvenilir değilse gerisi boşa gidiyor.",
      body:
        "Sonra neyin işe yaradığını, bütçeyi büyütmeden önce test ediyorum. Kampanya kurmak, ölçmek ve optimize etmek bunun günlük tarafı.",
      experience: "Deneyim",
      timeline: [
        {
          kind: "single",
          year: "2026",
          co: "Aksigorta",
          logo: "/logos/aksigorta.svg",
          role: "Mobil Uygulama Büyüme Lideri",
          period: "Nis 2026 – Günümüz",
          desc: "Mobil uygulamanın büyüme stratejisinden sorumluyum. Kullanıcı kazanımı ve etkileşim tarafını yürütüyorum.",
        },
        {
          kind: "single",
          year: "2024",
          co: "Vodafone",
          logo: "/logos/vodafone.svg",
          role: "Büyüme Pazarlaması Lideri",
          period: "Ağu 2024 – Nis 2026",
          desc: "Dijital kanallarda büyüme pazarlamasını yönettim. Kullanıcı kazanımı ile yaşam döngüsü programlarını birlikte yürüttüm.",
        },
        {
          kind: "single",
          year: "2023",
          co: "Getir",
          logo: "/logos/getir.svg",
          role: "Büyüme, CRM Analitiği Uzmanı",
          period: "Eyl 2023 – Ağu 2024",
          desc: "CRM analitiği ve büyüme projelerini yönettim. Odak, elde tutma ve müşteri yaşam boyu değeriydi.",
        },
        // İki Enuygun unvanı tek kayıt (2026-09-14): sonraki, kıdemli unvan
        // ve tüm süre.
        {
          kind: "single",
          year: "2021",
          co: "Wingie Enuygun Group",
          logo: "/logos/enuygun.png",
          role: "Kıdemli Yaşam Döngüsü Pazarlama Uzmanı (Büyüme)",
          period: "Eyl 2021 – Ağu 2023",
          desc: "Grubun seyahat markalarında yaşam döngüsü pazarlaması ve CRM programlarını kurdum ve yürüttüm.",
        },
        {
          kind: "single",
          year: "2020",
          co: "Albayrak Grubu",
          logo: "/logos/albayrak.svg",
          role: "Dijital Pazarlama Uzmanı",
          period: "Eki 2020 – Ağu 2021",
          desc: "Grup şirketlerinin dijital pazarlama kampanyalarını yönettim.",
        },
        {
          kind: "single",
          year: "2019",
          co: "Doğuş Oto",
          logo: "/logos/dogus-oto.svg",
          role: "Jr. Dijital Pazarlama Uzmanı",
          period: "Eyl 2019 – Ağu 2020",
          desc: "Dijital pazarlama kampanyalarını yürüttüm.",
        },
      ],
    },
    stack: {
      metaTitle: "Kullandığım araçlar - Ali Demirbaş",
      metaDesc: "Ölçümleme, analiz ve test için kullandığım araçlar.",
      eyebrow: "Araçlar",
      title: "Çalışırken kullandığım araçlar.",
      sub: "Analitik, CRM, ölçümleme, SEO, raporlama ve üretkenlik tarafında günlük iş akışımda kullandığım araçlar.",
      homeTitle: "Kullandığım araçlar",
      homeIntro: "Veriyi toplamak, analiz etmek, test etmek ve aksiyona çevirmek için kullandığım araçlar.",
      homeMore: "Tüm araçları gör",
    },
    contact: {
      metaTitle: "İletişim - Ali Demirbaş",
      metaDesc: "E-posta ve LinkedIn üzerinden iletişim.",
      eyebrow: "İletişim",
      title: "İletişimde kalalım.",
      sub: "Bir soru sormak, fikir paylaşmak ya da buradaki projelerden biri hakkında konuşmak istersen bana ulaşabilirsin.",
      linkedinLabel: "LinkedIn'de bağlantı kur",
      emailPill: "E-posta",
      reasonsTitle: "Bana neden yazabilirsin?",
      reasons: [
        { title: "Tanışmak için", desc: "Kendini tanıtmak, bağlantı kurmak ya da sadece merhaba demek için." },
        { title: "Bir şey konuşmak için", desc: "Büyüme, CRM, A/B testleri, ölçümleme ya da üzerinde birlikte düşünebileceğimiz başka bir konu için." },
        { title: "Bir şey sormak için", desc: "Hesaplayıcılar, journey’ler, açık kaynak projeler veya sitedeki herhangi bir şey hakkında." },
      ],
      scheduleTitle: "Görüşme planla",
      scheduleSub: "30 dakikalık bir tanışma görüşmesi ayarla.",
      formTitle: "Mesaj gönder",
      formName: "Ad soyad",
      formEmail: "E-posta",
      formMessage: "Mesajın",
      formSubmit: "Gönder",
      formNote: "Mesajını e-posta uygulamanda hazır bir taslak olarak açar; bu site üzerinden doğrudan gönderim yapılmaz.",
    },
    /* Bkz. EN tarafındaki not. */
    journeyBuilder: {
      metaTitle: "Journey Oluşturucu - Ali Demirbaş",
      metaDesc: "Mevcut event verisine bakıp hangi journey'lerin kurulabileceğini söyler, sonra her birini adımlarıyla birlikte kurar.",
      eyebrow: "Lab / Journey Oluşturucu",
      title: "Event verisinden journey kurgusuna.",
      sub: "Mevcut event verini okur, hangi journey desenlerinin kurulabileceğini belirler ve her akışı tetikleyici, koşul, bekleme ve kanal adımlarıyla oluşturur.",
      proof: ["Açık kaynak", "GA4 veya CSV", "Claude Code eklentisi"],
      install: {
        title: "Kurulum",
        stepAdd: "Eklentiyi Claude Code'a ekle",
        tabPlugin: "Eklenti",
        tabLocal: "Yerel klon",
        tabSkills: "skills.sh",
        stepUse: "Sonra, Claude Code'un içinde",
        useNote: "Verini puanla, journey portföyünü üret, sonra kanal metinlerini yaz.",
        stepLinks: "Repoyu oku ya da demoyu dene",
      },
      canvas: {
        nodes: "düğüm",
        rejoins: "Reconcile'da birleşir",
      },
      scale: {
        journeys: "journey",
        categories: "kategori",
        nodes: "düğüm",
        kinds: "düğüm tipi",
      },
      story1: {
        eyebrow: "Tetikleyiciler",
        title: "Yalnızca sinyal yeterince güçlüyse başlar.",
        body: "Her tetikleyici hangi kanıta ihtiyaç duyduğunu ve tek başına yeterli olmayan benzer sinyalleri açıkça belirtir. Böylece journey tek bir belirsiz event yüzünden başlamaz.",
        caption: "Tetikleyici kanıtı",
        requires: "Gerekenler",
        insufficient: "Tek başına yetersiz",
      },
      story2: {
        eyebrow: "Dallanma",
        title: "Her koşulun iki tarafını da yaz.",
        body: "Her koşul hem eşleşenlerin hem de eşleşmeyenlerin nereye gideceğini gösterir. İki dalda da kişiyi o yola yönlendiren kural yazılıdır; hiçbir sonuç varsayıma bırakılmaz.",
        caption: "Gerçek bir dallanma",
        conditionsLabel: "koşul kütüphanede",
        note: "İki dal da bir sonraki adıma gider. Çıkmaz sokak yok.",
      },
      story3: {
        eyebrow: "Zaman",
        title: "Her beklemenin net bir sonu var.",
        body: "Her beklemede hangi event'in beklemeyi bitireceği, sürenin ne zaman dolacağı, iki durumda da ne olacağı ve yeni bir etkileşimin süreyi uzatıp uzatmadığı yazılıdır.",
        caption: "Bir bekleme, iki uç",
        waitsLabel: "bekleme kütüphanede",
        opens: "Bekleme başlar",
        onEvent: "Olay gerçekleşirse",
        onTimeout: "Süre dolarsa",
        note: "Her etkileşimin uzattığı sınırlı bir pencere, sınırlı değildir.",
      },
      library: {
        eyebrow: "Kütüphane",
        title: "{count} journey, kategoriye göre dosyalanmış.",
        body: "Her birini açıp adım adım takip edebilirsin. Sektöre göre değil, sürecin kendisine göre kurulmuş akışlar. Bu yüzden iki journey birbirinin kopyası olmuyor.",
        cta: "Journey Kütüphanesi'ni aç",
        nodes: "düğüm",
        moreCategories: "kategori daha",
      },
      whyDifferent: {
        eyebrow: "Yaklaşım",
        title: "Journey'nin derinliğini veri belirler.",
        body: "Journey'nin kapsamı eldeki event'lere, parametrelere ve kanallara göre değişir. Veri yeterliyse akış detaylanır. Eksikse sistem varsayım yapmak yerine daha basit bir yapı kurar.",
        feature1: {
          title: "Veri kalitesi önce ölçülür.",
          body: "Veri kalitesi düşükse daha basit bir akış kurulur. Veri zenginleştikçe adım sayısı ve dallanma artar. Sistem elde olmayan sinyalleri varsaymaz.",
        },
        feature2: {
          title: "Hangi desenin kurulabileceği verine bağlı.",
          body: "Her desenin ihtiyaç duyduğu event'ler belli. Verinde varsa desen kullanılabilir; yoksa sistem hangi event veya parametrenin eksik olduğunu gösterir.",
        },
        feature3: {
          title: "Her kanalın kendi kuralları var.",
          body: "E-posta, SMS, push ve uygulama içi mesajların alanları ve sınırları farklıdır. Üretilen metin, kullanılacağı kanalın kurallarına göre doğrulanır.",
        },
      },
      carousel: {
        eyebrow: "Desenler",
        title: "Farklı desenler, farklı akışlar.",
        body: "Pattern kütüphanesinden örnekler. Her kart tetikleyiciyi, zamanlamayı, kanalı, dallanmayı ve çıkışı gösteriyor.",
      },
      faq: {
        eyebrow: "SSS",
        title: "Sık sorulan sorular",
        items: [
          {
            q: "Journey Oluşturucu ne yapar?",
            a: "Mevcut event verine bakar, hangi journey'lerin kurulabileceğini söyler ve her birini tetikleyici, koşul, bekleme ve çıkışlarıyla birlikte kurar. Claude Code içinde çalışan açık kaynak bir eklenti.",
          },
          {
            q: "Hangi veriyle çalışır?",
            a: "GA4 bağlantısı ya da CSV dışa aktarımı. Önce veri kalitesi skoru hesaplanır; journey derinliği bu skora göre belirlenir.",
          },
          {
            q: "Kaç desen var?",
            a: "26. Terk edilmiş sepet, deneme dönüşümü ve geri kazanım bunlardan üçü. Hangilerinin kurulabileceği verindeki event'lere bağlı.",
          },
          {
            q: "Mesaj metinlerini de yazıyor mu?",
            a: "Evet, kanal kurallarına göre. E-posta konu satırı 20-50 karakter, SMS 160 karakter, push başlık 40 ve gövde 120 karakter. Her metin gönderilmeden önce kendi kanalının kurallarına göre kontrol edilir.",
          },
          {
            q: "Çıktıyı kendi ürünüme uyarlayabilir miyim?",
            a: "Journey'ler katı reçete değil, başlangıç noktası. Tetikleyicileri, koşulları, zamanlamayı ve sonraki adımları değiştirebilirsin.",
          },
          {
            q: "Journey Builder ile Journey Library arasındaki fark ne?",
            a: "Journey Builder kendi event verine bakıp hangi desenlerin kurulabileceğini belirler ve akışları üretir. Journey Library ise hazır, domain-neutral journey yapılarını inceleyebileceğin ayrı bir referans kütüphanesidir.",
          },
        ],
      },
    },
    abTesting: {
      metaTitle: "A/B Test Playbook - Ali Demirbaş",
      metaDesc: "{count} A/B test senaryosu. Ne test edilir, hangi KPI izlenir, ne yapılmamalı.",
      eyebrow: "Lab / A/B Test Playbook",
      title: "Test et, öğren, geliştir",
      sub: "Kullanıcı kazanımından elde tutmaya kadar her aşama için {count} A/B test senaryosu. Her birinde neyin test edildiği ve nasıl ölçüleceği yazılı.",
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
        title: "Her senaryo aynı üç kutuyla gelir",
        boxes: [
          { title: "Test edilmesi gerekenler", desc: "Deneyin cevaplaması gereken somut sorular. Sonucun çözmesi gereken her hipotez, tek tek." },
          { title: "Takip edilecek KPI'lar", desc: "Kazananı belirleyen tek bir birincil metrik, artı iyileşirken bozulmaması gereken en az bir guardrail." },
          { title: "Yapılmaması gerekenler", desc: "Testi sessizce geçersiz kılan hatalar. Sonuçlar okunamaz hâle gelene kadar kimsenin fark etmediği türden." },
        ],
      },
      principlesTitle: "Geçerli bir test için beş kural",
      principles: [
        { title: "Tek değişkeni değiştir", desc: "Her varyant çifti tam olarak bir şeyi değiştirir. Çok değişkenli bir test istenirse ayrı testlere bölünür. Israr edilirse çıktı açıkça 'sonuç hangi değişiklikten geldi bilinemeyecek' der." },
        { title: "Tek birincil metrik", desc: "Listedeki ilk KPI kazananı belirler. Beş metriği eşit önemde sunmak, kaybeden bir testi kazanan ilan etmenin en kolay yoludur." },
        { title: "Her testte bir guardrail tanımla", desc: "Her senaryo, bozulmaması gereken en az bir metrikle gelir: marj, iade oranı, hız, destek talebi. Bir değişiklik erişilebilirliği etkileyebilecekse, o da bir guardrail adayıdır." },
        { title: "Güvenlik adımlarını kaldırmayı test etme", desc: "CAPTCHA, kimlik veya yaş doğrulama, iki adımlı giriş, yasal onay adımları: istense bile hiçbir zaman kaldırılacak sürtünme olarak önerilmez. Bunlar koruma içindir, dönüşüm için değil; eklenti bunu söyler ve senaryo üretmez." },
        { title: "Kanıtın gücünü açıkça belirt", desc: "Her öneri, arkasındaki kanıtın ne kadar güçlü olduğunu söyler: kullanıcının kendi verisi, arşiv emsali, sektör örüntüsü ya da sezgi. Zayıf kanıtlı bir fikir yine sunulabilir ama asla kesinmiş gibi giydirilmez." },
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
      faqTitle: "Sık sorulan sorular",
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
          surfaces: "sayfa",
          categories: "kategori",
          guardrails: "guardrail kuralı",
        },
        story1: {
          eyebrow: "Kapsam",
          title: "Sorunun olduğu sayfadan başla.",
          body: "Her senaryo ait olduğu sayfaya göre dosyalanmış. Ürün sayfası testi ile ödeme testi farklı şekillerde bozulur. Böylece neyi değiştireceğini tartışmadan önce sorunun nerede olduğuna göre daraltırsın.",
          caption: "Sayfaya göre senaryolar",
        },
        story2: {
          eyebrow: "Disiplin",
          title: "Her testte tek değişkeni değiştir.",
          body: "Her senaryo değişen tek alanı adlandırır ve sayfanın geri kalanını aynı tutar. Kütüphanenin büyük bölümü kontrol ve varyant yazılmış hâlde gelir; böylece sessizce iki şeyi değiştirip sonuca “bulgu” demenin yeri kalmaz.",
          caption: "Kontrol / varyant",
          diffNote: "Sayfadaki diğer her şey aynı kalır.",
          sidesNote: "senaryo iki tarafı yazılmış hâlde geliyor",
        },
        story3: {
          eyebrow: "Guardrail'ler",
          title: "Her senaryo, bozulmaması gerekenle birlikte gelir.",
          body: "Guardrail, birincil metrik iyileşirken yerinde kalması gereken metriktir: marj, iade oranı, kupon kullanımı, erişilebilirlik. Kural en az bir tane ister; kütüphanedeki her senaryoda beş tane var.",
          caption: "Yapılmaması gerekenler",
          ledgerNote: "kütüphane genelinde guardrail kuralı",
        },
        library: {
          eyebrow: "Kütüphane",
          title: "{count} senaryo. Bir sonrakini buradan seç.",
          body: "Kategoriye ve sayfaya göre dosyalanmış, aranabilir ve hiçbir şey kurmadan okunabilir. Her kayıt test edilen değişkeni, birincil KPI'ı ve guardrail'leri taşır.",
          cta: "Tüm senaryoları aç",
          decidedBy: "Karar metriği",
          filterLabel: "Kategoriye göre gez",
        },
        how: {
          eyebrow: "Nasıl çalışır",
          title: "Senaryoyu bul, testi kur, sonucu oku.",
          body: "Senaryo seçiminden sonucu yorumlamaya uzanan üç adım.",
          steps: [
            { title: "Fırsatı bul", body: "Çalıştığın sayfaya göre daralt, sonra o sayfa için dosyalanmış senaryolardan seç." },
            { title: "Deneyi tasarla", body: "Senaryo hipotezi, tek bir birincil KPI'ı ve guardrail'leri verir. Yalnızca tek değişken değişir." },
            { title: "Sonucu oku", body: "Grafikle değil istatistikle karar ver. Çift haneli bir artış hâlâ gürültü olabilir." },
          ],
          step1: { label: "Sayfa", matches: "senaryo bu sayfada" },
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
      title: "Konuşmak istersen buradayım.",
      body: "Bir soru sormak ya da fikir paylaşmak istersen bana ulaşabilirsin.",
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
      quickLinks: "Sayfalar",
      projects: "Lab projeleri",
      connect: "İletişim",
      home: "Ana sayfa",
    },
  },
} as const;

export const LINKEDIN = "https://www.linkedin.com/in/ali-demirbas/";
export const EMAIL = "mehmetalidemirbas@gmail.com";
