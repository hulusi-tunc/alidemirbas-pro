/* Output formatting, keyed by the `unit` string carried on each catalog
   output field. Client-safe (no JSON catalog import) and framework-free -
   this is the one place that decides how a raw computed number becomes
   display text, so percentage vs percentage-point vs ratio vs currency
   handling only needs to be correct once (Phase 2 §8/§9). */

export function formatByUnit(value: unknown, unit: string | null | undefined): string {
  if (value === undefined || value === null) return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") return value; // already-formatted (e.g. a model label)
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";

  const u = unit ?? "";
  if (u === "%") return `${(value * 100).toFixed(2)}%`;
  if (u === "percentage points") {
    const sign = value > 0 ? "+" : "";
    return `${sign}${round(value, 2)} pts`;
  }
  if (u.startsWith("x (")) return `${round(value, 2)}x`;
  if (u === "currency") return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (u === "months") return `${round(value, 1)} months`;
  if (u === "days") return `${Math.ceil(value)} days`;
  if (u === "years") return `${round(value, 1)} years`;
  if (u === "periods") return `${round(value, 1)} periods`;
  if (u === "count") return Math.round(value).toLocaleString();
  if (u === "number") return round(value, 4).toString();
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function round(n: number, d: number): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
}

/* Parses one raw form-string into a number per the field's unit, or
   returns an error key. Distinguishes empty/NaN explicitly - "0" is
   always a legitimate value and must never be treated as "missing"
   (Phase 2 §7). Percentage-typed inputs are entered as whole numbers
   (e.g. "75" for 75%) and converted to a 0-1 decimal here so every
   compute function in calc-registry.ts can assume decimals throughout;
   the one exception is rule-of-40, which intentionally keeps its two
   percentage inputs as whole-number points (see calc-registry.ts). */
export type ParsedField = { ok: true; value: number } | { ok: false; error: "required" | "invalid" | "negative" };

export function parseField(raw: string | undefined, opts: { allowNegative?: boolean; asDecimalPercent?: boolean } = {}): ParsedField {
  if (raw === undefined || raw.trim() === "") return { ok: false, error: "required" };
  const n = Number(raw);
  if (!Number.isFinite(n)) return { ok: false, error: "invalid" };
  if (!opts.allowNegative && n < 0) return { ok: false, error: "negative" };
  return { ok: true, value: opts.asDecimalPercent ? n / 100 : n };
}

export function parseEnumOptions(unit: string | null | undefined): string[] {
  const m = /^enum\(([^)]*)\)$/.exec(unit ?? "");
  return m ? m[1].split("/") : [];
}

export const isPercentUnit = (unit: string | null | undefined) => unit === "%";
export const isEnumUnit = (unit: string | null | undefined) => (unit ?? "").startsWith("enum(");
export const isArrayUnit = (unit: string | null | undefined) => (unit ?? "").startsWith("array");
