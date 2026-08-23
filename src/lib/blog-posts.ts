import type { BlogPost } from "@/lib/blog";

/* Real, authored posts - short and direct, not padded for SEO (that's a
   separate phase). No client-specific numbers or case studies from past
   employers; the frameworks are real, the illustrative figures are
   round and clearly hypothetical. */

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "ltv-cac-ratio-doesnt-tell-you-when-to-scale",
    title: "LTV:CAC alone doesn't tell you when to scale",
    excerpt:
      "A 3:1 ratio is the industry shorthand for \"healthy.\" It's a fine sanity check and a bad scaling signal on its own - here's what to look at alongside it.",
    date: "2026-08-10",
    category: "Growth Metrics",
    topic: "Unit Economics",
    contentType: "Article",
    sections: [
      {
        heading: "The ratio hides its own denominator",
        body: "LTV:CAC of 3:1 gets treated as a pass/fail line, but the ratio doesn't say how fast you're allowed to spend to hit it. A channel can post a great ratio at low volume and fall apart the moment you push more budget through it - not because the unit economics changed, but because CAC on the marginal customer is rarely the same as CAC on the average one. The ratio is a snapshot of what already happened, not a forecast of what happens next.",
      },
      {
        heading: "Marginal CAC, not average CAC",
        body: "Before scaling a channel, look at what the last 10-20% of spend actually cost to acquire, not the blended average. If average CAC is $40 but the newest cohort of spend is landing closer to $65, your real ratio at the margin is worse than the dashboard number - and that's the number that decides whether the next dollar of budget is still profitable.",
      },
      {
        heading: "Payback period is the faster warning light",
        body: "LTV takes months or years to fully realize, which makes a bad LTV:CAC ratio a lagging indicator - you find out you overspent well after the money is gone. CAC payback period (how many months of gross margin it takes to recover acquisition cost) reacts faster, because you don't need the full LTV curve to know a cohort is paying back slower than the last one.",
      },
      {
        heading: "What to check before increasing spend",
        body: "Three things, in order: marginal CAC on the last spend increment, payback period trend over the last 3 cohorts, and whether retention on recent cohorts matches older ones. If all three hold, the ratio is probably telling the truth. If retention is quietly declining while CAC holds flat, the ratio will look fine right up until it doesn't.",
      },
    ],
    related: [
      { href: "/calculators/ltv-cac-ratio", label: "LTV:CAC Ratio Calculator" },
      { href: "/calculators/cac-payback-period", label: "CAC Payback Period Calculator" },
      { href: "/calculators/ltv", label: "LTV Calculator" },
    ],
  },
  {
    slug: "reading-d1-d7-d30-retention-without-fooling-yourself",
    title: "Reading D1/D7/D30 retention without fooling yourself",
    excerpt:
      "The most common retention-reporting mistake isn't a bad number - it's comparing cohorts that were never comparable to begin with.",
    date: "2026-08-14",
    category: "Growth Metrics",
    topic: "Retention",
    contentType: "Article",
    sections: [
      {
        heading: "A curve, not a single number",
        body: "D1/D7/D30 retention gets reported as three numbers, but they only mean something as a curve. A product with steep D1 drop-off and a flat tail from D7 onward has a very different retention story than one with a slow, steady decline all the way to D30 - even if the D30 number lands in the same place. Report the shape, not just the endpoints.",
      },
      {
        heading: "Cohort contamination is the usual culprit",
        body: "The classic mistake: comparing this month's D7 retention to last month's, when this month's acquisition mix shifted toward a channel that brings in lower-intent users. The retention number moved, but the story isn't \"retention got worse\" - it's \"the population changed.\" Always segment retention by acquisition source before concluding anything about product changes.",
      },
      {
        heading: "Day-of-week and seasonality distort short windows",
        body: "D1 retention measured from a Friday acquisition looks different from D1 measured from a Tuesday one, for reasons that have nothing to do with the product. Short windows are more sensitive to this than long ones. If you're tracking D1 weekly, expect noise; don't react to a single week's dip without checking what day of week drove the cohort.",
      },
      {
        heading: "What a healthy curve looks like",
        body: "Steep early drop-off is normal - most products lose 60-80% of users by D7 and that's not automatically a crisis. What matters is where the curve flattens. A curve that's still declining meaningfully at D30 has a different problem than one that's flat by D7 at a lower level than you'd like. The first is a retention problem; the second might be an acquisition-quality problem.",
      },
    ],
    related: [
      { href: "/calculators/retention-rate", label: "Retention Rate Calculator" },
      { href: "/calculators/d1-retention", label: "D1 Retention Calculator" },
      { href: "/calculators/dau-mau-stickiness", label: "DAU/MAU Stickiness Calculator" },
    ],
  },
  {
    slug: "why-your-roas-looks-different-on-every-ad-platform",
    title: "Why your ROAS looks different on every ad platform",
    excerpt:
      "Same campaign, same spend, three different ROAS numbers depending on which platform's dashboard you're reading. The formula isn't the problem - the attribution window is.",
    date: "2026-08-18",
    category: "Growth Metrics",
    topic: "Advertising",
    contentType: "Article",
    sections: [
      {
        heading: "ROAS is simple; attribution isn't",
        body: "The formula is one line: revenue from ads divided by ad spend. What varies wildly between platforms is what counts as \"revenue from ads\" in the first place - and that's entirely a function of the attribution window each platform defaults to, which is rarely the same window as your own analytics tool uses.",
      },
      {
        heading: "Click windows vs. view windows",
        body: "A platform crediting a 7-day click / 1-day view window will report a different ROAS than one crediting 28-day click / 7-day view, for the exact same spend and the exact same underlying purchases - because the second window simply catches more conversions and attributes them back to the ad. Neither number is wrong; they're answering different questions.",
      },
      {
        heading: "Last-click vs. multi-touch",
        body: "If a user sees an ad on platform A, then converts after a search on platform B, both platforms may claim full credit under their own last-touch model. Add up ROAS across every platform's own dashboard and the total revenue claimed can exceed 100% of what you actually made - that's not fraud, it's just each platform crediting itself under its own rules.",
      },
      {
        heading: "Pick one source of truth for cross-channel comparison",
        body: "Use each platform's own ROAS to optimize within that platform - it's internally consistent for that purpose. But when comparing channels against each other, pull revenue from one attribution source (your own analytics, ideally with a consistent window) rather than trusting each platform's self-reported number. Otherwise you're not comparing channels, you're comparing attribution models.",
      },
    ],
    related: [
      { href: "/calculators/roas", label: "ROAS Calculator" },
      { href: "/calculators/marketing-roi", label: "Marketing ROI Calculator" },
      { href: "/calculators/cpa", label: "CPA Calculator" },
    ],
  },
  {
    slug: "what-belongs-in-a-lifecycle-journey-vs-a-campaign",
    title: "What actually belongs in a lifecycle journey vs. a one-off campaign",
    excerpt:
      "Not every recurring message needs a journey behind it, and not every journey should be built like a campaign. The difference is what decides whether someone enters.",
    date: "2026-08-21",
    category: "Lifecycle & CRM",
    topic: "Lifecycle Marketing",
    contentType: "Article",
    sections: [
      {
        heading: "The entry condition is the whole difference",
        body: "A campaign enters a fixed audience at a fixed time: everyone who matches a segment, on this date. A journey enters people continuously, as they meet a condition: everyone who abandons a cart, whenever that happens. If your \"journey\" only ever runs once, on a schedule, for a static list - it's a campaign wearing a journey's name.",
      },
      {
        heading: "Journeys are for conditions that recur; campaigns are for moments",
        body: "A price drop on a wishlisted item recurs indefinitely and unpredictably - that's a journey. A Black Friday sale happens once a year on a known date - that's a campaign, even if you send it through the same tool. Building a Black Friday journey with an entry condition of \"date equals November 28\" just adds orchestration overhead a scheduled send didn't need.",
      },
      {
        heading: "The trap: journeys that never exit anyone",
        body: "A journey needs an exit condition as much as an entry one. Cart abandonment recovery has to stop the moment someone purchases - if it doesn't, you've built a journey that keeps messaging people about a decision they already made. The exit condition is usually the same event that would have made the campaign version's next send irrelevant.",
      },
      {
        heading: "A quick test before you build one",
        body: "Ask: does this need to check a condition on an ongoing basis, or does it need to reach a list on a given day? If the answer is \"ongoing basis,\" it's a journey - build the entry and exit conditions first, content second. If it's \"a given day,\" save the orchestration complexity and send it as a campaign.",
      },
    ],
    related: [
      { href: "/lab/journeys", label: "Canonical Journey Library" },
      { href: "/calculators/cart-abandonment", label: "Cart Abandonment Calculator" },
      { href: "/calculators/activation-rate", label: "Activation Rate Calculator" },
    ],
  },
  {
    slug: "the-guardrail-metric-most-ab-tests-forget",
    title: "The guardrail metric most A/B tests forget",
    excerpt:
      "A test can win on its primary metric and still be a net loss for the business. Guardrails exist to catch exactly that - and they're the first thing a rushed test setup skips.",
    date: "2026-08-23",
    category: "Experimentation",
    topic: "A/B Testing",
    contentType: "Article",
    sections: [
      {
        heading: "Winning the metric you're watching isn't the same as winning",
        body: "A checkout redesign that lifts conversion rate by removing a coupon-code field can look like an unambiguous win - until refund rate climbs, because customers who would have used a valid code now feel like they overpaid. The primary metric moved in the right direction; the business didn't necessarily come out ahead.",
      },
      {
        heading: "A guardrail is a metric that must not get worse",
        body: "It's not a second goal - it's a constraint. The primary metric decides who wins; the guardrail decides whether the win is allowed to count. Common guardrails: margin (a discount-heavy variant can win on conversion and lose on profit), refund/support-ticket rate, page speed, and anything related to accessibility or legal consent.",
      },
      {
        heading: "Pick the guardrail before you see results, not after",
        body: "If you only look for a guardrail metric after the primary metric wins, you'll find a reason to ignore it - confirmation bias works exactly that efficiently. Guardrails need to be named in the test plan up front, with a pre-agreed threshold for what counts as \"got worse enough to matter,\" before a single result comes in.",
      },
      {
        heading: "One exception to \"don't peek early\"",
        body: "The standard rule is to decide sample size or duration up front and look once, to avoid inflating false positives from repeated checking. The one carve-out: a guardrail metric breaking visibly mid-test is a reason to stop early. You're not stopping because the primary metric looks good - you're stopping because the constraint failed, which is a different decision with different statistics behind it.",
      },
    ],
    related: [
      { href: "/lab/ab-testing", label: "A/B Test Playbook" },
      { href: "/calculators/ab-test", label: "A/B Test Significance Calculator" },
      { href: "/calculators/sample-size-calculator", label: "Sample Size Calculator" },
    ],
  },
];
