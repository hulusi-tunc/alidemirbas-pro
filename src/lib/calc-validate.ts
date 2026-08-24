/* Input validation, separate from parsing (calc-format.ts) and from
   calculation (calc-registry.ts). Handles the generic case: every scalar
   ("currency"/"count"/"years"/"days"/"%"/etc.) and enum input shared by
   the 34 live calculators. The one array-shaped input (funnel stages) is
   validated locally in its own small component - see CalculatorTool.tsx -
   since its shape genuinely differs from a flat key/value form. */
import { isEnumUnit, isPercentUnit, parseEnumOptions, parseField } from "@/lib/calc-format";
import type { CalcField } from "@/lib/calc-catalog";

export type ValidationError =
  | "required" | "invalid" | "negative" | "not_an_option"
  | "exceeds_delivered" | "exceeds_mau" | "exceeds_carts_created" | "must_be_positive";

export type ValidationResult =
  | { ok: true; values: Record<string, number | string> }
  | { ok: false; errors: Record<string, ValidationError> };

// The one genuinely optional input in the whole live batch: MRR Growth
// Rate can't be computed without a prior period, but MRR/ARR themselves
// don't need one - see calc-registry.ts's mrr() and the "(optional)"
// label already on the field itself. Catalog inputs don't carry a
// required/optional flag (Phase 1 didn't need one), so this is a small,
// explicit allowlist rather than a schema change for a single field.
const OPTIONAL_FIELDS: Record<string, string[]> = { mrr: ["priorMrr"] };

/* Cross-field checks beyond the generic per-field validation above - a
   small, explicit allowlist keyed by slug, since only one live
   calculator currently needs one. open-rate's own content (Phase 4
   correction pass) commits to the standard, deduplicated unique-open-rate
   definition, which is mathematically capped at 100% (each delivered
   message counted as opened at most once) - so a runtime that silently
   accepted opens > delivered would let the UI show a result the content
   explicitly says can't happen. Returns field -> error for any field that
   fails; empty object means no cross-field problem. */
const CROSS_FIELD_CHECKS: Record<string, (values: Record<string, number | string>) => Partial<Record<string, ValidationError>>> = {
  "open-rate": (values) => {
    const { opens, delivered } = values;
    if (typeof opens === "number" && typeof delivered === "number" && opens > delivered) {
      return { opens: "exceeds_delivered" };
    }
    return {};
  },
  // Every daily active user is, by definition, also part of that same
  // month's active user count - DAU is structurally a subset of MAU for
  // the same window (the calculator's own documented validationRule:
  // "dau should not exceed mau"). Same category of constraint as
  // open-rate's opens<=delivered above - not the CTOR situation, where
  // clicks and opens are tracked through genuinely different mechanisms
  // and clicks>opens is a real, legitimate result (see
  // production/calculators/content/dau-mau-stickiness.json's qaNotes for
  // the reasoning distinguishing the two).
  "dau-mau-stickiness": (values) => {
    const { dau, mau } = values;
    if (typeof dau === "number" && typeof mau === "number" && dau > mau) {
      return { dau: "exceeds_mau" };
    }
    return {};
  },
  // A cart can't produce more completed purchases than carts were
  // started - completedPurchases is structurally bounded by
  // cartsCreated for the same stage/window (the calculator's own
  // documented validationRule: "completedPurchases should not exceed
  // cartsCreated").
  "cart-abandonment": (values) => {
    const { cartsCreated, completedPurchases } = values;
    if (typeof cartsCreated === "number" && typeof completedPurchases === "number" && completedPurchases > cartsCreated) {
      return { completedPurchases: "exceeds_carts_created" };
    }
    return {};
  },
};

export function validateInputs(inputs: CalcField[], raw: Record<string, string>, slug?: string): ValidationResult {
  const values: Record<string, number | string> = {};
  const errors: Record<string, ValidationError> = {};
  const optional = new Set(slug ? OPTIONAL_FIELDS[slug] ?? [] : []);

  for (const field of inputs) {
    if (field.key === "stages") continue; // handled by the dedicated funnel input component
    const isOptional = optional.has(field.key);
    const rawVal = raw[field.key];

    if (isEnumUnit(field.unit)) {
      const options = parseEnumOptions(field.unit);
      if (rawVal === undefined || rawVal === "") {
        if (!isOptional) errors[field.key] = "required";
      } else if (!options.includes(rawVal)) errors[field.key] = "not_an_option";
      else values[field.key] = rawVal;
      continue;
    }

    if (isOptional && (rawVal === undefined || rawVal.trim() === "")) continue; // silently omit, not an error

    const parsed = parseField(rawVal, { asDecimalPercent: isPercentUnit(field.unit) });
    if (!parsed.ok) errors[field.key] = parsed.error;
    // Catalog-driven, not a per-slug special case (see calc-catalog.ts's
    // withPositivity): a field the catalog itself marks ">0" is a
    // denominator or count that's mathematically undefined at zero, not
    // just non-negative - 0 parses fine but must still be rejected here,
    // same class of problem as CROSS_FIELD_CHECKS below (a state the
    // compute layer can't produce a meaningful result for).
    else if (field.strictlyPositive && parsed.value === 0) errors[field.key] = "must_be_positive";
    else values[field.key] = parsed.value;
  }

  // Only run cross-field checks once every individual field already
  // parsed cleanly - a field-level error takes priority and a
  // cross-field check would otherwise need to guess at a missing value.
  if (Object.keys(errors).length === 0 && slug && CROSS_FIELD_CHECKS[slug]) {
    Object.assign(errors, CROSS_FIELD_CHECKS[slug](values));
  }

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, values };
}

export const errorMessage = (error: ValidationError, lang: "en" | "tr"): string => {
  const messages: Record<ValidationError, { en: string; tr: string }> = {
    required: { en: "Required", tr: "Zorunlu" },
    invalid: { en: "Enter a number", tr: "Bir sayı girin" },
    negative: { en: "Must be zero or more", tr: "Sıfır veya daha büyük olmalı" },
    not_an_option: { en: "Choose an option", tr: "Bir seçenek seçin" },
    exceeds_delivered: { en: "Can't exceed delivered", tr: "Teslim edilenden fazla olamaz" },
    exceeds_mau: { en: "Can't exceed monthly active users", tr: "Aylık aktif kullanıcıyı geçemez" },
    exceeds_carts_created: { en: "Can't exceed carts created", tr: "Oluşturulan sepeti geçemez" },
    must_be_positive: { en: "Must be greater than zero", tr: "Sıfırdan büyük olmalı" },
  };
  return messages[error][lang];
};
