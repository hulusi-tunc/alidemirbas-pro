export type Lang = "en" | "tr";

export const copy = {
  en: {
    nav: { about: "About", aboutHref: "/about", lab: "Lab", labHref: "/lab", calculators: "Calculators", calculatorsHref: "/calculators", blog: "Blog", blogHref: "/blog", stack: "Tools", stackHref: "/stack", contact: "Contact", contactHref: "/contact", cta: "Get in touch", lang: "TR", langHref: "/tr" },
    hero: {
      line1: "A full stack marketer.",
      lead: "Hi, I'm Ali. I blend growth, analytics, product marketing, and performance marketing to help products find traction and scale.",
      sub: "Right now I'm responsible for mobile app growth at Aksigorta. Before that, growth teams at Vodafone, Getir and Wingie Enuygun Group.",
      ctaPrimary: "Get in touch",
      ctaSecondary: "LinkedIn",
      portraitPill: "Istanbul",
      cards: {
        current: {
          eyebrow: "Current role",
          title: "Currently at Aksigorta",
          body: "I lead mobile app growth, from bringing new users in to giving them a reason to return.",
          meta: "Mobile App Growth Lead",
          items: ["Acquisition", "Activation", "Engagement", "Retention"],
          cta: "More about my role",
          href: "/about",
        },
        funnel: {
          eyebrow: "Focus",
          title: "Full-Funnel Growth",
          body: "My work has moved from digital marketing to acquisition, CRM, lifecycle and product growth. Today I connect those parts instead of treating them as separate jobs.",
          meta: "From acquisition to win-back",
          items: ["Acquisition", "Activation", "Engagement", "Retention", "Win-back"],
          cta: "How I work",
          href: "#work",
        },
        selected: {
          eyebrow: "Built from practice",
          title: "Selected Work",
          body: "Most things I build start with a problem I keep running into at work: mapping a journey, planning a test or making a metric easier to read.",
          meta: "Open-source projects",
          items: ["Journey Library", "A/B Test Playbook", "Google Ads Change History", "Marketing Calculators"],
          cta: "Open the Lab",
          href: "/lab",
        },
        industries: {
          eyebrow: "Experience",
          title: "Industries",
          body: "My career has taken me through insurance, telecom, quick commerce, travel, automotive and media.",
          meta: "Cross-industry experience",
          items: ["Insurance", "Telecom", "Quick commerce", "Travel", "Automotive", "Media"],
          cta: "View experience",
          href: "/about",
        },
      },
    },
    /* Home page only: the ranked "what I do" block and the calculators band. The hero's own headline and lead stay
       in `hero` above; nothing here restates them. */
    home: {
      work: {
        eyebrow: "What I do",
        title: "I approach growth through data, testing, and user behavior.",
        lede: "Some of the areas I work in, and the tools I built for them.",
        builtFor: "Built for this",
        services: [
          {
            tool: "dashboard-builder",
            title: "Measurement setup",
            body: "Event design in GA4 and GTM, Adjust setup, and finding where the gap comes from when two platforms report different numbers for the same week. What's left is an event structure the team can query, with every definition written down.",
          },
          {
            tool: "lifecycle-card-archive",
            title: "Lifecycle and CRM programs",
            body: "I design the journeys a user goes through from first step to win-back, and write down why each message actually gets sent.",
          },
          {
            tool: "google-ads-change-history-dashboard",
            title: "Google Ads Change History",
            body: "I track changes made across Google Ads accounts alongside date, campaign and performance data, so a shift in results doesn't turn into a guessing game.",
          },
          {
            tool: "ab-test-playbook",
            title: "Test, learn, improve",
            body: "I collected {abTestCount} A/B test scenarios covering every stage from acquisition to retention. Each one states what is being tested and how it should be measured.",
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
      bio: { title: "A career across growth, CRM and measurement." },
    },
    lab: {
      label: "Lab",
      title: "Tools, libraries and experiments from the work.",
      // REDESIGN ROUND (LabIndexPage.tsx): rewritten for the new title ->
      // tags -> proof -> description -> CTA hierarchy. `tags` is PURE
      // semantic taxonomy (no numbers mixed in) and `proof` is a single,
      // separately-rendered evidence line. Where a proof uses a number,
      // it traces to live project data: the A/B dataset, Dashboard
      // Builder's template list or Numerspace's generated catalogue.
      // Journey counts stay out of the marketing copy so the page does
      // not need rewriting when the canonical library changes.
      // Link labels are standardized site-wide per the new CTA system:
      // "Open the project page" for the one internal route each project has (a
      // project with no internal page just skips it), "GitHub"/"Live
      // demo" for external secondaries, "Visit Numerspace" for the one
      // external-only product. `tags` is consumed ONLY by
      // LabIndexPage.tsx (verified - not by SiteFooter or the header's
      // LabNavDropdown, which only read name/desc/links), so this
      // reshape doesn't touch either of those.
      intro: "Most projects here began with a recurring problem: a journey that was hard to map, a test that was easy to misread or a report whose numbers did not quite agree. I built the tool I wanted to use, then kept it open for others to inspect and adapt.",
      viewAll: "Explore the archive",
      // `short` is the project's compact name - the hero's tab rail, the
      // header dropdown and the section eyebrows all use it, because the
      // full names run to five words and a tab cannot. `tagline` is the
      // one-line claim under the name in the dropdown and the hero rail;
      // any number in one must trace to the same source as `proof`.
      projects: [
        {
          name: "Journey Builder",
          slug: "claude-lifecycle",
          short: "Journey Builder",
          tagline: "Turn the signals you track into journeys you can run",
          desc: "Reads the events and parameters already available, shows which journey patterns the data can support, then builds the trigger, decisions, waits, channel steps and exits.",
          tags: ["Lifecycle", "CRM", "Claude Code"],
          proof: "Data quality checked before generation",
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
          tagline: "See the trigger, timing, channels and outcome in one flow",
          desc: "A practical reference library for lifecycle and CRM work. Each journey shows the trigger, waits, decisions, channel sequence, handoffs and stop conditions in one place.",
          tags: ["Lifecycle", "Library"],
          proof: "Branching flows · channel-aware",
          links: [{ label: "Open the project page", href: "/lab/journeys" }],
        },
        {
          name: "A/B Test Playbook",
          slug: "ab-test-playbook",
          short: "A/B Test Playbook",
          tagline: "Move from an observed problem to a valid test",
          desc: "A structured experiment library. Each scenario keeps the hypothesis, the one variable that changes, the decision metric, guardrails and setup risks together.",
          tags: ["A/B testing", "CRO", "Claude Code"],
          proof: "{abTestCount} scenarios",
          links: [
            { label: "Open the project page", href: "/lab/ab-testing" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/ab-test-playbook" },
          ],
        },
        {
          name: "Dashboard Builder",
          slug: "dashboard-builder",
          short: "Dashboard Builder",
          tagline: "Check the comparison before drawing the chart",
          desc: "Reviews reports from different platforms, classifies which metrics can be compared safely and leaves out combinations that would produce a misleading dashboard.",
          tags: ["Analytics", "Data quality", "Claude Code"],
          proof: "{dashboardTemplateCount} dashboard templates",
          links: [
            { label: "Open the project page", href: "/lab/dashboard-builder" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/dashboard-builder" },
          ],
        },
        {
          name: "Google Ads Change History",
          slug: "google-ads-change-history-dashboard",
          short: "Google Ads Change History",
          tagline: "Find the change behind the movement",
          desc: "Turns an exported Google Ads change history into a searchable offline dashboard. Filter by account, campaign, date or category, then inspect the old and new values together.",
          tags: ["Google Ads", "Analytics", "Python"],
          proof: "No dependencies · Built-in self-test",
          links: [
            { label: "Open the project page", href: "/lab/google-ads-change-history-dashboard" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/google-ads-change-history-dashboard" },
          ],
        },
        {
          name: "Numerspace",
          slug: "numerspace",
          short: "Numerspace",
          tagline: "Open a calculator, enter what you know, check the result",
          desc: "A bilingual library of practical calculators for marketing, money, health, work and everyday questions. No account, email gate or download required.",
          tags: ["Web app", "Calculators"],
          // Was "75+ tools" - stale. numerspace.com's own sitemap lists 97
          // calculator pages per language across 13 tool-bearing categories
          // (blog posts excluded); counted, not taken from the site's own
          // "140+" marketing line.
          proof: "{numerspaceCount} calculators · {numerspaceCategories} categories",
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
        nodesLabel: "steps",
        practitioner: {
          preset: "Preset",
          presetOf: "preset of",
        },
        /* The canvas caption's own count words. Singular/plural pairs rather
           than one invariant form, because a journey really can carry exactly
           one handoff or one exit - `nodesLabel` above gets away with a single
           form only because no journey has one node. Turkish takes no plural
           after a numeral, so both entries there are deliberately identical. */
        decisionsLabel: ["decision", "decisions"],
        exitsLabel: ["exit", "exits"],
        handoffsLabel: ["handoff", "handoffs"],
        entityLabel: "Scope",
        competesLabel: "Competes",
        distinctLabel: "Distinct from",
        preemptedLabel: "Pre-empted by",
        guardrailsLabel: "Guardrails",
        ruleLabel: "Core rule",
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
        shapeLabel: "Flow structure",
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
        title: "Start with a signal. Follow the journey to its outcome.",
        sub: "A practical reference library for lifecycle and CRM work. Every flow shows what starts it, where it waits or branches, which channel acts next, when another journey takes over and what stops the sequence.",
        ctaCommunication: "Customer journeys",
        proof: ["Behavior-led triggers", "Channel sequences", "Clear exits"],
        split: {
          eyebrow: "Where to start",
          title: "Start with the journeys that reach a customer.",
          body: "Browse the flows by category, goal or channel, then open one to inspect its trigger, branches and outcome.",
          lines: {
            "customer-journeys": "Triggered flows that message a customer or route work to a team.",
          },
          largest: "Largest journeys",
        },
        stories: {
          eyebrow: "The working model",
          title: "A useful journey makes three things explicit: what starts it, who it affects and when it stops.",
        },
        final: {
          eyebrow: "Start reading",
          title: "Choose the journey that matches the problem.",
          body: "Every journey can be searched by category and goal, then opened to inspect its flow.",
        },
      },
      journeysSplit: {
        /* The single public Customer Journey surface. */
        surfaceLabels: {
          "customer-journeys": "Customer journeys",
        },
        surfaceBlurbs: {
          "customer-journeys": "Flows that reach the customer directly. The trigger, timing, channel sequence, handoffs and stop conditions are visible in one place.",
        },
        surfaces: {
          "customer-journeys": {
            title: "Customer journeys",
            intro: "{count} customer journeys. Each one shows the trigger, timing, decisions, channel sequence, handoffs and exit conditions. Open a journey to see the flow and the few rules that keep it honest.",
          },
        },
        railTitle: "Categories",
        presetsTitle: "Presets",
        presetsIntro: "A preset is a journey tuned for one specific use. The flow, the touches and the exits stay the same; only the values, the destination and the vocabulary change. Opening a preset opens its parent with those values applied.",
        presetBadge: "Preset",
        presetOf: "preset of",
        browseAll: "Browse all {count}",
        showMore: "Show more ({count})",
        showLess: "Show less",
        /* Per-surface singular/plural pair, same convention as the journey
           detail count labels. */
        journeysLabel: {
          "customer-journeys": ["journey", "journeys"],
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
        "I started in digital marketing, then moved through user acquisition, CRM analytics, lifecycle and mobile product growth. Today I see them as different parts of the same customer journey, not separate disciplines.",
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
      title: "The tools behind the work.",
      sub: "What I use to collect data, understand behavior, run lifecycle programs, test ideas and turn the result into something people can act on.",
      // Home page teaser only - the /stack page keeps its own title/sub above.
      homeTitle: "Tools I use",
      homeIntro: "Tools I use to collect data, analyze it, run tests, and turn findings into action.",
      homeMore: "See the full stack",
    },
    contact: {
      metaTitle: "Contact - Ali Demirbaş",
      metaDesc: "Get in touch by email or on LinkedIn.",
      eyebrow: "Contact",
      title: "Have something worth comparing notes on?",
      sub: "If something here sparked a question, a counterpoint or a new idea, send me a note. I read every message myself.",
      linkedinLabel: "Connect on LinkedIn",
      emailPill: "Email",
      reasonsTitle: "A few reasons to reach out",
      reasons: [
        { title: "Compare notes", desc: "On growth, CRM, experimentation, measurement or a problem you are working through." },
        { title: "Talk about a project", desc: "If one of the tools or libraries here is useful, confusing or missing something." },
        { title: "Just say hello", desc: "You do not need a formal reason. A short introduction is enough." },
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
        title: "Open a journey and follow the decisions step by step.",
        body: "The flows are organized around lifecycle problems rather than industries. Each one shows the trigger, decisions, timing, channel roles, exits and measurement plan without prescribing the message copy.",
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
            q: "Which journey patterns can it build?",
            a: "The available patterns depend on the events and parameters in your data. If a pattern is supported, it can be built; if not, the builder shows which signal is missing instead of assuming it exists.",
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
      sub: "A library of structured experiment briefs. Each scenario names the problem, the one variable that changes, the metric that decides the result and the guardrails that must hold.",
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
        title: "Before the test starts, every scenario makes three decisions clear.",
        boxes: [
          { title: "What changes", desc: "The observed problem, the hypothesis and the single variable that separates the control from the variant." },
          { title: "What decides", desc: "One primary KPI determines the result. Supporting metrics explain it; they do not replace it." },
          { title: "What must hold", desc: "Guardrails protect the parts of the experience or business that should not get worse while the primary metric improves." },
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
          eyebrow: "Evidence",
          title: "Start with evidence, then narrow by page.",
          body: "Use analytics, research or customer feedback to locate the problem first. Then narrow the library to that part of the experience and choose a scenario that matches what you observed.",
          caption: "Scenarios by page",
        },
        story2: {
          eyebrow: "Hypothesis",
          title: "Write the hypothesis before building the variant.",
          body: "State the observed problem, the change you expect to help and the outcome you expect to move. Then change one variable and keep the rest of the experience stable.",
          caption: "Control vs variant",
          diffNote: "Everything else on the page stays identical.",
          sidesNote: "scenarios ship with the two sides already written",
        },
        story3: {
          eyebrow: "Guardrails",
          title: "Decide what must not get worse.",
          body: "A lift is not a win if it damages margin, refund rate, coupon usage, accessibility or another important part of the experience. Set those guardrails before reading the result.",
          caption: "What not to do",
          ledgerNote: "guardrail rules across the library",
        },
        library: {
          eyebrow: "The library",
          title: "Find a scenario that matches the problem you observed.",
          body: "Filter by category and page. Each entry keeps the hypothesis, the changing variable, the primary KPI and the guardrails together.",
          cta: "Browse all tests",
          decidedBy: "Decided by",
          filterLabel: "Browse by category",
        },
        how: {
          eyebrow: "How it works",
          title: "Move from evidence to a decision.",
          body: "Three steps from a real observation to a result you can act on.",
          steps: [
            { title: "Find the evidence", body: "Start with the behavior, research finding or customer feedback that points to a problem." },
            { title: "Frame the experiment", body: "Write the hypothesis, change one variable, choose one primary KPI and set the guardrails." },
            { title: "Read the result", body: "Use the planned sample, statistics and guardrails together. A large-looking lift can still be noise." },
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
      title: "If this work overlaps with yours, let's talk.",
      body: "Send me a note about growth, CRM, measurement or one of the projects here. A question, a counterpoint or a simple hello all work.",
      button: "mehmetalidemirbas@gmail.com",
      linkedin: "Connect on LinkedIn",
    },
    footer: {
      left: "Ali Demirbaş",
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
      line1: "Uçtan uca pazarlama uzmanı.",
      lead: "Selam, ben Ali. Ürünlerin ivme kazanması ve ölçeklenmesi için büyüme, analitik, ürün pazarlaması ve performans pazarlamasını harmanlıyorum.",
      sub: "Şu an Aksigorta'da mobil uygulamanın büyümesinden sorumluyum. Öncesinde Vodafone, Getir ve Wingie Enuygun Group'ta büyüme ekiplerindeydim.",
      ctaPrimary: "İletişime geç",
      ctaSecondary: "LinkedIn",
      portraitPill: "İstanbul",
      cards: {
        current: {
          eyebrow: "Güncel rol",
          title: "Şu anda Aksigorta'da",
          body: "Yeni kullanıcı kazanmaktan uygulamaya geri dönmeleri için neden yaratmaya kadar mobil büyümeyi yönetiyorum.",
          meta: "Mobil Uygulama Büyüme Lideri",
          items: ["Acquisition", "Activation", "Engagement", "Retention"],
          cta: "Rolüm hakkında",
          href: "/tr/about",
        },
        funnel: {
          eyebrow: "Odak",
          title: "Full-Funnel Growth",
          body: "Dijital pazarlamadan kullanıcı kazanımı, CRM, lifecycle ve ürün büyümesine uzanan bir çizgide çalıştım. Bugün bunları ayrı işler değil, birbirine bağlı parçalar olarak görüyorum.",
          meta: "Acquisition'dan win-back'e",
          items: ["Acquisition", "Activation", "Engagement", "Retention", "Win-back"],
          cta: "Nasıl çalışıyorum",
          href: "#work",
        },
        selected: {
          eyebrow: "İşin içinden çıkanlar",
          title: "Öne Çıkan İşler",
          body: "Ürettiklerimin çoğu işte tekrar tekrar karşıma çıkan bir problemle başlıyor: bir journey'yi görmek, bir testi planlamak ya da bir metriği daha kolay okumak.",
          meta: "Açık kaynak projeler",
          items: ["Journey Library", "A/B Test Playbook", "Google Ads Change History", "Pazarlama Hesaplayıcıları"],
          cta: "Lab'i aç",
          href: "/tr/lab",
        },
        industries: {
          eyebrow: "Deneyim",
          title: "Sektörler",
          body: "Kariyerim boyunca sigorta, telekom, hızlı teslimat, seyahat, otomotiv ve medya sektörlerinde çalıştım.",
          meta: "Farklı sektörlerde deneyim",
          items: ["Sigorta", "Telekom", "Hızlı teslimat", "Seyahat", "Otomotiv", "Medya"],
          cta: "Deneyimi gör",
          href: "/tr/about",
        },
      },
    },
    home: {
      work: {
        eyebrow: "Ne yapıyorum",
        title: "Büyümeyi veri, test ve kullanıcı davranışı üzerinden ele alıyorum.",
        lede: "Çalıştığım alanlar ve bunlar için yaptığım araçlar.",
        builtFor: "Bunun için yaptım",
        services: [
          {
            tool: "dashboard-builder",
            title: "Ölçüm altyapısı",
            body: "GA4 ve GTM'de event tasarımı, Adjust kurulumu ve iki platform aynı hafta için farklı sayı verdiğinde farkın nereden geldiğini bulmak. Sonunda ekibin sorgulayabildiği, tanımı belli bir event yapısı kalır.",
          },
          {
            tool: "lifecycle-card-archive",
            title: "Yaşam döngüsü ve CRM programları",
            body: "Kullanıcının ilk adımdan geri kazanıma kadar geçtiği yolculukları tasarlıyorum; her mesajın neden gittiğini de yazılı hâle getiriyorum.",
          },
          {
            tool: "google-ads-change-history-dashboard",
            title: "Google Ads Değişiklik Geçmişi",
            body: "Google Ads hesaplarında yapılan değişiklikleri tarih, kampanya ve performans verisiyle birlikte takip ediyorum; sonuç değiştiğinde tahmine değil, kayda bakıyorum.",
          },
          {
            tool: "ab-test-playbook",
            title: "Test et, öğren, geliştir",
            body: "Kullanıcı kazanımından elde tutmaya kadar her aşama için {abTestCount} A/B test senaryosu topladım. Her birinde neyin test edildiği ve nasıl ölçüleceği yazılı.",
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
      bio: { title: "Growth, CRM ve ölçüm etrafında gelişen bir kariyer." },
    },
    lab: {
      label: "Lab",
      title: "İşin içinden çıkan araçlar, kütüphaneler ve deneyler.",
      intro: "Buradaki projelerin çoğu tekrar karşıma çıkan bir problemle başladı: haritalaması zor bir journey, yanlış okunmaya açık bir test ya da rakamları birbiriyle uyuşmayan bir rapor. Önce kullanmak istediğim aracı yaptım, sonra başkalarının da inceleyip uyarlayabilmesi için açık tuttum.",
      projects: [
        {
          name: "Journey Oluşturucu",
          slug: "claude-lifecycle",
          short: "Journey Oluşturucu",
          tagline: "Takip ettiğin sinyalleri çalışabilir journey'lere dönüştür",
          desc: "Mevcut event ve parametreleri okur, verinin hangi journey desenlerini desteklediğini gösterir; ardından tetikleyici, karar, bekleme, kanal adımları ve çıkışları kurar.",
          tags: ["Lifecycle", "CRM", "Claude Code"],
          proof: "Üretimden önce veri kalitesi kontrolü",
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
          tagline: "Tetikleyiciyi, zamanlamayı, kanalları ve sonucu tek akışta gör",
          desc: "Lifecycle ve CRM çalışmaları için pratik bir referans kütüphanesi. Her akış tetikleyiciyi, beklemeleri, kararları, kanal sırasını, devirleri ve durma koşullarını tek yerde gösterir.",
          tags: ["Lifecycle", "Kütüphane"],
          proof: "Dallanan akışlar · kanal odaklı",
          links: [{ label: "Proje sayfasını aç", href: "/tr/lab/journeys" }],
        },
        {
          name: "A/B Test Playbook",
          slug: "ab-test-playbook",
          short: "A/B Test Playbook",
          tagline: "Gözlenen problemden geçerli bir teste ilerle",
          desc: "Yapılandırılmış bir deney kütüphanesi. Her senaryoda hipotez, değişen tek alan, karar metriği, guardrail'ler ve kurulum riskleri birlikte yer alır.",
          tags: ["A/B test", "CRO", "Claude Code"],
          proof: "{abTestCount} senaryo",
          links: [
            { label: "Proje sayfasını aç", href: "/tr/lab/ab-testing" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/ab-test-playbook" },
          ],
        },
        {
          name: "Dashboard Oluşturucu",
          slug: "dashboard-builder",
          short: "Dashboard Oluşturucu",
          tagline: "Grafiği çizmeden önce karşılaştırmayı kontrol et",
          desc: "Farklı platformlardan gelen raporları inceler, hangi metriklerin güvenle karşılaştırılabildiğini sınıflandırır ve yanıltıcı bir dashboard üretecek eşleşmeleri dışarıda bırakır.",
          tags: ["Analitik", "Veri kalitesi", "Claude Code"],
          proof: "{dashboardTemplateCount} dashboard şablonu",
          links: [
            { label: "Proje sayfasını aç", href: "/tr/lab/dashboard-builder" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/dashboard-builder" },
          ],
        },
        {
          name: "Google Ads Değişiklik Geçmişi",
          slug: "google-ads-change-history-dashboard",
          short: "Google Ads Değişiklik Geçmişi",
          tagline: "Hareketin arkasındaki değişikliği bul",
          desc: "Dışa aktardığın Google Ads değişiklik geçmişini çevrimdışı çalışan, aranabilir bir dashboard'a dönüştürür. Hesap, kampanya, tarih veya kategoriye göre filtreleyip eski ve yeni değeri birlikte inceleyebilirsin.",
          tags: ["Google Ads", "Analitik", "Python"],
          proof: "Bağımlılık yok · Yerleşik self-test",
          links: [
            { label: "Proje sayfasını aç", href: "/tr/lab/google-ads-change-history-dashboard" },
            { label: "GitHub", href: "https://github.com/ali-demirbas/google-ads-change-history-dashboard" },
          ],
        },
        {
          name: "Numerspace",
          slug: "numerspace",
          short: "Numerspace",
          tagline: "Aracı aç, bildiklerini gir, sonucu kontrol et",
          desc: "Pazarlama, finans, sağlık, iş ve günlük sorular için iki dilli pratik hesaplayıcılar. Üyelik, e-posta formu veya indirme gerekmiyor.",
          tags: ["Web uygulaması", "Hesaplayıcılar"],
          proof: "{numerspaceCount} hesaplayıcı · {numerspaceCategories} kategori",
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
        title: "Müşteri Akışları Kütüphanesi",
        intro:
          "{categories} başlık altında, sektörden bağımsız {count} müşteri akışı. Ara ya da hedefe göre filtrele; tetikleyiciyi, dallanmaları ve sonucu birlikte incele.",
        searchPlaceholder: "Akış ara...",
        goalLabel: "Hedef",
        allGoals: "Tüm hedefler",
        removeFilterLabel: "{label} filtresini kaldır",
        clearAll: "Temizle",
        results: "akış",
        empty: "Bu filtrelerle eşleşen kayıt yok.",
        nodesLabel: "adım",
        practitioner: {
          preset: "Hazır akış",
          presetOf: "temel akış:",
        },
        decisionsLabel: ["koşul", "koşul"],
        exitsLabel: ["çıkış", "çıkış"],
        handoffsLabel: ["devir", "devir"],
        entityLabel: "Kapsam",
        competesLabel: "Rekabet",
        distinctLabel: "Şundan farklı",
        preemptedLabel: "Şu olursa biter",
        guardrailsLabel: "Koruma kuralları",
        ruleLabel: "Temel kural",
        terminalLabel: "Son durum",
        close: "Kapat",
        backToLibrary: "Tüm akışlar",
        mergedNote:
          "{from}, {to} içine alındı. Bu kimlik artık ayrı bir journey değil; kapsadığı her şey burada.",
        canvas: {
          entry: "Giriş",
          zoomIn: "Yakınlaştır",
          zoomOut: "Uzaklaştır",
          fitToView: "Sığdır",
          reset: "Yakınlaştırmayı sıfırla",
        },
        tabs: { info: "Bilgi", canvas: "Akış" },
        openCanvas: "Akışı aç",
        shapeLabel: "Akış yapısı",
        card: { minimize: "Küçült", expand: "Genişlet" },
      },
      journeysHub: {
        eyebrow: "Lab / Müşteri Akışları",
        title: "Bir sinyalle başla, sonuca kadar ilerle.",
        sub: "Lifecycle ve CRM çalışmaları için pratik bir referans kütüphanesi. Her akış neyin tetiklediğini, nerede beklediğini veya dallandığını, sırada hangi kanalın devreye girdiğini ve akışın ne zaman durduğunu gösterir.",
        ctaCommunication: "Müşteri akışları",
        proof: ["Davranış tetikleyicileri", "Kanal sıraları", "Net çıkışlar"],
        split: {
          eyebrow: "Nereden başlamalı",
          title: "Önce müşteriye ulaşan akışlara bak.",
          body: "Akışları başlığa, hedefe veya kanala göre filtrele; ardından tetikleyiciyi, dallanmaları ve sonucu incelemek için kaydı aç.",
          lines: {
            "customer-journeys": "Müşteriye mesaj gönderen ya da işi bir ekibe devreden tetiklenmiş akışlar.",
          },
          largest: "En kapsamlı akışlar",
        },
        stories: {
          eyebrow: "Çalışma modeli",
          title: "İyi bir akış üç şeyi netleştirir: ne tetikler, kimi etkiler, ne zaman durur.",
        },
        final: {
          eyebrow: "Okumaya başla",
          title: "Probleme uyan akışı seç.",
          body: "Akışları başlığa ve hedefe göre arayabilir, ardından ayrıntılarını inceleyebilirsin.",
        },
      },
      journeysSplit: {
        surfaceLabels: {
          "customer-journeys": "Müşteri akışları",
        },
        surfaceBlurbs: {
          "customer-journeys": "Doğrudan müşteriye ulaşan akışlar. Tetikleyici, zamanlama, kanal sırası, devirler ve durma koşulları birlikte görünür.",
        },
        surfaces: {
          "customer-journeys": {
            title: "Müşteri akışları",
            intro: "{count} müşteri akışı. Her biri tetikleyiciyi, zamanlamayı, kararları, kanal sırasını, devirleri ve çıkış koşullarını gösterir. Bir akışı açtığında akışın kendisini ve onu doğru tutan birkaç temel kuralı birlikte görürsün.",
          },
        },
        railTitle: "Kategoriler",
        presetsTitle: "Hazır akışlar",
        presetsIntro: "Sık karşılaşılan kullanım örnekleri için hazırlanmış akışlar. Birini açtığında tetikleyiciyi, temasları ve çıkışları o örneğin diliyle görürsün.",
        presetBadge: "Hazır akış",
        presetOf: "Temel akış:",
        browseAll: "{count} kaydın tamamına bak",
        showMore: "Daha fazla göster ({count})",
        showLess: "Daha az göster",
        // Turkish takes no plural after a numeral, so both entries in each
        // pair are deliberately identical - same as page.decisionsLabel
        // above. Keyed by SurfaceKey - see the EN block's comment.
        journeysLabel: {
          "customer-journeys": ["akış", "akış"],
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
        "Dijital pazarlamayla başladım; sonra kullanıcı kazanımı, CRM analitiği, lifecycle ve mobil ürün büyümesine doğru ilerledim. Bugün bunları ayrı uzmanlıklar değil, aynı müşteri yolculuğunun farklı parçaları olarak görüyorum.",
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
      title: "Yaptığım işin arkasındaki araçlar.",
      sub: "Veriyi toplamak, kullanıcı davranışını anlamak, lifecycle programlarını yürütmek, fikirleri test etmek ve sonucu aksiyona çevirmek için kullandığım araçlar.",
      homeTitle: "Kullandığım araçlar",
      homeIntro: "Veriyi toplamak, analiz etmek, test etmek ve aksiyona çevirmek için kullandığım araçlar.",
      homeMore: "Tüm araçları gör",
    },
    contact: {
      metaTitle: "İletişim - Ali Demirbaş",
      metaDesc: "E-posta ve LinkedIn üzerinden iletişim.",
      eyebrow: "İletişim",
      title: "Üzerine konuşmaya değer bir şey mi var?",
      sub: "Buradaki bir şey sende soru, itiraz ya da yeni bir fikir uyandırdıysa yazabilirsin. Her mesajı kendim okuyorum.",
      linkedinLabel: "LinkedIn'de bağlantı kur",
      emailPill: "E-posta",
      reasonsTitle: "Bana neden yazabilirsin?",
      reasons: [
        { title: "Notları karşılaştırmak için", desc: "Growth, CRM, deneyler, ölçümleme ya da üzerinde çalıştığın bir problem hakkında." },
        { title: "Bir projeyi konuşmak için", desc: "Buradaki araçlardan biri işine yaradıysa, kafanı karıştırdıysa ya da bir şeyi eksikse." },
        { title: "Sadece merhaba demek için", desc: "Resmî bir nedene gerek yok. Kısa bir tanışma mesajı yeterli." },
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
        title: "Bir journey aç, kararları adım adım takip et.",
        body: "Akışlar sektöre göre değil, lifecycle problemine göre düzenlenir. Her biri tetikleyiciyi, kararları, zamanlamayı, kanal rollerini, çıkışları ve ölçüm planını mesaj metni dayatmadan gösterir.",
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
            q: "Hangi journey desenlerini kurabilir?",
            a: "Kullanılabilir desenler verindeki event ve parametrelere bağlıdır. Veri destekliyorsa desen kurulabilir; desteklemiyorsa sistem sinyali varmış gibi davranmak yerine neyin eksik olduğunu gösterir.",
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
      sub: "Deney fikrini test planına çevirmek için hazırlanmış senaryolar. Her biri problemi, değişecek tek alanı, sonucu belirleyecek metriği ve korunması gereken guardrail'leri birlikte gösterir.",
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
        title: "Test başlamadan önce üç karar net olmalı.",
        boxes: [
          { title: "Neyi değiştiriyorsun?", desc: "Gözlenen problem, hipotez ve control ile variant'ı ayıran tek değişken." },
          { title: "Sonucu ne belirleyecek?", desc: "Kararı tek bir birincil KPI verir. Diğer metrikler sonucu açıklar, onun yerine geçmez." },
          { title: "Ne bozulmamalı?", desc: "Birincil metrik iyileşirken deneyimin ya da işin zarar görmemesi gereken taraflarını guardrail'ler korur." },
        ],
      },
      principlesTitle: "Geçerli bir test için beş kural",
      principles: [
        { title: "Tek değişkeni değiştir", desc: "Her control ve variant çifti yalnızca bir şeyi değiştirir. Birden fazla değişken test edilecekse ayrı testlere bölünür; aksi durumda sonucun hangi değişiklikten geldiği bilinemez." },
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
          control: "Control",
          variant: "Variant",
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
          eyebrow: "Kanıt",
          title: "Önce kanıtı bul, sonra sayfaya göre daralt.",
          body: "Önce analitik, araştırma ya da müşteri geri bildirimiyle problemin yerini bul. Sonra kütüphaneyi deneyimin o bölümüne göre daralt ve gözlemine uyan senaryoyu seç.",
          caption: "Sayfaya göre senaryolar",
        },
        story2: {
          eyebrow: "Hipotez",
          title: "Variant'ı kurmadan önce hipotezi yaz.",
          body: "Gözlenen problemi, yardımcı olmasını beklediğin değişikliği ve hareket etmesini beklediğin sonucu yaz. Ardından tek değişkeni değiştir, deneyimin geri kalanını sabit tut.",
          caption: "Control / variant",
          diffNote: "Sayfadaki diğer her şey aynı kalır.",
          sidesNote: "senaryo iki tarafı yazılmış hâlde geliyor",
        },
        story3: {
          eyebrow: "Guardrail'ler",
          title: "Neyin bozulmaması gerektiğine baştan karar ver.",
          body: "Marj, iade oranı, kupon kullanımı, erişilebilirlik ya da deneyimin başka önemli bir tarafı zarar görüyorsa artış tek başına başarı değildir. Sonuca bakmadan önce guardrail'leri belirle.",
          caption: "Yapılmaması gerekenler",
          ledgerNote: "kütüphane genelinde guardrail kuralı",
        },
        library: {
          eyebrow: "Kütüphane",
          title: "Gözlemlediğin probleme uyan senaryoyu bul.",
          body: "Kategoriye ve sayfaya göre filtrele. Her kayıtta hipotez, değişen alan, birincil KPI ve guardrail'ler birlikte yer alır.",
          cta: "Tüm senaryoları aç",
          decidedBy: "Karar metriği",
          filterLabel: "Kategoriye göre gez",
        },
        how: {
          eyebrow: "Nasıl çalışır",
          title: "Kanıttan karara ilerle.",
          body: "Gerçek bir gözlemden uygulanabilir bir sonuca uzanan üç adım.",
          steps: [
            { title: "Kanıtı bul", body: "Bir probleme işaret eden davranış verisi, araştırma bulgusu ya da müşteri geri bildirimiyle başla." },
            { title: "Deneyi çerçevele", body: "Hipotezi yaz, tek değişkeni değiştir, birincil KPI'ı ve guardrail'leri baştan seç." },
            { title: "Sonucu oku", body: "Planlanan örneklemi, istatistiği ve guardrail'leri birlikte değerlendir. Büyük görünen bir artış hâlâ gürültü olabilir." },
          ],
          step1: { label: "Sayfa", matches: "senaryo bu sayfada" },
          step2: { hypothesis: "Hipotez", kpi: "Birincil KPI", guardrail: "Guardrail" },
          step3: {
            control: "Control",
            variant: "Variant",
            uplift: "Uplift",
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
      title: "Yaptığım işler seninkilerle kesişiyorsa konuşalım.",
      body: "Growth, CRM, ölçümleme ya da buradaki projelerden biri hakkında yazabilirsin. Bir soru, bir itiraz ya da sadece merhaba; hepsi olur.",
      button: "mehmetalidemirbas@gmail.com",
      linkedin: "LinkedIn'de bağlan",
    },
    footer: {
      left: "Ali Demirbaş",
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
