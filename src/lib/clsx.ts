type ClassValue =
  | string
  | number
  | bigint
  | boolean
  | null
  | undefined
  | ClassValue[]
  | { [key: string]: boolean | null | undefined };

/**
 * Minimal class name joiner. Intentionally dependency-free: the design system
 * relies on explicit, non-conflicting utility sets rather than class merging.
 */
export function clsx(...inputs: ClassValue[]): string {
  const out: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (
      typeof input === "string" ||
      typeof input === "number" ||
      typeof input === "bigint"
    ) {
      out.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = clsx(...input);
      if (nested) out.push(nested);
    } else {
      for (const [key, value] of Object.entries(input)) {
        if (value) out.push(key);
      }
    }
  }

  return out.join(" ");
}
