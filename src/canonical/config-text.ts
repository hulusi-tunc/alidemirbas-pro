import type { Config } from "./types";

/* One place that turns a Config into the sentence a reader sees, so a wait's
   timeout renders the same on the canvas, the practitioner view, the hub
   diagrams and the search index. The rule is always shown; a default is
   shown as a default, an example as an example, and a required value as
   what it is - a value the company has to set. Nothing here invents a
   number: a Config with no default renders its rule and its key only. */

export function configValueText<T>(v: T | { min: T; max: T }): string {
  if (v !== null && typeof v === "object" && "min" in (v as object)) {
    const r = v as { min: T; max: T };
    return `${String(r.min)}–${String(r.max)}`;
  }
  return String(v);
}

export function configText(c: string | Config<unknown>): string {
  if (typeof c === "string") return c;
  if (c.default) {
    const kind = c.default.basis === "example-only" ? "example" : "recommended";
    return `${c.rule} (${kind}: ${configValueText(c.default.value)}; configure ${c.key})`;
  }
  return c.required ? `${c.rule} (configure ${c.key})` : c.rule;
}

/** The short form for a timeline cell: the value or the key, nothing else. */
export function configShort(c: string | Config<unknown>): string {
  if (typeof c === "string") return c;
  if (c.default) return configValueText(c.default.value);
  return `configure ${c.key}`;
}
