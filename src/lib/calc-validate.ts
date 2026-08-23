/* Input validation, separate from parsing (calc-format.ts) and from
   calculation (calc-registry.ts). Handles the generic case: every scalar
   ("currency"/"count"/"years"/"days"/"%"/etc.) and enum input shared by
   the 34 live calculators. The one array-shaped input (funnel stages) is
   validated locally in its own small component - see CalculatorTool.tsx -
   since its shape genuinely differs from a flat key/value form. */
import { isEnumUnit, isPercentUnit, parseEnumOptions, parseField } from "@/lib/calc-format";
import type { CalcField } from "@/lib/calc-catalog";

export type ValidationResult =
  | { ok: true; values: Record<string, number | string> }
  | { ok: false; errors: Record<string, "required" | "invalid" | "negative" | "not_an_option"> };

// The one genuinely optional input in the whole live batch: MRR Growth
// Rate can't be computed without a prior period, but MRR/ARR themselves
// don't need one - see calc-registry.ts's mrr() and the "(optional)"
// label already on the field itself. Catalog inputs don't carry a
// required/optional flag (Phase 1 didn't need one), so this is a small,
// explicit allowlist rather than a schema change for a single field.
const OPTIONAL_FIELDS: Record<string, string[]> = { mrr: ["priorMrr"] };

export function validateInputs(inputs: CalcField[], raw: Record<string, string>, slug?: string): ValidationResult {
  const values: Record<string, number | string> = {};
  const errors: Record<string, "required" | "invalid" | "negative" | "not_an_option"> = {};
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
    else values[field.key] = parsed.value;
  }

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, values };
}

export const errorMessage = (
  error: "required" | "invalid" | "negative" | "not_an_option",
  lang: "en" | "tr"
): string => {
  const messages: Record<string, { en: string; tr: string }> = {
    required: { en: "Required", tr: "Zorunlu" },
    invalid: { en: "Enter a number", tr: "Bir sayı girin" },
    negative: { en: "Must be zero or more", tr: "Sıfır veya daha büyük olmalı" },
    not_an_option: { en: "Choose an option", tr: "Bir seçenek seçin" },
  };
  return messages[error][lang];
};
