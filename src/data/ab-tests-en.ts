import type { AbTestDetail } from "@/lib/ab-test-view";

export type AbTestEnglishCopy = Pick<AbTestDetail, "question" | "hypothesis" | "testedSlot" | "primaryKpi" | "otherKpis" | "whatToTest" | "guardrails" | "sideA" | "sideB">;

/**
 * Native-English A/B test copy, keyed by stable test id.
 * Structural experiment fields stay in ab-tests.json; this layer only localizes prose.
 * Entries are authored from the experiment's meaning, not translated word-for-word.
 */
export const AB_TEST_EN_COPY: Readonly<Record<string, AbTestEnglishCopy>> = {
  "AB-001": {
    question: "Does CTA button color affect click behavior?",
    hypothesis: "Changing the CTA color may change how noticeable the button is within the surrounding design and, in turn, affect click-through rate. Only the button color changes in this test; copy, size, placement and surrounding UI stay the same.",
    testedSlot: "CTA button color",
    primaryKpi: { label: "Click-through Rate (CTR)", explanation: "Does changing the button color affect CTA click-through rate?" },
    otherKpis: [
      { label: "Conversion Rate (CR)", explanation: "Does any lift in clicks carry through to conversion?" },
      { label: "Add-to-cart Rate", explanation: "Does the first downstream action change?" },
      { label: "Page Abandonment Rate", explanation: "It should not increase." },
      { label: "Brand Perception", explanation: "If measured, it should not deteriorate." }
    ],
    whatToTest: [
      { label: "Change", explanation: "Change only the CTA color between the control and variant." },
      { label: "Contrast", explanation: "Both colors must meet the required accessibility contrast." },
      { label: "Keep fixed", explanation: "Keep copy, size, placement and surrounding design unchanged." },
      { label: "Device", explanation: "Review mobile and desktop results separately." },
      { label: "Follow-up", explanation: "Test placement, copy or size in separate experiments if needed." }
    ],
    guardrails: [
      "Do not change the button color and CTA copy in the same test.",
      "Do not test a color that fails accessibility contrast requirements.",
      "Do not ship an off-brand color without the appropriate design approval.",
      "Do not roll a result from one page across the entire site without validating the new context.",
      "Keep the primary CTA distinguishable from secondary actions."
    ],
    sideA: null,
    sideB: null
  },
  "AB-002": {
    question: "Does removing repeated CTAs improve order completion?",
    hypothesis: "Removing duplicate or non-functional CTAs from the cart may reduce competing actions and keep attention on the primary next step. Keep the primary CTA's copy, placement and visual treatment unchanged throughout the test.",
    testedSlot: "number of CTAs",
    primaryKpi: { label: "Conversion Rate (CR)", explanation: "Does removing repeated CTAs improve order completion?" },
    otherKpis: [
      { label: "Click-through Rate (CTR)", explanation: "Does a clearer primary action receive more clicks?" },
      { label: "Step Completion Rate", explanation: "Is it easier to move to the next step?" },
      { label: "Abandonment Rate", explanation: "It should not increase." },
      { label: "Time to Decision", explanation: "Does a simpler action set shorten decision time?" }
    ],
    whatToTest: [
      { label: "Change", explanation: "Remove only repeated or non-functional CTAs." },
      { label: "Keep fixed", explanation: "Do not change the primary CTA's copy, placement or visual style." },
      { label: "Flow", explanation: "Track both progression to the next step and completed orders." },
      { label: "Device", explanation: "Review mobile and desktop results separately." },
      { label: "Follow-up", explanation: "Treat CTA copy or visual hierarchy as separate experiments." }
    ],
    guardrails: [
      "Do not remove every secondary action and leave users without a clear route.",
      "Remove only duplicate or non-functional CTAs.",
      "Do not change CTA copy during the experiment.",
      "Keep the critical CTA within reach on mobile.",
      "Do not give a secondary action the same visual weight as the primary CTA."
    ],
    sideA: { role: "control", label: "The cart contains multiple repeated or non-functional CTAs", sourceBasis: null },
    sideB: { role: "variant", label: "Repeated or non-functional CTAs are removed, leaving one clear primary action", sourceBasis: null }
  },
  "AB-003": {
    question: "Does showing the amount left for free shipping increase basket value?",
    hypothesis: "Making the remaining amount to free shipping visible may encourage shoppers to add another item and increase average order value. Read the result alongside order completion and revenue per visitor so a larger basket is not mistaken for a better overall outcome.",
    testedSlot: "free-shipping progress bar",
    primaryKpi: { label: "Average Order Value (AOV)", explanation: "Does showing the remaining amount increase average order value?" },
    otherKpis: [
      { label: "Add-to-cart Rate", explanation: "Are shoppers adding more items?" },
      { label: "Checkout Start Rate", explanation: "Does progression to checkout improve?" },
      { label: "Cart Abandonment Rate", explanation: "It should not increase." },
      { label: "Revenue per Visitor (RPV)", explanation: "It should not decline." }
    ],
    whatToTest: [
      { label: "Change", explanation: "Add a free-shipping progress bar that is absent from the control." },
      { label: "Keep fixed", explanation: "Keep the free-shipping threshold, pricing, promotions and message logic unchanged." },
      { label: "Behavior", explanation: "Track whether shoppers add items to reach the threshold." },
      { label: "Guardrail", explanation: "Order completion and revenue per visitor should not deteriorate." },
      { label: "Follow-up", explanation: "Test message, visual treatment and placement separately." }
    ],
    guardrails: [
      "Do not let the progress bar compete with the primary checkout CTA.",
      "Do not change the free-shipping threshold during the test.",
      "Keep the bar visible enough to be usable on mobile.",
      "Do not change color, threshold and copy in the same experiment.",
      "Give clear feedback once the shopper reaches free shipping."
    ],
    sideA: { role: "control", label: "The cart does not show how much is left to qualify for free shipping", sourceBasis: null },
    sideB: { role: "variant", label: "A progress bar shows the amount remaining to qualify for free shipping", sourceBasis: null }
  },
  "AB-004": {
    question: "Does placing the coupon field behind a link improve checkout performance?",
    hypothesis: "Collapsing the coupon field by default may reduce the chance that shoppers without a code leave checkout to search for one. The field still needs to be easy to find for shoppers who do have a code, and campaign usage should remain healthy.",
    testedSlot: "coupon code field",
    primaryKpi: { label: "Revenue per Visitor (RPV)", explanation: "Does reducing coupon-search leakage improve revenue after accounting for changes in discount usage?" },
    otherKpis: [
      { label: "Order Completion Rate", explanation: "Does checkout completion improve?" },
      { label: "Coupon Redemption Rate", explanation: "Shoppers with a code should still be able to find and use it." },
      { label: "Checkout Abandonment Rate", explanation: "This is the direct friction signal to watch." },
      { label: "Campaign Participation", explanation: "Active campaign participation should not collapse." }
    ],
    whatToTest: [
      { label: "Change", explanation: "Replace the always-open coupon box with a collapsed field behind a link." },
      { label: "Keep fixed", explanation: "Keep coupon rules, active campaigns, field behavior and the rest of checkout unchanged." },
      { label: "Leakage", explanation: "Track whether shoppers without a coupon are less likely to leave checkout." },
      { label: "Guardrail", explanation: "Coupon redemption and campaign participation should remain healthy." },
      { label: "Follow-up", explanation: "Test the link copy or field placement separately." }
    ],
    guardrails: [
      "Do not remove the coupon field entirely.",
      "Keep invalid-code feedback clear.",
      "Do not launch or end campaigns during the experiment.",
      "Do not hide the coupon entry so deeply that shoppers with a code cannot find it.",
      "Do not change both placement and copy in the same test."
    ],
    sideA: { role: "control", label: "The coupon code field is open and directly visible in the cart", sourceBasis: null },
    sideB: { role: "variant", label: "The coupon field is collapsed behind an 'I have a discount code' link", sourceBasis: null }
  },
  "AB-005": {
    question: "Does guest checkout improve order completion?",
    hypothesis: "Requiring an account adds another decision and more form work before purchase. Guest checkout may remove that friction, but the result should be read alongside post-purchase account creation and repeat purchase behavior.",
    testedSlot: "guest checkout option",
    primaryKpi: { label: "Conversion Rate (CR)", explanation: "Does offering guest checkout increase completed purchases?" },
    otherKpis: [
      { label: "Cart Abandonment Rate", explanation: "Does abandonment fall when account creation is optional?" },
      { label: "Checkout Completion Time", explanation: "Does the path become faster?" },
      { label: "New Account Creation", explanation: "Account creation should not fall to an unacceptable level." },
      { label: "Repeat Purchase", explanation: "Check whether guest customers return and buy again." }
    ],
    whatToTest: [
      { label: "Change", explanation: "Add an option to complete checkout without creating an account." },
      { label: "Keep fixed", explanation: "Keep checkout fields, payment methods and pricing unchanged." },
      { label: "Completion", explanation: "Measure the effect of guest checkout on completed orders." },
      { label: "Guardrail", explanation: "Track account creation and repeat purchase behavior separately." },
      { label: "Follow-up", explanation: "Field reduction and post-purchase account prompts are separate experiments." }
    ],
    guardrails: [
      "Do not ask guest shoppers for information that is not needed to fulfill the order.",
      "Do not visually bury the guest checkout option.",
      "Do not repeatedly push account creation after purchase.",
      "Keep a path for a guest order to be linked to an account later.",
      "Do not introduce guest checkout and reduce form fields in the same test."
    ],
    sideA: { role: "control", label: "Shoppers must create or use an account to purchase", sourceBasis: null },
    sideB: { role: "variant", label: "Shoppers can complete the purchase as a guest", sourceBasis: null }
  },
  "AB-006": {
    question: "How do one-page and multi-step checkout flows affect completion?",
    hypothesis: "A one-page checkout reduces the number of explicit steps but can feel dense at first glance. A multi-step flow breaks the task into smaller pieces but introduces another drop-off point at each step. Use completed orders as the decision metric and inspect device and basket value as segments.",
    testedSlot: "checkout flow structure",
    primaryKpi: { label: "Order Completion Rate", explanation: "What share of shoppers who start checkout complete the order?" },
    otherKpis: [
      { label: "Step-level Abandonment", explanation: "Where does each flow lose shoppers?" },
      { label: "Checkout Time", explanation: "Does either structure reduce total completion time?" },
      { label: "Form Error Rate", explanation: "Errors should not increase in the one-page flow." },
      { label: "Support Contacts", explanation: "Checkout-related support demand should not increase." }
    ],
    whatToTest: [
      { label: "Change", explanation: "Compare the same checkout content in a one-page flow and a multi-step flow." },
      { label: "Keep fixed", explanation: "Keep fields, payment methods, shipping information and validation rules equivalent." },
      { label: "Completion", explanation: "Use order completion as the primary decision metric." },
      { label: "Segment", explanation: "Review device and basket value to understand meaningful differences in the result." },
      { label: "Follow-up", explanation: "Test UI changes such as accordions or progress indicators separately." }
    ],
    guardrails: [
      "Do not change the available payment methods during the test.",
      "Do not expose every field at once if it makes the one-page version unnecessarily overwhelming.",
      "Keep users oriented in the multi-step flow.",
      "Make sure the keyboard does not cover the order summary or primary CTA on mobile.",
      "Do not defer shipping costs until the final step."
    ],
    sideA: { role: "option-a", label: "One-page checkout flow", sourceBasis: null },
    sideB: { role: "option-b", label: "Multi-step checkout flow", sourceBasis: null }
  },
  "AB-007": {
    question: "Does removing unnecessary address fields improve address-step completion?",
    hypothesis: "Removing only address fields that are not required for delivery may reduce form effort, especially on mobile, and improve completion of the address step. Keep autofill, validation and address-suggestion behavior unchanged.",
    testedSlot: "address form field set",
    primaryKpi: { label: "Address Step Completion", explanation: "What share of shoppers complete the address form?" },
    otherKpis: [
      { label: "Form Completion Time", explanation: "Does the form take less time to complete?" },
      { label: "Checkout Completion", explanation: "Does the improvement carry through to the full checkout?" },
      { label: "Invalid Address / Delivery Error", explanation: "This should not increase; it is the critical guardrail." },
      { label: "Support Contacts", explanation: "Address-correction requests should not increase." }
    ],
    whatToTest: [
      { label: "Change", explanation: "Remove only optional or non-essential address fields." },
      { label: "Keep fixed", explanation: "Keep autofill, address suggestions, validation and error messages unchanged." },
      { label: "Completion", explanation: "Track address-step completion and time to complete." },
      { label: "Guardrail", explanation: "Invalid addresses, delivery errors and support contacts should not increase." },
      { label: "Follow-up", explanation: "Address lookup, postcode autofill and field grouping are separate experiments." }
    ],
    guardrails: [
      "Keep autofilled values editable.",
      "Do not remove information that is genuinely required for delivery.",
      "Do not change field count and validation rules in the same test.",
      "Keep error messages next to the relevant field.",
      "Do not change the shipping integration during the experiment."
    ],
    sideA: { role: "control", label: "The address form uses the current field set", sourceBasis: null },
    sideB: { role: "variant", label: "Optional or non-essential address fields are removed while the remaining fields behave the same", sourceBasis: null }
  },
  "AB-008": {
    question: "Does making the quantity selector more prominent increase basket value?",
    hypothesis: "Making the cart quantity selector easier to notice may increase quantity changes and affect basket value. Keep delete actions, price presentation and the rest of the cart controls unchanged.",
    testedSlot: "quantity selector prominence",
    primaryKpi: { label: "Average Order Value (AOV)", explanation: "Does a more prominent quantity control increase average order value?" },
    otherKpis: [
      { label: "Quantity Change Rate", explanation: "Are shoppers changing quantities more often?" },
      { label: "Quantity Control Interaction", explanation: "Does interaction increase when the control is easier to notice?" },
      { label: "Remove-from-cart Rate", explanation: "Accidental removals should not increase." },
      { label: "Revenue per Visitor (RPV)", explanation: "It should not decline." }
    ],
    whatToTest: [
      { label: "Change", explanation: "Increase the prominence of the quantity selector without changing how it works." },
      { label: "Keep fixed", explanation: "Keep placement, delete controls, pricing and other cart actions unchanged." },
      { label: "Behavior", explanation: "Read quantity changes alongside average order value." },
      { label: "Guardrail", explanation: "Accidental removal and revenue per visitor should not deteriorate." },
      { label: "Follow-up", explanation: "Test placement or button styling separately." }
    ],
    guardrails: [
      "Do not make quantity controls compete visually with the checkout CTA.",
      "Do not redesign delete or save actions in the same experiment.",
      "Keep the remove action discoverable.",
      "Avoid a full page refresh for a quantity change.",
      "Make sure quantity controls do not overlap on mobile."
    ],
    sideA: { role: "control", label: "The cart quantity selector is subtle and easy to overlook", sourceBasis: null },
    sideB: { role: "variant", label: "The quantity selector is more prominent, with clearer plus and minus controls", sourceBasis: null }
  },
  "AB-009": {
    question: "Do complementary product recommendations in the cart increase basket value?",
    hypothesis: "Showing relevant complementary products in the cart may increase average order value. Because the module can also distract from checkout, order completion should be monitored as a guardrail.",
    testedSlot: "cart product recommendation module",
    primaryKpi: { label: "Average Order Value (AOV)", explanation: "Do recommendations increase average order value?" },
    otherKpis: [
      { label: "Recommendation Click-through Rate", explanation: "Do shoppers engage with the recommendations?" },
      { label: "Add-to-cart Rate", explanation: "Are recommended products added to the basket?" },
      { label: "Order Completion Rate", explanation: "The recommendation module should not reduce checkout completion." },
      { label: "Revenue per Visitor (RPV)", explanation: "Does total revenue per visitor improve?" }
    ],
    whatToTest: [
      { label: "Change", explanation: "Add a complementary-product recommendation module to the variant." },
      { label: "Keep fixed", explanation: "Keep checkout flow, prices and the primary cart CTA unchanged." },
      { label: "Relevance", explanation: "Use genuinely complementary products rather than unrelated inventory." },
      { label: "Guardrail", explanation: "Monitor order completion so higher basket value is not bought with more abandonment." },
      { label: "Follow-up", explanation: "Recommendation logic, module placement and card design should be tested separately." }
    ],
    guardrails: [
      "Do not let recommendations push the checkout CTA out of reach.",
      "Do not mix a new recommendation algorithm with a new module design in the same test.",
      "Avoid recommending unavailable or incompatible products.",
      "Keep pricing and promotion rules consistent across both variants.",
      "Do not judge the test on recommendation clicks alone."
    ],
    sideA: { role: "control", label: "The cart does not contain a complementary-product recommendation module", sourceBasis: null },
    sideB: { role: "variant", label: "The cart includes a complementary-product recommendation module", sourceBasis: null }
  },
  "AB-010": {
    question: "How does changing the free-shipping threshold affect revenue and conversion?",
    hypothesis: "Changing the free-shipping threshold can shift both basket-building behavior and checkout completion. Evaluate the trade-off through revenue per visitor rather than treating a higher basket value or a higher conversion rate in isolation as the outcome.",
    testedSlot: "free-shipping threshold",
    primaryKpi: { label: "Revenue per Visitor (RPV)", explanation: "How does the threshold change affect revenue generated per visitor?" },
    otherKpis: [
      { label: "Average Order Value (AOV)", explanation: "Does the threshold change basket size?" },
      { label: "Conversion Rate (CR)", explanation: "Does it change completed purchases?" },
      { label: "Free-shipping Qualification Rate", explanation: "How many orders reach the threshold?" },
      { label: "Contribution Margin", explanation: "A revenue lift should not hide an unacceptable shipping-cost trade-off." }
    ],
    whatToTest: [
      { label: "Threshold", explanation: "Compare clearly defined threshold levels based on the business's current economics." },
      { label: "Keep fixed", explanation: "Keep messaging, progress-bar treatment, prices and promotions unchanged." },
      { label: "Trade-off", explanation: "Read basket value and conversion together through revenue per visitor." },
      { label: "Economics", explanation: "Check shipping cost and contribution margin before choosing a rollout." },
      { label: "Segment", explanation: "Review meaningful differences by basket profile or customer segment when volume supports it." }
    ],
    guardrails: [
      "Do not choose threshold values without using current basket distribution and shipping economics.",
      "Do not change the threshold and its message or visual treatment in the same test.",
      "Do not judge the result on AOV alone.",
      "Include shipping cost and margin in the business readout.",
      "Keep the threshold rules consistent throughout the experiment."
    ],
    sideA: null,
    sideB: null
  },
  "AB-011": {
    question: "Does checkout microcopy affect conversion?",
    hypothesis: "A short explanation or reassurance message in checkout may change how clearly shoppers understand the next step and how much hesitation they feel. Define one microcopy slot and the two messages being compared before launch.",
    testedSlot: "microcopy",
    primaryKpi: { label: "Conversion Rate (CR)", explanation: "Does the microcopy improve purchase conversion?" },
    otherKpis: [
      { label: "Click-through Rate (CTR)", explanation: "Does interaction with the relevant CTA increase?" },
      { label: "Form Completion Rate", explanation: "Does form completion improve?" },
      { label: "Exit Rate", explanation: "The new copy should not drive more exits." },
      { label: "Time on Step", explanation: "It should not materially increase." }
    ],
    whatToTest: [
      { label: "Copy", explanation: "Compare two clearly defined messages in one microcopy slot." },
      { label: "Keep fixed", explanation: "Keep CTA, price, visuals, placement and checkout flow unchanged." },
      { label: "Behavior", explanation: "Read conversion alongside interaction with the relevant CTA or form step." },
      { label: "Segment", explanation: "Review new and returning users separately when useful." },
      { label: "Follow-up", explanation: "Treat tone, placement or different reassurance claims as separate experiments." }
    ],
    guardrails: [
      "Do not use misleading, exaggerated or coercive language.",
      "Keep microcopy short enough to scan.",
      "Do not change microcopy, price and visuals in the same test.",
      "Keep unrelated campaign messaging out of the tested slot.",
      "Do not let the copy crowd the checkout UI on mobile."
    ],
    sideA: null,
    sideB: null
  },
  "AB-012": {
    question: "Does one-click payment with a saved card improve conversion?",
    hypothesis: "A saved-card payment option can remove repeated data entry and shorten checkout. Measure whether that convenience translates into more completed payments without increasing payment errors or post-purchase cancellations.",
    testedSlot: "saved-card quick payment",
    primaryKpi: { label: "Payment Completion Rate", explanation: "Does the saved-card option increase completed payments?" },
    otherKpis: [
      { label: "Payment Method Selection Rate", explanation: "Which payment path do shoppers choose?" },
      { label: "Step Completion Time", explanation: "Does the payment step become faster?" },
      { label: "Payment Error / Decline Rate", explanation: "It should not increase." },
      { label: "Post-purchase Cancellation", explanation: "It should not increase." }
    ],
    whatToTest: [
      { label: "Change", explanation: "Add a one-click saved-card option while keeping manual card entry available." },
      { label: "Selection", explanation: "Make the choice between saved-card and manual payment explicit." },
      { label: "Keep fixed", explanation: "Keep card-entry fields and the rest of checkout unchanged." },
      { label: "Device", explanation: "Review mobile and desktop separately." },
      { label: "Provider", explanation: "Check whether behavior differs across supported wallet or saved-card providers." }
    ],
    guardrails: [
      "Do not make quick payment mandatory; keep manual card entry available.",
      "Do not add oversized notices that obscure the payment step.",
      "Do not redesign the manual card fields during this experiment.",
      "Keep the quick-payment module compact on mobile.",
      "Do not default to a saved card without the user's consent."
    ],
    sideA: { role: "control", label: "No saved-card quick payment; card details are entered manually", sourceBasis: null },
    sideB: { role: "variant", label: "A one-click payment option with a saved card is available", sourceBasis: null }
  },
  "AB-013": {
    question: "Does a progress indicator improve completion?",
    hypothesis: "A progress indicator can reduce uncertainty by showing where users are in the flow and how much remains. Read overall completion alongside step-level abandonment, especially around address and payment.",
    testedSlot: "progress indicator",
    primaryKpi: { label: "Completion Rate", explanation: "Does a visible progress indicator increase completed flows?" },
    otherKpis: [
      { label: "Step Abandonment Rate", explanation: "Do fewer users leave at individual steps?" },
      { label: "Time per Step", explanation: "Are steps completed faster?" },
      { label: "Back-navigation Rate", explanation: "It should not increase unexpectedly." },
      { label: "Page Load Time", explanation: "The indicator should not slow the flow." }
    ],
    whatToTest: [
      { label: "Change", explanation: "Add a progress indicator that shows the current step and remaining steps." },
      { label: "Comprehension", explanation: "Check whether users understand where they are in the flow." },
      { label: "Critical steps", explanation: "Watch abandonment around payment and address." },
      { label: "Mobile", explanation: "Make sure the indicator remains useful without consuming excessive screen space." },
      { label: "Follow-up", explanation: "Treat completion ticks, wording and placement as separate follow-up tests." }
    ],
    guardrails: [
      "Do not display more steps than the flow actually requires.",
      "Use clear, user-facing step names.",
      "Do not give the indicator excessive screen space on mobile.",
      "Keep the funnel steps unchanged during the experiment.",
      "Avoid heavy animation or anything that delays rendering."
    ],
    sideA: { role: "control", label: "Checkout has no progress indicator", sourceBasis: null },
    sideB: { role: "variant", label: "Checkout shows the current step and remaining steps", sourceBasis: null }
  },
  "AB-014": {
    question: "How does auto-applying a discount code affect behavior?",
    hypothesis: "Automatically applying an eligible discount can shorten checkout and may improve conversion. The business result should be judged through revenue per visitor, because a conversion lift can still be offset by heavier discounting.",
    testedSlot: "automatic discount code",
    primaryKpi: { label: "Revenue per Visitor (RPV)", explanation: "Does auto-applying the code improve revenue per visitor after accounting for discount cost?" },
    otherKpis: [
      { label: "Conversion Rate (CR)", explanation: "Does purchase conversion improve?" },
      { label: "Discount Code Usage", explanation: "How much does automatic application change redemption?" },
      { label: "Average Order Value (AOV)", explanation: "Does basket value change?" },
      { label: "Gross Margin", explanation: "The discount should not create an unacceptable margin trade-off." }
    ],
    whatToTest: [
      { label: "Change", explanation: "Auto-apply the eligible discount in the variant instead of requiring manual entry." },
      { label: "Speed", explanation: "Check whether the payment path becomes faster." },
      { label: "Clarity", explanation: "Make it clear that the discount has been applied." },
      { label: "Device", explanation: "Review mobile and desktop separately." },
      { label: "Keep fixed", explanation: "Keep campaign rules and the rest of checkout unchanged." }
    ],
    guardrails: [
      "Do not use confusing discount messaging.",
      "Do not show multiple competing coupon-entry areas.",
      "Confirm the applied discount immediately.",
      "Do not change campaign terms during the test.",
      "Keep a manual code path where shoppers may have another valid code."
    ],
    sideA: { role: "control", label: "The shopper enters and applies the discount code manually", sourceBasis: null },
    sideB: { role: "variant", label: "The eligible discount code is applied automatically", sourceBasis: null }
  },
  "AB-015": {
    question: "Do trust badges at the payment step improve completion?",
    hypothesis: "Relevant trust signals at the payment step may reduce hesitation when shoppers enter card details. Add a predefined badge set to the existing checkout while keeping the payment flow, copy and fields unchanged.",
    testedSlot: "trust badges",
    primaryKpi: { label: "Payment Completion Rate", explanation: "Does adding trust badges improve completion among shoppers who reach payment?" },
    otherKpis: [
      { label: "Payment-step Abandonment", explanation: "Does abandonment fall?" },
      { label: "Time on Step", explanation: "Does hesitation decrease?" },
      { label: "Error / Decline Rate", explanation: "It should not change adversely." },
      { label: "Post-purchase Cancellation", explanation: "It should not increase." }
    ],
    whatToTest: [
      { label: "Change", explanation: "Add the predefined trust badges to the variant." },
      { label: "Keep fixed", explanation: "Keep badge placement and format, payment flow, copy and field structure unchanged." },
      { label: "Completion", explanation: "Read payment completion alongside payment-step abandonment." },
      { label: "Guardrail", explanation: "Payment errors, declines and post-purchase cancellations should remain healthy." },
      { label: "Follow-up", explanation: "Test badge count, placement or format separately." }
    ],
    guardrails: [
      "Do not display certifications or guarantees the business does not actually have.",
      "Do not make badges compete with the payment CTA.",
      "Avoid an excessive wall of reassurance badges.",
      "Do not change payment providers during the test.",
      "Make sure the badge strip does not cover the CTA when the mobile keyboard opens."
    ],
    sideA: { role: "control", label: "The payment step has no added trust-badge strip", sourceBasis: null },
    sideB: { role: "variant", label: "Relevant secure-payment and assurance badges are added to the payment step", sourceBasis: null }
  },
  "AB-016": {
    question: "Does clearly labeling required and optional fields improve form completion?",
    hypothesis: "When required and optional fields are not clearly distinguished, users may spend time figuring out what they can skip. Explicit field-status labels can reduce that ambiguity without changing the form itself.",
    testedSlot: "required and optional field labels",
    primaryKpi: { label: "Form Completion Rate", explanation: "Does explicit field-status labeling increase submitted forms?" },
    otherKpis: [
      { label: "Validation Error Rate", explanation: "Errors from skipped required fields should not increase." },
      { label: "Form Completion Time", explanation: "Does the form become faster to complete?" },
      { label: "Field-level Abandonment", explanation: "Where does drop-off change?" },
      { label: "Support Contacts", explanation: "Form-related questions should not increase." }
    ],
    whatToTest: [
      { label: "Change", explanation: "Make required and optional status explicit without changing field rules." },
      { label: "Keep fixed", explanation: "Keep field order, count and validation unchanged." },
      { label: "Clarity", explanation: "Check whether users make fewer required-field mistakes." },
      { label: "Device", explanation: "Make sure labels remain readable on narrow screens." },
      { label: "Consistency", explanation: "Use one labeling convention across the form." }
    ],
    guardrails: [
      "Do not change validation rules in the same test.",
      "Do not label an optional field as optional if the backend still requires it.",
      "Keep the label treatment consistent with the rest of the form.",
      "Do not let labels truncate field names on mobile.",
      "Do not change field order or count during the experiment."
    ],
    sideA: { role: "control", label: "Required and optional fields are not explicitly distinguished", sourceBasis: null },
    sideB: { role: "variant", label: "Each field clearly indicates whether it is required or optional", sourceBasis: null }
  },
  "AB-017": {
    question: "Does asking for payment method before address improve checkout completion?",
    hypothesis: "Moving payment selection earlier may create commitment sooner, but it can also ask for payment information before shoppers know the final total and can create technical issues for address-dependent payment methods. Judge the change on completed orders, not progression to the payment step alone.",
    testedSlot: "checkout step order",
    primaryKpi: { label: "Order Completion Rate", explanation: "Does changing the order of payment and address improve completed orders?" },
    otherKpis: [
      { label: "Step-level Abandonment", explanation: "Drop-off should decrease rather than simply move to another step." },
      { label: "Payment Error Rate", explanation: "Address-dependent payment errors should not increase." },
      { label: "Revenue per Visitor (RPV)", explanation: "Revenue should not decline." },
      { label: "Support Contacts", explanation: "Questions about missing totals or payment should not increase." }
    ],
    whatToTest: [
      { label: "Change", explanation: "Move payment-method selection ahead of address entry." },
      { label: "Total", explanation: "Make sure shoppers can see the relevant total before providing payment details." },
      { label: "Trust", explanation: "Watch for hesitation caused by asking for payment earlier." },
      { label: "Compatibility", explanation: "Validate address-dependent payment methods before launch." },
      { label: "Device", explanation: "Review mobile and desktop separately." }
    ],
    guardrails: [
      "Do not hide the final payable amount until after payment information is entered.",
      "Do not change step order and step count in the same test.",
      "Keep payment-security requirements outside the experiment.",
      "Validate address-dependent payment methods before exposing the variant.",
      "Do not call the test on completion alone without checking payment errors."
    ],
    sideA: { role: "control", label: "Checkout collects the address before payment-method selection", sourceBasis: null },
    sideB: { role: "variant", label: "Payment-method selection is moved ahead of address entry", sourceBasis: null }
  },
  "AB-018": {
    question: "Does removing navigation and links from checkout improve completion?",
    hypothesis: "Removing global navigation, category links and non-essential footer links can create a more focused checkout path. The trade-off is that shoppers may lose access to information they need or feel trapped, so support demand, return-to-cart behavior and trust should be monitored.",
    testedSlot: "checkout navigation and links",
    primaryKpi: { label: "Order Completion Rate", explanation: "Does a more focused checkout path improve completed orders?" },
    otherKpis: [
      { label: "Step-level Abandonment", explanation: "Does drop-off decrease?" },
      { label: "Support Contacts", explanation: "Questions caused by missing information should not increase." },
      { label: "Return-to-cart Rate", explanation: "Shoppers should still be able to edit their basket." },
      { label: "Revenue per Visitor (RPV)", explanation: "Revenue should not decline." }
    ],
    whatToTest: [
      { label: "Change", explanation: "Remove non-essential navigation and links from checkout." },
      { label: "Missing information", explanation: "Watch which removed links create questions or friction." },
      { label: "Trust", explanation: "Keep essential reassurance and contact information available." },
      { label: "Exit path", explanation: "Preserve a clear route back to the cart." },
      { label: "Device", explanation: "Check whether the change adds value on already-minimal mobile checkout." }
    ],
    guardrails: [
      "Do not prevent users from leaving the checkout flow.",
      "Keep legally required terms, returns and privacy information accessible.",
      "Do not remove links and change the number of checkout steps in the same test.",
      "Do not remove trust and contact information just because it is not transactional.",
      "Do not count a completion lift as a win if shoppers lose the ability to edit the cart."
    ],
    sideA: { role: "control", label: "Checkout shows the site's normal navigation and supporting links", sourceBasis: null },
    sideB: { role: "variant", label: "Non-essential navigation and links are removed to create a focused checkout path", sourceBasis: null }
  },
  "AB-019": {
    question: "Does confirmation feedback after a selection reduce errors?",
    hypothesis: "A short confirmation after a user makes a selection can make it clearer that the choice was registered and reduce repeated clicks. The added feedback should not create layout shifts or unnecessary visual noise.",
    testedSlot: "selection confirmation feedback",
    primaryKpi: { label: "Order Completion Rate", explanation: "Does confirmation feedback improve completion?" },
    otherKpis: [
      { label: "Incorrect Selection Rate", explanation: "Do orders with the wrong option decrease?" },
      { label: "Repeated-click Rate", explanation: "Do repeated clicks on the same option decrease?" },
      { label: "Return Rate", explanation: "Returns caused by incorrect selections should not increase." },
      { label: "Accessibility", explanation: "Confirmation should not rely on color alone and should be announced appropriately." }
    ],
    whatToTest: [
      { label: "Change", explanation: "Add a clear confirmation after a selection is registered." },
      { label: "Keep fixed", explanation: "Keep the selection control itself unchanged." },
      { label: "Errors", explanation: "Track incorrect selections and repeated clicks." },
      { label: "Layout", explanation: "Make sure the feedback does not shift surrounding content." },
      { label: "Device", explanation: "Confirm that the feedback remains visible on mobile." }
    ],
    guardrails: [
      "Do not communicate confirmation through color alone.",
      "Do not let the confirmation cause layout shifts.",
      "Do not redesign the selection control in the same experiment.",
      "Do not show confirmation before the selection has actually been saved.",
      "Do not judge the test on error reduction without checking completion."
    ],
    sideA: { role: "control", label: "No additional confirmation appears after a selection is made", sourceBasis: null },
    sideB: { role: "variant", label: "A short message confirms that the selection has been registered", sourceBasis: null }
  },
  "AB-020": {
    question: "Can a neutral option be preselected by default?",
    hypothesis: "Preselecting a neutral choice can reduce one interaction, but defaults must be used carefully. Marketing consent, data sharing and paid add-ons should never be treated as neutral defaults; this experiment is only appropriate for choices such as delivery method or another reversible, non-sensitive preference.",
    testedSlot: "preselected neutral option",
    primaryKpi: { label: "Order Completion Rate", explanation: "Does a neutral default improve completed orders?" },
    otherKpis: [
      { label: "Default Override Rate", explanation: "A high override rate can indicate a poor default." },
      { label: "Return / Cancellation Rate", explanation: "Unwanted choices should not create more cancellations." },
      { label: "Support Contacts", explanation: "Complaints such as 'I did not choose this' should not increase." },
      { label: "Revenue per Visitor (RPV)", explanation: "Revenue should not decline." }
    ],
    whatToTest: [
      { label: "Default", explanation: "Preselect only a neutral, reversible option." },
      { label: "Fit", explanation: "Check whether the default is appropriate for most eligible users." },
      { label: "Awareness", explanation: "Users must be able to notice and change the default." },
      { label: "Override", explanation: "Track how often users change the preselected choice." },
      { label: "Segment", explanation: "A single default may not fit every user segment." }
    ],
    guardrails: [
      "Do not preselect marketing consent, data sharing or a paid add-on.",
      "Do not default to an option that increases the amount the user pays.",
      "Keep the selected state visually clear and easy to change.",
      "Do not change both the default and option order in the same test.",
      "Confirm the applicable consent and consumer rules before launch."
    ],
    sideA: { role: "control", label: "No neutral option is preselected", sourceBasis: null },
    sideB: { role: "variant", label: "A neutral, reversible option is preselected by default", sourceBasis: null }
  }
};
