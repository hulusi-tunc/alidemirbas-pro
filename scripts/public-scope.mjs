/* The public scope, read from the ONE place that ships it.

   `src/lib/public-corpus.ts` holds the product decision (58 public journeys,
   21 excluded - audit/public-journey-scope.md). Plain Node cannot resolve the
   `@/` alias or import TypeScript, so the build/validation scripts that need
   the same lists parse them out of that file as text - the identical technique
   scripts/validate-canonical.mjs already uses to read src/canonical/*.ts.

   Parsing rather than re-listing is the point: a second hand-kept copy of 58
   ids in a script is a copy that goes stale silently. Here, changing the
   decision means editing public-corpus.ts and nothing else, and a malformed
   or renamed set throws immediately rather than yielding a quietly empty
   list. */
import fs from "node:fs";

const SOURCE = "src/lib/public-corpus.ts";

function idsOf(source, constName) {
  const re = new RegExp(`${constName}[^=]*=\\s*new Set\\(\\[([\\s\\S]*?)\\]\\)`);
  const m = re.exec(source);
  if (!m) throw new Error(`public-scope: could not find ${constName} in ${SOURCE}`);
  const ids = [...m[1].matchAll(/"([A-Z]{3}-\d+)"/g)].map((x) => x[1]);
  if (ids.length === 0) throw new Error(`public-scope: ${constName} parsed to an empty list`);
  return ids;
}

const source = fs.readFileSync(new URL("../" + SOURCE, import.meta.url), "utf8");

/** The 21 journeys removed from the public product. */
export const EXCLUDED_FROM_PUBLIC = new Set(idsOf(source, "EXCLUDED_FROM_PUBLIC"));

/** The 58 journeys that are the public library. */
export const PUBLIC_LIBRARY_IDS = new Set(idsOf(source, "PUBLIC_LIBRARY_IDS"));

/** The only customer-facing channels. `sales` and `task` exist in the
    canonical schema as operational handoff behaviour and are deliberately not
    here: they never count as a channel and never render as a badge. */
export const CUSTOMER_CHANNELS = new Set(["email", "sms", "push", "whatsapp", "in-app"]);

export const EXPECTED_PUBLIC_COUNT = 58;
export const EXPECTED_EXCLUDED_COUNT = 21;
