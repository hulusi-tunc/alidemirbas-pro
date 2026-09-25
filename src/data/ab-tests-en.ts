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
  }
};
